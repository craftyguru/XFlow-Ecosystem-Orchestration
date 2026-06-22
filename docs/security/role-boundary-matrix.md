# Role Boundary Matrix

Date: 2026-05-10

## Summary

The ecosystem role hierarchy is:

`public` -> `user` -> `workspace_admin` -> `app_admin` -> `support_admin` -> `security_admin` -> `superadmin/platform_owner`

Sensitive access must be derived from server-side session, database role/claim, service-token, or internal shared-secret verification. Frontend booleans and hidden buttons are not accepted as boundaries.

## Matrix

| Route or surface | App | Required role | Enforcement function/helper | Server-side enforced | Normal user direct URL risk | Normal user direct API risk | Fix applied or remaining risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Marketing/pricing/docs/signup CTAs | All | public | Static route or public handler | Yes | No | No | No change. Public only. |
| `/auth/start`, signup handoff | XFlow | public start, signed return | XFlow auth/start state and allowlisted return validation | Yes | No | No | Verified by root proof. |
| Satellite signup/register routes | RatAiFy, AudAiX, WordGeni, CreVux | public UX, production delegates to XFlow | App-specific XFlow delegation/fail-closed tests | Yes | No | No | Verified by proof/tests; no local production auth authority added. |
| User dashboards | All | user | App session middleware/server auth helpers | Yes | Low | Low | Existing tests cover authenticated access and user-owned data for reviewed suites. |
| Workspace data APIs | All | user or workspace_admin depending mutation | Workspace membership and tenant-scope helpers | Yes | Low | Low | RatAiFy and AudAiX tests prove body workspace spoofing is rejected; WordGeni workspace tests passed. |
| Workspace member/settings/billing admin | XFlow, Verixet, satellites | workspace_admin | Workspace role checks; Verixet billing handoff | Yes | Low | Low | Continue adding direct deployment negative tests. |
| App admin tools | RatAiFy, WordGeni, AudAiX, CreVux | app_admin or stronger | App admin middleware/route tests | Yes | Low | Low | RatAiFy admin-tools and WordGeni admin route tests passed. |
| Support/admin routes | RatAiFy, WordGeni, Verixet | support_admin/security_admin | App admin/support guards and audit events | Yes | Low | Low | Existing tests passed; scope should remain non-billing/non-secret unless explicitly granted. |
| `/superadmin/*` | RatAiFy | superadmin/platform_owner | `requireSuperAdmin` and superadmin module route tests | Yes | No | No | Verified by `test:ops`. |
| `/api/operator/system-health` | AudAiX | workspace owner/admin | Operator route workspace guard | Yes | No | No | Verified: non-admin got 403 and secrets not exposed. |
| `/api/admin/*` | WordGeni API | app_admin/security_admin plus MFA where required | Admin route middleware, MFA tests, security audit events | Yes | No | No | Verified by WordGeni tests. |
| `/api/internal/platform-super-admin-bootstrap` | Verixet | internal bootstrap secret / platform owner operation | `authorizeInternalSharedSecretHeader`, disabled flag, audit event | Yes | No | No | Response minimized in this pass. |
| Verixet platform entitlement APIs | Verixet | platform service/admin | Platform service auth and entitlement tests | Yes | Low | Low | Existing proof passed; keep service-token rotation policy. |
| CreVux `/api/internal/*` | CreVux | internal role plus verified email/MFA for privileged paths | `requireAuth`, `requireEmailVerified`, `requireInternalRole`, `requirePrivilegedMfa` | Yes | No | No | Verified by CreVux typecheck/test scripts. |
| Billing checkout/session creation | Verixet authority; satellites delegate | user/workspace_admin as applicable | Verixet canonical billing handlers, satellite delegation/fail-closed modes | Yes | Low | Low | CreVux public catalog fixed; root proof passed. |
| Stripe webhooks | Verixet and app-local fallback/test handlers | Stripe signed webhook | Stripe signature verification and idempotency ledgers/tests | Yes | No | No | Verified by Verixet, AudAiX, WordGeni, CreVux tests/proofs. |
| Debug/proof/diagnostics/env-check | All | safe public health or admin/internal | Production proof scripts, diagnostic token/admin guards | Yes where reviewed | Medium if unreviewed deployment copies are used | Medium if unreviewed deployment copies are used | Canonical apps reviewed; duplicate temp/deploy copies out of scope. |
| Authenticated persona behavior | All | role-specific | `scripts/authenticated-persona-security-simulation.mjs` plus app-local smoke/route fixtures | Harnessed; live authenticated fixtures pending | Medium until normal-user fixture is supplied | Medium until normal-user fixture is supplied | Harness added; available probes passed 78/78, 9 persona classes blocked. |
| Disposable persona fixture setup | All | staging/local test operator | `scripts/setup-staging-security-personas.mjs` | Yes; refuses production-like mutation by default | No | No | Helper added; can seed/mint local/staging personas and write ignored fixture file. Current run refused production-like targets. |

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | Role enforcement in reviewed sensitive routes is predominantly server-side and test-backed. | Verified. |
| Medium | A single normalized cross-app role helper is not universal across all app frameworks; apps use local helpers mapped to the same hierarchy. | Documented as architectural debt. |
| Medium | Authenticated live role proof needs staging-safe sessions for each persona. | Harness added; fixture creation remains. |
| Low | Support/admin scope definitions should be codified in one shared package to avoid future drift. | Recommended. |

## Fixes Applied

- Verixet platform bootstrap now avoids returning internal IDs/log detail to callers.
- CreVux production public billing catalog no longer depends on local Stripe lookup.
- WordGeni service-role access is server-only.
- Authenticated persona simulation harness now exists for role-boundary proof.
- Fixture setup helper now documents, verifies, seeds, and mints required local/staging persona inputs without printing secrets when safe targets are configured.

## Remaining Recommended Work

- Create a shared `@xflow-ecosystem/authz` package or equivalent policy document consumed by all apps.
- Supply staging-safe persona sessions and run deployment-level normal-user/admin direct URL/API tests for the matrix rows above.
- Require MFA/passkey for every superadmin/platform route where the underlying auth provider exposes that signal.

## Verification Commands Run

See `docs/security/ecosystem-security-audit.md` for the full command list and outcomes.
