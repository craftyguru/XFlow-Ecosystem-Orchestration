# P3 Proof Gate Reliability Plan

## A. Executive Summary

Current proof-gate status: P0, P1, and P2 subscription-tier proof passes are complete enough to proceed, but the recurring proof system is not reliable enough to use as a release gate across all six apps. Root contract checks are green in the proof docs. Verixet, XFlow, RatAiFy, and AudAiX have usable focused proof commands. WordGeni and CreVux still have dependency-layout blockers that prevent focused Vitest, TypeScript, tsx, and Turbo checks from starting consistently. AudAiX has native SQLite ABI drift in two SQLite-backed suites. RatAiFy has a known broad-suite caveat from unrelated AudAiX proof-copy coverage.

What P0/P1/P2 proved:

- P0 proved Verixet remains billing, checkout, entitlement, usage, portal, and Stripe webhook authority, and satellites fail closed for paid/provider/premium work when Verixet authority is missing or inconclusive.
- P1 proved Verixet-owned generated catalog display data is consumed or mirrored by satellites so local package/pricing constants are not presented as final ecosystem billing truth.
- P2 proved RatAiFy, AudAiX, WordGeni, and CreVux package/add-on cleanup is complete enough to move forward, with local rows classified as Verixet-backed, fallback, local mirror, compatibility, legacy, manual, retired, missing, or non-self-serve.

What remains unreliable:

- WordGeni focused tests, package typechecks, and lint are blocked by missing package-local Vitest and TypeScript binaries, stale/missing Turbo links, and pnpm non-TTY purge risk.
- CreVux focused tests and typechecks are blocked by pnpm non-TTY purge risk plus missing/stale Vitest, tsx, TypeScript, `@vitest/utils`, `@types/node`, `vite/client`, and `esbuild` resolution.
- AudAiX SQLite-backed suites are blocked by a `better-sqlite3` native ABI mismatch.
- RatAiFy broad `verify:ci` can fail on unrelated AudAiX proof-copy expansion.
- Root has no single documented recurring subscription proof gate that separates code failures from dependency-layout and native-module failures.

Recommended P3 strategy: start with root proof-gate command design, then repair WordGeni dependency layout, CreVux dependency layout, AudAiX native ABI handling, RatAiFy broad-suite isolation, and finally wire the recurring gate. Root design should come first because it defines the target command set and failure taxonomy before dependency repair changes are made.

Recommended first area: root proof-gate consolidation as a docs/script design, followed immediately by WordGeni because P2 identifies WordGeni as the first P3 dependency-layout polish target. CreVux should follow closely because it has the broadest dependency-layout blocker set.

## B. Current Verification Inventory

### Verixet

- Existing typecheck commands: `npm --prefix apps/Verixet run typecheck`.
- Existing focused subscription/catalog tests: `npm --prefix apps/Verixet run test -- src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx`; P1 also records generated catalog and pricing client tests.
- Existing proof scripts: `npm --prefix apps/Verixet run stripe:price-env:verify`, `npm --prefix apps/Verixet run verify:verixet-local-proof`, `npm --prefix apps/Verixet run verify:routes`.
- Known passing commands: typecheck, focused P0 pricing/checkout/catalog suite, P1 generated catalog/pricing suite, `stripe:price-env:verify` with optional six-month warnings.
- Known blocked commands: none recorded for focused subscription/catalog gates.
- Known broad-suite caveats: historical Verixet broad `test` had an unrelated timeout in `src/lib/access-billing-control/service.behavior.test.ts`; not a P3 subscription proof blocker.
- Blocker category: no current subscription blocker; optional Stripe six-month env warnings are configuration warnings, not required gate failures.

### XFlow

- Existing typecheck commands: `npm --prefix apps/XFlow run typecheck`.
- Existing focused subscription/catalog tests: `npm --prefix apps/XFlow run test -- tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/showcase-chrome.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts`.
- Existing proof scripts: `npm --prefix apps/XFlow run verify:ecosystem-contract-proof`, `npm --prefix apps/XFlow run ops:verify-stripe-billing`, `npm --prefix apps/XFlow run verify:commercial-pack`.
- Known passing commands: typecheck and focused pricing/catalog/handoff tests.
- Known blocked commands: no focused subscription blocker recorded.
- Known broad-suite caveats: older `verify:ci` failed on `verify:audit-mutation-coverage`; P0/P1 focused subscription proof was not blocked.
- Blocker category: unrelated-suite-related for broad `verify:ci`; not dependency-layout or product subscription code.

### RatAiFy

