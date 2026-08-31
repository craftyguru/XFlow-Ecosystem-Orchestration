# Phase 2F Test Account And Fixture Packet

Date: 2026-07-11

## Purpose

This packet defines the minimum controlled production test-account and fixture system required before Phase 2F authenticated production proof can run across XFlow, Verixet, RatAiFy, AudAiX, Crevux, and WordGeni.

This is a planning packet only. It does not approve creating users, sessions, workspaces, fixtures, entitlements, screenshots, billing objects, provider calls, or production data mutations.

## Phase 2F.2 Creation Review Result

Phase 2F.2 reviewed the existing repository mechanisms for creating the minimum production proof identities and fixtures. No production fixtures were created because the available mechanisms are local/staging/e2e-oriented, print credentials or internal IDs, perform schema changes, exercise Stripe/provider paths, or require direct production database writes without a bounded approved production fixture contract.

Current creation status:

| Item | Status | Mechanism Reviewed | Reason |
| --- | --- | --- | --- |
| Test identities | BLOCKED | XFlow `scripts/seed-qa-account.ts`; Verixet `scripts/create-test-auth-user.ts`; Crevux `artifacts/api-server/scripts/create-smoke-users.ts`; app smoke scripts | Existing scripts print sensitive values or internal IDs, are local/staging oriented, or would require direct production database writes. |
| Shared proof workspace | BLOCKED | XFlow `scripts/bootstrap-production-workspace.ts`, local browser proof fixture scripts, app-local smoke seeders | Workspace creation would mutate production data and needs a bounded approved admin/UI or fixture mechanism before execution. |
| Verixet entitlement fixtures | BLOCKED | Verixet e2e/bootstrap and Phase 11 audit fixture scripts | Existing fixture scripts are e2e/local oriented or create synthetic billing/entitlement records without a production-safe non-billable fixture contract. |
| RatAiFy stored scan/report fixtures | BLOCKED | RatAiFy staging/local proof seeders | Existing mechanisms target staging/local proof data and must not run live scans or insert production scan data without a bounded fixture contract. |
| AudAiX stored audit/report fixtures | BLOCKED | AudAiX shared Supabase/runtime smoke scripts | Existing mechanisms write and clean smoke rows in safe local/staging mode; production use is not approved. |
| Crevux project/asset/export fixtures | BLOCKED | Crevux authenticated beta, export studio, Stripe smoke scripts | Existing scripts may create users/assets, alter schemas, or exercise Stripe/provider-adjacent paths; not safe for this production fixture phase. |
| WordGeni document/source/export fixtures | BLOCKED | WordGeni smoke/live verification and Stripe proof scripts | Existing scripts verify live behavior or require provider/Stripe gates; they are not a bounded production fixture creation path. |

Private fixture state file status: `.phase2f-fixture-state.local.json` is ignored by Git and may record labels/status only. No credentials, private IDs, tokens, or production object IDs are documented in this packet.

## Approved Scope

- Prepare named test identities and fixture requirements.
- Use only test-owned production workspace/account data.
- Use existing fixture/stored-result paths where available.
- Use read-only authenticated flows after credentials and fixtures are approved.
- Use denied-entitlement and outsider identities for negative authorization proof.
- Capture screenshots only after screenshot permission is explicitly approved.

## Prohibited Actions

- Do not use real customer accounts, workspaces, or data.
- Do not use personal accounts as shared test fixtures.
- Do not complete purchases or create real subscriptions.
- Do not mutate Stripe products, prices, customers, subscriptions, charges, or webhooks.
- Do not invoke paid AI, media, scanner, audit, embedding, ingestion, or external provider calls.
- Do not run migrations, rotate secrets, or modify production configuration.
- Do not hardcode credentials in Git or print secret values.
- Do not probe unknown production object IDs.
- Do not weaken authorization, bypass MFA, or disable production security controls.

## Existing Test Infrastructure

