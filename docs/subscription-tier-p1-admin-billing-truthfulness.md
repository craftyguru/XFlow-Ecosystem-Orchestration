# Subscription Tier P1 Admin/Billing Truthfulness

Date: 2026-07-08

## Scope

This P1 pass focused on admin, account, billing, and status surfaces that can imply local plan or subscription data is final ecosystem billing truth. No schema, migration, Stripe webhook, Stripe price ID, payment processor, checkout-flow, dependency, entitlement-architecture, or package/add-on architecture changes were made.

## Surfaces Inspected By App

### Verixet

- `apps/Verixet/src/app/billing/success/page.tsx`
- `apps/Verixet/src/app/account/billing/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/billing/CustomerBillingPageClient.tsx`
- `apps/Verixet/src/app/api/billing/checkout/route.ts`
- `apps/Verixet/src/app/api/billing/top-up/route.ts`
- `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`
- Pricing and checkout tests referenced by the P0 proof summary.

### XFlow

- `apps/XFlow/src/app/(auth)/account/billing/page.tsx`
- `apps/XFlow/src/components/billing/UsageMeterPanel.tsx`
- `apps/XFlow/src/app/(dashboard)/admin/ecosystem/page.tsx`
- `apps/XFlow/src/app/api/billing/status/route.ts`
- `apps/XFlow/src/app/api/billing/checkout/route.ts`
- Existing pricing, authority routing, and Verixet handoff tests referenced by the P0 proof summary.

### CreVux

- `apps/CreVux/artifacts/api-server/src/routes/admin.ts`
- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`
- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`
- `apps/CreVux/artifacts/api-server/src/lib/saasMetering.ts`
- `apps/CreVux/artifacts/api-server/src/routes/video.ts`
- `apps/CreVux/artifacts/api-server/src/routes/settings.ts`
- Existing Verixet admission, billing catalog, and route proof scripts.

### WordGeni

- `apps/WordGeni/apps/api/src/routes/billing.ts`
- `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`
- `apps/WordGeni/apps/api/src/services/verixet-usage-admission.ts`
- `apps/WordGeni/apps/api/src/routes/billing.route.test.ts`
- `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts`
- Existing billing authority and usage admission tests.

### RatAiFy

- `apps/RatAiFy/src/lib/billing/plans.ts`
- `apps/RatAiFy/shared/plans.ts`
- `apps/RatAiFy/client/src/features/trustDashboard/components/RataifyTrustShell.tsx`
- `apps/RatAiFy/tests/trust-dashboard-rendering.node.test.ts`
- `apps/RatAiFy/server/routes/billing.ts`
- `apps/RatAiFy/server/services/entitlementAdapter.ts`
- Existing billing catalog, checkout, entitlement, and trust dashboard tests.

### AudAiX

- `apps/AudAix/src/app.ts`
- `apps/AudAix/src/routes/workspace-routes.ts`
- `apps/AudAix/src/routes/verixet-routes.ts`
- `apps/AudAix/src/routes/health-routes.ts`
- `apps/AudAix/src/lib/billing/entitlement-adapter.ts`
- `apps/AudAix/tests/api.test.ts`
- Existing billing authority, entitlement adapter, route, and workspace billing tests.

## Changes Made By App

### Verixet

- Billing success copy now says Stripe confirmed the `Verixet-managed checkout flow`.
- Billing success copy now says subscription, credits, and entitlements become `Verixet-confirmed` after webhook processing.
- Customer billing summary label changed from `Current plan` to `Current Verixet-managed plan`.
- Customer billing status helper now distinguishes `Verified by Verixet; Stripe portal available` from `Billing verification required; Stripe portal not linked`.
- Added `apps/Verixet/src/app/billing/billing-truthfulness-copy.test.ts`.

### XFlow

- Account billing copy now labels snapshots as either `Local mirror of Verixet-confirmed snapshot` or `Cached local mirror of Verixet snapshot`.
- Missing snapshot state now says `Free/default fallback applies until billing verification succeeds`.
- Usage meter CTAs now say `Upgrade in Verixet` and `Buy credits in Verixet`.
- Usage credit action now points to the billing handoff instead of the local pricing add-ons anchor.
- Added `apps/XFlow/tests/unit/account-billing-truthfulness.test.ts`.

### CreVux

- Admin user detail billing payload now includes `authority: "verixet"`, `authorityLabel: "Local mirror only"`, `planStateLabel`, and `billingVerificationRequired: true`.
- Admin billing subscriptions now include the same local-mirror labels.
- Admin billing summary now includes `authorityLabel: "Verixet-managed"` and states local Stripe/webhook rows are diagnostic mirrors, not final ecosystem billing truth.
- Added `apps/CreVux/artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts`.

### WordGeni

- `/api/billing/state` now returns read-only labels alongside the existing entitlement object:
  - `billingAuthority`
  - `authorityLabel`
  - `entitlementSourceLabel`
  - `planStateLabel`
  - `verixetManaged`
  - `billingVerificationRequired`
- The default Verixet-required state is labeled `Billing verification required` and `Free/default fallback`.
- Updated `apps/WordGeni/apps/api/src/routes/billing.route.test.ts`.

### RatAiFy

- No code change was needed in this pass. Existing P0 work already labels trust dashboard billing as `Verixet plan snapshot`, exposes `Billing authority unavailable`, and states `Verixet is the billing and entitlement authority.`
- Existing tests already cover that trust dashboard copy in `apps/RatAiFy/tests/trust-dashboard-rendering.node.test.ts`.

