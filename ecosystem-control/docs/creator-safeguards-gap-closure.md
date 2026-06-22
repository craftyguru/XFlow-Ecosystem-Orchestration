# Creator Safeguards Gap Closure

Date: 2026-05-04

Scope: WordGeni and Crevux only. No Stripe products, prices, checkout contracts, plan slugs, pricing UI, or marketing claims were changed.

## WordGeni

Added fail-closed paid entitlement checks before these cost-bearing or provider-backed actions:

- `/api/ai/edit` -> `wordgeni.ai_generation`
- `/api/ai/touchup-prompt` -> `wordgeni.ai_touchup_prompt`
- `/api/ai/random-onboarding-seed` -> `wordgeni.ai_onboarding_seed`
- `/api/ai/verify` -> `wordgeni.ai_verify`
- `/api/ai/collaborate` -> `wordgeni.ai_collaborate`
- `/api/ai/simulate` -> `wordgeni.ai_simulate`
- `/api/ai/publish-package` -> `wordgeni.ai_publish_package`
- `/api/ai/tasks` -> `wordgeni.ai_tasks`
- `/api/genie/suggestions` -> `wordgeni.genie_suggestions`
- `/api/genie/chat` -> `wordgeni.genie_chat`
- `/api/voice-draft/transcribe` -> `wordgeni.voice_draft_transcribe`
- `/api/voice-draft/structure` -> `wordgeni.voice_draft_structure`
- `/api/exports` -> `wordgeni.exports`
- `/api/integrations/cursor/v1/exports` -> `wordgeni.exports`
- `/api/workspace/memory-hub/update` -> `wordgeni.source_memory`
- `/api/integrations/crevux/generate-from-selection` -> `wordgeni.visual_companion`
- `/api/integrations/crevux/send-to-storyboard` -> `wordgeni.visual_companion_storyboard`

Denied or unknown entitlement returns `402 BILLING_LIMIT_EXCEEDED` before provider, orchestrator, simulator, promotion, Crevux, or transcription calls.
Export denial occurs before exporter package execution or export row persistence on both the primary app export route and the Cursor integration export route. Source memory denial occurs before shared memory persistence.

Remaining WordGeni gaps:

- Public Starter / Pro / Elite source memory, export, and active-project differences are now mapped to the Balanced creator policy and enforced in WordGeni API.
- Individual document-count caps remain intentionally unimplemented; the approved Balanced policy gates active projects instead.

## WordGeni Public Plan Slug Closure

Added conservative public-plan-slug mapping:

- `wordgeni_starter`, `creator_starter`, `ecosystem_starter` -> local `pro`
- `wordgeni_pro`, `creator_pro`, `ecosystem_pro` -> local `studio`
- `wordgeni_elite`, `creator_elite`, `ecosystem_elite` -> local `enterprise`
- unknown slugs -> no mapping; Stripe sync falls back to configured price ID mapping and still fails closed if neither path resolves

Stripe subscription sync now reads these Stripe Price metadata keys:

- `plan_slug`
- `public_plan_slug`
- `verixet_plan_slug`
- `app_plan_slug`

This closes the WordGeni public-slug-to-local-tier sync gap when Verixet-controlled Stripe Prices carry one of those metadata keys.

## WordGeni Enforced Tier Limits

The following WordGeni tier limits are already enforced in code after public slugs resolve to local tiers:

Starter -> local `pro`:

- AI usage: 2,000,000 monthly workspace tokens; 400,000 daily user tokens; 1,800 max output tokens; 40 cents max estimated request cost.
- Voice Draft transcription: 3,600 seconds per month.
- Geni realtime sessions: 60 session starts per month.
- Cursor draft tasks: 20 queued/running tasks; 50 max estimated credits per draft task.
- Primary and Cursor integration exports and source memory: tier-specific Balanced limits are enforced.

Pro -> local `studio`:

- AI usage: 10,000,000 monthly workspace tokens; 1,500,000 daily user tokens; 3,200 max output tokens; 120 cents max estimated request cost.
- Voice Draft transcription: 18,000 seconds per month.
- Geni realtime sessions: 800 session starts per month.
- Cursor draft tasks: 40 queued/running tasks; 50 max estimated credits per draft task.
- Primary and Cursor integration exports and source memory: tier-specific Balanced limits are enforced.

