# RatAiFy Production Deployment Plan

Date: 2026-07-02

Recommendation: no-go until Phase 5C staging authenticated browser/API proof passes and the Phase 5D blockers are cleared or formally accepted by the accountable owner.

This plan is an approval packet only. It does not deploy RatAiFy, apply production migrations, mutate production environment variables, enable action families, perform destructive cleanup, mutate billing or entitlements, mutate tenant/org lifecycle state, rotate API keys, retry webhooks, mutate provider credentials, impersonate users, perform deployment/control-plane actions, or execute export/download flows.

## Deployment Summary

RatAiFy has completed several local hardening and documentation phases, but production deployment approval is blocked. The current production rollout readiness decision is no-go because Phase 5C stopped at staging preflight. The deployment sequence below is therefore conditional and must not be executed until the approval checklist is complete.

Current readiness status:

- Phase 5C staging proof: blocked at preflight.
- Phase 5D rollout readiness: no-go.
- Production target classification: not performed.
- Production environment presence review: not performed.
- Staging migration verification: not proven.
- Rollback plan: documented but not rehearsed.
- Destructive/export/download controls: documented as disabled or unapproved.

## Scope

Included in the deployment scope after blockers clear:

- Admin/superadmin truthfulness hardening.
- SuperAdminRoute denied UX.
- Support-thread hardening.
- Legacy support deprecation and telemetry.
- Feature flag readiness.
- Contact readiness.
- Read-only admin/superadmin proof surfaces.
- Developer/webhook overview.
- Secret display truthfulness.
- Scan/evidence read-only explorer.
- Public API documentation truthfulness.
- Report/export truthfulness.
- Safe action framework.
- Staging proof artifacts, if completed and sanitized.

Excluded from this deployment:

- Billing mutation.
- Entitlement mutation.
- Tenant/org lifecycle mutation.
- API-key rotation.
- Webhook retry.
- Provider credential mutation.
- Impersonation.
- Deployment/control-plane mutation.
- Data purge.
- Destructive actions.
- Actual export generation/download unless separately approved.
- Broad RBAC rewrite.

## Required Approvals

| approval | required before deployment? | status | approver |
| --- | --- | --- | --- |
| Engineering approval | yes | blocked | TBD |
| Product/owner approval | yes | blocked | TBD |
| Security approval | yes | blocked | TBD |
| Data/privacy approval for support/contact/export data | yes | blocked | TBD |
| Rollback owner assigned | yes | blocked | TBD |
| Monitoring owner assigned | yes | blocked | TBD |
| Final go/no-go approver | yes | blocked | TBD |

## Production Preflight

All checks below must be complete before deployment approval:

| check | required result | current status |
| --- | --- | --- |
| Production target identified | Target category recorded without printing values. | blocked |
| Staging proof complete | Phase 5C authenticated browser/API proof passed. | blocked |
| Production env vars present by name only | Presence reviewed without values. | blocked |
| Secrets not printed | No values in docs, logs, or evidence. | partial |
| Database backup available | Backup/snapshot verified with restore access. | blocked |
| Migration rollback/restore plan confirmed | Owner accepts restore strategy. | partial |
| Action disable switches documented | Switch names and desired posture recorded. | partial |
| Destructive actions confirmed disabled | Registry/UI/runtime posture verified in staging. | partial |
| Monitoring/logging confirmed | Logs, alerts, audit capture verified. | blocked |
| Audit events confirmed | Support, flag, contact, export request audit rows verified. | blocked |
| Legacy route telemetry confirmed | Support/contact compatibility telemetry verified. | blocked |
| Support/contact/export redaction confirmed | Evidence scan completed after staging proof. | blocked |

## Migration Plan

Do not apply production migrations in this phase.

| file/name | additive or destructive | staging applied? | production required? | backup required? | rollback/restore plan | expected runtime impact | verification query or check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `migrations/0013_feature_flag_lifecycle.sql` | additive columns on `feature_flags` | not proven | yes if flag archive/deprecate ships | yes | Restore from pre-migration backup if needed; otherwise leave inert columns after app rollback. | Low DDL impact expected; verify on staging first. | Confirm `feature_flags.lifecycle_state` and `feature_flags.archived_at` exist. |
| `migrations/0014_contact_admin_lifecycle.sql` | additive columns on `admin_messages` | not proven | yes if contact archive/assign ships | yes | Restore from pre-migration backup if needed; otherwise leave inert columns after app rollback. | Low DDL impact expected; verify FK behavior on staging. | Confirm `admin_messages.archived`, `archived_at`, `assigned_admin_id`, and `assigned_at` exist. |
| `migrations/0015_report_export_request_tracking.sql` | additive table and indexes | not proven | yes if report/export request tracking ships | yes | Restore from pre-migration backup if needed; table can remain inert after app rollback if safe. | New metadata-only table; no export file generation. | Confirm `report_export_requests` exists and status/scope indexes exist. |

