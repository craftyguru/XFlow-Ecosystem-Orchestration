# Subscription Tier CI Advisory Workflow Fix Proof

Date: 2026-07-09

## Scope

This report documents the first manual dispatch of the advisory `Subscription Tier Proof Gate` workflow and the workflow-only bootstrap fix made afterward.

No production app code, app wrappers, package files, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, runtime behavior, required CI status configuration, or app internals were changed.

## Run Inspected

Workflow:

```text
Subscription Tier Proof Gate
```

Run:

```text
29008153781
```

URL:

```text
https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29008153781
```

Event:

```text
workflow_dispatch
```

Result:

```text
failure
```

## Result Classification

Classification: private repo auth failure.

The workflow checked out the root orchestration repo successfully, then failed at the first private sibling app checkout:

```text
Checkout Verixet
Not Found - https://docs.github.com/rest/repos/repos#get-a-repository
```

All later checkout, Node setup, dependency bootstrap, proof command, and app wrapper steps were skipped. The generated report artifact upload step succeeded by uploading the root report already present in the checkout.

This was not a Node version failure, npm/pnpm dependency bootstrap failure, AudAiX native build failure, proof wrapper failure, report artifact failure, or missing provider/Stripe/staging/production secret failure.

## Root Cause

The root workflow used `actions/checkout@v4` to check out private sibling app repos with the default root `GITHUB_TOKEN`. That token has read access to `craftyguru/XFlow-Ecosystem-Orchestration`, but it does not automatically have read access to private sibling repos such as `craftyguru/verixet`.

GitHub returns `Not Found` for private repositories when the token lacks access, so the first app repo checkout failed before the workflow could materialize the six app repos.

## Fix Applied

Changed only:

```text
.github/workflows/subscription-tier-proof-gate.yml
```

The workflow now:

- Adds a `Verify private app repo checkout token` step immediately after root checkout.
- Requires a repository secret named `ECOSYSTEM_APP_REPO_READ_TOKEN`.
- Fails early with a clear diagnostic if that secret is missing.
- Passes `${{ secrets.ECOSYSTEM_APP_REPO_READ_TOKEN }}` to all six app repo checkout steps.

The token should be read-only and scoped to contents access for:

- `craftyguru/verixet`
- `craftyguru/xflowx`
- `craftyguru/WordGeni`
- `craftyguru/Crevux`
- `craftyguru/AudAiX`
- `craftyguru/Rataify`

## Why Scope Stayed CI-Only

The failure happened before any app repo was checked out, before Node setup, before dependency bootstrap, and before the proof command ran. The failure was entirely in workflow authentication for private repo materialization.

No app code or proof wrapper change was needed.

## Follow-Up Required

Before rerunning the workflow, add this secret to `craftyguru/XFlow-Ecosystem-Orchestration`:

```text
ECOSYSTEM_APP_REPO_READ_TOKEN
```

Then rerun:

```powershell
gh workflow run "Subscription Tier Proof Gate" --repo craftyguru/XFlow-Ecosystem-Orchestration
gh run list --repo craftyguru/XFlow-Ecosystem-Orchestration --workflow "Subscription Tier Proof Gate" --limit 5
```

If the token is configured correctly, the next classification point will move to dependency bootstrap or proof execution.

## Commands Run

- `git status --short`
- `git branch -vv`
- `git remote -v`
- `git push`
- `gh workflow run "Subscription Tier Proof Gate" --repo craftyguru/XFlow-Ecosystem-Orchestration`
- `gh run list --repo craftyguru/XFlow-Ecosystem-Orchestration --workflow "Subscription Tier Proof Gate" --limit 5`
- `gh run watch 29008153781 --repo craftyguru/XFlow-Ecosystem-Orchestration --exit-status`
- `gh run view 29008153781 --repo craftyguru/XFlow-Ecosystem-Orchestration --log`
- `gh run view 29008153781 --repo craftyguru/XFlow-Ecosystem-Orchestration --json databaseId,status,conclusion,url,createdAt,updatedAt,event,workflowName,jobs`
- `git status --short` in all six app repos

No local installs, dependency rebuilds, migrations, broad CI, app tests, provider/live checks, browser checks, staging checks, or production checks were run.

## Final Root Status

At report creation time, root status contained only task-owned changes:

```text
 M .github/workflows/subscription-tier-proof-gate.yml
?? docs/subscription-tier-ci-advisory-workflow-fix-proof.md
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

## Advisory Confirmation

The workflow remains advisory. Branch protection, required status checks, deployment behavior, live provider checks, Stripe checks, staging checks, and production checks were not changed.
