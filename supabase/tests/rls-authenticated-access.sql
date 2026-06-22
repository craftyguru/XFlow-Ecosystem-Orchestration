-- Supabase RLS authenticated-access proof.
--
-- Run against a disposable Supabase test database after migrations:
--   psql "$SUPABASE_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls-authenticated-access.sql
--
-- This script is intentionally transactional and ends with rollback.

begin;

create temp table rls_test_results (
  name text primary key,
  ok boolean not null,
  detail text
) on commit drop;

grant select, insert, update, delete on rls_test_results to authenticated, service_role;

create or replace function pg_temp.pass(test_name text, detail text default null)
returns void
language plpgsql
as $$
begin
  insert into rls_test_results(name, ok, detail) values (test_name, true, detail);
end;
$$;

create or replace function pg_temp.fail(test_name text, detail text)
returns void
language plpgsql
as $$
begin
  insert into rls_test_results(name, ok, detail) values (test_name, false, detail);
end;
$$;

create or replace function pg_temp.expect_denied(test_name text, sql_text text)
returns void
language plpgsql
as $$
begin
  execute sql_text;
  perform pg_temp.fail(test_name, 'statement unexpectedly succeeded');
exception
  when insufficient_privilege or check_violation or with_check_option_violation then
    perform pg_temp.pass(test_name);
  when others then
    if sqlstate in ('42501', '23514', '44000') then
      perform pg_temp.pass(test_name, sqlerrm);
    else
      raise;
    end if;
end;
$$;

create or replace function pg_temp.expect_zero(test_name text, sql_text text)
returns void
language plpgsql
as $$
declare
  observed bigint;
begin
  execute sql_text into observed;
  if observed = 0 then
    perform pg_temp.pass(test_name);
  else
    perform pg_temp.fail(test_name, format('expected 0 rows, observed %s', observed));
  end if;
end;
$$;

-- Test fixtures. Setup runs as postgres so the proof can establish workspace
-- membership before switching to authenticated/service_role behavior.
set local role postgres;

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-000000000101', 'rls-user-a@example.test'),
  ('00000000-0000-4000-8000-000000000102', 'rls-user-b@example.test')
on conflict (id) do nothing;

insert into core.ecosystem_apps (slug, display_name, authority_role, owns_billing, owns_entitlements, owns_usage_metering, owns_control_plane)
values
  ('xflow', 'XFlow', 'auth_control_plane', false, false, false, true),
  ('verixet', 'Verixet', 'billing_entitlements', true, true, true, false)
on conflict (slug) do nothing;

insert into core.workspaces (id, slug, name, created_by)
values
  ('00000000-0000-4000-8000-000000000201', 'rls-proof-a', 'RLS Proof A', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202', 'rls-proof-b', 'RLS Proof B', '00000000-0000-4000-8000-000000000102')
on conflict (id) do nothing;

insert into core.workspace_members (workspace_id, user_id, role, status)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'owner', 'active'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'owner', 'active')
on conflict (workspace_id, user_id) do nothing;

insert into core.workspace_app_access (workspace_id, app_slug, status, metadata)
values
  ('00000000-0000-4000-8000-000000000201', 'verixet', 'active', '{"source":"rls-proof"}'),
  ('00000000-0000-4000-8000-000000000202', 'verixet', 'active', '{"source":"rls-proof"}')
on conflict (workspace_id, app_slug) do update set status = excluded.status;

insert into core.entitlements (workspace_id, app_slug, feature_key, decision, source, metadata)
values
  ('00000000-0000-4000-8000-000000000201', 'verixet', 'rls.proof', 'allow', 'verixet', '{"source":"rls-proof"}'),
  ('00000000-0000-4000-8000-000000000202', 'verixet', 'rls.proof', 'allow', 'verixet', '{"source":"rls-proof"}')
on conflict (workspace_id, app_slug, feature_key) do update set decision = excluded.decision;

insert into core.billing_events (workspace_id, app_slug, provider, provider_event_id, event_type, authority, metadata)
values ('00000000-0000-4000-8000-000000000201', 'verixet', 'stripe', 'evt_rls_seed', 'proof.seed', 'verixet', '{}')
on conflict (provider, provider_event_id) do nothing;

insert into core.audit_logs (workspace_id, app_slug, actor_user_id, action, target_table, target_id, metadata)
values ('00000000-0000-4000-8000-000000000201', 'verixet', null, 'proof.seed', 'core.audit_logs', 'seed', '{}');

