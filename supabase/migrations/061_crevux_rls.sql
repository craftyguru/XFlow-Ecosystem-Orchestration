alter table crevux.projects enable row level security;
alter table crevux.assets enable row level security;
alter table crevux.generation_jobs enable row level security;
alter table crevux.exports enable row level security;
alter table crevux.provider_runs enable row level security;
alter table crevux.credit_spend_events enable row level security;

drop policy if exists crevux_projects_select on crevux.projects;
create policy crevux_projects_select on crevux.projects for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_projects_service_write on crevux.projects;
create policy crevux_projects_service_write on crevux.projects for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

drop policy if exists crevux_assets_select on crevux.assets;
create policy crevux_assets_select on crevux.assets for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_assets_service_write on crevux.assets;
create policy crevux_assets_service_write on crevux.assets for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

drop policy if exists crevux_generation_jobs_select on crevux.generation_jobs;
create policy crevux_generation_jobs_select on crevux.generation_jobs for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_generation_jobs_service_write on crevux.generation_jobs;
create policy crevux_generation_jobs_service_write on crevux.generation_jobs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

drop policy if exists crevux_exports_select on crevux.exports;
create policy crevux_exports_select on crevux.exports for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_exports_service_write on crevux.exports;
create policy crevux_exports_service_write on crevux.exports for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

drop policy if exists crevux_provider_runs_select on crevux.provider_runs;
create policy crevux_provider_runs_select on crevux.provider_runs for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_provider_runs_service_write on crevux.provider_runs;
create policy crevux_provider_runs_service_write on crevux.provider_runs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

drop policy if exists crevux_credit_spend_events_select on crevux.credit_spend_events;
create policy crevux_credit_spend_events_select on crevux.credit_spend_events for select
  using (core.has_workspace_app_access(workspace_id, 'crevux') or core.is_service_role());
drop policy if exists crevux_credit_spend_events_service_write on crevux.credit_spend_events;
create policy crevux_credit_spend_events_service_write on crevux.credit_spend_events for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'crevux');

revoke all on schema crevux from anon, authenticated;
