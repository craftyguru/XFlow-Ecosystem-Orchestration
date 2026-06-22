# Shared Supabase Phase 5 Production Readiness Hardening

Phase 5 is the final hardening layer before any production environment switch. It is a planning and validation gate only. It does not deploy, does not change production env vars, does not remove legacy database paths, does not switch production reads to shared, and does not make any old Supabase project safe to pause.

Explicit verdict: **production cutover remains unsafe until every checklist in this document passes in staging and then in production validation.**

## Go/No-Go Checklist

- [ ] Phase 1 validator passes.
- [ ] Phase 2 validator passes.
- [ ] Phase 4G staging validator passes.
- [ ] Phase 5 readiness validator passes.
- [ ] All six local smokes pass.
- [ ] All six runtime smokes pass in staging-safe mode.
- [ ] Runtime flags are default-off in every app `.env.example`.
- [ ] No service-role key appears in public env prefixes or browser/client bundles.
- [ ] No app uses `*_SHARED_SUPABASE_LOCAL_ENABLED` as a production runtime flag.
- [ ] No app has production read mode set to `shared`.
- [ ] Backfill dry run and reconciliation reports are complete.
- [ ] Legacy numeric user/workspace IDs are mapped to shared `core.*` UUIDs.
- [ ] Storage migration inventory and restore test are complete.
- [ ] Provider callback and idempotency proof is complete.
- [ ] Rollback rehearsal is complete.
- [ ] Monitoring and alerts are active.
- [ ] Observation window passes with no unexpected old DB writes.

Default decision: **no-go** until all items pass.

## Per-App Staging Validation Checklist

### Verixet

- Verify entitlement decisions mirror to `verixet.entitlement_decisions` and `core.entitlements`.
- Verify usage admission logs mirror to `verixet.usage_admission_logs`.
- Verify usage events mirror to `core.usage_events`.
- Verify Stripe test-mode webhook idempotency and replay behavior.
- Verify no other app directly writes billing, entitlement, credit, plan, or usage-admission authority rows.

### XFlow

- Verify control-plane/app connection runtime adapters preserve legacy behavior by default.
- Verify shared writes for `core.app_connections`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, and `xflow.workflow_runs` in staging.
- Verify product apps do not directly mutate XFlow-owned state.
- Verify UCL/link token and deploy validation idempotency.

### AudAiX

- Verify audit, report, monitor, finding, and scan job dual-write paths.
- Verify usage events are telemetry only and Verixet remains usage-admission authority.
- Verify report artifacts and `audaix-reports` storage behavior.
- Verify XFlow app connection checks stay behind XFlow boundaries.

### Rataify

- Verify site, review, issue, risk event, and evidence item dual-write paths.
- Verify `rataify-evidence` storage inventory, upload, read, and cleanup.
- Verify Rataify does not become AudAiX deep audit/report authority.
- Verify Verixet and XFlow authority calls are service/API-boundary based.

### WordGeni

- Verify document, source, memory card, writing session, and provenance dual-write paths.
- Verify `wordgeni-exports` storage behavior.
- Verify WordGeni does not become Crevux media generation, asset, job, provider-run, or export authority.
- Verify Crevux references remain request/reference boundaries.

### Crevux

- Verify project, asset, generation job, export, provider run, credit spend, usage, and audit dual-write paths.
- Verify `crevux-assets` storage inventory, upload, read, signed URL, and cleanup.
- Verify provider callback idempotency and replay handling.
- Verify WordGeni remains a requester/reference boundary.
- Verify no real provider keys are required for smoke tests, and provider proof uses staging/test providers only.

## Required Env Vars Per Deployed Service

Shared Supabase server-side values:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

Browser public vars by framework:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Production-safe runtime flags:

```env
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
VERIXET_SHARED_SUPABASE_READ_MODE=legacy
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false

XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
XFLOW_SHARED_SUPABASE_READ_MODE=legacy
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false

AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false
AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
AUDAIX_SHARED_SUPABASE_READ_MODE=legacy
AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false

RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false
RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
RATAIFY_SHARED_SUPABASE_READ_MODE=legacy
RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false

WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false
WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
WORDGENI_SHARED_SUPABASE_READ_MODE=legacy
WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false

CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
CREVUX_SHARED_SUPABASE_READ_MODE=legacy
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Service-role keys and database URLs are server-only. Never place them in `NEXT_PUBLIC_*`, `VITE_*`, mobile public config, static config, or browser/client bundles.

## Provider Callback Validation Plan

- Use staging/test provider credentials only.
- Register staging callback URLs separately from production callbacks.
- Capture provider external IDs, webhook IDs, retry count, and idempotency keys.
- Submit one controlled image job, video job, 3D job, lipsync job, and export job where provider support exists.
- Verify callback rows are written once in legacy and shared dual-write paths.
- Verify duplicate callback replay is ignored or reconciled idempotently.
- Verify failed provider callbacks do not create shared-only orphan rows.
- Verify rollback does not replay all callbacks blindly.

## Storage Migration Plan

- Inventory old storage buckets and object counts per app.
- Map objects to app-specific buckets:
  - `xflow-artifacts`
  - `verixet-billing-artifacts`
  - `audaix-reports`
  - `rataify-evidence`
  - `wordgeni-exports`
  - `crevux-assets`
- Copy a representative staging sample first.
- Verify object metadata, MIME type, size, checksums where available, and access policies.
- Verify signed URL flows for private objects.
- Verify app-specific storage references are written to the correct app schema.
- Run restore/readback tests before moving production traffic.

## Legacy ID Mapping Plan

- Create a mapping inventory for legacy numeric IDs to shared UUIDs:
  - users to `core.profiles`
  - workspaces to `core.workspaces`
  - workspace memberships to `core.workspace_members`
  - app access to `core.workspace_app_access`
- Preserve original legacy IDs in metadata during backfill.
- Use deterministic mapping tables or durable metadata keys so repeated backfills are idempotent.
- Validate every app-owned row has a shared `workspace_id`.
- Block live route dual-write for rows that cannot be mapped safely.

## Backfill/Reconciliation Plan

- Dry-run row counts per legacy table and shared table.
- Exclude local/runtime smoke rows where `metadata.smokeTest=true` or `metadata->>'smokeTestId'` exists.
- Backfill core identity/workspace/app-access first.
- Backfill Verixet authority data second.
- Backfill XFlow authority data third.
- Backfill product apps in order: AudAiX, Rataify, WordGeni, Crevux.
- Compare row counts, idempotency keys, timestamps, workspace IDs, app slugs, and storage paths.
- Produce a reconciliation report before any production env switch.

## Rollback Rehearsal Plan

- Rehearse rollback in staging before production.
- Enable runtime + dual-write flags for one app at a time.
- Create one representative record per app-owned table.
- Confirm legacy remains the returned read source.
- Disable runtime and dual-write flags.
- Confirm legacy app still works.
- Confirm shared-only rows are detectable and marked.
- Confirm provider callbacks and webhooks are not replayed blindly.

## Monitoring/Alerting Plan

- Alert on auth/session errors.
- Alert on RLS denials that exceed expected baseline.
- Alert on service-role usage from unexpected runtime contexts.
- Alert on app schema write failures.
- Alert on dual-write mismatches.
- Alert on provider callback failures and duplicate callback attempts.
- Alert on Stripe webhook failures and duplicate billing events.
- Alert on storage read/write failures and missing objects.
- Track old DB writes after cutover start.
- Track shared DB write failures separately from legacy success.

## Observation Window Plan

- Verixet: 14 days because billing and Stripe webhooks are high risk.
- XFlow: 7 days because control-plane state affects every app.
- AudAiX: 7 days after runtime cutover.
- Rataify: 7 days after runtime cutover.
- WordGeni: 7 days after runtime cutover.
- Crevux: 14 days because media assets, provider jobs, callbacks, and storage have higher operational risk.

The observation window starts only after runtime migration, production-like smoke, monitoring, rollback rehearsal, and backfill reconciliation all pass.

## Old Supabase Pause Criteria

Old Supabase projects are not safe to pause until:

- Production runtime has used shared Supabase successfully for the full observation window.
- No writes are observed to the old DB during the observation window.
- Full old DB export and storage export are complete and verified.
- Auth/config/webhook/provider inventories are exported.
- Rollback no longer depends on the old project staying online.
- App owner manually approves pause after reviewing reconciliation and monitoring.

Default status: **old Supabase projects are unsafe to pause**.

## Final Verdict

Phase 5 can make the project production-readiness auditable, but it does not make production cutover safe by itself.

Production cutover remains unsafe until provider/dashboard proof, real callback/idempotency validation, storage migration, legacy ID mapping, backfill reconciliation, rollback rehearsal, monitoring, and observation windows are complete.
