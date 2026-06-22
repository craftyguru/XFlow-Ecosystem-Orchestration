# CreVux Phase 1 Remediation

Date: 2026-06-17

Scope: `apps\CreVux` only. No migrations, deploys, pushes, secret rotation, production data deletion, billing/entitlement/credit-policy changes, webhook changes, or public artifact access policy changes were performed.

## Findings Fixed

- P0/P1 dependency exposure partially remediated with safe non-force updates and same-major overrides.
  - Reduced `pnpm audit --audit-level high` from `60 vulnerabilities (4 low, 27 moderate, 27 high, 2 critical)` to `31 vulnerabilities (3 low, 19 moderate, 9 high)`.
  - Removed all critical advisories found in the initial audit.
  - Updated safe package/catalog paths for Vite/Vitest, Supabase JS, Drizzle ORM, protobufjs, axios, form-data, path-to-regexp, picomatch, shell-quote, ws, fast-uri, and lodash where applicable.

- Upload filename/path leakage contained.
  - Added upload filename sanitization that strips local path fragments, control characters, and unsupported filename characters.
  - Stored sanitized upload filename metadata instead of raw client-provided path-like filenames.
  - Added verifier assertions for Windows path stripping and relative path stripping.

- Upload validation coverage improved.
  - Added verifier assertions for oversized media rejection.
  - Added verifier assertions for declared MIME/data URL mismatch rejection.
  - Existing upload validation continues to enforce MIME allowlists, byte-signature checks, extension matching, and size caps.

- Export filename/header handling hardened.
  - Sanitized asset export temp/output base names.
  - Sanitized `Content-Disposition` filenames for asset export responses.
  - Reduced risk of local path fragments or unsafe characters leaking into export filenames or temp output paths.

- Production route logging cleaned up in touched export route.
  - Replaced `console.warn` and `console.info` in `assetExports.ts` with structured `logger` calls.
  - Redacted error text before logging assistant snapshot publish failures.

- `/api/healthz/ffmpeg` runtime diagnostic exposure fixed in source.
  - Narrowed the global `/api` public health exemption so only exact `/api/healthz` bypasses auth.
  - Protected `/api/healthz/ffmpeg` with the existing `requireAdmin` session guard.
  - Kept the generic `/api/healthz` endpoint public for load-balancer health checks.
  - Added a focused non-mutating verifier proving nested health routes no longer bypass auth globally, unauthenticated ffmpeg diagnostics return `401`, non-admin sessions return `403`, and admin sessions can still reach the diagnostic route.
  - Added integration-test assertions for unauthenticated, non-admin, and admin `/api/healthz/ffmpeg` behavior.

## Findings Skipped

- Secret/env rotation and classification.
  - Reason: requires manual owner/provider approval.

- Local artifact/data deletion.
  - Reason: deletion was explicitly out of scope.

- `tar` advisories through `@tensorflow/tfjs-node`.
  - Reason: remaining high advisories require moving from `tar@6.2.1` to patched `tar >=7.5.x`, a transitive major-version override under TensorFlow native install tooling. This is not safe for automated Phase 1 without a dedicated dependency-upgrade approval and focused TensorFlow/face-mesh verification.

- `esbuild` advisories through API build tooling and Drizzle tooling.
  - Reason: patched advisory requires `esbuild >=0.28.1`; current direct tooling uses `esbuild 0.27.7`, while `esbuild-plugin-pino` declares peer support `>=0.25.0 <=0.25.8`. This needs a coordinated toolchain upgrade or peer-compatible replacement.

- Live production `/api/healthz/ffmpeg` verifier result.
  - Reason: source is fixed locally, but deploys are explicitly out of scope. `pnpm run verify:routes` still checks live `https://crevux.com`, whose currently deployed commit continues to return `200` for `/api/healthz/ffmpeg`.

## Files Changed

- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `artifacts/api-server/package.json`
- `packages/ecosystem-showcase/package.json`
- `packages/ecosystem-supabase/package.json`
- `artifacts/api-server/src/lib/uploadSafety.ts`
- `artifacts/api-server/src/routes/assets.ts`
- `artifacts/api-server/src/routes/assetExports.ts`
- `artifacts/api-server/src/app.ts`
- `artifacts/api-server/src/routes/health.ts`
- `artifacts/api-server/src/tests/securityHardening.integration.test.ts`
- `artifacts/api-server/scripts/verify-upload-safety-policy.ts`
- `artifacts/api-server/scripts/verify-healthz-ffmpeg-auth.ts`

## Tests Added Or Updated

- Updated `artifacts/api-server/scripts/verify-upload-safety-policy.ts` with assertions for:
  - local path stripping from upload filenames
  - relative path stripping from upload filenames
  - oversized upload rejection
  - MIME/data URL mismatch rejection
  - sanitized filename in upload safety metadata

- Updated `artifacts/api-server/src/tests/securityHardening.integration.test.ts` with assertions for:
  - unauthenticated `/api/healthz/ffmpeg` returns `401`
  - non-admin session access to `/api/healthz/ffmpeg` returns `403`
  - admin session access to `/api/healthz/ffmpeg` still returns diagnostic JSON with `200` or `503`

- Added `artifacts/api-server/scripts/verify-healthz-ffmpeg-auth.ts` and wired it into `pnpm run verify:security`.
  - Statically verifies exact `/api/healthz` remains public and `/api/healthz/*` is not globally exempted.
  - Statically verifies `/healthz/ffmpeg` uses `requireAdmin`.
  - Exercises unauthenticated, non-admin, and admin `/api/healthz/ffmpeg` responses without requiring a migrated local database.

