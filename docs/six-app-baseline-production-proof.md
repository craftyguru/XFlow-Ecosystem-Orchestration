# Six-App Baseline Production Proof

Generated: 2026-05-07

## Result

Production/staging proof is **not complete yet**. The local contract proof passed for the six-app free baseline, Verixet billing authority, checkout handoff payloads, Verixet normalized snapshot shape, fail-closed price mapping behavior, and Verixet backfill dry-run. The live preflight now passes, deployed XFlow sees the required Verixet checkout/binding/activation env vars, and deployed XFlow now accepts the bearer-authenticated Verixet event-ingest proof. Remaining blockers are proof-user authentication not establishing a session, which prevents live entitlement/dashboard verification.

Do not mark production Stripe checkout as proven until the blocked live checks below pass against staging with Stripe test mode.

Current decision: **C. NOT READY**.

## Pass/Fail Table

| Scenario | Status | Evidence |
| --- | --- | --- |
| Free signup baseline contract | Pass | XFlow local resolver proof shows all six baseline apps, no paid apps, no paid credits, no paid storage. |
| `selectedAppSlug` does not restrict baseline access | Pass | XFlow proof reports `selectedAppSlugRestrictsAccess: false`. |
| XFlow entitlement resolver source labels | Pass | XFlow proof reports baseline source `verixet_free_baseline`, no paid Verixet snapshot for a free user. |
| XFlow production billing authority | Pass | XFlow proof reports `productionAuthorityOk: true`, `localStripeBlockedInProduction: true`, and `localPaidEntitlementsAllowedInProduction: false`. |
| XFlow checkout handoff payloads | Pass, local contract only | Full Ecosystem Starter, Main 4 Bundle Starter, and WordGeni Starter produce Verixet checkout contexts with workspace, user, app/bundle/plan, interval, and return URL. |
| Verixet normalized free snapshot | Pass, local contract only | Verixet proof separates app opening from paid access and reports free billing status, zero credits, zero storage, and null Stripe refs. |
| Verixet canonical checkout metadata | Pass, local contract only | Verixet proof emits subscription metadata for ecosystem, bundle, and single-app plans, plus top-up metadata for AI, media, and storage. |
| Missing Stripe price mapping behavior | Pass | Verixet proof reports expected config failure for missing `STRIPE_PRICE_AI_BUILDER`; no silent local price fallback. |
| Webhook ledger idempotency tests | Pass, unit scope | Verixet webhook and usage tests passed. Live Stripe replay is blocked. |
| Verixet backfill dry-run | Pass | Dry-run found 8 candidate membership rows across 8 candidate workspaces and did not mutate data. |
| XFLOW_PROOF_EVENT_BEARER source | Pass | Code trace proves it is the raw app-scoped `verixet_event_ingest` bearer stored encrypted in XFlow `app_connections`, not a generic service-token env. A safe regenerate/print-once script was added. |
| Live proof preflight | Pass | User-provided latest preflight output: `ok: true`, `errors: []`. |
| Dedicated proof user login/signup | Blocked by auth/session | Latest run traced the deployed auth flow. `/api/auth/login/intent` returns `invalid_credentials` for the configured proof email/password, so deployed XFlow does not accept that credential pair. Fallback `/api/auth/signup/start` still returns `validation_failed` with a local-contract-compatible free signup payload. Password was not printed. |
| Deployed XFlow Verixet event ingest proof | Pass | Unauthenticated ingest rejects correctly with 401; bearer-authenticated proof ingest now returns 201. The 400 was caused by proof payload shape: it was missing canonical v1 ingest fields `category`, `severity`, and `title`. |
| Deployed XFlow Verixet authority config | Pass | Latest live proof sees `VERIXET_BILLING_CHECKOUT_URL`, `VERIXET_BILLING_CHECKOUT_SECRET`, `VERIXET_REGISTER_EVENT_BINDING_URL`, `VERIXET_REGISTER_EVENT_BINDING_SECRET`, `VERIXET_SIGNAL_ACTIVATION_URL`, `VERIXET_SIGNAL_ACTIVATION_SECRET`, and `XFLOW_EVENTS_URL`. |
| XFlow backfill dry-run | Blocked | Database authentication still fails for the local configured `postgres` user. Script now honors `XFLOW_DATABASE_URL`; a valid credential is still required. |
| Fresh real XFlow signup through deployed flow | Blocked | Deployed signup handoff returns `validation_failed` for the proof script payload before Turnstile. The local route contract accepts this shape, so this is either a deployed-code contract mismatch or a stricter deployed schema. |
| Real Stripe test checkout sessions | Blocked | Missing Stripe test secret and staging checkout endpoint configuration. |
| Real Stripe webhook replay through Verixet | Blocked | Missing Stripe test event ID, webhook/replay secret, and staging Verixet base URL. |
| Satellite app live shell/access proof | Blocked | Missing deployed app URLs and a shared ecosystem test session/user. Local adapter behavior was covered by previous app tests, but live access was not proven here. |
| Safe to deploy | Not ready | Local contracts and builds passed, but production/staging checkout, webhook, snapshot update, and satellite access remain unproven. |

