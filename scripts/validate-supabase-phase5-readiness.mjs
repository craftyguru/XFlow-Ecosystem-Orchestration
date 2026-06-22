import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const apps = [
  { name: "XFlow", prefix: "XFLOW", dir: "apps/XFlow", packageManager: "npm", runtimeDoc: "docs/xflow-shared-supabase-local-migration.md" },
  { name: "Verixet", prefix: "VERIXET", dir: "apps/Verixet", packageManager: "npm", runtimeDoc: "apps/Verixet/docs/shared-supabase-local-migration.md" },
  { name: "AudAiX", prefix: "AUDAIX", dir: "apps/AudAix", packageManager: "npm", runtimeDoc: "docs/audaix-shared-supabase-local-migration.md" },
  { name: "Rataify", prefix: "RATAIFY", dir: "apps/RatAiFy", packageManager: "npm", runtimeDoc: "docs/rataify-shared-supabase-local-migration.md" },
  { name: "WordGeni", prefix: "WORDGENI", dir: "apps/WordGeni", packageManager: "pnpm", runtimeDoc: "docs/wordgeni-shared-supabase-local-migration.md" },
  { name: "Crevux", prefix: "CREVUX", dir: "apps/CreVux", packageManager: "pnpm", runtimeDoc: "docs/crevux-shared-supabase-local-migration.md" },
];

const requiredDocs = [
  "docs/shared-supabase-phase5-production-readiness.md",
  "docs/shared-supabase-phase-4g-staging-proof.md",
  "docs/shared-supabase-cutover-plan.md",
  "docs/shared-supabase-backfill-plan.md",
  "docs/shared-supabase-rollback-plan.md",
  "docs/shared-supabase-pause-readiness.md",
  "docs/shared-supabase-final-bridge-status.md",
];

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function runValidator(script, env = process.env) {
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    errors.push(`${script} failed`);
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (output) errors.push(output);
  }
}

