# Phase 2 TensorFlow / tfjs-node / tar Remediation

Date: 2026-06-17

Primary app: `K:\XFlow-Ecosystem Workspace\apps\CreVux`

Source documents:

- `K:\XFlow-Ecosystem Workspace\PHASE2_BASELINE.md`
- `K:\XFlow-Ecosystem Workspace\CREVUX_PHASE1_REMEDIATION.md`

Scope kept to TensorFlow / tfjs-node / tar and directly required compatibility files. No migrations, schema changes, media artifact deletions, secret rotations, deploys, pushes, auth changes, billing changes, entitlement changes, credit policy changes, media visibility changes, upload policy changes, public artifact policy changes, or storage policy changes were performed.

## Usage Analysis

TensorFlow is production runtime for CreVux API source-enhancement/model processing, not stale and not dev-only.

- `@workspace/api-server` declares `@tensorflow/tfjs-node`, `@tensorflow/tfjs`, `@tensorflow/tfjs-core`, `@tensorflow-models/face-detection`, `@tensorflow-models/face-landmarks-detection`, and MediaPipe face packages in production dependencies.
- `artifacts/api-server/src/registerTensorflowNode.ts` registers `@tensorflow/tfjs-node` during API bootstrap and adjusts Windows `PATH` so native TensorFlow bindings can load.
- `artifacts/api-server/src/lib/sourceEnhanceFaceMeshRuntime.ts` dynamically loads `@tensorflow/tfjs` and `@tensorflow-models/face-landmarks-detection` for FaceMesh-based source enhancement.
- `artifacts/api-server/build.mjs` treats TensorFlow and MediaPipe packages as API-server build externals.

The code intentionally keeps `tfjs-node` installed while running FaceMesh on the `cpu` backend because the native backend does not provide every image kernel used by the model stack.

## Audit-Before-Edit Findings

| Item | Finding |
| --- | --- |
| Current `@tensorflow/tfjs-node` | 4.22.0 |
| Current `@tensorflow/tfjs` | 4.22.0 |
| Current `@tensorflow/tfjs-core` | 4.22.0 |
| Vulnerable `tar` path | `@workspace/api-server -> @tensorflow/tfjs-node@4.22.0 -> tar@6.2.1` |
| Secondary vulnerable `tar` path | `@workspace/api-server -> @tensorflow/tfjs-node@4.22.0 -> @mapbox/node-pre-gyp@1.0.9 -> tar@6.2.1` |
| Package pulling `tar` | `@tensorflow/tfjs-node` directly and via `@mapbox/node-pre-gyp` |
| TensorFlow import/registration files | `artifacts/api-server/src/registerTensorflowNode.ts`; `artifacts/api-server/src/lib/sourceEnhanceFaceMeshRuntime.ts`; `artifacts/api-server/scripts/verify-face-mesh-load.ts`; `artifacts/api-server/scripts/verify-tfjs-node-register.mjs` |
| Media/model tests covering this path | `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-face-mesh-load.ts`; `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-tfjs-node-register.mjs`; `pnpm --filter @workspace/api-server run test:upload-safety`; API/image-gen unit suites |
| Expected files to edit | `package.json`, `pnpm-lock.yaml`; compatibility file only if install/test resolution required it |

`@tensorflow/tfjs-node@4.23.0-rc.0` was checked and still declares `tar ^6.2.1`, so a TensorFlow package upgrade did not clear the advisory chain.

## Chosen Remediation Path

Path 2: patched `tar` override, with install/build/model/test proof.

The root `package.json` `pnpm.overrides` block now pins `tar` to `7.5.16`. That resolved both TensorFlow production paths to patched `tar` without removing TensorFlow, changing runtime model behavior, or moving TensorFlow out of production dependencies.

`artifacts/image-gen/vitest.config.ts` was also updated with explicit `esbuild` JSX automatic-runtime settings. This was a compatibility fix required after pnpm recalculated Vitest/Vite peer bindings during the install; without it, `.test.tsx` files emitted classic `React` references and the image-gen unit suite failed with `ReferenceError: React is not defined`.

## Package Versions

| Package | Before | After |
| --- | --- | --- |
| `@tensorflow/tfjs-node` | 4.22.0 | 4.22.0 |
| `@tensorflow/tfjs` | 4.22.0 | 4.22.0 |
| `@tensorflow/tfjs-core` | 4.22.0 | 4.22.0 |
| `tar` in TensorFlow production path | 6.2.1 | 7.5.16 |

