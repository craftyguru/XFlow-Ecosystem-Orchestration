import test from "node:test";
import assert from "node:assert/strict";
import { buildPlan, parseEnvFile, redactResult, validatePlan, validateRuntime } from "./provisioner-core.mjs";
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
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, includeOptional: false },
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
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, includeOptional: false },
    store,
    env: { PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-local-validation" },
  });
  await assert.rejects(() => runAdapters(context, "provision"), /refusing to reuse unmarked row/);
});

test("cleanup preserves reused fixtures", async () => {
  const context = buildContext({
    args: { dryRun: false, environment: "local", confirmTestFixtures: true, includeOptional: false },
    env: { PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-local-validation" },
  });
  await runAdapters(context, "provision");
  await runAdapters(context, "cleanup");
  assert.equal(context.store.findMany("auth.identities", () => true).length, 0);
});
