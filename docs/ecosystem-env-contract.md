# Ecosystem Environment Contract

Date: 2026-05-04

This document captures the current cross-app env contract. It is intentionally conservative: no real values are included, no secrets are invented, and placeholder values are marked unsafe for production unless explicitly stated.

Machine-readable source: `ecosystem-contracts/env-contract.json` is now the canonical root contract registry for Phase 1 validation. Update the JSON registry and this document together until a generator replaces the hand-maintained markdown.

Before changing connection logic, follow the [Six-App Connection Discipline](six-app-connection-discipline.md).

Inventory summary from code/docs/examples:

| App | Used env refs | Documented env refs | Used but undocumented | Documented but unread |
| --- | ---: | ---: | ---: | ---: |
| XFlow | 196 | 139 | 112 | 55 |
| Verixet | 162 | 178 | 77 | 93 |
| AudAiX | 192 | 143 | 84 | 35 |
| Rataify | 182 | 224 | 42 | 84 |
| WordGeni | 143 | 69 | 85 | 11 |
| Crevux | 266 | 199 | 121 | 54 |

## XFlow

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `APP_BASE_URL` | Required | Prod | Runtime routes and auth helpers | Incomplete | Public app origin | Railway/public domain | No | Used but not consistently documented |
| `APP_SLUG` | Required | All | Ecosystem/control-plane helpers | Incomplete | Canonical app slug | Shared contract | No | Must be fixed to lowercase `xflow` if shared contract adopts lowercase |
| `NEXTAUTH_URL` | Required | Prod | NextAuth/auth routes | `.env.example` partial | Auth callback origin | Railway/public domain | No | Must match XFlow public URL |
| `NEXTAUTH_SECRET` | Required | Prod | Auth/session | `.env.example` partial | Session signing | Secret manager | No | Server only |
| `AUTH_OIDC_CLIENT_ID` | Required if OIDC | Prod | OAuth helpers | Incomplete | OIDC client id | OAuth provider | No | Used but not fully documented |
| `AUTH_OIDC_CLIENT_SECRET` | Required if OIDC | Prod | OAuth helpers | Incomplete | OIDC secret | OAuth provider | No | Server only |
| `CONTROL_PLANE_SERVICE_TOKEN` | Required | Prod | Control-plane auth/events | `.env.example` partial | Service auth | Secret manager | No | Token type must not be used where UCL connection token is required |
| `XFLOW_UCL_EVENTS_URL` | Optional/required for consumers | Prod | UCL/event clients | Incomplete | UCL event endpoint | XFlow deployment | No | Naming overlaps with other control-plane URL vars |
| `VERIXET_USAGE_INGEST_URL` | Required for usage mirror | Prod | Verixet integration | Incomplete | Usage ingest endpoint | Verixet deployment | No | Used naming differs by consumer app |
| `VERIXET_USAGE_INGEST_TOKEN` | Required for usage mirror | Prod | Verixet integration | Incomplete | Usage ingest auth | Verixet secret | No | Must be server only |
| `UPSTASH_REDIS_REST_URL` | Optional/required if Redis enabled | Prod | Cache/rate-limit | Partial | Redis endpoint | Upstash/Railway | No | Used but not fully inventoried |
| `UPSTASH_REDIS_REST_TOKEN` | Optional/required if Redis enabled | Prod | Cache/rate-limit | Partial | Redis auth | Upstash/Railway | No | Server only |
| `SENTRY_DSN` | Optional | Prod | Sentry setup | Partial | Error telemetry | Sentry | No | Needs consistent environment naming |

