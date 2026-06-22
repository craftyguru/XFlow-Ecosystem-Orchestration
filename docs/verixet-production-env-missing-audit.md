# Verixet Production Env Missing Audit

Date: 2026-05-05

Scope: Verixet production runtime env/catalog requirements before public deployment.

Guardrails:

- No code was changed.
- No env files were edited.
- No fake env values were added.
- Runtime validation was not weakened.
- Auth, billing, Stripe, entitlement, and `/ecosystem` video behavior were not modified.

## Reproduction

Command attempted:

```powershell
npm run build
npx next start -p 3102
```

Observed local `next start` behavior in this audit:

- One start attempt failed before validation because the local `.next` output had no `.next/BUILD_ID`.
- Earlier no-skip production-style smoke from the blocker pass reached the instrumentation hook and failed with Verixet production runtime validation errors.
- To capture the exact current missing env set without adding fake values, I invoked the same production runtime validator directly with `NODE_ENV=production`.

Capture command:

```powershell
npx tsx -e "process.env.NODE_ENV='production'; const m=require('./src/lib/env/validate-production-runtime.ts'); try{m.validateProductionRuntimeEnv(); console.log('VALID')}catch(e){console.error(e instanceof Error ? e.message : e); process.exit(1)}"
```

Captured output file:

- `output/verixet-env-audit/validate-production-runtime.txt`

Validation source files:

- `apps/Verixet/src/instrumentation.ts`
- `apps/Verixet/src/lib/env/validate-production-runtime.ts`
- `apps/Verixet/src/lib/env/validate-database-runtime.ts`
- `apps/Verixet/src/lib/env/supabase-database-url.ts`
- `apps/Verixet/src/lib/billing/plans.ts`
- `apps/Verixet/scripts/validate-staging-readiness.mjs`

## Startup Validation Path

`src/instrumentation.ts` runs on Node runtime startup and imports Sentry config, then calls:

- `validateDatabaseRuntimeEnv()`
- `validateProductionRuntimeEnv()`

This means missing production env values block the whole Verixet Node server before public marketing pages can be served. The public marketing lander does not truly need the Stripe/catalog/auth secrets to render, but current production startup validation intentionally requires them globally.

## Required For Public Marketing Runtime

These are the only values that are plausibly relevant to public marketing/canonical runtime. The marketing pages themselves do not need billing/catalog secrets, but Verixet startup validation still blocks without the broader production set below.

| Env var | Why needed | Where validated | Railway production | Can omit locally |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical app origin for redirects, Stripe flows, workspace webhook URLs, and public metadata consistency. | `validate-production-runtime.ts` | Yes | Only when not running production validation; local smoke may use existing skip flag. |
| `DATABASE_URL` | Required by global boot validation and runtime DB access; must be Supabase Postgres/pooler URI. | `validate-database-runtime.ts`, `supabase-database-url.ts`, `validate-production-runtime.ts` | Yes | No for normal Verixet server boot; yes only for static build or skipped local smoke. |

Conclusion: public marketing does not directly require every variable below, but Railway production does because instrumentation validates the full production system at startup.

## Required For Auth / OAuth

| Env var | Why needed | Where validated | Railway production | Can omit locally |
|---|---|---|---|---|
| `VERIXET_APP_SLUG` | Must be `verixet` for app identity and ecosystem integration. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_OAUTH_TOKEN_SECRET` | Signs UCL link state and encrypted connection token flows. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `ECOSYSTEM_AUTH_STATE_SECRET` | Signs universal auth state. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_AUTH_URL` | Universal XFlow auth endpoint. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_TOKEN_URL` | Universal XFlow token endpoint. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_REDIRECT_URI` | Verixet callback/redirect URI for universal auth. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_USERINFO_URL` | Universal XFlow userinfo endpoint. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_CLIENT_ID` | OAuth client id for XFlow universal auth. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `XFLOW_ECOSYSTEM_CLIENT_SECRET` | OAuth client secret for XFlow universal auth. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile key because auth mutations fail closed with Turnstile. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `TURNSTILE_SECRET_KEY` | Server Turnstile verification secret. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `SENDGRID_API_KEY` | Transactional auth/billing email. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `SENDGRID_FROM_EMAIL` | Branded SendGrid sender address. `SENDGRID_FROM` is accepted as fallback in code, but the error names `SENDGRID_FROM_EMAIL`. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `SENDGRID_FROM_NAME` | Branded transactional email sender name. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |

Conditional auth/session note:

- `DASHBOARD_SESSION_SECRET` is validated only if Supabase public auth env is configured, or by the staging readiness script. It was not in the captured missing production-runtime output because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were not both set.

## Required For Billing / Stripe

