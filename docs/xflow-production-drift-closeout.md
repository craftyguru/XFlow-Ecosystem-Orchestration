# XFlow Production Drift Closeout

Date: 2026-07-11

## Expected Commit

`960b5eff27f07b8bb9db83146422095855d7feec`

Evidence:

- `git -C apps/XFlow rev-parse HEAD`
- `git -C apps/XFlow rev-parse --abbrev-ref --symbolic-full-name @{u}` -> `origin/master`
- `git -C apps/XFlow rev-list --left-right --count @{u}...HEAD` -> `0 0`

## Currently Observed Production Commit

`af5a494da0c1b292815dffcd771e663f7cc76751`

Evidence:

- `curl https://xflowx.com/api/health`
- `curl https://xflowx.com/api/ready`

Both endpoints reported the same deployment commit on 2026-07-11.

## Reliability Of Reported Commit

The reported commit is reliable enough for release gating because both `/api/health` and `/api/ready` expose the same value through XFlow deployment metadata. The value depends on deployment environment variables populated by the host, so final release proof should still confirm the deployment provider record after redeploy.

## Likely Cause

The repository contains newer pushed commits after `af5a494`, including `960b5ef` (`Narrow XFlow subscription proof wrapper`). There is no repository evidence of an explicit production pin to `af5a494`. The likely cause is a stale production deployment, skipped auto-deploy, or a deployment provider still serving an older successful release.

## Safe Redeployment Procedure

Do not redeploy without explicit approval.

1. Confirm release owner approval for XFlow production.
2. Confirm target branch is `master` and expected commit is `960b5eff27f07b8bb9db83146422095855d7feec`.
3. Confirm `apps/XFlow` is clean and synced with `origin/master`.
4. Confirm latest CI/security checks for the expected commit are acceptable.
5. Confirm rollback target is the previous known healthy deployment, currently observed as `af5a494da0c1b292815dffcd771e663f7cc76751`.
6. Trigger the approved Railway/GitHub deployment mechanism for XFlow only.
7. Do not run migrations, credential changes, data cleanup, or provider calls as part of this redeploy unless separately approved.

## Verification Procedure After Deployment

1. Run `curl https://xflowx.com/api/health`.
2. Run `curl https://xflowx.com/api/ready`.
3. Confirm both endpoints return HTTP 200.
4. Confirm both endpoints expose commit `960b5eff27f07b8bb9db83146422095855d7feec`.
5. Confirm reported environment is the approved target environment.
6. Capture request IDs and timestamps.
7. Review deployment logs for unexplained 5xx responses, auth failures, stale build output, and secret-looking values.
8. Run approved authenticated XFlow smoke only after separate approval.

## Rollback Procedure

1. Stop rollout immediately if health, readiness, auth, control-plane, or commit proof fails.
2. Preserve evidence: target URL, observed commit, expected commit, status codes, response bodies, request IDs, logs, and timestamp.
3. Redeploy the previous known healthy XFlow deployment or rollback commit through the approved deployment system.
4. Re-run `/api/health` and `/api/ready`.
5. Confirm the failed deployment is no longer live.
6. Document incident cause and follow-up owner.

## Documentation-Only Pinning Legitimacy

Documentation-only pinning is not legitimate for this drift unless there is explicit repository or release-owner evidence that production was intentionally pinned to `af5a494da0c1b292815dffcd771e663f7cc76751`. No such evidence was found during this cleanup phase.

## Final Status

`REDEPLOY REQUIRED`
