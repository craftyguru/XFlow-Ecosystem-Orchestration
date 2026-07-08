# P1 Verixet Catalog Consumption Plan

## A Executive Summary

Verixet is the current commercial authority for the ecosystem plan catalog, checkout, billing status, entitlement evaluation, usage admission, portal session, and Stripe webhook ownership. The P0 proof summary confirms this authority boundary and the P1 admin/billing truthfulness pass labels satellite local state as mirrors, fallback, or diagnostic state rather than final billing truth.

The remaining P1 drift risk is catalog consumption. Verixet has canonical catalog sources and public pricing routes, but XFlow, CreVux, WordGeni, RatAiFy, and AudAiX still carry local pricing, plan, bundle, top-up, limit, CTA, entitlement fallback, or Stripe price mapping definitions. These mirrors are safer after P0, but they can still diverge in names, prices, package membership, checkout availability, manual setup status, free caps, and add-on language.

Recommended integration model: hybrid.

- Verixet owns the canonical catalog and exports a versioned generated artifact.
- Satellites consume the generated artifact for display copy, pricing, bundles, add-ons, limits, and CTAs.
- Satellites call Verixet runtime APIs for checkout, entitlement, billing status, and usage admission.
- Satellites retain only safe local fallback labels for offline, free, and default states.
- Satellites fail closed for paid operations when Verixet confirmation is missing.

Static-only consumption is too stale for billing state. Runtime-only consumption is fragile for public and local development screens. A shared package alone would not cover live checkout, entitlement, or usage admission. The hybrid model keeps display deterministic while preserving Verixet as the runtime billing authority.

## B Current Catalog Source Inventory

### Verixet

- Local plan files/constants: `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/billing/plans.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`.
- Pricing/package/bundle definitions: `CANONICAL_BILLING_PLANS`, `BUNDLE_APPS`, bundle families, public pricing sections, `apps/Verixet/src/components/shared/pricing/*`.
- Upgrade CTA definitions: public pricing catalog and shared pricing CTA components.
- Add-on/top-up/credit definitions: `CREDIT_TOP_UP_PACKS`, `PUBLIC_CREDIT_TOP_UP_PACKS`, storage add-ons, `/api/billing/top-up`.
- Entitlement fallback definitions: `apps/Verixet/src/lib/commerce/entitlements-evaluate.ts`, `apps/Verixet/src/lib/access-billing-control/service.ts`, `apps/Verixet/src/lib/ecosystem/entitlements.ts`.
- Verixet handoff logic: `/checkout/handoff`, `/api/billing/checkout`, `/api/billing/plan-change/*`, `/api/platform/v1/plans`, `/api/public/pricing/catalog`.
- Tests/proofs: canonical catalog, ecosystem billing, public pricing catalog, checkout/top-up, shared pricing, platform catalog routes, Stripe price env verification.

### XFlow

- Local plan files/constants: `apps/XFlow/src/lib/billing/commercial-pricing.ts`, `apps/XFlow/src/lib/billing/plans.ts`, `apps/XFlow/src/lib/pricing/ecosystem-pricing-catalog.ts`, `apps/XFlow/src/lib/pricing/pricing-entitlements.ts`.
- Pricing/package/bundle definitions: local ecosystem pricing catalog and commercial pricing helpers for single app, bundles, handoff display, and signup/pricing pages.
- Upgrade CTA definitions: pricing page content, sign-up pricing authority section, usage meter actions.
- Add-on/top-up/credit definitions: local credit/top-up mapping notes and Verixet billing handoff copy.
- Entitlement fallback definitions: `apps/XFlow/src/lib/verixet/xflow-entitlements.ts`, `apps/XFlow/src/lib/verixet/entitlement-client.ts`, `apps/XFlow/src/lib/billing/entitlement-resolution.ts`.
- Verixet handoff logic: `apps/XFlow/src/app/api/billing/checkout/route.ts`, Verixet handoff tests, pricing links to Verixet.
- Tests/proofs: ecosystem pricing catalog, signup pricing catalog, showcase pricing, authority routing, Verixet handoff, billing entitlement resolution, Verixet entitlement client.

### CreVux

