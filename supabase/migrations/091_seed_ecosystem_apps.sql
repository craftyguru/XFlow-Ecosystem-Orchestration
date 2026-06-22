insert into core.ecosystem_apps (
  slug,
  display_name,
  authority_role,
  owns_billing,
  owns_entitlements,
  owns_usage_metering,
  owns_control_plane,
  status,
  metadata
)
values
  (
    'xflow',
    'XFlow',
    'Control-plane, app-linking, ecosystem orchestration authority',
    false,
    false,
    false,
    true,
    'active',
    '{"future_extraction_schema":"xflow","bucket":"xflow-artifacts"}'::jsonb
  ),
  (
    'verixet',
    'Verixet',
    'Billing, entitlements, usage, credits, plan, and Stripe authority',
    true,
    true,
    true,
    false,
    'active',
    '{"future_extraction_schema":"verixet","bucket":"verixet-billing-artifacts"}'::jsonb
  ),
  (
    'audaix',
    'AudAiX',
    'Audit, report, monitoring product-data owner',
    false,
    false,
    false,
    false,
    'active',
    '{"future_extraction_schema":"audaix","bucket":"audaix-reports"}'::jsonb
  ),
  (
    'rataify',
    'Rataify',
    'Review, site, risk, evidence product-data owner',
    false,
    false,
    false,
    false,
    'active',
    '{"future_extraction_schema":"rataify","bucket":"rataify-evidence"}'::jsonb
  ),
  (
    'wordgeni',
    'WordGeni',
    'Document, writing, source, memory product-data owner',
    false,
    false,
    false,
    false,
    'active',
    '{"future_extraction_schema":"wordgeni","bucket":"wordgeni-exports"}'::jsonb
  ),
  (
    'crevux',
    'Crevux',
    'Media generation, project, asset, job, export product-data owner',
    false,
    false,
    false,
    false,
    'active',
    '{"future_extraction_schema":"crevux","bucket":"crevux-assets"}'::jsonb
  )
on conflict (slug) do update
set
  display_name = excluded.display_name,
  authority_role = excluded.authority_role,
  owns_billing = excluded.owns_billing,
  owns_entitlements = excluded.owns_entitlements,
  owns_usage_metering = excluded.owns_usage_metering,
  owns_control_plane = excluded.owns_control_plane,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();
