import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/shared-supabase-phase6c-staging-target-setup.md";
const errors = [];
const warnings = [];

const apps = [
  {
    name: "Verixet",
    prefix: "VERIXET",
    requiredVars: ["VERIXET_SMOKE_BASE_URL"],
    optionalVars: ["E2E_API_KEY", "VERIXET_STAGING_SEEDED_AUTH"],
  },
  {
    name: "XFlow",
    prefix: "XFLOW",
    requiredVars: ["XFLOW_RELEASE_SMOKE_BASE_URL"],
    optionalVars: ["XFLOW_RELEASE_SMOKE_SESSION_COOKIE", "PRODUCTION_SMOKE_SESSION_COOKIE"],
  },
  {
    name: "AudAiX",
    prefix: "AUDAIX",
    requiredVars: ["AUDAIX_PUBLIC_URL", "AUDAIX_API_URL", "TEST_USER_EMAIL", "TEST_USER_PASSWORD"],
    optionalVars: ["AUDAIX_PRODUCTION_BASE_URL", "AUDAIX_TEST_EMAIL", "AUDAIX_TEST_PASSWORD", "TEST_ACCESS_TOKEN"],
  },
  {
    name: "Rataify",
    prefix: "RATAIFY",
    requiredVars: ["RELEASE_VERIFY_BASE_URL"],
    optionalVars: ["APP_BASE_URL", "NEXT_PUBLIC_APP_URL"],
  },
  {
    name: "WordGeni",
    prefix: "WORDGENI",
    requiredVars: ["WEB_URL", "API_URL"],
    optionalVars: ["WORKER_LOG_FILE", "WORKER_LOG_TEXT"],
  },
  {
    name: "Crevux",
    prefix: "CREVUX",
    requiredVars: ["CREVUX_AUTH_SMOKE_WEB_URL", "CREVUX_AUTH_SMOKE_API_URL"],
    optionalVars: ["CREVUX_AUTH_SMOKE_ALLOW_REMOTE", "SMOKE_NORMAL_EMAIL", "SMOKE_ADMIN_EMAIL"],
  },
];

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function run(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    errors.push(`${script} failed`);
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (output) errors.push(output);
  }
}

run("scripts/validate-supabase-phase6-results.mjs");
run("scripts/validate-supabase-phase6b-browser-flows.mjs");

if (!fs.existsSync(absolute(docPath))) {
  errors.push(`Missing Phase 6C setup document: ${docPath}`);
} else {
  const text = read(docPath);

  if (!/production cutover (?:is |remains )?unsafe/i.test(text)) {
    errors.push("Phase 6C doc must explicitly state production cutover is unsafe.");
  }
  if (!/old Supabase projects (?:are |remain )?unsafe to pause/i.test(text)) {
    errors.push("Phase 6C doc must explicitly state old Supabase projects are unsafe to pause.");
  }
  if (/production cutover (?:is )?safe/i.test(text) || /old Supabase projects (?:are )?safe to pause/i.test(text)) {
    errors.push("Phase 6C doc must not mark production cutover or old Supabase pause safe.");
  }

  const requiredDocSnippets = [
    "Staging Target Matrix",
    "WordGeni Path-With-Spaces Fix",
    "Remaining Manual Values",
    "READ_MODE=dual_compare",
    "FAIL_CLOSED=false",
    "READ_MODE=shared",
    "FAIL_CLOSED=true",
  ];
  for (const snippet of requiredDocSnippets) {
    if (!text.includes(snippet)) errors.push(`Phase 6C doc missing required text: ${snippet}`);
  }

  for (const app of apps) {
    for (const envVar of [...app.requiredVars, ...app.optionalVars]) {
      if (!text.includes(envVar)) errors.push(`Phase 6C doc missing ${app.name} env var: ${envVar}`);
    }
    const requiredFlags = [
      `${app.prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=true`,
      `${app.prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`,
      `${app.prefix}_SHARED_SUPABASE_READ_MODE=dual_compare`,
      `${app.prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
    ];
    for (const flag of requiredFlags) {
      if (!text.includes(flag)) errors.push(`Phase 6C doc missing ${app.name} runtime flag: ${flag}`);
    }
  }
}

const wordGeniVerifier = fs.existsSync(absolute("apps/WordGeni/scripts/live-verify-wordgeni.mjs"))
  ? read("apps/WordGeni/scripts/live-verify-wordgeni.mjs")
  : "";
if (!/fileURLToPath/.test(wordGeniVerifier) || /pathname\.replace/.test(wordGeniVerifier)) {
  errors.push("WordGeni live verifier must use fileURLToPath/path utilities and avoid pathname.replace path handling.");
}
if (!fs.existsSync(absolute("apps/WordGeni/scripts/live-verify-wordgeni.test.mjs"))) {
  errors.push("Missing WordGeni path-with-spaces regression test.");
}

for (const app of apps) {
  for (const envVar of app.requiredVars) {
    if (!process.env[envVar]?.trim()) {
      warnings.push(`${app.name}: ${envVar} is not set locally; Phase 6B browser/API proof will remain blocked until provided.`);
    }
  }
}

if (errors.length > 0) {
  console.error("validate-supabase-phase6c-targets: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
console.log(`validate-supabase-phase6c-targets: ok (missing_local_values=${warnings.length})`);