## Verixet

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Required | Prod | Runtime/env validation | `.env.example` | Public app URL | Railway/public domain | No | Must match deployment origin |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Required | Prod | Auth forms/client helper | `.env.example`, docs | Browser Turnstile key for Next | Cloudflare Turnstile | No | Correct Next public var |
| `VITE_TURNSTILE_SITE_KEY` | Optional compatibility | Dev/test | Turnstile client helper | Docs | Compatibility for Vite-style detection | Cloudflare Turnstile | Test key allowed only non-prod | Should not be primary in Next app |
| `TURNSTILE_SECRET_KEY` | Required | Prod | `src/lib/auth/turnstile.ts` | `.env.example`, docs | Server Siteverify secret | Cloudflare Turnstile | No | Server only; fail closed in production |
| `VERIXET_TURNSTILE_REQUIRED` | Optional | All | Turnstile policy | `.env.example` | Force/disable Turnstile outside prod | App config | Yes in local | Must not disable prod fail-closed |
| `VERIXET_TURNSTILE_MOCK_VALIDATION` | Optional | Dev/test only | Turnstile policy/tests | `.env.example` | Mock validation | Test config | Yes, non-prod only | Must never be enabled in prod |
| `STRIPE_SECRET_KEY` | Required if Stripe enabled | Prod | Billing/Stripe client | `.env.example`, docs | Stripe API | Stripe dashboard | No | Server only |
| `STRIPE_WEBHOOK_SECRET` | Required | Prod | Stripe webhook | `.env.example`, docs | Webhook signature | Stripe dashboard | No | Some docs include app-specific aliases not read |
| `CONTROL_PLANE_SERVICE_TOKEN` | Required for XFlow link | Prod | Control-plane/XFlow modules | Partial | Service-to-service auth | Secret manager | No | Used alongside other token names; needs shared contract |
| `XFLOW_BASE_URL` | Required for XFlow integration | Prod | XFlow OAuth/control-plane helpers | Partial | XFlow authority URL | XFlow deployment | No | Several aliases exist |
| `SUPABASE_URL` | Required if Supabase auth/db | Prod | Supabase auth/server | `.env.example` | Supabase project URL | Supabase | No | Alias drift with `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Required server-side | Prod | Supabase privileged calls | Incomplete | Service role auth | Supabase | No | Used but not consistently documented |
| `SENDGRID_API_KEY` | Optional/required for email | Prod | Email/auth flows | Docs | Transactional email | SendGrid | No | Needs send-from alignment |

## AudAiX

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `AUDAIX_APP_BASE_URL` | Required | Prod | Route/auth config | `.env.example` | Public app URL | Railway/public domain | No | Needs exact Railway value |
| `VITE_TURNSTILE_SITE_KEY` | Required for Vite browser contract | Prod | Should be dashboard/client | Not primary today | Browser Turnstile site key | Cloudflare Turnstile | No | Code currently reads `TURNSTILE_SITE_KEY` through server config |
| `TURNSTILE_SITE_KEY` | Legacy/optional | Local/prod currently | `src/auth/turnstile.ts`, security env | Docs | Browser Turnstile site key | Cloudflare Turnstile | No in prod | Should be deprecated in favor of `VITE_TURNSTILE_SITE_KEY` |
| `TURNSTILE_SECRET_KEY` | Required when Turnstile required | Prod | `src/auth/turnstile.ts` | Docs | Server Siteverify secret | Cloudflare Turnstile | No | Server only |
| `AUDAIX_TURNSTILE_REQUIRED` | Optional | All | Security env/auth | Docs | Force Turnstile | App config | Yes local | Must be true/effective in prod |
| `AUDAIX_VERIXET_SERVICE_TOKEN` | Required for Verixet service calls | Prod | Billing/Verixet adapters | Partial | Service auth | Verixet secret | No | Alias drift with global Verixet tokens |
| `VERIXET_USAGE_INGEST_URL` | Required for metering | Prod | `src/lib/billing/verixet-usage.ts` | Partial | Usage ingest endpoint | Verixet | No | Needs shared name |
| `VERIXET_AUDAIX_USAGE_INGEST_TOKEN` | Required for metering | Prod | Usage helper | Partial | App-scoped usage token | Verixet | No | Should be the only usage token for AudAiX |
| `XFLOW_BASE_URL` | Required for XFlow OAuth/UCL | Prod | XFlow routes/UCL client | Partial | XFlow authority URL | XFlow | No | URL aliases exist |
| `CONTROL_PLANE_SERVICE_TOKEN` | Required for control-plane service routes | Prod | Control-plane routes | Partial | Service auth | Secret manager | No | Must not replace per-connection UCL token |
| `DATABASE_URL` | Required if Postgres backend | Prod | Repositories | `.env.example` | App DB | Railway/Supabase | No | Verify all repositories use same source |
| `SENDGRID_API_KEY` | Optional/required for email | Prod | Email/auth | Docs | Email | SendGrid | No | Needs from-address pair |

## Rataify

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `APP_BASE_URL` | Required | Prod | Auth/billing/ecosystem routes | `.env.example` | Public app URL | Railway/public domain | No | Ensure no stale domain |
| `VITE_TURNSTILE_SITE_KEY` | Required | Prod | `vite.config.ts`, auth UI | Docs | Browser Turnstile key for Vite | Cloudflare Turnstile | No | Correct primary key |
| `TURNSTILE_SITE_KEY` | Optional legacy fallback | Local/prod currently | `vite.config.ts`, setup verifier docs | Docs | Backward-compatible public key | Cloudflare Turnstile | No in prod | Should be compatibility only and documented as deprecated |
| `TURNSTILE_SECRET_KEY` | Required | Prod | `server/services/turnstile.ts` | Docs | Server Siteverify secret | Cloudflare Turnstile | No | Error codes are not the requested exact ecosystem codes |
| `XFLOW_BOOTSTRAP_EXCHANGE_URL` | Required for bootstrap | Prod | XFlow bootstrap installer | Incomplete | Managed token exchange | XFlow | No | Used but not fully documented |
| `XFLOW_BOOTSTRAP_EXCHANGE_TOKEN` | Required for bootstrap | Prod | XFlow bootstrap installer | Incomplete | Bootstrap auth | XFlow secret | No | Server only |
| `XFLOW_UCL_EVENTS_URL` | Required for UCL events | Prod | UCL event client | Partial | UCL event endpoint | XFlow | No | Token type must match connection |
| `VERIXET_API_URL` | Required | Prod | Billing/entitlement adapters | Incomplete | Verixet API base | Verixet | No | Alias with billing base URL |
| `VERIXET_USAGE_INGEST_URL` | Required | Prod | Usage ingest service | Partial | Usage endpoint | Verixet | No | Needs app-scoped token |
| `VERIXET_RATAIFY_USAGE_INGEST_TOKEN` | Required | Prod | Usage ingest service | Partial | App usage auth | Verixet | No | Must be server only |
| `STRIPE_SECRET_KEY` | Legacy/local only if Verixet authority | Dev/staging | Local billing/Stripe routes | Docs | Local Stripe | Stripe | Test only | Conflicts with Verixet authority unless explicitly local |
| `DATABASE_URL` | Required | Prod | Server DB | `.env.example` | App DB | Railway/Supabase | No | Verify tenant scoping and migrations |

## WordGeni

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Required for web | Prod | Next web/auth | `.env.example` partial | Public web URL | Railway/Vercel | No | Needs exact deployed URL |
| `NEXT_PUBLIC_CREVUX_URL` | Required for Crevux link UI | Prod | Web Crevux components | Incomplete | Crevux public URL | Crevux deployment | No | Used but not documented enough |
| `WORDGENI_CREVUX_API_URL` | Required for API integration | Prod | Crevux client/routes | Incomplete | Crevux API base | Crevux deployment | No | Needs shared route contract |
| `WORDGENI_CREVUX_SHARED_SECRET` | Required if shared-secret integration | Prod | Crevux integration client | Incomplete | Integration auth | Secret manager | No | Server only |
| `XFLOW_ENTITLEMENT_URL` | Required if checking XFlow entitlement | Prod | Entitlement config | Incomplete | XFlow entitlement endpoint | XFlow | No | Authority should be Verixet unless XFlow mirrors |
| `XFLOW_ENTITLEMENT_TOKEN` | Required with entitlement URL | Prod | Entitlement config | Incomplete | Service auth | Secret manager | No | Token type needs review |
| `VERIXET_API_URL` | Required for billing authority | Prod | Billing entitlement services | Partial | Verixet API | Verixet | No | Not sufficiently documented |
| `STRIPE_SECRET_KEY` | Legacy/local if Verixet authority | Dev/staging | Stripe webhook/processor | Partial | Local Stripe | Stripe | Test only | Split billing authority risk |
| `DATABASE_URL` | Required | Prod | API Drizzle | `.env.example` | API DB | Railway/Supabase | No | Migration ordering must be verified |
| `SENTRY_DSN` | Optional | Prod | Observability | Partial | Error telemetry | Sentry | No | Needs env naming consistency |

## Crevux

| Env var | Required/optional | Local/prod | Used in file(s) | Documented in file(s) | Purpose | Source of value | Safe placeholder allowed | Current issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `API_BASE_URL` | Required | Prod | Image-gen/mobile/API clients | `.env.example` partial | API origin | Railway/public domain | No | App has multiple artifacts needing same origin |
| `DATABASE_URL` | Required | Prod | API server/db libs | `.env.example` | App DB | Railway/Supabase | No | Verify migration/index coverage |
| `JWT_SECRET` | Required | Prod | API auth JWT | Incomplete | Session/API signing | Secret manager | No | Used but not fully documented |
| `MEDIA_DOWNLOAD_SIGNING_SECRET` | Required | Prod | Media download signing | Incomplete | Signed media URLs | Secret manager | No | Server only |
| `STRIPE_SECRET_KEY` | Required if local Stripe active | Prod/local | Billing routes/webhook | Docs | Stripe API | Stripe | Test only outside prod | Conflicts with Verixet authority unless local cache is intentional |
| `STRIPE_WEBHOOK_SECRET` | Required if local Stripe active | Prod | Billing webhook | Docs | Stripe webhook signature | Stripe | No | Server only |
| `VERIXET_API_URL` | Required for ecosystem authority | Prod | Entitlements adapter if active | Partial | Verixet API | Verixet | No | Needs mandatory admission path |
| `VERIXET_CREVUX_USAGE_INGEST_TOKEN` | Required for ecosystem metering | Prod | Usage ingest if active | Partial | App usage token | Verixet | No | Must be server only |
| `WORDGENI_SHARED_SECRET` | Required for WordGeni integration if enabled | Prod | WordGeni route/client | Incomplete | Integration auth | Secret manager | No | Needs exact shared contract |
| `OPENAI_API_KEY` | Required if OpenAI features enabled | Prod | Generation providers | Docs partial | AI provider | OpenAI | No | Provider-specific fail-closed needed |
| `REPLICATE_API_TOKEN` | Optional/required by provider | Prod | Generation providers | Docs partial | AI provider | Replicate | No | Provider matrix needs cleanup |
| `SENTRY_DSN` | Optional | Prod | Observability | Partial | Error telemetry | Sentry | No | Needs environment consistency |

## Railway Variables Still Needed

Use real dashboard/provider values only. Do not invent these.

| App | Must add/confirm in Railway before production |
| --- | --- |
| XFlow | `APP_BASE_URL`, `APP_SLUG`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, OAuth client values, `CONTROL_PLANE_SERVICE_TOKEN`, XFlow UCL/control-plane secrets, Verixet endpoint/token values, DB/Supabase/Postgres values, Redis values if enabled, Sentry DSN if enabled |
| Verixet | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Stripe price/product IDs actually read by code, Supabase/Postgres values, SendGrid values, XFlow base URL and service tokens, app-scoped usage ingest tokens |
| AudAiX | `AUDAIX_APP_BASE_URL`, `VITE_TURNSTILE_SITE_KEY` after migration, `TURNSTILE_SECRET_KEY`, `AUDAIX_TURNSTILE_REQUIRED=true`, Verixet API/token values, XFlow OAuth/UCL/control-plane values, DB values, SendGrid values |
| Rataify | `APP_BASE_URL`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, XFlow bootstrap/UCL values, Verixet API/usage token values, DB values, Redis values if enabled, SendGrid values |
| WordGeni | Web/API public URLs, `NEXT_PUBLIC_CREVUX_URL`, Crevux API/shared secret, Verixet API/token values, XFlow OAuth/handoff values, DB values, AI provider keys, Sentry DSN if enabled |
| Crevux | API/public URLs, `JWT_SECRET`, `MEDIA_DOWNLOAD_SIGNING_SECRET`, DB values, AI provider keys, Stripe values only if Crevux local billing remains active, Verixet API/usage token values, WordGeni shared secret |
