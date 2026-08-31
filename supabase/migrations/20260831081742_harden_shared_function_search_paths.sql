-- The shared-schema functions only reference pg_catalog built-ins or fully
-- qualified auth objects. Pin their lookup path so callers cannot influence
-- name resolution and Supabase's function-search-path advisor remains clean.
alter function core.current_user_id()
  set search_path = pg_catalog;

alter function core.is_service_role()
  set search_path = pg_catalog;

alter function core.set_updated_at()
  set search_path = pg_catalog;
