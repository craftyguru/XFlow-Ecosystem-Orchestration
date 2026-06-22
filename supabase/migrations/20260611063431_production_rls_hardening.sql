-- Production RLS hardening for the shared XFlow ecosystem Supabase project.
--
-- Security model:
-- - Application rows are visible only to authenticated users who are active
--   members of the workspace and whose workspace has app access.
-- - Billing, Stripe, audit, raw usage, connected-app authority, and other
--   sensitive authority tables are service-role-only.
-- - Browser/client requests must use Supabase user JWTs; service-role clients
--   are reserved for trusted backend code that performs its own request auth
--   and workspace checks before reading or writing.
-- - Workspace authorization is derived from core.workspace_members and auth.uid().
--   X-XFlow-Ecosystem-* headers are not trusted by database policies.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_service_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.role(), '') = 'service_role'
$$;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from core.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
  )
$$;

create or replace function private.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from core.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
      and wm.role in ('owner', 'admin')
  )
$$;

create or replace function private.has_workspace_app_access(target_workspace_id uuid, target_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_workspace_member(target_workspace_id)
    and exists (
      select 1
      from core.workspace_app_access waa
      where waa.workspace_id = target_workspace_id
        and waa.app_slug = target_app_slug
        and waa.status in ('active', 'trialing')
    )
$$;

revoke all on function private.is_service_role() from public, anon;
revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.is_workspace_admin(uuid) from public, anon;
revoke all on function private.has_workspace_app_access(uuid, text) from public, anon;
grant execute on function private.is_service_role() to authenticated, service_role;
grant execute on function private.is_workspace_member(uuid) to authenticated, service_role;
grant execute on function private.is_workspace_admin(uuid) to authenticated, service_role;
grant execute on function private.has_workspace_app_access(uuid, text) to authenticated, service_role;

-- Retire exposed-schema privileged helpers. Existing code should not call these
-- directly, and new RLS policies below use private.* helpers instead.
alter function core.is_workspace_member(uuid) security invoker;
alter function core.is_workspace_admin(uuid) security invoker;
alter function core.has_workspace_app_access(uuid, text) security invoker;
revoke all on function core.is_workspace_member(uuid) from public, anon, authenticated;
revoke all on function core.is_workspace_admin(uuid) from public, anon, authenticated;
revoke all on function core.has_workspace_app_access(uuid, text) from public, anon, authenticated;

alter table core.profiles enable row level security;
alter table core.workspaces enable row level security;
alter table core.workspace_members enable row level security;
alter table core.ecosystem_apps enable row level security;
alter table core.workspace_app_access enable row level security;
alter table core.app_connections enable row level security;
alter table core.entitlements enable row level security;
alter table core.usage_events enable row level security;
alter table core.billing_events enable row level security;
alter table core.audit_logs enable row level security;
alter table core.user_consents enable row level security;

alter table xflow.runs enable row level security;
alter table xflow.control_plane_events enable row level security;
alter table xflow.app_links enable row level security;
alter table xflow.deployment_checks enable row level security;
alter table xflow.workflow_runs enable row level security;

alter table verixet.billing_accounts enable row level security;
alter table verixet.stripe_connections enable row level security;
alter table verixet.checkout_sessions enable row level security;
alter table verixet.entitlement_decisions enable row level security;
alter table verixet.credit_ledger enable row level security;
alter table verixet.usage_admission_logs enable row level security;

alter table audaix.audits enable row level security;
alter table audaix.audit_reports enable row level security;
alter table audaix.monitors enable row level security;
alter table audaix.audit_findings enable row level security;
alter table audaix.scan_jobs enable row level security;

alter table rataify.sites enable row level security;
alter table rataify.reviews enable row level security;
alter table rataify.issues enable row level security;
alter table rataify.risk_events enable row level security;
alter table rataify.evidence_items enable row level security;

alter table wordgeni.documents enable row level security;
alter table wordgeni.document_sources enable row level security;
alter table wordgeni.memory_cards enable row level security;
alter table wordgeni.writing_sessions enable row level security;
alter table wordgeni.provenance_items enable row level security;

alter table crevux.projects enable row level security;
alter table crevux.assets enable row level security;
alter table crevux.generation_jobs enable row level security;
alter table crevux.exports enable row level security;
alter table crevux.provider_runs enable row level security;
alter table crevux.credit_spend_events enable row level security;

alter table core.profiles force row level security;
alter table core.workspaces force row level security;
alter table core.workspace_members force row level security;
alter table core.ecosystem_apps force row level security;
alter table core.workspace_app_access force row level security;
alter table core.app_connections force row level security;
alter table core.entitlements force row level security;
alter table core.usage_events force row level security;
alter table core.billing_events force row level security;
alter table core.audit_logs force row level security;
alter table core.user_consents force row level security;

alter table xflow.runs force row level security;
alter table xflow.control_plane_events force row level security;
alter table xflow.app_links force row level security;
alter table xflow.deployment_checks force row level security;
alter table xflow.workflow_runs force row level security;

alter table verixet.billing_accounts force row level security;
alter table verixet.stripe_connections force row level security;
alter table verixet.checkout_sessions force row level security;
alter table verixet.entitlement_decisions force row level security;
alter table verixet.credit_ledger force row level security;
alter table verixet.usage_admission_logs force row level security;

alter table audaix.audits force row level security;
alter table audaix.audit_reports force row level security;
alter table audaix.monitors force row level security;
alter table audaix.audit_findings force row level security;
alter table audaix.scan_jobs force row level security;

alter table rataify.sites force row level security;
alter table rataify.reviews force row level security;
alter table rataify.issues force row level security;
alter table rataify.risk_events force row level security;
alter table rataify.evidence_items force row level security;

alter table wordgeni.documents force row level security;
alter table wordgeni.document_sources force row level security;
alter table wordgeni.memory_cards force row level security;
alter table wordgeni.writing_sessions force row level security;
alter table wordgeni.provenance_items force row level security;

alter table crevux.projects force row level security;
alter table crevux.assets force row level security;
alter table crevux.generation_jobs force row level security;
alter table crevux.exports force row level security;
alter table crevux.provider_runs force row level security;
alter table crevux.credit_spend_events force row level security;

create index if not exists core_workspace_members_workspace_user_status_idx
  on core.workspace_members (workspace_id, user_id, status);
create index if not exists core_workspace_members_workspace_user_role_status_idx
  on core.workspace_members (workspace_id, user_id, role, status);

drop policy if exists profiles_select_own on core.profiles;
create policy profiles_select_own on core.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists profiles_update_own on core.profiles;
create policy profiles_update_own on core.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists workspaces_select_member on core.workspaces;
create policy workspaces_select_member on core.workspaces
  for select to authenticated
  using (private.is_workspace_member(id));

drop policy if exists workspace_members_select_member on core.workspace_members;
create policy workspace_members_select_member on core.workspace_members
  for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists workspace_members_admin_write on core.workspace_members;
create policy workspace_members_admin_write on core.workspace_members
  for all to authenticated
  using (private.is_workspace_admin(workspace_id))
  with check (private.is_workspace_admin(workspace_id));

drop policy if exists ecosystem_apps_select_authenticated on core.ecosystem_apps;
create policy ecosystem_apps_select_authenticated on core.ecosystem_apps
  for select to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists workspace_app_access_select_member on core.workspace_app_access;
create policy workspace_app_access_select_member on core.workspace_app_access
  for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists workspace_app_access_service_write on core.workspace_app_access;
create policy workspace_app_access_service_write on core.workspace_app_access
  for all to service_role
  using (true)
  with check (true);

drop policy if exists app_connections_select_member on core.app_connections;
drop policy if exists app_connections_xflow_authority_write on core.app_connections;
create policy app_connections_service_only on core.app_connections
  for all to service_role
  using (true)
  with check (true);

drop policy if exists entitlements_select_member on core.entitlements;
create policy entitlements_select_member on core.entitlements
  for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists entitlements_verixet_authority_write on core.entitlements;
create policy entitlements_verixet_authority_write on core.entitlements
  for all to service_role
  using (true)
  with check (source = 'verixet');

drop policy if exists usage_events_select_member on core.usage_events;
drop policy if exists usage_events_service_write on core.usage_events;
create policy usage_events_service_only on core.usage_events
  for all to service_role
  using (true)
  with check (true);

drop policy if exists billing_events_select_member on core.billing_events;
drop policy if exists billing_events_verixet_authority_write on core.billing_events;
create policy billing_events_service_only on core.billing_events
  for all to service_role
  using (true)
  with check (authority = 'verixet');

drop policy if exists audit_logs_select_member on core.audit_logs;
drop policy if exists audit_logs_service_write on core.audit_logs;
create policy audit_logs_service_only on core.audit_logs
  for all to service_role
  using (true)
  with check (true);

drop policy if exists user_consents_select_own on core.user_consents;
create policy user_consents_select_own on core.user_consents
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_consents_service_write on core.user_consents;
create policy user_consents_service_write on core.user_consents
  for all to service_role
  using (true)
  with check (true);

drop policy if exists xflow_runs_select on xflow.runs;
create policy xflow_runs_select on xflow.runs for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'xflow'));
drop policy if exists xflow_runs_service_write on xflow.runs;
create policy xflow_runs_service_write on xflow.runs for all to service_role
  using (true) with check (app_slug = 'xflow');

