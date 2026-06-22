# Phase 2 Observability Remediation

Source of truth: `K:\XFlow-Ecosystem Workspace\PHASE2_BASELINE.md`

Scope: Sentry / OpenTelemetry / Rollup / UUID dependency chain only. No migrations, deploys, pushes, secret rotation, data deletion, telemetry removal, or unrelated dependency-chain upgrades were performed.

## Affected Apps

Planned app order printed before editing:

1. XFlow
2. Verixet
3. WordGeni
4. AudAix

Baseline notes:

- `XFlow`: high production risk through Sentry/Rollup plus OpenTelemetry and UUID advisories.
- `Verixet`: moderate Sentry/OpenTelemetry chain.
- `WordGeni`: high OpenTelemetry Prometheus/exporter chain and Sentry/OpenTelemetry paths.
- `AudAix`: moderate observability path, with remaining OpenTelemetry inherited through Lighthouse tooling; Lighthouse is explicitly out of scope unless separately approved.
- `RatAiFy`: baseline notes UUID via storage/bull, not Sentry; this is a storage/UUID chain and was not edited in this observability pass.
- `CreVux`: baseline notes a moderate OpenTelemetry item, but the current worktree already has unrelated TensorFlow/Drizzle/Vitest changes; no direct root Sentry/OpenTelemetry package tree was found by the read-only package query, so it was not edited in this pass.

## XFlow

Status: complete; safe to commit for the observability scope.

### Usage Analysis

- Sentry is runtime observability for Next.js server, edge, and browser error reporting.
- `@sentry/node` is used by `src/lib/observability/sentry-node.ts` through a guarded dynamic import.
- Browser Sentry initialization only reads public `NEXT_PUBLIC_SENTRY_*` values.
- Redaction is covered by `tests/unit/sentry-observability.test.ts`.

### Versions

| Package/path | Before | After |
| --- | --- | --- |
| `@sentry/nextjs` | `8.55.0` | `10.58.0` |
| `@sentry/node` | `8.55.0` | `10.58.0` |
| Sentry `@opentelemetry/core` path | `1.30.1` | `2.8.0` |
| Sentry `@opentelemetry/instrumentation` path | `0.57.x` | `0.214.0` |
| Sentry `rollup` path | `3.29.5` | `4.62.0` |
| Sentry webpack plugin `uuid` path | `9.0.1` | cleared; plugin upgraded to `@sentry/webpack-plugin@5.3.0` |

### Files Changed

- `apps\XFlow\package.json`
- `apps\XFlow\package-lock.json`
- `apps\XFlow\instrumentation.ts`
- `apps\XFlow\instrumentation-client.ts`
- `apps\XFlow\next.config.ts`
- `apps\XFlow\sentry.client.config.ts` removed after moving browser initialization to `instrumentation-client.ts`.

### Compatibility Changes

- Added Next/Sentry request error hook: `onRequestError = Sentry.captureRequestError`.
- Added Next/Sentry router transition hook in `instrumentation-client.ts`.
- Moved existing browser Sentry initialization from `sentry.client.config.ts` to `instrumentation-client.ts`.
- Replaced removed Sentry config option `hideSourceMaps` with `sourcemaps.deleteSourcemapsAfterUpload`.
- Source maps remain disabled unless `SENTRY_AUTH_TOKEN` is present; when upload is enabled, uploaded source maps are deleted after upload.

### Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Dirty only for XFlow observability files listed above. |
| `npm install @sentry/nextjs@10.58.0 @sentry/node@10.58.0` | Passed; Sentry packages upgraded, no unrelated direct packages changed. |
| `npm run lint` | Passed with existing warnings in `ChronicleSourcesClient.tsx` and Next `<img>` usage. |
| `npm run typecheck` | Passed. |
| `npm test -- --run tests/unit/sentry-observability.test.ts` | Passed: 7 tests. |
| `npm test` | Passed: 542 files passed, 1 skipped; 2646 tests passed, 2 skipped. |
| `npm run verify:security` | Passed. |
| `npm run verify:routes` | Passed: 412 expected App Router files present. |
| `npm run verify:env` | Passed; existing low warnings only for example/public env values. |
| `npm run build` | Passed; no Sentry startup/config warnings after compatibility update. |
| `npm audit --omit=dev --audit-level=high` | Passed for high severity; remaining production items are moderate Next/PostCSS, out of scope. |
| `npm audit --audit-level=high` | Failed only because out-of-scope Vite/Vitest/esbuild high/critical advisories remain. |

