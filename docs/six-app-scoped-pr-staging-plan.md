# Six-App Scoped PR Staging Plan

Date: 2026-05-05

Purpose: prepare a safe staging plan for a scoped PR containing only reviewed lander, chrome, public-route, blocker-fix, and documentation work.

This plan does **not** stage, reset, delete, or modify code.

## Final Recommendation

- Safe to stage: **Yes, with strict pathspecs and one patch-mode file.**
- Manual approvals needed: **Yes**, for ecosystem video/media files and unclear ecosystem showcase vendor output.
- Full dirty deploy safe: **No.**

Important repo layout note:

- `K:\XFlow-Ecosystem Workspace` is not a Git repo.
- Each app is its own Git repo:
  - `apps/XFlow`
  - `apps/Verixet`
  - `apps/AudAix`
  - `apps/RatAiFy`
  - `apps/WordGeni`
  - `apps/CreVux`
- Root docs in `K:\XFlow-Ecosystem Workspace\docs\...` cannot be staged with `git add` from the workspace root unless those docs are intentionally copied into a specific app repo or a separate docs repo. Do not move them without explicit approval.

## Safe Files To Stage

### XFlow

Safe files:

- `next.config.ts`
- `src/components/showcase/CommercialHomepage.tsx`
- `src/components/showcase/ShowcaseFooter.tsx`
- `src/components/showcase/ShowcaseNav.tsx`
- `src/components/showcase/ShowcasePlaceholderPage.tsx`
- `src/components/showcase/SixAppStoryPrelude.tsx`
- `src/components/showcase/XFlowPricingPageContent.tsx`
- `src/components/showcase/showcase-chrome.test.ts`
- `tests/showcase-chrome.test.ts`
- `src/app/(showcase)/changelog/`
- `src/app/(showcase)/faq/`
- `src/app/(showcase)/features/`
- `src/app/(showcase)/how-it-works/`
- `src/app/(showcase)/pricing/`
- `src/app/(showcase)/security/`

Exact staging command:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\XFlow"
git add -- next.config.ts `
  "src/components/showcase/CommercialHomepage.tsx" `
  "src/components/showcase/ShowcaseFooter.tsx" `
  "src/components/showcase/ShowcaseNav.tsx" `
  "src/components/showcase/ShowcasePlaceholderPage.tsx" `
  "src/components/showcase/SixAppStoryPrelude.tsx" `
  "src/components/showcase/XFlowPricingPageContent.tsx" `
  "src/components/showcase/showcase-chrome.test.ts" `
  "tests/showcase-chrome.test.ts" `
  "src/app/(showcase)/changelog" `
  "src/app/(showcase)/faq" `
  "src/app/(showcase)/features" `
  "src/app/(showcase)/how-it-works" `
  "src/app/(showcase)/pricing" `
  "src/app/(showcase)/security"
