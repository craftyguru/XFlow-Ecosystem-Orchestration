#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { parseArgs, writeStateAtomic } from "./lib/provisioner-core.mjs";
import {
  DEFAULT_PHASE2F_DB_URL,
  redactDatabaseUrl,
  resolveDatabaseUrl,
  runPsqlJson,
  runPsqlText,
} from "./lib/postgres-cli-store.mjs";

const ids = {
  standardUser: "00000000-0000-4000-8000-000000002f01",
  deniedUser: "00000000-0000-4000-8000-000000002f02",
  outsiderUser: "00000000-0000-4000-8000-000000002f03",
  workspace: "00000000-0000-4000-8000-000000002f10",
};

export const DEFAULT_DB_FIXTURE_IDS = Object.freeze({ ...ids });

const markerSql = `'{"phase":"2F","label":"phase2f-production-proof","environment":"database-validation","isTest":true}'::jsonb`;

const snapshotSql = `
select jsonb_build_object(
  'auth.users', (select count(*) from auth.users),
  'core.workspaces', (select count(*) from core.workspaces),
  'core.workspace_members', (select count(*) from core.workspace_members),
  'core.workspace_app_access', (select count(*) from core.workspace_app_access),
  'core.app_connections', (select count(*) from core.app_connections),
  'xflow.app_links', (select count(*) from xflow.app_links),
  'verixet.billing_accounts', (select count(*) from verixet.billing_accounts),
  'verixet.entitlement_decisions', (select count(*) from verixet.entitlement_decisions),
  'rataify.sites', (select count(*) from rataify.sites),
  'rataify.reviews', (select count(*) from rataify.reviews),
  'rataify.issues', (select count(*) from rataify.issues),
  'rataify.evidence_items', (select count(*) from rataify.evidence_items),
  'audaix.audits', (select count(*) from audaix.audits),
  'audaix.audit_reports', (select count(*) from audaix.audit_reports),
  'audaix.audit_findings', (select count(*) from audaix.audit_findings),
  'crevux.projects', (select count(*) from crevux.projects),
  'crevux.assets', (select count(*) from crevux.assets),
  'crevux.exports', (select count(*) from crevux.exports),
  'wordgeni.documents', (select count(*) from wordgeni.documents),
  'wordgeni.document_sources', (select count(*) from wordgeni.document_sources),
  'wordgeni.provenance_items', (select count(*) from wordgeni.provenance_items)
)::text;
`;

const schemaIdentitySql = `
select jsonb_build_object(
  'database', current_database(),
  'schemas', (
    select jsonb_object_agg(schema_name, true)
    from information_schema.schemata
    where schema_name in ('auth','storage','core','xflow','verixet','rataify','audaix','crevux','wordgeni')
  ),
  'requiredTables', (
    select count(*)
    from information_schema.tables
    where table_schema in ('core','xflow','verixet','rataify','audaix','crevux','wordgeni')
  ),
  'ecosystemApps', (select count(*) from core.ecosystem_apps)
)::text;
`;

const collisionGuardSql = `
do $$
begin
  if exists (select 1 from auth.users where id in ('${ids.standardUser}','${ids.deniedUser}','${ids.outsiderUser}') and coalesce(raw_user_meta_data->>'label','') <> 'phase2f-production-proof') then
    raise exception 'Phase 2F auth user collision is not marked as test fixture';
  end if;
  if exists (select 1 from core.workspaces where id = '${ids.workspace}' and metadata->>'label' <> 'phase2f-production-proof') then
    raise exception 'Phase 2F workspace collision is not marked as test fixture';
  end if;
end $$;
`;

