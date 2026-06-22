import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const proofPath = path.join(root, "supabase", "tests", "rls-authenticated-access.sql");
const validationPath = path.join(root, "supabase", "migrations", "099_validation_checks.sql");
const hardeningMigrationPath = path.join(root, "supabase", "migrations", "20260611063431_production_rls_hardening.sql");
const errors = [];

function loadEnvFile(envPath) {
  const source = fs.readFileSync(envPath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

for (const envFile of [".env.shared.local", ".env.phase6d.local", ".env.proof.local"]) {
  const envPath = path.join(root, envFile);
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

if (!fs.existsSync(proofPath)) {
  errors.push("Missing supabase/tests/rls-authenticated-access.sql");
} else {
  const proof = fs.readFileSync(proofPath, "utf8");
  const requiredSnippets = [
    "core.entitlements",
    "core.workspace_app_access",
    "core.billing_events",
    "core.audit_logs",
    "service_role",
    "authenticated",
    "expect_denied",
    "authenticated user cannot read billing events even in own workspace",
    "authenticated user cannot read audit logs even in own workspace",
    "authenticated user cannot read service-only Verixet Stripe connections",
    "future tables fail validation without RLS",
    "rollback",
  ];
  for (const snippet of requiredSnippets) {
    if (!proof.toLowerCase().includes(snippet.toLowerCase())) {
      errors.push(`RLS proof SQL missing required assertion text: ${snippet}`);
    }
  }
}

if (!fs.existsSync(validationPath)) {
  errors.push("Missing supabase/migrations/099_validation_checks.sql");
} else {
  const validation = read("supabase/migrations/099_validation_checks.sql").toLowerCase();
  const requiredValidation = [
    "tables missing rls",
    "at least one table has no rls policies",
    "anon must not have broad unsafe write grants",
    "entitlement rows must be sourced through verixet authority",
  ];
  for (const snippet of requiredValidation) {
    if (!validation.includes(snippet)) {
      errors.push(`Supabase validation migration missing guardrail: ${snippet}`);
    }
  }
}

if (!fs.existsSync(hardeningMigrationPath)) {
  errors.push("Missing production RLS hardening migration");
} else {
  const hardening = fs.readFileSync(hardeningMigrationPath, "utf8").toLowerCase();
  const requiredHardening = [
    "create schema if not exists private",
    "security definer",
    "alter table core.audit_logs force row level security",
    "revoke select on table core.billing_events from authenticated",
    "revoke select on table verixet.stripe_connections from authenticated",
    "x-xflow-ecosystem-* headers are not trusted",
  ];
  for (const snippet of requiredHardening) {
    if (!hardening.includes(snippet)) {
      errors.push(`Production RLS hardening migration missing guardrail: ${snippet}`);
    }
  }
}

if (errors.length > 0) {
  console.error("validate-rls-proof failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const databaseUrl =
  process.env.SUPABASE_TEST_DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (process.env.RUN_RLS_DB_TESTS === "1") {
  if (!databaseUrl) {
    console.error("RUN_RLS_DB_TESTS=1 requires SUPABASE_TEST_DATABASE_URL, SUPABASE_DB_URL, or DATABASE_URL.");
    process.exit(1);
  }
  const result = spawnSync(process.platform === "win32" ? "psql.exe" : "psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", proofPath], {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log("validate-rls-proof: database proof ok");
} else {
  console.log("validate-rls-proof: static proof ok (set RUN_RLS_DB_TESTS=1 to execute against Supabase)");
}
