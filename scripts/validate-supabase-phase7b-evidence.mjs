#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function lower(relativePath) {
  return read(relativePath).toLowerCase();
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
  runNodeScript("scripts/validate-supabase-production-rollout-packet.mjs");
} catch (error) {
  fail(`Production rollout packet validator failed: ${error.stderr || error.message}`);
}

try {
  runNodeScript("scripts/validate-supabase-phase7a-readiness.mjs");
} catch (error) {
  fail(`Phase 7A validator failed: ${error.stderr || error.message}`);
}

const captureDoc = "docs/shared-supabase-phase7b-evidence-capture.md";
const evidenceLog = "docs/shared-supabase-phase7b-evidence-log.md";

for (const doc of [captureDoc, evidenceLog]) {
  if (!exists(doc)) fail(`${doc} does not exist`);
}

if (exists(captureDoc)) {
  const capture = lower(captureDoc);
  for (const phrase of [
    "production dual-write rollout is not safe yet",
    "production cutover remains unsafe",
    "old supabase projects remain unsafe to pause",
    "old supabase backup/export evidence",
    "shared supabase backup verification",
    "monitoring/alerts evidence",
    "rollback rehearsal evidence",
    "old db write detection evidence",
    "storage proof evidence",
    "provider callback/idempotency evidence",
    "stripe test billing/webhook evidence",
  ]) {
    if (!capture.includes(phrase)) fail(`${captureDoc} missing phrase: ${phrase}`);
  }
}

let missingEvidenceCount = 0;
let failedEvidenceCount = 0;
let acceptedExceptionCount = 0;

if (exists(evidenceLog)) {
  const log = read(evidenceLog);
  const logLower = log.toLowerCase();
  const requiredSections = [
    "## a. old supabase backup/export evidence",
    "## b. shared supabase backup verification",
    "## c. monitoring/alerts evidence",
    "## d. rollback rehearsal evidence",
    "## e. old db write detection evidence",
    "## f. storage proof evidence",
    "## g. provider callback/idempotency evidence",
    "## h. stripe test billing/webhook evidence",
  ];

  for (const section of requiredSections) {
    if (!logLower.includes(section)) fail(`${evidenceLog} missing section: ${section}`);
  }

  for (const app of ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"]) {
    if (!logLower.includes(app)) fail(`${evidenceLog} missing app evidence row for ${app}`);
  }

  if (!logLower.includes("production dual-write rollout is not safe yet")) {
    fail(`${evidenceLog} must keep production dual-write marked unsafe`);
  }
  if (!logLower.includes("old supabase projects are not safe to pause")) {
    fail(`${evidenceLog} must keep old Supabase pause marked unsafe`);
  }

  const tableRows = log
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/^\|\s*-+/.test(line) && !/\|\s*app\s*\|/i.test(line) && !/\|\s*signal\s*\|/i.test(line) && !/\|\s*backup method\s*\|/i.test(line) && !/\|\s*verixet checkout/i.test(line) && !/\|\s*app\/provider\s*\|/i.test(line));

  for (const row of tableRows) {
    const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
    const result = (cells[cells.length - 1] || "").toLowerCase();
    if (result === "pending" || result === "no" || result === "") missingEvidenceCount += 1;
    if (result === "fail") failedEvidenceCount += 1;
    if (result === "accepted_exception") acceptedExceptionCount += 1;
  }

  const marksProductionSafe = /production dual-write rollout is safe|production cutover is safe|production rollout safe/i.test(log)
    && !/not safe|unsafe/i.test(log);
  if (marksProductionSafe && (missingEvidenceCount > 0 || failedEvidenceCount > 0)) {
    fail(`${evidenceLog} appears to mark production safe while required evidence is missing`);
  }
}

if (failures.length) {
  console.error("validate-supabase-phase7b-evidence: failed");
  for (const message of failures) console.error(`- ${message}`);
  console.error(`missingEvidence=${missingEvidenceCount}, failedEvidence=${failedEvidenceCount}, acceptedExceptions=${acceptedExceptionCount}`);
  process.exit(1);
}

console.log(`validate-supabase-phase7b-evidence: ok (missingEvidence=${missingEvidenceCount}, failedEvidence=${failedEvidenceCount}, acceptedExceptions=${acceptedExceptionCount}; ${phase6bOutput})`);
