# Phase 2 Vite / esbuild / Vitest Remediation

Date: 2026-06-17

Source of truth: `K:\XFlow-Ecosystem Workspace\PHASE2_BASELINE.md`

## Scope and app order

Baseline affected apps for the Vite/esbuild/Vitest chain:

1. AudAix
2. RatAiFy
3. WordGeni
4. XFlow
5. CreVux

Planned app order printed before edits: AudAix, RatAiFy, WordGeni, XFlow, CreVux.

Work stopped on AudAix before commit because the dashboard Vitest suite failed after the targeted toolchain upgrade. No later app was edited.

## Audit-before-edit inventory

### AudAix

- Current before edit, root: `vitest` range `^3.2.6`, resolved `3.2.6`; no direct `vite`; no `@vitest/ui`; no direct `esbuild`; `tsx` range `^4.19.3`, resolved `4.22.0`.
- Current before edit, dashboard: `vite` range `^6.3.4`, resolved `6.4.2`; `vitest` range `^3.0.8`, resolved `3.2.4`; no `@vitest/ui`; `jsdom` range `^26.1.0`.
- `esbuild` before edit: root `vite@7.3.5 -> esbuild@0.27.7`; root `tsx@4.22.0 -> esbuild@0.28.1`; dashboard `vite@6.4.2 -> esbuild@0.27.7`.
- Vite plugins: dashboard `@vitejs/plugin-react`.
- Vitest config files: `vitest.config.ts`, `dashboard/vite.config.ts`, `dashboard/vitest.config.ts`.
- Test environment usage: root node environment; dashboard jsdom environment.
- Expected files to edit: `package.json`, `package-lock.json`, `dashboard/package.json`, `dashboard/package-lock.json`.

### RatAiFy