- Local plan files/constants: `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`, `apps/CreVux/lib/db/src/schema/subscriptionTiers.ts`, `apps/CreVux/artifacts/api-server/src/routes/billing.ts`, `apps/CreVux/artifacts/api-server/src/lib/stripeSubscriptionTier.ts`, `apps/CreVux/artifacts/api-server/src/lib/stripePlanCreditFallback.ts`.
- Pricing/package/bundle definitions: local subscription tiers, local Stripe subscriber burn mapping, billing subscription catalog route, SaaS entitlement policy package.
- Upgrade CTA definitions: image-gen insufficient-credit modal URLs, app dashboard/billing links, API billing route responses.
- Add-on/top-up/credit definitions: AI credit balance, credit ledger, video credit policy, Stripe plan credit fallback, media credit admission.
- Entitlement fallback definitions: SaaS entitlements package, entitlement HTTP adapter, Verixet usage admission helpers.
- Verixet handoff logic: `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`, billing/admin truthfulness routes, usage admission fail-closed helper.
- Tests/proofs: Verixet usage admission tests, SaaS metering admission order, video generation admission order, billing subscription catalog route proof, Stripe fallback tests.

### WordGeni

- Local plan files/constants: `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`, `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`, `apps/WordGeni/apps/api/src/services/stripe/plan-from-price.ts`, `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts`.
- Pricing/package/bundle definitions: local `free/pro/studio/enterprise` plan vocabulary, web pricing catalog, API billing route accepted plan inputs.
- Upgrade CTA definitions: billing route responses, web control center checkout actions, dashboard copy.
- Add-on/top-up/credit definitions: Cursor billing policy, AI usage limits, Verixet usage admission credit metadata.
- Entitlement fallback definitions: billing entitlement authority service, visual companion entitlement service, local workspace plan fallback.
- Verixet handoff logic: `apps/WordGeni/apps/api/src/services/verixet-usage-admission.ts`; checkout now defers authority but local Stripe/webhook processor still maps prices.
- Tests/proofs: billing route tests, billing entitlement authority tests, plan-from-price tests, usage admission tests, Stripe webhook processor tests.

### RatAiFy

- Local plan files/constants: `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/shared/plans.ts`, `apps/RatAiFy/server/lib/rateLimiter.ts`, `apps/RatAiFy/server/services/stripe.ts`.
- Pricing/package/bundle definitions: `BILLING_CATALOG`, `PUBLIC_PLAN_ORDER`, local ecosystem package rows, legacy aliases, app slug lists, local Stripe plan projection.
- Upgrade CTA definitions: `upgradeCta` per local catalog row, trust dashboard copy, upgrade pressure helper.
- Add-on/top-up/credit definitions: `TOP_UP_PACKS`, `CREDIT_COST_PER_FEATURE`, credit pools, explicit ecosystem credit packs.
- Entitlement fallback definitions: `apps/RatAiFy/server/services/entitlementAdapter.ts`, `rataifyEntitlements.ts`, `entitlements.ts`, org plan/rate limiter fallbacks.
- Verixet handoff logic: usage ingest/admission services, Verixet webhook receiver, local Stripe mode guard.
- Tests/proofs: billing catalog, checkout product catalog, billing UI wiring, entitlement adapter, RatAiFy entitlements, trust dashboard rendering.

### AudAiX

- Local plan files/constants: `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/src/stripe-checkout-session.ts`, `apps/AudAix/src/routes/stripe-billing-routes.ts`.
- Pricing/package/bundle definitions: local `free/pro/elite/enterprise` billing plans, workspace limits, Stripe checkout route metadata.
- Upgrade CTA definitions: plan limit errors in `apps/AudAix/src/app.ts`, local billing plan CTAs, workspace plan usage payload.
- Add-on/top-up/credit definitions: billable actions and credit cost helpers in billing plans; workspace credit ledger.
- Entitlement fallback definitions: `apps/AudAix/src/lib/billing/entitlement-adapter.ts`, `apps/AudAix/src/audaix-entitlements.ts`, workspace billing snapshots.
- Verixet handoff logic: `apps/AudAix/src/routes/verixet-routes.ts`, Verixet webhook receiver routes, billing authority mode.
- Tests/proofs: entitlement adapter, workspace plan, billing authority mode, API tests, Stripe checkout/webhook tests, route proof.

