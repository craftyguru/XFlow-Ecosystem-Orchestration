# Local Navigation QA

This guide is for authenticated browser QA of the shared navigation shell in apps that still need safe local sessions:

- XFlow
- RatAiFy
- Crevux
- Verixet

It is intentionally local-only. Do not point these commands at hosted Supabase, Neon, Railway, RDS, production, staging, or customer databases.

## Prerequisites

- Node and the package manager required by each app.
- Playwright browsers already installed for the app under test.
- Local disposable PostgreSQL databases. SQLite/in-memory is not a supported substitute for these four authenticated shell paths.
- Separate database names per app because schemas are incompatible:
  - `xflow_nav_qa`
  - `rataify_nav_qa`
  - `crevux_nav_qa`
  - `verixet_nav_qa`
- Optional Docker command for each database:

```powershell
docker run --name xflow-nav-qa-db -e POSTGRES_DB=xflow_nav_qa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 55410:5432 -d postgres:16
docker run --name rataify-nav-qa-db -e POSTGRES_DB=rataify_nav_qa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 55411:5432 -d postgres:16
docker run --name crevux-nav-qa-db -e POSTGRES_DB=crevux_nav_qa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 55412:5432 -d postgres:16
docker run --name verixet-nav-qa-db -e POSTGRES_DB=verixet_nav_qa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 55413:5432 -d postgres:16
```

No shared Docker Compose file currently exists for these four navigation QA databases. Crevux and RatAiFy have isolated test DB helpers for narrower integration or migration tests, but those are not a complete cross-app navigation QA harness.

## Local URL Check

Before any seed/bootstrap command, run the local DB assertion helper:

```powershell
node scripts/assert-local-db.mjs --url "postgresql://postgres:postgres@localhost:55410/xflow_nav_qa"
```

Allowed hosts are `localhost`, `127.0.0.1`, `::1`, `host.docker.internal`, or a single-label Docker service name such as `postgres`.

Hosted URLs are refused. Examples that must never be used for this QA pass:

- `*.supabase.co`
- `*.pooler.supabase.com`
- `*.neon.tech`
- `*.railway.app`
- `*.rds.amazonaws.com`
- any production/staging/customer database URL

## Never Commit

- `.env.local`, `.env.e2e`, generated API keys, passwords, session cookies, Playwright storage state, screenshots containing secrets, or copied hosted database URLs.
- Output from seed/bootstrap scripts if it includes generated credentials or API keys.

## XFlow

Status: local harness is partially ready. The seed and browser sign-in path exist, but the database must be local/disposable and the central-auth/Supabase service envs must be local-safe.

- Database type: PostgreSQL.
- SQLite/in-memory: not supported for authenticated dashboard QA.
- Docker Compose: none found for XFlow navigation QA.
- Migration command: `npm --prefix apps/XFlow run db:migrate`.
- Seed command: `npm --prefix apps/XFlow run seed:qa`.
- Auth/session fixture: real credential sign-in with `QA_TEST_EMAIL`/`QA_TEST_PASSWORD` or `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`.
- Expected local URL: `http://127.0.0.1:3110` when started with local URL envs aligned to port 3110.

PowerShell setup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:55410/xflow_nav_qa"
node scripts/assert-local-db.mjs DATABASE_URL

$env:AUTH_SECRET = "replace-with-local-only-32-plus-character-secret"
$env:AUTH_URL = "http://127.0.0.1:3110"
$env:NEXTAUTH_URL = "http://127.0.0.1:3110"
$env:APP_BASE_URL = "http://127.0.0.1:3110"
$env:XFLOW_PUBLIC_URL = "http://127.0.0.1:3110"
$env:NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3110"
$env:NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3110"

$env:QA_TEST_EMAIL = "qa-xflow@example.local"
$env:QA_TEST_PASSWORD = "replace-with-local-only-password"

npm --prefix apps/XFlow run db:migrate
npm --prefix apps/XFlow run seed:qa
npm --prefix apps/XFlow run dev -- -H 127.0.0.1 -p 3110
```

Browser QA routes:

- `/overview`
- `/dashboard`
- `/tools`
- `/tools/apps`
- `/settings`
- mobile `/dashboard`

Known blockers:

- `seed:qa` also upserts central auth user/profile data; local-safe Supabase service-role env may be required by that path.
- The current workspace `.env.local` points at a hosted Supabase pooler, so it must not be used for this QA run.

## RatAiFy

Status: local harness is mostly ready after the smoke-starter guard. Provide a local/test database and let `dev:smoke` seed `demo_explorer`.

- Database type: PostgreSQL.
- SQLite/in-memory: not supported for authenticated trust-shell QA.
- Docker Compose: none found for RatAiFy navigation QA. Existing `db:test:start` is scoped to migration verification, not full app smoke auth.
- Migration command: `npm --prefix apps/RatAiFy run db:migrate`.
- Seed command: automatic at `dev:smoke` startup when `SEED_DEMO_DATA=true`, `DEMO_MODE=true`, or the smoke starter detects a local/test DB URL.
- Auth/session fixture: `/login?demo=1` calls `/api/auth/demo` for `demo_explorer`.
- Expected local URL: `http://127.0.0.1:5000`.

