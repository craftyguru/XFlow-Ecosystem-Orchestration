# Shared Supabase Phase 6D Proof Runbook

Phase 6D prepares local or staging targets so Phase 6B browser/API proof can be rerun consistently. It does not deploy to production, does not change production env vars, does not switch `READ_MODE=shared`, does not remove legacy DB paths, and does not authorize old Supabase project pause.

Production cutover remains unsafe. Old Supabase projects remain unsafe to pause.

## Local Input File

Use an ignored local file for Phase 6D inputs:

```text
.env.phase6d.local
```

This file is covered by `.env.*.local` in `.gitignore`. Do not commit it. Do not paste real secrets into docs or committed examples.

Start from the committed-safe template:

```bash
copy .env.phase6d.local.example .env.phase6d.local
```

PowerShell:

```powershell
Copy-Item .env.phase6d.local.example .env.phase6d.local
```

The validator loads `.env.phase6d.local` if present, then reports only whether values are present or missing. It never prints secret values.

## Required Target Values

```env
VERIXET_SMOKE_BASE_URL=
XFLOW_RELEASE_SMOKE_BASE_URL=
AUDAIX_PUBLIC_URL=
AUDAIX_API_URL=
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
RELEASE_VERIFY_BASE_URL=
WEB_URL=
API_URL=
CREVUX_AUTH_SMOKE_WEB_URL=
CREVUX_AUTH_SMOKE_API_URL=
PORT=
```

## Staging Runtime Flags

Keep runtime flags in dual-write/compare mode:

```env
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false

XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false

AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true
AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare
AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false

RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true
RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare
RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false

WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true
WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare
WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false

CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not use:

```env
*_SHARED_SUPABASE_READ_MODE=shared
*_SHARED_SUPABASE_FAIL_CLOSED=true
```

## Central Auth Requirement

XFlow is the social OAuth authority for Phase 6B/6D. Satellite apps should start with `AUTH_PROVIDER=xflow` or `ECOSYSTEM_AUTH_PROVIDER=xflow`, plus the XFlow ecosystem auth URLs and `ECOSYSTEM_AUTH_STATE_SECRET`. Do not provide app-local GitHub, Google, or Facebook OAuth credentials to satellite apps unless intentionally testing `AUTH_PROVIDER=legacy-local`.

RatAiFy, Verixet, AudAiX, WordGeni, and Crevux should route social login/signup through XFlow. RatAiFy legacy social endpoints such as `/api/auth/github` redirect to XFlow in `xflow` mode so missing `GITHUB_CLIENT_ID` cannot crash startup.

## Local Startup Command Matrix

| App | App folder | Start command | Expected local URL | Required env variable | Confirm running | Browser/API proof command |
| --- | --- | --- | --- | --- | --- | --- |
| Verixet | `apps/Verixet` | `npm run dev` | `http://localhost:3102`; package script runs `next dev -p 3102`. | `VERIXET_SMOKE_BASE_URL` | Open `${VERIXET_SMOKE_BASE_URL}/api/v1/health` or run the proof command. First local run may need a larger `VERIXET_SMOKE_TIMEOUT_MS` while Next.js compiles routes. | `npm run verify:post-deploy-smoke` |
| XFlow | `apps/XFlow` | `npm run dev` | `http://localhost:3101`; package script runs `next dev -p 3101`. | `XFLOW_RELEASE_SMOKE_BASE_URL` | Open `${XFLOW_RELEASE_SMOKE_BASE_URL}/api/health` and `${XFLOW_RELEASE_SMOKE_BASE_URL}/api/ready`. The release smoke can use `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` to attempt a staging test login when no smoke session cookie is supplied. | `npm run ops:release-smoke` |
| AudAiX | `apps/AudAix` | `npm run dev` | `http://127.0.0.1:8787`; `src/server.ts` defaults `PORT` to `8787`. Set `AUDAIX_AUTH_REQUIRED=true` for authenticated proof. | `AUDAIX_PUBLIC_URL`, `AUDAIX_API_URL` | Open `${AUDAIX_API_URL}/health` and `${AUDAIX_PUBLIC_URL}/dashboard`. Do not run Crevux API on `8787` at the same time. | `npm run verify:production` |
| Rataify | `apps/RatAiFy` | `npm run dev` | `http://127.0.0.1:5000`; `server/index.ts` defaults `PORT` to `5000`. | `RELEASE_VERIFY_BASE_URL` | Open `${RELEASE_VERIFY_BASE_URL}/health` and `${RELEASE_VERIFY_BASE_URL}/api/health`. | `npm run verify:readiness` |
| WordGeni | `apps/WordGeni` | `pnpm --dir apps/web dev` and `PORT=3002 pnpm --dir apps/api dev`; `pnpm dev:full` may also work if Turbo starts both targets. | Web `http://localhost:3103`, API `http://localhost:3002`; `scripts/print-dev-hints.mjs` prints the current values. | `WEB_URL`, `API_URL` | Open `${WEB_URL}/`, `${API_URL}/health`, `${API_URL}/health/ready`; provide `WORKER_LOG_FILE` or `WORKER_LOG_TEXT` for worker proof. | `pnpm live:verify` |
| Crevux | `apps/CreVux` | `pnpm dev:full` | Web `http://127.0.0.1:3105`; API target defaults to `http://127.0.0.1:8787`; `scripts/run-image-gen-dev.mjs` prints the real web URL and API proxy. | `CREVUX_AUTH_SMOKE_WEB_URL`, `CREVUX_AUTH_SMOKE_API_URL`, `PORT` when the API URL does not include a port | Open `${CREVUX_AUTH_SMOKE_WEB_URL}/` and `${CREVUX_AUTH_SMOKE_API_URL}/api/healthz` when the API URL is an origin. | `pnpm smoke:authenticated-beta` |

