# P2 RatAiFy Package/Add-On Cleanup Plan

## A. Executive Summary

RatAiFy is safer after P0/P1, but it is not structurally clean yet. P0 made paid access fail closed unless Verixet-backed entitlement state is fresh enough, and P1 made pricing/package display truthier by labeling local rows as Verixet-managed, local mirror, fallback, or legacy. The remaining drift is architectural: RatAiFy still owns a broad local package model in `apps/RatAiFy/src/lib/billing/plans.ts`, re-exports it through `apps/RatAiFy/shared/plans.ts`, projects it into local Stripe plan data in `apps/RatAiFy/server/services/stripe.ts`, and uses it for upgrade CTAs, usage limits, credit costs, top-up packs, fallback display, and entitlement snapshots.

Current status: RatAiFy public display is mostly guarded by `catalogDisplay` metadata from `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts`, and checkout delegates to Verixet by default through `apps/RatAiFy/server/services/billingCheckout.ts`. However, local rows still look authoritative enough to drift: `BILLING_CATALOG`, `PUBLIC_PLAN_ORDER`, `TOP_UP_PACKS`, `CREDIT_COST_PER_FEATURE`, `PLAN_LIMITS`, `PLAN_MARKETING`, `ECOSYSTEM_PLAN_MARKETING`, and `STRIPE_PLANS` all preserve a RatAiFy-owned interpretation of packages, bundle membership, top-ups, credit units, and limits.

Recommended P2 strategy: implement an adapter-first cleanup, not a deletion-first cleanup. First extend the Verixet generated export so RatAiFy can consume RatAiFy-specific feature keys, top-up mapping, legacy alias metadata, deprecated flags, and handoff labels. Then move RatAiFy public/package/top-up display to a Verixet-backed adapter while keeping free/default fallback and legacy compatibility rows quarantined. Only after tests prove no active checkout, entitlement, or public display path treats local constants as authority should legacy local constants be removed or narrowed.

RatAiFy is not ready for direct implementation that removes local package architecture. It needs Verixet export additions first, or the implementation will have to preserve too much local knowledge in another RatAiFy-only adapter.

## B. Current RatAiFy Package Inventory

