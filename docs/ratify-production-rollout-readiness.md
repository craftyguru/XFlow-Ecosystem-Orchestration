# RatAiFy Production Rollout Readiness

Date: 2026-07-02

Decision: no-go.

This review is documentation-only. It does not deploy RatAiFy, apply production migrations, enable any new action family, run destructive cleanup, mutate billing or entitlements, mutate tenant/org lifecycle state, rotate API keys, retry webhooks, mutate provider credentials, impersonate users, perform deployment/control-plane actions, or execute export/download flows.

## Summary

RatAiFy is not ready for a controlled production rollout review. Phase 5C staging authenticated browser/API proof did not pass; it stopped at preflight because the required non-production app URL, database URL, and E2E fixture credentials were missing. The safe-action source/contract proof from Phase 4F and the Phase 5B staging fixture bootstrap tooling are useful prerequisites, but they are not substitutes for authenticated staging evidence.

Completed hardening checkpoints:

- Phase 4A: disabled-first admin/superadmin action registry.
- Phase 4B: support assignment and internal note local readiness.
- Phase 4C: feature flag archive/deprecate local readiness.
- Phase 4D: contact archive/assign local readiness.
- Phase 4E: report/export request tracking local readiness.
- Phase 4F: local safe-action proof for selected safe mutations.
- Phase 5A: staging/browser readiness attempt blocked by missing safe target.
- Phase 5B: staging preflight and fixture bootstrap tooling added.
- Phase 5C: blocked at staging preflight.

Staging proof result:

- Status: blocked.
- Evidence: `apps/RatAiFy/.ratify-staging-proof/phase5c/summary.json`.
- App URL category: missing.
- Database URL category: missing.
- Authenticated browser/API proof: not run.
- Safe-action HTTP/browser proof: not run.
- Evidence leakage review: no authenticated proof artifacts were generated; preflight artifacts contain presence/status categories only.

## Production Blocker Matrix

| area | blocker | severity | production impact | evidence | owner/action needed | status |
| --- | --- | --- | --- | --- | --- | --- |
| auth/session | Staging auth fixtures absent. | high | Cannot prove admin, superadmin, and non-superadmin session behavior. | Phase 5C summary. | Provision non-production E2E users and rerun proof. | blocked |
| superadmin access | SuperAdminRoute denied state was not proven in a real browser. | high | Superadmin access controls remain unproven outside local/static checks. | Phase 5C skipped proof area. | Run authenticated staging browser proof. | blocked |
| support actions | Support assignment/internal note have local proof but no staging HTTP/browser proof. | high | Safe support mutations cannot be approved for rollout. | Phase 4F proof, Phase 5C blocked. | Seed support fixture and run safe-action proof. | partial |
| feature flags | Create/toggle/archive/deprecate lack staging proof in Phase 5C. | high | Flag changes can affect production behavior; rollout approval is blocked. | Action registry, Phase 5C blocked. | Prove with fixture flag and production disable switch. | partial |
| contacts | Status/archive/assign lack staging proof in Phase 5C. | high | Contact operations remain unproven against real HTTP/browser flows. | Action registry, Phase 5C blocked. | Seed contact fixture and rerun. | partial |
| report/export tracking | Metadata-only request tracking has local proof but no staging proof. | high | Actual export execution must remain disabled; metadata tracking is not rollout-approved. | Phase 4E/4F proof, Phase 5C blocked. | Prove tracking only; keep generation/download disabled. | partial |
| developer/API keys/webhooks | One-time key display and webhook overview were not staged. | high | Credential surfaces cannot be approved without redaction and one-time display evidence. | Phase 3D/3E local tests, Phase 5C blocked. | Run staging credential fixture proof without logging values. | partial |
| scan/evidence explorer | Superadmin scan/evidence explorer not staged. | medium | Evidence visibility/redaction remains unproven in browser. | Phase 5C skipped proof area. | Seed scan/issue/evidence/proof fixture. | blocked |
| audit logs | Redacted metadata audit logs not proven in staging. | high | Cannot confirm mutation evidence is safe in real audit storage. | Phase 4F local metadata proof, Phase 5C blocked. | Capture staging audit entries with redacted metadata. | partial |
| redaction | No Phase 5C browser/API evidence to scan. | high | Private content and credential exposure risk remains unclosed. | Phase 5C no artifacts. | Run staging proof and grep generated evidence. | blocked |
| legacy support route | Deprecation telemetry not proven in staging. | medium | Legacy route behavior may be invisible during rollout. | Phase 5C skipped proof area. | Exercise compatibility route in staging only. | blocked |
| legacy contact route | Route consolidation has local tests, but no Phase 5C staging proof. | medium | Legacy contact behavior remains partially proven. | Phase 2O tests, Phase 5C blocked. | Include in staging smoke. | partial |
| Verixet authority boundary | Billing/entitlement mutations remain local-disabled, but production integration readiness needs operator signoff. | high | Local RatAiFy must not become billing/entitlement authority. | Registry disabled entries, billing authority tests. | Confirm Verixet contracts and disable switches before launch. | partial |
| XFlow auth/workspace boundary | XFlow control-plane and workspace authority not launch-proven in Phase 5C. | high | Local control-plane mutations must stay disabled. | Registry disabled entries, control-plane tests. | Confirm XFlow contracts and service-token redaction in staging. | partial |
| AudAiX proof boundary | Scan/evidence proof fixtures were not exercised. | medium | AudAiX-derived proof could expose unsummarized scanner data if not verified. | Phase 5C skipped proof area. | Run evidence explorer proof with summarized records only. | blocked |
| database/migrations | New additive migrations have not been applied and verified in staging. | high | Production migration cannot be approved. | Migrations `0013`, `0014`, `0015`; Phase 5C blocked. | Apply to staging, verify tables/indexes, prepare backup. | blocked |
| environment variables | Production target and required env presence were not classified in this phase. | high | Runtime may be misconfigured or unsafe. | No production env inspected. | Run presence-only production env review without values. | blocked |
| monitoring/logging | Audit/logging exists in code, but Phase 5C did not prove runtime capture. | high | Incidents may be missed or lack safe evidence. | Ops tests, Phase 5C blocked. | Confirm alerts, error logging, and audit event ingestion in staging. | partial |
| rollback | Rollback plan documented here, but not rehearsed. | high | Rollback timing and restore points remain unknown. | This document. | Rehearse rollback in staging after migrations. | partial |

