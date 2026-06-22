# Cross-Workspace Behavior Results

Date: 2026-05-10

## Summary

Cross-workspace behavior is covered by existing local/test-suite fixtures and static proof, but not yet by live authenticated persona sessions.

`scripts/setup-staging-security-personas.mjs` now documents and can seed the required Workspace A and Workspace B fixture relationship. It writes `workspaceId` and `foreignWorkspaceId` into the ignored fixture file after successful local/staging seeding.

## Existing Coverage

| App/source | Coverage |
| --- | --- |
| RatAiFy `tests/lib/multitenantIntegrationFixture.ts` | Two users, two orgs, two sites; user A must not access site B. |
| XFlow integration/RBAC tests | Workspace membership and auth policy bounding. |
| Verixet route tests | Workspace billing/entitlement routes validate workspace scope. |
| AudAiX tests | Workspace sites, members, billing, and role-security coverage. |
| WordGeni tests | Workspace and Supabase/RLS migration proof. |
| CreVux smoke/auth tests | Cross-user asset read/download denial pattern exists for local/staging smoke. |

## Current Live Harness Result

| Persona | Result |
| --- | --- |
| Cross-workspace user | Blocked: no staging-safe session fixture supplied. |

## Findings

No live cross-workspace data exposure was found in unauthenticated probes. Authenticated direct-object-ID bypass testing remains unproved live.

## Remaining Recommended Work

Point proof URLs at local/staging, run the seed/mint helper, then run authenticated GET/POST probes using object IDs from the opposite workspace.

The harness accepts `AUTH_PERSONA_CROSS_WORKSPACE_WORKSPACE_ID` and `AUTH_PERSONA_CROSS_WORKSPACE_FOREIGN_WORKSPACE_ID`, or the same values in `AUTH_PERSONA_FIXTURES_FILE`.
