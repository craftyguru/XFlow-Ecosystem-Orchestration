-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20260919195456; name: mobile7_crevux_xflow_principal_bindings; statement-join MD5: 6a5b083ec59056fbc186e1025ac538f5

-- Crevux-owned, pre-provisioned authorization boundary. Never backfill or
-- infer a binding from equal IDs, email, or first login. XFlow tables are
-- deliberately not altered and are rechecked by the protected provisioner.
create table if not exists crevux.xflow_principal_bindings (
  id uuid primary key default gen_random_uuid(),
  xflow_subject text not null,
  xflow_workspace text not null,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  core_workspace_id uuid not null references core.workspaces(id) on delete restrict,
  status text not null default 'active',
  attestation_method text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  audit_metadata jsonb not null default '{}'::jsonb,
  constraint xflow_principal_bindings_subject_exact check
    (length(xflow_subject) between 1 and 256 and xflow_subject = btrim(xflow_subject)),
  constraint xflow_principal_bindings_workspace_exact check
    (length(xflow_workspace) between 1 and 256 and xflow_workspace = btrim(xflow_workspace)),
  constraint xflow_principal_bindings_status_check check
    (status in ('active', 'revoked')),
  constraint xflow_principal_bindings_attestation_check check
    (attestation_method = 'admin_verified'),
  constraint xflow_principal_bindings_revocation_check check
    ((status = 'active' and revoked_at is null) or
     (status = 'revoked' and revoked_at is not null)),
  constraint xflow_principal_bindings_audit_metadata_check check
    (jsonb_typeof(audit_metadata) = 'object')
);

create unique index if not exists xflow_principal_bindings_active_external_uidx
  on crevux.xflow_principal_bindings (xflow_subject, xflow_workspace)
  where status = 'active';

create unique index if not exists xflow_principal_bindings_active_local_uidx
  on crevux.xflow_principal_bindings (auth_user_id, core_workspace_id)
  where status = 'active';

create index if not exists xflow_principal_bindings_local_lookup_idx
  on crevux.xflow_principal_bindings (core_workspace_id, auth_user_id, status);

alter table crevux.xflow_principal_bindings enable row level security;

alter table crevux.xflow_principal_bindings force row level security;

revoke all on table crevux.xflow_principal_bindings from public, anon, authenticated;

grant select on table crevux.xflow_principal_bindings to service_role;

-- No client or service_role write grant: the reviewed operator command uses
-- the already-approved direct database administrator authority only.;

