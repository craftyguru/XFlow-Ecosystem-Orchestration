# Shared Supabase Phase 6 Staging Execution

Phase 6 is the controlled staging execution plan for shared Supabase runtime dual-write/compare. It is staging-only. It does not deploy to production, does not change production env vars, does not remove legacy DB paths, does not switch production reads to shared, and does not make old Supabase projects safe to pause.

Explicit verdict: **production cutover remains unsafe until Phase 6 passes with real staging app flows, data verification, rollback rehearsal, and observation.**

## Staging Env Matrix

Use these flags only in a staging-like environment:

| App | Runtime enabled | Dual-write | Read mode | Fail closed |
| --- | --- | --- | --- | --- |
| Verixet | `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare` | `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` |
| XFlow | `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare` | `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` |
| AudAiX | `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare` | `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Rataify | `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare` | `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` |
| WordGeni | `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare` | `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` |
| Crevux | `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true` | `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true` | `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare` | `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false` |

Shared server-only env vars per deployed staging service:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

Do not use live Stripe keys or real provider keys unless a specific staging provider test explicitly requires test-mode credentials. Do not use `READ_MODE=shared` in Phase 6.

## Staging Run Order

1. Verixet
2. XFlow
3. AudAiX
4. Rataify
5. WordGeni
6. Crevux

Reason: Verixet is billing/entitlement/usage authority, XFlow is connection/control-plane authority, and product apps should validate against those boundaries before media/provider-heavy Crevux.

## Staging Smoke Commands

Run smokes in staging-safe mode only:

```bash
cd apps/Verixet && npm run smoke:shared-supabase-runtime
cd apps/XFlow && npm run smoke:shared-supabase-runtime
cd apps/AudAix && npm run smoke:shared-supabase-runtime
cd apps/RatAiFy && npm run smoke:shared-supabase-runtime
cd apps/WordGeni && pnpm smoke:shared-supabase-runtime
cd apps/CreVux && pnpm smoke:shared-supabase-runtime
```

Also run local bridge smokes if the staging host supports them:

```bash
cd apps/Verixet && npm run smoke:shared-supabase-local
cd apps/XFlow && npm run smoke:shared-supabase-local
cd apps/AudAix && npm run smoke:shared-supabase-local
cd apps/RatAiFy && npm run smoke:shared-supabase-local
cd apps/WordGeni && pnpm smoke:shared-supabase-local
cd apps/CreVux && pnpm smoke:shared-supabase-local
```

## Manual App-Flow Test Checklist

### Verixet

- [ ] Signup or billing handoff, only if safe with test Stripe mode.
- [ ] Entitlement decision is written and legacy response remains correct.
- [ ] Usage admission is accepted/denied as expected.
- [ ] Credit/usage event is recorded.
- [ ] Audit log is recorded in `core.audit_logs`.
- [ ] No other app directly writes Verixet billing/entitlement authority rows.

### XFlow

- [ ] App connection is created/updated.
- [ ] Control-plane event is recorded.
- [ ] UCL/link event is recorded if available.
- [ ] Deploy validation event is recorded.
- [ ] Workflow/audit log is recorded.
- [ ] Product apps do not directly mutate XFlow-owned connection/control-plane state.

### AudAiX

- [ ] Audit is created.
- [ ] Audit is completed.
- [ ] Finding is written.
- [ ] Usage event is recorded as telemetry.
- [ ] Report artifact reference is written without exposing app schema to browser clients.
- [ ] Verixet remains entitlement/usage-admission authority.

### Rataify

- [ ] Site is created.
- [ ] Scan/review is created.
- [ ] Issue is created.
- [ ] Risk event is created.
- [ ] Evidence metadata/storage reference is written.
- [ ] AudAiX remains deep audit/report authority where applicable.

### WordGeni

- [ ] Document is created.
- [ ] Source is created.
- [ ] Writing session is created.
- [ ] Memory/provenance event is created.
- [ ] Usage event is recorded as telemetry.
- [ ] Crevux media references remain request/reference boundaries.

### Crevux

- [ ] Project is created.
- [ ] Asset metadata is created.
- [ ] Generation job is created using a safe/mock provider.
- [ ] Provider run metadata is created.
- [ ] Export metadata is created.
- [ ] Credit spend event is recorded as telemetry.
- [ ] Provider callbacks/idempotency are verified in safe mode.
- [ ] WordGeni does not own Crevux media assets/jobs/provider runs/exports.

## Shared Supabase Data Verification Checklist

- [ ] `core.profiles`, `core.workspaces`, and `core.workspace_members` contain mapped staging identities.
- [ ] `core.workspace_app_access` has the expected app access rows.
- [ ] `core.app_connections` contains only XFlow-owned connection state.
- [ ] `core.entitlements` reflects Verixet authority.
- [ ] `core.usage_events` contains telemetry with correct `app_slug`, workspace, feature key, and idempotency key.
- [ ] `core.billing_events` contains only Verixet-owned billing events where applicable.
- [ ] `core.audit_logs` contains marked app actions.
- [ ] Each app schema contains only that app's product-owned rows.
- [ ] No app has cross-app direct SQL dependencies outside documented service/API boundaries.
- [ ] Storage references point to app-specific buckets.
- [ ] Smoke rows are clearly marked and cleaned unless dashboard inspection was intentionally enabled.

## Rollback Steps Per App

### Verixet

- Set `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `VERIXET_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Stop/reconcile Stripe webhook replay before retrying events.

### XFlow

- Set `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `XFLOW_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Preserve shared control-plane rows for audit and compare against legacy.

### AudAiX

- Set `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `AUDAIX_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Reconcile audit/report rows before deleting any shared-only data.

### Rataify

- Set `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `RATAIFY_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Preserve evidence rows/storage paths for reconciliation.

### WordGeni

- Set `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `WORDGENI_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Do not mutate Crevux-owned media/job/asset rows from WordGeni rollback tooling.

### Crevux

- Set `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`.
- Keep `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Reconcile provider external IDs and callback ids before replaying jobs.

## Failure Conditions

- Any app returns shared data to users while `READ_MODE=legacy` or `dual_compare` is expected.
- Any app is configured with `READ_MODE=shared`.
- Any app uses live Stripe keys for staging smoke.
- Any service-role key appears in browser/client output.
- Any cross-workspace or cross-app access is observed.
- Any app writes another app's authority tables directly.
- Provider callbacks create duplicate or orphan rows.
- Storage objects are missing, unreadable, or written to the wrong bucket.
- Dual-compare mismatches are unexplained.
- Rollback cannot restore legacy behavior.

## Observation Window Requirements

- Verixet: 14 staging days or an equivalent event-volume test because billing/webhooks are high risk.
- XFlow: 7 staging days or equivalent app-connection/control-plane event volume.
- AudAiX: 7 staging days or representative audit/report volume.
- Rataify: 7 staging days or representative site/review/evidence volume.
- WordGeni: 7 staging days or representative document/source/provenance volume.
- Crevux: 14 staging days or representative provider/storage/job volume.

Observation starts after smokes, manual flows, data verification, and rollback rehearsal pass.

## Final Verdict

Phase 6 is ready to execute manually only after `scripts/validate-supabase-phase6-staging.mjs` passes. Even after Phase 6 validation, **production cutover remains unsafe until Phase 6 passes with real staging flows and the observation window is clean**.

Old Supabase projects remain unsafe to pause until production migration, backups, no-write observation, and rollback retirement criteria are complete.