```

Do not stage XFlow package files, lockfiles, env examples, database files, auth files, dashboard files, middleware, ecosystem media, or generated output.

### Verixet

Safe files:

- `scripts/next-build.cjs`
- `src/pages/_document.tsx`
- `src/app/(marketing)/marketing.css`
- `src/app/(marketing)/pricing/page.tsx`
- `src/app/(marketing)/faq/`
- `src/app/(marketing)/how-it-works/`
- `src/app/dashboard/(main)/assistant/AssistantQueryPanel.tsx`
- `src/components/auth/DashboardAuthForm.tsx`
- `src/components/dashboard/DashboardShellNav.tsx`
- `src/components/dashboard/DashboardWelcomeModal.tsx`
- `src/components/dashboard/XFlowIssuesClient.tsx`
- `src/components/marketing/MarketingFooter.tsx`
- `src/components/marketing/MarketingHeader.tsx`
- `src/components/marketing/MarketingPlaceholderPage.tsx`
- `src/components/marketing/PricingPageContent.tsx`
- `src/components/marketing/PricingPageContent.test.tsx`
- `src/components/marketing/home/HomeDashboardShowcase.tsx`
- `src/components/marketing/home/HomeEcosystemShowcase.tsx`
- `src/components/marketing/home/HomePage.tsx`
- `src/components/marketing/home/HomeProfessionalStory.tsx`
- `src/components/marketing/marketing-chrome.test.ts`
- `src/components/marketing/pricing/PricingHeroAside.tsx`

Patch-mode file:

- `package.json`: stage only the reviewed `build` script change to `node scripts/next-build.cjs`. Do **not** stage unrelated script additions or dependency additions.

Exact staging commands:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\Verixet"
git add -- scripts/next-build.cjs `
  "src/pages/_document.tsx" `
  "src/app/(marketing)/marketing.css" `
  "src/app/(marketing)/pricing/page.tsx" `
  "src/app/(marketing)/faq" `
  "src/app/(marketing)/how-it-works" `
  "src/app/dashboard/(main)/assistant/AssistantQueryPanel.tsx" `
  "src/components/auth/DashboardAuthForm.tsx" `
  "src/components/dashboard/DashboardShellNav.tsx" `
  "src/components/dashboard/DashboardWelcomeModal.tsx" `
  "src/components/dashboard/XFlowIssuesClient.tsx" `
  "src/components/marketing/MarketingFooter.tsx" `
  "src/components/marketing/MarketingHeader.tsx" `
  "src/components/marketing/MarketingPlaceholderPage.tsx" `
  "src/components/marketing/PricingPageContent.tsx" `
  "src/components/marketing/PricingPageContent.test.tsx" `
  "src/components/marketing/home/HomeDashboardShowcase.tsx" `
  "src/components/marketing/home/HomeEcosystemShowcase.tsx" `
  "src/components/marketing/home/HomePage.tsx" `
  "src/components/marketing/home/HomeProfessionalStory.tsx" `
  "src/components/marketing/marketing-chrome.test.ts" `
  "src/components/marketing/pricing/PricingHeroAside.tsx"

git add -p -- package.json
```

During `git add -p -- package.json`, stage only the hunk that changes:

```json
"build": "node scripts/next-build.cjs"
```

Reject hunks for unrelated script additions, shared Supabase scripts, and dependency additions.

Do not stage `package-lock.json`.

### AudAiX

Safe files:

- `dashboard/src/App.tsx`
- `dashboard/src/pages/LandingPage.tsx`
- `dashboard/src/pages/PricingPage.tsx`
- `dashboard/src/pages/PricingPage.test.tsx`
- `dashboard/src/pages/FaqPage.tsx`
- `dashboard/src/pages/HowItWorksPage.tsx`
- `dashboard/src/pages/PublicPlaceholderPage.tsx`
- `dashboard/src/components/lander/`
- `dashboard/src/content/`
- `dashboard/src/styles.css`
- `dashboard/tsconfig.test.json`

Exact staging command:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\AudAix"
git add -- "dashboard/src/App.tsx" `
  "dashboard/src/pages/LandingPage.tsx" `
  "dashboard/src/pages/PricingPage.tsx" `
  "dashboard/src/pages/PricingPage.test.tsx" `
  "dashboard/src/pages/FaqPage.tsx" `
  "dashboard/src/pages/HowItWorksPage.tsx" `
  "dashboard/src/pages/PublicPlaceholderPage.tsx" `
  "dashboard/src/components/lander" `
  "dashboard/src/content" `
  "dashboard/src/styles.css" `
  "dashboard/tsconfig.test.json"
```

Do not stage AudAiX env, package, lockfile, backend, Sentry, billing usage, Supabase, JWT, readiness, or ecosystem media files.

### RatAiFy

Safe files:

- `client/src/App.tsx`
- `client/src/components/marketing/rataify/PricingSection.tsx`
- `client/src/components/marketing/rataify/RataifyFooter.tsx`
- `client/src/components/marketing/rataify/RataifyHeader.tsx`
- `client/src/components/marketing/rataify/rataify-chrome.test.ts`
- `client/src/components/marketing/trust/TrustEcosystemSection.tsx`
- `client/src/components/marketing/trust/TrustHomeSections.tsx`
- `client/src/components/marketing/trust/TrustProfessionalStory.tsx`
- `client/src/index.css`
- `client/src/pages/marketing/rataify/ChangelogPage.tsx`
- `client/src/pages/marketing/rataify/DocsPage.tsx`
- `client/src/pages/marketing/rataify/FaqPage.tsx`
- `client/src/pages/marketing/rataify/FeaturesPage.tsx`
- `client/src/pages/marketing/rataify/HowItWorksPage.tsx`
- `client/src/pages/marketing/rataify/PricingPage.tsx`
- `client/src/pages/marketing/rataify/PublicPlaceholderPage.tsx`
- `client/src/pages/status.tsx`
- `server/lib/rataify-chrome.test.ts`