- Existing typecheck commands: `npm --prefix apps/RatAiFy run typecheck`.
- Existing focused subscription/catalog tests: `npm --prefix apps/RatAiFy run test:billing`; P2 also records `npx tsx --test tests/billing-catalog.node.test.ts tests/rataify-pricing-authority.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts tests/rataify-usage-guards.node.test.ts`.
- Existing proof scripts: `npm --prefix apps/RatAiFy run verify:rataify-local-proof`, `npm --prefix apps/RatAiFy run verify:routes`, `npm --prefix apps/RatAiFy run verify:ci`.
- Known passing commands: typecheck, focused billing/catalog tests, entitlement/fail-closed tests, UI wiring tests.
- Known blocked commands: broad `verify:ci` is caveated, not a focused subscription blocker.
- Known broad-suite caveats: broad tests can expand into unrelated `tests/audaix-proof.node.test.ts` copy assertions.
- Blocker category: unrelated-suite-related.

### AudAiX

- Existing typecheck commands: `npm --prefix apps/AudAix run typecheck`.
- Existing focused subscription/catalog tests: `npm --prefix apps/AudAix run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/pricing-contract.test.ts tests/audaix-entitlements.test.ts`; dashboard: `npm --prefix apps/AudAix/dashboard test -- src/features/workspace-billing/WorkspaceBillingSections.test.tsx src/pages/PricingPage.test.tsx`.
- Existing proof scripts: `npm --prefix apps/AudAix run verify:routes`, `npm --prefix apps/AudAix run verify:audaix-local-proof`.
- Known passing commands: typecheck, focused billing/workspace/pricing/entitlement tests, dashboard billing/pricing tests, route verifier.
- Known blocked commands: `tests/entitlement-adapter.test.ts` and `tests/stripe-billing-webhook.test.ts`.
- Known broad-suite caveats: P1 records broad `tests/api.test.ts` 402 plan-gate caveat.
- Blocker category: native-module-related for `better-sqlite3`; unrelated-suite-related for broad 402 caveat.

### WordGeni

- Existing typecheck commands: root `pnpm typecheck`; package commands `npm --prefix apps/WordGeni/apps/api run typecheck` and `npm --prefix apps/WordGeni/apps/web run typecheck`.
- Existing focused subscription/catalog tests: `npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts`; `npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts`.
- Existing proof scripts: `node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs`, `pnpm stripe:proof`, `pnpm verify:routes`.
- Known passing commands: `git -C apps/WordGeni diff --check`; `node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs`.
- Known blocked commands: focused API/web Vitest, package-local API/web typechecks, root/touched-file lint through Turbo, and pnpm root scripts if they prompt for non-TTY purge.
- Known broad-suite caveats: broad tests may expand into unrelated failures; P2 did not rely on them.
- Blocker category: dependency-layout-related, stale-symlink-related, and package-manager-state-related. Evidence is insufficient to call it product-code-related.

### CreVux

- Existing typecheck commands: root `pnpm run typecheck`; package commands `pnpm --filter @workspace/api-server run typecheck`, `pnpm --filter @workspace/image-gen run typecheck`, `pnpm --filter @workspace/saas-entitlements run typecheck`.
- Existing focused subscription/catalog tests: `pnpm --filter @workspace/saas-entitlements run test`; `pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts`; `pnpm --filter @workspace/api-server exec vitest run src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts`; `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx src/pages/AdminDashboardPage.test.tsx`.
- Existing proof scripts: `node apps/CreVux/scripts/verify-crevux-local-proof.mjs`, `pnpm run verify:routes`, `pnpm run verify:security`.
- Known passing commands: `git -C apps/CreVux diff --check`; `node apps/CreVux/scripts/verify-crevux-local-proof.mjs`.
- Known blocked commands: filtered pnpm SaaS/API/image-gen tests and typechecks; package-local direct Vitest, TypeScript, and tsx attempts; fallback root-shim attempts.
- Known broad-suite caveats: root `pnpm run typecheck` and `pnpm run test` may hit dependency-layout and non-TTY purge blockers before assertions.
- Blocker category: dependency-layout-related and package-manager-state-related. Not currently proven product-code-related.

### Root Commands

- `npm run proof:billing-contracts`: existing root command; P0/P1/P2 record pass. It runs ecosystem contract validation plus static ecosystem proof.
- `npm run proof:ecosystem:static`: existing root command; P0/P1/P2 record pass.
- `npm run validate:ecosystem-contracts`: existing root command; P0/P1/P2 record pass.

## C. Blocker Matrix