| Env var | Why needed | Where validated | Railway production | Can omit locally |
|---|---|---|---|---|
| `VERIXET_STRIPE_SECRETS_KEY` | Encrypts workspace BYO Stripe API keys and webhook secrets. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `ECOSYSTEM_STRIPE_SECRET_KEY` | Verixet-owned ecosystem billing Stripe secret key; must start with `sk_`. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `ECOSYSTEM_STRIPE_WEBHOOK_SECRET` | Verifies `/api/webhooks/stripe/ecosystem`; must start with `whsec_`. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |

## Required For Entitlement / Catalog

These env names are generated from `checkoutableBillingPlans()` and `CREDIT_TOP_UP_PACKS` in `src/lib/billing/plans.ts`, then validated by `validate-production-runtime.ts`.

All belong in Railway production if Verixet is expected to boot with current strict production validation. They can be omitted only for local non-production work or when using the existing local-only `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` smoke flag.

Stripe price ids required:

- `VERIXET_STRIPE_PRICE_RATAIFY_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_RATAIFY_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_RATAIFY_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_RATAIFY_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_RATAIFY_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_RATAIFY_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_RATAIFY_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_RATAIFY_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_RATAIFY_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_VERIXET_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_VERIXET_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_VERIXET_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_VERIXET_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_VERIXET_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_VERIXET_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_VERIXET_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_VERIXET_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_VERIXET_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_XFLOW_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_XFLOW_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_XFLOW_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_XFLOW_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_XFLOW_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_XFLOW_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_XFLOW_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_XFLOW_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_XFLOW_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_AUDAIX_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_AUDAIX_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_AUDAIX_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_AUDAIX_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_WORDGENI_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_WORDGENI_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_WORDGENI_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_WORDGENI_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_CREVUX_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREVUX_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREVUX_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_CREVUX_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREVUX_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREVUX_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_CREVUX_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREVUX_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREVUX_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_MAIN4_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_MAIN4_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_MAIN4_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_MAIN4_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_MAIN4_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_MAIN4_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_MAIN4_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_MAIN4_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_MAIN4_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_CREATOR_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREATOR_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREATOR_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_CREATOR_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREATOR_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREATOR_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_CREATOR_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_CREATOR_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_CREATOR_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_STARTER_MONTHLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_STARTER_6_MONTH`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_STARTER_YEARLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_PRO_MONTHLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_PRO_6_MONTH`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_PRO_YEARLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_ELITE_MONTHLY`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_ELITE_6_MONTH`
- `VERIXET_STRIPE_PRICE_ECOSYSTEM_ELITE_YEARLY`
- `VERIXET_STRIPE_PRICE_OPS_1K`
- `VERIXET_STRIPE_PRICE_OPS_5K`
- `VERIXET_STRIPE_PRICE_CREATIVE_250`
- `VERIXET_STRIPE_PRICE_CREATIVE_1K`

Stripe product ids required:

- `VERIXET_STRIPE_PRODUCT_RATAIFY_STARTER`
- `VERIXET_STRIPE_PRODUCT_RATAIFY_PRO`
- `VERIXET_STRIPE_PRODUCT_RATAIFY_ELITE`
- `VERIXET_STRIPE_PRODUCT_VERIXET_STARTER`
- `VERIXET_STRIPE_PRODUCT_VERIXET_PRO`
- `VERIXET_STRIPE_PRODUCT_VERIXET_ELITE`
- `VERIXET_STRIPE_PRODUCT_XFLOW_STARTER`
- `VERIXET_STRIPE_PRODUCT_XFLOW_PRO`
- `VERIXET_STRIPE_PRODUCT_XFLOW_ELITE`
- `VERIXET_STRIPE_PRODUCT_AUDAIX_STARTER`
- `VERIXET_STRIPE_PRODUCT_AUDAIX_PRO`
- `VERIXET_STRIPE_PRODUCT_AUDAIX_ELITE`
- `VERIXET_STRIPE_PRODUCT_WORDGENI_STARTER`
- `VERIXET_STRIPE_PRODUCT_WORDGENI_PRO`
- `VERIXET_STRIPE_PRODUCT_WORDGENI_ELITE`
- `VERIXET_STRIPE_PRODUCT_CREVUX_STARTER`
- `VERIXET_STRIPE_PRODUCT_CREVUX_PRO`
- `VERIXET_STRIPE_PRODUCT_CREVUX_ELITE`
- `VERIXET_STRIPE_PRODUCT_MAIN4_STARTER`
- `VERIXET_STRIPE_PRODUCT_MAIN4_PRO`
- `VERIXET_STRIPE_PRODUCT_MAIN4_ELITE`
- `VERIXET_STRIPE_PRODUCT_CREATOR_STARTER`
- `VERIXET_STRIPE_PRODUCT_CREATOR_PRO`
- `VERIXET_STRIPE_PRODUCT_CREATOR_ELITE`
- `VERIXET_STRIPE_PRODUCT_ECOSYSTEM_STARTER`
- `VERIXET_STRIPE_PRODUCT_ECOSYSTEM_PRO`
- `VERIXET_STRIPE_PRODUCT_ECOSYSTEM_ELITE`
- `VERIXET_STRIPE_PRODUCT_OPS_CREDITS`
- `VERIXET_STRIPE_PRODUCT_CREATIVE_CREDITS`

## Required For Usage Ingest / Ecosystem Delegation

| Env var | Why needed | Where validated | Railway production | Can omit locally |
|---|---|---|---|---|
| `VERIXET_RATAIFY_USAGE_INGEST_TOKEN` | Server-to-server usage ingestion for RatAiFy. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `VERIXET_XFLOW_USAGE_INGEST_TOKEN` | Server-to-server usage ingestion for XFlow. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `VERIXET_AUDAIX_USAGE_INGEST_TOKEN` | Server-to-server usage ingestion for AudAiX. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `VERIXET_AUDAIX_ECOSYSTEM_SERVICE_TOKEN` | AudAiX signup/consent/trial delegation. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |
| `VERIXET_BOOTSTRAP_SECRET` | Authorizes internal bootstrap/replay/status routes. | `validate-production-runtime.ts` | Yes | Yes outside production validation. |

## Required For Monitoring / Instrumentation

No Sentry env var appeared in the captured missing production-runtime output.

Related source behavior:

- `src/instrumentation.ts` imports `sentry.server.config` and `sentry.edge.config`.
- `scripts/validate-staging-readiness.mjs` checks `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, and `SENTRY_ENVIRONMENT` for staging readiness.

