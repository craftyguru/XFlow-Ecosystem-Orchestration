# Final Safeguard Gap Report

## Creator Safeguards Phase 1 Addendum

Date: 2026-05-04

WordGeni:

- Fixed: `/api/ai/edit` now requires active paid WordGeni entitlement before provider execution.
- Fixed: `/api/integrations/crevux/send-to-storyboard` now requires active paid WordGeni entitlement before visual companion handoff.
- Already present: `/api/integrations/crevux/generate-from-selection` requires active paid WordGeni entitlement and Crevux/cross-app visual entitlement.
- Superseded by the gap-closure addendum below: remaining provider-backed routes and Verixet public plan slug mapping were closed later in this pass.
- Fixed: WordGeni Balanced source memory, export, and active-project limits are now tier-specific and server-enforced.

Crevux:

- Already present: image generation, video generation, source enhance, image edit/restore, asset export, and WordGeni visual companion routes have server-side tier, credit, or entitlement gates.
- Verified: local SaaS policy now explicitly tests image generation and video generation tier/day-limit behavior.
- Superseded by the gap-closure addendum below: Verixet public plan slug mapping, TTS preview admission, video prompt enhancement ordering, and video planning admission were closed later in this pass.
- Fixed: public Crevux Pro now maps to `public_pro`, which has higher runtime daily caps than public Starter/local Pro.
- Fixed: public Crevux Pro invoice credit fallback now grants 8,000 credits from public Pro plan slug metadata when explicit credit metadata is absent.
- Fixed: public Crevux Pro now maps to a distinct internal export policy with 4K max video resolution while keeping Elite-only commercial/highest export policy separate.
- Fixed: Crevux now has conservative tier-specific storage caps on project creation, asset upload, and audio upload, with subtle next-tier upgrade hints in error payloads.
- Remaining review gap: generated image rows now store `size_bytes`; 3D provider media bytes are probed or conservatively estimated into tracked media storage.

Creator Bundle confidence:

- Increased for core cost-bearing safeguards.
- Still partial for public tier differentiation where no distinct local policy exists.

## Creator Safeguards Gap Closure Addendum

Date: 2026-05-04

WordGeni:

- Fixed: `/api/ai/touchup-prompt` now requires paid WordGeni entitlement before prompt rewrite provider execution.
- Fixed: `/api/ai/random-onboarding-seed` now requires paid WordGeni entitlement before onboarding seed generation.
- Fixed: `/api/ai/verify` now requires paid WordGeni entitlement before extraction and judge model calls.
- Fixed: `/api/ai/collaborate` now requires paid WordGeni entitlement before collaborative drafting.
- Fixed: `/api/ai/simulate` now requires paid WordGeni entitlement before simulation generation.
- Fixed: `/api/ai/publish-package` now requires paid WordGeni entitlement before package generation.
- Fixed: `/api/ai/tasks` now requires paid WordGeni entitlement before draft task enqueue.
- Fixed: `/api/genie/suggestions` and `/api/genie/chat` now require paid WordGeni entitlement before provider-backed Genie work.
- Fixed: `/api/voice-draft/transcribe` and `/api/voice-draft/structure` now require paid WordGeni entitlement before OpenAI transcription or structure generation.
- Fixed: `/api/exports` now requires paid WordGeni entitlement before export rendering or export row persistence.
- Fixed: `/api/integrations/cursor/v1/exports` now requires paid WordGeni entitlement before export rendering or export row persistence.
- Fixed: `/api/workspace/memory-hub/update` now requires paid WordGeni entitlement before shared memory persistence.
- Fixed: Verixet public WordGeni, Creator, and Ecosystem plan slugs now resolve to local `pro/studio/enterprise` tiers from Stripe Price metadata during subscription sync.
- Verified: WordGeni Starter / Pro / Elite now have documented, executable tier differences for AI token budgets, Voice Draft transcription seconds, Geni realtime session starts, and Cursor draft task concurrency after public slugs resolve to local tiers.
- Fixed: tier-differentiated source memory and export limits are now enforced through the Balanced creator policy.
- Fixed: active project caps are now enforced through the Balanced creator policy.

Crevux:

- Fixed: added public Verixet plan slug mapping into local Crevux enforcement tiers.
- Fixed: Stripe subscription tier resolution now recognizes `plan_slug`, `public_plan_slug`, `verixet_plan_slug`, and `app_plan_slug` metadata on Stripe Price objects.
- Fixed: unknown public slugs still fail closed to local `free`.
- Fixed: `/api/internal/video/tts/preview` now uses existing `audio_generate_voice` metered admission before OpenAI TTS preview work and refunds debited credits on provider/tool failure.
- Fixed: `POST /api/video/generate` now runs existing `video_generate` SaaS admission before optional OpenAI prompt enhancement.
- Fixed: optional `POST /api/video/generate` prompt enhancement now runs existing `openai_create_prompt_fix` metered admission with `creditCost: 0` before OpenAI prompt enhancement work.
- Fixed: `/api/internal/video/plan` now runs existing `video_generate` SaaS admission with `creditCost: 0` before OpenAI video planning.
- Verified: Crevux asset export preflight, quality/resolution limits, credit estimates, credit debit, daily caps, and concurrent caps are server-side.
- Fixed: public Crevux Pro now resolves to `public_pro` for `crevux_pro`, `creator_pro`, and `ecosystem_pro`, with higher runtime daily caps than public Starter/local Pro.
- Fixed: public Crevux Pro invoice credit fallback now grants 8,000 credits from public Pro plan slug metadata when explicit credit metadata is absent.
- Fixed: public Crevux Pro now maps to a distinct internal export policy with 4K max video resolution while keeping Elite-only commercial/highest export policy separate.
- Fixed: Crevux now has conservative tier-specific storage caps on project creation, asset upload, and audio upload, with subtle next-tier upgrade hints in error payloads.
- Remaining: generated image rows now store `size_bytes`; 3D provider media bytes are probed or conservatively estimated into tracked media storage.

Creator Bundle confidence:

- Increased to high for core cost-bearing admission because WordGeni provider-backed paid actions and Crevux image/video/storage policy resolution are now server-side and fail closed.
- High for tracked media storage because 3D provider media bytes are included by probe or conservative estimate.

## Pricing Truth Update Addendum

Date: 2026-05-04

WordGeni public pricing content may now safely mention enforced Starter / Pro / Elite differences for AI usage budgets, source memory count, monthly exports, and active project caps. Public copy should avoid unlimited provider-spend claims.

Crevux public pricing content may now safely mention enforced Starter / Pro / Elite differences for asset count, audio uploads, active project count, tracked media storage, creative generation caps, and Pro/Elite export-quality separation. Public storage copy must say tracked media storage, not all generated storage.

Creator Bundle confidence is high for the Creator-app portion: WordGeni + Crevux now have enforced AI/export/project/asset/upload/storage safeguards suitable for stronger public pricing bullets. It remains below high until generated-provider storage paths have a complete ledger.