const provisionSql = `
${collisionGuardSql}
with
u1 as (
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  values ('${ids.standardUser}', 'phase2f.standard@example.invalid', 'phase2f-local-placeholder-not-a-real-login', now(), '{"provider":"email"}', ${markerSql} || '{"adapter":"auth","persona":"standard"}')
  on conflict (id) do nothing returning 'auth'::text as adapter
),
u2 as (
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  values ('${ids.deniedUser}', 'phase2f.denied@example.invalid', 'phase2f-local-placeholder-not-a-real-login', now(), '{"provider":"email"}', ${markerSql} || '{"adapter":"auth","persona":"denied"}')
  on conflict (id) do nothing returning 'auth'::text as adapter
),
u3 as (
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  values ('${ids.outsiderUser}', 'phase2f.outsider@example.invalid', 'phase2f-local-placeholder-not-a-real-login', now(), '{"provider":"email"}', ${markerSql} || '{"adapter":"auth","persona":"outsider"}')
  on conflict (id) do nothing returning 'auth'::text as adapter
),
w as (
  insert into core.workspaces (id, slug, name, created_by, status, metadata)
  values ('${ids.workspace}', 'ecosystem-production-proof-db-validation', 'Phase 2F Database Validation Workspace', '${ids.standardUser}', 'active', ${markerSql} || '{"adapter":"xflow"}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
m1 as (
  insert into core.workspace_members (id, workspace_id, user_id, role, status, created_by)
  values ('00000000-0000-4000-8000-000000002f11', '${ids.workspace}', '${ids.standardUser}', 'owner', 'active', '${ids.standardUser}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
m2 as (
  insert into core.workspace_members (id, workspace_id, user_id, role, status, created_by)
  values ('00000000-0000-4000-8000-000000002f12', '${ids.workspace}', '${ids.deniedUser}', 'viewer', 'active', '${ids.standardUser}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
access_rows as (
  insert into core.workspace_app_access (id, workspace_id, app_slug, status, granted_by, metadata)
  values
    ('00000000-0000-4000-8000-000000002f20', '${ids.workspace}', 'xflow', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f21', '${ids.workspace}', 'verixet', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f22', '${ids.workspace}', 'rataify', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f23', '${ids.workspace}', 'audaix', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f24', '${ids.workspace}', 'crevux', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f25', '${ids.workspace}', 'wordgeni', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
connection as (
  insert into core.app_connections (id, workspace_id, app_slug, connected_app_slug, status, connection_kind, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f26', '${ids.workspace}', 'xflow', 'verixet', 'active', 'billing_authority', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
links as (
  insert into xflow.app_links (id, workspace_id, app_slug, target_app_slug, status, created_by, metadata)
  values
    ('00000000-0000-4000-8000-000000002f30', '${ids.workspace}', 'xflow', 'verixet', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f31', '${ids.workspace}', 'xflow', 'rataify', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f32', '${ids.workspace}', 'xflow', 'audaix', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f33', '${ids.workspace}', 'xflow', 'crevux', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}'),
    ('00000000-0000-4000-8000-000000002f34', '${ids.workspace}', 'xflow', 'wordgeni', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"xflow"}')
  on conflict (id) do nothing returning 'xflow'::text as adapter
),
billing as (
  insert into verixet.billing_accounts (id, workspace_id, app_slug, status, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f40', '${ids.workspace}', 'verixet', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"verixet","stripeMutation":false}')
  on conflict (id) do nothing returning 'verixet'::text as adapter
),
deny_decision as (
  insert into verixet.entitlement_decisions (id, workspace_id, app_slug, target_app_slug, feature_key, decision, created_by, reason, metadata)
  values ('00000000-0000-4000-8000-000000002f41', '${ids.workspace}', 'verixet', 'crevux', 'phase2f.paid_action', 'deny', '${ids.deniedUser}', 'phase2f denied proof fixture', ${markerSql} || '{"adapter":"verixet"}')
  on conflict (id) do nothing returning 'verixet'::text as adapter
),
site as (
  insert into rataify.sites (id, workspace_id, app_slug, url, name, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f50', '${ids.workspace}', 'rataify', 'https://phase2f-ratify.example.invalid', 'Phase 2F RatAiFy fixture', '${ids.standardUser}', ${markerSql} || '{"adapter":"rataify"}')
  on conflict (id) do nothing returning 'rataify'::text as adapter
),
review as (
  insert into rataify.reviews (id, workspace_id, app_slug, site_id, rating, status, created_by, content)
  values ('00000000-0000-4000-8000-000000002f51', '${ids.workspace}', 'rataify', '00000000-0000-4000-8000-000000002f50', 0, 'completed', '${ids.standardUser}', ${markerSql} || '{"adapter":"rataify","fixture":"review"}')
  on conflict (id) do nothing returning 'rataify'::text as adapter
),
issue as (
  insert into rataify.issues (id, workspace_id, app_slug, site_id, severity, title, status, created_by, details)
  values ('00000000-0000-4000-8000-000000002f52', '${ids.workspace}', 'rataify', '00000000-0000-4000-8000-000000002f50', 'info', 'Phase 2F stored issue', 'open', '${ids.standardUser}', ${markerSql} || '{"adapter":"rataify"}')
  on conflict (id) do nothing returning 'rataify'::text as adapter
),
evidence as (
  insert into rataify.evidence_items (id, workspace_id, app_slug, site_id, storage_path, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f53', '${ids.workspace}', 'rataify', '00000000-0000-4000-8000-000000002f50', null, '${ids.standardUser}', ${markerSql} || '{"adapter":"rataify","storageWrite":false}')
  on conflict (id) do nothing returning 'rataify'::text as adapter
),
audit as (
  insert into audaix.audits (id, workspace_id, app_slug, target_url, status, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f60', '${ids.workspace}', 'audaix', 'https://phase2f-audaix.example.invalid', 'completed', '${ids.standardUser}', ${markerSql} || '{"adapter":"audaix"}')
  on conflict (id) do nothing returning 'audaix'::text as adapter
),
audit_report as (
  insert into audaix.audit_reports (id, workspace_id, app_slug, audit_id, status, created_by, report)
  values ('00000000-0000-4000-8000-000000002f61', '${ids.workspace}', 'audaix', '00000000-0000-4000-8000-000000002f60', 'published', '${ids.standardUser}', ${markerSql} || '{"adapter":"audaix","fixture":"report"}')
  on conflict (id) do nothing returning 'audaix'::text as adapter
),
audit_finding as (
  insert into audaix.audit_findings (id, workspace_id, app_slug, audit_id, severity, title, created_by, details)
  values ('00000000-0000-4000-8000-000000002f62', '${ids.workspace}', 'audaix', '00000000-0000-4000-8000-000000002f60', 'info', 'Phase 2F stored evidence', '${ids.standardUser}', ${markerSql} || '{"adapter":"audaix"}')
  on conflict (id) do nothing returning 'audaix'::text as adapter
),
project as (
  insert into crevux.projects (id, workspace_id, app_slug, name, status, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f70', '${ids.workspace}', 'crevux', 'Phase 2F Crevux project', 'active', '${ids.standardUser}', ${markerSql} || '{"adapter":"crevux"}')
  on conflict (id) do nothing returning 'crevux'::text as adapter
),
asset as (
  insert into crevux.assets (id, workspace_id, app_slug, project_id, asset_type, storage_path, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f71', '${ids.workspace}', 'crevux', '00000000-0000-4000-8000-000000002f70', 'placeholder', null, '${ids.standardUser}', ${markerSql} || '{"adapter":"crevux","providerCall":false}')
  on conflict (id) do nothing returning 'crevux'::text as adapter
),
export_row as (
  insert into crevux.exports (id, workspace_id, app_slug, project_id, storage_path, status, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f72', '${ids.workspace}', 'crevux', '00000000-0000-4000-8000-000000002f70', null, 'completed', '${ids.standardUser}', ${markerSql} || '{"adapter":"crevux","storageWrite":false}')
  on conflict (id) do nothing returning 'crevux'::text as adapter
),
document as (
  insert into wordgeni.documents (id, workspace_id, app_slug, title, status, created_by, metadata)
  values ('00000000-0000-4000-8000-000000002f80', '${ids.workspace}', 'wordgeni', 'Phase 2F source-backed document', 'ready', '${ids.standardUser}', ${markerSql} || '{"adapter":"wordgeni"}')
  on conflict (id) do nothing returning 'wordgeni'::text as adapter
),
source as (
  insert into wordgeni.document_sources (id, workspace_id, app_slug, document_id, source_type, created_by, payload)
  values ('00000000-0000-4000-8000-000000002f81', '${ids.workspace}', 'wordgeni', '00000000-0000-4000-8000-000000002f80', 'fixture', '${ids.standardUser}', ${markerSql} || '{"adapter":"wordgeni","providerCall":false}')
  on conflict (id) do nothing returning 'wordgeni'::text as adapter
),
provenance as (
  insert into wordgeni.provenance_items (id, workspace_id, app_slug, document_id, created_by, payload)
  values ('00000000-0000-4000-8000-000000002f82', '${ids.workspace}', 'wordgeni', '00000000-0000-4000-8000-000000002f80', '${ids.standardUser}', ${markerSql} || '{"adapter":"wordgeni"}')
  on conflict (id) do nothing returning 'wordgeni'::text as adapter
),
created as (
  select adapter from u1 union all select adapter from u2 union all select adapter from u3
  union all select adapter from w union all select adapter from m1 union all select adapter from m2 union all select adapter from access_rows union all select adapter from connection union all select adapter from links
  union all select adapter from billing union all select adapter from deny_decision
  union all select adapter from site union all select adapter from review union all select adapter from issue union all select adapter from evidence
  union all select adapter from audit union all select adapter from audit_report union all select adapter from audit_finding
  union all select adapter from project union all select adapter from asset union all select adapter from export_row
  union all select adapter from document union all select adapter from source union all select adapter from provenance
),
expected(adapter, expected_count) as (
  values ('auth', 3), ('xflow', 15), ('verixet', 2), ('rataify', 4), ('audaix', 3), ('crevux', 3), ('wordgeni', 3)
),
created_counts as (
  select adapter, count(*)::int as created_count from created group by adapter
)
select jsonb_build_object(
  'created', (select jsonb_object_agg(expected.adapter, coalesce(created_count, 0)) from expected left join created_counts using (adapter)),
  'reused', (select jsonb_object_agg(expected.adapter, expected_count - coalesce(created_count, 0)) from expected left join created_counts using (adapter)),
  'expected', (select jsonb_object_agg(adapter, expected_count) from expected)
)::text;
`;

