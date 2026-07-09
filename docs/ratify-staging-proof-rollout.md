# RatAiFy Staging Proof Rollout

## Phase 5B

This runbook prepares RatAiFy for Phase 5C authenticated staging browser/API proof. It does not enable new action families, production data, destructive cleanup, billing mutations, entitlement mutations, tenant lifecycle mutations, API-key rotation, webhook retry, provider credential mutation, impersonation, deployment/control-plane actions, or actual export/download execution.

## Required Environment

Set these in the operator shell or CI secret store. Do not commit them and do not print values:

- `RATAIFY_STAGING_BASE_URL`
- `RATAIFY_STAGING_DATABASE_URL` or `RATAIFY_NON_PRODUCTION_DATABASE_URL`
- `RATAIFY_E2E_ADMIN_EMAIL`
- `RATAIFY_E2E_SUPERADMIN_EMAIL`
- `RATAIFY_E2E_USER_EMAIL`
- `RATAIFY_E2E_ADMIN_PASSWORD`
- `RATAIFY_E2E_SUPERADMIN_PASSWORD`
- `RATAIFY_E2E_USER_PASSWORD`
- `RATAIFY_STAGING_SERVICE_TOKEN` or `RATAIFY_E2E_TEST_AUTH_TOKEN`, only if the Phase 5C harness needs one

For a database URL that is safe but not visibly local/staging/dev/test/qa/sandbox by hostname or database name, set `RATAIFY_APPROVED_NON_PRODUCTION_DATABASE_URL=1`. Do this only after an operator has verified the target is not production.

## Stop Conditions

Stop immediately if:

- staging base URL is missing
- staging database URL is missing
- fixture identities are missing
- any target is production-looking
- target safety cannot be proven
- bootstrap would overwrite non-fixture user emails
- bootstrap would delete, purge, truncate, or drop records
- secrets would be printed
- production credentials are required

## Commands

Run preflight first:

```bash
npm run preflight:staging-proof
```

Run fixture bootstrap only after preflight passes and the operator intentionally confirms fixture writes:

```bash
RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP=1 npm run bootstrap:staging-proof-fixtures
```

The bootstrap is idempotent. It uses stable fixture ids, updates only fixture-owned rows, does not delete records, and refuses to reuse a non-fixture email address.

## Evidence Rules

Ignored local evidence is written under:

- `apps/RatAiFy/.ratify-staging-proof/preflight-summary.json`
- `apps/RatAiFy/.ratify-staging-proof/fixture-summary.json`

Phase 5C may add browser/API proof JSON and screenshots under the same ignored folder.

Evidence may contain:

- env var presence
- target category, never target value
- fixture row ids
- action ids and statuses
- HTTP status codes
- redaction booleans
- screenshot filenames

Evidence must not contain:

- database URLs
- passwords
- auth headers
- bearer values
- cookies
- API keys
- webhook signing values
- raw request or response bodies
- private customer messages
- provider payloads
- raw scanner evidence
- stack traces

## Fixture Checklist

The bootstrap seeds or verifies:

- admin, superadmin, and non-superadmin users
- org/workspace membership rows
- fixture passkey markers for privileged users so privileged MFA policy can pass in staging proof
- support thread, support message, and internal-note target
- active, archive-candidate, and delete-disabled feature flags
- contact submission and assignable admin owner
- metadata-only report/export request
- developer API-key record with fingerprint-only evidence
- developer webhook and delivery metadata with omitted response body
- site, scan, page, issue, and summarized AudAiX proof
- legacy support/contact telemetry markers

## Production Refusal Rules

The preflight rejects:

- `NODE_ENV=production`
- production-looking hostnames or database names
- canonical RatAiFy production domains
- unclassified external URLs unless the database has explicit operator approval

The bootstrap also requires `RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP=1` and the preflight must pass before any database connection is attempted.

## Phase 5C Plan

After Phase 5B passes:

- start or identify the staging app URL
- authenticate admin, superadmin, and non-superadmin personas
- prove SuperAdminRoute denied state
- prove `/superadmin/support`
- prove support assignment/internal note
- prove feature flag create/toggle/archive/deprecate
- prove contact status/archive/assign
- prove report/export request tracking
- prove one-time developer API-key display
- prove developer webhook overview
- prove superadmin scan/evidence explorer
- prove audit logs with redacted metadata
- prove legacy support route deprecation telemetry
- verify destructive/export/download actions remain disabled
- capture sanitized JSON and screenshots under `.ratify-staging-proof/`
