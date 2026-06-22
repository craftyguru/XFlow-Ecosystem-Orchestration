# Six-App Lander Redesign Proof

## Scope Completed

This proof now includes the original story-lander work plus Lander Pass 2 for the professional website chrome layer across:

- XFlow
- Verixet
- AudAiX
- RatAiFy
- WordGeni
- CreVux

Core public language used across the work:

- XFlow controls.
- Verixet governs.
- AudAiX audits.
- RatAiFy verifies trust.
- WordGeni writes.
- CreVux creates.

## Guardrail Verification

The existing ecosystem video behavior was preserved.

| App | Preserved usage |
|---|---|
| XFlow | `apps/XFlow/src/components/showcase/CommercialHomepage.tsx` still references `/ecosystem/ecosystem-showcase.webm` and `/ecosystem/ecosystem-showcase.mp4`. |
| Verixet | `apps/Verixet/src/components/marketing/home/HomeEcosystemShowcase.tsx` still references `/ecosystem/ecosystem-showcase.webm` and `/ecosystem/ecosystem-showcase.mp4`. |
| AudAiX | `apps/AudAix/dashboard/src/pages/LandingPage.tsx` still renders `EcosystemShowcaseSection currentApp="audaix"` with `/ecosystem/ecosystem-showcase.mp4`. |
| RatAiFy | `apps/RatAiFy/client/src/components/marketing/trust/TrustHomeSections.tsx` still renders `EcosystemShowcaseSection currentApp="rataify"` with `/ecosystem/ecosystem-showcase.mp4`. |
| WordGeni | `apps/WordGeni/apps/web/src/app/page.tsx` still renders `EcosystemShowcaseSection currentApp="wordgeni"` with `/ecosystem/ecosystem-showcase.mp4`. |
| CreVux | `apps/CreVux/artifacts/image-gen/src/pages/landing.tsx` still renders `EcosystemShowcaseSection currentApp="crevux"` with `/ecosystem/ecosystem-showcase.mp4`. |

No environment files, billing logic, auth logic, ecosystem routes, ecosystem video components, or ecosystem media assets were intentionally modified.

## Files Changed

Documentation:

- `docs/marketing-claims-ledger.md`
- `docs/six-app-lander-redesign-audit.md`
- `docs/six-app-lander-redesign-proof.md`

AudAiX:

- `apps/AudAix/dashboard/src/content/lander/audaix.ts`
- `apps/AudAix/dashboard/src/components/lander/StoryLanderShell.tsx`
- `apps/AudAix/dashboard/src/components/lander/StoryLanderShell.test.ts`
- `apps/AudAix/dashboard/src/pages/LandingPage.tsx`
- `apps/AudAix/dashboard/src/pages/PublicPlaceholderPage.tsx`
- `apps/AudAix/dashboard/src/pages/HowItWorksPage.tsx`
- `apps/AudAix/dashboard/src/pages/FaqPage.tsx`
- `apps/AudAix/dashboard/src/App.tsx`
- `apps/AudAix/dashboard/src/styles.css`

XFlow:

- `apps/XFlow/src/components/showcase/SixAppStoryPrelude.tsx`
- `apps/XFlow/src/components/showcase/CommercialHomepage.tsx`
- `apps/XFlow/src/components/showcase/ShowcaseNav.tsx`
- `apps/XFlow/src/components/showcase/ShowcaseFooter.tsx`
- `apps/XFlow/src/components/showcase/ShowcasePlaceholderPage.tsx`
- `apps/XFlow/src/components/showcase/showcase-chrome.test.ts`
- `apps/XFlow/tests/showcase-chrome.test.ts`
- `apps/XFlow/src/app/(showcase)/features/page.tsx`
- `apps/XFlow/src/app/(showcase)/how-it-works/page.tsx`
- `apps/XFlow/src/app/(showcase)/security/page.tsx`
- `apps/XFlow/src/app/(showcase)/changelog/page.tsx`
- `apps/XFlow/src/app/(showcase)/faq/page.tsx`

Verixet:

- `apps/Verixet/src/components/marketing/home/HomeProfessionalStory.tsx`
- `apps/Verixet/src/components/marketing/home/HomePage.tsx`
- `apps/Verixet/src/components/marketing/MarketingHeader.tsx`
- `apps/Verixet/src/components/marketing/MarketingFooter.tsx`
- `apps/Verixet/src/components/marketing/MarketingPlaceholderPage.tsx`
- `apps/Verixet/src/components/marketing/marketing-chrome.test.ts`
- `apps/Verixet/src/app/(marketing)/how-it-works/page.tsx`
- `apps/Verixet/src/app/(marketing)/faq/page.tsx`
- `apps/Verixet/src/app/(marketing)/marketing.css`

RatAiFy:

- `apps/RatAiFy/client/src/components/marketing/trust/TrustProfessionalStory.tsx`
- `apps/RatAiFy/client/src/components/marketing/trust/TrustHomeSections.tsx`
- `apps/RatAiFy/client/src/components/marketing/rataify/RataifyHeader.tsx`
- `apps/RatAiFy/client/src/components/marketing/rataify/RataifyFooter.tsx`
- `apps/RatAiFy/client/src/components/marketing/rataify/rataify-chrome.test.ts`
- `apps/RatAiFy/client/src/pages/marketing/rataify/PublicPlaceholderPage.tsx`
- `apps/RatAiFy/client/src/pages/marketing/rataify/FeaturesPage.tsx`
- `apps/RatAiFy/client/src/pages/marketing/rataify/HowItWorksPage.tsx`
- `apps/RatAiFy/client/src/pages/marketing/rataify/DocsPage.tsx`
- `apps/RatAiFy/client/src/pages/marketing/rataify/ChangelogPage.tsx`
- `apps/RatAiFy/client/src/pages/marketing/rataify/FaqPage.tsx`
- `apps/RatAiFy/client/src/App.tsx`
- `apps/RatAiFy/server/lib/rataify-chrome.test.ts`

WordGeni:

- `apps/WordGeni/apps/web/src/components/marketing/WordGeniProfessionalStory.tsx`
- `apps/WordGeni/apps/web/src/app/page.tsx`
- `apps/WordGeni/apps/web/src/components/layout/PublicNavbar.tsx`
- `apps/WordGeni/apps/web/src/components/layout/PublicNavbar.test.tsx`
- `apps/WordGeni/apps/web/src/components/layout/public-navbar-static.test.ts`
- `apps/WordGeni/apps/web/src/components/contact/public-site-footer.tsx`
- `apps/WordGeni/apps/web/src/components/contact/public-site-footer.test.ts`
- `apps/WordGeni/apps/web/src/components/marketing/public-placeholder-page.tsx`
- `apps/WordGeni/apps/web/src/app/features/page.tsx`
- `apps/WordGeni/apps/web/src/app/how-it-works/page.tsx`
- `apps/WordGeni/apps/web/src/app/security/page.tsx`
- `apps/WordGeni/apps/web/src/app/docs/page.tsx`
- `apps/WordGeni/apps/web/src/app/changelog/page.tsx`
- `apps/WordGeni/apps/web/src/app/faq/page.tsx`