## Commands Run

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/six-app-baseline-proof.ts
```

Result: passed.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npx tsx scripts/six-app-baseline-proof.ts
```

Result: passed.

```powershell
cd "K:\XFlow-Ecosystem Workspace"
node scripts/six-app-live-proof-preflight.mjs
```

Latest user-provided result: passed.

```json
{
  "ok": true,
  "errors": []
}
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run typecheck
```

Result after adding `scripts/regenerate-proof-event-bearer.ts`: passed.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run proof:verixet
```

Latest live result after retry: failed/not verified. Secrets were not printed.

Failed checks:

- none in the latest live proof run.

Not verified:

- `proof_user_auth`: login did not establish session; `/api/auth/login/intent` returned `invalid_credentials`; signup handoff returned `validation_failed`.
- `verixet_entitlement_truth_read`: no authenticated proof session.
- `dashboard_verixet_connection_state`: no authenticated proof session.

Passed checks during this run:

- `verixet_billing_authority`
- `paid_access_fails_closed`
- `env_verixet_billing_checkout_url`
- `env_verixet_billing_checkout_secret`
- `env_verixet_register_event_binding_url`
- `env_verixet_register_event_binding_secret`
- `env_verixet_signal_activation_url`
- `env_verixet_signal_activation_secret`
- `env_xflow_events_url`
- `unauthenticated_event_ingest_rejected`
- `valid_verixet_event_ingest`

Fix applied for the previous `valid_verixet_event_ingest` 400:

- Updated `scripts/verixet-live-proof.ts` to send canonical v1 ingest fields:
  - `request_id`
  - `app_slug`
  - `event_type`
  - `environment`
  - `category`
  - `severity`
  - `title`
  - `source`
  - `occurred_at`
  - `dedupe_key`
  - `metadata`
- Added sanitized diagnostics for future ingest failures; Authorization is redacted and no bearer/secrets are printed.

Credential behavior added to this command:

```text
XFLOW_PROOF_SESSION_COOKIE takes precedence when set.
Otherwise, XFLOW_PROOF_EMAIL and XFLOW_PROOF_PASSWORD are used to log in the dedicated proof user.
If login does not establish a session, the script starts the deployed XFlow signup handoff for that email.
The password is never printed.
Existing-user/signup responses are not treated as fatal, but an authenticated session is required before entitlement checks can continue.
```

Latest sanitized auth diagnostic:

```json
{
  "loginRouteAttempted": "/api/auth/login/intent -> /api/auth/callback/credentials",
  "signupHandoffRouteAttempted": "/api/auth/signup/start",
  "httpStatus": 400,
  "sanitizedResponseBody": {
    "login": {
      "loginIntent": {
        "ok": false,
        "error": "Invalid credentials.",
        "code": "invalid_credentials"
      },
      "callback": null
    },
    "signup": {
      "ok": false,
      "error": "Invalid signup request.",
      "code": "validation_failed"
    }
  },
  "xflowProofEmailPresent": true,
  "xflowProofPasswordPresent": true,
  "workspaceNamePresent": true,
  "selectedPackagePresent": true,
  "turnstileAppearsRequired": false,
  "userAlreadyExists": false,
  "setCookieReturned": true,
  "sessionCookieReturned": false,
  "signupPayload": {
    "selectedAppSlug": "xflow",
    "sourceAppSlug": "xflow",
    "planSlug": "free",
    "signupMode": "free",
    "billingInterval": "monthly",
    "returnToPresent": true,
    "returnToLooksUrl": true,
    "workEmailPresent": true,
    "namePresent": true,
    "workspaceNamePresent": true,
    "termsAccepted": true,
    "privacyAccepted": true,
    "turnstileTokenPresent": false
  }
}
```

Auth route trace:

```text
Proof credential login:
scripts/verixet-live-proof.ts
  -> POST /api/auth/login/intent
  -> GET /api/auth/csrf
  -> POST /api/auth/callback/credentials
  -> GET /api/auth/sessions

