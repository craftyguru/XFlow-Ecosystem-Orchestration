-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261013222203; name: mobile8h_paid_diagnostic_20261013; statement-join MD5: 218713284306c31fe939c568f642414e

-- LOCAL additive proposal. No production DDL or automatic migration.
-- Supersedes the un-applied local shadow-budget draft; canonical credits exist only in Verixet.
begin;
create table crevux.mobile8h_diagnostic_permits (
 operation_id uuid primary key,binding_id uuid not null references crevux.xflow_principal_bindings(id),actor_id uuid not null,
 workspace_id uuid not null,source_id uuid not null references crevux.assets(id),
 request_digest text not null check(request_digest~'^[a-f0-9]{64}$'),idempotency_key text not null check(idempotency_key~'^[A-Za-z0-9_-]{16,128}$'),
 permit jsonb not null,expires_at timestamptz not null,active boolean not null default false,unique(actor_id,workspace_id,idempotency_key),
 check((permit->>'operationId'=operation_id::text and permit->>'bindingId'=binding_id::text and permit->>'actorId'=actor_id::text and
  permit->>'workspaceId'=workspace_id::text and permit->>'sourceId'=source_id::text and permit->>'requestDigest'=request_digest and
  permit->>'idempotencyKey'=idempotency_key and (permit->>'expiresAt')::timestamptz=expires_at and
  permit->>'creditUnit'='media_image_credits' and permit->>'planningReservationUsdMicros'='50000' and
  permit->>'reviewToleranceUsdMicros'='100000' and permit->>'provider'='openai' and permit->>'model'='gpt-image-1' and
  permit->>'maxCalls'='1' and permit->>'retries'='0' and permit->>'n'='1' and permit->>'size'='1024x1024' and
  permit->>'quality'='low' and permit->>'inputFidelity'='low' and permit->>'policy'='mobile8h-reviewed-fixed-source/v1' and
  permit->>'prompt'='Create a simple flat blue square on a white background. No text, people, logos or personal information.') is true)
);
create table crevux.mobile8h_diagnostic_runs (
 operation_id uuid primary key references crevux.mobile8h_diagnostic_permits(operation_id),
 state text not null check(state in ('reservation_unknown','reserved','dispatching','succeeded','quarantined','released')),
 provider_calls smallint not null default 0 check(provider_calls between 0 and 1),fence_id uuid unique,
 reserved_usd_micros bigint not null check(reserved_usd_micros=50000),reserved_credits bigint not null default 0 check(reserved_credits>=0),
 canonical_receipt jsonb,actual_usd_micros bigint check(actual_usd_micros>=0),debited_credits bigint check(debited_credits>0),
 provider_request_id text,storage_path text,result_digest text check(result_digest~'^[a-f0-9]{64}$'),provider_usage jsonb,
 provider_observed_usd_micros numeric check(provider_observed_usd_micros>=0),dispatched_at timestamptz,updated_at timestamptz not null default clock_timestamp(),
 check((provider_calls=0 and fence_id is null and dispatched_at is null and state in ('reservation_unknown','reserved','quarantined','released')) or
  (provider_calls=1 and fence_id is not null and dispatched_at is not null and state in ('dispatching','succeeded','quarantined'))),
 check(state<>'succeeded' or (actual_usd_micros is not null and debited_credits is not null and result_digest is not null and
  provider_request_id is not null and storage_path is not null and (canonical_receipt->>'state'='settled') is true))
);
create unique index mobile8h_settled_provider_receipt on crevux.mobile8h_diagnostic_runs(provider_request_id) where state='succeeded';
alter table crevux.mobile8h_diagnostic_permits enable row level security;alter table crevux.mobile8h_diagnostic_runs enable row level security;
revoke all on crevux.mobile8h_diagnostic_permits,crevux.mobile8h_diagnostic_runs from public;
create function crevux.mobile8h_immutable_authority() returns trigger language plpgsql set search_path='' as $$
begin if (to_jsonb(new)-'active')<>(to_jsonb(old)-'active') then raise exception 'MOBILE8H_IMMUTABLE_PERMIT'; end if;return new;end $$;
create trigger mobile8h_permit_immutable before update on crevux.mobile8h_diagnostic_permits for each row execute function crevux.mobile8h_immutable_authority();
create function crevux.mobile8h_bound(p_op uuid,p_binding uuid,p_actor uuid,p_workspace uuid,p_subject text,p_xworkspace text)
 returns crevux.mobile8h_diagnostic_permits language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;begin
 select d.* into p from crevux.mobile8h_diagnostic_permits d
 join crevux.xflow_principal_bindings b on b.id=d.binding_id and b.auth_user_id=d.actor_id and b.core_workspace_id=d.workspace_id
 join public.users u on u.id=b.xflow_subject and u.status='active' join public.workspaces xw on xw.id=b.xflow_workspace and xw.lifecycle_status='active'
 join public.workspace_memberships xm on xm.user_id=u.id and xm.workspace_id=xw.id join auth.users au on au.id=b.auth_user_id
 join core.workspaces cw on cw.id=b.core_workspace_id and cw.status='active'
 join core.workspace_members m on m.workspace_id=d.workspace_id and m.user_id=d.actor_id and m.status='active' and m.role<>'viewer'
 where d.operation_id=p_op and d.binding_id=p_binding and d.actor_id=p_actor and d.workspace_id=p_workspace and
  b.xflow_subject=p_subject and b.xflow_workspace=p_xworkspace and b.status='active' and d.permit->>'subject'=p_subject and d.permit->>'xflowWorkspace'=p_xworkspace;
 if not found then raise exception 'MOBILE8H_SCOPE_MISMATCH';end if;return p;end $$;
