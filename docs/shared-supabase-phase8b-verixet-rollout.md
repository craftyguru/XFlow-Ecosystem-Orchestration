# Shared Supabase Phase 8B Verixet Production Dual-Write Rollout

This document prepares the Verixet-only production variable update for controlled shared Supabase dual-write/compare mode.

Do not update XFlow, AudAiX, Rataify, WordGeni, or Crevux in this step. Do not switch `READ_MODE=shared`. Do not set `FAIL_CLOSED=true`. Do not pause or delete old Supabase projects. Do not remove legacy DB paths.

## Scope

Approved app for this update:

- Verixet only

Apps not approved for this update:

- XFlow
- AudAiX
- Rataify
- WordGeni
- Crevux

## Approved Verixet Production Variable Checklist

Set exactly these Verixet runtime flags in the Verixet production Railway service:

```text
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not set shared-read mode.

Do not enable fail-closed mode.

Do not change these in this step:

- XFlow runtime flags
- AudAiX runtime flags
- Rataify runtime flags
- WordGeni runtime flags
- Crevux runtime flags
- production Supabase keys
- production database URLs
- Stripe secrets
- webhook secrets
- legacy DB paths

## Railway / Service Variable Update Steps

Operator steps for the Verixet Railway production service:

1. Open the Verixet production Railway service.
2. Open service variables.
3. Confirm the service is Verixet, not any other ecosystem app.
4. Add or update only the four approved Verixet runtime flags:
   - `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true`
   - `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
   - `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare`
   - `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`
5. Confirm no variable value uses `READ_MODE=shared`.
6. Confirm no variable value uses `FAIL_CLOSED=true`.
7. Apply the variable update.
8. Restart or redeploy only the Verixet service if Railway requires it for variable changes.
9. Do not modify XFlow, AudAiX, Rataify, WordGeni, or Crevux services.

## Post-Update Smoke Commands

Run the Verixet production-safe smoke after the variable update and service restart:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm run verify:post-deploy-smoke
```

If running against a specific production/staging URL is required by the smoke harness, set the approved non-secret base URL variable in the operator shell before the command. Do not print secrets.

Optional authority validation if the target supports it:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npx tsx scripts/access-billing-control-http-validate.ts
```

## Shared Supabase Row Verification

After smoke completes, verify Verixet shared rows are appearing in the shared Supabase project. Use read-only dashboard queries or read-only SQL. Do not print keys or database URLs.

Tables to verify:

- `core.entitlements`
- `core.usage_events`
- `core.audit_logs`
- `verixet.entitlement_decisions`
- `verixet.usage_admission_logs`

Expected result:

- New Verixet runtime activity may appear in shared tables.
- Legacy Verixet remains source of truth.
- Dual-compare mismatches must be logged and investigated.
- No browser/client code receives service-role credentials.

## Legacy DB Verification

Verify the legacy Verixet authority DB still handles:

- billing accounts
- subscriptions
- Stripe customers and webhook records
- entitlement decisions
- usage admission
- usage and credit authority paths
- billing audit logs

Expected result:

- Legacy reads/writes still work.
- Shared writes mirror only behind Verixet runtime/dual-write flags.
- Any shared write failure must not break legacy runtime while `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`.

## Monitoring Checks

Watch for these Verixet markers and counters during the observation window:

- shared dual-write failures
- dual-compare mismatches
- shared write latency/errors
- Verixet usage admission errors
- Stripe webhook/replay errors
- entitlement decision mismatches
- audit log write failures

Abort if any critical signal crosses the approved threshold.

## Rollback Steps

If rollback is required, reset only the Verixet production Railway service variables:

```text
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
VERIXET_SHARED_SUPABASE_READ_MODE=legacy
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false
```

Then restart or redeploy only the Verixet service if Railway requires it.

Rollback verification:

1. Run `npm run verify:post-deploy-smoke`.
2. Confirm legacy Verixet billing, entitlement, usage admission, and Stripe paths still work.
3. Confirm new shared Verixet writes stop after flags are disabled.
4. Preserve shared rows already written for audit and reconciliation.
5. Do not delete shared rows without a separate approved cleanup plan.

## Approval Status

Verixet variable update readiness: ready for operator execution.

Other app variable updates: not approved in Phase 8B.

Shared-read cutover: not safe.

Old Supabase pause: not safe.
