# Chronicle Data Model

This document defines the planned Chronicle data model for Release 2. It is not a migration and does not create runtime tables in Release 1.

## Ownership Rules

Every Chronicle table must be scoped by:

- `workspace_id`
- `user_id` when the row represents private user data
- `created_by_user_id` for user-initiated records
- `source_id` where data came from a source

RLS must enforce:

- Users can read their own Chronicle events, sessions, summaries, settings, rules, and device links.
- Workspace admins can read operational metadata only where explicitly allowed, not raw private activity.
- Service-role operations must go through audited server code paths.
- Deletes and exports must verify workspace membership and user ownership.

## Planned Tables

### chronicle_sources

Represents a user/workspace-approved source type.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_type`: `manual`, `xflow_internal`, `ecosystem_app`, `browser_extension_mock`, `desktop_agent_mock`
- `source_label`
- `status`: `disabled`, `enabled`, `paused`, `revoked`
- `local_only_default`
- `retention_policy_key`
- `retention_expires_at`
- `created_at`, `updated_at`, `disabled_at`, `deleted_at`

### chronicle_events

Stores individual accepted activity events.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_id`
- `session_id`
- `event_type`
- `occurred_at`
- `received_at`
- `source_label`
- `title`
- `description`
- `app_name`
- `site_domain`
- `project_key`
- `payload_redacted`
- `payload_json`
- `redaction_applied`
- `privacy_state`: `normal`, `paused_blocked`, `private_mode_blocked`, `redacted`
- `retention_policy_key`
- `retention_expires_at`
- `delete_requested_at`
- `deleted_at`
- `exported_at`
- `created_at`, `updated_at`

### chronicle_sessions

Groups events into time-bounded work sessions.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_id`
- `started_at`
- `ended_at`
- `duration_seconds`
- `primary_project_key`
- `source_labels`
- `event_count`
- `summary_status`
- `retention_policy_key`
- `retention_expires_at`
- `delete_requested_at`
- `deleted_at`
- `created_at`, `updated_at`

### chronicle_daily_summaries

Stores user-visible AI or deterministic daily summaries generated from stored events only.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `summary_date`
- `summary_text`
- `worked_on`
- `changed_items`
- `follow_ups`
- `source_event_ids`
- `source_session_ids`
- `model_provider`
- `model_name`
- `generation_status`
- `stale_after_delete`
- `retention_policy_key`
- `retention_expires_at`
- `delete_requested_at`
- `deleted_at`
- `created_at`, `updated_at`

### chronicle_weekly_summaries

Stores week-level rollups using stored daily summaries and events.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `week_starts_on`
- `week_ends_on`
- `summary_text`
- `project_groups`
- `changed_items`
- `follow_ups`
- `source_daily_summary_ids`
- `source_event_ids`
- `model_provider`
- `model_name`
- `generation_status`
- `stale_after_delete`
- `retention_policy_key`
- `retention_expires_at`
- `delete_requested_at`
- `deleted_at`
- `created_at`, `updated_at`

### chronicle_privacy_settings

Stores user privacy preferences and workspace policy resolution.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `capture_paused`
- `private_mode_enabled`
- `private_mode_started_at`
- `default_local_preview_required`
- `default_retention_days`
- `admin_visibility_level`
- `export_requested_at`
- `delete_all_requested_at`
- `created_at`, `updated_at`

### chronicle_capture_rules

Stores allow/deny capture policy by source, app, site, project, or event type.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_id`
- `rule_type`: `allow`, `deny`, `preview_required`
- `target_type`: `source`, `app`, `site`, `project`, `event_type`
- `target_value_hash`
- `target_label`
- `is_enabled`
- `created_at`, `updated_at`, `deleted_at`

### chronicle_redaction_rules

Stores rules for removing sensitive values before storage or summary generation.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_id`
- `rule_type`: `exact`, `contains`, `regex`, `field`
- `target_field`
- `pattern_hash`
- `replacement_label`
- `apply_before_storage`
- `apply_before_summary`
- `is_enabled`
- `created_at`, `updated_at`, `deleted_at`

### chronicle_device_links

Stores future mock or real agent/browser source links.

Key fields:

- `id`
- `workspace_id`
- `user_id`
- `source_id`
- `device_label`
- `device_type`: `browser_extension_mock`, `desktop_agent_mock`, `xflow_internal`
- `pairing_status`: `pending`, `active`, `paused`, `revoked`
- `last_seen_at`
- `credential_rotated_at`
- `local_preview_required`
- `created_at`, `updated_at`, `revoked_at`, `deleted_at`

## Audit Logs

Release 2 should use the existing XFlow audit log pattern rather than a separate private audit table unless schema review requires otherwise.

Chronicle audit events must cover:

- Source enabled, paused, disabled, revoked.
- Capture rule created, updated, deleted.
- Redaction rule created, updated, deleted.
- Privacy setting changed.
- Private mode started/stopped.
- Event deleted.
- Date range deleted.
- Delete all requested/completed.
- Export requested/completed.
- Device linked, paused, revoked.
- Summary generated, regenerated, marked stale.

Audit logs must never store raw event payloads or redacted original values.

## Manual Ingest API Plan

Release 3 adds:

- `POST /api/chronicle/events`
- `GET /api/chronicle/events`
- `GET /api/chronicle/timeline`
- `DELETE /api/chronicle/events/:id`

Manual ingest constraints:

- Authenticated user only.
- Workspace membership required.
- Same-origin protection required for POST and DELETE.
- Routes must use session/workspace RBAC; read routes require `apps:read`, mutation routes require `apps:write`.
- Source must be `manual` or an explicitly enabled app-internal source.
- Payload schema must reject secrets and oversized blobs.
- Event response must include source label, retention fields, and redaction state.
- Delete must soft-delete the event row and mark dependent summaries stale.
- Timeline responses must be grouped from stored manual events only and must report that capture is inactive.

## AI Summary Plan

Release 5 summary inputs:

- `chronicle_events`
- `chronicle_sessions`
- Existing non-deleted summaries for weekly rollups

Summary outputs:

- What did I work on?
- What changed?
- What should I follow up on?
- Project/activity grouping.

AI must ignore deleted events, redacted values, local-only rejected preview data, and private-mode gaps.

Implemented behavior:

- Daily and weekly summary generation loads non-deleted `chronicle_events` for the authenticated user/workspace.
- Summary rows store `source_event_ids` so users can trace what was summarized.
- If model access is configured, the model prompt is constrained to stored events only.
- If model access is unavailable, the route stores a clearly labelled `rule_based_fallback` summary instead of pretending AI ran.

## Release 7 Privacy Controls

Implemented controls:

- `chronicle_privacy_settings.capture_paused` gates the app-internal XFlow activity prototype.
- `chronicle_privacy_settings.private_mode_enabled` blocks prototype capture while active.
- Exclusions are stored in `chronicle_capture_rules` with hashed target values.
- Redaction rules are stored in `chronicle_redaction_rules` and marked to apply before storage and summaries.
- Export-all returns events, summaries, and privacy settings for the authenticated user and marks exported event rows with an export batch.
- Delete-all soft-deletes Chronicle events, summaries, and sources for the authenticated user, then pauses capture and enables private mode.

Still required before production capture:

- Scheduled retention cleanup.
- Device credential rotation and revocation UX.
- Admin visibility regression tests across roles.
- Abuse and overcollection review for any source beyond explicit app-internal XFlow activity.
