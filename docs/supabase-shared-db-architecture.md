# Supabase Shared Database Architecture

Date: 2026-05-04

## Summary

The shared Supabase project uses one database with clear schema boundaries:

- This orchestration repository is the sole canonical migration authority for shared `auth`,
  `core`, profile/onboarding, RLS, grant, and function structures.
- `core.*` stores ecosystem-wide source-of-truth records.
- `xflow.*`, `verixet.*`, `audaix.*`, `rataify.*`, `wordgeni.*`, and `crevux.*` store app-owned product data.
- Browser clients do not directly access app schemas by default.
- Verixet remains the billing, entitlement, usage, credit, plan, and Stripe authority.
- XFlow remains the app-linking, connection, control-plane, and orchestration authority.

Before changing connection persistence or integration status logic, follow the [Six-App Connection Discipline](six-app-connection-discipline.md).

## Access Pattern

Preferred access pattern:

1. Browser calls app server/API route/server action.
2. Server validates auth, workspace membership, app access, and entitlement.
3. Server reads/writes Supabase/Postgres.
4. Product app calls Verixet API for billing, usage, credit, and entitlement decisions.
5. Product app calls XFlow API for connection and control-plane state.

Direct Supabase browser access to app schemas is not approved in Phase 1.

## Data API Schema Exposure And Grants

For server-side Supabase client access through PostgREST, the Supabase Dashboard Data API exposed schemas must include:

- `core`
- `xflow`
- `verixet`
- `audaix`
- `rataify`
- `wordgeni`
- `crevux`

Dashboard schema exposure is not enough by itself. PostgREST also requires database privileges on the custom schemas and tables. Migration `100_api_role_grants.sql` grants `usage` on custom schemas and table/sequence privileges to `authenticated` and `service_role`, while intentionally avoiding broad `anon` custom-schema writes.

