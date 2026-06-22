# Debug Proof Route Results

Date: 2026-05-10

## Summary

Probed debug, proof, diagnostics, internal status, and env-check style routes across all proof base URLs.

## Failed Rows

| App | Route | Actual | Risk | Fix |
| --- | --- | --- | --- | --- |
| AudAiX | `/debug`, `/diagnostics`, `/proof` | Public SPA shell, HTTP 200 in initial run | Reserved debug/proof-looking paths should not render app shell. | Fixed and live-proven after deploy. |
| CreVux | `/debug`, `/diagnostics`, `/proof` | Public SPA shell, HTTP 200 in initial run | Reserved debug/proof-looking paths should not render app shell. | Fixed and live-proven after deploy with no-cache probes. |

Post-deploy result: `output/live-attack-simulation-after-deploy-nocache-2026-05-10.json` reports 0 failing debug/proof rows.

## Passed Classes

- API diagnostic/debug/proof-style routes did not expose env values, DB connection strings, tokens, SQL errors, or stack traces in response previews.
- Root production proof passed secret bundle scanning with no FAIL results.
- One bundle-scan RISK from the production-readiness proof was not a secret leak; the saved artifact was scrubbed of transient signed state before documentation.

## Remaining Risk

No unauthenticated debug/proof route failures remain in the post-deploy no-cache simulation.
