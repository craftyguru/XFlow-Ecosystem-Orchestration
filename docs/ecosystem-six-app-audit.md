# Ecosystem Six-App Audit

Date: 2026-05-04

## 1. Executive Summary

The ecosystem is not a single monorepo today. It is a parent folder containing six independently managed app repositories plus a root `packages` folder. The six expected apps are present:

| App | Root | Observed role |
| --- | --- | --- |
| XFlow | `apps/XFlow` | Control plane, identity, OAuth, UCL, app hub |
| Verixet | `apps/Verixet` | Billing, governance, Stripe, entitlements, usage authority |
| AudAiX | `apps/AudAix` | Audit app and Vite dashboard consuming auth/billing/control-plane services |
| Rataify | `apps/RatAiFy` | Trust/reviews/risk app consuming Verixet and XFlow services |
| WordGeni | `apps/WordGeni` | Writing app with API/web/worker packages and Crevux integration |
| Crevux | `apps/CreVux` | AI media studio with API server, image-gen app, mobile app, and internal libs |

The system has real connection work in progress: XFlow exposes OAuth/UCL/control-plane surfaces, Verixet has the strongest tested billing and entitlement authority surface, and consuming apps contain adapters for Verixet/XFlow. It is not production-ready as one ecosystem because environment contracts, package-manager boundaries, app slug naming, route envelopes, and authority boundaries are not yet unified.

## 2. Ecosystem Health Score

Current score: 58 / 100.

Rationale: all six app roots exist and most major integration surfaces have code and some tests, but there is no root workspace/CI contract, env documentation is materially out of sync with runtime reads, multiple apps retain local billing/Stripe logic, and several cross-app contracts are duplicated instead of shared.

## 3. Fully Connected

- Six expected app roots exist under `apps`.
- XFlow has OAuth authorize/token/userinfo, UCL link/status/events, ecosystem app/session/entitlements, and control-plane routes.
- Verixet has checkout, portal, Stripe webhook, platform entitlement, usage ingest, UCL link/config/snapshot, XFlow OAuth, and control-plane routes with broad test coverage.
- AudAiX has routes for ecosystem auth, Verixet connectors, XFlow connectors, UCL, control-plane health/config/metrics, billing trial, and workspace billing.
- Rataify has ecosystem signup, UCL, control-plane, Verixet usage ingest, entitlement adapter, local billing, and credit gate routes.
- WordGeni has API routes for billing, Stripe webhook, auth, Crevux integration, cursor billing guard, and web handoff route for ecosystem auth.
- Crevux has authenticated billing, Stripe webhook, AI credits, idempotent usage ledger, builder feature keys, WordGeni integration route, and workspace isolation tests.

## 4. Partially Connected

- XFlow and Verixet both expose `/api/v1/control-plane/*` surfaces, but Verixet also has `/api/control-plane/[[...segments]]` alias routing. Consumers use mixed base URL env names.
- UCL is implemented in XFlow, Verixet, AudAiX, and Rataify, but token selection is not clearly centralized across global service tokens, managed install tokens, and per-connection UCL tokens.
- Billing/entitlement adapters exist in consuming apps, but local Stripe/billing code remains in AudAiX, Rataify, WordGeni, and Crevux.
- WordGeni-to-Crevux integration exists on both sides, but there is no root shared route/schema contract.
- Turnstile is strongest in Verixet after recent hardening; AudAiX and Rataify still use legacy or nonstandard site-key names in parts of their contracts.

## 5. Missing

- Root-level workspace manifest or orchestration script for all six apps.
- Root CI command that runs safe typecheck/test/build per app with secrets mocked or explicitly absent.
- Shared package for app slugs, route paths, request envelopes, error envelopes, feature keys, and authority headers.
- Single published env contract per app that matches code, examples, docs, tests, and Railway.
- Single billing plan and feature-key source of truth consumed from Verixet by the other five apps.
- Shared UCL/control-plane token-selection rules.
- Proof-based global connection status that prevents fake green states in setup/dashboard UI.

## 6. Highest-Risk Blockers

1. Env drift is severe across all six apps. The inventory found large sets of env vars read but not documented, and documented vars not read.
2. Billing authority is not cleanly bounded. Consuming apps still contain Stripe routes, webhook processors, plan catalogs, and credit logic.
3. Route contracts are duplicated in app-local code instead of shared contracts.
4. App slug casing and package naming are mostly normalized; remaining casing risk is app-directory casing (`XFlow`, `RatAiFy`, `CreVux`) versus lowercase runtime slugs.
5. Turnstile site-key naming is inconsistent outside Verixet.
6. No root build/test gate exists for the ecosystem.
7. Multiple package managers and lockfiles create deployment ambiguity.
8. Nested `node_modules` trees exist in several apps and subpackages.
9. UCL/control-plane token types are easy to confuse.
10. Database authority boundaries are unclear where consuming apps store billing, Stripe, or entitlement data.

