# XFlow Ecosystem Fix Roadmap

Date: 2026-06-17  
Source: `ECOSYSTEM_REPO_AUDIT.md`  
Mode: roadmap only. No fixes have been applied.

## Recommended Fix Order

1. Manual secret and artifact triage.
2. Dependency vulnerability remediation.
3. CI/security gate hardening.
4. Public artifact/report/download policy review.
5. RatAiFy, CreVux, and WordGeni app hardening.
6. Lint/debug cleanup.
7. Bundle/performance work.
8. Documentation/runbook standardization.

## Global P0 Fixes

| Batch | Goal | Files likely edited | Verify commands | Manual approval required |
|---|---|---|---|---|
| P0-A | Classify root/app `.env*` files and rotate any real shared/prod credentials. | Secret manager, provider dashboards, local `.env*` files only if owner approves; examples may later be edited. | `git status --short`; provider-side credential inventory; redacted env audit rerun. | yes |
| P0-B | Decide cleanup policy for local DBs, uploads, logs, caches, build outputs. | `.gitignore`, `.dockerignore`, `.railwayignore`, cleanup scripts, docs. | `git status --short`; artifact inventory command from audit. | yes for deletion |
| P0-C | Bring dependency audits below high/critical thresholds. | `package.json`, lockfiles across all apps. | per app: `npm audit --audit-level=high` or `pnpm audit --audit-level high`; then typecheck/lint/test/build. | yes for major upgrades |

## Global P1 Hardening

| Batch | Goal | Files likely edited | Verify commands | Manual approval required |
|---|---|---|---|---|
| P1-A | Add/standardize CI gates for audit, typecheck, lint, tests, builds, and security scripts. | `.github\workflows\ecosystem-proof.yml`, app package scripts. | `git diff --check`; dry-run CI commands per app. | no, unless deployment behavior changes |
| P1-B | Add secret scanning/security scanning in CI. | `.github\workflows\ecosystem-proof.yml`, scanner config files. | `gitleaks detect --no-git --redact`, `semgrep ci` or selected rules, dependency audits. | yes for handling findings |
| P1-C | Review public report/artifact/download-link policies. | AudAix report routes/tests, CreVux asset/export routes/tests, RatAiFy report/download/webhook routes/tests, WordGeni export routes/tests. | targeted auth/tenant tests plus full app test suites. | yes |
| P1-D | Standardize server-only vs client-exposed env schema. | env validation modules, `.env.example`, docs. | app `verify:env` scripts where available; typecheck/test. | yes if variable names or deployment secrets change |

## Global P2 Cleanup / Performance

| Batch | Goal | Files likely edited | Verify commands | Manual approval required |
|---|---|---|---|---|
| P2-A | Reduce lint warnings by removing unused imports/vars and empty blocks. | app source files with lint warnings. | `npm run lint` / `pnpm run lint`; typecheck. | no |
| P2-B | Reduce TODO/debug marker volume where stale. | source/docs/tests with confirmed stale markers. | `rg -n "console\.log|debugger|TODO|FIXME|HACK|XXX"`; test/lint. | no for comments/logs, yes for behavior changes |
| P2-C | Split heavy bundles with dynamic imports. | CreVux media/editor routes, RatAiFy analytics/charts, WordGeni project editor route. | `npm run build` / `pnpm run build`; bundle output comparison. | no |
| P2-D | Normalize lockfile/tooling policy. | app lockfiles, README/tooling docs, CI install steps. | clean install in each app; typecheck/lint/test/build. | yes if deleting lockfiles |

## Global P3 Documentation / Polish

| Batch | Goal | Files likely edited | Verify commands | Manual approval required |
|---|---|---|---|---|
| P3-A | Add per-app production readiness docs. | `docs\architecture`, `docs\security`, `docs\operations`, `README.md`. | markdown lint if available; link checks; review. | no |
| P3-B | Replace `next lint` usage. | Next app `package.json`, ESLint configs. | `npm run lint` / `pnpm run lint`. | no |
| P3-C | Reduce noisy test logs. | test setup files, logger config, app test harnesses. | `npm test` / `pnpm test`. | no |
| P3-D | Standardize app names/casing in docs and scripts. | README/docs/package metadata/user-facing copy. | search for old spellings; test if code identifiers changed. | yes if public branding changes |

