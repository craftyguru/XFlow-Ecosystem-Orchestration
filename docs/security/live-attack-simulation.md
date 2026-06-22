# Live Attack Simulation

Date: 2026-05-10

## Summary

Performed a live/direct-access simulation against the six proof base URLs configured for:

- XFlow
- Verixet
- RatAiFy
- AudAiX
- WordGeni
- CreVux

This pass used safe HTTP requests only: unauthenticated direct URL GETs, inert POST probes with forged client role/plan/workspace claims, public trust route GETs, and the existing production-readiness proof suite. No production secrets were printed, no destructive production mutations were attempted, and generated proof artifacts were scrubbed for transient auth state before documentation.

Machine-readable artifacts:

- `output/live-attack-simulation-2026-05-10.json`
- `output/live-production-readiness-proof-2026-05-10.json`
- `output/live-production-readiness-proof-after-deploy-2026-05-10.json`
- `output/live-attack-simulation-after-deploy-nocache-2026-05-10.json`

## Personas Tested

| Persona | Live coverage |
| --- | --- |
| Unauthenticated visitor | Direct URL and API mutation probes across all six apps. |
| Visitor with forged client role/plan/workspace claims | Inert POST probes with forged `superadmin`, `elite`, fake `priceId`, and cross-workspace IDs. |
| Public visitor | Public/trust route spot checks across all six apps. |
| Normal authenticated user | Partially covered by existing production-readiness proof when proof auth is available. Full per-app role fixture not available. |
| Workspace admin | Not available as a live per-app fixture in this pass. |
| App admin | Not available as a live per-app fixture in this pass. |
| Expired/past_due subscription user | Not available as a live per-app fixture in this pass. |
| Cross-workspace authenticated user | Not available as a live per-app fixture in this pass. |
| Superadmin/platform owner | Not used for destructive live mutation. Existing proof suites verify server-side guards and audit coverage. |

## Results

| Test set | Result |
| --- | --- |
| Root `npm run proof:production` | Passed: 10/10 stages. |
| Existing live HTTP production-readiness proof | Passed: 59 PASS, 1 RISK, 0 FAIL. The RISK is a redirect detail containing signed state, now scrubbed in the saved artifact. |
| Initial direct-access simulation | 270 checks: 247 passed, 23 failed. |
| Post-deploy direct-access simulation | 270 checks: 270 passed, 0 failed. |

## Blockers

No confirmed data-exposure blocker was found. API probes for admin/internal/platform/billing/entitlement mutation classes denied unauthenticated forged requests except the deployed XFlow consent accept endpoint, which returned a generic 500 instead of a clean denial.

Post-deploy update: XFlow, AudAiX, and CreVux fixes were deployed to the linked Railway production services and re-proved. The post-deploy simulation uses no-cache headers plus a benign cache-busting query parameter for GET/HEAD probes to avoid stale edge-cached shell responses.

## High-Risk Findings

| Finding | Status |
| --- | --- |
| XFlow deployed `/api/auth/consent/accept` returned HTTP 500 to an unauthenticated malformed JSON POST. | Fixed and live-proven after deploy; malformed unauthenticated JSON now returns controlled denial instead of 500. |

## Medium-Risk Findings

| Finding | Status |
| --- | --- |
| AudAiX proof URL returned the public SPA shell with HTTP 200 for reserved sensitive-looking page paths such as `/admin`, `/superadmin`, `/internal`, `/debug`, and `/proof`. No admin data was observed. | Fixed and live-proven after deploy; reserved paths now deny/404. |
| CreVux proof URL returned the public SPA shell with HTTP 200 for reserved sensitive-looking page paths such as `/admin`, `/superadmin`, `/internal`, `/debug`, and `/proof`. No admin data was observed. | Fixed and live-proven after deploy; reserved paths now deny/404 when probed no-cache. |

## Verification Commands Run

- `npm run proof:production` from repo root - passed.
- `node scripts/production-readiness-proof.mjs` - passed with 59 PASS, 1 RISK, 0 FAIL.
- `node scripts/live-attack-simulation.mjs` - completed with findings.
- `node scripts/live-attack-simulation.mjs` after deploy/no-cache harness update - passed 270/270.
- `npm run typecheck` in `apps/XFlow` - passed.
- `npm run verify:ci` in `apps/XFlow` - passed.
- `npm run typecheck` in `apps/AudAix` - passed.
- `pnpm --filter @workspace/api-server run typecheck` in `apps/CreVux` - passed.
- `node --check scripts/live-attack-simulation.mjs` - passed.

## Remaining Recommended Work

- Add authenticated normal-user, workspace-admin, app-admin, cross-workspace, expired-subscription, and superadmin staging fixtures for full live role simulation.
- Promote this script into scheduled staging smoke coverage once stable.