drop policy if exists xflow_control_plane_events_select on xflow.control_plane_events;
drop policy if exists xflow_control_plane_events_service_write on xflow.control_plane_events;
create policy xflow_control_plane_events_service_only on xflow.control_plane_events
  for all to service_role using (true) with check (app_slug = 'xflow');

drop policy if exists xflow_app_links_select on xflow.app_links;
drop policy if exists xflow_app_links_service_write on xflow.app_links;
create policy xflow_app_links_service_only on xflow.app_links
  for all to service_role using (true) with check (app_slug = 'xflow');

drop policy if exists xflow_deployment_checks_select on xflow.deployment_checks;
create policy xflow_deployment_checks_select on xflow.deployment_checks for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'xflow'));
drop policy if exists xflow_deployment_checks_service_write on xflow.deployment_checks;
create policy xflow_deployment_checks_service_write on xflow.deployment_checks for all to service_role
  using (true) with check (app_slug = 'xflow');

drop policy if exists xflow_workflow_runs_select on xflow.workflow_runs;
create policy xflow_workflow_runs_select on xflow.workflow_runs for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'xflow'));
drop policy if exists xflow_workflow_runs_service_write on xflow.workflow_runs;
create policy xflow_workflow_runs_service_write on xflow.workflow_runs for all to service_role
  using (true) with check (app_slug = 'xflow');

