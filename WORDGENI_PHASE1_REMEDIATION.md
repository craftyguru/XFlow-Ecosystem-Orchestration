# WordGeni Phase 1 Remediation

Date: 2026-06-17

Scope: `apps\WordGeni` only.

Commit status: not committed. Functional and security verification passed, but `pnpm audit --audit-level high` still fails on remaining high advisories that require forced, breaking, major-version, or unsafe upgrade paths. Per instruction, this requires manual audit-exception approval before commit.

## Findings Fixed

### P0/P1 Dependency Exposure - Safe Nonbreaking Updates

- Eliminated all critical npm audit advisories found during this phase.
- Reduced audit results from 73 vulnerabilities to 23 vulnerabilities.
- Updated safe patch/minor dependencies across the WordGeni workspace, including `vitest`, `hono`, `next`, `eslint-config-next`, AWS SDK S3 packages, `turbo`, and `lighthouse`.
- Added safe pnpm overrides for transitive vulnerable packages:
  - `@grpc/grpc-js@1.14.4`
  - `basic-ftp@5.3.1`
  - `fast-uri@3.1.2`
  - `protobufjs@7.6.4`
  - `shell-quote@1.8.4`
  - `ws@8.21.0`

### P1 Export Sanitization

- Added deterministic export download filenames that do not expose object storage keys, internal source paths, or generated artifact paths.
- Updated authenticated export downloads and signed export-token downloads to use sanitized filenames.
- Added regression assertions that `Content-Disposition` does not include internal storage key fragments such as `exports/` or original artifact file names.

### P1 Upload, Project, and Context Isolation Verification

- Re-ran focused security tests for source upload MIME/type/size validation and project access checks.
- Re-ran focused context isolation tests for project-bound voice draft context.
- Re-ran data-encryption tests covering production encryption-key enforcement behavior.

### P1 Temporary/Artifact Cleanup Verification

- Re-ran existing source upload security coverage that verifies failed upload initialization cleans up uploaded storage objects when the storage delete path is available.

### P1 Production Debug Logging

- Removed a production `console.log` from source ingestion scheduling while preserving audit, metric, and snapshot behavior.

## Findings Skipped

### Remaining Dependency Advisories

`pnpm audit --audit-level high` still fails with 23 vulnerabilities:

- 4 low
- 13 moderate
- 6 high
- 0 critical

Remaining high advisories require a separate approved dependency-upgrade phase:

- `drizzle-orm <0.45.2`: high SQL injection advisory. Current workspace uses `0.38.4`; remediation requires a major/breaking Drizzle upgrade and likely schema/query/tooling review.
- `@opentelemetry/sdk-node <0.217.0`: high Prometheus exporter crash advisory. Current workspace uses the `0.57.x` OpenTelemetry line; remediation requires a large version jump.
- `@opentelemetry/exporter-prometheus <0.217.0`: same OpenTelemetry advisory path through SDK Node; remediation requires coordinated OpenTelemetry upgrades.
- `esbuild >=0.17.0 <0.28.1`: high binary integrity advisory. Remaining paths are tied to `tsx`, `vite`/`vitest`, and Drizzle tooling chains; remediation likely requires major, forced, or coordinated toolchain upgrades.

Skipped because Phase 1 forbids forced, breaking, major-version, or unsafe downgrade paths without manual approval.

### Manual-Approval Areas Not Changed

- No migrations were run or created.
- No production data was deleted.
- No secrets were rotated.
- No deploys or pushes were performed.
- No auth, billing, entitlement, webhook, or project ownership behavior was changed.
- No public download-token retention policy was changed.
- No major framework/dependency upgrades were applied.

## Files Changed

WordGeni source and tests:

- `apps\WordGeni\apps\api\src\routes\export-filename.ts`
- `apps\WordGeni\apps\api\src\routes\exports.ts`
- `apps\WordGeni\apps\api\src\routes\export-download.ts`
- `apps\WordGeni\apps\api\src\routes\export-download.route.test.ts`
- `apps\WordGeni\apps\api\src\routes\exports.security-audit.route.test.ts`
- `apps\WordGeni\apps\api\src\routes\sources.ts`

WordGeni dependency metadata:

- `apps\WordGeni\package.json`
- `apps\WordGeni\pnpm-lock.yaml`
- `apps\WordGeni\apps\api\package.json`
- `apps\WordGeni\apps\web\package.json`
- `apps\WordGeni\apps\worker\package.json`
- `apps\WordGeni\packages\evals\package.json`
- `apps\WordGeni\packages\exporters\package.json`
- `apps\WordGeni\packages\model-router\package.json`
- `apps\WordGeni\packages\product-docs\package.json`
- `apps\WordGeni\packages\prompts\package.json`
- `apps\WordGeni\packages\provenance\package.json`
- `apps\WordGeni\packages\retrieval\package.json`
- `apps\WordGeni\packages\safety\package.json`
- `apps\WordGeni\packages\schemas\package.json`
- `apps\WordGeni\packages\style-engine\package.json`
- `apps\WordGeni\packages\wordgeni-env\package.json`

Generated-but-tracked Next type reference updated by the WordGeni production build:

- `apps\WordGeni\apps\web\next-env.d.ts`
  - Changed route type reference from `./.next/types/routes.d.ts` to `./.next-prod/types/routes.d.ts`.

Root remediation note:

- `WORDGENI_PHASE1_REMEDIATION.md`

## Tests Added Or Updated

- `apps\WordGeni\apps\api\src\routes\export-download.route.test.ts`
  - Added assertions that signed export downloads do not leak internal storage-key paths in download headers.
- `apps\WordGeni\apps\api\src\routes\exports.security-audit.route.test.ts`
  - Added assertions that authenticated export downloads do not leak internal storage-key paths in download headers.

## Commands Run And Results

### Audit And Dependency Commands

- `pnpm audit --audit-level high`
  - Baseline failed: 73 vulnerabilities; 8 low, 37 moderate, 25 high, 3 critical.
- `pnpm update --recursive vitest@3.2.6 hono@4.12.25 next@15.5.16 eslint-config-next@15.5.16 @aws-sdk/client-s3@3.1070.0 @aws-sdk/s3-request-presigner@3.1070.0 turbo@2.9.18 lighthouse@13.4.0`
  - Passed.
- `pnpm update --recursive next@15.5.18 eslint-config-next@15.5.18`
  - Passed.
- `pnpm audit --audit-level high`
  - Final failed: 23 vulnerabilities; 4 low, 13 moderate, 6 high, 0 critical.

### Focused Security Tests

- `pnpm --dir apps/api exec vitest run src/routes/export-download.route.test.ts src/routes/exports.security-audit.route.test.ts src/routes/sources.upload-init-security-audit.route.test.ts src/services/voice-draft-context.test.ts src/services/data-encryption.test.ts`
  - Passed: 5 test files, 22 tests.

### Full Verification

- `git status --short`
  - Showed only WordGeni repository files changed, plus the new root remediation note outside the WordGeni git repository.
- `pnpm run lint`
  - Passed with pre-existing warnings.
- `pnpm run typecheck`
  - Passed.
- `pnpm test`
  - Passed.
- `pnpm run verify:security`
  - Passed.
- `pnpm run build`
  - Passed.
- `pnpm audit --audit-level high`
  - Failed only on the remaining dependency advisories listed above.

## Remaining P0/P1 Risks

- P1 dependency risk remains for Drizzle, OpenTelemetry, and esbuild advisory chains.
- No critical advisories remain after Phase 1 safe updates.
- Remaining high advisories are not suitable for unattended Phase 1 remediation because they require major, breaking, forced, or coordinated dependency upgrades.

## Manual Approvals Still Needed

- Approval to commit Phase 1 with a documented audit exception.
- Approval for Phase 2 dependency-upgrade planning covering:
  - Drizzle major upgrade and query/schema regression testing.
  - OpenTelemetry coordinated upgrade.
  - esbuild/toolchain upgrade path across `tsx`, `vite`, `vitest`, and Drizzle tooling.
- Approval before any migration, production data cleanup, secret rotation, deployment, push, or auth/billing/entitlement/webhook/project ownership change.

## Phase 2 Readiness

WordGeni is ready for Phase 2 dependency-upgrade planning after manual approval of the Phase 1 audit exception. It is not yet appropriate to commit automatically because the only failing required command is `pnpm audit --audit-level high`, and the remaining advisories require explicit exception approval under the requested rules.