PowerShell setup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:55411/rataify_nav_qa"
node scripts/assert-local-db.mjs DATABASE_URL

$env:SESSION_SECRET = "replace-with-local-only-32-plus-character-secret"
$env:SEED_DEMO_DATA = "true"

npm --prefix apps/RatAiFy run db:migrate
npm --prefix apps/RatAiFy run dev:smoke
```

Authenticated smoke command:

```powershell
npm --prefix apps/RatAiFy run test:smoke:auth
```

Browser QA routes:

- `/login?demo=1`
- `/dashboard`
- `/sites`
- `/rataiffyscan`
- `/settings`
- `/superadmin` when a suitable role fixture exists
- mobile `/login?demo=1`

Known blockers:

- `DEMO_MODE` and `SEED_DEMO_DATA` must never be used against hosted DBs.
- Remote demo seeding remains opt-in only through `RATAIFY_ALLOW_REMOTE_SMOKE_SEED=1`; do not use that override for navigation QA.

## Crevux

Status: partial. API, Vite proxy, auth routes, and smoke-user scripts exist; a local/disposable DB and explicit smoke credentials are still required.

- Database type: PostgreSQL.
- SQLite/in-memory: not supported. Crevux docs explicitly require PostgreSQL.
- Docker Compose: none found for full Crevux navigation QA. API test helpers can start narrow Postgres containers for storyboard/pro-settings tests only.
- Migration commands from `apps/CreVux`: `pnpm run db:push` for a fresh standalone DB, then `pnpm run db:migrate`.
- Seed command: `pnpm -C apps/CreVux/artifacts/api-server exec tsx scripts/create-smoke-users.ts`.
- Auth/session fixture: API-backed `/api/auth/login` and `/api/auth/me` using the smoke user credentials.
- Expected local URLs: API `http://127.0.0.1:8787`; web `http://127.0.0.1:5176`.

PowerShell setup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:55412/crevux_nav_qa"
$env:DIRECT_DATABASE_URL = $env:DATABASE_URL
node scripts/assert-local-db.mjs DATABASE_URL

$env:DATABASE_URL_ALLOW_NON_SUPABASE_HOST = "true"
$env:CREVUX_ALLOW_DB_PUSH = "true"
$env:AUTH_JWT_SECRET = "replace-with-local-only-32-plus-character-secret"
$env:PORT = "8787"
$env:AI_INTEGRATIONS_OPENAI_BASE_URL = "https://api.openai.com/v1"
$env:AI_INTEGRATIONS_OPENAI_API_KEY = "replace-with-local-dev-key-or-local-provider"

$env:SMOKE_NORMAL_EMAIL = "qa-crevux-user@example.local"
$env:SMOKE_NORMAL_PASSWORD = "replace-with-local-only-password"
$env:SMOKE_ADMIN_EMAIL = "qa-crevux-admin@example.local"
$env:SMOKE_ADMIN_PASSWORD = "replace-with-local-only-password"

pnpm -C apps/CreVux run db:push
pnpm -C apps/CreVux run db:migrate
pnpm -C apps/CreVux/artifacts/api-server exec tsx scripts/create-smoke-users.ts
pnpm -C apps/CreVux/artifacts/api-server run dev
```

In a second shell:

```powershell
$env:VITE_DEV_API_ORIGIN = "http://127.0.0.1:8787"
pnpm -C apps/CreVux/artifacts/image-gen exec vite --config vite.config.ts --host 127.0.0.1 --port 5176 --strictPort
```

Browser QA routes:

- `/app`
- `/app/create?view=projects`
- `/app/create?view=gallery`
- `/app/create?view=assets`
- `/app/exports`
- `/app/create?view=history`
- `/app/popout` should remain outside the product shell

Known blockers:

- Do not fabricate smoke credentials; supply local-only values in the shell.
- Provider keys may be required for routes that initialize generation features. Keep those local/test-only.
- Do not add a fake session or production auth bypass.

## Verixet

Status: local disposable browser QA harness is ready for the migrated desktop shared-nav surface. Dashboard API-key login and e2e bootstrap run against a local PostgreSQL database when `VERIXET_LOCAL_NAV_QA_DATABASE=1` is set outside production.

- Database type: PostgreSQL.
- SQLite/in-memory: not supported for authenticated dashboard QA.
- Docker Compose: none found for Verixet navigation QA.
- Migration command: `npm --prefix apps/Verixet run db:migrate`.
- Seed/bootstrap command: `npm --prefix apps/Verixet run bootstrap:e2e-env`.
- Auth/session fixture: `POST /api/dashboard/login` with generated `E2E_API_KEY`; Playwright helper is `apps/Verixet/e2e/dashboard-auth-helpers.ts`.
- Expected local URL: `http://127.0.0.1:3102`.

