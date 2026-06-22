# Six-App CTA Routing Audit

Date: 2026-05-04

Scope:

- XFlow
- Verixet
- AudAiX
- RatAiFy
- WordGeni
- CreVux

Guardrails observed:

- No auth logic, billing logic, environment files, or `/ecosystem` video behavior was modified.
- No route restructure was made.
- No fake pricing, fake metrics, fake testimonials, fake logos, or unsupported claims were added.

## Audit Summary

The public landers had a consistent chrome and story structure, but several ecosystem dropdown/footer links still pointed at local development ports. Those are unsafe for production public landers because a user clicking across the ecosystem would leave the site for a localhost URL that only works on a developer machine.

Fixed route issues:

- Replaced localhost ecosystem links with canonical public domains:
  - `https://xflowx.com`
  - `https://verixet.com`
  - `https://audaix.com`
  - `https://rataify.com`
  - `https://wordgeni.com`
  - `https://crevux.com`
- Kept the current app's ecosystem link local to `/` so the current-app marker does not send users out and back.
- Corrected CreVux story sign-in from `/sign-in` to its real `/signin` route.
- Corrected CreVux story resources/security links from authenticated or mismatched paths to public `/docs` and `/security`.
- Corrected RatAiFy story feature/how-it-works links to public `/features` and `/how-it-works`.
- Corrected RatAiFy story primary CTA from demo browsing to `/auth/sign-up`, matching the app's public signup pattern for checking trust/risk.
- Corrected XFlow story prelude primary action from `/demo` to `/auth/sign-up`, matching the "connect your ecosystem" journey.

Focused tests were updated to prevent public chrome from reintroducing `localhost:` ecosystem links.

## App CTA Inventory

### XFlow

Main action:

- Start/connect the control plane.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary signup | `Sign up`, `Get started`, `Connect your ecosystem` | `/auth/sign-up` | Existing XFlow signup route |
| Secondary learn more | `View the dashboard demo`, `Demo`, `Walk the product` | `/demo` | Existing public demo route |
| Secondary learn more | `Explore capabilities`, `See capabilities` | `/capabilities` | Existing public capability route |
| Pricing | Starter and ecosystem plan cards | `/billing/checkout?...` | Existing checkout route; plan behavior stays tied to Verixet/XFlow billing implementation |
| Contact/support | `Book walkthrough`, sales/support mailto links | `mailto:` and `/contact` | Intentional sales/support journey |
| Docs/resources | `Docs`, `Resources`, `Architecture`, `Security` | `/docs`, `/architecture`, `/security` | Existing public routes |
| Dashboard | Footer dashboard | `/dashboard/overview` | Existing authenticated product surface |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- The primary product journey is now sign-up/connect in the story prelude and nav. Sales walkthrough remains a contact CTA, not the only path forward.

Pricing safety:

- Checkout links do not invent unsupported plan behavior; public copy already says checkout and entitlement authority route through Verixet.

### Verixet

Main action:

- Set up billing and governance.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary signup | `Get started`, `Set up Verixet governance`, `Continue` | `/auth/sign-up` or `/auth/start?returnTo=/dashboard` | Existing Verixet auth/start/signup pattern |
| Secondary learn more | `Review Verixet security`, `Security` | `/security` | Existing public route |
| Pricing | `Pricing` | `/pricing` | Existing public route |
| Docs/resources | `Docs`, `Resources`, `Learn` | `/docs`, `/learn` | Existing public routes |
| Dashboard | `Dashboard` | `/dashboard` | Existing authenticated dashboard |
| Contact/support | `Support`, `Contact`, mailto links | `/support`, `/contact`, `mailto:` | Existing public routes/contact aliases |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- Verixet's main signup/governance path is consistent with its authority role. Security review is the secondary trust path.

Pricing safety:

- Pricing links go to Verixet's public pricing route and do not imply unverified remote-app enforcement.

### AudAiX

Main action:

- Run an audit.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary dashboard/action | `Run an audit`, `Run an AudAiX audit` | `/dashboard` | Existing app route used by the current config |
| Primary signup | `Get started`, `Create account` | `/auth/sign-up?next=%2Fdashboard` | Existing signup-next pattern |
| Secondary learn more | `See audit checks`, `Features` | `/product` and `/features` alias to product route | Existing public route pattern |
| Pricing | `Review pricing`, `Pricing` | `/pricing` | Existing public route |
| Docs/resources | `Docs`, `Guides`, `Resources` | `/docs`, `/audit-engine` | Existing public routes |
| Contact/support | `Support`, `Contact` | `/support`, `/contact` | Existing public routes |
| Dashboard | `Dashboard` | `/dashboard` | Existing app route |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- The page keeps "Run an audit" as the main action. Signup-next remains available for users who need account creation first.

