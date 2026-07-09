# Subscription Tier CI Promotion Readiness Audit

Date: 2026-07-09

## Scope

This is an audit-only CI promotion readiness pass for the canonical six-app subscription-tier proof gate. No CI files, package files, app wrappers, app code, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, runtime behavior, subscription proof-gate files, or app internals were changed.

## Current Local Gate Result

Canonical command run from the XFlow-Ecosystem workspace root:

```text
npm run verify:subscription-tier
```

Result: passed.

The command invoked `node scripts/verify-subscription-tier-p3-gate.mjs`, ran all six app wrappers, and regenerated `docs/subscription-tier-p3-recurring-proof-gate-report.md`.

Per-app result from this pass:

| App | Result | Duration ms |
| --- | --- | ---: |
| Verixet | passed | 10028 |
| XFlow | passed | 9226 |
| WordGeni | passed | 15819 |
| CreVux | passed | 66912 |
| AudAiX | passed | 36226 |
| RatAiFy | passed | 7397 |

Approximate local wall-clock runtime: 147 seconds.

## CI Readiness Decision

Decision: ready only as advisory/manual CI first.

The proof gate itself is stable enough to run in CI, but it is not ready to become a required pull-request check until CI bootstrap is made explicit for the nested app repositories and their app-local dependency trees.

Main blockers to required CI:

- The root repo ignores `apps/`, and `.gitmodules` is absent. A normal root checkout will not materialize the six nested app repos unless the workflow checks them out explicitly or uses a prepared workspace image.
- Existing root CI uses Node 20, while the app manifests inspected in this pass declare `engines.node >=22.18.0`, and the local passing run used Node `v22.18.0`.
- The wrappers execute app-local binaries from each app's own `node_modules`; root `npm ci` alone is not enough.
- The apps use mixed package managers: npm for Verixet, XFlow, AudAiX, RatAiFy, and pnpm for WordGeni and CreVux.
- AudAiX requires a native `better-sqlite3` binary at `apps/AudAix/node_modules/better-sqlite3/build/Release/better_sqlite3.node`; CI must install/build it through the normal dependency install path before the wrapper runs.
- The verifier writes `docs/subscription-tier-p3-recurring-proof-gate-report.md`. In CI this report should be uploaded as an artifact or inspected in logs, not committed by CI.

## Proposed CI Command

After checkout and dependency bootstrap:

```text
npm run verify:subscription-tier
```

Do not run broad CI, provider checks, browser checks, staging checks, production checks, migrations, live Stripe verification, app-wide test suites, or package upgrades as part of this subscription-tier CI job.

## Proposed Workflow Trigger

Recommended first phase:

- `workflow_dispatch`

Recommended second phase after repeated green advisory runs:

- `pull_request`
- `push` to `main` or `master`

Do not make the check required immediately. Promote it to required only after CI dependency bootstrap has passed repeatedly from a clean runner and the generated report handling is settled.

## Recommended Node Version

Use Node `22.18.0` or a compatible Node 22 patch version that satisfies `>=22.18.0`.

Reasons:

- Current local passing runtime: `v22.18.0`.
- App manifests inspected in this pass declare `engines.node >=22.18.0`.
- Existing `.github/workflows/ecosystem-proof.yml` uses Node 20, which is not the right baseline for this gate.

## Dependency And Bootstrap Requirements

Root:

- Use npm for the root command because `package.json` defines `verify:subscription-tier` and `package-lock.json` exists.
- A minimal root setup can use `npm ci --ignore-scripts` if the workflow needs root dependencies for consistency, but the proof command mainly delegates into the app wrappers.

App repos:

- Verixet: checkout into `apps/Verixet`; run npm install/bootstrap from its `package-lock.json`.
- XFlow: checkout into `apps/XFlow`; run npm install/bootstrap from its `package-lock.json`.
- WordGeni: checkout into `apps/WordGeni`; use pnpm `9.15.0` from its `packageManager` field and `pnpm-lock.yaml`.
- CreVux: checkout into `apps/CreVux`; use pnpm `10.30.3` from its `packageManager` field and `pnpm-lock.yaml`; honor its `.npmrc` and runtime checks.
- AudAiX: checkout into `apps/AudAix`; run npm install/bootstrap from its `package-lock.json`; ensure the dashboard dependency tree exists under `apps/AudAix/dashboard`; ensure the native `better-sqlite3` binary is produced by the normal install path.
- RatAiFy: checkout into `apps/RatAiFy`; run npm install/bootstrap from its `package-lock.json`.

Use Corepack or explicit package-manager setup for pnpm apps. Because WordGeni and CreVux require different pnpm versions, pin pnpm per app step rather than assuming one global pnpm version is safe for both.

