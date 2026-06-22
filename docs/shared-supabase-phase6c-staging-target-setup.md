# Shared Supabase Phase 6C Staging Target Setup

Phase 6C defines the staging target and environment setup required before Phase 6B browser/API proofs can be rerun reliably. This is documentation and validation only. It does not deploy, does not change production env vars, does not switch `READ_MODE=shared`, does not remove legacy DB paths, and does not authorize old Supabase project pause.

Production cutover remains unsafe until Phase 6B browser/API proofs pass for all apps, shared rows are verified, rollback flag-off testing passes, reconciliation is clean, and the observation window is complete.

Old Supabase projects remain unsafe to pause until production runtime migration, backup/export, no-write observation, rollback retirement, and pause-readiness gates are complete.

## Shared Runtime Flag Rules

Use these values only in staging-like environments:

```env
APP_SHARED_SUPABASE_RUNTIME_ENABLED=true
APP_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
APP_SHARED_SUPABASE_READ_MODE=dual_compare
APP_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not use:

```env
APP_SHARED_SUPABASE_READ_MODE=shared
APP_SHARED_SUPABASE_FAIL_CLOSED=true
```

Replace `APP` with `VERIXET`, `XFLOW`, `AUDAIX`, `RATAIFY`, `WORDGENI`, or `CREVUX`.

## Staging Target Matrix

| App | Base URL Variables | Test Auth Requirements | Runtime Flags | Proof Command | Expected Shared Schemas/Tables |
| --- | --- | --- | --- | --- | --- |
| Verixet | `VERIXET_SMOKE_BASE_URL=https://verixet-staging.example.com` | Staging test account/session path. Use `E2E_API_KEY` or `VERIXET_STAGING_SEEDED_AUTH=1` only if the Verixet staging smoke requires it. | `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare`, `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/Verixet && npm run verify:post-deploy-smoke` plus app-specific billing/entitlement API flow proof | `core.entitlements`, `core.usage_events`, `core.audit_logs`, `core.billing_events`, `verixet.entitlement_decisions`, `verixet.usage_admission_logs`, `verixet.billing_accounts`, `verixet.checkout_sessions`, `verixet.credit_ledger` |
| XFlow | `XFLOW_RELEASE_SMOKE_BASE_URL=https://xflow-staging.example.com` | Staging session cookie if authenticated dashboard proof is required: `XFLOW_RELEASE_SMOKE_SESSION_COOKIE` or `PRODUCTION_SMOKE_SESSION_COOKIE` from a staging-only test session. | `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare`, `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/XFlow && npm run ops:release-smoke` plus app-connection/control-plane API flow proof | `core.app_connections`, `core.workspace_app_access`, `core.audit_logs`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, `xflow.workflow_runs` |
| AudAiX | `AUDAIX_PUBLIC_URL=https://audaix-staging.example.com`, `AUDAIX_API_URL=https://audaix-staging.example.com` or existing equivalent `AUDAIX_PRODUCTION_BASE_URL` for staging | `TEST_USER_EMAIL` or `AUDAIX_TEST_EMAIL`, `TEST_USER_PASSWORD` or `AUDAIX_TEST_PASSWORD`, optional `TEST_ACCESS_TOKEN`, and `TEST_WORKSPACE_ID` or `ALLOW_CREATE_TEST_WORKSPACE=true` with `CONFIRM_TEST_WORKSPACE_MUTATION=true` for a dedicated staging test workspace. | `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare`, `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/AudAix && npm run verify:production` | `core.usage_events`, `core.audit_logs`, `audaix.audits`, `audaix.audit_reports`, `audaix.monitors`, `audaix.audit_findings`, `audaix.scan_jobs` |
| Rataify | `RELEASE_VERIFY_BASE_URL=https://rataify-staging.example.com` or existing equivalent `APP_BASE_URL`/`NEXT_PUBLIC_APP_URL` | Staging test account/session requirements depend on the manual dashboard/API flow. Use only staging test credentials and dedicated test workspace/site data. | `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare`, `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/RatAiFy && npm run verify:readiness` plus authenticated dashboard/site/review/risk/evidence flow proof | `core.usage_events`, `core.audit_logs`, `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.risk_events`, `rataify.evidence_items` |
| WordGeni | `WEB_URL=https://wordgeni-web-staging.example.com`, `API_URL=https://wordgeni-api-staging.example.com` | Staging test account/session requirements for editor/API proof. Worker proof needs `WORKER_LOG_FILE` or `WORKER_LOG_TEXT` from staging logs. | `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare`, `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/WordGeni && pnpm live:verify` plus document/source/session/provenance flow proof | `core.usage_events`, `core.audit_logs`, `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.memory_cards`, `wordgeni.writing_sessions`, `wordgeni.provenance_items` |
| Crevux | `CREVUX_AUTH_SMOKE_WEB_URL=https://crevux-web-staging.example.com`, `CREVUX_AUTH_SMOKE_API_URL=https://crevux-api-staging.example.com/api`, image-gen target via web/studio URL if separate | `CREVUX_AUTH_SMOKE_ALLOW_REMOTE=1` for non-local staging targets. Use staging-only `SMOKE_NORMAL_EMAIL`, `SMOKE_NORMAL_PASSWORD`, `SMOKE_ADMIN_EMAIL`, and `SMOKE_ADMIN_PASSWORD` if defaults are not valid. Do not use production provider keys. | `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare`, `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false` | `cd apps/CreVux && pnpm smoke:authenticated-beta` plus safe/mock project/asset/job/provider/export flow proof | `core.usage_events`, `core.audit_logs`, `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, `crevux.credit_spend_events` |

## WordGeni Path-With-Spaces Fix

The WordGeni `live:verify` script previously failed in this workspace because it derived the script root from `new URL(...).pathname`, leaving spaces encoded as `%20` on Windows paths. The script now uses `fileURLToPath` and `path` utilities so workspace paths containing spaces resolve correctly.

Regression test:

```bash
cd apps/WordGeni
node --test scripts/live-verify-wordgeni.test.mjs
```

## Remaining Manual Values

Provide these staging-only values before rerunning Phase 6B:

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
WORKER_LOG_FILE=
WORKER_LOG_TEXT=
CREVUX_AUTH_SMOKE_WEB_URL=
CREVUX_AUTH_SMOKE_API_URL=
CREVUX_AUTH_SMOKE_ALLOW_REMOTE=1
```

Use staging/test credentials only. Do not print secrets. Do not commit local env files.

## Rerun Order

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

After each app passes, update `docs/shared-supabase-phase6b-browser-flow-results.md`, then run:

```bash
node scripts/validate-supabase-phase6b-browser-flows.mjs
```

Target Phase 6B final result: `passed=6, failed=0, pending=0`.
