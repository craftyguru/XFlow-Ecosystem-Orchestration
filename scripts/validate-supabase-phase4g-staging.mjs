import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredDocs = [
  "docs/shared-supabase-phase-4g-staging-proof.md",
  "docs/shared-supabase-cutover-plan.md",
  "docs/shared-supabase-rollback-plan.md",
  "docs/shared-supabase-final-bridge-status.md",
  "docs/crevux-shared-supabase-local-migration.md",
];

const requiredRuntimeFlags = [
  "CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED",
  "CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
  "CREVUX_SHARED_SUPABASE_READ_MODE",
  "CREVUX_SHARED_SUPABASE_FAIL_CLOSED",
  "CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE",
];

const errors = [];

function readRepoFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireText(relativePath, patterns) {
  const text = readRepoFile(relativePath);
  for (const pattern of patterns) {
    if (!pattern.test(text)) {
      errors.push(`Missing expected documentation in ${relativePath}: ${pattern}`);
    }
  }
}

function isTruthy(value) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

function envState(name) {
  const value = process.env[name];
  if (value == null || value.trim() === "") return "missing";
  return "present";
}

function failIfSecretLooksLive(name) {
  const value = process.env[name] ?? "";
  const lower = value.toLowerCase();
  if (lower.includes("sk_live") || lower.includes("whsec_live")) {
    errors.push(`${name} appears to be live; Phase 4G smoke/proof must not run with live Stripe values`);
  }
}

function checkRuntimeEnv() {
  if (envState("CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED") !== "present") {
    errors.push("CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED must be explicitly set for Phase 4G proof");
  }

  if (!isTruthy(process.env.CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED)) {
    errors.push("CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED must be true for staging proof validation");
  }

  const readMode = process.env.CREVUX_SHARED_SUPABASE_READ_MODE?.trim();
  if (readMode && !["legacy", "shared", "dual_compare"].includes(readMode)) {
    errors.push("CREVUX_SHARED_SUPABASE_READ_MODE must be one of legacy, shared, dual_compare");
  }

  if (isTruthy(process.env.CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE)) {
    if (process.env.NODE_ENV === "production") {
      errors.push("CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE is refused when NODE_ENV=production");
    }
    if (!isTruthy(process.env.CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED)) {
      errors.push("CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE requires CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true");
    }
  }

  failIfSecretLooksLive("STRIPE_SECRET_KEY");
  failIfSecretLooksLive("STRIPE_WEBHOOK_SECRET");

  for (const [name, value] of Object.entries(process.env)) {
    if (/CREVUX_.*(?:PRODUCTION|CUTOVER).*ENABLED/i.test(name) && isTruthy(value)) {
      errors.push(`${name} is enabled; Phase 4G must not enable production cutover flags`);
    }
  }

  if (readMode === "dual_compare") {
    const hasShared = Boolean(process.env.SUPABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || process.env.DIRECT_DATABASE_URL?.trim());
    const hasLegacy = Boolean(process.env.CREVUX_LEGACY_SUPABASE_URL?.trim() || process.env.CREVUX_LEGACY_DATABASE_URL?.trim());
    if (!hasShared || !hasLegacy) {
      errors.push("dual_compare mode requires both shared Supabase env and legacy Crevux env references");
    }
  } else {
    const legacyKeys = ["CREVUX_LEGACY_SUPABASE_URL", "CREVUX_LEGACY_DATABASE_URL"];
    for (const key of legacyKeys) {
      if (process.env[key]?.trim()) {
        errors.push(`${key} is present outside dual_compare mode; keep legacy compare envs scoped to compare proof`);
      }
    }
  }
}

function checkDocs() {
  for (const doc of requiredDocs) readRepoFile(doc);

  requireText("docs/shared-supabase-phase-4g-staging-proof.md", [
    /what phase 4g proves/i,
    /what phase 4g does not prove/i,
    /CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true/,
    /CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true/,
    /CREVUX_SHARED_SUPABASE_READ_MODE=legacy/,
    /CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false/,
    /CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true/,
    /sk_live/i,
    /production cutover is unsafe/i,
    /old Crevux Supabase remains unsafe to pause/i,
    /provider\/dashboard proof/i,
  ]);

  requireText("docs/shared-supabase-cutover-plan.md", [
    /CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false/,
    /CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false/,
    /CREVUX_SHARED_SUPABASE_READ_MODE=legacy/,
    /CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false/,
    /CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true/,
    /Full route-level production enablement still requires workspace\/user UUID mapping/i,
  ]);

  requireText("docs/shared-supabase-rollback-plan.md", [
    /CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false/,
    /CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=false/,
    /Do not replay provider callbacks blindly/i,
  ]);

  requireText("docs/shared-supabase-final-bridge-status.md", [
    /Phase 4F Crevux Runtime Status/,
    /Production cutover remains unsafe/i,
    /Legacy numeric workspace\/user IDs/i,
    /CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true/,
  ]);

  requireText("docs/crevux-shared-supabase-local-migration.md", [
    /pnpm smoke:shared-supabase-runtime/,
    /CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true/,
    /still refuses any effective live Stripe key/i,
    /Production cutover is not safe yet/i,
  ]);

  const envExample = readRepoFile("apps/CreVux/.env.example");
  for (const flag of requiredRuntimeFlags) {
    if (!envExample.includes(flag)) {
      errors.push(`apps/CreVux/.env.example must document ${flag}`);
    }
  }
}

checkRuntimeEnv();
checkDocs();

if (errors.length > 0) {
  console.error("validate-supabase-phase4g-staging: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-supabase-phase4g-staging: ok");
