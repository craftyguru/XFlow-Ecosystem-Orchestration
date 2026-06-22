# Verixet Phase 1 Remediation

Date: 2026-06-17

Scope: `apps\Verixet` only.

Commit status: not committed. The Verixet app-local functional and security gates passed, including `npm run verify:security` and `npm audit --audit-level=high`. A non-mutating Verixet proof script, `npm run verify:canonical-host`, failed against live hosting/CDN behavior and requires manual deploy/CDN approval before treating this phase as fully committable.

## Findings Fixed

### P1-1 Security Gate Failure

- Fixed the ecosystem-audit failure where `npm run verify:security` failed at `check:dependency-audit`.
- Applied `npm audit fix` without `--force`.
- Cleared the high advisories that caused the security gate failure:
  - `form-data` CRLF injection advisory.
  - `ws` memory exhaustion DoS advisory.
- `npm run verify:security` now passes.
- `npm audit --audit-level=high` now exits successfully.

### P0-2 Dependency Audit Threshold - Verixet Slice

- Reduced Verixet dependency audit from 24 vulnerabilities with 2 high to 20 vulnerabilities with 0 high.
- Safe non-forced lockfile updates included:
  - `form-data` from `4.0.5` to `4.0.6`.
  - `ws` from `8.20.1` to `8.21.0`.
  - `dompurify` from `3.4.3` to `3.4.10`.
  - Babel package patch updates including `@babel/core` from `7.29.0` to `7.29.7`.
  - OpenTelemetry peer patch locks where npm could safely resolve them without force.

## Findings Verified

- Stripe/webhook signature handling is covered by existing webhook route and Stripe billing tests in the full suite.
- Entitlement enforcement is covered by existing billing, route gate, entitlement, and API handler tests in the full suite.
- API-key lifecycle protections are covered by existing key creation, label, rotate, revoke, API handler, scope, hashing, and idempotency tests in the full suite.
- Idempotency behavior is covered by existing API handler, usage, SDK, and workflow/deploy-gate tests.
- Health/readiness route behavior is covered by existing health, status, route, public DTO, and redaction tests.
- `safe_to_deploy` client/server behavior is covered by existing Verixet SDK, Python client, deploy validation, workflow pre-deploy, and guard validation tests.

No billing, entitlement, webhook, API-key, auth, or deploy-gate behavior was changed.

## Findings Skipped

### Moderate Dependency Advisories

`npm audit --audit-level=high` passes, but `npm audit` still reports 20 moderate vulnerabilities:

- `@opentelemetry/core` and related Sentry/OpenTelemetry instrumentation chain.
  - npm says the fix requires `npm audit fix --force`.
  - npm would install `@sentry/nextjs@10.58.0`, a breaking major-version path from the current `@sentry/nextjs@9.47.1`.
- `js-yaml` through `swagger-ui-react`.
  - npm says the fix requires `npm audit fix --force`.
  - npm would install `swagger-ui-react@3.23.3`, an unsafe downgrade/breaking path from the current `swagger-ui-react@5.32.x`.

Skipped because Phase 1 forbids forced, breaking, major-version, or unsafe downgrade paths.

### External Canonical Host Proof

`npm run verify:canonical-host` failed:

- `https://www.verixet.com/` returned `308`; script expected `301`.
- `https://www.verixet.com/sitemap.xml` returned `308`; script expected `301`.
- `https://www.verixet.com/robots.txt` returned `308`; script expected `301`.

The script recommends a Cloudflare Redirect Rule for `www` to apex with HTTP 301 and CDN cache purge. This is an external deploy/CDN configuration change and was not performed.

## Files Changed

- `apps\Verixet\package-lock.json`
- `VERIXET_PHASE1_REMEDIATION.md`

No Verixet app source files were changed.

## Tests Added Or Updated

- No tests were added or updated.
- Existing targeted and full test coverage was used to verify the requested security surfaces without changing sensitive behavior.

## Commands Run And Results

- `git status --short`
  - Before changes: clean.
  - After changes: `M package-lock.json`.
- `npm audit --audit-level=high`
  - Baseline failed: 24 vulnerabilities; 1 low, 21 moderate, 2 high.
  - Final passed high threshold; still prints 20 moderate vulnerabilities.
- `npm run verify:security`
  - Baseline failed at `check:dependency-audit`.
  - Final passed.
- `npm audit fix`
  - Completed without `--force`; removed 1 package and changed 23 packages.
  - Left only moderate vulnerabilities requiring force/breaking paths.
- `npm run lint`
  - Passed with 19 pre-existing warnings.
- `npm run typecheck`
  - Passed.
- `npm test`
  - Passed: 576 test files passed, 3 skipped; 2120 tests passed, 26 skipped.
- `npm run build`
  - Passed. Build still reports the same 19 lint warnings during Next validation.
- `npm run verify:env`
  - Passed: `check-env-registry: OK`.
- `npm run verify:routes`
  - Passed: app routes, v1 OpenAPI drift, and control-plane contract checks passed.
- `npm run verify:canonical-host`
  - Failed on live `www` to apex redirects returning 308 instead of expected 301.

## Remaining P0/P1 Risks

- No remaining high or critical dependency advisories are present for Verixet under `npm audit --audit-level=high`.
- The original `verify:security` failure is fixed.
- External canonical host redirect posture still needs manual hosting/CDN action if the 301 requirement is authoritative.

## Remaining Dependency Advisories

- 20 moderate vulnerabilities remain.
- Remaining dependency fixes require forced, breaking, major-version, or unsafe downgrade paths and should be handled in Phase 2.

## Manual Approvals Still Needed

- Approval to treat the live canonical-host 308-vs-301 failure as an external proof exception, or approval to change hosting/CDN configuration outside Codex.
- Approval for Phase 2 dependency-upgrade planning for Sentry/OpenTelemetry and swagger/js-yaml paths.
- Approval before any secret rotation, artifact deletion, migration, deploy, push, auth/billing/entitlement/webhook/API-key/deploy-gate behavior change, or CI/deploy policy change.

## Phase 2 Readiness

Verixet is ready for Phase 2 dependency-upgrade planning after the canonical-host proof decision is made. The app-local Phase 1 security gate is fixed, but this run is not committed because one non-mutating Verixet proof script still fails against live hosting/CDN behavior.