Fallback signup handoff:
scripts/verixet-live-proof.ts
  -> POST /api/auth/signup/start
```

The deployed credential path is blocked by invalid credentials, not by Turnstile. The deployed signup handoff is blocked by `validation_failed` before Turnstile; the same payload matches the current local XFlow route contract, so treat this as a deployed route contract mismatch until deployment is refreshed or the deployed schema is inspected.

### Manual Session Cookie Path

Until the deployed proof user credential pair is accepted or deployed signup handoff is fixed, use an operator-created browser session for the authenticated entitlement/dashboard reads:

```text
1. Open https://xflowx.com in a browser.
2. Log in as the dedicated proof user.
3. Open DevTools.
4. Go to Application or Storage -> Cookies -> https://xflowx.com.
5. Copy only the XFlow session cookie, usually a cookie whose name contains authjs.session-token or next-auth.session-token.
6. Put the full name=value pair into .env.proof.local as XFLOW_PROOF_SESSION_COOKIE.
7. Do not include CSRF, callback, bearer, database, or unrelated cookies.
8. Reload the proof env in PowerShell.
9. Rerun: cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"; npx tsx scripts/verixet-live-proof.ts
```

Do not paste the cookie into logs or chat. The proof script verifies the cookie through `/api/auth/sessions` before using it.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/backfill-free-ecosystem-baseline.ts --dry-run
```

Result: blocked by database authentication failure for the configured local `postgres` user.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npx tsx scripts/backfill-free-ecosystem-baseline.ts --dry-run
```

Result: passed, no mutation.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run typecheck
npm run test -- tests/unit/billing-entitlement-resolution.test.ts tests/unit/billing-authority.test.ts
npm run build
```

