# Ecosystem Dirty-Tree Safety Report

Date: 2026-05-04

This report records dirty files detected before Phase 1 cleanup. Nothing was reverted. Runtime fixes should wait unless a change is isolated, obvious, and covered by a focused test.

## XFlow

Classification: mixed user work and unknown runtime changes.

Dirty files detected:

- Modified: `.env.example`, `docs/operations/WINDOWS_NEXT_BUILD_SYMLINKS.md`, `drizzle/migrations/meta/_journal.json`, `drizzle/schema/identity.ts`, `scripts/next-build.cjs`, auth/signup/dashboard/layout/ecosystem/UCL/navigation/billing/env-doctor source files, multiple unit/integration tests, `tsconfig.json`
- Deleted: `src/app/(dashboard)/slack/page.tsx`, `src/design-system/bundles/dash_slack_page.classes.ts`
- Untracked: `docs/auth/`, `drizzle/migrations/0045_central_google_auth_handoff.sql`, Playwright screenshots, `public/ecosystem/`, pricing/auth/handoff routes, dashboard components, central auth helpers, pricing helpers, new tests

Recommendation: do not touch XFlow runtime files in Phase 1. Avoid deleted dashboard Slack files and auth/billing/ecosystem route files.

## Verixet

Classification: mixed user work, docs, generated artifacts, and Turnstile/billing runtime changes already in progress.

Dirty files detected:

- Modified: `.env.example`, screenshot summaries, external services/auth setup docs, marketing/pricing files, auth routes, auth forms, Turnstile library/tests, billing tests, `tsconfig.json`
- Untracked: billing artifacts/docs, `output/dev/`, `public/ecosystem/`, pricing tests, Turnstile client helper/tests

Recommendation: do not touch Verixet runtime files in Phase 1. Billing scripts/tests and Turnstile files are active work and should be handled with focused follow-up validation.

## AudAiX

Classification: mixed user UI/test/config work and unknown runtime changes.

Dirty files detected:

- Modified: dashboard landing/pricing pages and tests, dashboard TypeScript/Vite/Vitest configs, Supabase smoke schedule script, root Vitest config
- Untracked: `dashboard/public/ecosystem/`

Recommendation: do not touch AudAiX runtime or dashboard config in Phase 1. Turnstile migration should wait for a focused app pass.

## Rataify

Classification: mixed user UI/test/config/runtime work.

Dirty files detected:

- Modified: marketing/pricing/login UI, package files, scanner validation, billing/pricing tests, test setup, TypeScript/Vite/Vitest configs
- Untracked: `client/public/ecosystem/`

Recommendation: do not touch Rataify runtime in Phase 1. Public Turnstile fallback and error-code normalization should be a focused Phase 2 task.

## WordGeni

Classification: extensive user work, generated build output, migrations, auth/pricing/Sentry/security changes, and mobile docs/scripts.

Dirty files detected:

- Modified: `.env.example`, `.gitignore`, Android Gradle files, API schema/migrations/tests/routes/services, Sentry code/tests, web auth/pricing/layout/instrumentation/middleware files, docs/mobile files, root package/lock, mobile scripts
- Untracked: `apps/api/dist/`, `apps/worker/dist/`, ecosystem user-link migration, new Sentry redaction files/tests, web ecosystem/pricing/auth/XFlow handoff files, Android release docs/scripts

Recommendation: do not touch WordGeni runtime in Phase 1. Generated `dist` folders should be reviewed separately before any cleanup.

## Crevux

Classification: mixed user runtime/UI/test/config work.

Dirty files detected:

- Modified: API Stripe/video routes, image-gen verify script, Animate/Storyboard/dashboard/studio UI, admin/plan tests, home/landing/pricing pages, TypeScript/Vite/Vitest configs, SaaS entitlement policy code
- Untracked: API Stripe/video tests, `artifacts/image-gen/public/ecosystem/`, pricing test

Recommendation: do not touch Crevux runtime in Phase 1. Billing/admission ordering and local Stripe authority need focused Phase 2 work.

## Files Not To Touch In Phase 1

- App runtime routes under `src/app/api`, `server/routes`, `apps/api/src/routes`, and `artifacts/api-server/src/routes`
- Auth/OAuth/Turnstile runtime modules
- Stripe billing scripts/routes/webhooks/tests
- DB migrations/schema files
- Generated `dist`, `output`, screenshot, and public asset folders unless explicitly requested
- Package lockfiles and package manager configs