### Advisories Cleared

- Sentry/Rollup high path from `@sentry/nextjs`.
- Sentry/OpenTelemetry moderate paths under `@sentry/node`, `@sentry/opentelemetry`, and `@sentry/vercel-edge`.
- Sentry webpack plugin `uuid < 11.1.1` path.

### Advisories Remaining

- Full audit still reports Vite/Vitest/esbuild high/critical advisories. These are unrelated and explicitly out of scope for this remediation.
- Production audit still reports moderate Next/PostCSS advisories. Next/PostCSS is explicitly out of scope for this remediation.

### Schema, Data, and Deployment Impact

- No migrations generated or run.
- No schema changes.
- No deploys.
- No pushes.
- No secret rotation.
- No production data or media changes.
- No telemetry removal.

## Verixet

Status: complete; safe to commit for the observability scope.

### Usage Analysis

- Sentry is runtime observability for Next.js server, edge, and browser error reporting.
- Existing `src\instrumentation.ts` imports server and edge Sentry configs based on `NEXT_RUNTIME`.
- Existing `src\instrumentation-client.ts` initializes browser Sentry only from public Sentry env values and already exports `onRouterTransitionStart`.
- Existing `next.config.ts` only uploads source maps when release-upload env vars and `SENTRY_AUTH_TOKEN` are present, and deletes source maps after upload.

### Versions

| Package/path | Before | After |
| --- | --- | --- |
| `@sentry/nextjs` | `9.47.1` | `10.58.0` |
| Sentry `@sentry/node` path | `9.47.1` | `10.58.0` |
| Sentry `@sentry/opentelemetry` path | `9.47.1` | `10.58.0` |
| Sentry `@opentelemetry/core` path | `1.30.1` and `2.8.0` mixed | `2.8.0` |
| Sentry `@opentelemetry/instrumentation` path | `0.57.2` | `0.214.0` |
| Sentry `rollup` path | `4.60.4` | `4.60.4` |
| Sentry webpack plugin `uuid` path | `11.1.1` via existing override | no vulnerable Sentry UUID path |

### Files Changed

- `apps\Verixet\package.json`
- `apps\Verixet\package-lock.json`

### Compatibility Changes

- No source code or config changes were required.
- Existing Sentry 10-compatible request and router hooks were preserved.
- Existing source-map upload gating and deletion behavior was preserved.

### Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Dirty only for `package.json` and `package-lock.json`. |
| `npm install @sentry/nextjs@10.58.0` | Passed; Sentry package tree upgraded. |
| `npm run lint` | Passed with existing unused-symbol warnings. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 576 files passed, 3 skipped; 2120 tests passed, 26 skipped. |
| `npm run verify:security` | Passed; high-level audit step reported only out-of-scope moderate Swagger/js-yaml advisory. |
| `npm run verify:routes` | Passed: route inventory and API/control-plane contracts passed. |
| `npm run verify:env` | Passed. |
| `npm run build` | Passed with existing lint warnings. |
| `npm audit --omit=dev --audit-level=high` | Passed; only moderate Swagger/js-yaml advisory remains. |
| `npm audit --audit-level=high` | Passed; only moderate Swagger/js-yaml advisory remains. |

### Advisories Cleared

- Sentry/OpenTelemetry moderate paths from `@sentry/nextjs`, `@sentry/node`, and `@sentry/vercel-edge`.
- OpenTelemetry core baggage advisory paths under the Sentry tree.

### Advisories Remaining

- Moderate `swagger-ui-react -> js-yaml` advisory remains in production and full audits. It is unrelated to the observability chain and requires a breaking Swagger downgrade per npm audit, so it was not changed.

### Schema, Data, and Deployment Impact

- No migrations generated or run.
- No schema changes.
- No deploys.
- No pushes.
- No secret rotation.
- No production data changes.
- No telemetry removal.

Previous observed versions before edit:

- `@sentry/nextjs@9.47.1`
- `@sentry/node@9.47.1`
- `@sentry/opentelemetry@9.47.1`
- Sentry webpack plugin path already uses `uuid@11.1.1` through existing override.
- Sentry Rollup path resolves to Rollup 4.x.
- Remaining concern is OpenTelemetry `1.30.1` under Sentry paths.

## WordGeni

Status: complete; safe to commit for the observability scope.

### Usage Analysis

