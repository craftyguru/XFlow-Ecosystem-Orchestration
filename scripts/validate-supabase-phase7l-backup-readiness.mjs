#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const runbookPath = "docs/shared-supabase-phase7l-backup-execution-runbook.md";
const phase7kPath = "docs/shared-supabase-phase7k-pre-rollout-go-no-go.md";
const evidenceLogPath = "docs/shared-supabase-phase7b-evidence-log.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function lower(relativePath) {
  return read(relativePath).toLowerCase();
}

function runNodeScript(relativePath) {
  return execFileSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function parseTableRows(sectionText) {
  return sectionText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/^\|\s*-+/.test(line))
    .filter((line) => !/\|\s*app\s*\|/i.test(line) && !/\|\s*backup method\s*\|/i.test(line));
}

function cells(row) {
  return row.split("|").map((cell) => cell.trim()).filter(Boolean);
}

try {
  const phase7kOutput = runNodeScript("scripts/validate-supabase-phase7k-go-no-go.mjs");
  if (!/missingEvidence=\d+,\s*failedEvidence=0/i.test(phase7kOutput)) {
    fail(`Phase 7K validator output did not include expected evidence state: ${phase7kOutput}`);
  }
} catch (error) {
  fail(`Phase 7K validator failed: ${error.stderr || error.message}`);
}

if (!existsSync(path.join(repoRoot, phase7kPath))) {
  fail(`${phase7kPath} does not exist`);
} else {
  const phase7k = lower(phase7kPath);
  if (!phase7k.includes("production dual-write rollout | no-go") && !phase7k.includes("production dual-write rollout is not safe yet")) {
    fail(`${phase7kPath} must say production dual-write is NO-GO/not safe`);
  }
  if (!phase7k.includes("old supabase pause | no-go") && !phase7k.includes("old supabase projects are not safe to pause")) {
    fail(`${phase7kPath} must keep old Supabase pause NO-GO`);
  }
}

if (!existsSync(path.join(repoRoot, runbookPath))) {
  fail(`${runbookPath} does not exist`);
} else {
  const runbook = lower(runbookPath);
  for (const phrase of [
    "per-app export targets",
    "project ref verification",
    "pg_dump templates",
    "supabase dashboard export alternative",
    "storage bucket export checklist",
    "artifact layout",
    "shared supabase backup and restore drill",
    "restore drill target requirements",
    "evidence fields to fill",
    "production dual-write remains no-go",
    "old supabase projects remain no-go to pause",
  ]) {
    if (!runbook.includes(phrase)) fail(`${runbookPath} missing phrase: ${phrase}`);
  }

  for (const app of ["verixet", "xflow", "audaix", "rataify", "wordgeni", "crevux"]) {
    if (!runbook.includes(app)) fail(`${runbookPath} missing app: ${app}`);
  }
}

if (!existsSync(path.join(repoRoot, evidenceLogPath))) {
  fail(`${evidenceLogPath} does not exist`);
} else {
  const log = read(evidenceLogPath);
  const lowerLog = log.toLowerCase();
  if (!lowerLog.includes("old supabase projects remain unsafe to pause") && !lowerLog.includes("old supabase projects are not safe to pause")) {
    fail(`${evidenceLogPath} must keep old Supabase pause unsafe`);
  }

  const backupSectionMatch = log.match(/## A\. Old Supabase Backup\/Export Evidence\s+([\s\S]*?)\n## B\./);
  if (!backupSectionMatch) {
    fail(`${evidenceLogPath} missing old backup/export section`);
  } else {
    for (const row of parseTableRows(backupSectionMatch[1])) {
      const rowCells = cells(row);
      const app = rowCells[0] || "unknown";
      const timestamp = (rowCells[3] || "").toLowerCase();
      const artifact = (rowCells[4] || "").toLowerCase();
      const restoreTested = (rowCells[5] || "").toLowerCase();
      const owner = (rowCells[6] || "").toLowerCase();
      const result = (rowCells[7] || "").toLowerCase();
      if (result === "pass") {
        if (!timestamp || timestamp === "pending") fail(`${app} backup row is pass without timestamp`);
        if (!artifact || artifact.includes("pending")) fail(`${app} backup row is pass without artifact reference`);
        if (!owner || owner === "pending") fail(`${app} backup row is pass without owner initials`);
        if (restoreTested !== "yes" && restoreTested !== "no") fail(`${app} backup row has invalid restore-tested value`);
      }
    }
  }

  const sharedSectionMatch = log.match(/## B\. Shared Supabase Backup Verification\s+([\s\S]*?)\n## C\./);
  if (!sharedSectionMatch) {
    fail(`${evidenceLogPath} missing shared backup verification section`);
  } else {
    for (const row of parseTableRows(sharedSectionMatch[1])) {
      const rowCells = cells(row);
      const method = (rowCells[0] || "").toLowerCase();
      const target = (rowCells[1] || "").toLowerCase();
      const timestamp = (rowCells[2] || "").toLowerCase();
      const validation = (rowCells[3] || "").toLowerCase();
      const result = (rowCells[4] || "").toLowerCase();
      if (result === "pass") {
        if (!method || method.includes("pending")) fail("Shared backup row is pass without backup method");
        if (!target || target.includes("pending") || target.includes("still required")) fail("Shared backup row is pass without restore drill target");
        if (!timestamp || timestamp === "pending") fail("Shared backup row is pass without timestamp");
        if (!validation || validation.includes("pending")) fail("Shared backup row is pass without validation evidence");
      }
    }
  }
}

if (failures.length > 0) {
  console.error("validate-supabase-phase7l-backup-readiness: failed");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("validate-supabase-phase7l-backup-readiness: ok");
