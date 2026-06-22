import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const apps = [
  { name: "Verixet", prefix: "VERIXET", dir: "apps/Verixet", pm: "npm" },
  { name: "XFlow", prefix: "XFLOW", dir: "apps/XFlow", pm: "npm" },
  { name: "AudAiX", prefix: "AUDAIX", dir: "apps/AudAix", pm: "npm" },
  { name: "Rataify", prefix: "RATAIFY", dir: "apps/RatAiFy", pm: "npm" },
  { name: "WordGeni", prefix: "WORDGENI", dir: "apps/WordGeni", pm: "pnpm" },
  { name: "Crevux", prefix: "CREVUX", dir: "apps/CreVux", pm: "pnpm" },
];

const requiredDocs = [
  "docs/shared-supabase-phase6-staging-execution.md",
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

function parseJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    errors.push(`Could not parse ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
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

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, onFile);
    } else if (entry.isFile()) {
      onFile(fullPath);
    }
  }
}

function checkRequiredDocs() {
  for (const doc of requiredDocs) {
    if (!exists(doc)) errors.push(`Missing required Phase 6 document dependency: ${doc}`);
  }
}

function checkSmokeScripts() {
  for (const app of apps) {
    const packagePath = `${app.dir}/package.json`;
    const localSmoke = `${app.dir}/scripts/smoke-shared-supabase-local.ts`;
    const runtimeSmoke = `${app.dir}/scripts/smoke-shared-supabase-runtime.ts`;

    if (!exists(packagePath)) {
      errors.push(`${app.name} missing package.json at ${packagePath}`);
      continue;
    }
    if (!exists(localSmoke)) errors.push(`${app.name} missing local smoke script: ${localSmoke}`);
    if (!exists(runtimeSmoke)) errors.push(`${app.name} missing runtime smoke script: ${runtimeSmoke}`);

    const scripts = parseJson(packagePath).scripts ?? {};
    if (!scripts["smoke:shared-supabase-local"]) {
      errors.push(`${app.name} package.json missing smoke:shared-supabase-local`);
    }
    if (!scripts["smoke:shared-supabase-runtime"]) {
      errors.push(`${app.name} package.json missing smoke:shared-supabase-runtime`);
    }
  }
}

function checkPhase6Doc() {
  if (!exists("docs/shared-supabase-phase6-staging-execution.md")) return;
  const text = read("docs/shared-supabase-phase6-staging-execution.md");

  const requiredSections = [
    /Staging Env Matrix/i,
    /Staging Run Order/i,
    /Staging Smoke Commands/i,
    /Manual App-Flow Test Checklist/i,
    /Shared Supabase Data Verification Checklist/i,
    /Rollback Steps Per App/i,
    /Failure Conditions/i,
    /Observation Window Requirements/i,
    /production cutover remains unsafe/i,
    /old Supabase projects remain unsafe to pause/i,
  ];

  for (const pattern of requiredSections) {
    if (!pattern.test(text)) errors.push(`Phase 6 doc missing required content matching ${pattern}`);
  }

  for (const app of apps) {
    const requiredFlags = [
      `${app.prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=true`,
      `${app.prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`,
      `${app.prefix}_SHARED_SUPABASE_READ_MODE=dual_compare`,
      `${app.prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
    ];
    for (const flag of requiredFlags) {
      if (!text.includes(flag)) errors.push(`Phase 6 doc missing staging flag: ${flag}`);
    }

    const rollbackFlags = [
      `${app.prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=false`,
      `${app.prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`,
      `${app.prefix}_SHARED_SUPABASE_READ_MODE=legacy`,
      `${app.prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
    ];
    for (const flag of rollbackFlags) {
      if (!text.includes(flag)) errors.push(`Phase 6 doc missing ${app.name} rollback instruction: ${flag}`);
    }
  }
}

function checkCommittedEnvExamples() {
  const unsafeReadMode = /_SHARED_SUPABASE_READ_MODE\s*=\s*shared\b/;
  const unsafeFailClosed = /_SHARED_SUPABASE_FAIL_CLOSED\s*=\s*true\b/;
  const publicServiceRole = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\b/;

  walk(repoRoot, (filePath) => {
    const relative = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    if (!relative.endsWith(".env.example") && !relative.endsWith(".example")) return;
    const text = fs.readFileSync(filePath, "utf8");
    if (unsafeReadMode.test(text)) errors.push(`Committed env example defaults READ_MODE=shared: ${relative}`);
    if (unsafeFailClosed.test(text)) errors.push(`Committed env example defaults FAIL_CLOSED=true: ${relative}`);
    if (publicServiceRole.test(text)) errors.push(`Committed env example exposes service-role wording in public prefix: ${relative}`);
  });
}

function checkUnsafeVerdictsAcrossDocs() {
  const docsToCheck = [
    "docs/shared-supabase-phase6-staging-execution.md",
    "docs/shared-supabase-phase5-production-readiness.md",
    "docs/shared-supabase-cutover-plan.md",
    "docs/shared-supabase-pause-readiness.md",
    "docs/shared-supabase-final-bridge-status.md",
  ];

  for (const doc of docsToCheck) {
    if (!exists(doc)) continue;
    const text = read(doc);
    if (!/production cutover (?:remains )?unsafe|production cutover is still unsafe|production cutover: no/i.test(text)) {
      errors.push(`${doc} must explicitly state production cutover is unsafe`);
    }
    if (!/old Supabase projects (?:are |remain )?unsafe to pause|old Supabase .*not safe to pause|safe to pause old Supabase projects:\s*NO/i.test(text)) {
      errors.push(`${doc} must explicitly state old Supabase projects are unsafe/not safe to pause`);
    }
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
runValidator("scripts/validate-supabase-phase5-readiness.mjs");

checkRequiredDocs();
checkSmokeScripts();
checkPhase6Doc();
checkCommittedEnvExamples();
checkUnsafeVerdictsAcrossDocs();

if (errors.length > 0) {
  console.error("validate-supabase-phase6-staging: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-supabase-phase6-staging: ok");
