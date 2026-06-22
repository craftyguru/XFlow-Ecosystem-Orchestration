# Deploy Verification Runbook

Use this runbook only after a deploy has been explicitly approved. This document describes verification steps; it does not grant approval to deploy.

## Safety Rules

- Do not deploy without explicit approval.
- Do not push without explicit approval.
- Do not run migrations against production from this runbook.
- Do not run `db:push` or `db:migrate` against production.
- Do not rotate secrets during deploy verification unless separately approved.
- Do not add deploy credentials or secret values to repositories, CI, logs, or documentation.
- Do not run destructive data cleanup during deploy verification.

## Safe Verification Sequence

1. Confirm the app repository is clean with `git status --short`.
2. Confirm the branch and head commit intended for release.
3. Run the app-local release checklist in `SECURITY_RELEASE_CHECKLIST.md`.
4. Confirm CI passed for the exact release commit.
5. Confirm deployment approval and target environment.
6. Deploy only through the approved deployment system.
7. After deploy, verify live health, route, security, and app-specific release-only checks.
8. Confirm live deployment metadata matches the intended branch, commit, version, or deployment identifier where exposed.
9. Capture evidence: timestamps, URLs, status codes, response shapes, commit hash, deployment ID when available, CI run link, and verifier output summary.
10. If verification fails, stop and follow rollback steps in `INCIDENT_RESPONSE_AND_ROLLBACK_RUNBOOK.md`.

## PR Checks Versus Release-Only Checks

Normal PR/push checks:

- Lint
- Typecheck
- Tests
- Build
- Security verifier
- Route verifier
- Environment verifier where local/static
- Integrity verifier where applicable
- Production audit at high threshold
- Full audit at high threshold
- AudAix dashboard local gates

Release-only, manual, or environment-gated checks:

- Verixet canonical-host verification.
- CreVux live route proof and `/api/healthz/ffmpeg` proof.
- RatAiFy `verify:env` when `RELEASE_VERIFY_BASE_URL` is set.
- RatAiFy migration verification only with an approved empty disposable `MIGRATION_TEST_DATABASE_URL`.
- Any check requiring live external network state, deployed DNS, CDN behavior, production-like storage, or release environment credentials.

## App-by-App Post-Deploy Checks

### XFlow

- Confirm the live app responds on the approved release URL.
- Confirm authentication/control-plane routes require the expected authorization.
- Confirm operator/admin surfaces are not publicly exposed.
- Confirm route and environment verification match the released environment.
- Confirm no stale deployment by checking available health metadata, response headers, version marker, or deployment dashboard against the intended commit.

### Verixet

- Confirm the apex production host responds on the approved URL.
- Confirm canonical host behavior:
  - `https://www.verixet.com/` returns HTTP `301` to `https://verixet.com/`.
  - `https://www.verixet.com/sitemap.xml` returns HTTP `301` to the apex sitemap.
  - `https://www.verixet.com/robots.txt` returns HTTP `301` to the apex robots route.
- Confirm billing, entitlement, API key, and deploy-gate routes are not publicly exposed beyond intended authorization.
- Confirm no stale deployment by comparing live metadata or deployment dashboard state to the intended commit.

### CreVux

- Confirm the approved live base URL.
- Run route verification against the live target.
- Confirm `/api/healthz` returns typed health JSON.
- Confirm `/api/healthz/ffmpeg` returns typed `401` JSON without authentication.
- Confirm media upload routes enforce configured size, type, authorization, and storage controls.
- Confirm derived artifacts are not publicly listable.
- Confirm no stale deployment by comparing live health metadata to the intended branch, commit, version, and deployment identifier when exposed.

Recorded prior live proof:

- Live base: `https://crevux.com`
- Route verification passed.
- `/api/healthz` returned typed JSON.
- `/api/healthz/ffmpeg` returned unauthenticated typed `401` JSON.
- 44 checks passed and 0 failed in the recorded deploy verification report.

### RatAiFy

- Set `RELEASE_VERIFY_BASE_URL` only for the approved release target.
- Run release environment verification with that target.
- Confirm scanner SSRF protections reject private, loopback, metadata, and disallowed targets.
- Confirm reports and artifacts require the expected tenant/project authorization.
- Do not run migration verification unless an approved empty disposable `MIGRATION_TEST_DATABASE_URL` is provided.
- Confirm no stale deployment by comparing health metadata, deployment dashboard state, or release marker to the intended commit.

### AudAix

- Confirm root app and dashboard are both on the intended release.
- Confirm scanner and audit routes enforce authorization and tenant/workspace boundaries.
- Confirm dashboard auth checks behave as expected.
- Confirm generated audit results are not publicly listable.
- Confirm no stale deployment by checking available metadata, dashboard release marker, or deployment dashboard state.

### WordGeni

- Confirm writing, source, and export flows work on the approved release target.
- Confirm export downloads enforce authorization and scoped access.
- Confirm source material and generated writing context are isolated by tenant/workspace/project assumptions.
- Confirm no stale deployment by checking available metadata, release marker, or deployment dashboard state.

## Cache Purge Guidance

Purge CDN or edge caches only when approved and only for the affected app and route scope. Prefer narrow route purges over broad global purges.

Purge or invalidate cache when:

- Canonical host redirects do not reflect the deployed configuration.
- Static route metadata is stale after deploy.
- Health or release marker responses show stale deployment data.
- Public assets expose outdated or revoked content.

Do not purge storage buckets, delete media, or remove generated reports as part of cache purge work unless separately approved.

## Rollback Triggers

Rollback or stop release verification if any of these occur:

- A high or critical dependency advisory appears.
- Required PR/release gates fail on the deployed commit.
- Authenticated routes become public.
- Cross-tenant, cross-workspace, or cross-project data access is observed.
- Scanner SSRF protections regress.
- CreVux media or derived artifact exposure is observed.
- Verixet canonical host redirects fail.
- Billing, entitlement, API key, or deploy-gate behavior fails.
- Health metadata proves the wrong commit or stale deployment is live.

## What Not To Run Against Production

- `db:push`
- `db:migrate`
- Migration verification without an approved empty disposable database
- Destructive cleanup scripts
- Data deletion commands
- Secret rotation commands
- Local seed/reset scripts
- Load tests that can affect customers or shared infrastructure
- Scanners against internal, private, metadata, or disallowed network targets

## Verifying No Stale Deployment

Use the strongest available proof for the app:

- Health endpoint branch, commit, version, and deployment ID.
- Deployment provider dashboard showing the release commit.
- Response headers or static release marker.
- CI run for the exact commit.
- Route behavior that only exists in the intended release.

If proof is missing, record `requires manual confirmation` and do not treat the deploy as fully verified.
