-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261101112109; name: xflow_control_audit_containment_v1; statement-join MD5: 2a5fa28ab2fc97d2fe4569015743c9c3

SET LOCAL xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET LOCAL xflow.remediation.change_ref='REVIEW_CONTROL_AUDIT_CONTAINMENT_V1';
-- REVIEW ONLY. Raw atomic migration body; no execution authorization.
-- DB-C01: four server control/audit stores. Defaults and rows are out of scope.
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
DO $containment$
DECLARE target text; rel regclass;
BEGIN
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'EXPECTED_POSTGRES_OWNER_ROLE'; END IF;
 FOREACH target IN ARRAY ARRAY['auth_rate_buckets','auth_security_events','developer_api_key_audit_events','api_key_lifecycle_events'] LOOP
  rel := to_regclass(format('public.%I',target));
  IF rel IS NULL OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid=rel AND relkind='r' AND relowner='postgres'::regrole AND NOT relrowsecurity AND NOT relforcerowsecurity)
   OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=rel)
   OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=rel AND attnum>0 AND attacl IS NOT NULL)
  THEN RAISE EXCEPTION 'TABLE_STATE_DRIFT: %',target; END IF;
 END LOOP;
END $containment$;
REVOKE ALL PRIVILEGES ON TABLE public.auth_rate_buckets, public.auth_security_events, public.developer_api_key_audit_events, public.api_key_lifecycle_events FROM PUBLIC, anon, authenticated;
ALTER TABLE public.auth_rate_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_api_key_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_lifecycle_events ENABLE ROW LEVEL SECURITY;
DO $postcondition$
DECLARE target text; privilege text;
BEGIN
 FOREACH target IN ARRAY ARRAY['auth_rate_buckets','auth_security_events','developer_api_key_audit_events','api_key_lifecycle_events'] LOOP
  FOREACH privilege IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] LOOP
   IF has_table_privilege('anon',format('public.%I',target),privilege) OR has_table_privilege('authenticated',format('public.%I',target),privilege)
   THEN RAISE EXCEPTION 'CLIENT_PRIVILEGE_REMAINS: % %',target,privilege; END IF;
   IF NOT has_table_privilege('postgres',format('public.%I',target),privilege) OR NOT has_table_privilege('service_role',format('public.%I',target),privilege)
   THEN RAISE EXCEPTION 'OWNER_SERVICE_ACCESS_LOST: % %',target,privilege; END IF;
  END LOOP;
 END LOOP;
END $postcondition$;

