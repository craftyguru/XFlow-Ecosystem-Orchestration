# Shared Supabase Phase 7 Production Hardening

Phase 7 is the final hardening gate before any production dual-write rollout. It does not authorize production cutover, shared reads, fail-closed behavior, removal of legacy database paths, or pausing old Supabase projects.

## Current Proof Status

- Phase 6 runtime smokes passed for Verixet, XFlow, AudAiX, Rataify, WordGeni, and Crevux.
- Phase 6B browser/API proof passed for all six apps: passed=6, failed=0, pending=0.
- Production cutover remains unsafe.
- Old Supabase projects remain unsafe to pause.
- Runtime reads must remain in `dual_compare` or `legacy`; do not switch `READ_MODE=shared`.
- Runtime shared-write failures must remain non-blocking during this stage; do not set `FAIL_CLOSED=true`.

## Required Hardening Before Production Dual-Write

Before enabling production dual-write flags for any app, complete and record these checks in staging or a production-like non-live environment:

- Real storage proof per app, including upload, metadata write, readback, permissions, and cleanup.
- Provider callback proof for apps with external callbacks, including retry and replay behavior.
- Idempotency proof for every webhook, callback, usage event, audit event, job event, and dual-write path.
- Stripe test billing proof through Verixet, using test-mode checkout, webhook, entitlement, usage admission, and credit paths.
- Rollback rehearsal for each app by turning runtime flags off and confirming legacy paths continue to work.
- Monitoring and alerts for dual-write errors, compare mismatches, storage failures, provider callback failures, and billing/usage denials.
- Observation window after staging enablement with no critical mismatches and no unexplained missing shared rows.
- Backup/export of every old Supabase project before production dual-write.
- Shared Supabase backup verification, including restore-readiness notes.
- Old DB write detection so any continued legacy-only writes are visible before cutover.

## Per-App Hardening Checklist

### Verixet

- Stripe test-mode checkout/webhook proof is complete.
- Usage admission idempotency is proven for duplicate and replayed requests.
- Entitlement decision replay produces stable decisions and no duplicate authority rows.
- Credit ledger reconciliation matches legacy and shared rows.
- Rollback from shared dual-write returns cleanly to legacy behavior.
- Billing, entitlement, usage, credit, plan, and Stripe authority remains Verixet-owned.

### XFlow

- App connection idempotency is proven for create, update, verify, and replay paths.
- UCL event replay/idempotency is proven where UCL events are available.
- Deploy validation event replay is proven without duplicate or contradictory checks.
- Connection rollback returns cleanly to legacy XFlow connection/control-plane behavior.
- Control-plane monitoring is enabled for event write failures and compare mismatches.
- XFlow remains the authority for app connections, app links, UCL, workflow, deploy validation, and orchestration.

### AudAiX

- Report artifact storage proof is complete for the `audaix-reports` bucket.
- Verixet usage admission proof is complete for audit creation and completion flows.
- MFA/AAL2 staging proof is complete without weakening production MFA.
- Audit result fetch proof confirms shared rows and report references are readable through the intended server path.
- Rollback flag-off proof confirms legacy audit/report behavior still works.
- AudAiX does not become billing, entitlement, usage-admission, or XFlow control-plane authority.

### Rataify

- Evidence storage proof is complete for the `rataify-evidence` bucket.
- Site/review/issue/risk event idempotency is proven for duplicate and replayed writes.
- Legacy DB readiness cleanup is complete and documented for any remaining baseline legacy table/index requirements.
- Rollback proof confirms legacy site/review/issue/risk/evidence behavior still works.
- Rataify does not become billing, entitlement, usage-admission, XFlow control-plane, or AudAiX deep-audit authority.

### WordGeni

- Real storage/source upload proof is complete for source and export flows.
- Worker boot/provenance proof is complete with durable evidence from worker logs or worker status records.
- API auth/token proof confirms browser/API flows use the intended auth/session path.
- Billing gate behavior proof confirms Verixet remains the usage and entitlement authority.
- Rollback proof confirms legacy document/source/memory/provenance behavior still works.
- WordGeni does not become Crevux media generation, asset, provider-job, or export authority.

### Crevux

- Crevux-assets storage proof is complete for media asset metadata, upload/readback, and cleanup.
- Provider callback/idempotency proof is complete for safe mock provider and retry/replay paths.
- Safe mock provider proof is complete without real provider API keys.
- Export metadata proof confirms export records and references are mirrored safely.
- Credit spend proof confirms Verixet remains the billing/entitlement/usage-admission authority.
- Rollback proof confirms legacy project/asset/job/export/provider-run behavior still works.
- WordGeni may request or reference Crevux outputs, but Crevux remains media asset/job/provider authority.

## Production Dual-Write Rollout Plan

Production dual-write is not safe until the hardening checklist is complete. When it is eventually approved, the rollout must use the lowest-risk posture:

1. Enable runtime flags only for the selected app.
2. Keep `*_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`.
3. Keep `*_SHARED_SUPABASE_READ_MODE=dual_compare`.
4. Keep `*_SHARED_SUPABASE_FAIL_CLOSED=false`.
5. Observe logs, compare mismatches, row parity, storage events, provider callbacks, webhook idempotency, and rollback readiness.
6. Do not switch reads to shared during Phase 7.
7. Do not remove legacy database paths during Phase 7.
8. Do not pause old Supabase projects during Phase 7.

Recommended production dual-write order remains:

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

Verixet and XFlow go first because they define billing/entitlement/usage and connection/control-plane authority boundaries. Crevux remains last because media assets, provider jobs, callbacks, and storage migration carry the highest operational risk.

## Go/No-Go Criteria

Production dual-write remains no-go until all of these are true:

- All Phase 7 hardening checks pass for the app being considered.
- No critical shared/legacy mismatches remain unexplained.
- Rollback rehearsal is completed and documented.
- Monitoring and alerts are enabled and observed.
- Old DB backups and exports are complete.
- Shared DB backups are verified.
- Old DB write detection is active.
- Provider callbacks and webhook replays are idempotent.
- Real storage proof is complete.
- Stripe test billing proof is complete for Verixet-controlled flows.
- Production cutover remains explicitly separate from production dual-write.

## Verdict

Production dual-write rollout is not safe yet.

Production cutover remains unsafe.

Old Supabase projects remain unsafe to pause.