## C Drift Matrix

| App | Local catalog source | Verixet canonical source | Drift type | User-facing risk | Payment risk | Recommended fix | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Verixet | `canonical-catalog.ts`, `public-pricing-catalog.ts` | Same app authority | manual setup/review state mismatch | Generated public artifact could omit non-final labels | Reviewed rows could look checkoutable if export is wrong | Add generated artifact schema/proof from canonical catalog | P1-blocker |
| XFlow | `commercial-pricing.ts`, `ecosystem-pricing-catalog.ts` | Verixet canonical/public catalog | price mismatch, CTA mismatch, bundle membership mismatch, add-on/top-up mismatch | Public pricing and sign-up copy can show stale package rows | Handoff can request a plan that Verixet blocks | Replace display data with generated Verixet artifact; runtime checkout stays Verixet | P1-high |
| CreVux | SaaS entitlements package, billing routes, subscription tier schema | Verixet canonical/public catalog plus usage admission | plan name mismatch, add-on/top-up mismatch, entitlement mismatch, legacy fallback risk | Credits/tier labels can imply local authority | Local Stripe/fallback credit rows can drift from Verixet admission | Consume artifact for display; keep Verixet admission fail-closed for paid media | P1-medium |
| WordGeni | API billing entitlements, `plan-from-price.ts`, web pricing catalog | Verixet canonical/public catalog plus usage admission | plan name mismatch, price mismatch, free-tier limit mismatch, entitlement mismatch | `pro/studio/enterprise` vocabulary can diverge from ecosystem tiers | Local Stripe price mapping can imply local authority | Map local display aliases to Verixet slugs; retire price-derived authority | P1-medium |
| RatAiFy | `BILLING_CATALOG`, `shared/plans.ts`, Stripe plan projection | Verixet canonical/public catalog | bundle membership mismatch, price mismatch, add-on/top-up mismatch, legacy fallback risk | Local ecosystem plan can omit WordGeni/CreVux or show stale price rows | Legacy aliases/local Stripe plan rows can mislead checkout | Replace public rows and top-ups from generated artifact; keep legacy aliases internal only | P1-high |
| AudAiX | `lib/billing/plans.ts`, `workspace-plan.ts`, Stripe billing routes | Verixet canonical/public catalog plus billing status | plan name mismatch, CTA mismatch, free-tier limit mismatch, entitlement mismatch | `pro/elite` limits can look final without Verixet state | Local checkout/webhook routes can conflict with authority mode | Consume artifact for display/limits; runtime billing uses Verixet confirmation | P1-high |
| Root | `ecosystem-contracts/routes.json`, env/token contracts | Verixet export artifact and runtime APIs | contract coverage gap | Contracts say replace local plan catalogs but do not verify artifact use | Drift can return silently after app edits | Add root proof that each satellite imports/consumes generated artifact or marked display-only fallback | P1-high |

Required drift types covered: plan name mismatch, price mismatch, bundle membership mismatch, add-on/top-up mismatch, CTA mismatch, entitlement mismatch, free-tier limit mismatch, manual setup/review state mismatch, legacy fallback risk.

## D Recommended Consumption Model

| Model | Pros | Cons | Failure mode | Local dev | Deployment | Test strategy | Recommended use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Static generated artifact | Fast, deterministic, reviewable diffs, works for public pages and local dev | Can become stale if not regenerated | Satellite displays old price or checkout availability | Works offline from checked-in JSON/TS artifact | Needs release process/gate | Schema validation, snapshot tests, root import proof | Display copy, prices, bundles, add-ons, free caps, CTAs |
| Runtime API | Always current, can include live billing and checkout availability | Adds latency and outage dependency | Public pricing fails open or renders unavailable state badly | Needs mock/server fixture | Needs auth, tokens, network, cache policy | Contract tests and fail-closed integration tests | Checkout, entitlement, billing status, portal, usage admission |
| Shared package/contract | Strong typing and compile-time reuse | Still needs publication/versioning and cannot answer live status | Apps pin old package or import server-only code into browser | Good when built from generated artifact | Needs package/version governance | Type tests and consumer import tests | Types and helpers generated from artifact |