| Area | Current source | Function/constant names | Current role |
| --- | --- | --- | --- |
| Local package rows | `apps/RatAiFy/src/lib/billing/plans.ts` | `BILLING_CATALOG`, `plan()`, `PlanCatalogEntry`, `PlanSlug`, `CanonicalPlanSlug`, `LegacyPlanSlug` | Central local catalog for free, RatAiFy, ecosystem, enterprise, and compatibility rows. |
| Local plan constants | `apps/RatAiFy/shared/plans.ts` | `PLAN_LIMITS`, `PLAN_MARKETING`, `PLAN_ORDER`, `PAID_PLAN_KEYS`, `ECOSYSTEM_PLAN_MARKETING`, `CREDIT_TOP_UP_PACKS` | Shared UI/server-facing legacy plan model derived from `BILLING_CATALOG`. |
| Ecosystem bundle aliases | `apps/RatAiFy/src/lib/billing/plans.ts` | `ecosystem_starter`, `ecosystem_pro`, `ecosystem_elite`, `rataify_ecosystem_pro`, `rataify_ecosystem_elite` | Mix of current Verixet bundle rows and compatibility aliases. |
| Main4/full ecosystem assumptions | `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts` | `PUBLIC_ECOSYSTEM_APPS`, `ECOSYSTEM_PRICING_MATH`, `VERIXET_DISPLAY_PLANS` | RatAiFy local app type only includes `xflowx`, `verixet`, `rataify`, `audaix`, while Verixet display includes six-app full ecosystem membership. |
| Top-up packs | `apps/RatAiFy/src/lib/billing/plans.ts` | `TOP_UP_PACKS`, `getTopUpPack()`, `getTopUpPriceId()` | Six RatAiFy-specific creator/ecosystem top-up rows; none exactly match Verixet generated `ai_*`, `media_*`, or `storage_*` slugs. |
| Add-on labels | `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts` | `VERIXET_DISPLAY_TOP_UPS`, `getVerixetTopUpDisplay()` | Verixet mirror exposes AI, media, and storage labels, but RatAiFy `TOP_UP_PACKS` does not consume these slugs. |
| Credit pack definitions | `apps/RatAiFy/src/lib/billing/plans.ts` | `CreditPool`, `CREDIT_COST_PER_FEATURE`, `creditsPerMonth`, `TopUpPack.credits` | Local ecosystem/creator credit economy and RatAiFy feature costs. |
| Stripe projection/mapping | `apps/RatAiFy/server/services/stripe.ts`, `apps/RatAiFy/server/services/billingCheckout.ts`, `apps/RatAiFy/server/routes/billing.ts` | `STRIPE_PLANS`, `normalizeStripePlanKey()`, `getStripePriceId()`, `getPlanByPriceId()`, `createBillingCheckout()`, `createTopUpCheckout()` | Local Stripe projection remains available behind Verixet authority guards; price IDs are env-driven. |
| Upgrade CTA surfaces | `apps/RatAiFy/server/lib/upgradePressure.ts`, `apps/RatAiFy/client/src/pages/checkout.tsx`, `apps/RatAiFy/client/src/pages/subscribe.tsx`, `apps/RatAiFy/client/src/components/dashboard/DashboardFreeTierBanner.tsx` | `buildUpgradePrompt()`, `checkoutUrl`, `BILLING_CATALOG[...]`, `upgradeTo` strings | Upgrade routing and labels still depend on local plan slugs. |
| Subscribe/pricing page surfaces | `apps/RatAiFy/client/src/pages/subscribe.tsx`, `apps/RatAiFy/client/src/components/marketing/rataify/PricingSection.tsx` | `PUBLIC_PLAN_ORDER`, `CREDIT_TOP_UP_PACKS`, `checkoutActionUrl()`, `checkoutPayload()`, `verixetPlanSlugFor()` | P1 labels are safer, but the page still iterates local plan/top-up arrays. |
| Entitlement fallback surfaces | `apps/RatAiFy/server/services/entitlementAdapter.ts`, `apps/RatAiFy/server/services/rataifyEntitlements.ts`, `apps/RatAiFy/server/services/entitlements.ts`, `apps/RatAiFy/server/services/planLimits.ts`, `apps/RatAiFy/server/lib/rateLimiter.ts` | `resolvePlanSlug()`, `buildRataifyEntitlementSnapshot()`, `requireEntitledFeature()`, `PLAN_LIMITS` | P0 fail-closed behavior exists, but local plan rows still feed free/default and legacy mirror decisions. |
| Tests/proofs | `apps/RatAiFy/tests/*` | `billing-catalog.node.test.ts`, `rataify-pricing-authority.node.test.ts`, `billing-checkout-product-catalog.node.test.ts`, `billing-ui-wiring.node.test.ts`, `rataify-entitlements.node.test.ts`, `entitlement-adapter.node.test.ts`, `scenario-coverage.node.test.ts`, `rataify-usage-guards.node.test.ts`, `upgrade-pressure-client.node.test.ts`, `trust-dashboard-rendering.node.test.ts` | Good safety coverage, but some tests currently assert local constants/prices and will need adapter-focused rewrites. |

## C. Verixet Authority Comparison

Verixet generated catalog artifact inspected: `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`.

Artifact status:

- `schemaVersion`: `verixet.generated-catalog.v1`
- `catalogVersion`: `p1-verixet-catalog-consumption-v1`
- `generatedAt`: `2026-07-08T12:05:20.326Z`
- Bundle membership: `main4` includes XFlow, Verixet, RatAiFy, AudAiX; `creator` includes WordGeni and CreVux; `ecosystem` includes all six.
- RatAiFy single-app rows `rataify_starter`, `rataify_pro`, and `rataify_elite` are configured and self-serve.
- `ecosystem_starter` is configured and self-serve.
- `main4_*`, `creator_pro`, `ecosystem_pro`, and `ecosystem_elite` are pricing-under-review/manual setup and not self-serve.
- Top-ups export Verixet-global `ai_*`, `media_*`, `storage_*`, plus deprecated compatibility aliases. They do not export RatAiFy-specific `rataify_creator_credits_*` or `rataify_ecosystem_credits_*` rows.