const verifySql = `
with counts as (
  select 'auth' adapter, count(*)::int fixture_count from auth.users where id in ('${ids.standardUser}','${ids.deniedUser}','${ids.outsiderUser}') and raw_user_meta_data->>'label' = 'phase2f-production-proof'
  union all select 'xflow', (
    (select count(*) from core.workspaces where id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from core.workspace_members where workspace_id='${ids.workspace}' and user_id in ('${ids.standardUser}','${ids.deniedUser}')) +
    (select count(*) from core.workspace_app_access where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from core.app_connections where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from xflow.app_links where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof')
  )::int
  union all select 'verixet', (
    (select count(*) from verixet.billing_accounts where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from verixet.entitlement_decisions where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' and decision='deny')
  )::int
  union all select 'rataify', (
    (select count(*) from rataify.sites where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.reviews where workspace_id='${ids.workspace}' and content->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.issues where workspace_id='${ids.workspace}' and details->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.evidence_items where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof')
  )::int
  union all select 'audaix', (
    (select count(*) from audaix.audits where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from audaix.audit_reports where workspace_id='${ids.workspace}' and report->>'label'='phase2f-production-proof') +
    (select count(*) from audaix.audit_findings where workspace_id='${ids.workspace}' and details->>'label'='phase2f-production-proof')
  )::int
  union all select 'crevux', (
    (select count(*) from crevux.projects where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from crevux.assets where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from crevux.exports where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof')
  )::int
  union all select 'wordgeni', (
    (select count(*) from wordgeni.documents where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof') +
    (select count(*) from wordgeni.document_sources where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof') +
    (select count(*) from wordgeni.provenance_items where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof')
  )::int
),
expected(adapter, expected_count) as (
  values ('auth', 3), ('xflow', 15), ('verixet', 2), ('rataify', 4), ('audaix', 3), ('crevux', 3), ('wordgeni', 3)
),
provider_cost_absence as (
  select jsonb_build_object(
    'rataify.risk_events', (select count(*) from rataify.risk_events where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof'),
    'audaix.scan_jobs', (select count(*) from audaix.scan_jobs where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof'),
    'crevux.generation_jobs', (select count(*) from crevux.generation_jobs where workspace_id='${ids.workspace}' and request->>'label'='phase2f-production-proof'),
    'crevux.provider_runs', (select count(*) from crevux.provider_runs where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof'),
    'crevux.credit_spend_events', (select count(*) from crevux.credit_spend_events where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof'),
    'wordgeni.writing_sessions', (select count(*) from wordgeni.writing_sessions where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof')
  ) value
),
denied as (
  select count(*)::int deny_count
  from verixet.entitlement_decisions
  where workspace_id='${ids.workspace}' and target_app_slug='crevux' and feature_key='phase2f.paid_action' and decision='deny'
)
select jsonb_build_object(
  'counts', (select jsonb_object_agg(counts.adapter, fixture_count) from counts),
  'expected', (select jsonb_object_agg(adapter, expected_count) from expected),
  'countsMatch', not exists (select 1 from expected left join counts using (adapter) where coalesce(fixture_count, 0) <> expected_count),
  'deniedEntitlementRows', (select deny_count from denied),
  'providerCostRows', (select value from provider_cost_absence)
)::text;
`;