drop policy if exists verixet_billing_accounts_select on verixet.billing_accounts;
drop policy if exists verixet_billing_accounts_service_write on verixet.billing_accounts;
create policy verixet_billing_accounts_service_only on verixet.billing_accounts
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists verixet_stripe_connections_select on verixet.stripe_connections;
drop policy if exists verixet_stripe_connections_service_write on verixet.stripe_connections;
create policy verixet_stripe_connections_service_only on verixet.stripe_connections
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists verixet_checkout_sessions_select on verixet.checkout_sessions;
drop policy if exists verixet_checkout_sessions_service_write on verixet.checkout_sessions;
create policy verixet_checkout_sessions_service_only on verixet.checkout_sessions
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists verixet_entitlement_decisions_select on verixet.entitlement_decisions;
drop policy if exists verixet_entitlement_decisions_service_write on verixet.entitlement_decisions;
create policy verixet_entitlement_decisions_service_only on verixet.entitlement_decisions
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists verixet_credit_ledger_select on verixet.credit_ledger;
drop policy if exists verixet_credit_ledger_service_write on verixet.credit_ledger;
create policy verixet_credit_ledger_service_only on verixet.credit_ledger
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists verixet_usage_admission_logs_select on verixet.usage_admission_logs;
drop policy if exists verixet_usage_admission_logs_service_write on verixet.usage_admission_logs;
create policy verixet_usage_admission_logs_service_only on verixet.usage_admission_logs
  for all to service_role using (true) with check (app_slug = 'verixet');

