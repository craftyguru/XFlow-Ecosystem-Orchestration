-- Fails fast if the Phase 1 shared Supabase shape is incomplete.

do $$
declare
  required_schemas text[] := array['core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux'];
  required_apps text[] := array['xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux'];
  required_buckets text[] := array[
    'xflow-artifacts',
    'verixet-billing-artifacts',
    'audaix-reports',
    'rataify-evidence',
    'wordgeni-exports',
    'crevux-assets'
  ];
  missing text;
begin
  select string_agg(s, ', ')
  into missing
  from unnest(required_schemas) as s
  where not exists (select 1 from information_schema.schemata where schema_name = s);
  if missing is not null then
    raise exception 'Missing required schemas: %', missing;
  end if;

  select string_agg(a, ', ')
  into missing
  from unnest(required_apps) as a
  where not exists (select 1 from core.ecosystem_apps where slug = a);
  if missing is not null then
    raise exception 'Missing ecosystem app seeds: %', missing;
  end if;

  select string_agg(b, ', ')
  into missing
  from unnest(required_buckets) as b
  where not exists (select 1 from storage.buckets where id = b and public = false);
  if missing is not null then
    raise exception 'Missing private storage buckets: %', missing;
  end if;

  select string_agg(format('%I.%I', n.nspname, c.relname), ', ')
  into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
    and c.relkind = 'r'
    and c.relrowsecurity is not true;
  if missing is not null then
    raise exception 'Tables missing RLS: %', missing;
  end if;

  select string_agg(format('%I.%I', n.nspname, c.relname), ', ')
  into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname in ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
    and c.relkind = 'r'
  group by n.nspname, c.relname
  having count(p.oid) = 0
  limit 1;
  if missing is not null then
    raise exception 'At least one table has no RLS policies: %', missing;
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants
    where grantee = 'anon'
      and table_schema in ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  ) then
    raise exception 'Anon must not have broad unsafe write grants on shared custom schemas';
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants
    where grantee = 'authenticated'
      and table_schema = 'core'
      and table_name in ('workspace_app_access', 'app_connections', 'entitlements', 'usage_events', 'billing_events', 'audit_logs')
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  ) then
    raise exception 'Authenticated must not have write grants on protected shared core authority tables';
  end if;

  if not has_schema_privilege('service_role', 'core', 'USAGE')
    or not has_schema_privilege('service_role', 'verixet', 'USAGE') then
    raise exception 'service_role must have USAGE on core and verixet schemas for server-only bridge writes';
  end if;

  if not has_table_privilege('service_role', 'verixet.entitlement_decisions', 'INSERT')
    or not has_table_privilege('service_role', 'verixet.usage_admission_logs', 'INSERT')
    or not has_table_privilege('service_role', 'core.audit_logs', 'INSERT')
    or not has_table_privilege('service_role', 'core.usage_events', 'INSERT') then
    raise exception 'service_role must have insert access to Verixet bridge tables';
  end if;

  if has_table_privilege('anon', 'verixet.entitlement_decisions', 'INSERT')
    or has_table_privilege('anon', 'verixet.usage_admission_logs', 'INSERT')
    or has_table_privilege('anon', 'core.audit_logs', 'INSERT')
    or has_table_privilege('anon', 'core.usage_events', 'INSERT') then
    raise exception 'anon must not have insert access to Verixet bridge tables';
  end if;

  if exists (
    select 1
    from core.entitlements
    where source <> 'verixet'
  ) then
    raise exception 'Entitlement rows must be sourced through Verixet authority';
  end if;

  raise notice 'Supabase Phase 1 validation checks passed.';
end $$;
