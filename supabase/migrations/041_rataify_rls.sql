alter table rataify.sites enable row level security;
alter table rataify.reviews enable row level security;
alter table rataify.issues enable row level security;
alter table rataify.risk_events enable row level security;
alter table rataify.evidence_items enable row level security;

drop policy if exists rataify_sites_select on rataify.sites;
create policy rataify_sites_select on rataify.sites for select
  using (core.has_workspace_app_access(workspace_id, 'rataify') or core.is_service_role());
drop policy if exists rataify_sites_service_write on rataify.sites;
create policy rataify_sites_service_write on rataify.sites for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'rataify');

drop policy if exists rataify_reviews_select on rataify.reviews;
create policy rataify_reviews_select on rataify.reviews for select
  using (core.has_workspace_app_access(workspace_id, 'rataify') or core.is_service_role());
drop policy if exists rataify_reviews_service_write on rataify.reviews;
create policy rataify_reviews_service_write on rataify.reviews for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'rataify');

drop policy if exists rataify_issues_select on rataify.issues;
create policy rataify_issues_select on rataify.issues for select
  using (core.has_workspace_app_access(workspace_id, 'rataify') or core.is_service_role());
drop policy if exists rataify_issues_service_write on rataify.issues;
create policy rataify_issues_service_write on rataify.issues for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'rataify');

drop policy if exists rataify_risk_events_select on rataify.risk_events;
create policy rataify_risk_events_select on rataify.risk_events for select
  using (core.has_workspace_app_access(workspace_id, 'rataify') or core.is_service_role());
drop policy if exists rataify_risk_events_service_write on rataify.risk_events;
create policy rataify_risk_events_service_write on rataify.risk_events for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'rataify');

drop policy if exists rataify_evidence_items_select on rataify.evidence_items;
create policy rataify_evidence_items_select on rataify.evidence_items for select
  using (core.has_workspace_app_access(workspace_id, 'rataify') or core.is_service_role());
drop policy if exists rataify_evidence_items_service_write on rataify.evidence_items;
create policy rataify_evidence_items_service_write on rataify.evidence_items for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'rataify');

revoke all on schema rataify from anon, authenticated;