Elite -> local `enterprise`:

- AI usage: 50,000,000 monthly workspace tokens; 5,000,000 daily user tokens; 6,400 max output tokens; 500 cents max estimated request cost.
- Voice Draft transcription: 864,000 seconds per month.
- Geni realtime sessions: 100,000 session starts per month.
- Cursor draft tasks: 100 queued/running tasks; 50 max estimated credits per draft task.
- Primary and Cursor integration exports and source memory: tier-specific Balanced limits are enforced.

## Crevux

Added public-plan-slug mapping:

- `crevux_starter`, `creator_starter`, `ecosystem_starter` -> local `pro`
- `crevux_pro`, `creator_pro`, `ecosystem_pro` -> local runtime tier `public_pro`
- `crevux_elite`, `creator_elite`, `ecosystem_elite` -> local `elite`
- unknown slugs -> no mapping; active subscriptions fail closed to local `free`

Added fail-closed metered admission for an additional cost-bearing preview path:

- `/api/internal/video/tts/preview` now uses existing `audio_generate_voice` tier, daily quota, rate, and credit admission before OpenAI text-to-speech preview work.
- If TTS provider/tool work fails after debit, debited credits are refunded through the existing metered refund helper.

Closed a video generation admission ordering gap:

- `POST /api/video/generate` now runs the existing `video_generate` SaaS admission before optional OpenAI prompt enhancement.
- Optional OpenAI prompt enhancement now also runs existing `openai_create_prompt_fix` metered admission with `creditCost: 0` immediately before provider work.
- Existing upfront video credit debit remains immediately before parent job creation and video provider submission; no separate prompt-enhancement credit policy was invented.

Closed the video planning admission gap:

- `/api/internal/video/plan` now runs existing `video_generate` SaaS admission before the OpenAI video planning runner.
- The route uses `creditCost: 0`, preserving the existing model where full video generation, not planning, performs the upfront video credit debit.

Stripe subscription tier resolution now reads these Stripe Price metadata keys:

- `crevux_tier`
- `plan_slug`
- `public_plan_slug`
- `verixet_plan_slug`
- `app_plan_slug`

Crevux public Pro runtime differentiation:

- `public_pro` keeps the existing paid feature set but raises runtime daily caps above Starter/local Pro: 800 image/prompt requests per day and 200 video/lipsync/extend requests per day.
- `public_pro` grants 8,000 included credits per period through public Pro plan slug fallback when explicit Stripe Price credit metadata is absent.
- `public_pro` also raises TTS, planning, source enhancement, image edit/restore, studio scoring/music, comic mutation, and copilot daily caps above Starter/local Pro.
- `public_pro` uses the Pro top-up discount and maps to a distinct internal export plan with 4K max video resolution.
- Storage caps are now enforced on project creation, asset upload, and audio upload. Free is intentionally narrow, and each denial includes `nextTier`, `/pricing`, and a subtle upgrade hint.

Remaining Crevux gaps:

- Export preflight, export quality, credit estimates, credit debit, daily caps, and concurrent caps are server-enforced through the local plan policy.
- Generated image rows now store `size_bytes`; 3D provider media bytes are probed or conservatively estimated into tracked media storage.

## Confidence

Creator Bundle confidence is now high for core cost-bearing safeguards. Tracked media storage includes uploaded assets, generated images, and 3D provider media bytes by probe or conservative estimate.

## Pricing Truth Update Addendum

Date: 2026-05-04

The final pricing truth artifacts have been updated to use the enforced Balanced Creator policy for public-safe WordGeni, Crevux, Creator Bundle, and Full Ecosystem copy.

Safe WordGeni public claims now include enforced AI usage budgets, source memory limits, monthly export limits, and active project caps by Starter / Pro / Elite tier.

Safe Crevux public claims now include enforced asset count, audio upload count, active project count, tracked media storage, creative generation caps, and Pro/Elite export-quality differences by Starter / Pro / Elite tier.

Creator Bundle confidence is high for core Creator safeguards and remains below high until generated-provider storage paths are ledgered end to end.
