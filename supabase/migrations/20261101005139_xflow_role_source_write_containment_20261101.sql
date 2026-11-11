-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261101005139; name: xflow_role_source_write_containment_20261101; statement-join MD5: 45ccf640e0f2dad59a1a2327bf2ecb3c

SET xflow.remediation.target_project_ref='mjfzoikkoykszxzuebdf';
SET xflow.remediation.change_ref='REVIEW_ROLE_SOURCE_WRITES_20261101';
-- REVIEW ONLY. F01.1-R01. No production execution authority.
-- Existing rows, SELECT, ownership, RLS, policies and defaults remain unchanged.
BEGIN;
SET LOCAL lock_timeout='2s';
SET LOCAL statement_timeout='15s';
DO $identity$
BEGIN
 IF current_database()<>'postgres' OR current_user<>'postgres' OR session_user<>'postgres'
 OR current_setting('xflow.remediation.target_project_ref',true) IS DISTINCT FROM 'mjfzoikkoykszxzuebdf'
 OR current_setting('xflow.remediation.change_ref',true) IS DISTINCT FROM 'REVIEW_ROLE_SOURCE_WRITES_20261101'
 OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND NOT rolsuper AND rolbypassrls)
 OR current_setting('server_version_num')::int/10000<>17
 THEN RAISE EXCEPTION 'ROLE_SOURCE_IDENTITY_STOP'; END IF;
 IF EXISTS(SELECT 1 FROM pg_auth_members WHERE member IN ('anon'::regrole,'authenticated'::regrole))
 OR EXISTS(SELECT 1 FROM pg_roles WHERE rolname IN ('anon','authenticated') AND (rolsuper OR rolbypassrls))
 THEN RAISE EXCEPTION 'ROLE_SOURCE_ROLE_DRIFT_STOP'; END IF;
END $identity$;
LOCK TABLE public.app_role_grants, public.platform_role_grants, public.roles IN ACCESS EXCLUSIVE MODE;
CREATE TEMP TABLE role_source_preservation ON COMMIT DROP AS
 SELECT 'app_role_grants'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.app_role_grants t
 UNION ALL SELECT 'platform_role_grants'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.platform_role_grants t
 UNION ALL SELECT 'roles'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.roles t;
DO $pre$
DECLARE e jsonb; c record; actual jsonb;
BEGIN
 FOR e IN SELECT value FROM jsonb_array_elements($expected$[{"name":"app_role_grants","shape":{"columns":[{"name":"id","type":"text","notNull":true,"default":"(gen_random_uuid())::text","acl":null},{"name":"user_id","type":"text","notNull":true,"default":null,"acl":null},{"name":"app_slug","type":"text","notNull":true,"default":null,"acl":null},{"name":"role","type":"text","notNull":true,"default":null,"acl":null},{"name":"source","type":"text","notNull":true,"default":"'xflow'::text","acl":null},{"name":"granted_by","type":"text","notNull":false,"default":null,"acl":null},{"name":"granted_at","type":"timestamp with time zone","notNull":true,"default":"now()","acl":null},{"name":"revoked_at","type":"timestamp with time zone","notNull":false,"default":null,"acl":null},{"name":"permissions_version","type":"integer","notNull":true,"default":"1","acl":null},{"name":"role_updated_at","type":"timestamp with time zone","notNull":true,"default":"now()","acl":null},{"name":"metadata_json","type":"jsonb","notNull":true,"default":"'{}'::jsonb","acl":null}],"constraints":[{"name":"app_role_grants_app_slug_fkey","def":"FOREIGN KEY (app_slug) REFERENCES app_registry(app_slug) ON DELETE RESTRICT"},{"name":"app_role_grants_granted_by_fkey","def":"FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL"},{"name":"app_role_grants_pkey","def":"PRIMARY KEY (id)"},{"name":"app_role_grants_role_check","def":"CHECK ((role = ANY (ARRAY['viewer'::text, 'app_admin'::text, 'app_owner'::text, 'superadmin'::text])))"},{"name":"app_role_grants_user_id_fkey","def":"FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"}],"indexes":["CREATE UNIQUE INDEX app_role_grants_active_uidx ON public.app_role_grants USING btree (user_id, app_slug, role) WHERE (revoked_at IS NULL)","CREATE INDEX app_role_grants_app_slug_idx ON public.app_role_grants USING btree (app_slug)","CREATE UNIQUE INDEX app_role_grants_pkey ON public.app_role_grants USING btree (id)","CREATE INDEX app_role_grants_role_idx ON public.app_role_grants USING btree (role)","CREATE INDEX app_role_grants_user_idx ON public.app_role_grants USING btree (user_id)"]}},{"name":"platform_role_grants","shape":{"columns":[{"name":"id","type":"text","notNull":true,"default":"(gen_random_uuid())::text","acl":null},{"name":"user_id","type":"text","notNull":true,"default":null,"acl":null},{"name":"role","type":"text","notNull":true,"default":null,"acl":null},{"name":"source","type":"text","notNull":true,"default":"'xflow'::text","acl":null},{"name":"granted_by","type":"text","notNull":false,"default":null,"acl":null},{"name":"granted_at","type":"timestamp with time zone","notNull":true,"default":"now()","acl":null},{"name":"revoked_at","type":"timestamp with time zone","notNull":false,"default":null,"acl":null},{"name":"permissions_version","type":"integer","notNull":true,"default":"1","acl":null},{"name":"role_updated_at","type":"timestamp with time zone","notNull":true,"default":"now()","acl":null},{"name":"metadata_json","type":"jsonb","notNull":true,"default":"'{}'::jsonb","acl":null}],"constraints":[{"name":"platform_role_grants_granted_by_fkey","def":"FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL"},{"name":"platform_role_grants_pkey","def":"PRIMARY KEY (id)"},{"name":"platform_role_grants_role_check","def":"CHECK ((role = ANY (ARRAY['user'::text, 'workspace_admin'::text, 'support_admin'::text, 'billing_admin'::text, 'moderator'::text, 'superadmin'::text, 'platform_owner'::text])))"},{"name":"platform_role_grants_user_id_fkey","def":"FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"}],"indexes":["CREATE UNIQUE INDEX platform_role_grants_active_uidx ON public.platform_role_grants USING btree (user_id, role) WHERE (revoked_at IS NULL)","CREATE UNIQUE INDEX platform_role_grants_pkey ON public.platform_role_grants USING btree (id)","CREATE INDEX platform_role_grants_role_idx ON public.platform_role_grants USING btree (role)","CREATE INDEX platform_role_grants_user_idx ON public.platform_role_grants USING btree (user_id)"]}},{"name":"roles","shape":{"columns":[{"name":"id","type":"text","notNull":true,"default":null,"acl":null},{"name":"name","type":"text","notNull":true,"default":null,"acl":null},{"name":"description","type":"text","notNull":false,"default":null,"acl":null},{"name":"created_at","type":"timestamp with time zone","notNull":true,"default":null,"acl":null},{"name":"updated_at","type":"timestamp with time zone","notNull":true,"default":null,"acl":null}],"constraints":[{"name":"roles_name_unique","def":"UNIQUE (name)"},{"name":"roles_pkey","def":"PRIMARY KEY (id)"}],"indexes":["CREATE UNIQUE INDEX roles_name_unique ON public.roles USING btree (name)","CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id)"]}}]$expected$::jsonb) LOOP
  SELECT x.* INTO c FROM pg_class x JOIN pg_namespace n ON n.oid=x.relnamespace WHERE n.nspname='public' AND x.relname=e->>'name';
  IF NOT FOUND OR c.relkind<>'r' OR pg_get_userbyid(c.relowner)<>'postgres' OR c.relrowsecurity OR c.relforcerowsecurity
  OR EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=c.oid)
  OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid=c.oid AND NOT tgisinternal)
  OR (SELECT array_agg(v::text ORDER BY v::text) FROM unnest(c.relacl) v) IS DISTINCT FROM ARRAY['anon=arwdDxtm/postgres','authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']::text[]
  THEN RAISE EXCEPTION 'ROLE_SOURCE_BOUNDARY_DRIFT_STOP %',e->>'name'; END IF;
  SELECT jsonb_build_object('columns',(SELECT jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'acl',a.attacl) ORDER BY a.attnum) FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=shape_class.oid AND a.attnum>0 AND NOT a.attisdropped),'constraints',(SELECT jsonb_agg(jsonb_build_object('name',conname,'def',pg_get_constraintdef(oid)) ORDER BY conname) FROM pg_constraint WHERE conrelid=shape_class.oid),'indexes',(SELECT jsonb_agg(indexdef ORDER BY indexname) FROM pg_indexes WHERE schemaname='public' AND tablename=shape_class.relname)) INTO actual FROM pg_class shape_class WHERE shape_class.oid=('public.'||(e->>'name'))::regclass;
  IF actual IS DISTINCT FROM e->'shape' THEN RAISE EXCEPTION 'ROLE_SOURCE_SHAPE_DRIFT_STOP %',e->>'name'; END IF;
 END LOOP;
