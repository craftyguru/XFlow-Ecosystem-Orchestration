#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function runNodeScript(relativePath) {
  return execFileSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function lower(relativePath) {
  return read(relativePath).toLowerCase();
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if ([".git", "node_modules", ".next", "dist", "build", ".turbo", ".vercel"].includes(entry)) continue;
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
    if (!base.startsWith(".env") || !base.endsWith(".example")) return false;
    // Phase 6D is an explicit local/staging proof template whose purpose is to
    // enable dual-write/compare locally. Production/default env examples must
    // still keep runtime flags off.
    return !base.includes("phase6");
  });
}

function parseEnvRows(file) {
  const rows = [];
  const text = readFileSync(file, "utf8");
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const eq = line.indexOf("=");
    rows.push({
      file,
      line: index + 1,
      key: line.slice(0, eq).trim(),
      value: line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, ""),
    });
  }
  return rows;
}

const requiredDocs = [
  "docs/shared-supabase-production-rollout-packet.md",
  "docs/shared-supabase-production-rollout-checklist.md",
  "docs/shared-supabase-production-env-matrix.md",
  "docs/shared-supabase-production-rollback-runbook.md",
  "docs/shared-supabase-production-communications.md",
  "docs/shared-supabase-phase7-production-hardening.md",
];

for (const doc of requiredDocs) {
  if (!exists(doc)) fail(`${doc} does not exist`);
}

let phase6bOutput = "";
try {
  phase6bOutput = runNodeScript("scripts/validate-supabase-phase6b-browser-flows.mjs");
  if (!/passed=6,\s*failed=0,\s*pending=0/.test(phase6bOutput)) {
    fail(`Phase 6B validator did not report passed=6, failed=0, pending=0. Output: ${phase6bOutput}`);
  }
} catch (error) {
  fail(`Phase 6B validator failed: ${error.stderr || error.message}`);
}

try {
  runNodeScript("scripts/validate-supabase-phase7-hardening.mjs");
} catch (error) {
  fail(`Phase 7 validator failed: ${error.stderr || error.message}`);
}

if (exists("docs/shared-supabase-production-rollout-packet.md")) {
  const packet = lower("docs/shared-supabase-production-rollout-packet.md");
  const packetRequired = [
    "production dual-write rollout is not safe unless",
    "production cutover remains unsafe",
    "old supabase projects remain unsafe to pause",
    "legacy db remains source of truth",
    "do not use `read_mode=shared` yet",
    "do not set `fail_closed=true` yet",
    "do not pause old supabase projects",
    "verixet",
    "xflow",
    "audaix",
    "rataify",
    "wordgeni",
    "crevux",
  ];
  for (const phrase of packetRequired) {
    if (!packet.includes(phrase)) fail(`rollout packet missing phrase: ${phrase}`);
  }

  const order = ["1. verixet", "2. xflow", "3. audaix", "4. rataify", "5. wordgeni", "6. crevux"];
  for (const item of order) {
    if (!packet.includes(item)) fail(`rollout packet missing rollout order item: ${item}`);
  }
}

if (exists("docs/shared-supabase-production-env-matrix.md")) {
  const envMatrix = lower("docs/shared-supabase-production-env-matrix.md");
  for (const phrase of [
    "supabase_url",
    "supabase_anon_key",
    "supabase_service_role_key",
    "database_url",
    "direct_database_url",
    "next_public_supabase_url",
    "next_public_supabase_anon_key",
    "vite_supabase_url",
    "vite_supabase_anon_key",
    "service-role keys and database urls are server-only",
  ]) {
    if (!envMatrix.includes(phrase)) fail(`env matrix missing phrase: ${phrase}`);
  }
}

if (exists("docs/shared-supabase-production-rollback-runbook.md")) {
  const rollback = lower("docs/shared-supabase-production-rollback-runbook.md");
  for (const app of ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"]) {
    if (!rollback.includes(`${app}_shared_supabase_runtime_enabled=false`)) {
      fail(`rollback runbook missing runtime-off flag for ${app}`);
    }
  }
}

if (exists("docs/shared-supabase-production-communications.md")) {
  const comms = lower("docs/shared-supabase-production-communications.md");
  for (const phrase of ["pre-rollout notice", "during rollout update", "rollback notice", "post-rollout summary", "emergency contact"]) {
    if (!comms.includes(phrase)) fail(`communications doc missing phrase: ${phrase}`);
  }
}

for (const file of envExampleFiles()) {
  for (const row of parseEnvRows(file)) {
    const key = row.key.toUpperCase();
    const value = row.value.toLowerCase();
    const relative = path.relative(repoRoot, row.file);

    if (key.includes("_SHARED_SUPABASE_RUNTIME_ENABLED") && value === "true") {
      fail(`${relative}:${row.line} defaults runtime flag true`);
    }
    if (key.includes("_SHARED_SUPABASE_DUAL_WRITE_ENABLED") && value === "true") {
      fail(`${relative}:${row.line} defaults dual-write flag true`);
    }
    if ((key.endsWith("READ_MODE") || key.includes("_SHARED_SUPABASE_READ_MODE")) && value === "shared") {
      fail(`${relative}:${row.line} defaults read mode shared`);
    }
    if ((key.endsWith("FAIL_CLOSED") || key.includes("_SHARED_SUPABASE_FAIL_CLOSED")) && value === "true") {
      fail(`${relative}:${row.line} defaults fail-closed true`);
    }
    if ((key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_")) && key.includes("SERVICE_ROLE")) {
      fail(`${relative}:${row.line} exposes service-role wording in public env prefix`);
    }
    if ((key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_")) && (key.includes("DATABASE_URL") || key.includes("DIRECT_DATABASE_URL"))) {
      fail(`${relative}:${row.line} exposes database URL wording in public env prefix`);
    }
  }
}

if (failures.length) {
  console.error("validate-supabase-production-rollout-packet: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`validate-supabase-production-rollout-packet: ok (${phase6bOutput})`);
