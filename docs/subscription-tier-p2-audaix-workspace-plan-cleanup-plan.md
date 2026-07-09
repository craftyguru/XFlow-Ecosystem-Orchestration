# P2 AudAiX Workspace Plan/Add-On Cleanup Plan

## A. Executive Summary

AudAiX is safer after P0/P1, but it still has structural workspace-plan and add-on drift. P0 made AudAiX paid gates fail closed unless Verixet entitlement or usage authority is present. P1 aligned many display labels with Verixet through `apps/AudAix/src/lib/billing/verixet-catalog-display.ts`, `workspacePlanDisplayFor()`, billing status labels, and focused tests. The remaining risk is that AudAiX still owns local workspace tiers, billing plan constants, usage-limit matrices, credit costs, credit top-up rows, local Stripe fallback paths, and dashboard pricing constants that can look like final commercial authority.

Current status: AudAiX public AudAiX single-app plans are mirrored from Verixet for display (`audaix_starter`, `audaix_pro`, `audaix_elite`) and Verixet says those rows are active/self-serve. Ecosystem Starter is also active/self-serve, while Main 4 and Ecosystem Pro/Elite rows are pricing-under-review/manual setup/non-self-serve. AudAiX local AI top-up packs are explicitly fallback/local mirror only because Verixet exports global `ai_*`, `media_*`, and `storage_*` packs rather than AudAiX-specific `small/growth/scale` packs.

What P0/P1 already fixed: production-like billing authority defaults to Verixet; local Stripe is rejected in production authority mode; missing Verixet snapshots resolve to free/default entitlement; local workspace/billing rows cannot unlock paid access; public display metadata says managed through Verixet, local mirror only, manual setup, or pricing under review where applicable.

Structural drift remaining: `BILLING_PLANS`, `PUBLIC_AUDAIX_PLANS`, `PUBLIC_ECOSYSTEM_PLANS`, `CREDIT_COSTS`, `CREDIT_TOP_UP_PACKS`, `WORKSPACE_PLAN_LIMITS`, `AUDAIX_USAGE_LIMITS`, `AUDAIX_PRICING`, dashboard `PUBLIC_ECOSYSTEM_APPS`, local Stripe checkout/top-up helpers, and workspace usage payload labels still encode local commercial assumptions.

Recommended P2 strategy: implement an adapter-first cleanup. First extend the Verixet generated catalog with an AudAiX-specific slice for workspace aliases, feature/usage keys, usage-limit labels, top-up mapping, manual/review reasons, handoff metadata, and deprecated/fallback flags. Then update AudAiX so local constants become classified fallback/local mirror/legacy data, not independent billing/workspace-plan authority.

AudAiX is ready for a Verixet-export-first implementation. It is not ready for direct local constant deletion because those constants still feed workspace creation defaults, usage-limit enforcement, dashboard usage display, local Stripe compatibility, and fallback-safe free behavior.

## B. Current AudAiX Inventory

