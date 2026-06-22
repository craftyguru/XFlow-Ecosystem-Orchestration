# Shared Supabase Rollback Plan

Rollback must be possible for each app independently. The old database remains available until runtime migration, production validation, and an observation window pass.

## Global Rollback Rules

- Keep old Supabase/database env values backed up in the deployment platform.
- Do not delete old migrations or old DB code during initial cutover.
- Use production runtime flags to disable shared reads/writes.
- Preserve audit logs in both old and shared systems.
- Never roll back by editing client-exposed secrets.
- Prefer a full app rollback over partial manual database edits.

## Rollback Switch

For each app, rollback should support:

1. Disable `*_SHARED_SUPABASE_RUNTIME_ENABLED`.
2. Restore old `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and `DIRECT_DATABASE_URL`.
3. Redeploy the last known-good runtime.
4. Disable shared bridge/runtime writes.
5. Re-run old-app smoke and shared-app read-only verification.

## Partial Write Detection

Detect partial writes by checking:

- Shared rows created after cutover start.
- Old DB rows created after cutover start.
- Idempotency key conflicts.
- Missing audit logs for product writes.
- Usage events without corresponding product records.
- Stripe webhook records present in one DB but not the other.
- Provider jobs or callbacks present in one system only.

## App Rollback Details

### Verixet

Risk:

- Duplicate billing events, entitlement decisions, credit ledger writes, webhook replay side effects.

Phase 4A rollback switch:

- Set `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` during the dual-write observation phase unless a staging test explicitly needs blocking behavior.

Rollback:

- Restore old Verixet DB/Supabase envs.
- Disable shared runtime flag.
- Keep shared billing/audit rows for investigation; do not delete them until reconciled.
- Pause webhook replay until idempotency status is understood.

Data at risk:

- Entitlement decisions and usage admission records written only to shared DB during cutover.
- Stripe webhooks acknowledged by new runtime but not present in old DB.

### XFlow

Risk:

- Product apps receiving stale or conflicting connection/control-plane decisions.

Phase 4B rollback switch:

- Set `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` during the dual-write observation phase unless a staging test explicitly needs blocking behavior.

Rollback:

- Restore old XFlow envs.
- Disable shared runtime flag.
- Force product apps to read XFlow legacy API responses.
- Preserve shared control-plane events for audit.

Data at risk:

- App connection/link changes made only in shared DB.

### AudAiX

Risk:

- Audit/report/monitor writes split across legacy and shared DBs.

Rollback:

- Restore old AudAiX envs.
- Disable `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED`.
- Disable `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED`.
- Set `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` during the dual-write validation window unless explicitly testing fail-closed behavior.
- Mark shared-only audit/report rows as requiring reconciliation.

Data at risk:

- Audit reports or findings created during the cutover window.

Phase 4C rollback switch:

- The legacy AudAiX runtime remains the source of truth by default.
- Shared write failures do not break legacy runtime when fail-closed is false.
- If dual-write was enabled, compare shared `audaix.audits`, `audaix.audit_findings`, `audaix.scan_jobs`, `core.usage_events`, and `core.audit_logs` against legacy rows before discarding or replaying any shared-only rows.

### Rataify

Risk:

- Evidence metadata and storage objects split across old and shared systems.

Rollback:

- Restore old Rataify envs.
- Disable `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED`.
- Disable `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED`.
- Set `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` during the dual-write validation window unless explicitly testing fail-closed behavior.
- Keep shared evidence metadata and storage paths for reconciliation.

Data at risk:

- Evidence items or risk events written only to shared DB.
- Storage objects uploaded only to `rataify-evidence`.

Phase 4D rollback switch:

- The legacy Rataify runtime remains the source of truth by default.
- Shared write failures do not break legacy runtime when fail-closed is false.
- If dual-write was enabled, compare shared `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.risk_events`, `rataify.evidence_items`, `core.usage_events`, and `core.audit_logs` against legacy rows before discarding or replaying any shared-only rows.

### WordGeni

Risk:

- Documents, sources, memory, provenance, and exports split across old and shared systems.

Rollback:

- Restore old WordGeni envs.
- Disable `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED`.
- Disable `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED`.
- Set `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` during the dual-write validation window unless explicitly testing fail-closed behavior.
- Keep shared document/source/memory/provenance rows for reconciliation.
- Keep Crevux references read-only until ownership is verified.

Data at risk:

- Drafts or memory/provenance records created during cutover.
- Export objects uploaded only to `wordgeni-exports`.

Phase 4E rollback switch:

- The legacy WordGeni runtime remains the source of truth by default.
- Shared write failures do not break legacy runtime when fail-closed is false.
- If dual-write was enabled, compare shared `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.memory_cards`, `wordgeni.writing_sessions`, `wordgeni.provenance_items`, `core.usage_events`, and `core.audit_logs` against legacy rows before discarding or replaying any shared-only rows.
- Do not replay or mutate Crevux-owned media/job/asset rows from WordGeni rollback tooling.

### Crevux

Risk:

- Provider jobs, assets, exports, credit spend, callbacks, and storage objects split across systems.

Rollback:

- Restore old Crevux envs.
- Disable shared runtime flags: `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`, and `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Disable smoke-only no-Stripe mode if it was used locally: `CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=false`.
- Stop shared provider callback handling if enabled.
- Reconcile provider job IDs before retrying jobs.
- Keep `CREVUX_SHARED_SUPABASE_LOCAL_ENABLED` reserved for local smoke only; do not use it as a production rollback switch.

Data at risk:

- In-flight provider jobs.
- Assets uploaded only to `crevux-assets`.
- Credit spend events written only to shared DB.

Phase 4F rollback notes:

- If dual-write was enabled, compare shared `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, `crevux.credit_spend_events`, `core.usage_events`, and `core.audit_logs` before discarding or replaying shared-only rows.
- Do not replay provider callbacks blindly; replay only missing external provider event IDs after checking idempotency state.
- Do not let WordGeni rollback tooling mutate Crevux-owned assets, jobs, provider runs, or exports.

## Cleanup After Rollback

Do not immediately delete shared rows. Instead:

- Mark rows with rollback incident ID if needed.
- Export shared rows created during the failed cutover.
- Reconcile against old DB.
- Delete only smoke/test rows that are clearly marked.
- Preserve `core.audit_logs` unless legal/compliance policy requires different handling.

## Webhook Replay and Idempotency

For Verixet and Crevux:

- Record webhook delivery IDs before cutover.
- Ensure idempotency tables are backfilled or dual-checked.
- During rollback, do not replay all webhooks blindly.
- Replay only missing event IDs after comparing old and shared webhook records.

## Rollback Test

Before production cutover:

- Run a staging cutover.
- Create one record per app.
- Roll back to old envs.
- Confirm old runtime works.
- Confirm shared-only writes are detected.
- Confirm duplicate writes are not created on retry.
