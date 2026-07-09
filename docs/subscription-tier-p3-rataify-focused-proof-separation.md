# RatAiFy P3 focused proof separation

Date: 2026-07-09

## Scope

This pass separated RatAiFy's P3 subscription-tier proof gate from broad route, copy, ops, and unrelated proof-copy coverage. The change adds a RatAiFy-local focused proof wrapper and records the proof result here.

No production app behavior, subscription logic, Stripe logic, checkout flow, entitlement behavior, proof-copy behavior, schema, migration, package manifest, lockfile, CI config, dependency install, dependency rebuild, native rebuild, package upgrade, or unrelated app internal was changed.

## Original blocker

The P3 reliability plan recorded RatAiFy as having a broad-suite separation blocker. The focused subscription tests were usable, but broad `verify:ci` expands through `test:ops` and can include unrelated route/copy/proof-copy tests such as `tests/audaix-proof.node.test.ts`. That makes broad app health a noisy release signal for subscription-tier proof.

The repair is a dedicated focused wrapper that runs the billing/catalog/entitlement/credit/checkout proof set and typecheck without invoking `verify:ci`, `test:ops`, route proof, local workspace proof, Playwright, staging proof, live proof, migrations, or broad proof-copy checks.

## Files changed

```text
apps/RatAiFy/scripts/verify-subscription-tier-proof.mjs
docs/subscription-tier-p3-rataify-focused-proof-separation.md
```

## New proof command

```text
cd apps/RatAiFy
node scripts/verify-subscription-tier-proof.mjs
```

The wrapper checks required local files and binaries before execution. Missing local binaries are reported as dependency-layout/proof-surface blockers rather than subscription product failures.

## Commands run

```text
git status --short
git -C apps/RatAiFy status --short
Get-Content -LiteralPath apps/RatAiFy/package.json
Get-ChildItem -Recurse -File -Path scripts,tests,docs,src | Where-Object { $_.FullName -match 'subscription|billing|stripe|entitlement|pricing|proof|tier|route|copy' }
rg -n "RatAiFy|Rataify|Ratify|proof-copy|proof copy|broad|verify:ci|subscription proof|billing|entitlement|pricing|P3" docs/subscription-tier-p3-proof-gate-reliability-plan.md docs/subscription-tier-p3-proof-gate-baseline-report.md
Get-Content -LiteralPath scripts/verify-rataify-local-proof.mjs -TotalCount 260
Get-Content -LiteralPath tests/audaix-proof.node.test.ts -TotalCount 160
rg -n "describe\(|test\(|it\(|billing|pricing|entitlement|stripe|checkout|credit|Verixet|proof" tests/billing-catalog.node.test.ts tests/rataify-pricing-authority.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/rataify-entitlements.node.test.ts tests/rataify-usage-guards.node.test.ts tests/billing-authority-schema.node.test.ts tests/billing-credit-routes.node.test.ts tests/billing-superadmin-routes.node.test.ts tests/credit-gating-routes.node.test.ts tests/entitlement-adapter.node.test.ts tests/billing-ui-wiring.node.test.ts tests/upgrade-pressure-client.node.test.ts tests/rat-setup-verifier.node.test.ts
Test-Path -LiteralPath node_modules/tsx/dist/cli.mjs
Test-Path -LiteralPath node_modules/typescript/bin/tsc
Test-Path -LiteralPath scripts/verify-rataify-local-proof.mjs
npm run test:billing
node --check scripts/verify-subscription-tier-proof.mjs
node scripts/verify-subscription-tier-proof.mjs
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/RatAiFy status --short
git -C apps/AudAix status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
```

## Verification results

Current focused command before wrapper:

```text
npm run test:billing
1..76
# tests 76
# pass 76
# fail 0
```

Syntax check:

```text
node --check scripts/verify-subscription-tier-proof.mjs
passed
```

New P3 wrapper:

```text
node scripts/verify-subscription-tier-proof.mjs
PASS RatAiFy P3 subscription-tier focused proof gate passed.
```

Wrapper sub-results:

```text
RatAiFy subscription billing/catalog/entitlement focused proof: 76 passed, 0 failed
RatAiFy subscription proof typecheck: passed
```

## Intentionally excluded broad coverage

The focused P3 subscription gate intentionally does not run:

```text
npm run verify:ci
npm run test:ops
tests/audaix-proof.node.test.ts
node scripts/verify-rataify-local-proof.mjs
tsx scripts/verify-client-routes.ts
Playwright smoke/responsive suites
staging/live/control-plane/local-e2e proof scripts
migration and database commands
```

Those checks remain important broad app-health, route, copy, provider, staging, or deployment proof surfaces. They are outside this subscription-tier gate because the P3 blocker is broad proof-copy/test expansion hiding the focused billing result.

## Remaining limitations

- The root P3 recurring gate remains report-only until the final P3 summary/gate wiring pass.
- Broad RatAiFy `verify:ci` and `test:ops` remain separate app-health checks and were not run in this pass.
- Provider, staging, production, migration, Playwright, and live control-plane proofs were not run.

## Final status before staging

Root status contained pre-existing unrelated dirt plus this new report file. The unrelated root dirt included `M package.json` and untracked docs/scripts outside this P3 task.

App repo status before staging:

```text
apps/Verixet: clean
apps/XFlow: clean
apps/RatAiFy: ?? scripts/verify-subscription-tier-proof.mjs
apps/AudAix: clean
apps/WordGeni: clean
apps/CreVux: clean
```