| Area | Command | Failure/blocker | Evidence/source | Root cause category | Risk | Recommended fix | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WordGeni API Vitest | `npm --prefix apps/WordGeni/apps/api run test -- ...` | Missing package-local Vitest binary at `apps/WordGeni/apps/api/node_modules/vitest/vitest.mjs` | `docs/subscription-tier-p2-wordgeni-plan-cleanup-proof.md` | Dependency-layout / missing install or broken local link | Focused API proof cannot run | Dedicated WordGeni pnpm maintenance pass; restore package-local or workspace-resolvable Vitest without product changes | P1 |
| WordGeni web Vitest | `npm --prefix apps/WordGeni/apps/web run test -- ...` | Missing package-local Vitest binary at `apps/WordGeni/apps/web/node_modules/vitest/vitest.mjs` | P2 WordGeni proof | Dependency-layout / missing install or broken local link | Focused web pricing proof cannot run | Same WordGeni dependency repair; verify from app package root | P1 |
| WordGeni API TypeScript | `npm --prefix apps/WordGeni/apps/api run typecheck` | Missing package-local TypeScript binary at `apps/WordGeni/apps/api/node_modules/typescript/bin/tsc` | P2 WordGeni proof | Dependency-layout / missing install or broken local link | API type safety proof blocked | Restore TypeScript resolution through pnpm workspace install/link repair | P1 |
| WordGeni web TypeScript | `npm --prefix apps/WordGeni/apps/web run typecheck` | Missing package-local TypeScript binary at `apps/WordGeni/apps/web/node_modules/typescript/bin/tsc` | P2 WordGeni proof | Dependency-layout / missing install or broken local link | Web type safety proof blocked | Restore TypeScript resolution through pnpm workspace install/link repair | P1 |
| WordGeni Turbo | `npm --prefix apps/WordGeni run lint -- ...` and root `pnpm typecheck/lint` | Missing/stale Turbo binary at `apps/WordGeni/node_modules/turbo/bin/turbo` | P2 WordGeni proof | Stale symlink / dependency-layout | Root package proof scripts cannot orchestrate package checks | Repair WordGeni root `node_modules/.bin/turbo` and target package link state | P1 |
| WordGeni pnpm | `pnpm typecheck`, `pnpm test`, `pnpm lint` from `apps/WordGeni` | `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` risk | P0/P2 proof history | Package-manager state mismatch | Non-interactive proof gate aborts or asks to purge modules | Plan explicit approved pnpm maintenance; do not force purge during planning | P1 |
| CreVux pnpm | `pnpm --filter @workspace/saas-entitlements run test` and filtered workspace commands | `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY]` | `docs/subscription-tier-p2-crevux-saas-credit-cleanup-proof.md` | Package-manager state mismatch | Filtered workspace proofs cannot start safely | Dedicated CreVux pnpm maintenance with explicit approval; preserve lockfile unless approved | P1 |
| CreVux API Vitest | `pnpm --filter @workspace/api-server exec vitest run ...` or direct package Vitest | Missing/stale `vitest.mjs` | P2 CreVux proof and rollup | Dependency-layout / stale link | Focused API admission/billing tests blocked | Restore package-local Vitest and transitive Vitest targets | P1 |
| CreVux image-gen Vitest | `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts ...` | Missing `@vitest/utils` | P2 CreVux proof | Dependency-layout / missing transitive dependency | Focused pricing/admin UI tests blocked | Repair image-gen dependency layout through pnpm, not ad hoc copying | P1 |
| CreVux tsx | API/SaaS verifier commands using `tsx` | Missing/stale package-local `tsx` target | P2 CreVux proof | Dependency-layout / stale link | Script proof commands cannot start | Restore catalog `tsx` dependency links in root and packages | P1 |
| CreVux TypeScript shims | API, image-gen, SaaS package typechecks | Missing package-local TypeScript shims | P2 CreVux proof | Dependency-layout / missing link | Type safety proof blocked | Restore package-local or workspace-resolvable TypeScript | P1 |
| CreVux `@types/node` | Fallback API/image-gen typecheck | Missing `@types/node` | P2 CreVux proof | Dependency-layout / catalog link missing | Typechecks fail before relevant code validation | Restore catalog dependency link; verify no package.json mutation unless approved | P2 |
| CreVux `vite/client` | Fallback image-gen typecheck | Missing `vite/client` | P2 CreVux proof | Dependency-layout / Vite package resolution missing | UI typecheck blocked | Restore Vite package resolution in image-gen workspace | P2 |
| CreVux `esbuild` | Fallback root `tsx` execution | Missing `esbuild` | P2 CreVux proof | Dependency-layout / native optional package missing | tsx verifier commands fail | Restore esbuild via approved pnpm maintenance; avoid manual native rebuild during planning | P2 |
| AudAiX SQLite ABI | `npm --prefix apps/AudAix run test -- tests/entitlement-adapter.test.ts tests/stripe-billing-webhook.test.ts` | `better-sqlite3` compiled against `NODE_MODULE_VERSION 127`; current Node requires `137` | `docs/subscription-tier-p2-audaix-workspace-cleanup-proof.md` | Native-module ABI mismatch | SQLite-backed entitlement/webhook proof unavailable | Rebuild/reinstall native module in dedicated maintenance pass or CI image aligned to Node | P1 |
| RatAiFy broad suite | `npm --prefix apps/RatAiFy run verify:ci` | Broad test expansion can hit unrelated AudAiX proof-copy assertion | P0/P1/P2 proof docs | Unrelated-suite-related | Release gate can fail on non-subscription copy drift | Split focused subscription proof from broad app proof; keep broad as separate required app health gate after fix | P2 |
| Root recurring gate | No single root subscription gate yet | Command set not formalized; blockers not classified | P2 rollup and current root package scripts | Proof-gate design gap | Teams may run inconsistent proof sets | Add root-owned script/doc gate that reports required, optional, dependency-blocked, and unrelated-suite failures separately | P0 |