If a command fails because required app-specific credentials are absent, keep the Phase 6B tracker pending and record the exact blocker.

Additional proof notes:

- Verixet public smoke is not the full Phase 6B proof. Full authenticated billing proof should use `ACCESS_BILLING_CONTROL_BASE_URL=http://localhost:3102 npx tsx scripts/access-billing-control-http-validate.ts` after the Verixet legacy app DB is migrated far enough for dashboard/API request logging. If `/api/v1/health` returns 500, inspect the dev log for stale `.next` artifacts or missing `requests_log` columns before running the authenticated proof.
- XFlow's Phase 6D shared Supabase Auth seed does not create an XFlow dashboard credential. `npm run ops:release-smoke` authenticates through XFlow's legacy local `users` table. For local/staging proof, create or update the matching local XFlow credentials user with `PHASE6B_SEED_XFLOW_LOCAL_TEST_USER=true PHASE6B_CONFIRM_XFLOW_LOCAL_DB=true npx tsx scripts/seed-phase6b-local-test-user.ts` from `apps/XFlow` after confirming the app-local `DATABASE_URL` points to the local/staging proof database. The helper reads `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`, does not print the password, creates a verified local user, and links it to a UUID Phase 6B workspace as a viewer so MFA is not required. Alternatively, provide a staging-only `XFLOW_RELEASE_SMOKE_SESSION_COOKIE`; do not fake cookies in committed code.
- AudAiX `npm run verify:production` prints safe auth diagnostics: selected Supabase URL env name/source, project ref, and anon-key env source only. If it reports `invalid_credentials`, reset or recreate `TEST_USER_EMAIL` in that same shared Supabase Auth project and confirm the email if the project requires confirmation.
- AudAiX production MFA must remain enabled. If the server is started with `AUDAIX_REQUIRE_AAL2=true`, the password-grant Supabase token is AAL1 and `/v1/auth/session/exchange` returns `mfa_required` before a server session exists. `TEST_BACKUP_CODE` is supported only after an initial server session exists, so it cannot satisfy that initial exchange gate. For Phase 6B local/staging browser/API migration proof only, use a dedicated no-MFA test user and start the local proof process with `AUDAIX_REQUIRE_AAL2=false`; do not commit that setting or use it for production. Then provide `TEST_BACKUP_CODE` through the local process environment so the verifier can consume the backup-code endpoint and step the server session up to `aal2` before protected writes. For real MFA proof, provide an AAL2 Supabase access token through `TEST_ACCESS_TOKEN` without printing it.
- AudAiX can verify asymmetric Supabase JWTs through the remote JWKS URL. If the local server process cannot fetch JWKS during a proof run, set `AUDAIX_SUPABASE_JWKS_JSON` to the public JWKS JSON fetched from the same shared Supabase project. This is public key material, not a secret, but it should still stay in ignored local env/process state for proof runs.
- AudAiX audit creation is gated by Verixet usage admission. Use the Phase 6D shared core workspace UUID as `TEST_WORKSPACE_ID`; the human-readable legacy proof id is rejected by Verixet because `/api/ecosystem/usage/ingest` requires a UUID workspace id. Seed AudAiX local SQLite membership, proof credit balances, and legal consent with `PHASE6B_SEED_AUDAIX_LOCAL_WORKSPACE=true node scripts/seed-phase6b-audaix-local-workspace.mjs`. The seed reads AudAiX local legal-version env names so the proof user satisfies the same local consent guard as the server.
- Verixet must point at a migrated local/staging Verixet database before it can admit AudAiX usage. The AudAiX/Verixet seed helper is `PHASE6B_SEED_AUDAIX_VERIXET_ACCESS=true node scripts/seed-phase6b-audaix-verixet-access.mjs`; it refuses incompatible databases and checks for `workspaces`, `billing_accounts`, `subscriptions`, `credit_balances`, and `credit_transactions`. If the local Verixet proof DB is an older minimal database, repair only that local/staging database with `PHASE6B_REPAIR_VERIXET_LOCAL_AUTHORITY_DB=true node scripts/repair-phase6b-verixet-local-authority-db.mjs`, then rerun the seed. When starting local Verixet for this proof, preserve the app-local legacy `DATABASE_URL` but use the root `.env.shared.local` Supabase API variables for shared mirror writes; do not print or commit either value.
- Rataify requires both XFlow ecosystem auth URL variables and its legacy app DB schema for Phase 6B. If `npm run dev` does not reach `server listening`, check for missing `XFLOW_ECOSYSTEM_AUTH_URL`, `XFLOW_ECOSYSTEM_TOKEN_URL`, `XFLOW_ECOSYSTEM_USERINFO_URL`, `XFLOW_ECOSYSTEM_REDIRECT_URI`, and legacy tables such as `xflow_control_plane_credentials` before rerunning `npm run verify:readiness`.
- WordGeni worker proof must come from a real worker boot log. Set `WORKER_LOG_FILE` to a local captured worker log file or `WORKER_LOG_TEXT` to copied staging/Railway worker log text containing `Ready`, `polling Temporal`, and `ingestion-tasks`. Do not use placeholder text as proof.

