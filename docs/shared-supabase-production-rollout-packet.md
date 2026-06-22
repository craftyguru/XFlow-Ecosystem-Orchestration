# Shared Supabase Production Rollout Packet

This packet is the source of truth before any production shared Supabase dual-write rollout for XFlow, Verixet, AudAiX, Rataify, WordGeni, and Crevux.

It does not authorize deployment, production environment changes, shared reads, fail-closed behavior, legacy database removal, or old Supabase project pause.

## Executive Summary

### What Is Changing

The ecosystem is preparing to run production dual-write/compare mode from each app into the new shared Supabase project. During the first production rollout, apps keep their existing legacy runtime paths while also mirroring selected authority/product rows into shared Supabase.

### What Is Not Changing

- Legacy databases remain the source of truth.
- Reads do not move to shared Supabase.
- `READ_MODE=shared` is not allowed.
- `FAIL_CLOSED=true` is not allowed.
- Old Supabase projects are not paused.
- Legacy database paths are not removed.
- Production secrets are not printed or committed.

### Why The Rollout Exists

The rollout moves the six-app ecosystem toward one secure shared Supabase project while preserving authority boundaries:

- Verixet remains billing, entitlement, usage, credits, plan, and Stripe authority.
- XFlow remains control-plane, app-linking, UCL, workflow, deploy validation, and orchestration authority.
- AudAiX, Rataify, WordGeni, and Crevux keep app-owned product data in their app schemas.

### Current Proof Status

- Phase 1 shared schema/RLS/storage is complete.
- Phase 2 shared helper package is complete.
- Local bridge smokes passed for all six apps.
- Runtime smokes passed for all six apps.
- Phase 6B browser/API proof passed: passed=6, failed=0, pending=0.
- Phase 7 production hardening artifacts exist and validate.

### Current Production Safety Verdict

Production dual-write rollout is not safe unless every preflight item in this packet is completed and owner approval is captured.

Production cutover remains unsafe.

Old Supabase projects remain unsafe to pause.

## Rollout Strategy

The first production rollout must be dual-write/compare only:

```text
*_SHARED_SUPABASE_RUNTIME_ENABLED=true
*_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
*_SHARED_SUPABASE_READ_MODE=dual_compare
*_SHARED_SUPABASE_FAIL_CLOSED=false
```

Explicit guardrails:

- Do not use `READ_MODE=shared` yet.
- Do not set `FAIL_CLOSED=true` yet.
- Do not pause old Supabase projects.
- Do not remove legacy DB paths.
- Legacy DB remains source of truth during first production dual-write.

## App Rollout Order

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

Verixet goes first because it is the billing, entitlement, usage, credit, plan, and Stripe authority. XFlow follows because it is the control-plane, app-linking, connection, and orchestration authority. Product apps depend on those authority boundaries. Crevux is last because media, assets, providers, callbacks, export pipelines, and storage carry the highest operational risk.

## Preconditions

All items must be complete before production dual-write is approved:

- Phase 6B validator reports passed=6, failed=0, pending=0.
- Phase 7 validator passes.
- Backup/export plan is complete for old Supabase projects.
- Shared Supabase backup is verified.
- Rollback rehearsal is complete for the app being rolled out.
- Monitoring and alerts are active.
- Old DB write detection is ready.
- Provider callback/idempotency proof is complete.
- Storage proof is complete.
- Stripe test billing/webhook proof is complete.
- Production envs are reviewed.
- Owner approval is captured.

## Monitoring Plan

Monitor these signals during any production dual-write window:

- Dual-write failures.
- Dual-compare mismatches.
- Shared write latency.
- Verixet usage admission errors.
- XFlow control-plane write errors.
- Storage write errors.
- Provider callback/idempotency errors.
- Auth/session exchange errors.
- Stripe webhook replay errors.

## Observation Window

Minimum recommended observation period: 72 hours per app after production dual-write enablement.

Metrics that must remain clean:

- No critical shared/legacy compare mismatches.
- No unexplained missing shared rows.
- No sustained shared write latency increase.
- No provider callback replay duplication.
- No Stripe webhook replay duplication.
- No app-owned storage permission regressions.
- No auth/session exchange regression.
- No old DB write paths hidden from detection.

Any critical mismatch blocks the next app rollout. Owner signoff is required before moving to the next app.

## Old Supabase Pause Criteria

Old Supabase projects are not safe to pause until:

- Production dual-write is stable.
- Shared-read cutover happens in a later approved phase.
- Old DB writes have stopped.
- Backups/export are complete.
- Rollback window has passed.
- Owners approve pause.

## References

- `docs/shared-supabase-production-env-matrix.md`
- `docs/shared-supabase-production-rollout-checklist.md`
- `docs/shared-supabase-production-rollback-runbook.md`
- `docs/shared-supabase-production-communications.md`
- `docs/shared-supabase-phase7-production-hardening.md`