| App | Existing Test User Support | Fixture Support | Negative-Test Support | Production-Safe | Notes |
| --- | --- | --- | --- | --- | --- |
| XFlow | `scripts/seed-qa-account.ts`, `scripts/seed-admin.ts`, `scripts/seed-local-browser-proof-fixture.ts`, `scripts/create-local-browser-proof-auth-state.ts`; env names include `XFLOW_RELEASE_SMOKE_SESSION_COOKIE` and `PRODUCTION_SMOKE_SESSION_COOKIE`. | Local browser proof fixture seeds workspace, memberships, app/integration/deployment/support data; shared Supabase local/runtime smoke scripts exist. | Local denied browser-proof variant and admin-surface denial tests exist. | PARTIAL | Existing support is local/staging oriented and not approved for production. `seed:qa` and local proof seeders intentionally refuse unsafe DB targets by default. |
| Verixet | `scripts/create-test-auth-user.ts`, `scripts/bootstrap-e2e-env.ts`, `scripts/bootstrap.ts`, platform-super-admin bootstrap scripts. | `scripts/phase-11-ecosystem-audit-smoke-fixtures.ts`, access/billing control fixture helpers, dashboard e2e helpers. | Route tests and dashboard e2e cover regular/admin/platform-super-admin roles locally. | PARTIAL | Existing helpers are local/staging/e2e oriented; `bootstrap:e2e-env` refuses production-like environments. Production use requires a new approval packet and safe creation path. |
| RatAiFy | `scripts/bootstrap-staging-proof-fixtures.ts`, `scripts/bootstrap-local-e2e-proof.ts`, local/staging E2E env names documented as `RATAIFY_E2E_*`. | Stored proof payload exists at `docs/fixtures/audaix-proof-smoke.json`; local/staging proof scripts and shared Supabase smoke scripts exist. | Security/runtime tests cover superadmin, org access, paid scan creation, and entitlement guards. | PARTIAL | Production-safe use requires approved test-owned site and existing scan/report fixture. Do not run a new live scan without separate approval. |
| AudAiX | Supabase smoke scripts and superadmin staging preflight exist; env names include `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `TEST_WORKSPACE_ID` in staging/local runbooks. | Shared Supabase local/runtime smoke can create audit/report/monitor/finding/scan-job rows and clean them up in safe local/staging mode. | Workspace membership and superadmin route tests exist. | PARTIAL | Existing scripts are local/staging proof helpers. Production audit fixtures should be pre-existing stored results unless bounded creation is separately approved. |
| Crevux | `scripts/smoke-authenticated-beta.mjs`; `artifacts/api-server/scripts/create-smoke-users.ts`; smoke env names include `SMOKE_NORMAL_EMAIL`, `SMOKE_NORMAL_PASSWORD`, `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD`. | Local/staging smoke scripts exist for authenticated beta, storyboards, export studio, Stripe test, shared Supabase rows. | Local auth-boundary and admin proof scripts exist. | PARTIAL | Existing patterns are reusable but not approved production fixtures. Provider calls must remain disabled; use existing assets only. |
| WordGeni | `scripts/smoke-wordgeni.mjs`, `scripts/live-verify-wordgeni.mjs`, admin auth/local proof scripts. | Shared Supabase runtime smoke writes document/source/memory/session/provenance rows in safe mode and cleans them up. | Admin auth and route proof scripts exist. | PARTIAL | Production fixture must use existing document/source/export data or an approved bounded seed. Provider-backed writing, embeddings, ingestion, and worker mutations remain blocked. |

## Test Identity Matrix

| Identity | Purpose | Required Apps | Proposed Role | Creation Method | Approval Status | Secret Variables | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ecosystem_test_standard` | Normal authenticated member of the proof workspace, no paid entitlement by default. | All six | Workspace member/viewer or app equivalent | REQUIRES APPROVAL; prefer SAFE MANUAL CREATION through production signup/admin UI or SAFE SEED SCRIPT if one is approved. | REQUIRES APPROVAL | `PHASE2F_STANDARD_EMAIL`, `PHASE2F_STANDARD_PASSWORD` | Medium |
| `ecosystem_test_entitled` | Test-only user with non-billable/manual entitlement for allowed-path proof. | Verixet and paid-gated satellite checks | Workspace member with test-only entitlement | REQUIRES APPROVAL; likely REQUIRES BOUNDED DB INSERT or approved Verixet admin UI. | REQUIRES APPROVAL | `PHASE2F_ENTITLED_EMAIL`, `PHASE2F_ENTITLED_PASSWORD` | High if entitlement grant path is not already test-only and reversible |
| `ecosystem_test_denied` | Authenticated user with no entitlement for fail-closed proof. | All paid-gated apps | Workspace member without paid entitlement | REQUIRES APPROVAL; SAFE MANUAL CREATION or SAFE SEED SCRIPT. | REQUIRES APPROVAL | `PHASE2F_DENIED_EMAIL`, `PHASE2F_DENIED_PASSWORD` | Medium |
| `ecosystem_test_outsider` | Authenticated user outside the proof workspace for isolation denial proof. | All apps with workspace data | No membership in proof workspace | REQUIRES APPROVAL; SAFE MANUAL CREATION or SAFE SEED SCRIPT. | REQUIRES APPROVAL | `PHASE2F_OUTSIDER_EMAIL`, `PHASE2F_OUTSIDER_PASSWORD` | Medium |
| `ecosystem_test_admin` | Test-only admin for admin-surface proof where needed. | Optional; XFlow/Verixet/RatAiFy/AudAiX/Crevux/WordGeni only where explicit admin proof is approved | Test workspace admin or app-specific readonly admin | REQUIRES APPROVAL; prefer readonly/test admin role. | REQUIRES APPROVAL | `PHASE2F_ADMIN_EMAIL`, `PHASE2F_ADMIN_PASSWORD` | High; must not expose real customer data |

