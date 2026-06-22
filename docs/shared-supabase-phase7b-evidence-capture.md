# Shared Supabase Phase 7B Evidence Capture

Phase 7B records the evidence required before any production dual-write rollout. It does not authorize deployment, production environment changes, shared reads, fail-closed behavior, legacy database removal, or old Supabase project pause.

Production dual-write rollout is not safe yet.

Production cutover remains unsafe.

Old Supabase projects remain unsafe to pause.

## Evidence Rules

- Do not record secrets, passwords, database URLs, service-role keys, OAuth secrets, Stripe secrets, provider keys, auth cookies, JWTs, or backup encryption keys.
- Use references to secure storage locations, ticket IDs, dashboard names, run IDs, or timestamped evidence notes.
- Every evidence row must have an owner and result before it can satisfy readiness.
- Evidence should be gathered in production-like staging first, then production only after explicit rollout approval.
- `READ_MODE=shared` remains forbidden.
- `FAIL_CLOSED=true` remains forbidden.

## Evidence Sources

Evidence is recorded in:

- `docs/shared-supabase-phase7b-evidence-log.md`

Supporting validators:

- `node scripts/validate-supabase-phase6b-browser-flows.mjs`
- `node scripts/validate-supabase-production-rollout-packet.mjs`
- `node scripts/validate-supabase-phase7a-readiness.mjs`
- `node scripts/validate-supabase-phase7b-evidence.mjs`

## Required Evidence Categories

### A. Old Supabase Backup/Export Evidence

Capture per app:

- App.
- Old project/source.
- Export method.
- Timestamp.
- File/location reference without secrets.
- Restore-tested yes/no.
- Owner initials.
- Result.

### B. Shared Supabase Backup Verification

Capture:

- Backup method.
- Restore drill target.
- Timestamp.
- Validation query or validation run reference.
- Result.

### C. Monitoring/Alerts Evidence

Capture:

- Dual-write failure alert.
- Dual-compare mismatch alert.
- Latency/error dashboard.
- Verixet usage admission alert.
- XFlow control-plane write alert.
- Storage/provider/Stripe alert.
- Result.

### D. Rollback Rehearsal Evidence

Capture per app:

- Flags turned off.
- Legacy path verified.
- Shared writes stopped.
- User-facing flow still works.
- Command/evidence.
- Result.

### E. Old DB Write Detection Evidence

Capture per app:

- Old DB write logs checked.
- Expected writes still present during dual-write yes/no.
- Writes stopped after cutover no/yes later.
- Result.

### F. Storage Proof Evidence

Capture:

- App.
- Bucket.
- Upload/read/delete or metadata proof.
- Result.

### G. Provider Callback/Idempotency Evidence

Capture:

- App/provider.
- Callback received.
- Idempotency key behavior.
- Duplicate callback test.
- Result.

### H. Stripe Test Billing/Webhook Evidence

Capture:

- Verixet checkout/test webhook.
- Replay/idempotency.
- Entitlement update.
- Result.

## Completion Criteria

Phase 7B evidence is complete only when:

- Every evidence row in the log has result `pass` or an explicit accepted exception with owner approval.
- No evidence row remains `pending`.
- No evidence row remains `fail`.
- Production rollout packet validator passes.
- Phase 7A readiness validator passes.
- Owners approve the first production dual-write app.

Until then, production dual-write rollout is not safe.
