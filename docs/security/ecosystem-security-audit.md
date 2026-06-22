# Ecosystem Security Audit

Date: 2026-05-10

## Summary

This pass reviewed the canonical six-app ecosystem folders:

- `apps/XFlow`
- `apps/Verixet`
- `apps/RatAiFy`
- `apps/AudAix`
- `apps/WordGeni`
- `apps/CreVux`

The enforced architecture remains:

- XFlow owns production auth, signup, signin, session, OAuth, and handoff.
- Verixet owns production billing, Stripe, entitlements, usage, and plan authority.
- Satellite apps may render branded entry points and pricing, but must fail closed or delegate for production auth and billing.
- Sensitive checks must be server-side. UI guards are UX only.

## Files And Routes Reviewed

- Root contract and proof scripts: `package.json`, `scripts/validate-ecosystem-contracts.mjs`, `scripts/validate-supabase-phase*.mjs`, `scripts/proof-production.mjs`
- XFlow auth, admin, diagnostics, billing, pricing, and proof surfaces under `apps/XFlow/src/app`, `apps/XFlow/src/lib`, `apps/XFlow/scripts`, and `apps/XFlow/tests`
- Verixet platform, internal, billing, entitlement, Stripe, audit, and Supabase surfaces under `apps/Verixet/src/app`, `apps/Verixet/src/lib`, and `apps/Verixet/tests`
- RatAiFy admin, superadmin, control-plane, billing, entitlement, auth-boundary, proof, and route tests under `apps/RatAiFy/server`, `apps/RatAiFy/client`, and `apps/RatAiFy/tests`
- AudAiX auth exchange, billing delegation, operator, public report, webhook, Supabase, and rate-limit surfaces under `apps/AudAix/src` and `apps/AudAix/tests`
- WordGeni web/API auth, Supabase, admin, upload, assistant, Stripe webhook, workspace API key, rate-limit, and server-auth surfaces under `apps/WordGeni/apps`
- CreVux auth, billing, internal, webhook, OpenAPI, and rate-limit surfaces under `apps/CreVux/artifacts/api-server`

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | WordGeni kept `SUPABASE_SERVICE_ROLE_KEY` access in a mixed Supabase env module. Even though call sites were server-oriented, the helper lived beside browser-safe env helpers. | Fixed by moving server env access to `server-only` module. |
| High | CreVux public `GET /billing/subscription-catalog` could use Stripe secret-backed lookup on a no-JWT public route. Production should not require local Stripe authority in a satellite. | Fixed by returning static Verixet-authority display catalog outside local billing mode. |
| Medium | Verixet internal platform superadmin bootstrap returned internal user/workspace identifiers and bootstrap log details to the caller. | Fixed by returning only request id and completion status; audit retains server-side detail. |
| Medium | XFlow standalone `npm run typecheck` and `npm run verify:ci` were blocked by generated App Router artifact/manifest drift and missing consent route coverage. | Fixed by aligning the route manifest/auth matrices with the real consent routes, tightening the consent accept mutation guard, and rerunning both release gates successfully. |
| Medium | Live direct-access probes showed AudAiX and CreVux deployed proof URLs returning the public SPA shell for reserved sensitive-looking page paths. | Fixed, deployed, and live-proven with no-cache direct-access probes. |
| Medium | Live direct-access probes showed XFlow deployed `/api/auth/consent/accept` returning HTTP 500 for malformed unauthenticated JSON POST. | Fixed, deployed, and live-proven with no-cache direct-access probes. |
| Medium | Authenticated persona simulation is now harnessed but live role sessions were not available in this environment. | Harness added and available probes passed; 9 authenticated persona classes remain blocked until staging-safe sessions are supplied. |
| Medium | Disposable persona fixture setup and session minting are now scripted, but current proof URLs are production-like and no safe sessions were created. | Helper added; it refused seeding/mutation and wrote only redacted summary/template artifacts. |
| Medium | Local authenticated harness preflight is available but blocked on this Windows machine. | Docker/Supabase CLI/local config and four app ports must be fixed before persona seeding can run. |
| Low | Supabase RLS validation ran static proof only. Live DB RLS tests require `RUN_RLS_DB_TESTS=1` and configured Supabase credentials. | Remaining verification gap. |
| Informational | Existing proof suites cover central auth, signup redirects, Stripe catalog, checkout creation, webhook replay, entitlement resolver, production entitlement proof, Supabase static RLS, satellite fallback shutdown, and public CTA route proof. | Verified by `npm run proof:production`. |

