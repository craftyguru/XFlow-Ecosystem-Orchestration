# Rataify Shared Supabase Local Migration

This document covers the local-only Rataify bridge into the shared ecosystem Supabase project. It does not change production wiring, legacy runtime persistence, billing authority, or XFlow control-plane authority.

## Current Rataify DB Access Map

- Runtime database: `server/db.ts` uses `DATABASE_URL` through Drizzle/Neon serverless.
- Schema and models: `shared/schema.ts` owns the legacy Rataify product schema and Drizzle table definitions.
- Migrations: `migrations/` contains the existing Rataify Drizzle migration history and remains untouched.
- Server auth/session helpers: `server/replitAuth.ts`, `server/githubAuth.ts`, `server/middleware/auth.ts`, and `connect-pg-simple` session wiring use the legacy runtime database path.
- Workspace/org logic: `orgs`, `user_org_roles`, `users`, and related route modules under `server/routes/`.
- Rataify product data: `sites`, `scans`, `pages`, `issues`, privacy/copy/risk modules, evidence/proof/display data, and generated policy data live in the legacy app schema today.
- Verixet billing/entitlement/usage authority: `server/services/billingCheckout.ts`, `server/services/rataifyEntitlements.ts`, `server/services/rataifyUsageGuard.ts`, `server/services/verixetUsageIngest.ts`, and billing routes delegate billing and usage admission to Verixet.
- XFlow/UCL/control-plane authority: `server/lib/ucl/*`, `server/routes/ucl.ts`, `server/routes/control-plane.ts`, and `server/lib/control-plane/*` integrate with XFlow without making Rataify the control-plane authority.
- Browser/client Supabase access: no Rataify browser Supabase client is migrated here. The Vite public Supabase env contract exists for future browser auth/session work only.

## Legacy Tables Found

Representative legacy Rataify tables include `users`, `profiles`, `orgs`, `user_org_roles`, `sites`, `scan_schedules`, `scans`, `pages`, `issues`, `remediation_rules`, `jobs`, `events`, `privacy_scans`, `legal_policies`, `audaix_audit_proofs`, `connected_app_links`, `ucl_xflow_connections`, `stripe_customers`, `stripe_subscriptions`, `data_retention_policies`, `data_export_requests`, `developer_api_keys`, `developer_webhooks`, and support/admin/audit tables.

This local bridge does not delete or rewrite those tables. It mirrors only selected local product activity to the new shared schema for verification.

## Target Shared Supabase Access Map

Shared core tables used:

- `core.workspaces`
- `core.workspace_app_access`
- `core.ecosystem_apps`
- `core.audit_logs`
- `core.usage_events`

Rataify-owned app tables used:

- `rataify.sites`
- `rataify.reviews`
- `rataify.issues`
- `rataify.risk_events`
- `rataify.evidence_items`

Storage bucket:

- `rataify-evidence`

Rataify must not directly mutate Verixet-owned entitlement decisions or XFlow-owned app connection/control-plane state. Verixet remains the authority for billing, entitlements, usage admission, credits, and plans. XFlow remains the authority for app connection and control-plane state.

## Bridge Module

The local bridge lives at:

- `apps/RatAiFy/server/supabase/shared-local.server.ts`

It imports:

- `createServiceSupabaseClient` from `@xflow-ecosystem/supabase/service-role.server`
- `recordUsageEvent` and `writeAuditLog` from `@xflow-ecosystem/supabase`

The module is server-only by filename and uses the service-role helper only when `RATAIFY_SHARED_SUPABASE_LOCAL_ENABLED=true` and service Supabase env values are present.

## Env Vars Required

Put shared Supabase local values in root `.env.shared.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

Put the Rataify-specific local bridge flag in `apps/RatAiFy/.env.local`:

```env
RATAIFY_SHARED_SUPABASE_LOCAL_ENABLED=true
```

Optional dashboard inspection mode:

```env
RATAIFY_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Do not commit `.env.shared.local`, `.env.local`, database URLs, service-role keys, or app-specific secrets.

## Smoke Command

From `apps/RatAiFy`:

```bash
npm run smoke:shared-supabase-local
```

The smoke loads env files in this order:

1. Root `.env.shared.local`
2. `apps/RatAiFy/.env.local`
3. `apps/RatAiFy/.env`

If legacy `apps/RatAiFy/.env` has shared Supabase connection values, the smoke prefers root `.env.shared.local` for the shared project and prints a key-name-only warning. It never prints passwords, Supabase keys, service tokens, or query parameters.

## Smoke Checks

The smoke verifies:

- database auth/connectivity
- `core` schema exists
- `rataify` schema exists
- `core.ecosystem_apps` contains `app_slug='rataify'`
- RLS is enabled on `core.audit_logs`, `core.usage_events`, and all Rataify app tables
- storage bucket `rataify-evidence` exists
- service-role Supabase client can write marked local rows into `rataify.*` through the bridge
- local `core.audit_logs` and `core.usage_events` writes work through shared helpers
- cleanup removes smoke rows by default

Smoke rows are marked with:

- `source='local_smoke'`
- `environment='local'`
- `metadata.smokeTest=true`
- `metadata.smokeTestId='local-rataify-shared-supabase-smoke'`

## Dashboard Verification

In the Supabase Dashboard, verify:

- API exposed schemas include `core` and `rataify`
- the `rataify-evidence` bucket exists
- RLS is enabled on the relevant `core.*` and `rataify.*` tables
- if cleanup is disabled, smoke rows appear in `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.risk_events`, `rataify.evidence_items`, `core.audit_logs`, and `core.usage_events`

Manual cleanup query if `RATAIFY_SHARED_SUPABASE_SMOKE_CLEANUP=false` was used:

```sql
delete from core.audit_logs where metadata->>'smokeTestId' = 'local-rataify-shared-supabase-smoke';
delete from core.workspaces
where slug = 'local-rataify-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-rataify-shared-supabase-smoke';
```

Deleting the smoke workspace cascades Rataify app rows and usage events.

## What Remains Legacy

- Rataify runtime persistence remains unchanged.
- Existing Drizzle migrations remain untouched.
- Browser access remains unchanged.
- Verixet entitlement and usage-admission calls remain the billing authority path.
- XFlow/UCL/control-plane calls remain the control-plane authority path.

## Production Cutover Status

Production cutover is not safe yet. This bridge proves local shared schema compatibility only. Before production cutover, Rataify runtime reads/writes must be migrated deliberately, entitlement checks must keep using Verixet boundaries, XFlow connection/control-plane state must remain XFlow-owned, and isolation tests must be run against the production-intended Supabase project.