## 7. Duplicated Or Conflicting Files Found

| Area | Finding | Risk |
| --- | --- | --- |
| Root/package manager | No root `package.json` or `pnpm-workspace.yaml` for all six apps | No single install/test/build contract |
| XFlow | Has both `package-lock.json` and `pnpm-lock.yaml` | npm/pnpm ambiguity |
| Verixet | npm lockfile, but previous validation used pnpm successfully | package manager contract unclear |
| AudAiX | Root app plus nested `dashboard/package.json` and lockfile | split dependency lifecycle |
| WordGeni | pnpm workspace with `packageManager: pnpm@9.15.0` | separate from Crevux pnpm version |
| Crevux | pnpm workspace with `packageManager: pnpm@10.30.3`, Node `>=22.18.0` | separate runtime contract |
| Crevux path casing | Files were referenced by both `apps/CreVux` and `apps/Crevux` in search results on Windows | Linux/Railway path confusion if any script uses wrong case |
| Nested installs | `node_modules` present in root/subpackages for AudAiX and Crevux | stale dependency and disk bloat risk |
| Package names | RatAiFy uses the canonical `rataify` package name; WordGeni package scopes are now `@wordgeni/*` | Remaining naming debt is directory casing and legacy compatibility strings, not package scope |

## 8. Env Var Contract Matrix By App

Detailed tables are in `docs/ecosystem-env-contract.md`.

| App | Used env refs | Documented env refs | Used but not documented | Documented but not read | Summary |
| --- | ---: | ---: | ---: | ---: | --- |
| XFlow | 196 | 139 | 112 | 55 | Most drift around hosted config, control plane, Verixet ingest/snapshot, Sentry, Redis, Slack, OAuth |
| Verixet | 162 | 178 | 77 | 93 | Strongest coverage, but many Stripe/product/provider vars are documented but not read; several test/config vars are undocumented |
| AudAiX | 192 | 143 | 84 | 35 | Uses `TURNSTILE_SITE_KEY` instead of Vite public key; multiple Verixet/XFlow token aliases |
| Rataify | 182 | 224 | 42 | 84 | Broad docs but retains legacy public Turnstile fallback and many Stripe/backup vars |
| WordGeni | 143 | 69 | 85 | 11 | Many runtime keys are not in `.env.example`; Crevux and XFlow keys need clearer contract |
| Crevux | 266 | 199 | 121 | 54 | Largest env surface; many AI, auth, media, credit, Stripe, and smoke-test keys |

## 9. Cross-App Route Contract Matrix

| Flow | Producer | Consumer | Observed routes | Required contract status |
| --- | --- | --- | --- | --- |
| XFlow hosted config/control plane | XFlow | Verixet, AudAiX, Rataify | `/api/v1/control-plane/config`, `/api/v1/control-plane/health`, `/api/v1/control-plane/metrics` | Partial; base URL env names differ |
| XFlow OAuth | XFlow | Verixet, AudAiX, Rataify, WordGeni, Crevux | `/oauth/authorize`, `/api/oauth/token`, `/oauth/userinfo`, app-specific callbacks | Partial; state/PKCE exists in places, not shared |
| XFlow UCL | XFlow | Verixet, AudAiX, Rataify | `/api/ucl/status`, `/api/ucl/events`, `/api/ucl/link/*`, `/api/ucl/apps/[slug]/*` | Partial; token boundaries need shared contract |
| Verixet signup handoff | Verixet | XFlow/consumer apps | `/api/ecosystem/signup/start`, `/api/xflow/signup-handoff` | Partial; route aliases and app source fields need shared schema |
| Verixet checkout/billing | Verixet | all apps | `/api/billing/checkout`, `/api/billing/portal`, `/api/billing/status`, `/api/platform/v1/plans` | Good in Verixet; consumers still duplicate local billing |
| Verixet entitlements | Verixet | all apps | `/api/platform/v1/entitlements`, `/resolve`, `/evaluate`, `/api/v1/entitlements/check` | Good in Verixet; consumers need mandatory server-side gate before work |
| Verixet usage ingest | Verixet | AudAiX, Rataify, WordGeni, Crevux | `/api/ecosystem/usage/ingest`, `/api/v1/usage/report`, `/api/v1/meter/usage/*` | Partial; feature keys and tokens duplicated locally |
| WordGeni to Crevux | WordGeni API and web | Crevux API | WordGeni `routes/integrations/crevux.ts`; Crevux `routes/integrations/wordgeni.ts` | Partial; no root shared schema |

