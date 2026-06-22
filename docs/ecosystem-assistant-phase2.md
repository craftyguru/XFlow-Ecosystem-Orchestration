# Ecosystem Assistant Phase 2

## Shared shell

`@xflow-ecosystem/ecosystem-assistant-ui` is the shared assistant shell for satellite apps. It owns the launcher, panel, header, app/status context line, suggested prompt chips, transcript, loading/error states, input, send button, support CTA, footer note, and mobile sizing.

XFlow still uses its local first-party bubble because it has richer feedback/action handling and XFlow-specific styling. Its prompt set, loading copy, support CTA, and route context metadata are aligned with the shared shell so it can be extracted later with lower risk.

## App identity and prompt packs

Prompt packs live in `packages/ecosystem-assistant-ui/src/index.tsx` as `ECOSYSTEM_ASSISTANT_PROMPT_PACKS`. Each pack includes `appSlug`, `appName`, assistant name, welcome copy, suggested prompts, support prompts, optional setup/troubleshooting/billing prompts, route prompt seeds, and footer copy.

Satellite mounts call `getEcosystemAssistantPromptPack(appSlug)` and pass the returned pack into `EcosystemAssistantBubble`. Brand accents, logos, and safe route context remain app-local props.

## Route context seeding

The shared shell accepts `assistantContext` with safe frontend-only fields: app slug/name, route, page title, optional tool id, optional tool status, optional Chronicle tab, and optional prompt seed. This is also included in existing metadata payloads, but Phase 2 does not add backend context resolver behavior.

XFlow assistant CTAs continue to use prompt query strings for pages like Chronicle and Tools. The XFlow local bubble reads that prompt into the draft and includes route/tool/Chronicle-tab metadata when the user sends a message.

## Not included in Phase 2

Phase 2 does not add Chronicle backend integration, automatic capture, screenshot/background monitoring, autonomous actions, auth/session changes, billing/entitlement behavior changes, or browser-visible service tokens.

## Phase 3 next

Phase 3 should add read-only Chronicle context resolvers, assistant-safe Chronicle summaries, tool registry context, and stronger route-aware retrieval. Action execution should remain out of scope until guardrails and permissions are reviewed separately.
