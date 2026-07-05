# XFlow Production Hard-Stop Register

Generated for P3M on 2026-07-04 and updated through P4B.

This register separates completed local browser proof from production readiness. P3G through P3L prove the local proof scope: six variants, three viewports, 9 workflows, 123 route visits, 849 assertions, and an admin matrix with 33 rows: 27 `done`, 0 `partial`, 0 `blocked`, 5 `intentionally-unavailable`, and 1 `not-applicable`.

Production readiness is not claimable from local proof. Any production claim remains blocked until external authority, staged non-production smoke, mutation audit execution, redaction, permission, scope, and operator approval evidence are complete.

## Classification Labels

| Label | Meaning |
| --- | --- |
| `local-proof-complete` | Proven only by local browser proof, local variants, local E2E, viewport proof, and matrix evidence. |
| `intentionally-unavailable-local` | Correctly disabled, unavailable, or read-only in local proof; never production-ready by itself. |
| `requires-staged-smoke` | Can be tested later in a safe non-production environment with fake/sandbox fixtures and explicit approval. |
| `requires-external-authority-proof` | Requires evidence from real external authority/configuration/provider state, usually read-only first. |
| `requires-mutation-audit-proof` | Requires proof that mutations are gated, scoped, confirmed, audited, redacted, and safe on failure. |
| `production-hard-stop` | Blocks any production-readiness claim until explicitly proven. |
| `operator-approval-required` | Must never run automatically or without explicit operator approval. |

## Hard-Stop Categories

| Category | Current classification | Production blocker |
| --- | --- | --- |
| Deployment/provider execution | `operator-approval-required`, `requires-external-authority-proof`, `production-hard-stop` | Redeploy, restart, provider refresh/sync/connect, status pull, log pull, error pull, environment targeting, provider ID handling, and provider error redaction lack staged/provider proof. |
| External provider authority | `requires-external-authority-proof`, `production-hard-stop` | Railway, Vercel, Supabase, Neon, AI/email providers, billing, subscription, and entitlement authority are not proven by local fixtures. |
| Mutation and audit execution | `requires-mutation-audit-proof` | High-risk actions need confirmation, reason/category, server-side permission, production/staging switch, audit write, redaction, rollback or safe failure evidence. |
| Auth/RBAC authority | `local-proof-complete`, `requires-staged-smoke` | Local route/API/RBAC and denied proof passed, but staged identity authority and superadmin/step-up behavior need fixture-only proof. |
| Data and privacy | `production-hard-stop`, `requires-external-authority-proof` | Raw logs, raw provider errors, stack traces, tokens, secrets, cookies, private/customer content, provider IDs, deployment IDs, and trace IDs must remain redacted or omitted. |
| Staged non-production readiness | `requires-staged-smoke` | Staged proof needs environment isolation, fake/sandbox credentials, no production data, fixture tenants/users/apps, host allowlist, network guard, audit capture, cleanup/teardown, and operator approval. |

## Register Summary

Machine-readable register: `docs/xflow-production-hard-stop-register.json`.

| Status | Count |
| --- | ---: |
| `local-proof-complete` | 19 |
| `operator-approval-required` | 3 |
| `requires-external-authority-proof` | 7 |
| `production-hard-stop` | 4 |
| `requires-mutation-audit-proof` | 3 |
| `requires-staged-smoke` | 3 |

## Local-Proof-Complete

- Local admin read UI proof across deployment, integration, overview, ecosystem, and system-status routes.
- Local route/API/RBAC verification and local denied browser proof.
- P3N staged smoke dry-run harness, host allowlist validator, fake/sandbox credential policy, and closed-by-default operator approval gate.

These items remain local evidence only. They do not prove production provider state, production identity state, or production mutation safety.

## Intentionally Unavailable Locally

- Redeploy action.
- Restart action.
- Provider refresh/sync/connect action.
- Integration sync/connect action.
- Raw log or raw error reveal.

These are correctly unavailable or gated locally and must not be treated as production-ready.

## Production Hard Stops

- Deployment environment targeting and provider deployment ID handling.
- Billing/subscription/entitlement authority.
- Raw secret/log/error/private content reveal.

No production readiness claim can be made until these are cleared with exact evidence and explicit approval.

## Approval Boundary

The following must never be executed automatically: production redeploy, production restart, production sync, provider mutation, billing mutation, entitlement mutation, raw secret reveal, raw provider log reveal, raw provider error reveal, and any workflow using production customer data.

## P3N Dry-Run Harness

P3N adds local-only dry-run evidence for the staged smoke harness. The dry run validates mode, environment naming, host allowlist shape, fake/sandbox credential policy, production credential rejection, operator approval defaults, workflow evidence requirements, forbidden workflows, and redacted evidence output.

Dry-run success does not mean staged readiness and does not mean production readiness. Live staged smoke remains `requires-staged-smoke`, provider authority remains `requires-external-authority-proof`, mutation execution remains `requires-mutation-audit-proof`, and production actions remain blocked.

