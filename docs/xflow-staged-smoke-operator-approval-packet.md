# XFlow P3O Staged Smoke Operator Approval Packet

Generated for P3O on 2026-07-04.

This packet is a review artifact only. It does not start or schedule live staged smoke. P3Q-Prep fills staged-only values and records operator approval for a future staged non-production smoke run; it still does not execute live smoke.

## Decision

| Field | Value |
| --- | --- |
| Approval status | `GO` |
| Execution status | Authorized for future staged non-production smoke only; not executed by P3Q-Prep |
| Environment class | Staged non-production only |
| Production allowed | No |
| Provider calls allowed | No, until operator-approved staged sandbox read-only workflows are named |
| Mutations allowed | No, except a separately approved sandbox/no-op audit-write proof |
| Raw reveal allowed | No |
| Approval owner | operator-approved-by-user-request-p3q-prep |
| Approval timestamp | 2026-07-04T05:34:55.8027104-05:00 |

## Exact Environment Identity Required

The operator-approved staged-only values for a future live staged smoke command are listed below.

| Required value | Current packet value | Approval rule |
| --- | --- | --- |
| Environment name | `xflow-staged-sandbox` | Must be a dedicated staged/non-production name. Must not contain or target production. |
| Environment URL/base origin | `https://xflow-staged-sandbox.example.invalid` | Must be a staged-only origin on the approved host allowlist. |
| Database/project identity | `xflow-staged-sandbox-db` | Must be sandbox/staged only, with no production data. |
| Auth identity provider/project | `xflow-staged-sandbox-auth` | Must contain fixture users only. |
| Provider sandbox project/account | `xflow-provider-sandbox-project` | Required only for approved read-only provider-status workflows. |
| Evidence output root | `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/` | Must be ignored or sanitized before tracking. |
| Run ID | `xflow-staged-smoke-run-20260704T103455Z` | Must be unique and non-secret. |

No command may run if any staged-only approval value is changed outside this packet without rerunning `npm run verify:staged-smoke-approval-packet`.

## Allowed Hosts

The operator-approved host allowlist for the future staged smoke run is below. P3Q-Prep does not contact these hosts.

| Host | Status | Purpose |
| --- | --- | --- |
| `localhost` | Allowed for local preflight only | Local browser/proof harness checks. |
| `127.0.0.1` | Allowed for local preflight only | Local loopback checks. |
| `xflow-staged-sandbox.example.invalid` | Approved | Staged XFlow app origin. |
| `provider-sandbox.example.invalid` | Approved | Optional read-only sandbox provider status proof. |

Blocked by default:

- Any production app, deployment, database, provider, billing, entitlement, AI, or email host.
- Any host not listed in the operator-approved allowlist.
- Any redirect, callback, CDN, asset, telemetry, or API host not explicitly approved.

## Fake/Sandbox Credential Proof

The operator must provide proof without printing raw values.

| Credential category | Required proof | Raw value policy |
| --- | --- | --- |
| Staged app session | Fixture user identity and auth-state fingerprint only | Do not print cookies, bearer tokens, refresh tokens, or session secrets. |
| Staged database/project | Sandbox project label and redacted connection fingerprint only | Do not print connection strings or passwords. |
| Provider sandbox | Provider sandbox label, read-only permission statement, and redacted key fingerprint only | Do not print API keys, signing secrets, or provider tokens. |
| Webhook/signature material | Sandbox-only signing policy and redacted fingerprint only | Do not print signing secrets. |
| AI/email/billing/entitlement | Not approved for P3O | No credential material allowed. |

Credential proof is a `NO-GO` if it includes production markers, production project names, raw values, customer identifiers, or private content.

## Fixture Identities

P3O does not create or seed staged fixtures. These are the exact synthetic identity shapes that the future operator-approved staged run must use or explicitly replace with staged-only equivalents.

