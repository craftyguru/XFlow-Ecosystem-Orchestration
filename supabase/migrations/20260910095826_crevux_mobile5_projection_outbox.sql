-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators restored between ledger statements.
-- Version: 20260910095826; name: crevux_mobile5_projection_outbox; statement-join MD5: 5b6feba20b503c9aa09a05319b1714f0

set lock_timeout='5s'; set statement_timeout='30s';
create table crevux.mobile_revision_projection_outbox (
  id bigserial primary key,event_key text not null,workspace_id uuid not null,actor_user_id uuid not null,
  root_source_asset_id uuid not null references crevux.assets(id) on delete restrict,
  asset_id uuid not null references crevux.assets(id) on delete restrict,
  generation_job_id uuid not null references crevux.generation_jobs(id) on delete restrict,
  captured_family_state_version integer,status text not null default 'pending',attempt_count integer not null default 0,
  available_at timestamptz not null default now(),last_error_code text,created_at timestamptz not null default now(),projected_at timestamptz,
  constraint crevux_mobile_revision_projection_outbox_status_check check (status in ('pending','projected','failed')),
  constraint crevux_mobile_revision_projection_outbox_attempt_count_check check (attempt_count >= 0),
  constraint crevux_mobile_revision_projection_outbox_state_version_check check (captured_family_state_version is null or captured_family_state_version >= 0)
);
create unique index crevux_mobile_revision_projection_outbox_event_uidx on crevux.mobile_revision_projection_outbox(event_key);
create index crevux_mobile_revision_projection_outbox_pending_idx on crevux.mobile_revision_projection_outbox(status,available_at,id) where status='pending';
alter table crevux.mobile_revision_projection_outbox enable row level security;
create policy crevux_mobile_revision_projection_outbox_service_write on crevux.mobile_revision_projection_outbox for all using (core.is_service_role()) with check (core.is_service_role());
revoke all on crevux.mobile_revision_projection_outbox from anon,authenticated;
revoke all on sequence crevux.mobile_revision_projection_outbox_id_seq from anon,authenticated;
grant select,insert,update,delete on crevux.mobile_revision_projection_outbox to service_role;
grant usage,select on sequence crevux.mobile_revision_projection_outbox_id_seq to service_role;

