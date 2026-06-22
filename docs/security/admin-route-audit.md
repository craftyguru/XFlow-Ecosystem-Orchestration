# Admin Route Audit

Date: 2026-05-10

## Summary

Admin, superadmin, platform, internal, support, diagnostics, and billing management surfaces were reviewed for server-side role enforcement, direct URL/API risk, audit logging, and production fail-closed behavior.

## Files And Routes Reviewed

- XFlow admin/diagnostic routes and route manifest checks
- Verixet `apps/Verixet/src/app/api/internal/platform-super-admin-bootstrap/route.ts`
- Verixet platform, entitlement, billing, audit, and internal shared-secret helpers
- RatAiFy superadmin modules and tests: actions, audit, control-plane, dashboard, leads, ops, orgs, users, support, impersonation
- AudAiX operator/admin route tests and workspace access guards
- WordGeni API admin/security-audit/system/workspace route tests
- CreVux internal role, MFA, billing portal, OpenAPI, and internal API verification scripts

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| Medium | Verixet platform superadmin bootstrap returned internal identifiers in the response body after a successful internal-secret call. | Fixed. |
| Medium | XFlow standalone app route verification failed because route manifest did not include consent page/API route files. | Remaining release-gate risk. |
| Low | Superadmin audit logging exists in reviewed areas, but direct deployment-level audit event assertion was not run with production credentials. | Remaining verification gap. |
| Informational | RatAiFy superadmin tests passed for role rejection, module ownership, audit routes, billing fail-closed behavior, support/admin route split, and impersonation route ownership. | Verified. |
| Informational | WordGeni admin tests passed for non-admin 403 behavior, MFA requirement, security health, security audit events, workspace API key scopes, and route body limits. | Verified. |

## Fixes Applied

- Verixet bootstrap now returns only `{ ok, request_id, status }` on success and generic failure details on error.
- The detailed bootstrap actor/workspace identifiers remain in server-side audit events and logs only.

## Remaining Recommended Work

- Add a deployment smoke test that signs in as a normal user and attempts direct requests to all known admin/superadmin/internal routes.
- Enforce passkey/MFA freshness for every platform-owner route once XFlow exposes a portable session claim.
- Make support/admin permissions explicit and separate from billing/secret authority in shared policy.

## Verification Commands Run

- RatAiFy: `npm run test:ops` - passed 331 tests, including superadmin and privileged route tests.
- WordGeni: `pnpm test` and `pnpm lint` - passed, including admin/security audit tests.
- AudAiX: `npm run test:ci` - passed, including operator/admin and workspace guard tests.
- Verixet: `npm run test` - passed.
- XFlow: `npm run verify:ci` - failed on route manifest drift; see remaining risks.

