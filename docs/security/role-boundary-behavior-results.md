# Role Boundary Behavior Results

Date: 2026-05-10

## Summary

The authenticated-persona harness ran live unauthenticated role-boundary probes and is ready for authenticated persona sessions. The fixture setup helper now verifies fixture availability and writes an ignored local template without exposing auth material.

Artifact:

- `output/authenticated-persona-security-simulation-2026-05-10.json`
- `output/authenticated-persona-fixture-setup-summary-2026-05-10.json`

## Results

| Coverage | Result |
| --- | --- |
| Unauthenticated visitor direct route/API behavior | Passed available probes. |
| Normal authenticated user | Blocked: no staging-safe session fixture supplied. |
| Workspace admin | Blocked: no staging-safe session fixture supplied. |
| App admin | Blocked: no staging-safe session fixture supplied. |
| Support admin | Blocked: no staging-safe session fixture supplied. |
| Security admin | Blocked: no staging-safe session fixture supplied. |
| Superadmin/platform owner | Blocked: no staging-safe session fixture supplied. |
| Expired/past_due user | Blocked: no staging-safe session fixture supplied. |
| Canceled user | Blocked: no staging-safe session fixture supplied. |
| Cross-workspace user | Blocked: no staging-safe session fixture supplied. |

## Findings

No failing route-boundary behavior was observed in the executed probes. Authenticated role boundaries remain unproved live until fixture sessions are supplied.

The setup helper now has seed/mint support, but detected production-like proof URLs and no `AUTH_PERSONA_*` bearer/cookie inputs, so it refused to seed or mutate fixture data.

## Verification Commands Run

- `node scripts/authenticated-persona-security-simulation.mjs` - 78 passed, 0 failed, 9 persona classes blocked.
- `node scripts/setup-staging-security-personas.mjs --write-template` - passed; no production mutation performed.
- `node scripts/setup-staging-security-personas.mjs --allow-staging-fixtures --seed-personas --mint-sessions` - safely refused production-like targets.
- `node scripts/live-attack-simulation.mjs` - 270 passed, 0 failed.
- `npm run proof:production` - passed 10/10.

## Remaining Recommended Work

Create staging-safe role sessions and rerun the harness. Treat blocked personas as release evidence gaps, not passes.
