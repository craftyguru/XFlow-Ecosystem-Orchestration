# Service Boundary Map

Date: 2026-05-28

Purpose: define the architecture boundaries to use before any XFlow ecosystem refactor or AudAiX Architecture Doctor expansion. This document is a planning guardrail only. It does not approve behavior changes, schema changes, auth changes, billing changes, assistant rewrites, or satellite rewrites.

## Hard Guardrails

- Do not change production behavior without an explicit implementation approval.
- Do not change billing or entitlement semantics.
- Do not change auth, session, OAuth, SSO, MFA, or cross-app handoff behavior.
- Do not change database schema unless explicitly approved.
- Do not delete, move, or archive app folders without a separate cleanup approval.
- Do not rewrite satellite apps.
- Do not replace working assistant infrastructure.
- Do not make UI show fake completed states.
- Do not scan generated, temporary, build, dependency, or deployment snapshot folders as product source.

## Boundary Definitions

### Route/API

Routes are request/response adapters. They should:

- Parse request params, query strings, headers, and body.
- Apply route-level auth, same-origin, API-key, service-token, and workspace guards.
- Call one service method for the business workflow.
- Convert service results into HTTP status codes and response envelopes.
- Set cache headers and runtime metadata.
- Avoid direct multi-step business workflows.
- Avoid direct database reads/writes unless the route is a deliberately tiny health/readiness endpoint.

Current examples:

- Thin route shape: `apps/XFlow/src/app/api/apps/[appSlug]/rataify/setup-state/route.ts` calls `getRataifySetupSummary`.
- Fat route anti-pattern: `apps/XFlow/src/app/api/copilot/chat/route.ts` handles auth, entitlement, credit checks, OpenAI availability, usage logging, SSE orchestration, and error telemetry in one route.
- Fat route anti-pattern: `apps/XFlow/src/app/api/verixet/fully-connect/route.ts` contains phase-specific workflow and audit outcome logic that should sit behind a service.

### Service

Services own business workflows. They should:

- Orchestrate domain operations.
- Make business decisions and state transitions.
- Call repositories/data-access helpers.
- Call external providers through provider clients.
- Emit audit/event intent through a stable interface.
- Return typed domain results, not raw HTTP responses.
- Be testable without rendering UI or starting a server.

Current examples:

- Strong service candidate: `apps/Verixet/src/lib/access-billing-control/service.ts`.
- Strong service candidate: `apps/XFlow/src/lib/readiness/canonical-readiness.ts`.
- Service extraction target: `apps/XFlow/src/app/(dashboard)/apps/[slug]/integrations/actions.ts` should delegate to an `integrationWorkflowService`.
- Service extraction target: `apps/XFlow/src/app/api/copilot/chat/route.ts` should delegate to a `copilotTurnService`.

### Repository/Data Access

Repositories own persistence. They should:

- Encapsulate SQL, ORM, and storage calls.
- Enforce workspace/app/user scoping at the query boundary.
- Return typed rows or domain persistence results.
- Hide table names and conflict handling from routes and UI.
- Keep transaction boundaries explicit.
- Avoid user-facing copy and UI state labels.

Current examples:

- Good repository pattern: `apps/AudAix/src/repositories/*`, including interface files plus `*-postgres.ts` and `*-backend.ts`.
- Mixed boundary: many XFlow `src/lib/*` files directly import `db` and Drizzle schema while also deriving user-facing states.
- Route-level data-access anti-pattern: direct `db.select`, `db.insert`, `db.update`, or `storage.*` calls inside route files should be reduced during service extraction.

### Materializer/View Model

Materializers own dashboard and API view state. They should:

- Translate backend truth into user-facing status.
- Attach truth labels such as `Live scan`, `Saved report`, `Framework preview`, `Connector unavailable`, `Manual draft`, `Waiting for repo access`, or `Not yet implemented`.
- Compute CTAs, next actions, summaries, warnings, and freshness.
- Keep raw system state out of UI components unless the page is explicitly an operator diagnostic surface.
- Never invent successful, completed, connected, healthy, or paid states.

Current examples:

