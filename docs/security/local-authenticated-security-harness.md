# Local Authenticated Security Harness

Date: 2026-05-10

## Purpose

The authenticated persona simulation needs real non-production sessions. It cannot safely prove role boundaries with production users or production Supabase data.

Use this harness to run the six-app ecosystem locally or against an explicitly separate staging Supabase project. Production Supabase must not be used because the fixture script creates disposable users, workspaces, app access rows, Verixet entitlement state, billing-event rows, and audit rows.

## Files

- Preflight: `scripts/security-local-harness-preflight.mjs`
- Persona seed/session minting: `scripts/setup-staging-security-personas.mjs`
- Authenticated simulation: `scripts/authenticated-persona-security-simulation.mjs`
- Local env template: `.env.security-local.example`
- Ignored local fixture file: `output/dev/auth-personas.fixture.local.json`

## Root Commands

```powershell
npm run security:local:preflight
npm run security:local:write-template
npm run security:local:seed-personas
npm run security:local:simulate
npm run security:local:cleanup
```

## Local Environment

Copy the template:

```powershell
Copy-Item .env.security-local.example .env.security-local
```

Fill `.env.security-local` with local Supabase values only:

```dotenv
XFLOW_PROOF_BASE_URL=http://localhost:3000
VERIXET_PROOF_BASE_URL=http://localhost:3001
RATAIFY_PROOF_BASE_URL=http://localhost:3002
AUDAIX_PROOF_BASE_URL=http://localhost:3003
WORDGENI_PROOF_BASE_URL=http://localhost:3004
CREVUX_PROOF_BASE_URL=http://localhost:3005

SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=replace-with-local-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-local-anon-key

AUTH_PERSONA_FIXTURES_FILE=output/dev/auth-personas.fixture.local.json
```

Do not put production Supabase keys in this file.

## Supabase Setup

The repo currently has `supabase/migrations`, but preflight checks whether `supabase/config.toml` exists. If `supabase/config.toml` is missing, do not overwrite anything blindly. Initialize local Supabase intentionally, then reuse the existing migrations.

Required tools:

- Docker Desktop running
- Supabase CLI on `PATH`

Typical local setup:

```powershell
supabase init
supabase start
supabase status
```

Copy the local API URL, anon key, and service-role key from `supabase status` into `.env.security-local`. Keep values private.

If you use an explicitly separate staging Supabase project instead of local Supabase, set `AUTH_PERSONA_SUPABASE_IS_STAGING=1` and use staging proof URLs. Never set that flag for production.

## Start The Six Apps

The security harness expects these ports:

| App | URL | Command |
| --- | --- | --- |
| XFlow | `http://localhost:3000` | `npm --prefix apps/XFlow run dev -- -p 3000` |
| Verixet | `http://localhost:3001` | `npm --prefix apps/Verixet exec next dev -p 3001` |
| RatAiFy | `http://localhost:3002` | `cd apps/RatAiFy; npx cross-env NODE_ENV=development PORT=3002 HOST=127.0.0.1 DOTENV_CONFIG_PATH=.env tsx -r dotenv/config -r ./server/load-local-env.cjs server/index.ts` |
| AudAiX | `http://localhost:3003` | `cd apps/AudAix; npx cross-env PORT=3003 tsx src/server.ts` |
| WordGeni | `http://localhost:3004` | `pnpm --dir apps/WordGeni/apps/web exec next dev -p 3004` |
| CreVux | `http://localhost:3005` | `cd apps/CreVux; pnpm --filter @workspace/api-server build; $env:PORT='3005'; pnpm --filter @workspace/api-server start` |

Some app default `dev` scripts use different ports. Use the commands above for the security harness.

## Run Preflight

```powershell
npm run security:local:preflight
```

Preflight checks:

- Docker availability
- Supabase CLI availability
- `supabase status` output
- `supabase/config.toml`
- `supabase/migrations`
- safe `SUPABASE_URL`
- redacted presence of service-role and anon keys
- safe six-app proof URLs
- all six expected ports listening

`PASS` means the machine is ready to seed personas. `BLOCKED` means at least one prerequisite is missing or unsafe.

## Seed Personas And Mint Sessions

Only run this after preflight passes:

```powershell
npm run security:local:seed-personas
```

The seed script creates disposable personas only against local Supabase:

- normal authenticated user
- workspace admin
- app admin
- support admin
- security admin
- superadmin/platform owner
- expired/past_due subscription user
- canceled subscription user
- cross-workspace user

It creates Security Fixture Workspace A and B, grants app access for all six apps, seeds Verixet-sourced entitlement/billing states, and writes session material only to the ignored fixture file.

No token, password, cookie, bearer, refresh token, OAuth code, or service key is printed.

## Run Authenticated Simulation

```powershell
npm run security:local:simulate
```

Success looks like:

- `0 failed`
- `0 blocked`
- normal user denied admin/superadmin/internal/platform routes
- workspace admin scoped to own workspace
- app admin scoped to own app/workspace
- support admin denied billing/platform/superadmin authority
- security admin denied billing mutation unless explicitly allowed
- expired/canceled users denied paid features
- cross-workspace user denied Workspace A data from Workspace B

The total probe count can change as the harness grows.

## Cleanup

After local/staging testing:

```powershell
npm run security:local:cleanup
```

Do not run cleanup against production. The script has safety gates, but the operator should still verify `.env.security-local` points at local/staging.

## Current Preflight Result

The current machine is blocked:

- Docker daemon unavailable.
- Supabase CLI unavailable.
- `supabase/config.toml` missing.
- `supabase/migrations` exists.
- Production-like proof URLs are still loaded from existing env files because `.env.security-local` is not configured.
- Ports `3001`, `3002`, `3004`, and `3005` are not listening.
- Ports `3000` and `3003` are listening.

No destructive cleanup was run because no disposable local/staging personas were created.
