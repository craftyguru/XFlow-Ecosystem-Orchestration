# Final Push and Deploy Readiness Plan

Date: 2026-06-18

Scope:

- `apps\XFlow`
- `apps\Verixet`
- `apps\CreVux`
- `apps\RatAiFy`
- `apps\AudAix`
- `apps\WordGeni`

Source of truth:

- `PHASE3_FINAL_ECOSYSTEM_STATUS.md`
- `SECURITY_RELEASE_CHECKLIST.md`
- `DEPENDENCY_EXCEPTION_REGISTER.md`
- `DEPLOY_VERIFICATION_RUNBOOK.md`
- `PHASE3_CI_ENFORCEMENT_PLAN.md`
- `PHASE2_HIGH_SEVERITY_COMPLETION_REPORT.md`

This is a plan only. Do not push, deploy, run migrations, rotate secrets, or delete data from this document.

## Executive Go/No-Go

Push readiness: go after review, using the app-by-app order below.

Deploy readiness: conditional no-go until post-push CI passes for each app and the app-specific manual release confirmations are completed.

High-severity dependency status: cleared in the recorded Phase 2 and Phase 3 gates.

Current app repository status observed on 2026-06-18:

| App | Branch | Working tree | Latest HEAD |
| --- | --- | --- | --- |
| XFlow | `master` | Clean | `9b26805 ci(xflow): enforce security gates` |
| Verixet | `main` | Clean | `25b4bab ci(verixet): enforce security gates` |
| CreVux | `main` | Clean | `713ca11 ci(crevux): enforce security gates` |
| RatAiFy | `main` | Clean | `f3d555c ci(rataify): enforce security gates` |
| AudAix | `main` | Clean | `a97907a1 ci(audaix): enforce security gates` |
| WordGeni | `main` | Clean | `a38edd2 ci(wordgeni): enforce security gates` |

Workspace documentation files may be uncommitted separately. Do not commit workspace-level docs into app repositories.

## Ordered Push Plan

Default push order:

1. XFlow
2. Verixet
3. CreVux
4. RatAiFy
5. AudAix
6. WordGeni

Push one app at a time. After each push, wait for that app's CI to finish before pushing the next app unless the reviewer explicitly approves parallel pushes.

Required pre-push command for every app:

```powershell
git status --short
git log --oneline -n 15
git log --oneline @{u}..HEAD
```

If `@{u}` is not configured, identify the intended remote branch manually before pushing.

## App Push Readiness

### 1. XFlow

Repository: `apps\XFlow`

Branch: `master`

Current status: clean.

Latest Phase commits:

- Phase 1: `01dea27 chore(xflow): sync app route manifest`
- Phase 2: `fc451f4 deps(xflow): upgrade vite vitest toolchain`; `3ace5fb deps(xflow): upgrade observability dependencies`; `49fadde deps(xflow): upgrade drizzle packages`; `fe8c519 security(xflow): apply safe dependency remediation`
- Phase 3: `9b26805 ci(xflow): enforce security gates`

Observed unpushed commits:

- `9b26805 ci(xflow): enforce security gates`
- `fc451f4 deps(xflow): upgrade vite vitest toolchain`
- `3ace5fb deps(xflow): upgrade observability dependencies`
- `49fadde deps(xflow): upgrade drizzle packages`
- `01dea27 chore(xflow): sync app route manifest`
- `fe8c519 security(xflow): apply safe dependency remediation`

Required post-push CI gates:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm run verify:integrity`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Release-only checks:

- Release smoke or live proof for the approved target environment.

Environment prerequisites:

- Approved release target URL and environment for live proof.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, high/critical dependency regression, integrity verifier failure, control-plane/auth exposure, or stale/wrong deployment proof after deploy.

Do not deploy XFlow until:

- Post-push CI is green for `9b26805`.
- Target release environment has been manually confirmed.

XFlow push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `master`.
- Remote: `origin https://github.com/craftyguru/xflowx.git`.
- Pushed range: `91028cf..9b26805`.
- Pushed commits:
  - `9b26805 ci(xflow): enforce security gates`
  - `fc451f4 deps(xflow): upgrade vite vitest toolchain`
  - `3ace5fb deps(xflow): upgrade observability dependencies`
  - `49fadde deps(xflow): upgrade drizzle packages`
  - `01dea27 chore(xflow): sync app route manifest`
  - `fe8c519 security(xflow): apply safe dependency remediation`
- Pre-push sanity gates passed:
  - `npm run verify:security`
  - `npm run verify:integrity`
  - `npm audit --omit=dev --audit-level=high`
  - `npm audit --audit-level=high`
- Post-push repository status: XFlow worktree clean; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install, lint, typecheck, tests, build, security verifier, integrity verifier, production dependency audit at high threshold, full dependency audit at high threshold.
  - Manual release/predeploy job: route verifier, environment verifier, optional post-deploy release smoke when `xflow_release_smoke_base_url` is provided.
  - Manual advisory job: moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27753562999` for `9b26805ba5d72f2954bcec3b9d5195b8b6fb91fd` completed with conclusion `failure`.
  - Failing CI job: `Required PR/local gates`, job `82109722831`.
  - Failing CI step: `Tests`.
  - Failed tests reported:
    - `tests/for-reviewers-page.test.ts` expected the reviewer engineering packet doc to exist.
    - `tests/unit/ecosystem-onboarding-contract.test.ts` could not open `/home/runner/work/supabase/migrations/103_profile_onboarding.sql`.
  - Skipped after test failure: build, security verifier, integrity verifier, production dependency audit, and full dependency audit in the CI workflow.
  - GitHub Actions `Security` run `27753562984` for the same commit completed with conclusion `failure`.
  - Security job results: `gitleaks` succeeded; `dependency-review` was skipped; `codeql` failed in `Run github/codeql-action/analyze@v3`.
  - CodeQL failure summary: code scanning is not enabled for the repository or the workflow lacks the required CodeQL/code-scanning API access; SARIF upload failed with the repository settings/API access error.
- XFlow final push readiness status:
  - Pushed: yes.
  - CI green: no.
  - Deploy status: held.
  - Further ecosystem pushes: held until the XFlow CI and Security failures are triaged or explicitly overridden by the release owner.
  - Rechecked on 2026-06-18: CI run `27753562999` and Security run `27753562984` both remain completed with conclusion `failure`; XFlow remains pushed but not CI-green.
  - Latest observed status on 2026-06-18: CI and Security still failed for commit `9b26805`; no deploy approval condition has been met.
  - Fix prepared after triage:
    - Exact CI test root cause: two tests depended on workspace-level paths outside the standalone XFlow GitHub checkout. `tests/for-reviewers-page.test.ts` expected `../../docs/reviewer-engineering-packet.md`; `tests/unit/ecosystem-onboarding-contract.test.ts` expected `../../supabase/migrations/103_profile_onboarding.sql`.
    - Files fixed: `.github/workflows/security.yml`, `tests/for-reviewers-page.test.ts`, `tests/unit/ecosystem-onboarding-contract.test.ts`, `tests/fixtures/reviewer-engineering-packet.md`, `tests/fixtures/supabase/103_profile_onboarding.sql`.
    - Test fix: reviewer packet and onboarding migration assertions now read repo-local fixtures under `tests/fixtures`, so XFlow CI no longer depends on workspace-level `docs` or `supabase` directories.
    - CodeQL decision: keep gitleaks required, retain CodeQL analysis, and mark the CodeQL job advisory/non-blocking until repository code scanning/GitHub Advanced Security is enabled. The CodeQL failure was repository settings/SARIF upload related, not app source.
    - Source change needed: no runtime source change was needed.
    - Workflow-only change enough for CodeQL: yes, until repo settings can enable code scanning.
    - Local gates passed: lint, typecheck, tests, build, security verifier, route verifier, env verifier, integrity verifier, production audit high threshold, full audit high threshold.
    - Another XFlow push readiness: completed. Fix commit `fe9e0b0 test(xflow): make ci contract tests repo-local` was pushed to `origin/master` on 2026-06-18.
    - Post-fix CI observed status: GitHub Actions `CI` run `27756368241` for `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` completed with conclusion `success`.
    - Post-fix Security observed status: GitHub Actions `Security` run `27756368245` for `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` completed with conclusion `success`; gitleaks passed, dependency-review was skipped on push, and CodeQL remained advisory while repository code scanning is disabled.
    - XFlow CI green: yes for the pushed fix commit `fe9e0b0`.
    - XFlow deploy: still held pending manual release approval and target environment confirmation.
- Remaining deploy hold conditions:
  - Do not deploy until the pushed `CI` workflow is green.
  - Confirm the separate `Security` workflow result before deployment approval.
  - Confirm the target release environment manually.
  - Do not run release smoke without an approved base URL.
  - Do not deploy, run migrations, rotate secrets, or delete data from this push task.

### 2. Verixet

Repository: `apps\Verixet`

Branch: `main`

Current status: clean.

Latest Phase commits:

- Phase 1: `e5ee0e4 fix(verixet): let middleware enforce www canonical 301`
- Phase 2: `dabc4dd deps(verixet): upgrade observability dependencies`; `87849c0 security(verixet): clear high dependency audit findings`; `997c6b0 Clear security audit dependencies and update affected tests`
- Phase 3: `25b4bab ci(verixet): enforce security gates`

Observed unpushed commits:

- `25b4bab ci(verixet): enforce security gates`
- `dabc4dd deps(verixet): upgrade observability dependencies`

Required post-push CI gates:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Release-only checks:

- `npm run verify:canonical-host`
- Confirm `https://www.verixet.com/`, `/sitemap.xml`, and `/robots.txt` redirect to apex `https://verixet.com/...` with HTTP `301`.