Recommendation: hybrid.

Verixet should own the canonical catalog and export a versioned generated artifact. Satellites should consume that artifact for display copy, pricing, bundles, add-ons, limits, and CTAs. Satellites should call Verixet runtime APIs for checkout, entitlement, billing status, and usage admission. Satellites should retain only safe local fallback labels for offline/free/default display states. Satellites should fail closed for paid operations when Verixet confirmation is missing.

## E Per-App Migration Plan

### XFlow

- Likely files: `src/lib/billing/commercial-pricing.ts`, `src/lib/pricing/ecosystem-pricing-catalog.ts`, `src/app/(auth)/sign-up/SignUpClient.tsx`, pricing/showcase components, billing checkout route tests.
- Constants to remove/replace/mark display-only: local package prices, bundle labels, top-up mapping notes, plan CTAs, hardcoded Verixet pricing links where a generated handoff URL exists.
- New source: generated Verixet catalog artifact for public pricing and CTAs; Verixet runtime APIs for checkout/status/entitlement.
- Fallback behavior: render free/default labels and "Open Verixet pricing" only; do not synthesize paid plan rows.
- Tests: ecosystem pricing catalog, signup pricing, showcase pricing, handoff route, authority routing, billing entitlement resolution.
- Verification: typecheck plus focused XFlow pricing/handoff tests.
- Rollback risk: public pricing page regressions; keep old constants behind test-only fixtures until generated artifact passes.

### CreVux

- Likely files: `lib/saas-entitlements/src/saasEntitlements.ts`, `artifacts/api-server/src/routes/billing.ts`, `stripeSubscriptionTier.ts`, `stripePlanCreditFallback.ts`, image-gen insufficient credit UI.
- Constants to remove/replace/mark display-only: local subscription tier labels, local credit-pack rows, fallback plan credit grants, local checkoutable flags.
- New source: generated Verixet catalog artifact for display/tier copy; Verixet usage admission and billing status APIs for paid media operations.
- Fallback behavior: free/default display only; paid media requires confirmed Verixet admission.
- Tests: Verixet usage admission, SaaS metering admission order, video generation admission order, billing catalog route proof.
- Verification: API-server typecheck and existing targeted vitest suite.
- Rollback risk: media credit UX if generated credit labels do not include CreVux-specific image/video credit keys.

### WordGeni

- Likely files: `apps/api/src/services/billing-entitlements.ts`, `apps/api/src/services/ai-usage-limits.ts`, `apps/api/src/services/stripe/plan-from-price.ts`, `apps/api/src/routes/billing.ts`, `apps/web/src/lib/pricing-catalog.ts`.
- Constants to remove/replace/mark display-only: `pro/studio/enterprise` price/display mappings, local Stripe price-to-plan authority, web pricing catalog rows.
- New source: generated Verixet catalog artifact with WordGeni app plans and creator/full-ecosystem bundle membership.
- Fallback behavior: local plan labels become aliases only; free/default remains safe; premium usage requires Verixet admission.
- Tests: billing route, billing entitlement authority, plan-from-price, usage admission, web pricing catalog tests.
- Verification: API typecheck and focused vitest commands using local node_modules.
- Rollback risk: local plan vocabulary is embedded in UI and database fields; use alias layer before deleting old terms.

### RatAiFy

- Likely files: `src/lib/billing/plans.ts`, `shared/plans.ts`, `server/services/stripe.ts`, `server/lib/upgradePressure.ts`, pricing/trust dashboard components.
- Constants to remove/replace/mark display-only: `BILLING_CATALOG` public rows, `PUBLIC_PLAN_ORDER`, ecosystem package rows, top-up packs, upgrade CTAs, legacy alias display rows.
- New source: generated Verixet artifact for all public/package/top-up display; Verixet entitlement/usage APIs for runtime gates.
- Fallback behavior: legacy aliases remain internal compatibility only and must not render as public offers.
- Tests: billing catalog, checkout product catalog, billing UI wiring, entitlement adapter, RatAiFy entitlements, trust dashboard rendering.
- Verification: `npx tsx --test` targeted billing/entitlement suite.
- Rollback risk: highest structural drift because local ecosystem package rows and legacy aliases are broad.

