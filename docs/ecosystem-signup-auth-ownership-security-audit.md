# Ecosystem Signup, Auth, Ownership, and Security Boundary Audit

Date: 2026-05-08  
Proof level: static code audit plus local proof script only. No production Stripe, Supabase, or customer mutations were performed.

## Fix Pass Status

Implemented on 2026-05-08:

- WordGeni public email signup no longer calls browser Supabase `signUp`; it builds a centralized XFlow signup URL with `selectedAppSlug=wordgeni`, `planSlug`, `billingInterval`, `signupMode`, email/name context, and a constrained `returnTo`.
- AudAiX dashboard signup mode now redirects to the XFlow start URL instead of calling browser Supabase `signUp`; the URL carries `selectedAppSlug=audaix`, `planSlug`, `billingInterval`, `signupMode`, and `returnTo`.
- CreVux public register is production-disabled unless explicit non-production `CREVUX_LOCAL_PUBLIC_SIGNUP_ENABLED=true`; production responses return `CENTRALIZED_SIGNUP_REQUIRED` and a centralized XFlow URL when configured.
- CreVux runtime checkout/top-up paths are production-disabled unless explicit non-production `CREVUX_LOCAL_BILLING_ENABLED=true`; subscription checkout returns a Verixet URL when configured.
- Rataify now uses the canonical six lowercase app slug model and defaults XFlow token exchange to `/api/oauth/token`; auth start URLs preserve `selectedAppSlug=rataify`, `planSlug`, `billingInterval`, `signupMode`, and allowlisted `returnTo`.
- Verixet free signup UI now shows all six free-tier apps, and the free signup route creates a workspace and returns the canonical six-app free entitlement snapshot.
- Shared Supabase `core.workspace_app_access` writes are now service-role-only; broad authenticated insert/update/delete grants and future default table writes were removed from custom schemas.

Remaining blockers after this pass: none found by `scripts/validate-ecosystem-auth-boundaries.mjs`. Remaining risks still requiring deeper app-local tests are listed in `RISK`.

## Assumptions and Hard Rules

- `apps/XFlow` is the production-authoritative XFlow tree.
- Duplicate XFlow folders such as `apps/XFlow-push-through`, `apps/XFlow-phase4b-pr`, and `apps/xflow-master-release` are `LEGACY/UNCLEAR` unless deployment/config evidence proves otherwise.
- Free signup should grant free-tier access to all six apps per `docs/ecosystem-authority-boundary.md`.
- Fixes must preserve the intended architecture: XFlow identity, Verixet billing/entitlements, shared Supabase canonical data, and satellite delegation.
- Canonical app slugs must be lowercase everywhere: `xflow`, `verixet`, `rataify`, `audaix`, `wordgeni`, `crevux`.
- Folder names may use legacy casing such as `RatAiFy`, `AudAix`, or `CreVux`, but database `app_slug`, entitlement `app_slug`, Stripe metadata, OAuth client records, event-ingest headers, `selectedAppSlug`, and proof tests must use lowercase canonical slugs.
- A CTA only passes if the server-side destination and resulting auth/signup flow are correct. Visible `href` text alone is not proof.
- This audit does not implement large fixes. A small static proof script was added at `scripts/validate-ecosystem-auth-boundaries.mjs`.

## PASS

### XFlow core OAuth contract is mostly aligned

- `apps/XFlow/src/core/oauth/oauth-authorization-code-issue.ts:138` validates authorization redirect URIs by exact registered match.
- `apps/XFlow/src/core/oauth/oauth-token-exchange.ts:78` requires `client_secret`; `apps/XFlow/src/core/oauth/oauth-token-exchange.ts:94` verifies it; `apps/XFlow/src/core/oauth/oauth-token-exchange.ts:169` rejects redirect URI mismatches; PKCE `code_verifier` is required at `apps/XFlow/src/core/oauth/oauth-token-exchange.ts:118`.
- `apps/XFlow/src/core/oauth/oauth-userinfo.ts:33` authorizes `/oauth/userinfo` through bearer token validation.
- `apps/XFlow/src/lib/ecosystem/central-auth-state.ts` signs and validates ecosystem auth state with HMAC and timing-safe comparison.
- `apps/XFlow/src/lib/ecosystem/return-url.ts:78` validates ecosystem return URLs against app-specific allowlists and rejects unsafe production localhost/HTTP patterns.

