-- Shared ecosystem core schema.
-- Phase 1 only: creates the shared source-of-truth tables. Runtime app code is not
-- changed by this migration pack.

create extension if not exists "pgcrypto";

create schema if not exists core;

create or replace function core.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists core.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  primary_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists core.ecosystem_apps (
  slug text primary key,
  display_name text not null,
  authority_role text not null,
  owns_billing boolean not null default false,
  owns_entitlements boolean not null default false,
  owns_usage_metering boolean not null default false,
  owns_control_plane boolean not null default false,
  status text not null default 'active' check (status in ('active', 'disabled', 'planned')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.workspace_app_access (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null references core.ecosystem_apps(slug) on delete restrict,
  status text not null default 'active' check (status in ('active', 'disabled', 'trialing', 'pending')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, app_slug)
);

create table if not exists core.app_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null references core.ecosystem_apps(slug) on delete restrict,
  connected_app_slug text not null references core.ecosystem_apps(slug) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked', 'failed')),
  connection_kind text not null default 'service',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, app_slug, connected_app_slug, connection_kind)
);

create table if not exists core.entitlements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null references core.ecosystem_apps(slug) on delete restrict,
  feature_key text not null,
  decision text not null check (decision in ('allow', 'deny', 'meter', 'trial')),
  source text not null default 'verixet',
  reason text,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, app_slug, feature_key)
);

create table if not exists core.usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null references core.ecosystem_apps(slug) on delete restrict,
  feature_key text not null,
  quantity numeric(20, 6) not null default 1,
  unit text not null default 'event',
  idempotency_key text,
  source text not null default 'app_server',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, app_slug, idempotency_key)
);

create table if not exists core.billing_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references core.workspaces(id) on delete set null,
  app_slug text references core.ecosystem_apps(slug) on delete restrict,
  provider text not null default 'stripe',
  provider_event_id text,
  event_type text not null,
  authority text not null default 'verixet',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists core.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references core.workspaces(id) on delete set null,
  app_slug text references core.ecosystem_apps(slug) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  severity text not null default 'info' check (severity in ('debug', 'info', 'warn', 'error', 'critical')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists core_workspace_members_user_idx on core.workspace_members (user_id, status);
create index if not exists core_workspace_app_access_lookup_idx on core.workspace_app_access (workspace_id, app_slug, status);
create index if not exists core_app_connections_workspace_idx on core.app_connections (workspace_id, app_slug, status);
create index if not exists core_entitlements_lookup_idx on core.entitlements (workspace_id, app_slug, feature_key, decision);
create index if not exists core_usage_events_workspace_idx on core.usage_events (workspace_id, app_slug, created_at desc);
create index if not exists core_billing_events_workspace_idx on core.billing_events (workspace_id, created_at desc);
create index if not exists core_audit_logs_workspace_idx on core.audit_logs (workspace_id, app_slug, created_at desc);

drop trigger if exists set_profiles_updated_at on core.profiles;
create trigger set_profiles_updated_at before update on core.profiles for each row execute function core.set_updated_at();

drop trigger if exists set_workspaces_updated_at on core.workspaces;
create trigger set_workspaces_updated_at before update on core.workspaces for each row execute function core.set_updated_at();

drop trigger if exists set_workspace_members_updated_at on core.workspace_members;
create trigger set_workspace_members_updated_at before update on core.workspace_members for each row execute function core.set_updated_at();

drop trigger if exists set_ecosystem_apps_updated_at on core.ecosystem_apps;
create trigger set_ecosystem_apps_updated_at before update on core.ecosystem_apps for each row execute function core.set_updated_at();

drop trigger if exists set_workspace_app_access_updated_at on core.workspace_app_access;
create trigger set_workspace_app_access_updated_at before update on core.workspace_app_access for each row execute function core.set_updated_at();

drop trigger if exists set_app_connections_updated_at on core.app_connections;
create trigger set_app_connections_updated_at before update on core.app_connections for each row execute function core.set_updated_at();

drop trigger if exists set_entitlements_updated_at on core.entitlements;
create trigger set_entitlements_updated_at before update on core.entitlements for each row execute function core.set_updated_at();
