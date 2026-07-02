# Verixet Superadmin Gap Audit

Date: 2026-06-30

## Summary

This audit covers the Verixet Superadmin and adjacent dashboard/API surfaces that make Verixet the ecosystem billing, entitlement, activation, API-key, workspace, webhook, contract, and tenant/source-of-truth layer.

Realness rule used here: a surface is `real` only when it reads from a real backend/source, the backend route or service exists, server-side auth/role checks are present, empty/loading/error/permission-denied states are honest, sensitive fields are redacted or omitted, and this document names exact evidence. If any item is missing, the surface is `partial`, `mock`, `planned`, `broken`, or `missing`.

High-level result:

- Real: core Verixet authority primitives exist for billing catalog/status, entitlement evaluation, activation persistence/status, API keys, webhooks, audit events, governance checks, ecosystem contracts, persisted admission-decision events, and persisted scoped Superadmin permission assignments.
- Partial: the Superadmin UI is broad and many pages are real-data-backed but not fully Superadmin-complete under the realness rule because staging authenticated proof, complete permission-denied states, complete audit proof, or end-to-end tests are incomplete.
- Missing/planned: tenant suspension/reactivation, destructive tenant controls, broad entitlement mutation UI, grant/revoke permission UI, and safe webhook retry execution are not production-ready and must remain unavailable.

## Current Status After Local Phase 2E/4F Proof

This section supersedes older phase-local blocker notes where later local disposable proof completed the blocked item.

| Area | Current status | Evidence | Remaining blocker |
|---|---|---|---|
| Migration `0077_admission_decision_events` | Locally DB-proven | Phase 3E local disposable rerun; `apps/Verixet/output/phase3e/phase3e-admission-proof.json` | Apply/check in the target staging/non-production DB before staging rollout |
| Migration `0078_superadmin_permission_assignments` | Locally DB-proven | Phase 4E local disposable proof; `apps/Verixet/output/phase4e/phase4e-permission-assignment-proof.json` | Apply/check in the target staging/non-production DB before staging rollout |
| Persisted admission decision events | Real in local disposable authenticated proof; staging pending | `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json` | Apply/check and rerun in target staging/non-production DB |
| Persisted scoped permission assignments | Real in local disposable authenticated proof; staging pending | `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json` | Apply/check and rerun in target staging/non-production DB |
| `activation.recheck` | Only enabled Superadmin action; authenticated local proof passed | Route enforces `verixet.activation.recheck`, reason category, production disable switch, audit event, safe response DTO; proof JSON and screenshots in `apps/Verixet/output/phase2e4f-local/` | Real staging proof still pending |
| All other Superadmin actions | Disabled | Phase 4A registry and disabled UI scaffolding | Do not enable until route, scoped permission, reason/confirmation, production switch, audit, redaction, and tests exist |
| Phase 2E local authenticated admission proof | Passed locally | `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json`, `superadmin-read-only.png`, `xflow-dashboard.png` | Repeat against target staging/non-production environment |
| Phase 4F local authenticated activation recheck proof | Passed locally, with production-switch behavior covered by focused route tests rather than runtime env toggle | `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json`, `superadmin-read-only.png`, `xflow-dashboard.png` | Repeat against target staging/non-production environment |

Local E2E fixture update after Phase 4G:

- Added safe local fixture wrapper `npm --prefix apps/Verixet run bootstrap:e2e-local-env`.
- Created disposable local database `verixet_e2e_local_fixtures` on `127.0.0.1:55432`.
- Applied migrations through `0078` to that local database.
- Generated ignored local env file `apps/Verixet/.env.e2e.local`; API key values were not printed.
- Seeded regular/admin/platform dashboard API keys, platform superadmin user, active/revoked/wrong scoped activation recheck assignment fixtures, activation binding fixture, and Phase 2E admission-case rows.
- `npm --prefix apps/Verixet run preflight:superadmin-staging` now passes when reading `.env.e2e.local`.
- `npm --prefix apps/Verixet run proof:phase2e4f:local` passed against `next dev` on local port `3120` with `E2E_SKIP_WEBSERVER=1`.
- Phase 2E local proof covered paid-active admission, missing-entitlement denial, free/baseline-plan denial, past-due denial, canceled denial, unpaid denial, and workspace/app policy mismatch denial. The current resolver reports missing-entitlement as `blocked_by_billing` / `billing_inactive` and workspace/app policy mismatch as `blocked_by_plan` / `plan_not_entitled`; both are safe fail-closed denials and do not grant access.
- Phase 4F local proof covered platform-superadmin recheck, active scoped assignment recheck, revoked assignment denial, wrong-permission denial, missing reason denial, no entitlement/access grant, and omission of raw provider/request/response bodies. Production disable switch behavior remains covered by focused route tests because the running dev server cannot toggle that environment setting per request.
- Sanitized JSON evidence grep for `Authorization`, `Bearer`, `token`, `cookie`, `apiKey`, `secret`, `password`, `request_body`, `response_body`, `provider response`, `stack trace`, `force grant`, `bypass billing`, `access granted`, and `production-ready` returned no matches. Broader dev-server log scans include expected log field names and route names such as `cookie_names_seen` and `token-scanner`; those are not part of the sanitized proof JSON.
- `npm --prefix apps/Verixet run test:e2e:dashboard` no longer passes in this local run. It passed before the dedicated proof harness, but the current rerun failed: first on dashboard test selector ambiguity from duplicate accessible `Billing` links, then repeated authenticated login attempts hit the local dashboard rate limiter. This is outside the Phase 2E/4F proof harness and should be cleaned up in the dashboard E2E suite.

Current operator next step:

1. Clean up the dashboard E2E selector/rate-limit harness so `npm --prefix apps/Verixet run test:e2e:dashboard` passes reliably with local authenticated fixtures.
2. For staging proof, load non-production `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `E2E_BASE_URL`, and a safe non-production `DATABASE_URL`/`DIRECT_DATABASE_URL`/`VERIXET_DATABASE_URL` into the same shell/session.
3. Run `npm --prefix apps/Verixet run preflight:superadmin-staging`.
4. If preflight passes, apply/check migrations `0077` and `0078` only against the confirmed non-production database, then rerun Phase 2E and Phase 4F authenticated evidence capture.

## Route And Status Matrix

| Surface / route | Status | Backend source | Required permission | Mutation risk | Audit event coverage | Empty state | Failure state | Test coverage | Recommended next phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` overview | partial | `apps/Verixet/src/lib/dashboard/modules/data.ts`, `stats.ts`, `command-center*` | Dashboard workspace session via `requireDashboardWorkspaceAccessForPage` | Read-only | Reads `auditEvents`; not every card maps to mutation events | Present on many cards | Present through page error/loading files | `dashboard-shell.test.ts`, dashboard route audit | Add per-card realness inventory and permission-denied component |
| `/dashboard/ecosystem` Superadmin | partial | `apps/Verixet/src/app/dashboard/(main)/ecosystem/page.tsx`, `ecosystem-contracts/apps.json` | `isPlatformSuperAdmin` | Read-only | No mutation; no route-specific audit read event seen | Partial | Platform guard returns notFound | `audit:dashboard` checks platform guard | Add explicit Superadmin denied state and app-contract detail tests |
| `/dashboard/admin/plans-entitlements` | partial | `apps/Verixet/src/app/dashboard/(main)/admin/plans-entitlements/page.tsx`, billing catalog services | Platform superadmin | Read-only/review | Read-only; mutation audit not applicable | Partial | notFound for non-superadmin | `audit:dashboard` | Add source-of-truth row tests and disabled mutation affordance proof |
| `/dashboard/admin/billing-infrastructure` | partial | `apps/Verixet/src/app/dashboard/(main)/admin/billing-infrastructure/page.tsx`, Stripe/env checks | Platform superadmin | Read-only diagnostic | Read-only; no audit row required | Partial | notFound for non-superadmin | `audit:dashboard` | Add explicit degraded/missing integration classification per check |
| `/dashboard/billing` | partial | `billing-workspace-overview-api.ts`, `customer-billing-overview.ts`, `workspaceStripeConnections`, catalog tables | Workspace session; owner/admin/platform for admin controls | Safe/sensitive mutation links | Some verification and mode routes audit; not complete for all actions | Present | `billing/error.tsx`, API failures | Billing route/component tests | Split customer billing from Superadmin controls and prove every action guard |
| `/dashboard/billing/xflow-setup` | partial | XFlow billing mirror, OAuth link, verification APIs | Owner/admin or platform operator | Sensitive sync/verification | Partial | Present | Present | Billing mirror and verification tests | Keep mutating sync controls disabled unless audited with reason/audit/test |
| `/dashboard/access-billing-control` | partial | `access-billing-control/service.ts`, entitlement/billing integration fixtures only for tests | Workspace admin/owner; platform inherited admin | Read-only plus planned controls | Partial | Present | Present | `access-billing-control` tests | Add explicit source labels for any fixture-derived examples |
| `/dashboard/keys` and `/dashboard/api-keys` | partial | `apiKeys`, `apiKeySecrets`, `requestsLog`, `/api/keys/**` | Workspace owner/admin | Sensitive/destructive API-key mutation | Some key actions record audit rows; complete matrix needed | Present | `keys/error.tsx` | Key page/action tests exist | Prove every rotate/revoke/delete path has exact confirmation, audit, tests |
| `/api/keys`, `/api/keys/[id]/rotate`, `/api/keys/[id]/revoke`, `/api/v1/keys/*` | partial | `apps/Verixet/src/app/api/keys/**`, `src/db/schema.ts` `apiKeys` tables | Dashboard owner/admin or API auth depending route | Sensitive mutation | Partial, route-specific verification needed | API n/a | JSON errors | Route tests exist for several key APIs | Add mutation-risk row per method and redaction assertions |
| `/dashboard/webhooks` | partial | `webhook-setup.ts`, `webhook-delivery-summary.ts`, `webhookOutboundDeliveries`, `webhookEndpoints` | Workspace owner/admin | Sensitive endpoint/secret/test mutation | Partial | Present | `webhooks/error.tsx` | `webhooks/actions.test.ts`, endpoint route tests | Prove payload/body redaction and keep retry execution unavailable |
| `/api/dashboard/webhooks/**` | partial | Dashboard webhook endpoint/delivery routes and `webhookEndpointSecretsCrypto` | Workspace owner/admin | Sensitive mutation | Partial | API n/a | JSON errors | Endpoint/secret/test route tests | Add reason-category and audit-event requirements for retry/test actions |
| `/api/webhooks/stripe`, `/api/webhooks/stripe/ecosystem`, `/api/webhooks/stripe/workspace/[workspaceId]/[mode]` | real | Stripe webhook routes, `stripe-webhook-signature.ts`, `webhook-process.ts`, `stripeWebhookProcessing` | Stripe signature/webhook secret | Sensitive billing mutation from provider event | Processing/audit/billing ledgers present | API n/a | Signature/quarantine failures | Stripe webhook route/security tests | Keep payload bodies out of UI; add Superadmin replay gating proof |
| `/api/internal/stripe-webhook-replay`, `/api/internal/stripe-webhook-reprocess-failed` | partial | Stripe replay/reprocess services | Internal shared secret | Sensitive mutation/replay | Partial | API n/a | JSON errors | Route tests exist | Require production kill-switch and reason category before UI exposure |
| `/dashboard/audit` | partial | `auditEvents`, `audit-forensics.ts`, `/api/dashboard/audit/export` | Workspace admin/owner or platform admin | Read/export | Native audit source | Present | `audit/error.tsx` | Audit export tests | Add redaction proof for all audit metadata shapes |
| `/dashboard/logs` | partial | `requestsLog`, operational logs export | Workspace admin/owner or platform admin | Read/export | Request log source, not governance audit | Present | `logs/error.tsx` | Logs export tests | Add payload redaction and permission-denied tests |
| `/dashboard/system-health` | partial | `operational-health.ts`, request/webhook/audit aggregates | Workspace admin/owner or platform admin | Read-only | Reads audit rows; health check writes exist in `audit/events.ts` | Present | loading/error | System health source contract tests | Rename any health labels to "observed" unless backed by fresh evidence |
| `/dashboard/reliability` | partial | Compatibility redirect to system health | Workspace admin/owner/platform | Read-only | n/a | n/a | Redirect | Dashboard route audit | Keep as compatibility route only |
| `/dashboard/transactions` | partial | `transactions/load.ts`, `event-ledger.ts`, `diagnostics.ts`, request logs, data sources | Dashboard workspace session; export gated separately | Read/export | Reads audit/request/webhook ledgers | Present | Page test coverage | `transactions/page.test.tsx`; added diagnostics test | Continue removing "connected" labels without evidence |
| `/api/transactions/overview`, `/api/verixet/transactions/*` | partial | Transactions loaders and diagnostics/export routes | Dashboard access/transaction permissions | Read/export | Partial | API n/a | JSON errors | Route tests exist | Add explicit private payload redaction tests |
| `/dashboard/token-scanner` | partial | Token scanner routes/results/data sources | Dashboard workspace session | Safe scan/read, potential sensitive discovery | Partial | Present | loading/error | Token scanner tests | Ensure token findings never show unredacted secrets |
| `/dashboard/payment-monitor` and `/dashboard/payment-monitor/connect` | partial | Payment monitor mappings, Stripe connection checks | Dashboard workspace session; permissions helper | Sensitive provider mapping | Partial | Present | Partial | Payment monitor permissions tests | Require scoped permission and audit for provider mapping mutation |
| `/dashboard/workspace` | partial | `workspaces`, `workspaceMembers`, `auditEvents` | Dashboard workspace session; owner/admin for mutations | Sensitive workspace config | Reads audit rows; mutation audit incomplete | Present | `workspace/error.tsx` | Workspace-related tests | Add exact confirmation/reason to dangerous config changes |
| `/dashboard/roles-permissions` | partial | Workspace members, platform admins, audit rows | Workspace admin/owner | Read-only/planned mutation | Read-only | Honest unavailable states | Page guard | Page tests | Implement scoped permission registry before calling it real |
| `/dashboard/xflow` | partial | XFlow OAuth/link stores, event bindings, activation stores | Dashboard workspace session; owner/admin/platform for setup | Sensitive integration mutation | Partial | Present | loading/error | XFlow page/action tests | Separate connection health from implemented contract coverage |
| `/dashboard/xflow/apps/[appId]` | partial | XFlow app command components/services | Dashboard workspace session | Sensitive app management planned | Partial | Partial | Partial | Component tests | Add per-app contract and entitlement truth checks |
| `/dashboard/xflow/issues` | partial | `xflow-issue-actions.ts`, `issue-sync.ts`, operator issues | Dashboard workspace session; owner/admin/platform for mutation | Safe/sensitive lifecycle mutation | Partial | Present | loading/error | XFlow issue action/page tests | Add assignment/reply disabled states unless backend exists |
| `/api/dashboard/xflow/*`, `/api/xflow/*`, `/api/ucl/*` | partial | XFlow OAuth/UCL/link routes and stores | Dashboard session, OAuth, UCL token, or shared secret by route | Sensitive integration mutation | Partial | API n/a | JSON/redirect failures | Many route tests | Add source-owned permission names and audit matrix by method |
| `/api/verixet/activate` | real | `src/app/api/verixet/activate/route.ts`, `xflow-app-activation-store.ts`, `xflow-workspace-event-binding-store.ts` | Dashboard session plus owner/admin or platform superadmin; POST cross-site guard | Sensitive activation mutation | Writes requested/rejected/completed audit events | API n/a | 400/401/403/404/409 failures | `route.test.ts` | Add entitlement admission check before activation grants ecosystem access |
| `/api/verixet/activate/status` | partial | `findXflowAppActivationBinding`, `insertAuditEvent` | Dashboard session or internal bearer | Read-only | Writes read audit event | API n/a | 400/401/404 | `route.test.ts` | Redact or remove `last_response_body_preview` unless proven safe |
| `/api/ecosystem/deployments/governance/check` | real | `deploy-governance/service.ts`, internal bearer auth | `VERIXET_XFLOW_DEPLOY_GOVERNANCE_SECRET` internal bearer | Read/governance decision; no deploy mutation | Service evaluates policy and approval; audit behavior in service | API n/a | 400/401/503 | Governance service/route tests | Add Superadmin UI states for blocked/degraded/missing |
| `/api/platform/v1/guard/*` | partial | Guard rules, overrides, validate deploy, policy services | Platform/service auth or dashboard-derived auth by route | Sensitive policy mutation | Rules/override audit helpers exist | API n/a | JSON failures | Guard service/route tests | Require explicit permission names for overrides/rules |
| `/api/platform/v1/entitlements/evaluate`, `/resolve`, `/entitlements` | partial | Commerce entitlement services and schemas | Service token/control-plane auth | Read/evaluate; mutation if POST route writes | Evaluation source exists; mutation audit needs method-by-method proof | API n/a | 401/403/402/422/503 patterns | Entitlement route tests | Do not expose Superadmin mutation UI until reason/audit/test exist |
| `/api/ecosystem/entitlements` | real | `lib/ecosystem/entitlements.ts`, ecosystem route | Service/dashboard auth as route defines | Read/evaluate | Partial audit | API n/a | JSON errors | Route tests | Keep frontend-only entitlement decisions forbidden |
| `/api/platform/v1/billing/portal-session`, `/api/billing/*`, `/api/dashboard/billing/*` | partial | Billing services, Stripe, workspace catalog/mode/mirror | Dashboard owner/admin or service token depending route | Sensitive billing mutation | Partial; checkout/portal/mode/verification tests exist | API n/a | JSON/Stripe failures | Billing route tests | Add full billing mutation audit matrix and reason category |
| `/api/platform/v1/commerce/*` | partial | Commerce verification, billing-state, webhook replay services | Platform/service/dashboard guard by route | Sensitive billing verification/replay | Partial | API n/a | JSON failures | Many commerce route tests | Prove replay/override kill-switch before UI exposure |
| `/dashboard/commerce`, `/dashboard/meter` | partial | Usage, catalog, billing/entitlement dashboard modules | Dashboard workspace session | Read-only/planned mutation | Partial | Present | Partial | Module tests | Add explicit Verixet source-of-truth labels |
| `/dashboard/configure`, `/dashboard/integrations`, `/dashboard/integration-readiness`, `/dashboard/connect`, `/dashboard/apps` | partial | Integration center and XFlow hub/redirects | Dashboard workspace session; owner/admin for setup | Sensitive integration mutation | Partial | Present | loading/error on some | Integration tests | Replace "connected apps" health with contract checklist |
| `/dashboard/assistant`, `/dashboard/assist`, `/api/dashboard/assistant*`, `/api/ecosystem-assistant/*` | partial | Ecosystem assistant packages, Vera memory, assistant routes | Dashboard workspace session; owner/admin for actions | Safe/sensitive assistant action | Assistant memory writes audit events; prompt redaction needs proof | Present | loading/error | Assistant API tests | Add prompt/completion body redaction assertions |
| `/dashboard/support-tickets`, `/api/support/conversations` | partial | Support conversations/operator issues | Dashboard workspace session | Safe/sensitive support reply | Partial | Present | Partial | Limited | Keep replies disabled unless permission/audit exists |
| `/dashboard/security`, `/api/dashboard/security/**` | partial | Dashboard sessions, WebAuthn, TOTP, recovery-code services | Dashboard session plus step-up where applicable | Sensitive account security mutation | Security events/audit partial | Present | loading/error | Security route tests | Add Superadmin support metadata separation |
| `/dashboard/reports`, `/dashboard/evidence-vault` | partial | Evidence/report metadata tables and modules | Workspace admin/owner for reports | Read/export/planned generation | Partial | Present | Partial | Report/dashboard tests | Keep file generation disabled unless storage backend exists |
| `/dashboard/risk-engine`, `/dashboard/rules-automation` | partial | Guard validation/rules/risk modules | Dashboard workspace session | Sensitive rule mutation planned | Partial | Present | Partial | Risk/rules tests | Require rule mutation scoped permission and audit |
| `/dashboard/data-sources`, `/dashboard/data-sources/new` | partial | `dataSources` table and provider adapters | Dashboard workspace session; owner/admin for mutation | Sensitive provider credential/config mutation | Partial | Present | Partial | Provider tests | Mask credentials and require exact permission before create/update |
| `/dashboard/kyc-verification`, `/dashboard/users-kyc` | partial | KYC module/redirect | Workspace admin/owner | Sensitive review/planned mutation | Partial | Present | Page tests | KYC page tests | Keep identity mutation disabled unless backend exists |
| `/dashboard/address-lookup`, `/dashboard/sanctions`, `/dashboard/threats`, `/dashboard/alerts`, `/dashboard/wallet-monitor`, `/dashboard/cases`, `/dashboard/announcements`, `/dashboard/delivery`, `/dashboard/traffic`, `/dashboard/onboarding`, `/dashboard/docs`, `/dashboard/build`, `/dashboard/playground` | partial | Mixed real dashboard modules, provider adapters, redirects, docs, playground | Dashboard session; elevated role for playground | Mostly read-only/planned mutation | Partial | Present on many modules | Partial | Module/page tests | Classify non-Verixet-source-of-truth content as workspace feature modules, not Superadmin truth |