### AudAiX

- Workspace plan-usage `billingStatus` now includes:
  - `authorityLabel`
  - `entitlementSourceLabel`
  - `planStateLabel`
  - `billingVerificationRequired`
- Labels distinguish `Verified by Verixet`, `Legacy local state`, `Billing verification required`, `Verixet-confirmed`, `Local mirror only`, `Verixet-managed`, and `Free/default fallback`.
- Updated the matching route payload type in `apps/AudAix/src/routes/workspace-routes.ts`.
- Updated `apps/AudAix/tests/api.test.ts`.

## Remaining Ambiguous Surfaces

- Verixet customer billing derives portal availability and subscription lifecycle from current overview helpers; broader persona tests for expired, past due, canceled, unpaid, and manual setup states should be added before release.
- XFlow admin ecosystem page still displays compact `billing: verixet/local/none` badges. It is readable for operators, but could use a richer label map in a later UI pass.
- CreVux settings and admin routes still expose local subscription tier/status fields in several read paths; this pass labeled the highest-risk admin billing surfaces only.
- WordGeni web account/billing surfaces should consume the new `/api/billing/state` labels in a later pass if they render billing state directly.
- RatAiFy local package catalog still has compatibility rows; current user-facing trust dashboard copy is truthful, but broader package/add-on cleanup remains P2.
- AudAiX health routes already expose source fields, but status dashboards should render the new `billingStatus` label fields directly before a release candidate.

## Recommended Recurring Subscription Safety Proof Gate

Use a two-layer gate.

Baseline root gate for every subscription/tier release:

- `npm run proof:billing-contracts`
- `npm run proof:ecosystem:static`
- `npm run validate:ecosystem-contracts`

App-targeted gate:

- Verixet: typecheck, checkout/top-up/canonical catalog/public pricing tests, and `stripe:price-env:verify`.
- XFlow: typecheck plus touched account/billing/pricing/handoff tests.
- AudAiX: typecheck plus touched API/entitlement/billing route tests and `verify:routes`.
- RatAiFy: typecheck plus touched billing catalog, checkout, entitlement, and trust dashboard tests.
- WordGeni: API typecheck plus touched billing entitlement, billing route, and usage admission tests using the existing local node_modules commands to avoid pnpm dependency prompts.
- CreVux: API-server typecheck plus touched Verixet admission, SaaS metering, media admission order, and admin billing truthfulness tests using existing local node_modules commands where available.

If only one root command can be wired immediately, use `npm run proof:billing-contracts` first. It already composes contract validation and static billing proof and is the safest recurring baseline from the P0 proof summary.

## Commands To Run Before Future Subscription/Tier Releases

- `npm run proof:billing-contracts`
- `npm run proof:ecosystem:static`
- `npm run validate:ecosystem-contracts`
- `npm --prefix apps/Verixet run typecheck`
- `npm --prefix apps/Verixet run test -- src/app/billing/billing-truthfulness-copy.test.ts src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx`
- `npm --prefix apps/Verixet run stripe:price-env:verify`
- `npm --prefix apps/XFlow run typecheck`
- `npm --prefix apps/XFlow run test -- tests/unit/account-billing-truthfulness.test.ts tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts`
- `npm --prefix apps/AudAix run typecheck`
- `npm --prefix apps/AudAix run test -- tests/api.test.ts tests/entitlement-adapter.test.ts tests/workspace-plan.test.ts tests/billing-authority-mode.test.ts`
- `npm --prefix apps/AudAix run verify:routes`
- `npm --prefix apps/RatAiFy run typecheck`
- `npx tsx --test tests/trust-dashboard-rendering.node.test.ts tests/billing-catalog.node.test.ts tests/billing-checkout-product-catalog.node.test.ts tests/billing-ui-wiring.node.test.ts tests/rataify-entitlements.node.test.ts tests/entitlement-adapter.node.test.ts`
- `apps\api\node_modules\.bin\vitest.cmd run apps/api/src/routes/billing.route.test.ts apps/api/src/services/billing-entitlements.authority.test.ts apps/api/src/services/verixet-usage-admission.test.ts` from `apps/WordGeni`
- `apps\api\node_modules\.bin\tsc.cmd --noEmit -p apps/api/tsconfig.json` from `apps/WordGeni`
- `artifacts\api-server\node_modules\.bin\vitest.cmd run artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts artifacts/api-server/src/lib/verixetUsageAdmission.test.ts artifacts/api-server/src/lib/saasMetering.admission-order.test.ts artifacts/api-server/src/routes/video.generate-admission-order.test.ts` from `apps/CreVux`
- `.\node_modules\.bin\tsc.cmd -p artifacts/api-server/tsconfig.json --noEmit` from `apps/CreVux`

## Known Unrelated Failures Or Skipped Commands

- Root worktree had pre-existing dirty `package.json` plus unrelated untracked docs/scripts before this pass.
- P0 proof summary recorded a known unrelated RatAiFy broad `verify:ci` failure in `tests/audaix-proof.node.test.ts`.
- P0 audit and proof summary recorded pnpm non-TTY dependency purge prompts for WordGeni and CreVux when using broad pnpm commands. Prefer existing local `node_modules` commands for focused proof unless dependency mutation is explicitly approved.
- Optional Verixet six-month Stripe price environment warnings remain non-blocking.
