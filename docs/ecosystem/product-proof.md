# Ecosystem Product Proof

The core ecosystem product proof inventory tracks real local screenshots for the six approved apps only: XFlow, Verixet, Rataify, AudAiX, Crevux, and WordGeni. Other workspace projects are outside the core ecosystem narrative.

## Screenshot Inventory

| Product | Desktop dashboard screenshot | Mobile dashboard screenshot | Verification status | Capture notes |
| --- | --- | --- | --- | --- |
| XFlow | [desktop](../../apps/XFlow/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/XFlow/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a local-only `local-screenshot/dashboard` route guarded out of production. The route uses local sample view-model data and does not call production services. |
| Verixet | [desktop](../../apps/Verixet/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/Verixet/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a local-only `local-screenshot/dashboard` route guarded out of production. The view model is built from local sample inputs with no production API calls. |
| Rataify | [desktop](../../apps/RatAiFy/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/RatAiFy/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a non-production `__screenshot/dashboard` route using the trust dashboard view model with no selected site and no scan/billing API calls. |
| AudAiX | [desktop](../../apps/AudAix/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/AudAix/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a non-production `__screenshot/dashboard` route with empty local portfolio data and no evidence/API mutations. |
| Crevux | [desktop](../../apps/CreVux/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/CreVux/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a non-production `__screenshot/dashboard` route with empty local project/asset/job arrays and no credentialed API calls. |
| WordGeni | [desktop](../../apps/WordGeni/docs/assets/screenshots/dashboard-desktop.png) | [mobile](../../apps/WordGeni/docs/assets/screenshots/dashboard-mobile.png) | verified current local capture on 2026-06-24 | Captured from a local-only `local-screenshot/dashboard` route guarded out of production. The route disables project API loading and uses the honest empty project state. |

## What Each App Demonstrates

| Product | Product proof target |
| --- | --- |
| XFlow | Ecosystem control-plane shell, app connection overview, workflow orchestration, and operator next actions. |
| Verixet | Execution validation and release-gate command center for request evidence, policy decisions, and operator workflows. |
| Rataify | Trust, risk, and scam-signal dashboard for a selected website or workspace. |
| AudAiX | Audit and evidence intelligence dashboard for site readiness, findings, reports, and evidence review. |
| Crevux | Creative production dashboard for assets, projects, creation actions, and production workflow state. |
| WordGeni | Source-grounded writing dashboard with purpose, readiness, primary actions, empty state, and local backend readiness warnings. |

## Current Proof Status

- Verified current screenshots exist for all six core apps on desktop and mobile.
- No screenshot in this inventory uses fake activity, fake metrics, fake production state, or public deployment claims.
- No screenshot capture was accepted when the browser landed on an auth page, raw JSON error, or non-dashboard error screen.

## Local Harness Guardrails

- XFlow, Verixet, and WordGeni use `local-screenshot/dashboard` routes that return `notFound()` in production.
- Rataify, AudAiX, and Crevux use Vite routes that redirect away when `import.meta.env.PROD` is true.
- Local proof routes use empty arrays, local sample view models, or disabled fetches rather than production data.
- The pass did not seed or mutate app databases just to create screenshot state.
- Runtime production auth was not weakened; these routes are local screenshot surfaces only.

## Next Verification Steps

- Add a repeatable local screenshot runbook for the six proof routes and ports.
- Re-run captures immediately after dashboard UI changes.
- Re-run README image-link validation after each new screenshot is added.