| Fixture | Required value |
| --- | --- |
| Fixture tenant/workspace ID | `xflow-staged-fixture-workspace` |
| Fixture workspace slug | `xflow-staged-smoke-fixture` |
| Admin fixture user ID | `xflow-staged-fixture-admin` |
| Admin fixture email | `xflow-staged-smoke-admin@example.invalid` or operator-approved sandbox mailbox |
| Denied fixture user ID | `xflow-staged-fixture-denied` |
| Denied fixture email | `xflow-staged-smoke-denied@example.invalid` or operator-approved sandbox mailbox |
| Fixture app ID | `xflow-staged-fixture-app` |
| Fixture app slug | `xflow-staged-smoke-app` |
| Fixture deployment target ID | `xflow-staged-fixture-deployment-target` |
| Assistant/support/copilot fixture records | Synthetic records only, with no private prompts, customer content, or provider payloads |

No production tenant, workspace, user, customer, app, deployment, provider, trace, assistant, support, or copilot record may be used.

## Workflow List

| Workflow | Approval default | Mutation boundary | Required evidence |
| --- | --- | --- | --- |
| Staged sign-in proof | Operator approved | Read-only auth flow with fixture users only | Auth-state fingerprint, denied/permitted user result, no raw tokens/cookies. |
| Staged route access proof | Operator approved | Read-only browser navigation | Screenshots or assertions for loading, empty, error, denied, degraded, and unavailable states. |
| Staged API auth/RBAC proof | Operator approved | Read-only API checks with fixture users only | 401/403/200 matrix, workspace/app scope proof, no private data. |
| Staged read-only provider-status proof | Operator approved | Read-only sandbox provider status only | Host allowlist, redacted provider fingerprint, no mutation. |
| Staged redacted provider-error proof | Operator approved | Synthetic/sandbox error only | Redacted summary, no raw response body, no stack trace, no secret/header/cookie. |
| Staged deployment action gated proof | Operator approved | Gate/confirmation proof only; no redeploy/restart execution | Disabled or confirmation-gated state, no provider mutation. |
| Staged audit-log write proof for safe sandbox/no-op action | Separately approval-gated | Sandbox/no-op audit write only if named by operator | Persisted audit event, actor/workspace/app scope, redacted metadata, safe failure state. |
| Staged cleanup/teardown proof | Required after any approved run | Cleanup only for staged fixtures | Cleanup command result, post-cleanup verification, redacted artifact scan. |

## Forbidden Workflow List

- Production redeploy.
- Production restart.
- Production sync.
- Provider mutation.
- Billing mutation.
- Entitlement mutation.
- Raw secret reveal.
- Raw provider log reveal.
- Raw provider error reveal.
- Production customer data access.
- AI provider calls.
- Real email delivery.
- Any workflow using production credentials, production data, production tenants, production users, production workspaces, production apps, production deployment targets, private customer content, or raw provider payloads.

## Mutation Approval Boundaries

Default mutation decision: `NO-GO`.

Allowed only with separate operator approval:

- Sandbox/no-op audit-log write proof.
- Cleanup/teardown of staged fixtures created for the approved run.

Still forbidden:

- Redeploy, restart, provider sync, provider refresh, provider connect, billing changes, entitlement changes, AI provider calls, real email delivery, raw reveal, production target selection, and any provider mutation.

Any approved mutation must include actor, workspace/app scope, confirmation text, reason/category, server-side permission proof, redacted audit metadata, rollback or safe-failure evidence, and post-run cleanup proof.

## Cleanup and Teardown

Operator-approved cleanup command for a future approved staged run:

```powershell
npx tsx scripts/cleanup-staged-smoke-fixtures.ts --run-id xflow-staged-smoke-run-20260704T103455Z --fixture-scope xflow-staged-smoke-fixture --environment xflow-staged-sandbox
```