Proof: `node scripts/validate-ecosystem-auth-boundaries.mjs` passes the XFlow OAuth/state checks.

### XFlow event ingest has server-side auth shape and local route tests

- `apps/XFlow/src/app/api/control-plane/events/route.ts:48` reads a bearer from `Authorization`.
- `apps/XFlow/src/app/api/control-plane/events/route.ts:215` passes `bearerToken`, normalized body, and inbound app slug header to `executeEventIngestCommand`.
- `apps/XFlow/src/infra/events/ingest-event.ts:106` rejects missing bearer with 401.
- `apps/XFlow/src/infra/events/ingest-event.ts:241` rejects mismatched header and payload app slugs.
- `apps/XFlow/tests/unit/api-control-plane-events-route.test.ts:197` covers 401 auth failure and `apps/XFlow/tests/unit/api-control-plane-events-route.test.ts:241` covers 403 non-auth ingest rejection.

Proof gap: add a direct infra/core test proving an OAuth user token cannot satisfy event ingest bearer verification and proving bearer/app slug mismatch fails after credential lookup.

### Canonical lowercase slug registries exist

- XFlow includes all six lowercase app slugs in `apps/XFlow/src/lib/ecosystem/apps.ts`.
- Verixet includes all six lowercase app slugs in `apps/Verixet/src/lib/billing/canonical-catalog.ts`.
- The ecosystem registry document maps legacy folder casing to canonical lowercase app identity in `docs/ecosystem-app-registry.md`.

### Several shared Supabase authority policies are correctly service-role-only

- `supabase/migrations/002_core_rls.sql:118` makes `core.app_connections` writes service-role-only and source-bound to XFlow.
- `supabase/migrations/002_core_rls.sql:127` makes `core.entitlements` writes service-role-only and source-bound to Verixet.
- App-schema RLS migrations generally route app data reads through workspace membership/app access and keep writes service-role-only.

### WordGeni API auth proxy is disabled

- `apps/WordGeni/apps/web/src/lib/hono-auth-proxy.ts:4` returns 410 for local API auth proxy routes.
- `apps/WordGeni/apps/web/src/app/api/ecosystem/auth/handoff/route.ts:128` exchanges XFlow handoff tokens server-side and `apps/WordGeni/apps/web/src/app/api/ecosystem/auth/handoff/route.ts:111` restricts `returnTo` to safe relative paths.

## FIXED BLOCKERS

### WordGeni web local signup disabled

- File: `apps/WordGeni/apps/web/src/context/AuthContext.tsx:148`
- Route/component/function: `AuthProvider.register`
- Fixed status: `apps/WordGeni/apps/web/src/components/auth/sign-up-form.tsx` now redirects email signup to centralized XFlow signup, and `apps/WordGeni/apps/web/src/context/AuthContext.tsx` no longer calls `supabase.auth.signUp`.
- Supporting UI: `apps/WordGeni/apps/web/src/components/auth/sign-up-form.tsx:57` calls `register(email, password, name)` and `apps/WordGeni/apps/web/src/components/auth/sign-up-form.tsx:89` labels the path "Create with email".
- Exact fix: in production, replace email signup submit with XFlow `/auth/start` or XFlow `/api/auth/signup/start` delegation carrying `selectedAppSlug=wordgeni`, `planSlug`, `billingInterval`, `returnTo`, and `signupMode`. Keep local Supabase signup only behind explicit development/test gating, or remove it.
- Proof test: assert WordGeni signup form no longer imports/calls `register` for production signup; assert the generated URL/body preserves `selectedAppSlug=wordgeni` and rejects unsafe `returnTo`.

