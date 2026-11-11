-- Canonical forward-only production migration for the private Crevux Mobile8
-- import and moderation ledger. The contract was reconstructed and qualified
-- in Crevux, then compared against XFlow-Ecosystem production catalog metadata.
--
-- This migration creates no public/client API. All Studio feature flags remain
-- independently held by the Crevux service.

set lock_timeout = '5s';
set statement_timeout = '60s';

do $mobile8_preflight$
declare
  dependency record;
begin
  for dependency in
    select *
    from (values
      ('auth', 'users', 'id', 'uuid'),
      ('core', 'workspaces', 'id', 'uuid'),
      ('crevux', 'xflow_principal_bindings', 'id', 'uuid'),
      ('crevux', 'xflow_principal_bindings', 'auth_user_id', 'uuid'),
      ('crevux', 'xflow_principal_bindings', 'core_workspace_id', 'uuid'),
      ('crevux', 'assets', 'id', 'uuid'),
      ('crevux', 'assets', 'workspace_id', 'uuid')
    ) as required(schema_name, table_name, column_name, data_type)
  loop
    if not exists (
      select 1
      from information_schema.columns c
      where c.table_schema = dependency.schema_name
        and c.table_name = dependency.table_name
        and c.column_name = dependency.column_name
        and c.data_type = dependency.data_type
    ) then
      raise exception 'MOBILE8_DEPENDENCY_MISMATCH: %.%.% must exist as %',
        dependency.schema_name, dependency.table_name, dependency.column_name, dependency.data_type;
    end if;
  end loop;

  if to_regclass('crevux.mobile8_import_operations') is not null
     or to_regclass('crevux.mobile8_import_items') is not null
     or to_regclass('crevux.mobile8_moderation_receipts') is not null then
    raise exception 'MOBILE8_TARGET_ALREADY_EXISTS';
  end if;
end
$mobile8_preflight$;

create unique index mobile8_principal_binding_scope_uidx
  on crevux.xflow_principal_bindings (id, auth_user_id, core_workspace_id);

create unique index mobile8_asset_workspace_uidx
  on crevux.assets (id, workspace_id);

create table crevux.mobile8_import_operations (
  id uuid primary key default gen_random_uuid(),
  principal_binding_id uuid not null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  draft_operation_ref_hash bytea not null,
  manifest_asset_count integer not null,
  manifest_digest bytea not null,
  state text not null default 'open',
  failure_code text,
  reconciliation_code text,
  terminal_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile8_import_operations_binding_fk
    foreign key (principal_binding_id, actor_user_id, workspace_id)
    references crevux.xflow_principal_bindings (id, auth_user_id, core_workspace_id)
    on delete restrict,
  constraint mobile8_import_operations_ref_hash_check
    check (octet_length(draft_operation_ref_hash) = 32),
  constraint mobile8_import_operations_manifest_count_check
    check (manifest_asset_count between 1 and 4),
  constraint mobile8_import_operations_manifest_digest_check
    check (octet_length(manifest_digest) = 32),
  constraint mobile8_import_operations_state_check
    check (state in ('open', 'complete', 'reconciliation_required', 'discard_pending', 'discarded', 'failed')),
  constraint mobile8_import_operations_scope_uidx
    unique (id, actor_user_id, workspace_id),
  constraint mobile8_import_operations_draft_uidx
    unique (actor_user_id, workspace_id, draft_operation_ref_hash)
);

