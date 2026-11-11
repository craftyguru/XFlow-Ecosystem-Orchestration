-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261102020229; name: xflow_legacy_public_containment_v1; statement-join MD5: 3cf249fd88813ac11b950faa5f0239f9

SET LOCAL xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET LOCAL xflow.remediation.change_ref='REVIEW_LEGACY_PUBLIC_CONTAINMENT_V1';
-- REVIEW ONLY. Raw atomic migration body; no execution authorization.
-- DB-C10: legacy/private raw stores; preserve workspace_members and all trusted backend access. Defaults and rows are out of scope.
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
SET LOCAL transaction_timeout = '45s';
DO $containment$
DECLARE target text; rel regclass; expected_acls jsonb := '{"ai_prompt_versions":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"assistant_tool_calls":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"integration_tokens":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"permissions":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"role_permissions":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"service_tokens":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"verixet_schema_meta":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"],"xflow_offers":["postgres=arwdDxtm/postgres","anon=arwdDxtm/postgres","authenticated=arwdDxtm/postgres","service_role=arwdDxtm/postgres"]}'::jsonb;
BEGIN
 IF current_setting('xflow.remediation.target_project_ref',true) IS DISTINCT FROM 'mjfzoikkoykszxzuebdf' OR current_setting('xflow.remediation.change_ref',true) IS DISTINCT FROM 'REVIEW_LEGACY_PUBLIC_CONTAINMENT_V1' THEN RAISE EXCEPTION 'BATCH_TARGET_MARKER_STOP'; END IF;
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'EXPECTED_POSTGRES_OWNER_ROLE'; END IF;
 FOREACH target IN ARRAY ARRAY['ai_prompt_versions','assistant_tool_calls','integration_tokens','permissions','role_permissions','service_tokens','verixet_schema_meta','xflow_offers'] LOOP
  rel := to_regclass(format('public.%I',target));
  IF rel IS NULL OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid=rel AND relkind='r' AND relowner='postgres'::regrole AND NOT relrowsecurity AND NOT relforcerowsecurity)
   OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=rel)
   OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=rel AND attnum>0 AND attacl IS NOT NULL)
   OR (SELECT to_jsonb(relacl) FROM pg_class WHERE oid=rel) IS DISTINCT FROM expected_acls->target
  THEN RAISE EXCEPTION 'TABLE_STATE_DRIFT: %',target; END IF;
 END LOOP;
END $containment$;
REVOKE ALL PRIVILEGES ON TABLE public.ai_prompt_versions, public.assistant_tool_calls, public.integration_tokens, public.permissions, public.role_permissions, public.service_tokens, public.verixet_schema_meta, public.xflow_offers FROM PUBLIC, anon, authenticated;
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verixet_schema_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_offers ENABLE ROW LEVEL SECURITY;
DO $postcondition$
DECLARE target text; privilege text;
BEGIN
 FOREACH target IN ARRAY ARRAY['ai_prompt_versions','assistant_tool_calls','integration_tokens','permissions','role_permissions','service_tokens','verixet_schema_meta','xflow_offers'] LOOP
  FOREACH privilege IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] LOOP
   IF has_table_privilege('anon',format('public.%I',target),privilege) OR has_table_privilege('authenticated',format('public.%I',target),privilege)
   THEN RAISE EXCEPTION 'CLIENT_PRIVILEGE_REMAINS: % %',target,privilege; END IF;
   IF NOT has_table_privilege('postgres',format('public.%I',target),privilege) OR NOT has_table_privilege('service_role',format('public.%I',target),privilege)
   THEN RAISE EXCEPTION 'OWNER_SERVICE_ACCESS_LOST: % %',target,privilege; END IF;
  END LOOP;
 END LOOP;
END $postcondition$;