### CreVux public local register production-disabled

- File: `apps/CreVux/artifacts/api-server/src/routes/auth.ts:477`
- Route/component/function: `POST /auth/register`
- Fixed status: `apps/CreVux/artifacts/api-server/src/routes/auth.ts` now blocks the local register route outside explicit non-production mode and returns `CENTRALIZED_SIGNUP_REQUIRED` with a XFlow URL when configured.
- Supporting UI: `apps/CreVux/artifacts/image-gen/src/pages/RegisterPage.tsx:91` calls `authRegister`, and `apps/CreVux/artifacts/image-gen/src/pages/RegisterPage.tsx:185` exposes "Email fallback".
- Exact fix: disable `POST /auth/register` in production or make it return a 308/410 delegating to XFlow. Replace first-user `owner` with customer workspace owner semantics only. Move credit grants to Verixet entitlement snapshots.
- Proof test: unauthenticated `POST /auth/register` must reject/delegate in production mode; first customer signup must not create an ecosystem app owner or platform admin.

### CreVux local checkout production-disabled

- File: `apps/CreVux/artifacts/api-server/src/routes/billing.ts:184`
- Route/component/function: `POST /billing/checkout-session`
- Fixed status: `apps/CreVux/artifacts/api-server/src/routes/billing.ts` now blocks local billing outside explicit non-production mode; subscription checkout returns a centralized Verixet URL when configured, and top-up returns `CENTRALIZED_BILLING_REQUIRED`.
- Exact fix: make CreVux billing routes delegate to Verixet checkout/portal APIs with canonical `selectedAppSlug=crevux` and workspace/user context. Remove app-local Stripe secret requirements from production CreVux.
- Proof test: calling CreVux checkout in production mode should produce a Verixet redirect/request, not a local Stripe session; a static secret scan should find no `STRIPE_SECRET_KEY` dependency in CreVux runtime billing paths.

### AudAiX browser Supabase signup fallback removed

- File: `apps/AudAix/dashboard/src/pages/LoginPage.tsx:141`
- Route/component/function: dashboard login/signup fallback
- Fixed status: `apps/AudAix/dashboard/src/pages/LoginPage.tsx` no longer calls browser Supabase `signUp`; signup mode redirects to the centralized XFlow URL with AudAiX intent.
- Exact fix: hide or remove local Supabase auth in production; keep only XFlow auth start. If a break-glass fallback is required, gate it with a server-validated development/test flag and make production builds fail if enabled.
- Proof test: production dashboard render must not include a form path that calls `supabase.auth.signUp`; auth CTA must resolve to XFlow and preserve AudAiX return intent.

### AudAiX ecosystem bundle logic covers six apps

- File: `apps/AudAix/src/routes/ecosystem-auth-routes.ts:52`
- Route/component/function: `ECOSYSTEM_STARTER_INCLUDED_APPS`, `/api/ecosystem/apps`, `/api/billing/checkout`
- Fixed status: `apps/AudAix/src/routes/ecosystem-auth-routes.ts` now uses the canonical six-app list and advertises `full-ecosystem` with `appCount: 6`.
- Exact fix: replace the local four-app constant with the canonical six-app list, or delegate bundle membership entirely to Verixet without AudAiX constructing bundle app lists.
- Proof test: AudAiX bundle checkout request includes `xflow,verixet,rataify,audaix,wordgeni,crevux` in lowercase and rejects legacy partial bundles unless explicitly named legacy/test.

### Verixet free signup returns six-app free baseline