create table crevux.mobile8_moderation_receipts (
  id uuid primary key default gen_random_uuid(),
  principal_binding_id uuid not null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  normalized_digest bytea not null,
  policy_version text not null,
  state text not null default 'claimed',
  accepted_item_id uuid,
  failure_code text,
  terminal_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile8_moderation_receipts_binding_fk
    foreign key (principal_binding_id, actor_user_id, workspace_id)
    references crevux.xflow_principal_bindings (id, auth_user_id, core_workspace_id)
    on delete restrict,
  constraint mobile8_moderation_receipts_digest_check
    check (octet_length(normalized_digest) = 32),
  constraint mobile8_moderation_receipts_policy_check
    check (char_length(policy_version) between 1 and 96 and policy_version = btrim(policy_version)),
  constraint mobile8_moderation_receipts_state_check
    check (state in ('claimed', 'approved', 'rejected', 'unknown')),
  constraint mobile8_moderation_receipts_evidence_uidx
    unique (actor_user_id, workspace_id, normalized_digest, policy_version),
  constraint mobile8_moderation_receipts_scope_uidx
    unique (id, actor_user_id, workspace_id, normalized_digest, policy_version)
);

create table crevux.mobile8_import_items (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null,
  actor_user_id uuid not null,
  workspace_id uuid not null,
  idempotency_key_hash bytea not null,
  request_fingerprint bytea not null,
  ordinal integer not null,
  role text not null,
  caption text,
  normalized_mime text not null,
  normalized_bytes integer not null,
  width integer not null,
  height integer not null,
  normalized_digest bytea not null,
  policy_version text not null,
  state text not null default 'claimed',
  moderation_receipt_id uuid,
  canonical_asset_id uuid,
  storage_bucket text,
  storage_object_key text,
  storage_size bigint,
  cleanup_state text not null default 'none',
  failure_code text,
  reconciliation_code text,
  terminal_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile8_import_items_operation_scope_fk
    foreign key (operation_id, actor_user_id, workspace_id)
    references crevux.mobile8_import_operations (id, actor_user_id, workspace_id)
    on delete cascade,
  constraint mobile8_import_items_receipt_scope_fk
    foreign key (moderation_receipt_id, actor_user_id, workspace_id, normalized_digest, policy_version)
    references crevux.mobile8_moderation_receipts
      (id, actor_user_id, workspace_id, normalized_digest, policy_version)
    on delete restrict,
  constraint mobile8_import_items_asset_scope_fk
    foreign key (canonical_asset_id, workspace_id)
    references crevux.assets (id, workspace_id)
    on delete restrict,
  constraint mobile8_import_items_idempotency_hash_check
    check (octet_length(idempotency_key_hash) = 32),
  constraint mobile8_import_items_request_fingerprint_check
    check (octet_length(request_fingerprint) = 32),
  constraint mobile8_import_items_ordinal_check
    check (ordinal between 0 and 3),
  constraint mobile8_import_items_role_check
    check (role in ('primary', 'reference')),
  constraint mobile8_import_items_role_ordinal_check
    check ((ordinal = 0 and role = 'primary') or (ordinal > 0 and role = 'reference')),
  constraint mobile8_import_items_caption_check
    check (caption is null or char_length(caption) <= 160),
  constraint mobile8_import_items_mime_check
    check (normalized_mime in ('image/jpeg', 'image/png', 'image/webp')),
  constraint mobile8_import_items_bytes_check
    check (normalized_bytes between 1 and 12582912),
  constraint mobile8_import_items_dimensions_check
    check (width between 1 and 4096 and height between 1 and 4096
      and width::bigint * height::bigint <= 16000000),
  constraint mobile8_import_items_digest_check
    check (octet_length(normalized_digest) = 32),
  constraint mobile8_import_items_policy_check
    check (char_length(policy_version) between 1 and 96 and policy_version = btrim(policy_version)),
  constraint mobile8_import_items_state_check
    check (state in (
      'claimed', 'moderating', 'approved', 'rejected', 'quarantined_unknown',
      'write_claimed', 'stored_uncommitted', 'stored_verified', 'accepted',
      'storage_failed', 'database_ambiguous', 'cleanup_pending', 'cleaned', 'discarded'
    )),
  constraint mobile8_import_items_cleanup_state_check
    check (cleanup_state in ('none', 'pending', 'in_progress', 'failed', 'retained', 'complete')),
  constraint mobile8_import_items_storage_size_check
    check (storage_size is null or storage_size between 1 and 12582912),
  constraint mobile8_import_items_idempotency_uidx
    unique (actor_user_id, workspace_id, idempotency_key_hash),
  constraint mobile8_import_items_ordinal_uidx
    unique (operation_id, ordinal),
  constraint mobile8_import_items_receipt_target_uidx
    unique (id, actor_user_id, workspace_id, normalized_digest, policy_version)
);