## UI Card, Table, And Status Realness Matrix

| UI surface | Classification | Evidence | Why not more complete |
| --- | --- | --- | --- |
| Superadmin sidebar/nav items | live data | `DashboardShellNav.tsx`, `dashboard-shell.test.ts`, `audit:dashboard` output | Nav visibility is guarded, but nav itself is not a backend status surface |
| Ecosystem app status cards | partially live | `/dashboard/ecosystem`, `ecosystem-contracts/apps.json`, `routes.json` | Contract registry exists, but per-app health, verify-self, event push, policy, guard override, and issue lifecycle are not all verified in one matrix-backed UI |
| Billing workspace overview cards | partially live | `billing-workspace-overview.ts`, `/api/dashboard/billing/overview`, `workspaceStripeConnections` | Real data exists; full Superadmin mutation/audit/permission proof is incomplete |
| Plans/entitlements Superadmin tables | partially live | admin plans page, `canonical-catalog.ts`, commerce entitlement services | Review source exists; no approved broad entitlement mutation UI |
| Activation status displays | partially live | `/api/verixet/activate/status`, `xflowAppActivationBindings`, `activation-response-preview.ts`, activation status tests | Status is persisted/readable; public status API now omits raw response preview, but entitlement admission remains explicit partial/planned |
| API key tables | partially live | `apiKeys`, `apiKeySecrets`, key pages/routes | Real data and mutations exist; exact confirmation/reason/audit proof must be completed method by method |
| Webhook endpoint tables | partially live | `webhookEndpoints`, `webhookEventSubscriptions`, dashboard webhook routes | Secrets are hashed/encrypted, but retry/replay controls need kill-switch/reason/audit proof |
| Webhook delivery tables | live data | `webhookOutboundDeliveries`, `webhook-delivery-summary.ts`, delivery route | Real delivery ledger; ensure payload body stays omitted/redacted in all detail views |
| Stripe webhook processing tables | live data | `stripeWebhookEvents`, `stripeWebhookProcessing`, Stripe webhook tests | Provider signature and processing ledger are real; replay UI remains sensitive/partial |
| Audit log tables | live data | `auditEvents`, `/dashboard/audit`, `audit-export.ts` | Real audit table; full redaction matrix for all metadata producers remains needed |
| Operational logs/request tables | partially live | `requestsLog`, transaction/log loaders | Real rows; request/response body redaction requires route-by-route proof |
| Governance check status | partially live | `/api/ecosystem/deployments/governance/check`, `deploy-governance/service.ts` | API is real; Superadmin UI state coverage is incomplete |
| Issue inbox/lifecycle tables | partially live | `xflow-issue-actions.ts`, `issue-sync.ts`, `operatorIssues` | Status lifecycle exists in pieces; assignment/replies are not fully proven |
| Support ticket tables | partial | support module/routes | Some real module data; reply/action lifecycle audit is incomplete |
| Provider/app readiness cards | partially live | system health, operational health, provider adapters | Some cards infer health from aggregates; labels must stay observed/degraded/missing, not blanket healthy |
| Transactions diagnostics status | partially live | `transactions/diagnostics.ts` | Fixed to avoid claiming connected before request rows exist |
| Placeholder/planned module actions | disabled | module pages and disabled controls | Correct classification as unavailable until backend contract exists |

## Ecosystem App Contract Matrix

Connection health alone is not implementation completeness.

| App | Contract | Health | Verify-self | Event push | Policy | Deploy validation | Guard override | Issue lifecycle | Billing/entitlement | Current risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| xflow | real | partial | partial | partial | partial | partial | partial | partial | partial | High: Superadmin UI can overread link health as full contract implementation |
| verixet | real | real | real | partial | partial | real | partial | partial | real | Medium: broad UI needs stricter source labels |
| audaix | real | partial | partial | partial | partial | partial | partial | partial | partial | High |
| rataify | real | partial | partial | partial | partial | partial | partial | partial | partial | High |
| wordgeni | real | partial | partial | partial | partial | partial | partial | partial | partial | High |
| crevux | real | partial | partial | partial | partial | partial | partial | partial | partial | High |

## Billing And Entitlement Source-Of-Truth Matrix

| Truth area | Status | Source evidence | UI/API consumer | Risk | Next phase |
| --- | --- | --- | --- | --- | --- |
| Tenant/workspace plans | partial | `canonical-catalog.ts`, `commerce/plans-entitlements.ts`, `workspaces` catalog fields | Billing pages, platform catalog APIs | Some consumer-local catalog drift still possible | Generate contract-backed catalog snapshots for consumers |
| Subscription status | partial | Stripe billing services, `workspaceXflowBillingLink`, billing lifecycle summaries | Billing overview/status APIs | Full lifecycle mutation audit incomplete | Add mutation/audit matrix for every transition |
| Entitlements | partial | `commerce/entitlements-evaluate.ts`, `platform/v1/entitlements/evaluate`, `core.entitlements` in shared schema | Platform entitlement APIs | No broad Superadmin mutation UI should be enabled | Add reason category and audit requirement for mutations |
| Usage limits | partial | usage ingest/report routes, `usage-metrics` contracts | Meter/commerce surfaces | App enforcement proof varies | Add app-by-app enforcement tests |
| Billing state | partial | `/api/platform/v1/commerce/billing-state`, `/api/billing/status`, Stripe webhook processing | XFlow/settings/dashboard | Status freshness labels must be explicit | Add freshness timestamp UI rules |
| Activation state | real | `xflowAppActivationBindings`, `/api/verixet/activate`, `/status`, `entitlement-admission.ts` | XFlow setup/activation flows | Activation remains signal-delivery state; Phase 2B adds server-side Verixet admission before any activation-driven access decision | Keep admission read-only and fail-closed; add staging e2e proof |
| Feature access | partial | entitlement evaluation services | App consumers | Consumer fallback behavior not fully audited | Fail closed in consumers when Verixet unavailable |
| App-level access | partial | connected app/meter/XFlow bindings | XFlow app pages | Connection can be mistaken for implementation | Contract checklist UI |
| Workspace-level access | real | `workspaceMembers`, `platformSuperAdmins`, `get-workspace.ts` | Dashboard layout/pages | Scoped permission model not granular enough | Introduce named Superadmin permissions |

## Mutation Risk Matrix

| Action | Classification | Current state | Required guardrail |
| --- | --- | --- | --- |
| Audit/log export | Safe mutation/read export | Partially implemented | Admin/platform guard, redaction tests |
| Billing checkout/portal/top-up/plan change | Sensitive mutation | Implemented in parts | Owner/admin or service auth, idempotency, audit, preview, tests |
| Entitlement grant/revoke | Sensitive mutation | No broad approved UI | Scoped permission, exact reason category, audit event, confirmation |
| Activation flow | Sensitive mutation | Implemented and persisted | Activation can verify setup only; access expansion must use `resolveEntitlementAdmission` and fails closed |
| API key create/rotate/revoke/delete | Sensitive/destructive | Implemented in parts | Owner/admin, exact confirmation for revoke/delete, audit, redaction, tests |
| Webhook endpoint create/update/secret/test | Sensitive mutation | Implemented in parts | Owner/admin, secret masking, audit, tests |
| Webhook retry/replay/reprocess | Sensitive mutation | Internal/platform APIs exist | Keep disabled unless kill-switch, reason, audit, scoped permission, tests |
| Tenant suspension/reactivation | Sensitive mutation | Missing/planned | Do not implement without separate approval |
| Tenant deletion/wipe/purge | Destructive mutation | Missing/planned | Must remain unavailable |
| Provider credential mutation | Sensitive mutation | Some Stripe/data-source flows exist | Masking, encryption, exact permission, audit, tests |
| Guardrail override/rule mutation | Sensitive mutation | APIs/services exist | Platform permission, reason, audit, tests |
| Issue status change | Safe/sensitive mutation | Partial | Owner/admin/platform guard, audit, no fake resolved state |
| Support reply | Sensitive mutation | Partial/planned | Permission, audit, content redaction |
| Deployment control | Destructive/sensitive | Not implemented by governance check | Governance check only; XFlow enforces deployment |

## Audit Event Coverage Matrix

| Event family | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Activation changes | real | `/api/verixet/activate`, `insertAuditEvent` actions `xflow.signal_activation.*`, `xflow.entitlement_admission.checked` | Add staging e2e proof for denied/admitted admission paths |
| Activation status reads | partial | `/api/verixet/activate/status` action `verixet.activation_status.read`; route test proves `last_response_body_preview` is omitted and admission metadata is returned | Broader status UI consumption remains partial |
| Entitlement changes | partial | entitlement services/schema | Mutation audit not fully approved |
| Billing status changes | partial | Stripe webhook processing and billing APIs | Method-by-method audit inventory needed |
| Tenant suspension/reactivation | missing | No approved surface found | Do not add in this pass |
| Webhook retry/replay | partial | internal replay/reprocess routes | Need reason/kill-switch/UI disabled proof |
| API key create/revoke/rotate | partial | key routes/actions/tests | Complete exact confirmation/audit matrix |
| Workspace config changes | partial | workspace page/actions | Need reason categories for risky fields |
| Provider config changes | partial | Stripe connection/data-source paths | Need credential redaction/audit proof |
| Issue lifecycle changes | partial | `xflow-issue-actions.ts`, operator issue services | Assignment/reply lifecycle incomplete |
| Support replies | partial | support conversations route | Keep unavailable until audited |
| Governance/deployment checks | real | deploy governance route/service | Add UI degraded/missing states |
| Guardrail overrides | partial | guard overrides service/routes | Need scoped permission names |

## Highest-Risk Gaps

1. Activation can persist and verify app activation. Phase 2B added a Verixet-owned admission resolver and route/helper integration so activation cannot be the access decision by itself; staging e2e proof is still missing.
2. Superadmin UI has many partial real-data surfaces; green/connected/healthy wording must be continually tied to observed backend evidence, not configuration or URL presence.
3. API key, webhook, billing, provider credential, and guard override mutations need a complete method-by-method proof of permission, confirmation/reason, audit event, and tests.
4. Ecosystem app contract completeness is not equivalent to connection health. Most non-Verixet apps remain partial for verify-self, policy, guard override, issue lifecycle, and entitlement enforcement proof.
5. Audit metadata redaction is not yet proven for every producer. Phase 2A removed public exposure of activation `last_response_body_preview` and redacts internal activation response previews, but broader request/response preview producers remain partially audited.

## Prioritized Phase Plan

| Phase | Goal | Work |
| --- | --- | --- |
| P0 | Truthfulness and safety | Keep destructive tenant, entitlement, webhook retry, and provider mutation controls disabled unless fully proven. Remove unsupported green/connected labels. |
| P1 | Permission and audit matrix | Add named Superadmin permissions and route-by-method guard proof for billing, entitlements, API keys, webhooks, guard overrides, issues, and provider config. |
| P2 | Entitlement-before-activation | Phase 2B added `resolveEntitlementAdmission`, activation/status integration, safe denial reasons, fail-closed checks, and focused tests. Remaining work is staging e2e proof and broader consumer rollout. |
| P3 | Contract completeness UI | Replace connected-app status with app-by-app contract checklist: contract, health, verify-self, event push, policy, deploy validation, guard override, issue lifecycle, billing mapping. |
| P4 | Redaction hardening | Add tests proving no raw secrets, API keys, webhook bodies, provider credentials, prompt/completion bodies, private content, or unredacted tokens appear in audited APIs/UI. |
| P5 | Staging Superadmin proof | Run positive-path platform owner e2e with disposable staging account and non-destructive mutation probes only. |

