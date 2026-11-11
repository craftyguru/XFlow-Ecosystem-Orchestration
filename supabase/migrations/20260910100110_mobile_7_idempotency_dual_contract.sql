-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators restored between ledger statements.
-- Version: 20260910100110; name: mobile_7_idempotency_dual_contract; statement-join MD5: 1243bc3a3a196ff6b968476d4db403b5

set lock_timeout='5s'; set statement_timeout='30s';
create sequence public.idempotency_records_legacy_id_seq;
alter table public.idempotency_records
  alter column id set default nextval('public.idempotency_records_legacy_id_seq')::text,
  add column user_id text references public.users(id) on delete cascade,
  add column key text,
  add column route text,
  add column request_hash text,
  add column response_status integer,
  add column response_body text;
create unique index idempotency_records_user_key_unique on public.idempotency_records(user_id,key) where user_id is not null and key is not null;
create or replace function public.sync_crevux_legacy_idempotency_contract()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is not null then
    if new.key is null or new.route is null or new.request_hash is null or new.response_status is null or new.response_body is null then
      raise exception 'incomplete Crevux legacy idempotency contract';
    end if;
    new.scope_type := 'crevux_legacy_user';
    new.scope_id := new.user_id;
    new.route_id := new.route;
    new.idempotency_key := new.key;
    new.body_sha256 := new.request_hash;
    new.status_code := new.response_status;
    new.response_json := new.response_body::jsonb;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_crevux_legacy_idempotency_contract() from public,anon,authenticated;
create trigger idempotency_records_crevux_legacy_sync
before insert or update on public.idempotency_records
for each row execute function public.sync_crevux_legacy_idempotency_contract();
revoke all on sequence public.idempotency_records_legacy_id_seq from anon,authenticated;
grant usage,select on sequence public.idempotency_records_legacy_id_seq to service_role;

