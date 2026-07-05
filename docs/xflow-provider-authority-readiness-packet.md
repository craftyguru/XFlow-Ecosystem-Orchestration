# XFlow Provider Authority Readiness Packet

Generated for P3R on 2026-07-04.

This packet prepares a future read-only external provider authority proof. It does not authorize provider calls, network calls, deployment actions, billing actions, entitlement actions, AI/email calls, database access, mutations, or production-readiness claims.

Machine-readable register: `docs/xflow-provider-authority-readiness-register.json`.

Verifier: `npm run verify:provider-authority-readiness`.

Evidence output: `apps/XFlow/.xflow-local-browser-proof/provider-authority-readiness/summary.json`.

## Hard Boundary

- P3R is preparation-only.
- `authorizes_provider_calls`: `false`.
- `authorizes_mutations`: `false`.
- `authorizes_production_readiness`: `false`.
- Future provider proof must be a separate explicitly approved read-only phase.
- Production hosts, production credentials, production data, raw provider payloads, private content, and raw diagnostic output are forbidden.

## Required Provider Categories

| Category | Providers covered | P3R result |
| --- | --- | --- |
| Deployment providers | Railway, Vercel, XFlow deployment provider abstraction | Packet and verifier define future read-only evidence only; provider calls remain blocked. |
| Database/auth providers | Supabase, Neon, auth provider/project authority | Packet and verifier define future metadata proof only; database/auth provider access remains blocked. |
| AI/email providers | AI provider authority, email provider authority | Packet and verifier define metadata-only proof requirements; AI/email calls remain blocked. |
| Billing/entitlement providers | Billing/subscription authority, entitlement authority | Packet and verifier require Verixet authority proof first; XFlow authority remains blocked. |

## Provider Readiness Matrix

