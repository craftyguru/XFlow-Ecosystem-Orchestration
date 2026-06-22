# Crevux Shared Supabase Local Migration

This document covers the local-only Crevux bridge into the shared ecosystem Supabase project. It does not authorize production cutover.

## Current Crevux DB Access Map

Crevux is a pnpm monorepo. The main backend is `artifacts/api-server`; the primary frontend is `artifacts/image-gen`; shared database models live in `lib/db`. The current runtime uses Drizzle/Postgres through `DATABASE_URL` and `DIRECT_DATABASE_URL`.

Current product-owned data includes projects, generated images, generated assets, 3D assets, video jobs, generation jobs, provider metadata, source enhancement jobs, lipsync jobs, audio assets, storyboard/story bible data, project studio assets/renders, asset exports, AI usage events, metered usage events, user feature usage, admin/audit/system events, and cross-app visual companion tables.

Crevux integration boundaries remain:

- Crevux is the media generation, asset, job, provider-run, export, and media project authority.
- Verixet is the billing, entitlement, usage admission, credit, and plan authority.
- XFlow is the app connection, control-plane, and orchestration authority.
- WordGeni may request or reference Crevux media through integration boundaries, but does not own Crevux media assets/jobs.

## Target Shared Supabase Access Map

The local bridge mirrors safe Crevux product activity into:

- `core.audit_logs`
- `core.usage_events`
- `crevux.projects`
- `crevux.assets`
- `crevux.generation_jobs`
- `crevux.exports`
- `crevux.provider_runs`
- `crevux.credit_spend_events`

The bridge is server-only and disabled unless `CREVUX_SHARED_SUPABASE_LOCAL_ENABLED=true`. It uses `@xflow-ecosystem/supabase/service-role.server` from `apps/CreVux/artifacts/api-server/src/supabase/shared-local.server.ts`.

## Old Tables Found

Legacy Crevux tables found during audit include:

- Identity/workspace: `users`, `workspaces`, `workspace_memberships`, `user_sessions`, `oauth_accounts`, `webauthn_credentials`
- Product/media: `projects`, `assets`, `generated_images`, `generated_assets`, `generated_3d_assets`, `generation_jobs`, `generation_job_outcomes`, `video_jobs`, `video_extend_jobs`, `lipsync_jobs`, `audio_assets`, `source_enhance_jobs`
- Studio/export: `asset_exports`, `export_presets`, `project_assets`, `project_timeline_tracks`, `project_timeline_clips`, `project_renders`, `video_compositions`, `composition_scenes`, `composition_scene_assets`, `composition_caption_segments`
- Story/production: `story_bibles`, `storyboards`, `storyboard_sequences`, `storyboard_shots`, `storyboard_snapshots`, `storyboard_comments`, `comic_pages`, `production_entities`, `production_entity_appearances`, `production_entity_hint_decisions`
- Cross-app/WordGeni visual companion: `ecosystem_projects`, `cross_app_project_links`, `cross_app_assets`, `visual_generation_jobs`, `document_asset_insertions`, `cross_app_audit_events`, `cross_app_callback_deliveries`, `cross_app_replay_nonces`
- Billing/usage legacy records: `subscription_tiers`, `stripe_webhook_events`, `ai_usage_events`, `metered_usage_events`, `user_daily_feature_usage`
- Operations/security: `audit_events`, `admin_audit_logs`, `auth_audit_events`, `system_events`, `moderation_queue`, `idempotency_records`, `builder_api_keys`

These remain legacy runtime tables until a later app migration phase.

## New Tables Used

The local smoke writes only to:

- `core.workspaces` and `core.workspace_app_access` during smoke setup
- `core.audit_logs`
- `core.usage_events`
- `crevux.projects`
- `crevux.assets`
- `crevux.generation_jobs`
- `crevux.exports`
- `crevux.provider_runs`
- `crevux.credit_spend_events`

The bridge does not write Verixet entitlement/billing decision records, XFlow app connection/control-plane records, or WordGeni document/memory records.

## Required Local Env