## App Repo Boundary And Checkout Concerns

The root repo does not track app contents as normal root files and does not declare submodules. `git check-ignore` reports the `apps/` directory is ignored by the root `.gitignore`, while each app path is a separate nested git repo locally.

CI must therefore do one of the following before running the gate:

- Check out each app repo into the exact expected path under `apps/`.
- Or run from a prepared workspace artifact/image that already contains the six app repos at those paths.

The gate should keep nested repo awareness. It captures root status and app repo status separately. CI triage should treat an app checkout/install failure as infrastructure/bootstrap failure, not as a subscription product failure.

Current nested app repo heads inspected locally:

| App | Local HEAD | Origin |
| --- | --- | --- |
| Verixet | `49cafa2` | `https://github.com/craftyguru/verixet.git` |
| XFlow | `0e52cd2` | `https://github.com/craftyguru/xflowx.git` |
| WordGeni | `70c91ca` | `https://github.com/craftyguru/WordGeni.git` |
| CreVux | `b44929d` | `https://github.com/craftyguru/Crevux.git` |
| AudAiX | `94e8d8d2` | `https://github.com/craftyguru/AudAiX.git` |
| RatAiFy | `4154c18` | `https://github.com/craftyguru/Rataify.git` |

## Secrets And Environment Variables

The canonical subscription-tier proof gate should not require secrets or live provider environment variables. The wrappers run focused local tests, typechecks, local static proof scripts, and local route proof scripts.

Do not add Stripe live keys, provider credentials, staging URLs, production URLs, database migration credentials, browser auth fixtures, or deployment tokens to this CI job.

## Generated Report Handling

`npm run verify:subscription-tier` regenerates:

```text
docs/subscription-tier-p3-recurring-proof-gate-report.md
```

For CI:

- Upload the regenerated markdown report as a workflow artifact.
- Do not have CI commit it.
- Do not make the job fail merely because this generated report changes the CI working tree.
- If a future required CI job needs a clean working tree assertion, adjust the verifier/report strategy in a separate code change first.

For local recurring proof:

- Continue committing refreshed report changes intentionally after local proof runs when the proof trail needs to be current.

## Expected Runtime

The proof command itself took about 147 seconds locally in this pass. On a clean CI runner, dependency installation will dominate runtime. After dependencies are cached, expect the proof execution to be roughly 3 to 5 minutes, with CreVux and AudAiX being the slowest app wrappers.

Treat first-run cold bootstrap as a separate measurement before making this required on pull requests.

## Failure Triage

If CI fails before an app wrapper starts:

- Check nested app checkout paths first.
- Check Node version.
- Check npm/pnpm bootstrap and lockfile handling.
- Check native dependency build availability for AudAiX.

If a wrapper reports missing required local proof files or binaries:

- Treat it as dependency-layout or proof-surface drift.
- Do not patch around it with ad hoc installs inside the verifier.
- Fix the owning app repo or CI bootstrap path.

If a focused test/typecheck fails:

- Triage inside the owning app repo.
- Keep the failure scoped to the focused subscription-tier proof surface.

If only the generated recurring report changed:

- In CI, upload it as artifact.
- Locally, commit it only in a scoped report-refresh commit.

## What Should Not Be Included In CI Yet

Do not include these in the initial subscription-tier CI job:

- Broad CI or all-app test suites.
- Browser/Playwright proof.
- Provider/live checks.
- Staging or production checks.
- Stripe live verification or Stripe mutation commands.
- Checkout, portal, invoice, payment, or entitlement mutation flows.
- Migrations or schema changes.
- Package upgrades, lockfile rewrites, dependency rebuild experiments, or package-manager purges.
- CI changes that also alter unrelated existing ecosystem proof workflows.

## Final Root Status

At report creation time, root status contained:

```text
 M docs/subscription-tier-p3-recurring-proof-gate-report.md
?? docs/subscription-tier-ci-promotion-readiness-audit.md
```

The recurring report was modified by the required local verifier run and is intentionally not part of this audit commit.

## Final Six-App Repo Status

All six app repos were clean after the local gate run:

| App | Status |
| --- | --- |
| Verixet | clean |
| XFlow | clean |
| WordGeni | clean |
| CreVux | clean |
| AudAiX | clean |
| RatAiFy | clean |

## No-Mutation Confirmation

This pass did not modify production code, package files, lockfiles, dependency state, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, CI config, subscription proof-gate files, app wrappers, or app internals. It did not run installs, dependency rebuilds, native rebuilds, migrations, package-manager purges, broad CI, all-app tests, provider/live checks, browser proof, staging checks, or production checks.