drop policy if exists audaix_audits_select on audaix.audits;
create policy audaix_audits_select on audaix.audits for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'audaix'));
drop policy if exists audaix_audits_service_write on audaix.audits;
create policy audaix_audits_service_write on audaix.audits for all to service_role
  using (true) with check (app_slug = 'audaix');

drop policy if exists audaix_audit_reports_select on audaix.audit_reports;
create policy audaix_audit_reports_select on audaix.audit_reports for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'audaix'));
drop policy if exists audaix_audit_reports_service_write on audaix.audit_reports;
create policy audaix_audit_reports_service_write on audaix.audit_reports for all to service_role
  using (true) with check (app_slug = 'audaix');

drop policy if exists audaix_monitors_select on audaix.monitors;
create policy audaix_monitors_select on audaix.monitors for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'audaix'));
drop policy if exists audaix_monitors_service_write on audaix.monitors;
create policy audaix_monitors_service_write on audaix.monitors for all to service_role
  using (true) with check (app_slug = 'audaix');

drop policy if exists audaix_audit_findings_select on audaix.audit_findings;
create policy audaix_audit_findings_select on audaix.audit_findings for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'audaix'));
drop policy if exists audaix_audit_findings_service_write on audaix.audit_findings;
create policy audaix_audit_findings_service_write on audaix.audit_findings for all to service_role
  using (true) with check (app_slug = 'audaix');

drop policy if exists audaix_scan_jobs_select on audaix.scan_jobs;
create policy audaix_scan_jobs_select on audaix.scan_jobs for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'audaix'));
drop policy if exists audaix_scan_jobs_service_write on audaix.scan_jobs;
create policy audaix_scan_jobs_service_write on audaix.scan_jobs for all to service_role
  using (true) with check (app_slug = 'audaix');

drop policy if exists rataify_sites_select on rataify.sites;
create policy rataify_sites_select on rataify.sites for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'rataify'));
drop policy if exists rataify_sites_service_write on rataify.sites;
create policy rataify_sites_service_write on rataify.sites for all to service_role
  using (true) with check (app_slug = 'rataify');

drop policy if exists rataify_reviews_select on rataify.reviews;
create policy rataify_reviews_select on rataify.reviews for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'rataify'));
drop policy if exists rataify_reviews_service_write on rataify.reviews;
create policy rataify_reviews_service_write on rataify.reviews for all to service_role
  using (true) with check (app_slug = 'rataify');

drop policy if exists rataify_issues_select on rataify.issues;
create policy rataify_issues_select on rataify.issues for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'rataify'));
drop policy if exists rataify_issues_service_write on rataify.issues;
create policy rataify_issues_service_write on rataify.issues for all to service_role
  using (true) with check (app_slug = 'rataify');

drop policy if exists rataify_risk_events_select on rataify.risk_events;
create policy rataify_risk_events_select on rataify.risk_events for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'rataify'));
drop policy if exists rataify_risk_events_service_write on rataify.risk_events;
create policy rataify_risk_events_service_write on rataify.risk_events for all to service_role
  using (true) with check (app_slug = 'rataify');

drop policy if exists rataify_evidence_items_select on rataify.evidence_items;
create policy rataify_evidence_items_select on rataify.evidence_items for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'rataify'));
drop policy if exists rataify_evidence_items_service_write on rataify.evidence_items;
create policy rataify_evidence_items_service_write on rataify.evidence_items for all to service_role
  using (true) with check (app_slug = 'rataify');

