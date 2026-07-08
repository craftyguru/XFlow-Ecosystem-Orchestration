# Subscription Tier Audit Roadmap

Audit date: 2026-07-08

This is an audit-only report. Existing docs were used only for discovery and are not treated as implementation proof unless backed by code, routes, schema, enforcement logic, or tests. Every finding below cites file paths and, where possible, route names, function names, component names, constants, table names, migration names, or script names.

Canonical app mapping:

| Product | Canonical folder | Runtime slug |
| --- | --- | --- |
| XFlow | `apps/XFlow` | `xflow` |
| Verixet | `apps/Verixet` | `verixet` |
| AudAiX | `apps/AudAix` | `audaix` |
| RatAiFy / Rataify | `apps/RatAiFy` | `rataify` |
| WordGeni | `apps/WordGeni` | `wordgeni` |
| CreVux / Crevux | `apps/CreVux` | `crevux` |

## A. Executive Summary

Overall subscription readiness score: 62/100.

The ecosystem has a real commercial spine, but the tier model is not yet clean enough to call fully truthful across all six apps. Verixet has the strongest intended authority surface: `ecosystem-contracts/apps.json` marks Verixet as owning billing, entitlements, and usage metering, while `ecosystem-contracts/routes.json` defines Verixet-owned `/api/platform/v1/plans`, `/api/billing/checkout`, `/api/billing/status`, `/api/platform/v1/entitlements/evaluate`, `/api/ecosystem/usage/ingest`, `/api/platform/v1/billing/portal-session`, and Stripe webhook routes. Verixet also has canonical billing plans in `apps/Verixet/src/lib/billing/canonical-catalog.ts`, public pricing view generation in `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, checkout validation in `apps/Verixet/src/app/api/billing/checkout/route.ts`, and entitlement evaluation in `apps/Verixet/src/app/api/platform/v1/entitlements/evaluate/route.ts`.

The biggest risk is source-of-truth drift. XFlow, AudAiX, RatAiFy, WordGeni, and CreVux still contain local plan catalogs, local billing routes, local Stripe code, or local entitlement interpretations. Some of those are explicitly marked as legacy or fallback, but not all public copy and dashboard flows make that distinction clear. That means users can see a plan/package promise before the implementation proves that Verixet will enforce it consistently.

Highest-value fixes:

1. Make Verixet's canonical plan catalog the only public plan source, then generate or import display-only views into the other apps.
2. Remove or hard-label satellite local billing as legacy/dev/cache, especially XFlow local checkout, AudAiX local plan tiers, RatAiFy local billing catalog, WordGeni Stripe entitlement state, and CreVux local billing/credit routes.
3. Add claim-level tests for every public tier bullet that says a feature is included, capped, locked, or upgradable.
4. Harden free-tier abuse gates for paid AI, scan, media, export, storage, scheduled monitoring, and cross-app workflow actions.

Recommended starting point: Verixet plus XFlow pricing handoff. Fix `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, `apps/XFlow/src/lib/billing/commercial-pricing.ts`, and `apps/XFlow/src/app/api/billing/checkout/route.ts` first because those surfaces shape the commercial truth users see before payment.

## B. Cross-App Tier Matrix

| App name | Current plans found | Pricing found | Free tier status | Paid tier status | Package/add-on status | Billing integration status | Feature-gate status | Main truthfulness risk | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | `xflow_starter`, `xflow_pro`, `xflow_elite`, bundle display plans in `apps/XFlow/src/lib/billing/commercial-pricing.ts`; legacy local checkout route in `apps/XFlow/src/app/api/billing/checkout/route.ts` | XFlow and bundle prices rendered from `CANONICAL_PRICING_CATALOG` via `commercialPricing` | Baseline access exists by contract, but XFlow app-specific free limits are not clearly defined in public pricing copy | Paid plans are UI-backed and checkout-routed, but paid unlock enforcement is partly delegated to Verixet status/entitlement mirrors | Creator, Main 4, and ecosystem bundle copy exists in XFlow pricing helper | Split: Verixet authority intended; XFlow still exposes local checkout handler | Partially active through Verixet status and local XFlow commerce checks | Public plan/bundle claims can imply XFlow owns checkout or paid unlocks when Verixet should own them | P0 |
| Verixet | Canonical single-app, bundle, ecosystem, add-on/top-up structures in `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/billing/plans.ts` | Public catalog in `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`; pricing page `apps/Verixet/src/app/(marketing)/pricing/page.tsx` | Strong baseline model via `free` and composed entitlement status, but public free copy should stay conservative | Strongest app: checkout, plan-change preview/execute, billing status, portal, entitlement evaluate, usage ingest | Single-app, Main 4, Creator, Full Ecosystem, and add-ons/top-ups exist | Active authority surface; Stripe price verification passed with optional six-month warnings | Active, with route tests and proof scripts | Some canonical bundle rows are public but have `pricing_status: "price_mismatch_review"` in `canonical-catalog.ts`; public claims must avoid implying fully reconciled pricing | P0 |
| AudAiX | Internal `free`, `pro`, `elite`, `enterprise` in `apps/AudAix/src/lib/billing/plans.ts`; public `audaix_starter`, `audaix_pro`, `audaix_elite`; workspace plan mapping in `apps/AudAix/src/workspace-plan.ts` | Local plan prices in `BILLING_PLANS`; pricing tests in `apps/AudAix/tests/pricing-contract.test.ts` | Active local limits: free has audit/page/schedule/user/site caps in `WORKSPACE_PLAN_LIMITS` and `BILLING_PLANS.free` | Partially active: entitlement adapter reads Verixet snapshot when available, otherwise local fallback | Ecosystem plan slugs exist, but add-on/package enforcement is not the source of truth | Delegates in places to Verixet but retains local billing checkout/webhook tests/routes | Active for audit/AI actions through `assertWorkspaceEntitlementForAction` and credit checks | AudAiX "Starter" maps to internal `pro`, and local plan constants can drift from Verixet canonical `audaix_starter` | P1 |
| RatAiFy / Rataify | Local `free`, `rataify_starter`, `rataify_pro`, `rataify_elite`, ecosystem and enterprise aliases in `apps/RatAiFy/src/lib/billing/plans.ts`; marketing alias in `apps/RatAiFy/shared/plans.ts` | Local prices and marketing highlights in `apps/RatAiFy/shared/plans.ts` | Stronger than most: free limits include one site, one scan/month, no AI enrichment by default in marketing; schema has local usage counters | Partially active: entitlement adapter resolves Verixet snapshot but falls back to local org plan where no ecosystem workspace exists | Local top-ups and ecosystem bundle aliases exist; Verixet authority is not fully singular | Split: local billing routes/services plus Verixet metadata/usage reporter | Active for several routes through `requireEntitledFeature`, `sendPlanLimitExceeded`, and route tests | Local catalog says `AppSlug = "xflowx" | "verixet" | "rataify" | "audaix"` and omits WordGeni/CreVux from public ecosystem app list, while Verixet full ecosystem includes all six | P0 |
| WordGeni | Local `free`, `pro`, `studio`, `enterprise` enum in `apps/WordGeni/apps/api/src/db/schema.ts` and `apps/WordGeni/apps/api/src/services/billing-entitlements.ts` | Local billing routes and Stripe plan mapping exist; Verixet has canonical `wordgeni_starter`, `wordgeni_pro`, `wordgeni_elite` | Active AI token/cost caps in `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts` | Backend active for local paid entitlement, but not clearly normalized to Verixet tier names | Creator bundle integration with CreVux exists by contract; local package entitlement proof is partial | Local Stripe webhook/checkout/reconciliation conflicts with Verixet authority unless treated as legacy/cache | Active locally for AI budget and paid assertion; cross-app visual companion has entitlement service | WordGeni paid tier names (`pro`, `studio`) do not match Verixet public tiers (`starter`, `pro`, `elite`) | P1 |
| CreVux / Crevux | Local SaaS tier keys from `@workspace/saas-entitlements`; public `crevux_starter`, `crevux_pro`, `crevux_elite` in Verixet | Local subscription catalog route returns static Verixet-authority display data when local billing is off | Free/baseline media access is unclear from inspected code; paid media credits are better defined than free caps | Partially active: local credits and usage admission exist; some Verixet usage admission unavailable states skip rather than prove paywall | Top-up packs and local AI credit economy exist; Verixet add-ons also exist | Explicitly states local billing routes are legacy and Verixet is authority in `apps/CreVux/artifacts/api-server/src/routes/billing.ts` | Active for local credits, fail-closed cross-app entitlement check, and usage admission tests | Media credit/top-up promises can appear active in local CreVux even when Verixet package/add-on grant mapping is incomplete | P1 |