### AudAiX

- Likely files: `src/lib/billing/plans.ts`, `src/workspace-plan.ts`, `src/app.ts`, `src/routes/stripe-billing-routes.ts`, `src/lib/billing/entitlement-adapter.ts`.
- Constants to remove/replace/mark display-only: local `pro/elite/enterprise` prices and CTAs, workspace plan usage display limits, local checkout button metadata.
- New source: generated Verixet catalog artifact for billing display and upgrade CTA; Verixet billing/entitlement status for paid access.
- Fallback behavior: free/default limits only; paid status shows billing verification required unless Verixet snapshot confirms.
- Tests: entitlement adapter, workspace plan, billing authority mode, API route tests, Stripe checkout/webhook compatibility tests.
- Verification: AudAiX typecheck, route proof, focused test files.
- Rollback risk: local workspace `plan` values are used widely for limits; migrate display before enforcing generated limits.

## F Verixet Export Plan

Export fields:

- `catalogVersion`
- `schemaVersion`
- `generatedAt`
- `lastGeneratedTimestamp`
- `slugs`
- `appOwnership`
- `bundleMembership`
- `pricingDisplay`
- `priceStatus`
- `checkoutAvailability`
- `manualSetup`
- `addOns`
- `topUps`
- `freeCaps`
- `paidLimits`
- `ctas`
- `handoffUrls`
- `entitlementKeys`
- `deprecatedFlags`

Existing Verixet files that can generate this:

- `apps/Verixet/src/lib/billing/canonical-catalog.ts`: canonical plan slugs, scope, app/bundle ownership, checkout availability, price status, bundle grants.
- `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`: display copy, public tiers, pricing display, CTA state, add-ons/top-ups for public screens.
- `apps/Verixet/src/lib/billing/plans.ts`: app plan constants and Stripe price env mapping.
- `apps/Verixet/src/app/api/public/pricing/catalog/route.ts`: current public catalog response shape.
- `apps/Verixet/src/app/api/platform/v1/catalog/*`: platform catalog API candidates for runtime contract alignment.
- `apps/Verixet/src/lib/commerce/entitlements-evaluate.ts` and `apps/Verixet/src/lib/access-billing-control/service.ts`: entitlement and admission keys.

A proof script is needed. It should generate or validate the artifact from Verixet sources, assert schema version, assert all six app slugs are present, assert bundle membership includes Creator, Main 4, and Full Ecosystem correctly, assert reviewed/manual rows are non-checkoutable in display metadata, and assert top-up/add-on rows have explicit credit/storage keys.

Root `ecosystem-contracts` should reference the generated catalog after the Verixet export commit. The cleanest pattern is either `ecosystem-contracts/generated/verixet-public-catalog.json` plus a schema in `ecosystem-contracts/types`, or a Verixet-owned generated artifact with a root proof that imports it. The root contract should not duplicate prices by hand.

## G Contract/Test Plan

- Verixet export schema test: validates required fields, schema version, generated timestamp, and deterministic ordering.
- Verixet catalog truth test: generated artifact matches `CANONICAL_BILLING_PLANS` and `public-pricing-catalog` for public rows.
- Checkout safety test: every generated row with `pricing_status: "price_mismatch_review"`, missing price, deprecated flag, or manual setup has `checkout_available: false` or a manual setup CTA.
- Bundle membership test: Creator includes WordGeni and CreVux; Main 4 includes XFlow, Verixet, RatAiFy, AudAiX; Full Ecosystem includes all six.
- Satellite display tests: each app imports generated artifact or a generated consumer helper, and no public pricing page reads retired local constants.
- Satellite runtime tests: checkout, entitlement, billing status, and usage admission still call Verixet runtime APIs and fail closed.
- Root proof gate: `npm run proof:billing-contracts` should include generated catalog validation after the first implementation commit.

## H Implementation Sequence

