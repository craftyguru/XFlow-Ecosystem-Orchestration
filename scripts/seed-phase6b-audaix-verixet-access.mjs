#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromVerixet = createRequire(path.join(repoRoot, "apps", "Verixet", "package.json"));
const postgres = requireFromVerixet("postgres");
const { createClient } = requireFromVerixet("@supabase/supabase-js");

const WORKSPACE_SLUG = "phase6d-shared-supabase-browser-proof";
const SOURCE = "phase6b_audaix_verixet_seed";
const DEFAULT_PLAN = "audaix_pro";
const APP_SLUG = "audaix";

const cleanup = /^true$/i.test(process.env.PHASE6B_CLEANUP_AUDAIX_VERIXET_ACCESS ?? "");

const envSources = new Map();

function loadDotenv(relativePath, options = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (options.override || process.env[key] === undefined) {
      process.env[key] = value;
      envSources.set(key, relativePath);
    }
  }
  return true;
}

function log(message) {
  console.log(`[phase6b-audaix-verixet-seed] ${message}`);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function assertLocalOrStaging() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed Phase 6B access while NODE_ENV=production.");
  }
  if (process.env.PHASE6B_SEED_AUDAIX_VERIXET_ACCESS !== "true" && !cleanup) {
    throw new Error(
      "Set PHASE6B_SEED_AUDAIX_VERIXET_ACCESS=true to confirm this local/staging-only seed.",
    );
  }
}

async function sharedWorkspaceId() {
  const explicit = process.env.TEST_WORKSPACE_ID?.trim();
  if (explicit) {
    if (!isUuid(explicit)) throw new Error("TEST_WORKSPACE_ID must be a UUID for Verixet usage ingest.");
    return explicit;
  }

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .schema("core")
    .from("workspaces")
    .select("id, slug")
    .eq("slug", WORKSPACE_SLUG)
    .maybeSingle();
  if (error) throw new Error(`core workspace lookup failed: ${error.message}`);
  if (!data?.id) {
    throw new Error(
      "Phase 6D core workspace is missing. Run node scripts/seed-phase6d-test-access.mjs first.",
    );
  }
  if (!isUuid(data.id)) throw new Error("Phase 6D core workspace id is not a UUID.");
  return data.id;
}

async function sharedUserId() {
  const email = requireEnv("TEST_USER_EMAIL");
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(`shared auth user lookup failed: ${error.message}`);
    const user = (data.users ?? []).find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user?.id) return user.id;
    if ((data.users ?? []).length < 100) break;
  }
  throw new Error("TEST_USER_EMAIL was not found in shared Supabase Auth.");
}

async function cleanupSeed(sql, workspaceId) {
  await sql.begin(async (tx) => {
    await tx`
      delete from credit_transactions
      where workspace_id = ${workspaceId}
        and metadata->>'source' = ${SOURCE}
    `;
    await tx`
      delete from credit_balances
      where workspace_id = ${workspaceId}
        and metadata->>'source' = ${SOURCE}
    `;
    await tx`
      delete from subscriptions
      where workspace_id = ${workspaceId}
        and metadata->>'source' = ${SOURCE}
    `;
    await tx`
      delete from billing_accounts
      where workspace_id = ${workspaceId}
        and metadata->>'source' = ${SOURCE}
    `;
    await tx`
      delete from workspaces
      where id = ${workspaceId}
        and slug = ${WORKSPACE_SLUG}
        and ecosystem_workspace_id = ${workspaceId}
    `;
  });
  log("cleanup complete for Phase 6B AudAiX Verixet seed rows");
}

async function assertVerixetSeedSchema(sql) {
  const requiredTables = [
    "workspaces",
    "billing_accounts",
    "subscriptions",
    "credit_balances",
    "credit_transactions",
  ];
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ${sql(requiredTables)}
  `;
  const found = new Set(rows.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !found.has(table));
  if (missing.length > 0) {
    throw new Error(
      `Verixet DATABASE_URL is missing required authority tables: ${missing.join(", ")}. Point Verixet at a migrated local/staging Verixet database before seeding AudAiX usage admission.`,
    );
  }

  const workspaceColumns = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workspaces'
      and column_name in ('id', 'name', 'slug', 'ecosystem_workspace_id')
  `;
  const workspaceColumnNames = new Set(workspaceColumns.map((row) => row.column_name));
  for (const columnName of ["id", "name", "slug", "ecosystem_workspace_id"]) {
    if (!workspaceColumnNames.has(columnName)) {
      throw new Error(
        `Verixet DATABASE_URL has an incompatible workspaces table; missing column ${columnName}. Use a migrated local/staging Verixet database.`,
      );
    }
  }
}