const rlsSql = `
begin;
set local role authenticated;
set local request.jwt.claim.sub = '${ids.standardUser}';
set local request.jwt.claim.role = 'authenticated';
select jsonb_build_object('persona','standard','visibleWorkspaceCount',(select count(*) from core.workspaces where id='${ids.workspace}'))::text;
commit;
begin;
set local role authenticated;
set local request.jwt.claim.sub = '${ids.outsiderUser}';
set local request.jwt.claim.role = 'authenticated';
select jsonb_build_object('persona','outsider','visibleWorkspaceCount',(select count(*) from core.workspaces where id='${ids.workspace}'))::text;
commit;
`;

const collisionProbeSql = `
begin;
insert into core.workspaces (id, slug, name, created_by, status, metadata)
values ('00000000-0000-4000-8000-000000002f99', 'ecosystem-production-proof-db-validation-collision', 'Unmarked collision probe', null, 'active', '{}'::jsonb);
select jsonb_build_object(
  'unmarkedCollisionDetected',
  exists (
    select 1 from core.workspaces
    where slug = 'ecosystem-production-proof-db-validation-collision'
      and coalesce(metadata->>'label','') <> 'phase2f-production-proof'
  )
)::text;
rollback;
`;

const cleanupSql = `
with
d_wordgeni_provenance as (delete from wordgeni.provenance_items where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof' returning 'wordgeni'::text adapter),
d_wordgeni_sources as (delete from wordgeni.document_sources where workspace_id='${ids.workspace}' and payload->>'label'='phase2f-production-proof' returning 'wordgeni'::text adapter),
d_wordgeni_documents as (delete from wordgeni.documents where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'wordgeni'::text adapter),
d_crevux_exports as (delete from crevux.exports where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'crevux'::text adapter),
d_crevux_assets as (delete from crevux.assets where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'crevux'::text adapter),
d_crevux_projects as (delete from crevux.projects where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'crevux'::text adapter),
d_audaix_findings as (delete from audaix.audit_findings where workspace_id='${ids.workspace}' and details->>'label'='phase2f-production-proof' returning 'audaix'::text adapter),
d_audaix_reports as (delete from audaix.audit_reports where workspace_id='${ids.workspace}' and report->>'label'='phase2f-production-proof' returning 'audaix'::text adapter),
d_audaix_audits as (delete from audaix.audits where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'audaix'::text adapter),
d_rataify_evidence as (delete from rataify.evidence_items where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'rataify'::text adapter),
d_rataify_issues as (delete from rataify.issues where workspace_id='${ids.workspace}' and details->>'label'='phase2f-production-proof' returning 'rataify'::text adapter),
d_rataify_reviews as (delete from rataify.reviews where workspace_id='${ids.workspace}' and content->>'label'='phase2f-production-proof' returning 'rataify'::text adapter),
d_rataify_sites as (delete from rataify.sites where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'rataify'::text adapter),
d_verixet_decisions as (delete from verixet.entitlement_decisions where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'verixet'::text adapter),
d_verixet_accounts as (delete from verixet.billing_accounts where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'verixet'::text adapter),
d_xflow_links as (delete from xflow.app_links where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'xflow'::text adapter),
d_connections as (delete from core.app_connections where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'xflow'::text adapter),
d_access as (delete from core.workspace_app_access where workspace_id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'xflow'::text adapter),
d_members as (delete from core.workspace_members where workspace_id='${ids.workspace}' and user_id in ('${ids.standardUser}','${ids.deniedUser}') returning 'xflow'::text adapter),
d_workspace as (delete from core.workspaces where id='${ids.workspace}' and metadata->>'label'='phase2f-production-proof' returning 'xflow'::text adapter),
d_auth as (delete from auth.users where id in ('${ids.standardUser}','${ids.deniedUser}','${ids.outsiderUser}') and raw_user_meta_data->>'label'='phase2f-production-proof' returning 'auth'::text adapter),
deleted as (
  select adapter from d_wordgeni_provenance union all select adapter from d_wordgeni_sources union all select adapter from d_wordgeni_documents
  union all select adapter from d_crevux_exports union all select adapter from d_crevux_assets union all select adapter from d_crevux_projects
  union all select adapter from d_audaix_findings union all select adapter from d_audaix_reports union all select adapter from d_audaix_audits
  union all select adapter from d_rataify_evidence union all select adapter from d_rataify_issues union all select adapter from d_rataify_reviews union all select adapter from d_rataify_sites
  union all select adapter from d_verixet_decisions union all select adapter from d_verixet_accounts
  union all select adapter from d_xflow_links union all select adapter from d_connections union all select adapter from d_access union all select adapter from d_members union all select adapter from d_workspace
  union all select adapter from d_auth
)
select jsonb_build_object('deleted', (select jsonb_object_agg(adapter, count) from (select adapter, count(*)::int from deleted group by adapter) d))::text;
`;

