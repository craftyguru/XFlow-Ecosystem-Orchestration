# Workspace Relocation Audit

Date: 2026-05-03

Audited workspace: `K:\XFlow-Ecosystem Workspace`

Note: the requested path `K:\XFlow-Ecosystem` was not present in this session. The six repos were found under `K:\XFlow-Ecosystem Workspace\apps`.

## Repos Found

| App | Local path | `.git` | `git status` | `git remote -v` | Package manager | Key scripts detected |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | `apps\XFlow` | yes | works | works | pnpm, npm lock also present | `dev`, `build`, `start`, `test`, `typecheck`, `lint`, many `verify:*` scripts |
| Verixet | `apps\Verixet` | yes | works | works | npm | `dev`, `build`, `start`, `test`, `typecheck`, `lint`, `test:e2e`, verification scripts |
| RatAiFy | `apps\RatAiFy` | yes | works | works | npm | `dev`, `build`, `start`, `test`, `check`, `verify:*` scripts |
| AudAix | `apps\AudAix` | yes | works | works | npm | `dev`, `build`, `start`, `test`, `typecheck`, `lint`, Supabase smoke scripts |
| WordGeni | `apps\WordGeni` | yes | works | works | pnpm | `dev`, `build`, `test`, `typecheck`, `lint`, mobile Android scripts, Railway scripts |
| CreVux | `apps\CreVux` | yes | works | works | pnpm | `dev`, `build`, `test`, `typecheck`, Railway/build/runtime verification scripts |

Each app remains a separate Git repo. No root monorepo build was created, and no app `.git` directories were removed.

## Search Scope

Searched all six apps for these old absolute path forms:

- `K:\XFlow`, `K:\Verixet`, `K:\Rataify`, `K:\AudAiX`, `K:\WordGeni`, `K:\Crevux`
- `K:\\XFlow`, `K:\\Verixet`, `K:\\Rataify`, `K:\\AudAiX`, `K:\\WordGeni`, `K:\\Crevux`

Dependency and generated build folders were excluded from content scans: `.git`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `.turbo`.

Also checked relocation-sensitive areas: `package.json` scripts, env examples, docs, `scripts`, Android/Gradle config, Railway config, Playwright config, Vitest config, `tsconfig` files, and Cursor/VS Code settings.

Real `.env` values were not printed.

## Old Paths Found

Before fixes:

| Repo | File | Classification | Old path | Impact |
| --- | --- | --- | --- | --- |
| Verixet | `artifacts/phase-11-screenshots/summary.json` | generated proof artifact | `K:\\Verixet\\...` | local screenshot artifact paths were broken after relocation |
| Verixet | `artifacts/phase-11-screenshots/hero-summary.json` | generated proof artifact | `K:\\Verixet\\...` | local screenshot artifact paths were broken after relocation |
| WordGeni | `docs/mobile/android-signing.md` | docs-only | `K:\WordGeni` | stale local guidance only |
| WordGeni | `scripts/mobile/check-android-release-env.mjs` | local/dev script message | `K:\\WordGeni` | error text was stale; the actual repo-inside check already used a dynamic repo root |

After fixes: no requested old path strings remain in the scanned app content.

## Fixes Applied

- Verixet: changed screenshot summary paths in `artifacts/phase-11-screenshots/summary.json` and `artifacts/phase-11-screenshots/hero-summary.json` from old absolute `K:\Verixet\...` paths to repo-relative `artifacts/phase-11-screenshots/...` paths.
- WordGeni: changed Android signing guidance from `outside K:\WordGeni` to `outside this repository`.
- WordGeni: changed the Android release signing preflight error message from `outside K:\WordGeni` to `outside this repository`.
- WordGeni and CreVux: refreshed pnpm installs with `CI=true pnpm install --frozen-lockfile` because existing `node_modules` directories were present but validation failed due missing package targets after relocation.

No production URLs, domains, Railway deploy settings, or real `.env` values were changed.

## Validation

| App | Command run | Result |
| --- | --- | --- |
| XFlow | `pnpm typecheck` | passed |
| Verixet | `npm run typecheck` | failed with existing TypeScript errors in billing-related test files, not old-path references |
| RatAiFy | `npm run check` | passed |
| AudAix | `npm run typecheck` | passed |
| WordGeni | `pnpm typecheck` | initially failed because `turbo` was missing under relocated `node_modules`; after frozen reinstall, failed in existing `@writexet/api` build because `patch-dist-imports.mjs` expected `apps/api/dist` |
| CreVux | `pnpm typecheck` | initially failed because `typescript` was missing under relocated `node_modules`; after frozen reinstall, passed |

Build and full test suites were not run because each app has a lighter typecheck/check script and several repos have broad or integration-heavy test/build surfaces.

## Risks

- Several repos already had unrelated working-tree changes before this audit. They were left in place.
- XFlow has both `pnpm-lock.yaml` and `package-lock.json`; pnpm was used because the repo has a pnpm lock and `pnpm typecheck` works.
- WordGeni `pnpm typecheck` runs `turbo lint`, and that task invokes an API build. The current failure is not a relocation path string, but it blocks a clean validation result.
- Verixet typecheck has pre-existing billing test typing failures that block a clean validation result.
- Generated or cache folders can contain historical paths from previous runs. The active source/config/doc scan is clean for the requested old path strings.

## Recommended Next Steps

1. Fix Verixet billing test TypeScript failures, then rerun `npm run typecheck` in `apps\Verixet`.
2. Investigate WordGeni `apps/api` build output configuration or `patch-dist-imports.mjs`, then rerun `pnpm typecheck` in `apps\WordGeni`.
3. If future tooling emits absolute local paths, prefer repo-relative artifact paths so another parent-folder move does not require code or artifact edits.
4. Keep validating apps individually from their own repo roots; do not add a parent workspace build unless the repository model intentionally changes.
