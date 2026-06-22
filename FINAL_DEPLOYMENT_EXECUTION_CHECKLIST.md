# Final Deployment Execution Checklist

Date: 2026-06-18

Scope:

- `apps\XFlow`
- `apps\Verixet`
- `apps\CreVux`
- `apps\RatAiFy`
- `apps\AudAix`
- `apps\WordGeni`

Source documents:

- `FINAL_POST_PUSH_RELEASE_CHECKPOINT.md`
- `FINAL_PUSH_DEPLOY_READINESS_PLAN.md`
- `DEPLOY_VERIFICATION_RUNBOOK.md`
- `SECURITY_RELEASE_CHECKLIST.md`
- `PHASE3_FINAL_ECOSYSTEM_STATUS.md`

This is a human-executable checklist only. It does not approve deployment by itself. Do not deploy, push, run migrations, rotate secrets, delete data, or modify app repositories unless separately and explicitly approved.

## Deployment Order

Deploy one app at a time, in this order:

1. XFlow
2. Verixet
3. CreVux
4. RatAiFy
5. AudAix
6. WordGeni

After each deploy, complete that app's post-deploy verification and rollback assessment before starting the next app.

## Global Approval Gate

Before deploying any app, confirm:

- Explicit release-owner approval exists for the exact app.
- Exact target environment and public base URL are known.
- Exact deployed commit is selected from the pushed HEAD table below.
- Rollback commit or previous green deployment is identified.
- App repository is clean.
- No unpushed commits exist.
- CI is green for the exact deployed commit.
- Security workflow is green for the exact deployed commit.
- CodeQL advisory status is understood and accepted until repository code scanning/API access is enabled.
- No `.env`, secrets, deploy credentials, logs, DB files, screenshots, media, generated exports, generated reports, cache, or build output are staged.
- No migrations are required, or the migration plan is separately approved.
- Deployment platform auto-deploy state is clear.

## Pushed HEADs To Approve

| App | Branch | Pushed HEAD | CI | Security | Production target | Rollback commit |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | `master` | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | Green | Green | requires manual confirmation | requires manual confirmation |
| Verixet | `main` | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | Green | Green | requires manual confirmation | requires manual confirmation |
| CreVux | `main` | `505fe53c19e76257d8af57a645afabd6ef868860` | Green | Green | requires manual confirmation | requires manual confirmation |
| RatAiFy | `main` | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | Green | Green | requires manual confirmation | requires manual confirmation |
| AudAix | `main` | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | Green | Green | requires manual confirmation | requires manual confirmation |
| WordGeni | `main` | `564e827f998b0a33b5aa256095ccb9872ac0d236` | Green | Green | requires manual confirmation | requires manual confirmation |

## Pre-Deploy Confirmations By App

### XFlow

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `fe9e0b0551c62a845840af4496b5cfcbc74a21c4`.
- CI green: GitHub Actions `CI` run `27756368241`.
- Security green: GitHub Actions `Security` run `27756368245`; CodeQL advisory job failed internally but workflow is green.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: approved release target URL and environment; no deploy credentials or secrets added to CI.
- Release-only checks: control-plane smoke, auth checks, operator/admin surface checks, status/health checks, route/env/security/integrity verification, stale deployment proof.

### Verixet

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `28d4d8eb04222d2cfc132f1cd460970086af6c85`.
- CI green: GitHub Actions `CI` run `27760505991`.
- Security green: GitHub Actions `Security` run `27760506002`; CodeQL advisory job failed internally but workflow is green.
- Release/predeploy workflow: `Verixet pre-deploy` run `27760505942` green.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: approved release target, DNS/CDN state for canonical host proof, no deploy credentials or secrets added to CI.
- Release-only checks: canonical host 301 proof, entitlement smoke, API-key smoke, billing smoke, deploy-gate authorization checks.

### CreVux

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `505fe53c19e76257d8af57a645afabd6ef868860`.
- CI green: GitHub Actions `CI` run `27762120141`.
- Security green: GitHub Actions `Security Checks` run `27762120177`; separate `CodeQL` workflow `27762120211` green overall with advisory CodeQL analysis failure.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: approved live base URL, approved deployment metadata source, no deploy credentials or secrets added to CI.
- Release-only checks: `/api/healthz` typed JSON, `/api/healthz/ffmpeg` unauthenticated typed `401`, media/upload smoke, derived artifact exposure check, stale deployment proof.

### RatAiFy

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `83697c45d604c4e7f139fa9bc0b298ba8454ff31`.
- CI green: GitHub Actions `CI` run `27788204745`.
- Security green: GitHub Actions `Security` run `27788204762`; CodeQL advisory job failed internally but workflow is green.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: `RELEASE_VERIFY_BASE_URL` must be set only for the approved target; migration verification requires an approved empty disposable `MIGRATION_TEST_DATABASE_URL` if requested.
- Release-only checks: release environment verification, shared schema check if DB env exists, scanner SSRF proof, scanner/report smoke, report/artifact authorization proof, stale deployment proof.