| Area | Current source | Function/constant names | Current role |
| --- | --- | --- | --- |
| Local workspace tiers | `apps/AudAix/src/workspace-plan.ts` | `workspacePlanTierSchema`, `WORKSPACE_PLAN_LIMITS`, `readNewWorkspacePlanTier()`, `normalizeWorkspacePlanTier()`, `planLimitsFor()`, `requiredPlanForLimit()`, `workspacePlanDisplayFor()` | Defines free/pro/elite workspace tier fallback and usage caps. |
| Local billing plans | `apps/AudAix/src/lib/billing/plans.ts` | `BILLING_PLANS`, `PlanSlug`, `PlanCatalogEntry`, `billingPlanFor()` | Central local catalog for `free`, `pro`, `elite`, and `enterprise`; `pro` is marketed as Starter. |
| Public AudAiX plan rows | `apps/AudAix/src/lib/billing/plans.ts` | `PUBLIC_AUDAIX_PLANS`, `publicAudaixPlanSlugSchema` | Maps Verixet public slugs to local/internal plan slugs and local price/env rows. |
| Public ecosystem plan rows | `apps/AudAix/src/lib/billing/plans.ts` | `PUBLIC_ECOSYSTEM_PLANS`, `publicEcosystemPlanSlugSchema` | Local mirror of ecosystem Starter/Pro/Elite with Verixet display metadata. |
| Verixet display mirror | `apps/AudAix/src/lib/billing/verixet-catalog-display.ts` | `VERIXET_DISPLAY_PLANS`, `VERIXET_TOP_UP_DISPLAY`, `localFallbackCatalogDisplay()` | P1 display adapter for Verixet plan/top-up labels and manual/review/self-serve state. |
| Usage limits | `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/src/audaix-entitlements.ts`, `apps/AudAix/src/lib/billing/plans.ts` | `WORKSPACE_PLAN_LIMITS`, `AUDAIX_USAGE_LIMITS`, `AUDAIX_ACTION_LIMITS`, `UsageLimitKey`, `AudaixUsageLimitKey` | Local caps for audits, pages, schedules, diagnostics, signals, AI jobs, storage, workflows, retention. |
| Credit costs | `apps/AudAix/src/lib/billing/plans.ts` | `CREDIT_COSTS`, `creditCostFor()`, `CreditType`, `BillableAction` | Local credit policy for ops and AI-heavy actions. |
| Top-up/add-on labels | `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/lib/billing/verixet-catalog-display.ts` | `CREDIT_TOP_UP_PACKS`, `VERIXET_TOP_UP_DISPLAY` | Three local AI-heavy packs, displayed as fallback/local mirror only. |
| Credit enforcement | `apps/AudAix/src/lib/billing/credit-enforcement.ts` | `assertWorkspaceCreditsAvailable()`, `debitWorkspaceCreditsForAcceptedAction()`, `workspaceCreditLimitPayload()` | Uses local `CREDIT_COSTS` and `CREDIT_TOP_UP_PACKS.growth.catalogDisplay.ctaLabel`. |
| Verixet usage admission | `apps/AudAix/src/lib/billing/verixet-usage.ts`, `apps/AudAix/src/lib/billing/audaix-usage-keys.ts` | `AUDAIX_USAGE_KEYS`, `VERIXET_USAGE_FEATURE_KEYS`, `assertVerixetUsageAdmission()` | Maps AudAiX usage keys to Verixet usage feature keys and fails closed in launch/Verixet mode. |
| Entitlement fallback | `apps/AudAix/src/lib/billing/entitlement-adapter.ts`, `apps/AudAix/src/audaix-entitlements.ts`, `apps/AudAix/src/ecosystem-entitlements.ts` | `DefaultWorkspaceEntitlementAdapter`, `resolveAudaixEntitlementFromSnapshot()`, `planFromSnapshot()` | Reads Verixet snapshots first; otherwise falls back to local free/default. |
| Billing authority | `apps/AudAix/src/lib/billing/billing-authority.ts` | `readBillingAuthorityMode()`, `validateBillingAuthorityEnv()`, `isVerixetBillingAuthority()` | Production/strict mode requires Verixet and rejects local Stripe conflicts. |
| Local Stripe compatibility | `apps/AudAix/src/stripe-checkout-session.ts`, `apps/AudAix/src/routes/workspace-routes.ts`, `apps/AudAix/src/routes/stripe-billing-routes.ts`, `apps/AudAix/src/stripe-billing-webhook.ts` | `createWorkspaceStripeCheckoutSession()`, `createWorkspaceStripeCreditTopUpCheckoutSession()`, `buildStripeSubscriptionCheckoutParams()`, `registerStripeBillingRoutes()` | Legacy/local Stripe checkout, top-up, portal, and webhook compatibility. |
| BillingStatus display | `apps/AudAix/src/app.ts`, `apps/AudAix/src/routes/workspace-routes.ts`, `apps/AudAix/dashboard/src/features/workspace-billing/WorkspaceBillingSections.tsx` | `buildWorkspacePlanUsagePayload()`, `WorkspaceBillingAuthorityStatusPanel`, `WorkspaceUsageSection` | Shows authority, checkout/webhook status, entitlement source, usage meters, and upgrade links. |
| Upgrade CTA surfaces | `apps/AudAix/dashboard/src/pages/WorkspaceBillingPage.tsx`, `apps/AudAix/dashboard/src/features/workspace-billing/*`, `apps/AudAix/dashboard/src/pages/PricingPage.tsx`, `apps/AudAix/dashboard/src/pages/EcosystemPage.tsx`, `apps/AudAix/dashboard/src/lib/ecosystemCatalog.ts` | `WorkspaceUpgradeSection`, `checkoutPayload()`, `checkoutActionUrl()`, `AUDAIX_PRICING`, `PUBLIC_ECOSYSTEM_APPS` | Mixes Verixet handoff copy with local price/app constants and local Stripe-compatible actions. |
| Package/bundle assumptions | `apps/AudAix/dashboard/src/lib/ecosystemCatalog.ts`, `apps/AudAix/dashboard/src/pages/EcosystemPage.tsx`, `apps/AudAix/dashboard/src/pages/PricingPage.tsx` | `PUBLIC_ECOSYSTEM_APPS`, `main4BundlePlans`, `fullEcosystemPlans` | Dashboard ecosystem list currently includes only four apps in one surface, while Verixet full ecosystem includes all six. |
| Tests/proofs | `apps/AudAix/tests/*`, `apps/AudAix/dashboard/src/**/*.test.tsx` | `billing-plans.test.ts`, `workspace-plan.test.ts`, `billing-authority-mode.test.ts`, `entitlement-adapter.test.ts`, `audaix-entitlements.test.ts`, `verixet-usage.test.ts`, `verixet-billing-delegation.test.ts`, `stripe-checkout-session.test.ts`, `stripe-billing-webhook.test.ts`, `WorkspaceBillingSections.test.tsx`, `PricingPage.test.tsx` | Good P0/P1 coverage, but some tests still assert local constants and local prices. |

