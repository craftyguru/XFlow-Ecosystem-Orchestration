#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/shared-supabase-phase8c-xflow-rollout.md";
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
    "xflow-only production variable update",
    "verixet phase 8b is in clean dual-write observation",
    "xflow rollout is no longer blocked by verixet fk errors",
    "remote production branch detected: `origin/master`",
    "`origin/main`: not present",
    "pr/merge is required before the xflow production variable update",
    "xflow only",
    "apps not approved for this update",
    "railway / service variable update steps",
    "preflight command",
    "post-deploy smoke commands",
    "shared supabase row verification",
    "legacy db verification",
    "monitoring checks",
    "rollback steps",
    "observation window",
    "shared-read cutover: not safe",
    "old supabase pause: not safe",
  ]) {
    if (!lower.includes(phrase)) fail(`${docPath} missing phrase: ${phrase}`);
  }

  const required = [
    "XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true",
    "XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare",
    "XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false",
    "XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false",
    "XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false",
    "XFLOW_SHARED_SUPABASE_READ_MODE=legacy",
    "XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false",
    "core.app_connections",
    "core.workspace_app_access",
    "core.audit_logs",
    "xflow.control_plane_events",
    "xflow.app_links",
    "xflow.deployment_checks",
    "xflow.workflow_runs",
    "npm run ops:release-smoke",
    "npm run smoke:shared-supabase-runtime",
    "src/lib/supabase/runtime.server.ts",
    "src/lib/supabase/shared-local.server.ts",
    "scripts/smoke-shared-supabase-local.ts",
    "scripts/smoke-shared-supabase-runtime.ts",
    "tests/supabase/runtime.server.test.ts",
  ];

  for (const value of required) {
    if (!doc.includes(value)) fail(`${docPath} missing required value: ${value}`);
  }

  for (const app of ["audaix", "rataify", "wordgeni", "crevux"]) {
    if (!lower.includes(app)) fail(`${docPath} missing not-approved app mention: ${app}`);
  }

  const forbiddenApprovals = [
    "AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true",
    "CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true",
  ];

  for (const value of forbiddenApprovals) {
    if (doc.includes(value)) fail(`${docPath} must not include other-app update flag: ${value}`);
  }

  if (/XFLOW_SHARED_SUPABASE_READ_MODE=shared/.test(doc)) {
    fail(`${docPath} must not set XFLOW_SHARED_SUPABASE_READ_MODE=shared`);
  }
  if (/XFLOW_SHARED_SUPABASE_FAIL_CLOSED=true/.test(doc)) {
    fail(`${docPath} must not set XFLOW_SHARED_SUPABASE_FAIL_CLOSED=true`);
  }
}

if (failures.length) {
  console.error("validate-supabase-phase8c-xflow-rollout: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("validate-supabase-phase8c-xflow-rollout: ok");