1. Verixet generated artifact/schema proof.
2. XFlow display catalog consumption.
3. RatAiFy display catalog consumption.
4. AudAiX display catalog consumption.
5. WordGeni display catalog consumption.
6. CreVux display catalog consumption.
7. Root recurring proof gate.
8. Cleanup old constants / mark display-only/legacy.

## I Verification Commands

```powershell
git status --short
npm run proof:billing-contracts
npm run proof:ecosystem:static
npm run validate:ecosystem-contracts
npm --prefix apps/Verixet run test -- src/lib/billing/canonical-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/app/api/public/pricing/catalog/route.test.ts src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/components/shared/pricing/shared-pricing.test.tsx
npm --prefix apps/Verixet run stripe:price-env:verify
npm --prefix apps/XFlow run test -- tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/unit/showcase-pricing-page.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts
npm --prefix apps/AudAix run test -- tests/entitlement-adapter.test.ts tests/workspace-plan.test.ts tests/billing-authority-mode.test.ts tests/api.test.ts
```

```powershell
cd apps/RatAiFy
npx tsx --test tests/billing-catalog.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts tests/trust-dashboard-rendering.node.test.ts
```

```powershell
cd apps/WordGeni
apps\api\node_modules\.bin\vitest.cmd run apps/api/src/routes/billing.route.test.ts apps/api/src/services/billing-entitlements.authority.test.ts apps/api/src/services/verixet-usage-admission.test.ts apps/api/src/services/stripe/plan-from-price.test.ts
```

```powershell
cd apps/CreVux
artifacts\api-server\node_modules\.bin\vitest.cmd run artifacts/api-server/src/lib/verixetUsageAdmission.test.ts artifacts/api-server/src/lib/saasMetering.admission-order.test.ts artifacts/api-server/src/routes/video.generate-admission-order.test.ts artifacts/api-server/src/lib/stripePlanCreditFallback.test.ts artifacts/api-server/src/lib/stripeSubscriptionTier.test.ts
```

```powershell
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/CreVux status --short
git -C apps/WordGeni status --short
git -C apps/RatAiFy status --short
git -C apps/AudAix status --short
git status --short
```

## J Open Questions / Decisions Needed

1. What implemented first?

Implement the Verixet generated catalog artifact and schema/proof first. Do not start with a satellite. Consumers need a stable generated contract before local plan constants can be retired safely.

2. Which satellite worst catalog drift?

RatAiFy has the worst structural drift because it has a broad local `BILLING_CATALOG`, local ecosystem package rows, top-up packs, public plan order, legacy aliases, and local Stripe projection. XFlow is the highest public user-facing drift risk because it is the main signup/pricing entry point.

3. Should satellites consume checked-in artifact, runtime API, or both?

Both. Satellites should consume a checked-in generated artifact for display and local dev determinism, and call Verixet runtime APIs for checkout, billing status, entitlements, portal sessions, and usage admission.

4. Which local plan files retired first?

Retire or mark display-only in this order: `apps/RatAiFy/src/lib/billing/plans.ts` public package rows and `apps/RatAiFy/shared/plans.ts`; `apps/XFlow/src/lib/billing/commercial-pricing.ts` and `apps/XFlow/src/lib/pricing/ecosystem-pricing-catalog.ts`; `apps/AudAix/src/lib/billing/plans.ts` public display rows; `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts` and API price-to-plan display mappings; CreVux local subscription tier/credit display rows after the media credit export fields are proven.

5. Exact next implementation prompt.

Implement P1 Verixet generated catalog artifact and proof only. Do not change satellite consumers yet. Add a versioned generated public catalog artifact from `apps/Verixet/src/lib/billing/canonical-catalog.ts` and `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, including schema/version/generatedAt/app ownership/bundle membership/pricing display/price status/checkout availability/manual setup/add-ons/top-ups/free caps/paid limits/CTAs/handoff URLs/entitlement keys/deprecated flags. Add tests or a proof script asserting all six apps and all bundle families are present, reviewed/manual rows are not self-serve checkoutable, and the artifact stays deterministic. Wire the root proof to reference the generated catalog without changing schemas, migrations, Stripe webhooks, price IDs, checkout flows, entitlement architecture, package/add-on architecture, or satellite production code.
