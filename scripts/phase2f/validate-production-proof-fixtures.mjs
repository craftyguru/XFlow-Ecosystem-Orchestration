#!/usr/bin/env node
import { parseArgs, redactResult, writeStateAtomic } from "./lib/provisioner-core.mjs";
import { runLocalValidation } from "./lib/adapter-runner.mjs";

const args = parseArgs(process.argv.slice(2));
const result = await runLocalValidation({ args });
writeStateAtomic({
  phase: "2F.4",
  status: result.ok ? "LOCAL_VALIDATION_PASSED" : "LOCAL_VALIDATION_FAILED",
  updatedAt: new Date().toISOString(),
  resourcesCreated: false,
  productionMutation: false,
  validation: result,
});
console.log(JSON.stringify(redactResult(result), null, 2));
process.exit(result.ok ? 0 : 1);