### AudAix

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `8b4929d1003bc75db1075654e011ca6b61e8f8a3`.
- CI green: GitHub Actions `CI` run `27785810462`.
- Security green: GitHub Actions `Security` run `27785810485`; CodeQL advisory job failed internally but workflow is green.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: approved root target and dashboard target; confirm no local DB files, scanner output, generated reports, logs, screenshots, dashboard build output, or artifacts are staged.
- Release-only checks: root scanner smoke, audit route smoke, dashboard smoke, nested dashboard health, dashboard auth proof, audit result access isolation, stale deployment proof.

### WordGeni

- Repository clean: confirmed in checkpoint; re-run `git status --short` before deploy.
- Pushed HEAD: `564e827f998b0a33b5aa256095ccb9872ac0d236`.
- CI green: GitHub Actions `CI` run `27789804405`.
- Security green: GitHub Actions `Security` run `27789804502`; CodeQL advisory job failed internally but workflow is green.
- Expected production target: requires manual confirmation.
- Rollback commit: requires manual confirmation.
- Env prerequisites: approved release target URL; confirm generated exports, source docs, media, cache, and build output are not staged; confirm Railway auto-deploy state is clear before manual approval.
- Release-only checks: API/web/worker health, writing/source/export route proof, export/download smoke, export authorization, source/prompt/writing-context isolation, Railway build/deploy proof, stale deployment proof.

## Do Not Deploy If

Do not deploy any app if any item below is true:

- CI is not green for the exact deployed commit.
- Security workflow is not green for the exact deployed commit.
- Repository is dirty.
- Unpushed commits exist.
- Rollback target is missing.
- Production target or staging target is ambiguous.
- Env prerequisite is missing.
- Release-only check fails.
- Migration is required but not separately approved.
- Migration verification points at production or shared persistent data.
- Secrets appear in logs, CI config, deploy config, screenshots, or documentation.
- Deploy credentials are added to a repository or normal PR/push workflow.
- Deploy platform auto-deploy state is unclear.
- Health metadata or deployment dashboard suggests the wrong commit or stale deployment.
- Authenticated routes become public.
- Cross-tenant, cross-workspace, or cross-project data access is observed.
- Scanner SSRF protections regress.
- Media, report, audit, source, prompt, export, billing, entitlement, API-key, or deploy-gate isolation fails.
- Any high or critical dependency advisory appears.

## Post-Deploy Verification

### XFlow

Run only after approved deploy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run verify:routes
npm run verify:env
npm run verify:security
npm run verify:integrity
```

Manual proof:

- Live app responds on approved target.
- Control-plane smoke passes.
- Auth routes require expected authorization.
- Operator/admin surfaces are not public.
- Status/health metadata or deployment dashboard matches deployed commit.
- Logs show no unexplained 5xx, auth bypass, secrets, or deploy errors.

Rollback triggers:

- Auth/control-plane/operator exposure.
- Integrity verifier failure.
- Stale or wrong deployment proof.
- High/critical advisory or required gate regression.

### Verixet

Run only after approved deploy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm run verify:canonical-host
npm run verify:routes
npm run verify:security
```

Manual proof:

- `https://www.verixet.com/` returns HTTP `301` to `https://verixet.com/`.
- `https://www.verixet.com/sitemap.xml` returns HTTP `301` to apex sitemap.
- `https://www.verixet.com/robots.txt` returns HTTP `301` to apex robots route.
- Entitlement/API-key/billing smoke passes.
- Deploy-gate routes remain authorized.
- Logs show no unexplained 5xx, secrets, or billing/auth errors.

Rollback triggers:

- Canonical host 301 failure.
- Billing, entitlement, API-key, or deploy-gate exposure.
- Stale or wrong deployment proof.

### CreVux

Run only after approved deploy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\CreVux"
pnpm run verify:routes
pnpm run verify:security
pnpm --filter @workspace/api-server run test:upload-safety
```

Manual proof:

- `/api/healthz` returns typed health JSON.
- `/api/healthz/ffmpeg` returns unauthenticated typed `401` JSON.
- Media/upload smoke passes with expected authorization, size, and type controls.
- Derived artifacts are not publicly listable.
- Logs show no unexplained 5xx, secrets, upload exposure, or ffmpeg health exposure.

Rollback triggers:

- Media or derived artifact exposure.
- Upload-safety failure.
- `/api/healthz/ffmpeg` exposed beyond typed unauthenticated `401`.
- Stale or wrong deployment proof.

### RatAiFy

Run only after approved deploy and only with approved target:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\RatAiFy"
npm run verify:routes
npm run verify:security
npm run verify:shared-supabase-schema
```

