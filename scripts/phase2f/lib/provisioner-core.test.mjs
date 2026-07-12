import test from "node:test";
import assert from "node:assert/strict";
import { buildPlan, parseEnvFile, redactResult, validatePlan, validateRuntime } from "./provisioner-core.mjs";

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
    { dryRun: false, environment: "staging", confirmProductionFixtures: false },
    {},
  );
  assert.ok(errors.includes("real execution requires --environment production"));
  assert.ok(errors.includes("real execution requires --confirm-production-fixtures"));
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
