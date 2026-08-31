-- Compatibility prerequisite for 064_crevux_storyboards.sql.
--
-- This is intentionally idempotent and matches the helper definitions later
-- reasserted by 20260611063431_production_rls_hardening.sql. Existing databases
-- that already applied the hardening migration may safely apply this missing
-- legacy-ordered migration with `supabase migration up --include-all`.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from core.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
  )
$$;

create or replace function private.has_workspace_app_access(target_workspace_id uuid, target_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_workspace_member(target_workspace_id)
    and exists (
      select 1
      from core.workspace_app_access waa
      where waa.workspace_id = target_workspace_id
        and waa.app_slug = target_app_slug
        and waa.status in ('active', 'trialing')
    )
$$;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.has_workspace_app_access(uuid, text) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated, service_role;
grant execute on function private.has_workspace_app_access(uuid, text) to authenticated, service_role;
