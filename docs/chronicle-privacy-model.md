# Chronicle Privacy Model

Chronicle privacy is built around user control, least capture, and clear boundaries between private user activity and workspace administration.

## Visibility Model

Private to the user:

- Raw event payloads.
- Event notes and source-specific metadata.
- Sessions inferred from a user's activity.
- Daily and weekly summaries.
- Follow-up suggestions.
- Excluded apps/sites and redaction rules when revealing them would disclose private behavior.

Visible to workspace admins:

- Whether Chronicle is enabled for the workspace.
- Workspace-level policy configuration.
- Source type availability.
- Aggregated operational health, such as failed ingest counts.
- Audit log entries showing that a user changed Chronicle settings, deleted data, exported data, or linked a device.

Not visible to admins:

- A user's raw timeline.
- A user's summaries.
- A user's private-mode intervals.
- A user's exact app/site history.
- Redacted values or original values before redaction.
- Local-only preview data that was never uploaded.

## User Controls

Chronicle must provide these controls before production capture:

- Pause capture globally.
- Pause capture by source.
- Private mode with clear start/end state.
- Excluded apps and sites.
- Redaction rules for titles, URLs, project names, keywords, and source payload fields.
- Local preview before upload for browser/desktop capture sources.
- Delete single event.
- Delete time range.
- Delete source history.
- Delete all Chronicle data.
- Export all Chronicle data.
- Retention period selection within workspace policy limits.

## Pause And Private Mode

Pause capture stops new events for the selected scope. It must not delete existing events unless the user explicitly chooses deletion.

Private mode is a stronger temporary state:

- No automatic capture sources may upload events.
- Manual events may still be created if the user explicitly submits them.
- Private-mode intervals are stored only as settings/audit state needed to enforce capture suppression.
- Admins may see that capture is paused by policy state, but not the user's private-mode reason or hidden activity.

## Delete Requirements

Deletion must support:

- Event-level deletion.
- Session-level deletion that deletes or detaches its events.
- Date-range deletion.
- Source-level deletion.
- Full account/workspace Chronicle deletion for a user.

Deletes must:

- Mark export packages stale.
- Remove or tombstone dependent summaries.
- Record an audit event without storing deleted content in the audit log.
- Be idempotent.
- Respect legal hold only if a future enterprise policy explicitly exists and is disclosed.

## Export Requirements

Exports must include:

- Events visible to the requesting user.
- Session records.
- Daily and weekly summaries.
- Source labels.
- Privacy settings.
- Capture, redaction, and retention rules.
- Device link metadata.
- Audit event references relevant to Chronicle user actions.

Exports must not include:

- Other users' private events.
- Redacted original values.
- Secrets or service credentials.
- Local-only preview data that was never uploaded.

## Retention Policy

Each event, session, summary, source, rule, and device link must carry enough fields to enforce retention:

- `retention_policy_id` or policy key.
- `retention_expires_at`.
- `delete_requested_at`.
- `deleted_at`.
- `exportable_until` where relevant.

Default retention should be conservative until reviewed. Release 2 must choose exact defaults, but no source should default to indefinite raw event retention without explicit workspace and user consent.

## Local-Only Vs Cloud

Local-only:

- Raw desktop/browser preview observations before upload.
- Excluded app/site matches.
- Redaction previews before the redacted event is accepted.
- Any source data the user rejects during preview.

Cloud:

- Manual events submitted through the Release 3 API.
- XFlow/app-internal events after the user enables that source.
- Redacted source metadata accepted by the user.
- Summaries generated from stored cloud events.

## AI Summary Boundary

AI may summarize only stored Chronicle events available to the requesting user. It must not:

- Use raw local preview data that was not uploaded.
- Infer hidden activity during pause/private mode.
- Reconstruct redacted values.
- Summarize other users' private activity into an admin-facing view.
- Use external training retention unless explicitly covered by the selected AI provider policy.

## Security Risks

Primary risks:

- Overcollection by a future capture agent.
- Sensitive titles, URLs, or project names leaking through event metadata.
- Admin overreach into private user timelines.
- Prompt injection or data exfiltration through AI summaries.
- Incomplete deletion across summaries and exports.
- Retention jobs missing derived data.
- Device link abuse or stale agent credentials.

Required mitigations:

- Source allowlists, not broad capture.
- RLS on every Chronicle table.
- Explicit user ownership checks for every read/write.
- Redaction before storage when possible.
- Audit logs for settings, deletion, export, and device-link actions.
- Short-lived device credentials.
- Summary regeneration after deletion/redaction changes.