- File: `apps/Verixet/src/components/auth/SignUpForm.tsx:46`
- Route/component/function: `PLAN_SUMMARIES.free`
- Fixed status: `apps/Verixet/src/components/auth/SignUpForm.tsx` now shows all six apps for free; `apps/Verixet/src/app/api/auth/sign-up/route.ts` creates a workspace for free signup and returns `getEcosystemEntitlementSnapshot`.
- File: `apps/Verixet/src/app/api/auth/sign-up/route.ts:108`
- Route/component/function: `POST /api/auth/sign-up`
- Why unsafe/misaligned: For non-ecosystem-trial signup, `selectedAppSlugs` defaults to the source app or submitted selected apps, not all six. The free branch returns `{ ok: true }` at `apps/Verixet/src/app/api/auth/sign-up/route.ts:336`; this audit did not find direct proof in that route that baseline six-app entitlements are created before completion.
- Exact fix: free signup must call the canonical Verixet free-baseline grant path for all six apps, then return a snapshot. The UI summary should show all six free-tier apps or clearly distinguish non-production/local-only copy.
- Proof test: local fixture creates a free signup and asserts six `app_slug` free entitlements, no paid access, and baseline remains after cancellation.

### Shared Supabase app access writes are service-role-only

- File: `supabase/migrations/002_core_rls.sql:109`
- Route/component/function: RLS policy `workspace_app_access_admin_write`
- Fixed status: `supabase/migrations/002_core_rls.sql` replaced workspace-admin writes with `workspace_app_access_service_write`; `supabase/migrations/100_api_role_grants.sql` no longer grants broad authenticated insert/update/delete across custom schemas.
- Exact fix: replace this policy with service-role-only writes through Verixet/XFlow trusted server routes. Workspace admins may request changes through APIs, but direct table writes should be denied.
- Proof test: authenticated workspace admin attempting direct insert/update/delete on `core.workspace_app_access` must fail; Verixet service-role grant path must pass.

## RISK

### Rataify still carries local signup and legacy four-app/xflowx model

- File: `apps/RatAiFy/server/routes/auth.ts:685`
- Route/component/function: `POST /api/auth/signup`
- Risk: The route is production-gated at `apps/RatAiFy/server/routes/auth.ts:687`, but it remains an active local signup implementation if `RATAIFY_LOCAL_PUBLIC_SIGNUP_ENABLED=true`. The UI still posts `/api/auth/signup` at `apps/RatAiFy/client/src/pages/signup.tsx:139` in the local fallback path.
- File: `apps/RatAiFy/server/services/ecosystem.ts:11`
- Risk: `EcosystemAppSlug` still uses `"xflowx" | "verixet" | "rataify" | "audaix"` instead of the canonical six lower-case slugs. Token defaults also point at `/api/auth/token` at `apps/RatAiFy/server/services/ecosystem.ts:61`, while XFlow's current contract is `/api/oauth/token`.
- Exact fix: keep the local signup route disabled or return 410/delegate in production; replace legacy slug model with the canonical six; default token URL to `/api/oauth/token`; add WordGeni/CreVux to entitlement checks.
- Proof test: production signup page and server route must resolve to XFlow/Verixet only; app access checks must accept all six canonical slugs and reject `xflowx` except in explicit migration compatibility tests.

### Satellite auth starts often omit full signup intent

- Rataify: `apps/RatAiFy/server/lib/ecosystemAuthMode.ts:45` builds XFlow auth start with `returnTo`, but no `selectedAppSlug`, `planSlug`, `billingInterval`, or `signupMode`.
- CreVux: `apps/CreVux/artifacts/api-server/src/routes/auth.ts:1760` builds XFlow return behavior, but does not preserve pricing/signup intent fields.
- AudAiX: `apps/AudAix/src/routes/universal-auth-routes.ts:193` delegates signup to `AUDAIX_ECOSYSTEM_SIGNUP_URL`, but its request uses `selectedPlanSlug` rather than the XFlow signup-start contract fields.
- Risk: CTAs can visually point at auth routes while losing selected app, plan, interval, or return intent before server-side auth/payment/entitlement resolution.
- Exact fix: standardize the browser shim contract for all satellites: `selectedAppSlug`, `planSlug`, `billingInterval`, `returnTo`, `signupMode`, and signed state. Validate `returnTo` server-side against per-app origins.
- Proof test: each app's CTA server handler resolves to XFlow/Verixet with the full signed intent and rejects tampered state/returnTo.