## C. Per-App Deep Audit

### XFlow

Files inspected:

- `ecosystem-contracts/apps.json`
- `ecosystem-contracts/routes.json`
- `apps/XFlow/src/lib/billing/commercial-pricing.ts`
- `apps/XFlow/src/app/api/billing/checkout/route.ts`
- `apps/XFlow/src/app/api/billing/status/route.ts`
- `apps/XFlow/src/app/api/billing/webhook/route.ts`
- `apps/XFlow/src/app/(auth)/account/billing/page.tsx`
- `apps/XFlow/src/app/(dashboard)/billing/checkout/CheckoutRedirectClient.tsx`
- `apps/XFlow/src/app/(dashboard)/billing/xflow-setup/XFlowVerixetSetupClient.tsx`
- `apps/XFlow/src/app/api/ecosystem/entitlements/route.ts`
- `apps/XFlow/tests/unit/stripe-billing-readiness.test.ts`
- `apps/XFlow/tests/unit/stripe-billing-webhook-handler.test.ts`

Pages/routes inspected:

- Billing/account UI: `apps/XFlow/src/app/(auth)/account/billing/page.tsx`
- Dashboard billing setup: `apps/XFlow/src/app/(dashboard)/billing/xflow-setup/page.tsx`
- Billing checkout redirect: `apps/XFlow/src/app/(dashboard)/billing/checkout/page.tsx`
- Dashboard billing/account tool: `apps/XFlow/src/app/(dashboard)/tools/groups/billing-account/page.tsx`

API endpoints inspected:

- `POST /api/billing/checkout` in `apps/XFlow/src/app/api/billing/checkout/route.ts`
- `GET /api/billing/status` in `apps/XFlow/src/app/api/billing/status/route.ts`
- `POST /api/billing/webhook` in `apps/XFlow/src/app/api/billing/webhook/route.ts`
- `GET/POST /api/ecosystem/entitlements` in `apps/XFlow/src/app/api/ecosystem/entitlements/route.ts`

DB/schema items inspected:

- Shared core tables `core.entitlements`, `core.usage_events`, `core.billing_events`, and `core.workspace_app_access` in `supabase/migrations/001_core_schema.sql`
- XFlow uses ecosystem authority via route contracts rather than owning Verixet billing tables.

Plan/tier constants found:

- `commercialPricing.xflowPlans`, `commercialPricing.bundlePlans`, `commercialPricing.comparisonPlans`, `ACTIVE_LOCAL_STRIPE_PRICE_ENV_REQUIREMENTS`, and `CREDIT_TOP_UP_MAPPING_NOTE` in `apps/XFlow/src/lib/billing/commercial-pricing.ts`.

Claimed features by tier:

- XFlow Starter: "3 connected apps", "Basic incidents and events", "Limited Copilot".
- XFlow Pro: "15 connected apps", "AI Context Engine", "Advanced exports".
- XFlow Elite: "75 connected apps", "Advanced controls", "Long retention".
- Bundles: Creator, Main 4, and Full Ecosystem access.

Actually working features by tier:

- UI pricing cards are generated from `CANONICAL_PRICING_CATALOG` through `card()` and `canonicalCheckoutHref()` in `apps/XFlow/src/lib/billing/commercial-pricing.ts`.
- Checkout endpoint exists and validates the request body through `billingCheckoutRequestSchema` in `apps/XFlow/src/app/api/billing/checkout/route.ts`.
- Verification found XFlow typecheck passed, but `verify:ci` failed before tests on audit mutation coverage.

Claimed but missing features:

- "AI Context Engine", "Advanced exports", and "Long retention" require specific enforcement evidence by plan. In this audit pass, those are UI claims in `commercial-pricing.ts` unless tied to route-level gates and usage limits in follow-up.
- `CREDIT_TOP_UP_MAPPING_NOTE` states credit top-up Stripe products are compatibility-only until Verixet publishes explicit credit grant mappings, so top-up claims should not be marketed as fully active from XFlow.

Active but unadvertised features:

- Same-origin mutation protection exists for billing checkout through `jsonRequireSameOriginMutation()` in `apps/XFlow/src/app/api/billing/checkout/route.ts`.
- XFlow has robust API/auth matrix verifiers, shown by passing early `verify:ci` subcommands before failure.

Free-tier safeguards:

- Baseline app access is defined at ecosystem level, but XFlow-specific free caps were not found as a single public source of truth in XFlow. This is unclear and should be defined through Verixet's canonical plan limit matrix.

Paid-tier safeguards:

- Checkout is protected by workspace session and `requiredPermission: "apps:read"` in `apps/XFlow/src/app/api/billing/checkout/route.ts`.
- Payment safety depends on `executeCreateBillingCheckout()` and Verixet authority handoff; public copy should not imply XFlow is the primary Stripe authority.

Upgrade UX issues:

- XFlow pricing has strong bundle copy, but the handoff must keep Verixet authority visible. Any "start with XFlow" CTA should route to Verixet checkout and avoid local Stripe mode unless explicitly local/dev.

Admin/billing issues:

- Legacy XFlow billing webhook/status/checkout routes exist. They must be classified as compatibility/local mirror unless Verixet delegates them.

Package/add-on issues:

- Bundles are visible in XFlow, but add-on grant mapping is explicitly compatibility-only until Verixet publishes mappings.

Recommended fixes:

- Replace XFlow local plan display data with a generated public catalog from Verixet.
- Add tests linking every XFlow pricing bullet to an entitlement or usage limit key.
- Hide or relabel top-up claims until Verixet add-on grants are proven.
- Fix `verify:audit-mutation-coverage` failures before relying on XFlow `verify:ci`.

### Verixet

Files inspected:

- `apps/Verixet/src/lib/billing/canonical-catalog.ts`
- `apps/Verixet/src/lib/billing/plans.ts`
- `apps/Verixet/src/lib/billing/plan-change-preview.ts`
- `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`
- `apps/Verixet/src/app/(marketing)/pricing/page.tsx`
- `apps/Verixet/src/app/account/billing/page.tsx`
- `apps/Verixet/src/app/api/billing/checkout/route.ts`
- `apps/Verixet/src/app/api/billing/plan-change/preview/route.ts`
- `apps/Verixet/src/app/api/billing/plan-change/execute/route.ts`
- `apps/Verixet/src/app/api/platform/v1/plans/route.ts`
- `apps/Verixet/src/app/api/platform/v1/entitlements/evaluate/route.ts`
- `apps/Verixet/src/app/api/ecosystem/usage/ingest/route.ts`
- `apps/Verixet/src/app/api/platform/v1/billing/portal-session/route.ts`
- `apps/Verixet/src/app/api/webhooks/stripe/route.ts`
- `supabase/migrations/020_verixet_schema.sql`

Pages/routes inspected:

- Public pricing page: `apps/Verixet/src/app/(marketing)/pricing/page.tsx`
- Account billing page: `apps/Verixet/src/app/account/billing/page.tsx`
- Dashboard billing client: `apps/Verixet/src/app/dashboard/(main)/billing/BillingClient.tsx`
- Customer billing client: `apps/Verixet/src/app/dashboard/(main)/billing/CustomerBillingPageClient.tsx`

