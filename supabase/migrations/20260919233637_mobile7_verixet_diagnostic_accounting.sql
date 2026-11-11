-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators restored between ledger statements.
-- Version: 20260919233637; name: mobile7_verixet_diagnostic_accounting; statement-join MD5: e02f52ea7898c5cbb3c52c31e7b4cfde

-- MOBILE-7 diagnostic operation allowance. This is not money, a customer
-- balance, a Stripe subscription, or a general Crevux price catalog.
-- Only the protected Verixet server may access these private-schema tables.

create table if not exists verixet.mobile7_diagnostic_accounts (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null unique references verixet.billing_accounts(id) on delete restrict,
  xflow_workspace_id text not null unique,
  crevux_workspace_id uuid not null unique references core.workspaces(id) on delete restrict,
  classification text not null default 'qualification_only'
    check (classification = 'qualification_only'),
  funding_source text not null default 'owner_authorized_promotional_qualification_grant'
    check (funding_source = 'owner_authorized_promotional_qualification_grant'),
  created_at timestamptz not null default now(),
  constraint mobile7_diagnostic_account_workspace_nonempty
    check (length(btrim(xflow_workspace_id)) between 1 and 256 and xflow_workspace_id = btrim(xflow_workspace_id))
);

-- The existing billing account must belong to the same core workspace. The
-- external text workspace is attested by the protected provisioner, not cast.
create or replace function verixet.mobile7_check_billing_workspace()
returns trigger language plpgsql security invoker set search_path = pg_catalog
as $$ begin
  if not exists (
    select 1 from verixet.billing_accounts b
    where b.id = new.billing_account_id
      and b.workspace_id = new.crevux_workspace_id
      and b.app_slug = 'verixet'
      and b.status = 'qualification_inactive'
  ) then
    raise exception 'MOBILE7_BILLING_WORKSPACE_MISMATCH' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists mobile7_billing_workspace_match on verixet.mobile7_diagnostic_accounts;

create trigger mobile7_billing_workspace_match before insert or update
  on verixet.mobile7_diagnostic_accounts for each row
  execute function verixet.mobile7_check_billing_workspace();

create table if not exists verixet.mobile7_diagnostic_entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references verixet.mobile7_diagnostic_accounts(id) on delete restrict,
  feature_key text not null default 'mobile7_diagnostic_image_generation'
    check (feature_key = 'mobile7_diagnostic_image_generation'),
  state text not null default 'inactive'
    check (state in ('inactive', 'active', 'reserved', 'consumed', 'revoked', 'expired', 'reconciliation_required')),
  operation_allowance smallint not null default 1 check (operation_allowance = 1),
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile7_diagnostic_entitlement_activation_check
    check (state = 'inactive' or activated_at is not null)
);

create table if not exists verixet.mobile7_generation_reservations (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references verixet.mobile7_diagnostic_entitlements(id) on delete restrict,
  account_id uuid not null references verixet.mobile7_diagnostic_accounts(id) on delete restrict,
  operation_key text not null,
  correlation_id uuid not null,
  state text not null default 'reserved'
    check (state in ('reserved', 'settled', 'released', 'expired', 'reconciliation_required')),
  reserved_operations smallint not null default 1 check (reserved_operations = 1),
  settlement_key text,
  release_key text,
  provider_outcome text check (provider_outcome in ('confirmed_success', 'confirmed_no_dispatch', 'ambiguous')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, operation_key),
  unique (account_id, correlation_id),
  constraint mobile7_reservation_state_fields_check check (
    (state = 'settled' and settlement_key is not null and provider_outcome = 'confirmed_success')
    or (state = 'released' and release_key is not null and provider_outcome = 'confirmed_no_dispatch')
    or (state = 'reconciliation_required' and provider_outcome = 'ambiguous')
    or (state = 'expired' and provider_outcome = 'confirmed_no_dispatch')
    or (state = 'reserved' and provider_outcome is null)
  ),
  constraint mobile7_reservation_key_check
    check (length(operation_key) between 16 and 128 and operation_key = btrim(operation_key)),
  constraint mobile7_settlement_key_check
    check (settlement_key is null or length(settlement_key) between 16 and 128),
  constraint mobile7_release_key_check
    check (release_key is null or length(release_key) between 16 and 128),
  constraint mobile7_reservation_expiry_check check (expires_at > created_at)
);