- Sentry is used by the API, worker, and web app for optional runtime error reporting.
- API and worker Sentry initialization sets `skipOpenTelemetrySetup: true`; direct OTLP tracing is handled by `apps\api\src\observability\otel-node.ts` and `apps\worker\src\observability\otel-node.ts`.
- Web Sentry is loaded through `apps\web\src\observability\load-sentry-nextjs.ts`, with request-error handling in `src\instrumentation.ts` and browser initialization in `src\instrumentation-client.ts`.
- Browser Sentry only initializes when a public DSN is present.
- Web source maps remain disabled through `next.config.mjs` Sentry config.

### Versions

| Package/path | Before | After |
| --- | --- | --- |
| Root `@sentry/opentelemetry` | `9.47.1` | `10.58.0` |
| Root `@opentelemetry/core` peer path | `1.30.1` | `2.8.0` |
| Root `@opentelemetry/resources` peer path | `1.30.1` | `2.8.0` |
| Root `@opentelemetry/sdk-trace-base` peer path | `1.30.1` | `2.8.0` |
| `apps\api` `@sentry/node` | `^9.47.0` | `^10.58.0` |
| `apps\api` `@opentelemetry/exporter-trace-otlp-http` | `^0.57.0` | `^0.219.0` |
| `apps\api` `@opentelemetry/resources` | `^1.30.0` | `^2.8.0` |
| `apps\api` `@opentelemetry/sdk-node` | `^0.57.0` | `^0.219.0` |
| `apps\api` `@opentelemetry/semantic-conventions` | `^1.28.0` | `^1.41.1` |
| `apps\worker` `@sentry/node` | `^9.47.0` | `^10.58.0` |
| `apps\worker` `@opentelemetry/exporter-trace-otlp-http` | `^0.57.0` | `^0.219.0` |
| `apps\worker` `@opentelemetry/resources` | `^1.30.0` | `^2.8.0` |
| `apps\worker` `@opentelemetry/sdk-node` | `^0.57.0` | `^0.219.0` |
| `apps\worker` `@opentelemetry/semantic-conventions` | `^1.28.0` | `^1.41.1` |
| `apps\web` `@sentry/nextjs` | `^9.47.0` | `^10.58.0` |
| `apps\web` `@sentry/opentelemetry` | `^9.47.1` | `^10.58.0` |

### Files Changed

- `apps\WordGeni\package.json`
- `apps\WordGeni\pnpm-lock.yaml`
- `apps\WordGeni\apps\api\package.json`
- `apps\WordGeni\apps\api\src\observability\otel-node.ts`
- `apps\WordGeni\apps\worker\package.json`
- `apps\WordGeni\apps\worker\src\observability\otel-node.ts`
- `apps\WordGeni\apps\web\package.json`

### Compatibility Changes

- Replaced OpenTelemetry 1.x `new Resource(...)` usage with OpenTelemetry 2.x `resourceFromAttributes(...)` in API and worker OTLP initialization.
- No Sentry behavior was removed.
- API and worker still skip Sentry OpenTelemetry auto-setup and continue to use the explicit OTLP `NodeSDK`.
- No source-map policy changes.

### Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Dirty only for WordGeni observability package/config files listed above. |
| `pnpm add -w @sentry/opentelemetry@10.58.0` | Passed. |
| `pnpm --filter @wordgeni/web add @sentry/nextjs@10.58.0 @sentry/opentelemetry@10.58.0` | Passed. |
| `pnpm --filter @wordgeni/api add @sentry/node@10.58.0 @opentelemetry/exporter-trace-otlp-http@0.219.0 @opentelemetry/resources@2.8.0 @opentelemetry/sdk-node@0.219.0 @opentelemetry/semantic-conventions@1.41.1` | Passed. |
| `pnpm --filter @wordgeni/worker add @sentry/node@10.58.0 @opentelemetry/exporter-trace-otlp-http@0.219.0 @opentelemetry/resources@2.8.0 @opentelemetry/sdk-node@0.219.0 @opentelemetry/semantic-conventions@1.41.1` | Passed. |
| `pnpm add -w @opentelemetry/core@2.8.0 @opentelemetry/resources@2.8.0 @opentelemetry/sdk-trace-base@2.8.0` | Passed; patched root Sentry peer resolution. |
| `pnpm run lint` | Passed with existing warnings only. |
| `pnpm run typecheck` | Passed after the OpenTelemetry 2.x resource compatibility fix. |
| `pnpm test` | Passed: turbo test completed successfully across 15 tasks. |
| `pnpm run verify:security` | Passed: production-proof and typecheck passed. |
| `pnpm run verify:env` | Passed; optional env names reported missing only as optional values. |
| `pnpm run verify:routes` | Passed: route contract tests 24/24. |
| `pnpm run build` | Passed. |
| `pnpm audit --prod --audit-level high` | Passed; low/moderate advisories remain. |
| `pnpm audit --audit-level high` | Passed; low/moderate advisories remain. |

