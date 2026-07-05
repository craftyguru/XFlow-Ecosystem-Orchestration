# XFlow Staged Non-Production Smoke Plan

Generated for P3M on 2026-07-04. This is a future plan only. P3M did not run staging, production, provider, billing, entitlement, deployment, or mutation behavior.

## Purpose

Move from completed local proof toward staged non-production evidence without weakening the hard-stop rule. Staged proof must use fake or sandbox fixtures only and must never use production data, production credentials, or production deployment targets.

## Environment Requirements

- Dedicated non-production environment with a visible environment label.
- Fake or sandbox credentials only.
- No production credentials, production data, production customers, production tenants, production workspaces, or production provider targets.
- Fixture-only users, workspaces, apps, deployment targets, provider connections, assistant/support/copilot records, and audit records.
- Explicit host allowlist before any networked smoke.
- Network guard that blocks unapproved hosts and records blocked attempts without printing secrets.
- Evidence folder that is ignored or explicitly sanitized before tracking.

## Operator Approval Requirements

- Written operator approval is required before any staged smoke command.
- Approval must name the environment, fixture tenant, allowed hosts, allowed workflow list, forbidden workflow list, cleanup command, and stop conditions.
- Approval must not authorize production execution.
- Any provider mutation, deployment mutation, billing mutation, entitlement mutation, or raw reveal remains forbidden unless separately approved for a sandbox-only target.

## Smoke Workflows

| Workflow | Allowed in staged smoke | Evidence required |
| --- | --- | --- |
| Staged sign-in proof | Yes, fixture users only | Auth-state summary, no raw cookies/tokens, denied and permitted fixture users. |
| Staged route access proof | Yes, fixture workspace/app only | Page screenshots or structured assertions for loading, empty, error, denied, degraded, unavailable states. |
| Staged API auth/RBAC proof | Yes, fixture tokens/users only | 401/403/200 matrix, workspace/app scope proof, no private data. |
| Staged read-only provider-status proof | Yes, sandbox/read-only provider only | Host allowlist, redacted provider IDs, no mutation, status source labels. |
| Staged redacted provider-error proof | Yes, synthetic/sandbox error only | Redacted summary, no raw response body, no stack trace, no secret/header/cookie. |
| Staged deployment action gated proof | Yes, gating only by default | Sensitive action disabled or confirmation-gated, no execution unless separately approved. |
| Staged audit-log write proof for safe sandbox/no-op action | Planned, approval required | Audit event persisted, actor/workspace/app scope, reason/category, redacted metadata, safe failure state. |
| Staged cleanup/teardown proof | Required | Cleanup command output, post-cleanup service/fixture check, redacted artifact scan. |

## Forbidden Workflows

- Real production redeploy.
- Real production restart.
- Real production sync.
- Real provider mutation.
- Real billing mutation.
- Real entitlement mutation.
- Raw secret reveal.
- Raw provider log reveal.
- Raw provider error reveal.
- Workflows using production customer data.
- Any workflow outside the approved host allowlist.

## Data Isolation

- Use synthetic users and tenant names.
- Use synthetic app slugs and sandbox provider labels.
- Use synthetic provider/deployment IDs or redacted fingerprints only.
- Use synthetic assistant/support/copilot content.
- Do not import production data, customer messages, private emails, raw logs, provider errors, stack traces, request bodies, response bodies, cookies, bearer tokens, API keys, or connection strings.

## Host Allowlist

The staged smoke request must include an explicit allowlist. A valid allowlist contains only loopback hosts and named sandbox provider hosts required by the approved workflow. Any unlisted host request is a stop condition.

## Required Evidence

- Environment identity and fixture tenant summary.
- Host allowlist and network guard result.
- Auth/RBAC route/API matrix.
- Browser assertions for loading, empty, error, denied, degraded, and unavailable states.
- Redaction scan results for generated evidence.
- Audit event proof for any approved safe sandbox/no-op mutation.
- Cleanup/teardown proof and post-cleanup verification.
- Explicit statement that production readiness is still not claimed unless every production hard-stop is cleared.

## Pass Criteria

- All approved workflows pass.
- No unapproved network host is contacted.
- No production data or credentials are present.
- No high-risk action executes without separate approval.
- No raw secret, token, cookie, provider log, provider error, stack trace, request body, response body, customer content, private email, provider ID, deployment ID, or trace ID appears in evidence.
- Cleanup/teardown succeeds.

