# Forum Analytics and Health Dashboard

## Metrics Definitions

- Published threads: `forum_threads` with status `published` or `locked`.
- Replies: published `forum_replies` attached to visible threads.
- Active users: distinct thread or reply authors in the selected range.
- Solved threads: visible threads with `accepted_reply_id`.
- Unsolved questions: visible `question` or `bug_report` threads without an accepted reply.
- Time to first reply: hours between thread creation and first published reply.
- Time to accepted solution: hours between thread creation and accepted reply creation.
- Helpful votes: stored helpful scores on visible threads and published replies.
- Moderation load: `forum_reports` plus `forum_moderation_actions`.

## Data Sources

The dashboard uses existing forum rows first: threads, replies, reactions, reports, moderation actions, XP events, user stats, badges, challenges, challenge participants/rewards, AI artifacts, rate-limit events, categories, tags, and the app registry.

The only new analytics table is `forum_search_events`, used because prior search-query logging was not present.

## Privacy Rules

- Search logging skips empty, very long, or secret-looking queries.
- Search query values are normalized and length-limited.
- Filters are reduced to safe public forum filters.
- Hidden/deleted content is not shown as raw content in analytics. It appears only as counts/signals for moderators.
- Admin analytics may show user IDs and display names according to the existing forum moderator policy, but not user emails.

## Search Logging

`/api/forum/search` writes `forum_search_events` after searches complete. Stored fields include user ID when signed in, normalized query, safe filters, result count, clicked thread ID when later supported, app scope, and timestamp.

Known limitation: clicked-result and "search led to thread creation" attribution are not yet tracked unless future UI actions write `clicked_thread_id` or attribution metadata.

## App Support Analytics

App support metrics are grouped from `app_registry`, not a hardcoded app list. Each app row shows total threads, bug-help threads, feature requests, unresolved questions, solved questions, and average first-response time.

## Abuse Signals

Signals are read-only and never auto-punish:

- High XP in a short window.
- Repeated helpful/reaction pairs between the same voter and author.
- Many reports against the same target.
- Many hidden/deleted posts by one user.
- Repeated accepted-solution XP reversals.

## Admin QA Checklist

- Moderator, superadmin, and platform owner can load `/admin/forum/analytics`.
- Workspace admin without a platform role is denied.
- Range, app, and category filters change computed values.
- Zero-result searches appear after searching with no matching results.
- App support rows come from `app_registry`.
- Hidden/deleted bodies are not exposed in tables.
- AI helper and entitlement sections show empty states when no rows exist.

## Known Limitations

- Charting is intentionally table-first until an existing chart component is adopted.
- Search-result click tracking and conversion CTA tracking are placeholders unless events are written later.
- AI secret-detection blocks are counted only when existing AI/rate-limit rows record them.