alter table crevux.mobile8_moderation_receipts
  add constraint mobile8_moderation_receipts_accepted_item_fk
  foreign key (accepted_item_id, actor_user_id, workspace_id, normalized_digest, policy_version)
  references crevux.mobile8_import_items
    (id, actor_user_id, workspace_id, normalized_digest, policy_version)
  on delete restrict;

create unique index mobile8_import_items_primary_uidx
  on crevux.mobile8_import_items (operation_id)
  where role = 'primary';

create index mobile8_import_operations_scope_activity_idx
  on crevux.mobile8_import_operations (actor_user_id, workspace_id, updated_at desc);

create index mobile8_import_operations_reconciliation_idx
  on crevux.mobile8_import_operations (updated_at, id)
  where state in ('open', 'reconciliation_required');

create index mobile8_import_items_operation_state_idx
  on crevux.mobile8_import_items (operation_id, state, updated_at);

create index mobile8_import_items_storage_reference_idx
  on crevux.mobile8_import_items (storage_object_key)
  where storage_object_key is not null and state = 'accepted' and cleanup_state = 'retained';

create index mobile8_import_items_cleanup_idx
  on crevux.mobile8_import_items (updated_at, operation_id)
  where state in (
    'moderating', 'write_claimed', 'stored_uncommitted', 'storage_failed',
    'database_ambiguous', 'cleanup_pending'
  );

create index mobile8_moderation_receipts_scope_idx
  on crevux.mobile8_moderation_receipts (actor_user_id, workspace_id, created_at desc);

create function crevux.mobile8_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end
$function$;

create trigger mobile8_import_operations_set_updated_at
  before update on crevux.mobile8_import_operations
  for each row execute function crevux.mobile8_set_updated_at();

create trigger mobile8_import_items_set_updated_at
  before update on crevux.mobile8_import_items
  for each row execute function crevux.mobile8_set_updated_at();

create trigger mobile8_moderation_receipts_set_updated_at
  before update on crevux.mobile8_moderation_receipts
  for each row execute function crevux.mobile8_set_updated_at();

alter table crevux.mobile8_import_operations enable row level security;
alter table crevux.mobile8_import_operations force row level security;
alter table crevux.mobile8_import_items enable row level security;
alter table crevux.mobile8_import_items force row level security;
alter table crevux.mobile8_moderation_receipts enable row level security;
alter table crevux.mobile8_moderation_receipts force row level security;

create policy mobile8_import_operations_service
  on crevux.mobile8_import_operations
  for all to service_role
  using (true)
  with check (true);

create policy mobile8_import_items_service
  on crevux.mobile8_import_items
  for all to service_role
  using (true)
  with check (true);

create policy mobile8_moderation_receipts_service
  on crevux.mobile8_moderation_receipts
  for all to service_role
  using (true)
  with check (true);

revoke all on table
  crevux.mobile8_import_operations,
  crevux.mobile8_import_items,
  crevux.mobile8_moderation_receipts
from public, anon, authenticated;

grant select, insert, update, delete on table
  crevux.mobile8_import_operations,
  crevux.mobile8_import_items,
  crevux.mobile8_moderation_receipts
to service_role;

revoke all on function crevux.mobile8_set_updated_at()
from public, anon, authenticated;

grant execute on function crevux.mobile8_set_updated_at()
to service_role;

comment on table crevux.mobile8_import_operations is
  'Private identity-bound Mobile8 import operation ledger.';
comment on table crevux.mobile8_import_items is
  'Private normalized image import items and canonical asset provenance.';
comment on table crevux.mobile8_moderation_receipts is
  'Private actor/workspace/digest/policy moderation evidence for Mobile8 imports.';
