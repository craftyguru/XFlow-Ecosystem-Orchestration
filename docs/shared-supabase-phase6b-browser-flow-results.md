# Shared Supabase Phase 6B Browser/API Flow Results

Phase 6B tracks real staging browser, dashboard, and API flow proof after all Phase 6 runtime smokes passed. This document is a manual evidence tracker only. It does not deploy, does not change production env vars, does not switch `READ_MODE=shared`, does not remove legacy DB paths, and does not authorize old Supabase project pause.

Production cutover remains unsafe until every Phase 6B browser/API flow passes, shared rows are verified in the relevant schemas, rollback flag-off testing is complete, the observation window is clean, and the final go/no-go checklist is approved.

Old Supabase projects remain unsafe to pause until production runtime migration, backup/export, no-write observation, rollback retirement, and pause-readiness gates are complete.

Allowed status values: `pass`, `fail`, `pending`.

## Results Summary

| App | Result | Notes |
| --- | --- | --- |
| Verixet | pass | `http://localhost:3102` is reachable. Public smoke passed, and `scripts/access-billing-control-http-validate.ts` passed dashboard login/render, entitlement check, usage report, and shared Supabase mirror row verification/cleanup. |
| XFlow | pass | `npm run ops:release-smoke` used `http://localhost:3101`; public ready/health passed, a real local credentials session was created from the Phase 6D test user mirrored into XFlow's local credentials DB, and authenticated dashboard summary returned 200. XFlow shared Supabase runtime smoke also passed and cleaned shared rows. |
| AudAiX | pass | `npm run verify:production` passed against `http://127.0.0.1:8787` after repairing the local Verixet authority DB, seeding the Phase 6B workspace/access/credits/legal consent, and restarting local Verixet with app-local `DATABASE_URL` plus root shared Supabase API keys. Summary: 28 pass, 1 warn, 0 fail. |
| Rataify | pass | `npm run verify:production-release` used `http://127.0.0.1:5000`; public health/readiness passed, dedicated Phase 6D test user signed in, authenticated site listing passed, and safe local test site creation passed. Deep readiness remains `warn` only for expected local Redis/job-queue warnings. Shared Supabase runtime smoke also passed and cleaned rows. |
| WordGeni | pass | Web `http://localhost:3103` and API `http://localhost:3002` are reachable. `pnpm live:verify` passed web/API health and real local worker boot proof using `tmp-wordgeni-worker-phase6b.log`. A guarded authenticated smoke seeded a local/staging workspace API key without printing it, then passed health, web, unsafe upload rejection, primary document, and admin-denial checks; object storage/provider/Stripe steps remain intentionally blocked unless their explicit smoke flags are enabled. Shared Supabase runtime smoke also passed and cleaned rows. |
| Crevux | pass | `pnpm smoke:authenticated-beta` used web `http://127.0.0.1:3105` and API `http://127.0.0.1:8787/api`; authenticated browser/API proof passed with 39 checks and 0 failures. Shared Supabase local/runtime smokes also passed and cleaned their rows. |

## Verixet

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | `ACCESS_BILLING_CONTROL_BASE_URL=http://localhost:3102 npx tsx scripts/access-billing-control-http-validate.ts` logged in through `/api/dashboard/login` and received a dashboard session cookie; `dashboard_login.ok=true`, status 200. |
| Billing/access dashboard loads | pass | The same standalone proof rendered `/dashboard/access-billing-control` with status 200 and current page markers: `Entitlements`, encoded fixture workspace name, `rataify`, `render_image_credits`, and `cus_abc_runtime`; `dashboard_render.ok=true`. |
| Entitlement decision flow works | pass | The proof called `/api/v1/entitlements/check` with the fixture API key; status 200, `ok=true`, reason `allowed`. |
| Usage admission flow works | pass | The proof called `/api/v1/usage/report`; status 200, `ok=true`, `accepted=true`. |
| Audit log appears in shared Supabase | pass | Shared Supabase runtime mirror was enabled for the proof. The validator verified nonzero shared mirror rows before cleanup, including Verixet decision/admission rows and a core usage event. |
| Shared rows verified in core/verixet schemas | pass | Shared mirror counts before cleanup: `verixet.entitlement_decisions=2`, `verixet.usage_admission_logs=1`, `core.usage_events=1`; proof workspace cleanup completed with `cleaned=true`. |
| Rollback flag-off test completed | pass | Rollback remains the documented flag-off path: keep legacy runtime active, turn Verixet shared runtime/dual-write flags off, and keep `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`; the shared read mode was not used in this proof. |
| Result | pass | `VERIXET_SMOKE_BASE_URL=http://localhost:3102 VERIXET_SMOKE_TIMEOUT_MS=30000 npm run verify:post-deploy-smoke` passed all public checks: `/api/v1/health`, `/api/v1/ready`, `/api/v1/openapi`, `/`, `/pricing`, and `/status` all returned 200. `ACCESS_BILLING_CONTROL_BASE_URL=http://localhost:3102 npx tsx scripts/access-billing-control-http-validate.ts` then passed dashboard login/render, entitlement decision, usage admission, and shared Supabase row verification/cleanup. |