## Deployment Sequence

These steps are not executed in Phase 5E.

1. Confirm deployment freeze window and rollback owner.
2. Confirm monitoring owner and incident channel.
3. Confirm production target category without printing values.
4. Confirm production env var presence by name only.
5. Confirm all production action-disable switches are set to the approved posture.
6. Confirm destructive/export/download actions remain disabled.
7. Confirm database backup/snapshot and restore access.
8. Confirm staging proof and staging migration verification passed.
9. Apply additive migrations only if explicitly approved.
10. Deploy backend artifact.
11. Deploy frontend artifact.
12. Run non-destructive smoke checks.
13. Run admin/superadmin read-only checks.
14. Run safe-action checks only if explicitly approved and disable switches are in the approved posture.
15. Verify export/download execution remains disabled unless separately approved.
16. Monitor logs, audit events, and alert channels.
17. Keep the observation window open.

## Validation Sequence

Run these after deployment only after approval:

- Route verification.
- Auth smoke test.
- Superadmin access denied test.
- Audit log redaction check.
- Support action smoke check.
- Feature flag smoke check.
- Contact action smoke check.
- Developer secret display check.
- Scan/evidence read-only check.
- Public API docs check.
- Export/download disabled check.
- Legacy support telemetry check.

Recommended local/CI commands before approval:

- `npm run verify:routes`
- `npm run typecheck`
- `npm run lint`
- `npm run verify:security`
- `npm run test:ops`
- `git diff --check`

## Rollback Sequence

1. Disable admin/superadmin mutation switches for support, feature flags, contacts, export requests, developer credentials, scan mutations, user/org mutations, local billing mutations, and control-plane mutations.
2. Revert frontend to the last known good artifact.
3. Revert backend to the last known good artifact.
4. Re-run read-only health, route, auth, and admin access-denied checks.
5. If the issue is migration-related, restore from the verified pre-migration backup after owner approval.
6. If audit/logging is impaired, revert to read-only mode and keep mutation switches disabled until audit capture is restored.
7. If accidental sensitive/private data exposure is suspected, disable the affected route family, preserve sanitized incident metadata, rotate affected credentials through their owning authority, and avoid writing exposed values into tickets or docs.
8. If legacy route behavior causes incidents, route-gate the compatibility surface after confirming customer impact and telemetry.

## Monitoring Sequence

Watch during deployment and the observation window:

- HTTP access logs and error rates.
- Auth/session failures.
- Superadmin denied access errors.
- Support mutation failures.
- Feature flag mutation failures.
- Contact mutation failures.
- Export request attempts and any export/download execution attempt.
- Developer credential and webhook errors.
- Legacy support route telemetry.
- Contact route telemetry.
- Audit events for support, feature flags, contacts, developer credentials, export requests, and denied actions.
- Secret redaction alerts if available.
- Sentry or equivalent error stream.
- Slack/ops alert channels if configured.

Observation window:

- Minimum: 2 hours after deployment.
- Extend to 24 hours if any admin/superadmin mutation is approved for production use.
- Keep rollback owner and monitoring owner available for the full window.

## Final Approval

Go/no-go recommendation: no-go.

Required sign-offs before changing to go:

- Engineering approval.
- Product/owner approval.
- Security approval.
- Data/privacy approval for support/contact/export data.
- Rollback owner.
- Monitoring owner.
- Final go/no-go approver.

Unresolved blockers:

- Phase 5C staging proof did not pass.
- Production target classification is missing.
- Production env presence review is missing.
- Staging migration application and verification are missing.
- Runtime monitoring/audit capture is not proven in staging.
- Rollback is not rehearsed in staging.

Accepted risks:

- None recorded.

Deferred items:

- Billing mutation.
- Entitlement mutation.
- Tenant/org lifecycle mutation.
- API-key rotation.
- Webhook retry.
- Provider credential mutation.
- Impersonation.
- Deployment/control-plane mutation.
- Data purge and destructive actions.
- Actual export generation/download.
- Broad RBAC rewrite.

Final operator decision:

- Decision: pending.
- Operator:
- Date:
- Notes:

## Recommended Phase 5F

Phase 5F should provision and prove staging, then rerun this deployment plan for approval:

- Provide safe non-production app and database targets.
- Run Phase 5B preflight and fixture bootstrap.
- Run Phase 5C authenticated browser/API proof.
- Verify migrations in staging.
- Run production env presence review by name only.
- Rehearse rollback and monitoring in staging.
- Reopen this deployment plan only after evidence is complete.