Pricing safety:

- Pricing CTAs point to the existing pricing route without inventing prices or cross-app plan behavior.

### RatAiFy

Main action:

- Check trust and risk.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary signup | `Get started`, `Check trust and risk` | `/auth/sign-up` | Existing RatAiFy signup route |
| Secondary learn more | `See risk tools`, `Features` | `/features` | Existing public route |
| Secondary sample | `Sample Scan`, `Demo` | `/demo` | Existing public route |
| Pricing | `Pricing` | `/pricing` | Existing public route |
| Docs/resources | `Docs`, `Resources`, `Guides` | `/docs`, `/compliance-insights` | Existing public routes |
| Contact/support | `Contact`, `Support` | `/contact`, `/support` | Existing public routes |
| Dashboard | `Dashboard` | `/dashboard` | Existing authenticated product surface |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- The story hero now routes "Check trust and risk" to signup instead of demo browsing, so the main conversion path is clearer. Sample Scan remains a secondary route.

Pricing safety:

- Pricing stays on the existing public pricing route and does not claim fully enforced cross-app pricing.

### WordGeni

Main action:

- Start a writing workspace.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary signup | `Get started`, `Start a writing workspace` | `/sign-up` | Existing WordGeni signup route |
| Secondary learn more | `See source workflow`, `Features` | `/features` | Existing public route |
| Pricing | `Pricing` | `/pricing` | Existing public route |
| Docs/resources | `Resources`, `Docs` | `/docs` | Fixed in story nav; existing public route |
| Security | `Security` | `/security` | Fixed in story nav; existing public route |
| Dashboard | Footer dashboard | `/dashboard` | Existing authenticated dashboard |
| Contact/support | `Support`, contact footer links | `/support`, `/contact` | Existing public routes |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- Signup/writing workspace is the clear main action. Feature/source workflow is secondary.

Pricing safety:

- Pricing routes are informational and do not invent plan behavior.

### CreVux

Main action:

- Open/create in the studio.

CTA categories:

| Category | CTA / link | Route | Status |
|---|---|---|---|
| Primary signup | `Get started`, `Open the creative studio` | `/register` | Existing CreVux registration route |
| Primary app/studio | `Studio`, `Open app` | `/app` | Existing signed-in app surface |
| Secondary learn more | `See generation workflows`, `Features` | `/features` | Existing public route |
| Pricing | `Pricing` | `/pricing` | Existing public route |
| Docs/resources | `Resources`, `Docs` | `/docs` | Fixed in story nav; existing public route |
| Security | `Security` | `/security` | Fixed in story nav; existing public route |
| Contact/support | `Support`, `Contact`, mailto buttons | `/support`, `/help`, `/contact`, `mailto:` | Existing public routes/contact aliases |
| Dashboard/billing | `Dashboard`, `Billing` | `/app`, `/app/upgrade` | Existing app and upgrade routes |
| Ecosystem cross-link | Six-app dropdown/footer links | Current app `/`; others canonical public domains | Fixed; no localhost |

Primary CTA competition:

- Registration and app-open paths align with CreVux's creative studio role. Docs/features remain secondary.

Pricing safety:

- Pricing links point to the existing public pricing route or app upgrade route and do not invent plan behavior.

## Remaining Intentional Placeholders

These routes are intentionally lightweight public pages or existing placeholder-style pages from the professional chrome pass:

- XFlow: `/features`, `/how-it-works`, `/security`, `/changelog`, `/faq`
- Verixet: `/how-it-works`, `/faq`
- AudAiX: `/features`, `/how-it-works`, `/faq`
- RatAiFy: `/features`, `/how-it-works`, `/docs`, `/changelog`, `/faq`
- WordGeni: `/features`, `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq`
- CreVux: `/how-it-works`, `/security`, `/docs`, `/changelog`, `/faq`, `/support`

These are acceptable because they load as intentional public pages and do not fake unavailable functionality.

## Validation Plan

Run:

- Typecheck all six apps.
- Build all six apps.
- Focused chrome tests for all six apps.
- Live browser smoke across all six landers and placeholder routes.
- CTA route smoke against local same-origin CTA hrefs where the route can be safely loaded without authenticating.

