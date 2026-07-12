import test from "node:test";
import assert from "node:assert/strict";
import {
  REVIEWED_ADAPTER_MANIFEST,
  REQUIRED_PRODUCTION_ENV,
  buildPlan,
  parseEnvFile,
  redactResult,
  targetBindingFor,
  validatePlan,
  validateProviderBillingGuard,
  validateRuntime,
  validateStateTargetBinding,
} from "./provisioner-core.mjs";
import { validateDatabaseTargetIdentity } from "./postgres-cli-store.mjs";
import { adapters } from "../adapters/index.mjs";
import { buildContext, runAdapters, runLocalValidation, validateAdapterInterface } from "./adapter-runner.mjs";
import { MemoryFixtureStore } from "./fixture-store.mjs";

test("buildPlan produces schema-aware operations with cleanup rules", () => {
  const plan = buildPlan({ includeOptional: true });
  assert.equal(validatePlan(plan).length, 0);
  assert.ok(plan.operations.length >= 10);
  for (const operation of plan.operations) {
    assert.ok(operation.deterministicKey);
    assert.ok(operation.preconditions.length > 0);
    assert.ok(operation.idempotencyRule);
    assert.ok(operation.verification);
    assert.ok(operation.cleanup);
    assert.ok(operation.costControls.length > 0);
    assert.ok(operation.schemaEvidence.length > 0);
  }
});

test("validateRuntime requires explicit production acknowledgement for writes", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: false, enableReviewedWriteAdapters: false },
    {},
  );
  assert.ok(errors.includes("real execution requires --confirm-production-fixtures"));
  assert.ok(errors.includes("real execution requires --enable-reviewed-write-adapters"));
  assert.ok(errors.some((error) => error.includes("PHASE2F_STANDARD_EMAIL")));
});

function fullProductionEnv(overrides = {}) {
  return {
    PHASE2F_STANDARD_EMAIL: "standard@example.invalid",
    PHASE2F_STANDARD_PASSWORD: "placeholder",
    PHASE2F_DENIED_EMAIL: "denied@example.invalid",
    PHASE2F_DENIED_PASSWORD: "placeholder",
    PHASE2F_OUTSIDER_EMAIL: "outsider@example.invalid",
    PHASE2F_OUTSIDER_PASSWORD: "placeholder",
    PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-main",
    PHASE2F_DATABASE_URL: "postgresql://user:pass@db.expected-ref.supabase.co:5432/postgres",
    PHASE2F_EXPECTED_PROJECT_REF: "expected-ref",
    PHASE2F_EXPECTED_DB_HOST: "db.expected-ref.supabase.co",
    PHASE2F_EXPECTED_DB_NAME: "postgres",
    PHASE2F_EXPECTED_ENVIRONMENT_NAME: "production",
    PHASE2F_REVIEWED_MANIFEST_VERSION: REVIEWED_ADAPTER_MANIFEST.version,
    ...overrides,
  };
}

test("production gate refuses missing reviewed adapter flag", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: true, enableReviewedWriteAdapters: false },
    fullProductionEnv(),
  );
  assert.ok(errors.includes("real execution requires --enable-reviewed-write-adapters"));
});

test("production gate refuses missing production confirmation", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: false, enableReviewedWriteAdapters: true },
    fullProductionEnv(),
  );
  assert.ok(errors.includes("real execution requires --confirm-production-fixtures"));
});

test("production gate refuses missing or wrong manifest version", () => {
  const env = fullProductionEnv({ PHASE2F_REVIEWED_MANIFEST_VERSION: "wrong" });
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: true, enableReviewedWriteAdapters: true },
    env,
  );
  assert.ok(errors.some((error) => error.includes("reviewed manifest version")));
});

test("production gate refuses missing credentials and target vars", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: true, enableReviewedWriteAdapters: true },
    {},
  );
  for (const key of REQUIRED_PRODUCTION_ENV) {
    assert.ok(errors.some((error) => error.includes(key)), `expected missing ${key}`);
  }
});

test("production gate refuses template placeholder values", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: true, enableReviewedWriteAdapters: true },
    fullProductionEnv({
      PHASE2F_STANDARD_PASSWORD: "REQUIRES_PRIVATE_INPUT",
      PHASE2F_DATABASE_URL: "replace_me",
    }),
  );
  assert.ok(errors.some((error) => error.includes("PHASE2F_STANDARD_PASSWORD")));
  assert.ok(errors.some((error) => error.includes("PHASE2F_DATABASE_URL")));
});

