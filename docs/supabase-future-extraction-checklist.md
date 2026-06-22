# Supabase Future Extraction Checklist

Date: 2026-05-04

## Summary

The shared Supabase project is designed so each app can later split into its own Supabase project or database. The main extraction rule is simple: product data lives in the app schema, shared ecosystem data lives in `core.*`, and cross-app business logic goes through Verixet or XFlow service boundaries.

## Global Extraction Rules

- Keep app product data in app schemas.
- Keep storage buckets app-specific.
- Do not create direct cross-app joins between app schemas.
- Use `core.*` for shared workspace/profile/app-access records.
- Use Verixet APIs for entitlement, billing, usage, credit, and plan decisions.
- Use XFlow APIs for app connection, control-plane, and orchestration state.
- Document every cross-schema dependency before adding it.
- Keep browser access server-first unless explicitly approved.

## App Checklists

| App | Owned schema | Owned tables | Owned bucket | Core dependency | Verixet dependency | XFlow dependency | Avoid/remove | Split steps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | `xflow` | `runs`, `control_plane_events`, `app_links`, `deployment_checks`, `workflow_runs` | `xflow-artifacts` | `core.profiles`, `core.workspaces`, `core.workspace_members`, `core.ecosystem_apps`, `core.audit_logs` | Verixet entitlement/usage decisions by API only | Authority owner | Billing/credit authority logic | Export `xflow.*`, app connection records, and control-plane metadata; replace `core.*` refs with imported tenant map |
| Verixet | `verixet` | `billing_accounts`, `stripe_connections`, `checkout_sessions`, `entitlement_decisions`, `credit_ledger`, `usage_admission_logs` | `verixet-billing-artifacts` | Workspaces, profiles, app registry, audit logs | Authority owner | XFlow workspace/app connection context by API | Direct mutation of XFlow state | Export `verixet.*`, `core.entitlements`, `core.usage_events`, `core.billing_events`; preserve Stripe IDs and idempotency keys |
| AudAiX | `audaix` | `audits`, `audit_reports`, `monitors`, `audit_findings`, `scan_jobs` | `audaix-reports` | Workspace/app access and audit logs | Entitlement and usage admission API | Connection/control-plane API | Local billing authority tables; direct Rataify/WordGeni/Crevux table reads | Export `audaix.*` and bucket objects; map old `workspace_id` values to new project tenants |
| Rataify | `rataify` | `sites`, `reviews`, `issues`, `risk_events`, `evidence_items` | `rataify-evidence` | Workspace/app access and audit logs | Entitlement and usage admission API | Connection/control-plane API | Direct AudAiX table dependency; local billing authority logic | Export `rataify.*` and evidence bucket; replace core refs with tenant import |
| WordGeni | `wordgeni` | `documents`, `document_sources`, `memory_cards`, `writing_sessions`, `provenance_items` | `wordgeni-exports` | Profiles, workspaces, app access | Entitlement and usage admission API | Auth/handoff and connection API | Direct Crevux table reads; local entitlement authority | Export `wordgeni.*` and exports bucket; preserve source/provenance IDs |
| Crevux | `crevux` | `projects`, `assets`, `generation_jobs`, `exports`, `provider_runs`, `credit_spend_events` | `crevux-assets` | Workspace/app access and audit logs | Entitlement, credit, and usage admission API | Connection/control-plane API | Direct WordGeni table reads; local Stripe authority | Export `crevux.*` and assets bucket; preserve provider run IDs and storage paths |

## Extraction Readiness Scoring

Initial Phase 1 readiness estimate:

| App | Score | Reason |
| --- | ---: | --- |
| XFlow | 7 | Clear authority boundary, but shared connection rows need export mapping |
| Verixet | 7 | Strong authority role, but billing history and Stripe idempotency require careful export |
| AudAiX | 6 | Product data can isolate cleanly, but current bootstrap schema includes shared/billing tables |
| Rataify | 5 | Large local schema and billing/control-plane mirrors need separation |
| WordGeni | 6 | Auth migration work exists, but API/web split and Crevux integration need boundary tests |
| Crevux | 6 | Product schema is separable, but media storage and credit/billing history are broad |

## Pre-Extraction Requirements

Before splitting any app out:

- freeze writes for that app or use a dual-write/CDC plan
- export app schema data
- export app bucket objects
- export relevant `core.workspace_app_access` rows
- export relevant audit history if required
- map auth users and workspace IDs
- replace direct shared DB reads with service/API calls
- rerun workspace, app, and user isolation tests in the destination project
- verify backup and restore for the destination project