Exact staging command:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\RatAiFy"
git add -- "client/src/App.tsx" `
  "client/src/components/marketing/rataify/PricingSection.tsx" `
  "client/src/components/marketing/rataify/RataifyFooter.tsx" `
  "client/src/components/marketing/rataify/RataifyHeader.tsx" `
  "client/src/components/marketing/rataify/rataify-chrome.test.ts" `
  "client/src/components/marketing/trust/TrustEcosystemSection.tsx" `
  "client/src/components/marketing/trust/TrustHomeSections.tsx" `
  "client/src/components/marketing/trust/TrustProfessionalStory.tsx" `
  "client/src/index.css" `
  "client/src/pages/marketing/rataify/ChangelogPage.tsx" `
  "client/src/pages/marketing/rataify/DocsPage.tsx" `
  "client/src/pages/marketing/rataify/FaqPage.tsx" `
  "client/src/pages/marketing/rataify/FeaturesPage.tsx" `
  "client/src/pages/marketing/rataify/HowItWorksPage.tsx" `
  "client/src/pages/marketing/rataify/PricingPage.tsx" `
  "client/src/pages/marketing/rataify/PublicPlaceholderPage.tsx" `
  "client/src/pages/status.tsx" `
  "server/lib/rataify-chrome.test.ts"
```

Do not stage RatAiFy env, package, lockfile, backend server, auth, database/Supabase, generated, duplicate tests, or ecosystem media files.

### WordGeni

Safe files:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/changelog/`
- `apps/web/src/app/docs/`
- `apps/web/src/app/faq/`
- `apps/web/src/app/features/`
- `apps/web/src/app/how-it-works/`
- `apps/web/src/app/pricing/`
- `apps/web/src/app/security/`
- `apps/web/src/components/contact/public-site-footer.tsx`
- `apps/web/src/components/contact/public-site-footer.test.ts`
- `apps/web/src/components/layout/PublicNavbar.tsx`
- `apps/web/src/components/layout/PublicNavbar.test.tsx`
- `apps/web/src/components/layout/public-navbar-static.test.ts`
- `apps/web/src/components/marketing/WordGeniProfessionalStory.tsx`
- `apps/web/src/components/marketing/public-placeholder-page.tsx`
- `apps/web/src/components/pricing/`
- `apps/web/src/context/ConditionalAuthProvider.tsx`
- `apps/web/src/lib/pricing-catalog.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/test-globals.d.ts`

Exact staging command:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\WordGeni"
git add -- "apps/web/src/app/layout.tsx" `
  "apps/web/src/app/page.tsx" `
  "apps/web/src/app/changelog" `
  "apps/web/src/app/docs" `
  "apps/web/src/app/faq" `
  "apps/web/src/app/features" `
  "apps/web/src/app/how-it-works" `
  "apps/web/src/app/pricing" `
  "apps/web/src/app/security" `
  "apps/web/src/components/contact/public-site-footer.tsx" `
  "apps/web/src/components/contact/public-site-footer.test.ts" `
  "apps/web/src/components/layout/PublicNavbar.tsx" `
  "apps/web/src/components/layout/PublicNavbar.test.tsx" `
  "apps/web/src/components/layout/public-navbar-static.test.ts" `
  "apps/web/src/components/marketing/WordGeniProfessionalStory.tsx" `
  "apps/web/src/components/marketing/public-placeholder-page.tsx" `
  "apps/web/src/components/pricing" `
  "apps/web/src/context/ConditionalAuthProvider.tsx" `
  "apps/web/src/lib/pricing-catalog.ts" `
  "apps/web/src/styles/globals.css" `
  "apps/web/src/test-globals.d.ts"
```

Do not stage WordGeni API, auth pages/components, middleware tests, Sentry/observability, mobile files, package files, lockfiles, generated outputs, or ecosystem media files.

### CreVux

Safe files:

- `artifacts/image-gen/src/App.tsx`
- `artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx`
- `artifacts/image-gen/src/components/landing/MarketingSiteChrome.test.ts`
- `artifacts/image-gen/src/components/landing/CrevuxProfessionalStory.tsx`
- `artifacts/image-gen/src/pages/landing.tsx`
- `artifacts/image-gen/src/pages/pricing.tsx`
- `artifacts/image-gen/src/pages/pricing.test.tsx`
- `artifacts/image-gen/src/pages/ChangelogPage.tsx`
- `artifacts/image-gen/src/pages/DocsPage.tsx`
- `artifacts/image-gen/src/pages/FaqPage.tsx`
- `artifacts/image-gen/src/pages/HowItWorksPage.tsx`
- `artifacts/image-gen/src/pages/PublicPlaceholderPage.tsx`
- `artifacts/image-gen/src/pages/SecurityPage.tsx`
- `artifacts/image-gen/src/styles/landing.css`

Exact staging command:

```powershell
Set-Location "K:\XFlow-Ecosystem Workspace\apps\CreVux"
git add -- "artifacts/image-gen/src/App.tsx" `
  "artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx" `
  "artifacts/image-gen/src/components/landing/MarketingSiteChrome.test.ts" `
  "artifacts/image-gen/src/components/landing/CrevuxProfessionalStory.tsx" `
  "artifacts/image-gen/src/pages/landing.tsx" `
  "artifacts/image-gen/src/pages/pricing.tsx" `
  "artifacts/image-gen/src/pages/pricing.test.tsx" `
  "artifacts/image-gen/src/pages/ChangelogPage.tsx" `
  "artifacts/image-gen/src/pages/DocsPage.tsx" `
  "artifacts/image-gen/src/pages/FaqPage.tsx" `
  "artifacts/image-gen/src/pages/HowItWorksPage.tsx" `
  "artifacts/image-gen/src/pages/PublicPlaceholderPage.tsx" `
  "artifacts/image-gen/src/pages/SecurityPage.tsx" `
  "artifacts/image-gen/src/styles/landing.css"