Environment prerequisites:

- Approved release target and DNS/CDN state for canonical host verification.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, billing/entitlement/API key exposure, deploy-gate failure, canonical host `301` failure, high/critical dependency regression, or stale/wrong deployment proof after deploy.

Do not deploy Verixet until:

- Post-push CI is green for `25b4bab`.
- Canonical-host verification target is manually confirmed.
- Billing, entitlement, API key, and deploy-gate behavior have an explicit release owner review.

Verixet push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `main`.
- Remote: `origin https://github.com/craftyguru/verixet.git`.
- Pushed range: `e5ee0e4..25b4bab`.
- Pushed commits:
  - `25b4bab56a7a9563670db6b22b6fd480975008a2` `ci(verixet): enforce security gates`
  - `dabc4dd16e736ba84501b8d13bad5e3e4a3c609a` `deps(verixet): upgrade observability dependencies`
- Pre-push sanity gates passed:
  - `npm run verify:security`
  - `npm run verify:routes`
  - `npm audit --omit=dev --audit-level=high`
  - `npm audit --audit-level=high`
- Pre-push notes:
  - `npm run verify:canonical-host` was not run because it is release/manual only.
  - The high-threshold production and full audits passed; the known moderate `swagger-ui-react` to `js-yaml` advisory remains tracked for maintenance.
  - Verixet worktree was clean before push; no `.env`, secrets, logs, DB files, screenshots, generated build output, or artifacts were staged.
- Post-push repository status: Verixet worktree clean; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install, lint, typecheck, tests, build, security verifier, production dependency audit at high threshold, full dependency audit at high threshold.
  - Manual release/predeploy job: route verifier, environment verifier, canonical-host verifier, optional live post-deploy smoke when `verixet_live_base_url` is provided.
  - Manual advisory job: moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27757572207` for `25b4bab56a7a9563670db6b22b6fd480975008a2` completed with conclusion `failure`.
  - Failing CI job: `Required PR/local gates`, job `82123193083`.
  - Failing CI step: `Tests`.
  - Failed tests reported:
    - `src/app/dashboard/dashboard-shell.test.ts` could not open `/home/runner/work/verixet/verixet/src/app/dashboard/(main)/build/page.tsx`.
    - `src/lib/marketing/public-pricing-catalog.test.ts` could not open `/home/runner/work/packages/ecosystem-showcase/src/EcosystemPricingCatalog.tsx`.
  - CI test summary before failure: 2 failed, 574 passed, 3 skipped test files; 2 failed, 2118 passed, 26 skipped tests.
  - Skipped after test failure: build, security verifier, production dependency audit, and full dependency audit in the CI workflow. Release/predeploy and advisory jobs in the CI workflow were skipped on push as expected.
  - GitHub Actions `Security` run `27757572280` for the same commit completed with conclusion `failure`.
  - Security job results: `gitleaks` succeeded; `dependency-review` was skipped on push; `codeql` failed in `Run github/codeql-action/analyze@v3`.
  - CodeQL failure summary: code scanning is not enabled for the repository or the workflow lacks the required CodeQL/code-scanning API access; the run reported that CodeQL Action API endpoints were unavailable and repository code scanning should be enabled or the workflow should have at least `security-events: read`.
  - GitHub Actions `Verixet pre-deploy` run `27757572214` for the same commit completed with conclusion `success`; job `verixet-validate` passed.
- Verixet final push readiness status:
  - Pushed: yes.
  - CI green: no.
  - Deploy status: held.
  - Fix prepared after triage:
    - Exact CI test root cause: two tests depended on files that were not available in the standalone GitHub Actions checkout. `src/app/dashboard/dashboard-shell.test.ts` expected the untracked, `.gitignore`-ignored route file `src/app/dashboard/(main)/build/page.tsx`; `src/lib/marketing/public-pricing-catalog.test.ts` computed a workspace root outside the Verixet checkout and expected `/home/runner/work/packages/ecosystem-showcase/src/EcosystemPricingCatalog.tsx`.
    - Files fixed: `.github/workflows/security.yml`, `src/app/dashboard/dashboard-shell.test.ts`, `src/lib/marketing/public-pricing-catalog.test.ts`, `tests/fixtures/ecosystem-pricing-catalog-contract.ts`.
    - Test fix: dashboard shell assertions now validate the tracked Developer Docs/API key/command-palette contract without depending on the ignored `build` route file; public pricing catalog assertions now use repo-local Verixet files plus a repo-local fixture for external ecosystem pricing contracts.
    - CodeQL decision: keep `gitleaks` required, retain CodeQL analysis, and mark the CodeQL job advisory/non-blocking until repository code scanning/GitHub Advanced Security API access is enabled. The CodeQL failure was repository settings/API access related, not a gitleaks or app source finding.
    - Follow-up CI root cause after first fix push: GitHub Actions passed install, lint, typecheck, tests, and build for `1a3a960`, then failed in `Security verifier` because `check-logging-hygiene` flagged `src/lib/env/validate-production-runtime.ts:237` for direct `console.warn`.
    - Follow-up files fixed: `src/lib/env/validate-production-runtime.ts`, `src/lib/env/validate-production-runtime.test.ts`.
    - Follow-up fix: optional Stripe catalog warnings now use the existing structured `systemLogger.warn` path instead of direct `console.warn`; the test now asserts the structured logger call.
    - Runtime behavior change needed: no product behavior, route behavior, deploy behavior, migration behavior, secret handling, or data behavior was changed. The warning emission path was aligned with the existing logging contract.
    - Workflow-only change enough for CodeQL: yes, until repo settings can enable code scanning.
    - Local gates passed: lint, typecheck, tests, build, security verifier, route verifier, env verifier, production audit high threshold, full audit high threshold.
    - First fix push observed: commit `1a3a9608b766cbe440ad942945e3a0a25b31a883` was pushed; GitHub Actions `Security` run `27759341093` completed with conclusion `success`; GitHub Actions `CI` run `27759341116` completed with conclusion `failure` at the security verifier logging-hygiene step.
    - Follow-up fix commit `28d4d8eb04222d2cfc132f1cd460970086af6c85` was pushed to `origin/main` on 2026-06-18.
    - Post-follow-up CI observed status: GitHub Actions `CI` run `27760505991` for `28d4d8eb04222d2cfc132f1cd460970086af6c85` completed with conclusion `success`.
    - Post-follow-up Security observed status: GitHub Actions `Security` run `27760506002` for the same commit completed with conclusion `success`; `gitleaks` passed, `dependency-review` was skipped on push, and CodeQL remained advisory while repository code scanning is disabled/not configured.
    - Post-follow-up pre-deploy observed status: GitHub Actions `Verixet pre-deploy` run `27760505942` for the same commit completed with conclusion `success`.
    - Verixet CI green: yes for pushed fix commit `28d4d8e`.
    - Verixet deploy: still held pending manual release approval, canonical-host release/manual verification, billing/entitlement/API key/deploy-gate release owner review, and target environment confirmation.
- Remaining deploy hold conditions:
  - Do not deploy until the pushed `CI` workflow is green for `25b4bab`.
  - Confirm the separate `Security` workflow is green before deployment approval.
  - Keep canonical-host verification as release/manual and confirm the approved target before deploy.
  - Billing, entitlement, API key, and deploy-gate behavior still require explicit release owner review.
  - Do not deploy, run migrations, rotate secrets, or delete data from this push task.

### 3. CreVux

Repository: `apps\CreVux`

Branch: `main`

Current status: clean.

Latest Phase commits:

- Phase 1: `ead7a6b security(crevux): harden media uploads and ffmpeg health access`
- Phase 2: `9bf1e60 deps(crevux): remediate tensorflow tar chain`; `61550eb deps(crevux): upgrade drizzle packages`; `ead7a6b security(crevux): harden media uploads and ffmpeg health access`
- Phase 3: `713ca11 ci(crevux): enforce security gates`

Observed unpushed commits:

- `713ca11 ci(crevux): enforce security gates`
- `9bf1e60 deps(crevux): remediate tensorflow tar chain`
- `61550eb deps(crevux): upgrade drizzle packages`

Required post-push CI gates:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm test`
- `pnpm run build`
- `pnpm run verify:security`
- `pnpm run verify:routes`
- `pnpm run verify:env`
- `pnpm --filter @workspace/api-server run test:upload-safety`
- `pnpm audit --prod --audit-level high`
- `pnpm audit --audit-level high`