- Current before this Vite task: `vite` range `^6.3.4`, resolved `6.4.3`; `vitest` range `^4.1.9`, resolved `4.1.9`; `@vitest/ui` range `^4.1.9`; direct `esbuild` range `^0.27.2`, resolved `0.27.7`; `tsx` range `^4.19.1`, resolved `4.22.4`.
- Additional affected package area: `packages/ecosystem-showcase` has `vite` range `^6.3.4` and `vitest` range `^3.0.8`.
- Vite plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`, Replit Vite plugins.
- Test environment usage: jsdom.
- Expected files to edit if reached: RatAiFy package manifest and lockfile only as needed for Vite/esbuild/Vitest.
- Status: not edited in this pass.

### WordGeni

- Current before this Vite task: workspace packages include `vitest@3.2.6`, `vite@7.3.5`, `tsx@4.21.0`, `esbuild@0.27.7`, and `jsdom@26.1.0`.
- Additional path noted: `apps/api` includes `drizzle-kit@1.0.0-rc.1 -> esbuild@0.25.12`; this is outside the Vite/esbuild/Vitest scope unless inseparable from the toolchain remediation.
- Expected files to edit if reached: workspace package manifest and lockfile only as needed for Vite/esbuild/Vitest.
- Status: not edited in this pass.

### XFlow

- Current before this Vite task: `vitest` range `^2.1.6`, resolved `2.1.9`; `vite` resolved `5.4.21`; `esbuild` resolved `0.21.5`; `tsx` resolved `4.22.4` with `esbuild@0.28.1`; `jsdom` resolved `29.1.1`; no `@vitest/ui`.
- Vitest config file: `vitest.config.mts`.
- Test environment usage: node.
- Expected files to edit if reached: package manifest and lockfile only as needed for Vite/esbuild/Vitest.
- Status: not edited in this pass.

### CreVux

- Current before this Vite task: root `tsx@4.21.0 -> esbuild@0.27.7`; `@workspace/api-server` has `vitest@4.1.9`, `vite@6.4.3`, direct `esbuild@0.27.7`; `@workspace/image-gen` has `vite@8.0.16`, `vitest@4.1.9`, `jsdom@24.1.3`, `@vitejs/plugin-react@6.0.1`, `@tailwindcss/vite@4.2.4`; `@workspace/mockup-sandbox` has `vite@8.0.16`; `packages/ecosystem-showcase` has `vite@6.4.3`, `vitest@3.2.6`, `jsdom@26.1.0`, `esbuild@0.27.7`.
- Expected files to edit if reached: package manifests and `pnpm-lock.yaml` only as needed for Vite/esbuild/Vitest.
- Status: not edited in this pass.

## AudAix remediation attempted

Chosen approach: same-major patch/minor updates plus a scoped npm override for the root transitive `esbuild` advisory.

Packages changed:

- Root `esbuild`: transitive `0.27.7` via Vite before; after `overrides.esbuild = 0.28.1`.
- Root `vitest`: unchanged, `^3.2.6` / resolved `3.2.6`.
- Root `tsx`: unchanged range `^4.19.3`; resolved `4.22.0` with overridden `esbuild@0.28.1`.
- Dashboard `vite`: `^6.3.4` / resolved `6.4.2` before; `^6.4.3` / resolved `6.4.3` after.
- Dashboard `vitest`: `^3.0.8` / resolved `3.2.4` before; `^3.2.6` / resolved `3.2.6` after.

Files changed:

- `K:\XFlow-Ecosystem Workspace\apps\AudAix\package.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\package-lock.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\dashboard\package.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\dashboard\package-lock.json`

Config/test harness changes: none.

Schema/migration impact: none. No migrations were generated or run.

## AudAix commands run

- `git status --short`: showed only the four AudAix package files changed.
- `npm install --prefix dashboard vite@6.4.3 vitest@3.2.6 --save-dev`: completed.
- `npm install`: completed and applied the root `esbuild` override.
- `npm run lint`: passed; existing warnings remained.
- `npm run typecheck`: passed.
- `npm test`: passed; root suite reported 109 files passed, 2 skipped; 595 tests passed, 2 skipped.
- `npm test --prefix dashboard`: failed. Failing files included `SecurityCommandCenterPage.test.tsx`, `ArchitectureDoctorPage.test.tsx`, and `ProjectArchitectPage.test.tsx`; failures were UI expectation/query mismatches such as missing `AudAiX Verified eligible`, duplicate `Architecture Doctor` headings, missing `Service-layer boundaries`, and missing numeric text `10`.
- `npm run build --prefix dashboard`: passed.
- `npm run build`: skipped because the root build still runs `npm ci --prefix dashboard`; current instructions prohibit running that build unless package installs are explicitly approved for AudAix.
- `npm run verify:security`: passed.
- `npm run verify:routes`: passed.
- `npm run verify:env`: passed with `production_env_valid`.
- `npm audit --audit-level=high`: passed high threshold; remaining root findings are 17 moderate vulnerabilities in the Lighthouse/Sentry/OpenTelemetry chain and are out of scope.
- `npm audit --omit=dev --audit-level=high`: passed high threshold; same moderate Lighthouse/Sentry/OpenTelemetry chain remained.
- `npm audit --audit-level=high` in `dashboard`: failed due `ws@8.0.0 - 8.20.1` through `jsdom`, plus `@babel/core` low and `js-yaml` moderate. These are not Vite/esbuild/Vitest advisories.
- `npm audit --omit=dev --audit-level=high` in `dashboard`: passed with 0 vulnerabilities.

## Advisories cleared

AudAix:

- Dashboard Vite high advisory cleared by moving resolved Vite from `6.4.2` to `6.4.3`.
- Dashboard Vitest critical advisory cleared by moving resolved Vitest from `3.2.4` to `3.2.6`.
- Root transitive esbuild low advisory cleared by overriding `esbuild` to `0.28.1`.

## Advisories remaining

AudAix:

- Root: 17 moderate advisories remain in the Lighthouse/Sentry/OpenTelemetry chain. This chain is explicitly out of scope for this remediation.
- Dashboard: full dev audit still has `ws` high through `jsdom`, `@babel/core` low, and `js-yaml` moderate. Dashboard production audit is clean. The `ws`/`jsdom` chain is not part of the requested Vite/esbuild/Vitest chain.

Other affected apps:

- RatAiFy, WordGeni, XFlow, and CreVux were not changed because AudAix did not pass all gates.

## Commit safety

AudAix is not safe to commit yet.

Reasons:

- Required dashboard test gate failed after the Vite/Vitest upgrade.
- Root build was intentionally skipped under the known AudAix special handling because it runs `npm ci --prefix dashboard`.
- Dashboard full audit still has an out-of-scope `jsdom -> ws` high advisory, although production audit is clean.

No commit was created. No push was performed. No deploys, migrations, secret rotations, data deletion, schema changes, or app behavior changes were performed.

## Manual approvals still needed

- Decide whether to treat the dashboard Vitest failures as pre-existing/test-expectation debt or approve small test-harness/test updates if they are proven to be directly caused by the Vitest upgrade.
- Decide whether the dashboard `jsdom -> ws` high advisory should be included in scope; it is outside the stated Vite/esbuild/Vitest dependency-chain scope.
- Approve running the root AudAix build if its `npm ci --prefix dashboard` behavior is acceptable for this remediation pass.

## AudAix cleanup on 2026-06-18

Current dirty files before cleanup:

- `package.json`
- `package-lock.json`
- `dashboard/package.json`
- `dashboard/package-lock.json`

Dashboard failure cause: the rerun confirmed `dashboard` test typechecking passed, but `vitest run` failed with 11 UI assertion/query failures across `ArchitectureDoctorPage.test.tsx`, `ProjectArchitectPage.test.tsx`, and `SecurityCommandCenterPage.test.tsx`. The failure class was broader dashboard UI expectation mismatch, not a simple Vite config issue, jsdom/happy-dom environment issue, ESM/CJS issue, React runtime issue, or fake timer issue.

Decision: revert the AudAix Vite/esbuild/Vitest package changes. Fixing would require product test expectation updates or product behavior judgment, which is outside this cleanup scope.

Files reverted:

- `K:\XFlow-Ecosystem Workspace\apps\AudAix\package.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\package-lock.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\dashboard\package.json`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix\dashboard\package-lock.json`

