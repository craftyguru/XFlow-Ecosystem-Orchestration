# RatAiFy Post-Rollout Backlog and Phase 6 Decision

Date: 2026-07-02

Current rollout status: `blocked_pending_rollout`.

Phase 6 recommendation: do not start Phase 6 yet; finish staging/production proof.

Reason: Phase 5C staging authenticated browser/API proof did not pass, Phase 5E deployment plan remained no-go, Phase 5F did not deploy production, and Phase 5G was observation-plan-only. RatAiFy is locally/source proven for selected hardening work, but the required staging/browser and production rollout evidence is incomplete.

Phase 5H-A recovery update: `npm run preflight:staging-proof` was rerun on 2026-07-02 and still failed. Recovery checklist: `docs/ratify-staging-proof-recovery.md`.

Current missing staging requirements:

- `RATAIFY_STAGING_BASE_URL`
- `RATAIFY_STAGING_DATABASE_URL` or `RATAIFY_NON_PRODUCTION_DATABASE_URL`
- `RATAIFY_E2E_ADMIN_EMAIL`
- `RATAIFY_E2E_SUPERADMIN_EMAIL`
- `RATAIFY_E2E_USER_EMAIL`
- `RATAIFY_E2E_ADMIN_PASSWORD`
- `RATAIFY_E2E_SUPERADMIN_PASSWORD`
- `RATAIFY_E2E_USER_PASSWORD`

Phase 5H-B local disposable E2E recovery update: local proof passed on 2026-07-02 using only loopback app/database targets and ignored local evidence. Evidence note: `docs/ratify-local-e2e-proof.md`.

## Phase 6 Decision

Do not start Phase 6 yet.

Required before Phase 6:

- Provision safe non-production app and database targets.
- Run Phase 5B preflight and fixture bootstrap.
- Run Phase 5C authenticated browser/API proof.
- Re-run production readiness and deployment approval docs after staging evidence exists.
- Execute Phase 5F only after explicit operator approval.
- Complete Phase 5G production observation if a rollout occurs.

## Prioritized Backlog

| item | area | risk | dependency | blocker | recommended phase | status |
| --- | --- | --- | --- | --- | --- | --- |
| Complete production/staging browser proof | production/staging browser proof | high | Safe staging URL, DB, admin/superadmin/user fixtures | Phase 5C failed preflight | 5H-A | blocked |
| Local disposable authenticated proof | browser fixture hardening | medium | Local Postgres binaries, local loopback app, seeded disposable fixtures | Does not replace staging proof | 5H-B | complete |
| Harden authenticated browser fixtures | browser fixture hardening | high | Stable non-production users, passkey/MFA posture, support/flag/contact/export/developer/scan fixtures | Staging env and fixture credentials still missing; local fixture path now exists | 5H-A | partial |
| Staging/prod parity checks | production/staging browser proof | high | Staging proof and production presence-only env review | No staging proof or production target classification | 5H-B | blocked |
| Production rollback drills | production rollback drills | high | Staging environment, migration backup/restore rehearsal, rollback owner | Rollback documented but not rehearsed | 5H-B | blocked |
| Monitoring/alerting improvements | monitoring/alerting improvements | high | Staging/prod log, audit, alert channel access | Runtime monitoring not proven in staging | 5H-B | blocked |
| Legacy support route shim/removal decision | legacy support route shim/removal | medium | Legacy route telemetry from staging/production observation | No telemetry window occurred | 5H-C | blocked |
| Legacy contact route shim/removal decision | legacy contact route shim/removal | medium | Legacy route telemetry from staging/production observation | No telemetry window occurred | 5H-C | blocked |
| Report/export request tracking staging proof | actual export generation/download | high | Export request fixture and audit evidence | Phase 5C did not run | 5H-A | blocked |
| Report/export full execution | report/export full execution | high | Separate product/security/data approval, serializer proof, file delivery proof | Actual export/download remains unapproved | Future dedicated phase | deferred |
| Actual export generation/download | actual export generation/download | high | Same as full execution plus download expiry/storage controls | Not approved and not staged | Future dedicated phase | deferred |
| Support delete/purge/export | support delete/purge/export | high | Data/privacy approval, exact confirmation, retention policy, backup/restore proof | Destructive/file delivery proof missing | Future dedicated phase | deferred |
| Feature flag delete | feature flag delete | medium | Product approval, exact confirmation, audit, backup posture | Delete route/proof missing | Future dedicated phase | deferred |
| Contact delete/purge/export | contact delete/purge/export | high | Data/privacy/legal approval, retention policy, serializer redaction | Privacy/destructive proof missing | Future dedicated phase | deferred |
| Webhook retry | webhook retry | medium | Idempotency, payload redaction, retry rate limits, audit proof | External side-effect proof missing | Future dedicated phase | deferred |
| API-key rotation | API-key rotation | high | Replacement key UX, one-time display proof, revocation timing, audit proof | Credential lifecycle proof missing | Future dedicated phase | deferred |
| Billing/entitlement integration | billing/entitlement integration | high | Verixet contracts and authority checks | RatAiFy must not be local billing authority | Future authority phase | partial |
| Tenant/org lifecycle | tenant/org lifecycle | high | Dedicated user/org readiness phase, exact confirmation where destructive | Account/data access impact unproven | Future dedicated phase | deferred |
| Provider credentials | provider credentials | high | Encryption, redaction, provider-specific rollback contracts | Credential mutation proof missing | Future dedicated phase | deferred |
| Control-plane/deployment actions | control-plane/deployment actions | high | XFlow authority contract, service-token redaction, rollback proof | RatAiFy must not be local control-plane authority | Future authority phase | deferred |
| Full data lifecycle policy | full data lifecycle policy | high | Product, privacy, legal, retention policy decisions | Delete/export/purge policies incomplete | Future governance phase | partial |

## Next Phase

Recommended next phase: Phase 5H-C Staging Proof Provisioning or Phase 5C re-run after staging credentials are provided.

Phase 5H-C should focus only on provisioning safe staging fixtures and completing the Phase 5C authenticated browser/API proof. It should not enable new actions, deploy production, run production migrations, or execute destructive/export/download behavior.

Exact next operator step:

1. Provide the missing non-production staging URL, non-production database URL, and fixture user credentials through a secret-safe environment path.
2. Rerun `npm run preflight:staging-proof` from `apps/RatAiFy`.
3. If preflight passes and the target is explicitly non-production, run `RATAIFY_ALLOW_STAGING_FIXTURE_BOOTSTRAP=1 npm run bootstrap:staging-proof-fixtures`.