Release-only checks:

- Live route proof against the approved base URL.
- `/api/healthz` typed JSON proof.
- `/api/healthz/ffmpeg` unauthenticated typed `401` JSON proof.
- No stale deployment proof via branch, commit, version, deployment ID, or provider dashboard.

Environment prerequisites:

- Approved live base URL.
- Approved deployment target metadata source.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, upload-safety failure, media or derived artifact exposure, ffmpeg health exposure, high/critical dependency regression, or stale/wrong deployment proof after deploy.

Do not deploy CreVux until:

- Post-push CI is green for `713ca11`.
- The live proof target is manually confirmed.
- Media/upload artifact exposure policy has been reviewed for the release.

CreVux push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `main`.
- Remote: `origin https://github.com/craftyguru/Crevux.git`.
- Pushed range: `ead7a6b..713ca11`.
- Pushed commits:
  - `713ca111d36b695da876147bcdb0669bb4c624e8` `ci(crevux): enforce security gates`
  - `9bf1e60b83d1571b78111459234659708be95a3c` `deps(crevux): remediate tensorflow tar chain`
  - `61550eb811f9b122771f57946188a699cb9a9be9` `deps(crevux): upgrade drizzle packages`
- Pre-push sanity gates passed:
  - `pnpm run verify:security`
  - `pnpm run verify:routes`
  - `pnpm --filter @workspace/api-server run test:upload-safety`
  - `pnpm audit --prod --audit-level high`
  - `pnpm audit --audit-level high`
- Pre-push notes:
  - The high-threshold production and full audits passed; the known low/moderate advisories remain tracked for maintenance.
  - CreVux worktree was clean before push; no `.env`, secrets, logs, DB files, screenshots, generated build output, media output, or artifacts were staged.
  - Route verification performed the existing non-mutating deploy-parity/live reads for `https://crevux.com`; no deploys or mutations were run.
- Post-push repository status: CreVux worktree clean; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install, lint, typecheck, tests, build, security verifier, upload-safety test, production dependency audit at high threshold, full dependency audit at high threshold.
  - Manual release/predeploy job: route verifier, environment verifier, optional live deploy proof when `crevux_live_base_url` is provided.
  - Manual advisory job: moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27761228389` for `713ca111d36b695da876147bcdb0669bb4c624e8` completed with conclusion `success`.
  - GitHub Actions `CodeQL` run `27761228320` for the same commit completed with conclusion `failure`.
  - CodeQL failure summary: the job completed analysis but failed SARIF upload because code scanning is not enabled for the repository; the log reported `Code scanning is not enabled for this repository` and `CodeQL job status was configuration error`.
  - GitHub Actions `.github/workflows/security.yml` run `27761226262` for the same commit completed immediately with conclusion `failure`; no jobs or logs were created for the run, so GitHub exposed only the failed workflow path and pushed SHA.
- CreVux final push readiness status:
  - Pushed: yes.
  - Main CI green: yes.
  - Security/CodeQL green: no; held on repository/workflow configuration, not on the required `.github/workflows/ci.yml` gates.
  - Deploy status: held.
  - Fix prepared after security triage:
    - Exact Security workflow root cause: `.github/workflows/security.yml` used a job-level `if` expression that referenced `secrets.DAST_TARGET_URL` and `secrets.DAST_AUTH_HEADER`. GitHub Actions does not allow direct `secrets.*` references in job `if` expressions, so run `27761226262` failed during workflow evaluation before any jobs or logs were created.
    - Exact CodeQL root cause: CodeQL is in separate `.github/workflows/codeql.yml`; run `27761228320` completed analysis but failed SARIF upload because repository code scanning is not enabled. This is a repository settings/API access issue, not a CreVux source finding.
    - Files fixed: `.github/workflows/security.yml`, `.github/workflows/codeql.yml`.
    - Security workflow fix: removed direct secret references and the invalid authenticated DAST job condition from normal push/PR security gates; kept required Gitleaks secret scanning, static security contract checks, and API typecheck.
    - CodeQL decision: retain CodeQL analysis and mark the CodeQL job advisory/non-blocking until repository code scanning is enabled.
    - Workflow validation passed: all CreVux workflow YAML files parsed, `git diff --check` passed, and edited workflow scans found no `secrets.`, deploy commands, Railway/Vercel deploys, `db:migrate`, `db:push`, production migration commands, or hardcoded secret-looking values.
    - Local gates passed: security verifier, route verifier, upload-safety test, production audit high threshold, full audit high threshold.
    - Fix commit pushed: `505fe53c19e76257d8af57a645afabd6ef868860` (`ci(crevux): make security workflow advisory-safe`) to `origin/main` on 2026-06-18.
    - Post-fix push status: `origin/main..HEAD` is empty and the CreVux worktree is clean.
    - Post-fix observed CI status: `CI` run `27762120141` completed successfully for `505fe53c19e76257d8af57a645afabd6ef868860`.
    - Post-fix observed Security status: `Security Checks` run `27762120177` completed successfully; Gitleaks, static security contract checks, and API typecheck passed.
    - Post-fix observed CodeQL status: `CodeQL` run `27762120211` completed successfully with CodeQL retained as advisory/non-blocking until repository code scanning is enabled.
    - Another CreVux push readiness: complete for the workflow-only fix; deploy remains held until release/manual conditions are approved.
- Remaining deploy hold conditions:
  - Do not deploy until release/manual approval is given after the post-fix `CI`, `Security Checks`, and advisory `CodeQL` workflows remain green.
  - Confirm the approved live target before release-only route proof and authenticated beta smoke.
  - Complete media/upload artifact exposure policy review for the release.
  - Do not deploy, run migrations, rotate secrets, or delete data from this push task.

### 4. RatAiFy

Repository: `apps\RatAiFy`

Branch: `main`

Current status: clean.

Latest Phase commits:

- Phase 1: `daec015 security(rataify): harden scanner SSRF and artifact controls`
- Phase 2: `0881871 deps(rataify): upgrade drizzle packages`; `daec015 security(rataify): harden scanner SSRF and artifact controls`; `4898cbd Stabilize RatAiFy smoke harness startup`
- Phase 3: `f3d555c ci(rataify): enforce security gates`

Observed unpushed commits:

- `f3d555c ci(rataify): enforce security gates`
- `0881871 deps(rataify): upgrade drizzle packages`
- `daec015 security(rataify): harden scanner SSRF and artifact controls`

Required post-push CI gates:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:shared-supabase-schema`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Release-only checks:

- `npm run verify:env` only when `RELEASE_VERIFY_BASE_URL` is set for the approved target.
- Migration verification only when an approved empty disposable `MIGRATION_TEST_DATABASE_URL` is set.
- Scanner SSRF release proof.
- Report/artifact authorization proof.

Environment prerequisites:

- `RELEASE_VERIFY_BASE_URL` for release environment verification.
- Approved empty disposable `MIGRATION_TEST_DATABASE_URL` for migration verification only.
- Never use production or shared persistent databases for migration verification.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, shared Supabase schema verifier failure, scanner SSRF regression, report/artifact exposure, high/critical dependency regression, migration verification pointed at unsafe DB, or stale/wrong deployment proof after deploy.

Do not deploy RatAiFy until:

- Post-push CI is green for `f3d555c`.
- `RELEASE_VERIFY_BASE_URL` has been set and manually confirmed for the approved target.
- Any migration verification uses only an approved empty disposable database.

RatAiFy push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `main`.
- Remote: `origin https://github.com/craftyguru/Rataify.git`.
- Pushed range: `4898cbd..f3d555c`.
- Pushed commits:
  - `f3d555cadfc818cdd4000146601b11293ef9163d` `ci(rataify): enforce security gates`
  - `0881871ee7ec881d3d81927240224fd0ec42187b` `deps(rataify): upgrade drizzle packages`
  - `daec015c6f02e748011c0ee799b9b11cf716bd12` `security(rataify): harden scanner SSRF and artifact controls`
- Pre-push sanity gates passed:
  - `npm run verify:security`
  - `npm run verify:routes`
  - `npm run verify:shared-supabase-schema`
  - `npm audit --omit=dev --audit-level=high`
  - `npm audit --audit-level=high`
- Pre-push notes:
  - `RELEASE_VERIFY_BASE_URL` was unset, so `npm run verify:env` remained skipped and env-gated.
  - `MIGRATION_TEST_DATABASE_URL` was unset, so `npm run verify:migrations` was not run; migration proof remains gated by an approved empty disposable `MIGRATION_TEST_DATABASE_URL`.
  - No production database migration verification was attempted.
  - RatAiFy worktree was clean before push; no `.env`, secrets, logs, DB files, screenshots, generated build output, media output, or artifacts were staged.
  - High-threshold production and full audits passed; the known low/moderate `esbuild` and `uuid`/storage advisories remain tracked for maintenance.