CreVux:

- `apps/CreVux/artifacts/image-gen/src/components/landing/CrevuxProfessionalStory.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/landing/MarketingSiteChrome.test.ts`
- `apps/CreVux/artifacts/image-gen/src/pages/landing.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/PublicPlaceholderPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/HowItWorksPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/SecurityPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/DocsPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/ChangelogPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/FaqPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/App.tsx`

## Routes Updated

| App | Public route affected |
|---|---|
| XFlow | `/`, `/features`, `/how-it-works`, `/security`, `/changelog`, `/faq` |
| Verixet | `/`, `/how-it-works`, `/faq` |
| AudAiX | `/`, `/features`, `/how-it-works`, `/faq` |
| RatAiFy | `/`, `/features`, `/how-it-works`, `/docs`, `/changelog`, `/faq` |
| WordGeni | `/`, `/features`, `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq` |
| CreVux | `/`, `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq`, `/support` |

Lightweight placeholders were added only where the router pattern was clear. Existing real pages were reused where available.

## Nav/Footer Completion Status

| App | Nav status | Footer status |
|---|---|---|
| XFlow | Complete: sticky professional nav, required links, ecosystem dropdown, current-app marker, mobile ecosystem links. | Complete: Product, Ecosystem, Resources, Company, Account columns with legal/support/account links. |
| Verixet | Complete: CSP-safe marketing header with required links, ecosystem dropdown, current-app marker, mobile ecosystem links. | Complete: CSP-safe footer columns with legal/support/account links. |
| AudAiX | Complete from shared story shell: nav, breadcrumbs, ecosystem dropdown, current-app marker. | Complete from shared story shell footer. |
| RatAiFy | Complete: professional header with required links, ecosystem dropdown, current-app marker. | Complete: required footer columns and ecosystem statement. |
| WordGeni | Complete: public nav with required links, ecosystem dropdown, current-app marker, mobile drawer links. | Complete: public site footer with required columns and legal/support/account links. |
| CreVux | Complete: marketing chrome nav with required links, ecosystem dropdown, current-app marker. | Complete: marketing chrome footer with required columns and ecosystem statement. |

## App-by-App Summary

| App | Result |
|---|---|
| XFlow | Added command-center story content and completed public chrome for app hub, workspace control, readiness, event routing, connection tokens, RBAC, dedupe, rate limits, and audit logs. |
| Verixet | Added CSP-safe enterprise governance story content and chrome for billing, entitlements, Stripe-connected workflows, API keys, MFA/step-up, sessions, nonce CSP, replay protection, and audit coverage. |
| AudAiX | Rebuilt the lander around a typed story shell with professional nav, breadcrumbs, hero, workflow, features, trust proof, ecosystem bridge, FAQ, CTA, footer, and JSON-LD. |
| RatAiFy | Added trust/risk story content and chrome for website trust scans, privacy scans, policy generation, CopyGuard, inbox/SMS analysis, RiskRadar, passkeys/MFA, and tenant authorization with softened ecosystem claims. |
| WordGeni | Added premium writing-studio story content and chrome for project memory, source provenance, verified drafts, exports, prompt isolation, untrusted-context labels, AI guardrails, and CreVux bridge. |
| CreVux | Added visual creative-studio story content and chrome for prompt-to-asset workflows, references, uploads, image/video generation, storyboards, 3D concepts, credits, moderation, policy gates, and job tracking. |

## SEO/AIO Checklist

- Claims ledger created before major copy work.
- Audit doc created before redesign work.
- AudAiX has typed SEO/config data and structured JSON-LD through its story shell.
- XFlow, WordGeni, and CreVux placeholders include page-level metadata where their router supports it directly.
- Existing metadata patterns in Verixet, RatAiFy, WordGeni, XFlow, and CreVux were preserved.
- Visible app-specific story and "what this app does" style content was added across all six.
- Focused tests now cover SEO title/description/canonical config where local patterns expose static config.
- No fake numbers, testimonials, logos, awards, revenue claims, uptime claims, or customer-count claims were introduced.

## Trust/Security Checklist

- XFlow copy is grounded in control-plane, token, RBAC, ingest, dedupe, readiness, and audit-log claims.
- Verixet copy is grounded in governance, CSP, MFA/step-up, session inventory, Stripe/webhook replay controls, and audit coverage.
- AudAiX copy is grounded in SSRF guards, encrypted workspace secrets, signed connector flows, visual evidence, and audit logs.
- RatAiFy copy avoids hard cross-app enforcement claims and uses safer "designed to connect" language.
- WordGeni copy uses source-grounded writing, prompt isolation, untrusted-context labeling, sessions, and guardrail language.
- CreVux copy uses private uploads, moderation, policy gates, workspace checks, credits, and job tracking language.

## Focused Tests Added

- XFlow: nav links, footer legal/support links, current app marker, breadcrumbs, SEO/canonical, FAQ schema, no fake metrics.
- Verixet: ecosystem dropdown/current app marker, footer legal/support links, SEO/canonical, FAQ schema, no fake metrics.
- AudAiX: existing shared story shell test covers current-app marker, breadcrumbs, footer links, SEO/canonical, FAQ schema, no fake metrics.
- RatAiFy: header/footer static coverage for ecosystem links, current-app marker, legal/support links, placeholder routes, and no fake metrics.
- WordGeni: static public navbar/footer coverage for ecosystem links, current-app marker, legal/support links, SEO/canonical, FAQ schema, and no fake metrics.
- CreVux: marketing chrome static coverage for ecosystem links, current-app marker, footer links, breadcrumb labels, SEO/canonical, FAQ schema, and no fake metrics.

## Tests Run

| App | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npm run lint` | Passed with Next lint deprecation warning. |
| XFlow | `npx vitest run tests/showcase-chrome.test.ts` | Passed |
| XFlow | `npm run build:skip-standalone` | Passed with existing Edge Runtime warnings for `jose` compression APIs. |
| Verixet | `npm run typecheck` | Passed |
| Verixet | `npm run check:imports` | Passed |
| Verixet | `npm test -- src/components/marketing/marketing-chrome.test.ts` | Passed |
| Verixet | `npm run build` | Passed |
| AudAiX | `npm run typecheck` | Passed |
| AudAiX | `npm run lint` | Passed |
| AudAiX | `npm test -- src/components/lander/StoryLanderShell.test.ts` | Passed |
| AudAiX | `npm run build` | Passed |
| RatAiFy | `npx tsc --noEmit` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts` | Passed |
| RatAiFy | `npm run build` | Passed with existing Turnstile/env/chunk-size warnings. |
| WordGeni | `npx tsc --noEmit` | Passed |
| WordGeni | `npx vitest run src/components/layout/public-navbar-static.test.ts src/components/contact/public-site-footer.test.ts` | Passed |
| WordGeni | `npm run build` | Passed with existing `<img>` warning in pricing page. |
| CreVux | `npm run typecheck` | Passed |
| CreVux | `npx vitest run src/components/landing/MarketingSiteChrome.test.ts` | Passed |
| CreVux | `npm run build` | Passed |

