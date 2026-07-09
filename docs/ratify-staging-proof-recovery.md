# RatAiFy Staging Proof Recovery

Date: 2026-07-02

Status: blocked at staging preflight.

Current rollout status: `blocked_pending_rollout`.

Phase 6 status: blocked. Do not start Phase 6 until staging/browser proof and production rollout prerequisites are complete.

## Preflight Result

Command run from `apps/RatAiFy`:

```powershell
npm run preflight:staging-proof
```

Result: failed.

Evidence path:

- `apps/RatAiFy/.ratify-staging-proof/preflight-summary.json`

The preflight printed presence/status categories only. It did not print staging URLs, database connection strings, auth values, passwords, cookies, bearer values, service tokens, API keys, webhook secrets, request bodies, response bodies, private content, provider responses, stack traces, or proof payloads.

## Missing Required Inputs

| missing input | purpose | provider/action needed | status |
| --- | --- | --- | --- |
| `RATAIFY_STAGING_BASE_URL` | Non-production app URL for browser/API proof | Operator must provide verified staging URL | missing |
| `RATAIFY_STAGING_DATABASE_URL` or `RATAIFY_NON_PRODUCTION_DATABASE_URL` | Non-production database target for fixture bootstrap | Operator must provide verified staging DB target | missing |
| `RATAIFY_E2E_ADMIN_EMAIL` | Admin fixture identity | Operator/test owner must provide non-production fixture user | missing |
| `RATAIFY_E2E_SUPERADMIN_EMAIL` | Superadmin fixture identity | Operator/test owner must provide non-production fixture user | missing |
| `RATAIFY_E2E_USER_EMAIL` | Non-superadmin fixture identity | Operator/test owner must provide non-production fixture user | missing |
| `RATAIFY_E2E_ADMIN_PASSWORD` | Admin fixture auth input | Operator/test owner must provide via secret-safe env path | missing |
| `RATAIFY_E2E_SUPERADMIN_PASSWORD` | Superadmin fixture auth input | Operator/test owner must provide via secret-safe env path | missing |
| `RATAIFY_E2E_USER_PASSWORD` | Non-superadmin fixture auth input | Operator/test owner must provide via secret-safe env path | missing |

Optional:

- `RATAIFY_STAGING_SERVICE_TOKEN` or secure test harness token, only if the proof harness requires it.

## Fixture Users Needed

- Admin user: non-production only, able to access admin support/contact/export surfaces.
- Superadmin user: non-production only, able to access superadmin support, flags, audit, scan/evidence, and overview surfaces.
- Non-superadmin user: non-production only, used to prove denied superadmin state.

Do not use production user accounts or production credentials.

## Fixture Data Needed

- Support thread fixture with support message and internal-note target.
- Feature flag fixture with active, toggle, archive/deprecate, and delete-disabled posture.
- Contact submission fixture with assignable admin owner.
- Metadata-only report/export request fixture.
- Developer API-key fixture with one-time display/redaction proof path.
- Developer webhook fixture with overview/delivery metadata and no response body capture.
- Scan/issue/evidence/proof fixture with summarized evidence only.
- Legacy support/contact telemetry fixture markers.

## Stop Conditions

Stop and do not bootstrap fixtures if:

- The app URL is production or cannot be classified as non-production.
- The database URL is production or cannot be classified as non-production.
- Required fixture identities or auth inputs are missing.
- Any command would print secret values.
- Any provided target requires production data.
- Destructive/export/download actions would be enabled or exercised.
- `RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP=1` is not explicitly set for bootstrap.

## Rerun Commands

After the required inputs are available in the shell or approved secret-safe env mechanism:

```powershell
npm run preflight:staging-proof
```

If preflight passes and the target is explicitly non-production:

```powershell
$env:RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP = "1"
npm run bootstrap:staging-proof-fixtures
```

Then rerun Phase 5C authenticated browser/API proof against the seeded non-production fixtures.

## Current Next Operator Action

Provide the missing non-production staging app URL, non-production database URL, and three fixture user identities/auth inputs through a secret-safe environment path, then rerun `npm run preflight:staging-proof`.
