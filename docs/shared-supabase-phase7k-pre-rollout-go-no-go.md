# Shared Supabase Phase 7K Pre-Rollout Go/No-Go

This report summarizes the current shared Supabase proof posture before any production dual-write rollout.

Do not deploy from this report alone. Do not change production env vars, pause old Supabase projects, switch `READ_MODE=shared`, set `FAIL_CLOSED=true`, remove legacy DB paths, or print secrets.

## Current Proof Summary

| Area | Status | Evidence |
| --- | --- | --- |
| Phase 6B browser/API proof | pass | `passed=6`, `failed=0`, `pending=0` |
| Phase 7B evidence log | complete with accepted exceptions | `missingEvidence=0`, `failedEvidence=0`, `acceptedExceptions=2` |
| Storage proof | pass | Upload/read/hash/delete passed for `xflow-artifacts`, `verixet-billing-artifacts`, `audaix-reports`, `rataify-evidence`, `wordgeni-exports`, and `crevux-assets` |
| Provider/idempotency proof | pass where recorded | XFlow, Verixet mock Stripe webhook replay, AudAiX, Rataify, WordGeni, and Crevux safe mock/local tests passed |
| Monitoring marker proof | pass | Source markers, monitoring plan markers, and synthetic log counter detection passed |
| Old DB write-detection pre-rollout evidence | pass for planning/runtime posture | Plan-only target classification and runtime legacy-first adapter tests passed for all six apps |
| Final old DB pause evidence | missing | Real SQL/log observation is still required after later shared-read cutover |

Old DB write-detection evidence is intentionally scoped: it proves legacy-first runtime behavior and provides sanitized read-only query plans. It does not prove old writes have stopped, and it does not make any old Supabase project safe to pause.

## Accepted Exceptions

No evidence rows remain pending in `docs/shared-supabase-phase7b-evidence-log.md`. The remaining non-pass rows are owner-approved Crevux exceptions:

| Evidence row | Status | Scope and constraint |
| --- | --- | --- |
| Crevux old Supabase backup/export | accepted_exception | `schema.sql` and `data.sql` export completed, but `roles.sql` remains unavailable because the configured roles export user failed authentication. This exception applies only to controlled production dual-write/compare planning. |
| Crevux rollback proof | accepted_exception | The only available Crevux legacy DB target is production/unknown. No repair, migration, seed, or write may be run against it. This exception applies only to controlled production dual-write/compare planning. |

## Go/No-Go Verdicts

| Decision | Verdict | Reason |
| --- | --- | --- |
| Local/staging proof posture | GO | Phase 6B browser/API proof passed for all six apps, and Phase 7 evidence is materially complete except the listed pre-production items |
| Production dual-write rollout | CONDITIONAL GO | Required evidence is complete, but two Crevux rows are covered by owner-approved exceptions that apply only to controlled dual-write/compare planning |
| Controlled production dual-write after evidence completion | CONDITIONAL GO | Start only in dual-write/compare mode, with the accepted Crevux exceptions explicitly tracked and owner approval captured |
| Production shared-read cutover | NO-GO | Shared-read is a later phase after production dual-write observation and reconciliation |
| Old Supabase pause | NO-GO | Old projects remain source-of-truth dependencies until shared-read cutover, zero-write observation, backups, rollback window, and owner approval |

## Required Manual Actions

1. Keep the Crevux accepted exceptions attached to the rollout packet and operator checklist.
2. Prepare production observation dashboard/log queries for dual-write failures, dual-compare mismatches, latency, auth/session failures, Verixet usage admission, XFlow control-plane, storage, provider callbacks, and Stripe replay.
3. Capture owner approval for production dual-write start, explicitly acknowledging the two Crevux exceptions.
4. Do not convert the Crevux exceptions into passes unless a confirmed non-production legacy DB target and a roles-capable export path become available.

## First Production Dual-Write Mode

If and only if the missing evidence is completed and owners approve, the first production rollout must use:

```text
*_SHARED_SUPABASE_RUNTIME_ENABLED=true
*_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
*_SHARED_SUPABASE_READ_MODE=dual_compare
*_SHARED_SUPABASE_FAIL_CLOSED=false
```

Legacy DB remains the source of truth. Do not use `READ_MODE=shared`. Do not set `FAIL_CLOSED=true`. Do not pause old Supabase projects.

## Abort Conditions

Abort or roll back the affected app if any of these occur above the approved threshold:

- Shared write errors.
- Dual-compare mismatches.
- Verixet usage admission errors.
- XFlow control-plane/app-connection errors.
- Auth/session exchange failures.
- Storage write/read/delete failures.
- Provider callback or idempotency failures.
- Stripe webhook, replay, or entitlement update failures.
- Rollback rehearsal failure.

## Final Verdict

Production dual-write rollout is conditional go only for controlled dual-write/compare planning with the approved Crevux exceptions explicitly accepted by the owner.

Production shared-read cutover is not safe.

Old Supabase projects are not safe to pause.

Local/staging proof posture is go.

Controlled production dual-write is conditional go with owner approval and the documented Crevux exceptions; shared-read cutover and old Supabase pause remain no-go.
