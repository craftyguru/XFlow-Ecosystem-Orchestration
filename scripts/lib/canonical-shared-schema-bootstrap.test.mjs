import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  assertStrictMigrationOrder,
  buildDisposableSupabaseConfig,
  journalThroughTag,
  redactCommandOutput,
} from "./canonical-shared-schema-bootstrap.mjs";

const root = path.resolve(import.meta.dirname, "..", "..");

test("migration order rejects non-canonical input", () => {
  assert.doesNotThrow(() => assertStrictMigrationOrder(["001_a.sql", "002_b.sql"], "test"));
  assert.throws(() => assertStrictMigrationOrder(["002_b.sql", "001_a.sql"], "test"), /strict filename order/);
});

test("0051 fixture truncates without mutating the source journal", () => {
  const source = { version: "7", entries: [{ tag: "0050_a" }, { tag: "0051_agent_findings" }, { tag: "0052_b" }] };
  const partial = journalThroughTag(source, "0051_agent_findings");
  assert.deepEqual(partial.entries.map((entry) => entry.tag), ["0050_a", "0051_agent_findings"]);
  assert.equal(source.entries.length, 3);
});

test("disposable config binds an isolated local stack and disables hosted-only surfaces", () => {
  const config = buildDisposableSupabaseConfig({ projectId: "proof", ports: [1, 2, 3, 4, 5, 6] });
  assert.match(config, /project_id = "proof"/);
  assert.match(config, /\[auth\][\s\S]*enabled = true/);
  assert.match(config, /\[studio\][\s\S]*enabled = false/);
  assert.match(config, /\[analytics\][\s\S]*enabled = false/);
});

test("command output redacts database URLs and local JWTs", () => {
  const output = redactCommandOutput("postgresql://user:pass@host/db eyJabc.def.ghi");
  assert.equal(output, "[REDACTED_DATABASE_URL] [REDACTED_LOCAL_JWT]");
});

test("the private RLS helper prerequisite precedes the storyboard policy migration", () => {
  const migrations = fs.readdirSync(path.join(root, "supabase", "migrations")).sort();
  const prerequisite = migrations.indexOf("063_private_rls_helpers.sql");
  const consumer = migrations.indexOf("064_crevux_storyboards.sql");
  assert.ok(prerequisite >= 0 && consumer >= 0 && prerequisite < consumer);
  const sql = fs.readFileSync(
    path.join(root, "supabase", "migrations", "063_private_rls_helpers.sql"),
    "utf8",
  );
  assert.match(sql, /create or replace function private\.has_workspace_app_access/);
  assert.match(sql, /security definer[\s\S]*auth\.uid\(\)/);
  assert.match(sql, /revoke all on function private\.has_workspace_app_access\(uuid, text\) from public, anon/);
});

test("shared-schema helper functions have an immutable search path", () => {
  const migrations = fs.readdirSync(path.join(root, "supabase", "migrations")).sort();
  const migrationName = migrations.find((name) => name.endsWith("_harden_shared_function_search_paths.sql"));
  assert.ok(migrationName, "expected the forward-only function hardening migration");

  const sql = fs.readFileSync(path.join(root, "supabase", "migrations", migrationName), "utf8");
  for (const signature of [
    "core.current_user_id()",
    "core.is_service_role()",
    "core.set_updated_at()",
  ]) {
    assert.match(sql, new RegExp(`alter function ${signature.replace(/[().]/g, "\\$&")}\\s+set search_path = pg_catalog`, "i"));
  }
});
