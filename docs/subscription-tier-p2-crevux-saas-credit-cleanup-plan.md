# P2 CreVux SaaS/Credit Cleanup Plan

## A. Executive Summary

Overall status: Partial. CreVux has the important P0/P1 safety boundaries in place, but it still has enough local SaaS, credit, media package, and upgrade display data to drift from Verixet commercial authority.

Current CreVux SaaS/credit/media-package status:

- CreVux keeps local persisted tiers and enforcement tiers in `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`: `free`, `pro`, `public_pro`, and `elite`.
- CreVux keeps local commercial display data in `CREVUX_PLAN_CATALOG`, `CREVUX_VERIXET_DISPLAY_PLANS`, `CREVUX_FREE_DISPLAY`, `CREVUX_TOP_UP_PACKS`, and `CREVUX_TOP_UP_DISPLAY`.
- CreVux billing routes in `apps/CreVux/artifacts/api-server/src/routes/billing.ts` defer checkout, top-up checkout, and portal actions to Verixet by default, but still return local display mirrors and keep local Stripe checkout paths behind the non-production `CREVUX_LOCAL_BILLING_ENABLED` flag.
- CreVux image-gen upgrade and landing surfaces still display local pricing, credit, and package copy through `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`, `apps/CreVux/artifacts/image-gen/src/lib/landingPricingTiers.ts`, and `apps/CreVux/artifacts/image-gen/src/pages/pricing.tsx`.
- CreVux media generation enforcement already uses Verixet usage admission through `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`, but local display copy can still imply local credit/package authority.

What P0/P1 already fixed:

- Local billing routes are no longer normal production payment authority. `localBillingAllowed()` in `apps/CreVux/artifacts/api-server/src/routes/billing.ts` allows local Stripe checkout only in non-production with `CREVUX_LOCAL_BILLING_ENABLED=true`.
- Subscription checkout, top-up checkout, and portal requests hand off to Verixet by default through `verixetCheckoutUrl()` and the billing route response metadata.
- Admin billing detail labels already identify CreVux rows as a local mirror and Verixet as billing, entitlement, and credit authority through `crevuxBillingMirrorDisplay()` in `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts` and `apps/CreVux/artifacts/api-server/src/routes/admin.ts`.
- Paid media generation has a P0 fail-closed path through `assertConfirmedVerixetCrevuxUsageAdmission()` in `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`.
- The public pricing page sends sanitized Verixet handoff intent fields through `checkoutPayload()` in `apps/CreVux/artifacts/image-gen/src/pages/pricing.tsx`.

Remaining structural drift:

- CreVux does not yet consume a CreVux-specific Verixet metadata slice. The generated catalog at `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json` has generic plans, top-ups, bundle membership, entitlement keys, checkout flags, and handoff fields, but no top-level `crevux` slice comparable to the RatAiFy, AudAiX, or WordGeni P2 metadata work.
- `CREVUX_TOP_UP_DISPLAY` currently maps local credit packs to Verixet AI action packs (`ai_builder`, `ai_power`, `ai_studio`) even though CreVux media generation uses media image/video credit types. Verixet already exports `media_starter`, `media_builder`, `media_pro`, and `media_studio`; this is the clearest display conflict.
- `CREVUX_PLAN_CATALOG` and `LANDING_PRICING_TIERS` still look like independent CreVux product authority instead of a Verixet-backed display adapter or fallback copy.
- `PlanUpgradePage.tsx` renders "One-time AI credit top-ups" while the Verixet media top-ups are media credit packs. That label should be realigned before launch.
- Local Stripe price env key mappings remain in compatibility code and must stay non-authoritative.

Recommended P2 implementation strategy:

1. Update Verixet first with a CreVux metadata slice that classifies SaaS tier aliases, bundle aliases, credit/top-up mappings, media units, manual/review states, deprecated packs, handoff labels, and usage admission metadata.
2. Add a CreVux display adapter that consumes that slice and classifies local constants as Verixet-backed, local mirror, fallback-only, legacy/manual setup, retired, or missing.
3. Clean the CreVux top-up/media display first, because the current AI-pack mapping is the highest user-facing drift.
4. Preserve enforcement and fail-closed usage admission behavior exactly; this is a display/authority cleanup, not a media entitlement rewrite.

CreVux should receive Verixet export additions before the main CreVux implementation. Without a CreVux-specific metadata slice, the adapter would have to re-encode classification rules locally and would recreate the same authority problem P2 is meant to remove.

## B. Current CreVux Inventory

Local SaaS tier constants:

- `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`
  - `CREVUX_TIER_KEYS`: `free`, `pro`, `public_pro`, `elite`.
  - `CrevuxCatalogTierKey`: excludes `public_pro`, which keeps catalog display on `free`, `pro`, and `elite`.
  - `CREVUX_PAID_TIER_KEYS`: `pro`, `elite`.
  - `CREVUX_PUBLIC_PLAN_TO_LOCAL_TIER`: maps Verixet public plan slugs to local enforcement/display tiers:
    - `crevux_starter`, `creator_starter`, `ecosystem_starter` -> `pro`
    - `crevux_pro`, `creator_pro`, `ecosystem_pro` -> `public_pro`
    - `crevux_elite`, `creator_elite`, `ecosystem_elite` -> `elite`
  - `localTierForCrevuxPublicPlanSlug()`: resolves public plan slugs and returns `null` for unknown slugs.
  - `getEffectiveEnforcementTier()`: derives local enforcement tier from internal role, active/trialing subscription state, and local persisted tier.

