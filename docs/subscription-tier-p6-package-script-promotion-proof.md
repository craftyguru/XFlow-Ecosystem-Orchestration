# P6 Subscription Proof Gate Package Script Promotion Proof

Date: 2026-07-09

## Scope

This P6 pass investigated the dirty root `package.json`, preserved unrelated pre-existing package dirt, and promoted the six-app subscription proof gate into a canonical root package script only where the change could be isolated cleanly.

No production app code, app wrappers, app package manifests, lockfiles, CI config, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, runtime behavior, or app internals were changed.

## Original Package.json Dirt

Before P6, `package.json` already had these unstaged script additions:

```text
verify:workspace-auth-read-fixtures
verify:workspace-api-redaction
verify:workspace-provider-billing-plan
verify:workspace-external-proof-approval
verify:workspace-local-proof-closeout
```

Classification:

| Change | Classification | Reason |
| --- | --- | --- |
| `verify:workspace-auth-read-fixtures` | clearly unrelated/pre-existing | Points at an unrelated untracked workspace proof script, not the subscription-tier gate. |
| `verify:workspace-api-redaction` | clearly unrelated/pre-existing | Points at an unrelated untracked workspace proof script, not the subscription-tier gate. |
| `verify:workspace-provider-billing-plan` | clearly unrelated/pre-existing | Provider billing proof planning is outside the local subscription-tier recurring gate. |
| `verify:workspace-external-proof-approval` | clearly unrelated/pre-existing | External approval proof is outside the local subscription-tier recurring gate. |
| `verify:workspace-local-proof-closeout` | clearly unrelated/pre-existing | Workspace local closeout proof is outside the local subscription-tier recurring gate. |

Those changes were preserved in the working tree and not intentionally promoted as part of P6.

## Package.json Handling

The package file was extended with exactly one task-owned root script:

```json
"verify:subscription-tier": "node scripts/verify-subscription-tier-p3-gate.mjs"
```

The addition is adjacent to the existing proof/verify scripts. Dependency fields, package manager fields, unrelated scripts, lockfiles, and app package manifests were not changed.

Because the file contained unrelated pre-existing dirt, the package commit stages only the isolated `verify:subscription-tier` script. The unrelated workspace proof script entries remain root dirt unless handled by a separate cleanup/proof pass.

## Commands Run

Inspection:

```text
git status --short
git diff -- package.json
git diff -- docs/subscription-tier-p3-recurring-proof-gate-report.md
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
git -C apps/AudAix status --short
git -C apps/RatAiFy status --short
Get-Content -Raw package.json
Get-Content -Raw docs/subscription-tier-p5-six-app-proof-gate-standard.md
```

Focused verification:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
npm run verify:subscription-tier
```

Status review:

```text
git status --short
git diff -- package.json
git diff -- docs/subscription-tier-p3-recurring-proof-gate-report.md
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
git -C apps/AudAix status --short
git -C apps/RatAiFy status --short
```

## Verifier Result

Direct command:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
```

Result:

```text
PASS P3 subscription proof gate
Verixet: passed (9967 ms)
XFlow: passed (9308 ms)
WordGeni: passed (15686 ms)
CreVux: passed (66524 ms)
AudAiX: passed (36181 ms)
RatAiFy: passed (7369 ms)
```

## Npm Script Result

Package script command:

```text
npm run verify:subscription-tier
```

Result:

```text
PASS P3 subscription proof gate
Verixet: passed (10049 ms)
XFlow: passed (9267 ms)
WordGeni: passed (15801 ms)
CreVux: passed (67087 ms)
AudAiX: passed (36137 ms)
RatAiFy: passed (7498 ms)
```

## Recurring Report Refresh

`docs/subscription-tier-p3-recurring-proof-gate-report.md` was refreshed by the verifier during this pass. It reflects the current passing six-app gate from `npm run verify:subscription-tier`, with all six app wrappers passing and no Verixet/XFlow status-only treatment.

## Final Root Status

Root status after verification and before staging:

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

Remaining unrelated/pre-existing dirt:

- The five workspace proof script entries in the working tree `package.json`.
- The unrelated untracked RatAiFy, workspace, and XFlow proof docs/registers.
- The unrelated untracked workspace proof verifier scripts.

## Final Six-App Repo Status

| App | Status |
| --- | --- |
| Verixet | clean |
| XFlow | clean |
| WordGeni | clean |
| CreVux | clean |
| AudAiX | clean |
| RatAiFy | clean |

## No-Mutation Confirmation

No production code, app wrappers, app package files, lockfiles, installs, dependency rebuilds, native rebuilds, package-manager purges, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, CI config, runtime behavior, or app internals were changed. No broad CI, all-app test suite, migration, install, dependency rebuild, native rebuild, package-manager purge, or package upgrade was run.
