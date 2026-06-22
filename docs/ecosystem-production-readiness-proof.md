# Full XFlow Ecosystem Production Readiness Proof

Date: 2026-05-08

Scope: deployed public smoke plus local static proof for XFlow, Verixet, Rataify, AudAiX, WordGeni, Crevux, shared Supabase boundary checks, OAuth/userinfo rejection, event-ingest rejection, and deployed bundle secret exposure. No live customer data was mutated and no production Stripe charge was created.

Proof script added: `scripts/production-readiness-proof.mjs`.

## Verdict

Local validation: **PASS**.

Deployed readiness: **FAIL / NOT FULLY PROVEN**.

The deployed public surfaces are mostly reachable, but production is not ready because:

1. XFlow `/auth/start` redirects through `https://0.0.0.0:8080/...` in production.
2. Rataify public production routes return `502`.
3. WordGeni deployed `/pricing` and documented `/auth/sign-up` routes return `404`.
4. Proof-safe deployed credentials/envs were not present in this shell, so valid-token, valid-bearer, entitlement fixture, and authenticated RBAC proof could not be completed.

## PASS

- Local architecture proof: `node scripts/validate-ecosystem-auth-boundaries.mjs` passed `15/15`.
- XFlow deployed public routes: `https://xflowx.com/`, `/pricing`, `/auth/sign-up`, `/api/health`, and `/api/ready` returned reachable responses.
- Verixet deployed public routes: `https://verixet.com/`, `/pricing`, `/auth/sign-up`, `/api/v1/health`, and `/api/v1/ready` returned reachable responses.
- AudAiX deployed public routes: `https://audaix.com/`, `/pricing`, `/auth/sign-up`, `/health`, and `/ready` returned reachable responses.
- Crevux deployed public routes: `https://crevux.com/`, `/pricing`, `/auth/sign-up`, `/health`, `/ready`, and `/api/healthz` returned reachable responses.
- XFlow OAuth rejection proof: `GET https://xflowx.com/oauth/userinfo` with an invalid bearer returned `401`.
- XFlow token exchange rejection proof: `POST https://xflowx.com/api/oauth/token` with invalid code/client credentials returned `401`.
- Invalid return proof: `GET https://xflowx.com/auth/start?...returnTo=https://evil.example/owned` returned `400`; no open redirect was observed.
- Event-ingest rejection proof: `POST https://xflowx.com/api/control-plane/events` rejected missing and wrong bearers with `401`.
- Unauthenticated admin mutation probes were rejected or absent for XFlow, Verixet, AudAiX, WordGeni, and Crevux.
- Secret exposure scan found no high-confidence exposed secret values or Supabase service-role JWTs in fetched public HTML/JS bundles for XFlow, Verixet, AudAiX, WordGeni, and Crevux.

## FAIL

### XFlow auth start uses internal origin in production

- File: `apps/XFlow/src/app/auth/start/route.ts`
- Route/function: `GET /auth/start`
- Evidence: deployed request for `selectedAppSlug=rataify&returnTo=https://rataify.com/dashboard` returned `307` to `https://0.0.0.0:8080/sign-in?callbackUrl=https%3A%2F%2F0.0.0.0%3A8080%2Fauth%2Fcallback...`.
- Why unsafe/misaligned: state signing and `returnTo` validation work, but the browser handoff points at an internal host, breaking deployed signup/login and leaking infrastructure origin into the user flow.
- Cause in code: `apps/XFlow/src/app/auth/start/route.ts:16`, `:36`, and `:41` derive callback and sign-in destinations from `new URL(request.url).origin`.
- Exact fix: build external auth callback/sign-in URLs from a trusted configured public origin, preferably `APP_BASE_URL`/`NEXTAUTH_URL`/`resolvePublicAppBaseUrl()`, and add `0.0.0.0` to production-disallowed host checks in `apps/XFlow/src/lib/ecosystem/public-urls.ts`.
- Proof test: deployed `GET /auth/start?selectedAppSlug=rataify&app=rataify&returnTo=https%3A%2F%2Frataify.com%2Fdashboard` must redirect to `https://xflowx.com/sign-in?...callbackUrl=https%3A%2F%2Fxflowx.com%2Fauth%2Fcallback...`, preserve signed state, and never contain `0.0.0.0`, `localhost`, or `127.0.0.1`.

### Rataify production is not reachable

- Route/component/function: deployed public routes and unauthenticated admin-boundary probe.
- Evidence: `https://rataify.com/`, `/pricing`, `/auth/sign-up`, and `/api/admin/apps` returned `502` after about 15 seconds.
- Why unsafe/misaligned: signup/auth routing, health, admin-boundary, and secret exposure cannot be proven while the deployed app returns gateway errors.
- Exact fix: inspect Rataify production deploy/runtime logs and hosting health. Confirm the service starts, the public domain points at the correct service, and required production envs are present: `APP_BASE_URL=https://rataify.com`, XFlow auth URL/token/userinfo values, Verixet API/usage envs, DB/Supabase envs, and server-only secrets.
- Proof test: rerun `node scripts/production-readiness-proof.mjs`; Rataify `/`, `/pricing`, `/auth/sign-up`, and one health/ready route must return reachable `2xx/3xx`, and bundle secret scan must run against fetched assets.

### WordGeni deployed pricing/signup routes are misaligned