API endpoints inspected:

- `POST /api/billing/checkout`
- `POST /api/billing/plan-change/preview`
- `POST /api/billing/plan-change/execute`
- `GET/POST /api/platform/v1/plans`
- `POST /api/platform/v1/entitlements/evaluate`
- `POST /api/ecosystem/usage/ingest`
- `POST /api/platform/v1/billing/portal-session`
- Stripe webhook routes under `apps/Verixet/src/app/api/webhooks/stripe`

DB/schema items inspected:

- `verixet.billing_accounts`, `verixet.stripe_connections`, `verixet.checkout_sessions`, `verixet.entitlement_decisions`, `verixet.credit_ledger`, and `verixet.usage_admission_logs` in `supabase/migrations/020_verixet_schema.sql`.
- Shared `core.entitlements`, `core.usage_events`, and `core.billing_events` in `supabase/migrations/001_core_schema.sql`.

Plan/tier constants found:

- `CANONICAL_BILLING_PLANS`, `CANONICAL_FEATURE_MATRIX`, `CANONICAL_PLAN_SLUGS`, `canonicalPriceForInterval()`, `expandEcosystemBundle()`, and `entitlementGrantsForPlan()` in `apps/Verixet/src/lib/billing/canonical-catalog.ts`.
- `BILLING_PLANS`, `CREDIT_TOP_UP_PACKS`, and `ECOSYSTEM_TRIAL_DAYS` in `apps/Verixet/src/lib/billing/plans.ts`.

Claimed features by tier:

- Single-app Starter/Pro/Elite for all six apps.
- Main 4 bundle, Creator bundle, Full Ecosystem bundle.
- Add-ons/top-ups for AI, media, and storage.

Actually working features by tier:

- Public pricing catalog is generated from canonical plans through `buildPublicPricingCatalog()` in `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`.
- Checkout route validates public tier/scope/app selections, rate-limits the route, requires billing manager role, normalizes legacy plan slugs, previews plan changes, and creates Stripe checkout only when configured in `apps/Verixet/src/app/api/billing/checkout/route.ts`.
- Entitlement evaluation enforces workspace match and returns composed ecosystem entitlements in `apps/Verixet/src/app/api/platform/v1/entitlements/evaluate/route.ts`.
- Stripe price env verification passed for 66 required price env vars and 27 product env vars.

Claimed but missing features:

- Some public bundle plan rows have `pricing_status: "price_mismatch_review"` in `apps/Verixet/src/lib/billing/canonical-catalog.ts` while still `public_plan: true`. Those should be shown as "price under review" or removed from hard claims until reconciled.
- Six-month prices are a future/internal catalog concern: `PUBLIC_BILLING_INTERVALS` is monthly/yearly and `FUTURE_CATALOG_BILLING_INTERVALS` includes six-month in `apps/Verixet/src/lib/billing/plans.ts`; Stripe verification reported optional six-month env warnings.

Active but unadvertised features:

- Checkout rate limiting via `enforceBillingRouteRateLimit()` and cross-site mutation rejection via `rejectCrossSiteDashboardMutation()` in `apps/Verixet/src/app/api/billing/checkout/route.ts`.
- Audit events are inserted for plan reads and entitlement evaluation in `apps/Verixet/src/app/api/platform/v1/plans/route.ts` and `apps/Verixet/src/app/api/platform/v1/entitlements/evaluate/route.ts`.

Free-tier safeguards:

- Free baseline exists in canonical and ecosystem status types, but specific per-app free usage caps need to be traceable from `CANONICAL_FEATURE_MATRIX` to route enforcement tests.

Paid-tier safeguards:

- Plan-change preview blocks redundant/conflicting selections in `apps/Verixet/src/lib/billing/plan-change-preview.ts`.
- Checkout requires authenticated dashboard user, workspace context, owner/admin billing role, Stripe configured, and valid public selection in `apps/Verixet/src/app/api/billing/checkout/route.ts`.

Upgrade UX issues:

- Public catalog should expose `pricing_status` states clearly instead of letting reviewed/mismatched prices look final.

Admin/billing issues:

- `GET/POST /api/platform/v1/plans` supports workspace catalog reads and creates mutable commerce plans. This is powerful and should remain admin/API-key guarded.

Package/add-on issues:

- Add-on display is present in `PlanComparisonTabs` and `CustomerBillingPageClient`, but each add-on claim needs a grant-to-entitlement proof row.

Recommended fixes:

- Remove public checkout CTAs for rows with `pricing_status: "price_mismatch_review"` or mark them manual review.
- Publish a generated satellite catalog artifact from Verixet.
- Add tests that compare `CANONICAL_BILLING_PLANS`, public pricing catalog output, Stripe env verification, and entitlement grant expansion.

### AudAiX

Files inspected:

- `apps/AudAix/src/lib/billing/plans.ts`
- `apps/AudAix/src/workspace-plan.ts`
- `apps/AudAix/src/lib/billing/entitlement-adapter.ts`
- `apps/AudAix/src/lib/billing/credit-enforcement.ts`
- `apps/AudAix/src/routes/ai-check-routes.ts`
- `apps/AudAix/dashboard/src/api/client.test.ts`
- `apps/AudAix/tests/billing-plans.test.ts`
- `apps/AudAix/tests/pricing-contract.test.ts`
- `apps/AudAix/tests/verixet-billing-delegation.test.ts`
- `apps/AudAix/tests/entitlement-adapter.test.ts`

Pages/routes inspected:

- Dashboard pricing/billing client API tests in `apps/AudAix/dashboard/src/api/client.test.ts`.
- Landing/pricing copy under dashboard pages was used only as secondary discovery.

API endpoints inspected:

- AudAiX workspace Stripe checkout and credit top-up client calls in `apps/AudAix/dashboard/src/api/client.test.ts`.
- AI check routes using entitlement and credit enforcement in `apps/AudAix/src/routes/ai-check-routes.ts`.

DB/schema items inspected:

- Shared `core` and `verixet` migrations.
- AudAiX workspace plan fields through repository usage and `normalizeWorkspacePlanTier()` in `apps/AudAix/src/workspace-plan.ts`.

Plan/tier constants found:

- `BILLING_PLANS`, `CREDIT_COSTS`, `publicAudaixPlanSlugSchema`, `publicEcosystemPlanSlugSchema` in `apps/AudAix/src/lib/billing/plans.ts`.
- `WORKSPACE_PLAN_LIMITS`, `workspacePlanTierSchema`, and `UPGRADE_PATHS` in `apps/AudAix/src/workspace-plan.ts`.

Claimed features by tier:

- Free manual audits with strict caps.
- Starter/Internal Pro: deep audits, recurring monitoring, webhooks, report sharing, copilot governance.
- Elite/Enterprise: larger limits, connector exports, priority queue, enterprise controls.

Actually working features by tier:

- Free limits and paid limits are represented in `BILLING_PLANS` and projected into `WORKSPACE_PLAN_LIMITS`.
- `DefaultWorkspaceEntitlementAdapter` checks Verixet snapshots first, billing locked states, local fallback, feature flags, credits, and limit keys.
- `ai-check-routes.ts` requires entitlement and credits before AI check/remediation work.
- AudAiX typecheck and `verify:routes` passed.

Claimed but missing features:

- Full package/add-on model is not proven as Verixet-owned. Local `publicEcosystemPlanSlugSchema` names ecosystem plans, but AudAiX should not own package pricing.
- Public "Starter" maps to internal `pro`, which can confuse users and implementers.

Active but unadvertised features:

- Billing locked states include `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired`, `refunded`, and `disputed` in `apps/AudAix/src/lib/billing/entitlement-adapter.ts`.
- Baseline free app access across all six app slugs exists in `BASELINE_FREE_APP_SLUGS`.

Free-tier safeguards:

- `BILLING_PLANS.free` includes 20 audits/month, 500 pages/month, one workspace, one user, one site, no schedules, and no deep audits or recurring monitoring.

Paid-tier safeguards:

- `assertWorkspaceActionAllowed()` blocks locked billing states and feature/limit failures in `DefaultWorkspaceEntitlementAdapter`.
- Credit enforcement is invoked before/after accepted AI actions in `apps/AudAix/src/routes/ai-check-routes.ts`.

Upgrade UX issues:

- Public tier naming should stop mapping Starter to internal `pro` in user-facing contexts. Keep internal slug compatibility hidden.

Admin/billing issues:

- Local Stripe checkout and webhook tests exist. These should be described as compatibility or delegated-to-Verixet behavior.

Package/add-on issues:

- Credit top-up client calls exist in tests, but Verixet add-on authority and AudAiX grant application should be proven end-to-end.

Recommended fixes:

- Rename internal display references so public `audaix_starter` is not confused with internal `pro`.
- Move public pricing to Verixet-generated catalog.
- Keep local `BILLING_PLANS` only as enforcement fallback with tests proving it matches Verixet.

### RatAiFy / Rataify

Files inspected:

- `apps/RatAiFy/src/lib/billing/plans.ts`
- `apps/RatAiFy/shared/plans.ts`
- `apps/RatAiFy/shared/schema.ts`
- `apps/RatAiFy/server/services/entitlementAdapter.ts`
- `apps/RatAiFy/server/routes/billing.ts`
- `apps/RatAiFy/server/services/billingCheckout.ts`
- `apps/RatAiFy/server/services/rataifyUsageGuard.ts`
- `apps/RatAiFy/server/routes/site-scans.ts`
- `apps/RatAiFy/server/routes/site-tools.ts`
- `apps/RatAiFy/server/routes/site-issues.ts`
- `apps/RatAiFy/tests/rataify-entitlements.node.test.ts`
- `apps/RatAiFy/tests/billing-catalog.node.test.ts`
- `apps/RatAiFy/tests/billing-checkout-product-catalog.node.test.ts`
- `apps/RatAiFy/tests/billing-ui-wiring.node.test.ts`

Pages/routes inspected:

- Sidebar/billing plan display in `apps/RatAiFy/client/src/components/app-sidebar.tsx`.
- Billing/checkout UI routes referenced in `apps/RatAiFy/client/src/components/app-sidebar.tsx`.
- Trust dashboard billing shell test evidence in `apps/RatAiFy/tests/trust-dashboard-rendering.node.test.ts`.

API endpoints inspected:

- Billing routes in `apps/RatAiFy/server/routes/billing.ts`.
- Site scan, tools, issues, auto-fix, and risk radar routes using entitlement guards.

DB/schema items inspected:

- `users` Stripe fields, `orgs.ecosystemPlanSlug`, `orgs.ecosystemAppAccess`, `orgs.ecosystemEntitlementSnapshot`, `orgs.planTier`, local subscription/status/counter fields, `sites.planTier`, and `creditLedger` references in `apps/RatAiFy/shared/schema.ts`.

Plan/tier constants found:

- `BILLING_CATALOG`, `TOP_UP_PACKS`, `CREDIT_COST_PER_FEATURE`, `FEATURE_TO_USAGE_ACTION`, and `PUBLIC_ECOSYSTEM_APPS` in `apps/RatAiFy/src/lib/billing/plans.ts`.
- `PLAN_MARKETING`, `PLAN_LIMITS`, `ECOSYSTEM_PLAN_MARKETING`, and `CREDIT_TOP_UP_PACKS` in `apps/RatAiFy/shared/plans.ts`.

Claimed features by tier:

- Free: one website, one scan/month, 25 pages/scan, no AI enrichment by default, 14-day retention.
- Starter: three websites, 25 scans/month, 250 pages/scan, 100 assistant messages/month, 1 GB storage.
- Pro/founding alias and ecosystem starter package claims.
- Enterprise custom usage, SSO/security review, admin/operator reporting, dedicated support.

Actually working features by tier:

- Entitlement adapter resolves Verixet snapshot first, downgrades stale/missing snapshots to free, and blocks paid access for billing states in `apps/RatAiFy/server/services/entitlementAdapter.ts`.
- `sendPlanLimitExceeded()` returns stable 402 payload with `authority: "verixet"`.
- Route tests prove some entitlement gates, including client report summary 402 behavior and superadmin local billing mutation fail-closed behavior.

Claimed but missing features:

- `PUBLIC_ECOSYSTEM_APPS` includes only `xflowx`, `verixet`, `audaix`, and `rataify`, while Verixet full ecosystem includes `wordgeni` and `crevux`. Any Rataify ecosystem package claim is incomplete if it implies all six apps.
- Enterprise SSO/security review and dedicated support are marketing-level unless tied to active admin/control-plane enforcement evidence.

Active but unadvertised features:

- Snapshot freshness guard (`RATAIFY_VERIXET_ENTITLEMENT_SNAPSHOT_MAX_AGE_MS`) prevents stale Verixet snapshots from unlocking paid access.
- Free baseline app access exists for all six app slugs, including `wordgeni` and `crevux`, in `BASELINE_FREE_APP_SLUGS`.

Free-tier safeguards:

- Strong: local schema tracks scans, sites, plan tier, subscription status, and billing period counters.
- Strong: site scan route requires idempotency keys for credit-consuming actions and ties scans to entitlement/credit logic.

Paid-tier safeguards:

- Paid features require `requireEntitledFeature()` on several routes and return 402 on missing entitlement.
- Billing state fallback blocks non-active states.

Upgrade UX issues:

- The marketing plan name "founding" maps to "RatAify Pro" and should be retired or labeled legacy.
- Rataify/RatAiFy/RatAify casing is inconsistent in code and copy.

Admin/billing issues:

- Local billing and Stripe metadata remain in schema and services. Superadmin local billing mutation tests fail closed under Verixet authority, which is good, but public/admin UI should say Verixet owns billing.

Package/add-on issues:

- Local top-up packs exist, but should be reconciled with Verixet `CREDIT_TOP_UP_PACKS`.

Recommended fixes:

- Replace `PUBLIC_ECOSYSTEM_APPS` with Verixet-generated six-app data.
- Remove "founding" from public self-serve tier copy or mark as legacy.
- Add claim tests for every `PLAN_MARKETING.highlights` item.

### WordGeni

Files inspected:

- `apps/WordGeni/apps/api/src/db/schema.ts`
- `apps/WordGeni/apps/api/src/config/billing.ts`
- `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`
- `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`
- `apps/WordGeni/apps/api/src/services/stripe/plan-from-price.ts`
- `apps/WordGeni/apps/api/src/services/stripe/stripe-webhook-processor.ts`
- `apps/WordGeni/apps/api/src/services/billing-reconciliation.ts`
- `apps/WordGeni/apps/api/src/services/visual-companion/entitlements.ts`
- `apps/WordGeni/apps/api/src/services/verixet-usage-admission.ts`
- `apps/WordGeni/apps/api/src/routes/billing.ts`
- `apps/WordGeni/apps/api/src/routes/stripe-webhook.ts`
- `apps/WordGeni/apps/api/src/services/creator-tier-policy.ts`

Pages/routes inspected:

- Web app pricing/marketing references through `apps/WordGeni/apps/web/src/app/page.tsx` and ecosystem content were treated as secondary discovery.
- API billing routes are primary proof.

API endpoints inspected:

- Billing route registration in `apps/WordGeni/apps/api/src/routes/billing.ts`.
- Stripe webhook route in `apps/WordGeni/apps/api/src/routes/stripe-webhook.ts`.
- CreVux integration route in `apps/WordGeni/apps/api/src/services/visual-companion/entitlements.ts`.

DB/schema items inspected:

- `planEnum = ['free', 'pro', 'studio', 'enterprise']`, `subscriptionStatusEnum`, `workspaces.plan`, and subscription-related tables in `apps/WordGeni/apps/api/src/db/schema.ts`.

