# Six-App Public Launch Readiness Checklist

Date: 2026-05-05

Scope:

- XFlow
- Verixet
- AudAiX
- RatAiFy
- WordGeni
- CreVux

Guardrails observed:

- No environment files were modified.
- No `/ecosystem` routes, ecosystem video components, ecosystem video assets, or ecosystem video placement behavior were modified.
- No billing logic was modified.
- No auth logic was modified except public marketing render isolation for WordGeni.
- No fake metrics, fake uptime, fake incidents, fake testimonials, fake customers, fake user counts, fake revenue, or fake prices were added.

## Final Recommendation

Status: **Ready with warnings**

The four launch-readiness blockers from the previous checklist were fixed or reclassified as real deployment configuration rather than lander code blockers. The six public landers now pass the focused chrome tests, typechecks, builds, and live browser QA from this workspace.

Production deployment still needs real Verixet production secrets/catalog env configured. Local Verixet public smoke used the existing `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` escape hatch only to verify the public lander without adding fake env values. `scripts/validate-staging-readiness.mjs` already rejects that flag for staging.

## Launch Status By App

| App | Status | Reason |
|---|---|---|
| XFlow | Ready with warnings | Production-style public smoke now returns 200. Build passes with existing non-blocking `jose`/OpenTelemetry warnings. |
| Verixet | Ready with warnings | Clean build and typecheck pass. Production-style public smoke returns 200 when using the existing local-smoke runtime-env validation skip; real production still requires the documented billing/auth/env values. |
| AudAiX | Ready with warnings | Typecheck, focused chrome test, build, and browser smoke pass. |
| RatAiFy | Ready with warnings | Fake uptime percentages were removed from public `/status`; typecheck, focused chrome test, build, and browser smoke pass with existing Vite warnings. |
| WordGeni | Ready with warnings | Public marketing routes no longer require Supabase public env at render time; build, typecheck, focused chrome tests, and browser smoke pass. Auth/dashboard paths remain protected by the existing runtime requirements. |
| CreVux | Ready with warnings | Typecheck, focused chrome test, build, and browser smoke pass with existing large asset/plugin timing warnings. |

## Blockers Fixed

1. XFlow missing production build chunk.
   - Previous symptom: `next start` returned HTTP 500 from missing vendor chunks.
   - Fix: `apps/XFlow/next.config.ts` now applies Sentry wrapping only when Sentry org/project are configured, preventing local production smoke from depending on unavailable Sentry/OpenTelemetry build artifacts.
   - Validation: public `/` returns HTTP 200 on port 3101.

2. Verixet missing instrumentation/build output.
   - Previous symptom: `next start` returned HTTP 500 from missing instrumentation/chunk output.
   - Fixes:
     - Added `apps/Verixet/scripts/next-build.cjs` to clean stale `.next` output before local Windows production builds.
     - Added minimal `apps/Verixet/src/pages/_document.tsx` so Next can resolve the legacy document module during page-data collection.
     - Fixed nullable `usePathname()` / `useSearchParams()` compile errors exposed by the full production build.
   - Validation: clean build passes and public `/` returns HTTP 200 on port 3102 with `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` for local smoke only.

3. WordGeni public lander requiring Supabase public env.
   - Previous symptom: public marketing smoke returned HTTP 500 when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were unavailable.
   - Fix: `ConditionalAuthProvider` wraps only auth/dashboard/protected routes with `AuthProvider`; public marketing routes render without constructing the Supabase browser client.
   - Validation: public `/` returns HTTP 200 on port 3103 without adding fake Supabase env values.

4. RatAiFy fake uptime on public `/status`.
   - Previous symptom: hard-coded uptime percentages such as `99.9%`, `100%`, and `99.95%`.
   - Fix: removed uptime percentages and replaced them with honest status copy: live status telemetry is not connected yet, and no uptime percentage is shown until backed by monitored data.
   - Validation: focused test prevents percentage claims from reappearing; `rg "\b\d+(\.\d+)?%" client/src/pages/status.tsx` returns no matches.

