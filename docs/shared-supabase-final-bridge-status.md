# Shared Supabase Final Bridge Status

Status date: 2026-05-04

This is the final local-bridge checkpoint before production runtime migration. It does not approve production cutover or pausing any old Supabase project.

## Summary

All six local-only bridges have passed against the shared Supabase project. The shared project has Phase 1 migrations, Phase 2 helper package integration, custom schemas exposed through the Data API, `100_api_role_grants.sql`, app-specific storage buckets, and smoke scripts proving local bridge writes and cleanup.

| App | Bridge flag | Smoke command | Smoke result | Storage bucket | Production cutover |
| --- | --- | --- | --- | --- | --- |
| Verixet | `VERIXET_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/Verixet && npm run smoke:shared-supabase-local` | Passed | `verixet-billing-artifacts` | Not safe |
| XFlow | `XFLOW_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/XFlow && npm run smoke:shared-supabase-local` | Passed | `xflow-artifacts` | Not safe |
| AudAiX | `AUDAIX_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/AudAix && npm run smoke:shared-supabase-local` | Passed | `audaix-reports` | Not safe |
| Rataify | `RATAIFY_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/RatAiFy && npm run smoke:shared-supabase-local` | Passed | `rataify-evidence` | Not safe |
| WordGeni | `WORDGENI_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/WordGeni && pnpm smoke:shared-supabase-local` | Passed | `wordgeni-exports` | Not safe |
| Crevux | `CREVUX_SHARED_SUPABASE_LOCAL_ENABLED` | `cd apps/CreVux && pnpm smoke:shared-supabase-local` | Passed | `crevux-assets` | Not safe |

## Per-App Status

### Verixet

New shared tables used:

- `core.entitlements`
- `core.usage_events`
- `core.audit_logs`
- `verixet.entitlement_decisions`
- `verixet.usage_admission_logs`

Legacy tables found:

- Billing accounts, Stripe customer/subscription/session/webhook records, entitlement/plan/credit/usage tables, audit/idempotency records, local workspaces/users as applicable.

Remaining blockers:

- Runtime reads/writes still use legacy Verixet data paths.
- Production-safe runtime flag is not implemented.
- Stripe webhook replay and idempotency behavior must be verified against shared runtime.
- Production env cutover has not been performed.

### XFlow

New shared tables used:

- `core.app_connections`
- `core.audit_logs`
- `xflow.control_plane_events`
- `xflow.app_links`
- `xflow.deployment_checks`
- `xflow.workflow_runs`

Legacy tables found:

- Control-plane/app linking state, UCL/link token state, workflow/deploy validation records, app connection/orchestration records, auth/session/workspace support tables.

Remaining blockers:

- Runtime control-plane reads/writes still use legacy XFlow paths.
- Production-safe runtime flag is not implemented.
- Dependent apps are not yet reading connection state through production XFlow service boundaries.

### AudAiX

New shared tables used:

- `core.audit_logs`
- `core.usage_events`
- `audaix.audits`
- `audaix.audit_reports`
- `audaix.monitors`
- `audaix.audit_findings`
- `audaix.scan_jobs`

Legacy tables found:

- Audit, report, monitor, finding, scan job, usage/entitlement check, auth/session/workspace tables as applicable.

Remaining blockers:

- Runtime product reads/writes still use legacy AudAiX paths.
- Entitlement and usage admission must be routed through Verixet runtime APIs.
- XFlow connection checks must be routed through XFlow runtime APIs.

### Rataify

New shared tables used:

- `core.audit_logs`
- `core.usage_events`
- `rataify.sites`
- `rataify.reviews`
- `rataify.issues`
- `rataify.risk_events`
- `rataify.evidence_items`

Legacy tables found:

- Site, review, issue, risk, evidence, auth/session/workspace, entitlement/usage support tables as applicable.

Remaining blockers:

- Runtime product reads/writes still use legacy Rataify paths.
- Evidence storage migration has not been completed.
- Verixet and XFlow production authority calls are not fully wired.

### WordGeni

New shared tables used:

- `core.audit_logs`
- `core.usage_events`
- `wordgeni.documents`
- `wordgeni.document_sources`
- `wordgeni.memory_cards`
- `wordgeni.writing_sessions`
- `wordgeni.provenance_items`

Legacy tables found:

- Users, workspaces, projects, documents, sources, source chunks, memory/provenance, exports, AI tasks/logs, usage, subscriptions, Stripe webhooks, workspace API keys, telemetry/security records, and Crevux visual companion integration records.

Remaining blockers:

- Runtime product reads/writes still use legacy WordGeni paths.
- Source/export storage migration has not been completed.
- Crevux media boundary and Verixet/XFlow authority calls need production validation.

### Crevux

New shared tables used:

- `core.audit_logs`
- `core.usage_events`
- `crevux.projects`
- `crevux.assets`
- `crevux.generation_jobs`
- `crevux.exports`
- `crevux.provider_runs`
- `crevux.credit_spend_events`

Legacy tables found:

- Users, workspaces, projects, assets, generated images/assets/3D assets, generation jobs, video jobs, lipsync jobs, source enhancement jobs, asset exports, AI/metered usage events, subscription/Stripe webhook records, audit/admin/system events, and cross-app visual companion records.

Remaining blockers:

- Runtime media generation reads/writes still use legacy Crevux paths.
- Provider pipelines and storage migration carry the highest cutover risk.
- WordGeni must remain a consumer/requester, not media/job owner.

## Final State

All bridges are locally proven. Production cutover is not safe yet. Old Supabase projects are not safe to pause.

## Phase 4A Verixet Runtime Status

