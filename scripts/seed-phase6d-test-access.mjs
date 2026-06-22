import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromSupabasePackage = createRequire(
  path.join(repoRoot, "packages", "ecosystem-supabase", "package.json"),
);
const { createClient } = requireFromSupabasePackage("@supabase/supabase-js");

const APP_SLUGS = ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"];
const WORKSPACE_SLUG = "phase6d-shared-supabase-browser-proof";
const WORKSPACE_NAME = "Phase 6D Shared Supabase Browser Proof";
const SOURCE = "phase6d_test";
const cleanup = /^true$/i.test(process.env.PHASE6D_CLEANUP_TEST_ACCESS ?? "");

function loadDotenv(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
  return true;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function log(message) {
  console.log(`[phase6d-seed] ${message}`);
}

function failWithUserInstructions(email) {
  throw new Error(
    [
      `No Supabase Auth user found for TEST_USER_EMAIL (${email}).`,
      "Create the user in the new shared Supabase Auth dashboard or through a staging app signup flow, then rerun this script.",
      "Do not create production users or use real customer credentials for Phase 6D.",
    ].join(" "),
  );
}

async function findAuthUserByEmail(supabase, email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data?.users ?? [];
    const found = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 1000) break;
  }
  return null;
}

async function singleOrThrow(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function cleanupAccess(supabase, userId) {
  const workspace = await singleOrThrow(
    supabase.schema("core").from("workspaces").select("id, slug").eq("slug", WORKSPACE_SLUG).maybeSingle(),
    "lookup phase6d workspace",
  );

  if (!workspace?.id) {
    log("cleanup: no Phase 6D workspace found");
    return;
  }

  await singleOrThrow(
    supabase.schema("core").from("workspace_app_access").delete().eq("workspace_id", workspace.id),
    "cleanup workspace_app_access",
  );
  await singleOrThrow(
    supabase.schema("core").from("workspace_members").delete().eq("workspace_id", workspace.id).eq("user_id", userId),
    "cleanup workspace_members",
  );
  await singleOrThrow(
    supabase.schema("core").from("workspaces").delete().eq("id", workspace.id).eq("slug", WORKSPACE_SLUG),
    "cleanup workspaces",
  );

  log("cleanup: removed Phase 6D workspace, membership, and app access rows");
  log("cleanup: profile row was preserved to avoid deleting shared user identity");
}

async function ensureAccess(supabase, user) {
  const metadata = {
    source: SOURCE,
    environment: "local_or_staging",
    purpose: "phase6d_browser_api_proof",
    seededBy: "scripts/seed-phase6d-test-access.mjs",
  };

  const existingApps = await singleOrThrow(
    supabase.schema("core").from("ecosystem_apps").select("slug").in("slug", APP_SLUGS),
    "lookup ecosystem_apps",
  );
  const foundSlugs = new Set((existingApps ?? []).map((app) => app.slug));
  const missingApps = APP_SLUGS.filter((slug) => !foundSlugs.has(slug));
  if (missingApps.length > 0) {
    throw new Error(`Missing core.ecosystem_apps seed rows: ${missingApps.join(", ")}`);
  }

  await singleOrThrow(
    supabase.schema("core").from("profiles").upsert(
      {
        user_id: user.id,
        display_name: "Phase 6D Test User",
        primary_email: user.email,
      },
      { onConflict: "user_id" },
    ),
    "upsert profile",
  );

  const workspace = await singleOrThrow(
    supabase
      .schema("core")
      .from("workspaces")
      .upsert(
        {
          slug: WORKSPACE_SLUG,
          name: WORKSPACE_NAME,
          created_by: user.id,
          status: "active",
          metadata,
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single(),
    "upsert workspace",
  );

  await singleOrThrow(
    supabase.schema("core").from("workspace_members").upsert(
      {
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
        status: "active",
        created_by: user.id,
      },
      { onConflict: "workspace_id,user_id" },
    ),
    "upsert workspace_members",
  );

  for (const appSlug of APP_SLUGS) {
    await singleOrThrow(
      supabase.schema("core").from("workspace_app_access").upsert(
        {
          workspace_id: workspace.id,
          app_slug: appSlug,
          status: "active",
          granted_by: user.id,
          metadata: { ...metadata, app_slug: appSlug },
        },
        { onConflict: "workspace_id,app_slug" },
      ),
      `upsert workspace_app_access ${appSlug}`,
    );
  }

  log(`ready: user found for TEST_USER_EMAIL`);
  log(`ready: workspace slug=${WORKSPACE_SLUG}`);
  log(`ready: app access active for ${APP_SLUGS.join(", ")}`);
  log("note: core.profiles and core.workspace_members do not have metadata columns; they are marked by deterministic test identity/workspace linkage.");
}

async function main() {
  const loadedShared = loadDotenv(".env.shared.local");
  const loadedPhase6d = loadDotenv(".env.phase6d.local");
  log(`env: .env.shared.local ${loadedShared ? "loaded" : "absent"}, .env.phase6d.local ${loadedPhase6d ? "loaded" : "absent"}`);

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const email = requireEnv("TEST_USER_EMAIL");
  if (process.env.TEST_USER_PASSWORD?.trim()) {
    log("input: TEST_USER_PASSWORD present (value not printed)");
  } else {
    log("input: TEST_USER_PASSWORD missing or blank; seed access only needs existing Auth user email");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const user = await findAuthUserByEmail(supabase, email);
  if (!user) failWithUserInstructions(email);

  if (cleanup) {
    await cleanupAccess(supabase, user.id);
    return;
  }

  await ensureAccess(supabase, user);
}

main().catch((error) => {
  console.error(`[phase6d-seed] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