## Files Changed

TensorFlow/tar remediation files:

- `package.json`
- `pnpm-lock.yaml`
- `artifacts/image-gen/vitest.config.ts`

Pre-existing uncommitted Drizzle remediation files still present before this work:

- `lib/db/package.json`
- `pnpm-lock.yaml`

The mixed `pnpm-lock.yaml` state was separated during cleanup on 2026-06-18. Drizzle was committed first from a staged Drizzle-only lockfile slice, then the TensorFlow/tar lockfile changes were committed separately.

## Compatibility Risks

- `tar` moved from major 6 to major 7 under `@tensorflow/tfjs-node` and `@mapbox/node-pre-gyp`. This is a transitive major override, so native install/model proof was required.
- `pnpm install` completed with the existing TensorFlow model peer warnings:
  - missing `@tensorflow/tfjs-backend-webgl`
  - missing `@tensorflow/tfjs-converter`
  - `@tensorflow-models/face-landmarks-detection` peer range expects `@tensorflow/tfjs-core ^3.12.0` while CreVux uses `4.22.0`
- The FaceMesh smoke passed after the override, proving the current Node model-loading path still completes.
- The test harness required explicit JSX automatic-runtime configuration after pnpm recalculated Vitest/Vite peer resolution. This does not change product runtime behavior.

## Commands Run And Results

| Command | Result |
| --- | --- |
| `git status --short` | Showed pre-existing `lib/db/package.json` and `pnpm-lock.yaml` changes before TensorFlow work |
| `pnpm install` | Passed; refreshed install state |
| `pnpm install --lockfile-only --resolution-only` | Used during override placement checks |
| `pnpm list tar --depth 8 --filter @workspace/api-server` | Final graph shows `@tensorflow/tfjs-node -> tar@7.5.16` and `@tensorflow/tfjs-node -> @mapbox/node-pre-gyp -> tar@7.5.16` |
| `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-tfjs-node-register.mjs` | Passed |
| `pnpm --filter @workspace/api-server exec tsx ./scripts/verify-face-mesh-load.ts` | Passed; FaceMesh model pipeline completed |
| `pnpm --filter @workspace/api-server run test:upload-safety` | Passed; upload safety policy verified |
| `pnpm run lint` | Passed with existing warnings only |
| `pnpm run typecheck` | Passed |
| `pnpm test` | Initially failed in image-gen tests with `ReferenceError: React is not defined`; passed after scoped Vitest JSX runtime compatibility fix |
| `pnpm run verify:security` | Passed |
| `pnpm run verify:env` | Passed |
| `pnpm run build` | Passed |
| `pnpm audit --prod --audit-level high` | Passed; 17 vulnerabilities remain below high threshold: 2 low, 15 moderate |
| `pnpm audit --audit-level high` | Passed; 20 vulnerabilities remain below high threshold: 3 low, 17 moderate |

## Audit Outcome

Production audit high status: cleared.

Full audit high status: cleared.

The TensorFlow/tfjs-node/tar production high chain is no longer reported by `pnpm audit --prod --audit-level high`.

Remaining advisories are low/moderate only and are outside this TensorFlow/tar scope.

## Manual Approvals Still Needed

- If the team does not want a transitive `tar` major override under TensorFlow native install tooling, approve carrying an explicit production dependency exception instead. Current verification supports keeping the override.

## Commit Status

Committed as `9bf1e60 deps(crevux): remediate tensorflow tar chain`.

Final cleanup decision: preserve and commit the TensorFlow/tar remediation after the Drizzle lockfile changes were separated and committed as `61550eb deps(crevux): upgrade drizzle packages`.

Final CreVux TensorFlow/tar files committed:

- `artifacts/image-gen/vitest.config.ts`
- `package.json`
- `pnpm-lock.yaml`

Current CreVux status after remediation: clean.

TensorFlow/tar remediation is commit-safe based on the completed gates. No migrations, deploys, pushes, secret rotation, production data deletion, media artifact deletion, auth changes, billing changes, entitlement changes, credit policy changes, media visibility changes, upload policy changes, public artifact policy changes, storage policy changes, or unrelated dependency upgrades were performed.