| RatAiFy local item | Verixet catalog match | Match quality | Current user-facing risk | Current payment risk | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `free` | No public paid checkout row; free/default concept exists by fallback | Partial | Low if kept conservative | Low | Keep as free/default fallback only. |
| `rataify_starter` | `rataify_starter` configured, self-serve | Exact | Low | Medium while local Stripe projection exists | Keep as Verixet-backed display adapter. |
| `rataify_pro` | `rataify_pro` configured, self-serve | Exact | Low | Medium while local Stripe projection exists | Keep as Verixet-backed display adapter. |
| `rataify_elite` | `rataify_elite` configured, self-serve | Exact | Low | Medium while local Stripe projection exists | Keep as Verixet-backed display adapter. |
| `ecosystem_starter` | `ecosystem_starter` configured, self-serve, six apps | Partial | Medium because local app type/list still has four-app assumptions | Medium | Move authority to Verixet export; adapter must use Verixet membership. |
| `ecosystem_pro` | `ecosystem_pro` pricing under review/manual setup | Conflict | High if local row appears checkoutable or final | High if local Stripe projection is used | Mark manual setup; retire from public self-serve display. |
| `ecosystem_elite` | `ecosystem_elite` pricing under review/manual setup | Conflict | High if local row appears checkoutable or final | High if local Stripe projection is used | Mark manual setup; retire from public self-serve display. |
| `rataify_enterprise` | Verixet generated plan slug list does not include `rataify_enterprise`; Verixet Stripe gap docs mention enterprise classification work | Missing/Legacy | Medium if shown as a concrete package | Medium | Mark legacy/manual setup/contact sales until Verixet exports it. |
| `rataify_creator_bundle` | No direct generated plan; closest Verixet creator bundle rows are `creator_starter/pro/elite` | Legacy | Medium due stale $149 local row | Medium | Retire from public display; keep internal alias only if historical rows require it. |
| `rataify_ecosystem_pro` | Local alias for `ecosystem_pro`, which is under review | Legacy/Conflict | High if old $129 appears | High | Quarantine as legacy alias; never public self-serve. |
| `rataify_ecosystem_elite` | Local alias for `ecosystem_elite`, which is under review | Legacy/Conflict | High if old $249 appears | High | Quarantine as legacy alias; never public self-serve. |
| `enterprise` | Alias for RatAiFy enterprise | Legacy | Medium | Medium | Keep as legacy/manual setup alias only. |
| `PUBLIC_ECOSYSTEM_APPS` | Verixet `bundleMembership.ecosystem` includes all six apps | Conflict | High if "Full Ecosystem" omits WordGeni/CreVux | Low | Move membership authority to Verixet export. |
| `ECOSYSTEM_PRICING_MATH` | Verixet has display prices/status; not local savings math authority | Partial | Medium if savings math survives reviewed rows | Low | Retire or generate from Verixet only for self-serve rows. |
| `TOP_UP_PACKS` creator packs | No direct Verixet slug | Missing | Medium | High if sold locally | Retire from public display or require new Verixet export rows. |
| `TOP_UP_PACKS` ecosystem packs | No direct Verixet slug; rough quantity/price overlap with `ai_*` but names/prices differ | Partial/Conflict | Medium | High | Move authority to Verixet export; adapter mapping needed. |
| `CREDIT_COST_PER_FEATURE` | Verixet exports top-up entitlement keys, not RatAiFy feature cost keys | Partial | Low for display, high for enforcement clarity | Medium | Keep local usage-cost policy until Verixet exports RatAiFy feature-cost metadata. |
| `STRIPE_PLANS` | Verixet owns checkout; local env price projection remains | Conflict | Low if hidden, high if local mode leaks | High | Keep guarded local mirror only; tests must prove Verixet authority default. |
| `PLAN_LIMITS`/`PLAN_MARKETING` | Verixet exports pricing and some limits, but not full RatAiFy feature/limit matrix | Partial | Medium | Low | Preserve free/default fallback; move paid display to Verixet-backed adapter. |

## D. Cleanup Classification

