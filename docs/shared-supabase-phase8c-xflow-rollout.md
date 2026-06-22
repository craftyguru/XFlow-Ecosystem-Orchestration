# Shared Supabase Phase 8C XFlow Production Dual-Write Rollout

This document prepares the XFlow-only production variable update for controlled shared Supabase dual-write/compare mode.

Do not deploy from this document alone. Do not change production env vars until the operator executes this approved XFlow step. Do not update AudAiX, Rataify, WordGeni, or Crevux in this step. Do not switch `READ_MODE=shared`. Do not set `FAIL_CLOSED=true`. Do not pause old Supabase projects. Do not remove legacy DB paths.

## Current Gate

- Verixet Phase 8B is in clean dual-write observation.
- No new post-sync Verixet shared Supabase FK failures were found.
- XFlow rollout is no longer blocked by Verixet FK errors.
- Shared-read cutover remains not safe.
- Old Supabase pause remains not safe.

## Code Deployment Gate

Production XFlow deploys from the XFlow production branch.

Current repository audit:

- Local XFlow branch: `master`
- Remote production branch detected: `origin/master`
- `origin/main`: not present
- `origin/master` does not contain the Phase 4B XFlow shared Supabase runtime adapter files or runtime smoke files.

Result: PR/merge is required before the XFlow production variable update.

Do not set XFlow production runtime variables until the Phase 4B runtime code is merged into the production branch and deployed with the flags still off/default legacy.

## PR / Merge Checklist

Before enabling XFlow production dual-write variables:

1. Open a PR from the branch containing the XFlow Phase 4B runtime adapter into the XFlow production branch.
2. Confirm the PR includes only XFlow-relevant runtime migration code and supporting docs/tests.
3. Confirm the PR contains:
   - `src/lib/supabase/runtime.server.ts`
   - `src/lib/supabase/shared-local.server.ts`
   - `scripts/smoke-shared-supabase-local.ts`
   - `scripts/smoke-shared-supabase-runtime.ts`
   - `tests/supabase/runtime.server.test.ts`
4. Confirm default production behavior remains legacy while flags are unset/off.
5. Run XFlow checks on the PR:
   - `cd apps/XFlow && npm run typecheck`
   - `cd apps/XFlow && npm run ops:release-smoke`
   - `cd apps/XFlow && npm run smoke:shared-supabase-local` where local shared env is available
   - `cd apps/XFlow && npm run smoke:shared-supabase-runtime` where safe staging env is available
6. Merge to the production branch only after checks pass.
7. Let Railway deploy the code with XFlow runtime flags still off/default legacy.
8. Run the post-merge smoke with flags off before enabling dual-write variables.

## Scope

Approved app for this update:

- XFlow only

Apps not approved for this update:

- AudAiX
- Rataify
- WordGeni
- Crevux

Verixet is already in Phase 8B observation and should not be changed by this step.

## Approved XFlow Production Variable Checklist

Set exactly these XFlow runtime flags in the XFlow production Railway service only after the code deployment gate is satisfied:

```text
XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not set shared-read mode.

Do not enable fail-closed mode.

Do not change these in this step:

- AudAiX runtime flags
- Rataify runtime flags
- WordGeni runtime flags
- Crevux runtime flags
- Verixet runtime flags
- production Supabase keys
- production database URLs
- OAuth/social provider secrets
- XFlow session/auth secrets
- legacy DB paths

## Railway / Service Variable Update Steps

Operator steps for the XFlow Railway production service:

1. Open the XFlow production Railway service.
2. Open service variables.
3. Confirm the service is XFlow, not any satellite app.
4. Confirm the deployed XFlow build already contains the Phase 4B runtime code.
5. Add or update only the four approved XFlow runtime flags:
   - `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true`
   - `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`
   - `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare`
   - `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`
6. Confirm no variable value uses `READ_MODE=shared`.
7. Confirm no variable value uses `FAIL_CLOSED=true`.
8. Apply the variable update.
9. Restart or redeploy only the XFlow service if Railway requires it for variable changes.
10. Do not modify AudAiX, Rataify, WordGeni, or Crevux services.

## Preflight Command

Before changing XFlow variables, run:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run ops:release-smoke
```

Expected result:

- XFlow public smoke passes.
- Auth/session behavior is unchanged.
- Connection/control-plane routes remain legacy-source authoritative.

## Post-Deploy Smoke Commands

After code deploy with flags still off/default legacy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run ops:release-smoke
```

After enabling the approved XFlow dual-write variables:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run ops:release-smoke
```

If a safe staging/prod runtime smoke target is available and does not print secrets:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run smoke:shared-supabase-runtime
```

## Shared Supabase Row Verification

After the XFlow production variable update, verify XFlow shared rows with read-only dashboard queries or read-only SQL. Do not print keys or database URLs.

Tables to verify:

- `core.app_connections`
- `core.workspace_app_access`
- `core.audit_logs`
- `xflow.control_plane_events`
- `xflow.app_links`
- `xflow.deployment_checks`
- `xflow.workflow_runs`

Expected result:

- New XFlow runtime activity may appear in shared tables.
- Legacy XFlow remains source of truth.
- Dual-compare mismatches must be logged and investigated.
- No browser/client code receives service-role credentials.

## Legacy DB Verification

Verify the legacy XFlow DB still handles:

- app connection state
- workspace app links
- control-plane events
- UCL/link events where available
- deployment validation signals
- workflow run state
- XFlow audit logs
- auth/session state

Expected result:

- Legacy reads/writes still work.
- Shared writes mirror only behind XFlow runtime/dual-write flags.
- Any shared write failure must not break legacy runtime while `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false`.

## Monitoring Checks

Watch for these XFlow markers and counters during the observation window:

- `xflow_shared_supabase_dual_write_failed`
- `xflow_shared_supabase_dual_compare_mismatch`
- shared write latency/errors
- control-plane write errors
- app-link write errors
- deploy validation write errors
- workflow run mirror errors
- auth/session exchange errors

Abort if any critical signal crosses the approved threshold.

## Rollback Steps

If rollback is required, reset only the XFlow production Railway service variables:

```text
XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
XFLOW_SHARED_SUPABASE_READ_MODE=legacy
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false
```

Then restart or redeploy only the XFlow service if Railway requires it.

Rollback verification:

1. Run `npm run ops:release-smoke`.
2. Confirm legacy XFlow auth, app connection, control-plane, deploy validation, and workflow paths still work.
3. Confirm new shared XFlow writes stop after flags are disabled.
4. Preserve shared rows already written for audit and reconciliation.
5. Do not delete shared rows without a separate approved cleanup plan.

## Observation Window

Before planning the next app rollout:

- XFlow release smoke passes after variable update.
- Shared rows appear in the expected XFlow/core tables.
- Legacy DB flows still work.
- No critical `xflow_shared_supabase_dual_write_failed` logs appear.
- No critical dual-compare mismatches appear.
- No app connection/control-plane regressions appear.
- Rollback owner confirms XFlow can be reverted immediately if needed.
- Observation notes are recorded.

## Approval Status

XFlow variable update readiness: not ready until PR/merge/deploy gate is complete.

XFlow variable update after code deployment gate: ready for operator execution.

AudAiX, Rataify, WordGeni, and Crevux variable updates: not approved in Phase 8C.

Shared-read cutover: not safe.

Old Supabase pause: not safe.