Put shared Supabase values in root `.env.shared.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Put the Crevux bridge flag in `apps/CreVux/.env.local`:

```env
CREVUX_SHARED_SUPABASE_LOCAL_ENABLED=true
```

Optional dashboard-inspection mode:

```env
CREVUX_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Do not commit `.env.shared.local` or `apps/CreVux/.env.local`. Service-role keys and database URLs are server-only. If a Supabase database password contains special characters, URL-encode it in `DATABASE_URL` and `DIRECT_DATABASE_URL`.

## Nested Service Env Behavior

The smoke loads the root shared env and the app root local env first. It may also load non-shared keys from:

- `apps/CreVux/artifacts/api-server/.env.local`
- `apps/CreVux/artifacts/api-server/.env`
- `apps/CreVux/artifacts/image-gen/.env.local`
- `apps/CreVux/artifacts/image-gen/.env`

Nested service env files are not allowed to override root shared Supabase values during the local smoke. If they contain `DATABASE_URL`, `DIRECT_DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`, those values are ignored for this smoke in favor of root `.env.shared.local`.

Provider keys are not required for the local shared Supabase smoke.

## Smoke Command

From `apps/CreVux`:

```bash
pnpm smoke:shared-supabase-local
```

Runtime Phase 4F smoke:

```bash
pnpm smoke:shared-supabase-runtime
```

The runtime smoke is separate from the local bridge smoke. It requires:

```env
CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true
CREVUX_SHARED_SUPABASE_READ_MODE=legacy
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

The runtime smoke does not call Stripe and does not require real provider API keys. If local Crevux env files contain Stripe values, use this local-only switch to run without loading app-local Stripe keys:

```env
CREVUX_SHARED_SUPABASE_RUNTIME_SMOKE_ALLOW_NO_STRIPE=true
```

This switch is refused in production, requires `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`, and still refuses any effective live Stripe key such as `sk_live` or a live webhook secret. If Stripe is intentionally configured for smoke, use test-mode values only, such as `STRIPE_SECRET_KEY=sk_test_...` and a test/smoke-safe `STRIPE_WEBHOOK_SECRET`.

## Smoke Checks

The smoke verifies:

- DB connection/auth
- `core` schema
- `crevux` schema
- `core.ecosystem_apps` contains `crevux`
- RLS is enabled on `core.audit_logs`, `core.usage_events`, and the Crevux app tables
- Storage bucket `crevux-assets` exists
- Local smoke rows can be written through the bridge
- Smoke rows are cleaned up by default
- No real provider API keys are required

Rows are marked with:

- `source='local_smoke'`
- `environment='local'`
- `metadata.smokeTest=true`
- `metadata.smokeTestId='local-crevux-shared-supabase-smoke'`

## Dashboard Verification

If `CREVUX_SHARED_SUPABASE_SMOKE_CLEANUP=false`, inspect these tables in Supabase:

- `core.workspaces`
- `core.workspace_app_access`
- `core.audit_logs`
- `core.usage_events`
- `crevux.projects`
- `crevux.assets`
- `crevux.generation_jobs`
- `crevux.exports`
- `crevux.provider_runs`
- `crevux.credit_spend_events`

Filter for `local-crevux-shared-supabase-smoke` in `slug` or JSON metadata.

Manual cleanup:

```sql
delete from core.audit_logs
where metadata->>'smokeTestId' = 'local-crevux-shared-supabase-smoke';

delete from core.workspaces
where slug = 'local-crevux-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-crevux-shared-supabase-smoke';
```

The workspace delete cascades the app rows created by the smoke.

## What Remains Legacy

This bridge does not change runtime reads/writes, app routing, auth, billing, provider integrations, generation pipelines, storage paths, visual companion behavior, or production database configuration. The legacy Crevux Drizzle/Postgres schema remains the runtime source until a later controlled migration phase.

## Production Cutover Status

Production cutover is not safe yet. Before production, Crevux still needs an app-by-app runtime migration, Verixet entitlement/API boundary integration, XFlow control-plane integration, WordGeni visual companion boundary verification, full isolation tests, provider pipeline validation, storage migration planning, and production environment planning.
