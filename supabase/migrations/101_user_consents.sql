-- Shared ecosystem consent mirror for account-level legal acceptance.
-- Runtime XFlow auth stores its primary consent records in XFlow Postgres; this
-- table gives the shared Supabase core schema the same guarded shape for proofs
-- and future cross-app reads.

create table if not exists core.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references core.workspaces(id) on delete set null,
  app_slug text references core.ecosystem_apps(slug) on delete restrict,
  consent_type text not null check (consent_type in ('privacy_policy', 'user_agreement')),
  consent_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null check (source in ('email_signup', 'google_oauth', 'github_oauth', 'facebook_oauth', 'central_auth')),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists core_user_consents_user_idx
  on core.user_consents (user_id, consent_type, consent_version);

create index if not exists core_user_consents_workspace_idx
  on core.user_consents (workspace_id, app_slug);

alter table core.user_consents enable row level security;

drop policy if exists user_consents_select_own on core.user_consents;
create policy user_consents_select_own on core.user_consents
  for select using (user_id = auth.uid() or core.is_service_role());

drop policy if exists user_consents_service_write on core.user_consents;
create policy user_consents_service_write on core.user_consents
  for all using (core.is_service_role())
  with check (core.is_service_role());

grant select on core.user_consents to authenticated;