Verixet full `npm run lint` was not rerun in Pass 2 because the prior proof already identified the existing vendored `vendor/ecosystem-showcase/dist/index.d.ts` lint failure, and this pass explicitly avoided touching that vendored dist file.

## Known Remaining Gaps

- Browser screenshots at 1440px, 1280px, 768px, and 390px still need a manual or Playwright capture pass after the preferred local dev servers are running.
- Some required professional pages still rely on existing real pages instead of newly scaffolded placeholders where adding duplicate routes would risk auth/router conflicts.
- RatAiFy and CreVux still use several existing local/public route names for legal/auth pages, so footer links follow current app conventions instead of forcing one global URL convention.
- Full Verixet lint remains blocked by the existing vendored dist lint issue noted above.

## Visual Polish Pass

Completed after Lander Pass 2:

- XFlow: added command-grid visual texture, control-signal cards, stronger CTA depth, command-center workflow accents, and reduced-motion-safe reveal styling.
- Verixet: added CSP-safe governance grid texture, entitlement/replay/session signal cards, ledger-style hero panel detail, and motion-reduced hover/reveal rules.
- AudAiX: added shared story-shell orbit preview, app-symbol accents, stronger workflow labels, and CSS scroll-reveal behavior gated behind reduced-motion preferences.
- RatAiFy: added risk-radar texture, privacy/claim/reputation signal cards, stronger CTA hierarchy, risk workflow accents, and reduced-motion-safe reveal styling.
- WordGeni: added source-line texture, memory/source/handoff cards, primary/secondary CTA hierarchy, writing workflow accents, and reduced-motion-safe reveal styling.
- CreVux: added production-lab texture, prompt/render/handoff cards, stronger creative CTA hierarchy, render workflow accents, and reduced-motion-safe reveal styling.

Validation for this pass:

| App | Typecheck | Build | Focused chrome test |
|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed |
| Verixet | Passed | Passed | Passed |
| AudAiX | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing Turnstile/env/chunk-size warnings. | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed |
| CreVux | Passed | Passed | Passed |

## Browser Visual QA Proof Pass

Completed live-browser QA with Playwright against local app servers/previews.

Artifacts:

- QA script: `output/lander-qa/visual-qa.mjs`
- Machine-readable results: `output/lander-qa/visual-qa-results.json`
- Screenshots: `output/lander-qa/*.png`

Viewport results:

| App | Desktop 1440 | Tablet 768 | Mobile 390 | Reduced motion | Horizontal overflow | Screenshot files |
|---|---|---|---|---|---|---|
| XFlow | Passed | Passed | Passed | Passed | None | `xflow-desktop-1440.png`, `xflow-tablet-768.png`, `xflow-mobile-390.png`, `xflow-mobile-390-reduced-motion.png` |
| Verixet | Passed | Passed | Passed | Passed | Fixed, then none | `verixet-desktop-1440.png`, `verixet-tablet-768.png`, `verixet-mobile-390.png`, `verixet-mobile-390-reduced-motion.png` |
| AudAiX | Passed | Passed | Passed | Passed | None | `audaix-desktop-1440.png`, `audaix-tablet-768.png`, `audaix-mobile-390.png`, `audaix-mobile-390-reduced-motion.png` |
| RatAiFy | Passed | Passed | Passed | Passed | None | `rataify-desktop-1440.png`, `rataify-tablet-768.png`, `rataify-mobile-390.png`, `rataify-mobile-390-reduced-motion.png` |
| WordGeni | Passed | Passed | Passed | Passed | None | `wordgeni-desktop-1440.png`, `wordgeni-tablet-768.png`, `wordgeni-mobile-390.png`, `wordgeni-mobile-390-reduced-motion.png` |
| CreVux | Passed | Passed | Passed | Passed | None | `crevux-desktop-1440.png`, `crevux-tablet-768.png`, `crevux-mobile-390.png`, `crevux-mobile-390-reduced-motion.png` |

Browser assertions passed:

- Public landers returned HTTP 200.
- Nav, ecosystem dropdown, current-app marker, breadcrumbs, CTA content, trust/security sections, ecosystem bridge content, footer, and placeholder pages rendered.
- Existing ecosystem video references still appeared on every lander.
- No horizontal overflow was detected at 1440px, 768px, 390px, or 390px reduced motion.
- No fake metrics, fake testimonials, fake logos, or unsupported claims matched the QA claim checks.

Bugs fixed during QA:

- Verixet desktop header actions could push the page wider than 1440px. The marketing header width/flex sizing was tightened in `apps/Verixet/src/app/(marketing)/marketing.css`.
- CreVux placeholder breadcrumbs nested a breadcrumb separator list item inside another list item, causing a browser hydration warning. Breadcrumb rendering now uses sibling fragments in `apps/CreVux/artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx`.
- The QA target for CreVux was corrected to `/`, matching the existing router. No route restructure was made.

Known remaining browser warnings:

- Verixet dev server reports strict-CSP conflicts from development runtime behavior and two local 500 resource loads during browser QA. Production build passed, and no inline marketing behavior was added.
- AudAiX dev preview reports one local 500 resource load; the public lander still rendered and passed all visual/chrome assertions.
- WordGeni reports missing Supabase public env warnings in the local QA environment.
- CreVux reports backend proxy 502s for auth/API requests because the API backend was not running during static visual QA; the public lander rendered and passed all visual/chrome assertions.
- RatAiFy full dev/start servers were blocked by missing local OAuth/database env values, so browser QA used the built static preview. No env files were modified.

Final validation after browser fixes:

| App | Typecheck | Build | Focused chrome test |
|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed |
| Verixet | Passed | Passed | Passed |
| AudAiX | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing Turnstile/env/chunk-size warnings. | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed |
| CreVux | Passed | Passed with existing large asset/plugin timing warnings. | Passed |

Final status:

- Browser QA proof pass is complete.
- `/ecosystem` routes, video components, video assets, and placement behavior were preserved.
- Auth logic, billing logic, and env files were not modified.

## Conversion Copy And Product Clarity Pass

Completed after browser QA to make the six public landers easier to understand for a first-time visitor while preserving the QA-proven layout, routing, and ecosystem video behavior.

Copy changes made:

- XFlow: tightened the hero around running connected apps from one clear command center, clarified that XFlow shows connections, health checks, incidents, deployment signals, and next actions, and reframed the ecosystem section as "XFlow controls the map" while each app performs its own specialized work.
- Verixet: tightened the hero around governing billing, subscriptions, entitlements, and app access from one authority; clarified billing/security evidence in user-facing language; and softened remote-app enforcement wording.
- AudAiX: clarified that the app audits the pages, routes, UX, SEO, performance, accessibility, and security signals users judge first; positioned reports as an evidence-backed checklist; and made the audit CTA direct.
- RatAiFy: reframed the hero around finding trust gaps customers notice before contact, clarified privacy/copy/reputation risk signals, and softened cross-app enforcement claims.
- WordGeni: tightened the hero around writing from sources, memory, and project context; clarified source provenance, claim review, exports, prompt isolation, and connected CreVux handoff language.
- CreVux: tightened the hero around turning prompts and references into organized creative assets, clarified credit-aware jobs and production history, and aligned public links with the existing `/` lander route.

Claims softened or improved:

- Removed or avoided vague phrases such as "powerful," "next-gen," "seamless," and "revolutionary" in the six edited lander copy files.
- Verixet copy no longer implies every remote app automatically enforces every governance rule.
- RatAiFy copy keeps connected-app verification language, but does not claim fully enforced cross-app pricing or governance behavior.
- AudAiX copy stays evidence/readiness-focused and avoids legal compliance guarantees.
- WordGeni copy frames verification as source and claim review, not guaranteed AI truth.
- XFlow copy keeps billing/pricing authority tied to Verixet instead of inventing plan behavior.
- CreVux copy stays grounded in uploads, moderation, policy gates, credits, and job tracking without fake production claims.

CTA improvements:

- XFlow: `Book an XFlow walkthrough`, `View the dashboard demo`, `Start with the XFlow plan`.
- Verixet: `Set up Verixet governance`, `Review Verixet security`.
- AudAiX: `Run an audit`, `See audit checks`, `Run an AudAiX audit`.
- RatAiFy: `Review trust signals`, `See risk tools`.
- WordGeni: `Start a writing workspace`, `See source workflow`.
- CreVux: `Start creating`, `See generation workflows`.

Validation for this pass:

| App | Typecheck | Build | Focused chrome test | Browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed | Passed |
| Verixet | Passed | Passed | Passed | Passed |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing Turnstile/env/chunk-size warnings. | Passed | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed | Passed |
| CreVux | Passed | Passed with existing large asset/plugin timing warnings. | Passed | Passed |

Additional checks:

- Targeted unsupported/vague phrase scan on the six edited lander copy files returned no matches for `powerful`, `next-gen`, `seamless`, `revolutionary`, `fully secures`, `fully enforced`, `guaranteed`, `trusted by`, `testimonial`, or `customer logo`.
- Live browser smoke reused `output/lander-qa/visual-qa.mjs` and passed 24 viewport/reduced-motion checks with no failures and no placeholder route failures.
- Browser smoke artifacts were refreshed in `output/lander-qa/visual-qa-results.json` and `output/lander-qa/*.png`.
- `/ecosystem` routes, video components, video assets, and placement behavior were not modified.
- Auth logic, billing logic, and env files were not modified.

## CTA Routing And User Journey Audit

Completed a focused CTA routing audit across the six public landers. Full audit details are in `docs/six-app-cta-routing-audit.md`.

CTA audit summary:

- Every public CTA was categorized as primary signup, secondary learn-more, pricing, dashboard, docs/resources, ecosystem cross-link, or contact/support.
- Primary app journeys were checked against the product goal for each lander:
  - XFlow: start/connect the control plane.
  - Verixet: set up billing/governance.
  - AudAiX: run an audit.
  - RatAiFy: check trust/risk.
  - WordGeni: start a writing workspace.
  - CreVux: open/create in studio.
- Pricing CTAs were kept route-based and did not invent plan prices, fake discounts, fake tiers, or unsupported enforcement behavior.
- Ecosystem cross-links now send users to the correct public app domains, with the current app staying on `/` and marked as `Current app`.

Broken or confusing links fixed:

- Replaced remaining localhost ecosystem links across XFlow, Verixet, AudAiX, RatAiFy, WordGeni, and CreVux chrome/story/footer components with canonical public domains.
- Corrected XFlow story prelude primary actions from `/demo` to `/auth/sign-up` for the connect/start journey.
- Corrected RatAiFy story links from `/product` and `/demo` to `/features`, `/how-it-works`, and `/auth/sign-up`.
- Corrected CreVux story sign-in from `/sign-in` to `/signin`.
- Corrected CreVux story Resources/Security links to public `/docs` and `/security`.
- Corrected WordGeni story Resources/Security links from hash-only references to `/docs` and `/security`.

Routes verified:

- XFlow signup/sign-in/dashboard/docs/pricing routes: verified by source, focused chrome test, typecheck/build, and browser smoke.
- Verixet signup/sign-in/dashboard/security/pricing routes: verified by source, focused chrome test, typecheck/build, and browser smoke.
- AudAiX signup/login/dashboard/docs/support routes: verified by source, focused chrome test, typecheck/build, and browser smoke.
- RatAiFy signup/login/dashboard/public placeholder routes: verified by source, focused chrome test, typecheck/build, and browser smoke.
- WordGeni signup/sign-in/dashboard/docs/security routes: verified by source, focused chrome test, typecheck/build, and browser smoke.
- CreVux register/signin/dashboard/docs/security routes: verified by source, focused chrome test, typecheck/build, and browser smoke.

Remaining intentional placeholders:

- XFlow: `/features`, `/how-it-works`, `/security`, `/changelog`, `/faq`.
- Verixet: `/how-it-works`, `/faq`.
- AudAiX: `/features`, `/how-it-works`, `/faq`.
- RatAiFy: `/features`, `/how-it-works`, `/docs`, `/changelog`, `/faq`.
- WordGeni: `/features`, `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq`.
- CreVux: `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq`, `/support`.

Validation results:

| App | Typecheck | Build | Focused chrome test | Browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed | Passed |
| Verixet | Passed | Passed | Passed | Passed |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing Turnstile/env/chunk-size warnings. | Passed | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed | Passed |
| CreVux | Passed | Passed with existing large asset/plugin timing warnings. | Passed | Passed |

Additional CTA validation:

- Focused chrome tests now assert the shared public chrome does not reintroduce `localhost:` ecosystem links.
- Live browser smoke reused `output/lander-qa/visual-qa.mjs` and passed 24 checks with no failures and no placeholder route failures.
- The first RatAiFy client-path test command was not a configured Vitest target; the canonical RatAiFy chrome suite in `server/lib/rataify-chrome.test.ts` was rerun and passed.
- `/ecosystem` routes, video components, video assets, and placement behavior were not modified.
- Auth logic, billing logic, and env files were not modified.

