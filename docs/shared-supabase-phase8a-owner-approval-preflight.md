# Shared Supabase Phase 8A Owner Approval Preflight

This document records owner approval for the first controlled production shared Supabase rollout.

This approval is limited to production dual-write/compare mode only.

Do not deploy from this document alone. Do not change production env vars until the operator executes the approved rollout plan. Do not print secrets.

## Owner Approval Scope

Owner approval status: approved for controlled production dual-write/compare only.

Explicit non-approvals:

- shared-read cutover: not approved
- `FAIL_CLOSED=true`: not approved
- pausing old Supabase projects: not approved
- deleting old DBs: not approved
- removing legacy DB paths: not approved

## Approved Production Runtime Mode

For every app in the first production rollout:

```text
*_SHARED_SUPABASE_RUNTIME_ENABLED=true
*_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
*_SHARED_SUPABASE_READ_MODE=dual_compare
*_SHARED_SUPABASE_FAIL_CLOSED=false
```

Never use `READ_MODE=shared` in this phase.

Never set `FAIL_CLOSED=true` in this phase.

## Preserved Crevux Exceptions

The two Crevux accepted exceptions remain active and visible:

1. Crevux old Supabase backup/export `roles.sql` remains unavailable.
2. Crevux rollback proof remains blocked because the only known legacy target is production/unknown.

These exceptions apply only to controlled production dual-write/compare planning.

They do not make shared-read cutover safe.

They do not make old Supabase pause safe.

## Per-App Production Variable Checklist

### Verixet

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare`
- `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm Stripe/webhook envs remain unchanged

Rollback reset:

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`
- `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`

### XFlow

- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare`
- `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm OAuth/auth envs remain unchanged

Rollback reset:

- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`
- `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`

### AudAiX

- `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare`
- `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm Verixet/XFlow auth and billing envs remain unchanged

Rollback reset:

- `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`
- `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`

### Rataify

- `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare`
- `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm XFlow/Verixet auth and billing envs remain unchanged

Rollback reset:

- `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`
- `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`

### WordGeni

- `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare`
- `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm worker/API auth and billing-gate envs remain unchanged

Rollback reset:

- `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`
- `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`

### Crevux

- `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`
- `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
- `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare`
- `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`
- Confirm shared Supabase server vars are present
- Confirm provider/storage/auth envs remain unchanged
- Preserve the two accepted Crevux exceptions in the rollout record

Rollback reset:

- `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`
- `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`

## Final Preflight Status

Production dual-write variable update: approved, subject to operator execution of the Phase 8 rollout plan.

Shared-read cutover: not safe.

Old Supabase pause: not safe.