Plan/tier constants found:

- `BillingPlanTier = 'free' | 'pro' | 'studio' | 'enterprise'` in `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`.
- `AI_USAGE_POLICY` for free/pro/studio/enterprise in `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`.

Claimed features by tier:

- Free/pro/studio/enterprise local AI writing tiers.
- Creator package path through WordGeni + CreVux.
- Verixet canonical public tiers: `wordgeni_starter`, `wordgeni_pro`, `wordgeni_elite`.

Actually working features by tier:

- Local billing entitlement resolves workspace plan and Stripe subscription status. `past_due` has grace behavior until period end; canceled and no subscription fall back to free.
- AI usage caps are enforced by workspace monthly tokens, daily user tokens, max output tokens, and max request cost cents.
- Paid entitlement assertion exists through `assertWorkspacePaidEntitlement()`.

Claimed but missing features:

- The local `studio` tier does not map cleanly to Verixet public `elite` without a documented conversion. This is a source-of-truth conflict.
- WordGeni local Stripe authority conflicts with Verixet unless explicitly limited to legacy/cache.

Active but unadvertised features:

- Cost caps per request are active in `estimateRequestCostCents()` and `assertAiGenerationBudget()`.
- Payment failure grace handling exists in `entitlementForSubscription()`.

Free-tier safeguards:

- Free AI limits are concrete: 200,000 monthly workspace tokens, 40,000 daily user tokens, max 900 output tokens, and 8 cents max request cost.

Paid-tier safeguards:

- Pro, studio, and enterprise raise token/cost limits, but access is local Stripe/workspace-plan based unless Verixet integration wraps it.

Upgrade UX issues:

- Public pricing should use Verixet tier names. If "studio" remains a product concept, define it as WordGeni's local name for Verixet `wordgeni_elite`.

Admin/billing issues:

- Local Stripe webhook and billing reconciliation code is real, but authority should move to Verixet or be documented as a mirrored cache.

Package/add-on issues:

- Creator bundle entitlement with CreVux is partially implemented; it needs a Verixet source-of-truth package test from checkout to both apps.

Recommended fixes:

- Add a mapping table from Verixet `wordgeni_starter/pro/elite` to local runtime limits.
- Stop using local Stripe subscription status as authority for new ecosystem users.
- Add tests proving Verixet denied/expired states block AI generation.

### CreVux / Crevux

Files inspected:

- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`
- `apps/CreVux/artifacts/api-server/src/routes/billingWebhook.ts`
- `apps/CreVux/artifacts/api-server/src/routes/aiCreditsRoute.ts`
- `apps/CreVux/artifacts/api-server/src/lib/aiCredits.ts`
- `apps/CreVux/artifacts/api-server/src/lib/aiCreditEconomy.ts`
- `apps/CreVux/artifacts/api-server/src/lib/stripeSubscriptionTier.ts`
- `apps/CreVux/artifacts/api-server/src/lib/stripePlanCreditFallback.ts`
- `apps/CreVux/artifacts/api-server/src/lib/entitlementsHttpAdapter.ts`
- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`
- `apps/CreVux/artifacts/api-server/src/lib/videoCreditPolicy.ts`
- `apps/CreVux/artifacts/api-server/src/lib/videoJobCredits.ts`
- `apps/CreVux/artifacts/image-gen/src/components/landing/LandingElitePricing.tsx`
- `apps/CreVux/artifacts/api-server/scripts/verify-billing-subscription-catalog-route.mjs`
- `apps/CreVux/artifacts/api-server/scripts/verify-credit-topup-wiring.ts`

Pages/routes inspected:

- Local billing subscription catalog route in `apps/CreVux/artifacts/api-server/src/routes/billing.ts`.
- Landing pricing component `apps/CreVux/artifacts/image-gen/src/components/landing/LandingElitePricing.tsx`.

API endpoints inspected:

- `GET /billing/subscription-catalog` in `apps/CreVux/artifacts/api-server/src/routes/billing.ts`.
- Local checkout/top-up/portal handlers in the same route module.
- Cross-app entitlement and usage admission helpers.

DB/schema items inspected:

- Local CreVux DB package and migrations were not fully expanded in this pass, but route and lib files show local credit/billing behavior. Shared `core` and `verixet` migrations define ecosystem-level tables.

Plan/tier constants found:

- `CREVUX_PLAN_CATALOG`, `CREVUX_PAID_TIER_KEYS`, `CREVUX_TOP_UP_PACKS`, and `CREVUX_BILLING_INTERVALS` imported from `@workspace/saas-entitlements`.

Claimed features by tier:

- CreVux paid creative tiers with image/video/media credits.
- Creator bundle claims via Verixet public catalog.
- Top-up packs for media credits.

Actually working features by tier:

- `GET /billing/subscription-catalog` returns `source: "verixet"` and `billingAuthority: "verixet"` when local billing is not allowed.
- Local billing is explicitly gated by `localBillingAllowed()` and `CREVUX_LOCAL_BILLING_ENABLED`.
- Cross-app entitlement checks fail closed when Verixet/XFlow URL or token is missing in `getCrossAppEntitlements()`.
- Usage admission reports CreVux image/video credit usage to Verixet in `assertVerixetCrevuxUsageAdmission()`.

Claimed but missing features:

- `assertVerixetCrevuxUsageAdmission()` returns skipped/unavailable for missing token, missing ecosystem workspace ID, and 5xx usage ingest; it does not always hard-block local work by itself. Calling routes must prove they treat skipped admission correctly.
- Top-up grant mapping to Verixet should be proven before public add-on claims are hard-sold.

Active but unadvertised features:

- Metadata sanitization removes tokens, secrets, Stripe IDs, prompt/raw file fields before usage ingest.
- Local billing routes are already labeled legacy in code comments.

Free-tier safeguards:

- Free media limits were not found as a single clear public source of truth. This should be added to Verixet canonical plan limits and reflected in CreVux UI.

Paid-tier safeguards:

- Local credit economy and Verixet usage admission exist, but tests must prove paid generation routes block when Verixet says no or when admission is skipped.

Upgrade UX issues:

- Local billing catalog route can make CreVux look like it owns subscriptions. UI should say "managed by Verixet" consistently.

Admin/billing issues:

- Local Stripe webhook and top-up routes remain. They should be legacy/dev only unless Verixet explicitly delegates them.

Package/add-on issues:

- Creator bundle is the most natural package for CreVux + WordGeni, but entitlement propagation must be tested from Verixet bundle purchase to both apps.

Recommended fixes:

- Add route-level tests proving generation/export routes hard-block on Verixet denial.
- Move CreVux top-up display and grant application to Verixet-generated add-on catalog.
- Keep local catalog route as display-only and fail closed for production checkout.

## D. Claim vs Reality Table