## 10. Billing And Entitlement Findings

- Verixet is the only app that should own Stripe workspace billing, plan catalogs, entitlement grants, usage ingest, and webhook replay logic.
- AudAiX has `stripe-checkout-session.ts`, `stripe-billing-webhook.ts`, and local plan files. These should be treated as dev/local compatibility or retired after Verixet authority is complete.
- Rataify has `server/routes/billing.ts`, `server/services/stripe.ts`, local credit routes, Verixet usage ingest service, and entitlement adapter. This is a split authority risk.
- WordGeni has Stripe webhook, plan-from-price, billing reconciliation, and billing entitlements inside its API. This must be clearly local cache/legacy or replaced by Verixet authority.
- Crevux has Stripe webhook, subscription tier mapping, top-up checkout, AI credits, and local SaaS entitlement package. This is operationally strong for Crevux alone but conflicts with the ecosystem authority principle unless Verixet is explicitly upstream.
- Feature keys are present in Rataify and Crevux, but there is no shared root feature-key registry.

## 11. Auth/OAuth/Signup Findings

- XFlow correctly appears as the identity/control-plane authority, but consuming apps still keep local auth/session implementations.
- Verixet contains robust XFlow OAuth helper modules and tests for state, PKCE, returnTo, app slug, and token crypto.
- AudAiX exposes universal auth routes and ecosystem auth routes, which can be correct as app entrypoints but must not become an identity authority.
- WordGeni contains migrations for dropping local auth and adding ecosystem user links, indicating migration toward XFlow.
- Crevux has extensive local auth/OAuth/MFA/passkey routes. That may be valid for studio account security, but ecosystem OAuth boundaries must be explicit.
- Return URL/state/nonce/PKCE handling is implemented in several app-specific ways. This should be consolidated into shared contracts/tests.

## 12. UCL And Control-Plane Findings

- XFlow has UCL app validation, trust, revoke, repair, challenges, status, events, and control-plane bootstrap routes.
- Verixet has UCL config, health, link start/confirm/revoke, entitlement snapshot, and binding status routes.
- AudAiX has UCL routes, link confirmation, heartbeat, event client, health, env, and capabilities modules.
- Rataify has UCL routes, bridge, config, event client, link store, and XFlow bootstrap installer.
- Control-plane event names include activation and lifecycle concepts, but `activation_kind`, deployment validation fields, and correlation/idempotency headers are not consistently shared at the root.
- Setup/checklist pages must distinguish `configured`, `reachable`, `authenticated`, `linked`, `validated`, and `healthy` instead of showing a single connected state.

## 13. Usage Metering Findings

- Verixet owns usage ingest and meter dashboards.
- AudAiX has `audaix-usage-keys.ts`, credit enforcement, billing authority, and Verixet usage helper.
- Rataify gates several paid actions with `requireEntitledFeature` and `requireRataifyUsage`, which is a good pattern.
- Crevux has preflight/export metering, AI credit debits, idempotency keys, refund paths, and tenant isolation tests.
- WordGeni has cursor billing guard, AI usage limits, visual companion entitlements, and usage cost estimates.
- Missing root contract: feature key names, token type, admission response shape, `402 PLAN_LIMIT_EXCEEDED`, idempotency header, and replay behavior.

## 14. Performance Risks

- No root dependency strategy; duplicated React/Next/Vite stacks and nested `node_modules` increase install/build cost.
- Crevux API and image-gen app have large route and UI surfaces with many generated assets. Build/test should be scoped in CI.
- Repeated local env validation on hot paths should be audited; several apps validate env through local helpers.
- Admin/dashboard routes in Crevux and Rataify include broad list endpoints; verify pagination and indexes before production.
- Dashboard connection/status widgets across apps should use cached authority checks, not repeated uncached polling.

## 15. Database And Migration Risks

- XFlow, Verixet, WordGeni, and Crevux all have migrations/schema files.
- AudAiX and Rataify have repositories/models for auth sessions, billing, control-plane events, UCL links, Stripe webhook events, and workspace billing.
- Consuming apps store billing or entitlement data in local tables. This must be defined as cache/mirror data, not billing authority.
- WordGeni has migrations for auth model changes and ecosystem user links; verify migration ordering in CI.
- Crevux has many billing/usage/auth migrations with idempotency and usage events; verify high-use dashboard indexes.

## 16. UI Truthfulness Issues