## C. Verixet Authority Comparison

Verixet generated catalog inspected: `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`.

Observed Verixet state:

- AudAiX single-app rows `audaix_starter`, `audaix_pro`, `audaix_elite` are configured, public, and self-serve.
- `main4_starter`, `main4_pro`, `main4_elite`, `ecosystem_pro`, and `ecosystem_elite` are pricing-under-review/manual setup/non-self-serve.
- `ecosystem_starter` is configured, public, and self-serve.
- Verixet top-ups are global `ai_*`, `media_*`, and `storage_*` packs plus deprecated compatibility aliases. No AudAiX-specific `small`, `growth`, or `scale` top-up pack is exported.
- Verixet full ecosystem membership is six apps: XFlow, Verixet, RatAiFy, AudAiX, WordGeni, and CreVux.

| AudAiX local item | Verixet catalog match | Match quality | Current user-facing risk | Current payment risk | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `BILLING_PLANS.free` | Free/default fallback only, no paid Verixet row | Partial | Low if conservative | Low | Keep as free/default fallback only. |
| `BILLING_PLANS.pro` | Public `audaix_starter` | Legacy/Partial | Medium because internal `pro` means public Starter | Medium if local Stripe mode leaks | Classify as Verixet-backed display adapter plus legacy internal alias. |
| `BILLING_PLANS.elite` | Public `audaix_elite` | Exact/Partial | Low for display, medium for local limits | Medium | Keep as Verixet-backed display adapter. |
| `BILLING_PLANS.enterprise` | No specific AudAiX enterprise row in generated artifact | Missing | Medium if treated as concrete package | Medium | Mark manual setup/local fallback until Verixet exports enterprise metadata. |
| `PUBLIC_AUDAIX_PLANS.audaix_starter` | `audaix_starter` active/self-serve | Exact | Low | Medium due local price/env data | Keep as Verixet-backed display adapter. |
| `PUBLIC_AUDAIX_PLANS.audaix_pro` | `audaix_pro` active/self-serve | Exact | Medium because internal plan maps to `pro` | Medium due separate Stripe env vars | Keep as Verixet-backed display adapter; add alias metadata. |
| `PUBLIC_AUDAIX_PLANS.audaix_elite` | `audaix_elite` active/self-serve | Exact | Low | Medium due local Stripe env data | Keep as Verixet-backed display adapter. |
| `PUBLIC_ECOSYSTEM_PLANS.ecosystem_starter` | `ecosystem_starter` active/self-serve | Exact | Low if six-app membership is used | Medium | Keep as Verixet-backed display adapter. |
| `PUBLIC_ECOSYSTEM_PLANS.ecosystem_pro` | `ecosystem_pro` under review/manual setup | Exact with non-self-serve state | High if local price/CTA appears final | High if local checkout maps it to paid plan | Mark manual setup; never local self-serve. |
| `PUBLIC_ECOSYSTEM_PLANS.ecosystem_elite` | `ecosystem_elite` under review/manual setup | Exact with non-self-serve state | High if local price/CTA appears final | High if local checkout maps it to paid plan | Mark manual setup; never local self-serve. |
| Dashboard `PUBLIC_ECOSYSTEM_APPS` | Verixet full ecosystem includes six apps | Conflict | High: one dashboard list says four-app ecosystem | Low | Move authority to Verixet bundle membership. |
| `AUDAIX_PRICING` in `audaix-entitlements.ts` and dashboard `ecosystemCatalog.ts` | Verixet generated pricing display | Partial | Medium: local prices/savings can drift | Low/Medium | Move display authority to Verixet export. |
| `WORKSPACE_PLAN_LIMITS` | Verixet does not export AudAiX workspace limit labels | Missing | Medium | Medium for enforcement clarity | Needs Verixet usage-limit display metadata or explicit local fallback classification. |
| `AUDAIX_USAGE_LIMITS` | Verixet has generic entitlement keys, not full AudAiX limit matrix | Missing/Partial | Medium | Medium | Needs AudAiX slice before cleanup. |
| `CREDIT_COSTS` | Verixet top-ups grant `ai_action_credits`; local uses `ops`/`ai_heavy` | Conflict/Partial | Medium | High if credits are sold locally | Move credit-unit authority to Verixet or classify local policy as enforcement-only. |
| `CREDIT_TOP_UP_PACKS.small/growth/scale` | No exact Verixet top-up slug; nearest `ai_small/ai_builder/ai_power/ai_studio` differ in quantity/price | Conflict | Medium if displayed as buyable final packs | High if local Stripe top-up is enabled | Retire from public display or map through new Verixet AudAiX top-up metadata. |
| Local Stripe checkout/top-up helpers | Verixet owns checkout in production | Legacy | Medium if UI says local Stripe | High | Keep legacy/local compatibility only; label as non-authority. |
| Stripe webhook route | Verixet owns webhooks in ecosystem deployments | Legacy | Low if hidden | High if it mints paid access | Keep legacy-only; tests must prove no paid access in Verixet mode. |
| BillingStatus panel | Verixet authority labels exist | Partial | Low/Medium if "Local Stripe" is visible in production | Medium | Keep as status display; add stronger local mirror/manual labels. |