## Port Notes

- Verixet uses `3102`, XFlow uses `3101`, and WordGeni web uses `3103` for Phase 6D local proof.
- AudAiX and Crevux API both commonly use `8787`; do not run them simultaneously on the same port.
- Crevux authenticated smoke defaults to `http://localhost:3005/api` unless `CREVUX_AUTH_SMOKE_API_URL` is set. For Phase 6D, set it explicitly.
- Crevux authenticated smoke accepts either an API origin such as `http://127.0.0.1:8787` or an API route base such as `http://127.0.0.1:8787/api`; it normalizes origins to `/api` before calling JSON API routes.
- Crevux smoke-user setup requires a `PORT` value because the nested API server validates it during startup. The authenticated smoke resolves it in this order: `PORT`, the port parsed from `CREVUX_AUTH_SMOKE_API_URL`, then local-only default `3005`. For production or remote staging targets without a URL port, set `PORT` explicitly; the local fallback is not used for production proof.
- Rataify Playwright configs mention `5000` and `5177`; the full Express/Vite dev server defaults to `5000`, while responsive Vite-only tests use `5177`.

## Test User Creation

Use one dedicated staging test identity. Do not create real customer credentials.

Recommended setup:

1. Create `TEST_USER_EMAIL` in the new shared Supabase Auth dashboard or through each app's staging signup flow.
2. Set a non-production `TEST_USER_PASSWORD` only in `.env.phase6d.local`.
3. Create or select a dedicated staging workspace for this identity.
4. Ensure `core.workspace_members` includes the test user/workspace membership.
5. Ensure `core.workspace_app_access` grants access to the app being tested.
6. Seed or verify app-specific prerequisites:
   - Verixet: entitlement/plan/usage feature keys and safe Stripe test-mode configuration.
   - XFlow: app registry and connection test target.
   - AudAiX: workspace/site permissions, report bucket access via `audaix-reports`.
   - Rataify: workspace/site permissions, evidence bucket access via `rataify-evidence`.
   - WordGeni: workspace/document permissions, export bucket access via `wordgeni-exports`.
   - Crevux: workspace/project permissions, `crevux-assets` bucket access, safe/mock provider mode.

