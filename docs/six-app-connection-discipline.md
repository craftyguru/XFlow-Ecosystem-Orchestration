# Six-App Connection Discipline

Date: 2026-05-20

This is the ecosystem-wide rulebook for connection, registry, token, config, health, event/ingest, RBAC, persistence, and integration UI work across the six-app XFlow ecosystem.

## Six-App Roles

| App | Role |
| --- | --- |
| XFlow | Central control plane, auth authority, workspace dashboard, app registry, and user/workspace connection manager. |
| Verixet | Billing, subscriptions, entitlements, and event ingestion authority. |
| Rataify | Trust, verification, reputation, and audit evidence provider. |
| AudAiX | Audit and audio intelligence provider. |
| WordGeni | Writing and knowledge provider. |
| Crevux | Image and video generation provider. |

## Core Rule

Never confuse ecosystem/platform app registration with user/workspace connection state.

A platform app registry entry proves only that XFlow knows an app exists. It does not prove that the current user or workspace has connected that app.

XFlow remains the source of truth for user/workspace connection state. Provider apps expose contract evidence, but they do not by themselves make a workspace connected.

## Mandatory Nine-Gate Report

For every future connection, registry, token, config, health, event/ingest, RBAC, persistence, or integration UI change, report these gates:

| Gate | Name |
| --- | --- |
| 1 | Registry metadata |
| 2 | User/workspace connection row |
| 3 | Credential/install token |
| 4 | Config route reachable |
| 5 | Auth accepted |
| 6 | Config contract valid |
| 7 | Health contract valid |
| 8 | Event/ingest route valid |
| 9 | Final DB status persisted |

For each gate, report:

- status: pass, fail, pending, skipped, or not applicable
- caller
- receiver
- route/path
- workspaceId, connectionId, appId, and appSlug when applicable
- exact blocker if failed

Use this report shape:

```text
App:
Workspace:
Connection:
Gate 1 - Registry metadata:
Gate 2 - User/workspace connection row:
Gate 3 - Credential/install token:
Gate 4 - Config route reachable:
Gate 5 - Auth accepted:
Gate 6 - Config contract valid:
Gate 7 - Health contract valid:
Gate 8 - Event/ingest route valid:
Gate 9 - Final DB status persisted:
Remaining blocker:
Next exact fix:
```

## Pre-Change Investigation Checklist

Before modifying connection-related code, identify:

- Edited app/project.
- Gate category: registry, workspace connection, credential/token, config, health, event/ingest, DB persistence, RBAC, or UI display.
- Full request path and direction, explicitly naming caller and receiver.
- Route direction: XFlow -> provider, provider -> XFlow, user/browser -> XFlow, provider internal, or XFlow internal/self-state.
- workspaceId, connectionId, appId, and appSlug when applicable.
- Caller token source.
- Provider env var name.
- Expected XFlow response contract.
- DB table and conflict target if persistence is involved.

## Token And Bearer Rules

Provider control-plane routes must support the canonical server-side env var:

```text
CONTROL_PLANE_SERVICE_TOKEN
```

Legacy app-specific env vars may remain temporarily as compatibility aliases, but docs and new code must prefer `CONTROL_PLANE_SERVICE_TOKEN`.

XFlow outbound provider polls must use the encrypted per-connection install token from the workspace connection row.

Do not confuse this with:

- an XFlow deployment-wide env token
- a user JWT
- a browser session cookie
- an OAuth access token
- a Verixet event-ingest bearer unless the specific contract explicitly says they are the same token

XFlow calls provider control-plane routes with:

```http
Authorization: Bearer <opaque install token>
```

Provider apps must validate this as a shared provider install/control-plane token.

## Security Rules

- Never expose service tokens to browser code.
- Never log raw tokens.
- Do not weaken auth to make verification pass.
- Do not bypass RBAC.
- Do not create fake connected states.
- Use constant-time comparison where practical.
- Safe diagnostics may include only:
  - token_present
  - token_length
  - token_sha256_prefix
  - auth_result
  - auth_reason
  - provider_token_configured
  - provider_token_source
  - authorization_header_present
  - authorization_starts_with_bearer