## D. Root Cause Analysis

WordGeni:

- Missing dependency install: likely, because package-local Vitest and TypeScript targets are absent, but the current evidence cannot prove whether they were never installed or later removed.
- Stale symlinks: yes for Turbo, based on the recorded stale/missing `apps/WordGeni/node_modules/turbo/bin/turbo` target.
- Package-manager mismatch: likely. WordGeni declares `packageManager: pnpm@9.15.0`; prior pnpm commands hit non-TTY module purge prompts, which usually indicates the modules directory does not match the active pnpm/workspace layout.
- Native module ABI mismatch: no evidence for WordGeni.
- Wrong workspace root: possible for some package-local `npm --prefix` checks, but P1 notes package-root invocation matters for aliases. The missing binary failures occur before alias resolution, so root selection is not the primary proven cause.
- Broad tests pulling unrelated proof files: possible but not the current focused blocker.
- Actual product code: no evidence. Failures occur before relevant tests or typechecks execute.

CreVux:

- Missing dependency install: likely, because `@vitest/utils`, `@types/node`, `vite/client`, `esbuild`, and package-local TypeScript/tsx/Vitest targets are missing.
- Stale symlinks: yes, based on missing/stale `vitest.mjs` and `tsx` targets.
- Package-manager mismatch: yes. CreVux declares `packageManager: pnpm@10.30.3`, uses catalog dependencies, and pnpm aborts module removal without TTY.
- Native module ABI mismatch: not the recorded blocker, although `esbuild` may involve platform package restoration.
- Wrong workspace root: not the primary proven cause. Both filtered pnpm and direct package attempts are blocked by missing dependency targets.
- Broad tests pulling unrelated proof files: not the primary blocker.
- Actual product code: no evidence. Failures occur before relevant tests execute.

AudAiX:

- Missing dependency install: possible if native binary artifacts are stale, but the specific evidence is ABI mismatch.
- Stale symlinks: no direct evidence.
- Package-manager mismatch: no direct evidence; AudAiX uses npm.
- Native module ABI mismatch: yes. `better-sqlite3` was compiled against Node module ABI 127, while the current Node requires 137.
- Wrong workspace root: no evidence.
- Broad tests pulling unrelated proof files: P1 records a broad 402 caveat, but the SQLite-backed blocker is native ABI.
- Actual product code: no evidence for the blocked suites because the native module fails before test assertions.

RatAiFy:

- Missing dependency install: no evidence for the subscription proof blockers.
- Stale symlinks: no evidence.
- Package-manager mismatch: no evidence.
- Native module ABI mismatch: no evidence.
- Wrong workspace root: no evidence.
- Broad tests pulling unrelated proof files: yes. Broad `verify:ci` can include unrelated AudAiX proof-copy assertions.
- Actual product code: no evidence for the subscription proof blocker; focused subscription tests passed.

Root proof gate:

- Missing dependency install: not directly.
- Stale symlinks: not directly.
- Package-manager mismatch: root cannot hide app-local package-manager issues.
- Native module ABI mismatch: root must classify AudAiX native ABI failures.
- Wrong workspace root: root must execute each app from its correct package root.
- Broad tests pulling unrelated proof files: root must avoid using broad suites as the only subscription proof path.
- Actual product code: not the issue; the gap is orchestration and failure taxonomy.

## E. Safe Repair Strategy

Recommended order:

1. Root proof-gate command design.
2. WordGeni dependency-layout repair plan.
3. CreVux dependency-layout repair plan.
4. AudAiX native module ABI repair plan.
5. RatAiFy broad-suite proof-copy isolation.
6. Final recurring subscription safety gate.

### 1. Root proof-gate command design

- Files likely touched: root `package.json`, a new root script under `scripts/`, and final proof docs. This planning pass touches only this doc.
- Commands to run: `npm run proof:billing-contracts`, `npm run proof:ecosystem:static`, `npm run validate:ecosystem-contracts`, then each focused app command listed in Section F.
- What must not change: product code, app package manifests, lockfiles, Stripe behavior, entitlement logic, proof tests.
- How to verify: run the root gate in report-only mode first and confirm it distinguishes pass, fail, skipped optional, dependency blocked, and unrelated broad-suite blocked.
- Rollback risk: low for script-only changes; root `package.json` script additions can be reverted cleanly.
- Repo ownership: root repo.

### 2. WordGeni dependency-layout repair plan