| Item | Classification | Notes |
| --- | --- | --- |
| `rataify_starter`, `rataify_pro`, `rataify_elite` | Keep as Verixet-backed display adapter | Do not duplicate price/CTA/manual state locally after export fields are sufficient. |
| `free` | Keep as free/default fallback only | Must remain conservative and cannot unlock paid features. |
| `ecosystem_starter` | Keep as Verixet-backed display adapter | Must use Verixet six-app membership, not local four-app assumptions. |
| `ecosystem_pro`, `ecosystem_elite` | Mark legacy/manual setup and retire from public self-serve display | Verixet says pricing under review and manual setup required. |
| `rataify_creator_bundle`, `rataify_ecosystem_pro`, `rataify_ecosystem_elite`, `enterprise` | Retire from public display; keep as local mirror only if historical rows require it | These should not be first-class packages. |
| `rataify_enterprise` | Mark legacy/manual setup; needs Verixet catalog field before cleanup | Keep contact-sales only until Verixet exports enterprise/manual setup metadata. |
| `PUBLIC_ECOSYSTEM_APPS` and `ECOSYSTEM_PRICING_MATH` | Move authority to Verixet export | Local values should become derived display only or disappear. |
| `TOP_UP_PACKS` | Move authority to Verixet export | Current RatAiFy-specific packs are missing in Verixet; public top-ups should use Verixet rows or be hidden. |
| `CREDIT_COST_PER_FEATURE` and `RATAIFY_USAGE_ACTIONS` | Keep as local mirror/enforcement policy until Verixet exports feature-cost keys | Needs proof that local cost policy cannot imply purchasable credits. |
| `PLAN_LIMITS` / `server/services/planLimits.ts` | Keep as free/default fallback only, then Verixet-backed limits where exported | Do not use local paid limits as entitlement authority. |
| `STRIPE_PLANS` | Keep as local mirror only under explicit non-Verixet/local mode | Tests must block accidental production checkout authority. |
| `upgradeTo` strings and `checkoutUrl` helpers | Keep as Verixet-backed display adapter | Must not point at local plan rows missing or blocked in Verixet. |
| Existing tests | Needs test/proof only | Rewrite assertions from local prices/constants to Verixet parity, fallback quarantine, and fail-closed behavior. |

## E. Verixet Export Gaps

RatAiFy cleanup should update the Verixet export first for several fields:

| Needed field | Missing or insufficient? | Recommendation |
| --- | --- | --- |
| RatAiFy-specific feature keys | Missing | Add feature keys such as `rataify_reputation_scan`, `rataify_privacy_scan`, `rataify_policy_generation`, `rataify_copy_analysis`, `rataify_inbox_analysis`, `rataify_report_export`, `rataify_storage_upload`, `rataify_connected_app_verify`, and `rataify_summary_read`. |
| RatAiFy top-up pack mapping | Missing | Either export RatAiFy-specific packs as deprecated/manual/local aliases, or publish an app-specific mapping from RatAiFy feature credits to Verixet `ai_*`/storage packs. |
| App-specific CTA labels | Partial | Current CTA labels are generic. Add optional per-app labels/handoff text so RatAiFy does not hardcode local copy. |
| Bundle membership detail | Present, but app slug mismatch risk | Normalize `xflow` vs `xflowx` and expose display name/slug pairs so RatAiFy can remove local `PUBLIC_ECOSYSTEM_APPS`. |
| Price-status reasons | Partial | `reason: pricing_under_review` exists; add human-readable reason/detail for adapter UI and proof docs. |
| Manual setup reasons | Partial | Boolean exists; add reason/copy/handoff destination. |
| Legacy alias mapping | Missing | Export aliases such as `rataify_ecosystem_pro -> ecosystem_pro` and mark checkout forbidden. |
| Display fallback labels | Partial | Current status labels exist, but not app-specific fallback labels. Add fallback copy for offline/free/default states or keep this in RatAiFy adapter. |
| Credit/add-on units | Present globally, missing RatAiFy meaning | Top-ups have grants and entitlement keys, but RatAiFy feature-cost units need mapping to the Verixet credit pools. |
| Deprecated flags | Present for top-ups, missing for plan aliases | Add deprecated/legacy flags for compatibility plan slugs if Verixet exports aliases. |
| Entitlement feature keys | Partial | Plan-level entitlement keys exist in artifact, but RatAiFy route feature keys need explicit mapping. |
| Handoff URL metadata | Present for top-ups, partial for plans | Ensure plan checkout/handoff URLs include app slug, selected plan, return path, and manual setup destination metadata. |