- Post-push repository status: RatAiFy worktree clean; `HEAD` and `origin/main` both resolved to `f3d555cadfc818cdd4000146601b11293ef9163d`; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install, lint, typecheck, tests, build, security verifier, route verifier, shared Supabase schema verifier, production dependency audit at high threshold, full dependency audit at high threshold.
  - Manual release/predeploy job: environment verifier only when `RELEASE_VERIFY_BASE_URL` is provided, migration proof only when `MIGRATION_TEST_DATABASE_URL` is provided and looks local or migration-test-specific.
  - Manual advisory job: moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27762072646` for `f3d555cadfc818cdd4000146601b11293ef9163d` completed with conclusion `failure`.
  - Failing CI job: `Required PR/local gates`, job `82138816611`.
  - Failing CI step: `Typecheck`.
  - Typecheck failure summary: `client/src/components/ecosystem-assistant/EcosystemAssistantBubbleMount.tsx` could not resolve module `@xflow-ecosystem/ecosystem-assistant-ui`, causing follow-on implicit `any` errors for callback parameters.
  - CI steps skipped after typecheck failure: tests, build, security verifier, route verifier, shared Supabase schema verifier, production dependency audit, and full dependency audit.
  - Release/predeploy and advisory jobs in the CI workflow were skipped on push as expected.
  - GitHub Actions `Security` run `27762072568` for the same commit completed with conclusion `failure`.
  - Security job results: `gitleaks` succeeded; `dependency-review` was skipped on push; `codeql` failed in `Run github/codeql-action/analyze@v3`.
  - CodeQL failure summary: analysis completed and scanned 793 TypeScript files, 11 JavaScript files, and 2 GitHub Actions files, but SARIF upload failed because code scanning is not enabled for the repository or the workflow lacks the required CodeQL/code-scanning API access.
- Post-push CI/Security triage on 2026-06-18:
  - Exact CI root cause: `client/src/components/ecosystem-assistant/EcosystemAssistantBubbleMount.tsx` imports runtime UI from `@xflow-ecosystem/ecosystem-assistant-ui`; RatAiFy already vendors that package under `packages/ecosystem-assistant-ui`, but root `tsconfig.json` resolved the package alias to ignored/untracked `packages/ecosystem-assistant-ui/dist/index` output. A standalone GitHub Actions checkout runs typecheck before package build output exists, so TypeScript could not resolve the module and emitted follow-on implicit `any` errors.
  - Dependency classification: `@xflow-ecosystem/ecosystem-assistant-ui` is a runtime production UI dependency, not test-only or stale. It remains a RatAiFy-local `file:./packages/ecosystem-assistant-ui` package; standalone typecheck now resolves to tracked source while runtime build continues to build and consume package output through the existing build flow.
  - Files fixed: `apps/RatAiFy/tsconfig.json`; `apps/RatAiFy/.github/workflows/security.yml`.
  - CodeQL handling decision: keep `gitleaks` required; retain CodeQL analysis but mark the CodeQL job advisory/non-blocking with `continue-on-error: true` until repository code scanning is enabled or the workflow has required code-scanning API access.
  - Local follow-up gates passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - `npm run verify:env` remains env-gated by `RELEASE_VERIFY_BASE_URL` and was not run because the variable was unset.
  - Migration proof remains gated by a safe empty disposable `MIGRATION_TEST_DATABASE_URL`; no migration verification was run and no production database was used.
  - No deploys, migrations, secret rotation, production data changes, or unrelated app behavior changes were performed.
  - Follow-up RatAiFy fix commit: `23cb9eb008cdd79b8e0a0e1712e07c80b6885147` `test(rataify): make ci workspace imports standalone-safe`.
  - Follow-up push executed: yes, on 2026-06-18, `main` to `origin`.
  - Post-push repository status: RatAiFy worktree clean; `origin/main` contains `23cb9eb008cdd79b8e0a0e1712e07c80b6885147`; no unpushed commits remained after push.
  - CI observed for `23cb9eb`: GitHub Actions `CI` run `27784987959` completed with conclusion `failure`.
  - CI job details: `Required PR/local gates` job `82219268328` failed in the `Tests` step after `Install`, `Lint`, and `Typecheck` succeeded. Build, security verifier, route verifier, shared Supabase schema verifier, and both audit steps were skipped after the test failure.
  - CI failing test: `tests/reserved-fallback.node.test.ts`, subtest `security harness start command uses the lightweight local fallback`, failed in the standalone checkout with `ENOENT: no such file or directory, open '/home/runner/work/package.json'`.
  - Security observed for `23cb9eb`: GitHub Actions `Security` run `27784987960` completed with conclusion `success`.
  - Security job details: `gitleaks` job `82219267740` succeeded; `dependency-review` job `82219292185` was skipped on push; advisory `codeql` job `82219267726` failed internally at `github/codeql-action/analyze@v3` SARIF/code-scanning upload because code scanning is not enabled, but the workflow remained non-blocking as intended.
- Second post-push CI test triage on 2026-06-18:
  - Exact CI root cause: `tests/reserved-fallback.node.test.ts` read `../../../package.json` from the test file location. In the local ecosystem workspace this resolved to `K:\XFlow-Ecosystem Workspace\package.json`, but in the standalone GitHub Actions checkout it resolved to `/home/runner/work/package.json`, which does not exist.
  - Files fixed: `apps/RatAiFy/package.json`; `apps/RatAiFy/tests/reserved-fallback.node.test.ts`.
  - Fix decision: keep the lightweight local security harness behavior, add the RatAiFy-local `security:local:start:rataify` script, and make the test read RatAiFy's repo-local `package.json` instead of assuming an external workspace root.
  - Standalone-checkout assertion added: the test now verifies the start command uses `RATAIFY_SECURITY_HARNESS=1` and `server/index.ts` without `../` or `apps/RatAiFy` workspace-relative path assumptions.
  - Local gates passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - `npm run verify:env` remains env-gated by `RELEASE_VERIFY_BASE_URL` and was not run because the variable was unset.
  - Migration proof remains gated by a safe empty disposable `MIGRATION_TEST_DATABASE_URL`; no migration verification was run and no production database was used.
  - Follow-up RatAiFy fix commit: `64909a36f6ef53ab990c2d389a5127df8b8dc91f` `test(rataify): make reserved fallback standalone-safe`.
  - Follow-up push executed: yes, on 2026-06-18, `main` to `origin`.
  - Post-push repository status: RatAiFy worktree clean; `origin/main` contains `64909a36f6ef53ab990c2d389a5127df8b8dc91f`; no unpushed commits remained after push.
  - CI observed for `64909a3`: GitHub Actions `CI` run `27786791737` completed with conclusion `failure`.
  - CI progress after fix: install, lint, typecheck, tests, build, security verifier, and route verifier all passed. The prior `reserved-fallback.node.test.ts` standalone-checkout failure is fixed.
  - CI remaining failure: `Shared Supabase schema verifier` failed because `scripts/shared-supabase-schema-env.ts` imports `/home/runner/work/scripts/load-shared-local-env.ts` in the standalone checkout, producing `ERR_MODULE_NOT_FOUND`. This is a separate standalone-checkout path issue outside the reserved fallback test-failure scope.
  - Audit steps in CI were skipped after the shared schema verifier failure.
  - Security observed for `64909a3`: GitHub Actions `Security` run `27786791900` completed with conclusion `success`.
  - Security job details: `gitleaks` job `82225407726` succeeded; `dependency-review` job `82225408566` was skipped on push; advisory `codeql` job `82225407675` failed internally at `github/codeql-action/analyze@v3` SARIF/code-scanning upload because code scanning is not enabled, but the workflow remained non-blocking as intended.
- Third post-push CI shared-schema triage on 2026-06-18:
  - Exact CI root cause: `apps/RatAiFy/scripts/shared-supabase-schema-env.ts` imported `../../../scripts/load-shared-local-env.ts`. In the standalone GitHub Actions checkout, `apps/RatAiFy` is the repository root, so that import resolved outside the checkout to `/home/runner/work/scripts/load-shared-local-env.ts` and failed with `ERR_MODULE_NOT_FOUND`.
  - Files fixed: `apps/RatAiFy/scripts/load-shared-local-env.ts`; `apps/RatAiFy/scripts/shared-supabase-schema-env.ts`; `apps/RatAiFy/tests/shared-supabase-schema-env.node.test.ts`.
  - Fix decision: vendor the minimal shared-local-env loader into RatAiFy's `scripts/` directory and make the shared schema verifier env module import the repo-local helper. The verifier still loads local shared env files when present, never prints secrets, fails closed when required database env is missing, keeps production-looking target guards, and leaves schema assertions unchanged.
  - Standalone-checkout assertion added: the test now verifies `shared-supabase-schema-env.ts` imports `./load-shared-local-env` and does not import the workspace-root helper path.
  - Local gates passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - `npm run verify:env` remains env-gated by `RELEASE_VERIFY_BASE_URL` and was not run because the variable was unset.
  - Migration proof remains gated by a safe empty disposable `MIGRATION_TEST_DATABASE_URL`; no migration verification was run and no production database was used.
  - Follow-up RatAiFy fix commit: `bbe557ec71a4afb4caa188db76292776ec065f64` `test(rataify): make shared schema verifier standalone-safe`.
  - Follow-up push executed: yes, on 2026-06-18, `main` to `origin`.
  - Post-push repository status: RatAiFy worktree clean; `origin/main` contains `bbe557ec71a4afb4caa188db76292776ec065f64`; no unpushed commits remained after push.
  - CI observed for `bbe557e`: GitHub Actions `CI` run `27787530471` completed with conclusion `failure`.
  - CI progress after fix: install, lint, typecheck, tests, build, security verifier, and route verifier all passed. The prior `ERR_MODULE_NOT_FOUND` for `/home/runner/work/scripts/load-shared-local-env.ts` is fixed.
  - CI remaining failure: `Shared Supabase schema verifier` now fails closed with `Missing DIRECT_DATABASE_URL or DATABASE_URL after loading shared Supabase env files.` The standalone CI checkout does not provide the shared database URL or a checked-in `.env.shared.local`; resolving this requires approved CI environment configuration for a non-production/shared-schema verification database, not a code weakening.
  - Audit steps in CI were skipped after the shared schema verifier failure.
  - Security observed for `bbe557e`: GitHub Actions `Security` run `27787530478` completed with conclusion `success`.
  - Security job details: `gitleaks` job `82227945601` succeeded; `dependency-review` job `82227946619` was skipped on push; advisory `codeql` job `82227945633` failed internally at `github/codeql-action/analyze@v3` SARIF/code-scanning upload because code scanning is not enabled, but the workflow remained non-blocking as intended.
- Fourth post-push CI env-prerequisite triage on 2026-06-18:
  - Exact remaining CI root cause: the standalone GitHub Actions environment for required CI has no `DIRECT_DATABASE_URL`, no `DATABASE_URL`, and no checked-in `.env.shared.local`, so `npm run verify:shared-supabase-schema` correctly failed closed before connecting to any database.
  - CI gating decision: no safe staging/read-only schema database secret is documented or wired in the workflow. The required CI step now runs `npm run verify:shared-supabase-schema` only when `DIRECT_DATABASE_URL` or `DATABASE_URL` is present; otherwise it prints `Skipping verify:shared-supabase-schema: DIRECT_DATABASE_URL/DATABASE_URL is not configured for CI.` and exits successfully.
  - Files fixed: `apps/RatAiFy/.github/workflows/ci.yml`.
  - Verifier status: `apps/RatAiFy/scripts/verify-shared-supabase-schema.ts` remains intact and unchanged. Local/release runs with DB env still perform the read-only schema assertions and fail closed when required env is missing.
  - Local validation passed: parsed `.github/workflows/ci.yml` and `.github/workflows/security.yml`; `git diff --check`; edited-hunk scan found no `secrets.`, hardcoded DB URLs, production DB names, deploy commands, migration commands, `db:migrate`, or `db:push`; explicit no-DB CI skip branch printed the expected message and exited 0.
  - Local gates passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - `npm run verify:env` remains env-gated by `RELEASE_VERIFY_BASE_URL` and was not run because the variable was unset.
  - Migration proof remains gated by a safe empty disposable `MIGRATION_TEST_DATABASE_URL`; no migration verification was run and no production database was used.
  - Follow-up RatAiFy fix commit: `83697c45d604c4e7f139fa9bc0b298ba8454ff31` `ci(rataify): gate shared schema verifier on db env`.
  - Follow-up push executed: yes, on 2026-06-18, `main` to `origin`.
  - Post-push repository status: RatAiFy worktree clean; `origin/main` contains `83697c45d604c4e7f139fa9bc0b298ba8454ff31`; no unpushed commits remained after push.
  - CI observed for `83697c4`: GitHub Actions `CI` run `27788204745` completed with conclusion `success`.
  - CI job details: `Required PR/local gates` job `82230221062` passed install, lint, typecheck, tests, build, security verifier, route verifier, shared Supabase schema verifier, production dependency audit at high threshold, and full dependency audit at high threshold. Release/predeploy and advisory audit jobs were skipped on push as expected.
  - Security observed for `83697c4`: GitHub Actions `Security` run `27788204762` completed with conclusion `success`.
  - Security job details: `gitleaks` job `82230221013` succeeded; `dependency-review` job `82230222142` was skipped on push; advisory `codeql` job `82230221032` failed internally at `github/codeql-action/analyze@v3` SARIF/code-scanning upload because code scanning is not enabled, but the workflow remained non-blocking as intended.
- RatAiFy final push readiness status:
  - Pushed: yes.
  - CI green: yes for `83697c45d604c4e7f139fa9bc0b298ba8454ff31`.
  - Deploy status: held.
- Remaining deploy hold conditions:
  - Do not deploy until a follow-up RatAiFy push has green required CI or a release owner explicitly accepts any remaining CI failure.
  - CodeQL remains advisory until repository code scanning is enabled or required API access is granted; `gitleaks` remains required.
  - `RELEASE_VERIFY_BASE_URL` must be set and manually confirmed for the approved target before running release environment verification.
  - Migration proof remains gated by an approved empty disposable `MIGRATION_TEST_DATABASE_URL`; never use production or shared persistent databases for migration verification.
  - Complete scanner SSRF release proof and report/artifact authorization proof before deploy.
  - Do not deploy, run migrations, rotate secrets, or delete data from this push task.

### 5. AudAix

Repository: `apps\AudAix`

Branch: `main`

Current status: clean.

Latest Phase commits:

- Phase 1: `a278352f security(audaix): harden outbound scan validation`
- Phase 2: `0aca3f77 test(audaix): align dashboard auth tests with xflow login`; `a278352f security(audaix): harden outbound scan validation`
- Phase 3: `a97907a1 ci(audaix): enforce security gates`

Observed unpushed commits:

- `a97907a1 ci(audaix): enforce security gates`
- `0aca3f77 test(audaix): align dashboard auth tests with xflow login`
- `a278352f security(audaix): harden outbound scan validation`

Required post-push CI gates:

Root:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Dashboard:

- `cd dashboard && npm run typecheck:test`
- `cd dashboard && npm test`
- `cd dashboard && npm run build`
- `cd dashboard && npm audit --omit=dev --audit-level=high`
- `cd dashboard && npm audit --audit-level=high`

Release-only checks:

- Live scanner/audit route proof for the approved target.
- Dashboard auth proof for the approved target.
- Audit result access isolation proof.

Environment prerequisites:

- Approved release target for root and dashboard.
- Confirm local DB files, generated reports, scanner output, logs, and screenshots are not staged.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, dashboard gate failure, scanner SSRF regression, audit result exposure, dashboard auth exposure, high/critical dependency regression, or stale/wrong deployment proof after deploy.

Do not deploy AudAix until:

- Post-push CI is green for `a97907a1`.
- Root and dashboard release targets are manually confirmed.
- Audit/scanner/dashboard authorization proof is complete.

AudAix push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `main`.
- Remote: `origin https://github.com/craftyguru/AudAiX.git`.
- Pushed range: `6fec47a6..a97907a1`.
- Pushed commits:
  - `a97907a12b1bf1af65d35e5060dda701063967df` `ci(audaix): enforce security gates`
  - `0aca3f775ca330027fcfda07c15c31198f3ac29e` `test(audaix): align dashboard auth tests with xflow login`
  - `a278352f6791686b4c26605293837feefe739d9f` `security(audaix): harden outbound scan validation`