```

Do not stage CreVux API server, auth, billing, generated DB migrations/schema, package files, lockfiles, studio app feature files, generated output, or ecosystem media files.

## Files Requiring Manual Approval

These must not be staged unless explicitly approved:

- `apps/XFlow/public/ecosystem/ecosystem-showcase.mp4`
- `apps/XFlow/public/ecosystem/ecosystem-showcase.webm`
- `apps/XFlow/public/ecosystem/audaix/`
- `apps/XFlow/public/ecosystem/crevux/`
- `apps/XFlow/public/ecosystem/rataify/`
- `apps/XFlow/public/ecosystem/verixet/`
- `apps/XFlow/public/ecosystem/wordgeni/`
- `apps/XFlow/public/ecosystem/xflow/`
- `apps/XFlow/vendor/ecosystem-showcase/dist/index.js`
- `apps/Verixet/public/ecosystem/ecosystem-showcase.mp4`
- `apps/Verixet/public/ecosystem/ecosystem-showcase.webm`
- `apps/Verixet/public/ecosystem/audaix/`
- `apps/Verixet/public/ecosystem/crevux/`
- `apps/Verixet/public/ecosystem/rataify/`
- `apps/Verixet/public/ecosystem/wordgeni/`
- `apps/Verixet/public/ecosystem/xflow/`
- `apps/AudAix/dashboard/public/ecosystem/audaix/`
- `apps/AudAix/dashboard/public/ecosystem/crevux/`
- `apps/AudAix/dashboard/public/ecosystem/rataify/`
- `apps/AudAix/dashboard/public/ecosystem/verixet/`
- `apps/AudAix/dashboard/public/ecosystem/wordgeni/`
- `apps/AudAix/dashboard/public/ecosystem/xflow/`
- `apps/RatAiFy/client/public/ecosystem/audaix/`
- `apps/RatAiFy/client/public/ecosystem/crevux/`
- `apps/RatAiFy/client/public/ecosystem/rataify/`
- `apps/RatAiFy/client/public/ecosystem/verixet/`
- `apps/RatAiFy/client/public/ecosystem/wordgeni/`
- `apps/RatAiFy/client/public/ecosystem/xflow/`
- `apps/WordGeni/apps/web/public/ecosystem/audaix/`
- `apps/WordGeni/apps/web/public/ecosystem/crevux/`
- `apps/WordGeni/apps/web/public/ecosystem/rataify/`
- `apps/WordGeni/apps/web/public/ecosystem/verixet/`
- `apps/WordGeni/apps/web/public/ecosystem/wordgeni/`
- `apps/WordGeni/apps/web/public/ecosystem/xflow/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/audaix/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/crevux/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/rataify/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/verixet/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/wordgeni/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/xflow/`

## Files To Exclude

Do not stage these categories:

- Any `.env`, `.env.*`, `.env.example`, or env-validation/config files unless separately reviewed.
- Any `package-lock.json`, `pnpm-lock.yaml`, or package files not listed above as safe and patch-mode.
- Any database migration, drizzle metadata, DB schema, Supabase schema, or generated DB output.
- Any auth API, auth component, OAuth, Turnstile, middleware, server-auth, session, or protected-route logic outside the specific reviewed WordGeni `ConditionalAuthProvider` and Verixet nullable hook fixes.
- Any billing, Stripe, entitlement, pricing-catalog backend, usage-ingest, checkout, webhook, or plan-enforcement logic.
- Any unrelated backend server files, queues, cache, Redis, storage, job workers, scanner, readiness, API routes, or export/generation services.
- Any generated output: `.next`, `dist`, `output`, screenshots, Playwright artifacts, `apps/api/dist`, `apps/worker/dist`, and screenshot JSON summaries.
- Any ecosystem video/media asset unless explicitly approved.
- Any mobile/Android files.
- Any observability/Sentry/instrumentation changes outside already reviewed public build blockers.

## Post-Staging Verification Commands

Run these commands after staging each app repo.

### Generic staged diff checks

```powershell
git diff --cached --name-only
git diff --cached --stat
```

### Confirm no ecosystem media assets are staged

```powershell
git diff --cached --name-only | Select-String -Pattern '(^|/)public/ecosystem/|ecosystem-showcase\.(mp4|webm)$|vendor/ecosystem-showcase/dist' -CaseSensitive
```

Expected result: no output.

### Confirm no env files are staged

```powershell
git diff --cached --name-only | Select-String -Pattern '(^|/)\.env(\.|$)|\.env\.example$|envValidation|environment\.ts|src/env\.ts|shared-supabase-schema-env' -CaseSensitive
```

Expected result: no output.

### Confirm no database files are staged

```powershell
git diff --cached --name-only | Select-String -Pattern '(^|/)drizzle/|(^|/)migrations/|schema\.ts$|supabase/' -CaseSensitive
```

Expected result: no output.

### Confirm no unrelated backend/auth/billing files are staged

```powershell
git diff --cached --name-only | Select-String -Pattern '(^|/)api/auth/|(^|/)auth/|middleware|billing|stripe|entitlement|usage-ingest|webhook|server/services|server/storage|redis|githubAuth|artifacts/api-server/src' -CaseSensitive
```

Expected result: no output, except reviewed Verixet nullable hook files under `src/components/auth/DashboardAuthForm.tsx` may appear because that specific file is included for a build nullability fix.

### Check staged files for localhost links

```powershell
git diff --cached -U0 | Select-String -Pattern 'localhost:|127\.0\.0\.1|0\.0\.0\.0'
```

Expected result: no output, except test assertions that explicitly check `not.toContain("localhost:")` are acceptable.

### Check staged files for fake uptime percentages

```powershell
git diff --cached -U0 | Select-String -Pattern '\b\d+(?:\.\d+)?%\b|uptime'
```

Expected result: no hard-coded public uptime percentages. RatAiFy status may include honest wording such as `No uptime percentage is shown until it is backed by monitored data.`

### Confirm staged paths match this plan

```powershell
git diff --cached --name-only | Sort-Object
```

Compare output against the app's safe files list above. Anything outside the safe files list must be unstaged before opening the PR.

## Final Staging Safety Call

- Safe to stage: **Yes**, using only the exact commands above.
- Manual approvals needed: **Yes**, for ecosystem media/video assets and `vendor/ecosystem-showcase/dist/index.js`.
- Full dirty deploy safe: **No**.
- Do not run `git add .`.
- Do not stage root docs from the workspace root because the root is not a Git repo.

