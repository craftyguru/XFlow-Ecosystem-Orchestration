# Phase 2 Checkpoint and Dirty Worktree Report

Date: 2026-06-18
Workspace: `K:\XFlow-Ecosystem Workspace`

Scope: checkpoint/audit only. No package installs, commits, pushes, deploys, migrations, data deletion, or secret rotation were performed. The only file created in this run is this requested report.

Reports read:

- `PHASE2_BASELINE.md`
- `PHASE2_DRIZZLE_REMEDIATION.md`
- `PHASE2_TENSORFLOW_TAR_REMEDIATION.md`
- `PHASE2_VITE_ESBUILD_VITEST_REMEDIATION.md`
- `PHASE2_OBSERVABILITY_REMEDIATION.md`

## Current Repo Status

| Repo | Branch | Current status | Latest commit |
| --- | --- | --- | --- |
| `apps\XFlow` | `master` | clean | `3ace5fb deps(xflow): upgrade observability dependencies` |
| `apps\Verixet` | `main` | clean | `dabc4dd deps(verixet): upgrade observability dependencies` |
| `apps\CreVux` | `main` | dirty | `ead7a6b security(crevux): harden media uploads and ffmpeg health access` |
| `apps\RatAiFy` | `main` | dirty | `daec015 security(rataify): harden scanner SSRF and artifact controls` |
| `apps\AudAix` | `main` | dirty | `a278352f security(audaix): harden outbound scan validation` |
| `apps\WordGeni` | `main` | clean | `9eeff3a deps(wordgeni): upgrade observability dependencies` |

## Landed Commits

### XFlow

- `3ace5fb deps(xflow): upgrade observability dependencies`
- `49fadde deps(xflow): upgrade drizzle packages`
- Baseline predecessor: `01dea27 chore(xflow): sync app route manifest`

Status: clean. No uncommitted cleanup needed.

### Verixet

- `dabc4dd deps(verixet): upgrade observability dependencies`
- Baseline predecessor: `e5ee0e4 fix(verixet): let middleware enforce www canonical 301`

Status: clean. No uncommitted cleanup needed.

### WordGeni

- `9eeff3a deps(wordgeni): upgrade observability dependencies`
- `cf7c1c2 deps(wordgeni): upgrade drizzle packages`
- Baseline predecessor: `0e78e2a security(wordgeni): harden export downloads and dependency posture`

Status: clean. No uncommitted cleanup needed.

## Dirty Worktrees by Chain

### CreVux

Current dirty files:

- `artifacts/image-gen/vitest.config.ts`
- `lib/db/package.json`
- `package.json`
- `pnpm-lock.yaml`

Chain grouping:

| Chain | Files | Notes |
| --- | --- | --- |
| Drizzle | `lib/db/package.json`, `pnpm-lock.yaml` | `drizzle-orm` changed from `catalog:` to `0.45.2`; `drizzle-kit` changed from `^0.31.9` to `1.0.0-rc.1`. Drizzle advisories cleared, but DB static verifiers failed. |
| TensorFlow/tar | `package.json`, `pnpm-lock.yaml` | Root pnpm override added: `tar: 7.5.16`. TensorFlow/tar production high audit was cleared and functional/model gates passed. |
| Vite/esbuild/Vitest | `artifacts/image-gen/vitest.config.ts` | Test-harness compatibility change: explicit `esbuild` JSX automatic runtime for image-gen Vitest tests. This was required by the TensorFlow/tar install/test pass, but it belongs to the test harness/tooling surface. |
| Sentry/OpenTelemetry/Rollup/UUID | none | Observability report intentionally did not edit CreVux. |
| Generated/build artifacts | none currently listed | No generated artifact remains dirty. |
| Unrelated/unknown | `pnpm-lock.yaml` is mixed | Shared lockfile includes both Drizzle and TensorFlow/tar resolution changes. It is not cleanly commit-ready as a single-chain commit without separation or explicit approval. |

Known blockers verified from reports:

- Drizzle: `pnpm run db:verify:docs` failed because `videoJobs.ts must define video_jobs table`.
- Drizzle: `pnpm run db:verify:migration-filenames` failed due duplicate `0006` migration prefixes requiring manual ordering review.
- TensorFlow/tar: functional/security/build/audit gates passed, but commit was blocked because the repo already had unrelated dirty Drizzle changes and the shared `pnpm-lock.yaml` mixed both chains.

Commit safety:

- Drizzle changes: not safe to commit until DB static verifier failures are resolved or explicitly approved.
- TensorFlow/tar changes: functionally safe based on prior gates, but not safe to commit while mixed with unresolved Drizzle lockfile changes.
- Current combined CreVux worktree: not safe to commit as-is.

Revert candidates:

- Revert CreVux Drizzle changes only if the next decision is to defer DB static verifier cleanup. This would require carefully preserving the TensorFlow/tar `tar` override and image-gen Vitest compatibility change.
- Do not revert TensorFlow/tar changes without deciding whether to accept the verified `tar@7.5.16` override or carry a production dependency exception.