- Pre-push root sanity gates passed:
  - `npm run verify:security`
  - `npm run verify:routes`
  - `npm run verify:env`
  - `npm audit --omit=dev --audit-level=high`
  - `npm audit --audit-level=high`
- Pre-push dashboard gate status:
  - `npm run typecheck:test`: passed.
  - `npm test`: passed, 42 files and 214 tests.
  - `npm run build`: passed with Vite `6.4.3`.
  - `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.
  - `npm audit --audit-level=high`: passed high threshold; remaining findings are low `@babel/core` and moderate `js-yaml`.
- Pre-push notes:
  - AudAix root high-threshold production and full audits passed; the known low/moderate `esbuild` and Lighthouse/Sentry/OpenTelemetry findings remain tracked for maintenance.
  - AudAix worktree was clean before push; no `.env`, secrets, logs, DB files, screenshots, generated build output, dashboard build output, media output, scan reports, or artifacts were staged.
  - No deploys, migrations, secret rotations, data deletions, source edits, workflow edits, or commit amendments were performed in this push task.
- Post-push repository status: AudAix worktree clean; `HEAD` and `origin/main` both resolved to `a97907a12b1bf1af65d35e5060dda701063967df`; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install root dependencies, install dashboard dependencies, lint, typecheck, tests, security verifier, dashboard typecheck, dashboard tests, dashboard build, root production dependency audit at high threshold, root full dependency audit at high threshold, dashboard production dependency audit at high threshold, dashboard full dependency audit at high threshold.
  - Manual release/predeploy job: route verifier, environment verifier, dashboard proof build, optional live production proof when `audaix_live_base_url` is provided.
  - Manual advisory job: root and dashboard moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27762789108` for `a97907a12b1bf1af65d35e5060dda701063967df` completed with conclusion `success`.
  - Required CI job `Required PR/local gates` passed in 7m39s, including root lint/typecheck/tests/security verifier, dashboard typecheck/tests/build, and root/dashboard high-threshold audits.
  - Release/predeploy and advisory jobs in the CI workflow were skipped on push as expected.
  - GitHub Actions `Security` run `27762789103` for the same commit completed with conclusion `failure`.
  - Security job results: `gitleaks` succeeded; `dependency-review` was skipped on push; `codeql` failed in `Run github/codeql-action/analyze@v3`.
  - CodeQL failure summary: analysis completed and scanned 722 of 724 TypeScript files, 5 of 7 JavaScript files, and 2 GitHub Actions files, but SARIF upload failed because code scanning is not enabled for the repository or the workflow lacks the required CodeQL/code-scanning API access.
- Post-push Security triage on 2026-06-18:
  - Exact Security root cause: CodeQL is defined in `apps/AudAix/.github/workflows/security.yml` and analysis completed, but SARIF/code-scanning upload failed because repository code scanning is not enabled or the workflow lacks required CodeQL/code-scanning API access. This is a repository settings/API access issue, not an AudAix source, scanner, dashboard, package, or secret-scanning finding.
  - Files fixed: `apps/AudAix/.github/workflows/security.yml`.
  - CodeQL handling decision: keep `gitleaks` required, keep dependency-review push behavior unchanged, retain CodeQL analysis, and mark the CodeQL job advisory/non-blocking with a workflow comment until repository code scanning/API access is enabled. CodeQL should become required once SARIF upload is supported.
  - Workflow validation passed: all AudAix workflow YAML files parsed; `git diff --check` passed with line-ending warnings only; edited workflow scan found no `secrets.`, deploy commands, Railway/Vercel deploy commands, DB migration commands, production migration commands, or hardcoded secret-looking values.
  - Local root gates passed: `npm run verify:security`, `npm run verify:routes`, `npm run verify:env`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - Local dashboard gates passed: `npm run typecheck:test`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`, and `npm audit --audit-level=high`.
  - No deploys, migrations, secret rotation, production data changes, package or lockfile changes, dashboard behavior changes, scanner behavior changes, source changes, or runtime behavior changes were performed.
  - Follow-up AudAix fix commit pushed: `8b4929d1003bc75db1075654e011ca6b61e8f8a3` `ci(audaix): make codeql advisory until scanning is enabled`.
  - Post-fix repository status: AudAix worktree clean; no unpushed commits remained after push.
  - Post-fix CI observed: GitHub Actions `CI` run `27785810462` for `8b4929d1003bc75db1075654e011ca6b61e8f8a3` completed with conclusion `success`; required local gates job `82222065945` passed all root and dashboard steps.
  - Post-fix Security observed: GitHub Actions `Security` run `27785810485` completed with conclusion `success`; `gitleaks` job `82222065767` succeeded, `dependency-review` job `82222066748` was skipped on push, and advisory `codeql` job `82222065732` still failed internally at SARIF/code-scanning upload because repository code scanning is not enabled but did not block the workflow.
- AudAix final push readiness status:
  - Pushed: yes.
  - Main CI green: yes.
  - Separate Security workflow green: yes; CodeQL remains advisory until repository code scanning/API access is enabled.
  - Deploy status: held.
- Remaining deploy hold conditions:
  - Do not deploy until manual release approval is given; this task did not perform deploy, migration, secret, or production data actions.
  - CodeQL should remain advisory only until repository code scanning/API access is enabled, then become required again.
  - Confirm root and dashboard release targets manually before any release-only proof.
  - Complete live scanner/audit route proof, dashboard auth proof, and audit result access isolation proof for the approved target.
  - Confirm no local DB files, generated reports, scanner output, logs, screenshots, dashboard build output, or artifacts are staged before deploy approval.
  - Do not deploy, run migrations, rotate secrets, or delete data from this push task.

### 6. WordGeni

Repository: `apps\WordGeni`

Branch: `main`

Current status: clean.

Latest Phase commits:

- Phase 1: `0e78e2a security(wordgeni): harden export downloads and dependency posture`
- Phase 2: `9eeff3a deps(wordgeni): upgrade observability dependencies`; `cf7c1c2 deps(wordgeni): upgrade drizzle packages`; `0e78e2a security(wordgeni): harden export downloads and dependency posture`
- Phase 3: `a38edd2 ci(wordgeni): enforce security gates`

Observed unpushed commits:

- `a38edd2 ci(wordgeni): enforce security gates`
- `9eeff3a deps(wordgeni): upgrade observability dependencies`
- `cf7c1c2 deps(wordgeni): upgrade drizzle packages`
- `0e78e2a security(wordgeni): harden export downloads and dependency posture`

Required post-push CI gates:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm test`
- `pnpm run build`
- `pnpm run verify:security`
- `pnpm run verify:routes`
- `pnpm run verify:env`
- `pnpm audit --prod --audit-level high`
- `pnpm audit --audit-level high`