- Good materializer candidate: `apps/XFlow/src/lib/apps/derive-integrations-ui-model.ts`.
- Good materializer candidate: `apps/XFlow/src/lib/ecosystem-status/sanitize-env-doctor.ts`.
- Drift risk: `apps/XFlow/src/lib/ecosystem/audaix-setup.ts` mixes DB reads, env config, evidence URL derivation, setup status, and fallback status from audit requests.
- Drift risk: `apps/XFlow/src/lib/ecosystem/rataify-setup.ts` materializes setup state with default false/null verification fields rather than reading RatAiFy source truth.

### Shared Contract

Contracts define cross-app DTOs, enums, and schemas. They should:

- Be stable across XFlow and satellite apps.
- Define app slugs, statuses, evidence references, billing states, setup states, report states, and assistant capability metadata.
- Be versioned when behavior changes.
- Avoid importing app-local runtime code.
- Avoid database calls.

Current examples:

- `packages/ecosystem-contracts` for shared ecosystem contracts.
- `packages/ecosystem-assistant` for assistant DTOs.
- `apps/XFlow/src/contracts/*` for XFlow-local contracts.

Architecture Doctor contract targets:

- `ArchitectureAuditRun`
- `ArchitectureAuditReport`
- `ArchitectureAuditFinding`
- `ArchitectureAuditEvidenceReference`
- `ArchitectureAuditScorecard`
- `ArchitectureDuplicateGroup`
- `ArchitectureRefactorPlan`
- `ArchitectureAssistantSession`

Every Architecture Doctor finding must be able to cite:

- File path.
- Line number when available.
- Function, route, component, module, or symbol name when available.
- Finding type.
- Severity.
- Recommendation.
- Confidence.

### UI/Component

UI displays state and collects input. It should:

- Render server-derived state.
- Show honest loading, empty, error, success, waiting, and unavailable states.
- Submit forms/actions to routes or server actions.
- Avoid deciding backend truth.
- Avoid calculating billing, entitlement, setup, connection, audit, or verification authority.
- Avoid hiding incomplete backend wiring behind polished cards.

Current examples:

- UI risk: `apps/XFlow/src/app/(dashboard)/apps/[slug]/commerce/page.tsx` clearly states some buttons record operator intent only. That honesty should remain until real provider adapters exist.
- UI risk: dashboard pages that show raw diagnostic status should translate it into next actions unless the route is explicitly admin/operator-only.

## Current Anti-Patterns To Avoid

- Fat route handlers performing multi-step workflows.
- Server actions containing auth, validation, DB writes, token operations, collector runs, audit logging, copy text, and revalidation in one file.
- Helpers that mix database access, business status, UI copy, and fallback behavior.
- Multiple setup/connection status calculators for the same app.
- Satellite apps and XFlow each materializing their own “connected” or “ready” state without a shared contract.
- UI cards showing connected/healthy/completed without source labels.
- Placeholder public pages that are not clearly labeled.
- Scanning stale duplicate app folders as current source.

## Proposed Canonical Service Names

These names are proposals only:

- `integrationWorkflowService`: XFlow app connection, verification, token, collector, and repair workflows.
- `connectionCredentialService`: install-token, managed-token, opaque-token, and manual service-token lifecycle.
- `collectorCommandService`: run one collector, run all collectors, record collector outcomes.
- `copilotTurnService`: XFlow Copilot turn workflow, including entitlement, credits, model invocation, usage logging, and finalization.
- `verixetFullConnectService`: XFlow-to-Verixet workspace link, event channel registration, and live signal activation workflow.
- `integrationHealthService`: canonical setup/connection/health truth for dashboard cards and setup pages.
- `dashboardStateMaterializerService`: materialize cross-app dashboard cards from canonical health/report/billing/assistant state.
- `assistantContextSyncService`: context snapshot ingestion and route/app/workspace context resolution.
- `assistantCapabilityRouter`: capability/action selection for XFlow and satellite assistant surfaces.

## Architecture Doctor Boundary

The first AudAiX Architecture Doctor version should be audit/report/planning only:

- No automatic code modification.
- No GitHub PR creation.
- No fake findings or fake scores.
- No real repo scan until ingestion, ignore rules, cost limits, and evidence references are implemented.
- No scan of `node_modules`, `.next`, `dist`, `build`, `coverage`, `tmp`, `.cache`, `.env*`, binary/media files, generated artifacts, or deployment snapshots.

Truth labels are required for every Architecture Doctor card:

- `Live scan`
- `Saved report`
- `Framework preview`
- `Connector unavailable`
- `Manual draft`
- `Waiting for repo access`
- `Not yet implemented`