function parseJsonFile(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    errors.push(`Could not parse ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}

function checkRequiredFiles() {
  for (const doc of requiredDocs) {
    if (!exists(doc)) errors.push(`Missing required readiness document: ${doc}`);
  }

  for (const app of apps) {
    const localSmoke = `${app.dir}/scripts/smoke-shared-supabase-local.ts`;
    const runtimeSmoke = `${app.dir}/scripts/smoke-shared-supabase-runtime.ts`;
    if (!exists(localSmoke)) errors.push(`${app.name} missing local smoke script: ${localSmoke}`);
    if (!exists(runtimeSmoke)) errors.push(`${app.name} missing runtime smoke script: ${runtimeSmoke}`);
    if (!exists(app.runtimeDoc)) errors.push(`${app.name} missing runtime/local migration doc: ${app.runtimeDoc}`);

    const packageJsonPath = `${app.dir}/package.json`;
    if (!exists(packageJsonPath)) {
      errors.push(`${app.name} missing package.json`);
      continue;
    }
    const packageJson = parseJsonFile(packageJsonPath);
    const scripts = packageJson.scripts ?? {};
    if (!scripts["smoke:shared-supabase-local"]) {
      errors.push(`${app.name} package.json missing smoke:shared-supabase-local`);
    }
    if (!scripts["smoke:shared-supabase-runtime"]) {
      errors.push(`${app.name} package.json missing smoke:shared-supabase-runtime`);
    }
  }
}

function checkEnvExampleDefaults() {
  for (const app of apps) {
    const envExamplePath = `${app.dir}/.env.example`;
    if (!exists(envExamplePath)) {
      errors.push(`${app.name} missing .env.example`);
      continue;
    }
    const text = read(envExamplePath);
    const expected = [
      `${app.prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=false`,
      `${app.prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`,
      `${app.prefix}_SHARED_SUPABASE_READ_MODE=legacy`,
      `${app.prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
    ];
    for (const line of expected) {
      if (!text.includes(line)) errors.push(`${app.name} .env.example must default ${line}`);
    }
  }
}

function checkNoProductionEnvFiles() {
  const disallowed = [];
  walk(repoRoot, (filePath) => {
    const relative = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    const base = path.basename(filePath).toLowerCase();
    if (relative.includes("/node_modules/") || relative.includes("/dist/") || relative.includes("/build/")) return;
    if (base.endsWith(".example") || base.includes("example") || base.includes("proof")) return;
    if (base === ".env.production" || base === ".env.prod" || base === ".env.production.local" || base === ".env.prod.local") {
      disallowed.push(relative);
    }
  });
  for (const file of disallowed) errors.push(`Production env file present in workspace: ${file}`);
}

function checkNoPublicServiceRole() {
  const publicServiceRole = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\b/;
  const publicDbUrl = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*(?:DATABASE_URL|DIRECT_DATABASE_URL)[A-Z0-9_]*\b/;
  const scanExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx", ".cjs", ".cts", ".env", ".example"]);

  walk(repoRoot, (filePath) => {
    const relative = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    if (
      relative.includes("/node_modules/") ||
      relative.includes("/dist/") ||
      relative.includes("/build/") ||
      relative.includes("/coverage/") ||
      relative.startsWith("supabase/")
    ) {
      return;
    }
    if (!scanExtensions.has(path.extname(filePath)) && !path.basename(filePath).startsWith(".env")) return;
    const text = fs.readFileSync(filePath, "utf8");
    if (publicServiceRole.test(text)) errors.push(`Public service-role env reference found in ${relative}`);
    if (publicDbUrl.test(text)) errors.push(`Public database URL env reference found in ${relative}`);
  });
}

function checkPauseDocsRemainUnsafe() {
  const docs = [
    "docs/shared-supabase-pause-readiness.md",
    "docs/shared-supabase-phase5-production-readiness.md",
    "docs/shared-supabase-final-bridge-status.md",
  ];
  for (const doc of docs) {
    if (!exists(doc)) continue;
    const text = read(doc);
    if (/safe to pause(?: old Supabase project)?\?\s*\|\s*yes/i.test(text)) {
      errors.push(`${doc} appears to mark an old Supabase project safe to pause`);
    }
    if (!/unsafe to pause|not safe to pause|safe to pause.*No|Default status: \*\*old Supabase projects are unsafe to pause\*\*/is.test(text)) {
      errors.push(`${doc} must explicitly state old Supabase projects are unsafe/not safe to pause`);
    }
  }
}

function checkDocsContainReadinessContent() {
  const phase5 = exists("docs/shared-supabase-phase5-production-readiness.md")
    ? read("docs/shared-supabase-phase5-production-readiness.md")
    : "";
  const requiredPatterns = [
    /go\/no-go checklist/i,
    /per-app staging validation checklist/i,
    /required env vars per deployed service/i,
    /provider callback validation plan/i,
    /storage migration plan/i,
    /legacy id mapping plan/i,
    /backfill\/reconciliation plan/i,
    /rollback rehearsal plan/i,
    /monitoring\/alerting plan/i,
    /observation window plan/i,
    /old supabase pause criteria/i,
    /production cutover remains unsafe/i,
  ];
  for (const pattern of requiredPatterns) {
    if (!pattern.test(phase5)) errors.push(`Phase 5 readiness doc missing section/content: ${pattern}`);
  }
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      walk(fullPath, onFile);
      continue;
    }
    if (entry.isFile()) onFile(fullPath);
  }
}

runValidator("scripts/validate-supabase-phase1.mjs");
runValidator("scripts/validate-supabase-phase2.mjs");
runValidator("scripts/validate-supabase-phase4g-staging.mjs", {
  ...process.env,
  NODE_ENV: "development",
  CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED: "true",
  CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED: "true",
  CREVUX_SHARED_SUPABASE_READ_MODE: "legacy",
  CREVUX_SHARED_SUPABASE_FAIL_CLOSED: "false",
  CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE: "true",
  CREVUX_LEGACY_SUPABASE_URL: "",
  CREVUX_LEGACY_DATABASE_URL: "",
});

checkRequiredFiles();
checkEnvExampleDefaults();
checkNoProductionEnvFiles();
checkNoPublicServiceRole();
checkPauseDocsRemainUnsafe();
checkDocsContainReadinessContent();

if (errors.length > 0) {
  console.error("validate-supabase-phase5-readiness: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-supabase-phase5-readiness: ok");