- Files likely touched: ideally none besides dependency install artifacts; if approved, `apps/WordGeni/pnpm-lock.yaml` only if pnpm legitimately changes it. No production files.
- Commands to run after approval: from `apps/WordGeni`, use the project-pinned pnpm 9.15.0; run a frozen lockfile install or equivalent package-manager repair; then run focused API/web Vitest, API/web typechecks, touched-file lint, and `node scripts/verify-wordgeni-local-proof.mjs`.
- What must not change: checkout, Stripe webhook logic, Stripe price IDs, schemas, migrations, entitlement enforcement, AI usage enforcement, catalog semantics.
- How to verify: package-local Vitest/TypeScript binaries exist, Turbo resolves, pnpm no longer asks for non-TTY purge, focused WordGeni checks pass.
- Rollback risk: medium if lockfile or modules state changes; low product risk if manifests and code stay untouched.
- Repo ownership: app repo `apps/WordGeni`.

### 3. CreVux dependency-layout repair plan

- Files likely touched: ideally none besides dependency install artifacts; if approved, `apps/CreVux/pnpm-lock.yaml` only if pnpm legitimately changes it. No production files.
- Commands to run after approval: from `apps/CreVux`, use project-pinned pnpm 10.30.3; run frozen lockfile install/repair; then run SaaS entitlement proof, API focused Vitest, image-gen focused Vitest, API/image-gen/SaaS typechecks, credit top-up verifier, and local proof verifier.
- What must not change: media generation enforcement, usage admission, Stripe logic, checkout, schemas, migrations, package/add-on authority semantics.
- How to verify: `vitest`, `tsx`, `tsc`, `@vitest/utils`, `@types/node`, `vite/client`, and `esbuild` resolve through pnpm; no non-TTY purge prompt remains.
- Rollback risk: medium due to pnpm catalog/workspace layout; low product risk if only dependency state changes.
- Repo ownership: app repo `apps/CreVux`.

### 4. AudAiX native module ABI repair plan

- Files likely touched: ideally none; if approved, dependency artifacts only. Lockfile changes should be avoided unless an explicit dependency version change is approved.
- Commands to run after approval: from `apps/AudAix`, rebuild or reinstall `better-sqlite3` under Node 22.18.x, then run blocked SQLite-backed tests plus the existing focused billing/workspace/dashboard route proof.
- What must not change: AudAiX billing logic, webhook logic, plan constants, schemas, migrations.
- How to verify: `better-sqlite3` loads under current Node ABI 137 and the two blocked suites start and pass/fail on assertions rather than native load.
- Rollback risk: low to medium locally; CI repair should be pinned to Node version to reduce recurrence.
- Repo ownership: app repo `apps/AudAix` and CI image/config if the issue exists in CI.

### 5. RatAiFy broad-suite proof-copy isolation

- Files likely touched: `apps/RatAiFy/package.json` only if adding a focused script, and possibly unrelated proof-copy tests if later approved. Prefer adding a focused subscription proof script before changing broad tests.
- Commands to run: existing focused `test:billing`, entitlement tests, typecheck, and separate broad `verify:ci` after unrelated copy drift is fixed.
- What must not change: fail-closed entitlement behavior, billing catalog classifications, Verixet handoff behavior.
- How to verify: focused subscription proof passes without invoking `tests/audaix-proof.node.test.ts`; broad suite remains tracked separately.
- Rollback risk: low for script additions; medium if broad tests are refactored.
- Repo ownership: app repo `apps/RatAiFy`.

### 6. Final recurring subscription safety gate

- Files likely touched: root `package.json`, root proof script, final P3 proof summary.
- Commands to run: required root and app commands in Section F.
- What must not change: no live Stripe dependency unless explicitly configured; no installs/rebuilds inside proof scripts.
- How to verify: one root command runs required focused proof set and reports optional warnings separately.
- Rollback risk: low if script-only.
- Repo ownership: root repo.

## F. Recurring Subscription Safety Gate Design

The gate should be root-owned and run app commands from the correct working directories. It should not install dependencies, purge modules, rebuild native modules, mutate Stripe, write schemas, or modify generated catalogs unless a command is explicitly documented as a read-only verifier.