create unique index if not exists mobile7_one_exposure_per_entitlement_idx
  on verixet.mobile7_generation_reservations(entitlement_id)
  where state in ('reserved', 'settled', 'reconciliation_required');

create index if not exists mobile7_reservations_expiry_idx
  on verixet.mobile7_generation_reservations(expires_at)
  where state = 'reserved';

create table if not exists verixet.mobile7_accounting_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references verixet.mobile7_diagnostic_accounts(id) on delete restrict,
  entitlement_id uuid not null references verixet.mobile7_diagnostic_entitlements(id) on delete restrict,
  reservation_id uuid references verixet.mobile7_generation_reservations(id) on delete restrict,
  event_type text not null check (event_type in (
    'provisioned', 'activated', 'reserved', 'settled', 'released',
    'expired', 'reconciliation_required', 'reconciled_settled',
    'reconciled_released', 'revoked'
  )),
  request_key text not null,
  created_at timestamptz not null default now(),
  unique (account_id, request_key, event_type),
  constraint mobile7_event_key_check check (length(request_key) between 16 and 128)
);

create index if not exists mobile7_events_account_time_idx
  on verixet.mobile7_accounting_events(account_id, created_at);

create or replace function verixet.mobile7_prevent_event_mutation()
returns trigger language plpgsql security invoker set search_path = pg_catalog
as $$ begin raise exception 'MOBILE7_ACCOUNTING_EVENT_IMMUTABLE' using errcode = '23514'; end $$;

drop trigger if exists mobile7_accounting_events_immutable on verixet.mobile7_accounting_events;

create trigger mobile7_accounting_events_immutable
  before update or delete on verixet.mobile7_accounting_events
  for each row execute function verixet.mobile7_prevent_event_mutation();

alter table verixet.mobile7_diagnostic_accounts enable row level security;

alter table verixet.mobile7_diagnostic_accounts force row level security;

alter table verixet.mobile7_diagnostic_entitlements enable row level security;

alter table verixet.mobile7_diagnostic_entitlements force row level security;

alter table verixet.mobile7_generation_reservations enable row level security;

alter table verixet.mobile7_generation_reservations force row level security;

alter table verixet.mobile7_accounting_events enable row level security;

alter table verixet.mobile7_accounting_events force row level security;

revoke all on table verixet.mobile7_diagnostic_accounts,
  verixet.mobile7_diagnostic_entitlements,
  verixet.mobile7_generation_reservations,
  verixet.mobile7_accounting_events from public, anon, authenticated, service_role;

revoke all on function verixet.mobile7_prevent_event_mutation(),
  verixet.mobile7_check_billing_workspace() from public, anon, authenticated, service_role;

-- Only the already-established private Verixet service authority can operate
-- the diagnostic ledger. The anonymous/authenticated API roles receive none.
grant select on verixet.mobile7_diagnostic_accounts to service_role;

grant select, update on verixet.mobile7_diagnostic_entitlements to service_role;

grant select, insert, update on verixet.mobile7_generation_reservations to service_role;

grant select, insert on verixet.mobile7_accounting_events to service_role;

drop policy if exists mobile7_diagnostic_accounts_service on verixet.mobile7_diagnostic_accounts;

create policy mobile7_diagnostic_accounts_service on verixet.mobile7_diagnostic_accounts
  for all to service_role using (core.is_service_role()) with check (core.is_service_role());

drop policy if exists mobile7_diagnostic_entitlements_service on verixet.mobile7_diagnostic_entitlements;

create policy mobile7_diagnostic_entitlements_service on verixet.mobile7_diagnostic_entitlements
  for all to service_role using (core.is_service_role()) with check (core.is_service_role());

drop policy if exists mobile7_generation_reservations_service on verixet.mobile7_generation_reservations;

create policy mobile7_generation_reservations_service on verixet.mobile7_generation_reservations
  for all to service_role using (core.is_service_role()) with check (core.is_service_role());

drop policy if exists mobile7_accounting_events_service on verixet.mobile7_accounting_events;

create policy mobile7_accounting_events_service on verixet.mobile7_accounting_events
  for select to service_role using (core.is_service_role());

drop policy if exists mobile7_accounting_events_insert on verixet.mobile7_accounting_events;

create policy mobile7_accounting_events_insert on verixet.mobile7_accounting_events
  for insert to service_role with check (core.is_service_role());

