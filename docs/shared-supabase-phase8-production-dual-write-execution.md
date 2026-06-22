# Shared Supabase Phase 8 Production Dual-Write Execution

This document is the controlled execution plan for the first production shared Supabase rollout.

Do not deploy from this document alone. Do not change production env vars until owner approval is captured. Do not switch `READ_MODE=shared`. Do not set `FAIL_CLOSED=true`. Do not pause old Supabase projects. Do not remove legacy DB paths.

## Current Gate

- Phase 7K status: `CONDITIONAL GO`
- Shared-read cutover: `NO-GO`
- Old Supabase pause: `NO-GO`
- Accepted exceptions: `2`
  - Crevux old Supabase backup/export `roles.sql`
  - Crevux rollback proof against a confirmed non-production legacy DB

These Crevux exceptions are preserved in this plan. They apply only to controlled production dual-write/compare planning. They do not make shared-read safe. They do not make old Supabase pause safe.

## First Rollout Mode

For the first production rollout only, every app must use:

```text
*_SHARED_SUPABASE_RUNTIME_ENABLED=true
*_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
*_SHARED_SUPABASE_READ_MODE=dual_compare
*_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not use `READ_MODE=shared`.

Do not set `FAIL_CLOSED=true`.

Legacy DB remains the source of truth for this rollout.

## Rollout Order

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

Why this order:

- Verixet is the billing, entitlement, usage admission, and credit authority.
- XFlow is the connection/control-plane/app-link authority.
- AudAiX, Rataify, and WordGeni depend on those authority boundaries.
- Crevux is last because media/assets/providers/storage carry the highest operational risk, and two accepted exceptions remain attached to Crevux.

## Global Preconditions

Before touching production variables for any app:

- `node scripts/validate-supabase-phase7k-go-no-go.mjs`
- Confirm Phase 7K still reports `CONDITIONAL GO`
- Confirm shared-read cutover still reports `NO-GO`
- Confirm old Supabase pause still reports `NO-GO`
- Confirm owner approval is captured
- Confirm the two Crevux exceptions are acknowledged in the change record
- Confirm monitoring/log queries are ready
- Confirm rollback owner is assigned
- Confirm observation window owner is assigned

## Production Env Var Matrix

Use the existing env matrix as the canonical variable-name reference:

- `docs/shared-supabase-production-env-matrix.md`

The production rollout changes only the runtime flags. Shared Supabase connection variables must already be present and server-only:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL` where needed
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` where needed
- `VITE_SUPABASE_URL` where needed
- `VITE_SUPABASE_ANON_KEY` where needed

Never place service-role keys or database URLs in `NEXT_PUBLIC_*` or `VITE_*`.

## Railway / Service Variable Checklist

### Verixet

- Service: Verixet Railway service
- Runtime flags:
  - `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm Stripe/webhook envs remain unchanged

### XFlow

- Service: XFlow Railway service
- Runtime flags:
  - `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm OAuth/social envs remain unchanged

### AudAiX

- Service: AudAiX Railway service
- Runtime flags:
  - `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm Verixet/XFlow auth and billing URLs remain unchanged

### Rataify

- Service: Rataify Railway service
- Runtime flags:
  - `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm XFlow/Verixet auth and billing URLs remain unchanged

### WordGeni

- Service: WordGeni web/API/worker services
- Runtime flags:
  - `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm worker/API auth envs remain unchanged

### Crevux

- Service: Crevux web/API/image-gen services
- Runtime flags:
  - `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`
  - `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
  - `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare`
  - `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm server-only shared Supabase vars are present
- Confirm provider/storage/auth envs remain unchanged
- Preserve accepted exceptions:
  - roles.sql export remains unavailable
  - rollback proof remains blocked because the only known legacy target is production/unknown

## Per-App Execution Checklist

### 1. Verixet

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/Verixet && npm run verify:post-deploy-smoke` |
| Deploy/restart placeholder | Update Verixet runtime flags in Railway, then restart/redeploy the Verixet service |
| Post-deploy smoke command | `cd apps/Verixet && npm run verify:post-deploy-smoke` |
| Shared Supabase row verification | `core.usage_events`, `core.billing_events`, `core.audit_logs`, `verixet.entitlement_decisions`, `verixet.usage_admission_logs`, `verixet.credit_ledger` |
| Legacy DB verification | Confirm billing accounts, subscriptions, credits, usage admission, and Stripe records still read/write legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, usage admission errors, Stripe replay errors |
| Rollback command/env reset | `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`, `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

### 2. XFlow

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/XFlow && npm run ops:release-smoke` |
| Deploy/restart placeholder | Update XFlow runtime flags in Railway, then restart/redeploy the XFlow service |
| Post-deploy smoke command | `cd apps/XFlow && npm run ops:release-smoke` |
| Shared Supabase row verification | `core.app_connections`, `core.workspace_app_access`, `core.audit_logs`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, `xflow.workflow_runs` |
| Legacy DB verification | Confirm connection and control-plane state still reads/writes legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, control-plane write errors, auth/session errors |
| Rollback command/env reset | `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`, `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

