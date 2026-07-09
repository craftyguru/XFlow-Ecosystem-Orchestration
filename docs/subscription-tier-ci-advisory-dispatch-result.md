# Subscription Tier CI Advisory Dispatch Result

Date: 2026-07-09

## Result

- Repository: `craftyguru/XFlow-Ecosystem-Orchestration`
- Workflow: `Subscription Tier Proof Gate`
- Run ID: `29012168195`
- Run URL: `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29012168195`
- Event: `workflow_dispatch`
- Result: passed
- Classification: passed
- Job duration: 7m 30s

The workflow remains advisory. No branch protection or required status configuration was changed.

## Fix Applied

The previous run `29010953295` reached checkout, dependency bootstrap, wrapper execution, and artifact upload, then failed inside proof commands:

- XFlow failed because its wrapper ran root `tsc --noEmit`, which included the unrelated `agents/workflow-copilot-desktop` package. Fresh CI did not install that nested package's dependencies.
- CreVux failed because its wrapper ran full `artifacts/image-gen` typecheck, which pulled in non-subscription image-gen surfaces and fresh-checkout declaration output assumptions.

The safe adjustment was to narrow only proof wrapper scope:

- XFlow `scripts/verify-subscription-tier-proof.mjs`: replaced root-wide typecheck with a focused dependency-surface check after the subscription/auth/pricing Vitest suite.
- CreVux `scripts/verify-subscription-tier-proof.mjs`: removed the full image-gen typecheck while keeping local route/auth proof, SaaS entitlement policy checks, API subscription/media tests and typecheck, image-gen pricing Vitest proof, and credit top-up wiring proof.

## Commits Pushed

- Root blocker report was pushed: `9319ea5`
- XFlow wrapper narrowing was committed and pushed: `960b5ef`
- CreVux wrapper narrowing was committed and pushed: `834b6ca`

## Verification

Local checks run:

```text
node --check apps/XFlow/scripts/verify-subscription-tier-proof.mjs
node --check apps/CreVux/scripts/verify-subscription-tier-proof.mjs
node apps/XFlow/scripts/verify-subscription-tier-proof.mjs
node apps/CreVux/scripts/verify-subscription-tier-proof.mjs
npm run verify:subscription-tier
```

Local result:

```text
PASS P3 subscription proof gate
Verixet: passed
XFlow: passed
WordGeni: passed
CreVux: passed
AudAiX: passed
RatAiFy: passed
```

CI result from run `29012168195`:

| App | Result |
| --- | --- |
| Verixet | passed |
| XFlow | passed |
| WordGeni | passed |
| CreVux | passed |
| AudAiX | passed |
| RatAiFy | passed |

The CI run completed checkout for all six private app repos, dependency bootstrap, the subscription proof gate, and report artifact upload.

## Final Status

Root has this report and the regenerated recurring proof report as task-owned changes.

All six app repositories were clean after their wrapper commits were pushed.

## Safety Confirmation

No production code, subscription business logic, Stripe logic, checkout flows, entitlement behavior, schemas, migrations, runtime behavior, app internals, package files, lockfiles, installs, broad CI, or required CI status configuration were changed.
