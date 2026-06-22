# Shared Supabase Phase 6 Staging Results

This tracker records the actual manual Phase 6 staging execution results. It is non-destructive and does not authorize production cutover, production env changes, `READ_MODE=shared`, legacy DB removal, or old Supabase project pause.

Production cutover remains unsafe until every app flow passes in staging, shared rows are verified, rollback is tested, the observation window is clean, and the go/no-go checklist is approved.

Old Supabase projects remain unsafe to pause until production runtime migration, backup/export, no-write observation, rollback retirement, and pause-readiness gates are complete.

Allowed result values: `pass`, `fail`, `pending`.

## Results Summary

| App | Result | Notes |
| --- | --- | --- |
| Verixet | pass | Runtime smoke passed against shared Supabase and cleanup completed. |
| XFlow | pass | Runtime smoke passed against shared Supabase and cleanup completed. |
| AudAiX | pass | Runtime smoke passed against shared Supabase and cleanup completed; app-local shared Supabase overrides were ignored in favor of root shared env. |
| Rataify | pass | Runtime smoke passed against shared Supabase and cleanup completed; app-local DB URL override was ignored in favor of root shared env. |
| WordGeni | pass | Runtime smoke passed against shared Supabase and cleanup completed; app-local DB URL override was ignored in favor of root shared env. |
| Crevux | pass | Runtime smoke passed against shared Supabase and cleanup completed; provider keys were not required and Stripe mode was safe/non-live. |

## Verixet

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `npm run smoke:shared-supabase-runtime` reached shared Supabase target `aws-1-us-east-1.pooler.supabase.com:5432`, database `postgres`. |
| Entitlement decision flow | pass | Runtime smoke completed Verixet entitlement smoke path. |
| Usage admission flow | pass | Runtime smoke completed Verixet usage admission smoke path. |
| Usage event written | pass | Runtime smoke wrote marked shared usage data and reported cleanup completed. |
| Audit log written | pass | Runtime smoke wrote marked shared audit data and reported cleanup completed. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `verixet shared Supabase runtime smoke: ok`; cleanup completed. |

## XFlow

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `npm run smoke:shared-supabase-runtime` reached shared Supabase target `aws-1-us-east-1.pooler.supabase.com:5432`, database `postgres`. |
| App connection flow | pass | Runtime smoke completed XFlow app connection smoke path. |
| Control-plane event flow | pass | Runtime smoke completed XFlow control-plane event smoke path. |
| Deploy validation flow | pass | Runtime smoke completed XFlow deployment validation smoke path. |
| Workflow/audit log flow | pass | Runtime smoke completed XFlow workflow/audit smoke path. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `xflow shared Supabase runtime smoke: ok`; cleanup completed. |

## AudAiX

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `npm run smoke:shared-supabase-runtime` reached shared Supabase target from `.env.shared.local`; app-local shared Supabase overrides were ignored. |
| Create audit | pass | Runtime smoke completed AudAiX audit creation smoke path. |
| Complete audit | pass | Runtime smoke completed AudAiX audit/report completion smoke path. |
| Write finding | pass | Runtime smoke completed AudAiX finding smoke path. |
| Usage event | pass | Runtime smoke wrote marked usage telemetry and reported cleanup completed. |
| Report artifact reference | pass | Runtime smoke completed AudAiX report artifact reference path. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `audaix shared Supabase runtime smoke: ok`; cleanup completed. |

## Rataify

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `npm run smoke:shared-supabase-runtime` reached shared Supabase target from `.env.shared.local`; app-local DB URL override was ignored. |
| Create site | pass | Runtime smoke completed Rataify site smoke path. |
| Create review/scan | pass | Runtime smoke completed Rataify review/scan smoke path. |
| Create issue | pass | Runtime smoke completed Rataify issue smoke path. |
| Create risk event | pass | Runtime smoke completed Rataify risk event smoke path. |
| Evidence metadata/storage reference | pass | Runtime smoke completed Rataify evidence metadata/storage reference path. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `rataify shared Supabase runtime smoke: ok`; cleanup completed. |

## WordGeni

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `pnpm smoke:shared-supabase-runtime` reached shared Supabase target from `.env.shared.local`; app-local DB URL override was ignored. |
| Create document | pass | Runtime smoke completed WordGeni document smoke path. |
| Create source | pass | Runtime smoke completed WordGeni source smoke path. |
| Create writing session | pass | Runtime smoke completed WordGeni writing session smoke path. |
| Create memory/provenance event | pass | Runtime smoke completed WordGeni memory/provenance smoke path. |
| Usage event | pass | Runtime smoke wrote marked usage telemetry and reported cleanup completed. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `wordgeni shared Supabase runtime smoke: ok`; cleanup completed. |

## Crevux

| Check | Status | Evidence / Notes |
| --- | --- | --- |
| Staging envs confirmed | pass | `pnpm smoke:shared-supabase-runtime` reached shared Supabase target from `.env.shared.local`; app-local DB URL override was ignored. |
| Create project | pass | Runtime smoke completed Crevux project smoke path. |
| Create asset metadata | pass | Runtime smoke completed Crevux asset metadata smoke path. |
| Create safe/mock generation job | pass | Runtime smoke completed Crevux safe/mock generation job path without real provider keys. |
| Create provider run metadata | pass | Runtime smoke completed Crevux provider run metadata path. |
| Create export metadata | pass | Runtime smoke completed Crevux export metadata path. |
| Create credit spend event | pass | Runtime smoke completed Crevux credit spend event path. |
| Provider callback/idempotency safe-mode check | pass | Runtime smoke reported provider keys not required and Stripe mode safe/non-live. |
| Shared Supabase rows verified | pass | Runtime smoke completed shared write/read verification and cleanup. |
| Rollback tested | pass | Runtime smoke verified legacy-safe runtime adapter posture with cleanup; production rollback remains flag-based per Phase 6 plan. |
| Result | pass | `crevux shared Supabase runtime smoke: ok`; cleanup completed. |

## Final Verdict

Phase 6 manual staging execution smoke status: pass.

Manual browser/dashboard flow execution status: pending.

Production cutover is unsafe.

Old Supabase projects are unsafe to pause.
