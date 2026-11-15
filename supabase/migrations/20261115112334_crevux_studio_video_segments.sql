-- Durable, fail-closed segment recovery for Crevux Studio video jobs.
-- This migration adds no execution grant, customer entitlement, or public API.

alter table crevux.assets add column if not exists deleted_at timestamptz;
create index if not exists crevux_assets_active_workspace_idx
  on crevux.assets (workspace_id, project_id, created_at desc)
  where deleted_at is null;

create table crevux.studio_video_segments (
  id uuid primary key,
  generation_job_id uuid not null references crevux.generation_jobs(id) on delete restrict,
  workspace_id uuid not null,
  actor_user_id uuid not null,
  ordinal integer not null,
  state text not null default 'planned',
  strategy text not null,
  provider text not null,
  provider_external_id text,
  input_asset_id uuid references crevux.assets(id) on delete restrict,
  input_digest text,
  prompt_digest text not null,
  planned_duration_seconds integer not null,
  actual_duration_milliseconds integer,
  storage_path text,
  output_digest text,
  output_bytes bigint,
  continuation_frame_storage_path text,
  continuation_frame_digest text,
  provider_receipt jsonb,
  error_code text,
  attempt_count integer not null default 0,
  state_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (generation_job_id, ordinal),
  check (ordinal between 0 and 11),
  check (state in ('planned','dispatching','processing','persisted','accepted','failed','reconciliation_required')),
  check (strategy in ('native','native_extension','segmented')),
  check (planned_duration_seconds in (5,10)),
  check (input_digest is null or input_digest ~ '^[a-f0-9]{64}$'),
  check (prompt_digest ~ '^[a-f0-9]{64}$'),
  check (output_digest is null or output_digest ~ '^[a-f0-9]{64}$'),
  check (continuation_frame_digest is null or continuation_frame_digest ~ '^[a-f0-9]{64}$'),
  check ((continuation_frame_storage_path is null) = (continuation_frame_digest is null)),
  check (actual_duration_milliseconds is null or actual_duration_milliseconds > 0),
  check (output_bytes is null or output_bytes > 0),
  check (attempt_count between 0 and 1),
  check (state_version > 0),
  check (state='planned' or input_digest is not null),
  check ((state in ('persisted','accepted')) =
    (storage_path is not null and output_digest is not null and output_bytes is not null and actual_duration_milliseconds is not null))
);

create index studio_video_segments_scope_idx
  on crevux.studio_video_segments(workspace_id, actor_user_id, generation_job_id, ordinal);
create index studio_video_segments_recovery_idx
  on crevux.studio_video_segments(state, updated_at)
  where state in ('dispatching','processing','reconciliation_required');

create or replace function crevux.enforce_studio_video_segment_scope()
returns trigger language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare job crevux.generation_jobs%rowtype;
begin
  select * into job from crevux.generation_jobs where id=new.generation_job_id;
  if not found or job.workspace_id<>new.workspace_id or job.created_by<>new.actor_user_id or
     job.request->>'kind'<>'image_video' then
    raise exception 'STUDIO_VIDEO_SEGMENT_SCOPE_MISMATCH';
  end if;
  return new;
end $$;

create trigger studio_video_segments_scope_guard
before insert or update of generation_job_id,workspace_id,actor_user_id
on crevux.studio_video_segments for each row
execute function crevux.enforce_studio_video_segment_scope();

alter table crevux.studio_video_segments enable row level security;
revoke all on crevux.studio_video_segments from anon, authenticated;

comment on table crevux.studio_video_segments is
  'Private durable segment state for bounded Crevux video assembly; inaccessible to public Data API roles.';