## D. Cleanup Classification

| Item | Classification | Notes |
| --- | --- | --- |
| `audaix_starter`, `audaix_pro`, `audaix_elite` display rows | Keep as Verixet-backed display adapter | Active/self-serve in Verixet. |
| Internal `pro` workspace plan | Keep as local mirror only plus legacy alias | Public name is Starter; should not be final package authority. |
| `free` workspace plan | Keep as free/default fallback only | Must remain conservative and safe offline. |
| `enterprise` workspace plan | Mark legacy/manual setup | Needs Verixet enterprise/manual setup metadata before cleanup. |
| `ecosystem_starter` | Keep as Verixet-backed display adapter | Must use Verixet six-app membership. |
| `main4_*`, `ecosystem_pro`, `ecosystem_elite` | Mark legacy/manual setup; retire from public self-serve display | Verixet says reviewed/manual/non-self-serve. |
| `WORKSPACE_PLAN_LIMITS` | Keep as free/default/local mirror only | Needed for local usage enforcement until Verixet exports AudAiX usage-limit metadata. |
| `AUDAIX_USAGE_LIMITS` and `AUDAIX_ACTION_LIMITS` | Needs new Verixet catalog field before cleanup | Local policy can stay enforcement-only, not display/payment authority. |
| `CREDIT_COSTS` | Keep as local mirror/enforcement policy | Must not imply purchasable credits without Verixet mapping. |
| `CREDIT_TOP_UP_PACKS` | Retire from public display or move authority to Verixet export | Current packs do not match generated Verixet top-up slugs. |
| `VERIXET_TOP_UP_DISPLAY` fallback rows | Needs new Verixet catalog field before cleanup | Should become a generated AudAiX top-up mapping, like RatAiFy P2 metadata. |
| Dashboard `AUDAIX_PRICING` | Move authority to Verixet export | Local price/savings constants should not drive final copy. |
| Dashboard `PUBLIC_ECOSYSTEM_APPS` | Move authority to Verixet export | Current dashboard helper has four apps; Verixet full ecosystem has six. |
| `WorkspaceUpgradeSection` | Keep as Verixet-backed display adapter after cleanup | Should render only Verixet-allowed actions or local-disabled/manual labels. |
| Local Stripe checkout/top-up/webhook | Keep as local mirror/legacy only | No production authority; no price ID changes in cleanup. |
| Existing tests | Needs test/proof only | Rewrite tests away from local price truth and toward Verixet parity/classification. |

