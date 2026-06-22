# Direct Access Route Results

Date: 2026-05-10

## Summary

Executed unauthenticated direct URL GET probes against admin, superadmin, platform, internal, billing, debug, proof, support, assistant, entitlement, and workspace-access surfaces across all six proof base URLs.

Initial raw result rows are in `output/live-attack-simulation-2026-05-10.json` under `directAccess`.
Post-deploy raw result rows are in `output/live-attack-simulation-after-deploy-nocache-2026-05-10.json` under `directAccess`.

## Result Totals

| Initial category | Count |
| --- | ---: |
| Direct URL probes | 162 |
| Passed | 140 |
| Failed | 22 |

| Post-deploy category | Count |
| --- | ---: |
| Direct URL probes | 162 |
| Passed | 162 |
| Failed | 0 |

## Failed Rows

These failures returned a public SPA shell with HTTP 200, not admin data. They are still undesirable because reserved sensitive-looking paths should fail closed.

Post-deploy update: no direct-access rows are failing in the no-cache simulation artifact.

| App | Route | Persona | Expected | Actual | Status | Fix |
| --- | --- | --- | --- | --- | ---: | --- |
| AudAiX | reserved page paths | unauthenticated visitor | Denial or safe redirect | Public SPA shell | 200 | Fixed and live-proven after deploy. |
| CreVux | reserved page paths | unauthenticated visitor | Denial or safe redirect | Public SPA shell | 200 | Fixed and live-proven after deploy with no-cache probes. |

## Passed Classes

- XFlow admin/superadmin/platform/internal/direct API surfaces denied unauthenticated access or redirected safely.
- Verixet admin/internal/platform/entitlement direct routes denied unauthenticated access or returned safe not-found/deprecated responses.
- RatAiFy admin/superadmin/control-plane route probes denied or returned safe not-found responses.
- WordGeni local-auth and sensitive route probes denied, redirected, or returned safe deprecation responses.

## Remaining Risk

No unauthenticated direct-access route failures remain in the post-deploy no-cache simulation. Authenticated role/persona fixture coverage is still tracked in `docs/security/remaining-security-risks.md`.
