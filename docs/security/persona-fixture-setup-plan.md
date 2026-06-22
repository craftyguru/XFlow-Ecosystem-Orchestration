# Persona Fixture Setup Plan

Date: 2026-05-10

## Summary

Disposable authenticated persona fixtures are required before live role and entitlement behavior can be proven beyond unauthenticated/direct-access probes.

Added `scripts/setup-staging-security-personas.mjs` to inspect fixture readiness, refuse unsafe production fixture mutation by default, generate an ignored local fixture template at `output/dev/auth-personas.fixture.local.json`, and seed/mint disposable local/staging personas when explicitly allowed. Added `output/dev/` to `.gitignore` so local fixture material is not committed.

Current status: no bearer/cookie fixtures were present in this environment, so fixture creation and live authenticated persona proof remain blocked. The helper detected production-like proof URLs for all six apps and refused to seed or mutate data.

## Seed And Mint Flow

Run preflight first:

```powershell
npm run security:local:preflight
```

Safe local/staging flow:

```powershell
node scripts\setup-staging-security-personas.mjs --allow-local-fixtures --seed-personas --mint-sessions
$env:AUTH_PERSONA_FIXTURES_FILE = "output/dev/auth-personas.fixture.local.json"
node scripts\authenticated-persona-security-simulation.mjs
```

For staging targets whose hostnames clearly identify staging/preview/dev/test:

```powershell
node scripts\setup-staging-security-personas.mjs --allow-staging-fixtures --seed-personas --mint-sessions
```

If the Supabase project URL does not self-identify as staging but is an isolated staging project, also set `AUTH_PERSONA_SUPABASE_IS_STAGING=1`. Do not use that flag for production customer data.

Optional XFlow cookie capture:

```powershell
node scripts\setup-staging-security-personas.mjs --allow-local-fixtures --seed-personas --mint-sessions --mint-xflow-cookies
```

Cleanup:

```powershell
node scripts\setup-staging-security-personas.mjs --allow-local-fixtures --cleanup
```

The script creates or updates disposable Supabase Auth users, creates Security Fixture Workspace A and B, assigns workspace roles, grants all six app access rows, seeds Verixet-sourced entitlement/billing state, inserts audit rows, mints Supabase bearer sessions when an anon key is available, and writes the fixture file without printing session material.

## Fixture Contract

The authenticated harness accepts persona session material from environment variables or a local JSON fixture file through `AUTH_PERSONA_FIXTURES_FILE`.

Supported env inputs:

| Persona | Bearer env | Cookie env |
| --- | --- | --- |
| Normal authenticated user | `AUTH_PERSONA_NORMAL_BEARER` or `AUTH_PERSONA_NORMAL_USER_BEARER` | `AUTH_PERSONA_NORMAL_COOKIE` or `AUTH_PERSONA_NORMAL_USER_COOKIE` |
| Workspace admin | `AUTH_PERSONA_WORKSPACE_ADMIN_BEARER` | `AUTH_PERSONA_WORKSPACE_ADMIN_COOKIE` |
| App admin | `AUTH_PERSONA_APP_ADMIN_BEARER` | `AUTH_PERSONA_APP_ADMIN_COOKIE` |
| Support admin | `AUTH_PERSONA_SUPPORT_ADMIN_BEARER` | `AUTH_PERSONA_SUPPORT_ADMIN_COOKIE` |
| Security admin | `AUTH_PERSONA_SECURITY_ADMIN_BEARER` | `AUTH_PERSONA_SECURITY_ADMIN_COOKIE` |
| Superadmin/platform owner | `AUTH_PERSONA_SUPERADMIN_BEARER` or `AUTH_PERSONA_PLATFORM_OWNER_BEARER` | `AUTH_PERSONA_SUPERADMIN_COOKIE` or `AUTH_PERSONA_PLATFORM_OWNER_COOKIE` |
| Expired/past_due user | `AUTH_PERSONA_EXPIRED_BEARER`, `AUTH_PERSONA_EXPIRED_USER_BEARER`, or `AUTH_PERSONA_PAST_DUE_BEARER` | `AUTH_PERSONA_EXPIRED_COOKIE`, `AUTH_PERSONA_EXPIRED_USER_COOKIE`, or `AUTH_PERSONA_PAST_DUE_COOKIE` |
| Canceled user | `AUTH_PERSONA_CANCELED_BEARER`, `AUTH_PERSONA_CANCELLED_BEARER`, `AUTH_PERSONA_CANCELED_USER_BEARER`, or `AUTH_PERSONA_CANCELLED_USER_BEARER` | `AUTH_PERSONA_CANCELED_COOKIE`, `AUTH_PERSONA_CANCELLED_COOKIE`, `AUTH_PERSONA_CANCELED_USER_COOKIE`, or `AUTH_PERSONA_CANCELLED_USER_COOKIE` |
| Cross-workspace user | `AUTH_PERSONA_CROSS_WORKSPACE_BEARER` or `AUTH_PERSONA_CROSS_WORKSPACE_USER_BEARER` | `AUTH_PERSONA_CROSS_WORKSPACE_COOKIE` or `AUTH_PERSONA_CROSS_WORKSPACE_USER_COOKIE` |

