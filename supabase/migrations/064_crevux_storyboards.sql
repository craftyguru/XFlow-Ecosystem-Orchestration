-- Ecosystem-native Storyboards for CreVux.
-- Replaces the legacy standalone public.storyboards family for XFlow workspaces.
-- This migration intentionally does not remove blockUnmigratedEcosystemFeature and
-- does not alter legacy public.* Storyboards tables.

create table if not exists crevux.storyboards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  project_id uuid references crevux.projects(id) on delete set null,
  title text not null default 'Untitled storyboard',
  notes text,
  board_status text not null default 'draft',
  continuity_manifest jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (app_slug = 'crevux'),
  check (board_status in ('draft', 'in_review', 'approved', 'locked')),
  unique (id, workspace_id)
);

create table if not exists crevux.storyboard_sequences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  storyboard_id uuid not null,
  sort_index integer not null default 0,
  label text not null default 'Scene',
  objective text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (app_slug = 'crevux'),
  unique (id, workspace_id),
  foreign key (storyboard_id, workspace_id)
    references crevux.storyboards(id, workspace_id)
    on delete cascade
);

create table if not exists crevux.storyboard_panels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  storyboard_id uuid not null,
  sequence_id uuid,
  sort_index integer not null default 0,
  panel_text text not null default '',
  notes text,
  linked_asset_id uuid references crevux.assets(id) on delete set null,
  approved_asset_id uuid references crevux.assets(id) on delete set null,
  linked_generation_job_id uuid references crevux.generation_jobs(id) on delete set null,
  shot_metadata jsonb not null default '{}'::jsonb,
  shot_status text not null default 'draft',
  variant_group_id uuid,
  continuity_locks jsonb not null default '{}'::jsonb,
  continuity_state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (app_slug = 'crevux'),
  check (shot_status in ('draft', 'in_review', 'approved', 'locked')),
  unique (id, workspace_id),
  foreign key (storyboard_id, workspace_id)
    references crevux.storyboards(id, workspace_id)
    on delete cascade,
  foreign key (sequence_id)
    references crevux.storyboard_sequences(id)
    on delete set null
);

create table if not exists crevux.storyboard_comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  storyboard_id uuid not null,
  panel_id uuid,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (app_slug = 'crevux'),
  foreign key (storyboard_id, workspace_id)
    references crevux.storyboards(id, workspace_id)
    on delete cascade,
  foreign key (panel_id)
    references crevux.storyboard_panels(id)
    on delete cascade
);

create table if not exists crevux.storyboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  storyboard_id uuid not null,
  label text,
  branch_name text,
  parent_snapshot_id uuid,
  payload jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (app_slug = 'crevux'),
  foreign key (storyboard_id, workspace_id)
    references crevux.storyboards(id, workspace_id)
    on delete cascade,
  foreign key (parent_snapshot_id)
    references crevux.storyboard_snapshots(id)
    on delete set null,
  unique (id, workspace_id)
);

create index if not exists crevux_storyboards_workspace_updated_idx
  on crevux.storyboards (workspace_id, updated_at desc)
  where deleted_at is null;
create index if not exists crevux_storyboards_workspace_project_updated_idx
  on crevux.storyboards (workspace_id, project_id, updated_at desc)
  where deleted_at is null;
create index if not exists crevux_storyboards_created_by_updated_idx
  on crevux.storyboards (created_by, updated_at desc)
  where deleted_at is null;

create index if not exists crevux_storyboard_sequences_board_sort_idx
  on crevux.storyboard_sequences (workspace_id, storyboard_id, sort_index, id)
  where deleted_at is null;

create unique index if not exists crevux_storyboard_panels_board_sort_unique
  on crevux.storyboard_panels (storyboard_id, sort_index)
  where deleted_at is null;
create index if not exists crevux_storyboard_panels_workspace_board_sort_idx
  on crevux.storyboard_panels (workspace_id, storyboard_id, sort_index, id)
  where deleted_at is null;
create index if not exists crevux_storyboard_panels_linked_asset_idx
  on crevux.storyboard_panels (workspace_id, linked_asset_id)
  where linked_asset_id is not null and deleted_at is null;
create index if not exists crevux_storyboard_panels_approved_asset_idx
  on crevux.storyboard_panels (workspace_id, approved_asset_id)
  where approved_asset_id is not null and deleted_at is null;
create index if not exists crevux_storyboard_panels_generation_job_idx
  on crevux.storyboard_panels (workspace_id, linked_generation_job_id)
  where linked_generation_job_id is not null and deleted_at is null;

create index if not exists crevux_storyboard_comments_board_created_idx
  on crevux.storyboard_comments (workspace_id, storyboard_id, created_at desc)
  where deleted_at is null;
create index if not exists crevux_storyboard_comments_panel_created_idx
  on crevux.storyboard_comments (workspace_id, panel_id, created_at desc)
  where panel_id is not null and deleted_at is null;

create index if not exists crevux_storyboard_snapshots_board_created_idx
  on crevux.storyboard_snapshots (workspace_id, storyboard_id, created_at desc);

alter table crevux.storyboards enable row level security;
alter table crevux.storyboard_sequences enable row level security;
alter table crevux.storyboard_panels enable row level security;
alter table crevux.storyboard_comments enable row level security;
alter table crevux.storyboard_snapshots enable row level security;

alter table crevux.storyboards force row level security;
alter table crevux.storyboard_sequences force row level security;
alter table crevux.storyboard_panels force row level security;
alter table crevux.storyboard_comments force row level security;
alter table crevux.storyboard_snapshots force row level security;

drop policy if exists crevux_storyboards_select on crevux.storyboards;
create policy crevux_storyboards_select on crevux.storyboards for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_storyboards_service_write on crevux.storyboards;
create policy crevux_storyboards_service_write on crevux.storyboards for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_storyboard_sequences_select on crevux.storyboard_sequences;
create policy crevux_storyboard_sequences_select on crevux.storyboard_sequences for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_storyboard_sequences_service_write on crevux.storyboard_sequences;
create policy crevux_storyboard_sequences_service_write on crevux.storyboard_sequences for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_storyboard_panels_select on crevux.storyboard_panels;
create policy crevux_storyboard_panels_select on crevux.storyboard_panels for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_storyboard_panels_service_write on crevux.storyboard_panels;
create policy crevux_storyboard_panels_service_write on crevux.storyboard_panels for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_storyboard_comments_select on crevux.storyboard_comments;
create policy crevux_storyboard_comments_select on crevux.storyboard_comments for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_storyboard_comments_service_write on crevux.storyboard_comments;
create policy crevux_storyboard_comments_service_write on crevux.storyboard_comments for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_storyboard_snapshots_select on crevux.storyboard_snapshots;
create policy crevux_storyboard_snapshots_select on crevux.storyboard_snapshots for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_storyboard_snapshots_service_write on crevux.storyboard_snapshots;
create policy crevux_storyboard_snapshots_service_write on crevux.storyboard_snapshots for all to service_role
  using (true) with check (app_slug = 'crevux');

grant select on table
  crevux.storyboards,
  crevux.storyboard_sequences,
  crevux.storyboard_panels,
  crevux.storyboard_comments,
  crevux.storyboard_snapshots
to authenticated;

grant select, insert, update, delete on table
  crevux.storyboards,
  crevux.storyboard_sequences,
  crevux.storyboard_panels,
  crevux.storyboard_comments,
  crevux.storyboard_snapshots
to service_role;

revoke all on table
  crevux.storyboards,
  crevux.storyboard_sequences,
  crevux.storyboard_panels,
  crevux.storyboard_comments,
  crevux.storyboard_snapshots
from anon;
