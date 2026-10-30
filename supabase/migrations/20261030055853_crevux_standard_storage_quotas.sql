-- Reviewed-byte candidate for canonical shared-ledger registration; NOT APPLIED.
-- Empty tables do not enroll a workspace or change an existing owner's limits.
create table crevux.billing_storage_policies (
 workspace_id uuid primary key references core.workspaces(id),
 policy_version text not null check(policy_version='crevux-standard-storage/20261030-v1'),
 tier text not null check(tier in ('free','starter','pro','elite')),
 included_bytes bigint not null check(included_bytes>=0), included_assets bigint not null check(included_assets>0), included_projects bigint not null check(included_projects>0),
 purchased_bytes_floor bigint not null check(purchased_bytes_floor>=0), purchased_assets_floor bigint not null check(purchased_assets_floor>=0), purchased_projects_floor bigint not null check(purchased_projects_floor>=0),
 legacy_bytes bigint not null check(legacy_bytes>=0), legacy_assets bigint not null check(legacy_assets>=0), legacy_projects bigint not null check(legacy_projects>=0),
 legacy_snapshot_digest text not null check(legacy_snapshot_digest ~ '^[a-f0-9]{64}$'),
 approval_ref text not null check(length(approval_ref)>0), state text not null check(state in ('active','held')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table crevux.billing_storage_claims (
 id uuid primary key,workspace_id uuid not null references crevux.billing_storage_policies(workspace_id),
 created_by uuid not null references auth.users(id),kind text not null check(kind in ('source_image','generated_image')),
 reserved_bytes bigint not null check(reserved_bytes>0),state text not null check(state in ('reserved','review','committed','released')),
 asset_id uuid,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check((state='committed')=(asset_id is not null))
);
create index billing_storage_claims_workspace_state on crevux.billing_storage_claims(workspace_id,state);
alter table crevux.billing_storage_policies enable row level security;
alter table crevux.billing_storage_claims enable row level security;
revoke all on crevux.billing_storage_policies,crevux.billing_storage_claims from public;

-- Invoker functions: no SECURITY DEFINER, no caller-supplied quota overrides.
create function crevux.standard_storage_usage(p_workspace uuid,p_exclude_asset uuid default null,p_exclude_claim uuid default null)
returns table(asset_count bigint,byte_count numeric,project_count bigint) language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;
begin
 select * into strict p from crevux.billing_storage_policies where workspace_id=p_workspace for update;
 if p.state<>'active' then raise exception 'STANDARD_STORAGE_POLICY_HELD';end if;
 if exists(select 1 from crevux.assets a where a.workspace_id=p_workspace and a.id is distinct from p_exclude_asset and a.storage_path is not null
   and (a.metadata->>'sizeBytes' is null or a.metadata->>'sizeBytes' !~ '^[1-9][0-9]*$')) then raise exception 'STANDARD_STORAGE_BYTES_UNVERIFIED';end if;
 return query select
   (select count(*) from crevux.assets a where a.workspace_id=p_workspace and a.id is distinct from p_exclude_asset)+p.legacy_assets+
    (select count(*) from crevux.billing_storage_claims c where c.workspace_id=p_workspace and c.id is distinct from p_exclude_claim and c.state in ('reserved','review')),
   coalesce((select sum(case when a.storage_path is null then 0 else (a.metadata->>'sizeBytes')::numeric end) from crevux.assets a where a.workspace_id=p_workspace and a.id is distinct from p_exclude_asset),0)+p.legacy_bytes+
    coalesce((select sum(c.reserved_bytes) from crevux.billing_storage_claims c where c.workspace_id=p_workspace and c.id is distinct from p_exclude_claim and c.state in ('reserved','review')),0),
   (select count(*) from crevux.projects r where r.workspace_id=p_workspace and r.status not in ('archived','deleted'))+p.legacy_projects;
end $$;

create function crevux.reserve_standard_storage(p_id uuid,p_workspace uuid,p_user uuid,p_kind text,p_bytes bigint)
returns void language plpgsql security invoker set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;u record;c crevux.billing_storage_claims%rowtype;
begin
 if p_kind not in ('source_image','generated_image') or p_bytes<=0 then raise exception 'STANDARD_STORAGE_CLAIM_INVALID';end if;
 perform pg_advisory_xact_lock(hashtextextended('crevux-standard-storage:'||p_workspace::text,0));
 if not exists(select 1 from core.workspace_members m where m.workspace_id=p_workspace and m.user_id=p_user and m.status='active' and m.role in ('owner','admin','member')) then raise exception 'STANDARD_STORAGE_SCOPE_DENIED';end if;
 select * into strict p from crevux.billing_storage_policies where workspace_id=p_workspace for update;
 select * into c from crevux.billing_storage_claims where id=p_id;
 if found then
  if c.workspace_id<>p_workspace or c.created_by<>p_user or c.kind<>p_kind or c.reserved_bytes<>p_bytes or c.state not in ('reserved','committed') then raise exception 'STANDARD_STORAGE_CLAIM_CONFLICT';end if;
  return;
 end if;
 select * into u from crevux.standard_storage_usage(p_workspace);
 if u.asset_count+1>greatest(p.included_assets,p.purchased_assets_floor) or u.byte_count+p_bytes>greatest(p.included_bytes,p.purchased_bytes_floor) then raise exception 'STANDARD_STORAGE_LIMIT_REACHED';end if;
 insert into crevux.billing_storage_claims(id,workspace_id,created_by,kind,reserved_bytes,state) values(p_id,p_workspace,p_user,p_kind,p_bytes,'reserved');
end $$;

create function crevux.standard_asset_quota_guard() returns trigger language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;u record;c crevux.billing_storage_claims%rowtype;n numeric;target uuid;
begin
 if tg_op='UPDATE' and old.workspace_id<>new.workspace_id and
   exists(select 1 from crevux.billing_storage_policies where workspace_id in (old.workspace_id,new.workspace_id)) then raise exception 'STANDARD_STORAGE_OWNERSHIP_MOVE_HELD';end if;
 select * into p from crevux.billing_storage_policies where workspace_id=new.workspace_id;
 if not found then return new;end if;
 -- Updating a label must remain possible without increasing stored usage or
 -- changing ownership, even when a purchased workspace is over its limit.
 if tg_op='UPDATE' and new.workspace_id=old.workspace_id and new.created_by is not distinct from old.created_by
   and new.asset_type=old.asset_type and new.storage_path is not distinct from old.storage_path
   and new.metadata->>'sizeBytes' is not distinct from old.metadata->>'sizeBytes'
   and new.metadata->>'generationJobId' is not distinct from old.metadata->>'generationJobId' then return new;end if;
 perform pg_advisory_xact_lock(hashtextextended('crevux-standard-storage:'||new.workspace_id::text,0));
 select * into strict p from crevux.billing_storage_policies where workspace_id=new.workspace_id for update;
 if p.state<>'active' then raise exception 'STANDARD_STORAGE_POLICY_HELD';end if;
 if new.storage_path is not null and (new.metadata->>'sizeBytes' is null or new.metadata->>'sizeBytes' !~ '^[1-9][0-9]*$') then raise exception 'STANDARD_STORAGE_BYTES_UNVERIFIED';end if;
 n:=case when new.storage_path is null then 0 else (new.metadata->>'sizeBytes')::numeric end;
 target:=case when new.asset_type='source_image' then new.id when new.asset_type='generated_image' and new.metadata->>'generationJobId' ~ '^[a-f0-9-]{36}$' then (new.metadata->>'generationJobId')::uuid else null end;
 select * into c from crevux.billing_storage_claims where id=target and workspace_id=new.workspace_id and created_by=new.created_by and kind=new.asset_type;
 if tg_op='INSERT' and (not found or c.state not in ('reserved','review') or n>c.reserved_bytes) then raise exception 'STANDARD_STORAGE_CLAIM_REQUIRED';end if;
 if c.state='committed' and c.asset_id<>new.id then raise exception 'STANDARD_STORAGE_CLAIM_CONFLICT';end if;
 -- A previously admitted claim already consumes one asset and reserved bytes.
 -- Converting it into no more than those bytes does not increase usage. Honor
 -- that reservation across a renewal downgrade instead of billing for an output
 -- and rejecting its already-reserved persistence capacity afterward.
 if tg_op='INSERT' and c.state in ('reserved','review') then
  update crevux.billing_storage_claims set state='committed',asset_id=new.id,updated_at=now() where id=c.id;
  return new;
 end if;
 select * into u from crevux.standard_storage_usage(new.workspace_id,new.id,c.id);
 if u.asset_count+1>greatest(p.included_assets,p.purchased_assets_floor) or u.byte_count+n>greatest(p.included_bytes,p.purchased_bytes_floor) then raise exception 'STANDARD_STORAGE_LIMIT_REACHED';end if;
 if c.id is not null and c.state in ('reserved','review') then
  update crevux.billing_storage_claims set state='committed',asset_id=new.id,updated_at=now() where id=c.id;
 end if;
 return new;
end $$;
create trigger standard_asset_quota before insert or update on crevux.assets for each row execute function crevux.standard_asset_quota_guard();

create function crevux.standard_project_quota_guard() returns trigger language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;n bigint;
begin
 if tg_op='UPDATE' and old.workspace_id<>new.workspace_id and exists(select 1 from crevux.billing_storage_policies where workspace_id in (old.workspace_id,new.workspace_id)) then raise exception 'STANDARD_STORAGE_OWNERSHIP_MOVE_HELD';end if;
 select * into p from crevux.billing_storage_policies where workspace_id=new.workspace_id;
 if not found then return new;end if;
 if tg_op='UPDATE' and new.workspace_id=old.workspace_id and new.status=old.status then return new;end if;
 perform pg_advisory_xact_lock(hashtextextended('crevux-standard-storage:'||new.workspace_id::text,0));
 select * into strict p from crevux.billing_storage_policies where workspace_id=new.workspace_id for update;
 if p.state<>'active' then raise exception 'STANDARD_STORAGE_POLICY_HELD';end if;
 if new.status in ('archived','deleted') then return new;end if;
 select count(*)+p.legacy_projects into n from crevux.projects r where r.workspace_id=new.workspace_id and r.id<>new.id and r.status not in ('archived','deleted');
 if n+1>greatest(p.included_projects,p.purchased_projects_floor) then raise exception 'STANDARD_PROJECT_LIMIT_REACHED';end if;
 return new;
end $$;
create trigger standard_project_quota before insert or update on crevux.projects for each row execute function crevux.standard_project_quota_guard();

-- Never expire a storage reservation automatically after an uncertain external effect.
-- Release requires an already-recorded exact credit return OR a terminal import rejection.
create function crevux.release_standard_storage(p_id uuid,p_workspace uuid,p_user uuid)
returns boolean language plpgsql security invoker set search_path=pg_catalog,crevux as $$
declare c crevux.billing_storage_claims%rowtype;proven boolean;
begin
 perform pg_advisory_xact_lock(hashtextextended('crevux-standard-storage:'||p_workspace::text,0));
 perform 1 from crevux.billing_storage_policies where workspace_id=p_workspace for update;
 select * into c from crevux.billing_storage_claims where id=p_id and workspace_id=p_workspace and created_by=p_user for update;
 if not found or c.state='committed' then return false;end if;
 if c.state='released' then return true;end if;
 if c.kind='source_image' then
  select exists(select 1 from crevux.provider_runs r where r.id=p_id and r.workspace_id=p_workspace and r.created_by=p_user and r.metadata->>'stage'='import_moderation' and r.status in ('rejected','failed')) into proven;
 else
  select exists(select 1 from public.credit_transactions t where t.workspace_id::text=p_workspace::text and t.user_id::text=p_user::text
   and t.credit_key='crevux_standard_action_credits_v1' and t.app_key='ecosystem' and t.environment='live' and t.transaction_type='reversal' and t.delta=1
   and t.metadata->>'jobId'=p_id::text and t.metadata->>'lotMovement'='release' and t.metadata->>'state' in ('released','compensated')) into proven;
 end if;
 update crevux.billing_storage_claims set state=case when proven then 'released' else 'review' end,updated_at=now() where id=p_id;
 return coalesce(proven,false);
end $$;

revoke execute on function crevux.standard_storage_usage(uuid,uuid,uuid),crevux.reserve_standard_storage(uuid,uuid,uuid,text,bigint),
 crevux.standard_asset_quota_guard(),crevux.standard_project_quota_guard(),crevux.release_standard_storage(uuid,uuid,uuid) from public;
do $$begin
 if exists(select 1 from pg_roles where rolname='authenticated') then
  grant select on crevux.billing_storage_policies,crevux.billing_storage_claims to authenticated;
  create policy standard_storage_policy_read on crevux.billing_storage_policies for select to authenticated using(core.has_workspace_app_access(workspace_id,'crevux'));
  create policy standard_storage_claim_read on crevux.billing_storage_claims for select to authenticated using(core.has_workspace_app_access(workspace_id,'crevux'));
  create policy standard_assets_server_insert on crevux.assets as restrictive for insert to authenticated with check(not exists(select 1 from crevux.billing_storage_policies p where p.workspace_id=assets.workspace_id));
  create policy standard_assets_server_update on crevux.assets as restrictive for update to authenticated using(not exists(select 1 from crevux.billing_storage_policies p where p.workspace_id=assets.workspace_id)) with check(not exists(select 1 from crevux.billing_storage_policies p where p.workspace_id=assets.workspace_id));
 end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  grant select,insert,update on crevux.billing_storage_policies,crevux.billing_storage_claims to service_role;
  grant execute on function crevux.standard_storage_usage(uuid,uuid,uuid),crevux.reserve_standard_storage(uuid,uuid,uuid,text,bigint),crevux.release_standard_storage(uuid,uuid,uuid) to service_role;
 end if;
end $$;
