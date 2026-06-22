# Six-App Deployment Diff Review

Date: 2026-05-05

Scope: review of the public lander, public launch readiness, and blocker-fix work for XFlow, Verixet, AudAiX, RatAiFy, WordGeni, and CreVux.

## Final Recommendation

Status: **Not safe to deploy from the current dirty worktrees as-is**

The reviewed lander/chrome/blocker code is low risk and the requested validation passed after stopping stale local dev servers. However, the current app repositories contain many additional dirty files outside the requested deployment review scope, including auth, billing, env-example, database, and ecosystem media changes. A production deploy from these full dirty worktrees would include unreviewed changes.

Deploy recommendation:

1. Deploy only a scoped changeset containing the reviewed lander/chrome/blocker files, or review the remaining dirty files in a separate pass.
2. Do not include modified/untracked ecosystem video assets unless they are explicitly approved as part of the existing ecosystem-video work.
3. Populate Verixet Railway production env/catalog values before production start. Do not deploy Verixet with `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.

## Reviewed Risk Areas

### Env Safety

- No real tracked `.env` secret file was edited in the reviewed blocker files.
- Several `.env.example` files are dirty across app repos. These are not real secret files, but they are outside the requested lander/blocker review and should not be bundled into a release without separate review.
- Verixet local-smoke skip remains guarded by existing runtime behavior and staging validation:
  - `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` is used only for local smoke.
  - `apps/Verixet/scripts/validate-staging-readiness.mjs` rejects the flag for staging.
  - Production startup validation still fails closed when required env/catalog values are missing.
- WordGeni public marketing can render without Supabase public env because `ConditionalAuthProvider` avoids creating the browser auth client on public marketing routes.
- WordGeni protected routes still rely on existing middleware/server-auth checks and fail closed when Supabase auth env is required but unavailable.

### Auth And Billing Safety

- No reviewed blocker file changed checkout logic, Stripe webhook logic, entitlement evaluation, or billing authority behavior.
- Verixet dashboard `usePathname()` / `useSearchParams()` edits are narrow nullability guards exposed by production build/typegen. They do not change auth or billing decisions.
- WordGeni `ConditionalAuthProvider` changes only the client provider wrapper route scope. It does not change middleware, server auth, dashboard route definitions, or API auth.
- RatAiFy `/status` copy changed only public status messaging and removed unsupported uptime values.

### Public Lander Safety

- Focused chrome tests passed for all six apps.
- Source scan of the reviewed lander/chrome files found no `localhost:` public ecosystem links.
- RatAiFy public `/status` no longer contains hard-coded uptime percentages.
- Product visual proof labels remain present as `Interface preview`, `Sample state`, `Workflow preview`, or demo-data wording where applicable.
- Residual caution: unrelated RatAiFy public marketing files outside the reviewed pass still contain revenue/numeric marketing language. They were not modified in this pass, but should be reviewed before treating the whole RatAiFy dirty worktree as public-launch-clean.

### Ecosystem Preservation

Preservation is **not fully confirmable from the current dirty worktrees** because ecosystem media paths are dirty:

- `apps/XFlow/public/ecosystem/ecosystem-showcase.mp4` is modified.
- `apps/Verixet/public/ecosystem/ecosystem-showcase.mp4` is modified.
- Multiple app repos contain untracked `public/ecosystem/...` asset folders and `.webm` files.

The lander components still reference the existing `/ecosystem/ecosystem-showcase.webm` and `/ecosystem/ecosystem-showcase.mp4` paths, and browser QA verified ecosystem video references render. But the asset-level guardrail says not to modify ecosystem video assets, so the dirty media files must be excluded from this deployment or explicitly approved.

### Runtime And Build Safety

- XFlow `next.config.ts` now wraps with Sentry only when `SENTRY_ORG` and a Sentry project are configured. It does not disable Sentry when production Sentry env is present.
- Verixet `scripts/next-build.cjs` cleans stale `.next` output on Windows before production build; it does not set or hide runtime env validation.
- Verixet `src/pages/_document.tsx` is minimal legacy Next document plumbing and does not change app behavior.
- Verixet nullable router-hook guards are narrow build/type nullability fixes.
- WordGeni `ConditionalAuthProvider` is route-scoped and covered by static tests.
- RatAiFy status copy is honest and covered by a regression test preventing percentage uptime claims.

## Files Reviewed By Risk Category

### Blocker Fix Files

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

### Public Lander / Chrome Files

See the app-by-app file inventory in `docs/six-app-lander-redesign-proof.md`, `docs/six-app-cta-routing-audit.md`, and `docs/six-app-product-visual-proof.md`. These files were validated through focused chrome tests and browser QA.

### Out-Of-Scope Dirty Files Needing Separate Review

Every app repo currently has unrelated dirty files outside the requested deployment review. Examples include:

- `.env.example` changes across all six app repos.
- XFlow auth, billing, middleware, dashboard, database migration, and ecosystem media changes.
- Verixet auth API, billing, catalog, Turnstile, Supabase, and ecosystem media changes.
- AudAiX env, billing usage, JWT, Sentry, readiness, and backend audit changes.
- RatAiFy server env/auth/cache/storage/job queue and public marketing files outside this pass.
- WordGeni API auth/security/Stripe/Sentry/native mobile changes outside the public lander work.
- CreVux API auth/billing/generation/export/database changes outside the public lander work.

These are not judged safe by this review.

## Validation Results

### Focused Chrome Tests

| App | Command | Result |
|---|---|---|
| XFlow | `npx vitest run tests/showcase-chrome.test.ts` | Passed |
| Verixet | `npm test -- src/components/marketing/marketing-chrome.test.ts` | Passed |
| AudAiX | `npm test -- src/components/lander/StoryLanderShell.test.ts` | Passed |
| RatAiFy | `npx vitest run server/lib/rataify-chrome.test.ts` | Passed |
| WordGeni | `npx vitest run src/components/layout/public-navbar-static.test.ts src/components/contact/public-site-footer.test.ts` | Passed |
| CreVux | `npx vitest run src/components/landing/MarketingSiteChrome.test.ts` | Passed |

### Typecheck

| App | Command | Result |
|---|---|---|
| XFlow | `npm run typecheck` | Passed |
| Verixet | `npm run typecheck` | Passed |
| AudAiX | `npm run typecheck` | Passed |
| RatAiFy | `npx tsc --noEmit` | Passed |
| WordGeni | `npx tsc --noEmit` | Passed |
| CreVux | `npm run typecheck` | Passed |

### Build

| App | Command | Result |
|---|---|---|
| XFlow | `npm run build:skip-standalone` | Passed with existing Sentry/OpenTelemetry and `jose` Edge Runtime warnings |
| Verixet | `npm run build` | Passed after stopping stale local Verixet dev server processes that were writing `.next` during build |
| AudAiX | `npm run build` | Passed |
| RatAiFy | `npm run build` | Passed with existing Vite `NODE_ENV` and chunk-size warnings |
| WordGeni | `npm run build` | Passed with existing pricing `<img>` warning |
| CreVux | `npm run build` | Passed with existing large asset/plugin timing warnings |

### Production-Style Smoke

| App | Route | Result |
|---|---|---|
| XFlow | `http://127.0.0.1:3101/` | 200 |
| Verixet | `http://127.0.0.1:3102/` | 200 with `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` local-smoke flag only |
| WordGeni | `http://127.0.0.1:3103/` | 200 |
| AudAiX | `http://127.0.0.1:3104/` | 200 |
| CreVux | `http://127.0.0.1:3105/` | 200 |
| RatAiFy | `http://127.0.0.1:3106/` | 200 |

### Browser QA

Command:

```powershell
node output\lander-qa\visual-qa.mjs
```

Result:

- 24 viewport/reduced-motion checks.
- 0 failures.
- 0 placeholder failures.

## Railway / Production Env Notes

Verixet remains the main production deployment blocker until Railway env/catalog values are populated.

Direct production runtime validation without the local skip currently fails for:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `XFLOW_UCL_EVENTS_URL`
- `XFLOW_UCL_LINK_URL`
- `VERIXET_APP_SLUG`
- XFlow ecosystem OAuth URLs/client/secret/state/token secrets
- Turnstile public/server keys
- SendGrid transactional mail keys/sender values
- Verixet Stripe secrets and webhook secret
- all required Verixet Stripe price ids and product ids generated from the billing catalog
- Verixet usage-ingest, AudAiX delegation, and bootstrap secrets

Do not set `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1` in Railway production.

## Required Before Deployment

- Create a scoped deployment diff or PR that excludes unrelated dirty app files.
- Exclude or explicitly approve dirty ecosystem media assets before shipping.
- Populate Verixet production env/catalog in Railway and verify production start without `VERIXET_SKIP_RUNTIME_ENV_VALIDATE=1`.
- Re-run the live browser QA after the scoped deploy artifact is prepared.

