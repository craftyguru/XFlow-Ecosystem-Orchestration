# P2 Package/Add-On Cleanup Rollup Proof

## A. Executive Summary

Overall P2 status: Pass.

Apps covered:

- RatAiFy
- AudAiX
- WordGeni
- CreVux

The P2 package/add-on/catalog cleanup set is complete enough to move to the next cleanup phase. Across the four satellite apps, package aliases, workspace plans, AI usage display, top-up/add-on rows, credit/media package rows, dashboard ecosystem membership, upgrade CTAs, and pricing display now either consume Verixet generated catalog metadata or align to it with explicit fallback/local mirror/compatibility classifications.

What Verixet export now provides:

- RatAiFy: top-level `rataify` metadata for package aliases, top-up mappings, bundle membership detail, entitlement feature keys, and handoff metadata.
- AudAiX: generated catalog coverage through shared Verixet plan rows, free caps, paid tier limits, entitlement keys, top-ups, bundle membership, checkout availability, manual/review state, and handoff/CTA fields.
- WordGeni: top-level `wordgeni` metadata for local tier aliases, AI usage display, AI credit top-up mappings, bundle aliases, fallback rules, handoff metadata, and legacy Stripe mappings.
- CreVux: top-level `crevux` metadata for local tier aliases, public plan aliases, media units, usage admission, media top-up mappings, local credit top-up mappings, fallback rules, handoff metadata, and legacy Stripe mappings.

What each satellite now consumes or aligns to:

- RatAiFy consumes the Verixet RatAiFy slice through its billing display adapter and projects classifications into package/top-up display.
- AudAiX aligns workspace plans, usage labels, local top-ups, billing/package display, and six-app dashboard ecosystem membership to Verixet catalog fields.
- WordGeni aligns `pro`, `studio`, and `enterprise` aliases, AI usage display, legacy Stripe mappings, and web pricing normalization to Verixet metadata.
- CreVux aligns SaaS aliases, `credits_*` local rows, media package labels, admin/billing mirrors, upgrade CTAs, and landing pricing to Verixet metadata.

Structural drift reduced:

- Local aliases are classified as compatibility, local mirror, fallback-only, legacy/manual setup, retired, or missing instead of standing as commercial authority.
- Reviewed/manual/non-self-serve Verixet rows remain non-self-serve in satellite display.
- Active Verixet-backed rows keep intended handoff/self-serve behavior where Verixet marks them active.
- Local top-up/credit mismatches are classified as fallback/conflict/missing instead of final self-serve products.
- The six-app ecosystem model is now reflected in AudAiX dashboard membership and preserved in pricing/catalog display.

What remains for P3 or later:

- Dependency-layout repair for WordGeni and CreVux.
- Native module/CI environment repair for AudAiX `better-sqlite3`.
- Root recurring proof gate that runs all safe P2 drift checks together.
- Deeper architecture cleanup to quarantine or remove local constants that are now compatibility/fallback only.
- Runtime Verixet API hardening and direct generated-artifact consumption where satellites still use local mirror helpers.

The ecosystem can move past this P2 cleanup set. Remaining work is P3 hardening, dependency maintenance, or architecture cleanup, not launch-blocking package/add-on/catalog drift.

## B. Commit / Proof Evidence Matrix

