# Subscription Tier CI Advisory Workflow Proof

Date: 2026-07-09

## Scope

This pass added one advisory/manual GitHub Actions workflow for the six-app subscription-tier proof gate and this root proof report. It did not make the check required, edit branch protection, add deploy behavior, add provider/live checks, or modify production app code.

## Workflow Added

Path:

```text
.github/workflows/subscription-tier-proof-gate.yml
```

Workflow name:

```text
Subscription Tier Proof Gate
```

## Triggers

The workflow is configured for:

- `workflow_dispatch`
- `pull_request`

It is advisory first. No branch protection or required status configuration was changed. For pull requests, the proof step is marked with `continue-on-error` so a first-run bootstrap/proof failure is surfaced as an advisory warning instead of becoming a required blocker. Manual `workflow_dispatch` runs are allowed to fail normally.

## Node Version

The workflow uses:

```text
22.18.0
```

This matches the local passing runtime used during the CI readiness audit and satisfies the app `engines.node >=22.18.0` requirements observed in the app package manifests.

## Nested App Repo Handling

The root repository ignores `apps/` and does not declare the app repos as submodules. The workflow therefore checks out each app repo explicitly into the expected path:

| App | Repository | Path |
| --- | --- | --- |
| Verixet | `craftyguru/verixet` | `apps/Verixet` |
| XFlow | `craftyguru/xflowx` | `apps/XFlow` |
| WordGeni | `craftyguru/WordGeni` | `apps/WordGeni` |
| CreVux | `craftyguru/Crevux` | `apps/CreVux` |
| AudAiX | `craftyguru/AudAiX` | `apps/AudAix` |
| RatAiFy | `craftyguru/Rataify` | `apps/RatAiFy` |

After checkout, the workflow verifies that each expected nested repo directory contains `.git`. If any app repo is missing, it fails with a diagnostic explaining that the six app repos must be materialized under `apps/<AppName>` before `npm run verify:subscription-tier` can run.

## Bootstrap Strategy

The workflow uses lockfile-respecting installs:

- Root: `npm ci --ignore-scripts --no-audit --no-fund` only when `package-lock.json` exists.
- Verixet: `npm ci --prefix apps/Verixet --no-audit --no-fund`.
- XFlow: `npm ci --prefix apps/XFlow --no-audit --no-fund`.
- RatAiFy: `npm ci --prefix apps/RatAiFy --no-audit --no-fund`.
- AudAiX root: `npm ci --prefix apps/AudAix --no-audit --no-fund`.
- AudAiX dashboard: `npm ci --prefix apps/AudAix/dashboard --no-audit --no-fund`.
- WordGeni: `corepack prepare pnpm@9.15.0 --activate`, then `pnpm --dir apps/WordGeni install --frozen-lockfile`.
- CreVux: `corepack prepare pnpm@10.30.3 --activate`, then `pnpm --dir apps/CreVux install --frozen-lockfile`.

The AudAiX install path intentionally allows the normal npm install lifecycle so the native `better-sqlite3` binary required by the wrapper can be available in CI.

## Proof Command

The workflow runs the canonical root command:

```text
npm run verify:subscription-tier
```

This delegates to:

```text
node scripts/verify-subscription-tier-p3-gate.mjs
```

## Artifact Behavior

The verifier writes:

```text
docs/subscription-tier-p3-recurring-proof-gate-report.md
```

The workflow uploads that report with `actions/upload-artifact@v4` when present. It does not commit generated reports from CI.

## Advisory-Only Rationale

The workflow is intentionally not required yet because the first CI runs need to prove:

- Cross-repo app checkout works from the root workflow context.
- Node 22.18.0 works on the selected runner.
- npm and pnpm app installs complete from lockfiles.
- AudAiX native dependency bootstrap is compatible with `ubuntu-latest`.
- The generated report artifact is useful enough for triage.

After repeated green runs, this workflow can be promoted in a separate pass by removing or adjusting pull-request advisory behavior and then considering branch protection outside repository file changes.

## Commands Run

- `git status --short`
- `git status --short` inside `apps/Verixet`, `apps/XFlow`, `apps/WordGeni`, `apps/CreVux`, `apps/AudAix`, and `apps/RatAiFy`
- `Get-ChildItem .github/workflows`
- `Get-Content -Raw .github/workflows/ecosystem-proof.yml`
- `node -e` package script inspection for root `package.json`
- `Get-Content -Raw docs/subscription-tier-ci-promotion-readiness-audit.md`
- `Get-Content -Raw scripts/verify-subscription-tier-p3-gate.mjs`
- `Get-Content -Raw` for all six app subscription-tier wrapper scripts
- `Test-Path` checks for AudAiX dashboard and app lockfiles
- `node --check scripts/verify-subscription-tier-p3-gate.mjs`
- `Get-Content -Raw .github/workflows/subscription-tier-proof-gate.yml`
- `git diff --check -- .github/workflows/subscription-tier-proof-gate.yml`

`npm run verify:subscription-tier` was not run in this pass because the change was limited to adding an advisory CI workflow and this report; no package files or subscription proof-gate files were changed.

No local installs, dependency rebuilds, broad CI, all-app suites, migrations, package-manager purges, provider/live checks, browser checks, staging checks, or production checks were run.

## Final Root Status

At report creation time, root status contained only task-owned untracked files:

```text
?? .github/workflows/subscription-tier-proof-gate.yml
?? docs/subscription-tier-ci-advisory-workflow-proof.md
```

## Final Six-App Repo Status

All six app repos were clean at inspection time:

| App | Status |
| --- | --- |
| Verixet | clean |
| XFlow | clean |
| WordGeni | clean |
| CreVux | clean |
| AudAiX | clean |
| RatAiFy | clean |

## No-Mutation Confirmation

This pass did not modify production code, package files, lockfiles, dependency state, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, runtime behavior, package manifests, app wrappers, subscription proof-gate files, or app internals. It did not run installs, dependency rebuilds, native rebuilds, migrations, package-manager purges, broad CI, all-app tests, provider/live checks, browser proof, staging checks, or production checks.