- Any setup wizard should avoid saying "connected" from env presence alone.
- Verixet has readiness/checklist routes that can be a good source of truth, but consuming UIs need to display missing XFlow/Verixet proof explicitly.
- Rataify and AudAiX have Turnstile states that need naming alignment and production-block guarantees.
- Marketing/pricing pages exist in multiple apps. Pricing claims should come from Verixet or a generated artifact that is traceable to Verixet.

## 17. Test And Build Results

Current-turn validation is recorded below. Previous Verixet Turnstile validation in this working tree passed `pnpm typecheck`, `pnpm test`, and `pnpm build`; the later full ecosystem test run exposed timeout failures under broader load.

| App | Command | Result |
| --- | --- | --- |
| Root | Repository scan commands | Passed |
| Root | Env/route inventory script | Passed |
| XFlow | `npm run typecheck` | Passed |
| XFlow | `npm test` | Failed: one timeout in `tests/unit/control-plane-config-route-success.test.ts` |
| XFlow | `npm run build` | Passed with Edge Runtime/webpack warnings |
| Verixet | `pnpm typecheck` | Passed |
| Verixet | `pnpm test` | Failed: four timeout failures in billing/access tests |
| Verixet | `pnpm build` | Passed |
| AudAiX | `npm run typecheck` | Passed |
| AudAiX | `npm test` | Failed: Turnstile/auth route timeouts plus report export 401 expectations |
| AudAiX | `npm run build` | Passed |
| Rataify | `npm run check` | Passed |
| Rataify | `npm test` | Passed |
| Rataify | `npm run build` | Passed with Vite env/chunk-size warnings |
| WordGeni | `pnpm typecheck` | Passed with Next image lint warning |
| WordGeni | `pnpm test` | Passed |
| WordGeni | `pnpm build` | Passed |
| Crevux | `pnpm typecheck` | Passed |
| Crevux | `pnpm test` | Passed |
| Crevux | `pnpm build` | Passed with large asset/plugin timing warnings |

## 18. Exact Fixes Applied

- Added this root audit report.
- Added root ecosystem connection map.
- Added root ecosystem env contract.
- Did not change app runtime code during this audit pass because all app repos already have unrelated dirty working trees and the unsafe areas require authority/secret/deployment decisions.

## 19. Fixes Intentionally Not Applied

| Candidate fix | Reason not applied |
| --- | --- |
| Consolidate all apps into one pnpm workspace | Architectural rewrite; high risk |
| Remove local Stripe routes from consumers | Could remove working production or migration logic |
| Rename package/app slugs | Cross-deployment impact |
| Replace all auth systems with XFlow-only auth | Requires migration plan |
| Enforce one UCL token model in code | Needs shared contract and dashboard values |
| Rewrite env loaders | Many active dirty app changes; requires per-app tests |
| Remove nested `node_modules` | Destructive cleanup with no functional benefit to audit |

## 20. Next Steps Ranked By Priority

