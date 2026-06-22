# Creator Safeguards Phase 1

Date: 2026-05-04

## Summary

Phase 1 focused on WordGeni and Crevux cost-bearing actions without changing Stripe, pricing, checkout contracts, plan slugs, or pricing page copy.

## WordGeni Changes

Added:

- `assertWorkspacePaidEntitlement(...)` in `apps/WordGeni/apps/api/src/services/billing-entitlements.ts`.
- Paid entitlement admission before `/api/ai/edit` calls `generateText(...)`.
- Paid entitlement admission before `/api/integrations/crevux/send-to-storyboard` calls the Crevux visual companion path.
- Tests for denied, unknown, and allowed `/api/ai/edit` entitlement paths.

Behavior:

- Denied or unknown entitlement now returns `402 BILLING_LIMIT_EXCEEDED` for `/api/ai/edit` before provider execution.
- Allowed entitlement continues through existing AI usage budget checks and provider execution.
- Visual Companion `generate-from-selection` already had paid WordGeni + Crevux entitlement checks.
- Visual Companion storyboard handoff now has the same paid WordGeni prerequisite.

## Crevux Changes

Production enforcement code was not changed. Existing high-confidence gates were already present:

- Image generation consumes a metered SaaS slot and credits before provider work.
- Video generation checks tier/rate and debits upfront credits before provider submission.
- Source enhance, image edit/restore, asset export, and WordGeni visual companion routes already have server-side gates or credit debits.

Test coverage was tightened:

- `verify-saas-entitlements-policy.ts` now explicitly verifies image generation availability and video generation denial/allowance across local tiers.

## Remaining Gaps

WordGeni:

- Apply paid entitlement admission consistently to other provider-backed AI routes if they are paid-only under final public pricing.
- Map public `wordgeni_starter/pro/elite` and Creator/Ecosystem bundle plans into local `pro/studio/enterprise`.
- Prove source memory and export tier-specific limits server-side before making firm public claims.

Crevux:

- Sync Verixet public plan slugs to local `subscriptionTierKey`.
- Resolve missing distinct local equivalent for public `crevux_pro`.
- Prove export-quality tier mapping across public Starter / Pro / Elite.

## Confidence Impact

Creator Bundle confidence increases for core cost-bearing safeguards only:

- WordGeni AI edit generation now has a fail-closed paid-entitlement gate.
- WordGeni visual companion generation and storyboard handoff now require paid WordGeni entitlement plus Crevux/cross-app entitlement.
- Crevux image/video generation gates were already server-enforced and were verified.

Overall Creator Bundle public tier confidence should remain partial until Verixet-to-local tier synchronization is implemented.

## Gap Closure Addendum

Date: 2026-05-04

Additional WordGeni fail-closed gates added after Phase 1:

- `/api/ai/touchup-prompt` now requires paid WordGeni entitlement before `generateText(...)`.
- `/api/ai/random-onboarding-seed` now requires paid WordGeni entitlement before `generateObject(...)`.
- `/api/ai/verify` now requires paid WordGeni entitlement before claim extraction and judge model calls.
- `/api/ai/collaborate` now requires paid WordGeni entitlement before orchestrated collaborative drafting.
- `/api/ai/simulate` now requires paid WordGeni entitlement before reader simulation work.
- `/api/ai/publish-package` now requires paid WordGeni entitlement before marketing package generation.
- `/api/ai/tasks` now requires paid WordGeni entitlement before draft task enqueue.
- `/api/genie/suggestions` now requires paid WordGeni entitlement before Genie suggestion model calls.
- `/api/genie/chat` now requires paid WordGeni entitlement before streamed or structured Genie chat completion.
- `/api/voice-draft/transcribe` now requires paid WordGeni entitlement before OpenAI transcription.
- `/api/voice-draft/structure` now requires paid WordGeni entitlement before voice draft structure generation.
- `/api/exports` now requires paid WordGeni entitlement before export rendering or export row persistence.
- `/api/integrations/cursor/v1/exports` now requires paid WordGeni entitlement before export rendering or export row persistence.
- `/api/workspace/memory-hub/update` now requires paid WordGeni entitlement before shared memory persistence.

Additional Crevux mapping added after Phase 1:

- Crevux now has a pure policy helper, `localTierForCrevuxPublicPlanSlug(...)`, that maps Verixet public plan slugs to existing local tiers.
- Stripe subscription tier resolution accepts public plan slugs from Price metadata keys `plan_slug`, `public_plan_slug`, `verixet_plan_slug`, and `app_plan_slug`.
- Public `crevux_starter`, `crevux_pro`, `creator_starter`, `creator_pro`, `ecosystem_starter`, and `ecosystem_pro` map to local `pro`.
- Public `crevux_elite`, `creator_elite`, and `ecosystem_elite` map to local `elite`.
- Unknown public slugs still fail closed to local `free`.

Additional WordGeni mapping added after Phase 1:

- WordGeni Stripe subscription sync now maps Verixet public plan slugs from Price metadata to local tiers.
- Public `wordgeni_starter`, `creator_starter`, and `ecosystem_starter` map to local `pro`.
- Public `wordgeni_pro`, `creator_pro`, and `ecosystem_pro` map to local `studio`.
- Public `wordgeni_elite`, `creator_elite`, and `ecosystem_elite` map to local `enterprise`.
- Unknown slugs still fall back to configured Stripe price ID mapping and fail closed if neither mapping path resolves.

Tests added or updated:

- WordGeni positive-path mocks now include paid entitlement allowance for Genie and voice draft routes.
- WordGeni denied-path tests prove Genie suggestions, Genie chat, voice draft transcription, and voice draft structure return 402 before provider calls.
- WordGeni denied-path tests prove export creation and shared memory persistence return 402 before exporter execution or shared memory writes.
- WordGeni Stripe plan tests verify public plan slug mapping and env price ID fallback.
- WordGeni usage policy tests verify AI usage budgets for local `pro/studio/enterprise`.
- WordGeni existing Voice Draft, Realtime, and Cursor tests verify tier-specific seconds, session, and concurrency caps.
- WordGeni Cursor integration tests verify export denial returns 402 before exporter execution or export row persistence.
- WordGeni realtime route tests verify unpaid sessions return 403 before upstream OpenAI fetch or realtime usage admission.
- Crevux policy tests verify public plan slug mapping.
- Crevux API server tests verify Stripe subscription tier resolution from public plan slug metadata and fail-closed behavior for unknown slugs.

Remaining after gap closure:

- WordGeni public tier differentiation is now proven for AI budgets, Voice Draft, Geni realtime, Cursor draft tasks, source memory, exports, and active projects.
- WordGeni source memory and export creation now have tier-specific Balanced limits enforced before mutation/render work.
- Crevux public Pro now maps to local runtime tier `public_pro`, which raises daily runtime caps above public Starter/local Pro without changing Stripe, checkout, or plan slugs.
- Crevux video planning, TTS preview, optional video prompt enhancement, export preflight, quality limits, credit estimates, and credit debits are server-side; public Pro also maps to a distinct internal 4K export policy while Elite retains the highest/commercial export policy.
- Crevux project creation, asset upload, and audio upload now enforce conservative tiered storage caps with subtle upgrade hints. Free remains intentionally limited to encourage conversion.