## Phase 2A Activation Safety Update

Date: 2026-06-30

What was fixed:

- Removed `last_response_body_preview` from the public/admin `GET /api/verixet/activate/status` response. The DB column remains for internal persistence, but the status API no longer exposes it.
- Added centralized activation response preview redaction in `apps/Verixet/src/lib/xflow/activation-response-preview.ts` and routed XFlow activation registration/delivery previews through it before they are returned, logged, or persisted by the activation bridge.
- Added focused tests proving activation status does not expose raw provider response bodies, token/API-key/webhook-secret shapes are redacted, and activation status responses do not grant or imply entitlement access.
- Updated billing activation UI copy from "Billing activation" to "Billing verification signal" and added explicit copy that activation/verification signals do not grant plan, paid feature, or ecosystem access.
- Updated the XFlow dashboard header copy so signal delivery and links are not described as production readiness without billing and entitlement admission review.

Exact files changed for Phase 2A:

- `apps/Verixet/src/app/api/verixet/activate/status/route.ts`
- `apps/Verixet/src/app/api/verixet/activate/status/route.test.ts`
- `apps/Verixet/src/lib/xflow/activation-response-preview.ts`
- `apps/Verixet/src/lib/xflow/activation-response-preview.test.ts`
- `apps/Verixet/src/lib/xflow/xflow-fully-connect.ts`
- `apps/Verixet/src/lib/xflow/xflow-fully-connect.test.ts`
- `apps/Verixet/src/components/dashboard/BillingActivationStatusCard.tsx`
- `apps/Verixet/src/components/dashboard/BillingActivationStatusCard.test.tsx`
- `apps/Verixet/src/app/dashboard/(main)/xflow/page.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Preview decision:

- Public/admin activation status: `last_response_body_preview` was removed from the response.
- Internal activation bridge: response previews remain for activation diagnostics, but are redacted through `redactActivationResponsePreview` before return/log/persist.

Revised activation exposure risk:

- Before Phase 2A: High, because status reads could expose `last_response_body_preview` directly.
- After Phase 2A: Medium, because public/admin status exposure is removed and the activation bridge has focused redaction tests. Remaining risk is broader response-preview producers outside activation status, plus lack of end-to-end proof across every UI/API consumer.

Remaining activation/entitlement gaps:

- Activation is still not an entitlement/admission decision. `GET /api/verixet/activate/status` now returns `entitlement_admission.status = not_evaluated` and notes that access must resolve through Verixet billing/entitlement logic.
- No billing mutation, entitlement mutation, or access-grant mutation was implemented in this pass.
- Entitlement admission before any ecosystem access expansion remains planned/partial and should be implemented as a separate guarded phase with audit metadata.
- XFlow hosted-hub readiness probes still have separate `response_body_preview` handling and tests; they were reviewed in the grep scan but were not broadened into this activation-status fix.

Phase 2A validation results:

- `npm --prefix apps/Verixet run test -- src/app/api/verixet/activate/status/route.test.ts src/lib/xflow/activation-response-preview.test.ts src/lib/xflow/xflow-fully-connect.test.ts src/components/dashboard/BillingActivationStatusCard.test.tsx "src/app/dashboard/(main)/xflow/page.test.tsx"` passed: 5 files, 11 tests.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlements-evaluate.test.ts src/app/api/platform/v1/entitlements/evaluate/route.test.ts src/app/api/ecosystem/entitlements/route.test.ts` passed: 3 files, 7 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- Grep scan for `last_response_body_preview`, `response_body`, `Authorization`, `Bearer`, `token`, `secret`, `apiKey`, `webhook payload`, `connected`, `enabled`, and `active` completed across activation API, XFlow activation/readiness libraries, and billing/XFlow dashboard surfaces. Reviewed hits were schema fields, tests, internal bearer attachment, redaction tests, OAuth/readiness terminology, or remaining documented partial gaps; `last_response_body_preview` now appears only in the DB schema and the regression assertion that the status API omits it.

## Phase 2B Entitlement Admission Gate Update

Date: 2026-06-30

Admission behavior added/proven:

- Added `apps/Verixet/src/lib/commerce/entitlement-admission.ts` as the Verixet-owned server-side admission resolver for activation-driven ecosystem access decisions.
- Admission is separate from activation. Activation may become `pending` or `verified`, but access admission is represented by a separate `entitlement_admission` decision.
- Admission admits only when Verixet billing/entitlement state resolves to an active or trialing paid app entitlement. Free baseline, missing entitlement, inactive billing, plan mismatch, workspace/app mismatch, or resolver failure deny access.
- Safe denial statuses are `blocked_by_billing`, `blocked_by_plan`, `blocked_by_workspace_policy`, and `unavailable_unverified`; no provider secrets, subscription ids, raw DB errors, or private payloads are included in denial reasons.
- `/api/verixet/activate` resolves admission before scheduling activation delivery, includes the decision in the response, writes admission metadata through the existing activation audit helper, and passes admission metadata to the XFlow activation signal.
- `/api/verixet/activate/status` resolves current admission server-side and returns it with activation status while continuing to omit `last_response_body_preview`.
- `lib/ecosystem/entitlements.ts` now uses admission as the final app-access decision, so frontend calls cannot bypass admission by relying on baseline activation or older app-access checks.

Fail-closed behavior:

- Missing entitlement: denied as `unavailable_unverified` / `entitlement_not_found`.
- Entitlement lookup failure: denied as `unavailable_unverified` / `entitlement_unavailable`.
- Inactive, past-due, canceled, unpaid, or absent billing state: denied as `blocked_by_billing` / `billing_inactive`.
- Free baseline or non-paid plan: denied as `blocked_by_plan` / `plan_not_entitled`.
- App/workspace mismatch: denied as `blocked_by_workspace_policy` / `workspace_policy_blocked`.

Exact files changed for Phase 2B:

- `apps/Verixet/src/lib/commerce/entitlement-admission.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission.test.ts`
- `apps/Verixet/src/lib/ecosystem/entitlements.ts`
- `apps/Verixet/src/lib/ecosystem/entitlements.test.ts`
- `apps/Verixet/src/app/api/verixet/activate/route.ts`
- `apps/Verixet/src/app/api/verixet/activate/route.test.ts`
- `apps/Verixet/src/app/api/verixet/activate/status/route.ts`
- `apps/Verixet/src/app/api/verixet/activate/status/route.test.ts`
- `apps/Verixet/src/lib/xflow/xflow-fully-connect.ts`
- `apps/Verixet/src/lib/xflow/xflow-fully-connect.test.ts`
- `apps/Verixet/src/components/dashboard/BillingActivationStatusCard.tsx`
- `apps/Verixet/src/components/dashboard/BillingActivationStatusCard.test.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Remaining gaps:

- No billing mutation, entitlement mutation, grant/revoke UI, or tenant policy mutation was added.
- Admission is now enforced in activation/access helper paths, but not every legacy UI copy surface in the broader XFlow hub has been converted from "connected apps" wording to admission-first wording.
- Staging e2e proof with real billing/entitlement rows is still needed.
- Tenant/workspace policy is represented as a safe admission denial status, but there is no new tenant suspension/reactivation or broad RBAC implementation in this pass.

Phase 2B validation results:

- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlement-admission.test.ts src/lib/ecosystem/entitlements.test.ts src/app/api/verixet/activate/route.test.ts src/app/api/verixet/activate/status/route.test.ts src/lib/xflow/xflow-fully-connect.test.ts src/components/dashboard/BillingActivationStatusCard.test.tsx` passed: 6 files, 16 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `active`, `enabled`, `connected`, `entitled`, `access granted`, `production-ready`, `bypass`, and `force grant` completed across the touched activation/admission, ecosystem entitlement, XFlow bridge, and dashboard copy surfaces. Reviewed hits were expected code statuses, test assertions, safe admission statuses, or documented broader XFlow hub wording; no touched activation/admission path labels activation as access granted.

## Phase 2C XFlow Connected-State Truthfulness And Admission Proof

Date: 2026-06-30

Wording/status changes:

- Replaced visible XFlow hub wording that implied broad connected/readiness state with evidence-specific labels:
  - `Connected apps` -> `App link evidence` or `XFlow app link evidence`
  - `Fully operational` -> `Signal verified`
  - `FULLY CONNECTED` -> `LINK EVIDENCE COMPLETE`
  - `PARTIALLY CONNECTED` -> `PARTIALLY LINKED`
  - `Reconnect` -> `Reauthorize` where the underlying action is OAuth reauthorization
- Updated adjacent dashboard copy in Integrations, Connect App, Access & Billing Control, Billing, Workspace, Ecosystem, Keys, Webhooks, AppConnectionTable, and CommandCenterHero to avoid implying activation/link state equals access, production readiness, or entitlement admission.
- XFlow can display link and signal evidence, but copy now states entitlement admission remains resolved by Verixet billing/entitlement state.

Seeded admission proof cases added:

- Paid active entitlement admits access.
- Missing entitlement denies access.
- Free/baseline plan denies paid ecosystem access.
- Inactive/past-due/canceled/unpaid billing denies access.
- Workspace/app policy mismatch denies access.
- Resolver/internal error denial reasons stay safe and do not expose raw billing/provider/internal error content.

Exact files changed for Phase 2C:

- `apps/Verixet/src/components/dashboard/XFlowConnectedAppsHub.tsx`
- `apps/Verixet/src/components/dashboard/XFlowConnectedAppsHub.test.ts`
- `apps/Verixet/src/components/dashboard/XFlowConnectionHub.tsx`
- `apps/Verixet/src/components/dashboard/XFlowAppSignalTestButton.tsx`
- `apps/Verixet/src/components/dashboard/AppConnectionTable.tsx`
- `apps/Verixet/src/components/dashboard/CommandCenterHero.tsx`
- `apps/Verixet/src/lib/xflow/xflow-hub-guidance.ts`
- `apps/Verixet/src/lib/xflow/xflow-hub-guidance.test.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission.test.ts`
- `apps/Verixet/src/lib/dashboard/command-center.ts`
- `apps/Verixet/src/app/dashboard/(main)/xflow/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/xflow/page.test.tsx`
- `apps/Verixet/src/app/dashboard/(main)/connect/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/access-billing-control/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/billing/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/workspace/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/ecosystem/page.tsx`
- `apps/Verixet/src/app/dashboard/(main)/keys/KeysAccessCommandView.tsx`
- `apps/Verixet/src/app/dashboard/(main)/webhooks/WebhookSetupClient.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Mutation scope:

- No billing mutation, entitlement mutation, API-key CRUD, webhook retry execution, tenant suspension/reactivation, provider credential mutation, impersonation, deployment controls, or broad RBAC rewrite was added.

Remaining partial areas:

- Repository-wide words like `active` and `enabled` remain in legitimate schema, CSS, billing, API-key, role, and provider contexts. This pass narrowed XFlow/admission truthfulness rather than renaming every domain status.
- Some non-XFlow module pages still use local domain terms such as active keys, active roles, enabled tools, or connected providers where those map to their own backend evidence. Those were not reclassified in this phase.
- Browser/e2e proof with seeded database rows is still not run; Phase 2C proof is focused unit/component fixtures.

Phase 2C validation results:

- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlement-admission.test.ts src/components/dashboard/XFlowConnectedAppsHub.test.ts src/lib/xflow/xflow-hub-guidance.test.ts "src/app/dashboard/(main)/xflow/page.test.tsx" src/components/dashboard/BillingActivationStatusCard.test.tsx src/lib/dashboard/command-center.test.ts src/lib/dashboard/command-center-view.test.tsx` passed: 7 files, 49 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `connected apps`, `production-ready`, `access granted`, `enabled`, `active`, `force grant`, and `bypass billing` completed across dashboard, XFlow, and commerce surfaces. Reviewed residual hits were legitimate backend/status words (`active` billing/API-key/role statuses, `enabled` entitlement values/env flags, CSS active classes) or existing non-XFlow module terminology; the cleaned XFlow/admission surfaces no longer use activation/link state as access-granted language.

## Phase 2D Staging/Browser Admission Proof

Date: 2026-06-30

What was proven:

- A deterministic browser-capturable proof harness now exercises the same Verixet-owned admission decision used by activation/status paths.
- Activation remains represented as `signal_verified` evidence only; API-shaped admission response determines whether access is admitted.
- The proof harness does not execute billing mutation, entitlement mutation, API-key CRUD, webhook retry execution, tenant suspension/reactivation, provider credential mutation, impersonation, deployment controls, or broad RBAC rewrites.
- The generated API/UI proof evidence does not expose authorization headers, bearer tokens, API keys, secrets, cookies, webhook payloads, provider responses, raw request/response bodies, stack traces, live-provider keys, or subscription ids.

Seeded cases covered:

| Case | Seed data | API admission/status result | UI state shown | Sensitive/internal exposure |
|---|---|---|---|---|
| Paid active entitlement admits access | `ws_phase2d_active`, app `xflow`, plan `xflow_pro`, tier `pro`, billing `active` | `admitted: true`, `status: entitled`, `reason_code: entitlement_admitted` | `Signal verified` plus `Entitlement admitted` | No |
| Missing entitlement denies access | `ws_phase2d_missing`, app `xflow`, no entitlement row | `admitted: false`, `status: unavailable_unverified`, `reason_code: entitlement_not_found` | `Signal verified` plus `Unavailable/unverified` | No |
| Free/baseline plan denies paid ecosystem access | `ws_phase2d_free`, app `xflow`, plan `free`, tier `free`, billing `active` | `admitted: false`, `status: blocked_by_plan`, `reason_code: plan_not_entitled` | `Signal verified` plus `Blocked by plan` | No |
| Past-due billing denies access | `ws_phase2d_past_due`, app `xflow`, plan `xflow_pro`, billing `past_due` | `admitted: false`, `status: blocked_by_billing`, `reason_code: billing_inactive` | `Signal verified` plus `Blocked by billing` | No |
| Canceled billing denies access | `ws_phase2d_canceled`, app `xflow`, plan `xflow_pro`, billing `canceled` | `admitted: false`, `status: blocked_by_billing`, `reason_code: billing_inactive` | `Signal verified` plus `Blocked by billing` | No |
| Unpaid billing denies access | `ws_phase2d_unpaid`, app `xflow`, plan `xflow_pro`, billing `unpaid` | `admitted: false`, `status: blocked_by_billing`, `reason_code: billing_inactive` | `Signal verified` plus `Blocked by billing` | No |
| Workspace/app policy mismatch denies access | `ws_phase2d_policy_mismatch`, requested app `xflow`, entitlement app `verixet` | `admitted: false`, `status: blocked_by_workspace_policy`, `reason_code: workspace_policy_blocked` | `Signal verified` plus `Blocked by workspace/tenant policy` | No |

Evidence locations:

- JSON API/UI proof evidence: `apps/Verixet/output/phase2d/verixet-admission-proof.json`
- Browser-rendered proof page: `apps/Verixet/output/phase2d/verixet-admission-proof.html`
- Captured browser screenshot: `apps/Verixet/output/phase2d/verixet-admission-proof.png`

Exact files changed for Phase 2D:

- `apps/Verixet/src/lib/commerce/entitlement-admission.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission-proof-cases.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission-proof-cases.test.ts`
- `apps/Verixet/scripts/proof-phase2d-admission.ts`
- `docs/verixet-superadmin-gap-audit.md`

Validation results:

- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlement-admission.test.ts src/lib/commerce/entitlement-admission-proof-cases.test.ts` passed: 2 files, 12 tests.
- `npm exec -- tsx scripts/proof-phase2d-admission.ts` from `apps/Verixet` passed and generated JSON/HTML proof artifacts.
- `npm exec -- playwright screenshot --full-page file:///.../output/phase2d/verixet-admission-proof.html output/phase2d/verixet-admission-proof.png` passed and captured browser evidence.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlement-admission.test.ts src/lib/commerce/entitlement-admission-proof-cases.test.ts src/lib/ecosystem/entitlements.test.ts src/app/api/verixet/activate/route.test.ts src/app/api/verixet/activate/status/route.test.ts src/components/dashboard/XFlowConnectedAppsHub.test.ts "src/app/dashboard/(main)/xflow/page.test.tsx"` passed: 7 files, 26 tests.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for misleading labels and leaked sensitive fields completed across the Phase 2D proof source and generated evidence. Reviewed hits were expected `active` billing/admission statuses, `billing_inactive` reason codes, and unsafe-pattern assertions inside the test file; no raw secret, token, API-key, webhook payload, provider response, request body, response body, stack trace, or live-provider key was present in generated API/UI evidence.