-- Authenticated user A can see own workspace records but not workspace B private records.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select pg_temp.expect_zero(
  'authenticated user cannot read another workspace private records',
  $$select count(*) from core.entitlements where workspace_id = '00000000-0000-4000-8000-000000000202'$$
);

select pg_temp.expect_denied(
  'authenticated user cannot read billing events even in own workspace',
  $$select count(*) from core.billing_events where workspace_id = '00000000-0000-4000-8000-000000000201'$$
);

select pg_temp.expect_denied(
  'authenticated user cannot read audit logs even in own workspace',
  $$select count(*) from core.audit_logs where workspace_id = '00000000-0000-4000-8000-000000000201'$$
);

select pg_temp.expect_denied(
  'authenticated user cannot read service-only Verixet Stripe connections',
  $$select count(*) from verixet.stripe_connections where workspace_id = '00000000-0000-4000-8000-000000000201'$$
);

select pg_temp.expect_denied(
  'authenticated user cannot mutate core.entitlements',
  $$insert into core.entitlements (workspace_id, app_slug, feature_key, decision, source)
    values ('00000000-0000-4000-8000-000000000201', 'verixet', 'rls.bad', 'allow', 'verixet')$$
);

select pg_temp.expect_denied(
  'authenticated user cannot mutate app access',
  $$update core.workspace_app_access set status = 'disabled'
    where workspace_id = '00000000-0000-4000-8000-000000000201' and app_slug = 'verixet'$$
);

select pg_temp.expect_denied(
  'authenticated user cannot write billing events',
  $$insert into core.billing_events (workspace_id, app_slug, provider, provider_event_id, event_type, authority)
    values ('00000000-0000-4000-8000-000000000201', 'verixet', 'stripe', 'evt_rls_auth_write', 'proof.bad', 'verixet')$$
);

select pg_temp.expect_denied(
  'authenticated user cannot write audit logs',
  $$insert into core.audit_logs (workspace_id, app_slug, action)
    values ('00000000-0000-4000-8000-000000000201', 'verixet', 'proof.bad')$$
);

-- Service-role can write required system records.
set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);

insert into core.entitlements (workspace_id, app_slug, feature_key, decision, source, metadata)
values ('00000000-0000-4000-8000-000000000201', 'verixet', 'rls.service.entitlement', 'allow', 'verixet', '{}')
on conflict (workspace_id, app_slug, feature_key) do update set decision = excluded.decision;

insert into core.workspace_app_access (workspace_id, app_slug, status, metadata)
values ('00000000-0000-4000-8000-000000000201', 'xflow', 'active', '{}')
on conflict (workspace_id, app_slug) do update set status = excluded.status;

insert into core.billing_events (workspace_id, app_slug, provider, provider_event_id, event_type, authority)
values ('00000000-0000-4000-8000-000000000201', 'verixet', 'stripe', 'evt_rls_service_write', 'proof.service', 'verixet')
on conflict (provider, provider_event_id) do nothing;

insert into core.audit_logs (workspace_id, app_slug, action)
values ('00000000-0000-4000-8000-000000000201', 'verixet', 'proof.service');

select pg_temp.pass('service-role can write required system records');

-- Future tables fail validation without RLS: the same catalog invariant used by
-- 099_validation_checks.sql must detect new custom-schema tables before launch.
set local role postgres;
create table core.rls_future_without_policy (
  id uuid primary key default gen_random_uuid()
);
do $$
declare
  missing text;
begin
  select string_agg(format('%I.%I', n.nspname, c.relname), ', ')
  into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
    and c.relkind = 'r'
    and c.relrowsecurity is not true;

  if missing like '%core.rls_future_without_policy%' then
    perform pg_temp.pass('future tables fail validation without RLS');
  else
    perform pg_temp.fail(
      'future tables fail validation without RLS',
      'new table without RLS was not detected by catalog invariant'
    );
  end if;
end $$;
drop table core.rls_future_without_policy;

do $$
declare
  failures text;
begin
  select string_agg(name || ': ' || coalesce(detail, 'failed'), E'\n')
  into failures
  from rls_test_results
  where not ok;

  if failures is not null then
    raise exception 'RLS authenticated-access proof failed:%', E'\n' || failures;
  end if;
end $$;

rollback;
