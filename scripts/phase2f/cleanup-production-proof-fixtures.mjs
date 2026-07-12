#!/usr/bin/env node
import { buildRunResult, parseArgs, readState } from "./lib/provisioner-core.mjs";

const args = parseArgs(process.argv.slice(2));
const result = buildRunResult({ command: "cleanup", args });
result.state = readState();
result.cleanupMode = args.dryRun ? "plan-only" : "destructive-cleanup-disabled-until-approved";
result.cleanupSafety = [
  "record must have phase2f marker",
  "record must be linked to known proof workspace",
  "state-file id must match live record",
  "dependent non-test data must be absent",
];

if (!args.dryRun) {
  result.ok = false;
  result.runtimeErrors.push("destructive cleanup is disabled until fixture creation and cleanup are separately approved");
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || args.dryRun ? 0 : 1);
