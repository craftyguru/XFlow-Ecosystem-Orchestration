#!/usr/bin/env node
import {
  buildRunResult,
  loadLocalEnv,
  parseArgs,
  readState,
  targetBindingFor,
  validateStateTargetBinding,
} from "./lib/provisioner-core.mjs";
import { resolveDatabaseUrl, validateDatabaseTargetIdentity } from "./lib/postgres-cli-store.mjs";
import { runDatabaseVerify } from "./validate-production-proof-fixtures-db.mjs";

const args = parseArgs(process.argv.slice(2));
const result = buildRunResult({ command: "verify", args });
const state = readState();
result.state = state;
result.verificationMode = args.dryRun ? "plan-only" : "live-verification-disabled-until-approved";

if (!args.dryRun && result.ok && !args.enableReviewedWriteAdapters) {
  result.ok = false;
  result.runtimeErrors.push("live database verification requires --enable-reviewed-write-adapters");
}

if (!args.dryRun && result.ok) {
  const env = loadLocalEnv();
  const databaseUrl = resolveDatabaseUrl(env);
  const targetValidation = validateDatabaseTargetIdentity({ environment: args.environment, databaseUrl, env });
  const binding = targetBindingFor({ environment: args.environment, target: targetValidation.target });
  const stateErrors = validateStateTargetBinding({ state, binding });
  result.targetValidation = {
    ok: targetValidation.errors.length === 0,
    target: {
      hostname: targetValidation.target.isLocalhost ? targetValidation.target.hostname : "[REDACTED]",
      port: targetValidation.target.port,
      database: targetValidation.target.database,
      isLocalhost: targetValidation.target.isLocalhost,
    },
    errors: targetValidation.errors,
  };
  result.stateBinding = {
    ok: stateErrors.length === 0,
    binding,
    errors: stateErrors,
  };
  if (targetValidation.errors.length) {
    result.ok = false;
    result.runtimeErrors.push(...targetValidation.errors);
  } else if (stateErrors.length) {
    result.ok = false;
    result.runtimeErrors.push(...stateErrors);
  } else {
    result.verificationMode = "live-postgresql";
    result.database = runDatabaseVerify({ databaseUrl, phase: "2F.5A" });
  }
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || args.dryRun ? 0 : 1);
