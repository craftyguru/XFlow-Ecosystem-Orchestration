-- Forward-only compatibility for privately persisted Studio video results.
-- Does not enroll a workspace, change quotas, or activate any execution gate.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='crevux.billing_storage_claims'::regclass
      and conname='billing_storage_claims_kind_check'
      and pg_get_constraintdef(oid) like '%source_image%generated_image%'
  ) then
    raise exception 'CREVUX_STORAGE_KIND_CONSTRAINT_PREREQUISITE_MISSING';
  end if;
end $$;

alter table crevux.billing_storage_claims
  drop constraint billing_storage_claims_kind_check,
  add constraint billing_storage_claims_kind_check
    check(kind in ('source_image','generated_image','generated_video'));

create or replace function crevux.reserve_standard_storage(
  p_id uuid,p_workspace uuid,p_user uuid,p_kind text,p_bytes bigint
) returns void language plpgsql security invoker set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;u record;c crevux.billing_storage_claims%rowtype;
begin
 if p_kind not in ('source_image','generated_image','generated_video') or p_bytes<=0 then raise exception 'STANDARD_STORAGE_CLAIM_INVALID';end if;
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

create or replace function crevux.standard_asset_quota_guard() returns trigger language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare p crevux.billing_storage_policies%rowtype;u record;c crevux.billing_storage_claims%rowtype;n numeric;target uuid;
begin
 if tg_op='UPDATE' and old.workspace_id<>new.workspace_id and
   exists(select 1 from crevux.billing_storage_policies where workspace_id in (old.workspace_id,new.workspace_id)) then raise exception 'STANDARD_STORAGE_OWNERSHIP_MOVE_HELD';end if;
 select * into p from crevux.billing_storage_policies where workspace_id=new.workspace_id;
 if not found then return new;end if;
 if tg_op='UPDATE' and new.workspace_id=old.workspace_id and new.created_by is not distinct from old.created_by
   and new.asset_type=old.asset_type and new.storage_path is not distinct from old.storage_path
   and new.metadata->>'sizeBytes' is not distinct from old.metadata->>'sizeBytes'
   and new.metadata->>'generationJobId' is not distinct from old.metadata->>'generationJobId' then return new;end if;
 perform pg_advisory_xact_lock(hashtextextended('crevux-standard-storage:'||new.workspace_id::text,0));
 select * into strict p from crevux.billing_storage_policies where workspace_id=new.workspace_id for update;
 if p.state<>'active' then raise exception 'STANDARD_STORAGE_POLICY_HELD';end if;
 if new.storage_path is not null and (new.metadata->>'sizeBytes' is null or new.metadata->>'sizeBytes' !~ '^[1-9][0-9]*$') then raise exception 'STANDARD_STORAGE_BYTES_UNVERIFIED';end if;
 n:=case when new.storage_path is null then 0 else (new.metadata->>'sizeBytes')::numeric end;
 target:=case when new.asset_type='source_image' then new.id
   when new.asset_type in ('generated_image','generated_video') and new.metadata->>'generationJobId' ~ '^[a-f0-9-]{36}$'
     then (new.metadata->>'generationJobId')::uuid else null end;
 select * into c from crevux.billing_storage_claims where id=target and workspace_id=new.workspace_id and created_by=new.created_by and kind=new.asset_type;
 if tg_op='INSERT' and (not found or c.state not in ('reserved','review') or n>c.reserved_bytes) then raise exception 'STANDARD_STORAGE_CLAIM_REQUIRED';end if;
 if c.state='committed' and c.asset_id<>new.id then raise exception 'STANDARD_STORAGE_CLAIM_CONFLICT';end if;
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

create or replace function crevux.release_standard_storage(p_id uuid,p_workspace uuid,p_user uuid)
returns boolean language plpgsql security invoker set search_path=pg_catalog,crevux as $$
declare c crevux.billing_storage_claims%rowtype;proven boolean;
begin
 perform 1 from crevux.billing_storage_policies where workspace_id=p_workspace for update;
 select * into c from crevux.billing_storage_claims where id=p_id and workspace_id=p_workspace and created_by=p_user for update;
 if not found or c.state='released' then return true;end if;
 if c.state='committed' then raise exception 'STANDARD_STORAGE_COMMITTED_RELEASE_HELD';end if;
 if c.kind='source_image' then
  select exists(select 1 from crevux.provider_runs r where r.id=p_id and r.workspace_id=p_workspace and r.created_by=p_user and r.metadata->>'stage'='import_moderation' and r.status in ('rejected','failed')) into proven;
 else
  select exists(select 1 from public.credit_transactions t where t.workspace_id::text=p_workspace::text and t.user_id::text=p_user::text
   and ((t.credit_key='crevux_standard_action_credits_v1' and t.app_key='ecosystem' and t.environment='live'
     and t.transaction_type='reversal' and t.delta=1 and t.metadata->>'jobId'=p_id::text
     and t.metadata->>'lotMovement'='release' and t.metadata->>'state' in ('released','compensated'))
    or (t.reference_type='crevux-studio-media-accounting/v1' and t.reference_id=p_id::text
     and t.transaction_type='reversal' and t.delta>0 and t.metadata->>'operationId'=p_id::text
     and t.metadata->>'mediaLotMovement'='release' and t.metadata->>'state'='released'))) into proven;
 end if;
 update crevux.billing_storage_claims set state=case when proven then 'released' else 'review' end,updated_at=now() where id=p_id;
 return coalesce(proven,false);
end $$;

comment on constraint billing_storage_claims_kind_check on crevux.billing_storage_claims is
  'Storage claims are restricted to scanner-backed sources and generated Studio image/video results.';
