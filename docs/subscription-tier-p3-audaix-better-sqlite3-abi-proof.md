# AudAiX P3 better-sqlite3 ABI proof

Date: 2026-07-09

## Scope

This pass repaired the AudAiX P3 subscription proof surface by adding an AudAiX-local focused proof wrapper. The wrapper runs only targeted subscription, billing, entitlement, dashboard billing, local route, and typecheck checks. It does not run broad CI, migrations, installs, native rebuilds, package-manager purges, Stripe commands, checkout flows, schema changes, entitlement/media enforcement changes, or production runtime changes.

## Original blocker

The P3 reliability plan recorded AudAiX's SQLite-backed entitlement/webhook proof as blocked because `better-sqlite3` had previously been compiled for `NODE_MODULE_VERSION 127` while the active Node runtime required `137`.

The current checkout no longer reproduces that ABI failure for the focused SQLite-backed subscription suites. The targeted reproduction command passed:

```text
npm run test -- tests/entitlement-adapter.test.ts tests/stripe-billing-webhook.test.ts
```

Result:

```text
Test Files  2 passed (2)
Tests       20 passed (20)
```

## Files changed

```text
apps/AudAix/scripts/verify-subscription-tier-proof.mjs
docs/subscription-tier-p3-audaix-better-sqlite3-abi-proof.md
```

## Proof wrapper

New working command:

```text
cd apps/AudAix
node scripts/verify-subscription-tier-proof.mjs
```

The wrapper checks required local proof files before execution and fails with a proof-surface/native-module diagnostic if a required local binary or proof file is missing. It uses stock Node plus already-installed local project binaries; it does not call npm install, pnpm install, native rebuild, package upgrades, lockfile rewrites, or dependency purges.

## Commands run

```text
git status --short
git -C apps/AudAix status --short
Get-Content -LiteralPath apps/AudAix/package.json
rg -n "better-sqlite3|subscription|proof|tier|stripe|entitlement|billing" .  # from apps/AudAix
rg -n "AudAiX|AudAix|better-sqlite3|sqlite|ABI|P3|subscription proof" docs scripts -g "*.md" -g "*.mjs" -g "*.json"
rg -n "AudAiX|AudAix|better-sqlite3|ABI|focused AudAiX|workspace/billing proof|SQLite entitlement" docs/subscription-tier-p3-proof-gate-reliability-plan.md docs/subscription-tier-p3-proof-gate-baseline-report.md docs/subscription-tier-p3-wordgeni-dependency-layout-proof.md docs/subscription-tier-p3-crevux-install-gate-normalization-proof.md
Get-ChildItem -Recurse -File -Path scripts,tests,docs | Where-Object { $_.FullName -match 'subscription|billing|stripe|entitlement|proof|tier' }
rg -n "describe\(|it\(|better-sqlite3|workspacePlan|billing|stripe|subscription|entitlement|verixet" tests src/lib src/repositories src/routes -g "*.ts"
Get-Content -LiteralPath tests/billing-plans.test.ts
Get-Content -LiteralPath tests/workspace-plan.test.ts
Get-Content -LiteralPath tests/pricing-contract.test.ts
Get-Content -LiteralPath tests/audaix-entitlements.test.ts
Get-Content -LiteralPath tests/entitlement-adapter.test.ts -TotalCount 80
Get-Content -LiteralPath tests/stripe-billing-webhook.test.ts -TotalCount 80
Get-Content -LiteralPath scripts/verify-audaix-local-proof.mjs -TotalCount 220
Get-Content -LiteralPath dashboard/package.json
npm run test -- tests/entitlement-adapter.test.ts tests/stripe-billing-webhook.test.ts
npm run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/pricing-contract.test.ts tests/audaix-entitlements.test.ts
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

Focused pre-wrapper reproduction:

```text
npm run test -- tests/entitlement-adapter.test.ts tests/stripe-billing-webhook.test.ts
Test Files  2 passed (2)
Tests       20 passed (20)
```

Focused subscription catalog proof:

```text
npm run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/pricing-contract.test.ts tests/audaix-entitlements.test.ts
Test Files  4 passed (4)
Tests       23 passed (23)
```

Syntax check:

```text
node --check scripts/verify-subscription-tier-proof.mjs
passed
```

New P3 wrapper:

```text
node scripts/verify-subscription-tier-proof.mjs
PASS AudAiX P3 subscription-tier focused proof gate passed.
```

Wrapper sub-results:

```text
AudAiX subscription catalog focused Vitest proof: 4 files passed, 23 tests passed
AudAiX SQLite entitlement and webhook focused Vitest proof: 2 files passed, 20 tests passed
AudAiX dashboard billing/pricing typecheck: passed
AudAiX dashboard billing/pricing focused Vitest proof: 2 files passed, 9 tests passed
AudAiX local route proof: passed
AudAiX subscription proof typecheck: passed
```

## better-sqlite3 state

`better-sqlite3` is not currently a blocker for the focused AudAiX subscription proof gate added in this pass. The previously blocked SQLite-backed entitlement and Stripe webhook suites both loaded and passed.

This pass does not claim broad AudAiX CI health or every database/native test path. Broad CI and all-app tests were intentionally not run.

## Remaining limitations

- RatAiFy focused subscription proof separation remains a separate P3 blocker.
- The root P3 recurring gate remains report-only until all focused app gates are reliable.
- Broad AudAiX app health, production/staging behavior, provider behavior, migrations, and deploy behavior were not tested.

## Why no dependency or app repair was attempted

The current focused ABI failure did not reproduce, so no native rebuild, install, package upgrade, lockfile change, dependency purge, or node_modules deletion was justified. The fix was limited to a proof wrapper that normalizes the focused AudAiX P3 command surface.

No production subscription logic, Stripe logic, checkout flows, entitlement/media enforcement, schemas, migrations, package manifests, lockfiles, CI config, or unrelated app internals were changed.

## Final status before staging

Root status contained pre-existing unrelated dirt plus this new report file. The unrelated root dirt included `M package.json` and untracked docs/scripts outside this P3 task.

App repo status before staging:

```text
apps/Verixet: clean
apps/XFlow: clean
apps/RatAiFy: clean
apps/AudAix: ?? scripts/verify-subscription-tier-proof.mjs
apps/WordGeni: clean
apps/CreVux: clean
```