Recommendation: update Verixet export first for alias mapping, app membership/display labels, RatAiFy feature keys, manual/review reasons, and top-up mapping. Keep purely RatAiFy operational feature-cost policy in a RatAiFy adapter only until Verixet has a stable credit-unit model for those actions.

## F. RatAiFy Implementation Plan

Commit 1: Verixet export additions for RatAiFy package/top-up metadata.

- Files likely touched: `apps/Verixet/src/lib/catalog-export/*`, `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`, Verixet catalog tests.
- Behavior change: generated artifact exposes RatAiFy feature keys, alias mappings, top-up mapping/status, manual/review reasons, normalized app membership, and plan handoff metadata.
- Tests to add/update: Verixet generated catalog test asserting RatAiFy slice completeness and reviewed/manual rows non-self-serve.
- Rollback risk: low if artifact-only and tests-only.
- Must not change: checkout behavior, Stripe IDs, schemas, migrations, webhooks, entitlement enforcement.

Commit 2: RatAiFy package model adapter cleanup.

- Files likely touched: `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts`, a new or existing adapter beside `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/tests/billing-catalog.node.test.ts`.
- Behavior change: public display rows derive from Verixet metadata; local rows become compatibility/free/default data.
- Tests to add/update: assert active public paid rows are Verixet-backed; assert aliases are non-public/non-checkoutable.
- Rollback risk: medium due many imports of `BILLING_CATALOG`.
- Must not change: entitlement unlock semantics or local Stripe price IDs.

Commit 3: RatAiFy top-up/add-on display cleanup.

- Files likely touched: `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts`, `apps/RatAiFy/client/src/pages/subscribe.tsx`, `apps/RatAiFy/server/services/billingCheckout.ts`, `apps/RatAiFy/tests/billing-credit-routes.node.test.ts`, `apps/RatAiFy/tests/rataify-pricing-authority.node.test.ts`.
- Behavior change: public top-ups render only Verixet self-serve rows or hidden/manual rows; RatAiFy-specific packs are fallback/legacy only.
- Tests to add/update: top-up list parity to Verixet export; local missing pack cannot be sold.
- Rollback risk: medium if subscribe UI expects local pack keys.
- Must not change: Stripe top-up checkout behavior or webhook logic.

Commit 4: RatAiFy subscribe/pricing page cleanup.

- Files likely touched: `apps/RatAiFy/client/src/pages/subscribe.tsx`, `apps/RatAiFy/client/src/components/marketing/rataify/PricingSection.tsx`, `apps/RatAiFy/client/src/components/dashboard/DashboardFreeTierBanner.tsx`, `apps/RatAiFy/tests/billing-ui-wiring.node.test.ts`, `apps/RatAiFy/tests/upgrade-pressure-client.node.test.ts`.
- Behavior change: UI iterates Verixet-backed public rows and labels manual/review states as non-final.
- Tests to add/update: no local alias appears on public subscribe/pricing; manual rows do not render local checkout CTAs.
- Rollback risk: medium, mostly UI.
- Must not change: protected route access or billing API behavior.

Commit 5: RatAiFy Stripe projection labeling/guard cleanup, without changing Stripe config.

- Files likely touched: `apps/RatAiFy/server/services/stripe.ts`, `apps/RatAiFy/server/services/billingCheckout.ts`, `apps/RatAiFy/server/routes/billing.ts`, `apps/RatAiFy/tests/billing-checkout-product-catalog.node.test.ts`, `apps/RatAiFy/tests/scenario-coverage.node.test.ts`.
- Behavior change: local `STRIPE_PLANS` is explicitly local-mirror/dev-compatibility and cannot include Verixet-reviewed/manual rows.
- Tests to add/update: production authority default delegates to Verixet; reviewed/manual rows cannot normalize into local checkout.
- Rollback risk: medium.
- Must not change: price env names, live Stripe IDs, webhook processing, subscription creation logic.

