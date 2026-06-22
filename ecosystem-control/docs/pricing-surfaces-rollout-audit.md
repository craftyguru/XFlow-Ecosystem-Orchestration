# Pricing Surfaces Rollout Audit

Source artifacts reviewed from `apps/Verixet/artifacts/billing`:

- `final-app-tier-truth.json`
- `final-bundle-tier-truth.json`
- `final-pricing-content-pack.json`
- `app-brand-asset-map.json`

## XFlow

Routes and files found:

- `src/app/(auth)/account/billing/page.tsx`
- `src/app/(dashboard)/billing/checkout/page.tsx`
- `src/app/(dashboard)/billing/checkout/CheckoutRedirectClient.tsx`
- `src/app/(dashboard)/billing/xflow-setup/page.tsx`
- `src/lib/billing/*`
- No existing public `/pricing` route was found under `src/app/(showcase)` before rollout.

Updated:

- Added `src/app/(showcase)/pricing/page.tsx`.
- Added `tests/unit/showcase-pricing-page.test.tsx`.
- Added real ecosystem assets under `public/ecosystem/*`.

Risk notes:

- XFlow has real server-side Verixet and usage admission patterns, but public numeric limits remain `review_required`.
- `src/components/commerce/CommerceCatalogTree.tsx` displays `xflow_price_id` for commerce/admin inspection. This is not the public pricing page, but it should be reviewed before exposing that surface broadly.

## WordGeni

Routes and files found:

- `apps/web/src/app/pricing/page.tsx`
- `apps/web/src/components/pricing/pricing-page-client.tsx`
- `apps/web/src/components/pricing/pricing-page-client.test.ts`
- `apps/web/src/lib/pricing-catalog.ts`
- Billing API surfaces under `apps/api/src/routes/billing.ts`.

Updated:

- Rebuilt `apps/web/src/components/pricing/pricing-page-client.tsx`.
- Updated `apps/web/src/components/pricing/pricing-page-client.test.ts`.
- Added real ecosystem assets under `apps/web/public/ecosystem/*`.

Risk notes:

- WordGeni public tier mapping remains low confidence.
- Pricing copy is intentionally conservative and avoids hard memory/source/export promises.
- Checkout remains a Verixet handoff form with only `plan_slug` and `billing_interval`.

## Crevux

Routes and files found:

- `artifacts/image-gen/src/pages/pricing.tsx`
- `artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
- `artifacts/image-gen/src/components/landing/LandingElitePricing.tsx`
- `artifacts/image-gen/src/lib/landingPricingTiers.ts`
- Billing API surfaces under `artifacts/api-server/src/routes/billing.ts`.

Updated:

- Rebuilt public `artifacts/image-gen/src/pages/pricing.tsx`.
- Added `artifacts/image-gen/src/pages/pricing.test.tsx`.
- Added real ecosystem assets under `artifacts/image-gen/public/ecosystem/*`.

Risk notes:

- Crevux public tier mapping and credit/cap claims remain low confidence.
- The public pricing route no longer depends on raw `priceId` checkout.
- `PlanUpgradePage.tsx` and `LandingElitePricing.tsx` still contain local upgrade/catalog flows and should be reconciled in a later app-internal billing pass rather than forced into this public rollout.

## AudAiX

Routes and files found:

- `dashboard/src/pages/PricingPage.tsx`
- `dashboard/src/pages/PricingPage.test.tsx`
- `dashboard/src/pages/WorkspaceBillingPage.tsx`
- `dashboard/src/features/workspace-billing/WorkspaceBillingSections.tsx`
- `src/lib/billing/plans.ts`

Updated:

- Rebuilt `dashboard/src/pages/PricingPage.tsx`.
- Rebuilt `dashboard/src/pages/PricingPage.test.tsx`.
- Added real ecosystem assets under `dashboard/public/ecosystem/*`.

Risk notes:

- AudAiX confidence is medium.
- Pro tier mapping remains `review_required`, so Pro copy is conservative.
- Public CTAs now use Verixet handoff forms with only `plan_slug` and `billing_interval`.

## Rataify

Routes and files found:

- `client/src/pages/marketing/rataify/PricingPage.tsx`
- `client/src/components/marketing/rataify/PricingSection.tsx`
- `client/src/pages/subscribe.tsx`
- `client/src/pages/checkout.tsx`
- `client/src/pages/account-billing.tsx`
- `client/src/pages/billing-select-plan.tsx`
- `server/routes/billing.ts`
- `server/services/billingCheckout.ts`
- `src/lib/billing/plans.ts`

Updated:

- Rebuilt `client/src/pages/marketing/rataify/PricingPage.tsx`.
- Rebuilt `client/src/components/marketing/rataify/PricingSection.tsx`.
- Updated pricing authority tests under `tests/`.
- Added real ecosystem assets under `client/public/ecosystem/*`.

Risk notes:

- Rataify has stronger numeric limit evidence than the creator apps, so mapped limits are shown.
- Public checkout cards now submit only `plan_slug` and `billing_interval`.
- Existing subscribe and checkout pages still exist and should remain separate from public marketing pricing.

## Cross-App Findings

Reusable pattern:

- App-specific hero first.
- Current app Starter, Pro, and Elite cards first.
- App-only comparison table.
- Bundle recommendation cards below current app tiers.
- Six-app ecosystem rail with copied real assets.
- FAQ covering trials, cancellation, bundles, Verixet, and app fit.

Old bundle copy:

- Public rebuilt pages avoid `all 6 for $99`.
- Main 4 Starter is shown as `$99/mo`.
- Full Ecosystem Starter is shown as `$129/mo`.
- Creator Starter is shown as `$39/mo`.

Raw Stripe IDs:

- No rebuilt public pricing page intentionally renders raw `price_` IDs.
- Existing server, test, and environment example files still contain Stripe IDs or fake IDs where appropriate.
- Crevux app-internal upgrade/catalog surfaces and XFlow commerce inspection surfaces need later targeted review if they become public marketing surfaces.

## Post-Rollout Validation Cleanup

Scope:

- XFlow build/typecheck blocker reported at `apps/XFlow/src/app/(dashboard)/overview/page.tsx:211`.
- Crevux full unit suite blockers in `AdminDashboardPage` mocks and `PlanUpgradePage` expectations.

What was fixed:

- XFlow was revalidated without a code change. The previously reported `overview/page.tsx:211` type blocker is not present in the current workspace state; the build completes successfully.
- Crevux `AdminDashboardPage.test.tsx` had a stale `@/lib/adminApi` mock that omitted export dashboard helpers now imported by `AdminDashboardPage.tsx`. The test mock was updated to include the missing export summary/recent/failure/usage/storage helpers.
- Crevux `PlanUpgradePage.test.tsx` had stale copy expectations for price and credit labels. The test expectations now match the current rendered text: `per month` and `credits per period`.

What remains blocked:

- No blocking validation failures remain for the XFlow and Crevux commands run in this cleanup.
- XFlow still emits non-blocking build/lint warnings for a showcase pricing `<img>` and existing Edge runtime compatibility warnings from `jose`/`next-auth`.
- Crevux build completes with non-blocking bundler timing/chunk warnings.

Commands run:

- XFlow: `npm run build`
- XFlow: `npm run lint`
- XFlow: `npx vitest run tests/unit/showcase-pricing-page.test.ts`
- Crevux: `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/AdminDashboardPage.test.tsx src/pages/PlanUpgradePage.test.tsx`
- Crevux: `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/pricing.test.tsx`
- Crevux: `pnpm --filter @workspace/image-gen typecheck`
- Crevux: `pnpm --filter @workspace/image-gen build`
