# Shared Supabase Backfill Plan

There are no production users, but backfill still matters for configuration, app registry, Stripe mappings, admin workspaces, storage, and operational records. This plan separates data that should migrate from smoke/demo/local data that should not.

## Global Backfill Rules

Backfill only after:

- Shared migrations are applied.
- `100_api_role_grants.sql` is applied.
- Storage buckets exist.
- Local smokes pass.
- A backup/export exists for any source database.

Do not migrate:

- Local-only smoke rows with `source='local_smoke'`, `environment='local'`, `metadata.smokeTest=true`, or known smoke IDs.
- Placeholder dashboards or fake metrics.
- Test/demo workspaces unless explicitly approved.
- Provider jobs that cannot be safely reconciled.

Required shared seeds/config:

- `core.ecosystem_apps` rows for `xflow`, `verixet`, `audaix`, `rataify`, `wordgeni`, `crevux`.
- Workspace/app access rows for approved admin/test workspaces.
- Verixet plan slugs, feature keys, usage feature keys, credit policies, and Stripe product/price mappings.
- XFlow app connection/control-plane defaults.

## Global Data Classes

Verify whether these need to be copied:

- Plan slugs
- Feature keys
- Entitlement definitions
- Usage feature keys
- Stripe product/price mappings
- App registry rows
- Admin users/workspaces
- Test/demo workspaces
- Storage objects
- Provider job records
- Webhook records
- Audit logs

## Verixet

Phase 4A runtime migration status:

- Backfill is not required for the new dual-write adapter itself.
- Runtime dual-write rows are marked with `metadata.runtime_migration_phase='verixet_shared_supabase_phase_4a'`.
- Runtime smoke rows are marked with `metadata.smokeTest=true` and must not be backfilled.
- Before staging, verify plan slugs, feature keys, usage feature keys, and Stripe product/price mappings exist in the legacy source and have an approved target seed/backfill path.

Backfill:

- Stripe customers/subscriptions only if they are real launch records.
- Stripe product/price mapping config.
- Plan and entitlement definitions.
- Credit ledger state if any real balances exist.
- Webhook idempotency records if replay protection depends on them.
- Usage feature keys and admission policy config.

Ignore:

- Local smoke rows.
- Fake/demo Stripe records.
- Placeholder plan usage.

Config from code/env:

- Stripe secret/webhook keys.
- Stripe API version and webhook endpoint config.
- Runtime feature flag.

Config from DB:

- Product/price mappings if Verixet stores them in DB.
- Entitlement definitions and credit balances if not fully code-defined.

Required seed SQL:

- `core.ecosystem_apps` includes `verixet`.
- Required Verixet product/plan/feature seed rows.

Manual setup:

- Stripe webhook endpoint points to the production Verixet runtime.
- Webhook signing secret is configured server-side only.

## XFlow

Phase 4B runtime migration status:

- Backfill is not required for the new dual-write adapter itself.
- Runtime dual-write rows are marked with `metadata.runtime_migration_phase='xflow_shared_supabase_phase_4b'`.
- Runtime smoke rows are marked with `metadata.smokeTest=true` and must not be backfilled.
- Before staging, verify app registry, workspace app access, app connections, link state, deployment checks, and workflow records have an approved target seed/backfill path.

Backfill:

- App registry/linking config.
- App connection state for admin/test workspaces.
- Control-plane defaults needed by product apps.
- Workflow/deployment check templates if stored in DB.

Ignore:

- Local smoke rows.
- Old failed deployment checks that are not needed for launch.

Config from code/env:

- Runtime app URLs.
- App connection API credentials.
- Control-plane service tokens.

Config from DB:

- Workspace app links and connection state.

Required seed SQL:

- `core.ecosystem_apps` includes `xflow`.
- Initial app connection rows for approved workspaces only.

Manual setup:

- Product apps must call XFlow APIs for connection/control-plane decisions.

## AudAiX

Backfill:

- Real audit/report/monitor definitions intended for launch.
- Finding templates or monitor config if stored in DB.

Ignore:

- Demo audits.
- Local smoke rows.
- Generated placeholder reports.

Config from code/env:

- Scanner/provider credentials.
- Runtime feature flags.

Config from DB:

- Monitor schedules and audit records if prelaunch data is intentionally retained.

Required seed SQL:

- `core.ecosystem_apps` includes `audaix`.
- Workspace app access for intended workspaces.

Manual setup:

- Confirm reports storage bucket `audaix-reports`.

Phase 4C runtime notes:

- Runtime dual-write is default-off and only mirrors first-path audit creation/completion, repo audit creation, finding writes, scan-job telemetry, usage telemetry, and audit logs.
- Backfill must still reconcile legacy `audit_runs`, `findings`, generated report payloads, monitor schedules, and report artifacts before shared reads can become primary.
- Do not backfill local smoke rows where metadata includes `smokeTest=true`, `source=local_smoke`, or `source=runtime_smoke`.
- Verixet remains the source for entitlement and usage admission history; AudAiX usage rows are telemetry only.
- XFlow remains the source for app connection/control-plane history.