Local entitlement display labels:

- `SAAS_FEATURE_KEYS`, `tierAllowsFeature()`, `dailyRequestLimitForTier()`, and `perUserRatePerMinute()` define local enforcement gates for image, video, audio, 3D, copilot, studio, storyboard, and comic workflows.
- These are legitimate local enforcement constants, but they must not become commercial package authority.
- `CREVUX_VERIXET_DISPLAY_PLANS`, `CREVUX_FREE_DISPLAY`, `crevuxDisplayForLocalTier()`, `crevuxDisplayForPublicPlanSlug()`, and `crevuxBillingMirrorDisplay()` provide display labels and authority notes.

Credit/top-up/add-on definitions:

- `CREVUX_PLAN_CATALOG` includes local included-credit, price, feature, discount, and Stripe env-key metadata for `free`, `pro`, and `elite`.
- `CREVUX_PUBLIC_PRO_CREDITS_PER_PERIOD` defines 8,000 credits for the `public_pro` tier, but `public_pro` is not part of `CREVUX_PLAN_CATALOG`.
- `CREVUX_TOP_UP_PACKS` defines local legacy packs:
  - `credits_1000`, legacy key `1000`, 1,000 credits, $10, `STRIPE_TOPUP_PRICE_ID_1000`.
  - `credits_5000`, legacy key `5000`, 5,000 credits, $39, `STRIPE_TOPUP_PRICE_ID_5000`.
  - `credits_15000`, legacy key `10000`, 15,000 credits, $99, `STRIPE_TOPUP_PRICE_ID_10000`.
  - `credits_50000`, legacy key `50000`, 50,000 credits, $249, `STRIPE_TOPUP_PRICE_ID_50000`.
- `CREVUX_TOP_UP_DISPLAY` maps three local packs to Verixet AI action packs:
  - `credits_1000` -> `ai_builder`
  - `credits_5000` -> `ai_power`
  - `credits_15000` -> `ai_studio`
  - `credits_50000` -> fallback-only with no Verixet top-up slug
- This mapping should be treated as conflict/legacy until Verixet exports an explicit CreVux top-up classification. CreVux media usage expects media credit types, not AI action credit packs.

Media package labels:

- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts` maps CreVux usage to canonical usage keys:
  - image work -> `crevux.image_credit` and `media_image_credits`
  - video work -> `crevux.video_credit` and `media_advanced_video_credits`
- `CREVUX_TOP_UP_DISPLAY` currently labels local top-ups with Verixet entitlement keys such as `credits.ai_actions.balance`, which does not match the media credit admission path.
- `PlanUpgradePage.tsx` uses "One-time AI credit top-ups" copy even though CreVux paid provider/media work should be described as Verixet media credits/packages.

Image generation upgrade surfaces:

- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
  - Fetches `/billing/subscription-catalog` and `/billing/top-up-packs` through `fetchSubscriptionCatalog()` and `fetchTopUpPacks()`.
  - Renders local fallback tier cards with included credit text such as "4,000 credits per month" and "14,000 credits per month".
  - Starts checkout through `createBillingCheckoutSession()` using server-resolved tier and interval values.
  - Starts top-up checkout through `createTopUpCheckoutSession()` using server-returned pack ids.
  - Falls back to "Display fallback only" for free and "Managed through Verixet" for paid rows.
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.test.tsx` already covers Verixet authority labels, checkout handoff inputs, and fallback empty top-up state.

Landing pricing surfaces:

- `apps/CreVux/artifacts/image-gen/src/lib/landingPricingTiers.ts`
  - Defines local public pricing copy for `free`, `pro`, and `elite`.
  - Does not consume Verixet generated classifications.
  - Should become a Verixet-backed display adapter or explicitly fallback-only copy.
- `apps/CreVux/artifacts/image-gen/src/pages/pricing.tsx`
  - Uses `EcosystemPricingCatalog`.
  - Posts checkout handoff to `https://verixet.com/checkout/handoff`.
  - `checkoutPayload()` sends sanitized public intent fields and intentionally omits local `planSlug` fields.
- `apps/CreVux/artifacts/image-gen/src/pages/pricing.test.tsx` proves the six-app ecosystem display and sanitized Verixet handoff payload.

Admin billing mirror metadata:

- `apps/CreVux/artifacts/api-server/src/routes/admin.ts`
  - Adds `billing` metadata from `crevuxBillingMirrorDisplay()`.
  - Includes the note "Crevux admin billing rows are a local mirror only. Verixet is the billing, entitlement, and credit authority."
  - Still exposes raw local `subscriptionStatus`, `subscriptionTierKey`, and `aiCreditsBalance` in admin user rows, which is acceptable as operational state but not package authority.
- `apps/CreVux/artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts` covers admin billing source labels and authority notes.

