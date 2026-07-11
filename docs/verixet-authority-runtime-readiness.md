# Verixet Authority Runtime Readiness

Date: 2026-07-11

This is a code-level audit only. It does not claim runtime proof, provider proof, billing proof, or authenticated production proof. Status values are limited to `PROVEN IN CODE`, `PARTIAL`, `DRIFT`, and `NOT APPLICABLE`.

## Authority Matrix

| App | Public catalog/pricing | Checkout handoff | Entitlement / usage / credit checks | Paid/provider fail-closed behavior | Local fallback / legacy billing | Code-level status |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | `apps/XFlow/src/components/showcase/XFlowPricingPageContent.tsx` labels Verixet-managed plans and fallback display; `apps/XFlow/src/lib/ecosystem-assistant/pricing-context.ts` avoids invented billing state. | `apps/XFlow/tests/unit/billing-checkout-core.test.ts` proves paid checkout routes to Verixet even when local Stripe IDs exist. | `apps/XFlow/src/lib/developer-api/verixet-client.ts` and `apps/XFlow/src/lib/collectors/run-job.ts` contain Verixet entitlement/client checks for paid surfaces. | `apps/XFlow/scripts/verixet-live-proof.ts` and `apps/XFlow/scripts/smoke-production.ts` include fail-closed checks, but they are not current runtime proof. | `apps/XFlow/src/app/(auth)/account/billing/page.tsx` labels cached local mirror and says billing verification is required. | PROVEN IN CODE |
| Verixet | Verixet owns generated catalog export under `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json` and billing/catalog routes under `apps/Verixet/src/lib/billing`. | Verixet is the checkout/billing authority; Stripe catalog and billing scripts exist under `apps/Verixet/scripts/billing` and package scripts. | `apps/Verixet/src/lib/billing/route-gates.ts` gates protected routes; platform usage health and entitlement policies are in billing modules. | Route-gate tests cover entitlement policy selection, but current production runtime denial/unavailable behavior is not yet proven. | Legacy/local billing is internal to authority app, not a satellite fallback. | PROVEN IN CODE |
| RatAiFy | `apps/RatAiFy/src/lib/billing/verixetCatalogDisplay.ts` is a Verixet-owned generated catalog mirror; `apps/RatAiFy/client/src/pages/subscribe.tsx` labels Verixet requirements. | `apps/RatAiFy/server/services/billingCheckout.ts` builds Verixet billing URLs and records Verixet metadata. | `apps/RatAiFy/server/services/entitlements.ts` contains entitlement requirements for app actions. | Code contains entitlement requirements, but current authenticated paid scan/provider fail-closed runtime behavior is not proven. | Local billing/webhook paths remain for compatibility and must be treated as fallback/cache unless Verixet authority is active. | PARTIAL |
| AudAiX | `apps/AudAix/tests/billing-plans.test.ts` verifies Verixet display plans, Verixet CTAs, and local mirror labels. | `apps/AudAix/src/routes/workspace-routes.ts` delegates checkout to Verixet when billing authority mode is `verixet`. | `apps/AudAix/src/lib/billing/billing-authority.ts`, `apps/AudAix/src/audaix-entitlements.ts`, and workspace routes use billing authority mode and Verixet labels. | `apps/AudAix/tests/api.test.ts` covers disabled billing, Verixet URL unavailable, delegated checkout, and missing secret behavior. Runtime proof still needed. | `apps/AudAix/src/stripe-billing-webhook.ts` ignores local Stripe paid access when Verixet is authority; tests cover this. | PROVEN IN CODE |
| Crevux | `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts` defines Verixet display plans, managed labels, and local mirror labels. | `apps/CreVux/artifacts/image-gen/src/pages/pricing.test.tsx` checks sanitized Verixet public intent fields; API billing routes label Verixet authority. | `apps/CreVux/lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts` verifies policy/catalog expectations. | Export and insufficient-credit tests show typed denial paths, but current entitlement-service-unavailable runtime behavior still needs approved smoke. | Local mirror labels are present as `Local mirror only` and `Display fallback only`; legacy Stripe smoke scripts must not be treated as authority proof. | PARTIAL |
| WordGeni | `apps/WordGeni/apps/api/src/services/verixet-catalog-display.ts` defines Verixet display plans and local mirror labels; tests verify catalog mapping. | `apps/WordGeni/apps/api/src/routes/billing.ts` defers checkout to Verixet by default; `billing.route.test.ts` verifies no local Stripe session is created by default. | `apps/WordGeni/apps/api/src/services/billing-entitlements.ts` and `billing-entitlements.authority.test.ts` model Verixet, legacy Stripe, and local cache authority. | `apps/WordGeni/apps/api/src/services/ai-usage-limits.test.ts` covers labels and usage tiers; paid route runtime denial/unavailable proof still requires approved smoke. | `legacy_stripe` and `local_cache` labels are explicit; local mirror state is not presented as Verixet truth. | PROVEN IN CODE |

## Findings

- No safe low-risk billing-authority behavior change was identified during this pass.
- The main remaining gap is runtime proof: authenticated account isolation, live entitlement denial, live Verixet-unavailable fail-closed behavior, and provider-cost prevention are not yet proven.
- RatAiFy and Crevux remain `PARTIAL` because code has Verixet-facing labels and entitlement constructs, but fail-closed paid-action behavior needs tighter runtime or targeted test proof before being marked fully proven.

## Required Runtime Proof Later

1. Denied entitlement blocks paid action.
2. Unavailable Verixet entitlement authority blocks paid action.
3. Free/expired user cannot trigger provider-cost action.
4. Paid entitled test user can reach the non-mutating preflight path.
5. Local fallback/catalog labels remain visibly non-authoritative.