Minimum required initial set: `ecosystem_test_standard`, `ecosystem_test_denied`, and `ecosystem_test_outsider`. Add `ecosystem_test_entitled` only if non-billable entitlement proof is approved. Add `ecosystem_test_admin` only for admin-specific proof.

## Shared Workspace And Account Model

| Field | Proposed Value |
| --- | --- |
| Display name | `Ecosystem Production Proof Workspace` |
| Slug pattern | `ecosystem-production-proof-YYYYMMDD` |
| Owner | `ecosystem_test_standard` or a dedicated operator-owned test identity approved for workspace setup only |
| Members | `ecosystem_test_standard`, `ecosystem_test_denied`, optional `ecosystem_test_entitled`, optional `ecosystem_test_admin` |
| Non-member | `ecosystem_test_outsider` |
| XFlow ownership | XFlow should create/own the shared workspace identity model if an approved production-safe creation path exists. |
| App-local mapping | Each satellite app maps local workspace/account/org/site/project/document records to the shared proof workspace using a test-only external reference. Actual internal IDs must remain out of public docs. |
| Billing relationship | No real Stripe customer or subscription. Verixet may attach a test-only billing account record only after approval. |
| Provider relationship | No live provider keys, webhooks, integrations, scanner targets, media providers, AI providers, or customer integrations bound at workspace level. |
| Reporting | Clearly labeled test/demo; exclude from customer reporting where supported. |

## App Fixture Matrix

| App | Required Fixtures | Creation Method | Approval Status | Cost Controls | Cleanup Procedure | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | Proof workspace, standard member, outsider, non-admin user, app catalog state, app connection/readiness surfaces, Verixet handoff target, optional readonly test admin. | REQUIRES APPROVAL; prefer SAFE MANUAL CREATION or bounded XFlow seed script derived from existing local proof seed pattern. | REQUIRES APPROVAL | No provider keys; no app connection mutation during smoke; no workspace membership changes during smoke. | Logout sessions; remove test workspace/memberships only after final proof and explicit cleanup approval. | Medium |
| Verixet | Test billing account, canonical catalog access, entitlement-denied subject, optional non-billable entitlement-allowed grant, billing page, checkout-destination inspection path. | REQUIRES APPROVAL; entitlement allowed grant likely REQUIRES BOUNDED DB INSERT or approved admin UI. | REQUIRES APPROVAL | No checkout completion; no Stripe subscription; no charge; no webhook replay. | Revoke manual test entitlement and remove test billing account records after proof if approved. | High |
| RatAiFy | Test-owned site, existing stored scan/report, artifact fixture, denied-entitlement user, outsider user. | REQUIRES APPROVAL; prefer ALREADY EXISTS or SAFE MANUAL CREATION of a static test site record plus stored report. | REQUIRES APPROVAL | No live external scan; no arbitrary third-party URL; no paid scan action. | Remove test site/report only if created for proof and cleanup is approved. | Medium to High |
| AudAiX | Stored audit, report/evidence fixture, proof workspace, outsider, denied-entitlement user. | REQUIRES APPROVAL; prefer ALREADY EXISTS stored audit or bounded seed of stored result only. | REQUIRES APPROVAL | No Playwright/Lighthouse/axe external run; no provider audit execution. | Remove stored test audit/report rows only if created for proof and cleanup is approved. | Medium to High |
| Crevux | Test project, existing test asset, exportable/downloadable asset, denied-generation user, outsider user. | REQUIRES APPROVAL; prefer SAFE MANUAL CREATION/upload of static local-owned asset or ALREADY EXISTS asset. | REQUIRES APPROVAL | Provider-disabled mode; do not invoke image/video/audio generation or enhancement. | Remove test assets/project only if created for proof and cleanup is approved. | Medium |
| WordGeni | Test document, test source, source-backed draft/provenance fixture, existing export fixture, denied-writing user, outsider user. | REQUIRES APPROVAL; prefer ALREADY EXISTS or bounded seed of static document/source/provenance rows. | REQUIRES APPROVAL | No OpenAI, Anthropic, embeddings, ingestion, Temporal, or worker provider invocation. | Remove document/source/export rows only if created for proof and cleanup is approved. | Medium |