Commands run during cleanup:

- `git status --short`: showed only the four AudAix package files dirty before revert.
- `git diff --name-only`: showed only the four AudAix package files before revert.
- `npm test --prefix dashboard`: timed out before returning final output.
- `npm run typecheck:test` in `dashboard`: passed.
- `npx vitest run --reporter=verbose` in `dashboard`: failed with 11 UI assertion/query failures.
- `git restore -- package.json package-lock.json dashboard/package.json dashboard/package-lock.json`: reverted the attempted Vite/esbuild/Vitest package metadata changes.
- `git status --short`: clean after revert.
- `git diff --name-only`: clean after revert.

Audit status: no new audit commands were run after the revert because the dependency changes were removed. The previous attempted state cleared the targeted Vite/Vitest/esbuild advisories but could not be committed because dashboard tests failed. The dashboard full-audit `jsdom -> ws` high remains out of scope for this chain.

Final cleanup status: AudAix is clean. The AudAix Vite/esbuild/Vitest attempt was reverted and no commit was created. No deploys, pushes, migrations, secret rotations, production data deletion, product behavior changes, auth/scanner/public API changes, report/artifact/storage policy changes, or unrelated dependency-chain changes were performed.

## XFlow final remediation on 2026-06-18

Source of truth: `PHASE2_CLEAN_STATE_CHECKPOINT.md` identified XFlow as the only remaining high-threshold full-audit failure, limited to the dev/tooling Vite/Vitest/esbuild chain. Production-only high-threshold audit was already clean before this pass.

### Advisory path

- `vitest@2.1.9`
- `@vitest/mocker@2.1.9`
- `vite-node@2.1.9`
- `vite@5.4.21`
- `vite -> esbuild@0.21.5`

Out-of-scope audit path still present at moderate severity only:

- `postcss <8.5.10 -> next -> @sentry/nextjs / next-auth`

### Versions before and after

- `vitest`: `^2.1.6` / resolved `2.1.9` -> `3.2.6` / resolved `3.2.6`
- `vite`: transitive resolved `5.4.21` -> direct dev dependency `6.4.3` / resolved `6.4.3`
- `vite-node`: `2.1.9` -> `3.2.4`
- `@vitest/mocker`: `2.1.9` -> `3.2.6`
- Vite `esbuild`: `0.21.5` -> `0.25.12`
- `tsx`: unchanged, resolved `4.22.4`; its `esbuild@0.28.1` path was already patched.
- `jsdom`: unchanged, resolved `29.1.1`.
- `@vitest/ui`: not present before or after.

### Files changed

- `K:\XFlow-Ecosystem Workspace\apps\XFlow\package.json`
- `K:\XFlow-Ecosystem Workspace\apps\XFlow\package-lock.json`

Config/test harness changes: none.

Source, route, auth, operator, API, UI, schema, migration, scanner, media, storage, secret, and production behavior changes: none.

### Commands run and results

- `git status --short`: initially clean; after update only `package.json` and `package-lock.json` modified.
- `npm audit --audit-level=high`: failed before on the dev/tooling Vite/Vitest/esbuild chain; passed after remediation with only 4 moderate Next/PostCSS advisories remaining.
- `npm audit --omit=dev --audit-level=high`: passed before and after; production high threshold remained clean.
- `npm ls vite vitest @vitest/ui esbuild vite-node tsx jsdom --depth=3`: confirmed `vite@6.4.3`, `vitest@3.2.6`, `vite-node@3.2.4`, `@vitest/mocker@3.2.6`, Vite `esbuild@0.25.12`, `tsx@4.22.4`, and `jsdom@29.1.1`.
- `npm install --save-dev --save-exact vitest@3.2.6 vite@6.4.3`: completed.
- `npm run lint`: passed with existing Chronicle warnings and Next lint deprecation notice.
- `npm run typecheck`: passed.
- `npm test`: passed; 542 files passed, 1 skipped; 2646 tests passed, 2 skipped.
- `npm run build`: passed; build surfaced the same Chronicle lint warnings.
- `npm run verify:security`: passed.
- `npm run verify:routes`: passed.
- `npm run verify:env`: passed; Env Doctor reported low-severity `.env.example` warnings.
- `npm run verify:integrity`: passed.

### Advisories cleared

- XFlow full-audit high-threshold Vite/Vitest/esbuild advisories cleared.
- Production-only high-threshold audit remained clean.

### Advisories remaining

- 4 moderate Next/PostCSS advisories remain through `postcss <8.5.10 -> next -> @sentry/nextjs / next-auth`. This chain is explicitly out of scope for the XFlow Vite/esbuild/Vitest remediation.

### Commit safety

XFlow is safe to commit.

Reasons:

- All required functional, security, route, env, integrity, build, test, and audit gates passed.
- Full high-threshold audit now passes.
- Production high-threshold audit remained clean.
- Only XFlow package metadata changed.
- No test harness/config changes were needed.
- No deploys, pushes, migrations, secret rotations, production data changes, app behavior changes, source changes, schema changes, or unrelated dependency upgrades were performed.
