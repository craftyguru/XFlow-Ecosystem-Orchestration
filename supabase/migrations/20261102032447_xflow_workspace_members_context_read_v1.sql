-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261102032447; name: xflow_workspace_members_context_read_v1; statement-join MD5: 49ee5e5073ae8558702f75ec4440c902

SET LOCAL xflow.remediation.target_project_ref = 'mjfzoikkoykszxzuebdf';
SET LOCAL xflow.remediation.change_ref = 'REVIEW_WORKSPACE_MEMBER_READ_V1';
-- DB-C11 REVIEW ONLY: public.workspace_members principal/workspace SELECT RLS.
-- No ACL, data, existing helper, default, core schema or app mutation.
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
SET LOCAL transaction_timeout = '45s';
DO $guard$
BEGIN
 IF current_setting('xflow.remediation.target_project_ref',true) IS DISTINCT FROM 'mjfzoikkoykszxzuebdf'
 OR current_setting('xflow.remediation.change_ref',true) IS DISTINCT FROM 'REVIEW_WORKSPACE_MEMBER_READ_V1'
 OR current_user <> 'postgres' OR session_user <> 'postgres' OR current_database() <> 'postgres'
 THEN RAISE EXCEPTION 'MEMBERSHIP_TARGET_ROLE_MARKER_STOP'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.workspace_members'::regclass AND relkind='r' AND relowner='postgres'::regrole AND NOT relrowsecurity AND NOT relforcerowsecurity)
 OR (SELECT to_jsonb(relacl) FROM pg_class WHERE oid='public.workspace_members'::regclass) IS DISTINCT FROM '["postgres=arwdDxtm/postgres","anon=r/postgres","authenticated=r/postgres","service_role=arwdDxtm/postgres"]'::jsonb
 OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid='public.workspace_members'::regclass)
 OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.workspace_members'::regclass AND attnum>0 AND attacl IS NOT NULL)
 OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.workspace_members'::regclass AND NOT tgisinternal)
 OR (SELECT count(*) FROM pg_attribute WHERE attrelid='public.workspace_members'::regclass AND attname IN('workspace_id','user_id')AND atttypid='text'::regtype AND attnotnull)<>2
 THEN RAISE EXCEPTION 'MEMBERSHIP_STATE_DRIFT_STOP'; END IF;
 IF md5(pg_get_functiondef('public.chronicle_can_access_user_row(text,text)'::regprocedure)) IS DISTINCT FROM 'e2fdff96c11c01a45e50404e9a1ea4ab' OR md5(pg_get_functiondef('public.chronicle_current_user_id()'::regprocedure)) IS DISTINCT FROM 'b46afd71babbbadaaa59fba6027a9c58' OR md5(pg_get_functiondef('public.chronicle_current_workspace_id()'::regprocedure)) IS DISTINCT FROM '4ff2fff758fe05a2616f5b55f785d2a7' OR md5(pg_get_functiondef('public.chronicle_service_role_enabled()'::regprocedure)) IS DISTINCT FROM 'cd14bbeed16fe820aeda267978cb1609' THEN RAISE EXCEPTION 'CHRONICLE_HELPER_DRIFT_STOP'; END IF;
END $guard$;
CREATE POLICY xflow_workspace_members_context_select_v1 ON public.workspace_members AS PERMISSIVE
 FOR SELECT TO anon, authenticated USING (
    workspace_id = (SELECT NULLIF(pg_catalog.current_setting('app.current_workspace_id', true), ''))
    AND user_id = (SELECT NULLIF(pg_catalog.current_setting('app.current_user_id', true), ''))
 );
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
DO $postcondition$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.workspace_members'::regclass AND relrowsecurity AND NOT relforcerowsecurity)
 OR (SELECT to_jsonb(relacl) FROM pg_class WHERE oid='public.workspace_members'::regclass) IS DISTINCT FROM '["postgres=arwdDxtm/postgres","anon=r/postgres","authenticated=r/postgres","service_role=arwdDxtm/postgres"]'::jsonb
 OR (SELECT count(*)FROM pg_policy WHERE polrelid='public.workspace_members'::regclass)<>1
 OR NOT EXISTS(SELECT 1 FROM pg_policy WHERE polrelid='public.workspace_members'::regclass AND polname='xflow_workspace_members_context_select_v1' AND polcmd='r' AND polpermissive AND polwithcheck IS NULL AND polroles=ARRAY['anon'::regrole::oid,'authenticated'::regrole::oid])
 THEN RAISE EXCEPTION 'MEMBERSHIP_POSTCONDITION_STOP'; END IF;
END $postcondition$;

