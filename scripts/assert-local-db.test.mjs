import test from "node:test";
import assert from "node:assert/strict";
import { classifyDatabaseUrl, assertLocalDatabaseUrl } from "./assert-local-db.mjs";

test("allows loopback Postgres URLs", () => {
  assert.equal(classifyDatabaseUrl("postgresql://postgres:postgres@localhost:5432/xflow_nav_qa").ok, true);
  assert.equal(classifyDatabaseUrl("postgres://postgres:postgres@127.0.0.1:5433/rataify_nav_qa").ok, true);
});

test("allows single-label Docker service hosts", () => {
  assert.equal(classifyDatabaseUrl("postgresql://postgres:postgres@postgres:5432/crevux_nav_qa").ok, true);
  assert.equal(classifyDatabaseUrl("postgresql://postgres:postgres@verixet-postgres:5432/verixet_nav_qa").ok, true);
});

test("refuses hosted database URLs", () => {
  for (const url of [
    "postgresql://user:pass@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    "postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/app",
    "postgresql://user:pass@containers-us-west-1.railway.app:1234/railway",
    "postgresql://user:pass@app-db.abc123.us-east-1.rds.amazonaws.com:5432/app",
  ]) {
    const result = classifyDatabaseUrl(url);
    assert.equal(result.ok, false, url);
    assert.equal(result.reason, "hosted_url", url);
  }
});

test("refuses non-local dotted hosts", () => {
  const result = classifyDatabaseUrl("postgresql://user:pass@db.internal.example:5432/app");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "not_local");
});

test("throws without exposing credentials", () => {
  assert.throws(
    () => assertLocalDatabaseUrl("postgresql://secret_user:secret_pass@aws-1-us-east-1.pooler.supabase.com:5432/postgres"),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /pooler\.supabase\.com/);
      assert.doesNotMatch(error.message, /secret_user|secret_pass/);
      return true;
    },
  );
});