| Provider | Category | Approved environment | Approved host | Approved read-only endpoint or evidence source | Required sandbox proof | Credential requirement | Redaction requirement | Allowed operation | Forbidden operations | Required evidence | Stop conditions | Cleanup | Operator approval | Production limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Railway | Deployment provider | Future staged non-production sandbox | `railway-sandbox.example.invalid` | Operator-approved sandbox status evidence source | Sandbox project named in future approval | Read-only credential reference only; raw value omitted | Omit credentials, provider IDs, deployment IDs, bodies, logs, stack traces | Read status summary | Redeploy, restart, rollback, scale, env write, deletion, refresh/sync | Approval, host allowlist, read-only credential proof, redacted status, network guard, artifact scan | Host mismatch, raw credential, raw provider content, mutation scope | Evidence cleanup only | Required | No production readiness claim. |
| Vercel | Deployment provider | Future staged non-production sandbox | `vercel-sandbox.example.invalid` | Operator-approved sandbox status evidence source | Sandbox project named in future approval | Read-only credential reference only; raw value omitted | Omit credentials, provider IDs, deployment IDs, bodies, logs, stack traces | Read project/deployment status summary | Redeploy, restart, rollback, promote, env write, deletion, refresh/sync | Approval, host allowlist, read-only credential proof, redacted status, network guard, artifact scan | Host mismatch, raw credential, raw provider content, mutation scope | Evidence cleanup only | Required | No production readiness claim. |
| XFlow deployment abstraction | Deployment provider | Future staged non-production sandbox | `provider-control-plane-sandbox.example.invalid` | Operator-approved adapter metadata source | Adapter and sandbox target named in future approval | Sandbox read-only credential reference and adapter name | Omit credentials, provider IDs, deployment IDs, bodies, logs, stack traces | Read adapter status contract metadata | Redeploy, restart, sync, connect, credential write, env write, provider action | Adapter name, approval, host allowlist, credential proof, redacted adapter status, artifact scan | Adapter lacks read-only mode, host mismatch, raw credential, raw content | Evidence cleanup only | Required | No production readiness claim. |
| Supabase | Database/auth provider | Future staged non-production sandbox | `supabase-sandbox.example.invalid` | Operator-approved project/schema/auth metadata source | Sandbox project and no-production-data proof | Sandbox project reference; raw keys, connection strings, cookies, sessions omitted | Omit keys, connection strings, cookies, sessions, private emails, bodies | Read project/schema/auth metadata summary | Migration apply, schema write, row write, user write, impersonation, storage write | Approval, no-production-data proof, schema/auth summary, redacted connection metadata, artifact scan | Missing project, raw credential, customer-data query, write scope | No DB cleanup in P3R | Required | No production readiness claim. |
| Neon | Database/auth provider | Future staged non-production sandbox | `neon-sandbox.example.invalid` | Operator-approved branch/project metadata source | Sandbox branch/project and no-production-data proof | Sandbox metadata reference; raw DB URLs and credentials omitted | Omit DB URLs, credentials, private data, bodies, logs, stack traces | Read branch/project status metadata | Branch create/delete, schema write, row write, connection string reveal, role write | Approval, no-production-data proof, metadata summary, redacted connection metadata, artifact scan | Missing branch/project, raw credential, customer-data query, write scope | No DB cleanup in P3R | Required | No production readiness claim. |
| Auth provider/project | Database/auth provider | Future staged non-production sandbox | `auth-sandbox.example.invalid` | Operator-approved auth metadata source | Sandbox auth project and fixture identities | Sandbox auth metadata reference; cookies, tokens, sessions, private emails omitted | Omit cookies, tokens, sessions, private emails, bodies | Read fixture identity/project metadata summary | User write, password reset, impersonation, MFA change, role write | Approval, fixture user summary, denied/permitted identity summary, redacted auth metadata, artifact scan | Missing project, non-sandbox identity, raw credential, write scope | No auth cleanup in P3R | Required | No production readiness claim. |
| AI provider | AI/email provider | Future staged non-production sandbox | `ai-sandbox.example.invalid` | Operator-approved metadata-only provider source | Sandbox provider/account and no private prompt/customer-content proof | Sandbox credential reference only; raw key omitted | Omit keys, prompts, completions, raw provider responses, customer content, bodies | Read account/model availability metadata | Completion, embedding, fine-tune, file upload, key creation, provider sync | Approval, metadata-only proof, no private content proof, redacted provider summary, artifact scan | Prompt/customer content would be sent, raw credential, non-metadata operation, raw content | No provider artifact cleanup in P3R | Required | No production readiness claim. |
| Email provider | AI/email provider | Future staged non-production sandbox | `email-sandbox.example.invalid` | Operator-approved account/domain metadata source | Sandbox provider/account and no private recipient/content proof | Sandbox credential reference only; raw key omitted | Omit keys, private emails, message bodies, raw provider responses, bodies | Read account/domain status metadata | Send email, domain write, template write, webhook write, recipient import, provider sync | Approval, metadata-only proof, no private content proof, redacted provider summary, artifact scan | Send would occur, raw credential, recipient/content appears, write scope | No provider state cleanup in P3R | Required | No production readiness claim. |
| Billing/subscription provider | Billing/entitlement provider | Future staged non-production sandbox | `billing-sandbox.example.invalid` | Operator-approved billing fixture metadata source | Verixet authority boundary plus sandbox billing fixture | Sandbox project reference; keys, customer data, payment data, subscription payloads omitted | Omit keys, customer data, payment data, raw provider responses, bodies | Read sandbox account/subscription fixture metadata summary | Charge, refund, subscription write, invoice send, customer write, provider sync | Verixet boundary proof, approval, sandbox fixture summary, no customer/payment data proof, redacted summary, artifact scan | Billing state would change, raw credential, customer/payment data, missing Verixet proof | No billing cleanup in P3R | Required | No production readiness claim. |
| Entitlement authority | Billing/entitlement provider | Future staged non-production sandbox | `entitlement-sandbox.example.invalid` | Operator-approved entitlement fixture metadata source | Verixet authority boundary plus sandbox entitlement fixture | Sandbox entitlement metadata reference; access tokens, customer records, payloads omitted | Omit tokens, customer data, raw entitlement payloads, bodies, private emails | Read sandbox entitlement fixture metadata summary | Grant, revoke, plan update, admission update, customer write, provider sync | Verixet boundary proof, approval, fixture summary, no customer data proof, redacted summary, artifact scan | Access/admission state would change, raw credential, customer data, missing Verixet proof | No entitlement cleanup in P3R | Required | No production readiness claim. |

