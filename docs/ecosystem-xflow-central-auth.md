# XFlow Central Ecosystem Auth

XFlow is the ecosystem social identity authority. Google, GitHub, and Facebook OAuth app credentials belong in XFlow only. Satellite apps must use XFlow OAuth or ecosystem auth handoff for social login/signup.

## Auth Modes

Satellite apps should default to:

```env
AUTH_PROVIDER=xflow
ECOSYSTEM_AUTH_PROVIDER=xflow
```

Legacy app-local social OAuth is deprecated and may only be used for a deliberate standalone fallback:

```env
AUTH_PROVIDER=legacy-local
```

In `xflow` mode, satellite apps must not require:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

## Satellite Env Contract

Each satellite app should receive XFlow ecosystem auth configuration:

```env
XFLOW_ECOSYSTEM_AUTH_URL=
XFLOW_ECOSYSTEM_TOKEN_URL=
XFLOW_ECOSYSTEM_USERINFO_URL=
XFLOW_ECOSYSTEM_REDIRECT_URI=
ECOSYSTEM_AUTH_STATE_SECRET=
```

Optional:

```env
XFLOW_ECOSYSTEM_AUTH_BASE_URL=
```

## Runtime Pattern

1. Satellite login UI sends users to XFlow.
2. XFlow owns provider selection and social OAuth.
3. XFlow returns to the satellite callback/handoff URL.
4. The satellite validates state, exchanges the code or handoff token with XFlow, calls XFlow userinfo, provisions a local session, and redirects to the dashboard/onboarding flow.

## Phase 6B Local Startup

For browser/API proof, satellite apps should start without local social OAuth credentials. If a satellite app has older routes such as `/api/auth/github`, `/api/auth/google`, or `/api/auth/facebook`, those routes should redirect to XFlow in `xflow` mode or fail cleanly with a disabled/not-configured response. They must not construct local Passport strategies or crash on missing social client IDs.

RatAiFy now routes legacy social entrypoints to XFlow in `AUTH_PROVIDER=xflow` mode and only constructs local Passport social strategies in `legacy-local` mode.

Production cutover remains unsafe until Phase 6B browser/API proof passes for all apps, rollback is tested, and the final shared Supabase go/no-go checklist is approved.
