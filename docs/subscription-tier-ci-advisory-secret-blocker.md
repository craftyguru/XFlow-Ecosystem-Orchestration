# Subscription Tier CI Advisory Secret Blocker

Date: 2026-07-09

## Scope

This report documents the post-fix push and secret check for the advisory `Subscription Tier Proof Gate` workflow in `craftyguru/XFlow-Ecosystem-Orchestration`.

No production app code, app repos, app wrappers, package files, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, runtime behavior, required CI status configuration, or app internals were changed.

## Push Result

The local workflow/private-repo-token fix commit was pushed successfully:

```text
d76716a91edcf0aec5c5d09d481599b5ac82fa87
```

Remote:

```text
https://github.com/craftyguru/XFlow-Ecosystem-Orchestration.git
```

Branch:

```text
main -> origin/main
```

## Secret Check

Required secret:

```text
ECOSYSTEM_APP_REPO_READ_TOKEN
```

Check run:

```text
gh secret list --repo craftyguru/XFlow-Ecosystem-Orchestration
```

Result: no secrets were returned.

Classification: missing env/secrets.

The advisory workflow was not rerun because the required private app repo checkout token is missing or unavailable to the workflow. Rerunning without this secret would fail at the explicit preflight added in `.github/workflows/subscription-tier-proof-gate.yml`.

## Manual Setup Required

Add the repository secret manually:

1. Open `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration`.
2. Go to `Settings`.
3. Go to `Secrets and variables`.
4. Go to `Actions`.
5. Click `New repository secret`.
6. Name:

```text
ECOSYSTEM_APP_REPO_READ_TOKEN
```

7. Value: a fine-grained GitHub PAT or GitHub App token with read-only `Contents` access to all six private app repos:

- `craftyguru/verixet`
- `craftyguru/xflowx`
- `craftyguru/WordGeni`
- `craftyguru/Crevux`
- `craftyguru/AudAiX`
- `craftyguru/Rataify`

Do not add Stripe keys, provider credentials, staging URLs, production URLs, database credentials, deployment credentials, or other live secrets to this workflow.

## Next Verification Command

After the secret exists, rerun:

```powershell
gh workflow run "Subscription Tier Proof Gate" --repo craftyguru/XFlow-Ecosystem-Orchestration
gh run list --repo craftyguru/XFlow-Ecosystem-Orchestration --workflow "Subscription Tier Proof Gate" --limit 5
```

Then inspect the latest run logs and classify the next result. Expected next possible categories are private repo auth failure, Node version failure, npm/pnpm bootstrap failure, AudAiX native build failure, proof command failure, artifact upload/report path failure, or passed.

## Commands Run

- `git status --short`
- `git branch -vv`
- `git log --oneline -3`
- `git remote -v`
- `git status --short` inside all six app repos
- `git push`
- `gh secret list --repo craftyguru/XFlow-Ecosystem-Orchestration`
- `gh run list --repo craftyguru/XFlow-Ecosystem-Orchestration --workflow "Subscription Tier Proof Gate" --limit 3`

No local installs, dependency rebuilds, migrations, broad CI, app tests, provider/live checks, browser checks, staging checks, production checks, or workflow dispatch rerun were performed after the missing secret was identified.

## Final Root Status

At report creation time, root status contained only this task-owned untracked blocker report:

```text
?? docs/subscription-tier-ci-advisory-secret-blocker.md
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