## SEO And Metadata

- Unique public lander title/meta/canonical coverage remains in place from the prior lander passes.
- JSON-LD and FAQ schema coverage remains in the app-specific chrome/config tests where supported.
- No duplicate generic metadata was introduced in this blocker pass.

## Public Route Integrity

Live browser QA passed for:

- XFlow public lander and placeholder routes.
- Verixet public lander and placeholder routes.
- AudAiX public lander and placeholder routes.
- RatAiFy public lander and placeholder routes, including public `/status`.
- WordGeni public lander and placeholder routes.
- CreVux public lander and placeholder routes.

No placeholder route failures were reported by `output/lander-qa/visual-qa.mjs`.

## CTA And Onboarding

- Primary CTA routing from the CTA audit remains unchanged.
- Pricing CTAs still avoid invented prices or unsupported plan behavior.
- Ecosystem cross-links remain contextual and did not change in this blocker pass.

## Trust And Claims

- Public copy remains aligned with `docs/marketing-claims-ledger.md`.
- RatAiFy `/status` no longer publishes fake uptime percentages.
- Preview panels remain labeled as interface preview, sample state, workflow preview, or demo data where applicable.
- Verixet production env validation remains real and fail-closed for deployment; the local smoke did not add fake secrets.

## Browser QA Summary

Command:

```powershell
node output\lander-qa\visual-qa.mjs
```

Result:

- Results: 24 viewport/reduced-motion checks.
- Failures: 0.
- Placeholder route failures: 0.

Viewport coverage:

- Desktop: 1440px.
- Tablet: 768px.
- Mobile: 390px.
- Mobile reduced motion: 390px.

The browser QA confirmed public landers load, nav/footer/breadcrumbs/current-app markers render, ecosystem video references remain present, reduced motion does not break layout, and no horizontal overflow was detected by the QA script.

## Build And Test Validation

| App | Focused chrome test | Typecheck | Build | Live browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed | Passed with existing warnings | Passed |
| Verixet | Passed | Passed | Passed | Passed with existing local-smoke env validation skip |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed | Passed with existing Vite warnings | Passed |
| WordGeni | Passed | Passed | Passed with existing pricing `<img>` warning | Passed |
| CreVux | Passed | Passed | Passed with existing large asset/plugin timing warnings | Passed |

Commands run during this blocker pass:

- `npx vitest run tests/showcase-chrome.test.ts`
- `npm test -- src/components/marketing/marketing-chrome.test.ts`
- `npm test -- src/components/lander/StoryLanderShell.test.ts`
- `npx vitest run server/lib/rataify-chrome.test.ts`
- `npx vitest run src/components/layout/public-navbar-static.test.ts src/components/contact/public-site-footer.test.ts`
- `npx vitest run src/components/landing/MarketingSiteChrome.test.ts`
- `npm run typecheck` / `npx tsc --noEmit` across all six apps
- `npm run build` / `npm run build:skip-standalone` across all six apps
- Production-style local smoke on ports 3101, 3102, 3103
- `node output\lander-qa\visual-qa.mjs`

## Non-Blocking Warnings

- XFlow: existing `jose` Edge Runtime warnings and Sentry/OpenTelemetry warnings from app observability imports.
- XFlow: `next start` warns about standalone output when served through the local smoke harness; public `/` still returned 200.
- Verixet: real production env/catalog values are still required for actual deployment; local smoke used `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
- RatAiFy: existing Vite `NODE_ENV=production` env warning and chunk-size warnings.
- WordGeni: existing pricing page `<img>` warning.
- CreVux: existing large asset/plugin timing warnings.

## Final Readiness Call

Recommendation: **Ready with warnings**

There are no remaining lander-code launch blockers from this pass. Before a real public deployment, confirm Verixet production secrets/catalog env are present and do not deploy with `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