Verixet now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`
- `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- Entitlement decisions from the usage reporting path mirror to `verixet.entitlement_decisions` and `core.entitlements`.
- Usage admission decisions mirror to `verixet.usage_admission_logs`.
- Accepted usage events mirror to `core.usage_events`.
- Runtime audit entries write to `core.audit_logs` through the shared helper.

Still legacy:

- Verixet remains legacy-first for billing accounts, Stripe connections, checkout sessions, subscriptions, credit ledger, webhook ingestion/replay, workspace billing state, and runtime reads.
- `VERIXET_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, backfill reconciliation, webhook replay testing, and rollback testing pass.

## Phase 4B XFlow Runtime Status

XFlow now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`
- `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- XFlow legacy audit logging mirrors to `core.audit_logs` when runtime + dual-write flags are enabled.
- Runtime adapter functions are available for `core.app_connections`, `core.workspace_app_access`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, and `xflow.workflow_runs`.

Still legacy:

- XFlow remains legacy-first for app registry, app connections, UCL event ingestion/read models, deployment targets, workflow/deploy validation records, and control-plane reads.
- `XFLOW_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, app connection/control-plane read validation, backfill reconciliation, and rollback testing pass.

## Phase 4C AudAiX Runtime Status

AudAiX now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`
- `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- Legacy audit creation and repo audit creation mirror to `audaix.audits` and `audaix.scan_jobs` when runtime + dual-write flags are enabled.
- Legacy audit completion updates mirror to `audaix.audits`.
- Legacy finding writes mirror to `audaix.audit_findings`.
- Usage telemetry mirrors to `core.usage_events`; it is telemetry only and Verixet remains usage admission authority.
- Runtime adapter functions are available for `audaix.audit_reports`, `audaix.monitors`, and `core.audit_logs`.

Still legacy:

- AudAiX remains legacy-first for product reads, report generation/read models, monitor management reads, report artifact storage, entitlement enforcement, and XFlow connection/control-plane checks.
- `AUDAIX_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, report/storage validation, backfill reconciliation, and rollback testing pass.

## Phase 4D Rataify Runtime Status

Rataify now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`
- `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- Legacy site creation mirrors to `rataify.sites` when runtime + dual-write flags are enabled.
- Legacy scan creation mirrors review and risk activity to `rataify.reviews` and `rataify.risk_events`.
- Legacy issue creation mirrors to `rataify.issues`, `rataify.risk_events`, and `rataify.evidence_items`.
- Legacy storage upload reservations mirror evidence metadata to `rataify.evidence_items`.
- Usage telemetry mirrors to `core.usage_events`; it is telemetry only and Verixet remains usage admission authority.
- Runtime adapter functions are available for `core.audit_logs` and all Phase 1 Rataify-owned tables.

Still legacy:

- Rataify remains legacy-first for product reads, reports, privacy/copy/inbox scan read models, evidence storage primary paths, entitlement enforcement, XFlow connection checks, and AudAiX deep audit/report authority.
- `RATAIFY_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, evidence storage validation, backfill reconciliation, and rollback testing pass.

## Phase 4E WordGeni Runtime Status

WordGeni now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`
- `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- Legacy primary document creation mirrors to `wordgeni.documents` when runtime + dual-write flags are enabled.
- Legacy source upload initialization and note-source creation mirror to `wordgeni.document_sources`.
- Legacy voice draft sessions mirror to `wordgeni.writing_sessions`.
- Legacy voice draft memory snapshots mirror to `wordgeni.memory_cards`.
- Usage telemetry mirrors to `core.usage_events`; it is telemetry only and Verixet remains usage admission authority.
- Runtime adapter functions are available for `wordgeni.provenance_items`, `core.audit_logs`, and all Phase 1 WordGeni-owned tables.

Still legacy:

- WordGeni remains legacy-first for product reads, project/read models, source ingestion pipelines, source/export storage primary paths, provenance read models, entitlement enforcement, XFlow connection checks, and Crevux visual-companion media/job/asset ownership.
- `WORDGENI_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, source/export storage validation, Crevux boundary validation, backfill reconciliation, and rollback testing pass.

## Phase 4F Crevux Runtime Status

Crevux now has a production-safe, default-off runtime migration layer for the first shared Supabase runtime path.

Flags:

- `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`
- `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`
- `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`
- `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`

Migrated first:

- Runtime adapter functions mirror Crevux-owned projects, assets, generation jobs, exports, provider runs, and credit spend events to `crevux.*` when runtime + dual-write flags are enabled.
- Usage telemetry mirrors to `core.usage_events`; it is telemetry only and Verixet remains usage admission authority.
- Audit telemetry mirrors to `core.audit_logs`.
- Runtime smoke verifies project, asset, generation job, export, provider run, credit spend, usage, and audit paths without requiring real image/video/3D/provider API keys or Stripe calls.
- Runtime smoke supports `CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true` for local/staging no-Stripe runs; it is refused in production and still refuses effective live Stripe keys.
- Runtime metadata keeps Crevux as media generation, asset, provider-run, and export authority while preserving Verixet billing/entitlement/usage-admission and XFlow control-plane boundaries.

Still legacy:

- Crevux remains legacy-first for product reads, media pipeline writes from route handlers, provider callback state, storage primary paths, entitlement enforcement, XFlow connection checks, and WordGeni visual companion request/reference handling.
- Legacy numeric workspace/user IDs still need backfill or mapping to shared `core.*` UUIDs before live route dual-write can be safely enabled.
- `CREVUX_SHARED_SUPABASE_LOCAL_ENABLED` remains local-smoke only and is not a production cutover flag.

Production cutover remains unsafe until staging dual-write/compare validation, provider callback validation, storage migration validation, backfill reconciliation, and rollback testing pass.
