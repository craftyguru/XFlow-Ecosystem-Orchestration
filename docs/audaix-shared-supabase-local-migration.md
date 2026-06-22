# AudAiX Shared Supabase Local Migration

This document covers the local-only AudAiX bridge into the shared ecosystem Supabase project. It does not change production wiring, legacy persistence, billing authority, or XFlow control-plane authority.

## Current AudAiX DB Access Map

- Browser Supabase client: `apps/AudAix/dashboard/src/lib/supabase-browser.ts` uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser auth/profile flows only.
- Server Postgres/Supabase persistence: `apps/AudAix/src/persistence/supabase-postgres.ts` uses `DIRECT_DATABASE_URL` or `DATABASE_URL` when `AUDAIX_PERSISTENCE_BACKEND=supabase-postgres`.
- Legacy schema bootstrap: `apps/AudAix/src/persistence/supabase-schema.ts` creates the existing AudAiX app tables in the legacy database.
- Local SQLite default: `apps/AudAix/src/persistence/sqlite.ts` and `apps/AudAix/audaix.db` remain the default local runtime path unless explicitly configured otherwise.
- Auth/session helpers: `apps/AudAix/src/auth/jwt.ts`, `apps/AudAix/src/routes/universal-auth-routes.ts`, and related tests use Supabase JWT settings without changing shared database ownership.
- Verixet billing/entitlement/usage authority: `apps/AudAix/src/lib/billing/billing-authority.ts`, `apps/AudAix/src/lib/billing/verixet-usage.ts`, and `apps/AudAix/src/audaix-entitlements.ts`.
- XFlow/UCL/control-plane integration: `apps/AudAix/src/ucl/*`, `apps/AudAix/src/routes/control-plane-routes.ts`, and `AUDAIX_XFLOW_CONTROL_PLANE_SECRET`-protected routes.

## Legacy Tables Found

Representative legacy AudAiX tables include `workspaces`, `workspace_members`, `workspace_invites`, `sites`, `audit_runs`, `artifacts`, `findings`, `connector_exports`, `stored_files`, `baselines`, `baseline_history`, `site_audit_schedules`, `control_plane_events`, `security_scans`, `security_findings`, `security_scan_checks`, `security_scan_artifacts`, `security_remediation_prompts`, `security_score_history`, `security_audit_exports`, `security_integrations`, `security_target_verifications`, `security_alert_events`, `security_public_summaries`, `security_scan_schedules`, `security_notification_preferences`, `responsive_audit_runs`, `responsive_route_results`, `responsive_ignore_rules`, `ai_checks`, `project_repositories`, and `project_scan_runs`.

Phase 1/2 does not delete or rewrite those legacy tables. The shared bridge mirrors only selected local product activity to the new schema for verification.

## Target Shared Supabase Access Map

Shared core tables used:

- `core.workspaces`
- `core.workspace_app_access`
- `core.ecosystem_apps`
- `core.audit_logs`
- `core.usage_events`

AudAiX-owned app tables used:

- `audaix.audits`
- `audaix.audit_reports`
- `audaix.monitors`
- `audaix.audit_findings`
- `audaix.scan_jobs`

Storage bucket:

- `audaix-reports`

AudAiX must not directly mutate Verixet-owned entitlement decisions or XFlow-owned app connection/control-plane state. Verixet remains the authority for billing, entitlements, usage admission, credits, and plans. XFlow remains the authority for app connection and control-plane state.

## Bridge Module

The local bridge lives at:

- `apps/AudAix/src/supabase/shared-local.server.ts`

It imports:

- `createServiceSupabaseClient` from `@xflow-ecosystem/supabase/service-role.server`
- `recordUsageEvent` and `writeAuditLog` from `@xflow-ecosystem/supabase`

The module is server-only by filename and uses the service-role helper only when `AUDAIX_SHARED_SUPABASE_LOCAL_ENABLED=true` and service Supabase env values are present.

## Env Vars Required

Put shared Supabase local values in root `.env.shared.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

Put the AudAiX-specific local bridge flag in `apps/AudAix/.env.local`:

```env
AUDAIX_SHARED_SUPABASE_LOCAL_ENABLED=true
```

Optional dashboard inspection mode:

```env
AUDAIX_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Do not commit `.env.shared.local`, `.env.local`, database URLs, service-role keys, or app-specific secrets.

## Smoke Command

From `apps/AudAix`:

```bash
npm run smoke:shared-supabase-local
```

The smoke loads env files in this order:

1. Root `.env.shared.local`
2. `apps/AudAix/.env.local`
3. `apps/AudAix/.env`

It prints only safe database target details: username, host, database name, and source file. It never prints passwords, Supabase keys, service tokens, or query parameters.

## Smoke Checks

The smoke verifies:

- database auth/connectivity
- `core` schema exists
- `audaix` schema exists
- `core.ecosystem_apps` contains `app_slug='audaix'`
- RLS is enabled on `core.audit_logs`, `core.usage_events`, and all AudAiX app tables
- storage bucket `audaix-reports` exists
- service-role Supabase client can write marked local rows into `audaix.*` through the bridge
- local `core.audit_logs` and `core.usage_events` writes work through shared helpers
- cleanup removes smoke rows by default

Smoke rows are marked with:

- `source='local_smoke'`
- `environment='local'`
- `metadata.smokeTest=true`
- `metadata.smokeTestId='local-audaix-shared-supabase-smoke'`

## Dashboard Verification

In the Supabase Dashboard, verify:

- API exposed schemas include `core` and `audaix`
- the `audaix-reports` bucket exists
- RLS is enabled on the relevant `core.*` and `audaix.*` tables
- if cleanup is disabled, smoke rows appear in `audaix.audits`, `audaix.audit_reports`, `audaix.monitors`, `audaix.audit_findings`, `audaix.scan_jobs`, `core.audit_logs`, and `core.usage_events`

Manual cleanup query if `AUDAIX_SHARED_SUPABASE_SMOKE_CLEANUP=false` was used:

```sql
delete from core.audit_logs where metadata->>'smokeTestId' = 'local-audaix-shared-supabase-smoke';
delete from core.workspaces
where slug = 'local-audaix-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-audaix-shared-supabase-smoke';
```

Deleting the smoke workspace cascades AudAiX app rows and usage events.

## What Remains Legacy

- AudAiX runtime persistence remains unchanged.
- Existing Supabase/Postgres bootstrap migrations remain untouched.
- Existing SQLite local runtime remains available.
- Browser access remains limited to the existing Vite anon-key client flow.
- Verixet entitlement and usage-admission calls remain the billing authority path.
- XFlow/UCL/control-plane calls remain the control-plane authority path.

## Production Cutover Status

Production cutover is not safe yet. This bridge proves local shared schema compatibility only. Before production cutover, AudAiX runtime reads/writes must be migrated deliberately, entitlement checks must keep using Verixet boundaries, XFlow connection/control-plane state must remain XFlow-owned, and isolation tests must be run against the production-intended Supabase project.