## Future Read-Only Proof Prerequisites

A future read-only provider proof must supply all of the following before any provider request can be considered:

- Operator approval naming the exact non-production environment, provider, host, fixture scope, and read-only operation.
- Host allowlist containing only the approved sandbox host for the provider under test.
- Credential source proof that references a sandbox credential without printing or storing the value.
- Network guard proof that blocks unapproved hosts.
- Redacted DTO/evidence contract that omits credentials, IDs, payload bodies, private content, logs, errors, and stack traces.
- Artifact scan result proving generated evidence contains no sensitive-shaped values.
- Stop conditions and cleanup/evidence-retention scope.

## Stop Conditions

Stop immediately if any of these are true:

- Any production host, production credential, production data, production customer, or production deployment target appears.
- Any unapproved host is requested.
- Any operation requests write scope or mutation authority.
- Any provider response includes raw credential material, private/customer content, raw payloads, logs, errors, or stack traces.
- Any evidence artifact contains sensitive-shaped values.
- Any UI or packet text claims production readiness.

## P3R Result

P3R creates the packet and verifier only. Provider calls are still not authorized. Mutations remain blocked. Production readiness remains not claimable.

## P3S Read-Only Provider Proof Approval Gate

P3S adds the approval gate for a future read-only provider proof:

- Runbook: `docs/xflow-read-only-provider-proof-runbook.md`.
- Approval register: `docs/xflow-read-only-provider-proof-approval-register.json`.
- Approval verifier: `apps/XFlow/scripts/verify-read-only-provider-proof-approval.ts`.
- Package script: `npm run verify:read-only-provider-proof-approval`.
- Evidence: `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof-approval/summary.json`.

Current P3U proof status: local inert read-only proof complete for exactly one row: `readonly.xflow-deployment-abstraction`.

P3U runs only the approved local abstraction proof against the inert host `provider-control-plane-sandbox.example.invalid`. It records 0 external network attempts, 0 real provider calls, 0 mutations, 0 high-risk actions, and no production-readiness authorization. It does not run Railway, Vercel, Supabase, Neon, auth, AI, email, billing, entitlement, deployment actions, database/auth provider access, provider smoke, mutations, or production actions.

## P3V Real Provider Read-Only Approval Packet

P3V adds `docs/xflow-real-provider-read-only-approval-packet.md`.

Selected real provider row: `readonly.vercel`.

Current decision: `NO-GO`.

The packet prepares a future Vercel non-production read-only proof only. It does not authorize provider calls, network calls, Vercel API access, deployment actions, mutations, raw-log/raw-error reveal, or production-readiness claims. The selected real provider row may move to `GO` only after an operator supplies exact non-production host, credential-source proof without raw value, read-only scope proof, evidence paths, cleanup scope, and explicit approval.

## P3V-Local - Real Provider Proof Paused

P3V-Local intentionally pauses real provider proof at the local/inert boundary.

Current safe evidence:

- `readonly.xflow-deployment-abstraction` is the only approved/executed provider-proof row.
- The proof was local/inert only: 0 external network attempts, 0 real provider calls, 0 mutations, 0 high-risk actions, and no production-readiness authorization.
- `readonly.vercel` remains `NO-GO`.
- Railway, Supabase, Neon, auth, AI, email, billing, and entitlement provider proofs are not approved.

Reason for pause: verified real operator-supplied sandbox provider values are not available, and example-derived values must not be reused.

What remains blocked:

- Real provider/API/network calls.
- Vercel, Railway, Supabase, Neon, auth, AI, email, billing, and entitlement proof execution.
- Provider/deployment/billing/entitlement/audit/credential mutations.
- Raw log/error reveal.
- Production-readiness claims.

Resume requirement: a future phase must supply new verified sandbox values, exact approved hosts, read-only credential references without raw values, redaction evidence, cleanup scope, and explicit operator approval before any real provider proof can be considered.