## Fixes Applied

- Created `apps/WordGeni/apps/web/src/lib/supabase/server-env.ts` with `import 'server-only'`.
- Updated WordGeni server/admin Supabase callers to import `requireSupabaseServerEnv` from the server-only module.
- Removed service-role access from WordGeni browser-adjacent Supabase env module.
- Changed CreVux public production subscription catalog to return Verixet-authority static display data without Stripe secret use.
- Minimized Verixet platform superadmin bootstrap response body and kept detailed identifiers in server-side audit/logging only.
- Added XFlow consent page/API route entries to the route manifest and auth matrices.
- Added same-origin mutation protection to the XFlow consent accept API route.
- Extended XFlow RBAC and audit verification coverage for admin support/assistant routes and added audit events for those surfaces.
- Registered/documented XFlow consent and webhook-adjacent API error codes used by release-gated routes.
- Repaired XFlow homepage contract/test drift so the full CI verification suite can complete.
- Added root live attack-simulation script and result docs.
- Added no-cache/cache-busting behavior to live GET/HEAD probes to avoid stale edge-cached shell responses.
- Hardened XFlow consent accept malformed-body handling.
- Hardened AudAiX and CreVux SPA fallbacks for reserved direct-access paths.
- Added authenticated persona simulation harness and documentation for fixture-driven live role proof.
- Added disposable persona fixture setup/session minting helper and requested persona env aliases.
- Added local authenticated security harness preflight, env template, root npm wrappers, and runbook.

## Remaining Recommended Work

- Add authenticated staging personas for normal user, workspace admin, app admin, support admin, security admin, expired subscription, canceled subscription, cross-workspace user, and superadmin/platform owner.
- Run live Supabase RLS tests with an isolated staging database and `RUN_RLS_DB_TESTS=1`.
- Add periodic direct URL/API negative tests for each production deployment using normal-user credentials.
- Review whether workspace-member read access to audit log records should be narrowed to workspace admins/security admins only.
- Ensure XFlow production deployments set an explicit public metadata base URL rather than relying on local/test fallback behavior.

## Verification Commands Run

- Root: `npm run validate:ecosystem-contracts` - passed
- Root: `npm run supabase:validate` - passed, static RLS proof only
- Root: `npm run proof:production` - passed, 10/10 checks
- XFlow: `npm run typecheck` - passed after route/type artifact drift was cleared
- XFlow: `npm run verify:ci` - passed, including route manifest, auth matrices, RBAC, audit, same-origin guards, and 1,941 passing tests with 2 skipped
- Live attack simulation: initial `node scripts/live-attack-simulation.mjs` - completed with 270 checks, 247 passed, 23 failed; source fixes applied for XFlow, AudAiX, and CreVux
- Deployment: XFlow, AudAiX, and CreVux uploaded through linked Railway production services
- Post-deploy live attack simulation: `node scripts/live-attack-simulation.mjs` with no-cache probes - passed 270/270
- Authenticated persona simulation: `node scripts/authenticated-persona-security-simulation.mjs` - passed 78/78 available probes, 9 authenticated persona classes blocked pending fixtures
- Authenticated persona fixture setup: `node scripts/setup-staging-security-personas.mjs --allow-staging-fixtures --seed-personas --mint-sessions` - safely refused production-like proof URLs, no mutation performed
- Authenticated persona fixture template: `node scripts/setup-staging-security-personas.mjs --write-template` - passed, detected production-like proof URLs, wrote redacted summary/template
- Local authenticated harness preflight: `npm run security:local:preflight` - blocked honestly on missing local prerequisites; no mutation performed
- Root: `node scripts/production-readiness-proof.mjs` - passed, 59 PASS / 1 RISK / 0 FAIL; saved artifact scrubbed of transient auth state
- Verixet: `npm run typecheck` - passed
- Verixet: `npm run test` - passed
- Verixet: `npm run check:client-db-imports` - passed
- RatAiFy: `npm run check` - passed
- RatAiFy: `npm run test:ops` - passed, 331 tests
- AudAiX: `npm run typecheck` - passed
- AudAiX: `npm run test:ci` - passed, 407 tests with 2 skipped
- WordGeni: `pnpm test` - passed
- WordGeni: `pnpm lint` - passed
- CreVux: `pnpm run typecheck` - passed
- CreVux: `pnpm run test` - passed, 6 tests
