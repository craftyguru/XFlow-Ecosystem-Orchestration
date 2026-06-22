create schema if not exists crevux;

create table if not exists crevux.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  name text not null,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create table if not exists crevux.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  project_id uuid references crevux.projects(id) on delete cascade,
  asset_type text not null,
  storage_path text,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create table if not exists crevux.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  project_id uuid references crevux.projects(id) on delete set null,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  request jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create table if not exists crevux.exports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  project_id uuid references crevux.projects(id) on delete cascade,
  storage_path text,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create table if not exists crevux.provider_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  generation_job_id uuid references crevux.generation_jobs(id) on delete cascade,
  provider text not null,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create table if not exists crevux.credit_spend_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'crevux' references core.ecosystem_apps(slug),
  generation_job_id uuid references crevux.generation_jobs(id) on delete set null,
  credits numeric(20, 6) not null,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'crevux')
);

create index if not exists crevux_projects_workspace_idx on crevux.projects (workspace_id, created_at desc);
create index if not exists crevux_assets_workspace_idx on crevux.assets (workspace_id, project_id, created_at desc);
create index if not exists crevux_generation_jobs_workspace_idx on crevux.generation_jobs (workspace_id, project_id, status);
create index if not exists crevux_exports_workspace_idx on crevux.exports (workspace_id, project_id, status);
create index if not exists crevux_provider_runs_workspace_idx on crevux.provider_runs (workspace_id, generation_job_id, created_at desc);
create index if not exists crevux_credit_spend_events_workspace_idx on crevux.credit_spend_events (workspace_id, generation_job_id, created_at desc);