### 3. AudAiX

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/AudAix && npm run verify:production` |
| Deploy/restart placeholder | Update AudAiX runtime flags in Railway, then restart/redeploy the AudAiX service |
| Post-deploy smoke command | `cd apps/AudAix && npm run verify:production` |
| Shared Supabase row verification | `core.usage_events`, `core.audit_logs`, `audaix.audits`, `audaix.audit_reports`, `audaix.monitors`, `audaix.audit_findings`, `audaix.scan_jobs` |
| Legacy DB verification | Confirm audit/report/monitor/finding/scan-job flows still read/write legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, auth/session errors, Verixet usage admission errors, report storage errors |
| Rollback command/env reset | `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`, `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

### 4. Rataify

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/RatAiFy && npm run verify:production-release` |
| Deploy/restart placeholder | Update Rataify runtime flags in Railway, then restart/redeploy the Rataify service |
| Post-deploy smoke command | `cd apps/RatAiFy && npm run verify:production-release` |
| Shared Supabase row verification | `core.usage_events`, `core.audit_logs`, `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.risk_events`, `rataify.evidence_items` |
| Legacy DB verification | Confirm site/review/issue/risk/evidence flows still read/write legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, evidence storage failures, control-plane event failures |
| Rollback command/env reset | `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`, `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

### 5. WordGeni

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/WordGeni && pnpm live:verify` |
| Deploy/restart placeholder | Update WordGeni runtime flags in Railway, then restart/redeploy web/API/worker services |
| Post-deploy smoke command | `cd apps/WordGeni && pnpm live:verify` |
| Shared Supabase row verification | `core.usage_events`, `core.audit_logs`, `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.memory_cards`, `wordgeni.writing_sessions`, `wordgeni.provenance_items` |
| Legacy DB verification | Confirm document/source/memory/provenance/worker flows still read/write legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, worker/provenance failures, auth/session failures, billing gate failures |
| Rollback command/env reset | `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`, `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

### 6. Crevux

| Field | Value |
| --- | --- |
| Preflight command | `cd apps/CreVux && pnpm smoke:authenticated-beta` |
| Deploy/restart placeholder | Update Crevux runtime flags in Railway, then restart/redeploy web/API/image-gen services |
| Post-deploy smoke command | `cd apps/CreVux && pnpm smoke:authenticated-beta` plus runtime smoke |
| Shared Supabase row verification | `core.usage_events`, `core.audit_logs`, `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, `crevux.credit_spend_events` |
| Legacy DB verification | Confirm project/asset/job/export/provider/credit-spend flows still read/write legacy source |
| Monitoring checks | Dual-write failure, dual-compare mismatch, storage failures, provider callback/idempotency failures, credit-spend write failures |
| Rollback command/env reset | `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`, `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Owner signoff | pending |

Crevux exception preservation for execution:

- `roles.sql` export remains unavailable because the configured roles export user failed authentication
- rollback proof remains blocked because the only known legacy target is production/unknown
- do not treat these exceptions as approval for shared-read cutover
- do not treat these exceptions as approval to pause old Supabase

## Abort Conditions

Abort the current app rollout and execute rollback if any of these occur:

- shared write errors above threshold
- dual-compare mismatch above threshold
- Verixet usage admission errors
- XFlow control-plane/app-link errors
- auth/session failures
- storage write failures
- provider callback or idempotency failures
- Stripe webhook/replay failures
- smoke failure for the app being rolled out
- owner or operator denies progression to the next app

## Observation Window Checklist

For each app before continuing to the next:

- runtime smokes pass after deploy/restart
- shared rows appear in the expected shared schema tables
- legacy DB flows still work
- no critical dual-write failures in logs
- no critical dual-compare mismatches in logs
- no app-specific authority failures
- rollback owner confirms the app can be reverted immediately if needed
- observation notes recorded

Global observation checklist:

- minimum observation window recorded per app
- no critical alert emissions
- no unexplained shared/legacy parity drift
- Crevux exceptions remain visible in the operator notes

## Owner Signoff Fields

| Field | Value |
| --- | --- |
| Rollout owner | pending |
| Verixet signoff | pending |
| XFlow signoff | pending |
| AudAiX signoff | pending |
| Rataify signoff | pending |
| WordGeni signoff | pending |
| Crevux signoff | pending |
| Crevux exceptions acknowledged | pending |
| Shared-read remains blocked acknowledged | pending |
| Old Supabase pause remains blocked acknowledged | pending |

## Final Execution Verdict

Production dual-write execution is ready for owner approval, not for autonomous rollout.

Shared-read cutover remains `NO-GO`.

Old Supabase pause remains `NO-GO`.
