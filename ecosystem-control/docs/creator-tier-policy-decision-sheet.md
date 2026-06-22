# Creator Tier Policy Decision Sheet

Date: 2026-05-04

Scope: WordGeni, Crevux, Creator Bundle, and Full Ecosystem Bundle implications.

This sheet is policy-only. It does not change app code, Stripe, checkout, plan slugs, pricing amounts, or public pricing UI.

## Current State

WordGeni:

- Public Starter maps to local `pro`.
- Public Pro maps to local `studio`.
- Public Elite maps to local `enterprise`.
- Core paid actions are now fail-closed before provider or persistence work.
- AI usage, Voice Draft, Geni realtime, and Cursor draft-task limits are already enforced.
- Balanced source memory, export, and active-project limits are now enforced in the WordGeni API.
- Document caps remain unseparated from project caps; the implemented policy gates active projects rather than individual documents.

Crevux:

- Public Starter maps to local `pro`.
- Public Pro now maps to local runtime tier `public_pro`.
- Public Elite maps to local `elite`.
- Core image, video, TTS, planning, prompt-enhancement, export preflight, credit debit, and local daily caps are server-side.
- Local Pro currently includes 4,000 credits per period, 400 image/prompt requests per day, 80 video/lipsync/extend requests per day, and 1080p export where enabled.
- Local `public_pro` currently includes higher runtime daily caps than Starter/local Pro: 800 image/prompt requests per day and 200 video/lipsync/extend requests per day. Invoice credit fallback grants 8,000 credits from public Pro plan slug metadata when explicit credit metadata is absent.
- Storage is now conservative and tiered: Free is intentionally limited to encourage conversion; each paid tier receives a meaningful boost without opening unlimited storage risk.
- Local Elite currently includes 14,000 credits per period, 5,000 image/prompt requests per day, 500 video/lipsync/extend requests per day, and 4K export where enabled.
- Public Starter and public Pro are distinct for runtime daily caps and export quality. `public_pro` now maps to a distinct export policy with 4K max video resolution while keeping Elite-only commercial/highest policy separate.

Status labels:

- `already_enforced`: existing code enforces this today.
- `needs_enforcement`: owner can choose it, but implementation is required before public claims harden.
- `copy_only`: safe as positioning only; should not imply a hard limit or entitlement.
- `not_recommended`: possible policy direction, but high risk or inconsistent with current model.

## Recommendation

Recommended option: Balanced.

Reason: Conservative is safest but leaves Creator Pro weak. Aggressive creates sharp cliffs and cost risk. Balanced gives Starter / Pro / Elite real differentiation while keeping the proposed numbers moderate and implementation surface understandable.

## WordGeni Options

### Option A: Conservative

Policy intent: keep public claims centered on already-enforced AI, Voice Draft, realtime, and Cursor draft-task budgets. Do not introduce new source memory, export, document, or project caps yet.

Starter:

- Source memory: paid access; no tier-specific cap. Status: `copy_only`.
- Exports per month: paid access; no tier-specific cap. Status: `copy_only`.
- Documents/projects: no public cap. Status: `copy_only`.
- AI context: 2,000,000 monthly workspace tokens; 400,000 daily user tokens; 1,800 max output tokens; 40 cents max estimated request cost. Status: `already_enforced`.

Pro:

- Source memory: paid access; no tier-specific cap. Status: `copy_only`.
- Exports per month: paid access; no tier-specific cap. Status: `copy_only`.
- Documents/projects: no public cap. Status: `copy_only`.
- AI context: 10,000,000 monthly workspace tokens; 1,500,000 daily user tokens; 3,200 max output tokens; 120 cents max estimated request cost. Status: `already_enforced`.

Elite:

- Source memory: paid access; no tier-specific cap. Status: `copy_only`.
- Exports per month: paid access; no tier-specific cap. Status: `copy_only`.
- Documents/projects: no public cap. Status: `copy_only`.
- AI context: 50,000,000 monthly workspace tokens; 5,000,000 daily user tokens; 6,400 max output tokens; 500 cents max estimated request cost. Status: `already_enforced`.

