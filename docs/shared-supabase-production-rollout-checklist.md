# Shared Supabase Production Rollout Checklist

Use this checklist for production dual-write/compare rollout only. This checklist does not authorize shared reads, fail-closed behavior, legacy DB removal, or old Supabase project pause.

## Global Preflight

| Check | Status | Evidence / Owner |
| --- | --- | --- |
| Phase 6B passed=6 failed=0 pending=0 | pending |  |
| Phase 7 validator passes | pending |  |
| Backup/export plan completed | pending |  |
| Shared Supabase backup verified | pending |  |
| Rollback rehearsal completed | pending |  |
| Monitoring/alerts active | pending |  |
| Old DB write detection ready | pending |  |
| Provider callback/idempotency proof complete | pending |  |
| Storage proof complete | pending |  |
| Stripe test billing/webhook proof complete | pending |  |
| Production envs reviewed | pending |  |
| Owner approval captured | pending |  |

Production dual-write rollout is not safe until every global preflight item is complete.

## Verixet

| Field | Value |
| --- | --- |
| Preflight command | `npm run verify:post-deploy-smoke` and Verixet access/billing authority smoke |
| Deploy/variable update step | Set Verixet production runtime dual-write variables after approval |
| Smoke command | Verixet production-safe health, entitlement, usage, and Stripe test-mode webhook smoke |
| Shared DB verification | `core.usage_events`, `core.billing_events`, `core.audit_logs`, `verixet.entitlement_decisions`, `verixet.usage_admission_logs`, `verixet.credit_ledger` |
| Legacy DB verification | Billing accounts, subscriptions, credits, usage admission, Stripe records still write/read legacy source |
| Rollback command | Turn `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`, keep `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |

## XFlow

| Field | Value |
| --- | --- |
| Preflight command | `npm run ops:release-smoke` and XFlow shared runtime smoke |
| Deploy/variable update step | Set XFlow production runtime dual-write variables after approval |
| Smoke command | XFlow production-safe auth, app connection, control-plane, deploy validation, and workflow smoke |
| Shared DB verification | `core.app_connections`, `core.workspace_app_access`, `core.audit_logs`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, `xflow.workflow_runs` |
| Legacy DB verification | Connection/control-plane legacy state still writes and reads correctly |
| Rollback command | Turn `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`, keep `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |

## AudAiX

| Field | Value |
| --- | --- |
| Preflight command | `npm run verify:production` |
| Deploy/variable update step | Set AudAiX production runtime dual-write variables after approval |
| Smoke command | AudAiX production-safe auth/MFA, audit create, report, finding, Verixet usage admission, and storage smoke |
| Shared DB verification | `core.usage_events`, `core.audit_logs`, `audaix.audits`, `audaix.audit_reports`, `audaix.monitors`, `audaix.audit_findings`, `audaix.scan_jobs` |
| Legacy DB verification | Legacy audit/report/monitor paths still work |
| Rollback command | Turn `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`, keep `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |

## Rataify

| Field | Value |
| --- | --- |
| Preflight command | `npm run verify:production-release` |
| Deploy/variable update step | Set Rataify production runtime dual-write variables after approval |
| Smoke command | Rataify production-safe site, review/scan, issue, risk, evidence, and storage smoke |
| Shared DB verification | `core.usage_events`, `core.audit_logs`, `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.risk_events`, `rataify.evidence_items` |
| Legacy DB verification | Legacy site/review/issue/risk/evidence paths still work |
| Rollback command | Turn `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`, keep `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |

## WordGeni

| Field | Value |
| --- | --- |
| Preflight command | `pnpm live:verify` and authenticated API smoke |
| Deploy/variable update step | Set WordGeni production runtime dual-write variables after approval |
| Smoke command | WordGeni production-safe document, source upload, worker/provenance, memory, billing gate, and storage smoke |
| Shared DB verification | `core.usage_events`, `core.audit_logs`, `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.memory_cards`, `wordgeni.writing_sessions`, `wordgeni.provenance_items` |
| Legacy DB verification | Legacy document/source/memory/provenance paths still work |
| Rollback command | Turn `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`, keep `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |

## Crevux

| Field | Value |
| --- | --- |
| Preflight command | `pnpm smoke:authenticated-beta` and Crevux shared runtime smoke |
| Deploy/variable update step | Set Crevux production runtime dual-write variables after approval |
| Smoke command | Crevux production-safe project, asset, mock provider generation, callback/idempotency, export, credit spend, and storage smoke |
| Shared DB verification | `core.usage_events`, `core.audit_logs`, `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, `crevux.credit_spend_events` |
| Legacy DB verification | Legacy project/asset/job/export/provider-run paths still work |
| Rollback command | Turn `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`, `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`, keep `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Go/no-go decision | pending |
| Observation notes |  |