### Verixet accepts legacy `xflowx` in billing tests

- File: `apps/Verixet/src/lib/billing/ecosystem-billing.test.ts:18`
- Route/component/function: billing plan selection tests
- Risk: Tests still use `selectedAppSlugs: ["xflowx", ...]`. The production code normalizes aliases in places, but proof tests should use lowercase canonical slugs so legacy aliases do not mask metadata drift.
- Exact fix: update tests and checkout metadata expectations to use `xflow`; keep alias handling only in named migration tests.
- Proof test: `xflowx` should be rejected in production checkout metadata or normalized before any persisted Stripe/shared database write.

### XFlow signup creates an account before Verixet completion

- File: `apps/XFlow/src/app/api/auth/signup/start/route.ts:131`
- Route/component/function: `POST /api/auth/signup/start`
- Risk: XFlow calls `createSignupAccount` before creating a Verixet signup context at `apps/XFlow/src/app/api/auth/signup/start/route.ts:174`. This can be acceptable for identity bootstrap, but only if no satellite app access is granted until Verixet confirms free or paid entitlements.
- Exact fix: document this as identity-only pre-admission state, block app access until Verixet completion, and add a test proving pre-completion accounts have no paid/app access except explicitly pending identity state.
- Proof test: signup-start without Verixet completion creates no active `workspace_app_access` or paid entitlement rows.

### XFlow auth state secret has fallback names

- File: `apps/XFlow/src/lib/ecosystem/return-url.ts:27`
- Route/component/function: `getEcosystemAuthStateSecret`
- Risk: The function falls back from `ECOSYSTEM_AUTH_STATE_SECRET` to `AUTH_SECRET`/`NEXTAUTH_SECRET`. This may be operationally useful, but the contract says OAuth state should use `ECOSYSTEM_AUTH_STATE_SECRET` or the current explicit equivalent.
- Exact fix: make production require `ECOSYSTEM_AUTH_STATE_SECRET`, or document and validate the approved equivalent in a startup check.
- Proof test: production config validation fails when no explicit ecosystem auth state secret/equivalent is set.

### Broad authenticated grants rely on perfect RLS

- File: `supabase/migrations/100_api_role_grants.sql:13`
- Route/component/function: API role grants/default privileges
- Risk: `authenticated` receives select/insert/update/delete on all tables across `core`, `xflow`, `verixet`, `audaix`, `rataify`, `wordgeni`, and `crevux`, and future default privileges at `supabase/migrations/100_api_role_grants.sql:29`. RLS reduces exposure, but a missing future policy would become severe.
- Exact fix: remove broad write/default grants to `authenticated`; grant per-table operations only after RLS is enabled and tested.
- Proof test: migration validation should fail if any system/entitlement/app catalog table has broad authenticated write privileges.

### Audit logs are readable by all workspace members

- File: `supabase/migrations/002_core_rls.sql:149`
- Route/component/function: `audit_logs_select_member`
- Risk: Every workspace member can read workspace audit logs. That may expose support/admin/security events beyond normal customer-user scope.
- Exact fix: restrict audit visibility to workspace owner/admin and ecosystem support/super-admin server routes.
- Proof test: regular workspace member select from `core.audit_logs` must fail unless explicitly scoped to user-visible events.

### WordGeni web has server admin helper in web tree

- File: `apps/WordGeni/apps/web/src/lib/supabase/env.ts:17`
- Route/component/function: `requireSupabaseServerEnv`
- Risk: `SUPABASE_SERVICE_ROLE_KEY` is referenced in the web app tree and used by `apps/WordGeni/apps/web/src/lib/supabase/admin.ts:7`. This appears intended for server-only code, but the same web tree also contains client signup code. A bundling/import boundary proof is required.
- Exact fix: enforce server-only imports with `server-only`, add lint/static test blocking `admin.ts` from client components, and keep service-role helpers outside shared client import paths.
- Proof test: frontend bundle/static import scan must prove no client component imports `apps/WordGeni/apps/web/src/lib/supabase/admin.ts` or `env.ts` server function.