### RatAiFy

Current dirty files:

- `package.json`
- `package-lock.json`

Chain grouping:

| Chain | Files | Notes |
| --- | --- | --- |
| Drizzle | `package.json`, `package-lock.json` | `drizzle-orm` changed from `^0.39.1` to `0.45.2`; `drizzle-kit` changed from `^0.31.10` to `1.0.0-rc.1`. Drizzle advisories cleared. |
| TensorFlow/tar | none | Not applicable. |
| Vite/esbuild/Vitest | none | Not edited in the Vite pass. |
| Sentry/OpenTelemetry/Rollup/UUID | none | Observability report intentionally did not edit RatAiFy; UUID/storage/bull chain is separate. |
| Generated/build artifacts | none | No generated artifact currently dirty. |
| Unrelated/unknown | none obvious | Diff is Drizzle-only. |

Known blockers verified from reports:

- `npm run verify:env` blocked by missing `RELEASE_VERIFY_BASE_URL`.
- `npm run verify:migrations` blocked by missing disposable `MIGRATION_TEST_DATABASE_URL`.
- `npm run verify:shared-supabase-schema` passed on rerun.
- Lint, typecheck, tests, build, security verifier, routes verifier, and audits passed for the Drizzle remediation.

Commit safety:

- Potentially safe to commit after rerunning required gates with `RELEASE_VERIFY_BASE_URL` and an empty disposable `MIGRATION_TEST_DATABASE_URL`.
- Not safe to commit before those environment-gated checks pass or are explicitly waived.

Revert candidates:

- No immediate revert recommended. This is a clean Drizzle-only worktree that should be finished by satisfying the two prerequisites.

### AudAix

Current dirty files:

- `dashboard/package.json`
- `dashboard/package-lock.json`
- `package.json`
- `package-lock.json`

Chain grouping:

| Chain | Files | Notes |
| --- | --- | --- |
| Drizzle | none | Not involved. |
| TensorFlow/tar | none | Not applicable. |
| Vite/esbuild/Vitest | `dashboard/package.json`, `dashboard/package-lock.json`, `package.json`, `package-lock.json` | Dashboard `vite` changed to `^6.4.3`; dashboard `vitest` changed to `^3.2.6`; root override added `esbuild: 0.28.1`. |
| Sentry/OpenTelemetry/Rollup/UUID | none | Observability report intentionally did not edit AudAix because remaining path is Lighthouse. |
| Generated/build artifacts | none | No generated artifact currently dirty. |
| Unrelated/unknown | none obvious | Diff is Vite/esbuild/Vitest-only. |

Known blockers verified from reports:

- `npm test --prefix dashboard` failed after the toolchain update.
- Failing dashboard files included `SecurityCommandCenterPage.test.tsx`, `ArchitectureDoctorPage.test.tsx`, and `ProjectArchitectPage.test.tsx`.
- Root `npm run build` was skipped because it runs `npm ci --prefix dashboard`; the special handling says not to run that build unless package installs are explicitly approved.
- Dashboard full audit still has out-of-scope `jsdom -> ws` high; dashboard production audit is clean.

Commit safety:

- Not safe to commit as-is.
- Needs either a scoped test-harness investigation/fix plus rerun gates, or a deliberate revert of the AudAix Vite/esbuild/Vitest attempt.

Revert candidates:

- `dashboard/package.json`
- `dashboard/package-lock.json`
- `package.json`
- `package-lock.json`

These should be reverted if the next decision is to defer AudAix Vite/esbuild/Vitest remediation. Do not revert without explicit approval because they are the only record of the attempted Vite/esbuild/Vitest remediation.

## Clean Repos

### XFlow

Current status: clean.

Recent commits:

1. `3ace5fb deps(xflow): upgrade observability dependencies`
2. `49fadde deps(xflow): upgrade drizzle packages`
3. `01dea27 chore(xflow): sync app route manifest`
4. `fe8c519 security(xflow): apply safe dependency remediation`
5. `91028cf Simplify homepage scroll guide`

Uncommitted changes by chain: none.

### Verixet

Current status: clean.

Recent commits:

1. `dabc4dd deps(verixet): upgrade observability dependencies`
2. `e5ee0e4 fix(verixet): let middleware enforce www canonical 301`
3. `87849c0 security(verixet): clear high dependency audit findings`
4. `997c6b0 Clear security audit dependencies and update affected tests`
5. `0a13c01 Fix Verixet release env and route gates`

Uncommitted changes by chain: none.

### WordGeni

Current status: clean.

Recent commits:

1. `9eeff3a deps(wordgeni): upgrade observability dependencies`
2. `cf7c1c2 deps(wordgeni): upgrade drizzle packages`
3. `0e78e2a security(wordgeni): harden export downloads and dependency posture`
4. `e188774 Fix WordGeni release proof contracts`
5. `6016652 Update Crevux chameleon assets`

