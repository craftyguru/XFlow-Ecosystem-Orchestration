# Forum App Integration

The ecosystem forum is globally owned by XFlow and lives under `/community`. Other apps should link to scoped XFlow forum URLs instead of creating duplicate forums.

## App-Scoped URLs

- `/community?app=[appSlug]`
- `/community/search?app=[appSlug]`
- `/community/new?app=[appSlug]`
- `/community/new?app=[appSlug]&type=question`
- `/community/new?app=[appSlug]&type=bug_help`
- `/community/new?app=[appSlug]&type=feature_request`
- `/community/c/ecosystem-apps?app=[appSlug]`

`bug_help` is a URL-facing alias for the stored forum type `bug_report`.

## Registry Dependency

App scope validation must use the canonical ecosystem registry in `apps/XFlow/src/lib/ecosystem/apps.ts`.
Do not hardcode a separate six-app list in forum code. Shared helpers in `apps/XFlow/src/lib/forum/app-community.ts` normalize aliases and reject unknown scopes.

## Components

Reusable entry points live in `apps/XFlow/src/components/forum/AppCommunity.tsx`:

- `AppCommunityCard`
- `AppCommunityActions`
- `AppCommunityActivityPreview`
- `AskCommunityButton`
- `ReportAppBugButton`
- `RequestFeatureButton`

Use these on app dashboards, app detail pages, and directory cards when the slug is a valid ecosystem app slug.

## Summary API

`GET /api/forum/apps/[appSlug]/summary` returns public published data only:

- app slug and name
- total public threads
- unresolved questions
- solved threads
- recent public threads
- top tags
- last activity

Invalid app slugs return `404`.

## Invalid Slugs

Public pages should not crash on invalid `app` query values. `/community?app=unknown` falls back to the all-community view with a clean notice. Search and composer controls ignore invalid app scopes.

## QA Checklist

- `/community?app=xflow`
- `/community/search?app=xflow&q=bug`
- `/community/new?app=xflow&type=bug_help`
- `/community/new?app=xflow&type=feature_request`
- app directory community actions
- app detail community preview
- `/api/forum/apps/xflow/summary`
- invalid app slug behavior
- `/admin/forum?app=xflow` remains restricted to global forum moderators
