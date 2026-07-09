# XFlow U4 User Dashboard API Redaction Proof

Status: local API redaction proof.

U4 is local API redaction proof only. It is not provider proof, not billing proof, not mutation proof, not staging proof, not production proof, and not production readiness.

## Method

- U4 reuses the local fixture auth state created by the U3 local browser proof harness.
- The API harness runs only against a loopback XFlow URL.
- The API harness exercises read-only user-dashboard-facing GET routes with disposable fixture auth.
- The harness records endpoint, method, HTTP status, response shape summary, and redaction result.
- The harness records finding labels and JSON paths only; it does not write raw matched values into proof files.

## What U4 Proves Locally

- Selected dashboard overview, app summary, dashboard activity, developer, ecosystem/session, Chronicle, AI Context Engine, integration setup, and billing status GET responses were locally exercised with fixture auth.
- Exercised responses passed the U4 sensitive key/value scanner.
- Safe metadata such as boolean readiness flags, setup labels, fixture IDs, high-level status labels, timestamps, key prefixes, and response shape keys remains available.
- `/api/v1/ai/settings` remains classified as `auth-required-not-exercised` because the disposable local fixture account reached an RBAC boundary for that settings route.

## What U4 Does Not Prove

- No provider calls were executed.
- No provider credentials were used.
- No staging or production endpoint was hit.
- No deployment was performed.
- No real user data was used.
- No account, settings, billing, provider, workspace, credential, AI, email, SMS, or deployment mutation was executed.
- Provider logs, provider debug diagnostics, checkout, portal, invoice, entitlement authority, deployment authority, model-provider behavior, and mutation responses remain unproved.
- Production readiness remains not claimable.

## Evidence

Evidence is written under `apps/XFlow/.xflow-local-browser-proof/u4-api-redaction/`.

Machine-readable evidence:

- `apps/XFlow/.xflow-local-browser-proof/u4-api-redaction/api-redaction-summary.json`
- `apps/XFlow/.xflow-local-browser-proof/u4-api-redaction/verification-summary.json`

## Register

Detailed row-level U4 evidence lives in `docs/xflow-user-dashboard-api-redaction-proof-register.json`.