| Proof area | Exact command | Working directory | Expected pass result | Known prerequisites | What failure means | Required |
| --- | --- | --- | --- | --- | --- | --- |
| Root contract proofs | `npm run proof:billing-contracts` | root | Contract validation and static ecosystem proof pass | npm root deps available | Ecosystem contracts/static proof drift | Required |
| Root static proof | `npm run proof:ecosystem:static` | root | Static proof passes | npm root deps available | Static contract or proof scanner drift | Required |
| Root ecosystem contract validation | `npm run validate:ecosystem-contracts` | root | Apps/env/routes/token contract counts validate | npm root deps available | Contract JSON drift | Required |
| Verixet catalog export proof | `npm --prefix apps/Verixet run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx src/components/marketing/pricing/PricingCatalogClient.test.tsx` | root | Generated catalog and public pricing tests pass | Verixet npm deps installed | Verixet catalog export/display drift | Required |
| Verixet checkout/pricing proof | `npm --prefix apps/Verixet run test -- src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx` | root | Checkout/top-up/catalog/pricing suite passes | Verixet npm deps installed | Billing authority or checkout safety regression | Required |
| Verixet typecheck | `npm --prefix apps/Verixet run typecheck` | root | Next typegen and TypeScript pass | Verixet npm deps installed | Type contract regression | Required |
| Verixet Stripe price env | `npm --prefix apps/Verixet run stripe:price-env:verify` | root | Required price/product env checks pass; optional six-month warnings allowed | Stripe env configured for verification | Required Stripe catalog env drift; optional warning if six-month only | Optional warning unless release explicitly includes six-month |
| XFlow pricing/handoff proof | `npm --prefix apps/XFlow run test -- tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/showcase-chrome.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts` | root | Focused pricing/catalog/handoff tests pass | XFlow npm deps installed | XFlow display/handoff drift | Required |
| XFlow typecheck | `npm --prefix apps/XFlow run typecheck` | root | TypeScript passes | XFlow npm deps installed | XFlow type regression | Required |
| RatAiFy package/catalog/entitlement proof | `npm --prefix apps/RatAiFy run test:billing` | root | Focused billing catalog tests pass | RatAiFy npm deps installed | RatAiFy package/catalog/entitlement drift | Required |
| RatAiFy focused safety proof | `npx --prefix apps/RatAiFy tsx --test tests/billing-catalog.node.test.ts tests/rataify-pricing-authority.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts tests/rataify-usage-guards.node.test.ts` | root | Focused proof tests pass | RatAiFy npm deps installed | Fail-closed or catalog authority regression | Required |
| RatAiFy typecheck | `npm --prefix apps/RatAiFy run typecheck` | root | TypeScript passes | RatAiFy npm deps installed | RatAiFy type regression | Required |
| AudAiX workspace/billing proof | `npm --prefix apps/AudAix run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/pricing-contract.test.ts tests/audaix-entitlements.test.ts` | root | Focused workspace/billing tests pass | AudAiX npm deps installed | AudAiX plan/catalog/entitlement drift | Required |
| AudAiX dashboard billing proof | `npm --prefix apps/AudAix/dashboard test -- src/features/workspace-billing/WorkspaceBillingSections.test.tsx src/pages/PricingPage.test.tsx` | root | Dashboard billing/pricing tests pass | Dashboard deps installed | Dashboard billing copy/display drift | Required |
| AudAiX route proof | `npm --prefix apps/AudAix run verify:routes` | root | Local route proof passes | AudAiX npm deps installed | Route proof drift | Required |
| AudAiX typecheck | `npm --prefix apps/AudAix run typecheck` | root | TypeScript passes | AudAiX npm deps installed | AudAiX type regression | Required |
| AudAiX SQLite entitlement/webhook proof | `npm --prefix apps/AudAix run test -- tests/entitlement-adapter.test.ts tests/stripe-billing-webhook.test.ts` | root | Tests pass after ABI repair | `better-sqlite3` built for active Node ABI | Entitlement/webhook regression if dependencies load; dependency blocker if ABI mismatch | Required after ABI repair; dependency-blocked before repair |
| WordGeni local proof | `node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs` | root | Local proof verifier passes | Node available | Static/local WordGeni proof drift | Required now |
| WordGeni API proof | `npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts` | root | Focused API tests pass | WordGeni dependency layout repaired | WordGeni plan/usage/billing regression, or dependency-blocked if binaries missing | Required after dependency repair |
| WordGeni web pricing proof | `npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts` | root | Focused web pricing test passes | WordGeni dependency layout repaired | WordGeni pricing UI/handoff drift | Required after dependency repair |
| WordGeni API typecheck | `npm --prefix apps/WordGeni/apps/api run typecheck` | root | API typecheck passes | WordGeni dependency layout repaired | API type regression | Required after dependency repair |
| WordGeni web typecheck | `npm --prefix apps/WordGeni/apps/web run typecheck` | root | Web typecheck passes | WordGeni dependency layout repaired | Web type regression | Required after dependency repair |
| CreVux local proof | `node apps/CreVux/scripts/verify-crevux-local-proof.mjs` | root | Local proof verifier passes | Node available | Static/local CreVux proof drift | Required now |
| CreVux SaaS/credit proof | `pnpm --filter @workspace/saas-entitlements run test` | `apps/CreVux` | SaaS entitlement policy proof passes | CreVux pnpm layout repaired | SaaS/credit classification regression, or dependency-blocked if pnpm layout broken | Required after dependency repair |
| CreVux API SaaS/media proof | `pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts` | `apps/CreVux` | Focused API billing/admission tests pass | CreVux dependency layout repaired | Media admission or billing truthfulness regression | Required after dependency repair |
| CreVux media UI proof | `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx src/pages/AdminDashboardPage.test.tsx` | `apps/CreVux` | Focused image-gen UI tests pass | CreVux dependency layout repaired | SaaS/media pricing display drift | Required after dependency repair |
| CreVux typechecks | `pnpm --filter @workspace/api-server run typecheck && pnpm --filter @workspace/image-gen run typecheck && pnpm --filter @workspace/saas-entitlements run typecheck` | `apps/CreVux` | Package typechecks pass | CreVux dependency layout repaired | Type regression | Required after dependency repair |
| CreVux credit top-up proof | `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-credit-topup-wiring.ts` | `apps/CreVux` | Credit top-up verifier passes | CreVux dependency layout repaired | Credit/top-up wiring regression | Required after dependency repair |