Uncommitted changes by chain: none.

## Blockers

### Missing Environment Variables / External Prerequisites

| App | Blocker | Affected chain | Required before commit |
| --- | --- | --- | --- |
| RatAiFy | `RELEASE_VERIFY_BASE_URL` missing for `npm run verify:env` | Drizzle | Provide a safe release base URL or explicitly approve accepting the prerequisite. |
| RatAiFy | `MIGRATION_TEST_DATABASE_URL` missing for `npm run verify:migrations` | Drizzle | Provide an empty disposable Postgres database URL. |
| AudAix | Root build runs `npm ci --prefix dashboard` | Vite/esbuild/Vitest | Explicit approval to run the install-performing build command, after dashboard tests are addressed. |

### Failing Tests / Verifiers

| App | Failure | Affected chain | Status |
| --- | --- | --- | --- |
| CreVux | `db:verify:docs` failed around `videoJobs.ts` / `video_jobs` docs expectation | Drizzle | Blocks Drizzle commit. |
| CreVux | `db:verify:migration-filenames` failed due duplicate `0006` migration prefixes | Drizzle | Blocks Drizzle commit. |
| AudAix | `npm test --prefix dashboard` failed after Vite/Vitest update | Vite/esbuild/Vitest | Blocks Vite commit. |

## Safe to Commit After Rerunning Gates

| App | Chain | Safe after rerun? | Conditions |
| --- | --- | --- | --- |
| RatAiFy | Drizzle | Yes, likely | Rerun all required Drizzle gates with `RELEASE_VERIFY_BASE_URL` and disposable `MIGRATION_TEST_DATABASE_URL`; commit only if all pass. |
| CreVux | TensorFlow/tar | Yes, but only after separation | Separate from unresolved Drizzle lockfile changes or resolve/commit Drizzle first; rerun TensorFlow/tar gates and audits. |
| CreVux | Drizzle | No | Must resolve or explicitly approve DB static verifier failures first. |
| AudAix | Vite/esbuild/Vitest | No | Dashboard tests must pass and root build handling must be approved before commit. |

## Changes That Should Be Reverted

No cleanup was performed in this run.

Recommended revert candidates if the team wants to restore a clean baseline before continuing:

1. AudAix Vite/esbuild/Vitest package changes should be reverted if dashboard test failures will not be investigated immediately.
2. CreVux Drizzle changes should be reverted only if the DB static verifier failures will not be fixed immediately; preserve TensorFlow/tar changes separately if that remediation is still desired.

Recommended not to revert yet:

- RatAiFy Drizzle changes, because they are cleanly scoped and only blocked by missing env/disposable DB prerequisites.
- CreVux TensorFlow/tar changes, because prior functional/security/build/audit gates passed; the problem is mixed lockfile scope, not failed TensorFlow remediation.

## Recommended Next Action Order

1. Finish RatAiFy Drizzle first because its dirty state is cleanly scoped and only blocked by prerequisites.
   - Provide `RELEASE_VERIFY_BASE_URL`.
   - Provide empty disposable `MIGRATION_TEST_DATABASE_URL`.
   - Rerun RatAiFy Drizzle gates.
   - Commit if all gates pass.

2. Resolve CreVux Drizzle verifier blockers before committing any CreVux TensorFlow/tar work.
   - Address or explicitly approve the `videoJobs.ts` / `video_jobs` docs verifier failure.
   - Address or explicitly approve duplicate `0006` migration prefix handling.
   - Rerun CreVux Drizzle gates.
   - Commit Drizzle if gates pass.

3. After CreVux Drizzle is clean, rerun CreVux TensorFlow/tar gates and commit the TensorFlow/tar override plus image-gen Vitest compatibility change if still passing.

4. Decide AudAix Vite/esbuild/Vitest direction.
   - Option A: approve investigation/fixes for dashboard Vitest failures, then rerun dashboard tests and the AudAix gate set.
   - Option B: revert the four AudAix package files and defer the Vite/esbuild/Vitest chain.

5. Only after the dirty worktrees are clean, continue new Phase 2 dependency-chain work.

## Safe to Continue Phase 2

Safe to continue Phase 2: no

Reason: three app repos are currently dirty (`CreVux`, `RatAiFy`, `AudAix`), and two have known failing or blocked gates. Continuing new dependency-chain work would risk mixing chains in shared lockfiles and package manifests.

## Exact Next Prompt Recommended

`Finish RatAiFy Drizzle remediation cleanup only. Use the existing dirty RatAiFy Drizzle changes, set RELEASE_VERIFY_BASE_URL to the approved release URL, use an empty disposable MIGRATION_TEST_DATABASE_URL, rerun the required Drizzle gates, update PHASE2_DRIZZLE_REMEDIATION.md if needed, and commit RatAiFy only if all gates pass. Do not touch CreVux, AudAix, or unrelated dependency chains. Do not push.`
