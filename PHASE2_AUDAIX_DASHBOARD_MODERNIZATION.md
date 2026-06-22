# Phase 2 AudAix Dashboard Modernization

Date: 2026-06-18

Scope: `apps\AudAix\dashboard` only. No other apps were touched. No deploys, pushes, migrations, secret rotation, production data deletion, backend/scanner/API behavior changes, Lighthouse/Sentry/OpenTelemetry/Drizzle/TensorFlow/Next/PostCSS/Storage/UUID changes, reports, or artifacts were intentionally modified.

## Source Reports

- `PHASE2_POST_XFLOW_VITE_CHECKPOINT.md`
- `PHASE2_VITE_ESBUILD_VITEST_REMEDIATION.md`

## Starting State

- `apps\AudAix` was clean before edits.
- Dashboard production audit passed high threshold.
- Dashboard full audit failed high threshold on dev/tooling:
  - `vite <=6.4.2`
  - `vitest <3.2.6`
  - `ws 8.0.0 - 8.20.1` through `jsdom`
- Dashboard full audit also reported low `@babel/core <=7.29.0` and moderate `js-yaml <=4.1.1`.

## Changes Made

Package changes in `apps\AudAix\dashboard`:

- `vite`: `^6.3.4` -> `6.4.3`
- `vitest`: `^3.0.8` -> `3.2.6`
- `jsdom`: `^26.1.0` -> `29.1.1`
- `@vitejs/plugin-react`: unchanged at `^4.4.1`

Files changed:

- `apps\AudAix\dashboard\package.json`
- `apps\AudAix\dashboard\package-lock.json`
- `apps\AudAix\dashboard\src\pages\ArchitectureDoctorPage.test.tsx`
- `apps\AudAix\dashboard\src\pages\LoginPage.test.tsx`
- `apps\AudAix\dashboard\src\pages\ProjectArchitectPage.test.tsx`
- `apps\AudAix\dashboard\src\pages\SecurityCommandCenterPage.test.tsx`

Test updates were limited to stale dashboard assertions:

- Architecture Doctor tests now select the relevant `reports`, `framework`, `sources`, and `findings` tabs before asserting tab-specific content.
- The removed embedded ASO workflow expectation was replaced with the current link to `/tools/aso-audit`.
- Project Architect tests now use the `findings` tab for scan/finding assertions and current scanner copy.
- Security Command Center tests now assert the current ownership-verified badge text and markdown snippet.
- LoginPage tests now assert the current central XFlow auth handoff for normal sign-in and `mode=recovery` submit, including safe `returnTo` propagation. Legacy Supabase password sign-in is not expected for those paths. Supabase reset-request and reset-password completion tests remain in place, including backup-code consume coverage.

No product source files were modified.

## Commands Run

Pre-edit / audit:

- `git status --short`: clean before edits.
- `npm audit --audit-level=high` in `dashboard`: failed on Vite, Vitest, and `jsdom -> ws` high/critical chain.
- `npm audit --omit=dev --audit-level=high` in `dashboard`: passed, 0 vulnerabilities.
- `npm view jsdom version`: `29.1.1`.

Focused test stabilization:

- `npm run typecheck:test`: passed.
- `npx vitest run src/pages/ArchitectureDoctorPage.test.tsx src/pages/ProjectArchitectPage.test.tsx src/pages/SecurityCommandCenterPage.test.tsx --reporter=basic`: passed, 3 files / 16 tests.

Package update:

- `npm install --save-dev --save-exact vite@6.4.3 vitest@3.2.6 jsdom@29.1.1`: completed.

Post-update dashboard gates:

- `npm run typecheck:test`: passed.
- `npm run build`: passed with Vite `6.4.3`.
- `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.
- `npm audit --audit-level=high`: passed high threshold; remaining findings are low `@babel/core` and moderate `js-yaml`.
- `npm ls vite vitest jsdom ws @vitejs/plugin-react --depth=4`: resolved dashboard `vite@6.4.3`, `vitest@3.2.6`, `jsdom@29.1.1`; command exited `ELSPROBLEMS` because the linked `@xflow-ecosystem/ecosystem-showcase` workspace still reports `vite@7.3.5` invalid against its `^6.3.4` peer/range. This is pre-existing workspace metadata noise and was not changed in this dashboard pass.
- `npx vitest run src/pages/LoginPage.test.tsx --reporter=basic`: passed, 1 file / 5 tests.
- `npm test`: passed, 42 files / 214 tests.

## LoginPage Auth Contract Resolution

Local source and documentation indicate central XFlow auth is the intended current dashboard login contract:

- `dashboard/src/lib/centralAuth.ts` builds XFlow `/auth/start` URLs for AudAix.
- Dashboard auth route tests already cover XFlow-hosted auth handoff URLs.
- AudAix README and auth/billing setup docs describe XFlow as the production identity and OAuth authority, with Supabase kept for legacy/local fallback and reset/recovery completion paths.

Decision: update tests, not product code. Normal sign-in and `mode=recovery` submit are expected to navigate to central XFlow auth. Supabase reset-request and reset-password completion remain covered, including backup-code consume behavior.

## Final Gate Results

Dashboard:

- `npm run typecheck:test`: passed.
- `npx vitest run src/pages/LoginPage.test.tsx --reporter=basic`: passed, 1 file / 5 tests.
- `npm test`: passed, 42 files / 214 tests.
- `npm run build`: passed with Vite `6.4.3`.
- `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.
- `npm audit --audit-level=high`: passed high threshold; remaining findings are low `@babel/core <=7.29.0` and moderate `js-yaml <=4.1.1`.

AudAix root:

- `npm run lint`: passed with pre-existing warnings.
- `npm run typecheck`: passed.
- `npm test`: passed.
- `npm run verify:security`: passed.
- `npm run verify:routes`: passed.
- `npm run verify:env`: passed, `production_env_valid`.
- `npm audit --omit=dev --audit-level=high`: passed high threshold; remaining findings are moderate Lighthouse/OpenTelemetry chain items.
- `npm audit --audit-level=high`: passed high threshold; remaining findings are low/moderate and out of scope for this dashboard pass.

## Audit Status

Cleared at high threshold:

- Dashboard Vite high advisory.
- Dashboard Vitest critical advisory.
- Dashboard `jsdom -> ws` high advisory.

Remaining dashboard audit findings:

- Low: `@babel/core <=7.29.0`
- Moderate: `js-yaml <=4.1.1`

Dashboard production audit:

- Passed high threshold with 0 vulnerabilities.

## Commit Status

AudAix dashboard is safe to commit.

Commit readiness:

- Changed files are limited to dashboard package metadata and focused dashboard tests.
- No product source files were modified.
- No backend scanner/API behavior, report/artifact/storage policy, migrations, deploys, pushes, secret rotation, or production data changes were performed.
- Dashboard Vite/Vitest/jsdom high-threshold advisories are cleared.
- Remaining audit findings are low/moderate and out of scope.

Commit target: `test(audaix): align dashboard auth tests with xflow login`.