Billing/credit route response metadata:

- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`
  - `GET /billing/subscription-catalog`: returns Verixet authority display rows by default and local Stripe data only when explicitly enabled for non-production.
  - `POST /billing/checkout-session`: defers to Verixet handoff URL by default.
  - `GET /billing/top-up-packs`: returns `authority: "verixet"` and local top-up display mirrors by default.
  - `POST /billing/top-up-checkout-session`: defers to Verixet handoff URL by default.
  - `POST /billing/portal-session`: defers to Verixet by default.
- Local Stripe checkout and top-up checkout code remains as compatibility/development-only behavior and must not be expanded.

Usage admission/fail-closed surfaces:

- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`
  - `assertVerixetCrevuxUsageAdmission()` calls Verixet usage admission for media work.
  - `assertConfirmedVerixetCrevuxUsageAdmission()` fail-closes paid media work when Verixet confirmation is not present.
  - `canonicalUsageKeyForFeature()` and `creditTypeForUsageKey()` keep image/video unit mapping local today.
- `apps/CreVux/artifacts/api-server/src/lib/saasMetering.admission-order.test.ts`, `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.test.ts`, and `apps/CreVux/artifacts/api-server/src/tests/saasEnforcement.integration.test.ts` are the key fail-closed and admission proof surfaces.

Tests/proofs covering the current safety boundaries:

- `apps/CreVux/lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`
  - Compares local plan display and top-up display against the Verixet generated catalog.
  - Currently proves the local AI top-up mapping because that is what `CREVUX_TOP_UP_DISPLAY` declares; this should be updated after Verixet exports CreVux media mapping classifications.
- `apps/CreVux/scripts/verify-crevux-local-proof.mjs`
  - Root local route/proof verifier.
- `apps/CreVux/artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts`
  - Admin billing truthfulness.
- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.test.ts`
  - Verixet usage admission, 402 handling, unavailable admission, and fail-closed paid media.
- `apps/CreVux/artifacts/api-server/src/lib/stripeSubscriptionTier.test.ts`
  - Legacy Stripe price metadata and env mapping compatibility.
- `apps/CreVux/artifacts/api-server/src/lib/stripePlanCreditFallback.test.ts`
  - Plan credit fallback behavior.
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.test.tsx`
  - Upgrade plan, catalog price, top-up, and checkout handoff behavior.
- `apps/CreVux/artifacts/image-gen/src/pages/pricing.test.tsx`
  - Public Verixet handoff payload and six-app pricing page display.
- `apps/CreVux/artifacts/image-gen/src/pages/AdminDashboardPage.test.tsx`
  - Admin UI surfaces.

## C. Verixet Authority Comparison

Verixet generated catalog evidence:

- `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json` has no top-level `crevux` metadata slice.
- CreVux public plan rows are present:
  - `crevux_starter`: public/self-serve, $29/month, $290/year.
  - `crevux_pro`: public/self-serve, $29/month, $278.40/year.
  - `crevux_elite`: public/self-serve, $79/month, $758.40/year.
- Creator bundle rows are present:
  - `creator_starter`: public/self-serve.
  - `creator_pro`: pricing under review/manual setup, public false, self-serve false.
  - `creator_elite`: public/self-serve.
- Ecosystem rows are present:
  - `ecosystem_starter`: public/self-serve.
  - `ecosystem_pro`: pricing under review/manual setup, public false, self-serve false.
  - `ecosystem_elite`: pricing under review/manual setup, public false, self-serve false.
- CreVux entitlement keys are present in plan/bundle rows:
  - `crevux.export_quality`
  - `crevux.image_credits_per_month`
  - `crevux.storage_gb`
  - `crevux.video_credits_per_month`
- CreVux free caps are present:
  - `image_credits_per_month: 50`
  - `video_credits_per_month: 0`
  - `generation_jobs_per_day: 3`
  - `concurrency: 1`
- Paid tier limits are present:
  - Starter: 1,000 image credits, 100 video credits, 10 GB storage, standard export quality.
  - Pro: 4,000 image credits, 400 video credits, 50 GB storage, advanced export quality.
  - Elite: 14,000 image credits, 1,400 video credits, 250 GB storage, priority export quality.
- Verixet media top-ups are present:
  - `media_starter`: 100 media image credits, $9, active/self-serve.
  - `media_builder`: 500 media image credits, $29, active/self-serve.
  - `media_pro`: 1,750 media image credits, $79, active/self-serve.
  - `media_studio`: 5,000 media image credits, $199, active/self-serve.
- Deprecated creative top-ups are present and non-self-serve:
  - `creative_250`
  - `creative_credits_1k`
- AI action top-ups are present but are not CreVux media credit packs:
  - `ai_builder`
  - `ai_power`
  - `ai_studio`