## P3O Operator Approval Packet

P3O adds `docs/xflow-staged-smoke-operator-approval-packet.md` as an approval-required packet for future live staged non-production smoke. The packet defines the exact staged environment identity fields, host allowlist, fake/sandbox credential proof, fixture tenant/app/user IDs, workflow list, forbidden workflow list, mutation approval boundaries, cleanup/teardown command requirements, stop conditions, before/after evidence, and explicit `GO` / `NO-GO` checklist.

P3Q-Prep filled the packet with staged-only values and recorded operator approval. The approval packet now verifies as `GO` for a future staged non-production smoke run only. No live staged smoke has been executed.

## P3P Approval Packet Verifier

P3P adds `npm run verify:staged-smoke-approval-packet` and records `staged.operator-approval-packet-verifier` as `local-proof-complete`. The verifier writes `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approval-packet-verification/summary.json`. After P3Q-Prep, it reports the packet as `GO` for future staged non-production smoke only.

Verifier completion is local proof only. The filled packet authorizes a future staged non-production smoke step, but it does not execute live staged smoke, provider calls, deployment actions, mutations, or production readiness.

## P3Q-Prep Filled Packet

P3Q-Prep replaced pending staged-only values in `docs/xflow-staged-smoke-operator-approval-packet.md` and reran `npm run verify:staged-smoke-approval-packet`. The packet authorizes the next P3Q planning/execution step for staged non-production smoke only. Production readiness remains unclaimable, and live staged smoke has not been run.

## P3Q Approved Smoke Execution

P3Q adds `npm run proof:staged-smoke:approved` and `npm run verify:staged-smoke:approved`. The approved smoke evidence is stored under `apps/XFlow/.xflow-local-browser-proof/staged-smoke-approved/xflow-staged-smoke-run-20260704T103455Z/`.

P3Q executed the approved no-network sandbox/fake staged smoke harness: sign-in, route access, API auth/RBAC, read-only provider-status gating, redacted provider-error gating, deployment action gating, and cleanup/teardown. The sandbox audit-log write proof was skipped because the packet did not separately approve audit-write execution.

P3Q recorded 0 external network hosts, 0 provider calls, 0 mutations, no high-risk action execution, and passed cleanup/redaction verification. This remains local/sandbox proof only. External provider authority, mutation audit execution, and production readiness remain blocked.

## P3R Provider Authority Readiness Packet

P3R adds `docs/xflow-provider-authority-readiness-packet.md`, `docs/xflow-provider-authority-readiness-register.json`, and `npm run verify:provider-authority-readiness`.

The packet covers deployment providers (Railway, Vercel, XFlow deployment abstraction), database/auth providers (Supabase, Neon, auth project authority), AI/email providers, and billing/entitlement providers. The verifier records local evidence at `apps/XFlow/.xflow-local-browser-proof/provider-authority-readiness/summary.json`.

P3R is preparation-only. The packet and verifier are `local-proof-complete` because they validate the future-proof requirements and hard-stop flags locally. Future read-only provider proof remains `requires-external-authority-proof`; future provider mutation proof remains `requires-mutation-audit-proof`; production provider proof remains a `production-hard-stop`.

P3R authorizes 0 provider calls, 0 mutations, and 0 production-readiness claims.

## P3S Read-Only Provider Proof Approval Gate

P3S adds `docs/xflow-read-only-provider-proof-runbook.md`, `docs/xflow-read-only-provider-proof-approval-register.json`, and `npm run verify:read-only-provider-proof-approval`.

The runbook and verifier are local proof only. The current approval register is `NO-GO` for all 10 provider rows and authorizes 0 read-only provider calls, 0 mutations, and 0 production-readiness claims. The verifier writes `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof-approval/summary.json`.

Future operator-approved read-only provider proof execution remains `requires-external-authority-proof` until the approval register is filled with exact sandbox values and verifies as `GO`. Provider mutation audit proof remains `requires-mutation-audit-proof`, and production provider authority remains a `production-hard-stop`.

## P3T Single-Provider Approval Fill

P3T fills exactly one approval row: `readonly.xflow-deployment-abstraction`.

The approval verifier now reports `GO` for that one future single-provider read-only proof only. It authorizes 1 future read-only provider call, 0 mutations, and 0 production-readiness claims. All other provider rows remain `NO-GO`.

P3T is still approval-fill only. It does not execute provider proof, contact providers, open external network connections, execute deployment actions, execute billing/entitlement/AI/email/database provider calls, mutate state, or prove production readiness. Future execution remains `requires-external-authority-proof`.

## P3U Single-Provider Read-Only Proof Execution

P3U adds `npm run proof:read-only-provider` and `npm run verify:read-only-provider-proof`.

P3U executed only the approved `readonly.xflow-deployment-abstraction` local inert proof. The approved host was `provider-control-plane-sandbox.example.invalid`, so the runner did not attempt external network access and did not call a real provider. The evidence is stored under `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof/readonly.xflow-deployment-abstraction/`.