The P3Q runner must confirm this command exists and targets only the named staged fixture tenant/app/user records before execution. Cleanup evidence must be written to `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved-cleanup/xflow-staged-smoke-run-20260704T103455Z/cleanup-summary.json`.

Cleanup is a hard stop if:

- The cleanup command can target production.
- The cleanup command cannot prove fixture scope.
- The cleanup command prints raw secrets, tokens, cookies, connection strings, private content, provider payloads, stack traces, provider IDs, deployment IDs, or trace IDs.
- Post-cleanup verification is missing.

## Stop Conditions

Stop immediately and preserve redacted evidence if any condition occurs:

- Any `PENDING_` value remains in the approved packet.
- Any production host, production credential, production data, production tenant, production workspace, production app, production deployment, or production provider target appears.
- Any unapproved host is requested.
- Any external provider call occurs outside the approved host/workflow list.
- Any mutation occurs without separate sandbox/no-op approval.
- Any raw secret, token, cookie, connection string, private content, request body, response body, provider payload, provider log, provider error, stack trace, provider ID, deployment ID, or trace ID appears in output.
- Any page or evidence claims staged readiness or production readiness.
- Any auth/RBAC denial unexpectedly grants access.
- Any cleanup or post-cleanup verification fails.

## Required Evidence Before Run

- Completed operator approval decision with no pending values.
- Staged non-production environment identity.
- Host allowlist and network guard configuration.
- Fake/sandbox credential proof with redacted fingerprints only.
- Fixture tenant/workspace/app/user identity summary.
- Workflow list and forbidden workflow list.
- Mutation approval boundaries.
- Cleanup/teardown command and post-cleanup verification plan.
- Stop conditions.
- Dry-run evidence from `npm run proof:staged-smoke:dry-run`.
- Dry-run verifier result from `npm run verify:staged-smoke:dry-run`.
- Hard-stop register verifier result from `npm run verify:production-hard-stops`.

## Required Evidence After Run

- Run summary with approved environment, workflow list, and redacted result.
- Host allowlist/network guard result, including blocked attempts.
- Auth/RBAC and route/API result matrix.
- Browser assertions or screenshots for approved pages/states.
- Redacted provider-status/error evidence for approved read-only sandbox workflows.
- Audit event evidence for separately approved sandbox/no-op audit write, if any.
- Cleanup/teardown result and post-cleanup verification.
- Redaction scan over generated evidence.
- Explicit statement that production readiness remains unclaimed.

## Go / No-Go Checklist

| Check | Required answer before execution |
| --- | --- |
| Every `PENDING_` value replaced with staged-only values | `GO` only if complete |
| Environment is dedicated staged non-production | `GO` only if true |
| No production credentials or data | `GO` only if true |
| Host allowlist approved and network guard configured | `GO` only if true |
| Fixture tenant/app/user IDs are staged-only | `GO` only if true |
| Workflows and forbidden workflows reviewed | `GO` only if true |
| Mutation boundaries reviewed and default is no mutation | `GO` only if true |
| Cleanup command targets staged fixtures only | `GO` only if true |
| Stop conditions accepted | `GO` only if true |
| Evidence paths and redaction scan accepted | `GO` only if true |
| Operator explicitly records approval | `GO` only if true |
| Any production target or raw reveal is requested | `NO-GO` |

Final packet decision: `GO`.

## P3P Verification

P3P adds `npm run verify:staged-smoke-approval-packet`, backed by `apps/XFlow/scripts/verify-staged-smoke-operator-approval-packet.ts`.

The verifier reads this packet, the staged smoke plan, and the production hard-stop register. It writes machine-readable evidence to `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approval-packet-verification/summary.json`.

Current expected result after P3Q-Prep:

- Packet status: `go`.
- Packet decision: `GO`.
- Live staged smoke authorization: `true` for future staged non-production smoke only.
- Production readiness authorization: `false`.

The verifier does not run live staged smoke, call providers, open external network connections, execute deployment actions, execute mutations, or grant production readiness.
