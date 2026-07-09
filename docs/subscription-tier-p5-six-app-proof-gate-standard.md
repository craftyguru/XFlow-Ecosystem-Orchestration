# P5 Six-App Subscription Proof Gate Standard

Date: 2026-07-09

## Canonical Command

Use this command from the XFlow-Ecosystem workspace root as the canonical local recurring subscription-tier verifier:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
```

The filename remains `p3` for continuity with the completed P3/P4 proof sequence, but after P4 it is the six-app local recurring gate.

## What It Verifies

The command runs the six focused app wrappers:

- `cd apps/Verixet && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/XFlow && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/WordGeni && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/CreVux && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/AudAix && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/RatAiFy && node scripts/verify-subscription-tier-proof.mjs`

The gate verifies local subscription-tier proof only. It checks the app-owned focused billing, catalog, pricing, handoff, entitlement, usage, media-credit, and typecheck proof surfaces selected by each wrapper. It also captures root and app git status and writes a deterministic markdown report to:

```text
docs/subscription-tier-p3-recurring-proof-gate-report.md
```

## Intentional Exclusions

This canonical local recurring verifier intentionally excludes:

- Broad CI.
- All-app test suites.
- Provider or live checks.
- Staging or production checks.
- Playwright/browser proof.
- Migrations, schema changes, or database seeds.
- Stripe live verification and Stripe catalog mutation commands.
- Route/copy proof outside subscription scope.
- Dependency installs, rebuilds, package-manager purges, lockfile rewrites, package upgrades, and native rebuilds.

Those surfaces remain important, but they are separate release, provider, staging, production, browser, migration, or broad app-health proof lanes.

## Required Expected Result

A healthy local recurring run must end with:

- All six app wrappers passed.
- `docs/subscription-tier-p3-recurring-proof-gate-report.md` generated or updated.
- All six app repos clean afterward.
- Any root dirt understood and separated from subscription proof failures.

The command must exit non-zero if any wrapper is missing or any focused wrapper fails.

## Failure Triage

App wrapper failure:

- Treat a wrapper's non-zero exit as the first failure boundary.
- Read that wrapper's output tail in `docs/subscription-tier-p3-recurring-proof-gate-report.md`.
- Fix inside the owning app repo only when the failure is in that app's focused subscription proof surface.

Missing local binary:

- The app wrappers report missing required local files and binaries before starting.
- Treat this as dependency-layout or proof-surface drift, not as a subscription product failure.
- Do not repair it with ad hoc installs during the recurring verification run.

Dirty app repo:

- The generated report records each app repo status.
- A dirty app repo after a pass means the local proof environment is not clean enough for promotion.
- Resolve or commit app-owned changes in that app boundary before treating the root recurring result as clean.

Root unrelated dirt:

- Existing unrelated root dirt does not make the subscription proof fail by itself.
- Keep it separated from task-owned proof files in reports and commits.
- Do not stage unrelated root files as part of subscription proof standardization.

Broad proof not covered:

- A pass here does not prove broad CI, route/copy proof, provider state, staging, production, browser behavior, migrations, or live Stripe configuration.
- Route failures, provider failures, browser failures, and live Stripe/env failures must be handled in their own proof lanes.

## Promotion Recommendation

Keep `node scripts/verify-subscription-tier-p3-gate.mjs` as the local recurring verifier now.

Only later add a package script or CI wiring after both conditions are true:

- Root unrelated `package.json` dirt is resolved in a separate scoped pass.
- The six-app gate has repeated clean local passes with all six app repos clean afterward.

Do not add package scripts, CI config, package manifest changes, or lockfile changes in P5.

## P5 Proof Report

Command run:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
```

Result:

```text
PASS P3 subscription proof gate
Verixet: passed (9761 ms)
XFlow: passed (9230 ms)
WordGeni: passed (15834 ms)
CreVux: passed (65934 ms)
AudAiX: passed (36074 ms)
RatAiFy: passed (7374 ms)
```

Per-app result summary:

| App | Result |
| --- | --- |
| Verixet | passed |
| XFlow | passed |
| WordGeni | passed |
| CreVux | passed |
| AudAiX | passed |
| RatAiFy | passed |

Final root status after the verifier run and before staging this P5 doc:

```text
 M docs/subscription-tier-p3-recurring-proof-gate-report.md
 M package.json
?? docs/ratify-post-rollout-observation.md
?? docs/ratify-production-deployment-plan.md
?? docs/ratify-production-rollout-readiness.md
?? docs/ratify-staging-proof-recovery.md
?? docs/ratify-staging-proof-rollout.md
?? docs/workflow-copilot-audit.md
?? docs/workspace-external-proof-approval-packet.md
?? docs/workspace-external-proof-approval-register.json
?? docs/workspace-five-app-api-redaction-evidence.json
?? docs/workspace-five-app-api-redaction-proof-register.json
?? docs/workspace-five-app-api-redaction-proof.md
?? docs/workspace-five-app-auth-read-fixtures-evidence.json
?? docs/workspace-five-app-auth-read-fixtures-proof-register.json
?? docs/workspace-five-app-auth-read-fixtures-proof.md
?? docs/workspace-local-proof-closeout-register.json
?? docs/workspace-local-proof-closeout.md
?? docs/workspace-provider-billing-proof-plan-register.json
?? docs/workspace-provider-billing-proof-plan.md
?? docs/xflow-user-dashboard-api-redaction-proof-register.json
?? docs/xflow-user-dashboard-api-redaction-proof.md
?? docs/xflow-user-dashboard-auth-fixture-browser-proof-register.json
?? docs/xflow-user-dashboard-auth-fixture-browser-proof.md
?? docs/xflow-user-dashboard-local-browser-proof-register.json
?? docs/xflow-user-dashboard-local-browser-proof.md
?? docs/xflow-user-dashboard-local-proof-register.json
?? docs/xflow-user-dashboard-local-proof.md
?? docs/xflow-user-dashboard-mutation-boundary-proof-register.json
?? docs/xflow-user-dashboard-mutation-boundary-proof.md
?? scripts/verify-workspace-external-proof-approval.mjs
?? scripts/verify-workspace-five-app-api-redaction.mjs
?? scripts/verify-workspace-five-app-auth-read-fixtures.mjs
?? scripts/verify-workspace-local-proof-closeout.mjs
?? scripts/verify-workspace-provider-billing-proof-plan.mjs
```

Final app statuses:

| App | Status |
| --- | --- |
| Verixet | clean |
| XFlow | clean |
| WordGeni | clean |
| CreVux | clean |
| AudAiX | clean |
| RatAiFy | clean |

No-mutation confirmation:

No production code, package files, lockfiles, installs, dependency rebuilds, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, CI config, package manifests, app wrappers, or app internals were changed. No broad CI, all-app suite, provider/live check, staging/production check, Playwright/browser proof, migration, install, package-manager purge, lockfile rewrite, package upgrade, or native rebuild was run.