Public copy unlocked: "AI writing, memory, sources, and exports are available on paid plans, with higher AI usage by tier."

Tradeoff: Pro and Elite differentiation exists mostly through AI budgets, not source/export/product workspace limits.

### Option B: Balanced

Policy intent: add moderate, understandable source memory, export, and project caps while preserving already-enforced AI budgets as the strongest differentiator.

Starter:

- Source memory: 10 active sources or memory items per workspace. Status: `already_enforced`.
- Exports per month: 25. Status: `already_enforced`.
- Documents/projects: 5 active projects. Status: `already_enforced`.
- AI context: 2,000,000 monthly workspace tokens; 400,000 daily user tokens; 1,800 max output tokens; 40 cents max estimated request cost. Status: `already_enforced`.

Pro:

- Source memory: 100 active sources or memory items per workspace. Status: `already_enforced`.
- Exports per month: 250. Status: `already_enforced`.
- Documents/projects: 50 active projects. Status: `already_enforced`.
- AI context: 10,000,000 monthly workspace tokens; 1,500,000 daily user tokens; 3,200 max output tokens; 120 cents max estimated request cost. Status: `already_enforced`.

Elite:

- Source memory: unlimited, subject to abuse and operational policy. Status: `already_enforced`.
- Exports per month: unlimited, subject to abuse and operational policy. Status: `already_enforced`.
- Documents/projects: unlimited, subject to abuse and operational policy. Status: `already_enforced`.
- AI context: 50,000,000 monthly workspace tokens; 5,000,000 daily user tokens; 6,400 max output tokens; 500 cents max estimated request cost. Status: `already_enforced`.

Public copy unlocked: "Scale from focused writing projects to larger source libraries, higher export volume, and team-scale workspaces."

Implementation status: enforced through `creator-tier-policy` constants and admission checks on source uploads, note sources, memory-hub updates, primary exports, Cursor exports, and project creation. Source memory counts source rows plus voice draft memory snapshots. Export volume counts document export rows created in the current UTC month. Project volume counts non-archived projects.

### Option C: Aggressive

Policy intent: make WordGeni tiers sharply separated.

Starter:

- Source memory: 3 active sources or memory items per workspace. Status: `needs_enforcement`.
- Exports per month: 10. Status: `needs_enforcement`.
- Documents/projects: 3 active projects. Status: `needs_enforcement`.
- AI context: already-enforced Starter AI limits.

Pro:

- Source memory: 250 active sources or memory items per workspace. Status: `needs_enforcement`.
- Exports per month: 1,000. Status: `needs_enforcement`.
- Documents/projects: 150 active projects. Status: `needs_enforcement`.
- AI context: already-enforced Pro AI limits.

Elite:

- Source memory: unlimited plus priority ingestion policy. Status: `needs_enforcement`.
- Exports per month: unlimited plus bulk export policy. Status: `needs_enforcement`.
- Documents/projects: unlimited plus workspace governance policy. Status: `needs_enforcement`.
- AI context: already-enforced Elite AI limits.

Public copy unlocked after enforcement: "Strict entry-tier limits with high-volume creator and studio tiers."

Tradeoff: Not recommended until support, abuse handling, and cost expectations are clear.

## Crevux Options

### Option A: Conservative

Policy intent: keep the current local policy. Starter and Pro remain the same behind the scenes.

Starter:

- Image credits: 4,000 included credits per period. Status: `already_enforced`.
- Video credits: same included credit balance; 80 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 1080p where export is enabled. Status: `already_enforced`.
- Storage: no public tier-specific storage cap. Status: `copy_only`.
- Prompt enhancement/planning: available under local Pro policy. Status: `already_enforced`.

Pro:

- Image credits: 4,000 included credits per period. Status: `already_enforced`.
- Video credits: same included credit balance; 80 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 1080p where export is enabled. Status: `already_enforced`.
- Storage: no public tier-specific storage cap. Status: `copy_only`.
- Prompt enhancement/planning: available under local Pro policy. Status: `already_enforced`.

