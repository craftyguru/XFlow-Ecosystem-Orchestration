# Subscription Tier CI Advisory Blocker

Date: 2026-07-09

## Run

- Repository: `craftyguru/XFlow-Ecosystem-Orchestration`
- Workflow: `Subscription Tier Proof Gate`
- Run ID: `29010953295`
- Run URL: `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29010953295`
- Event: `workflow_dispatch`
- Result: failed
- Classification: proof command failure

## Secret Status

`ECOSYSTEM_APP_REPO_READ_TOKEN` exists in the orchestration repo secrets list.

The previous missing-secret blocker is resolved. The run successfully reached all six private app repository checkout steps.

## What Passed

The workflow completed these CI bootstrap stages successfully:

- Root checkout
- `ECOSYSTEM_APP_REPO_READ_TOKEN` preflight
- Verixet checkout
- XFlow checkout
- WordGeni checkout
- CreVux checkout
- AudAiX checkout
- RatAiFy checkout
- Node setup
- Corepack enablement
- Nested app repository presence check
- Root dependency bootstrap
- npm app dependency bootstrap
- AudAiX dependency bootstrap
- WordGeni pnpm dependency bootstrap
- CreVux pnpm dependency bootstrap
- Report artifact upload

This rules out the previous private repository authentication failure, app repository materialization failure, Node version failure, AudAiX native build failure, and report artifact path failure for this run.

The six app proof wrapper commits were pushed before this run. CI found and executed the wrappers.

## Failure

The failing step was `Run subscription-tier proof gate`, which ran:

```text
npm run verify:subscription-tier
```

The generated report showed four app wrappers passing and two app wrappers failing:

| App | Result | Notes |
| --- | --- | --- |
| Verixet | passed | 77 focused Vitest tests, route type generation, and typecheck passed |
| XFlow | failed | focused Vitest tests passed; subscription proof typecheck failed |
| WordGeni | passed | focused API/web tests and typechecks passed |
| CreVux | failed | focused checks reached image-gen pricing typecheck and failed |
| AudAiX | passed | focused dashboard tests, local route proof, and typecheck passed |
| RatAiFy | passed | focused node tests and typecheck passed |

XFlow failure:

```text
agents/workflow-copilot-desktop/src/tauri.ts(1,24): error TS2307: Cannot find module '@tauri-apps/api/core' or its corresponding type declarations.
agents/workflow-copilot-desktop/vite.config.ts(2,19): error TS2307: Cannot find module '@vitejs/plugin-react' or its corresponding type declarations.
```

CreVux failure:

```text
[crevux:p3-proof] Failed: CreVux image-gen pricing typecheck
```

The CreVux typecheck output includes missing fresh-checkout declaration outputs such as `lib/api-client-react/dist/index.d.ts`, `lib/scene-interaction/dist/index.d.ts`, `lib/pro-settings-contract/dist/index.d.ts`, and `lib/cross-app-visual-companion/dist/index.d.ts`, plus image-gen `TS7006` implicit-any errors.

## Decision

No workflow fix was made in this pass.

The workflow is correctly checking out private app repositories, materializing the wrapper commits, and bootstrapping the currently configured root/app dependencies.

XFlow has a clear missing nested dependency surface for `agents/workflow-copilot-desktop`, but CreVux has both fresh-build declaration output issues and source typecheck errors from the app proof command. Because not all observed failures are proven workflow-only bootstrap defects, this pass documents the blocker rather than modifying app code, app wrappers, package files, or lockfiles.

## Recommended Next Step

Triage the two failing proof surfaces deliberately:

- XFlow: decide whether the advisory workflow should install `apps/XFlow/agents/workflow-copilot-desktop` with its lockfile before running the root proof gate, or whether the XFlow proof wrapper should avoid typechecking that unrelated desktop package.
- CreVux: decide whether the advisory workflow should run an explicit fresh-checkout library build before the proof wrapper, or whether the CreVux proof wrapper/typecheck scope should be narrowed to the subscription proof surface.

After those proof-surface decisions are made, rerun the advisory workflow.

## Final Status

Root status before this report update was clean. This report update is the only root task-owned change.

Six app repository working trees remained clean. The app repositories were pushed to publish existing commits only; no new app commits were created.

## Safety Confirmation

No production code, app logic, app wrappers, package files, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, CI required status, runtime behavior, dependency installs, dependency rebuilds, or app internals were changed.
