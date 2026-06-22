# Incident Response and Rollback Runbook

Use this runbook for security, dependency, CI, deploy, route exposure, scanner, media, billing, entitlement, and rollback incidents across the six-app ecosystem.

## Incident Rules

- Stop the unsafe action first.
- Preserve evidence before changing state.
- Do not delete data, logs, artifacts, media, DB files, or reports unless approved.
- Do not rotate secrets unless approved by the incident owner.
- Do not run migrations, deploys, or rollback actions without approval unless the active incident policy already grants that authority.
- Do not add secret values to tickets, commit messages, docs, chat, or CI logs.

## Evidence To Capture

Capture as much of the following as applicable:

- App name and environment.
- Commit hash, branch, CI run, and deployment ID where available.
- Exact command or workflow that failed.
- Timestamp and timezone.
- Affected URL, route, or API path.
- HTTP status code and response shape.
- Dependency advisory identifiers and package chain where available.
- Screenshots only if they do not expose secrets or private data.
- Redacted logs.
- User, tenant, workspace, project, scan, media, report, or export identifiers where relevant.
- Rollback target commit or deployment.

## Dependency Regression Response

Trigger examples:

- New high or critical advisory appears.
- Production audit fails high threshold.
- Full audit fails high threshold.
- Previously cleared dependency chain regresses.

Response:

1. Stop the release or merge.
2. Capture audit output and package chain.
3. Confirm whether the advisory is production-impacting or dev-only.
4. Check whether a compatible upgrade exists.
5. Apply the smallest safe dependency remediation in a separate branch or commit.
6. Re-run app-local lint, typecheck, tests, build, verifiers, production audit, and full audit.
7. Update `DEPENDENCY_EXCEPTION_REGISTER.md` only for low/moderate residuals; do not accept high/critical findings there.

Manual approval required:

- Major framework upgrades.
- Lockfile policy changes.
- Any accepted high/critical risk exception.

## Leaked Secret Response

Trigger examples:

- Secret value appears in repository, CI logs, docs, generated output, screenshots, or chat.
- `.env` file is staged or committed.
- Deploy credential appears in a workflow.

Response:

1. Stop pushes, deploys, and release work.
2. Preserve evidence without copying the secret value into new locations.
3. Identify the affected secret type and exposure scope.
4. Remove the secret from the working tree or staged changes without deleting unrelated user data.
5. Request approval for rotation.
6. Rotate only after approval.
7. Invalidate affected sessions, tokens, or credentials where applicable.
8. Re-run secret scanning and repository status checks.

Manual approval required:

- Secret rotation.
- History rewriting.
- Credential revocation that can affect production.
- Customer or stakeholder notification.

## CI Failure Response

Trigger examples:

- Lint, typecheck, test, build, verifier, or audit gate fails.
- Workflow syntax or YAML parsing fails.
- PR workflow starts requiring a live external check.

Response:

1. Stop the app-specific commit or release.
2. Capture failing job, command, logs, and commit.
3. Confirm whether the failure is isolated to one app.
4. Fix workflow configuration only if the failure is caused by CI wiring.
5. Fix app behavior only through a separately reviewed source change.
6. Re-run local gates before committing CI changes.
7. Keep live/external checks release-only, manual, or environment-gated.

Manual approval required:

- Removing required gates.
- Adding secrets or deploy credentials to CI.
- Making live external checks normal PR blockers.

## Deploy Verification Failure Response

Trigger examples:

- Health endpoint fails.
- Route verifier fails against live target.
- Live app serves stale commit.
- Canonical host proof fails.
- Release-only verifier fails.

Response:

1. Stop rollout.
2. Capture live URL, status code, response body shape, commit, and deployment ID.
3. Check whether cache or CDN is serving stale content.
4. If stale cache is suspected, request approval for scoped cache purge.
5. If the wrong deployment is live, rollback to the last known good deployment.
6. Re-run post-deploy checks after rollback or redeploy.

