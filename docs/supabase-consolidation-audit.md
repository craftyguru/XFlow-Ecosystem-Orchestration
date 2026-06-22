# Supabase Consolidation Audit

Date: 2026-05-04

Apps audited: XFlow, Verixet, AudAiX, Rataify, WordGeni, Crevux.

This audit is the Phase 1 baseline for moving the ecosystem to one new shared Supabase project. It does not assume old Supabase projects can be deleted, does not include secrets, and does not change runtime app code.

## Executive Summary

The workspace contains six connected apps with separate database and Supabase/Postgres patterns. XFlow and Verixet already act as ecosystem authorities in code and documentation, while the product apps still contain local mirrors or legacy implementations for billing, identity, usage, storage, or app connection state.

The new shared project should use `core.*` for shared ecosystem records, app schemas for app-owned product data, and service/API boundaries for business logic. App schemas should not be directly exposed to browser clients by default. Browser clients may use framework-appropriate Supabase auth env names, but app data access should normally flow through app server routes, server actions, or API routes.

## Current Supabase Usage Per App

| App | Supabase/Postgres usage observed | Current migration source | Browser usage | Server usage | Service-role/storage notes |
| --- | --- | --- | --- | --- | --- |
| XFlow | Postgres/Drizzle schema for users, workspaces, apps, connections, events, identity, billing mirrors, UCL, OAuth, and Verixet bindings | `apps/XFlow/drizzle/migrations` | Mostly Next app runtime; no new browser schema exposure planned | `DATABASE_URL` via DB helpers and migration scripts | XFlow remains control-plane/app connection authority |
| Verixet | Supabase auth helpers plus Drizzle SQL migrations for billing, Stripe, entitlements, usage, XFlow OAuth/bindings, dashboard sessions | `apps/Verixet/drizzle` | Next middleware/auth client uses anon key where configured | Server routes use Supabase auth and DB access | `SUPABASE_SERVICE_ROLE_KEY` appears in server/test-user tooling; must remain server-only |
| AudAiX | Vite dashboard Supabase browser client, backend Postgres repositories, Supabase bootstrap schema, smoke scripts | `apps/AudAix/src/persistence/supabase-schema.ts` plus SQLite migration parity | `apps/AudAix/dashboard/src/lib/supabase-browser.ts` | Backend uses `DIRECT_DATABASE_URL`/`DATABASE_URL` for Postgres repositories | Current bootstrap creates shared-like tables locally; migrate into `core.*` and `audaix.*` |
| Rataify | Drizzle schema/migrations with local users, orgs, profiles, billing, credits, UCL, connected apps, audits, evidence/risk data | `apps/RatAiFy/migrations` and `shared/schema.ts` | Vite client; no direct app-schema access should be added | Express/server DB via `DATABASE_URL` | Local Stripe/billing tables conflict with Verixet authority unless treated as legacy/cache |
| WordGeni | Next web Supabase auth clients, API Drizzle schema, migrations for Supabase auth source of truth and ecosystem user links | `apps/WordGeni/apps/api/drizzle` | `apps/WordGeni/apps/web/src/lib/supabase/*` uses browser/server/admin helpers | API and web server use direct DB/Supabase env | Service-role helper exists in web server-side code; validate no browser import path leaks |
| Crevux | Postgres/Drizzle DB package, private Supabase storage support, API env validation, many media/billing/auth migrations | `apps/CreVux/lib/db/migrations` | Image-gen frontend must not receive service-role keys | API server uses DB pool and optional Supabase storage service key | Storage code reads `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_STORAGE_SERVICE_KEY` server-side only |

## Current Env Var Map

Framework-specific public env names are valid:

| Framework | Public Supabase env |
| --- | --- |
| Next.js | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Vite | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

Server-only shared Supabase/Postgres env:

| Env var | Visibility | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Server-only or server config | May mirror the public project URL for server code |
| `SUPABASE_ANON_KEY` | Server-safe, public value | May be used server-side where anon-scoped calls are intentional |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Never `NEXT_PUBLIC_*`, never `VITE_*`, never bundled |
| `DATABASE_URL` | Server-only secret | Pooled/runtime Postgres URL where used |
| `DIRECT_DATABASE_URL` | Server-only secret | Direct/session Postgres URL for migrations where used |

Known related env families:

| Area | Examples found or required |
| --- | --- |
| Supabase auth | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, app-specific JWT/JWKS vars |
| Database | `DATABASE_URL`, `DIRECT_DATABASE_URL`, app-specific migration test DB URLs |
| Storage | Crevux private media storage uses `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_SERVICE_KEY`, and bucket envs today |
| Verixet authority | `VERIXET_API_URL`, `VERIXET_USAGE_INGEST_URL`, app-scoped Verixet usage tokens |
| XFlow authority | `XFLOW_BASE_URL`, `XFLOW_UCL_EVENTS_URL`, bootstrap/control-plane tokens |
| Stripe | Verixet owns production Stripe keys; consumer app Stripe vars should become local/legacy/cache-only unless explicitly retained |

Forbidden patterns:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- any public env var containing `SERVICE_ROLE`
- any browser bundle reference to service-role keys
- client-side database URLs

## Duplicate Model Analysis

| Duplicate concept | Current pattern | Consolidation target |
| --- | --- | --- |
| Users/profiles | Local users/profiles in several apps; Supabase auth in Verixet/WordGeni/AudAiX flows | `auth.users` plus `core.profiles` |
| Workspaces/orgs | XFlow workspaces, Verixet workspaces, AudAiX workspaces, Rataify orgs, Crevux workspaces | `core.workspaces`, `core.workspace_members` |
| App access/memberships | App-specific app memberships and connected app links | `core.workspace_app_access`, `core.app_connections` |
| Billing/accounts/plans | Verixet plus local billing in Rataify, WordGeni, Crevux, AudAiX | Verixet service boundary plus `verixet.*` and `core.billing_events` |
| Entitlements/credits/usage | Verixet authority plus local ledgers and caches | Verixet APIs and `core.entitlements`, `core.usage_events`, `verixet.*` |
| Audit logs | Multiple `audit_logs`/security log tables | `core.audit_logs` for ecosystem audit, app schemas for product-specific findings |
| Storage/uploads | Crevux private storage, AudAiX report/artifact files, Rataify evidence, WordGeni exports | App-specific buckets only |

## Proposed Unified Schema

Shared schema:

- `core.profiles`
- `core.workspaces`
- `core.workspace_members`
- `core.ecosystem_apps`
- `core.workspace_app_access`
- `core.app_connections`
- `core.entitlements`
- `core.usage_events`
- `core.billing_events`
- `core.audit_logs`

App schemas:

| Schema | Product-owned tables in Phase 1 |
| --- | --- |
| `xflow` | `runs`, `control_plane_events`, `app_links`, `deployment_checks`, `workflow_runs` |
| `verixet` | `billing_accounts`, `stripe_connections`, `checkout_sessions`, `entitlement_decisions`, `credit_ledger`, `usage_admission_logs` |
| `audaix` | `audits`, `audit_reports`, `monitors`, `audit_findings`, `scan_jobs` |
| `rataify` | `sites`, `reviews`, `issues`, `risk_events`, `evidence_items` |
| `wordgeni` | `documents`, `document_sources`, `memory_cards`, `writing_sessions`, `provenance_items` |
| `crevux` | `projects`, `assets`, `generation_jobs`, `exports`, `provider_runs`, `credit_spend_events` |

## RLS Plan

- Enable RLS on every `core.*` and app-owned table.
- Shared helper functions:
  - `core.is_workspace_member(workspace_id)`
  - `core.is_workspace_admin(workspace_id)`
  - `core.has_workspace_app_access(workspace_id, app_slug)`
  - `core.is_service_role()`