RLS remains the user/workspace/app isolation boundary for normal authenticated access. `service_role` is server-only and bypasses RLS, so `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to browser/client code.

## Phase 2 Shared Helper Layer

The shared helper package lives at:

```text
packages/ecosystem-supabase
```

It provides future migration entrypoints without changing current app runtime wiring:

- `@xflow-ecosystem/supabase/browser`: `createBrowserSupabaseClient`
- `@xflow-ecosystem/supabase/server`: `createServerSupabaseClient`
- `@xflow-ecosystem/supabase/service-role.server`: `createServiceSupabaseClient`
- `@xflow-ecosystem/supabase`: `getCurrentUser`, `getCurrentWorkspace`, `requireWorkspaceMember`, `requireWorkspaceAppAccess`, `requireEntitlement`, `recordUsageEvent`, `writeAuditLog`

The package root intentionally does not export `createServiceSupabaseClient`. Service-role access must be an explicit server-only import from `service-role.server`, and the repo validator fails if that helper is referenced from likely browser/client files.

### Helper Responsibilities

| Helper | Intended caller | Responsibility |
| --- | --- | --- |
| `createBrowserSupabaseClient` | Browser auth/session code only | Create anon-key clients using Next.js or Vite public env names |
| `createServerSupabaseClient` | API routes, server actions, Express handlers | Create anon-key server clients for user-context reads protected by RLS |
| `createServiceSupabaseClient` | Trusted server-only modules | Create service-role clients for server authority writes and operational jobs |
| `getCurrentUser` | Server or browser auth/session code | Resolve the current Supabase auth user |
| `getCurrentWorkspace` | Server routes preferred | Load a workspace visible to the current user/RLS context |
| `requireWorkspaceMember` | Server routes preferred | Fail closed unless the user is an active workspace member |
| `requireWorkspaceAppAccess` | Server routes preferred | Fail closed unless the workspace has active/trialing access to the app |
| `requireEntitlement` | Server routes only for product gates | Read Verixet-authored entitlement rows and fail closed on deny/expiry |
| `recordUsageEvent` | Server routes/service jobs | Insert usage events through trusted server paths |
| `writeAuditLog` | Server routes/service jobs | Insert tamper-resistant audit events through trusted server paths |

### Browser Versus Server Usage

Browser clients may use the anon key for Supabase Auth/session flows and narrowly approved read-only profile/session experiences. Browser clients must not write app-owned product tables, invoke service-role helpers, access app schemas directly, or make billing/control-plane decisions.

Server routes are required for:

- writes to app-owned schemas
- any use of `createServiceSupabaseClient`
- storage object writes, signed URLs, and private bucket mediation
- entitlement checks that gate paid features
- usage metering and credit spend recording
- XFlow connection/control-plane mutations
- audit log writes

Verixet remains the billing, entitlement, usage, credit, plan, and Stripe authority. Other apps may read Verixet-authored decisions through helper/API boundaries, but must not reimplement entitlement logic with direct SQL.

XFlow remains the app connection, link state, control-plane, and orchestration authority. Other apps must not directly mutate XFlow-owned connection/control-plane state.

XFlow's own Drizzle chain is applied only after the orchestration shared schema and validation
gates. In particular, XFlow migration `0052_first_run_onboarding_state.sql` depends on the canonical
`core.profiles` table. XFlow's local navigation-QA compatibility shim is not hosted schema authority.

## Schema Boundaries

| Schema | Responsibility |
| --- | --- |
| `core` | Shared identity profile, workspace, app registry, app access, connection references, usage, billing event, audit event records |
| `xflow` | Control-plane product data and orchestration records |
| `verixet` | Billing, Stripe, entitlement, credit, and usage-admission product data |
| `audaix` | Audit, report, monitor, finding, and scan job product data |
| `rataify` | Site, review, risk, issue, and evidence product data |
| `wordgeni` | Document, source, memory, writing session, and provenance product data |
| `crevux` | Media project, asset, generation job, provider run, export, and credit spend product data |

## RLS Strategy

All user-facing tables have RLS enabled.

Core helpers:

- `core.is_workspace_member(workspace_id)`
- `core.is_workspace_admin(workspace_id)`
- `core.has_workspace_app_access(workspace_id, app_slug)`
- `core.is_service_role()`

Read access:

- `core.profiles`: the owning user can read/update their own profile.
- `core.workspaces` and workspace membership/access tables: workspace members can read.
- app schemas: workspace members can read only when the workspace has access to that app.

Write access:

- Phase 1 app-schema writes are service-role-only.
- Entitlement and billing writes are Verixet-authority server operations.
- Control-plane/connection writes are XFlow-authority server operations.
- Audit writes are server-only to prevent client tampering.

## Direct Supabase Browser Access Policy

| App | Policy |
| --- | --- |
| XFlow | Full server-only for `xflow.*` |
| Verixet | Full server-only for `verixet.*` |
| AudAiX | Full server-only for `audaix.*` |
| Rataify | Full server-only for `rataify.*` |
| WordGeni | Full server-only for `wordgeni.*` |
| Crevux | Full server-only for `crevux.*` |

Allowed browser Supabase usage is limited to framework auth/session flows using anon keys unless a future table is explicitly approved.

## Tables Safe For Browser Access

None in Phase 1.

To approve a future table for browser access, document:

- table name
- why direct access is required
- allowed operations: `select`, `insert`, `update`, `delete`
- exact RLS policy
- isolation tests for workspace, app, and user boundaries

## Env Contract

Next.js browser env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Vite browser env:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-only env:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

Rules:

- anon key may be public
- service-role key is server-only
- database URLs are server-only
- public env vars must not contain `SERVICE_ROLE`
- browser bundles must not reference service-role keys

## Local Shared Env Loading

Local migration scripts may load shared Supabase values from the repo root:

```text
.env.shared.local
```

The committed template is:

```text
.env.shared.example
```

The intended local load order is:

1. root `.env.shared.local`
2. app `.env.local`
3. app `.env`

This avoids copying the same shared Supabase URL, anon key, service-role key, and database URLs into every app during local bridge testing. App-local files still own app-specific secrets and may override shared values for a deliberate local test.

This is a local development convention only. Production deployments must set required env vars on each deployed app/service through that platform's secret manager.

## Storage

Buckets are app-specific and private:

- `xflow-artifacts`
- `verixet-billing-artifacts`
- `audaix-reports`
- `rataify-evidence`
- `wordgeni-exports`
- `crevux-assets`

Storage access is server-only in Phase 1. Public or authenticated browser object access requires the same approval standard as direct browser table access.
