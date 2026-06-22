# Sentry Production Launch Runbook

This runbook covers production activation after the Sentry normalization merge. Do not change auth, billing, middleware, Stripe, Supabase, Turnstile, OAuth, or ecosystem assistant behavior as part of the Sentry rollout.

## 1. Sentry Setup

Create or confirm these 12 Sentry projects:

- `xflow-frontend`
- `xflow-backend`
- `verixet-frontend`
- `verixet-backend`
- `rataify-frontend`
- `rataify-backend`
- `audaix-frontend`
- `audaix-backend`
- `wordgeni-frontend`
- `wordgeni-backend`
- `crevux-frontend`
- `crevux-backend`

For each project:

1. Copy the project DSN.
2. Confirm the Sentry organization slug for `SENTRY_ORG`.
3. Create a Sentry auth token for release/source-map upload only. Use the least privileges needed by the Sentry upload tooling for releases and project source maps.
4. Store the auth token only in Railway build environment variables. Do not commit it and do not expose it to browser code.

## 2. Railway Setup

Use [railway-sentry-env-matrix.md](./railway-sentry-env-matrix.md) as the exact service-by-service env contract.

For each Next.js frontend/fullstack service:

1. Add `NEXT_PUBLIC_SENTRY_DSN=<frontend-project-dsn>`.
2. Add `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`.
3. Add `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`.
4. Add `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`.
5. Add `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`.

For each Vite frontend service:

1. Add `VITE_SENTRY_DSN=<frontend-project-dsn>`.
2. Add `VITE_SENTRY_ENVIRONMENT=production`.
3. Add `VITE_SENTRY_TRACES_SAMPLE_RATE=0.05`.
4. Add `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`.
5. Add `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`.

For each backend, API, edge, or worker runtime:

1. Add only the matching app-prefixed backend DSN: `XFLOW_SENTRY_DSN`, `VERIXET_SENTRY_DSN`, `RATAIFY_SENTRY_DSN`, `AUDAIX_SENTRY_DSN`, `WORDGENI_SENTRY_DSN`, or `CREVUX_SENTRY_DSN`.
2. Add matching `<APP>_SENTRY_ENVIRONMENT=production`.
3. Add matching `<APP>_SENTRY_TRACES_SAMPLE_RATE=0.05`.

For services that upload source maps:

1. Add `SENTRY_ORG=<sentry-org-slug>`.
2. Add `SENTRY_PROJECT=<matching-sentry-project>`.
3. Add `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`.
4. Add `SENTRY_RELEASE=<railway-git-sha-or-release-name>`.

Prefer Railway's git commit SHA variable for `SENTRY_RELEASE` when available. If Railway does not expose a commit SHA in the service, use a deterministic fallback such as `<app-slug>@<deployment-id>` or `<app-slug>@<yyyy-mm-dd>-<short-sha>`, and keep the same value for build-time source-map upload and runtime event tags.

Do not configure plain `SENTRY_DSN` or plain `SENTRY_TRACES_SAMPLE_RATE` as preferred Railway variables. They are deprecated fallback names only.

## 3. Redeploy Order

1. Deploy XFlow first.
2. Deploy Verixet second.
3. Deploy RatAiFy, AudAiX, WordGeni, and CreVux after XFlow and Verixet are healthy.

Reason:

- XFlow owns auth authority.
- Verixet owns billing and entitlements authority.
- Satellite apps should follow after the two authority apps are healthy.

## 4. Post-Deploy Verification

For each app:

1. Open the production homepage.
2. Trigger a safe guarded Sentry smoke route only if it exists and is protected.
3. Confirm a frontend event appears in the correct frontend project.
4. Confirm a server, API, edge, or worker event appears in the correct backend project.
5. Confirm event tags include `appSlug`, `runtime`, `release`, and `environment`.
6. Confirm redaction removes authorization headers, cookies, bearer tokens, session tokens, OAuth code/state, Stripe secrets, Supabase keys, database URLs, Redis URLs, API keys, Turnstile tokens, passwords, raw uploaded file content, raw source/code snippets, and `SENTRY_AUTH_TOKEN`.
7. Confirm source maps resolve stack traces for services that upload source maps.
8. Confirm no event lands in the wrong Sentry project.

Do not claim production Sentry is live until Railway variables are added, services are redeployed, and events are confirmed in Sentry.

## 5. Rollback Plan

If Sentry causes deploy or runtime issues:

1. Remove or blank only the Sentry DSN env for the affected service.
2. Redeploy that service.
3. Confirm the app continues functioning with Sentry disabled.

Because Sentry initialization no-ops without DSNs, blanking the affected DSN should disable telemetry without changing application authority behavior.

Do not revert or weaken auth, billing, middleware, Stripe, Supabase, Turnstile, OAuth, or ecosystem assistant code as part of Sentry rollback.
