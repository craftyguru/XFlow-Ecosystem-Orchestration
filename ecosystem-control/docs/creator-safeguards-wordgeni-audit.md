# Creator Safeguards: WordGeni Audit

Date: 2026-05-04

## Scope

Repository audited: `apps/WordGeni`

Focused paths:

- `apps/api/src/routes/ai.ts`
- `apps/api/src/routes/genie.ts`
- `apps/api/src/routes/voice-draft.ts`
- `apps/api/src/routes/integrations/crevux.ts`
- `apps/api/src/services/billing-entitlements.ts`
- `apps/api/src/services/ai-usage-limits.ts`
- `apps/api/src/services/visual-companion/entitlements.ts`
- `apps/api/src/services/cursor/cursor-billing-policy.ts`
- `apps/web/src/components/pricing/pricing-page-client.tsx`

## Current Local Tiers

- `free`
- `pro`
- `studio`
- `enterprise`

Local billing source:

- `getWorkspaceBillingEntitlement(workspaceId)` reads workspace/subscription state.
- `getEffectiveWorkspacePlan(workspaceId)` collapses inactive, canceled, unknown, or blocked subscriptions to `free`.

## Current Cost-Bearing Actions

- AI edit generation: `POST /api/ai/edit`
- AI prompt touch-up: `POST /api/ai/touchup-prompt`
- Random onboarding seed generation: `POST /api/ai/random-onboarding-seed`
- Verification generation: `POST /api/ai/verify`
- Collaborative draft orchestration: `POST /api/ai/collaborate`
- Reader simulation: `POST /api/ai/simulate`
- Publish package generation: `POST /api/ai/publish-package`
- Genie suggestions/chat generation: `apps/api/src/routes/genie.ts`
- Voice draft structure generation: `apps/api/src/routes/voice-draft.ts`
- Visual Companion handoff to Crevux: `POST /api/integrations/crevux/generate-from-selection`
- Visual Companion storyboard handoff: `POST /api/integrations/crevux/send-to-storyboard`

## Server-Side Gates Found

- AI routes use `assertAiGenerationBudget(...)` for token/cost admission on several provider-backed routes.
- Genie routes use `assertAiGenerationBudget(...)` before provider-backed suggestions/chat generation.
- Voice draft uses `assertAiGenerationBudget(...)`.
- Visual Companion `generate-from-selection` checks `getWorkspaceBillingEntitlement(...)`, then calls `getVisualCompanionEntitlement(...)`, and returns `402 BILLING_LIMIT_EXCEEDED` when locked or credit-insufficient.
- Visual Companion entitlement can call `VERIXET_XFLOW_ENTITLEMENT_URL` / `XFLOW_ENTITLEMENT_URL`; in production it fails closed if not configured.
- Cursor task creation has a separate paid entitlement gate through `cursor-billing-policy.ts`.

## Client-Only or Copy-Only Gates Found

- Public pricing copy can now use the Balanced source memory, export, and active-project tier limits once the pricing content pack is updated.
- Pricing card copy names memory, sources, and exports, but the audit did not prove tier-specific server enforcement for those claims.

## Missing Fail-Closed Checks

- Before this phase, `POST /api/ai/edit` could run under local `free` budget when billing was enabled and no paid entitlement was present.
- Before this phase, `POST /api/integrations/crevux/send-to-storyboard` checked Crevux visual entitlement but did not first require an active paid WordGeni entitlement.
- Other AI provider-backed routes still need the same paid-entitlement assertion if they are treated as paid-only in the final public model.
- Source memory, export, and active-project tier-specific limits are now enforced through the Balanced creator policy.

## Existing Verixet/XFlow Integration Points

- Pricing catalog is read from Verixet public catalog in `apps/web/src/lib/pricing-catalog.ts`.
- Central auth handoff is routed through XFlow in `apps/web/src/app/api/ecosystem/auth/handoff/route.ts`.
- Visual Companion entitlement can call the XFlow/Verixet entitlement bridge through `VERIXET_XFLOW_ENTITLEMENT_URL` or `XFLOW_ENTITLEMENT_URL`.

## Phase 1 Safeguards Added

- Added `assertWorkspacePaidEntitlement(...)` in `apps/api/src/services/billing-entitlements.ts`.
- Added paid entitlement check before provider execution in `POST /api/ai/edit`.
- Added paid entitlement check before Crevux storyboard handoff in `POST /api/integrations/crevux/send-to-storyboard`.
- Added route tests proving denied and unknown AI entitlement paths block before `generateText(...)`, while allowed entitlement reaches the provider.

## Proposed Starter / Pro / Elite Mapping

- Public Starter: local `pro` equivalent for paid AI generation baseline.
- Public Pro: local `studio` equivalent with Balanced creator limits enforced.
- Public Elite: local `enterprise` equivalent with Balanced creator limits enforced.

Confidence remains medium-low because canonical Verixet public plan slugs are not yet synchronized into local WordGeni tiers.
