#!/usr/bin/env node
import { buildRunResult, parseArgs, writeStateAtomic } from "./lib/provisioner-core.mjs";

const args = parseArgs(process.argv.slice(2));
const result = buildRunResult({ command: "provision", args });

if (!args.dryRun && result.ok) {
  result.ok = false;
  result.runtimeErrors.push("production DB writes are intentionally disabled until the app-specific write adapter is reviewed and approved");
}

if (args.dryRun) {
  writeStateAtomic({
    phase: "2F.3",
    status: "DRY_RUN_ONLY",
    updatedAt: new Date().toISOString(),
    operationCount: result.plan.operations.length,
    resourcesCreated: false,
    productionMutation: false,
  });
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || args.dryRun ? 0 : 1);