Recommendation:

- Put `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, and `SENTRY_ENVIRONMENT=production` in Railway production if Sentry monitoring is expected.
- They are not part of the captured production-runtime blocker list.

## Optional / Local-Only / Conditional

| Env var | Status | Notes |
|---|---|---|
| `VERIXET_SKIP_RUNTIME_ENV_VALIDATE` | Local-only smoke escape hatch | Existing code skips production runtime validation when set to `1`; staging readiness explicitly errors if enabled. Do not set in Railway production. |
| `VERIXET_ENABLE_BOOT_DB_PROBES` | Optional production boot probe flag | If true in production, instrumentation runs DB schema verification at boot. |
| `VERIXET_REQUIRE_VERA_MEMORY_SCHEMA` | Optional production fail-closed flag | If true in production, boot fails unless Vera memory tables exist/read. |
| `XFLOW_UCL_SERVICE_TOKEN` | Optional fallback | Only errors if set and shorter than 24 chars. |
| `DASHBOARD_SESSION_SECRET` | Conditional in captured validator | Required when Supabase public auth env is configured; staging readiness also requires it. |
| `NEXT_PUBLIC_SUPABASE_URL` | Conditional | Not in captured missing list; if paired with `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dashboard session secret must be strong. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conditional | Same as above. |
| `CONTROL_PLANE_SERVICE_TOKEN` | Conditional | Required only when control plane outbound events are enabled with `CONTROL_PLANE_ENABLED` and `XFLOW_EVENTS_URL`. |
| `XFLOW_EVENTS_BEARER_TOKEN` | Conditional alternative | Alternative to `CONTROL_PLANE_SERVICE_TOKEN` for enabled control-plane outbound events. |
| `XFLOW_LINK_API_BASE_URL` | Conditional | If set to a valid absolute URL, requires `XFLOW_CONTROL_PLANE_SERVICE_TOKEN`. |
| `XFLOW_CONTROL_PLANE_SERVICE_TOKEN` | Conditional | Required only when `XFLOW_LINK_API_BASE_URL` is set. |

## Public Marketing Need Check

Public marketing pages do not intrinsically need:

- Stripe secret keys.
- Stripe product ids.
- Stripe price ids.
- Usage ingest tokens.
- SendGrid.
- Turnstile.
- OAuth client secrets.

However, current Verixet production startup validation runs before route handling, so a missing value in any required category blocks public marketing pages too. This is a deliberate fail-fast production posture in the current code.

## Final Deployment Blocker Status

Status: **Blocked until Railway production env is populated**

Reason:

- Verixet production startup validation requires the env/catalog set above.
- Public marketing pages can be served locally only with the existing local smoke skip flag.
- Railway production should not use `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.

Minimum practical deployment action:

1. Add the auth/OAuth, database, public app URL, Turnstile, SendGrid, Stripe secret/webhook, product catalog, price catalog, usage ingest, AudAiX delegation, and bootstrap env vars listed above to Railway production.
2. Confirm `VERIXET_APP_SLUG=verixet`.
3. Confirm price values start with `price_`, product values start with `prod_`, Stripe secret starts with `sk_`, webhook secret starts with `whsec_`.
4. Run production start without `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
5. Smoke `/`, `/pricing`, `/auth/sign-in`, `/api/v1/health`, and `/api/webhooks/stripe/ecosystem` with safe non-mutating checks where possible.