const cleanupVerifySql = `
select jsonb_build_object(
  'remainingMarkedRows',
  (
    (select count(*) from auth.users where raw_user_meta_data->>'label'='phase2f-production-proof') +
    (select count(*) from core.workspaces where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from core.workspace_app_access where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from core.app_connections where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from xflow.app_links where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from verixet.billing_accounts where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from verixet.entitlement_decisions where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.sites where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.reviews where content->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.issues where details->>'label'='phase2f-production-proof') +
    (select count(*) from rataify.evidence_items where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from audaix.audits where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from audaix.audit_reports where report->>'label'='phase2f-production-proof') +
    (select count(*) from audaix.audit_findings where details->>'label'='phase2f-production-proof') +
    (select count(*) from crevux.projects where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from crevux.assets where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from crevux.exports where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from wordgeni.documents where metadata->>'label'='phase2f-production-proof') +
    (select count(*) from wordgeni.document_sources where payload->>'label'='phase2f-production-proof') +
    (select count(*) from wordgeni.provenance_items where payload->>'label'='phase2f-production-proof')
  )
)::text;
`;

function replaceAllLiteral(input, from, to) {
  return input.split(from).join(to);
}

function sqlForIds(sql, fixtureIds = DEFAULT_DB_FIXTURE_IDS) {
  let next = sql;
  for (const [key, value] of Object.entries(DEFAULT_DB_FIXTURE_IDS)) {
    next = replaceAllLiteral(next, value, fixtureIds[key] ?? value);
  }
  return next;
}