1. Create a root contract package for app slugs, route paths, headers, envelopes, error codes, billing intervals, plan slugs, feature keys, and UCL event names.
2. Generate `.env.example` files from app-local schema/tests, not hand-maintained docs.
3. Decide and document package manager ownership per app and remove conflicting lockfiles after CI confirms.
4. Make Verixet the only Stripe/billing authority, with consuming app local data marked as cache/mirror.
5. Add one root CI workflow that runs safe typecheck/test/build commands per app without real secrets.
6. Normalize Turnstile site-key names: Vite apps use `VITE_TURNSTILE_SITE_KEY`, Next apps use `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, all servers use `TURNSTILE_SECRET_KEY`.
7. Standardize XFlow OAuth callback, state, nonce, PKCE, and returnTo tests across all consumers.
8. Standardize UCL/control-plane token selection and required headers.
9. Add shared usage admission preflight and `402 PLAN_LIMIT_EXCEEDED` tests before paid work.
10. Replace env-only "connected" UI states with proof-based health states.

## Phase 1 Contract Cleanup

Date: 2026-05-04

Files added:

- `docs/ecosystem-app-registry.md`
- `docs/ecosystem-root-runbook.md`
- `docs/ecosystem-dirty-tree-safety.md`
- `ecosystem-contracts/apps.json`
- `ecosystem-contracts/env-contract.json`
- `ecosystem-contracts/routes.json`
- `ecosystem-contracts/token-types.json`
- `scripts/validate-ecosystem-contracts.mjs`

Contracts created:

- Canonical app metadata and lowercase slugs: `xflow`, `verixet`, `audaix`, `rataify`, `wordgeni`, `crevux`
- Env contract registry for authority-critical variables found in the initial audit docs
- Cross-app route contract registry for XFlow, Verixet, WordGeni, Crevux, Turnstile, billing, entitlement, usage, OAuth, and UCL flows
- Token type registry for service, UCL, usage ingest, OAuth, Stripe, Turnstile, SendGrid, DB, Sentry, media signing, and JWT secrets

Validation run:

- `node scripts/validate-ecosystem-contracts.mjs`

What changed:

- Added a non-invasive root validator that checks JSON shape, canonical app references, token references, lowercase slugs, duplicate env rows, route auth metadata, UCL headers, app-scoped usage ingest tokens, and undocumented unauthenticated route claims.
- Added a root runbook documenting safe commands, package-manager boundaries, authoritative lockfile ambiguity, allowed env files, forbidden env files, and production-unsafe scripts.
- Added a dirty-tree safety report so Phase 2 work can avoid overwriting unrelated user/runtime changes.
- Added notes to `docs/ecosystem-env-contract.md` and `docs/ecosystem-connection-map.md` pointing to the machine-readable registries.

Intentionally not changed:

- No app runtime route/auth/billing/UCL/Stripe code was changed.
- No package manager or lockfile conflicts were resolved.
- No dirty app work was reverted or cleaned.
- No real env values, secrets, dashboard IDs, Stripe values, OAuth values, or Cloudflare keys were added.
- No full ecosystem test suite was rerun because Phase 1 changed root docs/contracts/scripts only.

Remaining Phase 2 blockers:

1. Generate per-app `.env.example` files from the new env registry or app-local schema tests.
2. Move route paths, app slugs, headers, envelopes, feature keys, and error codes into a shared package consumed by apps.
3. Resolve package-manager/lockfile ownership per app and add a root CI matrix.
4. Normalize Turnstile names and typed errors outside Verixet.
5. Make Verixet the sole production billing/entitlement/usage authority or explicitly mark consumer local billing data as cache/legacy.
6. Standardize OAuth state/nonce/PKCE/returnTo handling across consumers.
7. Standardize UCL token selection, event schema, correlation IDs, and idempotency keys.
8. Replace UI "connected" states based on env presence with proof-based states.
9. Fix current full-suite timeout/auth failures before production readiness.
10. Configure real Railway/provider values and verify fail-closed production behavior.

## Phase 2 Contract Package Start

Date: 2026-05-04

Files added:

- `docs/ecosystem-contract-package.md`
- `packages/ecosystem-contracts/package.json`
- `packages/ecosystem-contracts/tsconfig.json`
- `packages/ecosystem-contracts/src/index.ts`
- `scripts/generate-ecosystem-contract-package.mjs`

Files updated:

- `scripts/validate-ecosystem-contracts.mjs`
- `docs/ecosystem-root-runbook.md`

Validation run:

- `node scripts/generate-ecosystem-contract-package.mjs`
- `node apps/AudAix/dashboard/node_modules/typescript/bin/tsc -p packages/ecosystem-contracts/tsconfig.json --noEmit`
- `node scripts/validate-ecosystem-contracts.mjs`

What changed:

- Added generated package `@xflow-ecosystem/contracts` from the root JSON contract registries.
- Exported canonical app slug, env, route, and token type data with TypeScript types and lookup helpers.
- Extended root contract validation to assert the generated package exists and contains all canonical slugs and token types.

Intentionally not changed:

- No app imports were rewired yet.
- No app runtime source, auth, billing, UCL, Stripe, DB, or env loader code was touched.
- No root package manager was introduced.

## Phase 2 Showcase Contract Adoption

Date: 2026-05-04

Files added:

- `scripts/validate-ecosystem-showcase-contracts.mjs`

Files updated:

- `packages/ecosystem-showcase/src/EcosystemShowcaseSection.tsx`
- `packages/ecosystem-showcase/dist/index.js`
- `packages/ecosystem-showcase/dist/index.d.ts`
- `docs/ecosystem-root-runbook.md`
- `docs/ecosystem-six-app-audit.md`

Validation run:

- `node scripts/validate-ecosystem-showcase-contracts.mjs`
- `npm run typecheck`
- `npm test`
- `npm run build`

What changed:

- Replaced the stale showcase canonical slug `xflowx` with `xflow`.
- Replaced display copy references from `XFlowX` to `XFlow`.
- Left the existing primary URL untouched to avoid inventing or changing production domains during contract cleanup.
- Added a root validator that checks showcase slugs and the `AppSlug` union against `ecosystem-contracts/apps.json`.

Intentionally not changed:

- No consumer app runtime code was changed.
- No production route/auth/billing/UCL logic was changed.
- No domain values were invented.