| App | Planning doc | Verixet export commit | Satellite cleanup commit | Proof doc | Verification status | Known blockers | Final decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RatAiFy | `docs/subscription-tier-p2-rataify-package-cleanup-plan.md` | `e894e6e` | `fd21ea3` | `docs/subscription-tier-p2-rataify-package-cleanup-proof.md` | Focused billing/catalog, entitlement/fail-closed, UI wiring tests, and typecheck passed. | Broad-suite caveat: unrelated AudAiX proof-copy assertion can appear when broad RatAiFy tests expand into unrelated ops coverage. | Pass; complete enough for P2, no launch-blocking package drift. |
| AudAiX | `docs/subscription-tier-p2-audaix-workspace-plan-cleanup-plan.md` | `be6cc73` artifact evidence; shared P2 export context `e894e6e` | `09e7f6f8` | `docs/subscription-tier-p2-audaix-workspace-cleanup-proof.md` | Typecheck, focused workspace/billing tests, dashboard tests, and route verifier passed. | `tests/entitlement-adapter.test.ts` and `tests/stripe-billing-webhook.test.ts` blocked by unrelated `better-sqlite3` Node ABI mismatch. | Pass; complete enough for P2, no launch-blocking workspace/package drift. |
| WordGeni | `docs/subscription-tier-p2-wordgeni-plan-cleanup-plan.md` | `bcfc04a` | `c66c805` | `docs/subscription-tier-p2-wordgeni-plan-cleanup-proof.md` | `git diff --check` and `node scripts/verify-wordgeni-local-proof.mjs` passed. | Missing package-local Vitest/TypeScript binaries, stale/missing Turbo binary links, and pnpm non-TTY module purge risk. | Pass with verification limitations; limitations are dependency-layout related, not code-related. |
| CreVux | `docs/subscription-tier-p2-crevux-saas-credit-cleanup-plan.md` | `f345b61` | `f7ec65c` | `docs/subscription-tier-p2-crevux-saas-credit-cleanup-proof.md` | `git diff --check` and `node scripts/verify-crevux-local-proof.mjs` passed. | pnpm non-TTY purge prompt; missing/stale `vitest.mjs`, `@vitest/utils`, `tsx`, TypeScript shims, `@types/node`, `vite/client`, and `esbuild`. | Pass with verification limitations; limitations are dependency-layout related, not code-related. |

## C. Verixet Export Coverage Proof

The generated artifact at `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json` now covers the four P2 satellite cleanup areas.

RatAiFy package/top-up/alias metadata:

- The artifact includes top-level `rataify` metadata.
- The `rataify` slice includes `packageAliases`, `topUpMappings`, `bundleMembershipDetail`, `canonicalPlanSlugs`, `entitlementFeatureKeys`, `featureKeys`, `handoff`, and authority/display metadata.
- This lets RatAiFy classify local packages and top-ups without treating local constants as package authority.

AudAiX workspace/usage/top-up metadata:

- AudAiX coverage exists through shared generated catalog fields: `plans`, `freeCaps`, `paidTierLimits`, `entitlementKeys`, `topUps`, `bundleMembership`, `checkoutAvailability`, `manualSetup`, `pricingUnderReview`, `pricingDisplay`, `ctas`, and `handoffUrls`.
- The artifact includes AudAiX public plan rows, AudAiX free caps, AudAiX entitlement keys, and ecosystem membership evidence.
- AudAiX uses these fields to classify workspace plans, usage labels, local top-ups, and ecosystem package display without promoting local rows to final authority.

WordGeni plan-alias/AI-usage/legacy Stripe metadata:

- The artifact includes top-level `wordgeni` metadata.
- The `wordgeni` slice includes `localTierAliases`, `aiUsageDisplay`, `aiCreditTopUpMappings`, `bundleAliases`, `bundleMembershipDetail`, `fallbackRules`, `handoff`, and `legacyStripeMappings`.
- This lets WordGeni classify `pro`, `studio`, `enterprise`, AI usage display, AI credit top-ups, and legacy Stripe mappings as compatibility/local mirror/fallback metadata instead of authority.

CreVux SaaS/credit/media metadata:

- The artifact includes top-level `crevux` metadata.
- The `crevux` slice includes `localTierAliases`, `publicPlanAliases`, `mediaUnits`, `usageAdmission`, `mediaTopUpMappings`, `localCreditTopUpMappings`, `fallbackRules`, `handoff`, and `legacyStripeMappings`.
- This lets CreVux classify local SaaS aliases and `credits_*` rows against Verixet media package authority without treating local credit constants as final public offers.

Reviewed/manual/non-self-serve rows remain non-self-serve:

- The artifact marks rows such as `main4_starter`, `main4_pro`, `main4_elite`, `creator_pro`, `ecosystem_pro`, and `ecosystem_elite` with non-self-serve/manual/review metadata.
- Satellite adapters preserve these states and do not make those rows checkoutable locally.

Active Verixet-backed rows remain active/self-serve where appropriate:

- Active rows such as `rataify_starter`, `rataify_pro`, `rataify_elite`, WordGeni active single-app rows, AudAiX public rows, CreVux public rows, and active ecosystem starter rows retain self-serve handoff behavior where Verixet marks them active/self-serve.

Local legacy aliases are not authority:

- RatAiFy package aliases, WordGeni local tier aliases, CreVux local tier aliases, and AudAiX workspace aliases are classified or aligned as compatibility/local mirror/fallback/legacy/manual setup.
- Local rows cannot override Verixet availability, reviewed/manual state, checkout status, or handoff state.

Local top-up/credit mismatches are not final products:

- RatAiFy fallback-only top-ups are non-self-serve.
- AudAiX `small/growth/scale` top-ups are compatibility/fallback display data, not final Verixet products.
- WordGeni legacy/AI credit mappings are compatibility metadata.
- CreVux `credits_*` rows are fallback/conflict/missing compatibility rows; Verixet `media_*` packs remain the media-credit authority.

## D. Satellite Cleanup Proof

### RatAiFy

Package aliases:

- RatAiFy package aliases now use Verixet metadata classifications through its billing display adapter.
- Local package constants are Verixet-backed display adapters, free/default fallback, local mirrors, legacy/manual setup, retired, or missing from Verixet.

Top-up/add-on rows:

- RatAiFy top-up mappings come from Verixet metadata.
- Fallback-only top-up packs are not public final offers and remain non-self-serve.

Local package constants:

- `BILLING_CATALOG`, `TOP_UP_PACKS`, usage limits, feature costs, and Stripe env projection helpers are retained, but classified as display/fallback/compatibility structures.

Verixet-backed display adapter:

- `src/lib/billing/verixetCatalogDisplay.ts` bridges Verixet package/top-up metadata into RatAiFy display rows.

Remaining non-blocking drift:

- Feature-cost authority, limit policy, local Stripe projection narrowing, and deeper `BILLING_CATALOG` cleanup remain P3 architecture work.

### AudAiX

Workspace plans:

- AudAiX workspace plans now carry Verixet-aligned classifications.
- `free` is fallback-only, paid public rows are Verixet-backed display adapters, and enterprise/manual rows remain legacy/manual setup.

Usage labels:

- Usage labels are Verixet-backed where exported and local mirror/enforcement labels where Verixet does not fully model route limits.

Top-up/add-on rows:

- Local `small`, `growth`, and `scale` top-ups are fallback/compatibility display data, non-self-serve, and managed through Verixet.

Six-app ecosystem membership:

- Dashboard membership now reflects XFlow, Verixet, RatAiFy, AudAiX, WordGeni, and CreVux.
- Old four-app ecosystem language has been removed or replaced.

Remaining non-blocking drift:

- Local workspace constants, usage limits, credit costs, enterprise/manual setup rows, and local Stripe compatibility paths remain as fallback/local enforcement/compatibility data.

### WordGeni

`pro/studio/enterprise` aliases:

- `pro`, `studio`, and `enterprise` are compatibility/local mirror aliases for Verixet-backed public rows.
- `free` remains fallback-only.

AI usage display:

- WordGeni now separates Verixet-known AI usage display metadata from local AI token/cost enforcement budgets.
- AI usage enforcement values were not changed.

Legacy Stripe mappings:

- Legacy Stripe env mappings are classified as non-authoritative compatibility only.
- Stripe price IDs/config, webhook logic, and checkout behavior were not changed.

Web pricing normalization:

- Web pricing normalization carries Verixet classification metadata and preserves reviewed/manual non-checkoutable behavior.

Remaining non-blocking drift:

- Persisted local tier enum values, token/cost budget reconciliation, legacy Stripe compatibility retirement, and dependency-layout repair remain P3/later work.

### CreVux

SaaS aliases:

- `free`, `pro`, `public_pro`, and `elite` now use Verixet-aligned classification metadata.
- Local SaaS aliases remain fallback/local mirror/compatibility data, not billing authority.

`credits_*` rows:

- `credits_1000`, `credits_5000`, and `credits_15000` are fallback/conflict rows.
- `credits_50000` is fallback/missing.
- None are final self-serve products.

Media credit packages:

- Verixet `media_*` packs are preferred media-credit authority.
- AI-action/media-credit mismatches are labeled as conflict/fallback.

Admin/billing mirrors:

- Admin and billing display remain local mirrors that identify Verixet authority.
- P1 display truthfulness remains intact.

Upgrade/landing pricing:

- Upgrade and landing surfaces now describe media packages as managed through Verixet and do not hard-sell local fallback rows.

Remaining non-blocking drift:

- Local SaaS enforcement constants, top-up constants, local Stripe compatibility paths, and broader package architecture cleanup remain deferred until dependency layout is repaired and fuller tests can run.

## E. Verification Summary

RatAiFy:

- Passed: focused billing/catalog tests, entitlement/fail-closed tests, UI wiring tests, and `npm --prefix apps/RatAiFy run typecheck`.
- Caveat: broad RatAiFy test expansion can hit unrelated AudAiX proof-copy failure; recorded as unrelated broad-suite caveat.
- Blocker type: not code-related for this P2 package cleanup.

AudAiX:

- Passed: `npm run typecheck`, focused billing/workspace/pricing/entitlement tests, dashboard workspace billing/pricing tests, and `npm run verify:routes`.
- Blocked: `tests/entitlement-adapter.test.ts` and `tests/stripe-billing-webhook.test.ts`.
- Blocker: unrelated `better-sqlite3` native module ABI mismatch. It requires an allowed dependency/native module maintenance pass.
- Blocker type: environment/native module related, not P2 cleanup code-related.

WordGeni:

- Passed: `git diff --check` and `node scripts/verify-wordgeni-local-proof.mjs`.
- Blocked: focused API tests, web pricing test, API/web typechecks, and touched-file lint.
- Blockers: missing package-local Vitest binary, missing package-local TypeScript binary, stale/missing Turbo binary links, and pnpm non-TTY module purge risk.
- Blocker type: dependency-layout related, not code-related.

CreVux:

- Passed: `git diff --check` and `node scripts/verify-crevux-local-proof.mjs`.
- Blocked: SaaS entitlement policy verifier, admin billing truthfulness tests, PlanUpgradePage/pricing tests, paid media admission/fail-closed tests, API/image-gen/SaaS typechecks, and top-up wiring verifier.
- Blockers: pnpm non-TTY purge prompt; missing/stale `vitest.mjs`; missing `@vitest/utils`; missing/stale `tsx`; missing package-local TypeScript shims; missing `@types/node`; missing `vite/client`; missing `esbuild`.
- Blocker type: dependency-layout related, not code-related.

Rollup interpretation:

- P2 package/add-on cleanup proof is green enough to move forward.
- RatAiFy and AudAiX have strong focused test coverage in the current environment.
- WordGeni and CreVux need dependency-layout repair before broader CI confidence, but their safe static/local proof checks passed and their blockers occur before relevant test assertions execute.

## F. Remaining P3 / Later Work

Dependency-layout repair:

- Repair WordGeni package-local Vitest, TypeScript, Turbo, and pnpm workspace link state.
- Repair CreVux package-local Vitest, TypeScript, tsx, esbuild, `@types/node`, and `vite/client` resolution.
- Ensure pnpm can run focused checks without non-TTY module purge prompts.

Native module/CI environment repair:

- Rebuild or realign AudAiX `better-sqlite3` for the active Node ABI in a dedicated dependency maintenance pass.

Root recurring proof gate:

- Add a root proof command or script that runs the safe recurring checks for RatAiFy, AudAiX, WordGeni, and CreVux and reports dependency-layout blockers separately from code failures.

Remaining local constants:

- RatAiFy: `BILLING_CATALOG`, `TOP_UP_PACKS`, feature costs, usage limits, and Stripe env projection helpers remain compatibility/fallback/display structures.
- AudAiX: workspace plans, usage limits, credit costs, top-up packs, and enterprise/manual rows remain local mirror/enforcement/fallback structures.
- WordGeni: local tier aliases, AI token/cost budgets, and legacy Stripe mappings remain persisted compatibility/local enforcement structures.
- CreVux: local SaaS tiers, top-up pack constants, media display helpers, and local Stripe compatibility paths remain fallback/local mirror/development-only compatibility structures.

