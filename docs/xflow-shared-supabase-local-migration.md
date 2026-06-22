# XFlow Shared Supabase Local Migration

Date: 2026-05-04

## Scope

This is a local-only bridge for XFlow. It does not deploy, change production envs, remove legacy XFlow migrations, or cut runtime traffic over to the shared Supabase project.

XFlow remains the authority for control-plane, app-linking, UCL, workflow, deploy validation, app connection, and ecosystem orchestration state.

## Current XFlow DB Access Map

XFlow currently uses Drizzle/Postgres as its runtime database path:

- Drizzle schema: `apps/XFlow/drizzle/schema/*`
- Drizzle migrations: `apps/XFlow/drizzle/*`
- DB env: `DATABASE_URL`
- Direct DB tooling/scripts: `apps/XFlow/scripts/*`
- Auth/session: NextAuth in `apps/XFlow/src/auth.ts` and route/session helpers
- Workspace logic: `workspaces`, `workspace_members`, invitations, RBAC roles
- App connection/linking: `apps`, `app_environments`, `app_connections`, UCL tables, OAuth workspace links, Verixet workspace bindings
- Control-plane events: `events`, `event_dedupes`, `event_ingest_attempts`, UCL events
- Deploy validation: `deployment_targets`, `deployment_railway_credentials`, verification scripts/actions

No XFlow production runtime path is changed by this bridge.

## Legacy Tables Found

Representative legacy tables found in XFlow Drizzle schema:

```text
users, workspaces, workspace_members, roles, permissions, apps,
app_environments, app_capabilities, app_connections,
connection_bootstrap_challenges, app_registry, workspace_app_connections,
workspace_app_tokens, ucl_events, ucl_validation_runs, ucl_repair_actions,
ecosystem_audit_requests, events, event_dedupes, event_ingest_attempts,
deployment_targets, deployment_railway_credentials, oauth_clients,
oauth_authorization_codes, oauth_workspace_links, oauth_access_tokens,
oauth_refresh_tokens, oauth_link_managed_credentials,
verixet_workspace_bindings, verixet_signal_activations, audits,
api_keys, service_tokens, feature_flags, workspace_settings, job_runs
```

## Shared Schema Mapping

| XFlow authority area | Shared target |
| --- | --- |
| Workspace/app connection mirror | `core.app_connections` |
| Control-plane audit trail | `core.audit_logs` |
| Control-plane events | `xflow.control_plane_events` |
| App linking state | `xflow.app_links` |
| Deploy validation smoke/bridge rows | `xflow.deployment_checks` |
| Workflow/orchestration smoke/bridge rows | `xflow.workflow_runs` |

Shared Supabase values should come from root `.env.shared.local`. XFlow-specific local bridge flags belong in `apps/XFlow/.env.local`.

## Env Vars

Required for the smoke:

```text
XFLOW_SHARED_SUPABASE_LOCAL_ENABLED=true
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
```

`DIRECT_DATABASE_URL` is preferred when present. The smoke prints only safe DB target metadata: username, host, database, and source file.

Optional:

```text
XFLOW_SHARED_SUPABASE_SMOKE_CLEANUP=false
```

Set this only when you want to inspect smoke rows in the Supabase dashboard.

## Smoke Command

```powershell
cd apps/XFlow
npm run smoke:shared-supabase-local
```

The smoke checks:

- DB connection
- `core` schema
- `xflow` schema
- `core.ecosystem_apps` contains `xflow`
- RLS on relevant `core` and `xflow` tables
- `xflow-artifacts` storage bucket
- service-role Supabase writes to XFlow-owned shared tables

Rows are marked with:

```json
{
  "smokeTest": true,
  "smokeTestId": "local-xflow-shared-supabase-smoke",
  "source": "local_smoke",
  "environment": "local",
  "authority": "xflow"
}
```

Tables written by the smoke:

- `core.workspaces`
- `core.workspace_app_access`
- `core.app_connections`
- `core.audit_logs`
- `xflow.control_plane_events`
- `xflow.app_links`
- `xflow.deployment_checks`
- `xflow.workflow_runs`

By default, the smoke cleans up its own marked rows. If cleanup is disabled, verify rows in the dashboard by filtering for:

```text
metadata->>smokeTestId = local-xflow-shared-supabase-smoke
payload->>smokeTestId = local-xflow-shared-supabase-smoke
result->>smokeTestId = local-xflow-shared-supabase-smoke
```

Manual cleanup:

```sql
delete from core.audit_logs
where metadata->>'smokeTestId' = 'local-xflow-shared-supabase-smoke';

delete from core.workspaces
where slug = 'local-xflow-shared-supabase-smoke'
  and metadata->>'smokeTestId' = 'local-xflow-shared-supabase-smoke';
```

Deleting the smoke workspace cascades related XFlow smoke rows.

## What Remains Legacy

Runtime XFlow reads/writes still use the existing Drizzle/Postgres models. This bridge mirrors selected local authority events only after the existing XFlow logic has made its decision. Production cutover remains unsafe until a separate historical backfill, rollback plan, production-like smoke, and route-by-route migration plan are complete.