| App | Tier/package | Claimed feature | Evidence location | Classification | Fix needed |
| --- | --- | --- | --- | --- | --- |
| XFlow | Starter | 3 connected apps | `apps/XFlow/src/lib/billing/commercial-pricing.ts`, `xflowHighlights.xflow_starter` | UI only | Link claim to Verixet entitlement limit or mark as display estimate. |
| XFlow | Pro | AI Context Engine | `commercial-pricing.ts`, `xflowHighlights.xflow_pro` | Unclear | Cite active route/service gate or soften to "AI context features where enabled". |
| XFlow | Elite | 75 connected apps and long retention | `commercial-pricing.ts`, `xflowHighlights.xflow_elite` | UI only | Add canonical Verixet limit keys and tests. |
| XFlow | Bundles | Creator/Main 4/Full Ecosystem access | `commercialPricing.bundlePlans`; Verixet `CANONICAL_BILLING_PLANS` | Partially active | Ensure bundle checkout always uses Verixet and entitlement grants fan out to apps. |
| XFlow | Add-ons/top-ups | Credit top-ups | `CREDIT_TOP_UP_MAPPING_NOTE` in `commercial-pricing.ts` | Missing | Do not market until Verixet grant mappings exist. |
| Verixet | Single-app Starter/Pro/Elite | Public self-serve plans for all six apps | `CANONICAL_BILLING_PLANS` in `canonical-catalog.ts` | Active | Keep generated public catalog as source of truth. |
| Verixet | Main 4 bundle | Four-app bundle | `CANONICAL_BILLING_PLANS` rows `main4_*`; `BUNDLE_COPY.main4` | Partially active | Rows with `pricing_status: "price_mismatch_review"` need public warning or checkout block. |
| Verixet | Creator bundle | WordGeni + Crevux | `BUNDLE_COPY.creator`, `creator_*` rows | Partially active | Prove entitlement grants unlock both apps. |
| Verixet | Full Ecosystem | Six apps together | `BUNDLE_COPY.ecosystem`, `ecosystem_*` rows | Partially active | Resolve price mismatch review rows before hard-selling. |
| Verixet | Add-ons | AI/media/storage top-ups | `CREDIT_TOP_UP_PACKS`; `PlanComparisonTabs` add-on cards | Backend only | Add public grant proof and route tests. |
| AudAiX | Free | 20 audits/month, 500 pages/month, no schedules | `BILLING_PLANS.free`, `WORKSPACE_PLAN_LIMITS.free` | Active | Mirror from Verixet, keep local fallback tested. |
| AudAiX | Starter | Deep audits and recurring monitoring | `BILLING_PLANS.pro` display name "Starter" | Partially active | Rename internal `pro` mapping in docs/UI to avoid confusion. |
| AudAiX | Paid AI checks | Entitlement + credit required | `ai-check-routes.ts`, `assertWorkspaceEntitlementForAction`, `assertWorkspaceCreditsAvailable` | Active | Add Verixet denial integration tests. |
| AudAiX | Ecosystem plans | `audaix_*` and `ecosystem_*` public slugs | `publicAudaixPlanSlugSchema`, `publicEcosystemPlanSlugSchema` | Backend only | Generate from Verixet instead of owning locally. |
| RatAiFy | Free | One site, one scan/month, no AI enrichment by default | `PLAN_MARKETING.free` in `shared/plans.ts`; `BILLING_CATALOG.free` | Partially active | Ensure route counters enforce every bullet. |
| RatAiFy | Starter | 3 sites, 25 scans/month, 100 assistant messages/month | `PLAN_MARKETING.starter`; `BILLING_CATALOG.rataify_starter` | Partially active | Add claim tests for assistant and storage usage caps. |
| RatAiFy | Pro/founding | Legacy onboarding aliases resolve to Pro | `PLAN_MARKETING.founding` | UI only | Remove public "founding" unless legacy-only. |
| RatAiFy | Paid reports | Client reports require entitlement | `site-tools.ts`, `requireEntitledFeature`; test "client report summary enforces entitlement gate" | Active | Keep Verixet authority wording. |
| RatAiFy | Ecosystem Starter | Broader billing/governance workflows | `PLAN_MARKETING.professional`; `PUBLIC_ECOSYSTEM_APPS` omits WordGeni/CreVux | Partially active | Use Verixet full six-app catalog. |
| WordGeni | Free | AI caps | `AI_USAGE_POLICY.free` in `ai-usage-limits.ts` | Active | Show caps in pricing copy. |
| WordGeni | Pro | Paid AI capacity | `BillingPlanTier`, `assertWorkspacePaidEntitlement`, `AI_USAGE_POLICY.pro` | Backend only | Map to Verixet `wordgeni_starter` or `wordgeni_pro`. |
| WordGeni | Studio | Higher writing limits | `planEnum`, `AI_USAGE_POLICY.studio` | Backend only | Rename or map to Verixet `wordgeni_elite`. |
| WordGeni | Payment failure handling | Past-due grace and cancellation fallback | `entitlementForSubscription()` | Active locally | Move authority to Verixet or make this cache-only. |
| WordGeni | Creator bundle | Visual companion with CreVux | `visual-companion/entitlements.ts`; `routes.json` WordGeni/CreVux integration | Partially active | Prove Verixet Creator bundle unlocks both sides. |
| CreVux | Pro/Elite media generation | Paid media credits and generation | `CREVUX_PLAN_CATALOG` imports, `aiCredits.ts`, `videoCreditPolicy.ts` | Partially active | Prove all generation routes block on Verixet denial. |
| CreVux | Subscription catalog | Verixet authority display data | `GET /billing/subscription-catalog` in `routes/billing.ts` | Active display | Keep checkout disabled locally in production. |
| CreVux | Local checkout | Legacy local billing route | `routes/billing.ts` comment and `localBillingAllowed()` | Backend only | Keep dev-only; remove from public UX. |
| CreVux | Cross-app visual companion | WordGeni/CreVux entitlement check | `entitlementsHttpAdapter.ts` | Partially active | Replace test override and URL/token fallback with Verixet standard route. |
| CreVux | Usage admission | Image/video credit ingest | `verixetUsageAdmission.ts` | Partially active | Ensure skipped admission blocks paid work in callers. |

## E. Package/Add-On Audit

Single-app packages:

- Verixet defines single-app public plans for XFlow, Verixet, Rataify, AudAiX, WordGeni, and Crevux in `apps/Verixet/src/lib/billing/canonical-catalog.ts`.
- XFlow mirrors XFlow and comparison app plans in `apps/XFlow/src/lib/billing/commercial-pricing.ts`.
- AudAiX, RatAiFy, WordGeni, and CreVux each retain local app-specific plan constants.

Bundle logic:

- Verixet defines `main4`, `creator`, and `ecosystem` bundle families in `CANONICAL_BILLING_PLANS` and expands grants via `expandEcosystemBundle()` and `entitlementGrantsForPlan()`.
- XFlow displays these bundles through `commercialPricing.bundlePlans`.
- RatAiFy local ecosystem math only covers four apps in `PUBLIC_ECOSYSTEM_APPS`, so it conflicts with Verixet's six-app full ecosystem model.

Add-on logic:

- Verixet has `CREDIT_TOP_UP_PACKS` and public add-on view models grouped as AI, media, and storage.
- XFlow explicitly says credit top-up Stripe products are compatibility-only until Verixet publishes explicit credit grant mappings.
- CreVux and RatAiFy retain local top-up pack logic.

Top-up logic:

- Verixet top-ups belong in `verixet.credit_ledger` from `supabase/migrations/020_verixet_schema.sql`.
- CreVux local top-up route resolves local Stripe price envs and credits in `apps/CreVux/artifacts/api-server/src/routes/billing.ts`.
- AudAiX dashboard API tests reference workspace credit top-up checkout.

Credit logic:

- Shared usage and billing credit concepts are in `ecosystem-contracts/types/usage-metrics.ts`.
- Verixet has `credit_ledger`; AudAiX has `CREDIT_COSTS`; RatAiFy has `CREDIT_COST_PER_FEATURE`; CreVux has `aiCredits` and `verixetUsageAdmission`.

Per-app entitlement model:

- AudAiX and RatAiFy read Verixet snapshots where possible, then fall back to local plan data.
- WordGeni uses local Stripe/workspace plan entitlement.
- CreVux uses fail-closed external entitlement checks and local credit state.

Cross-app entitlement model:

- The intended cross-app model is Verixet owned, as defined in `ecosystem-contracts/routes.json`.
- The implemented model is mixed: Verixet can evaluate and compose entitlements, but satellites still interpret local snapshots and plan constants.

Schema/API/frontend gaps:

- No generated Verixet public catalog artifact is consumed by every app.
- No single test proves a bundle purchase grants all required per-app entitlements and limits across all six apps.
- No single add-on test proves Stripe top-up purchase creates the expected app-local credit availability.
- Public pricing rows with `pricing_status: "price_mismatch_review"` can still appear public.