## Creation Method Classification

| Item | Method | Status | Notes |
| --- | --- | --- | --- |
| Test identities | SAFE MANUAL CREATION or SAFE SEED SCRIPT | REQUIRES APPROVAL | Use secure env vars or password manager only. Do not document values. |
| Shared workspace | SAFE MANUAL CREATION or REQUIRES BOUNDED DB INSERT | REQUIRES APPROVAL | Prefer UI/admin path if it avoids direct DB writes and can label the workspace clearly as test data. |
| Workspace memberships | SAFE MANUAL CREATION or REQUIRES BOUNDED DB INSERT | REQUIRES APPROVAL | Must be reversible and scoped to proof identities. |
| Verixet denied entitlement | ALREADY EXISTS if no grant is present | REQUIRES APPROVAL | Denied identity should have no paid/test grant. |
| Verixet allowed entitlement | REQUIRES BOUNDED DB INSERT or REQUIRES ADMIN UI | REQUIRES APPROVAL | Must be non-billable, test-only, time-bound, and reversible. |
| Stored scans/audits/assets/documents | ALREADY EXISTS or SAFE MANUAL CREATION | REQUIRES APPROVAL | Prefer existing stored fixtures. Bounded seed may be acceptable if no provider calls occur. |
| Provider unavailable path | BLOCKED unless an approved mock/test route already exists | BLOCKED | Do not intentionally take Verixet or providers offline in production. |

## Cost And Mutation Controls

| Area | Required Control | Status |
| --- | --- | --- |
| Stripe charges/subscriptions | No checkout completion; no subscription creation; no product/price/customer mutation. | READY |
| Verixet entitlement allowed path | Use non-billable/manual test grant only after explicit approval. | REQUIRES APPROVAL |
| Provider AI/media/writing | Provider-disabled/mock/stored fixture mode required. | PARTIAL |
| Scanner/audit | Existing stored scan/audit fixture required; no new external target execution. | PARTIAL |
| Exports/downloads | Use existing asset/document/report export where possible; no provider generation. | PARTIAL |
| Emails/SMS/webhooks | Avoid flows that send external notifications; document if unavoidable. | BLOCKED until app-specific behavior is confirmed |
| Usage quota | Denied users must not consume paid quota; any usage-event writes must be documented and approved. | REQUIRES APPROVAL |

## Secret Handling

Secret values may live only in Railway service secrets, an approved local env file excluded from Git, OS credential store, password manager, or CI secret store.

Recommended local file name:

```text
.env.phase2f.local
```

The root `.gitignore` excludes `.env`, `.env.*`, nested app `.env`, and nested app `.env.*` files. App `.gitignore` files also exclude local env files. Do not commit the file.

Required variable names:

```text
PHASE2F_STANDARD_EMAIL
PHASE2F_STANDARD_PASSWORD
PHASE2F_ENTITLED_EMAIL
PHASE2F_ENTITLED_PASSWORD
PHASE2F_DENIED_EMAIL
PHASE2F_DENIED_PASSWORD
PHASE2F_OUTSIDER_EMAIL
PHASE2F_OUTSIDER_PASSWORD
PHASE2F_ADMIN_EMAIL
PHASE2F_ADMIN_PASSWORD
PHASE2F_PROOF_WORKSPACE_SLUG
PHASE2F_SCREENSHOT_DIR
```

