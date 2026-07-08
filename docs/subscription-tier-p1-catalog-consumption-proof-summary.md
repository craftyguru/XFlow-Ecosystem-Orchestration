# Subscription Tier P1 Catalog Consumption Proof Summary

## A. Executive Summary

Overall P1 catalog status: **Pass**.

The six-app ecosystem now has a Verixet-owned generated catalog artifact and satellite display/catalog alignment proving that XFlow, RatAiFy, AudAiX, WordGeni, and CreVux no longer present local package/pricing constants as final ecosystem billing truth. Satellite local constants still exist in several apps, but the inspected P1 paths label them as fallback, legacy, display-only, local mirror, or Verixet-managed data.

Protected surfaces include public pricing, upgrade CTAs, bundle labels, add-on/top-up labels, billing status copy, local fallback copy, reviewed/manual setup rows, and Verixet handoff language. P1 does not rewrite checkout, Stripe webhooks, payment processing, schemas, migrations, entitlement architecture, or package/add-on architecture.

Remaining P2/P3 work is package/add-on architecture cleanup, retirement of old local constants, a recurring catalog drift gate, deeper admin state coverage, runtime Verixet API consumption hardening, and bundle propagation proof. The ecosystem can move past P1 catalog cleanup.

## B. Catalog Authority Coverage Matrix

| App | Catalog-consumption commit hash if available | Local catalog source inspected | Verixet artifact/source used | Protected display path | Verification command | Result | Remaining risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Verixet | `be6cc73` | `src/lib/billing/canonical-catalog.ts`, `src/lib/marketing/public-pricing-catalog.ts`, `src/lib/billing/plans.ts` | `generated/catalog/verixet-public-catalog.v1.json` | Generated public catalog, pricing catalog, shared pricing UI | `npm --prefix apps/Verixet run typecheck`; Verixet focused catalog tests; `npm --prefix apps/Verixet run stripe:price-env:verify` | Pass | Optional six-month Stripe env vars warn but do not block P1 display safety. |
| XFlow | `4027468` | `src/lib/pricing/ecosystem-pricing-catalog.ts`, `src/lib/pricing/ecosystemPlans.ts` | `src/lib/pricing/verixet-generated-catalog.ts` mirroring Verixet artifact | Pricing page, signup pricing catalog, Verixet handoff and billing handoff | `npm --prefix apps/XFlow run typecheck`; focused Vitest set | Pass | Runtime API consumption remains P2. |
| RatAiFy | `e28b5b5` | `shared/plans.ts`, `src/lib/billing/plans.ts` | `src/lib/billing/verixetCatalogDisplay.ts` mirror of Verixet artifact | Public packages, top-ups, subscribe page, checkout delegation labels | `npm --prefix apps/RatAiFy run typecheck`; `npm --prefix apps/RatAiFy run test:billing` | Pass | Broad `verify:ci` not run; old broad proof-copy caveat remains outside P1. |
| AudAiX | `67a3b1c8` | `src/lib/billing/plans.ts`, `src/workspace-plan.ts` | `src/lib/billing/verixet-catalog-display.ts` mirror of Verixet artifact | Workspace plan, billingStatus, usage-limit labels, pricing page | `npm --prefix apps/AudAix run typecheck`; focused Vitest set; dashboard focused Vitest set; `npm --prefix apps/AudAix run verify:routes` | Pass | Broad `tests/api.test.ts` not run; unrelated 402 plan-gate caveat remains outside P1. |
| WordGeni | `3d3f09b` | `apps/api/src/services/*`, `apps/web/src/lib/pricing-catalog.ts` | `apps/api/src/services/verixet-catalog-display.ts`, web catalog normalization from Verixet pricing data | Plan alias labels, AI usage labels, billing route status, web pricing CTAs | API focused Vitest; web focused Vitest; direct API `tsc`; touched-file ESLint; `node scripts/verify-wordgeni-local-proof.mjs` | Pass | Root-level web Vitest invocation fails without the web package alias config; package-root invocation passes. |
| CreVux | `ad284bd` | `lib/saas-entitlements/src/saasEntitlements.ts`, API billing routes, image-gen pricing surfaces | `lib/saas-entitlements` Verixet display mirror validated against Verixet artifact | SaaS plan labels, credit/top-up labels, media/package labels, admin billing, upgrade page | SaaS proof; focused admin/image-gen Vitest; direct package `tsc`; `node scripts/verify-crevux-local-proof.mjs` | Pass | Top-level `npm --prefix apps/CreVux run typecheck` aborts on pnpm non-TTY module purge; direct typechecks pass. |