## E. Verixet Export Gaps

| Needed field | Status | Recommendation |
| --- | --- | --- |
| AudAiX-specific feature keys | Partial | Add keys such as `audaix.live_audit`, `audaix.repo_final_check`, `audaix.scheduled_monitoring`, `audaix.report_export`, `audaix.storage_artifact`, and `diagnostic_ai_job` with display labels. |
| Workspace plan alias mapping | Missing | Export `free`, `pro -> audaix_starter`, `elite -> audaix_elite`, `enterprise -> manual/fallback`, and public `audaix_*` mappings with legacy/internal flags. |
| Usage-limit display metadata | Missing | Export AudAiX diagnostic/signal/AI/storage/workflow/retention labels and free/starter/pro/elite values or mark local-only. |
| Audit/job/export units | Missing | Export units for diagnostics, audits, pages, AI jobs, report exports, storage MB/GB, workflow runs, and retention. |
| Credit/add-on units | Partial | Verixet exports `ai_action_credits`, but AudAiX local `ops` and `ai_heavy` units need mapping or retirement. |
| App-specific CTA labels | Partial | Current labels are generic. Add AudAiX-specific checkout/manual/top-up labels. |
| Bundle membership detail | Present | Use generated bundle membership; do not keep dashboard four-app helper as authority. |
| Manual setup reasons | Partial | Export human-readable reasons for Main 4 and Ecosystem Pro/Elite. |
| Legacy/deprecated flags | Partial | Top-ups have deprecated flags; AudAiX workspace aliases need legacy/deprecated/fallback flags. |
| Entitlement feature keys | Partial | Plan rows include entitlement keys, but AudAiX route usage keys need explicit mapping. |
| Handoff URL metadata | Partial | Add AudAiX workspace billing, pricing, checkout, top-up, and manual setup handoff fields. |

Recommendation: update Verixet export first. AudAiX can keep local usage/cost policy in an adapter only where Verixet has not yet modeled app-specific limits, but public display and checkout/top-up labels should be driven by Verixet metadata.

## F. AudAiX Implementation Plan

Commit 1: Verixet export additions for AudAiX workspace/usage metadata.

- Files likely touched: `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.ts`, Verixet generated catalog tests, `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`, possibly `src/lib/billing/canonical-catalog.ts`.
- Behavior change: generated artifact gains an `audaix` metadata slice with workspace aliases, usage-limit labels, feature keys, credit/top-up mapping, manual/review reasons, deprecated/fallback flags, and handoff metadata.
- Tests to add/update: Verixet generated catalog tests proving AudAiX slice completeness and reviewed/manual rows non-self-serve.
- Rollback risk: low if artifact/test-only metadata.
- Must not change: checkout behavior, Stripe IDs, schemas, migrations, webhooks, entitlement enforcement.

Commit 2: AudAiX workspace plan adapter cleanup.

- Files likely touched: `apps/AudAix/src/lib/billing/verixet-catalog-display.ts`, `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/tests/billing-plans.test.ts`, `apps/AudAix/tests/workspace-plan.test.ts`.
- Behavior change: local workspace plans carry explicit classification: Verixet-backed display adapter, free/default fallback, local mirror, legacy/manual setup, or missing from Verixet.
- Tests to add/update: assert active AudAiX rows match Verixet; internal `pro` is an alias for public Starter; enterprise is manual/fallback.
- Rollback risk: medium because many routes read workspace plan limits.
- Must not change: workspace entitlement enforcement semantics or local plan storage schema.

Commit 3: AudAiX usage-limit/add-on display cleanup.

- Files likely touched: `apps/AudAix/src/audaix-entitlements.ts`, `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/lib/billing/credit-enforcement.ts`, `apps/AudAix/dashboard/src/features/workspace-billing/WorkspaceBillingSections.tsx`, tests.
- Behavior change: usage meters and top-up labels use Verixet-exported AudAiX metadata where available; local credit packs become fallback/manual/local mirror only.
- Tests to add/update: credit top-up packs cannot appear as final self-serve unless Verixet maps them; usage limit labels remain conservative.
- Rollback risk: medium.
- Must not change: credit debit math, provider admission order, or Stripe price env names.

