# Subscription Tier P0 Fix Plan

Source of truth: `docs/subscription-tier-audit-roadmap.md`.

This is a planning-only pass. Do not edit production code, schemas, tests, routes, UI, app logic, billing logic, Stripe logic, or database logic while creating this file. Do not stage or commit anything. Preserve unrelated dirty files.

## A. Executive Summary

P0 objective: remove the ways users can see, select, buy, or use subscription tiers/packages that are not final, not Verixet-authoritative, or not enforced consistently across the six-app ecosystem.

The audit's central P0 finding is split commercial authority. `ecosystem-contracts/apps.json` and `ecosystem-contracts/routes.json` make Verixet the intended owner of plan catalog, checkout, billing status, entitlement evaluation, usage ingest, portal sessions, and Stripe webhooks. Yet XFlow, AudAiX, RatAiFy, WordGeni, and CreVux still contain local pricing, billing, Stripe, package, credit, or entitlement logic that can drift from Verixet.

This plan does not try to fix all tier quality issues. It targets only P0 safety and truthfulness:

- Verixet authority conflicts that can show or sell the wrong plan.
- Public pricing/package claims that are not final.
- Checkout/upgrade paths that can bypass or blur Verixet.
- Paid work that can run without confirmed entitlement/admission.
- Free-tier caps that are missing where provider cost or abuse risk is high.
- Admin/billing displays that can present local/cache state as authoritative.

Recommended first implementation sequence:

1. Verixet: hide or label non-final public pricing rows and make public catalog state explicit.
2. XFlow: force all public pricing and upgrade CTAs to Verixet handoff and hide top-up claims.
3. RatAiFy: remove incomplete four-app ecosystem package claims from public/self-serve copy.
4. CreVux: make skipped/unavailable Verixet usage admission block paid media generation paths or show a hard unavailable state.
5. WordGeni and AudAiX: mark local plan/billing state as cache/legacy and prevent it from being displayed as the source of truth.
6. Add P0 proof tests for the above.

## B. P0 Fix Queue

