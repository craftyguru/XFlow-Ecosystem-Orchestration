# Public Route Audit

Date: 2026-05-10

## Summary

Public routes were reviewed for accidental exposure of admin data, secret state, raw diagnostics, local billing authority, and local production auth creation. Public routes should return only marketing, pricing display, signup/signin handoff, public-safe health, or explicitly shared public report data.

## Files And Routes Reviewed

- XFlow public auth/pricing/status routes under `apps/XFlow/src/app`, `apps/XFlow/src/lib/pricing`, and production proof scripts
- Verixet public pricing/billing and webhook-adjacent tests
- RatAiFy public site, signup authority, public CTA, SEO, support, and route-surface tests
- AudAiX public reports, auth start, health/readiness, billing delegation, and public report password tests
- WordGeni public navbar, auth confirm, ecosystem auth handoff, assistant route, and production-feint checks
- CreVux public landing billing catalog and auth/register production behavior

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | CreVux public `/billing/subscription-catalog` used local Stripe price retrieval when configured. Public marketing display does not need local Stripe authority in production. | Fixed. |
| Medium | Public report routes in AudAiX are intentionally public when sharing is enabled; tests cover token/password behavior. | Verified. |
| Medium | Public safe health/readiness endpoints exist across apps, but live deployment response review was limited to local/proof command coverage. | Remaining verification gap. |
| Low | Trust copy was not broadly changed because this pass only added factual copy where implementation backed it; no unsupported claims were added. | Documented. |

## Fixes Applied

- `apps/CreVux/artifacts/api-server/src/routes/billing.ts` now returns a static Verixet-authority display catalog in production/nonlocal billing mode.
- CreVux local billing mode remains available only when explicitly allowed; it may still verify test Stripe prices for local development.

## Remaining Recommended Work

- Add an automated deployed-public-route crawler that asserts no `admin`, `internal`, `env`, token, stack, SQL error, or internal ID fields appear in public responses.
- Review all public footer/status/security links in the rendered deployed apps after the next frontend deployment.

## Verification Commands Run

- `npm run proof:production` - passed public CTA route proof and satellite fallback shutdown proof.
- `npm run test:ops` in RatAiFy - passed public route surface and signup authority tests.
- `npm run test:ci` in AudAiX - passed public report and billing delegation tests.
- `pnpm test` in WordGeni - passed auth confirm/handoff and public/web tests.
- `pnpm run test` in CreVux - passed Stripe webhook config test suite; typecheck passed after catalog change.

