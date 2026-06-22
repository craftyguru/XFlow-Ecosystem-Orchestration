# Sentry Ecosystem Audit

This document is the Pass 1 audit baseline for Sentry across the six ecosystem apps. Pass 1 is documentation and scanning only: no runtime behavior changes, no env renames, no package installs, and no deletions.

Run the audit:

```bash
node scripts/audit-sentry-ecosystem.mjs
```

## Audit Table

| App | Framework/runtime | Existing Sentry packages | Existing init files | Existing DSN env names | Browser DSN env | Server/backend DSN env | Trace/replay envs | Existing redaction | Source-map upload support | Test/smoke endpoint | Problems found | Keep / modify / delete recommendation |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| XFlow | Next.js app with browser and Node server instrumentation | `@sentry/nextjs`, `@sentry/node` | `instrumentation.ts`, `sentry.client.config.ts`, `src/lib/observability/sentry-node.ts`, `src/lib/observability/sentry-browser.ts` | `XFLOW_SENTRY_DSN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | `XFLOW_SENTRY_DSN` with legacy `SENTRY_DSN` fallback | `XFLOW_SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`; replay envs missing | `src/lib/observability/sentry-redaction.ts` via `beforeSend` | `next.config.ts` uses `withSentryConfig`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`; project default is stale `xflowx-frontend` | no public crash route found; targeted unit test exists | legacy plain env fallback/docs, missing canonical event tags, missing release in init, missing browser replay controls | Keep current setup; modify metadata/env docs/source-map project; delete nothing in Pass 1 |
| Verixet | Next.js app with browser, Node server, and edge instrumentation | `@sentry/nextjs` | `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/sentry.server.config.ts`, `src/sentry.edge.config.ts` | `VERIXET_SENTRY_DSN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | `VERIXET_SENTRY_DSN` with legacy `SENTRY_DSN` fallback | `VERIXET_SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`; replay envs missing | `src/lib/observability/sentry-redaction.ts` via `beforeSend` and `beforeSendTransaction` | `next.config.ts` uses `withSentryConfig`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | guarded `/api/internal/sentry-scenario` endpoint | README still promotes plain `SENTRY_DSN`, edge init tags runtime as server, missing canonical event tags, missing replay controls | Keep as reference model; modify docs/tags/replay envs; keep guarded endpoint |
| RatAiFy | Vite React frontend plus Express backend/workers | `@sentry/react`, `@sentry/node`, `@sentry/tracing` | `client/src/lib/sentry.ts`, `server/lib/sentryHelpers.ts` | `RATAIFY_SENTRY_DSN`, `VITE_SENTRY_DSN` | `VITE_SENTRY_DSN` | `RATAIFY_SENTRY_DSN` | `RATAIFY_SENTRY_TRACES_SAMPLE_RATE`, `VITE_SENTRY_TRACES_SAMPLE_RATE`; replay values hardcoded to `0` instead of env-controlled | `shared/sentryRedaction.ts` via frontend/backend `beforeSend` | no Sentry source-map upload config found | no public crash route found; redaction test exists | stale hardening doc says install/use plain `SENTRY_DSN`; possible unused `@sentry/tracing`; missing canonical event tags/release; missing replay env controls | Keep helpers; modify metadata/env docs/replay controls; remove tracing package only if audit proves unused |
| AudAiX | Node API/workers plus Vite dashboard | root `@sentry/node`; dashboard `@sentry/react` | `src/observability/sentry.ts`, `dashboard/src/lib/sentry.tsx` | `AUDAIX_SENTRY_DSN`, `VITE_SENTRY_DSN` | `VITE_SENTRY_DSN` | `AUDAIX_SENTRY_DSN` | `AUDAIX_SENTRY_TRACES_SAMPLE_RATE`, `VITE_SENTRY_TRACES_SAMPLE_RATE`; replay envs missing | backend and dashboard `beforeSend` redaction | no Sentry source-map upload config found | no public crash route found; backend/dashboard tests exist | missing canonical event tags/release; missing replay controls | Keep setup; modify metadata/replay controls; delete nothing |
| WordGeni | Next.js web, Node API, worker package | web `@sentry/nextjs`, API `@sentry/node`; worker no Sentry package | `apps/web/src/instrumentation.ts`, `apps/web/src/instrumentation-client.ts`, `apps/web/src/sentry.server.config.ts`, `apps/web/src/sentry.edge.config.ts`, `apps/api/src/observability/sentry-node.ts` | `NEXT_PUBLIC_SENTRY_DSN`, `WORDGENI_SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, stale service-scope `SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | API uses `WORDGENI_SENTRY_DSN`; web server/edge currently use public DSN | API uses plain `SENTRY_TRACES_SAMPLE_RATE`; browser replay envs missing | web/API redaction helpers via `beforeSend` | `apps/web/next.config.mjs` wraps `withSentryConfig` only when public DSN is present and disables sourcemaps | no public crash route found; web/API tests exist | web server/edge uses browser DSN; service scopes mention plain `SENTRY_DSN`; worker coverage missing; missing canonical tags/release/replay controls | Modify web server/env contract/API traces; add worker only after package need is confirmed; delete nothing in Pass 1 |
| CreVux | Express API plus Vite image generation frontend | API `@sentry/node`, image-gen `@sentry/react` | `artifacts/api-server/src/lib/sentry.ts`, `artifacts/image-gen/src/lib/sentry.tsx` | `CREVUX_SENTRY_DSN`, `VITE_SENTRY_DSN` | `VITE_SENTRY_DSN` | `CREVUX_SENTRY_DSN` | `CREVUX_SENTRY_TRACES_SAMPLE_RATE`, `VITE_SENTRY_TRACES_SAMPLE_RATE`; replay envs missing | API uses `redactSensitiveTelemetryData`; browser uses `sentryRedaction.ts` | API build emits linked sourcemaps; no Sentry upload config found | guarded CLI smoke script, no public crash route found | tags use non-canonical `app` / `sentryProject`; missing release/replay controls | Keep setup and smoke script; modify metadata/replay controls; delete nothing |

## Deprecated Env Names

- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- Any documentation telling operators to use plain `SENTRY_DSN` for backend/server capture instead of app-prefixed backend DSNs.

Temporary fallback support may remain only where already wired, and those fallbacks must be documented as deprecated.

TODO: Remove the legacy fallback reads after all Railway production services have migrated to the app-prefixed backend Sentry env vars and canonical public frontend env vars.

## Pass 2 Proposed Changes

- Add canonical event metadata to all Sentry init paths: `appSlug`, `runtime`, `release`, and `environment`.
- Preserve no-op initialization when DSNs are missing.
- Preserve `sendDefaultPii: false` everywhere.
- Keep existing redaction helpers and expand them only where the audit finds gaps.
- Add browser replay env controls for Next.js and Vite browser runtimes.
- Use `<APP>_SENTRY_TRACES_SAMPLE_RATE` for server/API/worker runtimes, with legacy fallback only where already present.
- Update stale docs and env examples that recommend plain `SENTRY_DSN`.
- Do not delete guarded smoke endpoints or error boundaries.

## Railway Env Contract

Frontend services:

- `NEXT_PUBLIC_SENTRY_DSN` or `VITE_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` or `VITE_SENTRY_ENVIRONMENT`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` or `VITE_SENTRY_TRACES_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` or `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE` or `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`

Backend/API/worker services:

- `XFLOW_SENTRY_DSN`, `VERIXET_SENTRY_DSN`, `RATAIFY_SENTRY_DSN`, `AUDAIX_SENTRY_DSN`, `WORDGENI_SENTRY_DSN`, or `CREVUX_SENTRY_DSN`
- matching `<APP>_SENTRY_ENVIRONMENT`
- matching `<APP>_SENTRY_TRACES_SAMPLE_RATE`

Build/source maps:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_RELEASE`

## Required Sentry Projects

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