## G. Implementation Plan

Commit 1: Docs-only proof-gate plan.

- Files likely touched: `docs/subscription-tier-p3-proof-gate-reliability-plan.md`.
- Exact intended behavior: planning only; no behavior change.
- Verification commands: `git status --short`; app-level `git -C ... status --short`.
- Rollback risk: low.
- What must not change: all code, tests, package manifests, lockfiles, CI, dependencies, generated catalogs.

Commit 2: Root recurring proof-gate script, if safe.

- Files likely touched: root `package.json`, `scripts/proof-subscription-tier-gate.mjs`, docs.
- Exact intended behavior: run existing safe proof commands and classify blocked dependency/native/unrelated broad-suite failures without installing or rebuilding.
- Verification commands: root contract commands and report-only root gate.
- Rollback risk: low.
- What must not change: app product code, tests, package dependencies, lockfiles.

Commit 3: WordGeni dependency-layout repair.

- Files likely touched: dependency artifacts; possibly WordGeni lockfile only if explicitly approved.
- Exact intended behavior: restore package-local Vitest, TypeScript, Turbo, ESLint, and pnpm link resolution.
- Verification commands: WordGeni focused API/web tests, API/web typechecks, lint, local proof.
- Rollback risk: medium because dependency state changes can be noisy.
- What must not change: WordGeni product behavior, checkout, Stripe, schemas, entitlement and usage enforcement.

Commit 4: CreVux dependency-layout repair.

- Files likely touched: dependency artifacts; possibly CreVux lockfile only if explicitly approved.
- Exact intended behavior: restore pnpm filtered command execution and missing Vitest/tsx/TypeScript/transitive module resolution.
- Verification commands: CreVux SaaS proof, API proof, image-gen proof, typechecks, credit top-up verifier, local proof.
- Rollback risk: medium because catalog workspace dependency state can be sensitive.
- What must not change: CreVux media enforcement, Stripe, schemas, checkout, usage admission, package authority.

Commit 5: AudAiX native ABI repair instructions or CI-safe rebuild path.

- Files likely touched: CI config or docs if local-only; dependency artifacts if local repair is approved.
- Exact intended behavior: ensure `better-sqlite3` is built for Node 22.18.x ABI in local and CI proof environments.
- Verification commands: blocked SQLite-backed tests, existing focused AudAiX proof set.
- Rollback risk: medium if CI image changes; low if docs-only.
- What must not change: AudAiX product code, billing logic, schemas, migrations.

Commit 6: RatAiFy broad-suite proof-copy isolation.

- Files likely touched: RatAiFy package scripts or broad proof-copy tests if approved.
- Exact intended behavior: focused subscription proof can run independently of unrelated AudAiX proof-copy checks.
- Verification commands: `npm --prefix apps/RatAiFy run test:billing`, focused `npx --prefix apps/RatAiFy tsx --test ...`, typecheck, then broad `verify:ci` separately.
- Rollback risk: low to medium.
- What must not change: fail-closed behavior or Verixet authority classifications.

Commit 7: Final P3 proof summary.

- Files likely touched: one final P3 proof doc.
- Exact intended behavior: record final commands, pass/fail/blocker status, and remaining caveats.
- Verification commands: final root recurring gate and app-level status.
- Rollback risk: low.
- What must not change: production code.

## H. Launch Safety Rules

- Do not run broad dependency installs without explicit approval.
- Do not modify lockfiles unless the task explicitly allows it.
- Do not rebuild native modules unless the task explicitly allows it.
- Do not hide dependency blockers as test failures.
- Do not weaken P0/P1/P2 subscription safety tests to make CI pass.
- Do not remove fail-closed behavior.
- Do not convert proof scripts into mutation scripts.
- Do not make root proof gate depend on live Stripe unless explicitly configured.
- Keep local proof commands deterministic where possible.
- Keep optional Stripe six-month warnings separate from required monthly/yearly release blockers unless a six-month release is in scope.
- Run app commands from their intended app/package roots.
- Classify failures as product-code, dependency-layout, native-module, package-manager-state, unrelated-suite, or external-configuration before assigning ownership.

## I. Open Questions

1. Should dependency repair happen app-by-app or root-first?

