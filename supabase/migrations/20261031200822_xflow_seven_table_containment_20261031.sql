-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261031200822; name: xflow_seven_table_containment_20261031; statement-join MD5: 1b5871d674d9960c51baa98139fe8cbf

SET xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET xflow.remediation.change_ref='ROB_AUTH_REQUIRED_SEVEN_TABLE_CONTAINMENT_20261031';
-- ATOMIC SEVEN-TABLE REVIEW CANDIDATE. NOT APPLIED / NOT APPROVED.
-- Six financial client revokes+RLS, one membership write-only revoke; no row DML/default-grant changes.
-- Session markers are accidental-target guards, not authorization/project proof.
BEGIN;
SET LOCAL lock_timeout='2s';
SET LOCAL statement_timeout='15s';
DO $guard$
BEGIN
 IF current_database()<>'postgres' OR current_user<>'postgres'
 OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolbypassrls AND NOT rolsuper)
 OR current_setting('xflow.remediation.target_project_ref',true) IS DISTINCT FROM 'mjfzoikkoykszxzuebdf'
 OR current_setting('xflow.remediation.change_ref',true) IS DISTINCT FROM 'ROB_AUTH_REQUIRED_SEVEN_TABLE_CONTAINMENT_20261031' THEN
  RAISE EXCEPTION 'EXPLICIT_APPROVAL_AND_EXACT_TARGET_REQUIRED: no production operation authorized by preparation';
 END IF;
END $guard$;
LOCK TABLE public.billing_accounts,public.credit_balances,public.credit_transactions,public.stripe_customers,public.stripe_webhook_events,public.subscriptions,public.workspace_members IN ACCESS EXCLUSIVE MODE;
DO $preflight$
DECLARE target text; c record; policy_count integer;
BEGIN
 FOREACH target IN ARRAY ARRAY['billing_accounts', 'subscriptions', 'stripe_customers', 'stripe_webhook_events', 'credit_balances', 'credit_transactions'] LOOP
  SELECT pc.*,pg_get_userbyid(pc.relowner) AS owner_name INTO c
  FROM pg_class pc JOIN pg_namespace pn ON pn.oid=pc.relnamespace
  WHERE pn.nspname='public' AND pc.relname=target;
  IF NOT FOUND THEN RAISE EXCEPTION 'MISSING_TARGET %',target; END IF;
  SELECT count(*) INTO policy_count FROM pg_policy WHERE polrelid=c.oid;
  IF c.relkind<>'r' OR c.owner_name<>'postgres' OR c.relforcerowsecurity OR policy_count<>0 THEN
   RAISE EXCEPTION 'CATALOG_DRIFT %: no change performed',target;
  END IF;
  IF EXISTS(SELECT 1 FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped AND a.attacl IS NOT NULL)
     OR EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN ('anon','authenticated'))
     OR (SELECT count(*) FROM pg_roles WHERE rolname IN ('anon','authenticated') AND NOT rolsuper AND NOT rolbypassrls)<>2 THEN
   RAISE EXCEPTION 'CLIENT_ROLE_OR_COLUMN_ACL_DRIFT %: no change performed',target;
  END IF;
  IF NOT ((NOT c.relrowsecurity AND ARRAY(SELECT x::text FROM unnest(c.relacl)x ORDER BY x::text)=ARRAY['anon=arwdDxtm/postgres','authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'])
       OR (c.relrowsecurity AND ARRAY(SELECT x::text FROM unnest(c.relacl)x ORDER BY x::text)=ARRAY['postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'])) THEN
   RAISE EXCEPTION 'ACL_OR_RLS_DRIFT %: no change performed',target;
  END IF;
 END LOOP;
END $preflight$;
DO $pre$ DECLARE c record; BEGIN
 SELECT p.*,pg_get_userbyid(p.relowner) owner_name INTO c FROM pg_class p JOIN pg_namespace n ON n.oid=p.relnamespace WHERE n.nspname='public' AND p.relname='workspace_members';
 IF NOT FOUND OR c.relkind<>'r' OR c.owner_name<>'postgres' OR c.relrowsecurity OR c.relforcerowsecurity
 OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=c.oid)
 OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=c.oid AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL)
 OR EXISTS(SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN('anon','authenticated'))
 OR (SELECT count(*) FROM pg_roles WHERE rolname IN('anon','authenticated') AND NOT rolsuper AND NOT rolbypassrls)<>2
 OR ARRAY(SELECT a::text FROM unnest(c.relacl)a ORDER BY a::text) NOT IN
 (ARRAY['anon=arwdDxtm/postgres','authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'],
 ARRAY['anon=r/postgres','authenticated=r/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'])
 THEN RAISE EXCEPTION 'MEMBERSHIP_PERMISSION_OR_ROLE_DRIFT'; END IF;
END $pre$;
REVOKE ALL PRIVILEGES ON TABLE public."billing_accounts" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."billing_accounts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."subscriptions" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."subscriptions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."stripe_customers" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."stripe_customers" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."stripe_webhook_events" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."stripe_webhook_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."credit_balances" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."credit_balances" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."credit_transactions" FROM anon, authenticated, PUBLIC;
ALTER TABLE public."credit_transactions" ENABLE ROW LEVEL SECURITY;
DO $postcheck$
DECLARE target text;
BEGIN
 FOREACH target IN ARRAY ARRAY['billing_accounts','subscriptions','stripe_customers','stripe_webhook_events','credit_balances','credit_transactions'] LOOP
  IF has_table_privilege('anon','public.'||target,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
    OR has_table_privilege('authenticated','public.'||target,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
    OR has_any_column_privilege('anon','public.'||target,'SELECT,INSERT,UPDATE,REFERENCES')
    OR has_any_column_privilege('authenticated','public.'||target,'SELECT,INSERT,UPDATE,REFERENCES')
    OR NOT has_table_privilege('postgres','public.'||target,'SELECT')
    OR NOT has_table_privilege('service_role','public.'||target,'SELECT') THEN
   RAISE EXCEPTION 'TARGET_PERMISSION_POSTCHECK_FAILED %',target;
  END IF;
 END LOOP;
END $postcheck$;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON TABLE public.workspace_members FROM anon,authenticated,PUBLIC;
DO $post$ BEGIN
 IF has_table_privilege('anon','public.workspace_members','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
 OR has_table_privilege('authenticated','public.workspace_members','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
 OR has_any_column_privilege('anon','public.workspace_members','INSERT,UPDATE,REFERENCES')
 OR has_any_column_privilege('authenticated','public.workspace_members','INSERT,UPDATE,REFERENCES')
 OR NOT has_table_privilege('anon','public.workspace_members','SELECT')
 OR NOT has_table_privilege('authenticated','public.workspace_members','SELECT')
 THEN RAISE EXCEPTION 'MEMBERSHIP_POSTCONDITION_FAILED'; END IF;
END $post$;
COMMIT;

