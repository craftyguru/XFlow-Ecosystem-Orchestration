# Security Fixes Applied

Date: 2026-05-10

## Summary

This document records code changes made during the six-app hardening pass. The pass intentionally avoided broad architectural rewrites and only applied local, low-risk fixes for clear issues.

## Fixes Applied

### WordGeni service-role isolation

Files changed:

- `apps/WordGeni/apps/web/src/lib/supabase/server-env.ts`
- `apps/WordGeni/apps/web/src/lib/supabase/env.ts`
- `apps/WordGeni/apps/web/src/lib/supabase/admin.ts`
- `apps/WordGeni/apps/web/src/lib/supabase/server.ts`
- `apps/WordGeni/apps/web/src/app/api/auth/resend-confirmation/route.ts`

Severity: High

Change:

- Moved `SUPABASE_SERVICE_ROLE_KEY` access into a dedicated `server-only` module.
- Kept browser Supabase env module limited to public anon/browser configuration.
- Updated server/admin imports to use the server-only helper.

Verification:

- `pnpm test` in `apps/WordGeni` - passed.
- `pnpm lint` in `apps/WordGeni` - passed.
- Root `npm run supabase:validate` - passed service-role import boundary proof.

### CreVux public billing catalog

Files changed:

- `apps/CreVux/artifacts/api-server/src/routes/billing.ts`

Severity: High

Change:

- Public `GET /billing/subscription-catalog` now returns static Verixet-authority display catalog outside local billing mode.
- Production/nonlocal mode no longer uses local Stripe secret-backed price retrieval for public marketing display.
- Local billing mode can still verify Stripe test prices when explicitly allowed.

Verification:

- `pnpm run typecheck` in `apps/CreVux` - passed.
- `pnpm run test` in `apps/CreVux` - passed.

### Verixet platform bootstrap response minimization

Files changed:

- `apps/Verixet/src/app/api/internal/platform-super-admin-bootstrap/route.ts`

Severity: Medium

Change:

- Removed internal user/workspace identifiers and bootstrap log details from successful response body.
- Kept request id and completion status for operator correlation.
- Kept detailed identifiers in server-side audit events and logs.
- Replaced raw error message response with a generic failure message and request id.

Verification:

- `npm run typecheck` in `apps/Verixet` - passed.
- `npm run test` in `apps/Verixet` - passed.
- `npm run check:client-db-imports` in `apps/Verixet` - passed.

### XFlow release-gate route and consent verification

Files changed:

- `apps/XFlow/src/lib/integrity/route-manifest.ts`
- `apps/XFlow/src/lib/auth/page-route-auth-matrix.ts`
- `apps/XFlow/src/lib/auth/api-route-auth-matrix.ts`
- `apps/XFlow/scripts/verify-rbac-matrix.ts`
- `apps/XFlow/src/app/api/auth/consent/accept/route.ts`
- `apps/XFlow/src/app/api/admin/assistant/analytics/route.ts`
- `apps/XFlow/src/app/api/admin/assistant/conversations/route.ts`
- `apps/XFlow/src/app/api/admin/support/conversations/route.ts`
- `apps/XFlow/src/app/api/admin/support/conversations/[id]/route.ts`
- `apps/XFlow/src/app/api/admin/support/conversations/[id]/reply/route.ts`
- `apps/XFlow/src/contracts/platform/error-codes.ts`
- `apps/XFlow/API_CONTRACTS.md`
- `apps/XFlow/src/components/showcase/CommercialHomepage.tsx`
- `apps/XFlow/src/content/showcase-home.ts`
- `apps/XFlow/src/lib/marketing/resolve-public-site-metadata-base.ts`
- `apps/XFlow/tests/unit/ecosystem-assistant-admin-support-controls.test.ts`
- `apps/XFlow/tests/showcase-chrome.test.ts`

Severity: High

Change:

- Added the consent page and consent accept API route to the App Router route manifest and auth matrices.
- Kept consent protected server-side: the page remains session-gated and signed-state validated; the accept API keeps session enforcement and now also uses the shared same-origin mutation guard.
- Extended RBAC verification to include admin support and assistant API route families already governed by permission/MFA matrices.
- Added audit logging for admin support/assistant API reads and mutations so existing audit coverage gates pass without weakening route permissions.
- Registered and documented missing API error codes used by consent and billing webhook paths.
- Repaired XFlow homepage contract drift and test mocks that were blocking the full `verify:ci` suite after the security verifiers advanced.

Verification:

- `npm run typecheck` in `apps/XFlow` - passed.
- `npm run verify:ci` in `apps/XFlow` - passed.
- `npx vitest run tests/showcase-chrome.test.ts` in `apps/XFlow` - passed.

### Live attack-simulation hardening

Files changed:

- `scripts/live-attack-simulation.mjs`
- `apps/XFlow/src/app/api/auth/consent/accept/route.ts`
- `apps/AudAix/src/routes/dashboard-static-routes.ts`
- `apps/CreVux/artifacts/api-server/src/app.ts`
- `docs/security/live-attack-simulation.md`
- `docs/security/direct-access-route-results.md`
- `docs/security/billing-entitlement-abuse-results.md`
- `docs/security/cross-workspace-access-results.md`
- `docs/security/debug-proof-route-results.md`
- `docs/security/superadmin-behavior-results.md`
- `docs/security/trust-ux-spotcheck.md`

Severity: High/Medium

Change:

- Added a repeatable live direct-access attack simulation script for proof base URLs.
- Added no-cache headers and a benign cache-busting query parameter to GET/HEAD probes so post-deploy checks measure current route behavior instead of stale edge-cached shell responses.
- Hardened XFlow consent accept malformed-body handling so malformed same-origin submissions return controlled `400` validation errors instead of framework parse failures.
- Tightened AudAiX and CreVux SPA fallbacks so reserved sensitive-looking direct page paths such as `/admin`, `/superadmin`, `/internal`, `/debug`, and `/proof` return 404 instead of the public app shell.
- Documented live route/API, billing/entitlement, cross-workspace, debug/proof, superadmin, and trust UX results.

Verification:

- `npm run proof:production` from repo root - passed.
- `node scripts/production-readiness-proof.mjs` - passed with 59 PASS, 1 RISK, 0 FAIL; saved artifact scrubbed of transient auth state.
- `node scripts/live-attack-simulation.mjs` - completed with findings against currently deployed proof URLs.
- Deployed XFlow, AudAiX, and CreVux through their linked Railway production services.
- Post-deploy `npm run proof:production` from repo root - passed 10/10.
- Post-deploy `node scripts/production-readiness-proof.mjs` - passed with 59 PASS, 1 RISK, 0 FAIL; saved artifact scrubbed of transient auth state.
- Post-deploy `node scripts/live-attack-simulation.mjs` with no-cache probes - passed 270/270.
- `npm run typecheck` in `apps/XFlow` - passed.
- `npm run verify:ci` in `apps/XFlow` - passed.
- `npm run typecheck` in `apps/AudAix` - passed.
- `pnpm --filter @workspace/api-server run typecheck` in `apps/CreVux` - passed.

## Remaining Recommended Work

- Add regression tests for the exact CreVux public catalog production response shape.
- Add a WordGeni static import test that fails if service-role env access returns to browser-adjacent modules.
- Add Verixet route test asserting platform bootstrap response does not include internal identifiers.
- Ensure XFlow production deployments set an explicit public metadata base URL instead of relying on local/test fallback behavior.

### Authenticated persona simulation harness

Files changed:

- `scripts/authenticated-persona-security-simulation.mjs`
- `scripts/setup-staging-security-personas.mjs`
- `.gitignore`
- `.env.security-local.example`
- `scripts/security-local-harness-preflight.mjs`
- `docs/security/local-authenticated-security-harness.md`
- `docs/security/persona-fixture-setup-plan.md`
- `docs/security/authenticated-persona-security-simulation.md`
- `docs/security/persona-fixture-matrix.md`
- `docs/security/role-boundary-behavior-results.md`
- `docs/security/entitlement-behavior-results.md`
- `docs/security/cross-workspace-behavior-results.md`
- `docs/security/superadmin-audit-behavior-results.md`

Severity: Medium

Change:

- Added a fixture-driven authenticated persona security simulation harness.
- The harness accepts bearer/cookie fixtures only through environment variables or a local fixture file, redacts auth material, uses no-cache probes, and avoids destructive privileged mutations unless explicitly enabled for disposable staging.
- Added the requested env aliases such as `AUTH_PERSONA_NORMAL_COOKIE`, `AUTH_PERSONA_EXPIRED_BEARER`, `AUTH_PERSONA_CANCELED_COOKIE`, and `AUTH_PERSONA_CROSS_WORKSPACE_BEARER`.
- Added app-specific fixture overrides for per-app session material.
- Added a redacted fixture setup helper that refuses production-like fixture mutation by default, can write an ignored local fixture template, and can seed/mint disposable local/staging personas when explicitly allowed.
- Added a local harness preflight script that checks Docker, Supabase CLI/status/config, safe Supabase env, safe proof URLs, and all six local app ports.
- Added root `security:local:*` scripts and a local env template.
- Added an explicit `output/dev/` ignore rule for local auth fixture material.
- Documented required personas, fixture shape, current live coverage, and blocked live proof gaps.