- Files: `apps/WordGeni/apps/web/src/app/pricing/page.tsx`, `apps/WordGeni/apps/web/src/app/(auth)/sign-up/page.tsx`, `apps/WordGeni/apps/web/src/app/(auth)/auth/sign-up/page.tsx`, `packages/ecosystem-assistant/src/index.ts`
- Route/component/function: deployed `GET /pricing`, deployed `GET /auth/sign-up`, WordGeni public signup URL contract.
- Evidence: `https://wordgeni.com/pricing` returned `404`; `https://wordgeni.com/auth/sign-up` returned `404`; `https://wordgeni.com/sign-up` returned `200`.
- Why unsafe/misaligned: source contains `/pricing` and a compatibility `/auth/sign-up` route, while the deployed site does not. The ecosystem assistant contract still advertises `https://wordgeni.com/auth/sign-up`.
- Exact fix: deploy the current WordGeni web app root that includes `src/app/pricing/page.tsx` and the `/auth/sign-up` compatibility route, or update the canonical ecosystem profile to advertise `/sign-up` and add a production redirect from `/auth/sign-up` to `/sign-up`.
- Proof test: `GET https://wordgeni.com/pricing` and `GET https://wordgeni.com/auth/sign-up` must return `200` or an intentional `3xx` to a centralized XFlow/Verixet signup path. WordGeni CTA tests must assert lowercase `selectedAppSlug=wordgeni` and an allowlisted `returnTo`.

## RISK

- No additional deployed `RISK` findings were emitted after treating the internal XFlow redirect as `FAIL`.
- Operational risk remains because proof credentials were not loaded, so several positive-path production checks are still unproven.

## ENV MISSING

The existing live preflight and the new production proof both found no proof env loaded in this shell. No secret values were printed.

Missing proof envs:

- `XFLOW_PROOF_BASE_URL`
- `VERIXET_PROOF_BASE_URL`
- `RATAIFY_PROOF_BASE_URL`
- `AUDAIX_PROOF_BASE_URL`
- `WORDGENI_PROOF_BASE_URL`
- `CREVUX_PROOF_BASE_URL`
- `ECOSYSTEM_AUTH_STATE_SECRET`
- `XFLOW_PROOF_EVENT_BEARER`
- `XFLOW_PROOF_SESSION_COOKIE`
- `VERIXET_PROOF_MODE`
- `VERIXET_PROOF_BEARER`
- `XFLOW_DATABASE_URL` or `DATABASE_URL`
- `VERIXET_DATABASE_URL`
- `STRIPE_SECRET_KEY` in test mode only, if running Stripe fixture checks

Exact fix: load staging/proof-safe envs from the deployment platform or a local ignored proof env file. Keep live secrets masked, use only `sk_test_` Stripe keys for proof mode, and only set `XFLOW_PROOF_SAFE_WRITES=true` for explicit smoke-safe proof records with cleanup.

## NOT TESTED

- Valid XFlow token exchange and valid `/oauth/userinfo`: requires proof-safe OAuth client/user credentials.
- Valid Verixet entitlement fixtures for free baseline, single-app paid, ecosystem bundle, and cancellation: requires `VERIXET_PROOF_MODE=true` and `VERIXET_PROOF_BEARER`.
- Valid event ingest with Verixet proof bearer: skipped because `XFLOW_PROOF_EVENT_BEARER` and `XFLOW_PROOF_SAFE_WRITES=true` were not configured.
- Authenticated regular-user/workspace-admin denial checks: require proof-safe deployed accounts/session cookies.
- Rataify deployed bundle secret scan: skipped because no Rataify public page was reachable.

## Command Outputs

```text
node scripts/validate-ecosystem-auth-boundaries.mjs
Summary: 15/15 checks pass or are informational; 0 blockers/risks remain.
```

```text
node scripts/six-app-live-proof-preflight.mjs
ok: false
errors:
- XFLOW_PROOF_BASE_URL is required.
- VERIXET_PROOF_BASE_URL is required.
- RATAIFY_PROOF_BASE_URL is required.
- AUDAIX_PROOF_BASE_URL is required.
- WORDGENI_PROOF_BASE_URL is required.
- CREVUX_PROOF_BASE_URL is required.
- XFLOW_DATABASE_URL or DATABASE_URL is required for XFlow DB proof.
- VERIXET_DATABASE_URL is required.
- STRIPE_SECRET_KEY is required.
- VERIXET_BOOTSTRAP_SECRET is required.
- XFLOW_PROOF_EVENT_BEARER is required.
- Proof user authentication is required: set XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL plus XFLOW_PROOF_PASSWORD.
```

```text
node scripts/check-shared-supabase-dual-write-health.mjs
SUPABASE_URL=missing
SUPABASE_ANON_KEY=missing
SUPABASE_SERVICE_ROLE_KEY=missing
DATABASE_URL=missing
DIRECT_DATABASE_URL=missing
shared-supabase-dual-write-health: ok
```

```text
node scripts/production-readiness-proof.mjs
exitCode=1
counts {"ENV MISSING":1,"PASS":36,"FAIL":7,"NOT TESTED":6}

FAIL
- Rataify public route | https://rataify.com/ | status=502
- Rataify public route | https://rataify.com/pricing | status=502
- Rataify public route | https://rataify.com/auth/sign-up | status=502
- WordGeni public route | https://wordgeni.com/pricing | status=404
- WordGeni public route | https://wordgeni.com/auth/sign-up | status=404
- signup routing proof | https://xflowx.com/auth/start | production redirect uses https://0.0.0.0:8080
- admin boundary smoke | https://rataify.com/api/admin/apps | status=502
```

## Final Statement

Local validation and architecture proof pass.

Deployed readiness does **not** pass yet. Fix the XFlow public-origin redirect, restore Rataify production reachability, align/deploy WordGeni pricing/signup routes, then rerun `node scripts/production-readiness-proof.mjs` with proof-safe envs to complete positive-path OAuth, entitlement, event-ingest, and authenticated RBAC proof.