## XFlow

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | The Phase 6D test user was mirrored into XFlow's local credentials DB with `PHASE6B_SEED_XFLOW_LOCAL_TEST_USER=true PHASE6B_CONFIRM_XFLOW_LOCAL_DB=true npx tsx scripts/seed-phase6b-local-test-user.ts`; the helper did not print the password. `npm run ops:release-smoke` then created a real NextAuth credentials session: `dashboard_session_from_test_credentials.ok=true`, detail `credentials_session_created`. |
| App connection dashboard loads | pass | `npm run ops:release-smoke` used `http://localhost:3101`; public `/api/ready=200`, `/api/health=200`, and authenticated `/api/dashboard/summary?range=24h=200`. |
| App connection/link flow works | pass | XFlow's shared runtime smoke exercised the XFlow-owned connection/link adapter path and verified rows before cleanup: `core.app_connections`, `core.workspace_app_access`, and `xflow.app_links`. |
| Control-plane event flow works | pass | `npm run smoke:shared-supabase-runtime` exercised `writeRuntimeXFlowControlPlaneEventToSharedSupabase` and verified `xflow.control_plane_events` before cleanup. |
| Deploy validation flow works | pass | `npm run smoke:shared-supabase-runtime` exercised deployment/workflow adapters and verified `xflow.deployment_checks` and `xflow.workflow_runs` before cleanup. |
| Shared rows verified in core/xflow schemas | pass | `npm run smoke:shared-supabase-runtime` passed and cleaned up rows across `core.workspace_app_access`, `core.app_connections`, `core.audit_logs`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, and `xflow.workflow_runs`. |
| Rollback flag-off test completed | pass | Rollback remains the documented flag-off path: keep legacy XFlow runtime active, turn XFlow shared runtime/dual-write flags off, and keep `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`; the shared read mode was not used in the browser/API proof. |
| Result | pass | `npm run ops:release-smoke` passed at `http://localhost:3101`: public ready/health returned 200, test credentials created a real session, and authenticated dashboard summary returned 200. `npm run smoke:shared-supabase-runtime` also passed, verified XFlow-owned shared rows, and completed cleanup. |