| Priority | App | Issue | Risk | Files likely touched | Fix type | Test/proof command |
| --- | --- | --- | --- | --- | --- | --- |
| P0-1 | Verixet | Public bundle rows can be `public_plan: true` while `pricing_status: "price_mismatch_review"` | Users can see or buy non-final prices/packages | `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, `apps/Verixet/src/components/shared/pricing/PlanComparisonTabs.tsx`, `apps/Verixet/src/components/shared/pricing/CheckoutCTA.tsx` | Copy/API/UI guard + test/proof | `npm --prefix apps/Verixet run typecheck`; targeted pricing/catalog tests; `npm --prefix apps/Verixet run stripe:price-env:verify` |
| P0-2 | XFlow | Pricing and bundle CTAs can imply XFlow owns checkout/paid unlocks; top-up claims are explicitly compatibility-only | Wrong checkout path or false credit purchase expectations | `apps/XFlow/src/lib/billing/commercial-pricing.ts`, `apps/XFlow/src/app/api/billing/checkout/route.ts`, XFlow pricing/page CTA components using `commercialPricing` | Copy/API guard + test/proof | `npm --prefix apps/XFlow run typecheck`; targeted commercial pricing tests; `npm --prefix apps/XFlow run verify:commercial-pack` |
| P0-3 | RatAiFy | Local ecosystem package model omits WordGeni/CreVux while Verixet full ecosystem includes all six apps | Users can buy/upgrade based on incomplete package representation | `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/shared/plans.ts`, RatAiFy pricing/checkout/dashboard billing UI | Copy/catalog guard + test/proof | `npm --prefix apps/RatAiFy run typecheck`; targeted billing catalog tests |
| P0-4 | All satellites | Local plan/billing/Stripe logic can present itself as authority | Fake tiers, mismatched prices, wrong plan status, or duplicate checkout authority | XFlow billing routes, AudAiX billing plan files, RatAiFy billing services/routes, WordGeni billing/Stripe services, CreVux billing routes | Copy/API guard + test/proof | Root `npm run proof:billing-contracts`; app-specific typecheck and targeted route tests |
| P0-5 | CreVux | `assertVerixetCrevuxUsageAdmission()` can return skipped/unavailable states; callers must prove paid media work does not proceed unsafely | Free/provider-cost abuse or paid media work without confirmed entitlement | `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`, generation/video/image route callers, `apps/CreVux/artifacts/api-server/src/lib/videoCreditPolicy.ts`, `apps/CreVux/artifacts/api-server/src/lib/videoJobCredits.ts` | Gate/enforcement + test/proof | `pnpm run typecheck`; targeted CreVux usage admission/video credit tests after pnpm preflight issue is resolved |
| P0-6 | WordGeni | Local `pro/studio/enterprise` entitlement can conflict with Verixet `wordgeni_starter/pro/elite` | Paid status can be wrong under ecosystem billing; users can see a paid tier not sold by Verixet | `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`, `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`, `apps/WordGeni/apps/api/src/services/stripe/*`, billing route/UI copy | API guard + copy + test/proof | `pnpm typecheck`; targeted WordGeni billing entitlement tests after pnpm preflight issue is resolved |
| P0-7 | AudAiX | Public "Starter" maps to internal `pro`; local plans can drift from Verixet | Confusing upgrade UX and wrong entitlement interpretation | `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/src/lib/billing/entitlement-adapter.ts`, dashboard billing copy | Copy/catalog guard + test/proof | `npm --prefix apps/AudAix run typecheck`; `npm --prefix apps/AudAix run verify:routes`; targeted billing/entitlement tests |
| P0-8 | Admin/billing screens | Screens may show local/cache/snapshot billing state as final plan state | Admins can make wrong support or upgrade decisions | XFlow billing/account UI, Verixet dashboard billing UI, RatAiFy trust dashboard billing shell, AudAiX dashboard billing UI, WordGeni admin/billing UI, CreVux subscription catalog UI | Copy/UI guard + test/proof | Relevant app UI tests and route proof scripts |

### P0 Item Details

#### P0-1: Verixet public pricing rows must not appear final while marked `price_mismatch_review`

- **Problem:** Verixet contains public pricing/package rows with `pricing_status: "price_mismatch_review"` while the UI can still communicate concrete prices, seats, and included apps.
- **User-facing risk:** Users may believe pricing is final and comparable across apps when the audit shows package status is not final.
- **Revenue/payment risk:** Checkout or sales handoff can be based on a stale or wrong commercial package.
- **Files likely needing changes:** `apps/Verixet/src/lib/billing/canonical-catalog.ts`, `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`, `apps/Verixet/src/components/shared/pricing/PlanComparisonTabs.tsx`, `apps/Verixet/src/components/shared/pricing/CheckoutCTA.tsx`.
- **Current evidence from the audit:** The audit cites Verixet public plan rows where `public_plan: true` and `pricing_status: "price_mismatch_review"` coexist.
- **Exact intended behavior after fix:** Non-final packages are hidden from self-serve checkout or clearly labeled manual setup / coming soon; no public page states mismatched pricing as final.
- **Safe implementation steps:** Add an explicit display/checkout guard for non-final pricing rows, update public copy to avoid final price promises, keep canonical constants intact unless tests prove they are display-only, and add proof that non-final rows cannot render a buy CTA.
- **Tests or proof commands to run:** `npm --prefix apps/Verixet run typecheck`; targeted pricing/catalog tests; `npm --prefix apps/Verixet run stripe:price-env:verify`; `npm run proof:billing-contracts`.
- **Rollback risk:** Low for copy/display guards; medium if checkout routing depends on currently visible package ids.
- **Fix type:** Copy-only plus API/UI guard and test/proof.

#### P0-2: XFlow must not present itself as commercial authority for paid plans or top-ups

- **Problem:** XFlow has local upgrade, billing, and top-up surfaces that can imply XFlow owns checkout or final plan packaging even though Verixet should be authority.
- **User-facing risk:** Users may click upgrade or top-up CTAs expecting a plan that is not actually sold or enforced by Verixet.
- **Revenue/payment risk:** Paid demand can route to the wrong product, wrong price, or unsupported credit package.
- **Files likely needing changes:** `apps/XFlow/src/lib/billing/commercial-pricing.ts`, `apps/XFlow/src/app/api/billing/checkout/route.ts`, XFlow pricing/page CTA components using `commercialPricing`.
- **Current evidence from the audit:** The audit marks XFlow top-up mapping as compatibility-only and cites XFlow local pricing/billing surfaces separate from Verixet authority.
- **Exact intended behavior after fix:** XFlow displays entitlement and usage state as received from Verixet and sends all upgrade, checkout, top-up, and portal actions to Verixet-owned routes or contact/manual setup states.
- **Safe implementation steps:** Replace local final pricing claims with Verixet-managed wording, remove or disable self-serve local checkout CTAs that are not backed by Verixet, keep entitlement reads but label their source clearly, and add regression proof that public/upgrade surfaces do not initiate local Stripe checkout.
- **Tests or proof commands to run:** `npm --prefix apps/XFlow run typecheck`; targeted commercial pricing tests; `npm --prefix apps/XFlow run verify:commercial-pack`; `npm run proof:billing-contracts`.
- **Rollback risk:** Low for copy changes; medium for API redirects if existing users depend on a legacy local checkout path.
- **Fix type:** Copy-only plus API guard and test/proof.

#### P0-3: RatAiFy ecosystem package copy must not omit WordGeni or CreVux

- **Problem:** RatAiFy local package copy includes an incomplete ecosystem bundle and can understate or misstate the Verixet package composition.
- **User-facing risk:** Users may buy or request a package expecting fewer or different included apps than the central offer.
- **Revenue/payment risk:** Sales/support may need to unwind mismatched package expectations.
- **Files likely needing changes:** `apps/RatAiFy/src/lib/billing/plans.ts`, `apps/RatAiFy/shared/plans.ts`, RatAiFy pricing/checkout/dashboard billing UI.
- **Current evidence from the audit:** The audit cites RatAiFy local ecosystem package copy as omitting WordGeni and CreVux compared with Verixet package rows.
- **Exact intended behavior after fix:** RatAiFy does not define its own ecosystem package; it either links to Verixet package details or uses neutral copy such as "managed through Verixet."
- **Safe implementation steps:** Remove package composition claims from RatAiFy, replace local checkout CTAs with Verixet-managed route/contact states, and add proof that package app lists are not duplicated in RatAiFy.
- **Tests or proof commands to run:** `npm --prefix apps/RatAiFy run typecheck`; targeted billing catalog tests; `npm --prefix apps/RatAiFy run verify:ci` after existing unrelated proof-copy issue is resolved.
- **Rollback risk:** Low if limited to copy and routing; medium if local checkout route currently receives production traffic.
- **Fix type:** Copy/catalog guard plus API and test/proof.

#### P0-4: Satellite apps must stop presenting local plan catalogs as authoritative

- **Problem:** Satellite apps retain local tier arrays, price labels, Stripe references, and feature gates that can conflict with Verixet.
- **User-facing risk:** Different apps can show different paid promises for the same account.
- **Revenue/payment risk:** Users can be charged, upgraded, or blocked according to a local interpretation instead of the commercial system of record.
- **Files likely needing changes:** XFlow billing routes, AudAiX billing plan files, RatAiFy billing services/routes, WordGeni billing/Stripe services, CreVux billing routes.
- **Current evidence from the audit:** The audit identifies local plan/billing/Stripe/package logic across XFlow, AudAiX, RatAiFy, WordGeni, and CreVux.
- **Exact intended behavior after fix:** Satellite apps may keep local technical caps as enforcement fallbacks, but plan catalog, price, checkout, portal, and billing status are Verixet-owned.
- **Safe implementation steps:** Classify local constants as technical limits only, remove price/package display from satellites, redirect commercial actions to Verixet, and add contract tests that satellites do not export or render a public paid catalog.
- **Tests or proof commands to run:** App-specific typechecks, `npm run proof:billing-contracts`, `npm run proof:ecosystem:static`, targeted route tests for each changed checkout/upgrade path.
- **Rollback risk:** Medium because changes span multiple apps and may affect active upgrade paths.
- **Fix type:** Copy-only plus API/gate-enforcement and test/proof.

#### P0-5: CreVux must not admit provider-cost paid work without confirmed entitlement

- **Problem:** CreVux usage admission can skip or be unavailable in ways that still allow generation/provider-cost work unless every caller blocks safely.
- **User-facing risk:** Free users may access paid media generation or see upgrade prompts only after expensive work starts.
- **Revenue/payment risk:** Provider costs can be incurred without confirmed entitlement or usage reservation.
- **Files likely needing changes:** `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`, generation/video/image route callers, `apps/CreVux/artifacts/api-server/src/lib/videoCreditPolicy.ts`, `apps/CreVux/artifacts/api-server/src/lib/videoJobCredits.ts`.
- **Current evidence from the audit:** The audit calls out CreVux free-tier/provider-cost risk and usage admission behavior where skipped/unavailable states require caller enforcement.
- **Exact intended behavior after fix:** Every provider-cost request requires confirmed entitlement or an atomic allowed reservation before work starts; unknown/unavailable entitlement states fail closed for paid work.
- **Safe implementation steps:** Trace all generation entry points, add a shared preflight guard, fail closed on missing entitlement/reservation, preserve no-cost previews if explicitly allowed, and test free-tier exhaustion and unavailable entitlement states.
- **Tests or proof commands to run:** `pnpm run typecheck`; targeted CreVux usage admission/video credit tests after pnpm preflight issue is resolved; `npm run proof:billing-contracts`.
- **Rollback risk:** Medium because stricter gates can block users who previously generated under loose fallback behavior.
- **Fix type:** Gate/enforcement plus test/proof.

#### P0-6: WordGeni tier names and paid studio claims must align to Verixet

- **Problem:** WordGeni has local `pro`, `studio`, and `enterprise` wording that can appear to be a commercial catalog independent of Verixet.
- **User-facing risk:** Users can see a Studio/Enterprise promise that is not the Verixet package they can actually buy or use.
- **Revenue/payment risk:** Sales and support can inherit plan-name disputes or entitlement mismatches.
- **Files likely needing changes:** `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`, `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`, `apps/WordGeni/apps/api/src/services/stripe/*`, billing route/UI copy.
- **Current evidence from the audit:** The audit cites WordGeni local `pro/studio/enterprise` entitlement conflicting with Verixet `wordgeni_starter/pro/elite`.
- **Exact intended behavior after fix:** WordGeni describes paid access as Verixet-managed and uses local terms only for technical capability groups where required by enforcement logic.
- **Safe implementation steps:** Remove final price/tier claims, map local technical gates to Verixet entitlement ids, update upgrade CTAs to Verixet, and add proof that WordGeni does not publish a conflicting paid catalog.
- **Tests or proof commands to run:** `pnpm typecheck`; targeted WordGeni billing entitlement tests after pnpm preflight issue is resolved; root static proof.
- **Rollback risk:** Low for copy; medium if entitlement ids need remapping.
- **Fix type:** Copy-only plus gate/enforcement.

#### P0-7: AudAiX Starter/pro mismatch must be made truthful

- **Problem:** AudAiX public Starter copy maps to internal `pro` logic, creating a mismatch between user-facing plan names and technical enforcement.
- **User-facing risk:** Users may believe they have Starter while backend logic treats them as Pro, or vice versa.
- **Revenue/payment risk:** Incorrect plan-name mapping can cause wrong upgrade prompts, support disputes, and entitlement drift.
- **Files likely needing changes:** `apps/AudAix/src/lib/billing/plans.ts`, `apps/AudAix/src/workspace-plan.ts`, `apps/AudAix/src/lib/billing/entitlement-adapter.ts`, dashboard billing copy.
- **Current evidence from the audit:** The audit identifies AudAiX Starter public copy mapped to internal `pro` and local plan/price copy.
- **Exact intended behavior after fix:** AudAiX either uses Verixet plan labels directly or clearly treats local labels as internal technical tiers that are never shown as commercial offers.
- **Safe implementation steps:** Remove ambiguous Starter/pro public mapping, send checkout to Verixet, keep local caps only as implementation details, and add route proof that upgrade uses Verixet-owned authority.
- **Tests or proof commands to run:** `npm --prefix apps/AudAix run typecheck`; `npm --prefix apps/AudAix run verify:routes`; targeted billing/entitlement tests.
- **Rollback risk:** Low for copy; medium if checkout route behavior changes for existing links.
- **Fix type:** Copy/catalog guard plus API and test/proof.

#### P0-8: Admin and billing screens must distinguish local/cache state from Verixet authority

- **Problem:** Admin and billing screens can show local or cached plan state as if it is definitive billing truth.
- **User-facing risk:** Operators or users can make account decisions using stale or app-local state.
- **Revenue/payment risk:** Manual support actions can grant, revoke, or describe paid access incorrectly.
- **Files likely needing changes:** XFlow billing/account UI, Verixet dashboard billing UI, RatAiFy trust dashboard billing shell, AudAiX dashboard billing UI, WordGeni admin/billing UI, CreVux subscription catalog UI.
- **Current evidence from the audit:** The audit cites XFlow admin/user billing surfaces and satellite billing screens as separate from Verixet billing authority.
- **Exact intended behavior after fix:** Screens show Verixet-sourced billing state as authoritative; any local/cache state is labeled diagnostic or fallback and cannot drive payment actions.
- **Safe implementation steps:** Add source labels, remove authoritative language from local state, link operators to Verixet records, and prove payment/portal actions route through Verixet.
- **Tests or proof commands to run:** Relevant app UI tests and route proof scripts, XFlow and Verixet typechecks, `npm run proof:ecosystem:static`.
- **Rollback risk:** Low for labeling; medium if actions are rerouted.
- **Fix type:** Copy/UI guard plus API and test/proof.

## C. File-by-File Change Plan

### Verixet

`apps/Verixet/src/lib/billing/canonical-catalog.ts`

- Change: ensure public catalog consumers can reliably distinguish final vs review pricing. For rows with `pricing_status: "price_mismatch_review"`, either set `checkout_available: false` or expose an explicit non-final status for UI to block hard checkout CTAs.
- Must not change: canonical app slugs, active plan slugs, Stripe IDs, price IDs, or bundle grant semantics without a separate migration/reconciliation plan.

`apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`

- Change: propagate `pricing_status` into public view models and produce safe CTA labels for non-final rows, such as "Contact sales", "Manual review", or "Price under review".
- Must not change: internal canonical plan slugs should remain hidden from production public output where tests already require that.

`apps/Verixet/src/components/shared/pricing/PlanComparisonTabs.tsx`

- Change: render non-final plans as unavailable/manual-review, not as normal self-serve checkout cards.
- Must not change: tab structure or app/bundle grouping, except to prevent unsafe checkout/display claims.

`apps/Verixet/src/components/shared/pricing/CheckoutCTA.tsx`

- Change: refuse to build checkout payloads for non-final/non-checkoutable plans and display a safe manual-review CTA.
- Must not change: valid checkout payload shape for configured plans.

`apps/Verixet/src/app/api/billing/checkout/route.ts`

- Change: add or confirm server-side rejection of non-final `pricing_status` selections, not just UI hiding.
- Must not change: existing rate limiting, workspace role checks, same-site/cross-site mutation checks, or legacy normalization unless the legacy selection resolves to a non-final row.

### XFlow

`apps/XFlow/src/lib/billing/commercial-pricing.ts`

- Change: remove or soften hard claims for XFlow feature bullets not tied to Verixet-backed limits: "AI Context Engine", "Advanced exports", "Long retention", and high connected-app counts. Replace with "where enabled by your Verixet plan" or hide until claim tests exist.
- Change: hide credit top-up/public add-on claims or keep only the existing compatibility warning because `CREDIT_TOP_UP_MAPPING_NOTE` says explicit Verixet grant mappings are not published.
- Must not change: canonical plan slug imports or existing handoff URLs except to make Verixet authority clearer.

`apps/XFlow/src/app/api/billing/checkout/route.ts`

- Change: ensure checkout responses identify Verixet as source of truth unless explicitly running allowed local/dev mode.
- Change: reject local Stripe checkout in production if Verixet handoff is configured/required.
- Must not change: same-origin mutation guard or active workspace checks.

XFlow pricing/page CTA components using `commercialPricing`

- Change: update buttons and helper text to say checkout and plan changes are managed by Verixet.
- Must not change: app navigation or unrelated pricing layout.

### RatAiFy / Rataify

`apps/RatAiFy/src/lib/billing/plans.ts`

- Change: remove public package wording that represents the ecosystem as only `xflowx`, `verixet`, `audaix`, and `rataify` if it is labeled ecosystem. Either relabel it Main 4 or defer to Verixet's six-app catalog.
- Change: add a clear compatibility distinction between local `PlanSlug` aliases and Verixet canonical plan slugs.
- Must not change: route-enforced feature keys or credit costs unless paired with tests.

`apps/RatAiFy/shared/plans.ts`

- Change: remove or hide `founding` from public/self-serve marketing. If still needed for legacy accounts, mark as legacy alias for `rataify_pro`.
- Change: change `professional`/`Ecosystem Starter` copy so it does not imply all six apps unless sourced from Verixet.
- Must not change: existing free-tier caps unless implementing explicit P0 tightening with tests.

RatAiFy pricing/checkout/dashboard billing UI

- Change: show "managed by Verixet" and "local snapshot/cache" labels where local billing data is displayed.
- Must not change: authenticated site/workspace authorization logic.

### CreVux / Crevux

`apps/CreVux/artifacts/api-server/src/routes/billing.ts`

- Change: keep local billing explicitly legacy/dev-only. In production, checkout/top-up/portal actions must route to Verixet or return a safe unavailable/manual setup response.
- Must not change: `localBillingAllowed()` semantics except to make production safer.

`apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`

- Change: define a hard P0 policy for skipped admission. For provider-costing generation, missing token, missing ecosystem workspace, and Verixet 5xx should not silently allow paid work unless an explicitly documented free/local mode applies.
- Must not change: metadata sanitization or idempotency key construction.

Generation/video/image route callers

- Change: enforce the admission result. Treat `admitted: false` and `skipped: true` as "unavailable" for paid media routes in production.
- Must not change: local test/dev preview behavior unless it can create provider cost.

### WordGeni

`apps/WordGeni/apps/api/src/services/billing-entitlements.ts`

- Change: mark local Stripe/workspace plan entitlement as local cache/legacy unless Verixet billing is unavailable by documented local mode.
- Change: map local `pro/studio/enterprise` to Verixet public tiers for display and enforcement decisions.
- Must not change: past_due grace and cancellation fallback until Verixet equivalent behavior is confirmed.

`apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`

- Change: add a Verixet tier mapping layer before applying local caps.
- Must not change: actual cap numbers unless a Verixet canonical limit source is added in the same commit.

`apps/WordGeni/apps/api/src/services/stripe/*` and billing routes

- Change: label local Stripe webhook/reconciliation paths as legacy/cache or disable for ecosystem production authority.
- Must not change: webhook idempotency or existing tests without replacement.

### AudAiX

`apps/AudAix/src/lib/billing/plans.ts`

- Change: make public `audaix_starter/pro/elite` the only public names and keep internal `pro` alias hidden.
- Change: add comments or exported metadata that this catalog is a local enforcement fallback, not public commercial authority.
- Must not change: free caps or paid feature flags unless adding direct P0 safety tests.

`apps/AudAix/src/workspace-plan.ts`

- Change: ensure public copy and upgrade paths do not expose internal `pro` as "Starter" ambiguously.
- Must not change: `readNewWorkspacePlanTier()` defaults unless a migration is planned.

`apps/AudAix/src/lib/billing/entitlement-adapter.ts`

- Change: add stronger "Verixet snapshot unavailable" logging/status for production paid access so local fallback cannot look authoritative.
- Must not change: billing locked-state deny behavior.

### Admin/Billing Screens

XFlow, RatAiFy, AudAiX, WordGeni, and CreVux billing/account UI

- Change: distinguish "Verixet authoritative", "local cache", "legacy local billing", "unavailable", and "manual setup required".
- Must not change: unrelated account settings, workspace navigation, or admin permissions.

## D. Verixet Authority Cleanup Plan

Plan catalog:

- Verixet owns public plan and package catalog through `apps/Verixet/src/lib/billing/canonical-catalog.ts` and `apps/Verixet/src/lib/marketing/public-pricing-catalog.ts`.
- Satellites should not define public prices or public package membership. They may keep local fallback enforcement tables only if tests prove parity and UI labels them as cache/fallback.

Checkout:

- Verixet owns self-serve checkout through `apps/Verixet/src/app/api/billing/checkout/route.ts` and `/checkout/handoff`.
- XFlow and satellites should route upgrade CTAs to Verixet and avoid local Stripe checkout in production.

Billing status:

- Verixet owns billing status through `/api/billing/status` and ecosystem status routes defined in `ecosystem-contracts/routes.json`.
- Satellite billing screens should display local status as snapshot/cache with freshness, not final plan state.

Entitlement evaluation:

- Verixet owns entitlement evaluation through `/api/platform/v1/entitlements/evaluate`.
- Satellites should fail closed for paid work when Verixet entitlement is unavailable, except explicitly documented local/dev modes.

Usage ingest:

- Verixet owns usage ingest through `/api/ecosystem/usage/ingest`.
- Satellites should use app-scoped tokens and deterministic idempotency keys, and should not report raw secrets, prompts, Stripe IDs, or provider payloads.

Portal session:

- Verixet owns customer portal/session creation through `/api/platform/v1/billing/portal-session`.
- Satellite "manage billing" buttons should ask Verixet for a portal session or link to a Verixet billing dashboard fallback.

Stripe webhook ownership:

- Verixet owns ecosystem Stripe webhooks.
- Satellite Stripe webhooks should be legacy/local/cache-only until removed or formally delegated.

## E. Pricing Copy Truthfulness Plan

Remove, soften, hide, or mark as coming soon/manual setup:

- Verixet bundle plans with `pricing_status: "price_mismatch_review"`: mark "price under review" or disable self-serve checkout.
- XFlow "AI Context Engine": soften to "AI context features where enabled by your Verixet plan" until entitlement-backed.
- XFlow "Advanced exports": soften or hide until export gates and plan limits are proven.
- XFlow "Long retention" and high connected-app counts: soften unless backed by Verixet limit keys.
- XFlow credit top-ups: hide or mark compatibility-only until Verixet grant mappings are published.
- RatAiFy "Ecosystem Starter" if based on four-app local catalog: relabel Main 4 or defer to Verixet six-app catalog.
- RatAiFy `founding`: remove from public self-serve pricing; mark legacy alias if retained.
- WordGeni `studio`: do not market as a separate self-serve ecosystem tier unless mapped to Verixet `wordgeni_elite` or enterprise/manual setup.
- CreVux media top-ups: mark managed by Verixet/manual setup until add-on grant proof exists.
- Any satellite "checkout", "billing", or "subscription" copy: add "managed by Verixet" where users can pay or manage plans.

## F. Free-Tier Safeguard Plan

XFlow:

- Add or expose free caps for connected apps, event ingest, AI/Copilot usage, exports, and retention from Verixet canonical limits.
- Upgrade prompt: "Upgrade in Verixet to connect more apps or retain more history."

Verixet:

- Keep free baseline conservative: billing setup, read-only status, limited entitlement checks, no paid checkout claims without configured catalog.
- Add public unavailable states for non-final catalog rows.

AudAiX:

- Keep free caps already present: one workspace/user/site, 20 audits/month, 500 pages/month, no schedules.
- Tighten prompt copy around deep audits, recurring monitoring, AI remediation, webhooks, and report sharing.

RatAiFy:

- Keep one site, one scan/month, no AI enrichment by default, strict retention.
- Add hard upgrade prompts on assistant, reports, privacy/policy/copy/inbox modules, storage, and connected app verification.

WordGeni:

- Keep AI caps: monthly workspace tokens, daily user tokens, output token cap, and per-request cost cap.
- Add upgrade prompts when any AI budget limit is hit.
- Ensure local free cap enforcement cannot be bypassed by local plan display when Verixet says no-plan/free.

CreVux:

- Define a clear free media allowance and enforce it before provider-costing image/video work.
- Treat missing/unavailable Verixet usage admission as a hard unavailable state for production paid media routes.
- Upgrade prompt: "Upgrade or buy media credits in Verixet."

## G. Verification Plan

Run after P0 implementation:

Root:

- `npm run proof:billing-contracts`
- `npm run proof:ecosystem:static`
- `npm run validate:ecosystem-contracts`

Verixet:

- `npm --prefix apps/Verixet run typecheck`
- `npm --prefix apps/Verixet run test -- src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.ts src/app/api/billing/checkout/route.test.ts`
- `npm --prefix apps/Verixet run stripe:price-env:verify`

XFlow:

- `npm --prefix apps/XFlow run typecheck`
- Targeted commercial pricing/checkout tests if present; otherwise add them in the implementation commit.
- `npm --prefix apps/XFlow run verify:commercial-pack`

AudAiX:

- `npm --prefix apps/AudAix run typecheck`
- `npm --prefix apps/AudAix run verify:routes`
- Targeted billing/entitlement tests: `apps/AudAix/tests/billing-plans.test.ts`, `apps/AudAix/tests/pricing-contract.test.ts`, `apps/AudAix/tests/entitlement-adapter.test.ts`

RatAiFy:

- `npm --prefix apps/RatAiFy run typecheck`
- Targeted tests: `tests/billing-catalog.node.test.ts`, `tests/billing-checkout-product-catalog.node.test.ts`, `tests/billing-ui-wiring.node.test.ts`, `tests/rataify-entitlements.node.test.ts`

WordGeni:

- `pnpm typecheck`
- Targeted tests for `billing-entitlements`, `ai-usage-limits`, and Stripe plan mapping after pnpm preflight issue is resolved.

CreVux:

- `pnpm run typecheck`
- Targeted tests for `verixetUsageAdmission`, video credit policy, billing subscription catalog, and credit top-up wiring after pnpm preflight issue is resolved.

Hard end checks:

- `git diff -- docs/xflow-admin-surface-evidence-matrix.md`
- `git diff -- docs/subscription-tier-audit-roadmap.md`
- `git diff -- docs/subscription-tier-p0-fix-plan.md`
- `git status --short`

## H. Commit Plan

Commit 1: P0 plan doc only

- Add `docs/subscription-tier-p0-fix-plan.md`.
- No production code changes.

Commit 2: Verixet public pricing safety

- Block or label non-final public pricing rows.
- Add checkout server-side rejection for non-final plans.
- Add pricing catalog and checkout tests.

Commit 3: XFlow pricing and checkout handoff truthfulness

- Soften unsupported XFlow plan bullets.
- Hide compatibility-only top-up claims.
- Ensure CTAs and checkout route clearly defer to Verixet.

Commit 4: RatAiFy package truthfulness

- Remove public `founding`.
- Relabel four-app local package as Main 4 or defer to Verixet full ecosystem.
- Add catalog/UI tests.

Commit 5: Provider-cost paid work gates

- CreVux: block generation when Verixet admission is skipped/unavailable in production.
- WordGeni: map local plan concepts to Verixet tiers before paid AI access.
- AudAiX: strengthen unavailable Verixet snapshot behavior for paid actions.

Commit 6: Admin/billing display safety

- Label local/cache/legacy billing states across satellite billing/admin screens.
- Add UI tests for source-of-truth labels.

Commit 7: P0 proof cleanup

- Run root/app P0 verification commands.
- Fix only test/proof issues introduced by P0 changes.
- Do not include P1/P2/P3 polish.

## End Status Check

- Intended created file: `docs/subscription-tier-p0-fix-plan.md`.
- Do not stage or commit.
- Run `git status --short` after creating this file.
- Confirm the only intentional new file for this pass is `docs/subscription-tier-p0-fix-plan.md`.