| CreVux local item | Verixet catalog match | Match quality | Current user-facing risk | Current payment risk | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `free` tier | Free caps for CreVux | Partial | Free copy may show local trial credit language not sourced from Verixet | Low, no paid checkout | Keep as free/default fallback only; consume Verixet free caps when exported in CreVux slice |
| `pro` local tier | `crevux_starter`, `creator_starter`, `ecosystem_starter` map to Starter-class access | Partial | Local "Pro" name can obscure Verixet Starter vs Pro public rows | Low if handoff stays Verixet | Classify as legacy/local mirror alias; display Verixet public row label where possible |
| `public_pro` local tier | `crevux_pro`, `creator_pro`, `ecosystem_pro` | Partial | Hidden local tier can make reviewed bundle rows look available if local display overrides Verixet | Medium if used to show checkout where Verixet says manual/review | Classify as Verixet-backed alias only when row is active/self-serve; manual setup otherwise |
| `elite` local tier | `crevux_elite`, `creator_elite`, `ecosystem_elite` | Partial | Ecosystem Elite is manual/review in Verixet but local Elite looks final | Medium if local display overrides bundle review state | Keep as local enforcement tier; display only Verixet row status |
| `CREVUX_PLAN_CATALOG.free` | Free caps and fallback plan | Partial | Local 150-credit trial copy differs from Verixet 50 image credit cap | Low | Keep fallback-only until Verixet CreVux slice resolves free trial/display values |
| `CREVUX_PLAN_CATALOG.pro` | `crevux_starter` and `crevux_pro` rows | Partial | Local Pro combines naming, price, credit, and env keys as if authoritative | Medium if local checkout flag is enabled outside intended dev use | Move display authority to Verixet adapter; keep env keys compatibility only |
| `CREVUX_PLAN_CATALOG.elite` | `crevux_elite` row | Partial | Local price mirrors Verixet today but can drift | Medium if local checkout flag is misused | Move display authority to Verixet adapter; keep local fallback only |
| `CREVUX_PUBLIC_PRO_CREDITS_PER_PERIOD` | Verixet Pro paid tier limit: 4,000 image and 400 video credits | Conflict | Local 8,000 generic credits conflicts with Verixet media-unit limits | Low for display if hidden; higher if surfaced | Move authority to Verixet export; retire or mark legacy compatibility |
| `CREVUX_VERIXET_DISPLAY_PLANS` single-app rows | Generated public plan rows | Exact/Partial | Mostly aligned, but local copy can drift | Low if verifier stays current | Replace with adapter over Verixet `crevux` slice |
| `CREVUX_VERIXET_DISPLAY_PLANS` creator/ecosystem review rows | Generated manual/review rows | Exact | Local copy correctly marks manual/review today | Low | Keep only as adapter result; local rows cannot override Verixet review state |
| `CREVUX_TOP_UP_PACKS.credits_1000` | No exact local 1,000 media pack; deprecated `creative_credits_1k`; active media packs are 100/500/1,750/5,000 | Legacy/Conflict | Displays 1,000 generic credits and can imply a current public offer | Medium | Mark legacy compatibility; map only through Verixet-defined CreVux top-up metadata |
| `CREVUX_TOP_UP_PACKS.credits_5000` | `media_studio` has 5,000 media credits at $199 | Partial/Conflict | Local $39/5,000 credits conflicts with Verixet $199 media studio pack | Medium | Retire from public display or mark legacy/manual until Verixet maps it |
| `CREVUX_TOP_UP_PACKS.credits_15000` | No active Verixet media equivalent | Missing/Conflict | Hard-sells a large pack absent from Verixet | Medium | Retire from public display; keep legacy compatibility only |
| `CREVUX_TOP_UP_PACKS.credits_50000` | No Verixet equivalent | Missing | Large fallback-only pack can look available if surfaced | Medium | Retire from public display; fallback/admin only if needed |
| `CREVUX_TOP_UP_DISPLAY -> ai_builder/ai_power/ai_studio` | Verixet AI action packs | Conflict | Media credit UI can advertise AI action packs | Medium | Replace with media pack metadata after Verixet export addition |
| `landingPricingTiers.ts` local price copy | Generated public pricing rows | Partial | Landing page can drift from Verixet prices and review states | Low to medium | Consume adapter or mark fallback-only |
| `PlanUpgradePage.tsx` "AI credit top-ups" | Verixet media top-ups | Conflict | Wrong unit language for CreVux media generation | Low to medium | Rename to media credit/top-up terminology from Verixet metadata |
| Admin billing mirror | Verixet authority notes | Partial | Raw local tier/status still visible, but note is truthful | Low | Keep mirror, add classification fields from adapter |
| Billing subscription catalog route | Verixet handoff and generated prices | Partial | Local fallback display rows can drift | Low if Verixet handoff remains | Return adapter-derived classifications and manual/review states |
| Usage admission image/video unit mapping | Verixet usage admission expectations | Partial | Local mapping is correct but not exported as CreVux metadata | Low for enforcement, medium for drift proof | Add usage metadata to Verixet export; keep enforcement behavior unchanged |
| Legacy Stripe env price mapping | Verixet Stripe price authority | Legacy | Env names can imply local payment authority | Low when local billing disabled | Mark non-authoritative compatibility only; no new price IDs |

## D. Cleanup Classification

Keep as Verixet-backed display adapter:

- Public plan display for `crevux_starter`, `crevux_pro`, `crevux_elite`, `creator_*`, and `ecosystem_*`.
- Checkout handoff labels and CTA labels.
- Active media top-up display after Verixet exports CreVux top-up classifications.
- Bundle membership and six-app ecosystem labels.
- Manual setup/review states for `creator_pro`, `ecosystem_pro`, and `ecosystem_elite`.

