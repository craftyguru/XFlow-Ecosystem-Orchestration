# Security Release Checklist

Use this checklist before any approved release or deploy for the six-app ecosystem.

Rules:

- Do not deploy unless the release is explicitly approved.
- Do not push from this checklist unless separately approved.
- Do not run migrations against production.
- Do not rotate secrets during release validation unless separately approved.
- Do not add secret values or deploy credentials to repositories, CI, logs, or documentation.
- Do not stage `.env`, logs, DB files, media artifacts, screenshots, cache, build output, or generated output.

## Global Pre-Release Checks

Run from each app repository:

- Confirm repository cleanliness with `git status --short`.
- Confirm only intended release commits are present with `git branch --show-current` and `git rev-parse --short HEAD`.
- Confirm no `.env`, secrets, generated output, logs, DB files, screenshots, media artifacts, cache output, build output, lockfile churn, or deploy config changes are staged unexpectedly.
- Confirm current CI workflow does not contain deploy commands, migration commands, secret values, or deploy credentials.
- Confirm release-only and live/external checks are manual, release-only, or environment-gated.

## XFlow

Repository: `apps\XFlow`

Required local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm run verify:integrity`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Release notes:

- Confirm no app source behavior changes are included unless separately reviewed.
- Confirm no `.env` or secret-bearing files are staged.
- Confirm no logs, DB files, media, cache, screenshots, or build artifacts are staged.

## Verixet

Repository: `apps\Verixet`

Required PR/local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Release/manual gate:

- `npm run verify:canonical-host`

Release notes:

- `verify:canonical-host` must not be a normal PR blocker.
- Confirm `www` routes redirect to apex with HTTP `301` only after an approved deploy or against an approved release environment.
- Confirm no billing, entitlement, API key, deploy gate, or credential behavior changes are bundled without review.

## CreVux

Repository: `apps\CreVux`

Required local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm test`
- `pnpm run build`
- `pnpm run verify:security`
- `pnpm run verify:routes`
- `pnpm run verify:env`
- `pnpm --filter @workspace/api-server run test:upload-safety`
- `pnpm audit --prod --audit-level high`
- `pnpm audit --audit-level high`

Release/live proof:

- Confirm the approved live base URL.
- Run the route verifier against the approved release target.
- Prove `/api/healthz` returns the expected typed health JSON.
- Prove unauthenticated `/api/healthz/ffmpeg` returns typed `401` JSON.
- Confirm no stale deployment by checking the live health metadata against the intended branch, commit, version, and deployment identifier where exposed.

Release notes:

- Do not expose media uploads, derived artifacts, or ffmpeg health internals publicly.
- Do not stage uploaded media, generated media, screenshots, or derived artifacts.

## RatAiFy

Repository: `apps\RatAiFy`

Required local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:shared-supabase-schema`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Environment-gated checks:

- Run `npm run verify:env` only when `RELEASE_VERIFY_BASE_URL` is set for the approved target.
- Run migration verification only when an approved empty disposable `MIGRATION_TEST_DATABASE_URL` is set.

Release notes:

- Never point migration verification at production or shared persistent databases.
- Confirm scanner SSRF controls remain active before release.
- Confirm report and artifact routes do not expose tenant or project data across boundaries.

## AudAix

Repository: `apps\AudAix`

Root required local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run verify:security`
- `npm run verify:routes`
- `npm run verify:env`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=high`

Dashboard required local gates:

- `cd dashboard && npm run typecheck:test`
- `cd dashboard && npm test`
- `cd dashboard && npm run build`
- `cd dashboard && npm audit --omit=dev --audit-level=high`
- `cd dashboard && npm audit --audit-level=high`

Release notes:

- Confirm scanner inputs, dashboard authentication, and audit result access remain tenant/workspace scoped.
- Do not stage local DB files, scanner output, logs, screenshots, or generated reports.

## WordGeni

Repository: `apps\WordGeni`

Required local gates:

- `git status --short`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm test`
- `pnpm run build`
- `pnpm run verify:security`
- `pnpm run verify:routes`
- `pnpm run verify:env`
- `pnpm audit --prod --audit-level high`
- `pnpm audit --audit-level high`

Release notes:

- Confirm writing context, source material, export output, and prompt-related data do not cross tenant or workspace boundaries.
- Confirm export download hardening remains active.
- Do not stage generated exports, source documents, media, cache, or build output.

## Final Release Hold Points

Release must stop for manual review if any of these are true:

- Any required lint, typecheck, test, build, verifier, or audit gate fails.
- Any high or critical production dependency advisory appears.
- Any `.env`, secret value, deploy credential, production database URL, private key, local DB, media artifact, generated report, screenshot, cache, or build artifact is staged.
- Any deploy or migration command appears in normal PR/push CI.
- Any release-only live check fails.
- Any app shows unexpected source behavior changes.