Optional scope env names use the same persona prefix with:

- `_WORKSPACE_ID`
- `_FOREIGN_WORKSPACE_ID`
- `_APP_SLUG`

The harness also accepts app-specific overrides such as `AUTH_PERSONA_NORMAL_XFLOW_COOKIE` or `AUTH_PERSONA_WORKSPACE_ADMIN_VERIXET_BEARER`.

## Safe Fixture File Shape

Do not commit files containing real bearer tokens or cookies. Use an ignored local path such as `output/dev/auth-personas.fixture.local.json`.

```json
{
  "normal_user": {
    "bearer": "",
    "cookie": "",
    "workspaceId": "security-workspace-a",
    "foreignWorkspaceId": "security-workspace-b",
    "appSlug": "xflow",
    "apps": {
      "xflow": { "bearer": "", "cookie": "" },
      "verixet": { "bearer": "", "cookie": "" }
    }
  }
}
```

## Persona Plan

| Persona | Email pattern | Workspace | Role | App access | Entitlement/subscription | Setup method | Cleanup method | Environment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Normal user | `security+normal-{run}@example.test` | Workspace A | `user` | Assigned apps | active/free | Supabase Auth user, workspace member, Verixet allow entitlements | `--cleanup` | Local/staging |
| Workspace admin | `security+workspace-admin-{run}@example.test` | Workspace A | `workspace_admin` | Workspace apps | active workspace plan | Supabase Auth user, workspace admin, Verixet allow entitlements | `--cleanup` | Local/staging |
| App admin | `security+app-admin-{run}@example.test` | Workspace A | `app_admin` | One app scope | active app scope | Supabase Auth user, admin workspace role, app-scoped metadata | `--cleanup` | Local/staging |
| Support admin | `security+support-admin-{run}@example.test` | Workspace A | `support_admin` | Support tools only | denied paid entitlements | Supabase Auth user, support role metadata | `--cleanup` | Local/staging |
| Security admin | `security+security-admin-{run}@example.test` | Workspace A | `security_admin` | Audit/security tools | denied paid entitlements | Supabase Auth user, security role metadata | `--cleanup` | Local/staging |
| Superadmin/platform owner | `security+platform-owner-{run}@example.test` | Workspace A/platform | `superadmin/platform_owner` | Platform tools | active | Supabase Auth user, owner role, superadmin app metadata | `--cleanup` | Staging only for mutation proof |
| Expired/past_due user | `security+past-due-{run}@example.test` | Workspace A | `user` | Recovery/account only | `past_due` denied | Supabase Auth user, Verixet deny entitlement/billing state | `--cleanup` | Local/staging |
| Canceled user | `security+canceled-{run}@example.test` | Workspace A | `user` | Recovery/account only | `canceled` denied | Supabase Auth user, Verixet deny entitlement/billing state | `--cleanup` | Local/staging |
| Cross-workspace user | `security+cross-workspace-{run}@example.test` | Workspace B | `user` | Workspace B only | active/free | Supabase Auth user, Workspace B member, Workspace A foreign ID | `--cleanup` | Local/staging |

## Verification Commands Run

- `node --check scripts/setup-staging-security-personas.mjs` - passed.
- `node --check scripts/security-local-harness-preflight.mjs` - passed.
- `npm run security:local:preflight` - blocked on current machine prerequisites; no mutation performed.
- `node scripts/setup-staging-security-personas.mjs --allow-staging-fixtures --seed-personas --mint-sessions` - refused production-like targets; no mutation performed.
- `node scripts/setup-staging-security-personas.mjs --write-template` - passed; wrote redacted summary and ignored local template.
- `node --check scripts/authenticated-persona-security-simulation.mjs` - passed.
- `node scripts/authenticated-persona-security-simulation.mjs` - passed 78/78 available probes; 9 persona classes blocked pending sessions.
- `npm run proof:production` - passed 10/10.
- `node scripts/live-attack-simulation.mjs` - passed 270/270.
- `npm run supabase:validate` - passed static RLS proof.

## Remaining Recommended Work

Point all six proof base URLs at local/staging services and rerun the seed/mint command. Then set `AUTH_PERSONA_FIXTURES_FILE=output/dev/auth-personas.fixture.local.json` and rerun `node scripts/authenticated-persona-security-simulation.mjs`.