Elite:

- Image credits: 14,000 included credits per period. Status: `already_enforced`.
- Video credits: same included credit balance; 500 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 4K where export is enabled. Status: `already_enforced`.
- Storage: no public tier-specific storage cap. Status: `copy_only`.
- Prompt enhancement/planning: available under local Elite policy. Status: `already_enforced`.

Public copy unlocked: "Creator media tools with credits, 1080p export on Starter/Pro, and higher Elite limits."

Tradeoff: public Pro cannot safely claim more than Starter.

### Option B: Balanced

Policy intent: add a real public Pro tier between Starter and Elite.

Starter:

- Image credits: 4,000 included credits per period. Status: `already_enforced`.
- Video credits: same included credit balance; 80 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 1080p. Status: `already_enforced`.
- Storage: 120 assets, 40 audio uploads, 8 active projects, and 2 GB tracked asset storage. Status: `already_enforced`.
- Prompt enhancement/planning: available. Status: `already_enforced`.

Pro:

- Image credits: 8,000 included credits per period via explicit credit metadata or public Pro plan slug fallback; runtime image/prompt cap is 800 requests per day. Status: `already_enforced`.
- Video credits: same included credit balance; 200 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 4K. Status: `already_enforced`.
- Storage: 500 assets, 150 audio uploads, 30 active projects, and 10 GB tracked asset storage. Status: `already_enforced`.
- Prompt enhancement/planning: higher daily prompt/planning allowance. Status: `already_enforced`.

Elite:

- Image credits: 14,000 included credits per period. Status: `already_enforced`.
- Video credits: same included credit balance; 500 video/lipsync/extend requests per day. Status: `already_enforced`.
- Export quality: 4K plus priority and batch render where enabled. Status: `already_enforced`.
- Storage: 2,000 assets, 500 audio uploads, 100 active projects, and 50 GB tracked asset storage. Status: `already_enforced`.
- Prompt enhancement/planning: Elite daily prompt/planning allowance. Status: `already_enforced`.

Public copy unlocked now: "Higher media throughput, more workspace storage, and 4K export on Pro and Elite."

Tradeoff: the public-Pro runtime overlay is implemented for daily caps, 4K export, and storage. Storage is count-based plus tracked media bytes. Generated image rows now record `size_bytes`; 3D provider media bytes are included by probe or conservative estimate.

### Option C: Aggressive

Policy intent: make Starter a narrow entry point and push serious media work to Pro / Elite.

Starter:

- Image credits: 2,000 included credits per period. Status: `needs_enforcement`.
- Video credits: limited video access; 25 video/lipsync/extend requests per day. Status: `needs_enforcement`.
- Export quality: 720p or watermark-safe preview only. Status: `not_recommended`.
- Storage: small project storage cap. Status: `needs_enforcement`.
- Prompt enhancement/planning: limited daily prompt/planning allowance. Status: `needs_enforcement`.

Pro:

- Image credits: 10,000 included credits per period. Status: `needs_enforcement`.
- Video credits: same included credit balance; 300 video/lipsync/extend requests per day. Status: `needs_enforcement`.
- Export quality: 4K. Status: `needs_enforcement`.
- Storage: large project storage cap. Status: `needs_enforcement`.
- Prompt enhancement/planning: expanded prompt/planning allowance. Status: `needs_enforcement`.

Elite:

- Image credits: 25,000 included credits per period. Status: `needs_enforcement`.
- Video credits: same included credit balance; 1,000 video/lipsync/extend requests per day. Status: `needs_enforcement`.
- Export quality: 4K plus batch, priority, and highest render policy where enabled. Status: `needs_enforcement`.
- Storage: very high project storage cap. Status: `needs_enforcement`.
- Prompt enhancement/planning: highest prompt/planning allowance. Status: `needs_enforcement`.

Public copy unlocked after enforcement: "High-volume creative media tiers with strong credit and export-quality separation."