Root proof-gate design should happen first, then dependency repair should happen app-by-app. The root design defines the required commands and classification rules; app-by-app repair limits blast radius.

2. Should WordGeni and CreVux dependency repairs use pnpm install, npm install, or package-local script repair?

Use each app's declared package manager. WordGeni should use pnpm 9.15.0. CreVux should use pnpm 10.30.3. Do not use npm install in these pnpm workspaces unless a specific package script already does so for a nested npm package and the app documents it. Package-local script repair alone is insufficient if module targets are missing.

3. Should AudAiX `better-sqlite3` be rebuilt locally or only in CI?

Both environments need a reliable answer, but the first implementation should define a CI-safe rebuild or install path pinned to Node 22.18.x. Local rebuild should be done only in an approved dependency/native maintenance pass.

4. Should RatAiFy broad `verify:ci` be split into focused subscription proof and broad app proof?

Yes. Focused subscription proof should be required for subscription releases. Broad `verify:ci` should remain important, but it should not be the only subscription signal while it can fail on unrelated AudAiX proof-copy assertions.

5. Should the recurring proof gate be root-owned or app-owned?

Root-owned orchestration with app-owned commands. The root gate should call app scripts from correct working directories and should not duplicate app test logic.

6. Should the recurring gate fail on optional Stripe six-month warnings?

No for normal monthly/yearly subscription releases. It should report optional six-month warnings separately. It should fail on six-month warnings only when six-month pricing is explicitly in release scope.

7. What is the safest first implementation commit?

A root docs/script-only proof-gate scaffold that runs existing safe commands in report-only mode and classifies known dependency/native blockers without installing, rebuilding, or changing app code.

## J. Final Recommendation

1. Is P3 ready for implementation?

Yes, if implementation starts with root proof-gate design and keeps dependency repair as separate approved maintenance commits. It is not ready for a one-shot "make CI green" pass.

2. What should be fixed first?

Fix the root recurring proof-gate design first, then WordGeni dependency layout, then CreVux dependency layout, then AudAiX `better-sqlite3` ABI handling, then RatAiFy broad-suite isolation.

3. Which blocker is most dangerous to release confidence?

The WordGeni and CreVux dependency-layout blockers are the most dangerous because they prevent focused subscription tests and typechecks from starting. Among them, CreVux has the widest missing dependency surface, while WordGeni is the recommended first app repair because P2 identified it as the first P3 target and its proof surface is narrower.

4. Which commands should become the recurring subscription safety gate?

The gate should include:

- `npm run proof:billing-contracts`
- `npm run proof:ecosystem:static`
- `npm run validate:ecosystem-contracts`
- Verixet focused catalog/export, checkout/pricing, typecheck, and required Stripe price env verification.
- XFlow focused pricing/handoff tests and typecheck.
- RatAiFy focused billing/catalog/entitlement tests and typecheck.
- AudAiX focused workspace/billing/dashboard/route tests and typecheck, plus SQLite-backed entitlement/webhook tests after ABI repair.
- WordGeni local proof immediately, then API/web focused tests and typechecks after dependency repair.
- CreVux local proof immediately, then SaaS/API/image-gen focused tests, typechecks, and credit top-up verifier after dependency repair.

5. What exact next implementation prompt should be used?

```text
Implement P3 commit 2: add a root recurring subscription proof-gate script in report-only mode.

Use `docs/subscription-tier-p3-proof-gate-reliability-plan.md` as the source of truth.

Scope:
* Add a root proof script and package.json command only if safe.
* Run existing safe read-only proof commands.
* Do not install dependencies, force pnpm module purge, rebuild native modules, modify lockfiles, change app package.json files, change production code, change tests, or change CI.
* Classify failures as product-code, dependency-layout, native-module, package-manager-state, unrelated-suite, optional-config, or unknown.
* Treat WordGeni, CreVux, and AudAiX known blockers as blockers to repair, not as subscription product failures.
* Keep optional Verixet six-month Stripe warnings non-fatal unless explicitly configured.

Required output:
* Root command name.
* Exact commands included.
* Which commands are required now versus required after dependency repair.
* Final status and no production-code-change confirmation.
```

## Status Evidence

Commands run during this planning pass:

```powershell
git status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/RatAiFy status --short
git -C apps/AudAix status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
```

Status result before creating this doc:

- Root: dirty with pre-existing `M package.json` plus unrelated untracked docs and scripts.
- `apps/Verixet`: clean.
- `apps/XFlow`: clean.
- `apps/RatAiFy`: clean.
- `apps/AudAix`: clean.
- `apps/WordGeni`: clean.
- `apps/CreVux`: clean.

This P3 pass is planning-only. No production code, tests, package manifests, lockfiles, CI files, dependency installs, pnpm purges, native rebuilds, schemas, migrations, Stripe logic, checkout flows, entitlement enforcement, usage admission enforcement, media generation enforcement, or package/add-on architecture were changed.