Result: passed. Build emitted existing Next/Sentry/Edge runtime warnings but exited 0.

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm run typecheck
npm run test -- src/lib/billing/ecosystem-billing.test.ts src/lib/billing/credits.test.ts src/lib/billing/usage-ingest.test.ts src/app/api/webhooks/stripe/ecosystem/route.test.ts
npm run build
```

Result: passed. The requested `credits.test.ts` path did not resolve as a separate Vitest file in this repo; the run executed the existing billing, usage-ingest, and ecosystem webhook tests.

## JSON Evidence

XFlow free resolver proof:

```json
{
  "baselineApps": ["xflow", "verixet", "wordgeni", "crevux", "rataify", "audaix"],
  "paidApps": [],
  "billingAuthority": "verixet",
  "sourceLabels": {
    "baseline": "verixet_free_baseline",
    "paidSnapshot": null
  },
  "selectedAppSlugRestrictsAccess": false,
  "credits": { "ops": 0, "creative": 0 },
  "limits": { "apps": 6, "storageGb": 0, "aiCredits": 0, "mediaCredits": 0 }
}
```

XFlow authority proof:

```json
{
  "productionAuthorityOk": true,
  "localStripeBlockedInProduction": true,
  "localPaidEntitlementsAllowedInProduction": false
}
```

XFlow checkout handoff contract examples:

```json
[
  {
    "name": "full_ecosystem_starter",
    "sourceOfTruth": "verixet",
    "appSlug": "xflow",
    "planSlug": "full_ecosystem_starter",
    "bundleSlug": "full_ecosystem_starter",
    "billingInterval": "monthly",
    "workspaceId": "00000000-0000-4000-8000-000000000010",
    "userId": "00000000-0000-4000-8000-000000000001",
    "returnTo": "https://xflow.example.test/dashboard/billing"
  },
  {
    "name": "main4_bundle_starter",
    "sourceOfTruth": "verixet",
    "appSlug": "xflow",
    "planSlug": "main4_bundle_starter",
    "bundleSlug": "main4_bundle_starter",
    "billingInterval": "monthly"
  },
  {
    "name": "single_app_wordgeni_starter",
    "sourceOfTruth": "verixet",
    "appSlug": "wordgeni",
    "planSlug": "wordgeni_starter",
    "bundleSlug": null,
    "billingInterval": "monthly"
  }
]
```

Verixet free snapshot contract:

```json
{
  "app_access_list": ["xflow", "verixet", "wordgeni", "crevux", "rataify", "audaix"],
  "canOpenApp": {
    "xflow": true,
    "verixet": true,
    "wordgeni": true,
    "crevux": true,
    "rataify": true,
    "audaix": true
  },
  "paidAppAccess": {
    "xflow": false,
    "verixet": false,
    "wordgeni": false,
    "crevux": false,
    "rataify": false,
    "audaix": false
  },
  "ai_credit_balance": "0",
  "media_credit_balance": "0",
  "storage_gb_allowance": 0,
  "billing_status": "free",
  "stripe_refs": {
    "customer": null,
    "subscription": null,
    "payment_intent": null
  },
  "source": "verixet_free_baseline"
}
```

Verixet add-on metadata contract:

```json
[
  {
    "topUpPackSlug": "ai_builder",
    "creditType": "ai_action_credits"
  },
  {
    "topUpPackSlug": "media_builder",
    "creditType": "media_image_credits"
  },
  {
    "topUpPackSlug": "storage_25gb",
    "creditType": "storage_gb",
    "storageGb": 25,
    "billingInterval": "monthly"
  }
]
```

Verixet backfill dry-run:

```json
{
  "dryRun": true,
  "candidateMembershipRows": 8,
  "candidateWorkspaces": 8,
  "wouldVerifyBaselineSnapshots": 8,
  "mutatesData": false
}
```

Live preflight sanitized output:

```json
{
  "ok": false,
  "generatedAt": "2026-05-07T09:46:18.422Z",
  "urls": [
    { "name": "XFLOW_PROOF_BASE_URL", "configured": false },
    { "name": "VERIXET_PROOF_BASE_URL", "configured": false },
    { "name": "RATAIFY_PROOF_BASE_URL", "configured": false },
    { "name": "AUDAIX_PROOF_BASE_URL", "configured": false },
    { "name": "WORDGENI_PROOF_BASE_URL", "configured": false },
    { "name": "CREVUX_PROOF_BASE_URL", "configured": false }
  ],
  "database": {
    "XFLOW_DATABASE_URL": false,
    "DATABASE_URL": false,
    "VERIXET_DATABASE_URL": false
  },
  "stripe": {
    "STRIPE_SECRET_KEY": "missing",
    "STRIPE_WEBHOOK_SECRET": false
  },
  "proofAuth": {
    "XFLOW_PROOF_SESSION_COOKIE": false,
    "XFLOW_PROOF_EMAIL": false,
    "XFLOW_PROOF_PASSWORD": false
  },
  "serviceTokens": [
    { "name": "XFLOW_PROOF_EVENT_BEARER", "configured": false },
    { "name": "VERIXET_BOOTSTRAP_SECRET", "configured": false },
    { "name": "VERIXET_BILLING_CHECKOUT_SECRET", "configured": false },
    { "name": "VERIXET_SIGNUP_HANDOFF_SECRET", "configured": false }
  ],
  "optionalSecrets": [
    { "name": "STRIPE_WEBHOOK_SECRET", "configured": false }
  ],
  "errors": [
    "XFLOW_PROOF_BASE_URL is required.",
    "VERIXET_PROOF_BASE_URL is required.",
    "RATAIFY_PROOF_BASE_URL is required.",
    "AUDAIX_PROOF_BASE_URL is required.",
    "WORDGENI_PROOF_BASE_URL is required.",
    "CREVUX_PROOF_BASE_URL is required.",
    "XFLOW_DATABASE_URL or DATABASE_URL is required for XFlow DB proof.",
    "VERIXET_DATABASE_URL is required.",
    "STRIPE_SECRET_KEY is required.",
    "VERIXET_BOOTSTRAP_SECRET is required.",
    "XFLOW_PROOF_EVENT_BEARER is required.",
    "Proof user authentication is required: set XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL plus XFLOW_PROOF_PASSWORD."
  ]
}
```

XFlow live proof output:

```json
{
  "passed": false,
  "failed": [],
  "notVerified": ["proof_base_url"]
}
```

## Production/Staging Env Vars Required

XFlow:

```text
XFLOW_BILLING_AUTHORITY=verixet
XFLOW_PROOF_BASE_URL
XFLOW_PROOF_SESSION_COOKIE
XFLOW_PROOF_EMAIL and XFLOW_PROOF_PASSWORD, if the proof is run by credential login instead of cookie
XFLOW_PROOF_EVENT_BEARER
VERIXET_BILLING_CHECKOUT_URL
VERIXET_BILLING_CHECKOUT_SECRET
VERIXET_SIGNUP_URL
VERIXET_SIGNUP_HANDOFF_SECRET
ECOSYSTEM_RETURN_ORIGINS
XFLOW_DATABASE_URL or DATABASE_URL
```

### XFLOW_PROOF_EVENT_BEARER Source

`XFLOW_PROOF_EVENT_BEARER` is not a Railway secret created by default and is not one of the control-plane service-token env vars.

Code path proved:

```text
apps/XFlow/scripts/verixet-live-proof.ts
  -> POST {XFLOW_SMOKE_BASE_URL}/api/control-plane/events
  -> Authorization: Bearer ${XFLOW_PROOF_EVENT_BEARER}

