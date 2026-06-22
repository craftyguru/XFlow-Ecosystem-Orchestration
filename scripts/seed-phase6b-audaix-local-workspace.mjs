#!/usr/bin/env node
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audAixRoot = path.join(repoRoot, "apps", "AudAix");
const requireFromAudAix = createRequire(path.join(audAixRoot, "package.json"));
const requireFromSupabasePackage = createRequire(
  path.join(repoRoot, "packages", "ecosystem-supabase", "package.json"),
);
const Database = requireFromAudAix("better-sqlite3");
const { createClient } = requireFromSupabasePackage("@supabase/supabase-js");

const WORKSPACE_SLUG = "phase6d-shared-supabase-browser-proof";
const WORKSPACE_NAME = "Phase 6D Shared Supabase Browser Proof";
const CREDIT_BALANCE = 1000;
const SOURCE_APP_SLUG = "audaix";
const cleanup = /^true$/i.test(process.env.PHASE6B_CLEANUP_AUDAIX_LOCAL_WORKSPACE ?? "");

function loadDotenv(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
  return true;
}

function log(message) {
  console.log(`[phase6b-audaix-local-seed] ${message}`);
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
    throw new Error("Refusing to seed Phase 6B AudAiX local workspace while NODE_ENV=production.");
  }
  if (process.env.PHASE6B_SEED_AUDAIX_LOCAL_WORKSPACE !== "true" && !cleanup) {
    throw new Error(
      "Set PHASE6B_SEED_AUDAIX_LOCAL_WORKSPACE=true to confirm this local/staging-only seed.",
    );
  }
}

async function lookupSharedIdentity() {
  const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = requireEnv("TEST_USER_EMAIL");
  let user = null;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    user = (data?.users ?? []).find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user || (data?.users ?? []).length < 1000) break;
  }
  if (!user?.id) throw new Error("TEST_USER_EMAIL was not found in shared Supabase Auth.");

  const explicitWorkspaceId = process.env.TEST_WORKSPACE_ID?.trim();
  if (explicitWorkspaceId) {
    if (!isUuid(explicitWorkspaceId)) throw new Error("TEST_WORKSPACE_ID must be a UUID.");
    return { userId: user.id, workspaceId: explicitWorkspaceId };
  }

  const { data: workspace, error } = await supabase
    .schema("core")
    .from("workspaces")
    .select("id, slug")
    .eq("slug", WORKSPACE_SLUG)
    .maybeSingle();
  if (error) throw error;
  if (!workspace?.id) throw new Error("Phase 6D shared core workspace is missing.");
  if (!isUuid(workspace.id)) throw new Error("Phase 6D shared core workspace id is not a UUID.");
  return { userId: user.id, workspaceId: workspace.id };
}

function sqlitePath() {
  const configured = process.env.AUDAIX_DB_PATH?.trim();
  return configured ? path.resolve(audAixRoot, configured) : path.join(audAixRoot, "audaix.db");
}

function ensureWorkspace(db, identity) {
  const now = new Date().toISOString();
  const termsVersion = process.env.TERMS_VERSION?.trim() || "2026-04-27";
  const privacyVersion = process.env.PRIVACY_VERSION?.trim() || "2026-04-27";
  const billingTermsVersion = process.env.BILLING_TERMS_VERSION?.trim() || "2026-04-27";
  db.transaction(() => {
    db.prepare(
      `INSERT INTO workspaces (id, name, plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         plan = excluded.plan,
         updated_at = excluded.updated_at`,
    ).run(identity.workspaceId, WORKSPACE_NAME, "pro", now, now);

    db.prepare(
      `INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role, created_at)
       VALUES (?, ?, 'owner', ?)`,
    ).run(identity.workspaceId, identity.userId, now);

    db.prepare(
      `UPDATE workspace_members
       SET role = 'owner'
       WHERE workspace_id = ? AND user_id = ?`,
    ).run(identity.workspaceId, identity.userId);

    for (const creditType of ["ops", "ai_heavy"]) {
      db.prepare(
        `INSERT INTO workspace_credit_balances (workspace_id, credit_type, balance, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(workspace_id, credit_type) DO UPDATE SET
           balance = CASE
             WHEN workspace_credit_balances.balance < excluded.balance THEN excluded.balance
             ELSE workspace_credit_balances.balance
           END,
          updated_at = excluded.updated_at`,
      ).run(identity.workspaceId, creditType, CREDIT_BALANCE, now);
    }

    const consent = db.prepare(
      `SELECT id
         FROM user_legal_consents
        WHERE user_id = ?
          AND workspace_id = ?
          AND terms_version = ?
          AND privacy_version = ?
          AND billing_terms_version = ?
        LIMIT 1`,
    ).get(identity.userId, identity.workspaceId, termsVersion, privacyVersion, billingTermsVersion);
    if (!consent) {
      db.prepare(
        `INSERT INTO user_legal_consents (
          id,
          user_id,
          workspace_id,
          terms_version,
          privacy_version,
          billing_terms_version,
          accepted_at,
          source_app_slug,
          request_id,
          ip_hash,
          user_agent_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      ).run(
        randomUUID(),
        identity.userId,
        identity.workspaceId,
        termsVersion,
        privacyVersion,
        billingTermsVersion,
        now,
        SOURCE_APP_SLUG,
        "phase6b_audaix_local_seed",
      );
    }
  })();
}

function cleanupWorkspace(db, identity) {
  db.transaction(() => {
    db.prepare(`DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?`).run(
      identity.workspaceId,
      identity.userId,
    );
    db.prepare(
      `DELETE FROM workspace_credit_balances
       WHERE workspace_id = ? AND credit_type IN ('ops', 'ai_heavy')`,
    ).run(identity.workspaceId);
    db.prepare(
      `DELETE FROM workspace_credit_ledger
       WHERE workspace_id = ?
         AND (source_type LIKE 'phase6b_%' OR action IN ('audit.standard', 'phase6b_audaix_proof'))`,
    ).run(identity.workspaceId);
    db.prepare(
      `DELETE FROM user_legal_consents
       WHERE workspace_id = ?
         AND user_id = ?
         AND source_app_slug = ?
         AND request_id = 'phase6b_audaix_local_seed'`,
    ).run(identity.workspaceId, identity.userId, SOURCE_APP_SLUG);
    db.prepare(`DELETE FROM workspaces WHERE id = ? AND name = ?`).run(
      identity.workspaceId,
      WORKSPACE_NAME,
    );
  })();
}

async function main() {
  loadDotenv(".env.shared.local");
  loadDotenv(".env.phase6d.local");
  loadDotenv(path.join("apps", "AudAix", ".env.local"));
  loadDotenv(path.join("apps", "AudAix", ".env"));
  assertLocalOrStaging();

  const identity = await lookupSharedIdentity();
  const dbPath = sqlitePath();
  if (!fs.existsSync(dbPath)) throw new Error("AudAiX SQLite database was not found.");
  const db = new Database(dbPath);
  try {
    if (cleanup) {
      cleanupWorkspace(db, identity);
      log("cleanup complete for AudAiX local workspace membership");
    } else {
      ensureWorkspace(db, identity);
      log("ready: AudAiX local workspace, owner membership, and proof credit balances seeded");
      log(`ready: TEST_WORKSPACE_ID=${identity.workspaceId}`);
      log("note: set CONFIRM_TEST_WORKSPACE_MUTATION=true before running the AudAiX verifier.");
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(
    `[phase6b-audaix-local-seed] failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
