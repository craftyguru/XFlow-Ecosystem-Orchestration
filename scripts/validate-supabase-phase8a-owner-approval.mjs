#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/shared-supabase-phase8a-owner-approval-preflight.md";
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

try {
  runNodeScript("scripts/validate-supabase-phase7k-go-no-go.mjs");
} catch (error) {
  fail(`Phase 7K validator failed: ${error.stderr || error.message}`);
}

try {
  runNodeScript("scripts/validate-supabase-phase8-dual-write-plan.mjs");
} catch (error) {
  fail(`Phase 8 validator failed: ${error.stderr || error.message}`);
}

if (!existsSync(path.join(repoRoot, docPath))) {
  fail(`${docPath} does not exist`);
} else {
  const doc = read(docPath);
  const lower = doc.toLowerCase();

  for (const phrase of [
    "owner approval status: approved for controlled production dual-write/compare only",
    "shared-read cutover: not approved",
    "`fail_closed=true`: not approved",
    "pausing old supabase projects: not approved",
    "deleting old dbs: not approved",
    "removing legacy db paths: not approved",
    "never use `read_mode=shared` in this phase",
    "never set `fail_closed=true` in this phase",
    "crevux old supabase backup/export `roles.sql` remains unavailable",
    "crevux rollback proof remains blocked because the only known legacy target is production/unknown",
    "production dual-write variable update: approved",
    "shared-read cutover: not safe",
    "old supabase pause: not safe",
  ]) {
    if (!lower.includes(phrase.toLowerCase())) {
      fail(`${docPath} missing phrase: ${phrase}`);
    }
  }

  const apps = [
    ["verixet", "VERIXET"],
    ["xflow", "XFLOW"],
    ["audaix", "AUDAIX"],
    ["rataify", "RATAIFY"],
    ["wordgeni", "WORDGENI"],
    ["crevux", "CREVUX"],
  ];

  for (const [name, prefix] of apps) {
    if (!lower.includes(`### ${name}`)) fail(`${docPath} missing section for ${name}`);
    for (const line of [
      `${prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=true`,
      `${prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`,
      `${prefix}_SHARED_SUPABASE_READ_MODE=dual_compare`,
      `${prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
      `${prefix}_SHARED_SUPABASE_RUNTIME_ENABLED=false`,
      `${prefix}_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`,
      `${prefix}_SHARED_SUPABASE_READ_MODE=legacy`,
      `${prefix}_SHARED_SUPABASE_FAIL_CLOSED=false`,
    ]) {
      if (!doc.includes(line)) fail(`${docPath} missing checklist line: ${line}`);
    }
  }

  if (/read_mode=shared/.test(doc) && !/never use `read_mode=shared`/i.test(doc)) {
    fail(`${docPath} must not recommend READ_MODE=shared`);
  }
  if (/fail_closed=true/.test(doc) && !/never set `fail_closed=true`/i.test(doc)) {
    fail(`${docPath} must not recommend FAIL_CLOSED=true`);
  }
}

if (failures.length) {
  console.error("validate-supabase-phase8a-owner-approval: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("validate-supabase-phase8a-owner-approval: ok");
