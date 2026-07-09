# Workflow Copilot Desktop Audit

Date: 2026-06-29

## What Already Exists

### `apps/XFlow/agents/desktop-agent`

This is an existing Tauri v2 desktop metadata agent for Chronicle. It includes a small HTML/JavaScript UI, Rust commands, local JSON state, pairing with XFlow, pause/private mode controls, and active app/window metadata capture through `active-win-pos-rs`.

Status: partial. It is not a full desktop dashboard, not signed, not auto-updated, and stores the local device token in plaintext JSON. It should remain intact while a safer full desktop dashboard is built beside it.

Connection: pairs with XFlow through `/api/chronicle/claim` and posts metadata to `/api/chronicle/ingest/desktop` when Chronicle feature flags and privacy settings allow it.

### `apps/XFlow/agents/browser-extension`

This is an existing Chrome/Edge Manifest V3 extension for Chronicle browser metadata capture. It captures active tab title/domain only when enabled and paired.

Status: partial. It is a local build/package foundation, not a completed store-shipped extension.

Connection: pairs with XFlow and posts to `/api/chronicle/ingest/browser`.

### `apps/XFlow/src/app/(dashboard)/tools/chronicle/*`

These are the existing XFlow web dashboard routes for Chronicle: overview, timeline, manual event entry, reviews, insights, sources, devices, goals, settings, privacy, and trust.

Status: partially built web product. The UI is explicit that Chronicle is opt-in and should not claim unavailable capture is active.

Connection: uses Chronicle API routes and components under `src/components/chronicle`.

### `apps/XFlow/src/app/api/chronicle/*`

These routes implement Chronicle APIs for manual events, timeline, reviews, privacy controls, export/delete, pairing, device management, and gated ingest for desktop/browser/screenshot metadata/app events.

Status: partial to production-gated. Runtime capture is guarded by feature flags and plan/privacy checks.

Connection: backed by Chronicle libraries and Drizzle schema.

### `apps/XFlow/src/lib/chronicle/*`

This library contains Chronicle feature flags, manual event storage, summaries, privacy controls, runtime source validation, redaction checks, deny rules, retention, capabilities, and view models.

Status: useful foundation, but not a local-first desktop storage layer.

Connection: shared by Chronicle API routes and web dashboard components.

### `apps/XFlow/drizzle/schema/chronicle.ts`

This defines server-side Chronicle tables for sources, privacy settings, sessions, events, summaries, capture/redaction rules, device links, and audit logs.

Status: server-side schema foundation. It is not a local encrypted SQLite desktop schema.

## Current Product State

Chronicle is partially built as an XFlow web product plus a thin desktop metadata agent. Desktop and browser capture are feature-flag gated and not production-ready. The existing desktop agent is not a full desktop dashboard. It is not signed, not auto-updated, and stores its local token in plaintext JSON.

The new Workflow Copilot desktop app should therefore start as a safe local-first desktop dashboard foundation with demo data only. It must not pretend to track real desktop activity.

## Safety And Privacy Facts

Good existing controls:

- No-keystrokes, no-screenshots, and no-hidden-capture copy exists.
- Pause and private mode controls exist.
- Deny rules and redaction checks exist.
- Export and delete APIs exist.
- Feature flags default capture off unless explicitly enabled.

Risks and gaps:

- Active window titles may contain sensitive data.
- The current desktop agent token storage is plaintext local JSON.
- No local-first encrypted SQLite desktop dashboard exists yet.
- Local `.env` and `.env.local` files exist in `apps/XFlow` with real-looking secrets, but they are gitignored and not tracked.

## Missing Production Pieces

- Full Tauri desktop dashboard.
- Local encrypted SQLite storage.
- Local-first privacy center.
- Autostart controls.
- Tray controls.
- Signed Windows/macOS builds.
- Updater.
- Real OS activity capture after consent.
- Secure token storage.
- Cloud sync opt-in.

## Recommended Architecture

Use the new `apps/XFlow/agents/workflow-copilot-desktop` app as the full desktop dashboard foundation:

- Tauri v2 shell for installable Windows/macOS desktop packaging.
- React/Vite/TypeScript frontend for dashboard, privacy controls, and status surfaces.
- Rust commands for all local persistence and capability reporting.
- SQLite in the Tauri app data directory for local demo data and privacy settings.
- Real capture modules kept out until consent, secure storage, exclusions, tray/autostart, signing, and updater work are complete.

Keep local:

- Privacy settings.
- Demo timeline and local user preferences.
- Future raw activity metadata before explicit sync.
- Export/delete controls.

Optional backend/cloud later:

- User-approved summaries.
- Sync of redacted metadata only.
- Account/device registration.
- AI-generated recommendations from stored, user-approved events.

## Implementation State Added By This Pass

This pass adds a new safe desktop foundation at `apps/XFlow/agents/workflow-copilot-desktop`. It includes a Workflow Copilot dashboard, Privacy & Tracking page, Settings/Status area, local SQLite commands, mock/demo timeline, daily summary draft, prompt suggestions, workflow recommendations, privacy setting persistence, export/delete commands, and focused static safety checks.

Real desktop capture, screenshot capture, browser capture, clipboard capture, and keystroke capture are not implemented in this pass.