Verification:

- `node --check scripts/authenticated-persona-security-simulation.mjs` - passed.
- `node --check scripts/setup-staging-security-personas.mjs` - passed.
- `node --check scripts/security-local-harness-preflight.mjs` - passed.
- `npm run security:local:preflight` - blocked honestly on current machine: Docker unavailable, Supabase CLI unavailable, `supabase/config.toml` missing, production-like proof URLs loaded, and ports 3001/3002/3004/3005 not listening.
- `node scripts/setup-staging-security-personas.mjs --allow-staging-fixtures --seed-personas --mint-sessions` - safely refused production-like proof URLs; no mutation performed.
- `node scripts/setup-staging-security-personas.mjs --write-template` - passed; wrote redacted setup summary and ignored local template.
- `node scripts/authenticated-persona-security-simulation.mjs` - passed 78/78 available probes and recorded 9 blocked authenticated persona classes.
- `npm run proof:production` - passed 10/10.
- `node scripts/live-attack-simulation.mjs` - passed 270/270.
- `npm run supabase:validate` - passed static RLS proof.

## Verification Commands Run

The full verification list is captured in `docs/security/ecosystem-security-audit.md`.

### XFlow authenticated local persona harness completion

Files changed:

- `scripts/start-xflow-security-local.mjs`
- `scripts/setup-staging-security-personas.mjs`
- `scripts/authenticated-persona-security-simulation.mjs`
- `scripts/authenticated-persona-security-simulation.route-map.test.mjs`
- `scripts/security-local-harness-preflight.mjs`
- `.env.security-local.example`
- `package.json`

Severity: Medium

Change:

- Added a local-only XFlow start wrapper that loads `.env.security-local`, requires a local `DATABASE_URL`, and starts XFlow on port 3000 without production Supabase.
- Added local Auth.js and local Supabase database placeholders to the security-local env template.
- Updated persona seeding so XFlow cookies are minted through the real XFlow credentials flow and XFlow's local runtime workspace rows are seeded for disposable local personas.
- Added an XFlow-specific route expectation map so the authenticated simulation probes real XFlow routes such as `/overview`, `/account/security`, `/account/billing`, `/admin/support`, and `/admin/system-status`, while keeping `/platform`, `/superadmin`, `/api/auth/me`, and platform-only aliases denied or missing.

Verification:

- `node --check scripts/start-xflow-security-local.mjs` - passed.
- `node --check scripts/setup-staging-security-personas.mjs` - passed.
- `node --check scripts/authenticated-persona-security-simulation.mjs` - passed.
- `node --check scripts/security-local-harness-preflight.mjs` - passed.
- `node --test scripts/authenticated-persona-security-simulation.route-map.test.mjs` - passed 8/8.
- `npm --prefix apps/XFlow run db:migrate` - passed against local Supabase.
- `npm run security:local:preflight` - passed.
- `npm run security:local:seed-personas` - passed with 0 blocked persona session writes.
- `node scripts/authenticated-persona-security-simulation.mjs` - passed 645/645, 0 failed, 0 blocked.

### Disposable staging authenticated harness preparation

Files changed:

- `scripts/security-staging-harness-preflight.mjs`
- `scripts/setup-staging-security-personas.mjs`
- `scripts/authenticated-persona-security-simulation.mjs`
- `.env.security-staging.example`
- `.gitignore`
- `package.json`
- `docs/security/staging-authenticated-security-harness.md`

Severity: Medium

Change:

- Added a staging-only dry-run/preflight that resolves and redacts staging app URLs, staging Supabase configuration, fixture output paths, local-only bypass flags, and destructive mutation settings without seeding or calling app routes.
- Added explicit staging scripts for dry-run, preflight, seed, simulate, and cleanup.
- Added `--persona-env-file` support to avoid Node's built-in `--env-file` option and keep local/staging env loading explicit.
- Added a staging env template and ignored `output/staging/` fixture material.
- Tightened fixture mutation safety so production-like targets are refused instead of relying on legacy production override flags.

Verification:

- `node --check scripts/security-staging-harness-preflight.mjs` - passed.
- `node --check scripts/setup-staging-security-personas.mjs` - passed.
- `node --check scripts/authenticated-persona-security-simulation.mjs` - passed.
- `npm run security:staging:dry-run` - blocked safely because `.env.security-staging` is not present.
