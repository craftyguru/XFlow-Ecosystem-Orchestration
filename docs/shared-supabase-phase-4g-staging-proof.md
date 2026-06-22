# Shared Supabase Phase 4G Crevux Staging Proof

Phase 4G is a staging-oriented proof for Crevux shared Supabase runtime dual-write/compare posture. It does not approve production cutover, does not deploy, and does not make the old Crevux Supabase/database safe to pause.

## What Phase 4G Proves

- Crevux runtime flags are explicit and production-safe.
- The shared runtime adapter can write marked runtime smoke rows to `crevux.*`, `core.usage_events`, and `core.audit_logs`.
- The runtime smoke can run without real provider API keys.
- The runtime smoke can run in local/staging no-Stripe mode without loading app-local live Stripe keys.
- The runtime adapter keeps Crevux as media generation, asset, provider-run, export, and credit-spend telemetry authority.
- Verixet remains billing, entitlement, usage-admission, plan, and credit authority.
- XFlow remains app connection and control-plane authority.
- WordGeni remains a requester/reference boundary and does not own Crevux media assets, provider jobs, or exports.
- Shared rows are marked as smoke/staging proof rows and cleaned by default.

## What Phase 4G Does Not Prove

- It does not prove production traffic correctness.
- It does not prove live provider callback behavior.
- It does not prove storage migration completeness for real media assets.
- It does not prove legacy numeric workspace/user IDs are mapped to shared `core.*` UUIDs.
- It does not prove Stripe, billing, entitlement, or usage admission production behavior.
- It does not prove browser/client access to app-owned schemas.
- It does not make production cutover safe.
- It does not make the old Crevux Supabase/database safe to pause.

## Required Staging Env Vars

Shared Supabase server-side values:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

Crevux runtime staging flags:

```env
CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
CREVUX_SHARED_SUPABASE_READ_MODE=legacy
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

No-Stripe runtime smoke mode, only if the smoke environment should not load Stripe:

```env
NODE_ENV=development
CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true
```

Dashboard inspection mode, optional:

```env
CREVUX_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Compare-mode envs, only when `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare`:

```env
CREVUX_LEGACY_SUPABASE_URL=
CREVUX_LEGACY_DATABASE_URL=
```

The compare-mode env names are staging proof inputs only. Do not expose legacy DB URLs to browser/client code.

## Forbidden Live/Smoke Combinations

- Do not run runtime smoke with `STRIPE_SECRET_KEY=sk_live_...`.
- Do not run runtime smoke with a live Stripe webhook secret.
- Do not run no-Stripe smoke mode when `NODE_ENV=production`.
- Do not run no-Stripe smoke mode unless `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`.
- Do not set any production cutover flag to true for Phase 4G.
- Do not run with `CREVUX_SHARED_SUPABASE_READ_MODE=shared` against production traffic.
- Do not run with `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=true` unless explicitly testing a staging failure path.

## Exact Staging Validation Commands

From the repository root:

```powershell
$env:NODE_ENV='development'
$env:CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED='true'
$env:CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED='true'
$env:CREVUX_SHARED_SUPABASE_READ_MODE='legacy'
$env:CREVUX_SHARED_SUPABASE_FAIL_CLOSED='false'
$env:CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE='true'
node scripts/validate-supabase-phase4g-staging.mjs
```

From `apps/CreVux`:

```powershell
$env:NODE_ENV='development'
$env:CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED='true'
$env:CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED='true'
$env:CREVUX_SHARED_SUPABASE_READ_MODE='legacy'
$env:CREVUX_SHARED_SUPABASE_FAIL_CLOSED='false'
$env:CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE='true'
pnpm smoke:shared-supabase-runtime
pnpm smoke:shared-supabase-local
pnpm --dir artifacts/api-server exec vitest run src/supabase/runtime.server.test.ts
pnpm typecheck
pnpm build
```

## Dual-Write/Compare Checklist

- Runtime flag is explicitly enabled only in staging/local shell or staging environment.
- Dual-write flag is explicitly enabled only for the proof window.
- Read mode stays `legacy` for smoke proof.
- `dual_compare` is used only after legacy/shared ID mapping is ready.
- Shared write failures remain non-blocking while `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Fail-closed behavior is tested separately with deliberate shared write failure.
- Runtime smoke rows are marked with `source='runtime_smoke'`, `environment='local'` or staging equivalent, and `metadata.smokeTest=true`.
- Runtime smoke rows are cleaned by default.
- `crevux.projects`, `crevux.assets`, `crevux.generation_jobs`, `crevux.exports`, `crevux.provider_runs`, and `crevux.credit_spend_events` receive only Crevux-owned product telemetry.
- `core.usage_events` is telemetry only; Verixet remains usage admission authority.
- `core.audit_logs` receives audit telemetry without exposing service-role keys to browser/client code.

## Rollback Checklist

- Set `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false`.
- Set `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false`.
- Set `CREVUX_SHARED_SUPABASE_READ_MODE=legacy`.
- Set `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false`.
- Set `CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=false`.
- Preserve shared smoke rows only if dashboard inspection was intentionally enabled.
- Delete only clearly marked smoke rows.
- Do not replay provider callbacks blindly.
- Do not let WordGeni rollback tooling mutate Crevux-owned assets, jobs, provider runs, or exports.

## Production Cutover Blockers

- Provider/dashboard proof is not complete.
- Live provider callback and idempotency behavior is not validated.
- `crevux-assets` real storage migration is not complete.
- Legacy numeric user/workspace IDs are not fully mapped to shared `core.*` UUIDs.
- Backfill and reconciliation are not complete.
- Verixet entitlement/usage-admission boundary is not production-proven for Crevux runtime.
- XFlow connection/control-plane boundary is not production-proven for Crevux runtime.
- Production rollback has not been rehearsed.
- Monitoring and observation windows are not complete.

Production cutover is unsafe until provider/dashboard proof, storage migration proof, backfill reconciliation, rollback testing, and observation all pass.

## Old Supabase Pause Blockers

- Production runtime migration is not complete.
- Production validation is not complete.
- No-write observation against old Crevux DB has not passed.
- Old project export/backup has not been completed and verified.
- Provider callbacks and in-flight jobs have not been reconciled.
- Shared storage access for real assets has not been proven.

Old Crevux Supabase remains unsafe to pause.