END $pre$;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public.app_role_grants, public.platform_role_grants, public.roles FROM anon, authenticated, PUBLIC RESTRICT;
DO $post$
DECLARE c record; r text; p text;
BEGIN
 FOR c IN SELECT x.* FROM pg_class x WHERE x.oid IN ('public.app_role_grants'::regclass,'public.platform_role_grants'::regclass,'public.roles'::regclass) LOOP
  IF (SELECT array_agg(v::text ORDER BY v::text) FROM unnest(c.relacl) v) IS DISTINCT FROM ARRAY['anon=r/postgres','authenticated=r/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']::text[] OR c.relrowsecurity OR c.relforcerowsecurity THEN RAISE EXCEPTION 'ROLE_SOURCE_POST_ACL_STOP'; END IF;
  FOREACH r IN ARRAY ARRAY['anon','authenticated','postgres','service_role'] LOOP
   IF NOT has_table_privilege(r,c.oid,'SELECT') THEN RAISE EXCEPTION 'ROLE_SOURCE_READ_REGRESSION_STOP'; END IF;
   FOREACH p IN ARRAY ARRAY['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] LOOP
    IF has_table_privilege(r,c.oid,p) IS DISTINCT FROM (r IN ('postgres','service_role')) THEN RAISE EXCEPTION 'ROLE_SOURCE_WRITE_POST_STOP % %',r,p; END IF;
   END LOOP;
   IF r IN ('anon','authenticated') AND (has_any_column_privilege(r,c.oid,'INSERT') OR has_any_column_privilege(r,c.oid,'UPDATE') OR has_any_column_privilege(r,c.oid,'REFERENCES')) THEN RAISE EXCEPTION 'ROLE_SOURCE_COLUMN_WRITE_STOP'; END IF;
  END LOOP;
 END LOOP;
 IF EXISTS(SELECT * FROM role_source_preservation EXCEPT (SELECT 'app_role_grants'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.app_role_grants t
 UNION ALL SELECT 'platform_role_grants'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.platform_role_grants t
 UNION ALL SELECT 'roles'::text name,count(*) n,md5(coalesce(string_agg(to_jsonb(t)::text,E'\n' ORDER BY id),'')) fingerprint FROM public.roles t))
 THEN RAISE EXCEPTION 'ROLE_SOURCE_ROW_CHANGE_STOP'; END IF;
END $post$;
COMMIT;

