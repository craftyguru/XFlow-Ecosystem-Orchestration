alter table audaix.audits enable row level security;
alter table audaix.audit_reports enable row level security;
alter table audaix.monitors enable row level security;
alter table audaix.audit_findings enable row level security;
alter table audaix.scan_jobs enable row level security;

drop policy if exists audaix_audits_select on audaix.audits;
create policy audaix_audits_select on audaix.audits for select
  using (core.has_workspace_app_access(workspace_id, 'audaix') or core.is_service_role());
drop policy if exists audaix_audits_service_write on audaix.audits;
create policy audaix_audits_service_write on audaix.audits for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'audaix');

drop policy if exists audaix_audit_reports_select on audaix.audit_reports;
create policy audaix_audit_reports_select on audaix.audit_reports for select
  using (core.has_workspace_app_access(workspace_id, 'audaix') or core.is_service_role());
drop policy if exists audaix_audit_reports_service_write on audaix.audit_reports;
create policy audaix_audit_reports_service_write on audaix.audit_reports for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'audaix');

drop policy if exists audaix_monitors_select on audaix.monitors;
create policy audaix_monitors_select on audaix.monitors for select
  using (core.has_workspace_app_access(workspace_id, 'audaix') or core.is_service_role());
drop policy if exists audaix_monitors_service_write on audaix.monitors;
create policy audaix_monitors_service_write on audaix.monitors for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'audaix');

drop policy if exists audaix_audit_findings_select on audaix.audit_findings;
create policy audaix_audit_findings_select on audaix.audit_findings for select
  using (core.has_workspace_app_access(workspace_id, 'audaix') or core.is_service_role());
drop policy if exists audaix_audit_findings_service_write on audaix.audit_findings;
create policy audaix_audit_findings_service_write on audaix.audit_findings for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'audaix');

drop policy if exists audaix_scan_jobs_select on audaix.scan_jobs;
create policy audaix_scan_jobs_select on audaix.scan_jobs for select
  using (core.has_workspace_app_access(workspace_id, 'audaix') or core.is_service_role());
drop policy if exists audaix_scan_jobs_service_write on audaix.scan_jobs;
create policy audaix_scan_jobs_service_write on audaix.scan_jobs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'audaix');

revoke all on schema audaix from anon, authenticated;
