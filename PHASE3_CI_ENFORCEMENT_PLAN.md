# Phase 3 CI/Security Enforcement Plan

Date: 2026-06-18

Workspace: `K:\XFlow-Ecosystem Workspace`

Scope:

- `apps\XFlow`
- `apps\Verixet`
- `apps\CreVux`
- `apps\RatAiFy`
- `apps\AudAix`
- `apps\WordGeni`
- nested package `apps\AudAix\dashboard`

No deploys, pushes, migrations, secret rotations, data deletion, deploy credentials, or secret values were added. The workspace root is not treated as a monorepo git root; CI changes are app-local.

## Source Reports

- `PHASE2_HIGH_SEVERITY_COMPLETION_REPORT.md`
- `PHASE2_BASELINE.md`
- `PHASE2_DRIZZLE_REMEDIATION.md`
- `PHASE2_TENSORFLOW_TAR_REMEDIATION.md`
- `PHASE2_OBSERVABILITY_REMEDIATION.md`
- `PHASE2_VITE_ESBUILD_VITEST_REMEDIATION.md`
- `PHASE2_AUDAIX_DASHBOARD_MODERNIZATION.md`
- `CREVUX_DEPLOY_VERIFICATION.md`
- `VERIXET_CANONICAL_HOST_REMEDIATION.md`

## CI Structure

Each app has an app-local `.github/workflows/ci.yml`.

Required PR/local gates:

- lint
- typecheck
- tests
- build where stable for that app
- security verifier
- stable app-specific integrity verifier
- production dependency audit at high threshold
- full dependency audit at high threshold

Release/predeploy gates:

- route verifier
- env verifier
- canonical host verifier where applicable
- live deploy proof only when an explicit URL input is provided
- nested dashboard proof where applicable
- migration proof only when an approved disposable DB URL is provided

Advisory/manual gates:

- moderate/low audit review
- live external checks
- deploy status checks
- migration tests that require disposable DBs

## App Gate Inventory And Classification

| App | Existing CI/config inspected | Required PR/local | Release/predeploy | Advisory/manual or env-gated |
| --- | --- | --- | --- | --- |
| XFlow | `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `package.json`, scripts under `scripts\` | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:integrity`, `npm audit --omit=dev --audit-level=high`, `npm audit --audit-level=high` | `npm run verify:routes`, `npm run verify:env`, optional `npm run ops:release-smoke` | Moderate audit review via manual advisory job |
| Verixet | `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `.github/workflows/verixet-predeploy.yml`, `package.json`, route/env/canonical scripts | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm audit --omit=dev --audit-level=high`, `npm audit --audit-level=high` | `npm run verify:routes`, `npm run verify:env`, `npm run verify:canonical-host`, optional `npm run verify:post-deploy-smoke` | Live post-deploy smoke requires explicit URL input |
| CreVux | `.github/workflows\ci.yml`, `.github/workflows\security.yml`, CodeQL/dependency workflows, `package.json`, pnpm workspace scripts | `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run verify:security`, `pnpm --filter @workspace/api-server run test:upload-safety`, `pnpm audit --prod --audit-level high`, `pnpm audit --audit-level high` | `pnpm run verify:routes`, `pnpm run verify:env`, optional `pnpm run smoke:authenticated-beta` | Live beta smoke requires explicit URL input |
| RatAiFy | `.github/workflows\ci.yml`, `.github/workflows\security.yml`, `package.json`, release/env/migration scripts | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, `npm audit --omit=dev --audit-level=high`, `npm audit --audit-level=high` | `npm run verify:env` only with `RELEASE_VERIFY_BASE_URL`; `npm run verify:migrations` only with approved disposable `MIGRATION_TEST_DATABASE_URL` | Migration proof refuses non-disposable-looking URLs |
| AudAix | `.github/workflows\ci.yml`, `.github/workflows\security.yml`, root `package.json`, nested `dashboard\package.json` | Root: `npm run lint`, `npm run typecheck`, `npm test`, `npm run verify:security`, root high audits. Dashboard: `npm run typecheck:test`, `npm test`, `npm run build`, dashboard high audits | Root `npm run verify:routes`, `npm run verify:env`, dashboard proof build, optional `npm run verify:production` | Root `npm run build` intentionally not added as a separate PR step because it performs `npm ci --prefix dashboard`; dashboard gates are explicit |
| WordGeni | `.github/workflows\ci.yml`, `.github/workflows\security.yml`, `package.json`, pnpm workspace/turbo scripts | `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run verify:security`, `pnpm audit --prod --audit-level high`, `pnpm audit --audit-level high` | `pnpm run verify:routes`, `pnpm run verify:env`, optional `pnpm run live:verify` | Release URL checks require explicit URL input |

