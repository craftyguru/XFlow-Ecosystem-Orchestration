# Ecosystem Assistant and Support Contracts

## Purpose

The ecosystem needs one shared contract for public assistant chat, support escalation, admin inboxes, app knowledge, and assistant telemetry. Each app can keep its own product copilot, but public support and cross-app answers should speak the same API language.

Phase 1 creates `@xflow-ecosystem/ecosystem-assistant` as a contract package only. It does not add runtime routes, database migrations, or app UI wiring.

## Ownership Boundaries

XFlow owns the central ecosystem assistant router because it is already the control plane for app registry, cross-app routing, app linking, and global monitoring. The central router should decide which app knowledge is relevant, track assistant conversations by `appSlug`, and escalate to support without forcing each app to invent a separate public chat system.

App copilots remain app-specific:

- XFlow Copilot/Ralph keeps handling control-plane and dashboard guidance.
- Verixet Vera keeps handling billing/governance dashboard questions from grounded workspace data.
- Rataify Assistant keeps handling reputation and review workflows.
- AudAiX keeps AI audit/check tools and workspace copilot memory.
- WordGeni Geni keeps writing, source, and drafting workflows.
- Crevux Copilot keeps creative studio and asset workflow guidance.

The shared public bubble is not a replacement for those copilots. It is the shared front door for public support, simple product questions, cross-app routing, and escalation.

## App Scoping

Every assistant and support record must carry `appSlug`. Anonymous traffic also carries `visitorSessionId`; signed-in traffic can carry `userId` and `workspaceId`.

Local app admins are scoped by `appSlug`. A Rataify admin should not see Crevux support conversations unless they also have a global XFlow role. XFlow global admins can see all app support conversations because XFlow owns the global support inbox and central assistant monitoring.

The helper `canAdminAccessAppScope(adminScope, appSlug)` captures this boundary:

- `xflow_global` can access every app.
- `app` can access only the matching app slug.
- missing scope is denied.

## Pricing and Entitlements

Assistant answers must not hardcode final pricing, claim a user has access, or infer entitlement state. Pricing and entitlement truth must be resolved from Verixet or the active catalog authority at request time.

Seed app profiles include only this pricing summary:

> Pricing is resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.

This keeps product copy useful without turning app profiles into stale billing data.

## Support Flow

Public support/chat should use shared contracts so every app produces the same conversation shape:

- `AssistantConversation`
- `AssistantMessage`
- `AssistantToolCall`
- `SupportConversation`
- `SupportMessage`
- `SupportAssignment`
- `SupportEvent`
- `AdminNotification`

The future XFlow routes are documented contract targets only in Phase 1:

- `POST /api/ecosystem-assistant/chat`
- `POST /api/ecosystem-assistant/escalate`
- `GET /api/ecosystem-assistant/history`
- `POST /api/support/conversations`
- `GET /api/support/conversations/:id`
- `POST /api/support/conversations/:id/messages`
- `GET /api/admin/support/conversations`
- `GET /api/admin/assistant/conversations`
- `GET /api/admin/assistant/analytics`

## Rataify Consolidation Risk

Rataify already has multiple support-related implementations, including persisted support conversations, admin support threads, and an in-memory chat route. Do not add a fourth support system there.

Before deeper integration, Rataify should map existing support data to the shared contract and choose a single durable support path. The shared contract can become the adapter boundary while old routes are gradually retired.

## Phase 2 Direction

Phase 2 should add XFlow-owned storage and API routes that use these contracts. Existing apps should keep their current copilots and only mount the shared public bubble once the central routes exist.

## Migration Requirement

Before live use, XFlow must apply:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run db:migrate
```

The required migration is `drizzle/migrations/0046_ecosystem_assistant_support.sql`. It creates the assistant, support, app profile, FAQ, assignment, event, tool-call, and admin notification tables used by the Phase 2 and Phase 3 route handlers. Do not mount public bubbles until this migration has been applied to the target database and smoke proof passes.

## Local/Staging Smoke

Run the smoke only against a local or staging XFlow instance after the migration is applied:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL="http://localhost:3101"
npm run smoke:ecosystem-assistant-support
```

Optional admin proof:

```powershell
$env:XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE="<admin session cookie>"
npm run smoke:ecosystem-assistant-support
```

Required env var:

- `XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL`: origin for the XFlow server under test.

Optional env var:

- `XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE`: authenticated XFlow admin cookie. When omitted, the smoke skips admin endpoint proof and reports that skip in JSON.

The smoke validates:

- anonymous assistant chat creates a conversation and returns a non-empty answer
- cross-app questions expose `verixet` and `rataify` in `usedAppSlugs`
- pricing questions cite catalog/Verixet authority instead of unsupported assistant claims
- anonymous escalation without email is rejected
- anonymous escalation with email creates a support conversation
- admin support and assistant endpoints are readable when an admin cookie is provided

The smoke does not call an external AI provider, does not send email, and does not perform cleanup unless a safe cleanup route exists. It reports created assistant/support IDs for manual database cleanup.

## Phase 4 Remaining Work

Phase 4 should add the reusable branded public bubble package and admin mutation controls:

- bubble UI shell per app with `appSlug`, logo, theme, quick prompts, support escalation, and history
- admin reply route and UI
- status, priority, category, and assignment mutations
- FAQ/profile admin CRUD after a permission and audit model is finalized
- local app admin scoping for non-XFlow app admins
