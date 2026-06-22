-- Restore schema-level API access required for authenticated users to reach
-- explicitly allowed app tables. Table grants and RLS policies still decide
-- which tables and rows are readable.

grant usage on schema core to authenticated, service_role;
grant usage on schema xflow to authenticated, service_role;
grant usage on schema verixet to authenticated, service_role;
grant usage on schema audaix to authenticated, service_role;
grant usage on schema rataify to authenticated, service_role;
grant usage on schema wordgeni to authenticated, service_role;
grant usage on schema crevux to authenticated, service_role;

do $$
declare
  missing text;
begin
  select string_agg(schema_name, ', ' order by schema_name)
  into missing
  from (
    values
      ('core'),
      ('xflow'),
      ('verixet'),
      ('audaix'),
      ('rataify'),
      ('wordgeni'),
      ('crevux')
  ) as required(schema_name)
  where not has_schema_privilege('authenticated', schema_name, 'USAGE')
     or not has_schema_privilege('service_role', schema_name, 'USAGE');

  if missing is not null then
    raise exception 'Required schema usage grants are missing for: %', missing;
  end if;
end $$;