## Connection Status Rules

Never mark an app connected from:

- app registry presence alone
- HTTP 200 alone
- route reachable alone
- config reachable alone
- provider metadata alone
- UI optimistic state alone

Only mark a user/workspace app connection connected when the required gates pass and the final status persists to the specific workspace connection row.

## Database Rules

Any `INSERT ... ON CONFLICT` must have a matching `UNIQUE` constraint or `UNIQUE` index in migrations.

Rules:

- Do not remove `ON CONFLICT` just to hide the error.
- Do not add overly broad unique indexes that block valid multiple workspace connections.
- The conflict target must match the intended uniqueness exactly.
- Every schema fix must be idempotent.
- Every schema fix must include a regression test or migration validation check.
- Production schema must be considered separately from local schema.

## Contract Rules

XFlow provider config responses must use the canonical versioned envelope expected by XFlow.

HTTP 200 is not enough. The parser must validate expected fields and types.

Canonical provider config must include, at minimum:

- ok
- requestId
- contractVersion
- meta.generatedAt
- data.generated_at
- data.app_slug
- data.environment
- data.contract_version
- data.feature_flags
- data.supported_namespaces
- health route advertisement
- event/ingest advertisement when supported

Provider health contracts must also be validated. A health route returning 200 is not enough if the contract shape is wrong.

## Event And Ingest Direction

Always explicitly state event direction.

Examples:

- XFlow pulls provider config from AudAiX.
- XFlow pulls provider health from AudAiX.
- AudAiX pushes events into XFlow.
- Verixet receives event-ingest payloads from XFlow or provider apps.

Do not use ambiguous terms like "outbound" unless the sentence states outbound from which system.

If XFlow calls the provider, the advertised route must exist on the provider app. If the provider pushes to XFlow, the route must exist on XFlow and the provider must know the XFlow base URL/token.

## XFlow Self-State

XFlow's own internal/self connection state must not be treated exactly like an external provider connection.

When validating XFlow as part of the six-app ecosystem, distinguish:

- XFlow platform registry presence
- XFlow workspace/dashboard readiness
- XFlow internal services
- XFlow provider-like self diagnostics if implemented

Do not force external provider token behavior onto XFlow self-state unless that is explicitly part of the contract.

## Required Tests Where Practical

Add or update shared contract tests for:

1. XFlow parser accepts canonical provider config envelopes for Verixet, Rataify, AudAiX, WordGeni, and Crevux.
2. Provider config endpoints return canonical envelopes with `data.generated_at`, `app_slug`, `environment`, `contract_version`, `feature_flags`, `supported_namespaces`, health route, and event/ingest advertisement.
3. Provider bearer auth covers missing token as `auth_missing`, wrong token as `auth_invalid`, and exact `Authorization: Bearer <opaque token>` as success.
4. UI/read model confirms registry presence alone does not show connected, HTTP 200 alone does not show connected, and only persisted workspace connection status can show connected.
5. DB persistence confirms final status writes to the specific workspace connection row and connectionId/workspaceId/appId/appSlug are not replaced with platform-only app metadata.
6. Event/ingest validation confirms advertised route direction is interpreted correctly, the advertised route exists in the correct app, and wrong-direction event routes do not pass validation.

For each app connection fix, run:

- focused provider tests
- XFlow parser/read-model tests
- typecheck for edited apps
- migration validation if DB schema changed

## Definition Of Done

A provider connection is not done until Codex reports the nine-gate status and identifies the exact remaining blocker or confirms that all required gates passed.

A UI badge is not trustworthy until final DB status persistence has been verified for the specific user/workspace connection.

Do not solve one app with one-off hacks. Extract shared helpers and shared contract tests where practical. Each app may have app-specific capabilities, but the connection lifecycle must remain consistent across the ecosystem.
