#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/shared-supabase-phase8-production-dual-write-execution.md";
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

let phase7kOutput = "";
try {
  phase7kOutput = runNodeScript("scripts/validate-supabase-phase7k-go-no-go.mjs");
} catch (error) {
  fail(`Phase 7K validator failed: ${error.stderr || error.message}`);
}

const phase7kDocPath = "docs/shared-supabase-phase7k-pre-rollout-go-no-go.md";
if (!existsSync(path.join(repoRoot, phase7kDocPath))) {
  fail(`${phase7kDocPath} does not exist`);
}

if (!existsSync(path.join(repoRoot, docPath))) {
  fail(`${docPath} does not exist`);
} else {
  const doc = read(docPath);
  const lower = doc.toLowerCase();

  for (const phrase of [
    "phase 7k status: `conditional go`",
    "shared-read cutover: `no-go`",
    "old supabase pause: `no-go`",
    "accepted exceptions: `2`",
    "do not use `read_mode=shared`",
    "do not set `fail_closed=true`",
    "legacy db remains the source of truth",
    "production dual-write execution is ready for owner approval",
  ]) {
    if (!lower.includes(phrase.toLowerCase())) {
      fail(`${docPath} missing phrase: ${phrase}`);
    }
  }

  const order = [
    "1. verixet",
    "2. xflow",
    "3. audaix",
    "4. rataify",
    "5. wordgeni",
    "6. crevux",
  ];
  for (const item of order) {
    if (!lower.includes(item)) fail(`${docPath} missing rollout order item: ${item}`);
  }

  for (const app of ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"]) {
    if (!lower.includes(`### ${app}`)) fail(`${docPath} missing section for ${app}`);
  }

  const requiredPhrases = [
    "deploy/restart placeholder",
    "post-deploy smoke command",
    "shared supabase row verification",
    "legacy db verification",
    "monitoring checks",
    "rollback command/env reset",
    "abort conditions",
    "observation window checklist",
    "owner signoff fields",
    "crevux exception preservation for execution",
    "roles.sql export remains unavailable",
    "rollback proof remains blocked because the only known legacy target is production/unknown",
  ];

  for (const phrase of requiredPhrases) {
    if (!lower.includes(phrase)) fail(`${docPath} missing phrase: ${phrase}`);
  }

  if (/read_mode=shared/.test(doc) && /do not use `read_mode=shared`/i.test(doc) === false) {
    fail(`${docPath} must not recommend READ_MODE=shared`);
  }
  if (/fail_closed=true/.test(doc) && /do not set `fail_closed=true`/i.test(doc) === false) {
    fail(`${docPath} must not recommend FAIL_CLOSED=true`);
  }
}

if (existsSync(path.join(repoRoot, phase7kDocPath))) {
  const phase7kDoc = read(phase7kDocPath).toLowerCase();
  if (!phase7kDoc.includes("production dual-write rollout | conditional go")) {
    fail(`${phase7kDocPath} must keep production dual-write at CONDITIONAL GO`);
  }
  if (!phase7kDoc.includes("production shared-read cutover | no-go")) {
    fail(`${phase7kDocPath} must keep shared-read cutover at NO-GO`);
  }
  if (!phase7kDoc.includes("old supabase pause | no-go")) {
    fail(`${phase7kDocPath} must keep old Supabase pause at NO-GO`);
  }
}

if (failures.length) {
  console.error("validate-supabase-phase8-dual-write-plan: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(
  `validate-supabase-phase8-dual-write-plan: ok (${phase7kOutput})`,
);
