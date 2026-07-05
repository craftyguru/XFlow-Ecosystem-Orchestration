# XFlow Read-Only Provider Proof Runbook

Generated for P3S on 2026-07-04 and updated through P3V-Local.

This runbook defines the approval gate for a future read-only provider proof. P3S does not execute the proof. P3S does not call providers, open external network connections, execute deployment APIs, execute billing or entitlement APIs, call AI/email providers, access database/auth providers, mutate state, or claim production readiness.

Approval register: `docs/xflow-read-only-provider-proof-approval-register.json`.

Approval verifier: `npm run verify:read-only-provider-proof-approval`.

Evidence output: `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof-approval/summary.json`.

Current approval result: `GO` for exactly one row: `readonly.xflow-deployment-abstraction`.

Current real external provider approval packet: `NO-GO` for `readonly.vercel`.

Current real provider proof track: intentionally paused at the local/inert proof boundary.

## Purpose

Prepare a human-reviewable and machine-verifiable gate for a future read-only provider authority proof. The future proof may only run after an operator supplies exact sandbox values and the verifier reports `GO`.

## Scope

In scope for a future approved phase:

- Read-only metadata/status checks against named sandbox provider targets.
- Host allowlist and network guard proof.
- Redacted evidence summaries.
- Evidence cleanup/teardown for local artifacts only.

Out of scope and forbidden:

- Redeploy, restart, rollback, sync, provider connect, provider refresh, billing mutation, entitlement mutation, deployment mutation, credential mutation, data writes, raw diagnostic reveal, production smoke, production provider calls, and staging services not explicitly approved.

## Required Operator Approval

Before execution, the operator must provide:

- Exact non-production environment name.
- Exact provider row(s) authorized.
- Exact approved host(s).
- Credential source reference, with raw value omitted.
- Allowed read-only operation.
- Fixture tenant/app/user/provider scope where applicable.
- Evidence output path.
- Stop conditions.
- Cleanup/teardown scope.
- Explicit `GO` decision.

Without these, a provider row remains `NO-GO`. P3T fills only `readonly.xflow-deployment-abstraction`; every other row remains `NO-GO`.

## Approved Provider List

- Railway read-only authority proof.
- Vercel read-only authority proof.
- Supabase read-only authority proof.
- Neon read-only authority proof.
- Auth project read-only authority proof.
- AI provider read-only authority proof.
- Email provider read-only authority proof.
- Billing/subscription provider read-only authority proof.
- Entitlement provider read-only authority proof.
- XFlow deployment provider abstraction read-only proof.

## Environment And Hosts

Current approved environment for the selected row: `xflow-provider-proof-sandbox`.

Current approved host for the selected row: `provider-control-plane-sandbox.example.invalid`.

The approved host is inert and sandbox-shaped. P3U executed the single-provider local abstraction proof for this row only. Because the host is inert, the proof did not attempt external network access or call a real provider.

Blocked host list:

- Production provider hosts.
- Production app hosts.
- Production database/auth hosts.
- Production billing, entitlement, AI, or email hosts.
- Unknown hosts.
- Any host not listed for the exact approved provider row.

## Credential Requirements

- Credential source must be a reference only.
- Raw credential values must never be printed, stored in docs, stored in evidence, or echoed in errors.
- Credential source must be sandbox/non-production scoped.
- Production credential markers block approval.

## Redaction Requirements

Future evidence must omit:

- Secrets, tokens, cookies, API keys, passwords, connection strings, and bearer material.
- Provider identifiers, deployment identifiers, trace identifiers, and private emails.
- Raw provider responses, raw provider errors, raw provider logs, request bodies, response bodies, stack traces, prompts, completions, customer content, payment data, and entitlement payloads.

## Provider Sections

| Provider proof | Allowed read-only check | Forbidden mutation checks | Required evidence | Current decision |
| --- | --- | --- | --- | --- |
| Railway | Read sandbox deployment/project status summary only | Redeploy, restart, rollback, scale, env write, delete, refresh/sync | Approval, host allowlist, credential-source proof, network guard, redacted status, artifact scan | `NO-GO` |
| Vercel | Read sandbox project/deployment status summary only | Redeploy, restart, rollback, promote, env write, delete, refresh/sync | Approval, host allowlist, credential-source proof, network guard, redacted status, artifact scan | `NO-GO` |
| XFlow deployment provider abstraction | Read sandbox adapter status contract metadata only | Redeploy, restart, sync, connect, credential write, env write, provider action | Approval, adapter name, host allowlist, credential-source proof, redacted adapter status, artifact scan | `GO`; P3U local inert proof complete |
| Supabase | Read sandbox project/schema/auth metadata summary only | Migration apply, schema write, row write, user write, impersonation, storage write | Approval, no-production-data proof, schema/auth summary, credential-source proof, artifact scan | `NO-GO` |
| Neon | Read sandbox branch/project status metadata only | Branch create/delete, schema write, row write, connection string reveal, role write | Approval, no-production-data proof, branch/project summary, credential-source proof, artifact scan | `NO-GO` |
| Auth project | Read fixture identity/project metadata summary only | User write, password reset, impersonation, MFA change, role write | Approval, fixture user summary, identity-class summary, credential-source proof, artifact scan | `NO-GO` |
| AI provider | Read account/model availability metadata only | Completion, embedding, fine-tune, file upload, key creation, provider sync | Approval, metadata-only proof, no private prompt/customer content proof, credential-source proof, artifact scan | `NO-GO` |
| Email provider | Read account/domain status metadata only | Send email, domain write, template write, webhook write, recipient import, provider sync | Approval, metadata-only proof, no private recipient/content proof, credential-source proof, artifact scan | `NO-GO` |
| Billing/subscription provider | Read sandbox account/subscription fixture metadata summary only | Charge, refund, subscription write, invoice send, customer write, provider sync | Verixet boundary proof, approval, sandbox fixture summary, no customer/payment data proof, artifact scan | `NO-GO` |
| Entitlement authority | Read sandbox entitlement fixture metadata summary only | Grant, revoke, plan update, admission update, customer write, provider sync | Verixet boundary proof, approval, sandbox fixture summary, no customer data proof, artifact scan | `NO-GO` |

