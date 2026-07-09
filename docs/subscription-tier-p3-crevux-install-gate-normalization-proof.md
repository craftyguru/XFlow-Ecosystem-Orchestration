# P3 CreVux Install Gate Normalization Proof

## A. Summary

CreVux's focused P3 subscription-tier proof gate is now runnable through a dependency-install-free wrapper:

```powershell
node scripts/verify-subscription-tier-proof.mjs
```

Working directory:

```text
apps/CreVux
```

The wrapper avoids the unreliable pnpm/catalog proof path by calling existing local Node, Vitest, tsx, and TypeScript entrypoints directly from the correct package roots. It does not install dependencies, purge pnpm modules, rewrite lockfiles, run migrations, run broad CI, or change runtime app behavior.

## B. Original Blocker

P2/P3 docs recorded CreVux as blocked by a pnpm/catalog/strict install workspace state:

- `pnpm --filter @workspace/saas-entitlements run test` aborts before tests with `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY]`.
- Prior focused attempts were blocked by missing or stale package-local Vitest, tsx, TypeScript, `@vitest/utils`, `@types/node`, `vite/client`, and `esbuild` resolution.
- Broad `pnpm run typecheck` and `pnpm run test` are not safe recurring subscription gates because they can trigger workspace install/purge behavior and broad unrelated checks.

Current reproduction:

```powershell
pnpm --filter @workspace/saas-entitlements run test
```

Result:

```text
[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY
```

The present issue is proof-gate execution reliability, not CreVux subscription product behavior.

## C. Files Changed

- `apps/CreVux/scripts/verify-subscription-tier-proof.mjs`

The new wrapper runs:

1. `node scripts/verify-crevux-local-proof.mjs`
2. SaaS entitlement policy typecheck from `lib/saas-entitlements`
3. SaaS entitlement policy verifier from `lib/saas-entitlements`
4. API subscription/media focused Vitest from the CreVux workspace root
5. API subscription/media typecheck from the CreVux workspace root
6. Image-gen pricing focused Vitest from `artifacts/image-gen`
7. Image-gen pricing typecheck from the CreVux workspace root
8. Credit top-up wiring verifier from `artifacts/api-server`

The wrapper checks required local proof files before each step and reports missing files as dependency-layout/proof-surface blockers rather than subscription product failures.

## D. Commands Run

Inspection:

```powershell
git status --short
git -C apps/CreVux status --short
Get-Content apps/CreVux/package.json
Get-Content apps/CreVux/pnpm-workspace.yaml
Get-Content apps/CreVux/artifacts/api-server/package.json
Get-Content apps/CreVux/artifacts/image-gen/package.json
Get-Content apps/CreVux/lib/saas-entitlements/package.json
Get-Content apps/CreVux/scripts/verify-crevux-local-proof.mjs
```

Failure reproduction:

```powershell
pnpm --filter @workspace/saas-entitlements run test
```

Focused direct checks before adding the wrapper:

```powershell
node ./node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
node ./node_modules/tsx/dist/cli.mjs ./scripts/verify-saas-entitlements-policy.ts
node artifacts/api-server/node_modules/vitest/vitest.mjs run artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts artifacts/api-server/src/lib/verixetUsageAdmission.test.ts artifacts/api-server/src/lib/saasMetering.admission-order.test.ts artifacts/api-server/src/tests/saasEnforcement.integration.test.ts
node ./node_modules/typescript/bin/tsc -p artifacts/api-server/tsconfig.json --noEmit
node ./node_modules/vitest/vitest.mjs run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx src/pages/AdminDashboardPage.test.tsx
node ./node_modules/typescript/bin/tsc -p artifacts/image-gen/tsconfig.json --noEmit
node ./node_modules/tsx/dist/cli.mjs ./scripts/verify-credit-topup-wiring.ts
```

Verification after adding the wrapper:

```powershell
node --check scripts/verify-subscription-tier-proof.mjs
node scripts/verify-subscription-tier-proof.mjs
```

Status checks:

```powershell
git status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/RatAiFy status --short
git -C apps/AudAix status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
```

## E. Repaired Proof Command Result

Command:

```powershell
cd apps/CreVux
node scripts/verify-subscription-tier-proof.mjs
```

Result: passed.

Observed output summary:

```text
PASS CreVux local route/auth proof verifier passed.
SaaS entitlement policy typecheck: passed.
verify-saas-entitlements-policy: ok.
API focused Vitest: 3 files passed, 1 skipped, 15 tests passed, 3 skipped.
API typecheck: passed.
Image-gen focused Vitest: 3 files passed, 12 tests passed.
Image-gen typecheck: passed.
verify-credit-topup-wiring: ok.
PASS CreVux P3 subscription-tier focused proof gate passed.
```

## F. Remaining Limitations

- This does not repair broad pnpm filtered commands, root `pnpm run typecheck`, root `pnpm run test`, or pnpm install/purge behavior.
- This does not modify package manifests, lockfiles, pnpm catalog settings, `.npmrc`, or dependency versions.
- This does not run live Stripe, migrations, broad CI, all API tests, all image-gen tests, all app tests, or native rebuilds.
- AudAiX `better-sqlite3` ABI and RatAiFy broad-suite separation remain separate P3 blockers.
- The API focused Vitest set still reports one skipped file and three skipped tests as part of the existing suite behavior.

## G. Safety Notes

No installs, package upgrades, lockfile changes, dependency rebuilds, pnpm purges, migrations, Stripe changes, checkout changes, subscription business logic changes, entitlement behavior changes, media enforcement changes, schema changes, CI changes, or production runtime behavior changes were performed.

The fix is limited to a CreVux proof wrapper and this root proof report.

## H. Status Evidence

Root status after adding this proof report and before staging:

```text
M package.json
?? docs/subscription-tier-p3-crevux-install-gate-normalization-proof.md
untracked RatAiFy rollout docs
untracked workspace proof docs/registers/scripts
untracked XFlow user-dashboard proof docs/registers
```

CreVux status after adding the wrapper:

```text
?? scripts/verify-subscription-tier-proof.mjs
```

Other app repo statuses after verification:

```text
apps/Verixet: clean
apps/XFlow: clean
apps/RatAiFy: clean
apps/AudAix: clean
apps/WordGeni: clean
```

Final post-commit status is reported in the task closeout because the root report and CreVux wrapper live in separate git repositories.
