# Six-App Lander Redesign Audit

## Scope

Apps audited:

- XFlow
- Verixet
- AudAiX
- RatAiFy
- WordGeni
- CreVux

Hard guardrail: the existing `/ecosystem` routes, ecosystem showcase components, video assets, and current video placement behavior must remain untouched.

## Current Lander Entrypoints

| App | Current public lander entrypoint | Notes |
|---|---|---|
| XFlow | `apps/XFlow/src/app/(showcase)/page.tsx`, `apps/XFlow/src/components/showcase/CommercialHomepage.tsx` | Next showcase page with a large custom commercial homepage. |
| Verixet | `apps/Verixet/src/app/(marketing)/page.tsx`, `apps/Verixet/src/components/marketing/home/HomePage.tsx` | Next marketing page with many home sections and strict CSP requirements. |
| AudAiX | `apps/AudAix/dashboard/src/pages/LandingPage.tsx` | Vite/React marketing route with plain CSS in `styles.css`. |
| RatAiFy | `apps/RatAiFy/client/src/pages/marketing/rataify/HomePage.tsx`, `apps/RatAiFy/client/src/components/marketing/trust/TrustHomeSections.tsx` | React marketing page composed from trust sections. |
| WordGeni | `apps/WordGeni/apps/web/src/app/page.tsx` | Next public home page with breadcrumbs, motion, ecosystem showcase, and SEO metadata. |
| CreVux | `apps/CreVux/artifacts/image-gen/src/pages/landing.tsx` | Vite/React landing route with `LandingElite*` components and `landing.css`. |

## Ecosystem Video Usage To Preserve

| App | Current usage |
|---|---|
| XFlow | `apps/XFlow/src/components/showcase/CommercialHomepage.tsx` uses `/ecosystem/ecosystem-showcase.webm` and `/ecosystem/ecosystem-showcase.mp4`. |
| Verixet | `apps/Verixet/src/components/marketing/home/HomeEcosystemShowcase.tsx` uses `/ecosystem/ecosystem-showcase.webm` and `/ecosystem/ecosystem-showcase.mp4`. |
| AudAiX | `apps/AudAix/dashboard/src/pages/LandingPage.tsx` renders `EcosystemShowcaseSection currentApp="audaix"` with `/ecosystem/ecosystem-showcase.mp4`. |
| RatAiFy | `apps/RatAiFy/client/src/components/marketing/trust/TrustHomeSections.tsx` renders `EcosystemShowcaseSection currentApp="rataify"` with `/ecosystem/ecosystem-showcase.mp4`. |
| WordGeni | `apps/WordGeni/apps/web/src/app/page.tsx` renders `EcosystemShowcaseSection currentApp="wordgeni"` with `/ecosystem/ecosystem-showcase.mp4`. |
| CreVux | `apps/CreVux/artifacts/image-gen/src/pages/landing.tsx` renders `EcosystemShowcaseSection currentApp="crevux"` with `/ecosystem/ecosystem-showcase.mp4`. |

## Nav, Breadcrumb, Footer, SEO Gaps

| App | Current state | Gaps |
|---|---|---|
| XFlow | Showcase nav exists in the commercial page/layout; metadata exists in page route. | Needs consistent ecosystem dropdown, current-app marker, full footer columns, professional breadcrumbs, and a visible "What this app does" block. |
| Verixet | Marketing layout/nav exists and home has JSON-LD. | Needs stronger six-app language, current-app ecosystem dropdown, full footer structure, breadcrumbs on home, and CSP-safe story shell styles. |
| AudAiX | Marketing pages and breadcrumb component exist elsewhere; landing has no full professional nav/footer. | Needs story shell, breadcrumbs, app-specific security proof, ecosystem dropdown, structured SEO data, and full footer. |
| RatAiFy | Marketing layout exists, FAQ/organization schema exists, route breadcrumbs exist in `client/src/lib/breadcrumbs.ts`. | Needs consistent story chapters, professional ecosystem dropdown, claims-softened cross-app copy, full footer, and visible security proof. |
| WordGeni | Breadcrumbs, metadata, JSON-LD, motion, and footer already exist. | Needs shared ecosystem dropdown/current-app marker, no mojibake emoji artifacts, stronger app-specific trust story, and footer alignment. |
| CreVux | Marketing chrome, landing CSS, pricing page, FAQ data, and motion exist. | Needs breadcrumbs, fuller footer, ecosystem dropdown/current-app marker, explicit security/trust proof, and SEO/AIO structure. |

## Required Route Audit

Routes to confirm per app:

- `/`
- `/pricing`
- `/features`
- `/how-it-works`
- `/security`
- `/privacy`
- `/terms`
- `/contact`
- `/support`
- `/status`
- `/docs` or `/resources`
- `/changelog`
- `/faq`
- `/auth/sign-in`
- `/auth/sign-up`
- `/dashboard`

Safe placeholder rule: create lightweight professional public placeholders only when the app's routing convention is clear and the page will not imply unavailable functionality.

## Brand Identity Gaps

- XFlow should feel like a command center: electric blue, cyan, deep navy, app maps, event streams, workspace cards.
- Verixet should feel governance-grade: violet, indigo, dark slate, gold accents, entitlement cards, billing rules, compliance panels.
- AudAiX should feel like an inspection cockpit: teal, green, amber, black, audit cards, score panels, route maps.
- RatAiFy should feel like a risk radar: red, orange, purple, dark gray, policy cards, risk meters, radar rings.
- WordGeni should feel like a premium writing studio: emerald, blue, parchment, dark ink, source chips, document cards, memory graph.
- CreVux should feel like a creative production lab: magenta, neon purple, cyan, black, render queues, asset gallery, media cards.

## Accessibility And Mobile Risks

- Avoid horizontal overflow on every public lander.
- Add reduced-motion behavior for scroll animations and animated decorative effects.
- Ensure mobile drawer controls are keyboard reachable and focusable.
- Keep hero type responsive without viewport-width font scaling.
- Keep footer columns readable and collapse to clean mobile sections where needed.
- Verixet must avoid inline style-heavy marketing widgets because CSP is strict.

## Recommended Implementation Order

1. Claims ledger and audit docs.
2. Shared lander shell/components/config.
3. XFlow lander first to define ecosystem language.
4. Verixet second to define governance/trust language.
5. AudAiX, RatAiFy, WordGeni, and CreVux in that order.
6. Nav/footer consistency pass.
7. SEO/AIO/schema pass.
8. Safe missing-page placeholders.
9. Responsive/browser proof.