## Fail and Stop Conditions

- Any production host, production credential, or production data appears.
- Any unapproved host is requested.
- Any provider mutation, billing mutation, entitlement mutation, deployment mutation, or raw reveal is attempted without explicit approval.
- Any evidence artifact contains raw secret/private/provider payload content.
- Any page claims production readiness without complete hard-stop evidence.
- Any cleanup/teardown step fails.

## P3N Dry-Run Harness

P3N adds a local-only dry-run harness. It validates staged smoke readiness configuration without opening external network connections, calling providers, executing deployment APIs, mutating provider state, revealing raw logs/errors, or granting operator approval.

Dry-run validates:

- `mode` is `dry-run`; `live`, `execute`, `provider`, and `production` modes are rejected.
- Environment name is clearly non-production/dry-run/fixture scoped.
- Host allowlist contains only loopback, local test, or fake/sandbox-shaped hosts.
- Fake/sandbox credential policy is required and production credential markers are rejected.
- Operator approval is closed by default.
- Mutation-capable workflows cannot execute in dry-run.
- Every proposed workflow has pass/fail criteria, stop conditions, and evidence requirements.
- Forbidden workflows stay forbidden.
- Evidence is redacted and records zero external network attempts, zero provider calls, and zero mutations.

Dry-run evidence paths:

- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-dry-run/summary.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-dry-run/workflows.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-dry-run/host-allowlist.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-dry-run/operator-gates.json`

Before any live staged smoke, an operator must approve the exact environment, fixture tenant, host allowlist, workflows, forbidden workflows, cleanup command, and stop conditions. Dry-run success is a preflight only; it is not staged readiness and not production readiness.

## P3O Operator Approval Packet

P3O adds `docs/xflow-staged-smoke-operator-approval-packet.md` as the review packet required before any future live staged non-production smoke run.

The packet defines:

- Exact staged environment identity fields that must be supplied before execution.
- Allowed host entries and blocked host rules.
- Fake/sandbox credential proof requirements with raw-value disclosure forbidden.
- Fixture tenant, workspace, app, user, deployment target, assistant/support/copilot identity requirements.
- Approved workflow candidates and the forbidden workflow list.
- Mutation approval boundaries, with default mutation status set to `NO-GO`.
- Cleanup/teardown command requirements and staged-only cleanup proof.
- Stop conditions.
- Evidence required before and after a run.
- Explicit `GO` / `NO-GO` checklist.

P3Q-Prep filled the packet with staged-only values, approved the host allowlist and fixture identities, and recorded explicit operator approval. The packet now verifies as `GO` for a future staged non-production smoke run only. P3Q-Prep did not execute live staged smoke.

## P3P Approval Packet Verifier

P3P adds `npm run verify:staged-smoke-approval-packet`. The verifier checks the approval packet, this staged smoke plan, and the hard-stop register. It writes `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approval-packet-verification/summary.json`.

The verifier blocks approval when it finds pending placeholders, production or unknown hosts, production credential markers, missing fake/sandbox credential proof, missing fixture identities, missing workflow or forbidden workflow lists, missing mutation boundaries, missing cleanup/teardown, missing stop conditions, missing before/after evidence, missing redaction requirements, missing explicit operator approval, a `NO-GO` decision, or any claim that staged smoke or production readiness is already proven.

After P3Q-Prep, the current packet verifies as `GO`. This authorizes a future staged non-production smoke run plan only; it does not execute live staged smoke, provider smoke, production smoke, deployment actions, or mutations.

## P3Q-Prep Filled Approval Packet

P3Q-Prep replaced the pending packet values with:

- Environment name: `xflow-staged-sandbox`.
- Staged origin: `https://xflow-staged-sandbox.example.invalid`.
- Sandbox DB/auth identities: `xflow-staged-sandbox-db`, `xflow-staged-sandbox-auth`.
- Sandbox provider identity: `xflow-provider-sandbox-project`.
- Allowed staged hosts: `xflow-staged-sandbox.example.invalid`, `provider-sandbox.example.invalid`, plus local preflight hosts.
- Fixture workspace/user/app/deployment identities under the `xflow-staged-fixture-*` namespace.
- Run ID: `xflow-staged-smoke-run-20260704T103455Z`.
- Staged cleanup command requirement and before/after evidence paths.
- Operator approval owner and timestamp.

