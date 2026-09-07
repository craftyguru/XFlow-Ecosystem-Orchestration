create table if not exists crevux.revision_family_states (
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  root_source_asset_id uuid not null references crevux.assets(id) on delete restrict,
  current_asset_id uuid not null references crevux.assets(id) on delete restrict,
  state_version integer not null default 1 check (state_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, actor_user_id, root_source_asset_id)
);

create table if not exists crevux.revision_family_versions (
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  root_source_asset_id uuid not null references crevux.assets(id) on delete restrict,
  asset_id uuid not null references crevux.assets(id) on delete restrict,
  display_version integer not null check (display_version >= 0),
  assigned_at timestamptz not null default now(),
  primary key (workspace_id, actor_user_id, root_source_asset_id, asset_id),
  unique (workspace_id, actor_user_id, root_source_asset_id, display_version)
);

create table if not exists crevux.revision_restore_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  root_source_asset_id uuid not null references crevux.assets(id) on delete restrict,
  from_asset_id uuid not null references crevux.assets(id) on delete restrict,
  to_asset_id uuid not null references crevux.assets(id) on delete restrict,
  expected_state_version integer not null check (expected_state_version >= 0),
  resulting_state_version integer not null check (resulting_state_version > 0),
  idempotency_key text not null check (length(idempotency_key) between 8 and 128),
  request_hash text not null,
  response_body jsonb not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, actor_user_id, idempotency_key)
);

-- Existing TEST families are assigned only by mobile5:bootstrap-revision-families after
-- the same bounded lineage validator used by the API accepts the entire family.
-- The migration deliberately does not legitimize raw JSON metadata by itself.

create index if not exists crevux_revision_family_states_current_idx
  on crevux.revision_family_states (workspace_id, actor_user_id, current_asset_id);
create index if not exists crevux_revision_family_states_activity_idx
  on crevux.revision_family_states (workspace_id, actor_user_id, updated_at desc, root_source_asset_id desc);
create index if not exists crevux_revision_family_versions_asset_idx
  on crevux.revision_family_versions (workspace_id, actor_user_id, asset_id);
create index if not exists crevux_revision_restore_events_family_idx
  on crevux.revision_restore_events (workspace_id, actor_user_id, root_source_asset_id, created_at desc);

alter table crevux.revision_family_states enable row level security;
alter table crevux.revision_family_versions enable row level security;
alter table crevux.revision_restore_events enable row level security;

drop policy if exists crevux_revision_family_states_service_write on crevux.revision_family_states;
create policy crevux_revision_family_states_service_write on crevux.revision_family_states for all
  using (core.is_service_role()) with check (core.is_service_role());
drop policy if exists crevux_revision_family_versions_service_write on crevux.revision_family_versions;
create policy crevux_revision_family_versions_service_write on crevux.revision_family_versions for all
  using (core.is_service_role()) with check (core.is_service_role());
drop policy if exists crevux_revision_restore_events_service_write on crevux.revision_restore_events;
create policy crevux_revision_restore_events_service_write on crevux.revision_restore_events for all
  using (core.is_service_role()) with check (core.is_service_role());

revoke all on crevux.revision_family_states from anon, authenticated;
revoke all on crevux.revision_family_versions from anon, authenticated;
revoke all on crevux.revision_restore_events from anon, authenticated;
