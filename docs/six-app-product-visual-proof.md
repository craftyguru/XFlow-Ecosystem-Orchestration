# Six-App Product Visual Proof Pass

Date: 2026-05-04

Scope:

- XFlow
- Verixet
- AudAiX
- RatAiFy
- WordGeni
- CreVux

Guardrails observed:

- No auth logic, billing logic, environment files, `/ecosystem` routes, ecosystem video components, ecosystem video assets, or ecosystem video placement behavior were modified.
- No fake customer logos, fake testimonials, fake revenue, fake user counts, fake uptime, or unsupported dashboard metrics were added.
- New public visuals are labeled as demo data, interface preview, sample state, workflow preview, or example state where they do not use real workspace UI data.

## Visual Audit Summary

XFlow already had the strongest product proof: a dashboard preview explicitly labeled as demo data plus dashboard detail panels for connected apps, health, incidents, deployments, actions, and workspace history.

The other story landers still had sections that explained the app well but looked abstract because most proof appeared as concept cards. This pass added compact product-preview panels that show what users can expect to see without pretending to show live customer data.

## Visuals Added Or Improved

| App | Visual type | Public visual proof added or improved | Fake-data safeguard |
|---|---|---|---|
| XFlow | Interface preview / demo-data dashboard panel | Added a stronger accessible label to the existing control-plane dashboard preview covering connected apps, health, incidents, deployments, actions, and event feed. | Existing panel says `Demo workspace preview`, `Demo data`, and `Static preview based on demo data`. |
| Verixet | Interface preview | Added billing governance preview cards for workspace plan, entitlement snapshot, security controls, and replay protection. Added a sample-state note to the existing dashboard preview. | New panel says `Interface preview` and `Sample state`; dashboard note says real workspace data appears only after sign-in. |
| AudAiX | Interface preview | Added a launch-readiness report preview for audit report, route discovery, visual proof, security command center, and sample issue rows. | Config and UI say this is an interface preview using sample state, not a fake live dashboard. |
| RatAiFy | Interface preview | Added trust review preview cards for trust scan, RiskRadar, policy review, and CopyGuard/message analysis with sample risk rows. | Panel says `Sample state` and explicitly states it does not show live customer data or guarantee legal outcomes. |
| WordGeni | Interface preview | Added source-grounded writing preview cards for writing workspace, source chips, project memory, and CreVux handoff with sample source/review rows. | Panel says `Sample state` and explicitly states it does not show private user documents or claim automatic truth. |
| CreVux | Interface preview | Added creative studio preview cards for prompt/reference panel, render queue, asset gallery, and credit-aware job state with sample workflow rows. | Panel says `Sample state` and explicitly states it does not show private uploads, real user assets, or fake generation results. |

## Accessibility Notes

- XFlow uses `role="img"` and an `aria-label` describing the demo dashboard preview.
- Verixet product proof uses `role="img"` and an `aria-label` describing the billing governance interface preview.
- AudAiX product proof uses `role="img"` and config-provided alt text for the audit report preview.
- RatAiFy, WordGeni, and CreVux product proof panels use `role="img"` and app-specific `aria-label` text.
- Preview panels are grid-based and collapse at tablet/mobile widths to avoid horizontal overflow.
- Reduced-motion behavior remains handled by the existing lander motion gates and the browser smoke reduced-motion check.

## Files Changed

- `apps/XFlow/src/components/showcase/CommercialHomepage.tsx`
- `apps/XFlow/tests/showcase-chrome.test.ts`
- `apps/Verixet/src/components/marketing/home/HomeProfessionalStory.tsx`
- `apps/Verixet/src/components/marketing/home/HomeDashboardShowcase.tsx`
- `apps/Verixet/src/app/(marketing)/marketing.css`
- `apps/Verixet/src/components/marketing/marketing-chrome.test.ts`
- `apps/AudAix/dashboard/src/components/lander/StoryLanderShell.tsx`
- `apps/AudAix/dashboard/src/content/lander/audaix.ts`
- `apps/AudAix/dashboard/src/styles.css`
- `apps/AudAix/dashboard/src/components/lander/StoryLanderShell.test.ts`
- `apps/RatAiFy/client/src/components/marketing/trust/TrustProfessionalStory.tsx`
- `apps/RatAiFy/server/lib/rataify-chrome.test.ts`
- `apps/WordGeni/apps/web/src/components/marketing/WordGeniProfessionalStory.tsx`
- `apps/WordGeni/apps/web/src/components/layout/public-navbar-static.test.ts`
- `apps/CreVux/artifacts/image-gen/src/components/landing/CrevuxProfessionalStory.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/landing/MarketingSiteChrome.test.ts`

## Validation Results

| App | Focused chrome test | Typecheck | Build | Browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed |
| Verixet | Passed | Passed | Passed after rerun; one earlier parallel typegen/build run produced a transient `.next` missing chunk. | Passed |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed | Passed with existing `NODE_ENV`/chunk-size warnings. | Passed |
| WordGeni | Passed | Passed | Passed with existing pricing `<img>` warning. | Passed |
| CreVux | Passed | Passed | Passed with existing plugin timing/large asset warnings. | Passed |

Browser proof:

- `node output/lander-qa/visual-qa.mjs`
- Final result: `24` checks, `0` failures, `0` placeholder failures.
- The first browser run found Verixet mobile/tablet overflow in existing code-example cards. The fix constrained marketing cards and code blocks on small screens.
- The final browser run confirmed no horizontal overflow, no placeholder failures, and existing ecosystem video references still render.

Known warnings:

- XFlow build still reports existing `jose` Edge Runtime warnings.
- RatAiFy build still reports existing `NODE_ENV=production` env and chunk-size warnings.
- WordGeni build still reports the existing pricing `<img>` warning.
- CreVux build still reports existing plugin timing and large asset output warnings.
- Verixet local dev server may still report strict-CSP development-runtime console warnings, but production build passed and no inline style-heavy marketing widgets were added.
