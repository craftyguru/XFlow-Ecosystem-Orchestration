# XFlow Phase 1 Remediation

Date: 2026-06-17

Scope: `apps/XFlow` only.

## Findings Addressed

### P0/P1 dependency exposure - partially remediated safely

- Source audit finding: `ECOSYSTEM_REPO_AUDIT.md` reported XFlow `npm audit --audit-level=high` failed with 40 vulnerabilities: 1 low, 29 moderate, 9 high, 1 critical.
- Roadmap finding: `ECOSYSTEM_FIX_ROADMAP.md` listed XFlow dependency remediation for vulnerable Next.js, Drizzle, and transitive packages, with major/framework upgrades requiring manual approval.
- Action taken: ran `npm audit fix` without `--force`.
- Result: safe non-force dependency remediation reduced full audit to 35 vulnerabilities: 29 moderate, 5 high, 1 critical.
- Result: production-only audit now reports 27 vulnerabilities: 24 moderate, 3 high.
- Files changed:
  - `apps/XFlow/package.json`
  - `apps/XFlow/package-lock.json`
- Safe automated fix: yes, partially. Remaining advisories require forced, breaking, major-version, or unsafe downgrade paths.

### Test harness dependency after cleanup

- Finding: after safe dependency cleanup, `npm test` failed because Vitest needed `jsdom` for `tests/unit/ecosystem-assistant-bubble.test.tsx`, which uses `// @vitest-environment jsdom`.
- Evidence: `npm test` initially exited nonzero with `Error: Cannot find package 'jsdom' imported from ... node_modules/vitest/...`.
- Action taken: added `jsdom@^29.1.1` as a dev dependency.
- Result: `npm test` passed after adding the explicit test harness dependency.
- Safe automated fix: yes. This is dev/test-only and does not alter app runtime behavior.

## Findings Skipped

### Drizzle ORM SQL injection advisory

- Severity: P1
- Confidence: confirmed by `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high`.
- Evidence: `drizzle-orm <0.45.2`, `GHSA-gpj5-g38j-94v9`.
- Remaining fix path: `npm audit fix --force` would install `drizzle-orm@0.45.2`, marked breaking.
- Blast radius: XFlow data access layer.
- Fix difficulty: medium to large.
- Codex safe automated fix now: no, requires approved dependency-upgrade phase and regression coverage.

### Vitest/Vite/esbuild/drizzle-kit toolchain advisories

- Severity: P0/P1
- Confidence: confirmed by `npm audit --audit-level=high`.
- Evidence: `vitest <=3.2.5`, `vite <=6.4.2`, `esbuild <=0.28.0`, `drizzle-kit` chain.
- Remaining fix path: forced/breaking major toolchain path, including Vitest 4/drizzle-kit upgrades.
- Blast radius: test/build/database tooling.
- Fix difficulty: medium.
- Codex safe automated fix now: no, requires Phase 2 tooling upgrade approval.

### Sentry/OpenTelemetry/Rollup/UUID advisories

- Severity: P1
- Confidence: confirmed by full and production-only audit.
- Evidence: `@sentry/nextjs@8.55.0`, `@sentry/node@8.55.0`, OpenTelemetry, Rollup, UUID chains.
- Remaining fix path: `npm audit fix --force` would install Sentry 10 packages, marked breaking.
- Blast radius: production observability and build integration.
- Fix difficulty: medium to large.
- Codex safe automated fix now: no, requires coordinated Sentry/OpenTelemetry upgrade approval.

### Next.js nested PostCSS advisory

- Severity: P2 by audit severity, tracked because it keeps audit failing.
- Confidence: confirmed by audit.
- Evidence: `node_modules/next/node_modules/postcss <8.5.10`; npm proposes forced `next@9.3.3`.
- Remaining fix path: npm's suggested fix is an unsafe downgrade. A no-force override attempt did not replace Next's nested PostCSS copy.
- Blast radius: Next.js framework/build behavior.
- Fix difficulty: medium.
- Codex safe automated fix now: no, requires framework/vendor advisory handling in Phase 2.