function omitAuthInsertCtes(sql) {
  return sql
    .replace(/u1 as \([\s\S]*?on conflict \(id\) do nothing returning 'auth'::text as adapter\s*\),/, "u1 as (select null::text as adapter where false),")
    .replace(/u2 as \([\s\S]*?on conflict \(id\) do nothing returning 'auth'::text as adapter\s*\),/, "u2 as (select null::text as adapter where false),")
    .replace(/u3 as \([\s\S]*?on conflict \(id\) do nothing returning 'auth'::text as adapter\s*\),/, "u3 as (select null::text as adapter where false),");
}

export function fixtureIdsFromAuthResults(authResults = []) {
  const byRole = Object.fromEntries(authResults.map((entry) => [entry.role, entry.user?.id]));
  for (const role of ["standard", "denied", "outsider"]) {
    if (!byRole[role]) throw new Error(`missing Phase 2F auth user id for ${role}`);
  }
  return {
    ...DEFAULT_DB_FIXTURE_IDS,
    standardUser: byRole.standard,
    deniedUser: byRole.denied,
    outsiderUser: byRole.outsider,
  };
}

function buildProvisionSql({ fixtureIds = DEFAULT_DB_FIXTURE_IDS, includeAuthUserInserts = true } = {}) {
  const sql = includeAuthUserInserts ? provisionSql : omitAuthInsertCtes(provisionSql);
  return sqlForIds(sql, fixtureIds);
}

function buildVerifySql({ fixtureIds = DEFAULT_DB_FIXTURE_IDS } = {}) {
  return sqlForIds(verifySql, fixtureIds);
}

function buildRlsSql({ fixtureIds = DEFAULT_DB_FIXTURE_IDS } = {}) {
  return sqlForIds(rlsSql, fixtureIds);
}

function buildCleanupSql({ fixtureIds = DEFAULT_DB_FIXTURE_IDS, includeAuthUserDelete = true } = {}) {
  const sql = includeAuthUserDelete
    ? cleanupSql
    : cleanupSql.replace(
        /d_auth as \(delete from auth\.users[\s\S]*?returning 'auth'::text adapter\),/,
        "d_auth as (select null::text as adapter where false),",
      );
  return sqlForIds(sql, fixtureIds);
}