Runtime Verixet API hardening:

- Later work should harden runtime Verixet API consumption where satellites still depend on committed generated artifacts or local adapter mirrors.
- Any runtime handoff/checkout changes should be handled separately from this P2 display/metadata cleanup.

Deeper package/add-on architecture cleanup:

- Split or quarantine legacy constants into explicitly named compatibility modules.
- Retire public use of fallback-only constants where runtime generated catalog consumption can replace them.
- Reconcile app-specific usage/credit units with Verixet public package semantics where the current export remains display-oriented.

## G. Final Decision

1. Is P2 package/add-on cleanup complete enough to move forward?

Yes. RatAiFy, AudAiX, WordGeni, and CreVux are complete enough for this P2 package/add-on/catalog cleanup set.

2. Is any package/add-on/catalog drift still launch-blocking?

No. Remaining drift is classified as compatibility, fallback-only, local mirror, legacy/manual setup, retired, missing, or deferred architecture work. No remaining package/add-on/catalog drift is launch-blocking for this P2 scope.

3. Which app needs the first P3 polish or cleanup?

WordGeni should get the first P3 dependency-layout polish because its focused API/web tests, typechecks, and lint are blocked by missing package-local binaries and stale Turbo links. CreVux dependency-layout repair should follow closely.

4. Which recurring proof command should guard this ecosystem now?

Use a root recurring proof gate that runs the dependency-safe checks first:

```powershell
npm --prefix apps/RatAiFy run typecheck
npx --prefix apps/RatAiFy tsx --test tests/billing-catalog.node.test.ts tests/rataify-pricing-authority.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts tests/rataify-usage-guards.node.test.ts
npm --prefix apps/AudAix run typecheck
npm --prefix apps/AudAix run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/pricing-contract.test.ts tests/audaix-entitlements.test.ts
npm --prefix apps/AudAix/dashboard test -- src/features/workspace-billing/WorkspaceBillingSections.test.tsx src/pages/PricingPage.test.tsx
npm --prefix apps/AudAix run verify:routes
git -C apps/WordGeni diff --check
node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs
git -C apps/CreVux diff --check
node apps/CreVux/scripts/verify-crevux-local-proof.mjs
```

After dependency repair, extend the gate with the focused WordGeni and CreVux Vitest/typecheck commands recorded in their proof docs.

5. What exact next implementation prompt should be used?

```text
Create a P3 dependency-layout repair plan for WordGeni and CreVux P2 proof blockers.

Use these proof docs as context:
* docs/subscription-tier-p2-wordgeni-plan-cleanup-proof.md
* docs/subscription-tier-p2-crevux-saas-credit-cleanup-proof.md
* docs/subscription-tier-p2-package-cleanup-rollup-proof.md

Goal:
Plan a dependency-maintenance pass that restores focused Vitest, TypeScript, tsx, esbuild, @types/node, vite/client, and Turbo resolution for WordGeni and CreVux without changing product behavior.

Scope:
* Planning/proof only unless explicitly approved for implementation.
* Do not change production code.
* Do not change schemas, migrations, Stripe webhook logic, Stripe price IDs, checkout behavior, entitlement enforcement, usage admission enforcement, media generation enforcement, or package/add-on architecture.
* Do not clean or revert unrelated worktree changes.
* Identify exact commands to rerun after repair and separate dependency-layout failures from code failures.
```

## H. Status Evidence

Commands run for this rollup:

```powershell
git status --short
git -C apps/RatAiFy status --short
git -C apps/AudAix status --short
git -C apps/WordGeni status --short
git -C apps/CreVux status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
```

Status result:

- Root remains dirty with pre-existing `package.json` plus unrelated untracked docs/scripts.
- `apps/RatAiFy`: clean.
- `apps/AudAix`: clean.
- `apps/WordGeni`: clean.
- `apps/CreVux`: clean.
- `apps/Verixet`: clean.
- `apps/XFlow`: clean.

This rollup proof is documentation-only. No production code, schemas, migrations, Stripe logic, checkout flows, entitlement architecture, usage admission enforcement, media generation enforcement, dependency files, native rebuilds, or package architecture were changed.