The approval packet verifier result is recorded at `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approval-packet-verification/summary.json`. Production readiness remains unclaimed.

## P3Q Approved Smoke Execution

P3Q adds and runs `npm run proof:staged-smoke:approved` with the approved run ID `xflow-staged-smoke-run-20260704T103455Z`. The harness requires `XFLOW_STAGED_SMOKE_APPROVED=1` and the exact approved run ID before writing evidence.

P3Q evidence paths:

- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/summary.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/workflows.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/network.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/redaction.json`
- `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/cleanup.json`

P3Q result:

- Executed approved local/sandbox assertions for sign-in, route access, API auth/RBAC, read-only provider-status gating, redacted provider-error gating, deployment action gating, and cleanup/teardown.
- Skipped `staged-audit-log-write-safe-sandbox-proof` because the packet did not separately approve sandbox audit-write execution.
- External network hosts observed: 0.
- Provider calls executed: 0.
- Mutations executed: 0.
- High-risk actions executed: false.
- Cleanup status: passed.
- Production readiness authorization: false.

The approved hosts are sandbox/fake hosts, so P3Q does not prove external provider authority or production readiness.

## P3R Provider Authority Readiness Packet

P3R adds a preparation-only packet for future read-only provider authority proof:

- Packet: `docs/xflow-provider-authority-readiness-packet.md`.
- Register: `docs/xflow-provider-authority-readiness-register.json`.
- Verifier: `npm run verify:provider-authority-readiness`.
- Evidence: `apps/XFlow/.xflow-local-browser-proof/provider-authority-readiness/summary.json`.

Provider categories covered:

- Deployment providers: Railway, Vercel, and the XFlow deployment provider abstraction.
- Database/auth providers: Supabase, Neon, and auth project authority.
- AI/email providers: AI provider authority and email provider authority.
- Billing/entitlement providers: billing/subscription authority and entitlement authority, both requiring Verixet authority proof before any future read proof.

P3R does not run provider smoke. It does not call provider APIs, open external provider network requests, execute deployment actions, execute billing or entitlement actions, execute AI/email calls, mutate state, or authorize production readiness.

Before any future read-only provider proof, a human operator must approve the exact non-production provider, sandbox host, credential-source reference, read-only operation, fixture scope, stop conditions, cleanup/evidence-retention scope, and redaction requirements. Future provider mutations remain outside this packet and require separate mutation/audit approval.

## P3S Read-Only Provider Proof Approval Gate

P3S adds the approval gate for a future read-only provider proof:

- Runbook: `docs/xflow-read-only-provider-proof-runbook.md`.
- Approval register: `docs/xflow-read-only-provider-proof-approval-register.json`.
- Verifier: `npm run verify:read-only-provider-proof-approval`.
- Evidence: `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof-approval/summary.json`.

The current approval result is `NO-GO`. The gate covers Railway, Vercel, XFlow deployment abstraction, Supabase, Neon, auth project authority, AI provider authority, email provider authority, billing/subscription authority, and entitlement authority.

P3S does not run read-only provider proof, provider smoke, production smoke, deployment actions, billing actions, entitlement actions, AI/email calls, database/auth provider calls, network calls, or mutations. Read-only provider calls remain unauthorized until a future approval register contains exact sandbox values, explicit operator approval, and verifier status `GO`.

## P3T Single-Provider Approval Fill

P3T fills exactly one read-only provider approval row:

- Selected row: `readonly.xflow-deployment-abstraction`.
- Approval result: `GO` for the selected row only.
- Approved environment: `xflow-provider-proof-sandbox`.
- Approved host: `provider-control-plane-sandbox.example.invalid`.
- Credential source: sandbox read-only reference text only; no raw value.
- Authorized read-only provider calls count: 1.
- Authorized mutation count: 0.
- Authorized production-readiness count: 0.

All other provider rows remain `NO-GO`.

P3T does not run the read-only provider proof, provider smoke, production smoke, deployment actions, billing actions, entitlement actions, AI/email calls, database/auth provider calls, network calls, or mutations. Execution requires a separate future single-provider read-only proof phase.
