# XFlow U3 Authenticated Local Fixture Browser Proof

Status: local authenticated fixture browser proof.

U3 is local authenticated fixture proof only. It is not real account proof, not provider proof, not staging proof, not production proof, and not production readiness.

## Fixture/Auth Method

- U3 reuses the existing local browser proof harness.
- The fixture auth path is the existing `seed:local-browser-proof` plus `auth-state:local-browser-proof` flow, which creates disposable `.example.invalid` fixture users and Playwright storage state under `apps/XFlow/.xflow-local-browser-proof/`.
- The harness requires loopback app and database URLs, the explicit local apply flag, and browser request blocking for non-loopback destinations.
- U3 does not introduce provider credentials, real user records, staging endpoints, production endpoints, or real account state.

## What U3 Proves Locally

- Authenticated dashboard overview renders in a loopback browser session using the fixture storage state.
- Authenticated apps list and app detail pages render for the disposable local proof app.
- Authenticated tools, developer, settings, security, help, logs, support, and status surfaces are reachable where captured.
- Integration setup panels are captured only as local fixture/setup evidence.
- U1 and U2 guardrails remain part of the U3 verifier.

## What U3 Does Not Prove

- No provider calls were executed.
- No provider credentials were used.
- No staging or production endpoint was hit.
- No deployment was performed.
- No real user data was used.
- No account, settings, billing, provider, MFA, passkey, workspace, email, SMS, AI, credential, or deployment mutation was executed.
- Billing, entitlement, checkout, portal, provider refresh, integration authority, deployment authority, AI provider behavior, support delivery, and external app runtime state remain unproved.
- Production readiness remains not claimable.

## Browser Evidence

Evidence is written under `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/`.

Screenshots:

- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-overview.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-apps-list.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-app-detail.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-tools.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-developer.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-settings.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-security.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-help.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-support.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-status.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-logs.png`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/screenshots/u3-fixture-auth-setup-panels.png`

Machine-readable evidence:

- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/browser-proof-summary.json`
- `apps/XFlow/.xflow-local-browser-proof/u3-user-dashboard/verification-summary.json`

## Classification Rules

Rows use only these classifications: `locally-auth-fixture-browser-proved`, `locally-browser-proved`, `local-static-only`, `provider-proof-needed`, `mutation-proof-not-executed`, `intentionally-unavailable`, and `not-applicable`.

Fixture-auth rows cannot be described as real account proof. Provider, integration, billing, and deployment rows cannot claim live, healthy, connected, synced, provider-verified, or paid/active external state. Mutation-proof-not-executed rows cannot claim mutation success.

## Register

Detailed row-level U3 evidence lives in `docs/xflow-user-dashboard-auth-fixture-browser-proof-register.json`.
