# Chronicle Release Plan

Chronicle must ship in gated releases. Each release proves a smaller trust boundary before the next one begins.

## Release 1: Product Spec, Privacy Model, Data Model

Status: current planning/spec phase.

Build:

- `docs/chronicle-roadmap.md`
- `docs/chronicle-privacy-model.md`
- `docs/chronicle-data-model.md`
- `docs/chronicle-release-plan.md`

Do not build:

- Runtime capture.
- Desktop/browser agents.
- Database migrations.
- Manual ingest API.
- Fake timeline data.
- Tool Directory ready state.

Exit criteria:

- Product definition reviewed.
- Privacy boundaries reviewed.
- Planned tables reviewed.
- Release 2 decisions resolved.

## Release 2: Database Foundation

Status: database foundation implemented as XFlow Drizzle schema and migration. Runtime ingest and capture remain out of scope.

Build tables:

- `chronicle_sources`
- `chronicle_events`
- `chronicle_sessions`
- `chronicle_daily_summaries`
- `chronicle_weekly_summaries`
- `chronicle_privacy_settings`
- `chronicle_capture_rules`
- `chronicle_redaction_rules`
- `chronicle_device_links`

Must include:

- RLS for user/workspace ownership.
- Retention policy fields.
- Delete/export support fields.
- Audit log coverage.
- Admin visibility limits.
- Tests proving users cannot read each other's Chronicle data.

Do not build automatic capture in this release.

Implemented artifacts:

- `apps/XFlow/drizzle/schema/chronicle.ts`
- `apps/XFlow/drizzle/migrations/0054_chronicle_database_foundation.sql`
- RLS policies using explicit app tenant settings.
- `chronicle_audit_logs` for Chronicle-specific settings, export, delete, device, and summary audit events.

## Release 3: Manual Event Ingest

Status: protected manual ingest API implemented. Automatic capture, agents, fake timeline data, and AI summaries remain out of scope.

Build safe manual APIs:

- `POST /api/chronicle/events`
- `GET /api/chronicle/events`
- `GET /api/chronicle/timeline`
- `DELETE /api/chronicle/events/:id`

Implemented files:

- `apps/XFlow/src/app/api/chronicle/events/route.ts`
- `apps/XFlow/src/app/api/chronicle/events/[id]/route.ts`
- `apps/XFlow/src/app/api/chronicle/timeline/route.ts`
- `apps/XFlow/src/lib/chronicle/manual-events.ts`

Purpose:

- Prove ownership, RLS, deletion, export shape, and timeline behavior without automatic capture.

Do not build desktop/browser capture in this release.

## Release 4: Timeline UI

Status: implemented as manual-event UI backed by Release 3 APIs. No automatic capture, fake events, or AI summary execution.

Build:

- `/tools/chronicle/timeline`
- `/tools/chronicle/settings`
- `/tools/chronicle/privacy`

Show:

- Events.
- Sessions.
- Filters.
- Daily timeline.
- Source labels.
- Privacy controls.
- Delete/export buttons.

Do not use fake events. If no manual events exist, show an honest empty state.

Implemented files:

- `apps/XFlow/src/components/chronicle/ChronicleTimelineClient.tsx`
- `apps/XFlow/src/components/chronicle/ChronicleSettingsPanel.tsx`
- `apps/XFlow/src/components/chronicle/ChroniclePrivacyPanel.tsx`
- `apps/XFlow/src/components/chronicle/ChronicleShell.tsx`

## Release 5: AI Summaries

Status: implemented for stored Chronicle events only. Summary routes can call OpenAI when configured and otherwise use an explicit rule-based stored-event fallback; no hidden capture source is introduced.

Build:

- Daily summary.
- Weekly summary.
- Project/activity grouping.
- "What did I work on?"
- "What changed?"
- "What should I follow up on?"

Rules:

- Use stored events only.
- Exclude deleted events.
- Respect redaction rules.
- Mark summaries stale after source event deletion or redaction changes.
- Keep summaries private to the user by default.

Implemented files:

- `apps/XFlow/src/lib/chronicle/summaries.ts`
- `apps/XFlow/src/app/api/chronicle/reviews/daily/route.ts`
- `apps/XFlow/src/app/api/chronicle/reviews/weekly/route.ts`
- `apps/XFlow/src/components/chronicle/ChronicleReviewsClient.tsx`

## Release 6: Capture Agent Prototype

Status: implemented as one explicit app-internal XFlow activity prototype. Browser extension, desktop agent, screenshots, keystrokes, and background capture remain disabled.

Build one safe source only:

- Manual browser extension mock, or
- Local desktop agent mock, or
- App-internal XFlow activity only.

Rules:

- No broad computer capture.
- No screenshots.
- No keystrokes.
- Local preview before upload.
- Source can be paused or revoked.
- Excluded apps/sites must work before expanding source scope.

Implemented files:

- `apps/XFlow/src/app/api/chronicle/ingest/activity/route.ts`
- `apps/XFlow/src/lib/chronicle/xflow-activity.ts`
- `apps/XFlow/src/components/chronicle/ChronicleXFlowActivityPrototype.tsx`

Still disabled:

- `apps/XFlow/src/app/api/chronicle/ingest/browser/route.ts`
- `apps/XFlow/src/app/api/chronicle/ingest/screenshots/route.ts`

## Release 7: Privacy And Trust Hardening

Status: implemented for current-user controls. The app-internal XFlow prototype now respects pause/private mode, and users can manage exclusions, redaction rules, export-all, delete-all, and retention settings. Production capture remains disabled.

Mandatory before production capture:

- Pause capture.
- Private mode.
- Excluded apps/sites.
- Redaction.
- Local preview before upload.
- Delete all data.
- Export all data.
- Retention rules.
- Device credential rotation.
- Admin visibility tests.
- AI summary privacy tests.
- Abuse and overcollection review.

Implemented files:

- `apps/XFlow/src/lib/chronicle/privacy-controls.ts`
- `apps/XFlow/src/app/api/chronicle/privacy/route.ts`
- `apps/XFlow/src/app/api/chronicle/export/route.ts`
- `apps/XFlow/src/app/api/chronicle/delete-all/route.ts`
- `apps/XFlow/src/components/chronicle/ChroniclePrivacyPanel.tsx`

Production-capture blockers that remain:

- Browser and desktop source prototypes are still disabled.
- Device credential rotation UI is not implemented.
- Retention cleanup jobs are not scheduled yet.
- Admin visibility tests need a full production authorization pass.

## Remaining Decisions Before Release 2

- Exact retention defaults for events, sessions, summaries, sources, device links, and audit references.
- Whether raw event payloads require application-level encryption.
- Export format: JSON only, CSV companion, or both.
- Delete behavior for summaries: hard delete, tombstone, or stale regeneration.
- Admin metadata shape for operational health.
- Manual event schema fields and maximum payload size.
- RLS policy naming and test fixtures.
- Audit log event names and required correlation IDs.
