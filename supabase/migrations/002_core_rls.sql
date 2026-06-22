-- RLS for shared ecosystem core tables.

create or replace function core.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create or replace function core.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = core, public
as $$
  select exists (
    select 1
    from core.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
$$;

create or replace function core.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = core, public
as $$
  select exists (
    select 1
    from core.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('owner', 'admin')
  )
$$;

create or replace function core.has_workspace_app_access(target_workspace_id uuid, target_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = core, public
as $$
  select core.is_workspace_member(target_workspace_id)
    and exists (
      select 1
      from core.workspace_app_access waa
      where waa.workspace_id = target_workspace_id
        and waa.app_slug = target_app_slug
        and waa.status in ('active', 'trialing')
    )
$$;

create or replace function core.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role'
$$;

alter table core.profiles enable row level security;
alter table core.workspaces enable row level security;
alter table core.workspace_members enable row level security;
alter table core.ecosystem_apps enable row level security;
alter table core.workspace_app_access enable row level security;
alter table core.app_connections enable row level security;
alter table core.entitlements enable row level security;
alter table core.usage_events enable row level security;
alter table core.billing_events enable row level security;
alter table core.audit_logs enable row level security;

drop policy if exists profiles_select_own on core.profiles;
create policy profiles_select_own on core.profiles
  for select using (user_id = auth.uid() or core.is_service_role());

drop policy if exists profiles_update_own on core.profiles;
create policy profiles_update_own on core.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists workspaces_select_member on core.workspaces;
create policy workspaces_select_member on core.workspaces
  for select using (core.is_workspace_member(id) or core.is_service_role());

drop policy if exists workspace_members_select_member on core.workspace_members;
create policy workspace_members_select_member on core.workspace_members
  for select using (core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists workspace_members_admin_write on core.workspace_members;
create policy workspace_members_admin_write on core.workspace_members
  for all using (core.is_workspace_admin(workspace_id) or core.is_service_role())
  with check (core.is_workspace_admin(workspace_id) or core.is_service_role());

drop policy if exists ecosystem_apps_select_authenticated on core.ecosystem_apps;
create policy ecosystem_apps_select_authenticated on core.ecosystem_apps
  for select using (auth.uid() is not null or core.is_service_role());

drop policy if exists workspace_app_access_select_member on core.workspace_app_access;
create policy workspace_app_access_select_member on core.workspace_app_access
  for select using (core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists workspace_app_access_admin_write on core.workspace_app_access;
drop policy if exists workspace_app_access_service_write on core.workspace_app_access;
create policy workspace_app_access_service_write on core.workspace_app_access
  for all using (core.is_service_role())
  with check (core.is_service_role());

drop policy if exists app_connections_select_member on core.app_connections;
create policy app_connections_select_member on core.app_connections
  for select using (core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists app_connections_xflow_authority_write on core.app_connections;
create policy app_connections_xflow_authority_write on core.app_connections
  for all using (core.is_service_role())
  with check (core.is_service_role());

drop policy if exists entitlements_select_member on core.entitlements;
create policy entitlements_select_member on core.entitlements
  for select using (core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists entitlements_verixet_authority_write on core.entitlements;
create policy entitlements_verixet_authority_write on core.entitlements
  for all using (core.is_service_role())
  with check (core.is_service_role() and source = 'verixet');

drop policy if exists usage_events_select_member on core.usage_events;
create policy usage_events_select_member on core.usage_events
  for select using (core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists usage_events_service_write on core.usage_events;
create policy usage_events_service_write on core.usage_events
  for insert with check (core.is_service_role());

drop policy if exists billing_events_select_member on core.billing_events;
create policy billing_events_select_member on core.billing_events
  for select using (workspace_id is not null and core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists billing_events_verixet_authority_write on core.billing_events;
create policy billing_events_verixet_authority_write on core.billing_events
  for all using (core.is_service_role())
  with check (core.is_service_role() and authority = 'verixet');

drop policy if exists audit_logs_select_member on core.audit_logs;
create policy audit_logs_select_member on core.audit_logs
  for select using (workspace_id is not null and core.is_workspace_member(workspace_id) or core.is_service_role());

drop policy if exists audit_logs_service_write on core.audit_logs;
create policy audit_logs_service_write on core.audit_logs
  for insert with check (core.is_service_role());

revoke all on schema core from anon, authenticated;
grant usage on schema core to authenticated;
grant select on core.ecosystem_apps to authenticated;
grant select on core.profiles, core.workspaces, core.workspace_members, core.workspace_app_access to authenticated;
grant select on core.app_connections, core.entitlements, core.usage_events, core.billing_events, core.audit_logs to authenticated;
