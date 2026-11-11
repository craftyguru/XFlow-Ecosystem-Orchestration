-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261101013317; name: xflow_postgres_public_defaults_20261101; statement-join MD5: ec87e33b36829720ca43cfb4960caa56

SET xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET xflow.remediation.change_ref='REVIEW_DEFAULT_POSTGRES_PUBLIC_20261101';
-- REVIEW ONLY / NOT APPLIED. F01.2 postgres public. 
-- public component removes explicit client defaults only; PUBLIC function EXECUTE requires separate global component.
-- global component affects FUTURE functions/routines created by this role IN EVERY SCHEMA. Existing object grants stay unchanged.
-- Apply public before function-global. Reverse function-global before public. No role elevation or migration registration here.
BEGIN;
SET LOCAL lock_timeout='2s'; SET LOCAL statement_timeout='15s';
DO $identity$
BEGIN
 IF current_database()<>'postgres' OR current_user<>'postgres' OR session_user<>'postgres'
 OR current_setting('xflow.remediation.target_project_ref',true)IS DISTINCT FROM'mjfzoikkoykszxzuebdf'
 OR current_setting('xflow.remediation.change_ref',true)IS DISTINCT FROM'REVIEW_DEFAULT_POSTGRES_PUBLIC_20261101'
 OR current_setting('server_version_num')::int/10000<>17
 OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolsuper=false AND rolbypassrls)
 THEN RAISE EXCEPTION 'DEFAULT_IDENTITY_AND_AUTHORITY_STOP';END IF;
 IF EXISTS(SELECT 1 FROM pg_auth_members WHERE member IN('anon'::regrole,'authenticated'::regrole))
 OR EXISTS(SELECT 1 FROM pg_roles WHERE rolname IN('anon','authenticated')AND(rolsuper OR rolbypassrls))
 THEN RAISE EXCEPTION 'DEFAULT_CLIENT_ROLE_DRIFT_STOP';END IF;
END $identity$;
DO $pre$
DECLARE actual text[];
BEGIN
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='S';
 IF actual IS DISTINCT FROM ARRAY['anon=rwU/postgres','authenticated=rwU/postgres','postgres=rwU/postgres','service_role=rwU/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres S'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='f';
 IF actual IS DISTINCT FROM ARRAY['anon=X/postgres','authenticated=X/postgres','postgres=X/postgres','service_role=X/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres f'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='r';
 IF actual IS DISTINCT FROM ARRAY['anon=arwdDxtm/postgres','authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres r'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace=0 AND defaclobjtype='f';
 IF actual IS DISTINCT FROM NULL::text[] THEN RAISE EXCEPTION 'DEFAULT_GLOBAL_F_DRIFT_STOP'; END IF;
 IF EXISTS(SELECT 1 FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace=0 AND defaclobjtype IN('r','S'))THEN RAISE EXCEPTION 'DEFAULT_GLOBAL_RS_DRIFT_STOP';END IF;
END $pre$;
CREATE TEMP TABLE defaults_scope_snapshot ON COMMIT DROP AS SELECT (SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(defaclrole),'schema',CASE WHEN defaclnamespace=0 THEN NULL ELSE n.nspname END,'type',defaclobjtype,'acl',(SELECT jsonb_agg(a::text ORDER BY a::text)FROM unnest(defaclacl)a))ORDER BY defaclrole,defaclnamespace,defaclobjtype)FROM pg_default_acl dd LEFT JOIN pg_namespace n ON n.oid=dd.defaclnamespace WHERE NOT (dd.defaclrole='postgres'::regrole AND dd.defaclnamespace='public'::regnamespace AND dd.defaclobjtype IN('r','S','f'))) outside_defaults, (SELECT md5(coalesce(string_agg(v,';'ORDER BY v),''))FROM(
 SELECT 'rel|'||c.oid::text||'|'||coalesce(c.relacl::text,'NULL')||'|'||c.relrowsecurity::text||'|'||c.relforcerowsecurity::text v FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%'AND n.nspname<>'information_schema'
 UNION ALL SELECT 'fn|'||p.oid::text||'|'||coalesce(p.proacl::text,'NULL')||'|'||p.prosecdef::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname NOT LIKE 'pg_%'AND n.nspname<>'information_schema')z) existing_objects;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated RESTRICT;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated RESTRICT;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated RESTRICT;
DO $post$
DECLARE actual text[]; outside_now jsonb; objects_now text;
BEGIN
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='S';
 IF actual IS DISTINCT FROM ARRAY['postgres=rwU/postgres','service_role=rwU/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres S'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='f';
 IF actual IS DISTINCT FROM ARRAY['postgres=X/postgres','service_role=X/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres f'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace='public'::regnamespace AND defaclobjtype='r';
 IF actual IS DISTINCT FROM ARRAY['postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']::text[] THEN RAISE EXCEPTION 'DEFAULT_PUBLIC_DRIFT_STOP postgres r'; END IF;
 SELECT ARRAY(SELECT v::text FROM unnest(defaclacl)v ORDER BY v::text) INTO actual FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace=0 AND defaclobjtype='f';
 IF actual IS DISTINCT FROM NULL::text[] THEN RAISE EXCEPTION 'DEFAULT_GLOBAL_F_DRIFT_STOP'; END IF;
 IF EXISTS(SELECT 1 FROM pg_default_acl WHERE defaclrole='postgres'::regrole AND defaclnamespace=0 AND defaclobjtype IN('r','S'))THEN RAISE EXCEPTION 'DEFAULT_GLOBAL_RS_DRIFT_STOP';END IF;
 SELECT (SELECT jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(defaclrole),'schema',CASE WHEN defaclnamespace=0 THEN NULL ELSE n.nspname END,'type',defaclobjtype,'acl',(SELECT jsonb_agg(a::text ORDER BY a::text)FROM unnest(defaclacl)a))ORDER BY defaclrole,defaclnamespace,defaclobjtype)FROM pg_default_acl dd LEFT JOIN pg_namespace n ON n.oid=dd.defaclnamespace WHERE NOT (dd.defaclrole='postgres'::regrole AND dd.defaclnamespace='public'::regnamespace AND dd.defaclobjtype IN('r','S','f'))), (SELECT md5(coalesce(string_agg(v,';'ORDER BY v),''))FROM(
 SELECT 'rel|'||c.oid::text||'|'||coalesce(c.relacl::text,'NULL')||'|'||c.relrowsecurity::text||'|'||c.relforcerowsecurity::text v FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%'AND n.nspname<>'information_schema'
 UNION ALL SELECT 'fn|'||p.oid::text||'|'||coalesce(p.proacl::text,'NULL')||'|'||p.prosecdef::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname NOT LIKE 'pg_%'AND n.nspname<>'information_schema')z) INTO outside_now,objects_now;
 IF outside_now IS DISTINCT FROM(SELECT outside_defaults FROM defaults_scope_snapshot)
 OR objects_now IS DISTINCT FROM(SELECT existing_objects FROM defaults_scope_snapshot)
 THEN RAISE EXCEPTION 'DEFAULT_SCOPE_OR_EXISTING_OBJECT_CHANGE_STOP';END IF;
END $post$;
COMMIT;

