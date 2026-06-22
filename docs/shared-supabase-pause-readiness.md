# Shared Supabase Old Project Pause Readiness

Default decision: **old Supabase projects are not safe to pause**.

Production cutover remains unsafe until staged dual-write/compare, provider/dashboard proof, storage migration, backfill/reconciliation, rollback rehearsal, monitoring, and the observation window are complete.

Reason: all six local bridges are proven, but production runtime migration, production validation, rollback testing, and the observation window have not completed.

## Pause Readiness Matrix

| App | Safe to pause old Supabase project? | Reason |
| --- | --- | --- |
| Verixet | No | Phase 4A only adds default-off runtime dual-write/compare scaffolding; billing/Stripe/webhook cutover and observation are not complete. |
| XFlow | No | Phase 4B only adds default-off runtime dual-write/compare scaffolding; control-plane/app connection cutover and observation are not complete. |
| AudAiX | No | Phase 4C only adds default-off runtime dual-write/compare scaffolding; audit/report/monitor read cutover, report storage cutover, and observation are not complete. |
| Rataify | No | Phase 4D only adds default-off runtime dual-write/compare scaffolding; product read cutover, evidence storage cutover, and observation are not complete. |
| WordGeni | No | Phase 4E only adds default-off runtime dual-write/compare scaffolding; document/source/memory/provenance read cutover, export/source storage cutover, Crevux boundary validation, and observation are not complete. |
| Crevux | No | Phase 4F only adds default-off runtime dual-write/compare scaffolding; media/assets/jobs/provider pipelines, storage migration, and observation are not complete. |

## Required Checks Before Pause

For every old project:

- Production runtime has used shared Supabase successfully.
- Production-like smoke passed after deployment.
- No writes observed to old DB during the observation window.
- All needed old data was exported.
- Backfill reconciliation passed.
- Rollback was tested.
- Monitoring shows no auth, RLS, storage, webhook, or provider errors.
- Legal/compliance/audit retention requirements are met.
- Owner manually confirms the old project is no longer needed for recovery.

## Required Export/Backup

Before pausing:

- Full database dump.
- Schema dump.
- Storage object inventory.
- Storage object export for retained buckets.
- Auth user export if applicable.
- Edge function and config inventory if applicable.
- Webhook/idempotency record export for Verixet and Crevux.
- Final row count report by schema/table.

## App-Specific Pause Gates

### Verixet

Confirm:

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED` has passed staging and production observation.
- `VERIXET_SHARED_SUPABASE_READ_MODE=shared` has been validated or dual-compare has no material mismatches.
- Stripe webhooks are delivered only to the new runtime.
- Entitlement decisions are correct.
- Credit ledger balances reconcile.
- No duplicate billing events occurred.

### XFlow

Confirm:

- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED` has passed staging and production observation.
- `XFLOW_SHARED_SUPABASE_READ_MODE=shared` has been validated or dual-compare has no material mismatches.
- Product apps read XFlow connection state from the new runtime.
- App links and control-plane events are accurate.
- No legacy connection writes occur.

### AudAiX

Confirm:

- Audits, reports, monitors, findings, and scan jobs are fully shared-runtime.
- Report storage is accessible from `audaix-reports`.
- Phase 4C dual-write/compare ran cleanly in staging and production observation.
- No legacy AudAiX audit/report/finding writes remain after runtime cutover.

### Rataify

Confirm:

- Sites, reviews, issues, risk events, and evidence items are fully shared-runtime.
- Evidence storage is accessible from `rataify-evidence`.
- Phase 4D dual-write/compare ran cleanly in staging and production observation.
- No legacy Rataify site/review/issue/risk/evidence writes remain after runtime cutover.

### WordGeni

Confirm:

- Documents, sources, memory cards, writing sessions, and provenance items are fully shared-runtime.
- Exports are accessible from `wordgeni-exports`.
- Crevux media references remain boundary-based.
- Phase 4E dual-write/compare ran cleanly in staging and production observation.
- No legacy WordGeni document/source/memory/session/provenance writes remain after runtime cutover.
- WordGeni never became owner of Crevux media assets, generation jobs, provider runs, or exports.

### Crevux

Confirm:

- Projects, assets, generation jobs, exports, provider runs, and credit spend events are fully shared-runtime.
- Provider callbacks target the new runtime.
- In-flight jobs are reconciled.
- Assets are accessible from `crevux-assets`.
- Phase 4F dual-write/compare ran cleanly in staging and production observation.
- No legacy Crevux project/asset/job/export/provider/credit writes remain after runtime cutover.
- WordGeni remains a requester/reference boundary and never becomes owner of Crevux media assets, generation jobs, provider runs, or exports.
- Legacy numeric workspace/user IDs have been mapped to shared `core.*` UUIDs before live route dual-write is enabled.

## Observation Window

Recommended minimum:

- Verixet: 14 days because billing and webhooks are high risk.
- XFlow: 7 days because control-plane state affects every app.
- AudAiX/Rataify/WordGeni: 7 days after runtime migration.
- Crevux: 14 days because storage/provider jobs have higher operational risk.

Do not pause old projects until the observation window is clean.