function buildCleanupVerifySql({ fixtureIds = DEFAULT_DB_FIXTURE_IDS } = {}) {
  return sqlForIds(cleanupVerifySql, fixtureIds);
}

export function assertDatabaseLifecycle(condition, message) {
  if (!condition) throw new Error(message);
}

function target(databaseUrl) {
  return {
    kind: databaseUrl === DEFAULT_PHASE2F_DB_URL ? "local-disposable-postgresql" : "configured-postgresql",
    databaseUrl: redactDatabaseUrl(databaseUrl),
  };
}

export function runDatabaseSchemaIdentity({ databaseUrl }) {
  const schemaIdentity = runPsqlJson({ databaseUrl, sql: schemaIdentitySql, label: "schema-identity" });
  assertDatabaseLifecycle(schemaIdentity.ecosystemApps === 6, "expected six seeded ecosystem apps");
  assertDatabaseLifecycle(schemaIdentity.requiredTables >= 48, "expected migrated ecosystem tables");
  return schemaIdentity;
}

export function runDatabaseProvision({ databaseUrl, phase = "2F.5A", authResults = null }) {
  const fixtureIds = authResults ? fixtureIdsFromAuthResults(authResults) : DEFAULT_DB_FIXTURE_IDS;
  const includeAuthUserInserts = !authResults;
  const startedAt = new Date().toISOString();
  const result = {
    phase,
    command: "provision",
    target: target(databaseUrl),
    authMode: includeAuthUserInserts ? "local-database-compatibility" : "supabase-auth-admin",
    startedAt,
    schemaIdentity: runDatabaseSchemaIdentity({ databaseUrl }),
    beforeCounts: runPsqlJson({ databaseUrl, sql: snapshotSql, label: "before-counts" }),
    collisionProbe: runPsqlJson({ databaseUrl, sql: sqlForIds(collisionProbeSql, fixtureIds), label: "collision-probe" }),
  };
  assertDatabaseLifecycle(result.collisionProbe.unmarkedCollisionDetected === true, "expected unmarked collision probe to be detected");
  result.provision = runPsqlJson({ databaseUrl, sql: buildProvisionSql({ fixtureIds, includeAuthUserInserts }), label: "provision" });
  result.verify = runDatabaseVerify({ databaseUrl, phase, fixtureIds }).verify;
  result.completedAt = new Date().toISOString();
  result.ok = true;
  return result;
}

export function runDatabaseVerify({ databaseUrl, phase = "2F.5A", fixtureIds = DEFAULT_DB_FIXTURE_IDS }) {
  const startedAt = new Date().toISOString();
  const verify = runPsqlJson({ databaseUrl, sql: buildVerifySql({ fixtureIds }), label: "verify" });
  assertDatabaseLifecycle(verify.countsMatch === true, "verification counts did not match expected fixture counts");
  const rls = runPsqlText({ databaseUrl, sql: buildRlsSql({ fixtureIds }), label: "rls-visibility" }).stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  assertDatabaseLifecycle(rls.find((row) => row.persona === "standard")?.visibleWorkspaceCount === 1, "standard persona should see proof workspace through RLS");
  assertDatabaseLifecycle(rls.find((row) => row.persona === "outsider")?.visibleWorkspaceCount === 0, "outsider persona should not see proof workspace through RLS");
  return {
    phase,
    command: "verify",
    target: target(databaseUrl),
    startedAt,
    verify,
    rls,
    completedAt: new Date().toISOString(),
    ok: true,
  };
}