## Seed Phase 6D Workspace/App Access

After the test user exists in shared Supabase Auth, run the local-only seed/check helper from the repo root:

```bash
node scripts/seed-phase6d-test-access.mjs
```

The script loads:

1. `.env.shared.local`
2. `.env.phase6d.local`

Required values:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TEST_USER_EMAIL=
```

`TEST_USER_PASSWORD` may be present for browser/API proof commands, but the seed helper does not need it and never prints it.

The script uses the Supabase service-role key server-side only. It finds the existing Supabase Auth user by `TEST_USER_EMAIL`. If the user does not exist, the script fails and tells you to create the user in the shared Supabase Auth dashboard or through a staging app signup flow.

Rows created/upserted:

| Table | Behavior | Phase 6D marker |
| --- | --- | --- |
| `core.profiles` | Upserts profile for the Auth user. | No metadata column exists; marked by deterministic test user linkage and `display_name='Phase 6D Test User'`. |
| `core.workspaces` | Upserts workspace slug `phase6d-shared-supabase-browser-proof`. | `metadata.source='phase6d_test'`. |
| `core.workspace_members` | Upserts test user as `owner` and `active`. | No metadata column exists; marked by deterministic workspace/user linkage. |
| `core.workspace_app_access` | Upserts active access for `verixet`, `xflow`, `audaix`, `rataify`, `wordgeni`, and `crevux`. | `metadata.source='phase6d_test'`. |

Cleanup command:

```bash
PHASE6D_CLEANUP_TEST_ACCESS=true node scripts/seed-phase6d-test-access.mjs
```

PowerShell:

```powershell
$env:PHASE6D_CLEANUP_TEST_ACCESS='true'
node scripts/seed-phase6d-test-access.mjs
```

Cleanup removes the Phase 6D workspace, workspace membership, and app access rows. It preserves the profile row to avoid deleting shared user identity.

## Execution Order

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

For each app:

1. Confirm the target URL is present with `node scripts/validate-supabase-phase6d-local-inputs.mjs`.
2. Start the app locally or point the URL variable at a staging deployment.
3. Run the app proof command.
4. Verify shared rows in the expected `core.*` and app schema tables from Phase 6C.
5. Turn runtime flags off and verify rollback behavior.
6. Update `docs/shared-supabase-phase6b-browser-flow-results.md`.
7. Run `node scripts/validate-supabase-phase6b-browser-flows.mjs`.

## Strict Input Mode

By default, the Phase 6D validator passes with warnings when values are missing:

```bash
node scripts/validate-supabase-phase6d-local-inputs.mjs
```

To require all inputs before running browser/API proof:

```bash
PHASE6D_REQUIRE_INPUTS=true node scripts/validate-supabase-phase6d-local-inputs.mjs
```

PowerShell:

```powershell
$env:PHASE6D_REQUIRE_INPUTS='true'
node scripts/validate-supabase-phase6d-local-inputs.mjs
```

## Final Guardrail

Phase 6B can only be rerun when the relevant target values for that app are present and valid. Passing Phase 6D input validation does not make production cutover safe.
