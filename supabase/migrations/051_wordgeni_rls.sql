alter table wordgeni.documents enable row level security;
alter table wordgeni.document_sources enable row level security;
alter table wordgeni.memory_cards enable row level security;
alter table wordgeni.writing_sessions enable row level security;
alter table wordgeni.provenance_items enable row level security;

drop policy if exists wordgeni_documents_select on wordgeni.documents;
create policy wordgeni_documents_select on wordgeni.documents for select
  using (core.has_workspace_app_access(workspace_id, 'wordgeni') or core.is_service_role());
drop policy if exists wordgeni_documents_service_write on wordgeni.documents;
create policy wordgeni_documents_service_write on wordgeni.documents for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'wordgeni');

drop policy if exists wordgeni_document_sources_select on wordgeni.document_sources;
create policy wordgeni_document_sources_select on wordgeni.document_sources for select
  using (core.has_workspace_app_access(workspace_id, 'wordgeni') or core.is_service_role());
drop policy if exists wordgeni_document_sources_service_write on wordgeni.document_sources;
create policy wordgeni_document_sources_service_write on wordgeni.document_sources for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'wordgeni');

drop policy if exists wordgeni_memory_cards_select on wordgeni.memory_cards;
create policy wordgeni_memory_cards_select on wordgeni.memory_cards for select
  using (core.has_workspace_app_access(workspace_id, 'wordgeni') or core.is_service_role());
drop policy if exists wordgeni_memory_cards_service_write on wordgeni.memory_cards;
create policy wordgeni_memory_cards_service_write on wordgeni.memory_cards for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'wordgeni');

drop policy if exists wordgeni_writing_sessions_select on wordgeni.writing_sessions;
create policy wordgeni_writing_sessions_select on wordgeni.writing_sessions for select
  using (core.has_workspace_app_access(workspace_id, 'wordgeni') or core.is_service_role());
drop policy if exists wordgeni_writing_sessions_service_write on wordgeni.writing_sessions;
create policy wordgeni_writing_sessions_service_write on wordgeni.writing_sessions for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'wordgeni');

drop policy if exists wordgeni_provenance_items_select on wordgeni.provenance_items;
create policy wordgeni_provenance_items_select on wordgeni.provenance_items for select
  using (core.has_workspace_app_access(workspace_id, 'wordgeni') or core.is_service_role());
drop policy if exists wordgeni_provenance_items_service_write on wordgeni.provenance_items;
create policy wordgeni_provenance_items_service_write on wordgeni.provenance_items for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'wordgeni');

revoke all on schema wordgeni from anon, authenticated;