Run only when `RELEASE_VERIFY_BASE_URL` is set to the approved target:

```powershell
npm run verify:env
```

Do not run migration verification unless an approved empty disposable `MIGRATION_TEST_DATABASE_URL` is provided.

Manual proof:

- Scanner/report smoke passes.
- Scanner SSRF protections reject private, loopback, metadata, and disallowed targets.
- Reports and artifacts remain scoped and authorized.
- Shared schema check passes if DB env exists.
- Logs show no unexplained 5xx, secrets, SSRF bypass, or report/artifact exposure.

Rollback triggers:

- Scanner SSRF regression.
- Report/artifact exposure.
- Unsafe migration verification target.
- Stale or wrong deployment proof.

### AudAix

Run only after approved deploy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\AudAix"
npm run verify:routes
npm run verify:security
npm run verify:env
cd dashboard
npm run typecheck:test
npm test
npm run build
```

Manual proof:

- Root scanner smoke passes.
- Audit route smoke passes.
- Dashboard smoke passes.
- Nested dashboard health proof passes.
- Dashboard auth is enforced.
- Audit result access remains tenant/workspace scoped.
- Logs show no unexplained 5xx, secrets, scanner exposure, dashboard auth failure, or audit result leakage.

Rollback triggers:

- Scanner/audit route exposure.
- Dashboard auth failure.
- Audit result leakage.
- Stale or wrong deployment proof.

### WordGeni

Run only after approved deploy:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\WordGeni"
pnpm run verify:routes
pnpm run verify:security
pnpm run verify:env
```

Manual proof:

- API health passes.
- Web health passes.
- Worker health or deployment worker proof passes.
- Railway build/deploy proof matches deployed commit.
- Writing/source/export route smoke passes.
- Export/download smoke passes and requires authorization.
- Source, prompt, writing context, export, tenant/workspace/project isolation holds.
- Logs show no unexplained 5xx, secrets, export exposure, source leakage, or worker failure.

Rollback triggers:

- Export download exposure.
- Source/prompt/writing-context leakage.
- Railway deploy health failure.
- Stale or wrong deployment proof.

## Logs Review

For each deployed app, check deployment platform logs after post-deploy smoke:

- Look for unexplained 5xx spikes.
- Look for auth, entitlement, scanner, media, audit, source, export, worker, or billing errors.
- Look for secret-looking values, tokens, private keys, database URLs, service-role keys, or webhook secrets.
- Look for stale build, wrong commit, or deployment mismatch indicators.
- Preserve relevant logs and timestamps if any check fails.

## Rollback Procedure

If a rollback trigger fires:

1. Stop rollout immediately.
2. Identify the previous green deployment or rollback commit.
3. Preserve evidence: app, target, deployed commit, rollback commit, CI run, deployment ID, URL, status code, response shape, logs, and timestamp.
4. Redeploy the previous green commit only through the approved deployment system.
5. Do not run migrations, destructive cleanup, data deletion, or secret rotation during rollback unless separately approved.
6. Verify rollback health and app-specific authorization checks.
7. Confirm the failed deployment is no longer live.
8. Document the incident, root cause, residual risk, and follow-up owner.

## Final Sign-Off Table

| App | Deploy approved yes/no | Target | Rollback commit | Deployed commit | Verifier passed yes/no | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | requires manual confirmation | requires manual confirmation | requires manual confirmation | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | requires manual confirmation | Control-plane/auth/operator proof required. |
| Verixet | requires manual confirmation | requires manual confirmation | requires manual confirmation | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | requires manual confirmation | Canonical host, entitlement, API-key, billing proof required. |
| CreVux | requires manual confirmation | requires manual confirmation | requires manual confirmation | `505fe53c19e76257d8af57a645afabd6ef868860` | requires manual confirmation | Ffmpeg 401 and media/upload proof required. |
| RatAiFy | requires manual confirmation | requires manual confirmation | requires manual confirmation | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | requires manual confirmation | `RELEASE_VERIFY_BASE_URL`, scanner/report proof required. |
| AudAix | requires manual confirmation | requires manual confirmation | requires manual confirmation | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | requires manual confirmation | Root scanner and dashboard proof required. |
| WordGeni | requires manual confirmation | requires manual confirmation | requires manual confirmation | `564e827f998b0a33b5aa256095ccb9872ac0d236` | requires manual confirmation | API/web/worker, export/download, Railway proof required. |

## Final Deployment Decision

Current state: ready for human release approval review, not approved for deployment by this checklist alone.

Deployment remains no-go until the sign-off table is completed for each app and an authorized release owner explicitly approves deployment.