Keep as free/default fallback only:

- Local `free` tier.
- `CREVUX_FREE_DISPLAY`.
- Minimal offline/free display copy in `PlanUpgradePage.tsx` when Verixet catalog is unavailable.
- Free enforcement gates in `tierAllowsFeature()`, `dailyRequestLimitForTier()`, and `perUserRatePerMinute()`.

Keep as local mirror only:

- Admin display returned by `crevuxBillingMirrorDisplay()`.
- Local persisted user fields such as `subscriptionTierKey`, `subscriptionStatus`, and `aiCreditsBalance`.
- Billing route display rows when they are explicitly marked as Verixet mirrors and sourced from the adapter.

Mark legacy/manual setup:

- Local Stripe env mappings in `CREVUX_PLAN_CATALOG` and `planPriceEnvKey()`.
- `stripeSubscriptionTier.ts` compatibility mapping from Stripe metadata/env price ids to local tiers.
- `public_pro` as a local compatibility tier rather than a public package.
- Deprecated Verixet creative credit packs: `creative_250` and `creative_credits_1k`.

Retire from public display:

- `credits_15000` and `credits_50000` unless Verixet explicitly exports active CreVux media mappings for them.
- Any local top-up price or credit quantity that conflicts with active Verixet media packs.
- "AI credit top-ups" wording for CreVux media package purchase surfaces.

Move authority to Verixet export:

- CreVux SaaS tier alias classification.
- CreVux top-up/media pack mapping.
- Media unit labels and entitlement balance keys.
- App-specific CTA labels and authority labels.
- Bundle membership labels.
- Manual/review reasons and public/self-serve flags.
- Usage admission metadata for image/video credit types.

Needs new Verixet catalog field before cleanup:

- Top-level `crevux` metadata slice.
- Local tier alias classification for `free`, `pro`, `public_pro`, and `elite`.
- Local top-up compatibility mapping for `credits_1000`, `credits_5000`, `credits_15000`, and `credits_50000`.
- Media unit labels for `media_image_credits` and `media_advanced_video_credits`.
- Deprecated/fallback/legacy flags for local credit packs.
- Handoff URL intent metadata for plan and top-up flows.

Needs test/proof only:

- Admin mirror truthfulness once classification fields are added.
- P0 fail-closed usage admission behavior.
- P1 Verixet checkout handoff behavior.
- Non-production-only local billing guard.
- Public pricing handoff payload sanitization.

## E. Verixet Export Gaps

The generated Verixet catalog already has enough generic information to prevent hard payment drift: plan pricing, checkout availability, manual/review status, public/self-serve flags, bundle membership, entitlement keys, free caps, paid tier limits, and top-ups.

It does not yet have enough CreVux-specific metadata to safely remove local authority assumptions from CreVux. The missing piece is a top-level CreVux slice that tells CreVux how to classify its existing local aliases and fallback rows without re-encoding those classifications locally.

Recommended new Verixet export fields:

- `crevux.tierAliases`
  - `free`: fallback-only/default.
  - `pro`: local mirror/legacy alias for starter-class access.
  - `public_pro`: local compatibility alias for Verixet Pro rows.
  - `elite`: local enforcement tier mapped to active single-app Elite and reviewed bundle Elite states.
- `crevux.publicPlanAliases`
  - Maps `crevux_starter`, `crevux_pro`, `crevux_elite`, `creator_starter`, `creator_pro`, `creator_elite`, `ecosystem_starter`, `ecosystem_pro`, and `ecosystem_elite` to local tier aliases and Verixet status.
- `crevux.topUpAliases`
  - Classifies `credits_1000`, `credits_5000`, `credits_15000`, and `credits_50000` as active media mapping, legacy compatibility, fallback-only, retired, or missing.
  - Should prefer active Verixet `media_*` packs over AI action packs for CreVux media generation.
- `crevux.mediaUnits`
  - `media_image_credits`
  - `media_advanced_video_credits`
  - `storage_gb`
  - `export_quality`
- `crevux.usageAdmission`
  - `crevux.image_credit` -> `media_image_credits`.
  - `crevux.video_credit` -> `media_advanced_video_credits`.
  - Default CTA labels for upgrade and top-up blocked states.
- `crevux.displayLabels`
  - App-specific CTA labels.
  - Fallback/free labels.
  - Manual setup labels.
  - Reviewed/pricing-under-review reason labels.
- `crevux.handoff`
  - Plan checkout handoff intent fields.
  - Top-up checkout handoff intent fields.
  - Portal handoff metadata.
- `crevux.legacyStripeCompatibility`
  - Marks local Stripe env mappings and old price ids as non-authoritative compatibility only.

Recommendation: update Verixet export first. Handling these classifications only inside CreVux would make CreVux local constants look authoritative again and would repeat the exact drift pattern fixed for RatAiFy, AudAiX, and WordGeni.

## F. CreVux Implementation Plan

### 1. Verixet export additions for CreVux SaaS/credit/media metadata

