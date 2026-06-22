create schema if not exists audaix;

create table if not exists audaix.audits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'audaix' references core.ecosystem_apps(slug),
  target_url text,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'audaix')
);

create table if not exists audaix.audit_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'audaix' references core.ecosystem_apps(slug),
  audit_id uuid references audaix.audits(id) on delete cascade,
  status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'audaix')
);

create table if not exists audaix.monitors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'audaix' references core.ecosystem_apps(slug),
  target_url text not null,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'audaix')
);

create table if not exists audaix.audit_findings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'audaix' references core.ecosystem_apps(slug),
  audit_id uuid references audaix.audits(id) on delete cascade,
  severity text not null default 'info',
  title text not null,
  created_by uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'audaix')
);

create table if not exists audaix.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'audaix' references core.ecosystem_apps(slug),
  audit_id uuid references audaix.audits(id) on delete set null,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'audaix')
);

create index if not exists audaix_audits_workspace_idx on audaix.audits (workspace_id, created_at desc);
create index if not exists audaix_audit_reports_workspace_idx on audaix.audit_reports (workspace_id, audit_id);
create index if not exists audaix_monitors_workspace_idx on audaix.monitors (workspace_id, status);
create index if not exists audaix_audit_findings_workspace_idx on audaix.audit_findings (workspace_id, audit_id, severity);
create index if not exists audaix_scan_jobs_workspace_idx on audaix.scan_jobs (workspace_id, status, created_at desc);
