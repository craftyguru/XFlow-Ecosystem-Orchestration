-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators restored between ledger statements.
-- Version: 20260910100109; name: mobile_7_user_images_compat; statement-join MD5: 41fd228d0598fc1b4950b7acaa8a9a57

set lock_timeout='5s'; set statement_timeout='30s';
create table public.user_images (
 id serial primary key,
 user_id text not null references public.users(id) on delete cascade,
 workspace_id text not null references public.workspaces(id) on delete cascade,
 storage_url text not null,
 hash text not null,
 mime_type text not null,
 width integer not null check (width > 0),
 height integer not null check (height > 0),
 size_bytes integer not null check (size_bytes > 0),
 consent_flag boolean not null default false,
 is_deleted boolean not null default false,
 metadata jsonb,
 safety_flags jsonb,
 created_at timestamp not null default now(),
 updated_at timestamp not null default now()
);
create index user_images_user_workspace_idx on public.user_images(user_id,workspace_id);
create index user_images_hash_idx on public.user_images(hash);
create index user_images_deleted_idx on public.user_images(is_deleted);
alter table public.user_images enable row level security;
revoke all on public.user_images from anon,authenticated;
revoke all on sequence public.user_images_id_seq from anon,authenticated;
grant select,insert,update,delete on public.user_images to service_role;
grant usage,select on sequence public.user_images_id_seq to service_role;