Files likely touched:

- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.ts`
- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.test.ts`
- `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`

Exact behavior change:

- Add a top-level `crevux` metadata slice.
- Export local tier alias classification, public plan alias mapping, media unit labels, top-up classifications, usage admission metadata, handoff labels, manual/review reasons, and legacy Stripe compatibility flags.
- Keep existing generated artifact fields backward-compatible.

Tests to add/update:

- Verixet generated catalog tests for the new `crevux` slice.
- Tests proving active configured rows remain active/self-serve and reviewed/manual rows remain non-self-serve.
- Tests proving CreVux top-ups are media credit mappings or explicitly legacy/fallback/missing, not invented payment authority.

Rollback risk:

- Low. This is metadata-only if existing generated fields remain unchanged.

What must not change:

- Checkout behavior.
- Stripe webhook logic.
- Stripe price IDs/live payment config.
- Schemas or migrations.
- Entitlement enforcement.
- Usage admission enforcement.
- Dependency files.

### 2. CreVux SaaS tier adapter cleanup

Files likely touched:

- `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`
- `apps/CreVux/lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`
- Tests under `apps/CreVux/lib/saas-entitlements` and `apps/CreVux/artifacts/api-server/src/lib`

Exact behavior change:

- Add a Verixet-backed display adapter that consumes the new `crevux` metadata slice.
- Classify `free`, `pro`, `public_pro`, and `elite` as fallback/local mirror/legacy/Verixet-backed as appropriate.
- Preserve local enforcement tier behavior and persisted tier compatibility.

Tests to add/update:

- `pnpm --filter @workspace/saas-entitlements run test`
- Focused tests for `localTierForCrevuxPublicPlanSlug()`, `crevuxDisplayForLocalTier()`, and manual/review behavior.

Rollback risk:

- Medium. This file mixes enforcement and display authority, so adapter extraction must stay narrow.

What must not change:

- `tierAllowsFeature()`.
- `dailyRequestLimitForTier()`.
- `perUserRatePerMinute()`.
- `getEffectiveEnforcementTier()` behavior.
- Fail-closed behavior for unknown public slugs.

### 3. CreVux credit/top-up display cleanup

Files likely touched:

- `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`
- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`
- `apps/CreVux/artifacts/api-server/scripts/verify-credit-topup-wiring.ts`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.test.tsx`

Exact behavior change:

- Replace AI action top-up display mappings with Verixet CreVux media top-up classifications.
- Mark old local packs as legacy/fallback/missing/retired where appropriate.
- Stop hard-selling fallback-only or missing local packs as public final offers.
- Rename UI language from generic/AI top-ups to Verixet media credit/package language.

Tests to add/update:

- Top-up route tests or verifier coverage for returned `topUpPackSlug`, authority label, and fallback/retired states.
- `PlanUpgradePage.test.tsx` for media credit labels and non-display of missing/retired packs.
- `verify-saas-entitlements-policy.ts` to prove top-up classifications come from Verixet metadata.

Rollback risk:

- Medium. This is the most visible user-facing cleanup and can affect upgrade UI copy.

What must not change:

- Top-up checkout handoff behavior.
- Stripe top-up price ids.
- Local billing guard.
- Actual media credit enforcement.

### 4. CreVux media/package display cleanup

Files likely touched:

- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.ts`
- `apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.test.ts`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
- Any media package label helper introduced by commit 2 or 3.

Exact behavior change:

- Align media package display labels to Verixet unit labels.
- Keep local usage admission mapping behavior intact unless the new Verixet slice can be consumed as read-only metadata without changing enforcement.
- Ensure blocked/upgraded CTA text points to Verixet.

Tests to add/update:

- `verixetUsageAdmission.test.ts`.
- `saasMetering.admission-order.test.ts`.
- UI tests for media package labels.

Rollback risk:

- Medium if enforcement imports are touched; low if display-only.

What must not change:

- `assertConfirmedVerixetCrevuxUsageAdmission()` fail-closed semantics.
- Provider/media generation admission order.
- Credit spend/refund behavior.

### 5. CreVux admin billing mirror and upgrade CTA cleanup

Files likely touched:

- `apps/CreVux/artifacts/api-server/src/routes/admin.ts`
- `apps/CreVux/artifacts/api-server/src/routes/admin.billing-truthfulness.test.ts`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/AdminDashboardPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/AdminDashboardPage.test.tsx`

Exact behavior change:

- Add explicit classification metadata to admin billing mirror responses.
- Ensure admin UI and upgrade UI cannot present local rows as final billing authority.
- Ensure manual/review states from Verixet are visible and cannot be overridden by local tier rows.

Tests to add/update:

- Admin billing truthfulness tests.
- Admin dashboard tests.
- Plan upgrade tests.

Rollback risk:

- Low to medium. Mostly label/metadata changes.

What must not change:

- Admin auth/authorization.
- User mutation behavior.
- Billing portal handoff behavior.

### 6. CreVux tests/proofs for SaaS/credit/media drift prevention

Files likely touched:

- `apps/CreVux/lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`
- `apps/CreVux/scripts/verify-crevux-local-proof.mjs`
- Focused API and image-gen tests listed in section G.

