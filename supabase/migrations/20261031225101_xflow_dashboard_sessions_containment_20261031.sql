-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261031225101; name: xflow_dashboard_sessions_containment_20261031; statement-join MD5: fa696edeeafea7d10f808427625ea84e

SET xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET xflow.remediation.change_ref='ROB_AUTH_REQUIRED_DASHBOARD_SESSION_CONTAINMENT_20261031';
-- NOT APPLIED. Single server-owned session table only; no row DML/defaults/other objects.
BEGIN;
SET LOCAL lock_timeout='2s';
SET LOCAL statement_timeout='15s';
DO $guard$ BEGIN
 IF current_database()<>'postgres' OR current_user<>'postgres'
 OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND NOT rolsuper AND rolbypassrls)
 OR current_setting('xflow.remediation.target_project_ref',true) IS DISTINCT FROM 'mjfzoikkoykszxzuebdf'
 OR current_setting('xflow.remediation.change_ref',true) IS DISTINCT FROM 'ROB_AUTH_REQUIRED_DASHBOARD_SESSION_CONTAINMENT_20261031'
 THEN RAISE EXCEPTION 'EXACT_TARGET_AND_AUTHORITY_REQUIRED'; END IF;
END $guard$;
LOCK TABLE public.dashboard_sessions IN ACCESS EXCLUSIVE MODE;
DO $pre$ DECLARE c record; acl text[]; shape text; BEGIN
 SELECT x.*,pg_get_userbyid(x.relowner) owner_name INTO c FROM pg_class x WHERE x.oid='public.dashboard_sessions'::regclass;
 SELECT ARRAY(SELECT a::text FROM unnest(c.relacl)a ORDER BY a::text) INTO acl;
 SELECT md5(string_agg(a.attname||'|'||format_type(a.atttypid,a.atttypmod)||'|'||a.attnotnull::text,';' ORDER BY a.attnum)) INTO shape FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped;
 IF c.relkind<>'r' OR c.owner_name<>'postgres' OR c.relforcerowsecurity
 OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=c.oid)
 OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=c.oid AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL)
 OR EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN('anon','authenticated'))
 OR (SELECT count(*) FROM pg_roles WHERE rolname IN('anon','authenticated') AND NOT rolsuper AND NOT rolbypassrls)<>2
 OR shape IS DISTINCT FROM '2b51ef3afc3804366bb25f740f0b18c5'
 OR NOT (((NOT c.relrowsecurity AND acl=ARRAY['anon=arwdDxtm/postgres','authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']) OR (c.relrowsecurity AND acl=ARRAY['postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'])))
 THEN RAISE EXCEPTION 'SESSION_TABLE_ROLE_ACL_POLICY_OR_SHAPE_DRIFT'; END IF;
END $pre$;
REVOKE ALL PRIVILEGES ON TABLE public.dashboard_sessions FROM anon,authenticated,PUBLIC;
ALTER TABLE public.dashboard_sessions ENABLE ROW LEVEL SECURITY;
DO $post$ DECLARE r text; p text; BEGIN
 FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF has_table_privilege(r,'public.dashboard_sessions','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
  OR has_any_column_privilege(r,'public.dashboard_sessions','SELECT,INSERT,UPDATE,REFERENCES')
  THEN RAISE EXCEPTION 'CLIENT_ACCESS_REMAINS'; END IF;
 END LOOP;
 FOREACH r IN ARRAY ARRAY['postgres','service_role'] LOOP
  FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] LOOP
   IF NOT has_table_privilege(r,'public.dashboard_sessions',p) THEN RAISE EXCEPTION 'BACKEND_PRIVILEGE_LOST'; END IF;
  END LOOP;
 END LOOP;
END $post$;
COMMIT;

