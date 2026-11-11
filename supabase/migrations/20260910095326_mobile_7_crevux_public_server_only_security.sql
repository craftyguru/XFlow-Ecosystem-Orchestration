-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators were already present in the single ledger statement.
-- Version: 20260910095326; name: mobile_7_crevux_public_server_only_security; statement-join MD5: aeeb948c76d068a318fb6f385d536217

set lock_timeout = '5s';
set statement_timeout = '30s';

revoke all privileges on table
  public.ai_usage_events,
  public.assets,
  public.auth_audit_events,
  public.ecosystem_identity_links,
  public.ecosystem_workspace_mappings,
  public.generated_images,
  public.generation_job_outcomes,
  public.generation_jobs,
  public.idempotency_records,
  public.legal_acceptances,
  public.projects,
  public.user_mfa_backup_codes,
  public.user_mfa_configs,
  public.user_sessions,
  public.users,
  public.video_jobs,
  public.webauthn_credentials,
  public.workspace_memberships,
  public.workspaces,
  public.v_job_outcome_rollups
from anon, authenticated;

revoke all privileges on sequence
  public.ai_usage_events_id_seq,
  public.assets_id_seq,
  public.auth_audit_events_id_seq,
  public.ecosystem_workspace_mappings_id_seq,
  public.generated_images_id_seq,
  public.generation_job_outcomes_id_seq,
  public.generation_jobs_id_seq,
  public.projects_id_seq,
  public.user_mfa_backup_codes_id_seq,
  public.user_mfa_configs_id_seq,
  public.video_jobs_id_seq,
  public.workspace_memberships_id_seq
from anon, authenticated;

alter table public.ai_usage_events enable row level security;
alter table public.assets enable row level security;
alter table public.auth_audit_events enable row level security;
alter table public.ecosystem_identity_links enable row level security;
alter table public.ecosystem_workspace_mappings enable row level security;
alter table public.generated_images enable row level security;
alter table public.generation_job_outcomes enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.idempotency_records enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.projects enable row level security;
alter table public.user_mfa_backup_codes enable row level security;
alter table public.user_mfa_configs enable row level security;
alter table public.user_sessions enable row level security;
alter table public.users enable row level security;
alter table public.video_jobs enable row level security;
alter table public.webauthn_credentials enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspaces enable row level security;

alter view public.v_job_outcome_rollups set (security_invoker = true);