Skipped checks:

- `npm --prefix apps/Verixet run test:e2e:dashboard` was not run because local authenticated dashboard fixtures are unavailable: `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, and `E2E_PLATFORM_SUPER_ADMIN_API_KEY` are not set. The Phase 2D browser proof used generated seeded admission evidence rendered and captured by Playwright instead.

Remaining partial areas:

- Phase 2D proves the admission gate with seeded local rows and browser-rendered evidence, not a deployed staging database with real tenant/workspace rows.
- Authenticated dashboard e2e remains fixture-dependent and should be rerun when seeded API keys and database rows are available.
- No new mutation UI or grant/revoke workflow was added; entitlement/billing changes still require a separate, permissioned mutation phase.

Recommended next phase:

- Phase 2E should run the same admission proof against a real staging database with seeded workspace/app rows and authenticated dashboard API keys, then archive the API responses, screenshots, and audit logs as release evidence.

## Phase 2E Real Staging Admission Proof

Date: 2026-06-30

Result: blocked, not proven. Rerun after fixture-preflight request remained blocked.

Blocked reason:

- Real authenticated staging/browser proof requires authenticated dashboard fixture keys and staging/local database access.
- The current shell environment does not contain `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `DATABASE_URL`, `POSTGRES_URL`, `VERIXET_DATABASE_URL`, or `E2E_BASE_URL`.
- Local `apps/Verixet/.env` contains database URL keys, but the required authenticated e2e API-key fixtures are absent except in `apps/Verixet/.env.e2e.example`.
- Because the authenticated fixture keys are missing, Phase 2E did not run authenticated admission/status API calls, dashboard/XFlow screenshots, or audit-log reads. No staging proof is claimed.
- Rerun preflight again found `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `DATABASE_URL`, `VERIXET_DATABASE_URL`, and `E2E_BASE_URL` missing from the current shell environment. No secret values were printed.

Seed cases requested but not proven in Phase 2E:

| Case | Phase 2E status | Reason |
|---|---|---|
| Paid active entitlement admits access | Skipped | Missing authenticated e2e API-key fixtures |
| Missing entitlement denies access | Skipped | Missing authenticated e2e API-key fixtures |
| Free/baseline plan denies paid ecosystem access | Skipped | Missing authenticated e2e API-key fixtures |
| Past-due billing denies access | Skipped | Missing authenticated e2e API-key fixtures |
| Canceled billing denies access | Skipped | Missing authenticated e2e API-key fixtures |
| Unpaid billing denies access | Skipped | Missing authenticated e2e API-key fixtures |
| Workspace/app policy mismatch denies access | Skipped | Missing authenticated e2e API-key fixtures |

Evidence locations:

- No Phase 2E authenticated API evidence generated.
- No Phase 2E dashboard/XFlow screenshots generated.
- No Phase 2E audit-log evidence generated.
- Phase 2D seeded/browser evidence remains available at `apps/Verixet/output/phase2d/`, but it is not a substitute for Phase 2E real authenticated staging proof.

Validation and skipped checks:

- Environment fixture check ran and found `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `DATABASE_URL`, `POSTGRES_URL`, `VERIXET_DATABASE_URL`, and `E2E_BASE_URL` missing from the current shell environment.
- `.env` key-name check ran without printing secret values. It found database URL keys in `apps/Verixet/.env`, and found e2e key names only in `apps/Verixet/.env.e2e.example`.
- `npm --prefix apps/Verixet run test:e2e:dashboard` skipped by policy: running it without `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, and `E2E_PLATFORM_SUPER_ADMIN_API_KEY` would only skip authenticated tests and would not prove staging admission.
- `npm --prefix apps/Verixet run typecheck` passed on the rerun.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings on the rerun.
- `npm run proof:billing-contracts` passed on the rerun: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Focused staging/e2e admission tests were not run because the authenticated fixture preflight failed.
- Generated-evidence grep scans were not run for Phase 2E because no Phase 2E authenticated evidence files were generated.

Remaining gaps:

- Real staging/local-authenticated admission proof is still missing.
- Seeded workspace/app/billing/entitlement rows have not been verified through authenticated API calls.
- Dashboard/XFlow/activation UI evidence has not been captured from an authenticated staging/local environment.
- Read-only audit-log evidence for admission checks has not been captured.

Recommended next phase:

- Provide non-production `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, and a staging/local test database URL, or run `npm --prefix apps/Verixet run bootstrap:e2e-env` against a disposable non-production database to generate them. Then rerun Phase 2E without changing mutation behavior.

## Phase 3 Read-Only Superadmin Completion

Date: 2026-06-30

Result: partially complete. Read-only Superadmin route added; no mutation behavior added. Phase 2E remains blocked.

Route/source inventory result:

- New guarded route: `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- Read-only service: `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- Guard evidence: route requires `getDashboardUserId()` and `isPlatformSuperAdmin(userId)` before rendering; unauthenticated users are redirected, non-platform-super-admin users receive `notFound()`.
- Error state: service catches backend query failures, sanitizes the message, and the page renders `Read-only data unavailable` without stack traces or raw provider/database details.
- Empty state: every table renders an honest empty state when the backend source is reachable but has no rows.
- Loading state: dashboard route inherits the existing dashboard loading boundary; no client mutation/loading action was added.

Phase 3 read-only surface matrix:

| Surface | Status | UI classification | Backend source | Guard / permission evidence | Redaction evidence | Notes |
|---|---|---|---|---|---|---|
| Tenants / workspaces table | `real` | `live data` | `workspaces` table | platform-super-admin route guard | owner email/profile content omitted | Read-only bounded query. |
| Billing / subscription table | `real` | `live data` | `commerce_subscriptions`, legacy `subscriptions` tables | platform-super-admin route guard | provider subscription/customer ids shortened; metadata omitted | No checkout, portal, or billing mutation controls. |
| Entitlement / admission table | `partial` | `partially live` | `entitlement_grants` table, Phase 2 admission resolver evidence | platform-super-admin route guard | entitlement value bodies omitted; value key names only | Live grants are shown, but per-workspace admission decision rows still need a resolver-backed read endpoint. |
| Activation status table | `partial` | `partially live` | `commerce_verification_runs` table | platform-super-admin route guard | checkout sessions, metadata snapshots, and failure bodies omitted | Verification runs are live readiness evidence, not a full activation signal bridge inventory. |
| API key inventory table | `real` | `live data` | `api_keys` table | platform-super-admin route guard | raw API keys and key hashes omitted; fingerprints only | No create, revoke, or rotate controls. |
| Webhook delivery log table | `real` | `live data` | `webhook_outbound_deliveries` table | platform-super-admin route guard | payload body omitted; errors sanitized/truncated | No retry execution. |
| Audit log table | `real` | `live data` | `audit_events` table | platform-super-admin route guard | metadata body omitted; non-sensitive metadata key names only | Read-only audit event inventory. |
| Provider readiness table | `partial` | `partially live` | `commerce_verification_runs` table | platform-super-admin route guard | provider credentials and raw provider responses omitted | Shows verification readiness, not credential inventory. |
| Ecosystem contract matrix table | `partial` | `static placeholder` | canonical app slug list plus `validate:ecosystem-contracts` CLI proof | platform-super-admin route guard | no sensitive fields displayed | Needs a read-only contract repository/API to become `real`. |
| Issues / support inbox table | `real` | `live data` | `support_tickets` table | platform-super-admin route guard | ticket titles and metadata omitted as private customer content | No assignment/status mutation. |

Security/redaction evidence:

- `apiKeyFingerprint()` returns a prefix plus key id suffix only; raw keys and `key_hash` are not selected for UI display.
- `webhookOutboundDeliveries.payload` is not exposed; the UI displays `payload: omitted`.
- `auditEvents.metadata` and entitlement grant `value` bodies are not exposed; the UI displays non-sensitive key names only.
- Support ticket titles are rendered as `omitted_private_customer_content`.
- Provider ids are shortened with `shortIdentifier()`.
- Backend error messages are sanitized with all sensitive terms replaced before UI display.

Tests added:

- `apps/Verixet/src/lib/platform/superadmin-readonly.test.ts`
  - API-key fingerprint does not expose hash/key material.
  - Provider ids are shortened.
  - Sensitive metadata keys are omitted.
  - Backend error messages are sanitized.
  - All ten requested Phase 3 surfaces are classified.

Remaining partial/planned/missing areas:

- Entitlement/admission table is partially live until a read-only admission-decision repository/API returns current decisions per workspace/app without mutation.
- Activation status table is partially live because verification runs are available, but a full activation signal bridge inventory is not yet exposed as a read-only Superadmin source.
- Provider readiness is partially live because it reflects verification runs, not provider credential/config source state.
- Ecosystem contract matrix is a static placeholder backed by the canonical app list and CLI proof; it needs a read-only contract source to become `real`.
- Phase 2E real authenticated staging/browser proof remains blocked until non-production `E2E_*` keys and database URL are loaded in this shell/session.

Exact files changed for Phase 3:

- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- `apps/Verixet/src/lib/platform/superadmin-readonly.test.ts`
- `docs/verixet-superadmin-gap-audit.md`

Validation results:

- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-readonly.test.ts` passed: 1 file, 5 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run audit:dashboard` passed. It now finds `/dashboard/admin/read-only`; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- `npm run validate:ecosystem-contracts` passed.
- Grep scan for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `password`, `cookie`, `webhook payload`, `response_body`, `request_body`, `provider response`, and `stack trace` completed across Phase 3 touched files and audit doc. Reviewed hits were redaction helper patterns, negative test assertions, and documentation that those values are omitted; no raw secret, raw key, bearer value, webhook payload body, provider credential, request/response body, private support title, or stack trace is exposed by the new read-only surface.
- Grep scan for `access granted`, `production-ready`, `fully connected`, `force grant`, `bypass billing`, `healthy`, `enabled`, and `active` completed across Phase 3 touched files and audit doc. Reviewed hits were prior-phase audit history and legitimate billing/admission status terms; the new read-only route does not label activation, readiness, or link state as access granted or production-ready.

## Phase 3B Read-Only Admission and Activation Signal Completion

Date: 2026-07-01

Result: partially complete. No mutation behavior added. Phase 2E real authenticated staging/browser proof remains blocked until non-production authenticated fixtures are loaded.

What changed:

- Entitlement/admission table now shows computed current Verixet admission decisions for recent workspaces and canonical app slugs by calling `resolveEntitlementAdmission`. It is still classified `partial` because there is no persisted historical admission-decision source.
- Activation status table is now an activation signal inventory backed by `xflow_app_activation_bindings`, `xflow_workspace_event_bindings`, `meter_app_xflow_links`, and `commerce_verification_runs`. It is classified `real` / `live data` because the route is guarded, queries real backend sources, and exposes only allow-listed fields.
- Provider readiness now distinguishes `configured`, `missing config`, `degraded`, `unavailable`, and `unverified` from activation and verification evidence. It remains `partial` because full provider credential/config inventory is still unavailable.
- Ecosystem contract matrix now reads canonical registry evidence from `ecosystem-contracts/apps.json` and `ecosystem-contracts/routes.json`. It is classified `real` / `partially live`; rows are explicitly `contract-defined_not_live`, not runtime health probes.

Phase 3B surface revisions:

| Surface | Revised status | UI classification | Backend/contract source | Notes |
|---|---|---|---|---|
| Entitlement / admission table | `partial` | `partially live` | `entitlement_grants`, `resolveEntitlementAdmission` | Computed current decisions only; no persisted historical admission decision table found. |
| Activation signal inventory | `real` | `live data` | `xflow_app_activation_bindings`, `xflow_workspace_event_bindings`, `meter_app_xflow_links`, `commerce_verification_runs` | Omits response previews, ingest URLs, bearer values, credential references, raw errors, payloads, and provider bodies. |
| Provider readiness table | `partial` | `partially live` | `xflow_app_activation_bindings`, `commerce_verification_runs` | Evidence-based readiness only; full credential/provider config inventory remains unavailable. |
| Ecosystem contract matrix | `real` | `partially live` | `ecosystem-contracts/apps.json`, `ecosystem-contracts/routes.json` | Contract-defined evidence, not live runtime status. |

Activation/admission separation:

- Every activation signal row now includes `entitlement_admission: separate_not_granted_by_activation`.
- UI copy states activation is separate from entitlement admission.
- Computed admission rows use safe Verixet denial codes such as `entitlement_not_found`, `billing_inactive`, `plan_not_entitled`, and `workspace_policy_blocked`.

Redaction evidence:

- `last_response_body_preview` / `lastResponseBodyPreview` is not selected or exposed by the read-only Superadmin activation inventory.
- XFlow ingest URLs, bearer fields, credential reference ids, raw activation errors, webhook payloads, provider responses, request bodies, response bodies, stack traces, and private customer content are omitted.
- XFlow workspace ids are shortened; provider response and credential state columns show `omitted`.

Exact files changed for Phase 3B:

- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- `apps/Verixet/src/lib/platform/superadmin-readonly.test.ts`
- `docs/verixet-superadmin-gap-audit.md`

Validation results for Phase 3B:

- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-readonly.test.ts` passed: 1 file, 9 tests.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/entitlement-admission.test.ts src/lib/platform/superadmin-readonly.test.ts` passed: 2 files, 17 tests.
- `npm --prefix apps/Verixet run audit:dashboard` passed. It found `/dashboard/admin/read-only`; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run typecheck` initially failed on an optional `last_http_status` nullability issue, then passed after normalizing the value to `null`.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- `npm run validate:ecosystem-contracts` passed.
- Grep scan for `last_response_body_preview`, `lastResponseBodyPreview`, `response_body`, `request_body`, `Authorization`, `Bearer`, `token`, `secret`, `apiKey`, `webhook payload`, `provider response`, `provider_response`, `stack trace`, `credential`, and `private customer` completed across Phase 3B touched files and the audit doc. Reviewed hits were redaction helpers, negative tests, omitted-column labels, and historical audit notes; no raw value exposure was added.
- Grep scan for `connected apps`, `production-ready`, `access granted`, `enabled`, `active`, `force grant`, `bypass billing`, `healthy`, and `connected` completed across Phase 3B touched files and the audit doc. Reviewed hits were legitimate status parsing, tests, and historical audit notes; the new read-only route does not label activation as access granted, production-ready, or connected.
- `git -C apps/Verixet diff --check -- src/lib/platform/superadmin-readonly.ts src/lib/platform/superadmin-readonly.test.ts 'src/app/dashboard/(main)/admin/read-only/page.tsx'` passed.
- `git diff --check -- docs/verixet-superadmin-gap-audit.md` passed.

Remaining partial areas:

- Admission history remains partial until a read-only persisted admission-decision repository or audit-backed history exists.
- Provider readiness remains partial until a safe provider configuration inventory exists without exposing credentials or provider ids.
- Ecosystem contract rows prove canonical contract definitions only; they do not prove live endpoint reachability.
- Phase 2E remains blocked without loaded non-production authenticated e2e fixture keys and a staging/local test database URL.

Recommended next phase:

- Add a read-only persisted admission-decision/audit evidence source and provider configuration inventory, then rerun Phase 2E once authenticated fixtures are available.

## Phase 3C Persisted Admission Evidence And Provider Readiness Inventory

Date: 2026-07-01

Result: partially complete. No mutation behavior added. Phase 2E real authenticated staging/browser proof remains blocked until non-production authenticated fixtures are loaded.

What changed:

- Added safe persisted entitlement-evaluate audit evidence to the read-only entitlement/admission table from `audit_events` actions `commerce.entitlements.evaluate.completed` and `commerce.entitlements.evaluate.rejected`.
- Kept entitlement/admission classified `partial` because this is persisted evaluate-audit evidence, not a dedicated append-only admission-decision history. No `admission_decision_events` source was found.
- Expanded provider readiness/config inventory with safe rows from `workspace_stripe_connections`, `webhook_endpoints`, `api_keys`, `xflow_app_activation_bindings`, `commerce_verification_runs`, entitlement evaluation audit events, and ecosystem contract rows.
- Reclassified provider readiness as `real` / `live data` because the guarded read-only route now projects existing safe backend/config evidence and omits sensitive fields.

Phase 3C surface revisions:

| Surface | Revised status | UI classification | Backend/contract source | Notes |
|---|---|---|---|---|
| Entitlement / admission table | `partial` | `partially live` | `audit_events`, `entitlement_grants`, `resolveEntitlementAdmission` | Persisted entitlement-evaluate audit evidence exists, but not full admission-decision history. Recommend future append-only `admission_decision_events`. |
| Provider readiness table | `real` | `live data` | `workspace_stripe_connections`, `webhook_endpoints`, `api_keys`, `xflow_app_activation_bindings`, `commerce_verification_runs`, `audit_events`, `ecosystem-contracts` | Safe read-only provider/config readiness inventory; no credential mutation or reveal. |

Admission evidence behavior:

- Persisted audit rows are labeled `persisted_entitlement_evaluate_audit`.
- Computed current decisions remain labeled `computed_current_not_historical`.
- Grant evidence remains labeled `entitlement_grant_evidence` and does not imply access by itself.
- Safe audit fields include shortened event id, workspace id, app slug where present, admission/evaluation status, safe reason code, billing/plan categories where present, actor category, shortened correlation id, feature count, and timestamp.

Provider readiness behavior:

- Readiness states are limited to `configured`, `missing config`, `degraded`, `unavailable`, and `unverified`.
- Provider readiness rows now cover Stripe readiness, webhook readiness, API key auth readiness, activation provider readiness, ecosystem billing contract mapping, and entitlement resolver audit evidence where available.
- UI copy avoids `healthy`, `connected`, `enabled`, `production-ready`, and `access granted` claims for provider readiness.

Redaction evidence:

- Audit metadata bodies are not exposed; only allow-listed scalar fields are projected.
- Encrypted Stripe secrets, webhook signing secrets, webhook URLs, secret hashes, raw provider ids, raw health bodies, raw request/response bodies, provider responses, cookies, bearer tokens, API keys, stack traces, and private customer content are not selected or displayed.
- Provider readiness rows display `provider_response: omitted` and `credential_state: omitted`.

Exact files changed for Phase 3C:

- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- `apps/Verixet/src/lib/platform/superadmin-readonly.test.ts`
- `docs/verixet-superadmin-gap-audit.md`

Tests added/updated:

- `apps/Verixet/src/lib/platform/superadmin-readonly.test.ts`
  - persisted entitlement-evaluate audit DTO redaction
  - no raw audit metadata exposure
  - provider config/readiness DTO redaction
  - no raw provider config, token, API key, secret, request/response body, or stack trace exposure
  - computed admission remains not historical
  - provider readiness is not labeled healthy without evidence

Validation results for Phase 3C:

- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-readonly.test.ts` passed: 1 file, 11 tests.
- `npm --prefix apps/Verixet run audit:dashboard` passed. It found `/dashboard/admin/read-only`; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- `npm run validate:ecosystem-contracts` passed.
- Grep scan for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `password`, `cookie`, `webhook payload`, `response_body`, `request_body`, `provider response`, `provider_response`, `stack trace`, `credential`, and `private customer` completed across Phase 3C touched files and the audit doc. Reviewed hits were redaction helpers, negative tests, omitted-column labels, and historical audit notes; no raw sensitive value exposure was added.
- Grep scan for `access granted`, `production-ready`, `fully connected`, `force grant`, `bypass billing`, `healthy`, `connected`, `enabled`, and `active` completed across Phase 3C touched files and the audit doc. Reviewed hits were legitimate status parsing, tests, and historical audit notes; the new read-only provider readiness and admission tables do not label readiness as healthy or access granted.
- `git -C apps/Verixet diff --check -- src/lib/platform/superadmin-readonly.ts src/lib/platform/superadmin-readonly.test.ts 'src/app/dashboard/(main)/admin/read-only/page.tsx'` passed.
- `git diff --check -- docs/verixet-superadmin-gap-audit.md` passed.

Remaining gaps:

- Admission evidence remains partial until a dedicated append-only admission decision source exists with explicit admitted/denied outcomes, billing/plan/workspace-policy categories, safe reason codes, and correlation ids.
- Phase 2E remains blocked without loaded non-production authenticated e2e fixture keys and a staging/local test database URL.

Recommended next phase:

- Add a read-only `admission_decision_events` repository/table or standardize admission audit metadata to include explicit safe outcome categories. Then rerun Phase 2E after authenticated fixtures are loaded.

## Phase 3D Admission Decision Event Source

Date: 2026-07-01

Result: complete for local code and migration wiring. No mutation UI, grant/revoke behavior, billing mutation, tenant mutation, webhook retry, provider credential mutation, impersonation, deployment controls, or destructive action was added. Phase 2E real authenticated staging/browser proof remains blocked until non-production authenticated fixtures are loaded.

Dedicated source result:

- No pre-existing dedicated admission decision event source was found.
- Added append-only source `admission_decision_events`.
- Added migration `apps/Verixet/drizzle/0077_admission_decision_events.sql` and journal entry `0077_admission_decision_events`.
- Added repository `apps/Verixet/src/lib/commerce/admission-decision-events.ts`.

Table/source fields:

| Field | Purpose | Safety note |
|---|---|---|
| `id` | event id | Superadmin shows shortened id only. |
| `workspace_id` | workspace admission scope | Required; no private profile content. |
| `app_slug` | app admission scope | Normalized slug/category only. |
| `decision` | `admitted`, `denied`, or `unavailable` | No raw resolver body. |
| `reason_code` | safe reason category | Constrained to safe categories such as `admitted`, `missing_entitlement`, `billing_past_due`, `plan_not_entitled`, `workspace_policy_blocked`, `resolver_unavailable`. |
| `source` | `activation`, `dashboard`, `ecosystem_access`, `api`, or `scheduled_check` | Source category only. |
| `actor_type` | `system`, `platform_admin`, `workspace_admin`, `service`, or `unknown` | No raw actor secrets. |
| `correlation_id` | safe correlation/request id | Shortened and sanitized before insert/display. |
| `plan_tier_category` | safe plan/tier category | No provider ids. |
| `billing_status_category` | safe billing status category | No subscription/customer ids. |
| `created_at` | append timestamp | Read-only history timestamp. |

Resolver integration:

- `resolveEntitlementAdmission` now persists a safe admission decision event by default after each resolver decision.
- Admitted decisions are recorded.
- Denied decisions are recorded.
- Fail-closed resolver-unavailable decisions are recorded.
- Event write failures are swallowed and do not allow access, block access, or expose raw errors.
- Superadmin computed-current comparison rows pass `persistEvent: false` so viewing the read-only dashboard does not create admission history.
- Duplicate spam is not fully deduplicated in this phase; repeated resolver calls can produce repeated append-only evidence. Future work should add optional idempotency/correlation dedupe once call-site semantics are finalized.

Superadmin behavior:

- Admission history is now classified `real` / `live data`.
- Admission table distinguishes:
  - `persisted_admission_decision_event`
  - `persisted_entitlement_evaluate_audit`
  - `computed_admission_decision`
  - `entitlement_grant_evidence`
- Computed rows remain labeled `computed_current_not_historical`.
- Persisted admission rows are labeled `persisted_admission_decision_events`.

Redaction evidence:

- Admission event persistence stores only constrained categories and shortened correlation ids.
- Superadmin DTOs omit raw request bodies, response bodies, provider responses, tokens, API keys, secrets, authorization headers, cookies, webhook payload bodies, private customer content, prompt/completion bodies, stack traces, raw internal errors, and full sensitive provider identifiers.

Exact files changed for Phase 3D:

- `apps/Verixet/drizzle/0077_admission_decision_events.sql`
- `apps/Verixet/drizzle/meta/_journal.json`
- `apps/Verixet/src/db/schema.ts`
- `apps/Verixet/src/lib/commerce/admission-decision-events.ts`
- `apps/Verixet/src/lib/commerce/admission-decision-events.test.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission.ts`
- `apps/Verixet/src/lib/commerce/entitlement-admission.test.ts`
- `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Tests added/updated:

- `apps/Verixet/src/lib/commerce/admission-decision-events.test.ts`
  - admitted decision event mapping is safe
  - denied decision event mapping is safe
  - fail-closed resolver-unavailable event mapping is safe
  - persistence writes only safe fields
  - read-only DTO omits sensitive metadata/body/secret fields
- `apps/Verixet/src/lib/commerce/entitlement-admission.test.ts`
  - admitted, denied, and fail-closed decisions call event persistence
  - event write failure does not grant access or expose raw errors
  - read-only computed comparisons can skip event persistence

Validation results for Phase 3D:

- `npm --prefix apps/Verixet run test -- src/lib/commerce/admission-decision-events.test.ts src/lib/commerce/entitlement-admission.test.ts src/lib/platform/superadmin-readonly.test.ts` passed: 3 files, 26 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run audit:dashboard` passed. It found `/dashboard/admin/read-only`; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `password`, `cookie`, `webhook payload`, `response_body`, `request_body`, `provider response`, `provider_response`, `stack trace`, `credential`, `private customer`, `prompt`, and `completion` completed across Phase 3D touched files and the audit doc. Reviewed hits were schema fields, redaction helpers, negative tests, omitted-column labels, and historical audit notes; no raw sensitive value exposure was added by the admission event source.
- Grep scan for `access granted`, `production-ready`, `fully connected`, `force grant`, `bypass billing`, `healthy`, `connected`, `enabled`, and `active` completed across Phase 3D touched files and the audit doc. Reviewed hits were legitimate status parsing, tests, schema/domain enum values, and historical audit notes; the new admission event source and read-only Superadmin table do not label admission evidence as access granted or production-ready.
- `git -C apps/Verixet diff --check -- drizzle/0077_admission_decision_events.sql drizzle/meta/_journal.json src/db/schema.ts src/lib/commerce/admission-decision-events.ts src/lib/commerce/admission-decision-events.test.ts src/lib/commerce/entitlement-admission.ts src/lib/commerce/entitlement-admission.test.ts src/lib/platform/superadmin-readonly.ts 'src/app/dashboard/(main)/admin/read-only/page.tsx'` passed, with line-ending warnings only for existing tracked files.
- `git diff --check -- docs/verixet-superadmin-gap-audit.md` passed.

Remaining gaps:

- The new table must be migrated in each non-production/staging/production database before Superadmin can show live persisted admission history there.
- Duplicate event suppression is documented but not implemented in this phase.
- Phase 2E remains blocked without loaded non-production authenticated e2e fixture keys and a staging/local test database URL.

Recommended next phase:

- Apply `0077_admission_decision_events` to the target staging/non-production database, load authenticated fixtures, and rerun Phase 2E with persisted admission event evidence included in API/UI screenshots. Local disposable proof passed later in Phase 3E.

## Phase 3E Migration Apply And Final Validation

Date: 2026-07-01

Historical result: blocked before migration apply during the first attempt. This was later superseded for local DB proof by the Phase 3E local disposable rerun, where migration `0077_admission_decision_events` applied and read/write proof passed.

Blocked reason:

- The current shell does not have a loaded non-production database URL.
- Checked without printing values: `DATABASE_URL`, `VERIXET_DATABASE_URL`, `DIRECT_DATABASE_URL`, and `POSTGRES_URL` are missing.
- Environment category variables are also absent: `NODE_ENV`, `VERCEL_ENV`, `RAILWAY_ENVIRONMENT`, and `E2E_BASE_URL` are missing.
- Because no non-production database URL is loaded, migration `0077_admission_decision_events` was not applied, table/index existence was not checked against a live database, and no runtime admission event rows were inserted.

Initial Phase 3E proof status, superseded for local DB proof by the later "Phase 3E Local Disposable Rerun Result":

| Required proof | Status | Reason |
|---|---|---|
| Migration 0077 applies cleanly | Blocked | Missing loaded non-production database URL |
| `admission_decision_events` table exists | Blocked | Migration not applied |
| expected columns exist | Blocked | Migration not applied |
| indexes exist | Blocked | Migration not applied |
| append-only write works from resolver path | Blocked for live DB; covered by focused mocked tests only | Missing database URL |
| read-only Superadmin projection can read rows | Blocked for live DB; covered by focused mocked/unit tests only | Missing database URL |
| no destructive migration behavior | Static SQL reviewed; live DB apply blocked | Missing database URL |
| production DB avoided | Passed | No database URL was loaded and no migration command was run |

Admission event runtime proof:

- Initial live runtime proof was blocked until a non-production database URL was loaded; local disposable runtime proof later passed in the Phase 3E rerun.
- Existing focused tests continue to prove admitted, denied, and fail-closed decision event mapping/persistence behavior with mocked DB writes.
- Event write failure behavior remains covered by `entitlement-admission.test.ts`.

Read-only Superadmin proof:

- Browser/live DB proof is blocked until a non-production database URL and authenticated fixtures are loaded.
- Static/code proof remains in place: `/dashboard/admin/read-only` distinguishes persisted admission decision events, entitlement evaluate audit evidence, computed current decisions, and entitlement grant evidence.

Redaction proof:

- Live API/UI/evidence grep is blocked because no live evidence files were generated.
- Static grep scans over touched source/docs remain safe; no new raw request body, response body, provider response, token, API key, secret, authorization header, cookie, webhook payload body, private customer content, prompt/completion body, stack trace, raw internal error, or full sensitive provider identifier exposure was added.

Validation results for Phase 3E:

- Environment preflight ran without printing values and found no loaded database URL.
- Migration apply/check command was skipped by policy because the target could not be confirmed as non-production.
- No generated evidence files were produced.
- `npm --prefix apps/Verixet run audit:dashboard` passed. It found `/dashboard/admin/read-only`; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/admission-decision-events.test.ts src/lib/commerce/entitlement-admission.test.ts src/lib/platform/superadmin-readonly.test.ts` passed: 3 files, 26 tests.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `password`, `cookie`, `webhook payload`, `response_body`, `request_body`, `provider response`, `provider_response`, `stack trace`, `credential`, `private customer`, `prompt`, and `completion` completed across Phase 3D/3E touched files and the audit doc. Reviewed hits were redaction helpers, negative tests, omitted-column labels, and historical audit notes; no new raw sensitive value exposure was added.
- Grep scan for `access granted`, `production-ready`, `fully connected`, `force grant`, `bypass billing`, `healthy`, `connected`, `enabled`, and `active` completed across Phase 3D/3E touched files and the audit doc. Reviewed hits were legitimate status parsing, tests, SQL reason codes, and historical audit notes; no new misleading access label was added.
- `git diff --check -- docs/verixet-superadmin-gap-audit.md` passed.

Remaining gaps from the initial attempt, updated after the local disposable rerun:

- Apply `0077_admission_decision_events` to the target staging/non-production database before staging rollout. Local disposable proof already passed.
- Run authenticated staging resolver/API admission checks for admitted, denied missing entitlement, denied billing, denied plan, denied policy mismatch, and fail-closed resolver-unavailable cases.
- Capture authenticated staging read-only Superadmin evidence showing persisted rows separately from computed/audit/grant rows.
- Phase 2E remains blocked until authenticated non-production fixture keys and database access are loaded.

Recommended next phase:

- Load a disposable or staging non-production `DIRECT_DATABASE_URL`/`DATABASE_URL` plus authenticated fixtures, then rerun Phase 3E migration apply and evidence capture.

## Phase 3E Local Disposable Rerun Result

Date: 2026-07-01

Result: passed for a local disposable non-production database. Phase 2E real authenticated browser/staging proof remains blocked because the E2E authenticated fixture keys are not loaded in the Codex process environment.

Preflight:

- Checked without printing values: `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `VERIXET_DATABASE_URL` were missing from the inherited process environment.
- Created and used a disposable local PostgreSQL database on localhost only.
- Confirmed target category: `local_disposable_non_production`.
- No production database URL was present or used.
- Checked without printing values: `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, and `E2E_BASE_URL` were missing from the inherited process environment, so Phase 2E authenticated browser proof was not rerun.

Migration apply/check:

- Applied migrations to the disposable database with `npm run db:migrate` from `apps/Verixet`, using a per-command local database URL.
- Migration output reported `77 applied, 0 skipped, 77 total migration file(s)`.
- Verified `admission_decision_events` exists.
- Verified expected columns: `id`, `workspace_id`, `app_slug`, `decision`, `reason_code`, `source`, `actor_type`, `correlation_id`, `plan_tier_category`, `billing_status_category`, `created_at`.
- Verified indexes: `admission_decision_events_pkey`, `admission_decision_events_workspace_created_idx`, `admission_decision_events_app_created_idx`, `admission_decision_events_reason_created_idx`.
- Reviewed migration behavior as additive append-only table/index creation; no destructive migration behavior was observed.

Generated evidence:

- `apps/Verixet/output/phase3e/phase3e-admission-proof.json`
- `apps/Verixet/output/phase3e/postgres-active.log`
- Disposable data directory: `apps/Verixet/output/phase3e/pgdata-20260701-040151`

Admission event runtime proof:

| Case | Source | Result |
|---|---|---|
| admitted decision writes event | resolver path | passed; event decision `admitted`, reason `admitted` |
| denied missing entitlement writes event | resolver path | passed; event decision `denied`, reason `missing_entitlement` |
| denied billing state writes event | resolver path | passed; event decision `denied`, reason `billing_past_due` |
| denied plan state writes event | resolver path | passed; event decision `denied`, reason `plan_not_entitled` |
| denied policy mismatch writes event | safe simulated admission event | passed; event decision `denied`, reason `workspace_policy_blocked` |
| fail-closed resolver unavailable writes safe event | safe simulated admission event | passed; event decision `unavailable`, reason `resolver_unavailable` |
| event write failure does not grant access or expose raw errors | focused unit test | passed in `entitlement-admission.test.ts` |

Read-only Superadmin proof:

- `getSuperadminReadonlyData()` returned `ok: true` against the disposable database.
- Persisted admission decision rows were read from `admission_decision_events`.
- Computed current decision rows were also present and labeled `computed_current_not_historical`.
- The read-only projection distinguishes `persisted admission decision`, `entitlement evaluate audit evidence`, `computed current decision, not historical`, and `entitlement grant evidence`.
- Admission history is real/live in the tested local disposable environment.

Redaction proof:

- Generated evidence omits raw database URLs.
- Generated evidence scan for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `webhook payload`, `response_body`, `request_body`, `stack trace`, `provider error`, `access granted`, `production-ready`, `force grant`, and `bypass billing` returned no matches.
- Broader source scans still find expected implementation/test/domain words such as redaction helper patterns, negative tests, API-key inventory labels, billing status enum values, and CSS active-state classes. Reviewed hits did not show newly exposed raw sensitive values in the Phase 3E proof evidence.

Validation results for Phase 3E local disposable rerun:

- `npm --prefix apps/Verixet run audit:dashboard` passed.
- `npm --prefix apps/Verixet run typecheck` initially failed on the new proof script, then passed after tightening the script types.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and 18 existing warnings; the new proof script contributes no warnings.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/admission-decision-events.test.ts src/lib/commerce/entitlement-admission.test.ts src/lib/platform/superadmin-readonly.test.ts` passed: 3 files, 26 tests.
- `npm --prefix apps/Verixet run test -- src/lib/commerce/admission-decision-events.test.ts src/lib/commerce/entitlement-admission.test.ts src/lib/commerce/entitlement-admission-proof-cases.test.ts src/lib/platform/superadmin-readonly.test.ts src/app/api/verixet/activate/status/route.test.ts src/app/api/verixet/activate/route.test.ts src/lib/xflow/activation-response-preview.test.ts src/lib/ecosystem/entitlements.test.ts src/components/dashboard/BillingActivationStatusCard.test.tsx src/components/dashboard/XFlowConnectedAppsHub.test.ts src/app/dashboard/(main)/xflow/page.test.tsx src/lib/xflow/xflow-fully-connect.test.ts src/lib/xflow/xflow-hub-guidance.test.ts src/lib/dashboard/transactions/diagnostics.test.ts` passed: 39 files, 203 tests.
- `npm --prefix apps/Verixet run test -- 'src/app/dashboard/(main)/xflow/page.test.tsx'` passed: 1 file, 4 tests.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Migration apply/check command passed against local disposable PostgreSQL only.
- Evidence grep scan passed with no matches in `apps/Verixet/output/phase3e`.

Files changed in the Phase 3E rerun:

- `apps/Verixet/scripts/proof-phase3e-admission-events.ts`
- `docs/verixet-superadmin-gap-audit.md`

Remaining gaps:

- Phase 2E remains blocked until non-production authenticated E2E keys and base URL are loaded.
- Policy mismatch and resolver-unavailable persisted event shapes are proven with safe simulated admission events plus focused unit coverage; they are not naturally reachable from the current happy-path subscription resolver without forcing backend failure or invalid policy state.
- The disposable local database should not be treated as staging/browser proof; it proves migration/runtime/read-only behavior in a local non-production database only.

Recommended next phase:

- Load non-production authenticated E2E fixtures and rerun Phase 2E browser/API proof against a staging-like dashboard flow, then capture screenshots/API evidence alongside the now-persisted admission event rows.

## Phase 4B Activation Recheck Enablement

Date: 2026-07-01

Result: enabled exactly one low-risk Superadmin action: `activation.recheck`.

Enabled action:

| Field | Value |
|---|---|
| Action ID | `activation.recheck` |
| Label | Activation recheck |
| Risk | safe mutation / operational recheck |
| Permission design name | `verixet.activation.recheck` |
| Server-side guard used | authenticated dashboard user plus `isPlatformSuperAdmin(userId)` narrow platform-superadmin guard |
| Audit event | `verixet.activation.recheck.requested` |
| Required reason category | `activation_validation` |
| Production disable switch | `VERIXET_SUPERADMIN_ACTIVATION_RECHECK_DISABLED` |
| Confirmation text | not required |
| Backend route | `POST /api/dashboard/admin/activation/recheck` |
| UI surface | `/dashboard/admin/read-only` Safe Action Design panel |

Behavior implemented:

- Requires dashboard authentication.
- Requires platform-super-admin server-side guard because scoped permission infrastructure for `verixet.activation.recheck` is not yet available.
- Requires reason category `activation_validation`.
- Blocks with `disabled_by_switch` when `VERIXET_SUPERADMIN_ACTIVATION_RECHECK_DISABLED` is enabled.
- Fails closed when activation binding context is missing.
- Rechecks only an existing activation binding and records a safe observation by updating `updated_at`, correlation id, and clearing `last_response_body_preview`.
- Resolves entitlement admission only to return/read audit-safe status; it does not grant, revoke, or bypass admission.
- Writes safe audit event `verixet.activation.recheck.requested`.
- Returns a safe DTO with activation status fields and entitlement admission status/reason only.

Safe audit metadata:

- `request_id`
- `permission`
- `reason_category`
- `app_slug`
- `environment`
- `activation_status`
- `binding_status`
- `credential_status`
- `xflow_workspace_id`
- `entitlement_admission_status`
- `entitlement_admission_admitted`
- `entitlement_admission_reason`

Redaction and mutation limits:

- The route does not return raw provider responses, raw request bodies, raw response bodies, tokens, secrets, cookies, API keys, webhook payloads, stack traces, raw internal errors, provider credential material, or private customer content.
- The route does not grant entitlement, revoke entitlement, change billing, change plan, change tenant status, create/revoke/rotate API keys, retry webhooks, mutate provider credentials, bypass admission, or mark access as granted.
- Other Phase 4A actions remain disabled.

UI behavior:

- `activation.recheck` is the only action with an enabled form path.
- The form requires workspace id, XFlow workspace id, app slug, environment, and reason category before submit.
- UI handles loading, success, error, permission-denied, and disabled-by-switch states with safe copy.
- Other action cards still render disabled buttons only.
- UI copy states the recheck does not grant entitlement or mark access admitted.

Tests added/updated:

- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.test.ts`
  - rejects unauthenticated users
  - rejects missing permission / non-superadmin users
  - rejects missing reason category
  - blocks when production disable switch is active
  - fails closed when activation context is missing
  - writes safe audit event and returns safe DTO
  - does not grant entitlement or access
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
  - registry marks only activation recheck implemented
  - activation recheck availability requires all guardrails
  - UI keeps other actions disabled
  - UI reason-gated form and safe response-state mapping are covered

Files changed for Phase 4B:

- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.ts`
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.test.ts`
- `apps/Verixet/src/components/dashboard/SuperadminDisabledActions.tsx`
- `apps/Verixet/src/lib/platform/superadmin-actions.ts`
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
- `apps/Verixet/src/lib/xflow/xflow-app-activation-store.ts`
- `docs/verixet-superadmin-gap-audit.md`

Validation results for Phase 4B:

- `npm --prefix apps/Verixet run test -- src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx` passed: 2 files, 17 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and 18 existing unrelated warnings.
- `npm --prefix apps/Verixet run audit:dashboard` passed; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run test -- src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx src/lib/platform/superadmin-readonly.test.ts` passed: 3 files, 28 tests.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `access granted`, `force grant`, `bypass billing`, `production-ready`, `secret`, `token`, `apiKey`, `webhook payload`, `response_body`, `request_body`, `provider response`, and `stack trace` completed across touched Phase 4B files and the audit doc. Reviewed hits were redaction-rule text, negative test fixtures/assertions, existing credential fingerprint helper code, and historical audit notes; no returned raw sensitive value or newly enabled non-activation action was found.
- `git diff --check` passed for Phase 4B source files and this audit doc; Git reported a line-ending warning for an existing tracked file only.

Phase 2E status:

- Still blocked. Non-production authenticated E2E fixture keys and dashboard base URL are not loaded in the Codex process environment, so authenticated browser/staging proof was not rerun.

Recommended next phase:

- Phase 4C should either add scoped permission infrastructure for `verixet.activation.recheck` or run authenticated browser proof for the enabled activation recheck flow using non-production fixtures. Do not enable another Superadmin action until the activation recheck browser/audit evidence is captured.

## Phase 4C Scoped Superadmin Permission Infrastructure

Date: 2026-07-01

Result: added narrow scoped Superadmin permission infrastructure and updated activation recheck to enforce `verixet.activation.recheck` through it. No new Superadmin action was enabled.

Infrastructure discovery:

- Existing infrastructure found: `platform_super_admins` table, `isPlatformSuperAdmin(userId)`, workspace role membership (`workspace_members`), dashboard auth/session guards, route-specific workspace owner/admin checks, and audit event metadata patterns.
- No existing scoped Superadmin permission helper/table was found for explicit action names such as `verixet.activation.recheck`.
- Phase 4C therefore added a narrow helper that uses platform-super-admin status as the current allow source and exposes a scoped permission decision shape for future permission-table integration.

Scoped helper:

- File: `apps/Verixet/src/lib/platform/superadmin-permissions.ts`
- Helper: `resolveSuperadminScopedPermission({ userId, permission })`
- Safe decision shape:
  - `allowed`
  - `permission`
  - `actorUserId`
  - `decisionReason`: `platform_superadmin`, `explicit_permission`, `missing_permission`, `unauthenticated`, or `unavailable`
  - `source`: `platform_superadmin`, `permission_table`, `fallback`, or `unavailable`
- Safe audit metadata helper: `safeSuperadminPermissionDecisionMetadata(decision)`
- Current behavior: platform superadmins are allowed for all defined scoped Superadmin permissions; non-superadmins are denied as `missing_permission` until explicit permission storage exists.
- Fail-closed behavior: permission resolution errors return `allowed: false`, `decisionReason: unavailable`, `source: unavailable`.

Activation recheck guard update:

- `POST /api/dashboard/admin/activation/recheck` now requires `resolveSuperadminScopedPermission({ permission: "verixet.activation.recheck" })`.
- Missing permission returns a safe `403` with permission, decision reason, and source only.
- Audit metadata includes safe permission decision fields:
  - `permission`
  - `permission_allowed`
  - `permission_decision_reason`
  - `permission_source`
  - `actor_user_id`
- The route still requires dashboard authentication, reason category, production disable switch pass, and activation context.
- The route still does not grant entitlement, change billing, change plan, change tenant state, mutate API keys, retry webhooks, mutate provider credentials, bypass admission, or mark access as granted.

Tests added/updated:

- `apps/Verixet/src/lib/platform/superadmin-permissions.test.ts`
  - unauthenticated user denied with safe metadata
  - platform superadmin allowed for scoped permission
  - non-superadmin denied as missing permission
  - unavailable permission resolution fails closed
  - safe audit metadata omits session tokens/cookies/headers
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.test.ts`
  - route uses `verixet.activation.recheck`
  - missing permission returns safe 403
  - production disable switch still blocks after permission passes
  - audit event includes safe permission decision metadata
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
  - all non-activation-recheck actions remain unavailable

Files changed for Phase 4C:

- `apps/Verixet/src/lib/platform/superadmin-permissions.ts`
- `apps/Verixet/src/lib/platform/superadmin-permissions.test.ts`
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.ts`
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.test.ts`
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Validation results for Phase 4C:

- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-permissions.test.ts src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx` passed: 3 files, 23 tests.
- `npm --prefix apps/Verixet run audit:dashboard` passed; no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-permissions.test.ts src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx src/lib/platform/superadmin-readonly.test.ts` passed: 4 files, 34 tests.
- `npm --prefix apps/Verixet run typecheck` initially failed on an over-narrowed test comparison, then passed after the test was adjusted.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and 18 existing unrelated warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan for `access granted`, `force grant`, `bypass billing`, `production-ready`, `secret`, `token`, `apiKey`, `cookie`, `Authorization`, `Bearer`, `response_body`, `request_body`, `provider response`, and `stack trace` completed across touched Phase 4C files and the audit doc. Reviewed hits were negative test fixtures/assertions, redaction assertions, and historical audit notes; the scoped permission helper and activation recheck route do not expose session tokens, cookies, auth headers, raw body fields, provider responses, or stack traces.
- `git diff --check` passed for Phase 4C source files and this audit doc.

Remaining permission gaps:

- No explicit permission-table source exists yet; `explicit_permission` is reserved in the decision shape but not backed by storage in this phase.
- Platform superadmins currently satisfy all scoped Superadmin permissions through the helper.
- Future phases should add persisted scoped permission assignments, expiry/reason/audit for permission changes, and UI/admin inventory before enabling additional actions.

Phase 2E status:

- Still blocked until non-production authenticated E2E keys and dashboard base URL are loaded.

## Phase 4A Safe Superadmin Action Design

Date: 2026-07-01

Result: disabled-action design scaffolding added. No real business-state mutation was enabled and no action route was executed.

Scope outcome:

- Added a typed Superadmin action registry for future high-risk actions.
- Added disabled-only read-only UI scaffolding on `/dashboard/admin/read-only`.
- Every future action remains disabled until backend route, scoped permission, reason capture, exact confirmation where applicable, audit event, production disable switch, and tests exist.
- No fake success toast, fake ready state, entitlement grant/revoke, billing override, API-key revoke/rotate, webhook retry, tenant suspension/reactivation, provider credential mutation, impersonation, deployment control, or destructive action was added.

Phase 4A action matrix:

| Action ID | Label | Risk | Permission | Confirmation | Reason category | Disable switch | Audit event | Route status | Rollback / undo | Disabled UI copy |
|---|---|---|---|---|---|---|---|---|---|---|
| `entitlement.adjustment` | Entitlement adjustment | sensitive | `verixet.entitlements.mutate` | `ADJUST ENTITLEMENT` | `operational_correction` | `VERIXET_SUPERADMIN_ACTIONS_DISABLED` | `verixet.superadmin.entitlement_adjustment.requested` | missing | compensating reviewed adjustment only | Disabled until mutation route, scoped permission, confirmation, reason, audit, production switch, and tests are complete |
| `billing.override` | Billing override | sensitive | `verixet.billing.override` | `APPLY BILLING OVERRIDE` | `billing_support` | `VERIXET_SUPERADMIN_BILLING_OVERRIDE_DISABLED` | `verixet.superadmin.billing_override.requested` | missing | compensating override or billing reconciliation | Disabled until override route, permission, reason, confirmation, audit, production switch, and tests are complete |
| `api_key.revoke_rotate` | API key revoke / rotate | destructive | `verixet.api_keys.rotate` | `REVOKE OR ROTATE API KEY` | `security_response` | `VERIXET_SUPERADMIN_API_KEY_ACTIONS_DISABLED` | `verixet.superadmin.api_key_revoke_rotate.requested` | partial | revoke has no undo; rotate needs replacement key flow | Disabled until exact confirmation, reason, audit, production switch, and tests exist |
| `webhook.retry` | Webhook retry | sensitive | `verixet.webhooks.retry` | `RETRY WEBHOOK` | `provider_recovery` | `VERIXET_SUPERADMIN_WEBHOOK_RETRY_DISABLED` | `verixet.superadmin.webhook_retry.requested` | missing | no undo for external delivery; must be idempotency-keyed | Disabled until payload redaction, idempotency, audit, permission, reason, switch, and tests exist |
| `tenant.suspension_reactivation` | Tenant suspension / reactivation | destructive | `verixet.tenants.suspend` | `SUSPEND OR REACTIVATE TENANT` | `compliance_review` | `VERIXET_SUPERADMIN_TENANT_ACTIONS_DISABLED` | `verixet.superadmin.tenant_suspension_reactivation.requested` | missing | reactivation may compensate suspension; deletion excluded | Disabled until backend route, exact confirmation, reason, audit, production switch, and tests exist |
| `provider.credential_refresh` | Provider credential refresh | sensitive | `verixet.providers.refresh` | `REFRESH PROVIDER CREDENTIAL` | `provider_recovery` | `VERIXET_SUPERADMIN_PROVIDER_REFRESH_DISABLED` | `verixet.superadmin.provider_credential_refresh.requested` | missing | provider-dependent; old credential material is never restored through Superadmin | Disabled until credential-safe route, permission, reason, audit, switch, and tests exist |
| `guardrail.override` | Guardrail override | sensitive | `verixet.guard.override` | `APPLY GUARDRAIL OVERRIDE` | `platform_incident` | `VERIXET_SUPERADMIN_GUARD_OVERRIDE_DISABLED` | `verixet.superadmin.guardrail_override.requested` | missing | expires automatically or separate reviewed revoke action | Disabled until scoped route, expiry guard, reason, audit, switch, and tests exist |
| `issue.status_update` | Issue status update | safe | `verixet.issues.mutate` | not required | `operational_correction` | `VERIXET_SUPERADMIN_ISSUE_ACTIONS_DISABLED` | `verixet.superadmin.issue_status_update.requested` | missing | status can be changed again through future audited action | Disabled until backend route, permission, reason, audit, switch, and tests exist |
| `support.reply` | Support reply | sensitive | `verixet.support.reply` | not required | `customer_request` | `VERIXET_SUPERADMIN_SUPPORT_REPLY_DISABLED` | `verixet.superadmin.support_reply.requested` | missing | no undo after external send; correction reply only | Disabled until private-content handling, route, permission, reason, audit, switch, and tests exist |
| `activation.recheck` | Activation recheck | safe | `verixet.activation.recheck` | not required | `activation_validation` | `VERIXET_SUPERADMIN_ACTIVATION_RECHECK_DISABLED` | `verixet.superadmin.activation_recheck.requested` | planned | read/check action only; no business-state rollback expected | Disabled until route, permission, reason, audit, switch, and tests exist |

Safe audit metadata shape:

- All actions use safe metadata categories only: `workspace_id`, `actor_user_id`, `target_type`, `target_id`, `reason_category`, `correlation_id`, `environment`, and action-specific safe enums such as `app_slug`, `action_kind`, `issue_id`, `provider_key`, or `guard_key`.
- Audit metadata must not include raw API keys, tokens, secrets, passwords, cookies, webhook payload bodies, raw request bodies, raw response bodies, provider responses, private customer content, prompt/completion bodies, stack traces, or full provider credential identifiers.

Disabled-action UI status:

- `/dashboard/admin/read-only` renders the Phase 4A actions as disabled design cards and a guardrail matrix.
- Buttons are `type="button"` and `disabled`; no form submit, `formAction`, click handler, backend mutation route, or success state is rendered.
- Every card includes the disabled reason and required guardrails.
- No action is labeled ready, available, production-ready, or access granted.

Test requirements before Phase 4B enablement:

- Permission-denial tests for every action.
- Required reason tests for every action.
- Exact confirmation tests for destructive actions.
- Production disable switch tests for sensitive/destructive actions.
- Safe audit metadata redaction tests.
- No fake success state tests.
- Action-specific tests for idempotency, admission preservation, payload/body omission, private content handling, expiry guards, and no raw provider response exposure.

Files changed for Phase 4A:

- `apps/Verixet/src/lib/platform/superadmin-actions.ts`
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
- `apps/Verixet/src/components/dashboard/SuperadminDisabledActions.tsx`
- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Phase 2E status:

- Still blocked. Non-production authenticated E2E fixture keys and dashboard base URL are not loaded in the Codex process environment, so authenticated browser/staging proof was not rerun.

Remaining blockers before Phase 4B:

- Choose one action to enable first and define its exact backend route contract.
- Implement scoped permission checks without broad RBAC rewrites.
- Implement reason capture and exact confirmation where required.
- Add production disable switch enforcement in the backend route.
- Add safe audit write with redacted metadata only.
- Add focused route/UI tests before rendering any enabled state.

## Phase 4D Persisted Scoped Permission Assignments

Date: 2026-07-01

Result: persisted scoped-permission assignment source added and wired into the existing scoped Superadmin permission helper. No new Superadmin action was enabled.

Source discovery:

- Existing sources found: `platform_super_admins` for broad platform-superadmin checks, workspace role membership tables, dashboard route guards, and route-local authorization helpers.
- No existing persisted source was found for action-scoped Superadmin grants such as `verixet.activation.recheck`, `verixet.issues.mutate`, or future high-risk Superadmin permissions.
- Added `superadmin_permission_assignments` as an assignment-style persisted source. It stores safe identifiers and permission/scope state only; it does not store session tokens, cookies, auth headers, private user metadata, secrets, API keys, provider credentials, request bodies, response bodies, or stack traces.

Permission assignment source:

| Field | Status | Notes |
|---|---|---|
| `id` | real | UUID primary key. |
| `user_id` | real | Safe user identifier, foreign-keyed to `users.id`. |
| `permission` | real | Constrained to the Phase 4A scoped permission names. |
| `scope_type` | real | Constrained to `global`, `tenant`, `workspace`, or `app`. |
| `scope_id` | real | Nullable text for scoped assignments; shortened in read-only UI. |
| `granted_by` | real | Nullable safe user id; shortened in read-only UI. |
| `granted_at` | real | Assignment timestamp. |
| `revoked_at` | real | Null means active; non-null means revoked. |
| `reason_code` | real | Nullable safe enum-style reason code. |
| `created_at` / `updated_at` | real | Assignment metadata timestamps. |
| indexes | real | User/permission lookup, active-assignment lookup, and created-at index. |

Helper resolution order:

1. Missing authenticated user denies with `unauthenticated`.
2. Platform-superadmin fallback allows with `platform_superadmin`.
3. Active persisted assignment allows with `explicit_permission` from `permission_table`.
4. Missing assignment denies with `missing_permission`.
5. Repository or permission-source errors fail closed with `unavailable`.

Activation recheck status:

- `activation.recheck` remains the only enabled Superadmin action.
- The activation recheck route still requires dashboard authentication, reason category, the production disable switch to be open, and `verixet.activation.recheck`.
- The route now asks the scoped helper for `verixet.activation.recheck` with global scope. Platform superadmins can still satisfy the permission through the helper, and non-superadmins can be allowed only by an active persisted assignment.
- No entitlement, billing, plan, tenant, API-key, webhook, provider credential, impersonation, deployment, or access-grant mutation was added.

Read-only visibility:

- `/dashboard/admin/read-only` now includes a read-only scoped Superadmin permissions table.
- Safe columns only: assignment id, actor user id, permission, scope type, shortened scope id, active/revoked status, shortened granted-by id, granted timestamp, revoked timestamp, safe reason code, created timestamp, and updated timestamp.
- No grant UI, revoke UI, assignment mutation route, fake success state, or enabled permission-management action was added.

Files changed for Phase 4D:

- `apps/Verixet/drizzle/0078_superadmin_permission_assignments.sql`
- `apps/Verixet/drizzle/meta/_journal.json`
- `apps/Verixet/src/db/schema.ts`
- `apps/Verixet/src/lib/platform/superadmin-permission-assignments.ts`
- `apps/Verixet/src/lib/platform/superadmin-permission-assignments.test.ts`
- `apps/Verixet/src/lib/platform/superadmin-permissions.ts`
- `apps/Verixet/src/lib/platform/superadmin-permissions.test.ts`
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.ts`
- `apps/Verixet/src/app/api/dashboard/admin/activation/recheck/route.test.ts`
- `apps/Verixet/src/lib/platform/superadmin-readonly.ts`
- `apps/Verixet/src/app/dashboard/(main)/admin/read-only/page.tsx`
- `apps/Verixet/src/lib/platform/superadmin-actions.test.tsx`
- `docs/verixet-superadmin-gap-audit.md`

Tests added/updated:

- Explicit active assignment allows a scoped Superadmin permission.
- Revoked assignment does not allow.
- Wrong permission does not allow.
- Wrong scope does not allow.
- Missing user denies.
- Repository error fails closed.
- Platform-superadmin fallback still works.
- Safe permission metadata omits tokens, cookies, headers, and request/session material.
- Read-only assignment rows expose safe fields only and shorten scoped identifiers.
- `/dashboard/admin/read-only` has read-only assignment visibility and no grant/revoke UI.
- Activation recheck continues to request `verixet.activation.recheck`.
- All other Phase 4A actions remain disabled.

Validation results for Phase 4D:

- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-permission-assignments.test.ts src/lib/platform/superadmin-permissions.test.ts src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx src/lib/platform/superadmin-readonly.test.ts` passed: 5 files, 39 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run audit:dashboard` passed: no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and the existing 18 warnings.
- `npm run proof:billing-contracts` passed.
- Grep scan for `Authorization`, `Bearer`, `token`, `cookie`, `apiKey`, `secret`, `password`, `request_body`, `response_body`, `provider response`, `stack trace`, `force grant`, `bypass billing`, `access granted`, and `production-ready` completed across touched source files. Reviewed hits were existing schema fields, redaction rules, API-key inventory identifiers, and read-only warning text; the new permission assignment source does not store or expose raw sensitive values.

Remaining blockers before enabling another action:

- Apply migration `0078_superadmin_permission_assignments.sql` to the target staging/non-production database before staging rollout. Local disposable proof already passed in Phase 4E.
- Seed staging/non-production explicit assignments and capture authenticated API/UI evidence for non-superadmin allowed and denied cases.
- Add audited grant/revoke mechanics only in a later phase, with reason, permission, production switch, audit event, and tests. No grant/revoke UI exists now.
- Keep high-risk Phase 4A actions disabled until their backend routes, scoped permissions, reason/confirmation policy, production switches, audit events, redaction, and tests are complete.

Phase 2E status:

- Still blocked. Non-production authenticated E2E fixture keys and dashboard base URL are not loaded in the Codex process environment, so authenticated browser/staging proof was not rerun.

## Phase 4E Scoped Permission Assignment Migration Proof

Date: 2026-07-01

Result: passed against a disposable local non-production database. Migration `0078_superadmin_permission_assignments` was applied through the Verixet migration runner and scoped permission assignments were proven live through the resolver and read-only Superadmin projection. No new Superadmin action was enabled.

Non-production DB preflight:

- Checked without printing values: `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `VERIXET_DATABASE_URL` were missing from the inherited process environment.
- Used local PostgreSQL on `127.0.0.1:55432`, which was already running from prior disposable proof work.
- Created fresh disposable database `phase4e_permission_proof`.
- Wrote non-sensitive target metadata to `apps/Verixet/output/phase4e/phase4e-db-target.json`; raw DB URL is omitted.
- `VERIXET_LOCAL_NAV_QA_DATABASE=1` was set for the local migration runner. No production database was used.

Migration proof:

- Command: `npm --prefix apps/Verixet run db:migrate` with `DIRECT_DATABASE_URL` set in-process to the local disposable database and not printed.
- Result: 78 migrations applied, including `0078_superadmin_permission_assignments`.
- Evidence file: `apps/Verixet/output/phase4e/phase4e-permission-assignment-proof.json`.

Table/column/index/constraint proof:

| Check | Result | Evidence |
|---|---|---|
| table exists | pass | `to_regclass('public.superadmin_permission_assignments')` true |
| migration journal entry | pass | `created_at = 1780580000000` count is `1` |
| expected columns | pass | `id`, `user_id`, `permission`, `scope_type`, `scope_id`, `granted_by`, `granted_at`, `revoked_at`, `reason_code`, `created_at`, `updated_at` |
| indexes | pass | primary key, user/permission index, active-assignment index, created-at index |
| constraints | pass | primary key, user/granted-by foreign keys, permission check, scope-type check, reason-code check |
| active assignment insert/read | pass | Active local proof row inserted and read by resolver/read-only projection |
| revoked assignment insert/read | pass | Revoked local proof row inserted and read by resolver/read-only projection |
| unsafe credential/session fields | pass | No column names for session material, auth headers, private metadata, API keys, provider credentials, request bodies, response bodies, or stack traces |

Resolver proof:

| Case | Result | Decision |
|---|---|---|
| platform-superadmin fallback | pass | Allowed with `platform_superadmin` from `platform_superadmin` |
| explicit active assignment for `verixet.activation.recheck` | pass | Allowed with `explicit_permission` from `permission_table` |
| revoked assignment | pass | Denied with `missing_permission` |
| wrong permission | pass | Denied with `missing_permission` |
| wrong global scope | pass | Denied with `missing_permission` |
| matching workspace scope | pass | Allowed with `explicit_permission` from `permission_table` |
| missing assignment | pass | Denied with `missing_permission` |
| missing user | pass | Denied with `unauthenticated` |
| repository/DB error fail-closed | pass | Covered by focused `superadmin-permissions.test.ts` repository-error test returning `unavailable` |
| safe decision metadata | pass | Metadata keys are permission name, allowed boolean, safe decision reason/source, and safe actor id only |

Activation recheck proof:

- `activation.recheck` remains the only enabled Superadmin action.
- The live resolver proof shows an active persisted assignment can authorize `verixet.activation.recheck`.
- Revoked, wrong-permission, wrong-scope, and missing assignments deny.
- The activation recheck route still requests `verixet.activation.recheck` with global scope.
- Focused route tests prove missing permission/non-superadmin denial, production disable switch denial even when permission passes, required reason category, safe audit event write, no raw provider/request/response body exposure, and no entitlement/access grant.
- No entitlement, billing, plan, tenant, API-key, webhook, provider credential, impersonation, deployment, or access-grant mutation was added.

Read-only Superadmin proof:

- `getSuperadminReadonlyData()` read persisted scoped permission assignments from the disposable DB.
- `/dashboard/admin/read-only` projection includes safe fields only: actor user id, permission, scope type, shortened scope id, active/revoked status, granted timestamp, revoked timestamp, and safe reason code.
- No grant UI, revoke UI, assignment mutation route, fake success state, or enabled permission-management action exists.

Generated evidence:

- `apps/Verixet/output/phase4e/phase4e-db-target.json`
- `apps/Verixet/output/phase4e/phase4e-permission-assignment-proof.json`

Validation results for Phase 4E:

- Migration apply/check: `npm --prefix apps/Verixet run db:migrate` passed against `phase4e_permission_proof`; 78 applied, 0 skipped, 78 total migration files.
- Proof script: `npm exec tsx scripts/proof-phase4e-permission-assignments.ts` passed and wrote sanitized evidence.
- `npm --prefix apps/Verixet run audit:dashboard` passed: no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run typecheck` initially failed on the new proof script because the DB URL was not narrowed for TypeScript; fixed in `scripts/proof-phase4e-permission-assignments.ts`, then reran and passed.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and the existing 18 warnings.
- `npm --prefix apps/Verixet run test -- src/lib/platform/superadmin-permission-assignments.test.ts src/lib/platform/superadmin-permissions.test.ts src/app/api/dashboard/admin/activation/recheck/route.test.ts src/lib/platform/superadmin-actions.test.tsx src/lib/platform/superadmin-readonly.test.ts` passed: 5 files, 39 tests.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static Phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Generated-evidence grep scan for `Authorization`, `Bearer`, `token`, `cookie`, `apiKey`, `secret`, `password`, `request_body`, `response_body`, `provider response`, `stack trace`, `force grant`, `bypass billing`, `access granted`, and `production-ready` returned no matches in `apps/Verixet/output/phase4e`.
- Source/doc grep scan for the same terms completed across touched files. Reviewed hits were blocked-pattern assertions in the proof script, read-only redaction copy, existing API-key inventory identifiers, and historical audit notes; no raw sensitive value, fake access label, or new mutation path was added.

