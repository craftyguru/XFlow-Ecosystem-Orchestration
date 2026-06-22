# Shared Supabase Production Rollback Runbook

Rollback must preserve legacy behavior, preserve audit history, and stop shared writes without deleting shared rows.

This runbook applies to production dual-write/compare rollout only. It does not authorize old Supabase project pause or shared-read cutover.

## Global Rollback Steps

For the affected app:

1. Turn runtime flag off.
2. Turn dual-write flag off.
3. Set read mode to legacy.
4. Keep fail-closed false.
5. Restart or redeploy the service if variable changes require it.
6. Verify the legacy flow still works.
7. Verify shared writes stop.
8. Document any partial shared rows written during the window.
9. Preserve audit logs.
10. Record owner signoff.

Do not delete shared rows during the incident unless a separate cleanup plan is approved.

## Verixet

```text
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
VERIXET_SHARED_SUPABASE_READ_MODE=legacy
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy billing, entitlement, usage admission, credit ledger, Stripe webhook ingestion, and billing audit logs. Confirm shared writes stop in `core.usage_events`, `core.billing_events`, `core.audit_logs`, `verixet.entitlement_decisions`, and `verixet.usage_admission_logs`.

## XFlow

```text
XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
XFLOW_SHARED_SUPABASE_READ_MODE=legacy
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy app connections, app links, UCL/control-plane events, deploy validation signals, workflow runs, and orchestration. Confirm shared writes stop in `core.app_connections`, `core.workspace_app_access`, `core.audit_logs`, and `xflow.*`.

## AudAiX

```text
AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false
AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
AUDAIX_SHARED_SUPABASE_READ_MODE=legacy
AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy audit creation, report fetch, monitor behavior, findings, scan jobs, MFA/session behavior, and Verixet usage admission. Confirm shared writes stop in `core.audit_logs`, `core.usage_events`, and `audaix.*`.

## Rataify

```text
RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false
RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
RATAIFY_SHARED_SUPABASE_READ_MODE=legacy
RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy site, review/scan, issue, risk event, and evidence flows. Confirm shared writes stop in `core.audit_logs`, `core.usage_events`, and `rataify.*`.

## WordGeni

```text
WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false
WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
WORDGENI_SHARED_SUPABASE_READ_MODE=legacy
WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy document, source, memory, writing session, provenance, worker, and billing gate behavior. Confirm shared writes stop in `core.audit_logs`, `core.usage_events`, and `wordgeni.*`.

## Crevux

```text
CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
CREVUX_SHARED_SUPABASE_READ_MODE=legacy
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Verify legacy project, asset, generation job, provider run, export, credit spend, provider callback, and storage behavior. Confirm shared writes stop in `core.audit_logs`, `core.usage_events`, and `crevux.*`.

## Partial Shared Row Handling

During rollback, shared rows written before flags were disabled should be retained for audit and reconciliation. Mark them in the incident notes by app, workspace, operation, idempotency key, and timestamp. Cleanup requires a separate approved SQL plan.
