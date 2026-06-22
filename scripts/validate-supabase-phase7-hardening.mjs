#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function normalize(text) {
  return text.toLowerCase();
}

function runNodeScript(relativePath) {
  return execFileSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if ([".git", "node_modules", ".next", "dist", "build", ".turbo", ".vercel"].includes(entry)) {
        continue;
      }
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function envExampleFiles() {
  return walk(repoRoot).filter((file) => {
    const base = path.basename(file);
    return base.startsWith(".env") && base.endsWith(".example");
  });
}

function parseEnvExampleDefaults(file) {
  const text = readFileSync(file, "utf8");
  const rows = [];
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const eq = line.indexOf("=");
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    rows.push({ file, line: index + 1, key, value });
  }
  return rows;
}

let phase6bOutput = "";
try {
  phase6bOutput = runNodeScript("scripts/validate-supabase-phase6b-browser-flows.mjs").trim();
  if (!/passed=6,\s*failed=0,\s*pending=0/.test(phase6bOutput)) {
    fail(`Phase 6B validator did not report passed=6, failed=0, pending=0. Output: ${phase6bOutput}`);
  }
} catch (error) {
  fail(`Phase 6B validator failed: ${error.stderr || error.message}`);
}

const phase7Doc = "docs/shared-supabase-phase7-production-hardening.md";
if (!existsSync(path.join(repoRoot, phase7Doc))) {
  fail(`${phase7Doc} does not exist`);
} else {
  const doc = readText(phase7Doc);
  const lower = normalize(doc);

  const requiredPhrases = [
    "phase 6 runtime smokes passed",
    "phase 6b browser/api proof passed for all six apps",
    "production cutover remains unsafe",
    "old supabase projects remain unsafe to pause",
    "real storage proof",
    "provider callback",
    "idempotency proof",
    "stripe test",
    "rollback rehearsal",
    "monitoring",
    "observation window",
    "backup/export",
    "shared supabase backup verification",
    "old db write detection",
    "read_mode=dual_compare",
    "fail_closed=false",
  ];

  for (const phrase of requiredPhrases) {
    if (!lower.includes(phrase)) {
      fail(`${phase7Doc} is missing required hardening phrase: ${phrase}`);
    }
  }

  for (const app of ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"]) {
    if (!lower.includes(app)) {
      fail(`${phase7Doc} is missing per-app checklist entry for ${app}`);
    }
  }

  const hardeningTerms = [
    "stripe test-mode checkout/webhook proof",
    "usage admission idempotency",
    "app connection idempotency",
    "ucl event replay/idempotency",
    "report artifact storage proof",
    "mfa/aal2 staging proof",
    "evidence storage proof",
    "legacy db readiness cleanup",
    "worker boot/provenance proof",
    "api auth/token proof",
    "crevux-assets storage proof",
    "provider callback/idempotency proof",
    "credit spend proof",
  ];

  for (const term of hardeningTerms) {
    if (!lower.includes(term)) {
      fail(`${phase7Doc} is missing checklist term: ${term}`);
    }
  }
}

for (const file of envExampleFiles()) {
  for (const row of parseEnvExampleDefaults(file)) {
    const key = row.key.toUpperCase();
    const value = row.value.toLowerCase();
    const relative = path.relative(repoRoot, row.file);

    if ((key.endsWith("READ_MODE") || key.includes("_SHARED_SUPABASE_READ_MODE")) && value === "shared") {
      fail(`${relative}:${row.line} defaults ${row.key}=shared`);
    }

    if ((key.endsWith("FAIL_CLOSED") || key.includes("_SHARED_SUPABASE_FAIL_CLOSED")) && value === "true") {
      fail(`${relative}:${row.line} defaults ${row.key}=true`);
    }
  }
}

if (failures.length) {
  console.error("validate-supabase-phase7-hardening: failed");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`validate-supabase-phase7-hardening: ok (${phase6bOutput})`);