Files changed for Phase 4E:

- `apps/Verixet/scripts/proof-phase4e-permission-assignments.ts`
- `docs/verixet-superadmin-gap-audit.md`

Phase 2E status:

- Still blocked. Non-production authenticated E2E fixture keys and dashboard base URL are not loaded in the Codex process environment, so authenticated browser/staging proof was not rerun.

Remaining blockers before enabling another action:

- Apply `0078_superadmin_permission_assignments.sql` to the target staging/non-production environment intended for operator testing.
- Seed or migrate explicit scoped permission assignments for real non-production operator users through a future audited grant process.
- Capture authenticated browser/API evidence for activation recheck using real non-production dashboard fixtures.
- Do not enable any additional Phase 4A action until its route, scoped permission, reason/confirmation policy, production switch, audit event, redaction proof, and focused tests are complete.

## Phase 4F Activation Recheck Authenticated Browser/API Proof

Date: 2026-07-01

Result: blocked. Authenticated non-production API/browser proof was not run because the required E2E fixtures and database URL are not loaded in the Codex process environment. No authenticated proof is claimed.

Required preflight:

| Variable | Status |
|---|---|
| `E2E_API_KEY` | missing |
| `E2E_ADMIN_API_KEY` | missing |
| `E2E_PLATFORM_SUPER_ADMIN_API_KEY` | missing |
| `E2E_BASE_URL` | missing |
| `DATABASE_URL` | missing |
| `DIRECT_DATABASE_URL` | missing |
| `VERIXET_DATABASE_URL` | missing |

Proof cases:

| Case | Phase 4F status | Reason |
|---|---|---|
| Platform superadmin can run activation recheck | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Non-superadmin with active `verixet.activation.recheck` assignment can run activation recheck | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Non-superadmin with revoked assignment is denied | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Non-superadmin with wrong permission is denied | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Missing reason category is denied | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Production disable switch blocks even when permission passes | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Activation recheck does not grant entitlement/access | blocked | Missing authenticated fixture keys/base URL/DB URL |
| Activation recheck does not expose raw provider/request/response bodies | blocked | Missing authenticated fixture keys/base URL/DB URL |

Evidence files:

- No Phase 4F authenticated API response evidence generated.
- No Phase 4F dashboard/browser screenshots generated.
- No Phase 4F audit-event evidence generated.
- Existing Phase 4E local DB proof remains available at `apps/Verixet/output/phase4e/phase4e-permission-assignment-proof.json`, but it is not a substitute for authenticated browser/API proof.

Validation results for Phase 4F:

- Preflight command checked `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `E2E_BASE_URL`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `VERIXET_DATABASE_URL` without printing values.
- Authenticated proof, `npm --prefix apps/Verixet run test:e2e:dashboard`, focused browser/API proof tests, audit-event capture, screenshot capture, and generated-evidence grep were skipped because required fixtures are missing.
- No code path, route, action registry, permission grant UI, permission revoke UI, billing mutation, entitlement mutation, API-key mutation, webhook retry, tenant mutation, provider credential mutation, impersonation, deployment control, or destructive action was changed in this blocked phase.

Phase 2E status:

- Still blocked for the same reason: authenticated non-production E2E keys, base URL, and database URL are not loaded in this shell/session.

Remaining blockers:

- Load non-production `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `E2E_BASE_URL`, and a safe non-production `DATABASE_URL`/`DIRECT_DATABASE_URL`/`VERIXET_DATABASE_URL`.
- Seed platform-superadmin, active assignment, revoked assignment, wrong-permission assignment, activation binding, and safe audit-event fixture rows in that non-production environment.
- Rerun Phase 4F and capture sanitized authenticated API responses, screenshots, and audit evidence.

## Phase 4G Staging Superadmin Rollout Checklist

Date: 2026-07-01

Result: staging rollout checklist and presence-only preflight command added. No migration was applied to production, no real API keys were generated, no grant/revoke UI was added, and no new Superadmin action was enabled.

Checklist location:

- `docs/verixet-staging-superadmin-rollout.md`

Preflight helper:

- Added `apps/Verixet/scripts/check-superadmin-staging-preflight.ts`.
- Added package command `npm --prefix apps/Verixet run preflight:superadmin-staging`.
- The helper checks required E2E fixture presence, DB URL presence/category, and production-like environment flags without printing raw values.

Current blocked status:

- Phase 2E remains blocked until non-production authenticated E2E keys, base URL, and DB URL are loaded.
- Phase 4F remains blocked until non-production authenticated E2E keys, base URL, DB URL, activation fixtures, and scoped assignment fixtures are loaded.

Required next operator steps:

1. Load non-production `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `E2E_BASE_URL`, and a safe non-production `DATABASE_URL`/`DIRECT_DATABASE_URL`/`VERIXET_DATABASE_URL`.
2. Run `npm --prefix apps/Verixet run preflight:superadmin-staging` and stop if it reports missing variables or a production-like database target.
3. Apply/check migrations `0077_admission_decision_events` and `0078_superadmin_permission_assignments` only against the confirmed non-production database.
4. Seed Phase 2E admission cases and Phase 4F activation recheck permission cases.
5. Capture sanitized authenticated API/UI/audit evidence and grep generated evidence for sensitive fields and fake access/readiness labels.

Validation results for Phase 4G:

- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and the existing 18 warnings.
- `npm --prefix apps/Verixet run audit:dashboard` passed: no suspicious admin routes without obvious guards and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run preflight:superadmin-staging` ran and correctly returned nonzero because `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY`, `E2E_BASE_URL`, and DB URL are missing in this shell/session. It printed presence/category only and omitted raw values.
- Markdown/doc diff check passed.
- Grep scan of `docs/verixet-staging-superadmin-rollout.md` for sensitive-field and fake-access terms completed. Reviewed hits are checklist redaction requirements, stop conditions, command examples, and forbidden wording; no raw secret, token, key value, cookie value, authorization header value, raw body, provider credential, or fake success claim was added.

Local fixture setup validation after Phase 4G:

- Existing setup inspected: `.env.e2e.example`, `bootstrap:e2e-env`, `test:e2e:dashboard`, Playwright dashboard tests, dashboard API-key login helpers, and bootstrap user/API-key creator.
- Added `apps/Verixet/scripts/bootstrap-e2e-local-env.ts`.
- Added package command `npm --prefix apps/Verixet run bootstrap:e2e-local-env`.
- Updated `preflight:superadmin-staging` to load `.env.e2e.local` without printing values.
- Created disposable local DB `verixet_e2e_local_fixtures`; no production DB was used.
- Ran `npm --prefix apps/Verixet run db:migrate` against the disposable DB; migrations through `0078` applied.
- Ran `npm --prefix apps/Verixet run bootstrap:e2e-local-env`; it wrote `.env.e2e.local`, printed status only, and did not print key values.
- Ran `npm --prefix apps/Verixet run preflight:superadmin-staging`; passed with all required variables present and DB category `local`.
- Ran `npm --prefix apps/Verixet run typecheck`; passed.
- Ran `npm --prefix apps/Verixet run lint`; passed with 0 errors and the existing 18 warnings.
- Ran `npm --prefix apps/Verixet run test:e2e:dashboard`; first attempt failed because port `3000` was already in use. Second attempt using `next start` on alternate port failed because local QA DB access is correctly refused under `NODE_ENV=production`. Third attempt passed against `next dev` on an alternate local port with `E2E_SKIP_WEBSERVER=1`.

## Phase 4H Dashboard E2E Reliability Fix

Date: 2026-07-01

Result: passed locally with the authenticated local E2E fixture environment. The standard `npm --prefix apps/Verixet run test:e2e:dashboard` command now runs a local fixture-safe Desktop Chrome dashboard flow, clears only confirmed local/disposable auth-rate buckets between the auth and audit spec files, and passes against `next dev` on alternate local port `3121` with `E2E_SKIP_WEBSERVER=1`. No new Superadmin action was enabled.

Selector reliability fix:

- Dashboard navigation assertions now scope links to the dashboard navigation landmark instead of querying duplicate accessible names globally.
- The duplicate `Billing`/platform billing links are no longer ambiguous in the E2E harness.
- Responsive dashboard tests now open the navigation drawer when the sidebar is hidden before asserting sidebar links.
- Product copy and accessible labels were not removed to satisfy tests.

Rate-limit harness fix:

- Added a local-only `reset-local-e2e-auth-rate-buckets` helper that loads `.env.e2e.local`, confirms the DB URL is local/disposable/non-production, and clears `auth_rate_buckets` without printing DB URLs, API keys, cookies, or tokens.
- Updated `test:e2e:dashboard` and `test:e2e:dashboard:local` to run serial Desktop Chrome auth/audit specs and reset local rate buckets before each spec group.
- Added storage-state reuse in the dashboard E2E login helper so each role avoids repeated login exchanges within a worker.
- The reset helper skips instead of clearing if the DB URL is missing, unknown, or production-like.

Local fixture/access fix:

- The local E2E bootstrap now seeds active dashboard workspace access rows for the regular and platform E2E workspaces so authenticated dashboard pages do not fail admission setup during the dashboard suite.
- The bootstrap wrapper continues to write only ignored local fixture env files and status output; it does not print generated key values.

Validation results for Phase 4H:

- `npm --prefix apps/Verixet run preflight:superadmin-staging` passed with all required fixtures present, DB category `local`, and raw values omitted.
- `npm --prefix apps/Verixet run proof:phase2e4f:local` passed and regenerated sanitized proof at `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json`.
- `npm --prefix apps/Verixet run test:e2e:dashboard` passed: 3 dashboard-auth tests and 35 dashboard-audit tests under Desktop Chrome.
- `npm --prefix apps/Verixet run audit:dashboard` passed: no duplicate nav labels/hrefs, no suspicious admin routes without obvious guards, and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run typecheck` passed after fixing the Playwright storage-state type.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and the existing 18 warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static Phase 17 proof, 68 pass, 0 warnings, 0 failures.
- Grep scan of `apps/Verixet/output/phase2e4f-local` and `apps/Verixet/test-results` for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `webhook payload`, `response_body`, `request_body`, `stack trace`, `provider error`, `access granted`, `production-ready`, `force grant`, and `bypass billing` returned no matches.

Files changed for Phase 4H:

- `apps/Verixet/e2e/dashboard-audit.spec.ts`
- `apps/Verixet/e2e/dashboard-auth.spec.ts`
- `apps/Verixet/e2e/dashboard-auth-helpers.ts`
- `apps/Verixet/package.json`
- `apps/Verixet/scripts/bootstrap-e2e-local-env.ts`
- `apps/Verixet/scripts/reset-local-e2e-auth-rate-buckets.ts`
- `docs/verixet-superadmin-gap-audit.md`
- `docs/verixet-staging-superadmin-rollout.md`

Phase 2E/4F status:

- Phase 2E local authenticated admission proof remains passed with local non-production fixtures.
- Phase 4F local authenticated activation recheck proof remains passed with local non-production fixtures.
- Staging/remote authenticated proof still requires an operator-provided non-production staging base URL, DB URL, and fixture keys; no production DB or production keys were used.

Mutation status:

- `activation.recheck` remains the only enabled Superadmin action.
- No billing mutation, entitlement mutation, API-key mutation, webhook retry, tenant mutation, provider credential mutation, impersonation, deployment control, destructive action, permission grant UI, or permission revoke UI was added.

## Final Superadmin Checkpoint

Date: 2026-07-01

Result: ready for operator review/commit. The Verixet app changes live in the nested `apps/Verixet` repository, while the checkpoint docs live in the workspace-level repository. Generated evidence and local fixture secrets remain ignored and unstaged.

Changed-file scope:

- Source and test changes are in the nested `apps/Verixet` repository.
- Documentation changes are `docs/verixet-superadmin-gap-audit.md` and `docs/verixet-staging-superadmin-rollout.md`.
- `docs/workflow-copilot-audit.md` is also untracked in the workspace and appears unrelated to this Verixet checkpoint; it was not modified for Phase 4H.

Generated/ignored evidence:

- `apps/Verixet/.env.e2e.local` is ignored and was not staged.
- `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json` is ignored and was not staged.
- `apps/Verixet/output/phase2e4f-local/superadmin-read-only.png` is ignored and was not staged.
- `apps/Verixet/output/phase2e4f-local/xflow-dashboard.png` is ignored and was not staged.
- `apps/Verixet/test-results/` is ignored and was not staged.

Action enablement checkpoint:

- `activation.recheck` remains the only enabled Superadmin action.
- Entitlement adjustment remains disabled.
- Billing override remains disabled.
- API key revoke/rotate remains disabled.
- Webhook retry remains disabled.
- Tenant suspension/reactivation remains disabled.
- Provider credential refresh remains disabled.
- Guardrail override remains disabled.
- Issue status update remains disabled.
- Support reply remains disabled.

Final validation results:

- `npm --prefix apps/Verixet run preflight:superadmin-staging` passed with required fixture presence true, DB category `local`, and raw values omitted.
- `npm --prefix apps/Verixet run proof:phase2e4f:local` passed and regenerated sanitized proof JSON.
- `npm --prefix apps/Verixet run test:e2e:dashboard` passed: 3 dashboard-auth tests and 35 dashboard-audit tests under Desktop Chrome.
- `npm --prefix apps/Verixet run audit:dashboard` passed with no duplicate nav labels/hrefs and no suspicious unguarded admin routes.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` passed with 0 errors and the existing 18 warnings.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static Phase 17 proof, 68 pass, 0 warnings, 0 failures.
- `npm run validate:ecosystem-contracts` passed.

Final grep scans:

- Generated evidence scan over `apps/Verixet/output/phase2e4f-local` and `apps/Verixet/test-results` for `Authorization`, `Bearer`, `apiKey`, `secret`, `token`, `webhook payload`, `response_body`, `request_body`, `stack trace`, `provider error`, `access granted`, `production-ready`, `force grant`, and `bypass billing` returned no matches.
- Broad documentation hits for sensitive/fake-access terms are checklist/audit wording and historical grep records, not raw values.

Proof evidence paths:

- `apps/Verixet/output/phase2e4f-local/phase2e-4f-local-proof.json`
- `apps/Verixet/output/phase2e4f-local/superadmin-read-only.png`
- `apps/Verixet/output/phase2e4f-local/xflow-dashboard.png`

Secret staging checkpoint:

- No files are staged in the workspace repository.
- No files are staged in the nested `apps/Verixet` repository.
- `.env.e2e.local`, generated local proof output, screenshots, and Playwright test output remain ignored/unstaged.

## Validation Notes

Commands run during this audit:

- `npm --prefix apps/Verixet run audit:dashboard` passed. It found 58 dashboard routes, 30 nav items, no duplicate labels/hrefs, no missing sidebar targets, no suspicious admin routes without obvious guards, and no platform nav route without a platform page guard.
- `npm --prefix apps/Verixet run test -- src/lib/dashboard/transactions/diagnostics.test.ts` passed: 1 file, 2 tests.
- `npm --prefix apps/Verixet run typecheck` passed.
- `npm --prefix apps/Verixet run lint` completed with 0 errors and 18 existing warnings.
- `npm run validate:ecosystem-contracts` passed.
- `npm run proof:billing-contracts` passed: ecosystem contract validation plus static phase 17 proof, 68 pass, 0 warnings, 0 failures.
- `npm --prefix apps/Verixet run test` completed with 578 passed files, 3 skipped files, 2145 passed tests, 26 skipped tests, and 1 timeout in `src/lib/access-billing-control/service.behavior.test.ts`.
- `npm --prefix apps/Verixet run test -- src/lib/access-billing-control/service.behavior.test.ts` passed on isolated rerun: 1 file, 2 tests.
- `npm --prefix apps/Verixet run test:e2e:dashboard` timed out locally before producing a result summary; no pass is claimed.
- Grep scans for leaked secret patterns, webhook/request body exposure, hardcoded production-ready claims, and destructive labels completed. Findings were reviewed as either tests/placeholders, already-redacted previews, password fields, one-time created secret display flows, or documented audit gaps; no new destructive implementation was added.