- Normal authenticated reads require workspace membership and, for app schemas, app access.
- Writes to app schemas are service-role-only in Phase 1.
- Verixet-owned entitlement and billing writes are service-role-only and must be performed through Verixet server/API code.
- XFlow connection/control-plane writes are service-role-only and must be performed through XFlow server/API code.
- Audit log writes are service-role-only to prevent client-side tampering.

## Direct Supabase Browser Access Policy

Default policy: no direct app-schema browser access.

| App | Phase 1 browser access policy | Notes |
| --- | --- | --- |
| XFlow | Full server-only for app schema | Browser should use Next/server routes for control-plane state |
| Verixet | Full server-only for app schema | Browser may use Supabase auth anon flows where already required |
| AudAiX | Full server-only for app schema | Vite dashboard should call AudAiX API for product data |
| Rataify | Full server-only for app schema | Vite client should call Rataify API for product data |
| WordGeni | Full server-only for app schema | Next browser Supabase usage should remain auth/session oriented |
| Crevux | Full server-only for app schema | Media generation and storage writes stay behind API server |

Any exception must document why direct browser access is required, exact table/policy, allowed operations, and tests proving workspace/app/user isolation.

## Tables Safe For Browser Access

Default: none.

No app-owned product table is approved for direct browser access in Phase 1. Future entries must include table name, reason, allowed operations, exact RLS policy, and isolation tests.

## Future Extraction Checklist

| App | Owned schema | Owned bucket | Core dependency | Verixet dependency | XFlow dependency | Split requirement |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | `xflow` | `xflow-artifacts` | profiles, workspaces, app registry, audit logs | Reads Verixet decisions through API | Authority owner | Export `xflow.*` plus relevant core connection rows |
| Verixet | `verixet` | `verixet-billing-artifacts` | workspaces, profiles, usage/billing/audit logs | Authority owner | Uses XFlow app/workspace connection context | Export `verixet.*`, billing history, and entitlement APIs |
| AudAiX | `audaix` | `audaix-reports` | workspace/app access, audit logs | Entitlement and usage admission API | Connection/control-plane API | Export `audaix.*`; replace core refs with imported tenant map |
| Rataify | `rataify` | `rataify-evidence` | workspace/app access, audit logs | Entitlement and usage admission API | Connection/control-plane API | Export `rataify.*`; remove any direct AudAiX dependency |
| WordGeni | `wordgeni` | `wordgeni-exports` | workspace/app access, profiles | Entitlement and usage admission API | Auth/connection handoff API | Export `wordgeni.*`; keep Crevux integration API-based |
| Crevux | `crevux` | `crevux-assets` | workspace/app access, audit logs | Entitlement and credit admission API | Connection/control-plane API | Export `crevux.*`; no direct WordGeni table dependency |

## Migration Order

1. Core shared schema
2. Core RLS
3. Verixet schema and RLS
4. XFlow schema and RLS
5. AudAiX schema and RLS
6. Rataify schema and RLS
7. WordGeni schema and RLS
8. Crevux schema and RLS
9. Storage buckets
10. Seed `core.ecosystem_apps`
11. Validation checks

The root migration filenames preserve the requested domain separation even though the safest runtime rollout still migrates Verixet and XFlow before product apps.

## Manual Supabase Dashboard Checklist

- Create the new Supabase project manually.
- Collect project URL, anon key, service-role key, pooled `DATABASE_URL`, and direct `DIRECT_DATABASE_URL`.
- Configure Auth Site URL for the production control-plane/auth entrypoint.
- Add redirect URLs for every app production URL and local dev callback URL.
- Apply `supabase/migrations` in filename order.
- Verify `core` and app schemas exist.
- Verify RLS is enabled on all user-facing tables.
- Verify app schemas are not exposed directly to `anon` or `authenticated`.
- Verify app storage buckets are private.
- Add real env values to local and production secret stores only.
- Keep old Supabase projects until shared migration, smoke tests, backup, and rollback checks pass.
- Configure backups and document restore drills before launch.