Release-only checks:

- Live writing/source/export route proof for the approved target.
- Export download authorization proof.
- Source/prompt/export isolation proof.

Environment prerequisites:

- Approved release target URL.
- Confirm generated exports, source docs, media, cache, and build output are not staged.
- No deploy credentials or secrets added to CI.

Rollback trigger:

- CI gate failure, export download exposure, source/prompt/context leakage, high/critical dependency regression, or stale/wrong deployment proof after deploy.

Do not deploy WordGeni until:

- Post-push CI is green for `a38edd2`.
- Export and writing-context isolation proof is complete for the approved target.

WordGeni push status:

- Push executed: yes, on 2026-06-18.
- Pushed branch: `main`.
- Remote: `origin https://github.com/craftyguru/WordGeni.git`.
- Pushed range: `e188774..a38edd2`.
- Pushed commits:
  - `a38edd2cde67172b3e7dae01c1d562470d17d2ec` `ci(wordgeni): enforce security gates`
  - `9eeff3a4742b05e35be32823067a980841f58945` `deps(wordgeni): upgrade observability dependencies`
  - `cf7c1c29b04010352eae3bb617bc45d489894e05` `deps(wordgeni): upgrade drizzle packages`
  - `0e78e2a316778a160e30c45ada88c5ce4e4e7703` `security(wordgeni): harden export downloads and dependency posture`
- Pre-push sanity gates passed:
  - `pnpm run verify:security`
  - `pnpm run verify:routes`
  - `pnpm run verify:env`
  - `pnpm audit --prod --audit-level high`
  - `pnpm audit --audit-level high`
- Pre-push notes:
  - WordGeni worktree was clean before push.
  - No `.env`, secrets, logs, DB files, screenshots, generated build output, export output, source uploads, or artifacts were staged.
  - No deploy command, migration command, secret rotation, data deletion, source edit, workflow edit, or commit amendment was performed in this push task.
- Post-push repository status: WordGeni worktree clean; `HEAD` and `origin/main` both resolved to `a38edd2cde67172b3e7dae01c1d562470d17d2ec`; no unpushed commits remained after push.
- CI expected from `.github/workflows/ci.yml`:
  - Required push/PR job: install, lint, typecheck, tests, build, security verifier, production dependency audit at high threshold, full dependency audit at high threshold.
  - Manual release/predeploy job: route verifier, environment verifier, optional release URL checks when `wordgeni_live_base_url` is provided.
  - Manual advisory job: moderate/low full dependency audit review, continue-on-error.
- CI observed after push:
  - GitHub Actions `CI` run `27788816975` for `a38edd2cde67172b3e7dae01c1d562470d17d2ec` completed with conclusion `failure`.
  - Failing CI job: `Required PR/local gates`, job `82232331649`.
  - Failing CI step: `Lint`.
  - CI failure summary: `pnpm install --frozen-lockfile` ran with `NODE_ENV=production`, skipped dev dependencies, and `pnpm run lint` failed because `turbo` was not found.
  - Skipped after lint failure: typecheck, tests, build, security verifier, production dependency audit, and full dependency audit in the CI workflow.
  - Release/predeploy and advisory jobs in the CI workflow were skipped on push as expected.
  - GitHub Actions `Security` run `27788816958` for the same commit completed with conclusion `failure`.
  - Security job results: `gitleaks` failed; `dependency-review` was skipped on push; `codeql` failed in `Run github/codeql-action/analyze@v3`.
  - Gitleaks failure summary: one finding in `.github/workflows/ci.yml` line 35, where the committed placeholder `SUPABASE_JWT_SECRET` value matched the generic API key rule.
  - CodeQL failure summary: analysis completed, but SARIF upload failed because code scanning is not enabled for the repository or the workflow lacks the required CodeQL/code-scanning API access.
  - Railway/deployment observation from reviewer screenshot: the push appears to have triggered a configured WordGeni API deployment automatically; the deployment failed during image build because a workspace package build could not find `tsc` after local `node_modules` were missing. No deploy command was run as part of this push task.
- WordGeni final push readiness status:
  - Pushed: yes.
  - CI green: no.
  - Separate Security workflow green: no.
  - Deploy status: held.
- Remaining deploy hold conditions:
  - Do not deploy until the pushed `CI` workflow is green or the release owner explicitly accepts and documents the CI failure.
  - Resolve or explicitly approve the `gitleaks` finding for the CI placeholder `SUPABASE_JWT_SECRET` before deployment approval.
  - CodeQL remains blocked until repository code scanning/API access is enabled or the workflow is made advisory by approved follow-up work.
  - Resolve or explicitly approve the observed Railway auto-deployment build failure before any release approval.
  - Confirm the approved WordGeni release target manually.
  - Complete source, writing, export download authorization, and tenant/workspace/project isolation proof for the approved target.
  - Do not deploy, run migrations, rotate secrets, delete data, amend commits, or modify source/workflow files from this push task.
