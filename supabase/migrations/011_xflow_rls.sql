alter table xflow.runs enable row level security;
alter table xflow.control_plane_events enable row level security;
alter table xflow.app_links enable row level security;
alter table xflow.deployment_checks enable row level security;
alter table xflow.workflow_runs enable row level security;

drop policy if exists xflow_runs_select on xflow.runs;
create policy xflow_runs_select on xflow.runs for select
  using (core.has_workspace_app_access(workspace_id, 'xflow') or core.is_service_role());
drop policy if exists xflow_runs_service_write on xflow.runs;
create policy xflow_runs_service_write on xflow.runs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'xflow');

drop policy if exists xflow_control_plane_events_select on xflow.control_plane_events;
create policy xflow_control_plane_events_select on xflow.control_plane_events for select
  using (core.has_workspace_app_access(workspace_id, 'xflow') or core.is_service_role());
drop policy if exists xflow_control_plane_events_service_write on xflow.control_plane_events;
create policy xflow_control_plane_events_service_write on xflow.control_plane_events for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'xflow');

drop policy if exists xflow_app_links_select on xflow.app_links;
create policy xflow_app_links_select on xflow.app_links for select
  using (core.has_workspace_app_access(workspace_id, 'xflow') or core.is_service_role());
drop policy if exists xflow_app_links_service_write on xflow.app_links;
create policy xflow_app_links_service_write on xflow.app_links for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'xflow');

drop policy if exists xflow_deployment_checks_select on xflow.deployment_checks;
create policy xflow_deployment_checks_select on xflow.deployment_checks for select
  using (core.has_workspace_app_access(workspace_id, 'xflow') or core.is_service_role());
drop policy if exists xflow_deployment_checks_service_write on xflow.deployment_checks;
create policy xflow_deployment_checks_service_write on xflow.deployment_checks for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'xflow');

drop policy if exists xflow_workflow_runs_select on xflow.workflow_runs;
create policy xflow_workflow_runs_select on xflow.workflow_runs for select
  using (core.has_workspace_app_access(workspace_id, 'xflow') or core.is_service_role());
drop policy if exists xflow_workflow_runs_service_write on xflow.workflow_runs;
create policy xflow_workflow_runs_service_write on xflow.workflow_runs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'xflow');

revoke all on schema xflow from anon, authenticated;
