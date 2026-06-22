#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const reportPath = "docs/shared-supabase-phase7k-pre-rollout-go-no-go.md";
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

function extractEvidenceCounts(output) {
  const match = output.match(/missingEvidence=(\d+),\s*failedEvidence=(\d+)(?:,\s*acceptedExceptions=(\d+))?/);
  if (!match) return null;
  return {
    missing: Number(match[1]),
    failed: Number(match[2]),
    acceptedExceptions: Number(match[3] ?? 0),
  };
}

let phase6bOutput = "";
try {
  phase6bOutput = runNodeScript("scripts/validate-supabase-phase6b-browser-flows.mjs");
  if (!/passed=6,\s*failed=0,\s*pending=0/i.test(phase6bOutput)) {
    fail(`Phase 6B validator did not report passed=6, failed=0, pending=0. Output: ${phase6bOutput}`);
  }
} catch (error) {
  fail(`Phase 6B validator failed: ${error.stderr || error.message}`);
}

let phase7bOutput = "";
let evidenceCounts = null;
try {
  phase7bOutput = runNodeScript("scripts/validate-supabase-phase7b-evidence.mjs");
  evidenceCounts = extractEvidenceCounts(phase7bOutput);
  if (!evidenceCounts) {
    fail(`Phase 7B validator output did not include evidence counts. Output: ${phase7bOutput}`);
  } else {
    if (evidenceCounts.missing > 0) fail(`Phase 7B missingEvidence must be 0 after accepted exceptions are recorded; got ${evidenceCounts.missing}`);
    if (evidenceCounts.failed !== 0) fail(`Phase 7B failedEvidence must be 0; got ${evidenceCounts.failed}`);
  }
} catch (error) {
  fail(`Phase 7B validator failed: ${error.stderr || error.message}`);
}

if (!existsSync(path.join(repoRoot, reportPath))) {
  fail(`${reportPath} does not exist`);
} else {
  const report = read(reportPath);
  const text = report.toLowerCase();

  for (const phrase of [
    "phase 6b browser/api proof",
    "passed=6",
    "failed=0",
    "pending=0",
    "missingevidence=0",
    "failedevidence=0",
    "acceptedexceptions=2",
    "storage proof",
    "provider/idempotency proof",
    "monitoring marker proof",
    "old db write-detection pre-rollout evidence",
    "production dual-write rollout is conditional go",
    "production shared-read cutover is not safe",
    "old supabase projects are not safe to pause",
    "read_mode=shared",
    "fail_closed=true",
    "legacy db remains the source of truth",
  ]) {
    if (!text.includes(phrase)) fail(`${reportPath} missing phrase: ${phrase}`);
  }

  const requiredExceptionRows = [
    "Crevux old Supabase backup/export",
    "Crevux rollback proof",
  ];

  for (const row of requiredExceptionRows) {
    if (!report.includes(row)) fail(`${reportPath} missing exception row: ${row}`);
  }

  if (/production dual-write rollout\s*\|\s*go/i.test(report) || /production dual-write rollout is safe/i.test(report)) {
    fail(`${reportPath} must not mark production dual-write fully safe`);
  }
  if (/production shared-read cutover\s*\|\s*go/i.test(report) || /shared-read cutover is safe/i.test(report)) {
    fail(`${reportPath} must not mark shared-read cutover safe`);
  }
  if (/old supabase pause\s*\|\s*go/i.test(report) || /old supabase projects are safe to pause/i.test(report)) {
    fail(`${reportPath} must not mark old Supabase pause safe`);
  }
  if (/recommend(?:s|ed)?\s+read_mode=shared/i.test(report) || /switch\s+read_mode=shared/i.test(report)) {
    fail(`${reportPath} must not recommend READ_MODE=shared`);
  }
  if (/recommend(?:s|ed)?\s+fail_closed=true/i.test(report) || /set\s+fail_closed=true/i.test(report)) {
    fail(`${reportPath} must not recommend FAIL_CLOSED=true`);
  }
}

if (failures.length > 0) {
  console.error("validate-supabase-phase7k-go-no-go: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(
  `validate-supabase-phase7k-go-no-go: ok (missingEvidence=${evidenceCounts?.missing ?? "unknown"}, failedEvidence=${evidenceCounts?.failed ?? "unknown"}; ${phase6bOutput})`,
);