## Stop Conditions

Stop before execution if:

- Approval status is `NO-GO`.
- Explicit operator approval is missing.
- Any required provider row is missing.
- Approved environment, host allowlist, blocked host list, credential source, credential policy, redaction requirement, allowed operation, forbidden mutation list, required evidence, stop condition, or cleanup requirement is missing.
- Production host or production credential marker appears.
- Any row authorizes mutation or production readiness.
- Any row authorizes read-only provider calls while approval status is `NO-GO`.
- Raw sensitive-shaped values appear.

Stop during any future approved phase if:

- An unapproved host is requested.
- A write/mutation scope is requested.
- Provider output includes raw sensitive content.
- Evidence scan fails.
- Cleanup/evidence retention scope fails.

## Cleanup And Teardown

P3S cleanup is evidence-only. No provider cleanup is authorized. Future execution may only clean generated local evidence unless a separate operator-approved fixture cleanup is defined.

## GO / NO-GO Checklist

| Check | Required for GO | Current result |
| --- | --- | --- |
| All provider rows present | Yes | Present |
| Exact sandbox environment supplied | Yes | Present for `readonly.xflow-deployment-abstraction` only |
| Exact sandbox hosts supplied | Yes | Present for `readonly.xflow-deployment-abstraction` only |
| Blocked host rules present | Yes | Present |
| Credential source supplied without raw value | Yes | Present for `readonly.xflow-deployment-abstraction` only |
| Redaction requirements present | Yes | Present |
| Allowed read-only operation present | Yes | Present |
| Forbidden mutations present | Yes | Present |
| Evidence requirements present | Yes | Present |
| Stop conditions present | Yes | Present |
| Cleanup requirements present | Yes | Present |
| Explicit operator approval present | Yes | Present for `readonly.xflow-deployment-abstraction` only |
| Mutations authorized | Never | False |
| Production readiness authorized | Never | False |

Final P3T decision: exactly one provider row is `GO`; all other rows remain `NO-GO`.

Selected row: `readonly.xflow-deployment-abstraction`.

Authorized read-only provider calls count: 1.

Authorized mutation count: 0.

Authorized production-readiness count: 0.

P3U executed only the approved local inert proof for `readonly.xflow-deployment-abstraction`.

P3U proof evidence:

- Runner: `npm run proof:read-only-provider`.
- Verifier: `npm run verify:read-only-provider-proof`.
- Evidence: `apps/XFlow/.xflow-local-browser-proof/read-only-provider-proof/readonly.xflow-deployment-abstraction/summary.json`.
- External network attempts: 0.
- Real provider calls executed: 0.
- Mutations executed: 0.
- High-risk actions executed: false.
- Production-readiness authorization: false.

All other provider rows remain `NO-GO`.

## P3V Real Provider Packet

P3V adds `docs/xflow-real-provider-read-only-approval-packet.md` for the next candidate real non-production provider proof.

Selected real provider row: `readonly.vercel`.

Current P3V decision: `NO-GO`.

P3V does not execute provider proof, call Vercel, call any other provider, open external network connections, execute deployment APIs, mutate state, reveal raw diagnostics, or claim production readiness. The Vercel row remains `NO-GO` until an operator supplies exact real non-production values, an approved host, a read-only credential reference without raw value, evidence paths, cleanup scope, and explicit approval.

## P3V-Local - Real Provider Proof Paused

P3V-Local stops the real-provider execution track for now and preserves the safe local/inert proof boundary.

Reason for pause: no verified real operator-supplied sandbox values are available for Vercel or any other external provider, and example-derived values are explicitly rejected as approval material.

Current safe evidence:

- `readonly.xflow-deployment-abstraction` remains the only approved/executed provider-proof row.
- The completed proof is local/inert only.
- External network attempts: 0.
- Real provider calls executed: 0.
- Mutations executed: 0.
- High-risk actions executed: false.
- Production-readiness authorized: false.

Blocked while paused:

- `readonly.vercel` remains `NO-GO`.
- Railway, Supabase, Neon, auth project, AI provider, email provider, billing/subscription, and entitlement provider rows remain `NO-GO`.
- Real provider read-only authorizations: 0.
- Mutations remain unauthorized.
- Production readiness remains not claimable.

Resume requirement: a future phase must supply new verified operator sandbox values, exact approved hosts, read-only credential references without raw values, evidence paths, cleanup scope, and explicit approval. Until then, stop before any real provider proof execution.

## Production-Readiness Limitation

This runbook can never authorize production readiness. The P3U read-only proof only proves the local inert XFlow deployment abstraction row named in the approval. Production readiness remains blocked by the production hard-stop register.