## C. Verixet Export Proof

Verixet remains the central catalog authority. The generated artifact exists at `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`.

Artifact proof:

- `schemaVersion`: `verixet.generated-catalog.v1`
- `catalogVersion`: `p1-verixet-catalog-consumption-v1`
- `generatedAt`: `2026-07-08T12:05:20.326Z`
- Plan slugs: 27
- Top-up slugs: 16
- Apps: XFlow, Verixet, RatAiFy, AudAiX, WordGeni, CreVux
- Bundle families: `main4`, `creator`, `ecosystem`
- Required artifact keys present: schema version, catalog version, generated timestamp, source, slugs, app ownership, bundle membership, pricing display, price status, checkout availability, manual setup, pricing-under-review, add-ons, top-ups, free caps, paid-tier limits, CTA metadata, handoff URLs, entitlement keys, deprecated flags, plans.

Reviewed/manual/non-final rows export as non-self-serve and non-public with review/manual labels:

- `main4_starter`, `main4_pro`, `main4_elite`
- `creator_pro`
- `ecosystem_pro`, `ecosystem_elite`

Those rows have `selfServe: false`, `publicDisplay: false`, `reason: pricing_under_review`, `manualSetup: true`, `pricingUnderReview: true`, monthly label `Pricing under review`, and yearly label `Manual setup required`.

Active configured rows export as active/self-serve where appropriate: 21 plan rows are self-serve with checkout reason `available`. Top-ups include 12 active/self-serve entries and 4 deprecated entries.

Verixet verification:

- `npm --prefix apps/Verixet run typecheck`: Pass
- `vitest run src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx src/components/marketing/pricing/PricingCatalogClient.test.tsx`: Pass, 4 files / 32 tests
- `npm --prefix apps/Verixet run stripe:price-env:verify`: Pass with optional six-month catalog price warnings

Stripe webhook logic and checkout behavior were not changed during this proof pass.

## D. Satellite Display Consumption Proof

XFlow:

- Does not treat local catalog constants as final paid ecosystem truth.
- `src/lib/pricing/verixet-generated-catalog.ts` provides the Verixet-aligned source for pricing presentation.
- Local pricing helpers are aligned or fallback-only.
- Reviewed/manual rows render non-final Verixet review language.
- Active configured rows still render Verixet handoff/upgrade CTAs.
- Free/default fallback remains stable.
- XFlow does not present itself as final checkout or billing authority.

RatAiFy:

- `src/lib/billing/verixetCatalogDisplay.ts` is explicitly marked as a Verixet-owned generated catalog mirror for RatAiFy public display.
- `shared/plans.ts` labels legacy aliases and ecosystem package rows as Verixet-managed/local mirror only rather than final local products.
- Top-up display uses Verixet pack labels for public configured packs and fallback labels for non-public local rows.
- Reviewed/manual rows are not hard-sold.
- Active configured rows keep Verixet checkout CTAs.

AudAiX:

- `src/lib/billing/verixet-catalog-display.ts` controls AudAiX display metadata.
- Workspace plan output carries `Requires Verixet entitlement`, `Managed through Verixet`, `Manual setup required`, or `Pricing under review` labels as appropriate.
- Local top-up/package rows are fallback-only where Verixet has no public self-serve counterpart.
- BillingStatus and usage-limit labels do not make AudAiX the final billing authority.