apps/XFlow/src/app/api/control-plane/events/route.ts
  -> executeEventIngestCommand({ bearerToken, body, headerAppSlug })

apps/XFlow/src/infra/events/ingest-event.ts
  -> resolveEventIngestBearerMatch({ candidateAppSlugs, bearerToken })

apps/XFlow/src/lib/events/ingest-auth.ts
  -> apps.slug from payload/header app slug
  -> app_connections where app_id matches and auth_type = "bearer"
  -> prefers credential_source = "verixet_event_ingest"
  -> decrypts token_encrypted and compares it to the bearer
```

The matching credential source is:

```text
CREDENTIAL_SOURCE_VERIXET_EVENT_INGEST = "verixet_event_ingest"
```

`apps/XFlow/src/core/verixet/upsert-verixet-event-ingest-app-connection.ts` stores this token in `app_connections.token_encrypted` and stores the safe SHA-256 fingerprint in `app_connections.managed_token_fingerprint_sha256`. `apps/XFlow/src/core/verixet/provision-verixet-outbound-event-ingest.ts` sends the same plaintext to Verixet as `events_bearer_token` when registering the XFlow event-ingest binding.

Therefore `XFLOW_PROOF_EVENT_BEARER` should be the raw plaintext bearer for the linked app connection with `credential_source = "verixet_event_ingest"`. It should not be `CONTROL_PLANE_SERVICE_TOKEN`, `XFLOW_CONTROL_PLANE_SERVICE_TOKEN`, `VERIXET_XFLOW_SERVICE_TOKEN`, or `VERIXET_REGISTER_EVENT_BINDING_SECRET`.

If the raw plaintext is not available from a secure operator vault, regenerate it safely from XFlow:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_DATABASE_URL = "<xflow-staging-or-production-db-url>"
$env:XFLOW_ENCRYPTION_KEY = "<same-32+-char-key-used-by-deployed-XFlow>"
$env:XFLOW_PROOF_APP_SLUG = "<linked-app-slug>"
# Only needed if the app slug exists in more than one workspace.
$env:XFLOW_PROOF_WORKSPACE_ID = "<workspace-id>"
npx tsx scripts/regenerate-proof-event-bearer.ts --confirm-print-secret
```

