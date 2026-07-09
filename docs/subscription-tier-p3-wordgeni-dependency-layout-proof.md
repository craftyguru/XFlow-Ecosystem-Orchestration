# P3 WordGeni Dependency Layout Proof

## A. Summary

WordGeni's P3 subscription-tier proof gate is now runnable through a focused, dependency-install-free wrapper:

```powershell
node scripts/verify-subscription-tier-proof.mjs
```

Working directory:

```text
apps/WordGeni
```

The wrapper avoids the prior unreliable proof surfaces by calling local package tools directly from the correct package roots:

- It does not use Turbo.
- It does not use pnpm.
- It does not use npm package script argument forwarding.
- It does not run broad CI.
- It does not install, rebuild, purge, migrate, or mutate app data.

## B. Original Blocker

P2/P3 docs recorded WordGeni as dependency-layout blocked by missing package-local Vitest/TypeScript binaries, stale or missing Turbo links, and pnpm non-TTY module purge risk.

Current inspection found the local Vitest and TypeScript binaries are present, but the proof command surface was still unreliable:

- `npm --prefix apps/WordGeni/apps/api run test -- <focused files>` failed because `apps/api/scripts/run-vitest-shards.mjs` always runs 8 Vitest shards. The focused subscription suite resolves to 6 files, and Vitest rejects `--shard=1/8` when the shard count exceeds the file count.
- `npm --prefix apps/WordGeni/apps/web run test -- <focused file>` did not stay focused because the script is `vitest run && node ../../scripts/check-production-feints.mjs`; the file argument is passed after both commands and Vitest runs the full web suite first.

The issue fixed in this pass is proof-gate execution reliability, not subscription product behavior.

## C. Files Changed

- `apps/WordGeni/scripts/verify-subscription-tier-proof.mjs`

The new script is a focused proof wrapper that runs:

1. `node scripts/verify-wordgeni-local-proof.mjs`
2. API focused subscription-tier Vitest files from `apps/WordGeni/apps/api`
3. API `tsc --noEmit` from `apps/WordGeni/apps/api`
4. Web pricing focused Vitest file from `apps/WordGeni/apps/web`
5. Web `tsc --noEmit` from `apps/WordGeni/apps/web`

It checks required local proof files before execution and reports missing files as dependency-layout/proof-surface blockers rather than subscription product failures.

## D. Commands Run

Inspection:

```powershell
git status --short
git -C apps/WordGeni status --short
Get-Content apps/WordGeni/package.json
Get-Content apps/WordGeni/pnpm-workspace.yaml
Get-Content apps/WordGeni/turbo.json
Get-Content apps/WordGeni/apps/api/package.json
Get-Content apps/WordGeni/apps/web/package.json
Get-Content apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs
Get-Content apps/WordGeni/scripts/turbo-test.mjs
Get-Content apps/WordGeni/apps/api/scripts/run-vitest-shards.mjs
```

Failure reproduction:

```powershell
npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts
npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts
```

Focused direct checks before adding the wrapper:

```powershell
node ./node_modules/vitest/vitest.mjs run --maxWorkers=1 --minWorkers=1 src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts
node ./node_modules/vitest/vitest.mjs run --config vitest.config.mjs src/components/pricing/pricing-page-client.test.ts
node ./node_modules/typescript/bin/tsc --noEmit
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
cd apps/WordGeni
node scripts/verify-subscription-tier-proof.mjs
```

Result: passed.

Observed output summary:

```text
PASS WordGeni local route/auth proof verifier passed.
API focused Vitest: 6 files passed, 33 tests passed.
API typecheck: passed.
Web pricing focused Vitest: 1 file passed, 8 tests passed.
Web typecheck: passed.
PASS WordGeni P3 subscription-tier focused proof gate passed.
```

## F. Remaining Limitations

- This does not repair or validate broad `pnpm typecheck`, `pnpm lint`, `pnpm test`, or Turbo orchestration.
- This does not run Stripe proof, live provider proof, migrations, broad CI, app-wide web tests, or all API tests.
- This does not change package manifests or lockfiles, so any future dependency-layout drift still needs a dedicated dependency maintenance pass.
- CreVux dependency layout, AudAiX `better-sqlite3` ABI, and RatAiFy broad-suite separation remain separate P3 blockers.

## G. Safety Notes

No installs, package upgrades, lockfile changes, dependency rebuilds, pnpm purges, migrations, Stripe changes, checkout changes, subscription business logic changes, entitlement behavior changes, media enforcement changes, schema changes, or production runtime behavior changes were performed.

The fix is limited to a WordGeni proof wrapper and this root proof report.

## H. Status Evidence

Root status after adding this proof report and before staging:

```text
M package.json
?? docs/subscription-tier-p3-wordgeni-dependency-layout-proof.md
untracked RatAiFy rollout docs
untracked workspace proof docs/registers/scripts
untracked XFlow user-dashboard proof docs/registers
```

WordGeni status after adding the wrapper:

```text
?? scripts/verify-subscription-tier-proof.mjs
```

Other app repo statuses after verification:

```text
apps/Verixet: clean
apps/XFlow: clean
apps/RatAiFy: clean
apps/AudAix: clean
apps/CreVux: clean
```

Final post-commit status is reported in the task closeout because the root report and WordGeni wrapper live in separate git repositories.
