# RatAiFy Local Disposable E2E Proof

Date: 2026-07-02

Status: passed locally. Staging remains blocked.

Scope: authenticated browser/API proof against a disposable local PostgreSQL database and local app URL only. No production or staging database was used, no production migration was run, no new action family was enabled, and no destructive/export/download action was executed.

## Local Target

| item | status |
| --- | --- |
| app URL category | `local-loopback` |
| app port | `127.0.0.1:3002` |
| database category | `local-disposable` |
| database port/name | `127.0.0.1:55433`, `rataify_local_e2e` |
| evidence path | `apps/RatAiFy/.ratify-local-e2e-proof/` |
| evidence ignored by Git | yes |

## Fixtures

| fixture | status |
| --- | --- |
| admin user | seeded |
| superadmin user | seeded |
| non-superadmin user | seeded |
| support thread | seeded |
| feature flags | seeded |
| contact submission | seeded |
| export request | seeded |
| developer API-key/webhook | seeded |
| scan/issue/evidence/proof | seeded |
| current legal consent markers | seeded |
| legacy support/contact telemetry markers | seeded |

## Proof Results

`npm run proof:local-e2e` passed with 19 API/browser-context assertions.

Covered:

- SuperAdminRoute denied state.
- `/superadmin/support` browser-context proof and screenshot.
- Support assignment and internal note.
- Feature flag create, toggle, and archive/deprecate.
- Contact status, archive, and assign.
- Report/export metadata-only request tracking.
- Developer credential mutation disabled check.
- Developer webhook overview and outbound disabled check.
- Superadmin scan/evidence explorer.
- Audit logs with redacted metadata route.
- Legacy support/contact route telemetry paths.

Disabled actions confirmed:

- Developer credential mutation disabled.
- Webhook outbound test disabled.
- Data lifecycle export disabled.
- Actual report/export generation and download not executed.
- No destructive support/contact/feature-flag action executed.

Evidence:

- `apps/RatAiFy/.ratify-local-e2e-proof/preflight-summary.json`
- `apps/RatAiFy/.ratify-local-e2e-proof/bootstrap-summary.json`
- `apps/RatAiFy/.ratify-local-e2e-proof/proof-summary.json`
- `apps/RatAiFy/.ratify-local-e2e-proof/browser-superadmin-support.png`

## Smoke Pack Note

`npm run test:smoke:auth` was attempted against the disposable local database after loading only local proof environment. It did not complete within the command timeout and the generated Playwright snapshots showed the generic demo-login flow remained on `/login?demo=1` instead of reaching `/dashboard`. This is recorded separately from the RatAiFy admin/superadmin proof, which passed through `npm run proof:local-e2e`.

## Staging Status

Staging proof remains blocked because the staging app URL, staging database URL, and staging fixture credentials are still missing. Local disposable proof does not authorize Phase 6 or production rollout.
