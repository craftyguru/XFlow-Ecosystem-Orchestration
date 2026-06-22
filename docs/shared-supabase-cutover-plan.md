# Shared Supabase Production Cutover Plan

This plan moves the ecosystem from local-only bridge writes to production runtime reads/writes on the shared Supabase project. It does not change production envs, deploy, pause old projects, or remove legacy code by itself.

## Current Proven Status

All local bridges passed:

| App | Runtime authority | Shared schema | Local bridge status |
| --- | --- | --- | --- |
| Verixet | Billing, entitlements, usage admission, credits, plans, Stripe | `verixet` + `core` | Passed |
| XFlow | Control-plane, app linking, orchestration, connection state | `xflow` + `core` | Passed |
| AudAiX | Audit/report/monitoring product data | `audaix` + `core` | Passed |
| Rataify | Site/review/risk/evidence product data | `rataify` + `core` | Passed |
| WordGeni | Writing/document/source/memory/provenance product data | `wordgeni` + `core` | Passed |
| Crevux | Media/project/asset/job/export/provider-run data | `crevux` + `core` | Passed |

Production cutover remains unsafe for every app. Local bridges prove schema/API access only; they do not prove runtime correctness.

Old Supabase projects are unsafe to pause until runtime migration, production validation, backup/export, rollback rehearsal, and observation-window checks are complete.

## Cutover Order

Use this order:

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

Reasoning:

- Verixet must move first because it is the billing, entitlement, usage admission, credit, plan, and Stripe authority.
- XFlow must move second because it is the app connection, control-plane, app-linking, and orchestration authority.
- Product apps should consume Verixet and XFlow authority boundaries instead of duplicating entitlement or connection logic.
- Crevux should move last because media assets, storage, provider jobs, exports, and provider callbacks have the highest operational and rollback risk.

## Runtime Migration Strategy

### Shared Rules

- Replace local-only bridge flags with production-safe runtime flags.
- Keep service-role usage server-only.
- Keep browser Supabase access narrow; prefer server routes/actions for app-owned schemas.
- Use shared helpers from `@xflow-ecosystem/supabase` for auth, workspace, app access, usage, entitlement, and audit writes.
- Do not expose app schemas directly to browser clients unless documented with exact RLS and operation tests.
- Keep legacy reads/writes available until rollback is tested.

Recommended runtime flags:

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED`
- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED`
- `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED`
- `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED`
- `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED`
- `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED`

The existing `*_SHARED_SUPABASE_LOCAL_ENABLED` flags are local smoke/bridge flags. Do not use them as production cutover flags unless renamed and reviewed.

### Verixet

Move:

- Auth/session identity reads to `core.profiles`, `core.workspaces`, `core.workspace_members` where applicable.
- Workspace app access checks to `core.workspace_app_access`.
- Entitlement state and decisions to `core.entitlements` and `verixet.entitlement_decisions`.
- Usage admission logs to `verixet.usage_admission_logs`.
- Usage events to `core.usage_events`.
- Billing/audit events to `core.billing_events` and `core.audit_logs`.
- Stripe customer/subscription/session/webhook authority to Verixet-owned shared tables or service APIs.

Phase 4A status:

- Runtime adapter added behind `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`.
- `dual_compare` reads must return the legacy result and log mismatches without breaking users.
- Shared dual-write failures are non-blocking while `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`; set true only for controlled staging tests.
- Initial migrated runtime path: usage admission/reporting now mirrors entitlement decisions, admission logs, usage events, and audit logs when runtime + dual-write flags are enabled.
- Legacy Verixet database behavior remains the source of truth until staging validates dual-write/compare mode.

Preconditions:

- Stripe product/price mappings are verified.
- Idempotency keys are preserved.
- Webhook replay handling is tested.
- Other apps call Verixet APIs instead of direct SQL for entitlement decisions.

Runtime flags:

- `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED`
- `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED`
- `VERIXET_SHARED_SUPABASE_READ_MODE`
- `VERIXET_SHARED_SUPABASE_FAIL_CLOSED`

Production-like smoke:

- `cd apps/Verixet && npm run smoke:shared-supabase-runtime`
- Requires runtime + dual-write flags set true in the current local/staging shell.
- Refuses obvious production/live Stripe mode.
- Writes marked runtime smoke rows and cleans them by default.

