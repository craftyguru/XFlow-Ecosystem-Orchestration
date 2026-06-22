# Chronicle Roadmap

Chronicle is XFlow's planned activity intelligence system. Its purpose is to help a user understand what they worked on, what changed, and what needs follow-up by turning explicitly allowed activity events into a private timeline and later AI summaries.

Chronicle is not a surveillance tool, employee monitoring tool, keystroke logger, screenshot recorder, browser history scraper, desktop spy agent, or admin-visible productivity score. Chronicle must remain opt-in, explainable, user-controllable, and disabled until each privacy and data layer is reviewed.

## Current State

Chronicle has Release 1 planning/spec docs, a Release 2 database-foundation migration/schema, Release 3 protected manual event ingest routes, Release 4 manual timeline/settings/privacy UI, Release 5 stored-event summaries, Release 6 one-source app-internal XFlow activity prototype, and Release 7 privacy/trust controls. Automatic capture remains disabled.

- No automatic capture is active.
- No desktop agent is active.
- No browser extension is active.
- Manual ingest exists only for authenticated user-submitted events.
- XFlow activity ingest exists only as an explicit click-to-record app-internal prototype with local preview.
- Pause, private mode, exclusions, redaction rules, export-all, delete-all, and retention settings exist for the current user.
- Timeline UI reads stored manual events only.
- Review summaries use stored Chronicle events only.
- No fake timeline data should be created.
- Tool Directory copy must continue to mark Chronicle disabled/inactive.

## Product Principles

Chronicle must obey these rules before runtime work begins:

1. Capture only activity sources the user explicitly enables.
2. Show the user what would be stored before any new capture source uploads data.
3. Make pause, private mode, delete, export, and retention controls first-class.
4. Treat admins as workspace operators, not owners of user activity content.
5. Summarize stored events only; do not let AI infer hidden activity from uncollected sources.
6. Prefer local-only processing for raw sensitive source material whenever possible.
7. Make source labels, redaction state, retention state, and capture reason visible on every event.

## Allowed Activity Sources

Release 1 approves these source categories for future design only:

- Manual user-created events.
- App-internal XFlow activity where the user is already authenticated and the action is already represented in XFlow.
- Explicitly connected ecosystem app events, scoped to the current workspace.
- Later browser extension mock events that send only user-approved page metadata.
- Later desktop agent mock events that send only local preview-approved app/window metadata.

Each source must have a source record, owner, workspace scope, capture rule, retention policy, and visible source label.

## Never Captured

Chronicle must never capture:

- Passwords, secrets, tokens, private keys, seed phrases, MFA codes, or recovery codes.
- Keystrokes, clipboard contents, full filesystem scans, private messages, microphone audio, camera video, or background screenshots.
- Raw email bodies, chat bodies, document contents, browser page contents, or form fields unless a later explicit integration scopes and redacts them with user consent.
- Incognito/private browsing activity.
- Sites, apps, windows, projects, or source types the user excludes.
- Other users' activity unless they explicitly opt in under their own account.
- Admin-only reconstruction of a user's private activity timeline.

## Release Sequence

1. Release 1: Product spec, privacy model, data model, and release plan docs.
2. Release 2: Database foundation with RLS, ownership, retention fields, export/delete support, and audit logs.
3. Release 3: Manual event ingest API only. Implemented for authenticated user-submitted events; no automatic capture.
4. Release 4: Timeline, settings, and privacy UI backed by stored manual events. Implemented without fake data or automatic capture.
5. Release 5: AI summaries from stored events only. Implemented with optional OpenAI summarization and explicit stored-event fallback when model access is not configured.
6. Release 6: One safe capture-agent prototype source. Implemented as explicit app-internal XFlow activity only; no desktop/browser/screenshot source.
7. Release 7: Privacy and trust hardening before any production capture. Implemented for current-user controls, export/delete workflows, and prototype capture gating.

## Release 2 Entry Criteria

Before database work starts, the team must decide:

- Canonical workspace and user ownership columns for Chronicle tables.
- Retention defaults by plan and source type.
- Exact export format and export job storage location.
- Audit event names and mutation coverage.
- Whether raw event payloads are encrypted at rest beyond existing database controls.
- Whether local-only events are allowed to stay entirely off cloud storage.