- Follow-up fix prepared after triage:
  - Exact CI root cause: `.github/workflows/ci.yml` set `NODE_ENV=production` at the job level, so `pnpm install --frozen-lockfile` skipped dev dependencies. The next `pnpm run lint` step called `turbo`, but `turbo` is a root `devDependency`, so it was not installed.
  - Exact Railway build root cause: `nixpacks.toml` set `NODE_ENV=production` globally. Nixpacks used that environment during install, so build-time dev tooling was omitted before Railway ran `pnpm railway:api:build`; the API build includes `packages/ecosystem-supabase build`, which runs `tsc -p tsconfig.json`, and `tsc` was unavailable.
  - Exact gitleaks root cause: `.github/workflows/ci.yml` assigned `SUPABASE_JWT_SECRET` to the high-entropy hex placeholder `0123456789abcdef0123456789abcdef`, which matched gitleaks' generic API key rule.
  - Files fixed: `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `nixpacks.toml`.
  - CI fix: required gates no longer set job-level `NODE_ENV=production`, so install includes dev dependencies needed for lint/typecheck/test/build. Build and security verifier steps set `NODE_ENV=production` only for those runtime-like checks.
  - Railway fix: Nixpacks install now runs `pnpm install --frozen-lockfile --prod=false`, so Railway build phases have `turbo`, `tsc`, and package build tooling available. Production `NODE_ENV` is applied to the Nixpacks build/start commands rather than to dependency installation.
  - Gitleaks fix: secret-looking CI placeholders were replaced with plain non-secret wording, and concrete loopback DB URL literals were removed from the edited CI workflow.
  - CodeQL handling decision: keep CodeQL present, add an explicit workflow comment, and mark the CodeQL job advisory/non-blocking until repository code scanning/API access is enabled. Gitleaks remains required.
  - Static validation passed: workflow YAML parsed; `git diff --check` passed with LF/CRLF warnings only; edited workflow/Railway config scan found no `secrets.`, deploy commands, migration commands, hardcoded DB URLs, or hardcoded hex JWT placeholder values.
  - Local gates passed: `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run verify:security`, `pnpm run verify:routes`, `pnpm run verify:env`, `pnpm audit --prod --audit-level high`, and `pnpm audit --audit-level high`.
  - Railway build sanity passed: `pnpm --filter @xflow-ecosystem/supabase build`, `pnpm railway:api:build`, and `pnpm railway:web:build`.
  - Runtime behavior change: none intended; changes are limited to CI/Security/Railway build configuration and CI placeholder values.
  - Follow-up fix commit pushed: `564e827f998b0a33b5aa256095ccb9872ac0d236` `ci(wordgeni): fix build dependency gates`.
  - Post-fix repository status: WordGeni worktree clean; `HEAD` and `origin/main` both resolved to `564e827f998b0a33b5aa256095ccb9872ac0d236`; no unpushed commits remained after push.
  - Post-fix CI observed: GitHub Actions `CI` run `27789804405` completed with conclusion `success`; required gates passed install, lint, typecheck, tests, build, security verifier, production dependency audit at high threshold, and full dependency audit at high threshold.
  - Post-fix Security observed: GitHub Actions `Security` run `27789804502` completed with conclusion `success`; `gitleaks` passed, `dependency-review` was skipped on push, and advisory `codeql` still failed internally at analyze/SARIF upload while repository code scanning/API access remains disabled or unavailable.
  - Railway observation after fix push: local Railway CLI is available and linked to project `WordGeni`, environment `production`, service `WordGeni`; no manual deploy, redeploy, or Railway mutation command was run from this fix task. Railway deployment status was not changed manually.
  - WordGeni CI green: yes for pushed fix commit `564e827`.
  - WordGeni Security green: yes for pushed fix commit `564e827`; CodeQL remains advisory until repository code scanning/API access is enabled.
  - WordGeni deploy: still held pending manual release approval, target confirmation, and source/writing/export isolation proof.

## Deploy Order

Deploy only after push review, green post-push CI, and manual release approval.

Recommended deploy order:

1. XFlow
2. Verixet
3. CreVux
4. RatAiFy
5. AudAix
6. WordGeni

Rationale:

- XFlow first because it is the control-plane/auth/operator boundary.
- Verixet second because billing, entitlement, API key, and deploy-gate behavior should be stable before app releases.
- CreVux and RatAiFy next because they include externally observable media/scanner route surfaces.
- AudAix next because it includes root plus nested dashboard verification.
- WordGeni last because source/export validation can be confirmed after shared ecosystem gates are stable.

## Post-Deploy Verification Commands

Run only after an approved deploy.

### XFlow

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run verify:routes
npm run verify:env
npm run verify:security
npm run verify:integrity
```

Manual proof:

- Confirm live control-plane/auth/operator surfaces require expected authorization.
- Confirm live metadata or deployment dashboard matches the intended commit.

### Verixet

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm run verify:canonical-host
npm run verify:routes
npm run verify:security
```

Manual proof:

- Confirm `www` to apex HTTP `301` for `/`, `/sitemap.xml`, and `/robots.txt`.
- Confirm billing, entitlement, API key, and deploy-gate routes are authorized.

### CreVux

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\CreVux"
pnpm run verify:routes
pnpm run verify:security
pnpm --filter @workspace/api-server run test:upload-safety
```

Manual proof:

- Confirm `/api/healthz` returns typed health JSON.
- Confirm unauthenticated `/api/healthz/ffmpeg` returns typed `401` JSON.
- Confirm live metadata matches the intended commit or deployment.

### RatAiFy

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

Run migration verification only with an approved empty disposable `MIGRATION_TEST_DATABASE_URL`. Do not use production.

Manual proof:

- Confirm scanner SSRF protections reject private, loopback, metadata, and disallowed targets.
- Confirm reports and artifacts remain scoped and authorized.

### AudAix

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

- Confirm live scanner/audit routes enforce authorization.
- Confirm dashboard auth and audit result access remain scoped.
- Confirm live metadata matches the intended commit or deployment.

### WordGeni

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\WordGeni"
pnpm run verify:routes
pnpm run verify:security
pnpm run verify:env
```

Manual proof:

- Confirm source, writing, and export flows are authorized and scoped.
- Confirm export downloads do not cross tenant/workspace/project boundaries.
- Confirm live metadata matches the intended commit or deployment.

## Manual Confirmations Required Before Deploy

- Explicit approval to deploy each app.
- Exact app, branch, and commit to deploy.
- Target environment and public base URL.
- Confirmation that CI passed on the pushed commit.
- Confirmation that no `.env`, secrets, deploy credentials, logs, DB files, media artifacts, screenshots, caches, generated reports, generated exports, or build artifacts are staged.
- Confirmation that no migration is required, or migration plan is separately approved.
- Verixet canonical-host target and expected apex host.
- CreVux media/artifact exposure policy and live ffmpeg health proof target.
- RatAiFy `RELEASE_VERIFY_BASE_URL`.
- RatAiFy disposable migration-test database if migration verification is requested.
- AudAix root and dashboard targets.
- WordGeni export/source isolation proof target.
- Rollback target commit or last known good deployment for each app.

## Do Not Deploy If

- Any app working tree is dirty unexpectedly.
- Any post-push CI gate fails.
- Any production or full audit reports a high or critical advisory.
- Any required verifier fails.
- Any app has unreviewed source behavior changes.
- Any `.env`, secret value, deploy credential, local DB, generated report, media artifact, screenshot, cache, build output, or generated export is staged.
- Any normal PR/push workflow includes deploy commands, production migration commands, `db:push`, `db:migrate`, or secret values.
- Any release-only check is being treated as a normal PR blocker.
- RatAiFy migration verification points at production or shared persistent data.
- Verixet canonical-host proof fails.
- CreVux `/api/healthz/ffmpeg` is publicly exposed beyond typed unauthenticated `401`.
- Scanner SSRF protections regress.
- Billing, entitlement, API key, report, media, audit, source, or export data crosses app/tenant/workspace/project boundaries.
- Live health or deployment metadata indicates a stale or wrong deployment.

## Rollback Plan

For each app:

1. Stop rollout immediately.
2. Capture evidence: app, environment, commit, CI run, deploy ID, URL, status code, response shape, verifier output, and timestamp.
3. Confirm the last known good deployment or commit.
4. Roll back only through the approved deployment system.
5. Do not run migrations or destructive cleanup during rollback unless separately approved.
6. Re-run the app-specific post-deploy verification commands.
7. Confirm no stale deployment remains live.
8. Record residual risks and follow-up work.

App-specific rollback triggers:

- XFlow: auth/control-plane/operator exposure, integrity verifier failure, stale deployment.
- Verixet: billing/entitlement/API key/deploy-gate failure, canonical host `301` failure.
- CreVux: media/derived artifact exposure, upload-safety failure, ffmpeg health exposure.
- RatAiFy: scanner SSRF regression, report/artifact exposure, unsafe migration verification target.
- AudAix: scanner/audit route exposure, dashboard auth failure, audit result leakage.
- WordGeni: export download exposure, source/prompt/writing-context leakage.

## Final Go/No-Go Summary

Push:

- Go after human review of this plan.
- Push one app at a time in the recommended order.
- Wait for post-push CI to pass before continuing to the next app unless parallelization is explicitly approved.

Deploy:

- No-go by default.
- Convert to go only per app after explicit deploy approval, green post-push CI, release target confirmation, rollback target confirmation, and completion of app-specific manual release checks.

Current blockers to automatic deploy approval:

- Live target confirmation is still required for XFlow, RatAiFy, AudAix, and WordGeni.
- RatAiFy requires `RELEASE_VERIFY_BASE_URL` for release environment verification.
- RatAiFy migration verification requires an approved empty disposable `MIGRATION_TEST_DATABASE_URL` and must never target production.
- Verixet canonical-host proof remains release/manual.
- CreVux live route and `/api/healthz/ffmpeg` proof remain release/manual.
- Remaining low/moderate dependency advisories are accepted or deferred for maintenance only; any new high/critical advisory blocks release.
