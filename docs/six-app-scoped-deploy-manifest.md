# Six-App Scoped Deploy Manifest

Date: 2026-05-05

Purpose: prepare a safe scoped changeset/PR containing only reviewed public lander, public chrome, blocker-fix, and documentation work. This manifest does not stage, reset, delete, or modify code.

Final deploy recommendation:

- **Safe scoped PR possible** if it includes only the `include` files below and excludes/defers all other dirty files.
- **Unsafe full deploy** from the current dirty app worktrees because unrelated auth, billing, env-example, database, backend, generated, and media changes would ship.
- **Manual approval required** for all ecosystem video/media files and folders before they can be included.

Classification key:

- **include**: reviewed public lander/chrome/public-route/proof-doc/blocker-fix work.
- **exclude**: unrelated auth, billing, env, database, backend, generated output, mobile, observability, or app functionality work.
- **needs approval**: ecosystem video/media assets or unclear ecosystem media folders covered by the `/ecosystem` asset guardrail.

## Root Workspace Docs

### Include

| File | Reason |
|---|---|
| `docs/marketing-claims-ledger.md` | Reviewed source-of-truth claims ledger for public lander copy. |
| `docs/six-app-lander-redesign-audit.md` | Reviewed audit doc for the lander system. |
| `docs/six-app-lander-redesign-proof.md` | Reviewed proof doc updated through blocker and deployment review passes. |
| `docs/six-app-cta-routing-audit.md` | Reviewed CTA routing audit doc. |
| `docs/six-app-product-visual-proof.md` | Reviewed product visual proof doc. |
| `docs/six-app-public-launch-checklist.md` | Reviewed launch readiness checklist. |
| `docs/verixet-production-env-missing-audit.md` | Reviewed Verixet production env blocker audit. |
| `docs/six-app-deployment-diff-review.md` | Reviewed deployment diff review doc. |
| `docs/six-app-scoped-deploy-manifest.md` | This scoped deployment manifest. |

## XFlow

### Include

| File | Reason |
|---|---|
| `next.config.ts` | Reviewed blocker fix; Sentry wrapper only applies when Sentry org/project are configured. |
| `src/components/showcase/CommercialHomepage.tsx` | Reviewed public lander story/product visual work; keep only code changes, not media assets. |
| `src/components/showcase/ShowcaseFooter.tsx` | Reviewed public footer/chrome work. |
| `src/components/showcase/ShowcaseNav.tsx` | Reviewed public nav/chrome work. |
| `src/components/showcase/ShowcasePlaceholderPage.tsx` | Reviewed public placeholder page component. |
| `src/components/showcase/SixAppStoryPrelude.tsx` | Reviewed public story-scroll lander section. |
| `src/components/showcase/XFlowPricingPageContent.tsx` | Reviewed public pricing/onboarding clarity surface. |
| `src/components/showcase/showcase-chrome.test.ts` | Reviewed focused chrome test. |
| `tests/showcase-chrome.test.ts` | Reviewed focused chrome test used in validation. |
| `src/app/(showcase)/changelog/` | Reviewed public placeholder route. |
| `src/app/(showcase)/faq/` | Reviewed public placeholder route. |
| `src/app/(showcase)/features/` | Reviewed public placeholder route. |
| `src/app/(showcase)/how-it-works/` | Reviewed public placeholder route. |
| `src/app/(showcase)/pricing/` | Reviewed public pricing route. |
| `src/app/(showcase)/security/` | Reviewed public placeholder route. |

### Needs Approval

