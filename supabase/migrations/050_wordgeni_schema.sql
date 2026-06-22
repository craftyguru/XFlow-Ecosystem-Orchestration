create schema if not exists wordgeni;

create table if not exists wordgeni.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'wordgeni' references core.ecosystem_apps(slug),
  title text not null,
  status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'wordgeni')
);

create table if not exists wordgeni.document_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'wordgeni' references core.ecosystem_apps(slug),
  document_id uuid references wordgeni.documents(id) on delete cascade,
  source_type text not null,
  created_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'wordgeni')
);

create table if not exists wordgeni.memory_cards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'wordgeni' references core.ecosystem_apps(slug),
  card_key text not null,
  created_by uuid references auth.users(id) on delete set null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'wordgeni')
);

create table if not exists wordgeni.writing_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'wordgeni' references core.ecosystem_apps(slug),
  document_id uuid references wordgeni.documents(id) on delete set null,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'wordgeni')
);

create table if not exists wordgeni.provenance_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references core.workspaces(id) on delete cascade,
  app_slug text not null default 'wordgeni' references core.ecosystem_apps(slug),
  document_id uuid references wordgeni.documents(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app_slug = 'wordgeni')
);

create index if not exists wordgeni_documents_workspace_idx on wordgeni.documents (workspace_id, created_at desc);
create index if not exists wordgeni_document_sources_workspace_idx on wordgeni.document_sources (workspace_id, document_id);
create index if not exists wordgeni_memory_cards_workspace_idx on wordgeni.memory_cards (workspace_id, card_key);
create index if not exists wordgeni_writing_sessions_workspace_idx on wordgeni.writing_sessions (workspace_id, document_id, created_at desc);
create index if not exists wordgeni_provenance_items_workspace_idx on wordgeni.provenance_items (workspace_id, document_id, created_at desc);