Recommended package model:

- One Verixet-owned subscription model with app-scoped packages and bundles.
- Keep separate per-site/app packages as Verixet plan scopes, not separate billing authorities.
- Model packages as: `single_app`, `main4_bundle`, `creator_bundle`, `ecosystem_bundle`, and `addon`.
- Satellites should consume a generated, read-only catalog plus entitlement/admission APIs.
- Local satellite plans should be enforcement caches only, with tests proving exact parity to Verixet.

## F. Recommended Fair Tier Structure

### XFlow

- Free: one workspace, basic app directory, read-only status, limited events. Lock advanced automation, AI context, exports, and long retention. Prompt: "Upgrade in Verixet to connect more apps and retain more history."
- Starter: up to three connected apps, basic incidents/events, limited Copilot. Cap event ingest and retention. Remove claims that imply broad AI context unless backed by feature gates.
- Pro: up to 15 connected apps, AI context where enabled, exports, higher event caps. Require Verixet entitlement for AI and export actions.
- Business/Enterprise: higher app count, custom retention, admin controls, SSO/manual setup. Mark manual setup where not self-serve.
- Add-ons/packages: no XFlow-owned add-ons until Verixet top-up grant mapping is proven.

### Verixet

- Free: billing account setup, read-only plan status, limited entitlement checks, no Stripe checkout without configured catalog.
- Starter: one app package, basic usage ledger, entitlement evaluation, customer portal.
- Pro: higher usage, plan-change preview/execute, richer billing dashboards.
- Business/Enterprise: custom bundles, SSO, audit exports, support, manual contract.
- Add-ons/packages: AI credits, media credits, storage packs. Only show add-ons with proven grant application.

### AudAiX

- Free: one site, manual audit caps, no schedules, watermarked/limited reports.
- Starter: current internal `pro` behavior, deep audits, schedules, webhooks, capped AI checks.
- Pro: more sites/pages/schedules, report sharing, priority queue, stronger AI remediation caps.
- Business/Enterprise: connector exports, enterprise controls, custom caps, manual setup.
- Remove/soften: any "unlimited" monitoring unless Verixet limit matrix and route tests prove it.

### RatAiFy / Rataify

- Free: one site, one trust scan/month, no AI enrichment by default, strict retention, upgrade prompts on scan/report/export limits.
- Starter: three sites, capped scans, capped assistant, limited reports, starter storage.
- Pro: more sites/scans, privacy/policy/copy/inbox modules, report exports, connected app verification.
- Business/Enterprise: SSO/security review/manual setup, dedicated support, custom retention.
- Remove/soften: "founding" public tier and incomplete four-app ecosystem package claims.

### WordGeni

- Free: source-grounded drafting with low token/cost caps and limited projects/documents.
- Starter: map to Verixet `wordgeni_starter`, raise AI caps, limited exports.
- Pro: map to Verixet `wordgeni_pro`, more documents/projects, higher AI caps, provenance/reporting.
- Business/Enterprise: map `studio` or enterprise to Verixet `wordgeni_elite`/enterprise, custom caps and support.
- Remove/soften: local Stripe-paid claims until Verixet is the authority.

### CreVux / Crevux

- Free: small image/media trial allowance, watermark/low resolution, no video or limited video preview.
- Starter: `crevux_starter`, capped image credits, basic exports.
- Pro: higher image/video credits, private asset history, higher export quality.
- Business/Enterprise: team media workflows, custom credit pools, priority processing, manual setup.
- Add-ons: media image credits, advanced video credits, storage. Only market once Verixet add-on grant proof exists.

## G. P0/P1/P2/P3 Roadmap

P0:

- Stop public hard claims for price rows with `pricing_status: "price_mismatch_review"` in Verixet canonical catalog.
- Make Verixet the only public checkout and subscription authority in XFlow, AudAiX, RatAiFy, WordGeni, and CreVux.
- Remove or relabel XFlow credit top-up claims until Verixet grant mappings are active.
- Fix RatAiFy ecosystem package copy so it does not omit WordGeni/CreVux while claiming ecosystem coverage.
- Add fail-closed tests for free-tier AI/media/scan/export abuse.

P1:

- Generate satellite pricing data from Verixet.
- Normalize public tier names across Verixet and satellites.
- Convert local billing schemas/routes to cache/legacy labels.
- Add plan-change, expired, canceled, past_due, trial, failed-payment, and no-plan persona tests.
- Fix XFlow `verify:audit-mutation-coverage` and RatAiFy AudAiX proof copy test failures.

P2:

- Improve dashboard copy for "managed by Verixet".
- Add package/add-on polish and clear upgrade prompts.
- Add active/unavailable/manual setup labels to paid feature cards.
- Add stronger usage display for free and paid caps.

P3:

- Marketing polish, casing cleanup, tier naming polish, and comparison table cleanup after authority and gates are fixed.

## H. Start Here Recommendation