| File | Reason |
|---|---|
| `public/ecosystem/ecosystem-showcase.mp4` | Modified ecosystem video asset; guardrail requires explicit approval. |
| `public/ecosystem/ecosystem-showcase.webm` | Untracked ecosystem video asset; guardrail requires explicit approval. |
| `public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/verixet/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `vendor/ecosystem-showcase/dist/index.js` | Ecosystem showcase vendor output; unclear generated/media-adjacent artifact, requires explicit approval or exclusion. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped lander/blocker work. |
| `docs/operations/WINDOWS_NEXT_BUILD_SYMLINKS.md` | Operations doc outside reviewed deploy scope. |
| `docs/auth/` | Auth documentation outside reviewed deploy scope. |
| `docs/operations/oauth-rataify-client.md` | OAuth documentation outside reviewed deploy scope. |
| `drizzle/migrations/meta/_journal.json` | Database migration metadata; excluded. |
| `drizzle/schema/identity.ts` | Database/auth schema; excluded. |
| `drizzle/migrations/0045_central_google_auth_handoff.sql` | Database/auth migration; excluded. |
| `package.json` | Contains unrelated package/script changes outside scoped review. |
| `package-lock.json` | Lockfile tied to unrelated package changes; excluded. |
| `scripts/next-build.cjs` | Build script change not part of reviewed XFlow blocker fix. |
| `scripts/run-release-smoke.ts` | Release smoke script outside reviewed deploy scope. |
| `scripts/audit-railway-auth-env.ts` | Auth/env script outside reviewed deploy scope. |
| `scripts/railway-central-auth-config.ts` | Auth/env script outside reviewed deploy scope. |
| `scripts/seed-rataify-oauth-client.ts` | OAuth seed script outside reviewed deploy scope. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script outside reviewed deploy scope. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script outside reviewed deploy scope. |
| `scripts/verify-railway-central-auth.ts` | Auth/env verification script outside reviewed deploy scope. |
| `scripts/verify-rataify-oauth-client.ts` | OAuth verification script outside reviewed deploy scope. |
| `src/app/(auth)/sign-up/SignUpClient.tsx` | Auth UI change outside scoped review. |
| `src/app/(dashboard)/ecosystem/page.tsx` | Dashboard ecosystem route outside public lander scope. |
| `src/app/(dashboard)/overview/page.tsx` | Dashboard route outside public lander scope. |
| `src/app/(dashboard)/slack/page.tsx` | Deleted dashboard route outside public lander scope. |
| `src/app/api/auth/signup/start/route.ts` | Auth API route; excluded. |
| `src/app/api/auth/google/` | Auth API routes; excluded. |
| `src/app/api/auth/handoff/` | Auth API routes; excluded. |
| `src/app/auth/start/google/` | Auth route; excluded. |
| `src/app/globals.css` | Global styling not isolated to reviewed public lander files. |
| `src/components/auth/TurnstileField.tsx` | Auth/security component; excluded. |
| `src/components/dashboard/mission-control/` | Dashboard feature work; excluded. |
| `src/components/ecosystem/UserEcosystemStatusPage.tsx` | Dashboard/ecosystem behavior outside scoped public lander work. |
| `src/components/layout/DashboardShell.tsx` | Dashboard shell; excluded. |
| `src/components/layout/MobileNav.tsx` | App navigation outside public lander scope. |
| `src/components/layout/SidebarNav.tsx` | App navigation outside public lander scope. |
| `src/components/layout/nav-icons.ts` | App navigation support outside public lander scope. |
| `src/components/ucl/UclDashboardView.tsx` | Dashboard/UCL behavior; excluded. |
| `src/content/showcase-home.ts` | Existing showcase content change unclear; exclude unless separately reviewed. |
| `src/core/auth/` | Auth core; excluded. |
| `src/design-system/bundles/dash_slack_page.classes.ts` | Deleted generated design-system file outside scoped review. |
| `src/lib/audit/log.ts` | Audit backend logic; excluded. |
| `src/lib/auth/api-route-auth-matrix.ts` | Auth matrix; excluded. |
| `src/lib/auth/middleware-routing.ts` | Auth/middleware logic; excluded. |
| `src/lib/auth/page-route-auth-matrix.ts` | Auth matrix; excluded. |
| `src/lib/billing/canonical-catalog.ts` | Billing/catalog logic; excluded. |
| `src/lib/dashboard/mission-control-view.ts` | Dashboard feature logic; excluded. |
| `src/lib/ecosystem/apps.ts` | Ecosystem app catalog outside scoped public lander review. |
| `src/lib/ecosystem/central-auth-apps.ts` | Auth/ecosystem logic; excluded. |
| `src/lib/ecosystem/central-auth-state.ts` | Auth/ecosystem logic; excluded. |
| `src/lib/ecosystem/verixet-handoff.ts` | Auth/billing handoff logic; excluded. |
| `src/lib/env-doctor/contracts/apps.ts` | Env-doctor contracts; excluded. |
| `src/lib/integrity/route-manifest.ts` | Route integrity logic outside scoped review. |
| `src/lib/navigation/app-nav.ts` | App navigation outside public lander scope. |
| `src/lib/navigation/dashboard-page-label.ts` | Dashboard navigation; excluded. |
| `src/lib/navigation/main-nav.ts` | App navigation outside scoped public chrome. |
| `src/lib/pricing/` | Pricing logic; excluded. |
| `src/lib/rataify/` | RatAiFy integration/auth logic; excluded. |
| `src/lib/supabase/` | Supabase/auth logic; excluded. |
| `src/lib/verixet/xflow-entitlements.ts` | Entitlement logic; excluded. |
| `src/lib/workspaces/get-active-workspace.ts` | Workspace/auth logic; excluded. |
| `src/middleware.ts` | Middleware/auth logic; excluded. |
| `tests/integration/apps-operator-step-up-actions.test.ts` | Auth/security test outside scoped review. |
| `tests/supabase/` | Supabase/auth tests; excluded. |
| `tests/unit/*` except `tests/showcase-chrome.test.ts` | Unit tests for unrelated auth/dashboard/billing/ecosystem work; excluded. |
| `output/playwright/*.png` | Generated QA artifacts; excluded from deploy PR. |

## Verixet

### Include

| File | Reason |
|---|---|
| `package.json` | Include only the reviewed `build` script change to `node scripts/next-build.cjs`; exclude unrelated scripts/dependency additions. |
| `scripts/next-build.cjs` | Reviewed blocker fix for deterministic Windows `.next` cleanup before build. |
| `src/pages/_document.tsx` | Reviewed minimal Next document module blocker fix. |
| `src/app/(marketing)/marketing.css` | Reviewed public chrome/visual overflow fixes. |
| `src/app/(marketing)/pricing/page.tsx` | Reviewed public pricing/signup clarity pass. |
| `src/app/(marketing)/faq/` | Reviewed public placeholder route. |
| `src/app/(marketing)/how-it-works/` | Reviewed public placeholder route. |
| `src/app/dashboard/(main)/assistant/AssistantQueryPanel.tsx` | Reviewed narrow nullable `useSearchParams` build fix. |
| `src/components/auth/DashboardAuthForm.tsx` | Reviewed narrow nullable `useSearchParams` build fix. |
| `src/components/dashboard/DashboardShellNav.tsx` | Reviewed narrow nullable `usePathname` build fix. |
| `src/components/dashboard/DashboardWelcomeModal.tsx` | Reviewed narrow nullable `usePathname` build fix. |
| `src/components/dashboard/XFlowIssuesClient.tsx` | Reviewed narrow nullable `useSearchParams` build fix. |
| `src/components/marketing/MarketingFooter.tsx` | Reviewed public footer/chrome work. |
| `src/components/marketing/MarketingHeader.tsx` | Reviewed public nav/chrome and nullable `usePathname` fix. |
| `src/components/marketing/MarketingPlaceholderPage.tsx` | Reviewed public placeholder component. |
| `src/components/marketing/PricingPageContent.tsx` | Reviewed pricing/signup clarity pass. |
| `src/components/marketing/PricingPageContent.test.tsx` | Reviewed pricing/chrome test. |
| `src/components/marketing/home/HomeDashboardShowcase.tsx` | Reviewed product visual proof label changes. |
| `src/components/marketing/home/HomeEcosystemShowcase.tsx` | Reviewed public ecosystem reference component, no asset inclusion. |
| `src/components/marketing/home/HomePage.tsx` | Reviewed public home lander composition. |
| `src/components/marketing/home/HomeProfessionalStory.tsx` | Reviewed public story-scroll lander content. |
| `src/components/marketing/marketing-chrome.test.ts` | Reviewed focused chrome test. |
| `src/components/marketing/pricing/PricingHeroAside.tsx` | Reviewed pricing/signup clarity pass. |

### Needs Approval

| File | Reason |
|---|---|
| `public/ecosystem/ecosystem-showcase.mp4` | Modified ecosystem video asset; guardrail requires explicit approval. |
| `public/ecosystem/ecosystem-showcase.webm` | Untracked ecosystem video asset; guardrail requires explicit approval. |
| `public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped review. |
| `artifacts/phase-11-screenshots/hero-summary.json` | Generated artifact; excluded. |
| `artifacts/phase-11-screenshots/summary.json` | Generated artifact; excluded. |
| `artifacts/billing/` | Billing generated artifacts; excluded. |
| `docs/OPERATOR_EXTERNAL_SERVICES_SETUP.md` | Ops doc outside scoped review. |
| `docs/UNIVERSAL_AUTH_CONSENT_BILLING_SETUP.md` | Auth/billing doc outside scoped review. |
| `docs/billing/` | Billing documentation outside scoped review. |
| `docs/shared-supabase-local-migration.md` | Supabase/auth doc outside scoped review. |
| `docs/shared-supabase-schema-repair.md` | Supabase/auth doc outside scoped review. |
| `output/dev/` | Generated local output; excluded. |
| `output/playwright/verixet-lander-ecosystem-3102.png` | Generated QA artifact; excluded. |
| `package-lock.json` | Lockfile includes unrelated dependency changes; exclude unless package scoped patch is manually isolated. |
| `scripts/access-billing-control-http-validate.ts` | Billing/control validation script; excluded. |
| `scripts/repair-shared-supabase-schema.ts` | Supabase/schema script; excluded. |
| `scripts/shared-supabase-schema-env.ts` | Env/Supabase script; excluded. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script; excluded. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script; excluded. |
| `scripts/verify-shared-supabase-schema.ts` | Supabase/schema script; excluded. |
| `src/app/api/auth/*` | Auth API route changes; excluded. |
| `src/app/api/v1/usage/report/route.ts` | Usage/billing API route; excluded. |
| `src/components/auth/SignInForm.tsx` | Auth form change; excluded. |
| `src/components/auth/SignUpForm.tsx` | Auth form change; excluded. |
| `src/lib/access-billing-control/*` | Billing/control service changes; excluded. |
| `src/lib/auth/turnstile*` | Auth/Turnstile logic and tests; excluded. |
| `src/lib/billing/*` | Billing/catalog/test changes; excluded. |
| `src/lib/ecosystem/entitlements.ts` | Entitlement logic; excluded. |
| `src/lib/shared-supabase-schema-env.test.ts` | Supabase/env test; excluded. |
| `src/lib/supabase/` | Supabase/auth code; excluded. |

## AudAiX

### Include

| File | Reason |
|---|---|
| `dashboard/src/App.tsx` | Reviewed public route wiring for lander/placeholders. |
| `dashboard/src/pages/LandingPage.tsx` | Reviewed public lander composition. |
| `dashboard/src/pages/PricingPage.tsx` | Reviewed pricing/signup clarity pass. |
| `dashboard/src/pages/PricingPage.test.tsx` | Reviewed pricing/page test. |
| `dashboard/src/pages/FaqPage.tsx` | Reviewed public placeholder/FAQ route. |
| `dashboard/src/pages/HowItWorksPage.tsx` | Reviewed public placeholder route. |
| `dashboard/src/pages/PublicPlaceholderPage.tsx` | Reviewed placeholder page component. |
| `dashboard/src/components/lander/` | Reviewed shared story lander shell/components/tests. |
| `dashboard/src/content/` | Reviewed typed AudAiX lander config. |
| `dashboard/src/styles.css` | Reviewed lander/chrome visual polish and responsive styling. |
| `dashboard/tsconfig.test.json` | Test config needed by reviewed focused tests. |

### Needs Approval

| File | Reason |
|---|---|
| `dashboard/public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `dashboard/public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `dashboard/public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `dashboard/public/ecosystem/verixet/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `dashboard/public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `dashboard/public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped review. |
| `dashboard/src/lib/sentry.tsx` | Observability logic; excluded. |
| `package.json` | Package changes outside scoped review unless manually isolated to test tooling. |
| `package-lock.json` | Lockfile tied to unrelated package changes; excluded. |
| `scripts/verify-production-audaix.mjs` | Production verification script outside scoped review. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script; excluded. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script; excluded. |
| `src/auth/jwt.ts` | Auth logic; excluded. |
| `src/env.ts` | Env validation/runtime config; excluded. |
| `src/lib/billing/verixet-usage.ts` | Billing/usage logic; excluded. |
| `src/readiness.ts` | Backend readiness logic; excluded. |
| `src/repositories/audit-execution-backend.ts` | Backend audit execution logic; excluded. |
| `src/smoke-supabase-schedules.ts` | Supabase smoke logic; excluded. |
| `src/supabase/` | Supabase/auth code; excluded. |
| `tests/verixet-usage.test.ts` | Billing/usage test; excluded. |
| `tests/audaix-shared-supabase-local.test.ts` | Supabase/auth test; excluded. |
| `tests/audaix-shared-supabase-runtime.test.ts` | Supabase/auth test; excluded. |
| `tsconfig.json` | Root TS config change unclear/outside scoped lander review. |
| `vitest.config.ts` | Test config change unclear/outside scoped lander review. |

## RatAiFy

### Include

| File | Reason |
|---|---|
| `client/src/App.tsx` | Reviewed public route wiring for lander/placeholders/status. |
| `client/src/components/marketing/rataify/PricingSection.tsx` | Reviewed pricing/signup clarity pass. |
| `client/src/components/marketing/rataify/RataifyFooter.tsx` | Reviewed public footer/chrome work. |
| `client/src/components/marketing/rataify/RataifyHeader.tsx` | Reviewed public nav/chrome work. |
| `client/src/components/marketing/rataify/rataify-chrome.test.ts` | Reviewed focused chrome test. |
| `client/src/components/marketing/trust/TrustEcosystemSection.tsx` | Reviewed public ecosystem bridge copy/link work. |
| `client/src/components/marketing/trust/TrustHomeSections.tsx` | Reviewed public lander composition. |
| `client/src/components/marketing/trust/TrustProfessionalStory.tsx` | Reviewed public story-scroll/product visual proof work. |
| `client/src/index.css` | Reviewed public lander visual polish and responsive styling. |
| `client/src/pages/marketing/rataify/ChangelogPage.tsx` | Reviewed public placeholder route. |
| `client/src/pages/marketing/rataify/DocsPage.tsx` | Reviewed public placeholder route. |
| `client/src/pages/marketing/rataify/FaqPage.tsx` | Reviewed public placeholder route. |
| `client/src/pages/marketing/rataify/FeaturesPage.tsx` | Reviewed public placeholder route. |
| `client/src/pages/marketing/rataify/HowItWorksPage.tsx` | Reviewed public placeholder route. |
| `client/src/pages/marketing/rataify/PricingPage.tsx` | Reviewed pricing/signup clarity pass. |
| `client/src/pages/marketing/rataify/PublicPlaceholderPage.tsx` | Reviewed placeholder component. |
| `client/src/pages/status.tsx` | Reviewed blocker fix removing fake uptime. |
| `server/lib/rataify-chrome.test.ts` | Reviewed focused chrome/status regression test. |

### Needs Approval

| File | Reason |
|---|---|
| `client/public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `client/public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `client/public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `client/public/ecosystem/verixet/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `client/public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `client/public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped review. |
| `README.md` | General doc outside scoped deploy review. |
| `__tests__/rataify-chrome.test.ts` | Duplicate/unclear test outside reviewed canonical test path. |
| `c.end())` | Stray untracked file; exclude. |
| `check-tables.cjs` | Database/schema utility; excluded. |
| `client/src/pages/login.tsx` | Auth/login UI; excluded. |
| `docs/shared-supabase-schema-repair.md` | Supabase/schema doc; excluded. |
| `package.json` | Package changes outside scoped review unless manually isolated. |
| `package-lock.json` | Lockfile tied to unrelated package changes; excluded. |
| `scripts/repair-shared-supabase-schema.ts` | Supabase/schema script; excluded. |
| `scripts/shared-supabase-schema-env.ts` | Env/Supabase script; excluded. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script; excluded. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script; excluded. |
| `scripts/verify-shared-supabase-schema.ts` | Supabase/schema script; excluded. |
| `server/config/environment.ts` | Env/runtime config; excluded. |
| `server/githubAuth.ts` | Auth logic; excluded. |
| `server/index.ts` | Backend server entry; excluded. |
| `server/lib/cache.ts` | Backend cache logic; excluded. |
| `server/lib/envValidation.ts` | Env validation; excluded. |
| `server/lib/scannerValidation.ts` | Backend scanner validation; excluded. |
| `server/lib/ecosystemAuthMode.ts` | Auth/ecosystem mode logic; excluded. |
| `server/lib/supabase/` | Supabase/auth code; excluded. |
| `server/load-local-env.cjs` | Env loading script; excluded. |
| `server/prod.ts` | Backend production entry; excluded. |
| `server/redis.ts` | Backend Redis config; excluded. |
| `server/services/*` | Backend job/storage/ecosystem services; excluded. |
| `server/storage.ts` | Backend storage logic; excluded. |
| `server/supabase/` | Supabase/schema files; excluded. |
| `tests/*` except reviewed chrome test | Billing/env/auth/backend tests; excluded. |

## WordGeni

### Include

| File | Reason |
|---|---|
| `apps/web/src/app/layout.tsx` | Reviewed blocker fix using route-scoped `ConditionalAuthProvider`. |
| `apps/web/src/app/page.tsx` | Reviewed public home lander composition. |
| `apps/web/src/app/changelog/` | Reviewed public placeholder route. |
| `apps/web/src/app/docs/` | Reviewed public placeholder route. |
| `apps/web/src/app/faq/` | Reviewed public placeholder route. |
| `apps/web/src/app/features/` | Reviewed public placeholder route. |
| `apps/web/src/app/how-it-works/` | Reviewed public placeholder route. |
| `apps/web/src/app/pricing/` | Reviewed public pricing route. |
| `apps/web/src/app/security/` | Reviewed public placeholder route. |
| `apps/web/src/components/contact/public-site-footer.tsx` | Reviewed public footer/chrome work. |
| `apps/web/src/components/contact/public-site-footer.test.ts` | Reviewed focused footer/chrome test. |
| `apps/web/src/components/layout/PublicNavbar.tsx` | Reviewed public nav/chrome work. |
| `apps/web/src/components/layout/PublicNavbar.test.tsx` | Reviewed public nav test. |
| `apps/web/src/components/layout/public-navbar-static.test.ts` | Reviewed focused nav/auth-provider static test. |
| `apps/web/src/components/marketing/WordGeniProfessionalStory.tsx` | Reviewed story-scroll/product visual proof work. |
| `apps/web/src/components/marketing/public-placeholder-page.tsx` | Reviewed public placeholder component. |
| `apps/web/src/components/pricing/` | Reviewed pricing/signup clarity public surface. |
| `apps/web/src/context/ConditionalAuthProvider.tsx` | Reviewed blocker fix isolating public marketing from Supabase browser auth. |
| `apps/web/src/lib/pricing-catalog.ts` | Reviewed public pricing catalog wording/safe fallback surface. |
| `apps/web/src/styles/globals.css` | Reviewed public lander/chrome visual polish. |
| `apps/web/src/test-globals.d.ts` | Test support for reviewed focused tests. |

### Needs Approval

| File | Reason |
|---|---|
| `apps/web/public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `apps/web/public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `apps/web/public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `apps/web/public/ecosystem/verixet/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `apps/web/public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `apps/web/public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped review. |
| `.gitignore` | Repo config outside scoped review. |
| `android/app/build.gradle` | Mobile build config; excluded. |
| `apps/api/dist/` | Generated API build output; excluded. |
| `apps/api/drizzle/meta/_journal.json` | Database migration metadata; excluded. |
| `apps/api/drizzle/0015_ecosystem_user_links.sql` | Database migration; excluded. |
| `apps/api/package.json` | API package changes outside scoped review. |
| `apps/api/src/db/schema.ts` | Database schema; excluded. |
| `apps/api/src/**` | API auth/security/billing/routes/services changes outside public lander scope. |
| `apps/web/next-env.d.ts` | Generated Next type file; excluded. |
| `apps/web/next.config.mjs` | Next config/observability change outside scoped review. |
| `apps/web/package.json` | Package change outside scoped review unless manually isolated. |
| `apps/web/src/app/(auth)/*` | Auth pages; excluded. |
| `apps/web/src/app/api/ecosystem/` | API/auth ecosystem route; excluded. |
| `apps/web/src/components/auth/*` | Auth components; excluded. |
| `apps/web/src/instrumentation*.ts` | Observability/instrumentation; excluded. |
| `apps/web/src/lib/mobile/native-actions.ts` | Mobile behavior; excluded. |
| `apps/web/src/lib/server-auth.test.ts` | Server auth test; excluded. |
| `apps/web/src/lib/xflow-auth-config.ts` | Auth/ecosystem config; excluded. |
| `apps/web/src/lib/xflow-handoff.ts` | Auth handoff logic; excluded. |
| `apps/web/src/middleware.supabase.test.ts` | Auth/middleware test; excluded. |
| `apps/web/src/observability/*` | Observability/Sentry changes; excluded. |
| `apps/web/src/sentry.*.config.ts` | Sentry config; excluded. |
| `apps/worker/dist/` | Generated worker output; excluded. |
| `docs/auth/` | Auth docs; excluded. |
| `docs/mobile/` | Mobile docs; excluded. |
| `package.json` | Root package change outside scoped review. |
| `pnpm-lock.yaml` | Lockfile tied to unrelated package changes; excluded. |
| `scripts/live-verify-wordgeni*` | Live verification scripts outside scoped review. |
| `scripts/mobile/*` | Mobile scripts; excluded. |
| `scripts/print-dev-hints.mjs` | Dev helper outside scoped review. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script; excluded. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script; excluded. |

## CreVux

### Include

| File | Reason |
|---|---|
| `artifacts/image-gen/src/App.tsx` | Reviewed public route wiring for lander/placeholders. |
| `artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx` | Reviewed public nav/footer/chrome work. |
| `artifacts/image-gen/src/components/landing/MarketingSiteChrome.test.ts` | Reviewed focused chrome test. |
| `artifacts/image-gen/src/components/landing/CrevuxProfessionalStory.tsx` | Reviewed story-scroll/product visual proof work. |
| `artifacts/image-gen/src/pages/landing.tsx` | Reviewed public lander composition. |
| `artifacts/image-gen/src/pages/pricing.tsx` | Reviewed public pricing/signup clarity pass. |
| `artifacts/image-gen/src/pages/pricing.test.tsx` | Reviewed public pricing test. |
| `artifacts/image-gen/src/pages/ChangelogPage.tsx` | Reviewed public placeholder route. |
| `artifacts/image-gen/src/pages/DocsPage.tsx` | Reviewed public placeholder route. |
| `artifacts/image-gen/src/pages/FaqPage.tsx` | Reviewed public placeholder route. |
| `artifacts/image-gen/src/pages/HowItWorksPage.tsx` | Reviewed public placeholder route. |
| `artifacts/image-gen/src/pages/PublicPlaceholderPage.tsx` | Reviewed public placeholder component. |
| `artifacts/image-gen/src/pages/SecurityPage.tsx` | Reviewed public placeholder route. |
| `artifacts/image-gen/src/styles/landing.css` | Reviewed public lander/chrome visual polish. |

### Needs Approval

| File | Reason |
|---|---|
| `artifacts/image-gen/public/ecosystem/audaix/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `artifacts/image-gen/public/ecosystem/crevux/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `artifacts/image-gen/public/ecosystem/rataify/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `artifacts/image-gen/public/ecosystem/verixet/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `artifacts/image-gen/public/ecosystem/wordgeni/` | Untracked ecosystem media folder; guardrail requires explicit approval. |
| `artifacts/image-gen/public/ecosystem/xflow/` | Untracked ecosystem media folder; guardrail requires explicit approval. |

### Exclude

| File | Reason |
|---|---|
| `.env.example` | Env-example change outside scoped review. |
| `artifacts/api-server/.env.example` | Env-example change outside scoped review. |
| `artifacts/image-gen/.env.example` | Env-example change outside scoped review. |
| `artifacts/api-server/package.json` | API package change outside scoped review. |
| `artifacts/api-server/src/**` | API auth/billing/generation/export/backend changes; excluded. |
| `artifacts/image-gen/scripts/verify-landing-phase2.mjs` | Verification script outside scoped review. |
| `artifacts/image-gen/src/components/AnimateTab.tsx` | Studio/app feature work; excluded. |
| `artifacts/image-gen/src/components/StoryboardsTab.tsx` | Studio/app feature work; excluded. |
| `artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.tsx` | App/dashboard chrome outside public lander scope. |
| `artifacts/image-gen/src/components/studio/StudioHomeDashboard.tsx` | Studio dashboard feature; excluded. |
| `artifacts/image-gen/src/components/video-studio/shell/StudioEnterpriseTopBar.tsx` | Studio feature UI; excluded. |
| `artifacts/image-gen/src/features/create-home/components/CreateMainWorkspace.tsx` | Studio feature UI; excluded. |
| `artifacts/image-gen/src/pages/AdminDashboardPage.test.tsx` | Admin dashboard test; excluded. |
| `artifacts/image-gen/src/pages/PlanUpgradePage.test.tsx` | Billing/upgrade test; excluded. |
| `artifacts/image-gen/src/pages/home.tsx` | App home/dashboard surface outside public lander scope. |
| `lib/db/migrations/*` | Database migrations; excluded. |
| `lib/db/src/schema/*` | Database schema changes; excluded. |
| `lib/export-contract/src/index.ts` | Export contract logic; excluded. |
| `lib/saas-entitlements/*` | Entitlement/billing policy logic; excluded. |
| `package.json` | Root package change outside scoped review. |
| `pnpm-lock.yaml` | Lockfile tied to unrelated package changes; excluded. |
| `scripts/dev-full.mjs` | Dev script outside scoped review. |
| `scripts/run-image-gen-dev.mjs` | Dev script outside scoped review. |
| `scripts/smoke-authenticated-beta.mjs` | Authenticated smoke script; excluded. |
| `scripts/smoke-shared-supabase-local.ts` | Supabase/auth smoke script; excluded. |
| `scripts/smoke-shared-supabase-runtime.ts` | Supabase/auth smoke script; excluded. |

## Manual Approval Required Before Inclusion

These files/folders cannot be included in the scoped PR without explicit approval because the ecosystem video/media guardrail is not currently satisfied:

- `apps/XFlow/public/ecosystem/ecosystem-showcase.mp4`
- `apps/XFlow/public/ecosystem/ecosystem-showcase.webm`
- `apps/XFlow/public/ecosystem/*/`
- `apps/Verixet/public/ecosystem/ecosystem-showcase.mp4`
- `apps/Verixet/public/ecosystem/ecosystem-showcase.webm`
- `apps/Verixet/public/ecosystem/*/`
- `apps/AudAix/dashboard/public/ecosystem/*/`
- `apps/RatAiFy/client/public/ecosystem/*/`
- `apps/WordGeni/apps/web/public/ecosystem/*/`
- `apps/CreVux/artifacts/image-gen/public/ecosystem/*/`
- `apps/XFlow/vendor/ecosystem-showcase/dist/index.js`

## Scoped PR Assembly Notes

- Do not stage full app directories.
- Use explicit pathspecs from the `include` sections only.
- If a file has mixed reviewed and unrelated changes, split the patch manually before staging. Known mixed-risk files include:
  - `apps/Verixet/package.json`
  - `apps/XFlow/package.json`
  - app-level lockfiles
  - public pricing pages/components where billing copy may overlap with unrelated pricing logic
- Do not include generated output folders such as `dist`, `.next`, `output`, `artifacts/*screenshots`, or Playwright screenshots.
- Re-run focused chrome tests, typecheck, builds, and `node output\lander-qa\visual-qa.mjs` after the scoped PR is assembled.