drop policy if exists wordgeni_documents_select on wordgeni.documents;
create policy wordgeni_documents_select on wordgeni.documents for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'wordgeni'));
drop policy if exists wordgeni_documents_service_write on wordgeni.documents;
create policy wordgeni_documents_service_write on wordgeni.documents for all to service_role
  using (true) with check (app_slug = 'wordgeni');

drop policy if exists wordgeni_document_sources_select on wordgeni.document_sources;
create policy wordgeni_document_sources_select on wordgeni.document_sources for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'wordgeni'));
drop policy if exists wordgeni_document_sources_service_write on wordgeni.document_sources;
create policy wordgeni_document_sources_service_write on wordgeni.document_sources for all to service_role
  using (true) with check (app_slug = 'wordgeni');

drop policy if exists wordgeni_memory_cards_select on wordgeni.memory_cards;
create policy wordgeni_memory_cards_select on wordgeni.memory_cards for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'wordgeni'));
drop policy if exists wordgeni_memory_cards_service_write on wordgeni.memory_cards;
create policy wordgeni_memory_cards_service_write on wordgeni.memory_cards for all to service_role
  using (true) with check (app_slug = 'wordgeni');

drop policy if exists wordgeni_writing_sessions_select on wordgeni.writing_sessions;
create policy wordgeni_writing_sessions_select on wordgeni.writing_sessions for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'wordgeni'));
drop policy if exists wordgeni_writing_sessions_service_write on wordgeni.writing_sessions;
create policy wordgeni_writing_sessions_service_write on wordgeni.writing_sessions for all to service_role
  using (true) with check (app_slug = 'wordgeni');

drop policy if exists wordgeni_provenance_items_select on wordgeni.provenance_items;
create policy wordgeni_provenance_items_select on wordgeni.provenance_items for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'wordgeni'));
drop policy if exists wordgeni_provenance_items_service_write on wordgeni.provenance_items;
create policy wordgeni_provenance_items_service_write on wordgeni.provenance_items for all to service_role
  using (true) with check (app_slug = 'wordgeni');

drop policy if exists crevux_projects_select on crevux.projects;
create policy crevux_projects_select on crevux.projects for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_projects_service_write on crevux.projects;
create policy crevux_projects_service_write on crevux.projects for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_assets_select on crevux.assets;
create policy crevux_assets_select on crevux.assets for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_assets_service_write on crevux.assets;
create policy crevux_assets_service_write on crevux.assets for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_generation_jobs_select on crevux.generation_jobs;
create policy crevux_generation_jobs_select on crevux.generation_jobs for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_generation_jobs_service_write on crevux.generation_jobs;
create policy crevux_generation_jobs_service_write on crevux.generation_jobs for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_exports_select on crevux.exports;
create policy crevux_exports_select on crevux.exports for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_exports_service_write on crevux.exports;
create policy crevux_exports_service_write on crevux.exports for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_provider_runs_select on crevux.provider_runs;
create policy crevux_provider_runs_select on crevux.provider_runs for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_provider_runs_service_write on crevux.provider_runs;
create policy crevux_provider_runs_service_write on crevux.provider_runs for all to service_role
  using (true) with check (app_slug = 'crevux');

drop policy if exists crevux_credit_spend_events_select on crevux.credit_spend_events;
create policy crevux_credit_spend_events_select on crevux.credit_spend_events for select to authenticated
  using (private.has_workspace_app_access(workspace_id, 'crevux'));
drop policy if exists crevux_credit_spend_events_service_write on crevux.credit_spend_events;
create policy crevux_credit_spend_events_service_write on crevux.credit_spend_events for all to service_role
  using (true) with check (app_slug = 'crevux');

