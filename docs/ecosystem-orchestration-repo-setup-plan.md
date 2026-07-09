# Ecosystem Orchestration Repo Setup Plan

Date: 2026-07-09

## Current State

The root workspace is a local Git repository with committed orchestration history, but it has no GitHub remote configured.

Current branch:

```text
master
```

Recent root commits include the subscription-tier proof gate docs, root verifier, package script promotion, refreshed recurring reports, CI readiness audit, and advisory workflow.

Root remote status:

```text
origin remote missing
```

## Why The Root Repo Needs Its Own GitHub Remote

The root workspace now owns ecosystem orchestration assets that do not belong inside any one app repository:

- Root proof scripts.
- Ecosystem proof and planning docs.
- Subscription-tier recurring proof reports.
- The canonical package script `npm run verify:subscription-tier`.
- The advisory GitHub Actions workflow for the six-app subscription-tier proof gate.
- Cross-app orchestration decisions and CI promotion reports.

Without a root GitHub remote, GitHub Actions cannot run the advisory workflow because there is no repository hosting `.github/workflows/subscription-tier-proof-gate.yml`. The six app repos are independent app source repositories; they should not own the root orchestration workflow.

## Recommended Repo Name

Recommended GitHub repository name:

```text
XFlow-Ecosystem-Orchestration
```

Alternate acceptable names:

- `XFlow-Ecosystem`
- `xflow-ecosystem-orchestration`
- `ecosystem-proof-orchestration`

`XFlow-Ecosystem-Orchestration` is the clearest name because this repo coordinates the six apps rather than replacing their app repos.

## What The Root Repo Should Track

The root orchestration repo should track:

- `.github/workflows/subscription-tier-proof-gate.yml`
- Root scripts under `scripts/`
- Root docs under `docs/`
- Root package files needed for orchestration commands:
  - `package.json`
  - `package-lock.json`
- Root proof config/assets that are intentionally part of orchestration.
- `.gitignore` and other root-only repository metadata.

## What Should Stay In The Six App Repos

The root orchestration repo should not track full app source trees:

- `apps/Verixet`
- `apps/XFlow`
- `apps/WordGeni`
- `apps/CreVux`
- `apps/AudAix`
- `apps/RatAiFy`

Those remain independent GitHub repos with their own package manifests, lockfiles, schemas, migrations, app code, wrappers, and runtime behavior.

## App Tracking Boundary Verification

The root `.gitignore` intentionally ignores `apps/`:

```text
.gitignore:79:apps/ apps
```

Root app tracking check:

```text
git ls-files apps
```

Result: no tracked files under `apps/`.

This means the root repo is ready to push as an orchestration repository without accidentally publishing the full app repos.

## Advisory Workflow App Checkout Model

The advisory workflow should continue checking out each app repo explicitly into the expected local path:

| App | GitHub repo | Root workflow path |
| --- | --- | --- |
| Verixet | `craftyguru/verixet` | `apps/Verixet` |
| XFlow | `craftyguru/xflowx` | `apps/XFlow` |
| WordGeni | `craftyguru/WordGeni` | `apps/WordGeni` |
| CreVux | `craftyguru/Crevux` | `apps/CreVux` |
| AudAiX | `craftyguru/AudAiX` | `apps/AudAix` |
| RatAiFy | `craftyguru/Rataify` | `apps/RatAiFy` |

The root workflow should not rely on submodules because the root repo currently has no `.gitmodules`, and the apps are intentionally ignored by root.

## Private Repo Checkout Tokens

The app repos are private. A root GitHub Actions workflow that checks out private sibling repos may need a token with read access to all six app repositories.

Recommended approach:

- Create a fine-grained GitHub token or GitHub App installation token with read-only `contents` access to:
  - `craftyguru/verixet`
  - `craftyguru/xflowx`
  - `craftyguru/WordGeni`
  - `craftyguru/Crevux`
  - `craftyguru/AudAiX`
  - `craftyguru/Rataify`
- Store it as a root orchestration repo secret, for example:

```text
ECOSYSTEM_APP_REPO_READ_TOKEN
```

Then the workflow checkout steps can add:

```yaml
token: ${{ secrets.ECOSYSTEM_APP_REPO_READ_TOKEN }}
```

Do not add provider, Stripe, staging, production, database, or deployment secrets to the subscription-tier proof workflow. The gate is local subscription proof only.

## Exact Manual GitHub Setup Commands

Run these from the root workspace after creating the empty GitHub repo.

Recommended repository:

```text
https://github.com/craftyguru/XFlow-Ecosystem-Orchestration.git
```

Commands:

```powershell
git status --short
git remote -v
git remote add origin https://github.com/craftyguru/XFlow-Ecosystem-Orchestration.git
git remote -v
git push -u origin master
```

If GitHub creates the repo with a default `main` branch and you want root to use `main`, rename before pushing:

```powershell
git branch -m master main
git remote add origin https://github.com/craftyguru/XFlow-Ecosystem-Orchestration.git
git push -u origin main
```

After the first push:

```powershell
gh workflow list --repo craftyguru/XFlow-Ecosystem-Orchestration
gh workflow run "Subscription Tier Proof Gate" --repo craftyguru/XFlow-Ecosystem-Orchestration
gh run list --repo craftyguru/XFlow-Ecosystem-Orchestration --workflow "Subscription Tier Proof Gate" --limit 5
```

If private app checkout fails, add `ECOSYSTEM_APP_REPO_READ_TOKEN` to the root repo secrets and update the app checkout steps in a scoped workflow-only follow-up.

## Readiness Decision

The root repo is ready to become the main ecosystem orchestration GitHub repo after a remote is created and pushed.

The root repo is not currently able to run GitHub Actions because it has no remote. That is a repository hosting/setup issue, not a proof-gate or app-code issue.

## Commands Run For This Plan

- `git status --short`
- `git remote -v`
- `git branch --show-current`
- `git log --oneline -10`
- `Get-Content -Raw .gitignore`
- `Get-Content -Raw .github/workflows/subscription-tier-proof-gate.yml`
- `Get-Content -Raw scripts/verify-subscription-tier-p3-gate.mjs`
- Root `package.json` script inspection
- `git check-ignore -v apps apps/Verixet apps/XFlow apps/WordGeni apps/CreVux apps/AudAix apps/RatAiFy`
- `git ls-files apps`
- `git ls-files package.json package-lock.json .github/workflows/subscription-tier-proof-gate.yml scripts/verify-subscription-tier-p3-gate.mjs docs/subscription-tier-ci-promotion-readiness-audit.md`
- `git status --short` in all six app repos

No installs, dependency rebuilds, migrations, broad CI, app tests, provider checks, staging checks, production checks, or app commands were run.

## Final Root Status

At plan creation time, root status contained only this task-owned untracked doc:

```text
?? docs/ecosystem-orchestration-repo-setup-plan.md
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

This pass did not modify production app code, app repos, package manifests, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, app wrappers, runtime behavior, or app internals. It did not run installs, dependency rebuilds, migrations, broad CI, or app tests.