Commit 6: RatAiFy tests/proofs for package drift prevention.

- Files likely touched: RatAiFy tests plus optional root proof script if already planned.
- Behavior change: proof catches local/Verixet drift in plan names, checkoutability, bundle membership, top-ups, CTA labels, manual/review state, aliases, and deprecated flags.
- Tests to add/update: focused RatAiFy catalog drift test and root generated catalog mirror proof.
- Rollback risk: low.
- Must not change: production code except test-only fixtures if needed.

Commit 7: Remove or quarantine legacy local package constants only after tests prove no active surface uses them as authority.

- Files likely touched: `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/shared/plans.ts`, `apps/RatAiFy/server/services/planLimits.ts`, `apps/RatAiFy/server/lib/rateLimiter.ts`, affected imports.
- Behavior change: legacy aliases and local prices are removed from public paths or moved to a clearly named compatibility module.
- Tests to add/update: import boundaries and no-public-use assertions.
- Rollback risk: high because constants are widely imported.
- Must not change: free/default fallback, P0 fail-closed entitlement behavior, P1 display truthfulness.

## G. Test/Proof Plan

Run during implementation, not during this planning pass:

```powershell
npm --prefix apps/RatAiFy run typecheck
npm --prefix apps/RatAiFy run test:billing
cd apps/RatAiFy
npx tsx --test tests/billing-catalog.node.test.ts tests/rataify-pricing-authority.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/billing-credit-routes.node.test.ts tests/upgrade-pressure-client.node.test.ts
npx tsx --test tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts tests/rataify-usage-guards.node.test.ts tests/scenario-coverage.node.test.ts tests/trust-dashboard-rendering.node.test.ts
npm --prefix apps/Verixet run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx
npm --prefix apps/Verixet run typecheck
npm run proof:billing-contracts
```

Focused billing UI wiring tests should block any subscribe/pricing change. Entitlement adapter and RatAiFy entitlement tests should block any change that touches `BILLING_CATALOG`, `PLAN_LIMITS`, `CREDIT_COST_PER_FEATURE`, or `STRIPE_PLANS`.

Broad `npm --prefix apps/RatAiFy run verify:ci` is useful after focused tests pass, but P0/P1 docs still record an unrelated `tests/audaix-proof.node.test.ts` copy expectation drift. Treat that as a known broad-suite caveat unless it has been fixed before implementation.

## H. Launch Safety Rules

- RatAiFy cannot hard-sell packages missing from Verixet.
- RatAiFy cannot override Verixet reviewed/manual state.
- RatAiFy cannot treat local package rows as checkout authority.
- RatAiFy cannot create new Stripe authority.
- RatAiFy cannot unlock paid access from local fallback data.
- RatAiFy must preserve free/default safe fallback.
- RatAiFy must preserve P0 fail-closed Verixet entitlement behavior.
- RatAiFy must preserve P1 display truthfulness.
- RatAiFy top-ups cannot be public self-serve unless Verixet exports the pack or an explicit Verixet-backed mapping.
- RatAiFy legacy aliases cannot appear as first-class public packages.
- RatAiFy local limits can shape conservative UI/fallback behavior, but cannot prove paid entitlement without Verixet.

## I. Open Questions

1. Should RatAiFy keep any standalone package model?

Yes, but only as an adapter and fallback model. RatAiFy can keep `free`/default behavior, RatAiFy-specific feature cost policy, and legacy compatibility mapping. Verixet should own paid package authority.

2. Should RatAiFy top-ups be app-specific or Verixet-global?

Verixet-global for sale and settlement. RatAiFy can expose app-specific labels only if they map to Verixet-exported credit pools, grants, entitlement keys, and checkout availability.

3. Should ecosystem packages live only in Verixet?

Yes. RatAiFy should consume Verixet bundle membership and checkout/manual state. Local ecosystem package rows should not be authority.

4. Which RatAiFy local constants can be retired first?