create function crevux.mobile8h_permit(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language sql security definer set search_path='' as $$
 select (crevux.mobile8h_bound($1,$2,$3,$4,$5,$6)).permit $$;
create function crevux.mobile8h_view(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r crevux.mobile8h_diagnostic_runs;begin perform crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1;if not found then return null;end if;
 return jsonb_build_object('operationId',r.operation_id,'state',r.state,'providerCalls',r.provider_calls,'reservedUsdMicros',r.reserved_usd_micros,
  'reservedCredits',r.reserved_credits,'actualUsdMicros',r.actual_usd_micros,'debitedCredits',r.debited_credits,'resultDigest',case when r.state='succeeded' then r.result_digest else null end,
  'observedUsdMicros',r.provider_observed_usd_micros,'reviewToleranceUsdMicros',100000,'reviewRequired',r.state in ('quarantined','reservation_unknown'),
  'retryable',false,'mayResubmit',false);end $$;
create function crevux.mobile8h_begin_reservation(uuid,uuid,uuid,uuid,text,text,jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into p from crevux.mobile8h_diagnostic_permits where operation_id=$1 for update;
 if exists(select 1 from crevux.mobile8h_diagnostic_runs where operation_id=$1) then return false;end if;
 if (p.active and p.expires_at>clock_timestamp() and p.expires_at<clock_timestamp()+interval '15 minutes' and
  p.expires_at<'2026-10-23T00:00:00Z'::timestamptz and $7->>'requestDigest'=p.request_digest) is not true then raise exception 'MOBILE8H_ADMISSION_CLOSED';end if;
 insert into crevux.mobile8h_diagnostic_runs(operation_id,state,reserved_usd_micros) values($1,'reservation_unknown',50000);return true;end $$;
create function crevux.mobile8h_valid_credit_receipt(p crevux.mobile8h_diagnostic_permits,r jsonb,s text) returns boolean language sql set search_path='' as $$
 select (r->>'schemaVersion'='mobile8h-canonical-credit-receipt/v1' and r->>'operationId'=p.operation_id::text and r->>'requestDigest'=p.request_digest and
  r->>'actorId'=p.actor_id::text and r->>'workspaceId'=p.workspace_id::text and r->>'balanceId'=p.permit->>'canonicalBalanceId' and
  r->>'canonicalWorkspaceId'=p.permit->>'canonicalWorkspaceId' and r->'poolUserId' is not distinct from p.permit->'canonicalPoolUserId' and
  r->>'creditKey'='media_image_credits' and r->>'creditCharge'=p.permit->>'creditCharge' and r->>'state'=s and
  r->>'holdId'~'^[0-9a-f-]{36}$' and r->>'reservationTransactionId'~'^[0-9a-f-]{36}$') is true $$;
create function crevux.mobile8h_reserve(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;r crevux.mobile8h_diagnostic_runs;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1 for update;
 if not found or r.state<>'reservation_unknown' or not crevux.mobile8h_valid_credit_receipt(p,$7->'receipt','reserved') then raise exception 'MOBILE8H_AUTHENTICATED_CANONICAL_HOLD_REQUIRED';end if;
 update crevux.mobile8h_diagnostic_runs set state='reserved',reserved_credits=(p.permit->>'creditCharge')::bigint,canonical_receipt=$7->'receipt' where operation_id=$1;
 return crevux.mobile8h_view($1,$2,$3,$4,$5,$6,$7);end $$;
create function crevux.mobile8h_dispatch(uuid,uuid,uuid,uuid,text,text,jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;r crevux.mobile8h_diagnostic_runs;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into p from crevux.mobile8h_diagnostic_permits where operation_id=$1 for update;select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1 for update;
 if not found or (p.active and p.expires_at>clock_timestamp() and r.state='reserved' and r.provider_calls=0 and $7->>'requestDigest'=p.request_digest and
  crevux.mobile8h_valid_credit_receipt(p,r.canonical_receipt,'reserved')) is not true then return false;end if;
 if not exists(select 1 from crevux.assets s where s.id=p.source_id and s.workspace_id=p.workspace_id and s.created_by=p.actor_id and
  s.asset_type='source_image' and s.metadata->>'access'='private' and s.metadata->>'imageDigest'=p.permit->>'sourceDigest') then raise exception 'MOBILE8H_SOURCE_OWNERSHIP_REQUIRED';end if;
 update crevux.mobile8h_diagnostic_runs set state='dispatching',provider_calls=1,fence_id=gen_random_uuid(),dispatched_at=clock_timestamp() where operation_id=$1;return true;end $$;
create function crevux.mobile8h_fence(uuid,uuid,uuid,uuid,text,text,jsonb) returns uuid language plpgsql security definer set search_path='' as $$
begin perform crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);return(select fence_id from crevux.mobile8h_diagnostic_runs where operation_id=$1 and state='dispatching' and provider_calls=1);end $$;
create function crevux.mobile8h_source(uuid,uuid,uuid,uuid,text,text,jsonb) returns text language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;path text;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select s.storage_path into path from crevux.assets s where s.id=p.source_id and s.workspace_id=$4 and s.created_by=$3 and
  s.asset_type='source_image' and s.metadata->>'access'='private' and s.metadata->>'imageDigest'=p.permit->>'sourceDigest';
 if path is null then raise exception 'MOBILE8H_SOURCE_OWNERSHIP_REQUIRED';end if;return path;end $$;
create function crevux.mobile8h_finish(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;r crevux.mobile8h_diagnostic_runs;c numeric;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1 for update;if not found then raise exception 'MOBILE8H_RUN_REQUIRED';end if;
 if r.state='succeeded' then if(r.provider_request_id=$7->>'requestId' and r.result_digest=$7->>'digest' and r.provider_usage=$7->'usage' and
  r.canonical_receipt=$7->'canonicalReceipt') is not true then raise exception 'MOBILE8H_RECEIPT_CONFLICT';end if;return crevux.mobile8h_view($1,$2,$3,$4,$5,$6,$7);end if;
 c:=ceil(($7#>>'{usage,inputText}')::numeric*(p.permit#>>'{ratecard,inputTextMicrosPerMillion}')::numeric/1000000)+
  ceil(($7#>>'{usage,inputImage}')::numeric*(p.permit#>>'{ratecard,inputImageMicrosPerMillion}')::numeric/1000000)+ceil(($7#>>'{usage,outputImage}')::numeric*(p.permit#>>'{ratecard,outputImageMicrosPerMillion}')::numeric/1000000);
 if(r.state='dispatching' and r.provider_calls=1 and c>=0 and c<=100000 and c=($7->>'usdMicros')::numeric and ($7->>'credits')::bigint=r.reserved_credits and
  jsonb_typeof($7#>'{usage,inputText}')='number' and jsonb_typeof($7#>'{usage,inputImage}')='number' and jsonb_typeof($7#>'{usage,outputImage}')='number' and
  ($7#>>'{usage,inputText}')::numeric>=0 and ($7#>>'{usage,inputImage}')::numeric>=0 and ($7#>>'{usage,outputImage}')::numeric>=0 and
  $7->>'digest'~'^[a-f0-9]{64}$' and length($7->>'requestId') between 1 and 256 and $7->>'storagePath' like('supabase://%/'||$4::text||'/'||$3::text||'/mobile8h-diagnostic/'||$1::text||'-%') and
  crevux.mobile8h_valid_credit_receipt(p,$7->'canonicalReceipt','settled') and $7#>>'{canonicalReceipt,holdId}'=r.canonical_receipt->>'holdId' and
  $7#>>'{canonicalReceipt,reservationTransactionId}'=r.canonical_receipt->>'reservationTransactionId' and
  $7#>>'{canonicalReceipt,fenceId}'=r.fence_id::text and $7#>'{canonicalReceipt,providerReceipt}'=
  jsonb_build_object('requestId',$7->>'requestId','observedUsdMicros',c,'usage',$7->'usage','resultDigest',$7->>'digest')) is not true then raise exception 'MOBILE8H_RESULT_RECEIPT_MISMATCH';end if;
 update crevux.mobile8h_diagnostic_runs set state='succeeded',actual_usd_micros=c,debited_credits=reserved_credits,provider_request_id=$7->>'requestId',
  storage_path=$7->>'storagePath',result_digest=$7->>'digest',provider_usage=$7->'usage',provider_observed_usd_micros=c,canonical_receipt=$7->'canonicalReceipt' where operation_id=$1;
 return crevux.mobile8h_view($1,$2,$3,$4,$5,$6,$7);end $$;
create function crevux.mobile8h_stage_result(uuid,uuid,uuid,uuid,text,text,jsonb) returns void language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;r crevux.mobile8h_diagnostic_runs;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1 for update;
 if (r.state='dispatching' and r.provider_calls=1 and $7->>'digest'~'^[a-f0-9]{64}$' and length($7->>'requestId') between 1 and 256 and
  $7->>'storagePath' like('supabase://%/'||$4::text||'/'||$3::text||'/mobile8h-diagnostic/'||$1::text||'-%')) is not true then raise exception 'MOBILE8H_RESULT_RECEIPT_MISMATCH';end if;
 if r.result_digest is not null and (r.result_digest=$7->>'digest' and r.storage_path=$7->>'storagePath' and r.provider_request_id=$7->>'requestId' and
   r.provider_usage=$7->'usage') is not true then raise exception 'MOBILE8H_RECEIPT_CONFLICT';end if;
 update crevux.mobile8h_diagnostic_runs set result_digest=$7->>'digest',storage_path=$7->>'storagePath',provider_request_id=$7->>'requestId',provider_usage=$7->'usage' where operation_id=$1;
end $$;
create function crevux.mobile8h_quarantine(uuid,uuid,uuid,uuid,text,text,jsonb) returns void language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 update crevux.mobile8h_diagnostic_runs set state='quarantined',provider_usage=$7->'usage',provider_request_id=$7->>'requestId',
  provider_observed_usd_micros=ceil(($7#>>'{usage,inputText}')::numeric*(p.permit#>>'{ratecard,inputTextMicrosPerMillion}')::numeric/1000000)+
  ceil(($7#>>'{usage,inputImage}')::numeric*(p.permit#>>'{ratecard,inputImageMicrosPerMillion}')::numeric/1000000)+ceil(($7#>>'{usage,outputImage}')::numeric*(p.permit#>>'{ratecard,outputImageMicrosPerMillion}')::numeric/1000000)
  where operation_id=$1 and state in('reservation_unknown','reserved','dispatching');end $$;
create function crevux.mobile8h_release(uuid,uuid,uuid,uuid,text,text,jsonb) returns void language plpgsql security definer set search_path='' as $$begin raise exception 'MOBILE8H_OPERATOR_RELEASE_ONLY';end $$;
create function crevux.mobile8h_reconcile_release(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;r crevux.mobile8h_diagnostic_runs;c jsonb;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into r from crevux.mobile8h_diagnostic_runs where operation_id=$1 for update;c:=$7->'receipt';
 if(not p.active and r.provider_calls=0 and r.fence_id is null and r.state in('reservation_unknown','reserved','quarantined','released') and
  crevux.mobile8h_valid_credit_receipt(p,c,'released') and c->'fenceId'='null'::jsonb and
  c->>'releaseTransactionId'~'^[0-9a-f-]{36}$' and
  (r.canonical_receipt is null or (c->>'holdId'=r.canonical_receipt->>'holdId' and
    c->>'reservationTransactionId'=r.canonical_receipt->>'reservationTransactionId'))) is not true then raise exception 'MOBILE8H_CONFIRMED_RELEASE_REQUIRED';end if;
 if r.state='released' and r.canonical_receipt<>c then raise exception 'MOBILE8H_RECEIPT_CONFLICT';end if;
 update crevux.mobile8h_diagnostic_runs set state='released',reserved_credits=0,canonical_receipt=c,updated_at=clock_timestamp() where operation_id=$1;
 return crevux.mobile8h_view($1,$2,$3,$4,$5,$6,$7);end $$;
create function crevux.mobile8h_release_precheck(uuid,uuid,uuid,uuid,text,text,jsonb) returns boolean language plpgsql security definer set search_path='' as $$
declare p crevux.mobile8h_diagnostic_permits;begin p:=crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);
 select * into p from crevux.mobile8h_diagnostic_permits where operation_id=$1 for update;
 return not p.active and exists(select 1 from crevux.mobile8h_diagnostic_runs where operation_id=$1 and
  provider_calls=0 and fence_id is null and state in('reservation_unknown','reserved','quarantined','released'));end $$;
create function crevux.mobile8h_result(uuid,uuid,uuid,uuid,text,text,jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin perform crevux.mobile8h_bound($1,$2,$3,$4,$5,$6);return(select jsonb_build_object('storagePath',storage_path,'digest',result_digest) from crevux.mobile8h_diagnostic_runs where operation_id=$1 and state='succeeded');end $$;
do $$declare f regprocedure;r text;begin
 if not exists(select 1 from pg_roles where rolname='mobile8h_runtime') then create role mobile8h_runtime nologin nosuperuser nobypassrls;end if;
 for r in select rolname from pg_roles where rolname in('anon','authenticated','service_role','mobile8h_runtime') loop
  execute format('revoke all on crevux.mobile8h_diagnostic_permits,crevux.mobile8h_diagnostic_runs from %I',r);end loop;
 grant usage on schema crevux to mobile8h_runtime;
 for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crevux' and p.proname like 'mobile8h_%' loop
  execute format('revoke all on function %s from public',f);
  for r in select rolname from pg_roles where rolname in('anon','authenticated','service_role','mobile8h_runtime') loop execute format('revoke all on function %s from %I',f,r);end loop;
  if f::text not like '%mobile8h_bound%' and f::text not like '%mobile8h_immutable_authority%' and f::text not like '%mobile8h_valid_credit_receipt%' then execute format('grant execute on function %s to mobile8h_runtime',f);end if;
 end loop;end $$;
commit;

