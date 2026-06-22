# Supabase Migration Runbook

Date: 2026-05-04

## Scope

This runbook covers the shared Supabase preparation phases before app runtime cutover.

Phase 1 includes:

- shared schema migrations
- RLS migrations
- storage bucket setup SQL
- `core.ecosystem_apps` seed data
- SQL validation checks
- documentation and read-only validation script

Phase 2 includes:

- shared Supabase helper package
- server-only service-role guardrails
- `.env.example` contract updates only
- documentation updates
- static validation script

Neither phase points production apps at the new Supabase project, writes real secrets, deploys, deletes old migrations, or modifies live databases.

## Migration Source

Canonical shared migration directory:

```text
supabase/migrations
```

Existing app migrations remain in place as legacy references until the shared path is verified.

## Order

Apply migrations in filename order:

1. `001_core_schema.sql`
2. `002_core_rls.sql`
3. `010_xflow_schema.sql`
4. `011_xflow_rls.sql`
5. `020_verixet_schema.sql`
6. `021_verixet_rls.sql`
7. `030_audaix_schema.sql`
8. `031_audaix_rls.sql`
9. `040_rataify_schema.sql`
10. `041_rataify_rls.sql`
11. `050_wordgeni_schema.sql`
12. `051_wordgeni_rls.sql`
13. `060_crevux_schema.sql`
14. `061_crevux_rls.sql`
15. `090_storage_buckets.sql`
16. `091_seed_ecosystem_apps.sql`
17. `099_validation_checks.sql`
18. `100_api_role_grants.sql`

## Before Applying

- Create the new Supabase project manually.
- Do not point any production app at the new project yet.
- Confirm the project has Auth and Storage enabled.
- Capture values in a secret manager, not in committed files:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `DIRECT_DATABASE_URL`
- Verify the migration executor uses a server-side or direct database connection.

## Shared Local Env File

For local migration and smoke testing, keep shared Supabase values in this root-only file:

```text
.env.shared.local
```

Start from:

```text
.env.shared.example
```

Load order for local scripts that opt into the shared loader:

1. root `.env.shared.local`
2. app `.env.local`
3. app `.env`

App-local values override shared values when explicitly set. Use `.env.shared.local` only for shared Supabase values used by local migration/testing:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Keep app-specific secrets such as Stripe keys, OAuth secrets, provider API keys, and app feature flags in each app's own `.env.local`.

Do not commit `.env.shared.local`. Production envs still need to be configured per deployed app or service. One shared local env file does not create a shared production variable store.

## Apply

Use the Supabase SQL editor, Supabase CLI, or a controlled migration runner against the new project only.

Do not run these migrations against old app-specific production databases until a separate compatibility plan exists.

## Validate

Run the SQL validation migration:

```text
099_validation_checks.sql
```

Run the repo-level validation script:

```powershell
node scripts/validate-supabase-phase1.mjs
```

Expected result:

```text
validate-supabase-phase1: ok
```

## Manual Dashboard Checks

- Schemas exist: `core`, `xflow`, `verixet`, `audaix`, `rataify`, `wordgeni`, `crevux`.
- Data API exposed schemas include: `core`, `xflow`, `verixet`, `audaix`, `rataify`, `wordgeni`, `crevux`.
- Database grants from `100_api_role_grants.sql` have been applied so PostgREST can access exposed custom schemas through `authenticated` and `service_role`.
- `core.ecosystem_apps` contains six canonical slugs.
- RLS is enabled on every table in all seven schemas.
- App schemas have no broad `anon` grants. `authenticated` grants exist only so PostgREST can reach exposed schemas; RLS policies still enforce access.
- Buckets exist and are private:
  - `xflow-artifacts`
  - `verixet-billing-artifacts`
  - `audaix-reports`
  - `rataify-evidence`
  - `wordgeni-exports`
  - `crevux-assets`
- Auth redirect URLs include all local and production app callback URLs.
- No real secret is committed to the repo.

## Rollback

Because there are no production users, the preferred rollback during Phase 1 is to discard and recreate the new Supabase project before any apps are pointed at it.

If rollback is needed after applying migrations but before runtime cutover:

- stop using the project
- export SQL logs for diagnosis
- recreate the project
- reapply corrected migrations in order

Do not delete old app databases until after runtime migration, smoke tests, backups, and restore drills pass.

## Phase 2 Gate

Do not start runtime helper work until Phase 1 has:

- migration files present
- docs present
- repo validation passing
- SQL validation passing on the new Supabase project
- manual dashboard checklist completed

## Phase 2 Helper Layer

The shared helper package is:

```text
packages/ecosystem-supabase
```

Future app migrations should import browser, server, and service-role clients from the narrow entrypoints:

```ts
import { createBrowserSupabaseClient } from "@xflow-ecosystem/supabase/browser";
import { createServerSupabaseClient } from "@xflow-ecosystem/supabase/server";
import { createServiceSupabaseClient } from "@xflow-ecosystem/supabase/service-role.server";
```

Use the package root for shared authorization and telemetry helpers:

```ts
import {
  getCurrentUser,
  getCurrentWorkspace,
  recordUsageEvent,
  requireEntitlement,
  requireWorkspaceAppAccess,
  requireWorkspaceMember,
  writeAuditLog,
} from "@xflow-ecosystem/supabase";
```

Rules:

- Browser imports may use `createBrowserSupabaseClient` for anon-key auth/session flows only.
- Browser imports must not reference `createServiceSupabaseClient` or `service-role.server`.
- App schema writes, private storage writes, entitlement gates, usage recording, and audit logging belong in server routes or server actions.
- Verixet remains the billing/entitlement/usage authority. Product apps call Verixet boundaries instead of duplicating billing logic.
- XFlow remains the app-linking/control-plane authority. Product apps call XFlow boundaries instead of mutating XFlow-owned state.

## Phase 2 Env Examples

Only `.env.example` files are updated in Phase 2. Do not write real values to committed files.

Next.js browser env:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Vite browser env:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server-only env:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

## Phase 2 Validation

Run:

```powershell
node scripts/validate-supabase-phase1.mjs
node scripts/validate-supabase-phase2.mjs
```

Expected result:

```text
validate-supabase-phase1: ok
validate-supabase-phase2: ok
```

## Applying API Role Grants

After adding custom schemas to Supabase Dashboard Data API exposed schemas, apply the repeatable grant migration:

```powershell
npx supabase@latest db push
```

These grants do not replace RLS. They allow PostgREST to reach the exposed schemas; RLS policies still decide which rows normal authenticated users can access. The service-role key remains server-only and must never be placed in public env vars or browser bundles.