Commit 4: AudAiX billingStatus and upgrade CTA cleanup.

- Files likely touched: `apps/AudAix/src/app.ts`, `apps/AudAix/src/routes/workspace-routes.ts`, `apps/AudAix/dashboard/src/pages/WorkspaceBillingPage.tsx`, `apps/AudAix/dashboard/src/features/workspace-billing/*`, `apps/AudAix/dashboard/src/pages/PricingPage.tsx`, `apps/AudAix/dashboard/src/pages/EcosystemPage.tsx`, `apps/AudAix/dashboard/src/lib/ecosystemCatalog.ts`.
- Behavior change: UI hides or relabels local Stripe/top-up actions unless authority is explicitly local/dev; bundle/app membership comes from Verixet metadata.
- Tests to add/update: dashboard billing tests; pricing page tests for manual/review states; ecosystem page tests for six-app membership.
- Rollback risk: medium.
- Must not change: checkout APIs or billing authority mode behavior.

Commit 5: AudAiX tests/proofs for workspace-plan drift prevention.

- Files likely touched: AudAiX tests plus optional root proof script if already planned.
- Behavior change: proof fails if local plan prices, bundle membership, CTAs, top-up rows, manual states, or aliases drift from Verixet.
- Tests to add/update: focused billing/workspace plan suite, dashboard pricing suite, billing authority mode, entitlement adapter, Verixet usage.
- Rollback risk: low.
- Must not change: production code except test-only fixtures if needed.

Commit 6: Remove or quarantine legacy local constants only after tests prove no active surface uses them as authority.

- Files likely touched: `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/src/audaix-entitlements.ts`, dashboard pricing helpers, affected tests.
- Behavior change: local constants move into clearly named fallback/compatibility modules or are removed from public paths.
- Tests to add/update: import-boundary tests and no-public-use assertions.
- Rollback risk: high because constants are widely imported.
- Must not change: free/default fallback or P0 fail-closed Verixet entitlement behavior.

## G. Test/Proof Plan

Run during implementation, not during this planning pass:

```powershell
npm --prefix apps/AudAix run typecheck
npm --prefix apps/AudAix run test -- tests/billing-plans.test.ts tests/workspace-plan.test.ts tests/billing-authority-mode.test.ts tests/entitlement-adapter.test.ts tests/audaix-entitlements.test.ts tests/verixet-usage.test.ts tests/verixet-billing-delegation.test.ts tests/stripe-billing-webhook.test.ts tests/stripe-checkout-session.test.ts
npm --prefix apps/AudAix run test -- tests/ecosystem-auth-routes.test.ts
npm --prefix apps/AudAix run test -- dashboard/src/features/workspace-billing/WorkspaceBillingSections.test.tsx dashboard/src/pages/PricingPage.test.tsx
npm --prefix apps/AudAix run verify:routes
npm --prefix apps/Verixet run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts
npm --prefix apps/Verixet run typecheck
```

Broad `npm --prefix apps/AudAix run test:ci` or broad `tests/api.test.ts` may still hit unrelated 402 plan-gate behavior already noted in P1 proof history. Treat that as a broad-suite caveat unless the specific implementation touches the affected API plan-gate assertions.

## H. Launch Safety Rules

- AudAiX cannot hard-sell plans missing from Verixet.
- AudAiX cannot override Verixet reviewed/manual state.
- AudAiX cannot treat local workspace rows as billing authority.
- AudAiX cannot create new Stripe authority.
- AudAiX cannot unlock paid access from local fallback data.
- AudAiX must preserve free/default safe fallback.
- AudAiX must preserve P0 fail-closed Verixet entitlement behavior.
- AudAiX must preserve P1 display truthfulness.
- AudAiX top-ups/add-ons cannot be public self-serve unless Verixet exports the pack or an explicit Verixet-backed mapping.
- AudAiX local usage limits can enforce conservative local behavior, but cannot prove paid entitlement without Verixet.

## I. Open Questions

1. Should AudAiX keep any standalone workspace-plan model?

Yes, but only as a local adapter/fallback model. AudAiX needs a free/default tier and local enforcement caps, but paid workspace plans should be classified as Verixet-backed display or local mirror data.

2. Should AudAiX usage limits be app-specific or Verixet-global?