Manual approval required:

- Deploy or rollback.
- Cache purge beyond narrow affected routes.
- Any migration or data repair.

## Live Route Exposure Response

Trigger examples:

- Authenticated route becomes public.
- Admin/operator route is accessible without authorization.
- Report, export, media, or artifact URL leaks data.
- Cross-tenant data appears in a response.

Response:

1. Stop deployment or disable the exposed route if an approved emergency control exists.
2. Capture route, status code, response shape, and authorization context.
3. Do not share private response bodies broadly.
4. Identify affected app boundary and data owner.
5. Roll back to last known good deployment if exposure is caused by recent release.
6. Add or repair route-level authorization tests before re-release.

Manual approval required:

- Customer notification.
- Data deletion.
- Broad access revocation.
- Emergency production config changes.

## Scanner SSRF Regression Response

Applies primarily to RatAiFy and AudAix.

Trigger examples:

- Scanner accepts private, loopback, metadata, link-local, or disallowed targets.
- Scanner follows redirects to prohibited network ranges.
- Scanner leaks internal response content.

Response:

1. Stop scanner jobs where possible.
2. Capture target URL, normalized URL, redirect chain, and rejection/acceptance behavior.
3. Disable or roll back the scanner release if regression is live.
4. Add regression cases for the rejected target class.
5. Re-run security verifier and scanner route tests.

Manual approval required:

- Production scanner disablement that affects customers.
- Broad queue cancellation.
- Any data deletion or report purge.

## Media Artifact Exposure Response

Applies primarily to CreVux.

Trigger examples:

- Uploaded media is publicly listable.
- Derived artifacts are accessible without authorization.
- Processing health exposes internal ffmpeg details.
- Media artifacts are staged in source control.

Response:

1. Stop release or disable public access path if an approved emergency control exists.
2. Capture affected URL, object key pattern, status code, and authorization state.
3. Do not delete uploaded media without approval.
4. Roll back recent deployment if exposure is release-related.
5. Repair upload, listing, download, or derived artifact authorization.
6. Re-run upload-safety tests and route/security verifiers.

Manual approval required:

- Media deletion.
- Bucket policy changes.
- Customer notification.
- Broad cache purge.

## Billing and Entitlement Failure Response

Applies primarily to Verixet.

Trigger examples:

- Entitled users lose access.
- Unentitled users gain access.
- API keys are visible or usable across tenants.
- Deploy gates allow unauthorized deploys.
- Billing route exposes private account state.

Response:

1. Stop release or rollback if the issue is release-related.
2. Capture account, tenant, entitlement, route, API key metadata, and authorization context without recording secret values.
3. Preserve billing and entitlement audit evidence.
4. Disable affected API key or deploy-gate path only with approval.
5. Repair authorization or entitlement logic in a reviewed source change.
6. Re-run Verixet security, route, environment, tests, build, and audit gates.

Manual approval required:

- Billing state mutation.
- API key revocation.
- Entitlement overrides.
- Customer notification.

## Rollback Steps

General rollback sequence:

1. Confirm rollback approval and incident owner.
2. Identify last known good commit and deployment.
3. Confirm no required database migration blocks rollback.
4. Roll back through the approved deployment system.
5. Verify health, route, auth, and app-specific release checks.
6. Confirm no stale deployment remains live.
7. Record rollback evidence and remaining risks.

Do not roll back across database or storage schema boundaries without manual review.

## Manual Approval Matrix

Manual approval is required for:

- Deploys.
- Rollbacks.
- Production migrations.
- Secret rotation.
- Credential revocation.
- Data deletion.
- Media/report/artifact deletion.
- Cache purges beyond narrow route scope.
- Billing or entitlement state changes.
- API key revocation.
- Scanner disablement that affects customers.
- Customer or stakeholder notification.
- Accepting any high or critical security risk.
