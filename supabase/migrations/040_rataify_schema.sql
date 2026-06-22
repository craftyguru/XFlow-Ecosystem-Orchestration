create schema if not exists rataify;

create table if not exists rataify.sites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'rataify' references core.ecosystem_apps(slug),
  url text not null,
  name text,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'rataify')
);

create table if not exists rataify.reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'rataify' references core.ecosystem_apps(slug),
  site_id uuid references rataify.sites(id) on delete cascade,
  rating numeric(3, 2),
  status text not null default 'new',
  created_by uuid references auth.users(id) on delete set null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'rataify')
);

create table if not exists rataify.issues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'rataify' references core.ecosystem_apps(slug),
  site_id uuid references rataify.sites(id) on delete cascade,
  severity text not null default 'info',
  title text not null,
  status text not null default 'open',
  created_by uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'rataify')
);

create table if not exists rataify.risk_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'rataify' references core.ecosystem_apps(slug),
  site_id uuid references rataify.sites(id) on delete set null,
  risk_type text not null,
  severity text not null default 'info',
  created_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'rataify')
);

create table if not exists rataify.evidence_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'rataify' references core.ecosystem_apps(slug),
  site_id uuid references rataify.sites(id) on delete set null,
  storage_path text,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'rataify')
);

create index if not exists rataify_sites_workspace_idx on rataify.sites (workspace_id, created_at desc);
create index if not exists rataify_reviews_workspace_idx on rataify.reviews (workspace_id, site_id, created_at desc);
create index if not exists rataify_issues_workspace_idx on rataify.issues (workspace_id, site_id, status);
create index if not exists rataify_risk_events_workspace_idx on rataify.risk_events (workspace_id, site_id, created_at desc);
create index if not exists rataify_evidence_items_workspace_idx on rataify.evidence_items (workspace_id, site_id, created_at desc);
