# AudAix Phase 1 Remediation

Date: 2026-06-17

Scope: `apps/AudAix` only.

## Findings Fixed

- P0 dependency exposure partially remediated with safe non-force updates:
  - Ran `npm audit fix`.
  - Updated `vitest` from `^3.0.8` to `^3.2.6`.
  - Cleared prior critical `vitest` advisory and high `form-data` / `ws` advisories from the safe nonbreaking path.
  - Production dependency audit with `npm audit --omit=dev --audit-level=high` now reports no high/critical advisories.

- P1 scanner/remote URL hardening:
  - `guardedFetch` now validates every redirect hop instead of relying on automatic redirects.
  - Redirect chains are bounded with a default/explicit max redirect count.
  - Redirects ending on localhost, loopback, private ranges, link-local, metadata IPs, or unsupported schemes are rejected before follow-up requests.
  - IPv6 loopback normalization now strips URL brackets before IP classification.

- P1 bounded scan/discovery reads:
  - Added `readBoundedResponseText` and wired it into route discovery, HTTP runner snapshots, Playwright HTTP snapshots, and security scanner probes.
  - Route discovery uses `AUDAIX_DISCOVERY_MAX_HTML_BYTES`.
  - Runner HTTP snapshots use `AUDAIX_RUNNER_MAX_RESPONSE_BYTES` with a capped fallback.
  - Security scanner probes use `AUDAIX_SECURITY_SCAN_MAX_RESPONSE_BYTES`.

- P1 non-leaky unsafe target errors:
  - Site create/update now returns `{ error: "invalid_or_unsafe_base_url", detail: "target_url_rejected" }` for unsafe scan targets instead of returning internal outbound classification details.

## Findings Skipped

- Public report/signed artifact retention and access-policy changes were skipped because the roadmap marks this as manual review.
- Deletion or movement of `audaix.db`, artifacts, logs, screenshots, reports, and local output was skipped because the audit requires owner approval before deleting production-like data/artifacts.
- Forced/breaking dependency paths were skipped:
  - Remaining `vite`/`esbuild` high advisory requires `npm audit fix --force`, which would install `vitest@4.1.9`.
  - Remaining Lighthouse/Sentry/OpenTelemetry moderate chain requires `npm audit fix --force`, which would install `lighthouse@12.6.1` and is flagged by npm as breaking.
- Dashboard nested audit issues reported during `npm run build` were not remediated in this pass because this Phase 1 scope targeted the AudAix root app safe P0/P1 path only.

## Files Changed

- `apps/AudAix/package.json`
- `apps/AudAix/package-lock.json`
- `apps/AudAix/src/outbound-request.ts`
- `apps/AudAix/src/route-discovery.ts`
- `apps/AudAix/src/runner.ts`
- `apps/AudAix/src/playwright-audit-route.ts`
- `apps/AudAix/src/security-scanner/engine/scan-context.ts`
- `apps/AudAix/src/routes/site-routes.ts`
- `apps/AudAix/tests/outbound-request.test.ts`
- `apps/AudAix/tests/api.test.ts`

## Tests Added/Updated

- Added outbound URL security assertions for:
  - `localhost`
  - `127.0.0.1`
  - `::1`
  - `0.0.0.0`
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
  - link-local and cloud metadata IPs
  - unsupported schemes: `file://`, `ftp://`, `gopher://`, `ws://`
  - redirects ending on blocked/internal targets
  - max redirect enforcement
  - response-size cap enforcement
- Added API-level assertion that unsafe site scan targets return a generic non-leaky error.

## Commands Run And Results

- `git status --short`
  - Result: AudAix repo had only AudAix Phase 1 changes.
- `npm audit --audit-level=high`
  - Baseline result before remediation: 24 vulnerabilities: 1 critical, 4 high, 19 moderate.
  - Final result after remediation: fails with 22 vulnerabilities: 5 high, 17 moderate.
  - Remaining high is dev-tooling `vite`/`esbuild` via `vitest`; npm only offers `npm audit fix --force` to `vitest@4.1.9`.
- `npm audit fix`
  - Result: completed without `--force`; added 51 packages, removed 38 packages, changed 37 packages.
- `npm install --save-dev vitest@3.2.6`
  - Result: completed; same-major Vitest line retained.
- `npm audit --omit=dev --audit-level=high`
  - Result: passes high/critical threshold; reports only 17 moderate production advisories in the Lighthouse/Sentry/OpenTelemetry chain.
- `npm test -- tests/outbound-request.test.ts`
  - Result: passed, 19 tests.
- `npm test -- tests/api.test.ts -t "rejects unsafe site scan targets"`
  - Result: passed, 1 selected test.
- `npm run lint`
  - Result: passed with existing warning baseline; no errors.
- `npm run typecheck`
  - Result: passed.
- `npm test`
  - Result: passed.
- `npm run build`
  - Result: passed. Build step reported dashboard nested audit issues during `npm ci --prefix dashboard`, but build completed successfully.
- `npm run verify:security`
  - Result: passed.
- `npm run verify:routes`
  - Result: passed.
- `npm run verify:env`
  - Result: passed with `production_env_valid`.

## Remaining P0/P1 Risks

- Root `npm audit --audit-level=high` still fails due dev-tooling `vite`/`esbuild` high advisories under Vitest 3.2.6.
  - npm's available fix requires `--force` and `vitest@4.1.9`, a major upgrade outside safe Phase 1.
  - An esbuild override would move outside Vite 7.3.5's declared `^0.27.0` dependency range and should require manual approval.
- Dashboard nested dependency advisories surfaced during `npm run build` remain outside this AudAix root safe-remediation change set.

## Remaining Dependency Advisories

- Root full audit:
  - 22 total vulnerabilities: 17 moderate, 5 high.
  - High: `esbuild 0.17.0 - 0.28.0` via `vite` / `@vitest/mocker` / `vite-node` / `vitest`.
  - Moderate: Lighthouse/Sentry/OpenTelemetry chain.
- Root production-only audit:
  - 17 moderate vulnerabilities in Lighthouse/Sentry/OpenTelemetry chain.
  - No high/critical production dependency advisories.

## Manual Approvals Still Needed

- Approve or defer a Vitest 4 / Vite 8 dependency-upgrade phase, or explicitly approve a targeted esbuild override outside Vite's declared range.
- Approve a Lighthouse/Sentry/OpenTelemetry coordinated dependency phase.
- Approve any deletion, archiving, or migration of local `audaix.db`, report artifacts, screenshots, logs, or output folders.
- Review public report/signed artifact retention and sharing policy before behavior changes.

## Phase 2 Readiness

AudAix is ready for Phase 2 dependency-upgrade planning, but this Phase 1 change should not be committed without the requested audit exception approval because `npm audit --audit-level=high` still fails for forced/breaking dependency paths.