export function runDatabaseCleanup({ databaseUrl, phase = "2F.5A", dryRun = false, authResults = null }) {
  const fixtureIds = authResults ? fixtureIdsFromAuthResults(authResults) : DEFAULT_DB_FIXTURE_IDS;
  const includeAuthUserDelete = !authResults;
  const startedAt = new Date().toISOString();
  const beforeCounts = runPsqlJson({ databaseUrl, sql: snapshotSql, label: "cleanup-before-counts" });
  if (dryRun) {
    return {
      phase,
      command: "cleanup",
      dryRun: true,
      target: target(databaseUrl),
      startedAt,
      beforeCounts,
      cleanupSafety: [
        "delete only Phase 2F marked rows",
        "delete in dependency order",
        "refuse unmarked collisions before provision",
        "preserve unrelated row counts",
      ],
      completedAt: new Date().toISOString(),
      ok: true,
    };
  }
  const cleanup = runPsqlJson({ databaseUrl, sql: buildCleanupSql({ fixtureIds, includeAuthUserDelete }), label: "cleanup" });
  const cleanupVerify = runPsqlJson({ databaseUrl, sql: buildCleanupVerifySql({ fixtureIds }), label: "cleanup-verify" });
  const afterCounts = runPsqlJson({ databaseUrl, sql: snapshotSql, label: "cleanup-after-counts" });
  assertDatabaseLifecycle(cleanupVerify.remainingMarkedRows === 0, "cleanup left marked Phase 2F rows behind");
  return {
    phase,
    command: "cleanup",
    dryRun: false,
    target: target(databaseUrl),
    startedAt,
    beforeCounts,
    cleanup,
    cleanupVerify,
    afterCounts,
    completedAt: new Date().toISOString(),
    ok: true,
  };
}

export function runDatabaseLifecycle({ databaseUrl, phase = "2F.4B" }) {
  const startedAt = new Date().toISOString();
  const result = {
    phase,
    target: target(databaseUrl),
    startedAt,
    schemaIdentity: runDatabaseSchemaIdentity({ databaseUrl }),
    beforeCounts: runPsqlJson({ databaseUrl, sql: snapshotSql, label: "before-counts" }),
  };

  result.collisionProbe = runPsqlJson({ databaseUrl, sql: collisionProbeSql, label: "collision-probe" });
  assertDatabaseLifecycle(result.collisionProbe.unmarkedCollisionDetected === true, "expected unmarked collision probe to be detected");

  result.firstProvision = runPsqlJson({ databaseUrl, sql: buildProvisionSql(), label: "first-provision" });
  result.firstVerify = runDatabaseVerify({ databaseUrl, phase }).verify;
  result.secondProvision = runPsqlJson({ databaseUrl, sql: buildProvisionSql(), label: "second-provision" });
  result.secondVerify = runDatabaseVerify({ databaseUrl, phase }).verify;

  assertDatabaseLifecycle(result.firstVerify.countsMatch === true, "first verification counts did not match expected fixture counts");
  assertDatabaseLifecycle(result.secondVerify.countsMatch === true, "second verification counts did not match expected fixture counts");
  for (const [adapter, expected] of Object.entries(result.firstProvision.expected)) {
    assertDatabaseLifecycle(result.firstProvision.created[adapter] === expected, `expected ${adapter} first provision to create ${expected}`);
    assertDatabaseLifecycle(result.secondProvision.reused[adapter] === expected, `expected ${adapter} second provision to reuse ${expected}`);
  }

  result.rls = runDatabaseVerify({ databaseUrl, phase }).rls;
  result.cleanupDryRun = runDatabaseCleanup({ databaseUrl, phase, dryRun: true });
  result.cleanup = runDatabaseCleanup({ databaseUrl, phase, dryRun: false }).cleanup;
  result.cleanupVerify = runPsqlJson({ databaseUrl, sql: buildCleanupVerifySql(), label: "cleanup-verify" });
  result.afterCounts = runPsqlJson({ databaseUrl, sql: snapshotSql, label: "after-counts" });
  assertDatabaseLifecycle(result.cleanupVerify.remainingMarkedRows === 0, "cleanup left marked Phase 2F rows behind");
  assertDatabaseLifecycle(JSON.stringify(result.beforeCounts) === JSON.stringify(result.afterCounts), "unrelated table counts changed after cleanup");

  result.completedAt = new Date().toISOString();
  result.ok = true;
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  if (args.environment === "production") {
    throw new Error("phase2f:fixtures:validate-db refuses production targets");
  }
  if (!args.confirmTestFixtures) {
    throw new Error("phase2f:fixtures:validate-db requires --confirm-test-fixtures");
  }
  const databaseUrl = resolveDatabaseUrl();
  const result = runDatabaseLifecycle({ databaseUrl, phase: "2F.4B" });
  writeStateAtomic({
    phase: "2F.4B",
    status: "DATABASE_ADAPTER_VALIDATION_PASSED",
    updatedAt: result.completedAt,
    resourcesCreated: false,
    productionMutation: false,
    databaseValidation: result,
  });
  console.log(JSON.stringify(result, null, 2));
}
