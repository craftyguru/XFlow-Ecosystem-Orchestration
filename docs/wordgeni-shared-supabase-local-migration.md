# WordGeni Shared Supabase Local Migration

This document covers the local-only WordGeni bridge into the shared ecosystem Supabase project. It does not authorize production cutover.

## Current WordGeni DB Access Map

WordGeni currently uses its legacy API database through Drizzle/Postgres with `DATABASE_URL` and `DIRECT_DATABASE_URL`. The API owns product data such as `projects`, `documents`, `document_versions`, `sources`, `source_chunks`, `memory`/`visual_memory_profiles`, `citations`, `entities`, `entity_links`, `provenance_events`, `exports`, `ai_tasks`, `ai_logs`, `usage_events`, `subscriptions`, Stripe webhook records, workspace API keys, telemetry, and security audit records.

The web app uses Supabase browser/server/admin helpers for auth/session and profile-related flows. Server-side service-role usage remains restricted to server code. Source uploads and exports currently use local or S3-compatible object storage paths rather than the new shared `wordgeni-exports` bucket.

WordGeni integration boundaries remain:

- Verixet is the billing, entitlement, usage admission, credit, and plan authority.
- XFlow is the app connection, control-plane, auth handoff, and orchestration authority.
- Crevux is the media generation, asset, provider run, and export authority for visual workflows.

## Target Shared Supabase Access Map

The local bridge mirrors safe WordGeni product activity into:

- `core.audit_logs`
- `core.usage_events`
- `wordgeni.documents`
- `wordgeni.document_sources`
- `wordgeni.memory_cards`
- `wordgeni.writing_sessions`
- `wordgeni.provenance_items`

The bridge is server-only and disabled unless `WORDGENI_SHARED_SUPABASE_LOCAL_ENABLED=true`. It uses `@xflow-ecosystem/supabase/service-role.server` from `apps/WordGeni/apps/api/src/supabase/shared-local.server.ts`.

## Old Tables Found

Legacy WordGeni tables found during audit include:

- Identity/workspace: `users`, `workspaces`, `workspace_memberships`, `workspace_api_keys`
- Writing product: `projects`, `project_constitutions`, `style_profiles`, `documents`, `document_versions`
- Sources/retrieval: `sources`, `ingestion_runs`, `source_chunks`
- Memory/provenance: `visual_memory_profiles`, `citations`, `entities`, `entity_links`, `provenance_events`
- Crevux-facing visual workflow records: `ecosystem_projects`, `cross_app_project_links`, `ecosystem_user_links`, `cross_app_assets`, `visual_generation_jobs`, `document_asset_insertions`, `cross_app_audit_events`, `crevux_callback_nonces`, `crevux_callback_events`
- Billing/usage legacy records: `subscriptions`, `stripe_webhook_events`, `usage_events`, `billing_ledger_entries`
- Exports and verification: `exports`, `verification_runs`, `claim_spans`, `claim_evidence_links`
- AI/telemetry/security: `ai_logs`, `genie_threads`, `genie_messages`, `genie_suggestion_events`, `voice_draft_sessions`, `eval_runs`, `copilot_signals`, `system_incidents`, `ai_tasks`, `api_idempotency_records`, `cursor_idempotency_records`, `telemetry_events`, `security_audit_events`

These remain legacy runtime tables until a later app migration phase.

## New Tables Used

The local bridge writes only to:

- `core.workspaces` and `core.workspace_app_access` during smoke setup
- `core.audit_logs`
- `core.usage_events`
- `wordgeni.documents`
- `wordgeni.document_sources`
- `wordgeni.memory_cards`
- `wordgeni.writing_sessions`
- `wordgeni.provenance_items`

It does not write to Verixet billing/entitlement decision tables, XFlow app connection/control-plane tables, or Crevux media generation/asset tables.

## Required Local Env

Put shared Supabase values in root `.env.shared.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Put the WordGeni bridge flag in `apps/WordGeni/.env.local`:

```env
WORDGENI_SHARED_SUPABASE_LOCAL_ENABLED=true
```

Optional dashboard-inspection mode:

```env
WORDGENI_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Do not commit `.env.shared.local` or `apps/WordGeni/.env.local`. Service-role keys and database URLs are server-only. If a Supabase database password contains special characters, URL-encode it in `DATABASE_URL` and `DIRECT_DATABASE_URL`.

## Smoke Command

From `apps/WordGeni`:

```bash
pnpm smoke:shared-supabase-local
```

The smoke loads environment files in this order:

1. Root `.env.shared.local`
2. `apps/WordGeni/.env.local`
3. `apps/WordGeni/.env`

For shared Supabase variables, root `.env.shared.local` is preferred over legacy app `.env` values during the local smoke.

## Smoke Checks

The smoke verifies:

- DB connection/auth
- `core` schema
- `wordgeni` schema
- `core.ecosystem_apps` contains `wordgeni`
- RLS is enabled on `core.audit_logs`, `core.usage_events`, and the WordGeni app tables
- Storage bucket `wordgeni-exports` exists
- Local smoke rows can be written through the bridge
- Smoke rows are cleaned up by default

Rows are marked with:

- `source='local_smoke'`
- `environment='local'`
- `metadata.smokeTest=true`
- `metadata.smokeTestId='local-wordgeni-shared-supabase-smoke'`

## Dashboard Verification

If `WORDGENI_SHARED_SUPABASE_SMOKE_CLEANUP=false`, inspect these tables in Supabase:

- `core.workspaces`
- `core.workspace_app_access`
- `core.audit_logs`
- `core.usage_events`
- `wordgeni.documents`
- `wordgeni.document_sources`
- `wordgeni.memory_cards`
- `wordgeni.writing_sessions`
- `wordgeni.provenance_items`

Filter for `local-wordgeni-shared-supabase-smoke` in `slug` or JSON metadata.

Manual cleanup:

```sql
delete from core.audit_logs
where metadata->>'smokeTestId' = 'local-wordgeni-shared-supabase-smoke';

delete from core.workspaces
where slug = 'local-wordgeni-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-wordgeni-shared-supabase-smoke';
```

The workspace delete cascades the app rows created by the smoke.

## What Remains Legacy

This bridge does not change runtime reads/writes, app routing, auth, billing, Crevux integration, exports, source upload storage, or production database configuration. The legacy WordGeni Drizzle/Postgres schema remains the runtime source until a later controlled migration phase.

## Production Cutover Status

Production cutover is not safe yet. Before production, WordGeni still needs an app-by-app runtime migration, entitlement/API boundary integration with Verixet, connection/control-plane integration with XFlow, Crevux media boundary verification, full isolation tests, and production environment planning.