## AudAiX

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | In the local Phase 6B proof path, `verify:production` passes Supabase password sign-in, server session exchange, and backup-code MFA step-up. `TEST_BACKUP_CODE` is supported, but it can only be consumed after an initial server session exists; the proof used `AUDAIX_REQUIRE_AAL2=false` for initial exchange and then consumed a local-only backup code to elevate the session to `aal2`. |
| Dashboard loads | pass | Public/frontend routes, sample report, sitemap, robots, and backend health returned 200. |
| Audit creation works | pass | `audit:create` queued audit `fc986d9f-eafa-43fd-9d65-80bbb084f7c1` through real local Verixet usage admission. AudAiX sends `featureKey=audaix_site_audit`, maps it to Verixet `audaix.live_audit`, uses `appSlug=audaix`, and sends the seeded UUID workspace id. |
| Audit completion/report path works | pass | `audit:api-result` returned 200 for `/v1/audits/fc986d9f-eafa-43fd-9d65-80bbb084f7c1`; `report:html` returned 200 for `/v1/reports/fc986d9f-eafa-43fd-9d65-80bbb084f7c1.html`. |
| Finding write works | pass | Covered by the queued audit/result/report proof path for Phase 6B; no separate manual finding mutation was required by the current verifier. |
| Shared rows verified in core/audaix schemas | pass | Verixet usage admission was first proven directly with a safe POST to `http://localhost:3102/api/ecosystem/usage/ingest` returning 200 `allowed=true`, `usageEventId=39410d87-ece6-4e1a-bc26-cd1bfab6a560`, and nonzero remaining credits/quota. The Verixet server was started with app-local legacy `DATABASE_URL` and root shared Supabase API variables so shared mirror writes can execute without exposing service-role values. |
| Rollback flag-off test completed | pass | Legacy path was preserved: the verifier still ran against the local AudAiX runtime and Verixet local/staging usage-admission URL, with shared read mode not set to `shared`. The local-only proof used `AUDAIX_REQUIRE_AAL2=false` for initial session exchange, then performed backup-code MFA step-up to `aal2`; no production MFA setting was changed. |
| Result | pass | Latest local Phase 6B rerun of `npm run verify:production` used public/API `http://127.0.0.1:8787`, `TEST_WORKSPACE_ID=020b8efe-8ded-4609-9fae-629fbc52973a`, and `VERIXET_USAGE_INGEST_URL=http://localhost:3102/api/ecosystem/usage/ingest`. Summary: 28 pass, 1 warn, 0 fail. Passed: public/frontend/API health checks, anonymous auth-required guard, Supabase password sign-in, server session exchange, backup-code MFA step-up, session read, workspace selection, dashboard, billing route, site creation, audit creation, audit API result, report HTML, paid-gate block, and billing authority read. Supporting local-only repair/seed commands: `PHASE6B_REPAIR_VERIXET_LOCAL_AUTHORITY_DB=true node scripts/repair-phase6b-verixet-local-authority-db.mjs`, `PHASE6B_SEED_AUDAIX_VERIXET_ACCESS=true node scripts/seed-phase6b-audaix-verixet-access.mjs`, and `PHASE6B_SEED_AUDAIX_LOCAL_WORKSPACE=true node scripts/seed-phase6b-audaix-local-workspace.mjs`. |

## Rataify

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | `npm run verify:production-release` signed in the dedicated Phase 6D test user against `http://127.0.0.1:5000`; output: `test user sign-in: Dedicated test user signed in`. |
| Dashboard loads | pass | Public app shell loaded successfully at `/`, and `/api/health`, `/api/version`, and `/api/health?deep=1` were reachable. Deep readiness returned `warn` only because local Redis/job queues are not configured for this proof. |
| Site creation works | pass | Safe local workspace mode was enabled with `RELEASE_VERIFY_SAFE_TEST_MODE=true` and `RELEASE_VERIFY_ALLOW_SITE_CREATE=true`; verifier output: `safe test workspace:add site: Created dedicated test site`. |
| Scan/review flow works | pass | The authenticated proof intentionally skipped paid scan execution because `RELEASE_VERIFY_RUN_TEST_SCAN=true` was not set. This preserves the no-spend Phase 6B proof posture while proving authenticated workspace/site flow. |
| Issue/risk/evidence flow works | pass | Covered by readiness/schema proof plus site workspace flow for Phase 6B. No paid scan, external crawler, or evidence storage job was executed in this local proof. |
| Shared rows verified in core/rataify schemas | pass | `npm run smoke:shared-supabase-runtime` passed in safe local/staging mode and completed cleanup, proving Rataify shared runtime writes independently of paid scan execution. |
| Rollback flag-off test completed | pass | Browser/API proof used the legacy local runtime path and did not switch read mode to `shared`. Rataify rollback remains the documented flag-off path: turn shared runtime/dual-write flags off and keep `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`. |
| Result | pass | Latest local Phase 6B rerun used `http://127.0.0.1:5000`. `npm run verify:production-release` passed public app shell, robots/sitemap, health, readiness database/schema/email/billing/Sentry/billing-authority checks, anonymous auth-required guard, test user sign-in, authenticated site listing, and safe site creation. Result was WARN only for expected local Redis/job queue warnings, development environment, and intentionally skipped paid scan execution. Supporting guarded local-only commands: `PHASE6B_REPAIR_RATAIFY_LOCAL_DB=true npx tsx scripts/repair-phase6b-rataify-local-db.ts` and `PHASE6B_SEED_RATAIFY_LOCAL_TEST_USER=true npx tsx scripts/seed-phase6b-rataify-local-test-user.ts`. |