### Route manifest integrity drift

- Severity: P1/P2, needs manual triage.
- Confidence: confirmed by `npm run verify:integrity`.
- Evidence: `verify:integrity` fails during `verify:app-router` because route-manifest entries differ from files on disk.
- Result details: the verifier reported 21 `page.tsx` files on disk missing from the route manifest, 13 route-manifest page entries missing on disk, and 6 `route.ts` files on disk missing from the route manifest.
- Blast radius: XFlow route inventory/security documentation.
- Fix difficulty: medium.
- Codex safe automated fix now: not in this dependency-focused Phase 1 pass; should be handled as a separate route-manifest maintenance task.

## Auth, Session, Tenant, Operator, Event, Health, Request ID Verification

- No auth/session/operator behavior was changed.
- Existing verification and tests were re-run:
  - `npm run verify:security` passed, including security release gates, same-origin mutation guard coverage for 72 protected session mutation routes, and production bootstrap YAML guard.
  - `npm test` passed after adding explicit `jsdom`, including auth/session, workspace RBAC, cross-tenant isolation, event ingest, health, request ID, and log/redaction related tests already present in the suite.
  - `npm run build` passed.
  - `npm run verify:env` passed with low-severity Env Doctor warnings.

## Files Changed

- `apps/XFlow/package.json`
- `apps/XFlow/package-lock.json`
- `XFLOW_PHASE1_REMEDIATION.md`

## Tests Added or Updated

- No product/security tests were added or changed.
- Added explicit dev dependency `jsdom@^29.1.1` so the existing jsdom-environment test runs reliably after dependency cleanup.

## Commands Run and Results

- `git status --short`: changed files in XFlow were `package.json` and `package-lock.json` before writing this note.
- `npm audit --audit-level=high`: failed before remediation with 40 vulnerabilities, then failed after safe remediation with 35 vulnerabilities: 29 moderate, 5 high, 1 critical.
- `npm audit fix`: completed non-force remediation; did not use `--force`.
- `npm install --save-dev jsdom@29.1.1`: passed; added explicit test-only dependency.
- `npm run lint`: passed with existing warnings in `src/components/chronicle/ChronicleSourcesClient.tsx`.
- `npm run typecheck`: passed.
- `npm test`: initially failed due missing `jsdom`; passed after adding explicit `jsdom` dependency with 542 files passed, 1 skipped, 2646 tests passed, 2 skipped.
- `npm run verify:security`: passed.
- `npm run verify:env`: passed with low-severity Env Doctor warnings.
- `npm run build`: passed.
- `npm run verify:integrity`: failed during `verify:app-router` due route-manifest drift described above.
- `npm audit --omit=dev --audit-level=high`: failed with 27 vulnerabilities: 24 moderate, 3 high.
- `npm audit --audit-level=high`: failed with 35 vulnerabilities: 29 moderate, 5 high, 1 critical.

## Remaining P0/P1 Risks

- Full dependency audit still has 5 high and 1 critical advisories requiring forced, breaking, major-version, or unsafe downgrade handling.
- Production-only dependency audit still has 3 high advisories requiring forced/breaking handling.
- `npm run verify:integrity` has route-manifest drift that should be triaged separately before claiming full integrity-suite readiness.

## Manual Approvals Still Needed

- Approval for a Phase 2 Drizzle ORM upgrade path.
- Approval for a Phase 2 Vitest/Vite/esbuild/drizzle-kit toolchain upgrade path.
- Approval for a Phase 2 Sentry/OpenTelemetry/Rollup/UUID coordinated upgrade path.
- Approval for route-manifest cleanup if the integrity suite is required as a commit gate.
- Manual env/example review remains deferred from the ecosystem roadmap.

## Phase 2 Readiness

XFlow is ready for Phase 2 dependency-upgrade planning. This Phase 1 work should not be committed yet without explicit approval because `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high` still fail, and the optional broad `npm run verify:integrity` suite also reports route-manifest drift.