## Enabled Action Matrix

Production readiness for every currently enabled admin/superadmin mutation is blocked until Phase 5C passes. "Enabled" here means enabled by the current action registry through existing source/local proof, not approved for rollout.

| action id/name | route | UI location | required role/permission | reason requirement | confirmation requirement | production disable switch | audit event | redaction proof | staging proof status | rollback/undo behavior | production readiness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `support.reply_thread` / Reply to support thread | `POST /api/admin/support/threads/:id/reply` | `/superadmin/support` | admin or superadmin support operator | `support_reply` | none | `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED` | `support_thread.reply_added` | local only; reply body omitted from audit metadata | not run | manual follow-up reply; no automatic undo | blocked |
| `support.close_reopen_thread` / Close or reopen support thread | `PATCH /api/admin/support/threads/:id/triage` | `/superadmin/support` | admin or superadmin support operator | `support_triage` | none | `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED` | `support_thread.status_changed` | local only; status before/after metadata only | not run | set previous status through same route | blocked |
| `support.assign_thread` / Assign support thread | `PATCH /api/admin/support/threads/:id` | `/superadmin/support` | admin or superadmin support operator | support triage/customer/abuse/ops category | none | `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED` | `support.thread.assigned` | local only; message bodies omitted | not run | reassign to previous owner | blocked |
| `support.internal_note` / Add internal support note | `POST /api/admin/support/threads/:id/note` | `/superadmin/support` | admin or superadmin support operator | support triage/customer/abuse/ops category | none | `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED` | `support.thread.internal_note_added` | local only; note length only | not run | delete/redact note requires separate destructive proof | blocked |
| `feature_flags.create_flag` / Create feature flag | `POST /api/superadmin/flags` | `/superadmin/flags` | superadmin | rollout/incident/ops/cleanup category | none | `RATAIFY_FEATURE_FLAG_MUTATIONS_DISABLED` | `feature_flag_history.create` | local only; flag metadata only | not run | disable/archive through proven flow | blocked |
| `feature_flags.toggle_flag` / Toggle feature flag | `PATCH /api/superadmin/flags/:id/toggle` | `/superadmin/flags` | superadmin | rollout/incident/ops/cleanup category | none | `RATAIFY_FEATURE_FLAG_MUTATIONS_DISABLED` | `feature_flag_history.toggle` | local only; before/after state only | not run | toggle back through same route | blocked |
| `feature_flags.archive_flag` / Archive or deprecate flag | `PATCH /api/superadmin/flags/:id/archive` | `/superadmin/flags` | superadmin | cleanup/stale/replaced/security/complete/operator category | none | `RATAIFY_FEATURE_FLAG_MUTATIONS_DISABLED` | `feature_flag_history.archive` | local only; lifecycle/state metadata only | not run | restore requires separate future proof | blocked |
| `contacts.status_triage` / Contact submission status triage | `PATCH /api/admin/contact-submissions/:id` | `/admin/contacts`, `/superadmin/contact-forms` | admin or superadmin | contact admin category | none | `RATAIFY_CONTACT_ADMIN_MUTATIONS_DISABLED` | `contact_submission.status_updated` | local only; message body omitted | not run | set previous status through same route | blocked |
| `contacts.archive_submission` / Archive contact submission | `PATCH /api/admin/contact-submissions/:id/archive` | `/admin/contacts`, `/superadmin/contact-forms` | admin or superadmin | resolved/duplicate/spam/no-action/operator/customer/cleanup category | none | `RATAIFY_CONTACT_ADMIN_MUTATIONS_DISABLED` | `contact_submission.archived` | local only; message/email/phone redaction rules | not run | unarchive after separate proof | blocked |
| `contacts.assign_submission` / Assign contact submission | `PATCH /api/admin/contact-submissions/:id/assign` | `/admin/contacts`, `/superadmin/contact-forms` | admin or superadmin | resolved/duplicate/spam/no-action/operator/customer/cleanup category | none | `RATAIFY_CONTACT_ADMIN_MUTATIONS_DISABLED` | `contact_submission.assigned` | local only; message/email/phone redaction rules | not run | reassign | blocked |
| `developer_webhooks.create_api_key` / Create API key | `POST /api/v1/api-keys` | `/dashboard/developers` | org owner/admin with MFA and recent step-up | credential admin category | none | `RATAIFY_DEVELOPER_CREDENTIAL_MUTATIONS_DISABLED` | `developer_api_key.created` | local only; full key only in creation response | not run | revoke key | blocked |
| `developer_webhooks.delete_webhook` / Delete webhook | `DELETE /api/v1/webhooks/:id` | `/dashboard/developers` | org owner/admin with MFA and recent step-up | credential admin category | `DELETE WEBHOOK` | `RATAIFY_DEVELOPER_CREDENTIAL_MUTATIONS_DISABLED` | `developer_webhook.deleted` | local only; signing material omitted | not run | create new webhook | blocked |
| `report_exports.request_tracking` / Record export request metadata | `POST /api/admin/export-requests` | `/superadmin/compliance` | admin or superadmin | operator/customer/compliance/legal/incident/lifecycle category | none | `RATAIFY_EXPORT_REQUESTS_DISABLED` | `report_export_request.created` | local only; metadata-only request | not run | cancel metadata request requires future proof | blocked |