Exact behavior change:

- Add proof checks that local display rows cannot override Verixet authority.
- Add proof checks that top-ups classified fallback/missing/retired are not public final offers.
- Add proof checks that manual/review Verixet states stay non-self-serve.

Tests to add/update:

- The verifier scripts themselves.
- Focused tests for pricing, upgrade, admin, billing route, and usage admission.

Rollback risk:

- Low. Test/proof only.

What must not change:

- Production code outside the behavior already covered by commits 2-5.

### 7. Remove or quarantine legacy local constants only after tests prove no active surface uses them as authority

Files likely touched:

- `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`
- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`
- `apps/CreVux/artifacts/api-server/src/lib/stripeSubscriptionTier.ts`
- `apps/CreVux/artifacts/image-gen/src/lib/landingPricingTiers.ts`

Exact behavior change:

- Quarantine legacy constants behind `legacyCompatibility` names or remove them if unused.
- Keep only fallback/default constants needed for offline/free display and DB/API compatibility.

Tests to add/update:

- Full focused P2 proof set from section G.
- Specific tests proving no public UI imports legacy constants as authority.

Rollback risk:

- Medium to high. This should be the last cleanup commit only after adapter/proof coverage is strong.

What must not change:

- Persisted tier compatibility.
- Stripe metadata compatibility.
- Enforcement behavior.
- Local fallback safety.

## G. Test/Proof Plan

Run these during implementation from `apps/CreVux` unless a command includes an explicit `--prefix` or `--filter`.

SaaS entitlement policy verifier:

```powershell
pnpm --filter @workspace/saas-entitlements run test
```

Direct SaaS-entitlements typecheck:

```powershell
pnpm --filter @workspace/saas-entitlements run typecheck
```

Focused CreVux admin billing truthfulness tests:

```powershell
pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts
```

Paid media admission/fail-closed tests:

```powershell
pnpm --filter @workspace/api-server exec vitest run src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts
```

Stripe compatibility and fallback tests:

```powershell
pnpm --filter @workspace/api-server exec vitest run src/lib/stripeSubscriptionTier.test.ts src/lib/stripePlanCreditFallback.test.ts
```

Image-gen upgrade/pricing tests:

```powershell
pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx src/pages/AdminDashboardPage.test.tsx
```

Direct API-server typecheck:

```powershell
pnpm --filter @workspace/api-server run typecheck
```

Direct image-gen typecheck:

```powershell
pnpm --filter @workspace/image-gen run typecheck
```

CreVux local proof verifier:

```powershell
node scripts/verify-crevux-local-proof.mjs
```

Billing route/top-up verifier after top-up cleanup:

```powershell
pnpm --filter @workspace/api-server exec tsx ./scripts/verify-credit-topup-wiring.ts
node artifacts/api-server/scripts/verify-billing-subscription-catalog-route.mjs
node artifacts/api-server/scripts/verify-billing-portal-route.mjs
```

Broad top-level commands:

- `pnpm run typecheck` and broad `pnpm run test` are useful later, but they may still hit workspace dependency-layout or non-TTY pnpm module purge prompts in this environment.
- Do not force a module purge, rebuild native dependencies, or run installs as part of this P2 cleanup. Record dependency-layout blockers separately if focused commands cannot run safely.

## H. Launch Safety Rules

- CreVux cannot hard-sell packages, credits, top-ups, or bundles that are missing from Verixet.
- CreVux cannot override Verixet reviewed/manual/pricing-under-review state with local tier or top-up rows.
- CreVux cannot treat `CREVUX_PLAN_CATALOG`, `CREVUX_TOP_UP_PACKS`, landing pricing copy, or admin billing rows as billing authority.
- CreVux cannot create new Stripe authority, new live price IDs, new checkout behavior, or new webhook behavior.
- CreVux cannot unlock paid provider/media work from local fallback data.
- CreVux must preserve free/default safe fallback behavior.
- CreVux must preserve P0 fail-closed Verixet usage admission for paid media/provider work.
- CreVux must preserve P1 display truthfulness: Verixet is billing, entitlement, credit, package, and checkout authority.
- CreVux local Stripe compatibility paths must remain non-production/development-only and guarded by `CREVUX_LOCAL_BILLING_ENABLED`.
- Fallback/local mirror rows must be visibly classified and must not show final purchase CTAs unless Verixet marks the row active and self-serve.

## I. Open Questions

1. Should CreVux keep any standalone SaaS tier model?

Yes, but only for local enforcement, persisted user compatibility, and free/default fallback. The standalone model should not be commercial authority. Public package naming, pricing, availability, bundle membership, and top-up availability should come from Verixet.

2. Should CreVux credits/top-ups be app-specific or Verixet-global?

They should be Verixet-authoritative and app-classified. CreVux can display CreVux-facing media packs, but the pack definitions, active/deprecated state, unit labels, and payment authority should live in Verixet. CreVux should not map media generation to generic AI action top-ups unless Verixet explicitly classifies that as intended.

3. Should media package units live in Verixet?

Yes. Verixet should export media image credit, advanced video credit, storage, export quality, and usage admission labels so CreVux does not independently define the commercial meaning of media packages.

4. Which CreVux local constants can be retired first?

The safest first retirement targets are public display uses of `CREVUX_TOP_UP_DISPLAY` entries that point to AI packs and any UI copy that hard-sells `credits_15000` or `credits_50000`. Full constant removal should wait until Verixet exports CreVux top-up classifications and tests prove no active surface uses the old rows as authority.

5. Which local constants must stay for offline/free/default fallback?

Keep `CREVUX_TIER_KEYS`, local enforcement feature/rate constants, `free` fallback display, persisted tier compatibility, and fail-closed usage admission mappings. Keep legacy Stripe env compatibility until all historic Stripe metadata/price-id reconciliation is proven unnecessary.

6. Does Verixet export need a CreVux slice before implementation?

Yes. A CreVux slice is the safest way to avoid recreating authority inside CreVux. The slice should classify local tier aliases, public plan aliases, top-ups, media units, usage admission metadata, handoff labels, manual/review states, and legacy Stripe compatibility.

7. What is the safest first implementation commit?

A Verixet-only metadata export commit that adds top-level `crevux` metadata to the generated catalog without changing checkout, Stripe, schemas, migrations, entitlement enforcement, usage admission enforcement, dependency files, or satellite app behavior.

## J. Final Recommendation

1. Is CreVux ready for P2 implementation?

CreVux is ready for P2 planning and scoped implementation, but the first implementation commit should be in Verixet, not CreVux. CreVux should not begin adapter cleanup until the generated catalog has a CreVux-specific metadata slice.

2. What should be implemented first?

Implement a Verixet-only CreVux metadata export addition. It should classify CreVux tier aliases, public plan aliases, media top-ups, deprecated/fallback packs, media units, usage admission metadata, handoff labels, manual/review states, and legacy Stripe compatibility.

3. Which file is the highest-risk source of remaining drift?

`apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts` is the highest-risk file because it currently combines enforcement logic, local SaaS plan display, local Stripe env compatibility, Verixet display mirrors, public plan alias mapping, and top-up display mapping.

4. Which tests should block the implementation commit?

The blocking focused checks should be:

```powershell
pnpm --filter @workspace/saas-entitlements run test
pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts
pnpm --filter @workspace/api-server exec vitest run src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts
pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx src/pages/AdminDashboardPage.test.tsx
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/image-gen run typecheck
node scripts/verify-crevux-local-proof.mjs
```

If dependency-layout issues or non-TTY pnpm module purge prompts block any command, record them as environment blockers and do not install, purge, or rebuild during the P2 cleanup.

5. What exact next implementation prompt should be used?

```text
Review and commit the Verixet-only CreVux metadata export additions.

