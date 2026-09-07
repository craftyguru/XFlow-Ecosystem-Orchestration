import fs from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  "supabase/migrations/20260907140000_crevux_mobile5_revision_families.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();
const failures = [];

for (const table of [
  "crevux.revision_family_states",
  "crevux.revision_family_versions",
  "crevux.revision_restore_events",
]) {
  if (!sql.includes(`create table if not exists ${table}`)) failures.push(`missing ${table}`);
  if (!sql.includes(`alter table ${table} enable row level security`)) failures.push(`missing RLS for ${table}`);
  if (!sql.includes(`revoke all on ${table} from anon, authenticated`)) failures.push(`missing direct-access revoke for ${table}`);
}

for (const fragment of [
  "primary key (workspace_id, actor_user_id, root_source_asset_id)",
  "unique (workspace_id, actor_user_id, root_source_asset_id, display_version)",
  "unique (workspace_id, actor_user_id, idempotency_key)",
  "expected_state_version integer not null",
  "resulting_state_version integer not null",
  "response_body jsonb not null",
  "on delete restrict",
  "core.is_service_role()",
]) {
  if (!sql.includes(fragment)) failures.push(`missing contract: ${fragment}`);
}

if (/create policy[^;]+to\s+(anon|authenticated)/s.test(sql)) {
  failures.push("revision tables must not grant direct anon/authenticated policies");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Crevux MOBILE-5 revision-family migration contract: PASS");
