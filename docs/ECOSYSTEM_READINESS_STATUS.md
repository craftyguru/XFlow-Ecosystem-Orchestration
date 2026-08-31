# Ecosystem Readiness Status

Date: 2026-07-11

This is the canonical readiness register for the six production apps. Status values are limited to `PROVEN`, `PARTIAL`, `BLOCKED`, `NOT RUN`, and `NOT APPLICABLE`.

| App | Local professionalization | Public health proven | Deployed commit exposed | Deployed commit matches expected HEAD | Authenticated workflow proven | Billing/entitlement proven | Provider-cost fail-closed proven | Production screenshots/video proven | Current blockers | Latest evidence date | Evidence file or command |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | XFlow fix commit `965989a165926ce1de40e6353d6140a45a636d16` is deployed and public health/readiness expose that exact commit. Authenticated workflow proof, billing/entitlement runtime proof, provider-cost fail-closed runtime proof, and production screenshots/video still require separately approved smoke testing. | 2026-07-11 | `docs/production-proof/2026-07-11-xflow-public-deployment-proof.md`; Railway deployment `350ccf4e-835e-4317-9edf-fbc6d095ef69`; `Invoke-WebRequest https://xflowx.com/api/health`; `Invoke-WebRequest https://xflowx.com/api/ready` |
| Verixet | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | Public health exposes approved deployed commit. Public readiness reports database reachable. Runtime billing/entitlement proof, account isolation, and Stripe/provider proof require approved test context. | 2026-07-11 | `docs/production-proof/2026-07-11-verixet-public-deployment-proof.md`; `curl https://verixet.com/api/v1/health`; `curl https://verixet.com/api/v1/ready`; `docs/verixet-authority-runtime-readiness.md` |
| RatAiFy | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | Public health exposes current commit. Authenticated scanner/report flow, artifact authorization, paid scan gate, and unauthorized site denial require approved smoke. | 2026-07-11 | `curl https://rataify.com/health`; `git -C apps/RatAiFy rev-parse HEAD`; `apps/RatAiFy/README.md`; `docs/verixet-authority-runtime-readiness.md` |
| AudAiX | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | Public health and readiness expose approved deployed commit. Readiness reports SQLite and Redis `ok`. Authenticated audit/report/evidence flow, workspace isolation, and paid audit gate require approved smoke. | 2026-07-11 | `docs/production-proof/2026-07-11-audaix-public-deployment-proof.md`; `curl https://audaix.com/health`; `curl https://audaix.com/health/ready`; `docs/verixet-authority-runtime-readiness.md` |
| Crevux | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | Public health exposes current commit. Authenticated asset isolation, generation entitlement gate without provider invocation, export authorization, and denied entitlement proof require approved smoke. | 2026-07-11 | `curl https://crevux.com/api/healthz`; `git -C apps/CreVux rev-parse HEAD`; `apps/CreVux/README.md`; `docs/verixet-authority-runtime-readiness.md` |
| WordGeni | PROVEN | PROVEN | PROVEN | PROVEN | NOT RUN | PARTIAL | PARTIAL | NOT RUN | Public web and API health/readiness expose approved deployed commit. API readiness reports database `ok`. Authenticated source-backed writing, export authorization, worker proof, denied entitlement, and workspace isolation require approved smoke. | 2026-07-11 | `docs/production-proof/2026-07-11-wordgeni-public-deployment-proof.md`; `curl https://wordgeni.com/api/health`; `curl https://wordgeni.com/api/ready`; `curl https://api.wordgeni.com/health/ready`; `docs/verixet-authority-runtime-readiness.md` |

## Ecosystem Authority Model

- XFlow owns control-plane, workspace, identity, app catalog, app connection, and cross-app routing authority.
- Verixet owns billing, subscriptions, entitlements, usage, credits, checkout, catalog, and access decisions.
- Satellite apps own their product workflows and may use local mirrors or caches only when clearly labeled as non-authoritative.
- Local mirrors must not be presented as canonical billing truth.
- Paid/provider-cost actions must fail closed when Verixet denies access or when entitlement authority is unavailable.

## Currently Approved Proof Scope

- Repository inspection.
- Static/code-level billing authority audit.
- Public unauthenticated health checks.
- Local tests and typechecks that do not require production credentials.
- Documentation updates.
- Additive build metadata in public health/readiness responses.

## Deployment Metadata Environment Variables

Health and readiness endpoints should resolve deployment metadata with this deterministic precedence:

- `commit`: `RAILWAY_GIT_COMMIT_SHA` -> `VERCEL_GIT_COMMIT_SHA` -> `GITHUB_SHA` -> `SOURCE_VERSION` -> `unknown`
- `buildTime`: `BUILD_TIMESTAMP` -> `RAILWAY_DEPLOYMENT_CREATED_AT` -> `unknown`
- `environment`: `RAILWAY_ENVIRONMENT_NAME` -> `VERCEL_ENV` -> `NODE_ENV` -> `unknown`

Endpoints must return the full commit string. UI and docs may display shortened values, but API proof should preserve the full value. Endpoints must not hardcode `production`; unknown is safer than a false environment.

## Actions Requiring Explicit Approval

- Production or staging deploys, redeploys, restarts, or syncs.
- Authenticated production smoke tests.
- Billing, entitlement, subscription, Stripe, or customer mutations.
- Provider-cost calls, including AI/media/audit provider calls.
- Migrations, production database writes, seed operations, or data cleanup.
- Secret rotation, credential changes, or deployment environment changes.
- Capturing production screenshots or video from authenticated accounts.

## Stale Evidence That Must Not Be Treated As Current

- `DEPLOYMENT_STATE_VERIFICATION.md` is useful historical context from 2026-06-18, but app commits have advanced since then.
- `PHASE3_FINAL_ECOSYSTEM_STATUS.md` records prior CI/security closure, not current authenticated production proof.
- Local screenshot proof in `docs/ecosystem/product-proof.md` proves committed local media only; it does not prove live production workflows.
- Admin/readiness closeout documents that say local proof is complete do not prove provider, billing, deployment, mutation, or authenticated production behavior.

## Next Production-Proof Sequence

1. Review and approve the repository-side diff from this cleanup phase.
2. Commit approved repository changes by repo, without pushing until requested.
3. Prepare approved test accounts and fixtures for each app.
4. Run authenticated smoke plan in `docs/authenticated-production-smoke-plan.md`.
5. Capture proof records using `docs/templates/production-proof-record.md`.
