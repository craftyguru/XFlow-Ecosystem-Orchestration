#!/usr/bin/env node
import { buildRunResult, parseArgs, readState } from "./lib/provisioner-core.mjs";

const args = parseArgs(process.argv.slice(2));
const result = buildRunResult({ command: "verify", args });
result.state = readState();
result.verificationMode = args.dryRun ? "plan-only" : "live-verification-disabled-until-approved";

if (!args.dryRun) {
  result.ok = false;
  result.runtimeErrors.push("live fixture verification is disabled until production fixture creation is approved");
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || args.dryRun ? 0 : 1);
