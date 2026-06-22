# Env And Secret Exposure Audit

Date: 2026-05-10

## Summary

The pass searched and reviewed environment variable usage, client/server import boundaries, service-role key access, Stripe secret usage, OAuth/internal token surfaces, Sentry token references, debug diagnostics, and test/proof outputs. No secret values were printed in this report.

## Files And Routes Reviewed

- Root Supabase validators and service-role import boundary checks
- WordGeni Supabase env modules and API route imports
- Verixet internal shared-secret and platform bootstrap route
- CreVux billing route, env example checks, service-role frontend check script, Sentry redaction checks
- RatAiFy secret hygiene tests
- AudAiX security env, Sentry observability, outbound request, and operator health tests

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | WordGeni service-role env helper was in `apps/WordGeni/apps/web/src/lib/supabase/env.ts`, a module adjacent to browser-safe env helpers. | Fixed. |
| Medium | Some test logs intentionally print synthetic UUIDs/request IDs and redacted token previews. No live secret value was observed or documented. | Accepted for tests; keep redaction tests. |
| Low | Root service-role import boundary validation is static. Runtime bundle inspection should be added for deployed frontend artifacts. | Remaining verification gap. |
| Informational | Verixet `check:client-db-imports`, root `supabase:validate`, RatAiFy secret hygiene, WordGeni lint/test, and CreVux no-service-role frontend checks passed through requested suites. | Verified. |

## Fixes Applied

- Added `apps/WordGeni/apps/web/src/lib/supabase/server-env.ts` with `import 'server-only'`.
- Updated WordGeni `admin.ts`, `server.ts`, and resend-confirmation API route imports to use the server-only helper.
- Kept browser-adjacent WordGeni Supabase env helpers limited to public anon/browser config.

## Remaining Recommended Work

- Add built-asset scans for `.next`, Vite, and other frontend bundles to verify no service-role, Stripe secret, OAuth secret, Sentry auth token, internal bearer token, or proof token strings are present.
- Add CI checks that fail when `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or OAuth secrets appear in client component graphs.

## Verification Commands Run

- Root: `npm run supabase:validate` - passed service-role import boundary checks.
- Verixet: `npm run check:client-db-imports` - passed.
- RatAiFy: `npm run test:ops` - passed secret hygiene tests.
- WordGeni: `pnpm test`, `pnpm lint` - passed after server-only env split.
- CreVux: `pnpm run typecheck`, `pnpm run test` - passed.