Optional app-specific variable names:

```text
PHASE2F_XFLOW_BASE_URL
PHASE2F_VERIXET_BASE_URL
PHASE2F_RATAIFY_BASE_URL
PHASE2F_AUDAIX_BASE_URL
PHASE2F_CREVUX_BASE_URL
PHASE2F_WORDGENI_WEB_BASE_URL
PHASE2F_WORDGENI_API_BASE_URL
PHASE2F_RATAIFY_TEST_SITE_SLUG
PHASE2F_RATAIFY_REPORT_SLUG
PHASE2F_AUDAIX_AUDIT_SLUG
PHASE2F_CREVUX_PROJECT_SLUG
PHASE2F_CREVUX_ASSET_SLUG
PHASE2F_WORDGENI_DOCUMENT_SLUG
PHASE2F_WORDGENI_SOURCE_SLUG
```

## Evidence Capture Requirements

- Capture one production-proof record per app using `docs/templates/production-proof-record.md`.
- Capture screenshots only after approval.
- Label screenshots with app, route, date/time, commit, and test-account type.
- Redact emails unless needed, user IDs, workspace IDs, session values, cookies, tokens, request headers, customer content, and private document/site content.
- Preserve request IDs only when safe.

## Cleanup Procedure

1. Logout all test identities.
2. Revoke temporary sessions if the app supports it.
3. Verify no Stripe charges, subscriptions, products, prices, customers, or webhooks were created or changed.
4. Verify no provider-cost calls were made.
5. Remove temporary fixtures only after explicit cleanup approval.
6. Revoke manual/test entitlements after proof if approved.
7. Preserve proof records and screenshots.
8. Update `docs/ECOSYSTEM_READINESS_STATUS.md` only for evidence-backed results.

## Exact Actions Requiring Approval

| Action | App | Mutation Type | Reversible | Cost Risk | Approval Needed |
| --- | --- | --- | --- | --- | --- |
| Create `ecosystem_test_standard` | All | Auth user creation | Yes | Low | Yes |
| Create `ecosystem_test_denied` | All | Auth user creation | Yes | Low | Yes |
| Create `ecosystem_test_outsider` | All | Auth user creation | Yes | Low | Yes |
| Create `ecosystem_test_entitled` | Verixet/all paid gates | Auth user plus entitlement | Yes if time-bound/manual | Medium | Yes |
| Create `ecosystem_test_admin` | App-specific | Auth user plus admin role | Yes | Medium | Yes |
| Create proof workspace | XFlow/shared | Workspace/account creation | Yes | Low | Yes |
| Assign test memberships | All | Workspace/account membership | Yes | Low | Yes |
| Add non-billable test entitlement | Verixet | Entitlement grant | Yes | Medium | Yes |
| Create stored test site/report | RatAiFy | Test data insert/manual creation | Yes | Medium if scan accidentally runs | Yes |
| Create stored audit/report | AudAiX | Test data insert/manual creation | Yes | Medium if audit accidentally runs | Yes |
| Create project/asset/export fixture | Crevux | Test data/upload | Yes | Medium if provider generation accidentally runs | Yes |
| Create document/source/export fixture | WordGeni | Test data/upload | Yes | Medium if provider writing/embedding accidentally runs | Yes |
| Capture authenticated screenshots | All | Evidence capture | N/A | Low | Yes |

## Approval Status Summary

| Area | Status |
| --- | --- |
| Test identity design | READY |
| Shared workspace model | READY |
| App fixture design | PARTIAL |
| Secret variable design | READY |
| Production-safe creation execution | BLOCKED |
| Provider-cost prevention | PARTIAL |
| Billing mutation prevention | READY |
| Authenticated smoke execution | BLOCKED |

Phase 2F.2 stop point: authenticated smoke testing remains blocked until a production-safe fixture creation mechanism is approved or the fixtures are created manually through an approved admin/UI path and recorded privately.

## Phase 2F.3 Provisioner Status

Phase 2F.3 adds a bounded root-level fixture provisioner:

```text
npm run phase2f:fixtures:dry-run
npm run phase2f:fixtures:verify
npm run phase2f:fixtures:cleanup
```