Both, with clear ownership. Verixet should export commercial/display limits and entitlement feature keys. AudAiX can retain operational enforcement details for audits, pages, schedules, storage, and AI jobs until Verixet has a stable app-specific limit model.

3. Should AudAiX add-ons/top-ups live only in Verixet?

Yes for sale and settlement. AudAiX can keep local credit-cost enforcement, but public purchasable top-up packs should map to Verixet-exported packs or be hidden/manual.

4. Which AudAiX local constants can be retired first?

Retire public use of dashboard `PUBLIC_ECOSYSTEM_APPS`, dashboard `AUDAIX_PRICING`, local public bundle prices for reviewed rows, and local top-up CTA rows. Keep tests proving any remaining constants are fallback/local mirror only.

5. Which local constants must stay for offline/free/default fallback?

Keep `free` workspace defaults, conservative `WORKSPACE_PLAN_LIMITS.free`, basic `AUDAIX_USAGE_LIMITS.free`, and route-level local enforcement helpers so missing Verixet state stays safe.

6. Does Verixet export need an AudAiX slice before implementation?

Yes. AudAiX needs alias, usage-limit, feature-key, top-up mapping, manual/review reason, deprecated/fallback, and handoff metadata before cleanup can be implemented cleanly.

7. What is the safest first implementation commit?

Add the Verixet AudAiX metadata slice and tests. Do not touch AudAiX production code in the first commit except optional read-only parity tests after the export exists.

## J. Final Recommendation

1. Is AudAiX ready for P2 implementation?

Ready for Verixet-export-first P2 implementation. Not ready for direct package/workspace-plan architecture deletion.

2. What should be implemented first?

Extend the Verixet generated catalog with AudAiX workspace alias, usage-limit, top-up/add-on mapping, manual/review, and handoff metadata.

3. Which file is the highest-risk source of remaining drift?

`apps/AudAix/src/lib/billing/plans.ts` is highest risk because it contains local plans, public plan mirrors, ecosystem rows, prices, Stripe env mappings, credit costs, top-up packs, usage limits, feature flags, and CTAs. Dashboard `apps/AudAix/dashboard/src/lib/ecosystemCatalog.ts` is the highest-risk UI helper because it currently preserves local pricing and a four-app ecosystem list.

4. Which tests should block the implementation commit?

Block on `tests/billing-plans.test.ts`, `tests/workspace-plan.test.ts`, `tests/billing-authority-mode.test.ts`, `tests/entitlement-adapter.test.ts`, `tests/audaix-entitlements.test.ts`, `tests/verixet-usage.test.ts`, `tests/verixet-billing-delegation.test.ts`, dashboard workspace billing tests, dashboard pricing tests, `npm --prefix apps/AudAix run typecheck`, and `npm --prefix apps/AudAix run verify:routes`.

5. What exact next implementation prompt should be used?

Implement the first AudAiX P2 cleanup prerequisite: extend the Verixet generated public catalog with an AudAiX slice containing workspace plan alias mappings, AudAiX feature keys, usage-limit display metadata, audit/job/export/storage/workflow units, credit/top-up mapping metadata, app-specific CTA labels, bundle membership references, manual setup reasons, legacy/deprecated/fallback flags, entitlement feature keys, and handoff URL metadata. Add Verixet tests proving the generated artifact exports the AudAiX slice and that reviewed/manual/legacy rows are not self-serve. Do not change AudAiX production code, schemas, migrations, Stripe webhooks, Stripe price IDs, checkout behavior, entitlement enforcement, or dependency files in this commit.

## Verification And Status

Commands run in this planning pass were read-only except for creating this document:

```powershell
git status --short
git -C apps/AudAix status --short
git -C apps/RatAiFy status --short
git -C apps/Verixet status --short
git -C apps/XFlow status --short
git -C apps/CreVux status --short
git -C apps/WordGeni status --short
rg ...
Get-Content ...
node -e/read-only generated catalog inspection
```

Initial status:

- Root: pre-existing `M package.json` plus unrelated untracked docs/scripts.
- `apps/AudAix`: clean before this doc.
- Other normal app repos checked: `apps/RatAiFy`, `apps/Verixet`, `apps/XFlow`, `apps/CreVux`, and `apps/WordGeni` were clean.

No production code, schemas, migrations, Stripe webhook logic, Stripe price IDs, checkout behavior, entitlement enforcement, dependency installs, staging, commits, or unrelated dirty files were changed.
