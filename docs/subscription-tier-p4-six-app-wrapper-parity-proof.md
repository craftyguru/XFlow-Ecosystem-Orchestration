# P4 Six-App Subscription Wrapper Parity Proof

Date: 2026-07-09

## Scope

P4 wrapper parity is implemented. Verixet and XFlow now have focused subscription-tier proof wrappers, and the root recurring verifier now runs all six apps as real proof participants.

No production app code, subscription logic, Stripe logic, checkout flow, entitlement behavior, schema, migration, runtime behavior, CI config, package manifest, lockfile, dependency install, dependency rebuild, package upgrade, native rebuild, or app internal was changed.

## Files Changed

Verixet repo:

- `scripts/verify-subscription-tier-proof.mjs`

XFlow repo:

- `scripts/verify-subscription-tier-proof.mjs`

Root repo:

- `scripts/verify-subscription-tier-p3-gate.mjs`
- `docs/subscription-tier-p3-recurring-proof-gate-report.md`
- `docs/subscription-tier-p4-six-app-wrapper-parity-proof.md`

## Verixet Wrapper

Added `apps/Verixet/scripts/verify-subscription-tier-proof.mjs`.

Exact Verixet proof command:

```text
cd apps/Verixet && node scripts/verify-subscription-tier-proof.mjs
```

Wrapper checks:

```text
node ./node_modules/vitest/vitest.mjs run --configLoader runner src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx src/components/marketing/pricing/PricingCatalogClient.test.tsx src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts
node ./node_modules/next/dist/bin/next typegen
node ./node_modules/typescript/bin/tsc --noEmit
```

Result:

```text
PASS Verixet P4 subscription-tier focused proof gate passed.
Test Files  8 passed (8)
Tests       77 passed (77)
```

## XFlow Wrapper

Added `apps/XFlow/scripts/verify-subscription-tier-proof.mjs`.

Exact XFlow proof command:

```text
cd apps/XFlow && node scripts/verify-subscription-tier-proof.mjs
```

Wrapper checks:

```text
node ./node_modules/vitest/vitest.mjs run tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/showcase-chrome.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts tests/unit/billing-entitlement-resolution.test.ts tests/unit/central-auth-start-route.test.ts tests/unit/ecosystem-auth-return-url.test.ts
node ./node_modules/typescript/bin/tsc --noEmit
```

Result:

```text
PASS XFlow P4 subscription-tier focused proof gate passed.
Test Files  10 passed (10)
Tests       70 passed (70)
```

## Root Verifier Update

Updated `scripts/verify-subscription-tier-p3-gate.mjs` so the focused participant list includes:

- `cd apps/Verixet && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/XFlow && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/WordGeni && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/CreVux && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/AudAix && node scripts/verify-subscription-tier-proof.mjs`
- `cd apps/RatAiFy && node scripts/verify-subscription-tier-proof.mjs`

The status-only treatment for Verixet and XFlow was removed. The verifier remains dependency-free stock Node orchestration, keeps deterministic markdown report generation, preserves root/app git status collection, and exits non-zero if any wrapper fails.

Exact root verifier command:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
```

Final root verifier result:

```text
PASS P3 subscription proof gate
Verixet: passed (10580 ms)
XFlow: passed (9952 ms)
WordGeni: passed (16542 ms)
CreVux: passed (71970 ms)
AudAiX: passed (38273 ms)
RatAiFy: passed (7880 ms)
```

## Commands Run

Inspection:

```text
git status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
git -C apps/AudAix status --short
git -C apps/RatAiFy status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
Get-Content -Raw docs/subscription-tier-p4-verixet-xflow-wrapper-parity-plan.md
Get-Content -Raw scripts/verify-subscription-tier-p3-gate.mjs
Get-Content -Raw apps/WordGeni/scripts/verify-subscription-tier-proof.mjs
Get-Content -Raw apps/CreVux/scripts/verify-subscription-tier-proof.mjs
Get-Content -Raw apps/AudAix/scripts/verify-subscription-tier-proof.mjs
Get-Content -Raw apps/RatAiFy/scripts/verify-subscription-tier-proof.mjs
Get-Content -Raw apps/Verixet/package.json
Get-Content -Raw apps/XFlow/package.json
```

Focused verification:

```text
node --check apps/Verixet/scripts/verify-subscription-tier-proof.mjs
cd apps/Verixet && node scripts/verify-subscription-tier-proof.mjs
node --check apps/XFlow/scripts/verify-subscription-tier-proof.mjs
cd apps/XFlow && node scripts/verify-subscription-tier-proof.mjs
node --check scripts/verify-subscription-tier-p3-gate.mjs
node scripts/verify-subscription-tier-p3-gate.mjs
```

Commit/status commands:

```text
git -C apps/Verixet add -- scripts/verify-subscription-tier-proof.mjs
git -C apps/Verixet diff --cached --name-only
git -C apps/Verixet status --short
git -C apps/Verixet commit -m "Add P4 six app subscription proof wrappers"
git -C apps/XFlow add -- scripts/verify-subscription-tier-proof.mjs
git -C apps/XFlow diff --cached --name-only
git -C apps/XFlow status --short
git -C apps/XFlow commit -m "Add P4 six app subscription proof wrappers"
node scripts/verify-subscription-tier-p3-gate.mjs
git status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
git -C apps/AudAix status --short
git -C apps/RatAiFy status --short
```

## Per-App Proof Result

| App | Command | Result |
| --- | --- | --- |
| Verixet | `cd apps/Verixet && node scripts/verify-subscription-tier-proof.mjs` | passed |
| XFlow | `cd apps/XFlow && node scripts/verify-subscription-tier-proof.mjs` | passed |
| WordGeni | `cd apps/WordGeni && node scripts/verify-subscription-tier-proof.mjs` | passed |
| CreVux | `cd apps/CreVux && node scripts/verify-subscription-tier-proof.mjs` | passed |
| AudAiX | `cd apps/AudAix && node scripts/verify-subscription-tier-proof.mjs` | passed |
| RatAiFy | `cd apps/RatAiFy && node scripts/verify-subscription-tier-proof.mjs` | passed |

## Remaining Limitations

- Broad app-health suites remain outside this recurring proof gate.
- Route/copy proof, provider proof, staging proof, production proof, Playwright/browser proof, migrations, live Stripe/provider checks, and optional environment-specific Stripe price verification remain outside this recurring proof gate.
- `scripts/verify-subscription-tier-p3-gate.mjs` keeps its P3 filename for continuity, even though it now has P4 six-app wrapper parity.

## Final Root Status

Pre-existing unrelated root dirt preserved:

```text
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

Root task-owned files before root commit:

```text
 M docs/subscription-tier-p3-recurring-proof-gate-report.md
 M scripts/verify-subscription-tier-p3-gate.mjs
?? docs/subscription-tier-p4-six-app-wrapper-parity-proof.md
```

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

Confirmed: no production code, subscription logic, Stripe logic, checkout flows, entitlement behavior, schemas, migrations, broad CI, installs, dependency rebuilds, lockfile churn, package upgrades, native rebuilds, package manifests, CI config, or app internals were changed.