## Per-App Roadmap

### XFlow

Priority: P0 dependency/security cleanup, then artifact cleanup and minor lint.

Tasks:

- Upgrade vulnerable Next.js/Drizzle/transitive packages.
- Verify all local `.env` values are local-only and examples are placeholder-safe.
- Clean or ignore build/dev logs after approval.
- Address the 2 lint warnings.

Likely files:

- `package.json`, `package-lock.json`, possible `pnpm-lock.yaml`
- `.env.example`, `docs\examples\.env.production-proof.example`
- `.gitignore`, `.dockerignore`
- `src\components\chronicle\ChronicleSourcesClient.tsx`

Verify:

```powershell
npm audit --audit-level=high
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:security
```

### Verixet

Priority: P1 because `verify:security` currently fails.

Tasks:

- Upgrade `form-data`, `ws`, DOMPurify/Sentry/OpenTelemetry/swagger-related chains.
- Make `npm run verify:security` pass.
- Review tracked env examples/templates.
- Reduce 19 lint warnings.
- Clarify CI/deploy examples versus authoritative workflows.

Likely files:

- `package.json`, `package-lock.json`
- `.env.example`, `.env.local.example`, `.env.production.template`
- `.github` example workflow files if promoted
- lint-warning source files under `src\components`, `src\lib`

Verify:

```powershell
npm audit --audit-level=high
npm run verify:security
npm run typecheck
npm run lint
npm test
npm run build
```

### CreVux

Priority: P1/P2 because of critical audit findings and heavy media bundles.

Tasks:

- Upgrade vulnerable `vitest`, `shell-quote`, `tar`/TensorFlow, `axios`, `vite`, `ws`, `protobufjs`.
- Review upload/media provider response size, storage, and retention behavior.
- Reduce 156 lint warnings.
- Split heavy ONNX/Three/animation chunks.
- Review large nested API `.env.example`.

Likely files:

- `package.json`, `pnpm-lock.yaml`, workspace package manifests
- `artifacts\api-server\src\routes\assetExports.ts`
- `artifacts\api-server\src\lib\assetExportRetention.ts`
- `artifacts\image-gen` route/editor entrypoints
- `.env.example`, `artifacts\api-server\.env.example`

Verify:

```powershell
pnpm audit --audit-level high
pnpm run verify:security
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

### RatAiFy

Priority: first app fix after secret/artifact triage.

Tasks:

- Upgrade critical/high dependencies: `fast-xml-parser`, `vitest`, `axios`, Drizzle, `multer`, `esbuild`, `ws`, route/parser dependencies.
- Review scanner/network/webhook/file upload attack surface.
- Review local `uploads`, `backup.dump`, reports, and build outputs before cleanup.
- Reduce 391 lint warnings.
- Add/strengthen tests around SSRF, upload size/type, webhook delivery, and public report/download access.

Likely files:

- `package.json`, `package-lock.json`
- `server\services`, `server\routes`, `server\middleware`
- `shared\schema.ts`, `shared\developerWebhookEvents.ts`
- `.env.example`, `.gitignore`, `.dockerignore`

Verify:

```powershell
npm audit --audit-level=high
npm run verify:security
npm run typecheck
npm run lint
npm test
npm run build
```

### AudAix

Priority: P1/P2 because of local DB/artifact risk and critical audit finding.

Tasks:

- Upgrade vulnerable `vitest`, `esbuild`, `ws`, `form-data`, Lighthouse/Sentry/OpenTelemetry chains.
- Manually decide retention/deletion for `audaix.db` and local report artifacts.
- Reduce 98 lint warnings.
- Review public report and signed artifact URL behavior against policy.
- Suppress or structure noisy test logs.

Likely files:

- `package.json`, `package-lock.json`
- `src` report/artifact/auth route files
- `tests\api.test.ts`, test setup/logger config
- `.env.example`, `.gitignore`, Docker/Railway ignore files

Verify:

```powershell
npm audit --audit-level=high
npm run verify:security
npm run typecheck
npm run lint
npm test
npm run build
```

### WordGeni

Priority: P1 because of critical/high audit findings and sensitive AI prompt storage.

Tasks:

- Upgrade vulnerable `vitest`, `shell-quote`, Drizzle, Next.js, `fast-uri`, `@grpc/grpc-js`, `esbuild`, `ws`, `vite`, `protobufjs`, Hono CORS chain.
- Verify `WORDGENI_DATA_ENCRYPTION_KEY` is required in production and AI log storage cannot silently fall back to plaintext.
- Review nested `.env.local` boundaries for API/web/worker.
- Review export/download token and object storage paths.
- Reduce lint warnings in API/packages.

Likely files:

- `package.json`, `pnpm-lock.yaml`, workspace package manifests
- `apps\api\src\db\schema.ts`
- `apps\api\src\services\data-encryption.ts`
- `apps\api\src\services\dependency-health.ts`
- `apps\api\src\services\admin-security-health.ts`
- `apps\api`, `apps\web`, `apps\worker` env examples/docs

Verify:

```powershell
pnpm audit --audit-level high
pnpm run verify:security
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

