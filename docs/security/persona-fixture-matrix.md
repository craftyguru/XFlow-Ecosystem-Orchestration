# Persona Fixture Matrix

Date: 2026-05-10

## Summary

This matrix defines the persona fixtures needed for live authenticated proof. The harness is ready and now accepts the requested env aliases, but authenticated session material was not available in the current environment.

`scripts/setup-staging-security-personas.mjs --write-template` created the ignored local template `output/dev/auth-personas.fixture.local.json` and a redacted readiness summary. `--allow-staging-fixtures --seed-personas --mint-sessions` refused to seed/mutate because the configured proof URLs are production-like and disposable-production fixture flags were not set.

## Matrix

| Persona | Role | Workspace | App access | Entitlement state | Subscription state | Expected allowed | Expected denied | Creation method | Tested |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unauthenticated visitor | public | none | public routes only | none | none | Marketing/trust pages | Admin, platform, internal, billing authority APIs | Built into harness | Live/proof URL |
| Normal authenticated user | user | Own workspace | Assigned apps | Free/active as seeded | active/free | Own dashboard/account | Admin, platform, cross-workspace, billing authority | XFlow staging signup or app smoke fixture | Blocked: no session fixture |
| Workspace admin | workspace_admin | Own workspace | Assigned apps | Workspace plan | active | Workspace members/settings/billing recovery | Platform-wide admin, other workspaces | XFlow/Verixet staging fixture | Blocked: no session fixture |
| App admin | app_admin | Own workspace | One app scope | App-specific | active | App admin scope only | Superadmin/platform, other apps/workspaces | App-specific staging fixture if supported | Blocked: no session fixture |
| Support admin | support_admin | Support scope | Support tools only | none | none | Support queue/limited admin tools | Billing secrets, entitlement mutation, superadmin | XFlow support-admin staging fixture | Blocked: no session fixture |
| Security admin | security_admin | Security scope | Audit/security tools | none | none | Audit/security surfaces | Billing/entitlement mutation unless explicitly granted | XFlow/Verixet staging fixture | Blocked: no session fixture |
| Superadmin/platform owner | superadmin/platform_owner | Platform | All | Platform | active | Platform tools | None expected for read-only platform proof | Dedicated staging platform owner with MFA/freshness | Blocked: no session fixture |
| Expired/past_due user | user | Own workspace | Assigned apps | denied/recovery only | past_due | Account and billing recovery | Paid features and entitlement claims | Verixet staging subscription fixture | Blocked: no session fixture |
| Canceled user | user | Own workspace | Assigned apps | denied/recovery only | canceled | Account and billing recovery | Paid features and entitlement claims | Verixet staging subscription fixture | Blocked: no session fixture |
| Cross-workspace user | user | Workspace B | B only | active/free | active/free | Own workspace | Workspace A data/mutations/object IDs | Two-workspace staging fixture | Blocked: no session fixture |

## Fixture File Shape

```json
{
  "normal_user": {
    "bearer": "",
    "cookie": "",
    "workspaceId": "workspace-a",
    "foreignWorkspaceId": "workspace-b",
    "appSlug": "xflow",
    "apps": {
      "xflow": { "bearer": "", "cookie": "" },
      "verixet": { "bearer": "", "cookie": "" }
    }
  }
}
```

Cookie-based fixtures may use `cookie` instead of `bearer`. Do not commit fixture files containing real auth material.

Preferred env aliases:

- `AUTH_PERSONA_NORMAL_BEARER` or `AUTH_PERSONA_NORMAL_COOKIE`
- `AUTH_PERSONA_WORKSPACE_ADMIN_BEARER` or `AUTH_PERSONA_WORKSPACE_ADMIN_COOKIE`
- `AUTH_PERSONA_APP_ADMIN_BEARER` or `AUTH_PERSONA_APP_ADMIN_COOKIE`
- `AUTH_PERSONA_SUPPORT_ADMIN_BEARER` or `AUTH_PERSONA_SUPPORT_ADMIN_COOKIE`
- `AUTH_PERSONA_SECURITY_ADMIN_BEARER` or `AUTH_PERSONA_SECURITY_ADMIN_COOKIE`
- `AUTH_PERSONA_SUPERADMIN_BEARER` or `AUTH_PERSONA_SUPERADMIN_COOKIE`
- `AUTH_PERSONA_EXPIRED_BEARER` or `AUTH_PERSONA_EXPIRED_COOKIE`
- `AUTH_PERSONA_CANCELED_BEARER` or `AUTH_PERSONA_CANCELED_COOKIE`
- `AUTH_PERSONA_CROSS_WORKSPACE_BEARER` or `AUTH_PERSONA_CROSS_WORKSPACE_COOKIE`

## Remaining Recommended Work

Use disposable staging accounts and workspaces only. The harness should be promoted to CI/staging once fixtures can be minted without exposing secret material. See `docs/security/persona-fixture-setup-plan.md`.

For a safe local run, set all six `*_PROOF_BASE_URL` values to local services, then run:

```powershell
node scripts\setup-staging-security-personas.mjs --allow-local-fixtures --seed-personas --mint-sessions
$env:AUTH_PERSONA_FIXTURES_FILE = "output/dev/auth-personas.fixture.local.json"
node scripts\authenticated-persona-security-simulation.mjs
```