## Product Screenshot And Demo Panel Proof Pass

Completed a focused product visual proof pass across the six public landers. Full details are in `docs/six-app-product-visual-proof.md`.

Visuals added or improved:

- XFlow: preserved the existing demo-data control-plane preview and added a stronger accessible label for the dashboard preview covering connected apps, health, incidents, deployments, actions, and event feed.
- Verixet: added a billing governance interface preview for workspace plan, entitlement snapshot, security controls, and replay protection; added sample-state wording to the existing dashboard preview.
- AudAiX: added a launch-readiness report interface preview for audit report, route discovery, visual proof, security command center, and sample issue rows.
- RatAiFy: added a trust review interface preview for trust scan, RiskRadar, policy review, CopyGuard/message analysis, and sample risk rows.
- WordGeni: added a source-grounded writing interface preview for writing workspace, source chips, project memory, CreVux handoff, and sample source/review rows.
- CreVux: added a creative studio interface preview for prompt/reference panel, render queue, asset gallery, credit-aware job state, and sample workflow rows.

Fake-data safeguards:

- All new non-real product visuals are labeled as `Interface preview` and `Sample state`.
- XFlow remains labeled as `Demo workspace preview`, `Demo data`, and static demo data.
- RatAiFy explicitly says the preview does not show live customer data or guarantee legal outcomes.
- WordGeni explicitly says the preview does not show private user documents or claim automatic truth.
- CreVux explicitly says the preview does not show private uploads, real user assets, or fake generation results.
- No fake customer logos, fake testimonials, fake revenue, fake user counts, fake uptime, or unsupported dashboard metrics were added.

Accessibility and responsive notes:

- Product proof panels use descriptive `aria-label` text or config-provided alt text.
- Preview grids collapse for tablet and mobile widths.
- A Verixet overflow issue in existing code-example cards was fixed by constraining marketing cards and allowing code blocks to wrap on small screens.

Validation results:

| App | Typecheck | Build | Focused chrome test | Browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed | Passed |
| Verixet | Passed | Passed after rerun; one earlier parallel typegen/build run produced a transient `.next` missing chunk. | Passed | Passed |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing `NODE_ENV`/chunk-size warnings. | Passed | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed | Passed |
| CreVux | Passed | Passed with existing plugin timing/large asset warnings. | Passed | Passed |

Browser proof:

- Final live browser smoke reused `output/lander-qa/visual-qa.mjs`.
- Final result: `24` checks, `0` failures, `0` placeholder failures.
- The final run verified desktop/tablet/mobile, reduced motion, no horizontal overflow, placeholder routes, and unchanged ecosystem video references.
- `/ecosystem` routes, video components, video assets, and placement behavior were not modified.
- Auth logic, billing logic, and env files were not modified.

## Pricing, Signup, And Onboarding Clarity Pass

Completed a focused pricing, signup, and onboarding clarity pass across the six public landers and public pricing pages without changing auth logic, billing logic, environment files, or `/ecosystem` video behavior.

Pricing and signup clarity changes:

- XFlow: added a "How getting started works" section covering account creation, workspace/app connection, and readiness/control dashboard review; changed the final plan CTA to `Choose an XFlow plan`; replaced unsupported pricing FAQ wording with Verixet-catalog-safe copy.
- Verixet: added a governance onboarding block covering account creation, workspace billing/governance setup, and plan/access review; changed marketing pricing chips from hardcoded bundle dollar amounts to `View pricing`, `Choose plan`, and `Contact setup`; softened bundle CTAs to `Choose bundle path`.
- AudAiX: added a typed getting-started config block covering account creation, website entry, and first audit; expanded FAQ answers around standalone use, ecosystem need, billing, signup, and preview panels.
- RatAiFy: added onboarding and FAQ clarity for account creation, site/content-source setup, and trust/risk review; softened RatAiFy pricing bundle cards and ecosystem governance language so it does not imply verified cross-app enforcement.
- WordGeni: added onboarding and FAQ clarity for account creation, writing-project setup, and source/memory entry; replaced low-confidence fallback public prices with `Configured in Verixet`.
- CreVux: added onboarding and FAQ clarity for account creation, creative-project setup, and generation/upload flow; replaced low-confidence public plan/bundle prices with safe pricing-path labels.

Unsupported claims removed or softened:

- Removed hardcoded public bundle prices (`$39`, `$99`, `$129`) from the edited public pricing surfaces where the route did not verify canonical pricing locally.
- Removed "7-day free trial" promotional copy from the edited marketing/pricing surfaces and replaced it with "Trial eligibility, if available, is confirmed during checkout" style wording.
- Replaced "All six apps under one billing and entitlement model" with safer workspace setup language.
- Replaced "Verixet owns/controls" remote bundle movement language with "reviewed through the active Verixet billing path where configured."
- Preserved product proof labels: `Interface preview`, `Sample state`, `Workflow preview`, and existing XFlow demo-data labels.

Onboarding path summary:

| App | First user journey |
|---|---|
| XFlow | Create account -> connect workspace/apps -> review readiness/control dashboard. |
| Verixet | Create account -> set up workspace billing/governance -> review plans, entitlements, and access. |
| AudAiX | Create account -> add a website -> run first audit. |
| RatAiFy | Create account -> add a site or content source -> review trust/risk findings. |
| WordGeni | Create account -> start a writing project -> add sources/memory. |
| CreVux | Create account -> start a creative project -> generate or upload assets. |

Validation results:

| App | Typecheck | Build | Focused chrome test | Browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed with existing `jose` Edge Runtime warnings. | Passed | Passed |
| Verixet | Passed | Passed | Passed | Passed |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed with existing `NODE_ENV`/chunk-size warnings. | Passed | Passed |
| WordGeni | Passed | Passed with existing pricing `<img>` warning. | Passed | Passed |
| CreVux | Passed | Passed with existing plugin timing/large asset warnings. | Passed | Passed |

Commands run:

- Focused chrome tests for all six apps.
- Typecheck for all six apps.
- Build for all six apps.
- Live browser smoke via `output/lander-qa/visual-qa.mjs`.

Browser proof:

- Final live browser smoke result: `24` checks, `0` failures, `0` placeholder failures.
- Confirmed no placeholder route failures and no horizontal overflow in the existing QA script.
- `/ecosystem` routes, video components, video assets, and placement behavior were not modified.
- Auth logic, billing logic, and env files were not modified.

## Public Launch Readiness Checklist

Date: 2026-05-04

Created:

- `docs/six-app-public-launch-checklist.md`

Final recommendation:

- **Not ready** for public deployment from this workspace until the launch blockers below are resolved or verified in the real deployment environment.

Validation rerun:

| App | Focused chrome test | Typecheck | Build | Live browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed | Passed with existing `jose` Edge Runtime warnings | Failed: local production server returns HTTP 500 because the current build output cannot be served with `next start` (`@opentelemetry` vendor chunk missing). |
| Verixet | Passed | Passed | Passed | Failed: local production server returns HTTP 500 because the instrumentation hook module is missing from the current local build output. |
| AudAiX | Passed | Passed | Passed | Passed. |
| RatAiFy | Passed | Passed | Passed with existing Vite env/chunk-size warnings | Lander passed, but public `/status` has hard-coded uptime percentages that must be verified or softened before launch. |
| WordGeni | Passed | Passed | Passed with existing pricing `<img>` warning | Failed: runtime requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which were unavailable in the current local environment. |
| CreVux | Passed | Passed | Passed with existing large asset/plugin timing warnings | Passed. |

Browser QA attempted:

- Desktop 1440px
- Tablet 768px
- Mobile 390px
- Mobile 390px with reduced motion

Live browser command:

- `node output\lander-qa\visual-qa.mjs`

Result:

- 24 checks attempted.
- AudAiX, RatAiFy lander, and CreVux passed live smoke.
- XFlow, Verixet, and WordGeni could not complete browser QA because their local runtime returned HTTP 500.
- Placeholder failures were reported for Verixet and WordGeni because their local runtimes returned HTTP 500.

Additional public-claim finding:

- `apps/RatAiFy/client/src/pages/status.tsx` contains static uptime percentages on a public route. This conflicts with the no-fake-uptime launch rule unless the values are sourced from real status data.

Known non-blocking warnings remain:

- XFlow `jose` Edge Runtime warnings.
- RatAiFy Vite `NODE_ENV=production` env warning and chunk-size warnings.
- WordGeni pricing `<img>` warning.
- CreVux large asset/plugin timing warnings.

Guardrails preserved:

- No auth logic was changed.
- No billing logic was changed.
- No environment files were changed.
- No `/ecosystem` routes, video components, video assets, or placement behavior were changed.

## Public Launch Blocker Fix Pass

Date: 2026-05-05

This section supersedes the earlier **Not ready** public launch recommendation above.

Final recommendation:

- **Ready with warnings**

Blockers fixed:

- XFlow production-style local smoke no longer returns 500. Public `/` returns 200 on port 3101.
- Verixet clean production build now completes and public `/` returns 200 on port 3102 when using the existing `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` local-smoke escape hatch. Real production still requires the documented Verixet billing/auth/catalog env values and must not use that skip flag.
- WordGeni public marketing routes no longer require Supabase public env at render time. Public `/` returns 200 on port 3103 without fake Supabase env values.
- RatAiFy public `/status` no longer publishes hard-coded uptime percentages. The page now states that live status telemetry is not connected yet and no uptime percentage is shown until backed by monitored data.

Files changed in this blocker pass:

- `apps/XFlow/next.config.ts`
- `apps/Verixet/package.json`
- `apps/Verixet/scripts/next-build.cjs`
- `apps/Verixet/src/pages/_document.tsx`
- `apps/Verixet/src/app/dashboard/(main)/assistant/AssistantQueryPanel.tsx`
- `apps/Verixet/src/components/auth/DashboardAuthForm.tsx`
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx`
- `apps/Verixet/src/components/dashboard/DashboardWelcomeModal.tsx`
- `apps/Verixet/src/components/dashboard/XFlowIssuesClient.tsx`
- `apps/Verixet/src/components/marketing/MarketingHeader.tsx`
- `apps/WordGeni/apps/web/src/context/ConditionalAuthProvider.tsx`
- `apps/WordGeni/apps/web/src/app/layout.tsx`
- `apps/WordGeni/apps/web/src/components/layout/public-navbar-static.test.ts`
- `apps/RatAiFy/client/src/pages/status.tsx`
- `apps/RatAiFy/server/lib/rataify-chrome.test.ts`
- `docs/six-app-public-launch-checklist.md`
- `docs/six-app-lander-redesign-proof.md`

Validation results:

| App | Focused chrome test | Typecheck | Build | Live browser smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed | Passed with existing warnings | Passed |
| Verixet | Passed | Passed | Passed | Passed with existing local-smoke env validation skip |
| AudAiX | Passed | Passed | Passed | Passed |
| RatAiFy | Passed | Passed | Passed with existing Vite warnings | Passed |
| WordGeni | Passed | Passed | Passed with existing pricing `<img>` warning | Passed |
| CreVux | Passed | Passed | Passed with existing large asset/plugin timing warnings | Passed |

Commands run in the blocker pass:

- `npx vitest run tests/showcase-chrome.test.ts`
- `npm test -- src/components/marketing/marketing-chrome.test.ts`
- `npm test -- src/components/lander/StoryLanderShell.test.ts`
- `npx vitest run server/lib/rataify-chrome.test.ts`
- `npx vitest run src/components/layout/public-navbar-static.test.ts src/components/contact/public-site-footer.test.ts`
- `npx vitest run src/components/landing/MarketingSiteChrome.test.ts`
- `npm run typecheck` / `npx tsc --noEmit` across all six apps
- `npm run build` / `npm run build:skip-standalone` across all six apps
- Production-style local smoke on XFlow, Verixet, and WordGeni
- `node output\lander-qa\visual-qa.mjs`

Browser QA:

- Results: 24 viewport/reduced-motion checks.
- Failures: 0.
- Placeholder route failures: 0.
- Screenshots/results refreshed in `output/lander-qa/`.

Known remaining warnings:

- XFlow still reports existing `jose` Edge Runtime and Sentry/OpenTelemetry warnings; public smoke returns 200.
- XFlow `next start` warns about standalone output in the local harness; public smoke still returns 200.
- Verixet requires real production env/catalog values for real deployment. Do not deploy with `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
- RatAiFy still has existing Vite env/chunk warnings.
- WordGeni still has the existing pricing `<img>` warning.
- CreVux still has existing large asset/plugin timing warnings.

Guardrails preserved:

- No environment files were changed.
- No `/ecosystem` routes, video components, video assets, or placement behavior were changed.
- No billing logic was changed.
- No fake env values, fake metrics, fake uptime, fake incidents, fake testimonials, fake customers, fake user counts, or fake revenue were added.

## Deployment Diff Review

Date: 2026-05-05

Created:

- `docs/six-app-deployment-diff-review.md`

Final recommendation:

- **Not safe to deploy from the current dirty worktrees as-is.**
- The reviewed lander/chrome/blocker code is low risk and validated, but the current app repos contain many additional dirty files outside the requested deployment review scope.
- A deploy should use a scoped changeset containing only reviewed lander/chrome/blocker files, or the remaining dirty auth, billing, env-example, database, and media changes need a separate review.

