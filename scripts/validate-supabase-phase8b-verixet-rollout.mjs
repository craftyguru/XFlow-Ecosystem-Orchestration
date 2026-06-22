#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/shared-supabase-phase8b-verixet-rollout.md";
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
  runNodeScript("scripts/validate-supabase-phase8a-owner-approval.mjs");
} catch (error) {
  fail(`Phase 8A validator failed: ${error.stderr || error.message}`);
}

if (!existsSync(path.join(repoRoot, docPath))) {
  fail(`${docPath} does not exist`);
} else {
  const doc = read(docPath);
  const lower = doc.toLowerCase();

  for (const phrase of [
    "verixet only",
    "apps not approved for this update",
    "xflow",
    "audaix",
    "rataify",
    "wordgeni",
    "crevux",
    "railway / service variable update steps",
    "post-update smoke commands",
    "shared supabase row verification",
    "legacy db verification",
    "rollback steps",
    "verixet variable update readiness: ready for operator execution",
    "other app variable updates: not approved in phase 8b",
    "shared-read cutover: not safe",
    "old supabase pause: not safe",
  ]) {
    if (!lower.includes(phrase)) fail(`${docPath} missing phrase: ${phrase}`);
  }

  const required = [
    "VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true",
    "VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare",
    "VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false",
    "VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false",
    "VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false",
    "VERIXET_SHARED_SUPABASE_READ_MODE=legacy",
    "VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false",
    "core.entitlements",
    "core.usage_events",
    "core.audit_logs",
    "verixet.entitlement_decisions",
    "verixet.usage_admission_logs",
    "npm run verify:post-deploy-smoke",
  ];

  for (const value of required) {
    if (!doc.includes(value)) fail(`${docPath} missing required value: ${value}`);
  }

  const forbiddenApprovals = [
    "XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true",
  ];

  for (const value of forbiddenApprovals) {
    if (doc.includes(value)) fail(`${docPath} must not include other-app update flag: ${value}`);
  }

  if (/VERIXET_SHARED_SUPABASE_READ_MODE=shared/.test(doc)) {
    fail(`${docPath} must not set VERIXET_SHARED_SUPABASE_READ_MODE=shared`);
  }
  if (/VERIXET_SHARED_SUPABASE_FAIL_CLOSED=true/.test(doc)) {
    fail(`${docPath} must not set VERIXET_SHARED_SUPABASE_FAIL_CLOSED=true`);
  }
  if (/shared-read cutover:\s*(approved|safe)/i.test(doc)) {
    fail(`${docPath} must not approve shared-read cutover`);
  }
  if (/old supabase pause:\s*(approved|safe)/i.test(doc)) {
    fail(`${docPath} must not approve old Supabase pause`);
  }
}

if (failures.length) {
  console.error("validate-supabase-phase8b-verixet-rollout: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("validate-supabase-phase8b-verixet-rollout: ok");
