# Subscription Tier CI PR Check Promotion Plan

Date: 2026-07-09

## Current State

The `Subscription Tier Proof Gate` workflow has passed twice in advisory manual dispatch mode:

| Run | Result | URL |
| --- | --- | --- |
| `29012168195` | passed | `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29012168195` |
| `29012945455` | passed | `https://github.com/craftyguru/XFlow-Ecosystem-Orchestration/actions/runs/29012945455` |

The workflow file is `.github/workflows/subscription-tier-proof-gate.yml`.

## Pull Request Trigger

The workflow already has a `pull_request` trigger:

```yaml
on:
  workflow_dispatch:
  pull_request:
```

No trigger change is required to start PR coverage.

For pull request events, the proof step currently remains advisory:

```yaml
continue-on-error: ${{ github.event_name == 'pull_request' }}
```

That means PR runs can surface failures without making the workflow a blocking required check yet.

## Readiness

The workflow is ready to collect pull request coverage because the latest advisory runs prove:

- `ECOSYSTEM_APP_REPO_READ_TOKEN` exists and can read the six private app repos.
- All six app repos materialize at the expected `apps/<AppName>` paths.
- Node `22.18.0` setup works.
- Root, npm app, AudAiX, WordGeni, and CreVux dependency bootstrap works.
- `npm run verify:subscription-tier` runs all six focused wrappers successfully.
- The recurring proof report uploads as an artifact.

## Recommendation

Leave the workflow behavior as-is for now.

It already runs on `pull_request`, and it is intentionally non-required/advisory. Do not change branch protection yet.

Wait for either:

- one successful real PR run, or
- a third successful manual advisory run,

before considering manual branch-protection configuration.

After that, decide whether to keep the PR check advisory for more soak time or make it required manually in GitHub branch protection.

## Implementation Options

Option A: leave as-is.

- Recommended now.
- No workflow change is needed because `pull_request` already exists.
- The check remains advisory because the proof step uses PR-only `continue-on-error`.

Option B: add or adjust `pull_request` trigger if it is missing.

- Not needed in the current workflow.
- Use this only if the trigger is later removed or narrowed too far.

Option C: later configure branch protection manually after a successful PR run.

- Do not do this yet.
- After a successful real PR run, configure GitHub branch protection manually if the team wants the check to block merges.
- Keep generated reports as artifacts; do not have CI commit regenerated reports.

## Risks

- Private repo token expiry: `ECOSYSTEM_APP_REPO_READ_TOKEN` can expire, lose access, or be rotated without updating the orchestration repo secret.
- App repo branch drift: each app checkout follows that app repo's default branch, so wrapper or dependency drift can affect the gate.
- Dependency/bootstrap time: recent successful runs took about 7 minutes, which is acceptable for advisory PR coverage but should be watched before making it required.
- Native AudAiX dependency: AudAiX dependency install has passed, but native dependency compatibility remains a promotion risk to monitor across runner image changes.

## Final Status

Root status after the second-pass report push was clean.

Six app repository statuses:

| App | Status |
| --- | --- |
| Verixet | clean |
| XFlow | clean |
| WordGeni | clean |
| CreVux | clean |
| AudAiX | clean |
| RatAiFy | clean |

## No-Mutation Confirmation

This pass only documents the conservative promotion plan. It does not modify production app code, app repositories, app wrappers, package files, lockfiles, schemas, migrations, Stripe logic, checkout flows, entitlement behavior, app internals, package manifests, branch protection, required status checks, or workflow behavior.