P3U recorded 0 external network attempts, 0 provider calls, 0 mutations, no high-risk action execution, passed host-policy/redaction/mutation-gating checks, and did not authorize production readiness. All other provider rows remain `NO-GO`. External provider authority, provider mutation proof, billing/entitlement authority, and production readiness remain blocked.

## P3V Real Provider Read-Only Approval Packet

P3V adds `docs/xflow-real-provider-read-only-approval-packet.md`.

P3V selects `readonly.vercel` as the next real non-production provider candidate because a future proof can be limited to Vercel project/deployment metadata. Current decision remains `NO-GO`: exact real non-production values, approved host, credential-source proof, evidence paths, cleanup scope, and explicit operator approval are not present.

P3V records 0 real provider calls authorized, 0 provider calls executed, 0 mutations authorized, 0 production-readiness authorizations, and no production-readiness claim. The packet is local preparation proof only.

## P3V-Local Real Provider Proof Paused

P3V-Local stops the real provider execution track for now and preserves the local/inert provider proof boundary.

Current safe evidence:

- `readonly.xflow-deployment-abstraction` remains the only approved/executed provider-proof row.
- That proof was local/inert only.
- External network attempts: 0.
- Real provider calls executed: 0.
- Mutations executed: 0.
- High-risk actions executed: false.
- Production-readiness authorized: false.

Current blocked state:

- `readonly.vercel` remains `NO-GO`.
- Railway, Supabase, Neon, auth, AI, email, billing, and entitlement provider rows remain `NO-GO`.
- Real provider read-only authorizations: 0.
- Provider/deployment/billing/entitlement/audit/credential mutations remain blocked.
- Production readiness remains not claimable.

Resume condition: a future phase must provide new verified operator-supplied sandbox values, exact approved hosts, read-only credential references without raw values, redacted evidence paths, cleanup scope, and explicit approval. Example-derived values are rejected and must not reopen the track.

## P4B Mutation Audit Proof

P4B adds `docs/xflow-mutation-audit-proof.md`, `docs/xflow-mutation-audit-proof-register.json`, and `npm run verify:mutation-audit-proof`.

The proof register covers redeploy, restart, sync, provider refresh, provider connect, provider mutation, raw log reveal, raw provider error reveal, billing mutation, entitlement mutation, credential mutation, deployment promotion, deployment rollback, deployment health check, production provider proof, and real provider proof execution.

P4B is local proof only. It records 16 mutation/action rows, 0 real mutations executed, 0 provider calls executed, 0 external network calls executed, 0 mutation approvals, and no production launch claim. It classifies redeploy and restart as `blocked-missing-server-proof` because server-side confirmation and reason/category payload enforcement are not proven. It classifies raw diagnostic reveal paths as `blocked-missing-audit-proof`. Provider, billing, entitlement, and credential mutations remain unavailable.

Future high-risk mutation proof still requires server-side permission, confirmation, reason/category capture, audit persistence, redaction, safe failure, explicit operator approval, and sandbox/no-op execution boundaries before any action can leave the blocked/gated state.

## P4C Redeploy/Restart Server Contract Proof

P4C adds `src/lib/deployments/deployment-action-server-contract.ts`, `npm run verify:deployment-action-server-contract`, and `tests/unit/deployment-action-server-contract.test.ts`.

Redeploy and restart now require `deployments:operate`, same-origin mutation protection, explicit confirmation (`CONFIRM_REDEPLOY` or `CONFIRM_RESTART`), reason text, and a controlled reason category. The routes write a redacted blocked-attempt audit event and return a truthful `disabled_by_policy` no-provider response. Provider execution is not reachable from the redeploy/restart API routes in this proof state.

P4C records 0 provider calls, 0 external network calls, 0 real redeploys, 0 real restarts, and 0 production-readiness authorizations. This reduces the server-contract blocker but does not clear the production mutation hard stop: future sandbox/no-op mutation proof still needs explicit operator approval and must remain separate from provider, staging, or production execution.

## P4D Sandbox/No-Op Mutation Approval Gate

P4D adds `docs/xflow-sandbox-noop-mutation-approval-packet.md`, `docs/xflow-sandbox-noop-mutation-approval-register.json`, `npm run verify:sandbox-noop-mutation-approval`, and focused approval tests.

The approval register contains two candidate rows: `redeploy-noop` and `restart-noop`. Both are `NO-GO`. P4D authorizes 0 sandbox/no-op mutations, 0 real mutations, 0 provider executions, 0 external network calls, and 0 production-readiness claims. The verifier writes `apps/XFlow/.xflow-local-browser-proof/sandbox-noop-mutation-approval/summary.json`.

P4D is preparation only. It does not execute the sandbox/no-op proof, provider proof, staged smoke, production smoke, redeploy, restart, billing mutation, entitlement mutation, credential mutation, raw log reveal, raw provider error reveal, or any production action.
