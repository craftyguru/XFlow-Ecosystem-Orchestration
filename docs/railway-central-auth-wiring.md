# Railway Central Auth Wiring

Current target: Railway-hosted production/staging auth wiring. Local Phase 6B ports and `.env.phase6d.local` are not the target for this proof unless explicitly requested.

XFlow owns upstream social OAuth for the full ecosystem. Satellite apps delegate social signup/login to XFlow and must not require app-local GitHub, Google, or Facebook OAuth credentials for normal local, staging, or production startup.

## XFlow Railway Env

XFlow service: `https://xflowx.com`

Required variable names:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://xflowx.com/api/auth/github/callback

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://xflowx.com/api/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=https://xflowx.com/api/auth/facebook/callback
```

Only XFlow should hold these upstream provider credentials.

## Provider Dashboard Callback URLs

Register these exact callback URLs in the provider dashboards:

| Provider | Callback URL |
| --- | --- |
| GitHub | `https://xflowx.com/api/auth/github/callback` |
| Google | `https://xflowx.com/api/auth/google/callback` |
| Facebook | `https://xflowx.com/api/auth/facebook/callback` |

Do not register satellite app URLs as GitHub, Google, or Facebook OAuth callbacks. Satellites receive XFlow handoff/callback traffic only.

## Satellite Railway Env

Every satellite service should use:

```env
AUTH_PROVIDER=xflow
ECOSYSTEM_AUTH_PROVIDER=xflow
XFLOW_ECOSYSTEM_AUTH_URL=https://xflowx.com/auth/start
XFLOW_ECOSYSTEM_TOKEN_URL=https://xflowx.com/api/oauth/token
XFLOW_ECOSYSTEM_USERINFO_URL=https://xflowx.com/oauth/userinfo
XFLOW_ECOSYSTEM_REDIRECT_URI=<that app callback URL>
ECOSYSTEM_AUTH_STATE_SECRET=<32+ char secret>
```

Satellite services must not require:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

## Satellite Callback URLs

| App | Railway URL | `XFLOW_ECOSYSTEM_REDIRECT_URI` |
| --- | --- | --- |
| RatAiFy | `https://rataify.com` | `https://rataify.com/auth/xflow/callback` |
| Verixet | `https://verixet.com` | `https://verixet.com/api/xflow/oauth/callback` |
| AudAiX | `https://audaix.com` | `https://audaix.com/auth/callback` |
| WordGeni | `https://wordgeni.com` | `https://wordgeni.com/auth/xflow/callback` |
| Crevux | `https://crevux.com` | `https://crevux.com/auth/xflow/callback` |

## Verification Commands

Run from `apps/XFlow`:

```bash
npm run audit:railway-auth-env
npm run verify:railway-central-auth
```

The audit command prints expected env variable names and can optionally check the current process by setting `RAILWAY_AUTH_AUDIT_SERVICE=xflow|rataify|verixet|audaix|wordgeni|crevux`. It never prints values.

The verification command checks public Railway-hosted endpoints and reports only URL/status/path-level redirect evidence. It does not print secrets and does not touch production data.

## Current Railway Blockers

Latest Railway central-auth verification reached the deployed services and failed for two satellite routes:

| App | Route behavior | Required behavior |
| --- | --- | --- |
| RatAiFy | `/api/auth/github`, `/api/auth/google`, and `/api/auth/facebook` redirect to upstream social providers. | Redirect to `https://xflowx.com/auth/start?provider=<provider>&app=rataify&returnTo=<encoded>`. |
| Crevux | `/api/auth/oauth/google/start` redirects to Google directly. | Redirect to `https://xflowx.com/auth/start?provider=google&app=crevux&returnTo=<encoded>`. |

The repository code has XFlow delegation branches for these routes. If Railway still redirects directly to GitHub, Google, or Facebook, check these deployment causes first:

1. Railway is running an older build for RatAiFy or Crevux.
2. `AUTH_PROVIDER` or `ECOSYSTEM_AUTH_PROVIDER` is set to `legacy-local`.
3. The XFlow ecosystem auth env names are missing on the satellite service.
4. A legacy auth route is mounted before the XFlow delegation route in the deployed build.

Do not treat app-local social OAuth credentials as required for satellite Railway services. They may remain only for a deliberate standalone legacy fallback, and that fallback is not the central-auth Railway mode.

## RatAiFy Railway Env

Set or confirm these names on the RatAiFy Railway service:

```env
AUTH_PROVIDER=xflow
ECOSYSTEM_AUTH_PROVIDER=xflow
XFLOW_ECOSYSTEM_AUTH_URL=https://xflowx.com/auth/start
XFLOW_ECOSYSTEM_TOKEN_URL=https://xflowx.com/api/oauth/token
XFLOW_ECOSYSTEM_USERINFO_URL=https://xflowx.com/oauth/userinfo
XFLOW_ECOSYSTEM_REDIRECT_URI=https://rataify.com/auth/xflow/callback
ECOSYSTEM_AUTH_STATE_SECRET=
```

RatAiFy should not require `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, or `FACEBOOK_APP_SECRET` in XFlow mode.

## Crevux Railway Env

Set or confirm these names on the Crevux Railway service:

```env
AUTH_PROVIDER=xflow
ECOSYSTEM_AUTH_PROVIDER=xflow
XFLOW_ECOSYSTEM_AUTH_URL=https://xflowx.com/auth/start
XFLOW_ECOSYSTEM_TOKEN_URL=https://xflowx.com/api/oauth/token
XFLOW_ECOSYSTEM_USERINFO_URL=https://xflowx.com/oauth/userinfo
XFLOW_ECOSYSTEM_REDIRECT_URI=https://crevux.com/auth/xflow/callback
ECOSYSTEM_AUTH_STATE_SECRET=
```

Crevux should not require `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, or `FACEBOOK_APP_SECRET` in XFlow mode.

## Deployment Steps

1. Set or confirm the RatAiFy and Crevux Railway env names above. Do not print or paste secret values into logs.
2. Deploy the latest RatAiFy and Crevux code to Railway.
3. Restart both services so the new build and env are active.
4. Run `npm run verify:railway-central-auth` from `apps/XFlow`.
5. The deployment is not correct until every satellite social auth route either redirects to `https://xflowx.com/auth/start` or fails cleanly without redirecting to an upstream social provider.

## Production/Staging Rules

- XFlow owns GitHub, Google, and Facebook OAuth credentials.
- Satellite login/signup entrypoints should redirect to XFlow or fail cleanly if a route is not implemented.
- Satellite apps own XFlow callback/session provisioning only.
- `AUTH_PROVIDER=legacy-local` is a deprecated standalone fallback, not the normal Railway mode.
- Do not use local Phase 6B ports for Railway proof.
- Do not use interactive `db:push`.
- Do not print secrets.