async function ensureSeed(sql, workspaceId, userId, email) {
  const now = new Date();
  const metadata = {
    source: SOURCE,
    environment: "local_or_staging",
    purpose: "phase6b_audaix_browser_api_proof",
    app_slug: APP_SLUG,
  };

  await sql.begin(async (tx) => {
    await tx`
      insert into workspaces (
        id,
        name,
        slug,
        ecosystem_workspace_id,
        commerce_mode,
        billing_mode,
        created_at,
        updated_at
      )
      values (
        ${workspaceId},
        'Phase 6D Shared Supabase Browser Proof',
        ${WORKSPACE_SLUG},
        ${workspaceId},
        'catalog_only',
        'xflow_managed',
        ${now},
        ${now}
      )
      on conflict (id) do update set
        name = excluded.name,
        slug = excluded.slug,
        ecosystem_workspace_id = excluded.ecosystem_workspace_id,
        commerce_mode = excluded.commerce_mode,
        billing_mode = excluded.billing_mode
    `;

    const billingAccountRows = await tx`
      insert into billing_accounts (
        workspace_id,
        name,
        billing_email,
        status,
        is_default,
        metadata,
        created_at,
        updated_at
      )
      values (
        ${workspaceId},
        'Phase 6B AudAiX Verixet Proof',
        ${email},
        'active',
        true,
        ${tx.json(metadata)},
        ${now},
        ${now}
      )
      on conflict (workspace_id) where is_default = true do update set
        name = excluded.name,
        billing_email = excluded.billing_email,
        status = excluded.status,
        metadata = excluded.metadata,
        updated_at = excluded.updated_at
      returning id
    `;
    const billingAccountId = billingAccountRows[0]?.id ?? null;

    const existingSubscription = await tx`
      select id
      from subscriptions
      where workspace_id = ${workspaceId}
        and app_key = 'ecosystem'
        and environment = 'live'
        and metadata->>'source' = ${SOURCE}
      order by updated_at desc
      limit 1
    `;
    if (existingSubscription[0]?.id) {
      await tx`
        update subscriptions
        set
          billing_account_id = ${billingAccountId},
          user_id = ${userId},
          product_key = 'audaix',
          plan_key = ${DEFAULT_PLAN},
          price_key = 'phase6b_audaix_verixet_proof',
          status = 'active',
          ends_at = ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)},
          metadata = ${tx.json({ ...metadata, appSlugs: APP_SLUG })},
          updated_at = ${now}
        where id = ${existingSubscription[0].id}
      `;
    } else {
      await tx`
        insert into subscriptions (
          workspace_id,
          app_key,
          environment,
          user_id,
          billing_account_id,
          product_key,
          plan_key,
          price_key,
          status,
          started_at,
          ends_at,
          metadata,
          created_at,
          updated_at
        )
        values (
          ${workspaceId},
          'ecosystem',
          'live',
          ${userId},
          ${billingAccountId},
          'audaix',
          ${DEFAULT_PLAN},
          'phase6b_audaix_verixet_proof',
          'active',
          ${now},
          ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)},
          ${tx.json({ ...metadata, appSlugs: APP_SLUG })},
          ${now},
          ${now}
        )
      `;
    }

    for (const creditKey of ["ops_credits", "creative_credits"]) {
      await tx`
        insert into credit_balances (
          workspace_id,
          app_key,
          environment,
          user_id,
          credit_key,
          balance,
          metadata,
          created_at,
          updated_at
        )
        values (
          ${workspaceId},
          'ecosystem',
          'live',
          null,
          ${creditKey},
          1000,
          ${tx.json({ ...metadata, credit_key: creditKey })},
          ${now},
          ${now}
        )
        on conflict (workspace_id, app_key, environment, credit_key) where user_id is null do update set
          balance = greatest(credit_balances.balance, 1000),
          metadata = excluded.metadata,
          updated_at = excluded.updated_at
      `;
      await tx`
        insert into credit_balances (
          workspace_id,
          app_key,
          environment,
          user_id,
          credit_key,
          balance,
          metadata,
          created_at,
          updated_at
        )
        values (
          ${workspaceId},
          'ecosystem',
          'live',
          ${userId},
          ${creditKey},
          1000,
          ${tx.json({ ...metadata, credit_key: creditKey, user_scoped: true })},
          ${now},
          ${now}
        )
        on conflict (workspace_id, app_key, environment, user_id, credit_key) where user_id is not null do update set
          balance = greatest(credit_balances.balance, 1000),
          metadata = excluded.metadata,
          updated_at = excluded.updated_at
      `;
    }
  });

  log("ready: Verixet workspace/subscription/credits seeded for AudAiX Phase 6B proof");
  log(`ready: TEST_WORKSPACE_ID=${workspaceId}`);
  log("note: add TEST_WORKSPACE_ID and CONFIRM_TEST_WORKSPACE_MUTATION=true to .env.phase6d.local or process env before running the AudAiX verifier.");
}

async function main() {
  loadDotenv(".env.shared.local");
  loadDotenv(".env.phase6d.local");
  loadDotenv(path.join("apps", "Verixet", ".env.local"), { override: true });
  loadDotenv(path.join("apps", "Verixet", ".env"), { override: true });

  assertLocalOrStaging();
  const databaseUrl = requireEnv("DATABASE_URL");
  const email = requireEnv("TEST_USER_EMAIL");
  const workspaceId = await sharedWorkspaceId();
  const userId = await sharedUserId();

  log(`env: DATABASE_URL source=${envSources.get("DATABASE_URL") ?? "process"} (value not printed)`);
  log(`env: TEST_USER_EMAIL present (value not printed)`);

  const sql = postgres(databaseUrl, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10 });
  try {
    await assertVerixetSeedSchema(sql);
    if (cleanup) await cleanupSeed(sql, workspaceId);
    else await ensureSeed(sql, workspaceId, userId, email);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(
    `[phase6b-audaix-verixet-seed] failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