## Rataify

Backfill:

- Real sites, reviews, issues, risk events, evidence items intended for launch.
- Evidence storage objects if they are real and needed.

Ignore:

- Demo review/site data.
- Local smoke rows.
- Evidence placeholders.

Config from code/env:

- Provider/API credentials.
- Runtime feature flags.

Config from DB:

- Site/review/risk/evidence records.

Required seed SQL:

- `core.ecosystem_apps` includes `rataify`.
- Workspace app access rows.

Manual setup:

- Confirm `rataify-evidence` bucket and object migration policy.

Phase 4D runtime notes:

- Runtime dual-write is default-off and only mirrors first-path site creation, scan/review activity, issue writes, risk events, evidence/storage reservations, usage telemetry, and audit logs.
- Backfill must still reconcile legacy `sites`, `scans`, `pages`, `issues`, privacy/copy/inbox scan outputs, generated reports, and uploaded evidence before shared reads can become primary.
- Do not backfill local smoke rows where metadata includes `smokeTest=true`, `source=local_smoke`, or `source=runtime_smoke`.
- Verixet remains the source for entitlement and usage admission history; Rataify usage rows are telemetry only.
- XFlow remains the source for app connection/control-plane history.
- AudAiX remains the source for deep audit execution/report history where imported proof rows reference AudAiX results.

## WordGeni

Backfill:

- Real documents, sources, memory cards, writing sessions, provenance items.
- Export objects only if needed for launch.
- Admin/test workspaces only if intentionally retained.

Ignore:

- Smoke rows.
- Demo drafts.
- Local `.storage` artifacts.
- WordGeni records that actually represent Crevux-owned media jobs/assets.

Config from code/env:

- AI provider keys.
- XFlow auth handoff URLs.
- Verixet entitlement API URLs/tokens.
- Crevux integration endpoints.

Config from DB:

- Document/source/memory/provenance records.

Required seed SQL:

- `core.ecosystem_apps` includes `wordgeni`.
- Workspace app access rows.

Manual setup:

- Confirm `wordgeni-exports`.
- Decide whether source upload storage migrates now or later.

Phase 4E runtime notes:

- Runtime dual-write is default-off and only mirrors first-path primary document creation, source writes, voice writing sessions, voice memory snapshots, usage telemetry, and audit logs.
- Backfill must still reconcile legacy `projects`, `documents`, `sources`, `source_chunks`, workspace memory/coprocessor context, provenance event tables, export records, source-upload storage, and generated export artifacts before shared reads can become primary.
- Do not backfill local smoke rows where metadata includes `smokeTest=true`, `source=local_smoke`, or `source=runtime_smoke`.
- Verixet remains the source for entitlement and usage admission history; WordGeni usage rows are telemetry only.
- XFlow remains the source for app connection/control-plane history.
- Crevux remains the source for media generation, generated assets, visual provider jobs, and image/video/3D exports; WordGeni may backfill only boundary references to Crevux-owned records.

## Crevux

Backfill:

- Real projects, assets, generation jobs, exports, provider runs, credit spend events.
- Storage objects for real launch assets.
- Provider external IDs for jobs that must remain traceable.

Ignore:

- Smoke rows.
- Demo/gallery placeholders.
- In-flight or stale provider jobs unless explicitly reconciled.
- WordGeni-side references that do not belong to Crevux ownership tables.

Config from code/env:

- Provider keys.
- Callback URLs/secrets.
- Verixet entitlement/billing API URLs.
- XFlow control-plane API URLs.

Config from DB:

- Media/project/asset/job/export/provider records.
- Provider job IDs and callback state.

Required seed SQL:

- `core.ecosystem_apps` includes `crevux`.
- Workspace app access rows.

Manual setup:

- Confirm `crevux-assets`.
- Verify provider callbacks and storage object accessibility.

Phase 4F runtime notes:

- Runtime adapter is default-off and mirrors only when `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true` and `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`.
- First shared runtime targets are `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, `crevux.credit_spend_events`, `core.usage_events`, and `core.audit_logs`.
- Backfill must create or map `core.workspaces`, `core.workspace_members`, and auth/profile IDs before enabling live route dual-write because legacy Crevux IDs are numeric and the shared schema uses UUIDs.
- Do not backfill runtime/local smoke rows where `metadata.smokeTest=true` or `metadata->>'smokeTestId'` is present.
- Do not backfill provider jobs that are currently in-flight without a freeze window, provider callback drain, or explicit retry/idempotency reconciliation.
- Preserve WordGeni visual companion references as boundary references only; do not move WordGeni-owned document/source rows into Crevux tables.

## Backfill Validation

For each app after backfill:

- Row counts match expected source records.
- Smoke/local rows are absent.
- Workspace IDs map to `core.workspaces`.
- App slugs are correct.
- Storage object counts match expected inventory.
- Service-only tables are not browser-accessible.
- App can read/write only its own app schema.
