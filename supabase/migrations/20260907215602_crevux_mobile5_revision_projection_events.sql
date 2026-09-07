-- Idempotent receipt ledger for the legacy Railway transactional-outbox
-- projector. The receipt, immutable display-version assignment, and optional
-- CAS promotion commit atomically in the shared TEST database.

create table if not exists crevux.revision_projection_events (
  event_key text primary key,
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  root_source_asset_id uuid not null references crevux.assets(id) on delete restrict,
  asset_id uuid not null references crevux.assets(id) on delete restrict,
  generation_job_id uuid not null,
  captured_family_state_version integer
    check (captured_family_state_version is null or captured_family_state_version >= 0),
  created_at timestamptz not null default now()
);

create index if not exists crevux_revision_projection_events_family_idx
  on crevux.revision_projection_events
    (workspace_id, actor_user_id, root_source_asset_id, created_at desc);

alter table crevux.revision_projection_events enable row level security;

drop policy if exists crevux_revision_projection_events_service_write
  on crevux.revision_projection_events;
create policy crevux_revision_projection_events_service_write
  on crevux.revision_projection_events for all
  using (core.is_service_role()) with check (core.is_service_role());

revoke all on crevux.revision_projection_events from anon, authenticated;

-- Rollback before runtime activation only:
-- drop table if exists crevux.revision_projection_events;