1. Fix Verixet public catalog truthfulness: `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, and `apps/Verixet/src/components/shared/pricing/PlanComparisonTabs.tsx`.
2. Fix XFlow pricing handoff: `apps/XFlow/src/lib/billing/commercial-pricing.ts` and `apps/XFlow/src/app/api/billing/checkout/route.ts`.
3. Replace RatAiFy local ecosystem package data: `apps/RatAiFy/src/lib/billing/plans.ts` and `apps/RatAiFy/shared/plans.ts`.
4. Normalize AudAiX tier naming and Verixet parity: `apps/AudAix/src/lib/billing/plans.ts` and `apps/AudAix/src/workspace-plan.ts`.
5. Map WordGeni local `pro/studio/enterprise` to Verixet public slugs: `apps/WordGeni/apps/api/src/services/billing-entitlements.ts` and `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`.
6. Move CreVux top-up/media credit public claims behind Verixet proof: `apps/CreVux/artifacts/api-server/src/routes/billing.ts` and `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`.
7. Add package/add-on grant tests for Verixet add-ons and Creator/Main 4/Full Ecosystem bundles.
8. Add a generated report/test that fails when any public pricing bullet lacks a code-backed claim.

## I. Implementation Plan

Commit 1: Audit/proof docs only

- Add this report.
- Add no production code changes.
- Record verification results and dirty-worktree status.

Commit 2: Source-of-truth plan constants/schema cleanup

- Make Verixet canonical catalog the only public plan source.
- Generate satellite read-only catalogs.
- Add compatibility mappings for legacy local slugs.

Commit 3: Frontend pricing/upgrade copy cleanup

- Replace satellite pricing copy with generated Verixet data.
- Add "coming soon", "manual setup required", or "managed by Verixet" labels.
- Remove unsupported or unproven claims.

Commit 4: Feature gates and free-tier safeguards

- Add route-level fail-closed checks for AI, scan, export, media, storage, and cross-app workflows.
- Add expired/past_due/canceled/no-plan tests.

Commit 5: Package/add-on entitlement model

- Implement Verixet add-on grants for AI/media/storage credits.
- Prove bundle grant expansion to all included apps.
- Remove satellite-owned top-up authority from production paths.

Commit 6: Tests/proof verification

- Add claim-vs-code tests for pricing bullets.
- Add end-to-end package and add-on verification.
- Restore green root and app verification commands.

## J. Test/Verification Plan

Commands run:

| Scope | Command | Result |
| --- | --- | --- |
| Root | `npm run proof:billing-contracts` | Passed. Contract validation passed; phase17 static proof reported 68 pass, 0 warnings, 0 failures. |
| Root | `npm run proof:ecosystem:static` | Passed. Phase17 static proof reported 68 pass, 0 warnings, 0 failures. |
| Root | `npm run validate:ecosystem-contracts` | Passed. Apps: 6, env rows: 81, routes: 24, token types: 13. |
| XFlow | `npm --prefix apps/XFlow run typecheck` | Passed. |
| XFlow | `npm --prefix apps/XFlow run test` | Timed out after 180 seconds in this run. Related behavior marked present but needs verification. |
| XFlow | `npm --prefix apps/XFlow run verify:ci` | Failed. `verify:audit-mutation-coverage` reported missing audit action literals in `src/app/api/deployments/[id]/redeploy/route.ts` and `src/app/api/deployments/[id]/restart/route.ts`. |
| Verixet | `npm --prefix apps/Verixet run typecheck` | Passed. |
| Verixet | `npm --prefix apps/Verixet run test` | Failed. 590 files passed, 3 skipped; one timeout in `src/lib/access-billing-control/service.behavior.test.ts` test "denies safely when the connected app cannot be resolved". |
| Verixet | `npm --prefix apps/Verixet run stripe:price-env:verify` | Passed required checks. Reported optional six-month price env warnings. |
| AudAiX | `npm --prefix apps/AudAix run typecheck` | Passed. |
| AudAiX | `npm --prefix apps/AudAix run test:ci` | Timed out after 180 seconds in this run. Related behavior marked present but needs verification. |
| AudAiX | `npm --prefix apps/AudAix run verify:routes` | Passed. Local dashboard/auth/API proof reported 104 dashboard routes, 293 API routes, 141 mutation routes classified, 29 billing routes proof-needed. |
| RatAiFy | `npm --prefix apps/RatAiFy run typecheck` | Passed. |
| RatAiFy | `npm --prefix apps/RatAiFy run test` | Failed. 384 pass, 1 fail; failing test was "public AudAiX component gates badge visibility on publicBadgeEnabled" expecting copy not present in `AudaixProofPanel`. |
| RatAiFy | `npm --prefix apps/RatAiFy run verify:ci` | Failed on the same RatAiFy test after lint/typecheck/integrity ran; lint produced warnings but continued. |
| WordGeni | `pnpm typecheck` from `apps/WordGeni` | Blocked before script by pnpm non-TTY dependency purge prompt: `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. Not forced to avoid dependency-state mutation. |
| WordGeni | `pnpm test` from `apps/WordGeni` | Blocked by same pnpm non-TTY dependency purge prompt. |
| WordGeni | `pnpm lint` from `apps/WordGeni` | Blocked by same pnpm non-TTY dependency purge prompt. |
| WordGeni | `pnpm stripe:proof` | Skipped. Stripe test env was not intentionally configured, and pnpm commands were blocked before scripts. |
| CreVux | `pnpm run typecheck` from `apps/CreVux` | Blocked before script by pnpm non-TTY dependency purge prompt: `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. Not forced to avoid dependency-state mutation. |
| CreVux | `pnpm run test` from `apps/CreVux` | Blocked by same pnpm non-TTY dependency purge prompt. |
| CreVux | `pnpm run verify:security` from `apps/CreVux` | Not run after pnpm preflight blocked earlier CreVux scripts; expected same dependency purge prompt. |
| CreVux | `pnpm run verify:routes` from `apps/CreVux` | Not run after pnpm preflight blocked earlier CreVux scripts; expected same dependency purge prompt. |

Tests that should be added:

- A Verixet-generated pricing catalog parity test consumed by every satellite.
- One test per public tier bullet, failing if no implementation evidence exists.
- Bundle entitlement tests for Main 4, Creator, and Full Ecosystem.
- Add-on/top-up grant tests from Stripe event to credit ledger to app-local access.
- Expired, canceled, past_due, failed payment, trial, no-plan, and downgrade persona tests across all six apps.

## Final Report Footer

1. Which app should be fixed first?

Verixet should be fixed first as the source of commercial truth, immediately followed by XFlow because it is a primary public pricing and checkout handoff surface.

2. What is the most dangerous tier/payment issue?

The most dangerous issue is split commercial authority: Verixet is intended to own billing and entitlements, but XFlow, AudAiX, RatAiFy, WordGeni, and CreVux still contain local plan, Stripe, billing, or entitlement logic that can drift from Verixet and create false paid/unpaid states.

3. Which paid tier is weakest?

WordGeni `studio` is the weakest paid tier concept because it is active locally in schema and AI policy but does not cleanly map to Verixet public `wordgeni_starter/pro/elite` tiers. RatAiFy `founding` is also weak and should be treated as a legacy alias, not a public tier.

4. Which free tier needs the strongest safeguards?

CreVux needs the strongest free-tier safeguards because media generation can create direct provider cost exposure, and this audit did not find a single clear free-tier cap source tied to every generation route. RatAiFy is second because scans, AI summaries, reports, and storage can accumulate abuse risk.

5. Should the ecosystem use one shared subscription model or separate per-site packages?

Use one shared Verixet subscription authority with separate per-app packages and bundle scopes inside that authority. Do not let each site own independent Stripe plans. The clean model is Verixet-owned `single_app`, `main4_bundle`, `creator_bundle`, `ecosystem_bundle`, and `addon` scopes, with satellites consuming generated display catalogs and entitlement/admission decisions.

## After Execution Check

- Intended created file: `docs/subscription-tier-audit-roadmap.md`.
- No files were staged or committed.
- `git status --short` was run after this file was created.
- Confirmed intended audit file status: `?? docs/subscription-tier-audit-roadmap.md`.
- The only newly created or modified intended file for this task is `docs/subscription-tier-audit-roadmap.md`.
- A verifier briefly changed the generated timestamp in `docs/xflow-admin-surface-evidence-matrix.md`; that timestamp-only side effect was reverted before the final status check.
- Other dirty files were already present before this audit pass and were not staged, committed, reverted, or intentionally modified:
  - `M package.json`
  - `?? docs/ratify-post-rollout-observation.md`
  - `?? docs/ratify-production-deployment-plan.md`
  - `?? docs/ratify-production-rollout-readiness.md`
  - `?? docs/ratify-staging-proof-recovery.md`
  - `?? docs/ratify-staging-proof-rollout.md`
  - `?? docs/workflow-copilot-audit.md`
  - `?? docs/workspace-external-proof-approval-packet.md`
  - `?? docs/workspace-external-proof-approval-register.json`
  - `?? docs/workspace-five-app-api-redaction-evidence.json`
  - `?? docs/workspace-five-app-api-redaction-proof-register.json`
  - `?? docs/workspace-five-app-api-redaction-proof.md`
  - `?? docs/workspace-five-app-auth-read-fixtures-evidence.json`
  - `?? docs/workspace-five-app-auth-read-fixtures-proof-register.json`
  - `?? docs/workspace-five-app-auth-read-fixtures-proof.md`
  - `?? docs/workspace-local-proof-closeout-register.json`
  - `?? docs/workspace-local-proof-closeout.md`
  - `?? docs/workspace-provider-billing-proof-plan-register.json`
  - `?? docs/workspace-provider-billing-proof-plan.md`
  - `?? docs/xflow-user-dashboard-api-redaction-proof-register.json`
  - `?? docs/xflow-user-dashboard-api-redaction-proof.md`
  - `?? docs/xflow-user-dashboard-auth-fixture-browser-proof-register.json`
  - `?? docs/xflow-user-dashboard-auth-fixture-browser-proof.md`
  - `?? docs/xflow-user-dashboard-local-browser-proof-register.json`
  - `?? docs/xflow-user-dashboard-local-browser-proof.md`
  - `?? docs/xflow-user-dashboard-local-proof-register.json`
  - `?? docs/xflow-user-dashboard-local-proof.md`
  - `?? docs/xflow-user-dashboard-mutation-boundary-proof-register.json`
  - `?? docs/xflow-user-dashboard-mutation-boundary-proof.md`
  - `?? scripts/verify-workspace-external-proof-approval.mjs`
  - `?? scripts/verify-workspace-five-app-api-redaction.mjs`
  - `?? scripts/verify-workspace-five-app-auth-read-fixtures.mjs`
  - `?? scripts/verify-workspace-local-proof-closeout.mjs`
  - `?? scripts/verify-workspace-provider-billing-proof-plan.mjs`
