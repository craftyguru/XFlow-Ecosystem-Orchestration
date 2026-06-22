# Shared Supabase Local Migration

Date: 2026-05-04

## Scope

This document covers local-only shared Supabase env loading for the ecosystem migration. It does not change production envs, deploy apps, migrate runtime behavior, or remove per-app env files.

## Shared Local Env File

Create this file locally at the repo root:

```text
.env.shared.local
```

Start from the committed template:

```text
.env.shared.example
```

Paste the new shared Supabase local values into `.env.shared.local`, never into `.env.shared.example`.

Shared values allowed in `.env.shared.local`:

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

Do not put app-specific secrets in `.env.shared.local`. Keep Stripe keys, OAuth secrets, provider API keys, webhook secrets, and app feature flags in each app's `.env.local`.

## Load Order

Local scripts that opt into the shared loader use this order:

1. root `.env.shared.local`
2. app `.env.local`
3. app `.env`

App-local files override shared values when explicitly set.

For shared Supabase smoke tests, the preferred setup is:

- shared Supabase DB URLs live in root `.env.shared.local`
- `VERIXET_SHARED_SUPABASE_LOCAL_ENABLED=true` lives in `apps/Verixet/.env.local`
- `apps/Verixet/.env` does not override `DATABASE_URL` or `DIRECT_DATABASE_URL` unless you are intentionally testing an app-local database override

If `apps/Verixet/.env` supplies `DATABASE_URL` or `DIRECT_DATABASE_URL`, the Verixet smoke prints this warning without showing secret values:

```text
App-local DB URL is overriding root shared Supabase DB URL.
```

To require DB URLs to come from root `.env.shared.local`, set this local flag:

```text
VERIXET_SHARED_SUPABASE_REQUIRE_ROOT_DB_ENV=true
```

When strict mode is enabled, the smoke fails if `DATABASE_URL` or `DIRECT_DATABASE_URL` is supplied by `apps/Verixet/.env`.

If you see an app-local DB URL override during the Verixet shared Supabase smoke, remove or comment these lines from `apps/Verixet/.env`, then keep the intended shared values in root `.env.shared.local`:

```text
DATABASE_URL=
DIRECT_DATABASE_URL=
```

For Supabase pooler connection strings, the username is often `postgres.PROJECT_REF` and the database name is usually `postgres`. Passwords with special characters such as `@`, `#`, `%`, `:`, `/`, `?`, `&`, or `+` must be URL-encoded in the connection string.

## Security Rules

- The anon key may be public when RLS and approved browser access policies protect data.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- `DATABASE_URL` and `DIRECT_DATABASE_URL` are server-only.
- Never create `NEXT_PUBLIC_*SERVICE_ROLE*` or `VITE_*SERVICE_ROLE*` variables.
- Do not import service-role helpers from browser/client files.

## Data API Setup

The shared Supabase project must expose custom schemas in Dashboard -> Project Settings -> API -> Data API Settings:

- `core`
- `xflow`
- `verixet`
- `audaix`
- `rataify`
- `wordgeni`
- `crevux`

PostgREST also needs database grants in addition to dashboard schema exposure. Apply migration `100_api_role_grants.sql` with:

```powershell
npx supabase@latest db push
```

The grants let `authenticated` and `service_role` reach exposed schemas. RLS still controls normal authenticated row access. `service_role` is server-only and must never reach browser/client code.

## Verixet Smoke

Verixet's local smoke command uses the shared loader:

```powershell
cd apps/Verixet
npm run smoke:shared-supabase-local
```

Required local values:

```text
VERIXET_SHARED_SUPABASE_LOCAL_ENABLED=true
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

`DIRECT_DATABASE_URL` is preferred for metadata checks. If it is absent, the smoke script falls back to `DATABASE_URL`.

## Dashboard Verification

When the Verixet smoke is run with retained rows:

```powershell
$env:VERIXET_SHARED_SUPABASE_SMOKE_CLEANUP="false"
npm run smoke:shared-supabase-local
```

Check these tables for `metadata->>smokeTestId = local-verixet-shared-supabase-smoke`:

- `core.workspaces`
- `core.workspace_app_access`
- `core.entitlements`
- `core.usage_events`
- `core.audit_logs`
- `verixet.entitlement_decisions`
- `verixet.usage_admission_logs`

## Manual Cleanup

Use this only for rows created by the local smoke:

```sql
delete from core.audit_logs
where metadata->>'smokeTestId' = 'local-verixet-shared-supabase-smoke';

delete from core.workspaces
where slug = 'local-verixet-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-verixet-shared-supabase-smoke';
```

Deleting the smoke workspace cascades related smoke rows in the shared bridge tables.

## Production

`.env.shared.local` is a local development convenience only. Production envs still need to be set per deployed app or service in the deployment platform's secret manager. One shared local env file does not imply one shared production variable store.