## Known Exceptions

- RatAiFy `verify:env` requires `RELEASE_VERIFY_BASE_URL`; it is release-only and skipped unless explicitly provided.
- RatAiFy `verify:migrations` requires an empty disposable `MIGRATION_TEST_DATABASE_URL`; CI refuses URLs that do not look local or migration-test-specific.
- AudAix dashboard has explicit nested package gates.
- AudAix root build is not duplicated as a PR gate because it runs `npm ci --prefix dashboard`; dashboard install/build/test/audit gates are explicit.
- CreVux and Verixet live checks are release/manual gates, not normal PR blockers.
- Existing security workflows remain app-local.
- XFlow's previous Railway deploy job was removed from CI to comply with the no-deploy requirement.

## Files Changed

- `apps\XFlow\.github\workflows\ci.yml`
- `apps\Verixet\.github\workflows\ci.yml`
- `apps\CreVux\.github\workflows\ci.yml`
- `apps\RatAiFy\.github\workflows\ci.yml`
- `apps\AudAix\.github\workflows\ci.yml`
- `apps\WordGeni\.github\workflows\ci.yml`
- `PHASE3_CI_ENFORCEMENT_PLAN.md`

## Local Validation Commands

Commands actually run during this Phase 3 CI pass:

```powershell
cd "K:\XFlow-Ecosystem Workspace"
@'
import pathlib, sys
try:
    import yaml
except Exception as exc:
    print(f'Missing PyYAML: {exc}', file=sys.stderr)
    sys.exit(2)
for file in [
    'apps/XFlow/.github/workflows/ci.yml',
    'apps/Verixet/.github/workflows/ci.yml',
    'apps/CreVux/.github/workflows/ci.yml',
    'apps/RatAiFy/.github/workflows/ci.yml',
    'apps/AudAix/.github/workflows/ci.yml',
    'apps/WordGeni/.github/workflows/ci.yml',
]:
    yaml.safe_load(pathlib.Path(file).read_text(encoding='utf-8-sig'))
    print(f'ok {file}')
'@ | python -
```

```powershell
cd "K:\XFlow-Ecosystem Workspace"
git -C 'apps\XFlow' diff --check
git -C 'apps\Verixet' diff --check
git -C 'apps\CreVux' diff --check
git -C 'apps\RatAiFy' diff --check
git -C 'apps\AudAix' diff --check
git -C 'apps\WordGeni' diff --check
```

```powershell
cd "K:\XFlow-Ecosystem Workspace"
rg --hidden -n "RAILWAY|db:migrate|db:push|secrets\.|serviceInstanceRedeploy" `
  'apps\XFlow\.github\workflows\ci.yml' `
  'apps\Verixet\.github\workflows\ci.yml' `
  'apps\CreVux\.github\workflows\ci.yml' `
  'apps\RatAiFy\.github\workflows\ci.yml' `
  'apps\AudAix\.github\workflows\ci.yml' `
  'apps\WordGeni\.github\workflows\ci.yml'
```

Results:

- YAML parsing passed for all six edited workflow files.
- `git diff --check` passed for all six app repos; Git reported only LF-to-CRLF working-copy warnings.
- The targeted deploy/migration/secret scan found no `RAILWAY`, direct `db:migrate`, direct `db:push`, `secrets.*`, or `serviceInstanceRedeploy` references in the six edited CI files.
- `actionlint` was not installed in this environment.

Full required gate validation commands, to run before app-local commits:

App gate validation commands, when running the full required set locally:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm run verify:integrity
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\CreVux"
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run verify:security
pnpm --filter @workspace/api-server run test:upload-safety
pnpm audit --prod --audit-level high
pnpm audit --audit-level high
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\RatAiFy"
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm run verify:routes
npm run verify:shared-supabase-schema
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\AudAix"
npm run lint
npm run typecheck
npm test
npm run verify:security
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
cd dashboard
npm run typecheck:test
npm test
npm run build
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\WordGeni"
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run verify:security
pnpm audit --prod --audit-level high
pnpm audit --audit-level high
```

## Commit Readiness

Current commit status: committed app by app.

Each app was committed only after workflow syntax validation and required gates passed locally:

- CI changes are app-local.
- No app source behavior changed.
- No secrets or deploy credentials were added.
- No deploy or migration command is run by ordinary PR CI.
- Release-only and live checks are conditional.

Current app commit results:

| App | Commit | Result |
| --- | --- | --- |
| XFlow | `9b26805` | Passed static validation and required local gates; committed `.github/workflows/ci.yml`. |
| Verixet | `25b4bab` | Passed static validation and required local gates; committed `.github/workflows/ci.yml`. |
| CreVux | `713ca11` | Passed static validation and required local gates; committed `.github/workflows/ci.yml`. |
| RatAiFy | `f3d555c` | Passed static validation and required local gates; committed `.github/workflows/ci.yml`. |
| AudAix | `a97907a1` | Passed static validation plus root/dashboard required local gates; committed `.github/workflows/ci.yml`. |
| WordGeni | `a38edd2` | Passed static validation and required local gates; committed `.github/workflows/ci.yml`. |

Suggested commit message per app:

```text
ci(<app>): enforce security gates
```

Suggested commit body:

```text
Adds required lint/typecheck/test/build/security/audit gates.
Separates route/env/live checks into release-only or env-gated jobs.
Documents env prerequisites and keeps live/migration proof out of ordinary PR CI.
No deploy credentials or secrets added.
No app behavior changes.
```

## Final Phase 3 Validation Results

Date: 2026-06-18

Pre-check:

- Each app started this validation pass with exactly one changed app-local file: `.github/workflows/ci.yml`.
- No app source files, package files, lockfiles, `.env` files, secrets, generated output, logs, DB files, screenshots, media artifacts, or deploy configs were changed.

Static workflow validation:

- All six edited workflows parsed as YAML.
- `git diff --check` passed for all six repos, with only Git LF-to-CRLF working-copy warnings.
- Final workflow scans found no `secrets.`, Railway deploy/redeploy calls, Vercel deploy calls, `serviceInstanceRedeploy`, `db:push`, or `db:migrate` references in the current edited workflows.
- Live/external/release checks are `workflow_dispatch`, env-gated, release-only, or not part of normal PR/push required gates.

Per-app local gate results:

| App | Required gates run | Result |
| --- | --- | --- |
| XFlow | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:env`, `npm run verify:integrity`, production audit, full audit | Passed. Initial `npm test` exposed the workflow contract expectation for `Post-deploy release smoke`; the workflow was adjusted without adding secrets or deploys, targeted tests passed, then the full gate list passed. |
| Verixet | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:env`, production audit, full audit | Passed. `verify:canonical-host` was not run as a PR blocker. |
| CreVux | `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run verify:security`, `pnpm run verify:routes`, `pnpm run verify:env`, upload-safety, production audit, full audit | Passed. Existing route verifier performed deploy-parity/live reads only; no deploys or mutations were run. |
| RatAiFy | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:security`, `npm run verify:routes`, `npm run verify:shared-supabase-schema`, production audit, full audit | Passed. `verify:env` and `verify:migrations` were not required because `RELEASE_VERIFY_BASE_URL` and approved disposable `MIGRATION_TEST_DATABASE_URL` were not provided. |
| AudAix | Root lint, typecheck, tests, security, routes, env, production audit, full audit; dashboard typecheck, tests, build, production audit, full audit | Passed. |
| WordGeni | `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run verify:security`, `pnpm run verify:routes`, `pnpm run verify:env`, production audit, full audit | Passed. |

Apps blocked:

- None.

Remaining manual CI recommendations:

- Install and run `actionlint` in a future CI/tooling pass for GitHub Actions semantic linting.
- Keep Verixet `verify:canonical-host`, CreVux/Verixet live checks, WordGeni release URL checks, XFlow release smoke, and AudAix live production proof as release/manual gates.
- Keep RatAiFy `verify:env` conditional on `RELEASE_VERIFY_BASE_URL`.
- Keep RatAiFy `verify:migrations` conditional on an approved empty disposable `MIGRATION_TEST_DATABASE_URL`; never point it at production.
- Continue separate moderate/low advisory cleanup for the documented residual audit findings from Phase 2.

Final status:

- Phase 3 CI enforcement is complete for the six target app repos.
- All six app repos are clean after their app-local CI commits.
- No deploys, pushes, migrations, secret rotations, data deletion, deploy credentials, secret values, or app source behavior changes were performed.