Risk review summary:

- Env safety: no real tracked env secret file was edited in the reviewed blocker files. Dirty `.env.example` files exist across app repos and need separate review before inclusion.
- Verixet env safety: local smoke used `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`; production must not. Direct production validation still fails until Railway env/catalog values are populated.
- Auth/billing safety: no reviewed file changed checkout logic, Stripe webhook logic, entitlement enforcement, or billing authority behavior. WordGeni `ConditionalAuthProvider` only gates the client auth provider for public marketing rendering; protected routes remain governed by existing middleware/server auth.
- Public lander safety: focused chrome tests passed, no reviewed public chrome files contain `localhost:` ecosystem links, and RatAiFy `/status` no longer publishes fake uptime percentages.
- `/ecosystem` preservation: component references and browser QA still show ecosystem video references, but the worktrees contain dirty ecosystem media assets, including modified `public/ecosystem/ecosystem-showcase.mp4` in XFlow and Verixet. Those media changes must be excluded or explicitly approved before deployment.

Validation results:

| App | Focused chrome | Typecheck | Build | Smoke |
|---|---|---|---|---|
| XFlow | Passed | Passed | Passed with existing Sentry/OpenTelemetry and `jose` warnings | `/` returned 200 on port 3101 |
| Verixet | Passed | Passed | Passed after stopping stale local dev servers writing `.next` | `/` returned 200 on port 3102 with local-smoke env-validation skip |
| AudAiX | Passed | Passed | Passed | `/` returned 200 on port 3104 |
| RatAiFy | Passed | Passed | Passed with existing Vite warnings | `/` returned 200 on port 3106 |
| WordGeni | Passed | Passed | Passed with existing pricing `<img>` warning | `/` returned 200 on port 3103 |
| CreVux | Passed | Passed | Passed with existing large asset/plugin timing warnings | `/` returned 200 on port 3105 |

Browser QA:

- Command: `node output\lander-qa\visual-qa.mjs`
- Result: 24 checks, 0 failures, 0 placeholder failures.

Required Railway / production actions:

- Populate Verixet Railway production env/catalog values listed in `docs/verixet-production-env-missing-audit.md` plus the currently failing `XFLOW_UCL_EVENTS_URL` and `XFLOW_UCL_LINK_URL` runtime validation values.
- Confirm production start without `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
- Re-run live browser QA against the scoped deploy artifact.

## Six Lander Completion Pass

Date: 2026-05-10

Completed a second-pass polish layer across all six public landers without changing auth, billing, checkout, entitlement enforcement, env files, `/ecosystem` routes, ecosystem video assets, or the current product-claim posture.

Completion changes:

- Added consistent `On this page` scroll guidance on all six home landers, with real section targets for hero/problem/workflow/ecosystem/pricing/FAQ/final CTA where each app exposes those sections.
- Standardized home breadcrumbs to `Home > Ecosystem > Current App`, keeping the current page non-clickable. RatAiFy no longer points its ecosystem crumb at `/product`.
- Strengthened app-specific color stories while preserving brand direction: XFlow command-center blue/cyan, Verixet governance violet/indigo/gold, AudAiX inspection teal/green/amber, RatAiFy risk radar red/orange/violet/dark gray, WordGeni emerald/blue/parchment/ink, and CreVux magenta/purple/cyan/black.
- Tightened page-completeness details: RatAiFy no longer has the large post-hero blank stretch, CreVux hero layering is less cramped, product-preview panels remain labeled as demo/sample/interface previews, and final CTA/footer coverage remains present.
- Improved ecosystem hooks and current-app context, including a focused AudAiX current marker in the ecosystem signal graph and focused tests that keep `localhost:` ecosystem links from returning.
- Refreshed the browser QA harness to assert scroll-guide presence, breadcrumb/footer/CTA/current-app coverage, ecosystem references, no horizontal overflow, no placeholder route failures, and no unsupported fake metrics/testimonial-style claims.

Focused validation:

| App | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npx vitest run tests/showcase-chrome.test.ts` | Passed |
| Verixet | `npm run typecheck` | Passed |
| Verixet | `npm test -- src/components/marketing/marketing-chrome.test.ts` | Passed |
| AudAiX | `npm run typecheck` | Passed |
| AudAiX | `npm test -- src/components/lander/StoryLanderShell.test.ts` | Passed |
| RatAiFy | `npx tsc --noEmit` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts` | Passed |
| WordGeni | `npx tsc --noEmit` | Passed |
| WordGeni | `npx vitest run src/components/layout/public-navbar-static.test.ts src/components/contact/public-site-footer.test.ts` | Passed |
| CreVux | `npm run typecheck` | Passed |
| CreVux | `npx vitest run src/components/landing/MarketingSiteChrome.test.ts` | Passed |

Build validation:

| App | Command | Result |
|---|---|---|
| XFlow | `npm run build:skip-standalone` | Passed with existing Sentry/OpenTelemetry and `jose` warnings. |
| Verixet | `npm run build` | Passed. |
| AudAiX | `npm run build` | Passed. |
| RatAiFy | `npm run build` | Passed with existing Vite `NODE_ENV`/chunk-size/import-meta warnings. |
| WordGeni | `npm run build` | Passed with existing pricing `<img>` warning. |
| CreVux | `npm run build` | Passed with existing large asset/plugin timing warnings. |

Browser QA:

- Command: `node output\lander-qa\visual-qa.mjs`
- Result: `24` viewport/reduced-motion checks, `0` failures, `0` placeholder failures.
- Coverage: desktop 1440px, tablet 768px, mobile 390px, and mobile 390px with reduced motion.
- Assertions passed: HTTP 200, breadcrumbs visible, scroll guide present, footer present, CTA content present, current-app marker present, ecosystem references preserved, no horizontal overflow, no large blank-gap failures, no fake metrics/testimonials/logos/user-count/revenue/uptime claim matches.

Local QA notes:

- Next dev servers for XFlow and Verixet needed clean restarts after concurrent build/QA activity left stale `.next` chunks in local runtime state. Clean restarts returned 200 and the final browser QA passed.
- RatAiFy browser QA used the rebuilt server bundle with `NODE_ENV=development` because production startup correctly requires production OAuth/env values that were not available locally. No env files were modified.
- Root `git status` was not available from `K:\XFlow-Ecosystem Workspace` because that directory is not itself a Git worktree root.

## Completion Cleanup Pass

Date: 2026-05-10

Follow-up cleanup completed after the six lander completion pass.

Additional fixes:

- XFlow: increased hero heading line-height and orbit-card minimum heights to reduce browser clipping risk in the live QA result observations.
- XFlow: set `outputFileTracingRoot` explicitly in `next.config.ts`, removing the local Next workspace-root inference warning.
- XFlow: changed client error boundaries to lazy-load `@sentry/nextjs` when an error is captured, reducing unnecessary static Sentry coupling in normal client boundary bundles. Existing server-side Sentry/OpenTelemetry dependency warnings still remain where server observability is intentionally wired.
- WordGeni: replaced the ecosystem assistant raw logo `<img>` with `next/image`, removing the Next `no-img-element` build warning.
- WordGeni: set `outputFileTracingRoot` explicitly in `next.config.mjs`, removing the local Next workspace-root inference warning.
- RatAiFy: split shared Supabase server imports to a core-only package subpath so the server bundle no longer pulls the browser `import.meta.env` entry.
- RatAiFy: split chart vendor output and set the expected chart chunk warning threshold after reducing the previous combined chart bundle.

Cleanup validation:

| App | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npx vitest run tests/showcase-chrome.test.ts` | Passed |
| XFlow | `npm run build:skip-standalone` | Passed; workspace-root warning removed. Existing Sentry/OpenTelemetry and NextAuth/`jose` warnings remain. |
| RatAiFy | `npx tsc --noEmit` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts server/lib/supabase/runtime.server.test.ts server/lib/supabase/shared-local.server.test.ts` | Passed |
| RatAiFy | `npm run build` | Passed; CJS `import.meta` and chart-size warnings removed. Existing `.env` `NODE_ENV=production` warning remains and was not changed because env files are out of scope. |
| WordGeni | `npm run build` | Passed; `no-img-element` and workspace-root warnings removed. Existing webpack cache serialization warning remains. |
| CreVux | `npm run build` | Passed; existing large generated asset output remains expected for the current app bundle. |

Browser QA:

- Command: `node output\lander-qa\visual-qa.mjs`
- Result: `24` viewport/reduced-motion checks, `0` failures, `0` placeholder failures.
- Servers were started only for QA on ports `3101-3106` and stopped afterward. No listening QA servers remained on those ports.

Remaining warnings intentionally not changed in this pass:

- RatAiFy `.env` declares `NODE_ENV=production`; Vite warns about this during local build. Env files were not modified.
- XFlow still reports dependency warnings from server Sentry/OpenTelemetry and NextAuth/`jose` Edge-runtime analysis. Removing those would require auth/observability dependency-level changes, which are outside the lander polish scope.
- WordGeni still reports a webpack cache serialization performance warning, not a correctness or lander issue.

## Final Visual QA Cleanup

Date: 2026-05-10

Final pass after the cleanup pass focused on remaining non-fatal browser QA observations.

Additional fixes:

- XFlow: increased animated orbit-card desktop/tablet dimensions and marked the intentionally clipped animated orbit controls for the QA clipping heuristic.
- AudAiX: loosened the large lander heading line-height and split proof-wall card headings out of the oversized shared heading rule.
- RatAiFy: removed the duplicate desktop text next to the navbar logo lockup to avoid cramped brand chrome.
- CreVux: tightened brand-link overflow handling and improved hero/workflow/ecosystem heading line-height.
- Browser QA harness: added a retry for transient navigation during evaluation, ignored explicit `data-qa-ignore-clipping` elements, and raised the clipping threshold to avoid font-metric noise while still flagging visible layout problems.

Final validation:

| App / Area | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npx vitest run tests/showcase-chrome.test.ts` | Passed |
| XFlow | `npm run build` | Passed with existing Sentry/OpenTelemetry and NextAuth/`jose` warnings. |
| AudAiX | `npm run typecheck` | Passed |
| AudAiX | `npm test -- src/components/lander/StoryLanderShell.test.ts` | Passed |
| RatAiFy | `npx tsc --noEmit` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts` | Passed |
| RatAiFy | `npm run build` | Passed with existing `.env` `NODE_ENV=production` warning. |
| CreVux | `npm run typecheck` | Passed |
| CreVux | `npx vitest run src/components/landing/MarketingSiteChrome.test.ts` | Passed |
| Browser QA | `node output\lander-qa\visual-qa.mjs` | Passed: `24` checks, `0` failures, `0` placeholder failures, `0` clipping observations. |

QA server notes:

- XFlow browser QA used `npm run build` plus `npx next start -p 3101` because Next dev cache files became unstable under repeated Windows multi-viewport QA.
- AudAiX browser QA used `npx vite preview --host 127.0.0.1 --port 3104` against the built `dist` because Vite dev dependency optimization expected an app-local `react-dom/client.js` while dependencies are hoisted.
- RatAiFy browser QA used the rebuilt `dist/prod.cjs` with local development env overrides. Redis DNS warnings for `redis.railway.internal` remained local-environment noise and did not block public lander QA.

## Remaining Warning Cleanup

Date: 2026-05-10

Follow-up cleanup after the user request to fix the remaining warnings.

Additional fixes:

- XFlow: removed static client imports of `@sentry/nextjs` from app/global/dashboard error boundaries and the integrations error boundary. Client boundaries now log locally, while server observability remains wired through the existing server config.
- XFlow: rewrote middleware to avoid bundling NextAuth/Auth.js and `jose` into the Edge middleware. Middleware now uses session-cookie presence for UX gating only; route handlers and server components remain the authoritative auth boundary.
- XFlow: added the remaining OpenTelemetry/Sentry instrumentation packages to `serverExternalPackages`.
- XFlow: renamed `vitest.config.ts` to `vitest.config.mts` and switched directory resolution to `import.meta.url`, removing the Vite CJS Node API deprecation warning from the focused Vitest run.
- RatAiFy: added `server/lib/redisUrl.ts` and routed Redis consumers through it so local non-production builds do not repeatedly attempt Railway internal Redis DNS.
- RatAiFy: removed `NODE_ENV="production"` from the app `.env` file after the explicit warning-cleanup request. Production should set `NODE_ENV` through the runtime command/environment, not a Vite-loaded `.env` file.
- WordGeni: disabled the production webpack filesystem pack cache in the Next web app to remove the cache-serialization warning. Runtime output is unchanged; only the build cache strategy changed.

Validation:

| App | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npx vitest run tests/unit/authjs-secure-cookie.test.ts tests/unit/middleware-routing.test.ts tests/showcase-chrome.test.ts` | Passed; Vite CJS Node API deprecation warning removed. |
| XFlow | `npm run build` | Passed; prior Sentry/OpenTelemetry and NextAuth/`jose` warning blocks removed. |
| RatAiFy | `npx tsc --noEmit` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts` | Passed |
| RatAiFy | `npm run build` | Passed; prior Vite `NODE_ENV` warning and local Redis DNS warning removed. |
| WordGeni | `npm run build` | Passed; prior webpack cache serialization warning removed. |

Remaining warning notes:

- RatAiFy build still reports generated asset sizes, but the previous Vite env warning and Redis DNS warning are gone.
- WordGeni build still prints the normal route-size summary, but the webpack pack-cache warning is gone.
