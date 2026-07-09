# Subscription Tier CI Advisory Blocker

Date: 2026-07-09

## Run

- Repository: `craftyguru/XFlow-Ecosystem-Orchestration`
- Workflow: `Subscription Tier Proof Gate`
- Run ID: `29009794233`
- Run URL: `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29009794233`
- Event: `workflow_dispatch`
- Result: failed
- Classification: app repo checkout/materialization blocker

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

This rules out the previous private repository authentication failure, Node version failure, npm/pnpm bootstrap failure, AudAiX native build failure, and report artifact path failure for this run.

## Failure

The failing step was `Run subscription-tier proof gate`, which ran:

```text
npm run verify:subscription-tier
```

The generated report classified all six wrappers as missing:

```text
Missing wrapper: apps/Verixet/scripts/verify-subscription-tier-proof.mjs
Missing wrapper: apps/XFlow/scripts/verify-subscription-tier-proof.mjs
Missing wrapper: apps/WordGeni/scripts/verify-subscription-tier-proof.mjs
Missing wrapper: apps/CreVux/scripts/verify-subscription-tier-proof.mjs
Missing wrapper: apps/AudAix/scripts/verify-subscription-tier-proof.mjs
Missing wrapper: apps/RatAiFy/scripts/verify-subscription-tier-proof.mjs
```

The local app repositories contain those wrapper files, but their current local branches are ahead of the corresponding remote branches used by the workflow:

| App | Local branch state |
| --- | --- |
| Verixet | `main...origin/main [ahead 8]` |
| XFlow | `master...origin/master [ahead 1]` |
| WordGeni | `main...origin/main [ahead 1]` |
| CreVux | `main...origin/main [ahead 1]` |
| AudAiX | `main...origin/main [ahead 1]` |
| RatAiFy | `main...origin/main [ahead 1]` |

Therefore the CI workflow is checking out clean remote app repositories that do not yet include the proof wrapper commits required by the root verifier.

## Decision

No workflow fix was made in this pass.

The workflow is correctly checking out private app repositories and bootstrapping dependencies. The next blocker is publication/materialization of the app-level proof wrapper commits into the app remotes or an intentional workflow change to check out known wrapper branches/SHAs.

Because this involves app repository publication strategy, this pass does not modify app code, app wrappers, package files, or lockfiles.

## Recommended Next Step

Publish or otherwise materialize the app wrapper commits used by the local proof gate:

- Push the app branches that contain `scripts/verify-subscription-tier-proof.mjs`, or
- Merge those wrapper commits into each app's remote default branch, or
- Update the advisory workflow to check out explicit known-good app refs if default branches are not the intended CI source.

After the app wrapper commits are available to CI, rerun the advisory workflow.

## Final Status

Root status before this report was clean. This report is the only root task-owned change.

Six app repository working trees remained clean. The app repositories were inspected only for branch/tracking state and wrapper-file tracking.

## Safety Confirmation

No production code, app logic, app repositories, app wrappers, package files, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, CI required status, runtime behavior, dependency installs, dependency rebuilds, or app internals were changed.