WordGeni:

- API display helpers validate WordGeni-facing rows against the Verixet generated artifact.
- Plan aliases are Verixet-managed display aliases.
- AI usage labels use `Requires Verixet entitlement` / Verixet-managed wording.
- Web pricing catalog normalizes Verixet pricing/manual/review fields into CTAs: `Start checkout in Verixet`, `Review in Verixet`, `Manual setup required`, or `Managed through Verixet`.
- The app does not present WordGeni-owned checkout as the ecosystem authority.

CreVux:

- `lib/saas-entitlements/src/saasEntitlements.ts` includes Verixet schema/catalog versions, plan slugs, bundle membership, pricing labels, review/manual flags, top-up display metadata, entitlement keys, CTA labels, and handoff metadata.
- API billing catalog/top-up endpoints emit Verixet authority labels when local billing is not enabled.
- Image-gen upgrade and landing pricing surfaces prefer Verixet display labels.
- Admin billing rows are local mirrors under Verixet authority.
- Fallback and free/default rows remain stable and explicit.

## E. Drift Elimination Proof

| Drift type | Classification | Proof note |
| --- | --- | --- |
| Plan name mismatch | Resolved | Satellite display rows use Verixet plan names or marked aliases/fallbacks. |
| Price mismatch | Resolved for P1 display | Public display prices now come from Verixet artifact/mirrors; local prices are fallback-only. |
| Bundle membership mismatch | Resolved for P1 display | Verixet bundle membership is represented in artifact and satellite display helpers. |
| Add-on/top-up mismatch | Reduced | RatAiFy and CreVux map public top-ups to Verixet; AudAiX fallback rows remain explicit. Full add-on architecture cleanup is P2. |
| CTA mismatch | Resolved | Active rows use Verixet handoff/checkout CTAs; reviewed/manual rows use review/manual CTAs. |
| Entitlement display mismatch | Reduced | Satellite labels now say `Requires Verixet entitlement`; deeper runtime propagation remains P2/P3. |
| Free-tier limit display mismatch | Reduced | Free/default fallbacks remain stable and no longer claim final paid ecosystem truth. |
| Manual setup/review state mismatch | Resolved | Artifact and satellite helpers mark review/manual rows non-self-serve. |
| Legacy fallback risk | Still open for P2 | Old local constants remain in several apps but are labeled fallback/display-only/local mirror. |

## F. Verification Results

Root:

- `npm run proof:billing-contracts`: Pass. Contract validation pass; Phase 17 static proof pass 68, warnings 0, failures 0.
- `npm run proof:ecosystem:static`: Pass. Phase 17 static proof pass 68, warnings 0, failures 0.
- `npm run validate:ecosystem-contracts`: Pass. Apps 6, env rows 81, routes 24, token types 13.

Verixet:

- `npm --prefix apps/Verixet run typecheck`: Pass.
- Generated catalog/export tests: Pass.
- Pricing/public catalog tests: Pass.
- `npm --prefix apps/Verixet run stripe:price-env:verify`: Pass with optional six-month price env warnings.

XFlow:

- `npm --prefix apps/XFlow run typecheck`: Pass.
- Focused pricing/catalog/handoff tests: Pass, 5 files / 47 tests.

RatAiFy:

- `npm --prefix apps/RatAiFy run typecheck`: Pass.
- Focused package/catalog/top-up/handoff tests via `npm --prefix apps/RatAiFy run test:billing`: Pass, 75 tests.
- Broad `verify:ci`: Not run; known broad proof-copy caveat remains unrelated/pre-existing.

AudAiX:

- `npm --prefix apps/AudAix run typecheck`: Pass.
- Focused plan/catalog/billingStatus/usage-label tests: Pass, 4 server files / 17 tests and 2 dashboard files / 9 tests.
- `npm --prefix apps/AudAix run verify:routes`: Pass.
- Broad `tests/api.test.ts`: Not run; known unrelated 402 plan-gate caveat remains unrelated/pre-existing.

WordGeni:

- Focused API catalog/billing label tests: Pass, 4 files / 21 tests.
- Focused web pricing label test from `apps/web`: Pass, 1 file / 8 tests.
- Direct API typecheck: Pass with `tsc -p apps/api/tsconfig.json --noEmit`.
- Touched-file ESLint: Pass.
- `node scripts/verify-wordgeni-local-proof.mjs`: Pass.
- Root-level web Vitest invocation failed because the `@/` alias was not loaded outside `apps/web`; the same test passed from `apps/web`.
- `pnpm stripe:proof`: Skipped; Stripe test env was not intentionally configured.

CreVux:

- Focused SaaS/catalog proof: Pass.
- Focused admin billing truthfulness test: Pass.
- Focused image-gen upgrade pricing test: Pass, 1 file / 3 tests.
- Direct typechecks for `lib/saas-entitlements`, `artifacts/image-gen`, and `artifacts/api-server`: Pass.
- `node scripts/verify-crevux-local-proof.mjs`: Pass.
- `npm --prefix apps/CreVux run typecheck`: Failed before typechecking because pnpm attempted an implicit install/modules purge and aborted without TTY. This was not forced.

## G. Remaining P2/P3 Work

- Full package/add-on architecture cleanup.
- Root recurring catalog drift proof gate.
- Deeper admin state coverage for expired, past_due, canceled, manual setup, and pricing-review states.
- Satellite removal or retirement of old local constants.
- Runtime Verixet API consumption hardening instead of static mirrors where appropriate.
- Bundle propagation proof from Verixet to all apps.
- Known unrelated broad test failures/caveats: RatAiFy broad `verify:ci` proof-copy drift, AudAiX broad `tests/api.test.ts` 402 plan-gate drift, CreVux pnpm non-TTY module purge abort.

## H. Final Git Status Accounting

Root `git status --short` before this doc showed pre-existing unrelated dirt:

- `M package.json`
- untracked RatAiFy/workspace/XFlow proof docs under `docs/`
- untracked workspace proof scripts under `scripts/`

Intended proof doc change from this pass:

- `docs/subscription-tier-p1-catalog-consumption-proof-summary.md`

App repo status after verification:

- `apps/Verixet`: clean (`main...origin/main [ahead 4]` at start of pass)
- `apps/XFlow`: clean
- `apps/RatAiFy`: clean
- `apps/AudAix`: clean
- `apps/WordGeni`: clean
- `apps/CreVux`: clean

No app repo changes were caused by this proof pass. No proof command left a tracked generated-output diff.

## I. Final Decision

1. Are P1 catalog-consumption/display safety fixes complete enough to move to P2? **Yes.**
2. Which catalog drift risk, if any, still blocks moving forward? **None blocks moving to P2.** Legacy fallback/local constant risk remains, but it is labeled and no longer a P1 blocker.
3. Which app needs the first P2 package/add-on cleanup? **RatAiFy**, because it has the broadest package/top-up surface and legacy alias compatibility rows.
4. Which verification command should become the recurring catalog drift safety gate? **`npm run proof:billing-contracts` should be extended with Verixet generated artifact comparison plus the focused satellite catalog mirror tests.** Until then, use `npm run proof:billing-contracts` as the root gate and run the focused app catalog tests before catalog releases.
5. What should be the next implementation prompt? **Implement the P2 recurring catalog drift proof gate: add a root proof script that loads `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`, compares satellite catalog mirrors for XFlow, RatAiFy, AudAiX, WordGeni, and CreVux, fails on pricing/bundle/top-up/CTA/manual-state drift, and wires it into `npm run proof:billing-contracts` without changing product logic.**

