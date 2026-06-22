create schema if not exists verixet;

create table if not exists verixet.billing_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet')
);

create table if not exists verixet.stripe_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  stripe_customer_id text,
  stripe_account_id text,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet')
);

create table if not exists verixet.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  stripe_session_id text not null unique,
  status text not null default 'created',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet')
);

create table if not exists verixet.entitlement_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  target_app_slug text not null references core.ecosystem_apps(slug),
  feature_key text not null,
  decision text not null,
  created_by uuid references auth.users(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet')
);

create table if not exists verixet.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  target_app_slug text references core.ecosystem_apps(slug),
  amount numeric(20, 6) not null,
  reason text not null,
  idempotency_key text,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet'),
  unique (workspace_id, idempotency_key)
);

create table if not exists verixet.usage_admission_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'verixet' references core.ecosystem_apps(slug),
  target_app_slug text not null references core.ecosystem_apps(slug),
  feature_key text not null,
  decision text not null,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'verixet')
);

create index if not exists verixet_billing_accounts_workspace_idx on verixet.billing_accounts (workspace_id, status);
create index if not exists verixet_stripe_connections_workspace_idx on verixet.stripe_connections (workspace_id, status);
create index if not exists verixet_entitlement_decisions_workspace_idx on verixet.entitlement_decisions (workspace_id, target_app_slug, feature_key, created_at desc);
create index if not exists verixet_credit_ledger_workspace_idx on verixet.credit_ledger (workspace_id, created_at desc);
create index if not exists verixet_usage_admission_logs_workspace_idx on verixet.usage_admission_logs (workspace_id, target_app_slug, created_at desc);
