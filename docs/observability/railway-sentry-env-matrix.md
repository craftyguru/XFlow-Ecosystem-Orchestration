# Railway Sentry Env Matrix

This matrix is the production Railway setup contract after Sentry normalization. It does not contain real DSNs, auth tokens, database URLs, Redis URLs, API keys, Stripe secrets, Supabase keys, OAuth secrets, or Turnstile secrets.

Use app-prefixed backend DSNs for server/API/worker runtimes. Use `NEXT_PUBLIC_SENTRY_*` for Next.js browser runtimes and `VITE_SENTRY_*` for Vite browser runtimes. Do not configure plain `SENTRY_DSN` or plain `SENTRY_TRACES_SAMPLE_RATE` as preferred Railway variables; those names are deprecated fallback reads only where legacy code still supports them.

## Sentry Projects

Frontend projects:

- `xflow-frontend`
- `verixet-frontend`
- `rataify-frontend`
- `audaix-frontend`
- `wordgeni-frontend`
- `crevux-frontend`

Backend/API/worker projects:

- `xflow-backend`
- `verixet-backend`
- `rataify-backend`
- `audaix-backend`
- `wordgeni-backend`
- `crevux-backend`

## Runtime Env Matrix

| Railway service | App slug | Runtime | Frontend Sentry project | Backend Sentry project | Runtime DSN envs | Sampling/env envs | Source-map envs |
|---|---|---|---|---|---|---|---|
| XFlow web | `xflow` | Next.js fullstack: browser, server | `xflow-frontend` | `xflow-backend` | `NEXT_PUBLIC_SENTRY_DSN=<xflow-frontend-dsn>`; `XFLOW_SENTRY_DSN=<xflow-backend-dsn>` | `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`; `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`; `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`; `XFLOW_SENTRY_ENVIRONMENT=production`; `XFLOW_SENTRY_TRACES_SAMPLE_RATE=0.05` | Required for the Next.js build if uploading source maps: `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=xflow-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| Verixet web | `verixet` | Next.js fullstack: browser, server, edge | `verixet-frontend` | `verixet-backend` | `NEXT_PUBLIC_SENTRY_DSN=<verixet-frontend-dsn>`; `VERIXET_SENTRY_DSN=<verixet-backend-dsn>` | `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`; `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`; `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`; `VERIXET_SENTRY_ENVIRONMENT=production`; `VERIXET_SENTRY_TRACES_SAMPLE_RATE=0.05` | Required for the Next.js build if uploading source maps: `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=verixet-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| RatAiFy frontend | `rataify` | Vite browser frontend | `rataify-frontend` | none | `VITE_SENTRY_DSN=<rataify-frontend-dsn>` | `VITE_SENTRY_ENVIRONMENT=production`; `VITE_SENTRY_TRACES_SAMPLE_RATE=0.05`; `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=rataify-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| RatAiFy API | `rataify` | Express API/backend | none | `rataify-backend` | `RATAIFY_SENTRY_DSN=<rataify-backend-dsn>` | `RATAIFY_SENTRY_ENVIRONMENT=production`; `RATAIFY_SENTRY_TRACES_SAMPLE_RATE=0.05` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=rataify-backend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| AudAiX dashboard | `audaix` | Vite browser frontend | `audaix-frontend` | none | `VITE_SENTRY_DSN=<audaix-frontend-dsn>` | `VITE_SENTRY_ENVIRONMENT=production`; `VITE_SENTRY_TRACES_SAMPLE_RATE=0.05`; `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=audaix-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| AudAiX API/workers | `audaix` | Node API/workers | none | `audaix-backend` | `AUDAIX_SENTRY_DSN=<audaix-backend-dsn>` | `AUDAIX_SENTRY_ENVIRONMENT=production`; `AUDAIX_SENTRY_TRACES_SAMPLE_RATE=0.05` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=audaix-backend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| WordGeni web | `wordgeni` | Next.js frontend plus server/edge runtime | `wordgeni-frontend` | `wordgeni-backend` | `NEXT_PUBLIC_SENTRY_DSN=<wordgeni-frontend-dsn>`; `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`; `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`; `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`; `WORDGENI_SENTRY_ENVIRONMENT=production`; `WORDGENI_SENTRY_TRACES_SAMPLE_RATE=0.05` | Required for the Next.js build if uploading source maps: `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=wordgeni-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| WordGeni API | `wordgeni` | Node API/backend | none | `wordgeni-backend` | `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | `WORDGENI_SENTRY_ENVIRONMENT=production`; `WORDGENI_SENTRY_TRACES_SAMPLE_RATE=0.05` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=wordgeni-backend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| WordGeni worker | `wordgeni` | Node worker | none | `wordgeni-backend` | `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | `WORDGENI_SENTRY_ENVIRONMENT=production`; `WORDGENI_SENTRY_TRACES_SAMPLE_RATE=0.05` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=wordgeni-backend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| CreVux image-gen | `crevux` | Vite browser frontend | `crevux-frontend` | none | `VITE_SENTRY_DSN=<crevux-frontend-dsn>` | `VITE_SENTRY_ENVIRONMENT=production`; `VITE_SENTRY_TRACES_SAMPLE_RATE=0.05`; `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`; `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1` | Not currently wired for Sentry source-map upload. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=crevux-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |
| CreVux API | `crevux` | Express API/backend | none | `crevux-backend` | `CREVUX_SENTRY_DSN=<crevux-backend-dsn>` | `CREVUX_SENTRY_ENVIRONMENT=production`; `CREVUX_SENTRY_TRACES_SAMPLE_RATE=0.05` | API build emits linked source maps, but Sentry upload is not currently wired. If upload is added later, use `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=crevux-backend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>`; `SENTRY_RELEASE=<railway-git-sha-or-release-name>` |

## Fullstack Service Notes

XFlow, Verixet, and WordGeni web services contain both browser and server-side runtimes. Put both DSNs on those Railway services:

- Browser code reads only `NEXT_PUBLIC_SENTRY_DSN` and sends events to the app's frontend project.
- Server, API, edge, and worker code reads only the app-prefixed backend DSN and sends events to the app's backend project.
- Build/source-map variables are separate from runtime DSNs. `SENTRY_AUTH_TOKEN` is only for release/source-map upload and must not be exposed to browser code.

## Deprecated Fallbacks

The following plain env names are deprecated and must not be added as preferred Railway variables:

- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`

They may remain as temporary legacy fallback reads only where the runtime already supports them. TODO: remove those fallback reads after all Railway production services have migrated to the canonical public frontend env vars and app-prefixed backend env vars.