test("target validation refuses mismatch and localhost production", () => {
  const mismatch = validateDatabaseTargetIdentity({
    environment: "production",
    databaseUrl: "postgresql://user:pass@localhost:5432/postgres",
    env: fullProductionEnv(),
  });
  assert.ok(mismatch.errors.some((error) => error.includes("localhost")));
  assert.ok(mismatch.errors.some((error) => error.toLowerCase().includes("project")));
});

test("state binding refuses mismatched target", () => {
  const binding = targetBindingFor({
    environment: "production",
    target: { hostname: "db.expected-ref.supabase.co", port: "5432", database: "postgres" },
  });
  const errors = validateStateTargetBinding({
    state: { targetBinding: { ...binding, targetHash: "different" } },
    binding,
  });
  assert.ok(errors.some((error) => error.includes("targetHash")));
});

test("provider and billing guard detects prohibited operations", () => {
  const plan = buildPlan();
  assert.deepEqual(validateProviderBillingGuard(plan), []);
  const unsafe = { ...plan, operations: [{ ...plan.operations[0], action: "create Stripe customer" }] };
  assert.ok(validateProviderBillingGuard(unsafe).some((error) => error.includes("prohibited operation")));
});

test("all production runtime gates allow proceeding to target validation boundary", () => {
  const errors = validateRuntime(
    { dryRun: false, environment: "production", confirmProductionFixtures: true, enableReviewedWriteAdapters: true },
    fullProductionEnv(),
  );
  assert.deepEqual(errors, []);
});

test("dry-run runtime validation does not require credentials", () => {
  assert.deepEqual(validateRuntime({ dryRun: true, environment: "dry-run", confirmProductionFixtures: false }, {}), []);
});

test("parseEnvFile reads keys without printing values", () => {
  const env = parseEnvFile("PHASE2F_STANDARD_EMAIL='test@example.invalid'\nPHASE2F_STANDARD_PASSWORD=\"secret\"\n");
  assert.equal(env.PHASE2F_STANDARD_EMAIL, "test@example.invalid");
  assert.equal(env.PHASE2F_STANDARD_PASSWORD, "secret");
});

test("redactResult redacts secret-shaped keys", () => {
  const redacted = redactResult({ apiSecret: "placeholder", nested: { serviceRoleKey: "placeholder" }, safe: "ok" });
  assert.equal(redacted.apiSecret, "[REDACTED]");
  assert.equal(redacted.nested.serviceRoleKey, "[REDACTED]");
  assert.equal(redacted.safe, "ok");
});

test("all write adapters expose the required interface", () => {
  assert.deepEqual(validateAdapterInterface(adapters), []);
});

test("local validation provisions, reuses, verifies, and cleans up fixtures", async () => {
  const result = await runLocalValidation({
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, enableReviewedWriteAdapters: true, includeOptional: false },
    env: { PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-local-validation" },
  });
  assert.equal(result.ok, true);
  assert.ok(result.firstProvision.created > 0);
  assert.equal(result.secondProvision.created, 0);
  assert.ok(result.secondProvision.reused > 0);
  assert.ok(result.cleanup.deleted > 0);
  assert.equal(result.unrelatedRowsUnchanged, true);
});

test("adapters refuse to reuse non-test collisions", async () => {
  const store = new MemoryFixtureStore({
    "xflow.workspaces": [{ id: "real-workspace", slug: "ecosystem-production-proof-local-validation", name: "Real Workspace", metadata: {} }],
  });
  const context = buildContext({
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, enableReviewedWriteAdapters: true, includeOptional: false },
    store,
    env: { PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-local-validation" },
  });
  await assert.rejects(() => runAdapters(context, "provision"), /refusing to reuse unmarked row/);
});

test("cleanup preserves reused fixtures", async () => {
  const context = buildContext({
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, enableReviewedWriteAdapters: true, includeOptional: false },
    env: { PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-local-validation" },
  });
  await runAdapters(context, "provision");
  await runAdapters(context, "cleanup");
  assert.equal(context.store.findMany("auth.identities", () => true).length, 0);
});