## Codex-Ready Task Batches

Batch 1: dependency reconnaissance only

- Generate per-app upgrade candidate list.
- Do not edit lockfiles yet.
- Output advisories, target versions, breaking-change notes.
- Verify with audit commands only.

Batch 2: nonbreaking dependency upgrades

- Apply patch/minor upgrades with lockfile updates.
- Run full gates per app.
- Stop before major/framework migrations.

Batch 3: Verixet security gate

- Focus only on dependencies making `npm run verify:security` fail.
- Verify `npm run verify:security`, then full Verixet gates.

Batch 4: RatAiFy hardening

- Upgrade dependencies.
- Add targeted tests around upload/network/webhook/report surfaces.
- Reduce lint warnings in touched files only.

Batch 5: WordGeni AI log encryption hardening

- Confirm production fails closed without `WORDGENI_DATA_ENCRYPTION_KEY`.
- Add tests proving no plaintext AI prompt persistence when encryption is required.

Batch 6: CI hardening

- Add matrix gates for each app.
- Add dependency audit and secret scan jobs.
- Keep deploy steps disabled/manual unless approved.

Batch 7: cleanup policy

- Update ignore files and cleanup documentation.
- Do not delete local DBs/uploads/logs until explicitly approved.

Batch 8: docs standardization

- Add missing per-app production docs and runbooks.
- Link app-specific security, env, deploy, and incident response docs.

## Risky Areas Requiring Manual Approval

- Secret rotation and determining whether redacted values are production credentials.
- Deleting `audaix.db`, `uploads`, logs, `.next`, `dist`, `output`, `test-results`, or stale clone folders.
- Running migrations.
- Changing public report, signed artifact, download-link, retention, or webhook policy.
- Major framework upgrades such as Next.js, Vite, Drizzle, TensorFlow/media stacks.
- Changing billing/entitlement behavior across apps.
- Deploying or changing production CI deploy behavior.
- Removing lockfiles or changing package-manager policy.

## Safe Automated Fix Areas

- Documentation additions and corrections.
- CI checks that do not deploy.
- Nonbreaking dependency upgrades with full verification.
- Lint cleanup in unused imports/vars and empty blocks.
- Test harness log suppression.
- Bundle splitting that preserves routes and passes builds/tests.
- Env example redaction/placeholder normalization after owner confirms intended variable names.

## Final Readiness Statement

Codex can start automated fixes safely after manual approval of secret and artifact handling. The safest first automated batch is dependency reconnaissance, followed by nonbreaking dependency upgrades and Verixet security-gate remediation. Manual approval should precede any deletion, rotation, migration, deployment, major upgrade, or auth/billing/public-artifact policy change.