## LEGACY/UNCLEAR

- Duplicate XFlow folders exist: `apps/XFlow-push-through`, `apps/XFlow-phase4b-pr`, and `apps/xflow-master-release`. Treat them as legacy unless deployment config proves otherwise.
- Rataify local signup exists but is production-gated. It is acceptable only as explicit dev/test fallback.
- AudAiX labels local Supabase auth as "Legacy fallback" but still renders it when Supabase is configured.
- WordGeni API auth proxy is disabled, but WordGeni web client Supabase auth remains active.
- CreVux local auth/billing appears to be a pre-ecosystem implementation and remains wired into web/mobile runtime paths.
- WordGeni API still contains Stripe billing routes and local/shared Supabase runtime modes; classify as legacy unless production env proves `WORDGENI_ENABLE_BILLING` and local auth/billing are disabled in favor of Verixet.

## Signup/CTA Matrix

| App | Observed CTA/auth path | Result |
| --- | --- | --- |
| XFlow | `/api/auth/signup/start`, OAuth routes, Verixet handoff | `PASS/RISK`: central identity path exists; account creation precedes Verixet completion and needs no-access proof. |
| Verixet | `SignUpForm` posts `/api/auth/sign-up`; checkout route posts `/api/billing/checkout` | `FAIL/RISK`: billing authority exists, but free baseline and direct Supabase signup need contract proof/alignment. |
| Rataify | Signup page first offers ecosystem auth, but fallback posts `/api/auth/signup` | `RISK`: production gate exists; legacy slug/token defaults remain. |
| AudAiX | Login page has XFlow CTA plus Supabase legacy fallback | `FAIL`: browser local signup/login remains active. |
| WordGeni | Pricing payload is lowercase, but signup form calls local `register` | `FAIL`: public local Supabase signup remains active. |
| CreVux | Pricing/register routes land on `RegisterPage`, which calls local `authRegister` | `FAIL`: public local signup and local Stripe remain active. |

## Required Proof Status

| Proof | Status |
| --- | --- |
| Each app signup/pricing CTA resolves to XFlow/Verixet and preserves intent | `FAIL`: local paths remain in AudAiX, WordGeni, CreVux; Rataify/CreVux omit complete intent fields. |
| `selectedAppSlug` preserved | `RISK`: not consistently carried by satellite auth-start builders. |
| `returnTo` preserved and validated | `PASS/RISK`: XFlow validates; Verixet UI and satellite builders need stricter per-app allowlist proof. |
| Invalid `returnTo` rejected | `PASS` in XFlow unit coverage; add satellite-specific proof. |
| OAuth state tampering rejected | `PASS` for XFlow signed state; add end-to-end satellite callback proof. |
| XFlow token exchange succeeds | `PASS` by static contract; run targeted OAuth tests before release. |
| `/oauth/userinfo` rejects invalid tokens | `PASS` by bearer auth path; run targeted unit test. |
| Free signup creates six-app baseline entitlements | `FAIL/RISK`: Verixet route/UI do not prove it; separate script exists but route integration proof is missing. |
| Paid app creates app-specific entitlement | `RISK`: Verixet has checkout authority, but satellite local billing paths can bypass it. |
| Ecosystem bundle creates six-app entitlement | `FAIL`: AudAiX bundle code has four apps; Verixet tests still include `xflowx`. |
| Regular user cannot access super-admin APIs | `RISK`: server-side checks exist in places, but CreVux first-user owner pattern is unsafe. |
| Workspace admin cannot mutate ecosystem app catalog/access | `FAIL`: workspace admins can write `core.workspace_app_access`. |
| Service-role keys not exposed in frontend bundles | `RISK`: no direct client import was proven, but WordGeni web server admin helper needs bundling proof. |
| Valid Verixet event ingest returns 201 | `PASS` in XFlow route tests with mocked ingest command. |
| Missing/wrong event bearer rejected | `PASS/RISK`: route tests cover 401; add infra-level OAuth-token-as-event-bearer rejection proof. |