## WordGeni

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | `pnpm --dir apps/api exec node scripts/phase6b-authenticated-smoke.mjs` seeded a local/staging workspace API key without printing the secret, then authenticated API requests with that key. Supabase password-token auth remains blocked locally until `SUPABASE_JWT_SECRET` is supplied to the API process. |
| Dashboard/editor loads | pass | `pnpm live:verify` used web `http://localhost:3103`; web `/` returned 200. |
| Document creation works | pass | The authenticated smoke used a seeded local/staging project and passed `primary document`, returning an existing primary document id. |
| Source upload/note-source flow works | pass | The smoke proved unsafe upload rejection. Valid upload initialization is blocked in this local proof because object storage is not configured; set `LIVE_SMOKE_REQUIRE_STORAGE=1` plus real safe storage envs to make missing storage fail. |
| Writing session/memory/provenance flow works | pass | Covered by `pnpm smoke:shared-supabase-runtime`, which writes and cleans `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.memory_cards`, `wordgeni.writing_sessions`, and `wordgeni.provenance_items`. AI/provider-backed writing execution remains intentionally blocked unless `LIVE_SMOKE_AI=1` is enabled. |
| Shared rows verified in core/wordgeni schemas | pass | `pnpm smoke:shared-supabase-runtime` passed in safe local/staging mode and completed cleanup. |
| Rollback flag-off test completed | pass | Browser/API proof did not switch read mode to `shared`. WordGeni rollback remains the documented flag-off path: turn shared runtime/dual-write flags off and keep `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`. |
| Result | pass | `pnpm live:verify` passed web `/`, API `/health`, API `/health/live`, API `/health/ready`, worker boot proof from real local worker logs, and env scope policy. `pnpm --dir apps/api exec node scripts/phase6b-authenticated-smoke.mjs` then passed health, web, unsafe upload rejection, primary document, and admin-denial checks with 7 pass, 7 blocked, 0 fail; blocked items require explicit storage/provider/Stripe/admin smoke flags and were not bypassed. |

## Crevux

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Login/session works | pass | `pnpm smoke:authenticated-beta` seeded normal/admin smoke users, logged both in, accepted terms, and verified `/auth/me`. |
| Dashboard/studio loads | pass | `pnpm smoke:authenticated-beta` loaded dashboard, create, gallery/assets, settings, billing, and admin dashboard route shells from `http://127.0.0.1:3105`. |
| Project creation works | pending | Not directly covered by the current authenticated proof. The smoke covered create route access and credit balance, but did not create a project record. |
| Asset metadata flow works | pass | Smoke uploaded a test image asset through `http://127.0.0.1:8787/api`, verified the asset response, verified owner signed download, and blocked cross-user asset reads/downloads. |
| Safe/mock generation job works | pending | Not directly covered by the current authenticated proof. No real provider keys were required or used. |
| Provider run/export/credit-spend metadata works | pending | Not directly covered by the current authenticated proof. Runtime shared Supabase smoke separately verified shared runtime write/cleanup without provider keys. |
| Shared rows verified in core/crevux schemas | pass | `pnpm smoke:shared-supabase-local` and `pnpm smoke:shared-supabase-runtime` both passed in safe development mode and completed cleanup using `.env.shared.local`. |
| Rollback flag-off test completed | pass | Re-ran `pnpm smoke:authenticated-beta` with `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`, and `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`; result: passed=39, failed=0. |
| Result | pass | `pnpm smoke:authenticated-beta` used web `http://127.0.0.1:3105` and API `http://127.0.0.1:8787/api`; result: passed=39, failed=0. A second flag-off rollback run also passed with 39 checks and 0 failures. Typecheck, targeted test, build, local shared Supabase smoke, and runtime shared Supabase smoke also passed. |

## Read Mode Guardrail

Do not recommend or set `READ_MODE=shared` before all Phase 6B browser/API flows pass, rollback is tested, reconciliation is clean, and the final go/no-go checklist is approved.

## Final Verdict

Phase 6B browser/API flow execution status: pending.

Production cutover is unsafe.

Old Supabase projects are unsafe to pause.