### XFlow

Move:

- App registry and access reads to `core.ecosystem_apps` and `core.workspace_app_access`.
- App connection state to `core.app_connections`.
- Control-plane and link state to `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, and `xflow.workflow_runs`.
- Orchestration audit writes to `core.audit_logs`.

Phase 4B status:

- Runtime adapter added behind `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`.
- `dual_compare` reads must return the legacy result and log mismatches without breaking users.
- Shared dual-write failures are non-blocking while `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`; set true only for controlled staging tests.
- Initial migrated runtime path: XFlow audit logging now mirrors to `core.audit_logs` when runtime + dual-write flags are enabled.
- Runtime adapters are available for `core.app_connections`, `core.workspace_app_access`, `xflow.control_plane_events`, `xflow.app_links`, `xflow.deployment_checks`, and `xflow.workflow_runs`.
- Legacy XFlow database behavior remains the source of truth until staging validates dual-write/compare mode.

Preconditions:

- Verixet shared runtime is live or read-compatible.
- XFlow APIs expose stable connection/control-plane decisions.
- Product apps do not mutate XFlow-owned connection state directly.

Runtime flags:

- `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED`
- `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED`
- `XFLOW_SHARED_SUPABASE_READ_MODE`
- `XFLOW_SHARED_SUPABASE_FAIL_CLOSED`

Production-like smoke:

- `cd apps/XFlow && npm run smoke:shared-supabase-runtime`
- Requires runtime + dual-write flags set true in the current local/staging shell.
- Refuses obvious production mode.
- Writes marked runtime smoke rows and cleans them by default.

### AudAiX

Move:

- Workspace/app access checks to shared helpers.
- Audit/report/monitor product writes to `audaix.*`.
- Usage telemetry to `core.usage_events`.
- Audit logging to `core.audit_logs`.
- Entitlement checks to Verixet APIs.
- Connection/control-plane checks to XFlow APIs.

Phase 4C status:

- Runtime adapter added behind `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`.
- Fail-closed remains disabled for the dual-write phase with `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- First runtime path mirrors legacy audit creation/completion, repo audit creation, finding writes, scan-job telemetry, usage telemetry, and audit logs into `audaix.*`, `core.usage_events`, and `core.audit_logs`.
- AudAiX does not become billing, entitlement, usage admission, app connection, or control-plane authority.
- Runtime smoke command: `cd apps/AudAix && npm run smoke:shared-supabase-runtime`.
- Runtime smoke writes marked rows and cleans them by default.

### Rataify

Move:

- Workspace/app access checks to shared helpers.
- Site/review/issue/risk/evidence writes to `rataify.*`.
- Evidence storage to `rataify-evidence`.
- Usage telemetry to `core.usage_events`.
- Audit logging to `core.audit_logs`.
- Entitlement and connection checks through Verixet/XFlow APIs.

Phase 4D status:

- Runtime adapter added behind `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`.
- Fail-closed remains disabled for the dual-write phase with `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`.
- First runtime path mirrors legacy site creation, scan/review activity, issue writes, risk events, evidence/storage reservations, usage telemetry, and audit logs into `rataify.*`, `core.usage_events`, and `core.audit_logs`.
- Rataify does not become billing, entitlement, usage admission, app connection, control-plane, or AudAiX audit/report authority.
- Runtime smoke command: `cd apps/RatAiFy && npm run smoke:shared-supabase-runtime`.
- Runtime smoke writes marked rows and cleans them by default.

### WordGeni

Move:

- Workspace/app access checks to shared helpers.
- Document/source/memory/session/provenance writes to `wordgeni.*`.
- Export storage to `wordgeni-exports`.
- Usage telemetry to `core.usage_events`.
- Audit logging to `core.audit_logs`.
- Entitlement and XFlow handoff checks through Verixet/XFlow APIs.
- Crevux integration remains an API/service boundary; WordGeni may request/reference media but does not own Crevux assets/jobs.

Phase 4E status:

- Runtime adapter added behind `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`.
- Fail-closed remains disabled for the dual-write phase with `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`.
- First runtime path mirrors primary document creation, source writes, voice writing sessions, voice memory snapshots, usage telemetry, and audit logs into `wordgeni.*`, `core.usage_events`, and `core.audit_logs`.
- WordGeni does not become billing, entitlement, usage admission, app connection, control-plane, media generation, asset, or provider-job authority.
- Runtime smoke command: `cd apps/WordGeni && pnpm smoke:shared-supabase-runtime`.
- Runtime smoke writes marked rows and cleans them by default.

### Crevux

Move:

- Workspace/app access checks to shared helpers.
- Project/asset/job/export/provider-run writes to `crevux.*`.
- Asset storage to `crevux-assets`.
- Credit spend telemetry to `crevux.credit_spend_events`.
- Usage telemetry to `core.usage_events`.
- Audit logging to `core.audit_logs`.
- Billing and usage admission through Verixet APIs.
- Connection/control-plane checks through XFlow APIs.

Provider jobs require special handling:

- Preserve provider external IDs.
- Preserve idempotency/retry state.
- Do not migrate in-flight jobs without a freeze window or dual-read strategy.
- Verify callback URLs before cutover.

Phase 4F status:

- Runtime adapter added behind `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false` by default.
- Dual-write remains disabled by default with `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Read source remains legacy by default with `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`.
- Fail-closed remains disabled for the dual-write phase with `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Runtime adapter mirrors Crevux-owned projects, assets, generation jobs, exports, provider runs, credit spend events, usage telemetry, and audit logs into `crevux.*`, `core.usage_events`, and `core.audit_logs` when runtime + dual-write flags are enabled.
- Crevux does not become billing, entitlement, usage admission, app connection, or control-plane authority.
- WordGeni may request/reference Crevux outputs through integration boundaries, but Crevux remains media generation, asset, provider job, and export authority.
- Runtime smoke command: `cd apps/CreVux && pnpm smoke:shared-supabase-runtime`.
- Runtime smoke writes marked rows, requires no real provider API keys, and cleans rows by default.
- Runtime smoke does not call Stripe. For local/staging environments that should not load Stripe at all, set `CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true`; this is local-only, refused in production, and still refuses effective live Stripe keys.
- Full route-level production enablement still requires workspace/user UUID mapping from legacy Crevux IDs to `core.*`.

## Production Env Plan

Every deployed server that uses shared Supabase eventually needs:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

Browser/public vars by framework:

- Next.js apps: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vite apps: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Service-role keys and database URLs are server-only. Do not put service-role keys in `NEXT_PUBLIC_*`, `VITE_*`, client bundles, mobile bundles, or static config.

Production envs still need to be set per deployed app/service. A shared local env file does not imply one shared production variable store.

## Production Smoke Plan

For each app:

Pre-deploy:

- Confirm migration files applied in production shared Supabase.
- Confirm custom schema is exposed only as intended.
- Confirm API grants are present.
- Confirm RLS policies are present.
- Confirm storage bucket exists.
- Confirm old runtime envs are backed up.
- Confirm rollback env set is ready.

Post-deploy:

- Verify auth/session resolution.
- Verify workspace membership and app access.
- Verify one product read and one product write.
- Verify audit log write.
- Verify usage event write.
- Verify storage write/read if the app uses storage.
- Verify Verixet entitlement call where applicable.
- Verify XFlow app connection/control-plane call where applicable.
- Verify no service-role key appears in client bundles.

Rollback triggers:

- Auth/session failures above expected threshold.
- Cross-workspace or cross-app data exposure.
- Entitlement false positives/false negatives.
- Stripe webhook failures or duplicate billing writes.
- Provider callback failures.
- Storage object loss or inaccessible exports/assets.
- Any service-role leakage finding.

## Go/No-Go Checklist

- [ ] All local smokes pass.
- [ ] All production-like smokes pass.
- [ ] Runtime migration complete for the target app.
- [ ] Production envs verified without printing secrets.
- [ ] Backups/export completed.
- [ ] Rollback tested.
- [ ] Monitoring and alerting enabled.
- [ ] No old DB writes observed during observation window.
- [ ] Old project exported.
- [ ] Old project paused only after observation window.

Default go/no-go: **No-go for production cutover until the target app completes runtime migration and production-like smokes.**
