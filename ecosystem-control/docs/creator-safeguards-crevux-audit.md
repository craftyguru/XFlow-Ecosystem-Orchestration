# Creator Safeguards: Crevux Audit

Date: 2026-05-04

## Scope

Repository audited: `apps/CreVux`

Focused paths:

- `lib/saas-entitlements/src/saasEntitlements.ts`
- `lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`
- `artifacts/api-server/src/lib/saasMetering.ts`
- `artifacts/api-server/src/routes/openai/generateImage.ts`
- `artifacts/api-server/src/routes/video.ts`
- `artifacts/api-server/src/routes/sourceEnhance.ts`
- `artifacts/api-server/src/routes/images.ts`
- `artifacts/api-server/src/routes/assetExports.ts`
- `artifacts/api-server/src/routes/integrations/wordgeni.ts`

## Current Local Tiers

- `free`
- `pro`
- `elite`

Effective tier resolution:

- `getEffectiveEnforcementTier(...)` treats inactive, canceled, unknown, or non-trialing subscriptions as `free`.
- Internal trusted roles are treated as `elite` for operations.

## Current Credit / Cap Policy

Local catalog:

- `free`: 150 starter credits, 25 image/prompt requests per day, video locked.
- `pro`: $29/mo local catalog, 4,000 credits per period, 400 image/prompt requests per day, 80 video/lipsync/extend requests per day.
- `elite`: $79/mo local catalog, 14,000 credits per period, 5,000 image/prompt requests per day, 500 video/lipsync/extend requests per day.

Public pricing note:

- Public Crevux Starter is $29/mo, which maps most closely to local `pro`.
- Public Crevux Pro has no distinct local tier equivalent yet.
- Public Crevux Elite maps most closely to local `elite`.

## Server-Side Gates Found

- Image generation: `POST /api/openai/generate-image` calls `consumeMeteredSaasSlot(...)` with `openai_generate_image` and calculated image credits before provider image generation.
- Video generation: `POST /api/video/generate` calls `enforceSaasTierAndUserRateOnly(...)` with `video_generate`, then debits upfront video credits with `debitVideoCreditsForParentJob(...)` before provider submission.
- Video prompt enhancement: optional OpenAI prompt enhancement inside `POST /api/video/generate` now runs after the existing `video_generate` SaaS admission check.
- Source enhance: `POST /api/source-enhance/jobs` calls `enforceSaasTierAndUserRateOnly(...)` and debits credits through source-enhance credit helpers.
- Image edit/restore: `artifacts/api-server/src/routes/images.ts` uses `tryConsumeMeteredOrRespond(...)`.
- Asset export: `artifacts/api-server/src/routes/assetExports.ts` performs export preflight and credit debit before queued/export work.
- WordGeni integration: `artifacts/api-server/src/routes/integrations/wordgeni.ts` calls cross-app entitlements and reserves visual companion credits.
- TTS preview: `POST /api/internal/video/tts/preview` now calls `tryConsumeMeteredOrRespond(...)` with `audio_generate_voice` before OpenAI TTS preview work and refunds debited credits on provider/tool failure.
- Video planning: `POST /api/internal/video/plan` now calls `tryConsumeMeteredOrRespond(...)` with `video_generate` and `creditCost: 0` before the OpenAI video planning runner. This enforces the existing tier/rate/daily policy without inventing a separate planning credit amount.

## Client-Only or Copy-Only Gates Found

- Public Crevux pricing page remains conservative where public Starter / Pro / Elite mapping does not exactly match local `free/pro/elite`.
- Export quality controls are visible in client UI, but final public tier mapping for 1080p/4K/8K needs a separate pricing-content pass.

## Missing Fail-Closed Checks

- Verixet public plan slugs are not yet the direct runtime tier source in Crevux.
- Public `crevux_pro` has no distinct local tier equivalent.
- Creator and Ecosystem bundle expansion needs a Verixet-to-Crevux entitlement sync layer before confidence can be high.
- `POST /api/video/generate` gates optional AI prompt enhancement before provider work using existing `openai_create_prompt_fix` metered admission with `creditCost: 0`. The existing upfront video credit debit still happens later, immediately before job row creation and video provider submission. This preserves current behavior and avoids inventing a separate prompt-enhancement credit policy.

## Existing Verixet/XFlow Integration Points

- Crevux has local Stripe/subscription tier resolution and local SaaS entitlement policy.
- Cross-app WordGeni Visual Companion route uses `getCrossAppEntitlements(...)`.
- No direct canonical Verixet entitlement resolver was found for normal local image/video generation paths.

## Phase 1 Safeguards Added

- Production Crevux enforcement now includes zero-credit metered admission before optional video prompt enhancement, using the existing `openai_create_prompt_fix` policy.
- Added policy verification coverage for image generation and video generation tier/day-limit behavior in `lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`.

## Proposed Starter / Pro / Elite Mapping

- Public Starter: local `pro` equivalent; enforce_now for image/video/source-enhance/edit paths once Verixet maps `crevux_starter` and `creator_starter` to local `pro`.
- Public Pro: review_required because no distinct local tier exists.
- Public Elite: local `elite` equivalent; enforce_now for high-ceiling and elite-only studio/export features once Verixet maps public elite plans to local `elite`.

Confidence improves for core cost-bearing gates, but public tier confidence remains medium-low until Verixet plan slugs are synchronized into Crevux local tier state.