### Advisories Cleared

- Production OpenTelemetry core baggage advisory under direct API/worker OTLP SDK paths.
- Production OpenTelemetry core baggage advisory under root and web Sentry/OpenTelemetry paths.
- Production Sentry/OpenTelemetry advisory paths under `@sentry/node`, `@sentry/nextjs`, and `@sentry/opentelemetry`.

### Advisories Remaining

- Production low/moderate advisories remain outside this remediation scope: `jsondiffpatch`, `ai`, `postcss`, `ip-address`, Temporal `uuid`, `qs`, `@ai-sdk/provider-utils`, `brace-expansion`, `esbuild`, `js-yaml`, `@babel/core`, and `markdown-it`.
- Full audit still reports a dev/tooling OpenTelemetry moderate path through `lighthouse -> @sentry/node@9.47.1`; Lighthouse is explicitly out of scope for this remediation.

### Schema, Data, and Deployment Impact

- No migrations generated or run.
- No schema changes.
- No deploys.
- No pushes.
- No secret rotation.
- No production data changes.
- No telemetry removal.

Previous observed versions before edit:

- Root `@sentry/opentelemetry@9.47.1`
- `apps\web` `@sentry/nextjs@9.47.1`, `@sentry/opentelemetry@9.47.1`
- `apps\api` and `apps\worker` use OpenTelemetry packages around `0.57.x` / `1.30.x` and `@sentry/node@9.47.x`
- UUID paths include Temporal `uuid@11.1.0` and dev `@types/uuid -> uuid@14.0.0`.

## AudAix

Status: not edited; not safe to commit for this observability pass.

Current observed state:

- Worktree already has unrelated Vite/esbuild/Vitest changes from a prior task. Those changes must not be mixed with observability remediation.
- Direct/root `@sentry/node` resolves to `10.58.0`.
- Remaining observed OpenTelemetry path comes through `lighthouse@12.8.2 -> @sentry/node@9.47.1`, but Lighthouse is explicitly out of scope for this remediation unless separately approved.
- `npm audit --omit=dev --audit-level=high` passed with 17 moderate Lighthouse/Sentry/OpenTelemetry findings.
- `npm audit --audit-level=high` passed with 17 moderate Lighthouse/Sentry/OpenTelemetry findings.
- `npm audit` suggests a breaking Lighthouse change/downgrade-style fix path (`lighthouse@12.6.1`) and `audit fix --force`; neither was run.

Handling:

- Do not edit AudAix observability dependencies until the unrelated Vite worktree state is resolved or a clearly scoped observability-only path is available.
- Separate approval is required before touching Lighthouse.
- No AudAix package install, lint, typecheck, tests, build, or commit was run for this task because no scoped package edit was made and the only remaining path is Lighthouse/out-of-scope.

## RatAiFy

Status: not edited; no observability-chain commit.

- Baseline notes UUID advisories through storage/bull packages, not Sentry/OpenTelemetry/Rollup.
- Worktree already has unrelated dirty package files.
- Read-only package query did not show a direct app-root Sentry/OpenTelemetry/Rollup package tree.
- `verify:env` has a known `RELEASE_VERIFY_BASE_URL` prerequisite from the baseline if a future RatAiFy pass is approved.
- Treat this as the separate Storage / UUID / retry chain unless explicitly approved for this observability remediation.

## CreVux

Status: not edited; no observability-chain commit.

- Baseline notes a moderate OpenTelemetry item, while CreVux is primarily tracked in Phase 2 for TensorFlow/tfjs-node/tar and other separate chains.
- Worktree already has unrelated dirty TensorFlow/Drizzle/Vitest files.
- Read-only package query did not show a direct app-root Sentry/OpenTelemetry/Rollup package tree.
- No CreVux package install, lint, typecheck, tests, build, or commit was run for this task because no scoped observability edit was made.

## Manual Approvals Needed

- Approval is required before touching Lighthouse-driven observability paths, because the user explicitly excluded Lighthouse from this chain unless the baseline proves inseparability.
- Approval is required before broad major migrations that change telemetry behavior, source-map publication policy, or client/server config boundaries.
- Approval is required before treating RatAiFy storage/bull UUID advisories as part of this observability remediation instead of the separate Storage / UUID / retry chain.