The script updates only the `verixet_event_ingest` app connection for the selected app, stores the encrypted bearer and fingerprint in the production credential store, and prints the new raw bearer exactly once. Set that printed value as `XFLOW_PROOF_EVENT_BEARER` in the secure proof shell or secret store. Do not paste it into logs.

Production XFlow must not set:

```text
XFLOW_ALLOW_LOCAL_STRIPE_CHECKOUT=1
XFLOW_ALLOW_LOCAL_BILLING_ENTITLEMENTS=1
```

Verixet:

```text
VERIXET_PROOF_BASE_URL
VERIXET_DATABASE_URL or DATABASE_URL
ECOSYSTEM_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET or the ecosystem-specific webhook secret used by getEcosystemStripeWebhookSecret
VERIXET_BOOTSTRAP_SECRET
VERIXET_PUBLIC_BASE_URL or deployed staging base URL used by proof scripts
```

Satellite proof URLs:

```text
RATAIFY_PROOF_BASE_URL
AUDAIX_PROOF_BASE_URL
WORDGENI_PROOF_BASE_URL
CREVUX_PROOF_BASE_URL
```

Canonical Stripe price envs needed for this proof:

```text
VERIXET_STRIPE_PRICE_ECOSYSTEM_STARTER_MONTHLY
VERIXET_STRIPE_PRICE_MAIN4_STARTER_MONTHLY
VERIXET_STRIPE_PRICE_WORDGENI_STARTER_MONTHLY
STRIPE_PRICE_AI_BUILDER
STRIPE_PRICE_MEDIA_BUILDER
STRIPE_PRICE_STORAGE_25GB_MONTHLY
```

Also configure the existing XFlow snapshot/mirror credentials used by the Verixet to XFlow control-plane integration.

## Safe Backfill Commands

Dry-run XFlow first:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_DATABASE_URL = "<production-db-url>"
npx tsx scripts/backfill-free-ecosystem-baseline.ts --dry-run
```

Execute XFlow later only after the dry-run is reviewed:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:NODE_ENV = "production"
$env:XFLOW_CONFIRM_BASELINE_BACKFILL = "1"
$env:XFLOW_DATABASE_URL = "<production-db-url>"
npx tsx scripts/backfill-free-ecosystem-baseline.ts
```

Dry-run Verixet first:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
$env:VERIXET_DATABASE_URL = "<production-db-url>"
npx tsx scripts/backfill-free-ecosystem-baseline.ts --dry-run
```

Execute Verixet later only after the dry-run is reviewed:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
$env:NODE_ENV = "production"
$env:VERIXET_CONFIRM_BASELINE_BACKFILL = "1"
$env:VERIXET_DATABASE_URL = "<production-db-url>"
npx tsx scripts/backfill-free-ecosystem-baseline.ts
```

## Live Proof Commands To Run In Staging

XFlow deployed proof:

```powershell
cd "K:\XFlow-Ecosystem Workspace"
$env:XFLOW_PROOF_BASE_URL = "https://<xflow-staging-host>"
$env:VERIXET_PROOF_BASE_URL = "https://<verixet-staging-host>"
$env:RATAIFY_PROOF_BASE_URL = "https://<rataify-staging-host>"
$env:AUDAIX_PROOF_BASE_URL = "https://<audaix-staging-host>"
$env:WORDGENI_PROOF_BASE_URL = "https://<wordgeni-staging-host>"
$env:CREVUX_PROOF_BASE_URL = "https://<crevux-staging-host>"
$env:XFLOW_DATABASE_URL = "<xflow-staging-db-url>"
$env:VERIXET_DATABASE_URL = "<verixet-staging-db-url>"
$env:STRIPE_SECRET_KEY = "sk_test_..."
$env:STRIPE_WEBHOOK_SECRET = "whsec_..."
$env:VERIXET_BOOTSTRAP_SECRET = "<staging-bootstrap-secret>"
$env:XFLOW_PROOF_EVENT_BEARER = "<proof-bearer-token>"
$env:XFLOW_PROOF_APP_SLUG = "<linked-app-slug>"
$env:XFLOW_PROOF_EMAIL = "<dedicated-proof-user-email>"
$env:XFLOW_PROOF_PASSWORD = "<dedicated-proof-user-password>"
node scripts/six-app-live-proof-preflight.mjs
```

Then run:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_SMOKE_BASE_URL = "https://<xflow-staging-host>"
$env:XFLOW_PROOF_EMAIL = "<dedicated-proof-user-email>"
$env:XFLOW_PROOF_PASSWORD = "<dedicated-proof-user-password>"
$env:XFLOW_PROOF_EVENT_BEARER = "<proof-bearer-token>"
$env:XFLOW_PROOF_APP_SLUG = "<linked-app-slug>"
$env:VERIXET_BILLING_CHECKOUT_URL = "https://<verixet-staging-host>/billing/checkout"
$env:VERIXET_BILLING_CHECKOUT_SECRET = "<shared-handoff-secret>"
npm run proof:verixet
```

Stripe test checkout session creation:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
$env:ECOSYSTEM_STRIPE_SECRET_KEY = "sk_test_..."
npx tsx scripts/create-phase7m-stripe-test-checkout.ts --workspace-id <workspace-id>
```

Stripe webhook replay:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
$env:ECOSYSTEM_STRIPE_SECRET_KEY = "sk_test_..."
$env:VERIXET_BOOTSTRAP_SECRET = "<staging-bootstrap-secret>"
npx tsx scripts/validate-real-stripe-replay.ts --workspace-id <workspace-id> --event-id <evt_test_event_id> --base-url https://<verixet-staging-host>
```

## Required Live Assertions Still Pending

1. Create a fresh user through the deployed XFlow signup UI.
2. Confirm the same workspace can open XFlow, Verixet, Rataify, AudAiX, WordGeni, and Crevux in free mode.
3. Confirm paid-only features, paid credits, paid media credits, and paid storage are unavailable before purchase.
4. Start Stripe test-mode checkout from XFlow for Full Ecosystem Starter, Main 4 Bundle Starter, one single-app plan, one AI credit top-off, and one storage add-on.
5. Confirm Verixet receives canonical identifiers in each checkout/session payload.
6. Replay or receive Stripe test webhooks through Verixet.
7. Confirm subscription, credit, media, storage, cancellation, refund, and dispute events update the ledger and normalized snapshot idempotently.
8. Confirm XFlow mirrors the Verixet snapshot.
9. Confirm each satellite app blocks paid-only features before paid entitlement and unlocks only the correct paid features after snapshot update.

## Deployment Call

Local contract proof: passed.

Production/staging proof: blocked.

Production Stripe checkout proven: no.

Webhook/ledger replay proven: no.

All satellite live access proven: no.

Safe to deploy as production-ready: no.

Definition-of-done decision: **C. NOT READY**. The code is ready for a staging proof attempt, but production readiness remains pending until the live signup, checkout, webhook replay, Verixet snapshot mutation, and satellite access checks above are executed against staging with Stripe test mode.
