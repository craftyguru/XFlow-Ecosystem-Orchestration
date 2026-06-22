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

const requiredFiles = [
  "docs/shared-supabase-phase7a-backup-monitoring-rollback.md",
  "scripts/check-shared-supabase-dual-write-health.mjs",
  "scripts/check-old-db-write-detection.mjs",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`${file} does not exist`);
}

if (exists("docs/shared-supabase-phase7a-backup-monitoring-rollback.md")) {
  const doc = lower("docs/shared-supabase-phase7a-backup-monitoring-rollback.md");
  const requiredPhrases = [
    "production cutover remains unsafe",
    "old supabase projects remain unsafe to pause",
    "production dual-write rollout is not safe yet",
    "backup and export plan",
    "old supabase export checklist per app",
    "shared supabase backup verification checklist",
    "restore drill steps",
    "monitoring and alerts",
    "dual-write failure detection",
    "dual-compare mismatch logging",
    "shared write latency/error counters",
    "verixet usage admission errors",
    "xflow control-plane write errors",
    "app-specific shared write failures",
    "old db write detection",
    "rollback rehearsal",
    "confirm legacy path still works",
    "confirm shared write path stops",
    "verixet_shared_supabase_runtime_enabled=false",
    "xflow_shared_supabase_runtime_enabled=false",
    "audaix_shared_supabase_runtime_enabled=false",
    "rataify_shared_supabase_runtime_enabled=false",
    "wordgeni_shared_supabase_runtime_enabled=false",
    "crevux_shared_supabase_runtime_enabled=false",
  ];

  for (const phrase of requiredPhrases) {
    if (!doc.includes(phrase)) fail(`Phase 7A doc missing phrase: ${phrase}`);
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
      fail(`${relative}:${row.line} defaults READ_MODE=shared`);
    }
    if ((key.endsWith("FAIL_CLOSED") || key.includes("_SHARED_SUPABASE_FAIL_CLOSED")) && value === "true") {
      fail(`${relative}:${row.line} defaults FAIL_CLOSED=true`);
    }
  }
}

if (failures.length) {
  console.error("validate-supabase-phase7a-readiness: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`validate-supabase-phase7a-readiness: ok (${phase6bOutput})`);