Tradeoff: not recommended without cost modeling because it changes included credit economics.

## Creator Bundle Decisions

Creator Bundle includes WordGeni and Crevux only.

Starter should grant:

- WordGeni Starter policy chosen above.
- Crevux Starter policy chosen above.
- Safe copy now: "Writing and creative media tools under one billing model."
- Safe copy after Balanced enforcement: "Starter writing memory, exports, creative credits, and 1080p media workflows."

Pro should grant:

- WordGeni Pro policy chosen above.
- Crevux Pro policy chosen above.
- Safe copy now: "Higher writing workspace capacity, more exports, higher creative media throughput, more creative storage, and 4K media export."

Elite should grant:

- WordGeni Elite policy chosen above.
- Crevux Elite policy chosen above.
- Safe copy now: stronger than Starter/Pro for Crevux because local Elite exists.
- Safe copy after Balanced enforcement: "Highest Creator limits, larger source libraries, high export volume, Elite media caps, and priority studio workflows where enabled."

Owner decision needed: should Creator Bundle tiers inherit exact single-app tier limits, or should bundle tiers receive a bundle-specific uplift?

Recommendation: inherit exact single-app tier limits first. Bundle-specific uplift should wait until single-app policy is stable.

## Full Ecosystem Bundle Implications

Full Ecosystem Bundle includes all six apps. These Creator decisions affect the WordGeni and Crevux portion of ecosystem public claims.

Safe claims now:

- "Includes WordGeni and Crevux under the ecosystem billing and entitlement model." Status: `copy_only`.
- "Core WordGeni paid provider actions and Crevux media actions fail closed." Status: `already_enforced`.

Claims now safe after Balanced enforcement:

- Specific WordGeni source memory limits by ecosystem tier. Status: `already_enforced`.
- Specific WordGeni export limits by ecosystem tier. Status: `already_enforced`.
- Specific Crevux Pro uplift over Starter inside Full Ecosystem Pro. Status: `already_enforced` for runtime daily caps.
- Specific Crevux export-quality differences between Full Ecosystem Starter and Pro. Status: `already_enforced`.

Owner decision needed: should Full Ecosystem tiers inherit Creator Bundle limits exactly, or receive higher Creator-app limits because the bundle is broader?

Recommendation: inherit Creator limits exactly for phase 1. Revisit ecosystem-specific uplift only after usage data shows the need.

## Exact Owner Decisions Needed

1. Choose WordGeni policy option: Conservative, Balanced, or Aggressive.
2. Choose Crevux policy option: Conservative, Balanced, or Aggressive.
3. Confirm whether WordGeni project/document caps should exist at all.
4. Confirm whether WordGeni source memory should be counted by source count, memory item count, storage size, or another metric.
5. Confirm whether WordGeni exports should be counted by export attempts, successful exports, file count, or rendered output size.
6. Confirm whether Crevux public Pro's current runtime overlay is sufficient or whether it needs a fully stored local plan model.
7. Confirm whether Crevux credits are a shared media balance only, or whether image/video sub-budgets should exist.
8. Confirm whether generated-provider objects outside `assets`, `audio_assets`, and `projects` need a separate storage ledger.
9. Confirm whether Creator Bundle inherits exact single-app tier limits.
10. Confirm whether Full Ecosystem Bundle inherits Creator limits exactly.

## Safest Next Implementation Step

Balanced is the selected phase-1 policy. WordGeni Balanced is implemented. Crevux Balanced is implemented for runtime daily caps, 4K Pro export, conservative asset/audio/project caps, and tracked media storage caps. The next safest implementation step is reviewing generated-provider storage rows before making precise all-generated-storage claims public.

Recommended next order:

1. Review generated-provider assets that may not populate `assets.size_bytes`.
2. Keep 3D provider media byte probes monitored and review any provider that blocks both HEAD and range requests.
3. Keep public copy count-based until every generated object path is included.
4. Add frontend nudges near upload/project failure states if the product wants visible pre-limit upgrade prompts.