## Disabled/High-Risk Action Matrix

| action family | current location | disabled/planned proof | why blocked | requirements before enabling |
| --- | --- | --- | --- | --- |
| support delete/purge/export | not exposed or disabled planned controls | Registry keeps `support.delete_thread` unenabled; Phase 4F confirms planned export/purge controls disabled. | Destructive/file-delivery proof missing. | Exact confirmation, reason, audit, redaction, staging proof, rollback decision. |
| feature flag delete | not exposed | Registry `feature_flags.delete_flag` disabled. | Deletion has no recovery path and no route proof. | Product approval, exact confirmation, audit, staging proof, backup plan. |
| contact delete/purge/export | delete route exists but UI disabled/planned; export/purge not exposed | Registry keeps `contacts.delete_submission`, `contacts.export_submission`, `contacts.purge_records` unenabled. | Destructive/export content redaction not approved. | Privacy/legal approval, serializer proof, exact confirmation for destructive flows, staging evidence. |
| actual export generation/download | data settings/compliance posture only | Registry keeps generate/download/schedule/purge unenabled. | Raw export body and file delivery proof missing. | Serializer redaction, file storage controls, audit, download expiry, staging proof. |
| billing mutation | billing posture pages | Billing/entitlement registry entries disabled. | Verixet is authority. | Verixet contract, fail-closed proof, audit and rollback through Verixet. |
| entitlement mutation | billing/entitlement posture pages | Disabled in registry. | Verixet is authority. | Verixet-approved mutation flow and staging contract proof. |
| tenant/org lifecycle mutation | legacy superadmin surfaces or not exposed | Registry `user_org.*` entries not enabled. | Dedicated user/org readiness phase missing. | Step-up, reason, exact confirmation where destructive, audit, rollback, staging proof. |
| API-key rotation | developer planned action area | Registry `developer_webhooks.rotate_api_key` planned. | Rotation flow and one-time replacement proof missing. | Replacement-key UX, revocation timing, audit, redaction, staging proof. |
| webhook retry | developer planned action area | Registry `developer_webhooks.retry_webhook_delivery` planned. | External delivery idempotency and payload redaction proof missing. | Idempotency key, payload redaction, rate limits, audit, staging proof. |
| provider credential mutation | connected/provider surfaces | No enabled action registry entry. | Credential storage and provider-side rollback proof missing. | Provider contract, encryption/redaction proof, MFA/step-up, audit. |
| impersonation | not approved | No enabled action registry entry. | High-risk access path missing legal/audit model. | Explicit product/legal approval, visible banner, immutable audit, strict time-boxing. |
| deployment/control-plane actions | `/superadmin/xflow` posture only | Registry `control_plane_ucl.*` disabled. | XFlow is authority. | XFlow control-plane contract, service-token redaction, rollback rehearsal. |
| data purge | not exposed | Destructive registry entries missing/disabled. | Retention/legal flow and restore plan missing. | Retention policy, exact confirmation, backup/restore proof, audit. |
| destructive actions | disabled framework | Phase 4A/4F disabled-first posture. | Any destructive action requires separate proof. | Dedicated readiness phase per action. |

