#!/usr/bin/env node
import {
  REVIEWED_ADAPTER_MANIFEST,
  buildRunResult,
  isMissingEnvValue,
  loadLocalEnv,
  parseArgs,
  readState,
  targetBindingFor,
  validateStateTargetBinding,
  writeStateAtomic,
} from "./lib/provisioner-core.mjs";
import { resolveDatabaseUrl, validateDatabaseTargetIdentity } from "./lib/postgres-cli-store.mjs";
import { runDatabaseProvision } from "./validate-production-proof-fixtures-db.mjs";

const args = parseArgs(process.argv.slice(2));
const result = buildRunResult({ command: "provision", args });

if (!args.dryRun && result.ok) {
  if (!args.enableReviewedWriteAdapters) {
    result.ok = false;
    result.runtimeErrors.push("live database provision requires --enable-reviewed-write-adapters");
  }
}

if (!args.dryRun && result.ok) {
  const env = loadLocalEnv();
  const databaseUrl = resolveDatabaseUrl(env);
  const targetValidation = validateDatabaseTargetIdentity({ environment: args.environment, databaseUrl, env });
  const binding = targetBindingFor({ environment: args.environment, target: targetValidation.target });
  const stateErrors = validateStateTargetBinding({ state: readState(), binding });
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
  result.stateBinding = { ok: stateErrors.length === 0, errors: stateErrors, binding };
  if (targetValidation.errors.length || stateErrors.length) {
    result.ok = false;
    result.runtimeErrors.push(...targetValidation.errors, ...stateErrors);
  } else {
    result.productionGate.productionWritesEnabled = args.environment === "production";
    result.database = runDatabaseProvision({ databaseUrl, phase: "2F.5A" });
    writeStateAtomic({
      phase: "2F.5A",
      status: args.environment === "production" ? "PRODUCTION_FIXTURE_PROVISIONED" : "LOCAL_FIXTURE_PROVISIONED",
      updatedAt: new Date().toISOString(),
      resourcesCreated: true,
      productionMutation: args.environment === "production",
      targetBinding: binding,
      manifestVersion: REVIEWED_ADAPTER_MANIFEST.version,
      provision: result.database,
    });
  }
}

if (args.dryRun) {
  if (args.environment === "production") {
    const env = loadLocalEnv();
    const databaseUrl = resolveDatabaseUrl(env);
    if (!isMissingEnvValue(env.PHASE2F_DATABASE_URL)) {
      const targetValidation = validateDatabaseTargetIdentity({ environment: args.environment, databaseUrl, env });
      const binding = targetBindingFor({ environment: args.environment, target: targetValidation.target });
      const stateErrors = validateStateTargetBinding({ state: readState(), binding });
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
      result.stateBinding = { ok: stateErrors.length === 0, errors: stateErrors, binding };
    } else {
      result.targetValidation = {
        ok: false,
        target: null,
        errors: ["PHASE2F_DATABASE_URL is missing or requires private input"],
      };
      result.stateBinding = { ok: false, errors: ["target binding unavailable without PHASE2F_DATABASE_URL"] };
    }
  }
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
