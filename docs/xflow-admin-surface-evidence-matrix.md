# XFlow Admin Surface Evidence Matrix

Generated: 2026-07-06T00:48:17.573Z

Scope: local-only browser proof. This matrix does not use or prove staging, production, remote provider APIs, deployment execution, billing, entitlement, provider credential, or control-plane mutation behavior.

P3M separation: this matrix is complete for the local proof scope only. Rows marked `done` are local-proof evidence-backed, not production-ready. Production readiness remains blocked by the hard-stop register in `docs/xflow-production-hard-stop-register.md` and requires staged non-production smoke, external authority proof, mutation audit proof, redaction proof, scope proof, and explicit operator approval where applicable.

## Counts

| Result | Count |
| --- | ---: |
| `done` | 27 |
| `partial` | 0 |
| `blocked` | 0 |
| `intentionally-unavailable` | 5 |
| `not-applicable` | 1 |

## Routes Covered

- `/deployments`
- `/apps/xflow-local-proof-app/integrations`
- `/overview`
- `/dashboard/ecosystem`
- `/admin/system-status`

## Variants Covered

- `default`
- `denied`
- `empty`
- `degraded`
- `unavailable`
- `error-redacted`

## Matrix

| Surface ID | Route | Type | Risk | Variants | Result | Remaining Gap |
| --- | --- | --- | --- | --- | --- | --- |
| `deployments.target-list` | `/deployments` | table | deployment-status | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.status-labels` | `/deployments` | status-label | deployment-status | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.provider-source-labels` | `/deployments` | status-label | provider-status | `default`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.logs-errors` | `/deployments` | error-display | redaction | `default`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.error-redacted-state` | `/deployments` | error-display | error-state | `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.redeploy-action` | `/deployments` | action | sensitive-action | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `intentionally-unavailable` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.restart-action` | `/deployments` | action | sensitive-action | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `intentionally-unavailable` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.provider-refresh-action` | `/deployments` | action | sensitive-action | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `intentionally-unavailable` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.metadata-display` | `/deployments` | metadata-display | redaction | `default`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `deployments.production-wording` | `/deployments` | status-label | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.readiness-panel` | `/apps/xflow-local-proof-app/integrations` | card | provider-status | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.configured-setup-labels` | `/apps/xflow-local-proof-app/integrations` | status-label | truth-label | `default`, `empty`, `unavailable` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.provider-status-labels` | `/apps/xflow-local-proof-app/integrations` | status-label | provider-status | `default`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.unavailable-provider-state` | `/apps/xflow-local-proof-app/integrations` | variant-state | unavailable-state | `unavailable` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.sync-connect-actions` | `/apps/xflow-local-proof-app/integrations` | action | sensitive-action | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `intentionally-unavailable` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.private-values-redaction` | `/apps/xflow-local-proof-app/integrations` | metadata-display | redaction | `default`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `overview.summary-cards` | `/overview` | card | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `overview.source-signal-labels` | `/overview` | status-label | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `overview.alert-incident-cards` | `/overview` | card | degraded-state | `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `overview.empty-state` | `/overview` | variant-state | empty-state | `empty` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `ecosystem.dashboard-catalog` | `/dashboard/ecosystem` | card | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `ecosystem.provider-readiness-labels` | `/dashboard/ecosystem` | status-label | provider-status | `empty`, `degraded`, `unavailable` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `ecosystem.telemetry-activity-cards` | `/dashboard/ecosystem` | card | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `admin.system-status-page` | `/admin/system-status` | page | authz | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `admin.route-auth-rbac-status` | `/admin/system-status` | status-label | authz | `denied` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `admin.provider-dependency-status` | `/admin/system-status` | status-label | provider-status | `default`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `admin.database-local-proof-status` | `/admin/system-status` | status-label | truth-label | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `admin.raw-log-reveal` | `/admin/system-status` | action | sensitive-action | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `intentionally-unavailable` | None for the local proof scope; production/external authority is still outside this evidence. |
| `auth.default-admin-access` | `/overview` | auth-state | authz | `default` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `auth.denied-admin-system-status` | `/admin/system-status` | auth-state | authz | `denied` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `auth.plain-member-denied-fixture` | `/admin/system-status` | auth-state | authz | `denied` | `done` | None for local plain-member denied proof; production/staging denied-state proof remains outside this evidence. |
| `redaction.token-shaped-strings` | `/deployments` | error-display | redaction | `default`, `denied`, `empty`, `degraded`, `unavailable`, `error-redacted` | `done` | None for the local proof scope; production/external authority is still outside this evidence. |
| `integrations.route-alias` | `/integrations` | page | truth-label | none | `not-applicable` | None for the local proof scope; production/external authority is still outside this evidence. |

## Evidence Artifacts

- Machine-readable matrix: `apps/XFlow/.xflow-local-browser-proof/admin-surface-evidence-matrix.json`
- Proof assertion config: `apps/XFlow/scripts/local-browser-proof-assertions.ts`
- Variant proof summaries: `apps/XFlow/.xflow-local-browser-proof/variants/<variant>/verification-summary.json`
- Local admin E2E workflow summaries, when present: `apps/XFlow/.xflow-local-browser-proof/e2e/<workflow>/summary.json`
- Matrix verifier test: `apps/XFlow/tests/unit/admin-surface-evidence-matrix.test.ts`

## Notes

- Rows marked `done` have local route evidence, screenshot evidence, and required assertion categories.
- Rows marked `intentionally-unavailable` are expected not to execute in local proof and have assertion evidence that sensitive behavior is gated, unavailable, or redacted.
- Rows marked `partial` or `blocked` must not be upgraded without additional proof.
- Screenshot existence alone is never enough for `done`.
- E2E workflow summaries add navigation/action/network proof references but do not replace assertion-backed route evidence.
- P3M hard-stop separation is authoritative for production-readiness interpretation: local proof complete does not equal production ready.
