-- Grants required for Supabase Data API/PostgREST access to exposed custom schemas.
-- RLS policies remain the data isolation boundary. The anon role intentionally receives
-- no broad custom-schema grants.

grant usage on schema core to authenticated, service_role;
grant usage on schema xflow to authenticated, service_role;
grant usage on schema verixet to authenticated, service_role;
grant usage on schema audaix to authenticated, service_role;
grant usage on schema rataify to authenticated, service_role;
grant usage on schema wordgeni to authenticated, service_role;
grant usage on schema crevux to authenticated, service_role;

grant select on all tables in schema core to authenticated;
grant select on all tables in schema xflow to authenticated;
grant select on all tables in schema verixet to authenticated;
grant select on all tables in schema audaix to authenticated;
grant select on all tables in schema rataify to authenticated;
grant select on all tables in schema wordgeni to authenticated;
grant select on all tables in schema crevux to authenticated;
grant select, insert, update, delete on all tables in schema core to service_role;
grant select, insert, update, delete on all tables in schema xflow to service_role;
grant select, insert, update, delete on all tables in schema verixet to service_role;
grant select, insert, update, delete on all tables in schema audaix to service_role;
grant select, insert, update, delete on all tables in schema rataify to service_role;
grant select, insert, update, delete on all tables in schema wordgeni to service_role;
grant select, insert, update, delete on all tables in schema crevux to service_role;

grant usage, select on all sequences in schema core to authenticated, service_role;
grant usage, select on all sequences in schema xflow to authenticated, service_role;
grant usage, select on all sequences in schema verixet to authenticated, service_role;
grant usage, select on all sequences in schema audaix to authenticated, service_role;
grant usage, select on all sequences in schema rataify to authenticated, service_role;
grant usage, select on all sequences in schema wordgeni to authenticated, service_role;
grant usage, select on all sequences in schema crevux to authenticated, service_role;

alter default privileges in schema core grant select on tables to authenticated;
alter default privileges in schema xflow grant select on tables to authenticated;
alter default privileges in schema verixet grant select on tables to authenticated;
alter default privileges in schema audaix grant select on tables to authenticated;
alter default privileges in schema rataify grant select on tables to authenticated;
alter default privileges in schema wordgeni grant select on tables to authenticated;
alter default privileges in schema crevux grant select on tables to authenticated;
alter default privileges in schema core grant select, insert, update, delete on tables to service_role;
alter default privileges in schema xflow grant select, insert, update, delete on tables to service_role;
alter default privileges in schema verixet grant select, insert, update, delete on tables to service_role;
alter default privileges in schema audaix grant select, insert, update, delete on tables to service_role;
alter default privileges in schema rataify grant select, insert, update, delete on tables to service_role;
alter default privileges in schema wordgeni grant select, insert, update, delete on tables to service_role;
alter default privileges in schema crevux grant select, insert, update, delete on tables to service_role;

alter default privileges in schema core grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema xflow grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema verixet grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema audaix grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema rataify grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema wordgeni grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema crevux grant usage, select on sequences to authenticated, service_role;
