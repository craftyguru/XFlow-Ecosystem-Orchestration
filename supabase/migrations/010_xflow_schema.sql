create schema if not exists xflow;

create table if not exists xflow.runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'xflow' references core.ecosystem_apps(slug),
  name text,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'xflow')
);

create table if not exists xflow.control_plane_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'xflow' references core.ecosystem_apps(slug),
  event_type text not null,
  source_app_slug text references core.ecosystem_apps(slug),
  created_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'xflow')
);

create table if not exists xflow.app_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'xflow' references core.ecosystem_apps(slug),
  target_app_slug text not null references core.ecosystem_apps(slug),
  status text not null default 'pending',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'xflow')
);

create table if not exists xflow.deployment_checks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'xflow' references core.ecosystem_apps(slug),
  target_app_slug text references core.ecosystem_apps(slug),
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'xflow')
);

create table if not exists xflow.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'xflow' references core.ecosystem_apps(slug),
  workflow_key text not null,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'xflow')
);

create index if not exists xflow_runs_workspace_idx on xflow.runs (workspace_id, created_at desc);
create index if not exists xflow_control_plane_events_workspace_idx on xflow.control_plane_events (workspace_id, created_at desc);
create index if not exists xflow_app_links_workspace_idx on xflow.app_links (workspace_id, target_app_slug);
create index if not exists xflow_deployment_checks_workspace_idx on xflow.deployment_checks (workspace_id, target_app_slug, created_at desc);
create index if not exists xflow_workflow_runs_workspace_idx on xflow.workflow_runs (workspace_id, workflow_key, created_at desc);