Dirty repo:

* apps/Verixet

Purpose:
Extend the Verixet generated catalog artifact with CreVux-facing SaaS tier alias, media credit unit, top-up/package, handoff, usage admission, fallback, manual/review, and legacy Stripe compatibility metadata so CreVux can later clean up local SaaS/credit/media display without treating local constants as authority.

Do not touch CreVux or any other satellite app.
Do not stage or commit root package.json.
Do not stage unrelated docs/scripts.
Do not clean or revert the worktree.
Do not run dependency installs.

Review phase:

1. Run root git status --short.
2. In apps/Verixet, run git status --short and git diff --name-only.
3. Inspect the diff and confirm only the generated catalog export implementation, its tests, and generated catalog JSON changed.
4. Confirm:
   * A new top-level crevux metadata slice exists.
   * Existing artifact fields remain backward-compatible.
   * Existing rataify, audaix, and wordgeni metadata remain intact.
   * CreVux free/pro/public_pro/elite aliases are classified as fallback, local mirror, legacy, or Verixet-backed as appropriate.
   * CreVux active public rows remain active/self-serve where Verixet says so.
   * Reviewed/manual rows remain non-self-serve and cannot be overridden by CreVux local aliases.
   * CreVux media top-ups are classified using Verixet media package authority, not AI action pack authority unless explicitly marked compatibility.
   * Deprecated/fallback/missing local packs are not exported as public final offers.
   * Usage admission metadata for image/video media units is present.
   * No checkout behavior changed.
   * No Stripe webhook logic changed.
   * No Stripe price IDs/live payment config changed.
   * No schemas or migrations changed.
   * No entitlement enforcement or usage admission enforcement changed.
   * No dependency files changed.
   * No satellite apps changed.

Verification phase:

In apps/Verixet, run:

* npm run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts
* npm run typecheck
* npm run stripe:price-env:verify

Commit phase:

In apps/Verixet, stage only the generated catalog export implementation, its test, and generated catalog JSON. Run git diff --cached --name-only and confirm only those files are staged.

Commit message:

Extend Verixet catalog export for CreVux metadata

Final report:

* Commit hash
* Files included
* Verification results
* Remaining root dirty files
* Confirmation all satellite repos stayed clean
* Confirmation no schemas, migrations, Stripe webhook logic, Stripe price IDs, checkout behavior, entitlement architecture, usage admission enforcement, dependency files, or package architecture changed

Hard rule:
If any unexpected file appears staged, stop, unstage it, and report before committing.
```