PowerShell setup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:55413/verixet_nav_qa"
$env:DIRECT_DATABASE_URL = $env:DATABASE_URL
node scripts/assert-local-db.mjs --url $env:DATABASE_URL
node scripts/assert-local-db.mjs --url $env:DIRECT_DATABASE_URL

$env:VERIXET_LOCAL_NAV_QA_DATABASE = "1"
$env:DASHBOARD_SESSION_SECRET = "replace-with-local-only-32-plus-character-secret"
$env:E2E_BOOTSTRAP = "1"
$env:VERIXET_LOCAL_DASHBOARD_LOGIN_ENABLED = "true"
$env:VERIXET_E2E_INSECURE_COOKIE = "1"
$env:VERIXET_SKIP_RUNTIME_ENV_VALIDATE = "1"
$env:NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3102"
$env:APP_BASE_URL = "http://127.0.0.1:3102"
$env:E2E_BASE_URL = "http://127.0.0.1:3102"

npm --prefix apps/Verixet run db:migrate
npm --prefix apps/Verixet run bootstrap:e2e-env
# Export generated E2E_API_KEY, E2E_ADMIN_API_KEY, and E2E_PLATFORM_SUPER_ADMIN_API_KEY in the shell only.
npm --prefix apps/Verixet run dev
```

Optional browser QA helper after the local app is running:

```powershell
$env:VERIXET_NAV_QA_OUTPUT_DIR = "K:\XFlow-Ecosystem Workspace\output\playwright\verixet-local-disposable-qa"
node apps/Verixet/scripts/local-nav-browser-qa.mjs
```

Browser QA routes:

- `/dashboard`
- `/dashboard/transactions`
- `/dashboard/reports`
- `/dashboard/settings` remains local; current route response can be 404 because this is not a shared-nav route.
- mobile `/dashboard` for auth-boundary observation only; Verixet mobile drawer remains deferred

Local-only guard notes:

- `VERIXET_LOCAL_NAV_QA_DATABASE=1` is required for loopback/database-service hosts.
- The flag is refused when `NODE_ENV=production`.
- Supabase-hosted URLs remain the default accepted production-style path.
- Hosted non-Supabase URLs remain rejected even when the local QA flag is set.
- Do not commit generated API keys from `bootstrap:e2e-env`.

## Cleanup

Stop app processes, then remove disposable containers:

```powershell
docker rm -f xflow-nav-qa-db
docker rm -f rataify-nav-qa-db
docker rm -f crevux-nav-qa-db
docker rm -f verixet-nav-qa-db
```

Clear shell-only variables by closing the terminal or removing the specific variables:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:DIRECT_DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:E2E_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:E2E_ADMIN_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:E2E_PLATFORM_SUPER_ADMIN_API_KEY -ErrorAction SilentlyContinue
```

## Acceptance Gate

Authenticated browser QA can be rerun when:

- XFlow has a local/disposable Postgres DB, migrations applied, and `seed:qa` completed.
- RatAiFy has a local/test Postgres DB and `/login?demo=1` reaches `/dashboard`.
- Crevux has local API/web processes running, smoke users created, and API login succeeds.
- Verixet has either a local-compatible migration path or an already-prepared disposable DB plus generated e2e API keys.

## Proven Local Disposable Evidence

As of 2026-06-21, local disposable browser QA evidence exists for the four authenticated shared navigation harnesses:

| App | Evidence |
| --- | --- |
| RatAiFy | `output/playwright/rataify-local-disposable-qa/browser-qa-results.json` and screenshots in the same folder |
| XFlow | `output/playwright/xflow-local-disposable-qa/browser-qa-results.json` and screenshots in the same folder |
| Crevux | `output/playwright/crevux-local-disposable-qa/browser-qa-results.json` and screenshots in the same folder |
| Verixet | `output/playwright/verixet-local-disposable-qa/browser-qa-results.json`, screenshots, and local DB logs in the same folder |

These folders are evidence artifacts, not fixtures to edit during future runs. Keep future reruns local/disposable and continue refusing hosted database URLs unless a separate non-local environment is explicitly intended.