## Migration/Schema Readiness

Migrations added in recent hardening work:

- `apps/RatAiFy/migrations/0013_feature_flag_lifecycle.sql`: additive `feature_flags.lifecycle_state` and `feature_flags.archived_at`.
- `apps/RatAiFy/migrations/0014_contact_admin_lifecycle.sql`: additive `admin_messages.archived`, `archived_at`, `assigned_admin_id`, and `assigned_at`.
- `apps/RatAiFy/migrations/0015_report_export_request_tracking.sql`: additive `report_export_requests` table plus status and scope indexes.

Readiness status:

- Applied in staging: not proven.
- Production migration needed: yes, if these schema changes are part of rollout.
- Migration type: additive based on file inspection; no destructive DDL in the listed migrations.
- Table/index verification: blocked until staging database is provisioned and migration verification runs.
- Backup requirement: take a production database backup/snapshot before any migration, verify restore access, and record migration version before apply.
- Rollback/restore plan: prefer restore from snapshot if migration causes production incident; additive columns/tables can be left inert if application rollback no longer uses them. Do not drop columns/tables during incident response unless separately approved.

No production migration was applied in this phase.

## Environment Readiness

No production environment values were read or printed. Presence-only classification must be completed before launch.

| category | env names | classification | status |
| --- | --- | --- | --- |
| auth/session | `SESSION_SECRET`, `TOTP_ENCRYPTION_SECRET`, `WEBAUTHN_ORIGIN`, `WEBAUTHN_RP_ID`, OAuth client ids/secrets | required | blocked until presence-only production review |
| database | `DATABASE_URL`, `DIRECT_DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | required/conditional | blocked until target classification and migration proof |
| Redis/worker | `REDIS_URL`, job backlog alert envs | optional/conditional | partial |
| XFlow integration | `XFLOW_*`, `CONTROL_PLANE_*`, `NEXT_PUBLIC_XFLOW_URL` | conditional required | partial; mutations must stay disabled |
| Verixet integration | `VERIXET_*`, `INTERNAL_BILLING_TOKEN`, billing metadata envs | conditional required | partial; Verixet remains authority |
| AudAiX integration | `RATAIFY_AUDIT_PROOF_IMPORT_URL`, `RATAIFY_AUDIT_PROOF_TOKEN`, `RATAIFY_PUBLIC_BADGE_URL`, `VITE_ECOSYSTEM_AUDAIX_URL` | conditional required | blocked until proof fixture |
| webhook/signing | `CMS_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`, `VERIXET_WEBHOOK_SECRET`, `WEBHOOK_SECRET_*` | required/conditional | blocked until presence-only review |
| provider | `OPENAI_API_KEY`, `SENDGRID_API_KEY`, `STRIPE_SECRET_KEY`, provider OAuth envs | required/conditional | blocked until presence-only review |
| logging/monitoring | `RATAIFY_SENTRY_DSN`, `VITE_SENTRY_DSN`, `LOG_LEVEL`, Slack alert envs | required/optional | partial |
| production action-disable switches | `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED`, `RATAIFY_FEATURE_FLAG_MUTATIONS_DISABLED`, `RATAIFY_CONTACT_ADMIN_MUTATIONS_DISABLED`, `RATAIFY_EXPORT_REQUESTS_DISABLED`, `RAT_AIFY_DISABLE_DATA_EXPORT`, `RATAIFY_DEVELOPER_CREDENTIAL_MUTATIONS_DISABLED`, `RATAIFY_SCAN_MUTATIONS_DISABLED`, `RATAIFY_USER_ORG_MUTATIONS_DISABLED`, `RATAIFY_LOCAL_BILLING_MUTATIONS_DISABLED`, `RATAIFY_CONTROL_PLANE_MUTATIONS_DISABLED` | required for controlled rollout posture | blocked until production presence review |
| staging-only | `RATAIFY_STAGING_BASE_URL`, `RATAIFY_STAGING_DATABASE_URL`, `RATAIFY_NON_PRODUCTION_DATABASE_URL`, `RATAIFY_E2E_*`, `RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP` | staging-only | missing in Phase 5C |
| local-only | `RATAIFY_SHARED_SUPABASE_LOCAL_ENABLED`, local smoke/test envs | local-only | not for production rollout |
| unknown | any env not covered above | unknown | classify before launch |

## Monitoring/Logging Readiness

| signal | readiness | evidence |
| --- | --- | --- |
| HTTP access logs | partial | App has route tests and logging dependencies, but staging runtime capture not proven. |
| audit events | partial | Registry documents events; local tests/proof inspect metadata only. |
| support mutation audit | partial | Local proof only. |
| feature flag mutation audit | partial | Local proof only. |
| contact mutation audit | partial | Local proof only. |
| export request audit | partial | Local proof only; actual export execution disabled. |
| legacy route telemetry | blocked | Phase 5C skipped. |
| error logging | partial | Sentry/logging envs exist, but staging alert path not proven. |
| sensitive-data redaction | partial | Local tests and preflight artifacts only. |
| alerting gaps | blocked | Alert destinations and escalation path require presence-only production review and staging incident drill. |

## Rollback Plan

1. Frontend rollback: redeploy the last known good frontend artifact or revert the release commit; keep admin/superadmin mutation switches disabled while verifying.
2. Backend rollback: redeploy the last known good backend artifact; confirm health, auth/session, and read-only admin routes.
3. Migration rollback/restore: restore from the pre-migration database backup if runtime behavior requires database rollback. Additive migrations may remain inert after app rollback if restore risk is higher than leaving unused columns/tables.
4. Action disable switches: set all admin/superadmin mutation disable switches to disabled posture before rollout and during any incident.
5. Feature flag rollback: toggle back or archive only through proven guarded flows; for production incidents, prefer global disable switch first.
6. Disable safe actions: use `RATAIFY_SUPPORT_ADMIN_MUTATIONS_DISABLED`, `RATAIFY_FEATURE_FLAG_MUTATIONS_DISABLED`, `RATAIFY_CONTACT_ADMIN_MUTATIONS_DISABLED`, `RATAIFY_EXPORT_REQUESTS_DISABLED`, and `RATAIFY_DEVELOPER_CREDENTIAL_MUTATIONS_DISABLED`.
7. Revert to read-only mode: disable all mutation switches, leave read-only dashboards and support views available only if auth and redaction remain healthy.
8. Legacy compatibility routes: disable or route-gate legacy support/contact compatibility only after confirming telemetry and customer impact.
9. Sensitive/private data exposure incident: disable affected route family, revoke exposed credentials outside this app through the owning authority, preserve sanitized audit records, rotate affected keys through approved owner systems, notify incident owner, and avoid storing raw exposed content in follow-up tickets.

## Go/No-Go Checklist

| item | status | evidence |
| --- | --- | --- |
| staging proof passed | blocked | Phase 5C stopped at preflight. |
| full validation passed | partial | Phase 5B validation passed; Phase 5C validation skipped after hard stop. |
| no sensitive/private data in evidence | partial | Preflight evidence is sanitized; no authenticated proof artifacts exist. |
| destructive controls disabled | partial | Registry/local proof confirm disabled posture; staging not proven. |
| production disable switches documented | partial | Documented here; production presence not checked. |
| audit events proven | partial | Local proof only; staging audit capture missing. |
| rollback plan documented | clear | This document. |
| migration backup plan documented | clear | This document; not rehearsed. |
| owner approval required | blocked | Owner approval cannot be requested as go until staging proof passes. |

Final launch decision: no-go. Do not mark this rollout as approved unless every blocked item is clear or explicitly accepted as risk by the accountable owner after staging evidence exists.

## Recommended Phase 5E

Phase 5E should be Staging Environment Provisioning and Production Readiness Rehearsal:

- Provide non-production app and database targets.
- Seed fixtures through the Phase 5B bootstrap after successful preflight.
- Run Phase 5C authenticated browser/API proof end to end.
- Apply and verify additive migrations in staging.
- Run presence-only production env review.
- Rehearse rollback and action-disable procedures in staging.
- Generate sanitized evidence and rerun the go/no-go checklist.