The provisioner now produces a schema-aware dry-run plan for all required identities, the XFlow proof workspace, Verixet billing/entitlement fixtures, and stored app fixtures for RatAiFy, AudAiX, Crevux, and WordGeni. Real production writes remain disabled until the app-specific write adapter is reviewed and explicitly approved. The production execution command surface requires `--environment production --confirm-production-fixtures`.

Current Phase 2F gate: PROVISIONER READY FOR REVIEW; production fixture creation still requires approval and must not be inferred from a passing dry run.

## Phase 2F.4 Write Adapter Status

Phase 2F.4 adds executable bounded write adapters for local validation:

```text
npm run phase2f:fixtures:validate
```

The validation mode runs against an in-memory non-production fixture store. It executes the actual adapter `provision`, `verify`, and `cleanup` methods for shared identities, XFlow, Verixet, RatAiFy, AudAiX, Crevux, and WordGeni. It does not use production credentials and does not mutate production.

Latest local validation evidence:

| Step | Result |
| --- | --- |
| First provision | 29 created, 0 reused |
| First verify | 9 verified |
| Second provision | 0 created, 29 reused |
| Second verify | 9 verified |
| Cleanup | 29 deleted |
| Unrelated rows unchanged | true |

Current Phase 2F gate: WRITE ADAPTERS VALIDATED LOCALLY; production execution still requires explicit approval, required credentials, expected project validation, and `--environment production --confirm-production-fixtures --enable-reviewed-write-adapters`.

## Phase 2F.4B Database Adapter Validation Status

Phase 2F.4B adds a real non-production database validation command:

```text
npm run phase2f:fixtures:validate-db
```

The validation was run against an isolated disposable PostgreSQL 17 database built from the repository Supabase migrations. It created, reused, verified, RLS-checked, and cleaned up deterministic marked fixture rows across Auth, XFlow/Core, Verixet, RatAiFy, AudAiX, Crevux, and WordGeni tables.

Latest database validation evidence:

| Step | Result |
| --- | --- |
| Schema identity | 6 ecosystem apps, 48 migrated app-schema tables |
| First provision | 33 created, 0 reused |
| First verify | adapter counts matched expected rows |
| Second provision | 0 created, 33 reused |
| Second verify | adapter counts matched expected rows |
| RLS visibility | standard user visible, outsider denied |
| Cleanup | 33 deleted, 0 marked rows remained |
| Unrelated rows unchanged | true |

Current Phase 2F gate: DATABASE ADAPTERS VALIDATED LOCALLY; production fixture creation and authenticated smoke tests still require explicit approval.

## Phase 2F.5 Production Fixture Execution Status

Phase 2F.5 attempted approved preflight, dry-run, and guarded execution only. No production fixtures were created.

Blocking conditions:

- `.env.phase2f.local` was absent, so required identity/workspace values and production target identity could not be validated.
- The reviewed provisioner still reports `productionWritesEnabled: false` and refuses non-dry production writes.

See `docs/production-proof/PHASE2F_PRODUCTION_FIXTURE_EXECUTION.md` for the full blocked execution record.

Current Phase 2F gate: PRODUCTION FIXTURE EXECUTION BLOCKED; authenticated production smoke testing remains blocked.

## Phase 2F.5A Production Write Enablement Status

Phase 2F.5A enables the guarded production write path technically while leaving production untouched. The live command path was validated against the disposable migrated PostgreSQL database and requires private `.env.phase2f.local` values before production can be retried.

## Phase 2F.5B Private Configuration Status

Phase 2F.5B keeps the minimum identity set to `standard`, `denied`, and `outsider`. `.env.phase2f.local` now contains deterministic synthetic email labels and still requires private values for `PHASE2F_STANDARD_PASSWORD`, `PHASE2F_DENIED_PASSWORD`, and `PHASE2F_OUTSIDER_PASSWORD`. Optional `entitled` and `admin` identities remain omitted until a later authenticated proof explicitly needs them.

## Phase 2F.5C Final Preflight Status

The three required passwords are now present privately. Bounded read-only collision checks found the configured auth identities absent and safe to create. Execution is not approved because the live SQL provision path must first be updated to consume the private identity credentials and create valid auth password hashes.

Current Phase 2F gate: PRODUCTION WRITE PATH ENABLED - PRIVATE CONFIGURATION REQUIRED; authenticated production smoke testing remains blocked.