## Commands Run And Results

- `git status --short`
  - Pass; changes are limited to CreVux files plus this root remediation note.
  - Changed CreVux paths include package manifests/lockfile, upload/export hardening files, API app/health route files, health/upload verifier scripts, and targeted security tests.
  - Re-run before commit approval showed only the same CreVux Phase 1 files in the CreVux repo.

- `pnpm audit --audit-level high`
  - Initial result: fail, `60 vulnerabilities found`, `4 low`, `27 moderate`, `27 high`, `2 critical`.
  - Final result: fail, `31 vulnerabilities found`, `3 low`, `19 moderate`, `9 high`.
  - Remaining high chains: TensorFlow `tar` and esbuild/toolchain.

- `pnpm audit --prod --audit-level high`
  - Fail, `24 vulnerabilities found`, `2 low`, `16 moderate`, `6 high`.
  - Remaining high chain: `@tensorflow/tfjs-node > tar`.

- `pnpm update concurrently @supabase/supabase-js vite vitest esbuild --recursive`
  - Pass; lockfile/manifests updated.
  - Install warnings remain for TensorFlow peer dependencies and `esbuild-plugin-pino` peer range.

- `pnpm install --lockfile-only`
  - Pass; lockfile refreshed after overrides.

- `pnpm --filter @workspace/api-server run test:upload-safety`
  - Pass; `upload safety policy verified`.

- `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-healthz-ffmpeg-auth.ts`
  - Pass; `verify-healthz-ffmpeg-auth: ok`.

- `pnpm --dir artifacts/api-server exec vitest run --config vitest.integration.config.ts src/tests/securityHardening.integration.test.ts -t "healthz"`
  - Route assertion passed, but suite cleanup failed because the local test database is missing expected schema objects such as `copilot_threads`.
  - This is local DB schema drift; no migrations were run per scope.

- `pnpm --filter @workspace/api-server exec tsc -p tsconfig.json --noEmit`
  - Pass.

- `pnpm run lint`
  - Pass with warnings only.
  - API warnings: `29`.
  - Image-gen warnings: `127`.
  - Total warnings: `156`.
  - Re-run before commit approval passed with the same warning profile.

- `pnpm run typecheck`
  - Pass.
  - Re-run before commit approval passed.

- `pnpm test`
  - Pass.
  - API: `6` test files, `38` tests passed.
  - Image-gen: `27` test files, `86` tests passed.
  - Re-run before commit approval passed.

- `pnpm run verify:security`
  - Pass.
  - `verify-app-billing-webhook: ok`.
  - `verify-stripe-webhook-idempotency: ok`.
  - `verify-healthz-ffmpeg-auth: ok`.
  - `db:verify:tsx` passed.
  - Re-run before commit approval passed and confirmed the local `/api/healthz/ffmpeg` verifier.

- `pnpm run build`
  - Pass.
  - Build still reports large bundle candidates, including `vendor-three`, `vendor-onnx`, and `AnimateTab`; this is P2 performance work.
  - Re-run before commit approval passed.

- `pnpm run verify:env`
  - Pass.
  - DB env contract, runtime, and Railway config checks passed.
  - Re-run before commit approval passed.

- `pnpm run verify:routes`
  - Fail.
  - Exact failing check: `/api/healthz/ffmpeg requires auth - 200 application/json; charset=utf-8`.
  - Classification after local fix: live production still serves the old behavior at currently deployed commit `f036b16bbd856bbb33cb47b87045fbd15a73ee3b`; local source now protects the route, but deploys are out of scope.
  - Re-run before commit approval failed only for the same stale live deployment result. All other deploy-parity checks passed: `43` passed, `1` failed.

## Remaining P0/P1 Risks

- Production dependency audit still fails high threshold due to `tar` via `@tensorflow/tfjs-node`.
- Full dependency audit still fails high threshold due to `tar` and esbuild/toolchain advisories.
- `verify:routes` still fails against live production because the source fix has not been deployed. This is now an explicitly approved stale-live-deployment exception for committing the local remediation.
- Public artifact/download policy remains a manual-review item from the ecosystem audit; this run did not change public artifact access behavior.

## Remaining Dependency Advisories

- Production audit: `24 vulnerabilities`, `2 low`, `16 moderate`, `6 high`.
  - High: `tar` via `@tensorflow/tfjs-node`.

- Full audit: `31 vulnerabilities`, `3 low`, `19 moderate`, `9 high`.
  - High: `tar` via `@tensorflow/tfjs-node`.
  - High: `esbuild` through API build tooling and Drizzle tooling.

## Manual Approvals Still Needed

- Approval to deploy the `/api/healthz/ffmpeg` auth fix and then re-run live deploy verification.
- Approval for a dedicated TensorFlow/tar dependency-upgrade path.
- Approval for coordinated esbuild/build-tooling remediation.
- Approval for any secret rotation, local artifact deletion, public artifact retention/access policy changes, or deploy changes.

## Phase 2 Readiness

CreVux is ready to commit with the approved stale-live-deployment and dependency-audit exceptions. After this commit, CreVux is ready for deploy verification planning: deploy the commit, then re-run `pnpm run verify:routes` to confirm live `/api/healthz/ffmpeg` returns `401` unauthenticated.