revoke select on table core.app_connections from authenticated;
revoke select on table core.usage_events from authenticated;
revoke select on table core.billing_events from authenticated;
revoke select on table core.audit_logs from authenticated;
revoke select on table xflow.control_plane_events from authenticated;
revoke select on table xflow.app_links from authenticated;
revoke select on table verixet.billing_accounts from authenticated;
revoke select on table verixet.stripe_connections from authenticated;
revoke select on table verixet.checkout_sessions from authenticated;
revoke select on table verixet.entitlement_decisions from authenticated;
revoke select on table verixet.credit_ledger from authenticated;
revoke select on table verixet.usage_admission_logs from authenticated;

grant select on table core.profiles, core.workspaces, core.workspace_members, core.ecosystem_apps to authenticated;
grant select on table core.workspace_app_access, core.entitlements, core.user_consents to authenticated;
grant select on table xflow.runs, xflow.deployment_checks, xflow.workflow_runs to authenticated;
grant select on table audaix.audits, audaix.audit_reports, audaix.monitors, audaix.audit_findings, audaix.scan_jobs to authenticated;
grant select on table rataify.sites, rataify.reviews, rataify.issues, rataify.risk_events, rataify.evidence_items to authenticated;
grant select on table wordgeni.documents, wordgeni.document_sources, wordgeni.memory_cards, wordgeni.writing_sessions, wordgeni.provenance_items to authenticated;
grant select on table crevux.projects, crevux.assets, crevux.generation_jobs, crevux.exports, crevux.provider_runs, crevux.credit_spend_events to authenticated;

grant select, insert, update, delete on all tables in schema core to service_role;
grant select, insert, update, delete on all tables in schema xflow to service_role;
grant select, insert, update, delete on all tables in schema verixet to service_role;
grant select, insert, update, delete on all tables in schema audaix to service_role;
grant select, insert, update, delete on all tables in schema rataify to service_role;
grant select, insert, update, delete on all tables in schema wordgeni to service_role;
grant select, insert, update, delete on all tables in schema crevux to service_role;

alter default privileges in schema core revoke select on tables from authenticated, anon;
alter default privileges in schema xflow revoke select on tables from authenticated, anon;
alter default privileges in schema verixet revoke select on tables from authenticated, anon;
alter default privileges in schema audaix revoke select on tables from authenticated, anon;
alter default privileges in schema rataify revoke select on tables from authenticated, anon;
alter default privileges in schema wordgeni revoke select on tables from authenticated, anon;
alter default privileges in schema crevux revoke select on tables from authenticated, anon;
alter default privileges in schema core revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema xflow revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema verixet revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema audaix revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema rataify revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema wordgeni revoke insert, update, delete on tables from authenticated, anon;
alter default privileges in schema crevux revoke insert, update, delete on tables from authenticated, anon;

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
    and (c.relrowsecurity is not true or c.relforcerowsecurity is not true);
  if missing is not null then
    raise exception 'Protected ecosystem tables must have RLS and FORCE RLS enabled: %', missing;
  end if;

  select string_agg(format('%I.%I', n.nspname, p.proname), ', ')
  into missing
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
    and p.prosecdef is true;
  if missing is not null then
    raise exception 'Security-definer helpers must not live in exposed schemas: %', missing;
  end if;

  select string_agg(format('%I.%I', table_schema, table_name), ', ')
  into missing
  from information_schema.role_table_grants
  where grantee = 'authenticated'
    and privilege_type = 'SELECT'
    and (table_schema, table_name) in (
      ('core', 'app_connections'),
      ('core', 'usage_events'),
      ('core', 'billing_events'),
      ('core', 'audit_logs'),
      ('xflow', 'control_plane_events'),
      ('xflow', 'app_links'),
      ('verixet', 'billing_accounts'),
      ('verixet', 'stripe_connections'),
      ('verixet', 'checkout_sessions'),
      ('verixet', 'entitlement_decisions'),
      ('verixet', 'credit_ledger'),
      ('verixet', 'usage_admission_logs')
    );
  if missing is not null then
    raise exception 'Sensitive authority tables must not be directly SELECT-readable by authenticated: %', missing;
  end if;
end $$;