## RECOMMENDED FIXES

1. Security blockers
   - Disable CreVux public local register and local Stripe checkout/top-up in production.
   - Remove AudAiX and WordGeni browser-local signup from production builds.
   - Replace `workspace_app_access_admin_write` with service-role-only Verixet/XFlow authority.
   - Remove broad authenticated schema write/default grants or narrow them table-by-table.

2. Signup/auth routing blockers
   - Standardize satellite auth-start parameters: `selectedAppSlug`, `planSlug`, `billingInterval`, `returnTo`, `signupMode`, signed state.
   - Update Rataify default token URL to XFlow `/api/oauth/token`.
   - Replace Rataify `xflowx`/four-app model with the canonical six lowercase slugs.
   - Gate or remove all legacy local auth routes from production paths.

3. Entitlement/billing blockers
   - Make Verixet free signup create and return six-app free baseline entitlement snapshots.
   - Make AudAiX bundle/full-ecosystem logic delegate to Verixet or use the canonical six-app list.
   - Ensure paid single-app plans unlock only that app tier; ecosystem bundles unlock all six.
   - Ensure cancellations downgrade paid access while preserving baseline free access.

4. Super-admin/workspace boundary blockers
   - Split platform/super-admin roles from workspace owner/admin roles in DB, API guards, and UI.
   - Remove first-user-is-platform-owner behavior from CreVux production signup.
   - Add server-side tests that regular users and workspace admins cannot mutate app catalog, OAuth clients, billing config, entitlement rows, or event ingest credentials.

5. Legacy cleanup
   - Mark duplicate XFlow folders as non-authoritative in docs/deployment manifests or remove them.
   - Move local auth/billing fallback routes behind explicit dev/test env checks and make production startup fail if enabled.
   - Keep `xflowx` alias support only in migration code, not production app identity or proof tests.

6. Naming/documentation cleanup
   - Use lowercase canonical slugs in all docs, Stripe metadata, OAuth client records, event-ingest headers, and tests.
   - Add a CI static proof that rejects new noncanonical app slugs in app identity, entitlement, or billing paths.

## Local Validation

Boundary proof command:

```bash
node scripts/validate-ecosystem-auth-boundaries.mjs
```

Result after fix pass: exited `0`.

```text
Summary: 15/15 checks pass or are informational; 0 blockers/risks remain.
```

App-local validation commands:

```text
apps/XFlow> npm run typecheck
Result: PASS

apps/AudAix> npm run test:ci
Result: PASS
Test Files: 84 passed, 2 skipped (86)
Tests: 405 passed, 2 skipped (407)

apps/RatAiFy> npm run test:billing
Result: PASS
Tests: 61 passed

apps/RatAiFy> npm run test:ops
Result: FAIL
Known remaining failures:
- `premium signup page preserves free, paid, and ecosystem plan selection contracts` still expects the older `/auth/security-setup` contract.
- `intentional page orphans are explicitly allowlisted` reports `@/pages/marketing/rataify/PublicPlaceholderPage`.
- `tracked env templates keep sensitive keys blank` reports missing blank `GITHUB_CLIENT_SECRET=`.

apps/Verixet> npm run typecheck
Result: FAIL
Compiler cannot resolve local shared Supabase package imports such as `@xflow-ecosystem/supabase/service-role.server`, `@xflow-ecosystem/supabase`, and `@xflow-ecosystem/supabase/types`; smoke scripts also surface related `unknown` type errors.

apps/CreVux> pnpm run typecheck
Result: FAIL
Local dependency is missing: `apps/CreVux/node_modules/typescript/bin/tsc`.

apps/WordGeni> pnpm test -- --runInBand apps/web/src/components/auth/sign-up-form.test.ts apps/web/src/app/api/ecosystem/auth/handoff/route.test.ts apps/api/src/supabase/runtime.server.test.ts
Result: FAIL
Local test runner dependency is missing: `turbo` is not recognized.
```
