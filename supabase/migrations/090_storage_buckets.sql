-- App-specific Supabase Storage buckets.
-- Default policy is server-only. Browser access must be explicitly justified in
-- docs and backed by operation-specific policies and tests before being added.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('xflow-artifacts', 'xflow-artifacts', false, null, null),
  ('verixet-billing-artifacts', 'verixet-billing-artifacts', false, null, null),
  ('audaix-reports', 'audaix-reports', false, null, null),
  ('rataify-evidence', 'rataify-evidence', false, null, null),
  ('wordgeni-exports', 'wordgeni-exports', false, null, null),
  ('crevux-assets', 'crevux-assets', false, null, null)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists ecosystem_storage_service_select on storage.objects;
create policy ecosystem_storage_service_select on storage.objects
  for select
  using (
    bucket_id in (
      'xflow-artifacts',
      'verixet-billing-artifacts',
      'audaix-reports',
      'rataify-evidence',
      'wordgeni-exports',
      'crevux-assets'
    )
    and core.is_service_role()
  );

drop policy if exists ecosystem_storage_service_insert on storage.objects;
create policy ecosystem_storage_service_insert on storage.objects
  for insert
  with check (
    bucket_id in (
      'xflow-artifacts',
      'verixet-billing-artifacts',
      'audaix-reports',
      'rataify-evidence',
      'wordgeni-exports',
      'crevux-assets'
    )
    and core.is_service_role()
  );

drop policy if exists ecosystem_storage_service_update on storage.objects;
create policy ecosystem_storage_service_update on storage.objects
  for update
  using (
    bucket_id in (
      'xflow-artifacts',
      'verixet-billing-artifacts',
      'audaix-reports',
      'rataify-evidence',
      'wordgeni-exports',
      'crevux-assets'
    )
    and core.is_service_role()
  )
  with check (
    bucket_id in (
      'xflow-artifacts',
      'verixet-billing-artifacts',
      'audaix-reports',
      'rataify-evidence',
      'wordgeni-exports',
      'crevux-assets'
    )
    and core.is_service_role()
  );

drop policy if exists ecosystem_storage_service_delete on storage.objects;
create policy ecosystem_storage_service_delete on storage.objects
  for delete
  using (
    bucket_id in (
      'xflow-artifacts',
      'verixet-billing-artifacts',
      'audaix-reports',
      'rataify-evidence',
      'wordgeni-exports',
      'crevux-assets'
    )
    and core.is_service_role()
  );