Retire public use of `ECOSYSTEM_PRICING_MATH`, `PUBLIC_ECOSYSTEM_APPS`, and compatibility aliases `rataify_creator_bundle`, `rataify_ecosystem_pro`, `rataify_ecosystem_elite`, and `enterprise`. Then retire public top-up use of RatAiFy-specific `TOP_UP_PACKS` rows not mapped by Verixet.

5. Which local constants must stay for offline/free/default fallback?

Keep conservative `free` limits, RatAiFy feature keys, `CREDIT_COST_PER_FEATURE`, `RATAIFY_USAGE_ACTIONS`, and enough `PLAN_LIMITS`/`planLimits.ts` structure to avoid crashing offline/free/default UI. These must remain unable to unlock paid access.

6. Does Verixet export need a RatAiFy slice before implementation?

Yes. It needs feature-key, alias, bundle membership, manual/review reason, top-up mapping, deprecated flag, and handoff metadata before RatAiFy cleanup can be implemented cleanly.

7. What is the safest first implementation commit?

Add Verixet export metadata for the RatAiFy slice plus tests. Do not touch RatAiFy production code in the first implementation commit except possibly to add read-only parity tests after the export exists.

## J. Final Recommendation

1. Is RatAiFy ready for P2 implementation?

Ready for a Verixet-export-first implementation, not ready for direct local constant deletion or architecture rewrites.

2. What should be implemented first?

Implement Verixet generated catalog additions for RatAiFy feature keys, aliases, top-up mapping, manual/review reasons, normalized app membership, deprecated flags, and handoff metadata.

3. Which file is the highest-risk source of remaining drift?

`apps/RatAiFy/src/lib/billing/plans.ts`. It contains package rows, prices, app membership, feature flags, usage limits, credit costs, top-up packs, Stripe env mapping, aliases, and normalization helpers.

4. Which tests should block the implementation commit?

Block on Verixet generated catalog tests, RatAiFy `test:billing`, RatAiFy entitlement adapter tests, `tests/rataify-entitlements.node.test.ts`, `tests/rataify-pricing-authority.node.test.ts`, `tests/billing-catalog.node.test.ts`, `tests/billing-checkout-product-catalog.node.test.ts`, `tests/billing-ui-wiring.node.test.ts`, and `npm --prefix apps/RatAiFy run typecheck`.

5. What exact next implementation prompt should be used?

Implement the first P2 RatAiFy cleanup prerequisite: extend the Verixet generated public catalog with a RatAiFy slice containing RatAiFy feature keys, legacy alias mappings, normalized bundle membership/display labels, price-status and manual-setup reasons, deprecated flags for aliases, top-up/add-on mapping metadata, credit/add-on units, entitlement feature keys, and plan/top-up handoff metadata. Add Verixet tests proving the generated artifact exports the RatAiFy slice and that reviewed/manual/legacy rows are not self-serve. Do not change RatAiFy production code, schemas, migrations, Stripe webhooks, Stripe price IDs, checkout behavior, or entitlement enforcement in this commit.

## Verification And Status

Commands run in this planning pass were read-only except for creating this document:

```powershell
git status --short
git -C apps/RatAiFy status --short
rg ...
Get-Content ...
node -e/read-only catalog inspection
```

Root `git status --short` before this doc showed pre-existing unrelated dirt:

- `M package.json`
- multiple untracked RatAiFy/workspace/XFlow proof docs under `docs/`
- multiple untracked workspace proof verifier scripts under `scripts/`

`apps/RatAiFy` `git status --short` was clean before this doc.

Other app repo status check:

- `apps/AudAix`: clean
- `apps/CreVux`: clean
- `apps/RatAiFy`: clean before this doc
- `apps/Verixet`: clean
- `apps/WordGeni`: clean
- `apps/XFlow`: clean
- `apps/PitStrike`: status check hit Git safe-directory/dubious-ownership protection, so cleanliness could not be confirmed without changing global Git config.
- `apps/xflow-master-release`, `apps/XFlow-phase4b-pr`, `apps/XFlow-push-through`: status check hit worktree metadata errors pointing at missing `K:` worktree paths, so cleanliness could not be confirmed from this pass.

No production code, schemas, migrations, Stripe webhook logic, Stripe price IDs, checkout behavior, entitlement enforcement, dependency installs, staging, commits, or unrelated dirty files were changed.
