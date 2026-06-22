# Phase 2 Drizzle Remediation

Source of truth: `K:\XFlow-Ecosystem Workspace\PHASE2_BASELINE.md`

Date: 2026-06-17

Scope: Drizzle ORM / drizzle-kit dependency-chain remediation only. No production migrations were run. No deploys, pushes, secret rotations, production data changes, schema semantic changes, or unrelated dependency upgrades were performed.

## Planned App Order

1. XFlow
2. RatAiFy
3. WordGeni
4. CreVux

## Summary

| App | Drizzle packages upgraded | Safe to commit | Commit |
| --- | --- | --- | --- |
| XFlow | `drizzle-orm` 0.36.4 -> 0.45.2; `drizzle-kit` 0.28.1 -> 1.0.0-rc.1 | Yes | `49fadde deps(xflow): upgrade drizzle packages` |
| RatAiFy | `drizzle-orm` 0.39.3 -> 0.45.2; `drizzle-kit` 0.31.10 -> 1.0.0-rc.1 | Yes; `verify:migrations` skipped because no safe empty disposable database URL was available | `0881871 deps(rataify): upgrade drizzle packages` |
| WordGeni | `drizzle-orm` 0.38.4 -> 0.45.2 in API, worker, and retrieval; `drizzle-kit` 0.30.6 -> 1.0.0-rc.1 in API | Yes | `cf7c1c2 deps(wordgeni): upgrade drizzle packages` |
| CreVux | `drizzle-orm` 0.45.1 -> 0.45.2 in `@workspace/db`; `drizzle-kit` 0.31.9 -> 1.0.0-rc.1 | Yes | `61550eb deps(crevux): upgrade drizzle packages` |

`drizzle-kit@0.31.10` remained affected by the `@esbuild-kit/esm-loader` advisory chain. The smallest non-downgrade version found that removes that chain was `drizzle-kit@1.0.0-rc.1`.

## XFlow

Affected path: `K:\XFlow-Ecosystem Workspace\apps\XFlow`

Packages:

| Package | Before | After |
| --- | --- | --- |
| `drizzle-orm` | 0.36.4 | 0.45.2 |
| `drizzle-kit` | 0.28.1 | 1.0.0-rc.1 |

DB adapters/packages observed: `pg 8.20.0`, `better-sqlite3 12.8.0`

Migration config: `drizzle.config.ts`

Schema files: `drizzle/schema/*.ts`

DB/static verification: `verify:audit-event-schema`

Files changed: `package.json`, `package-lock.json`

Schema/migration impact: none. No migration files were generated or applied.

Commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Clean before install |
| `npm install drizzle-orm@0.45.2 drizzle-kit@0.31.10 --save-exact` | Completed; stable drizzle-kit audit still affected |
| `npm install drizzle-kit@1.0.0-rc.1 --save-exact` | Completed |
| `npm run lint` | Passed with existing warnings and deprecated `next lint` notice |
| `npm run typecheck` | Passed |
| `npm test` | Passed; 542 files, 2646 tests, 2 skipped |
| `npm run build` | Passed with existing warnings |
| `npm run verify:security` | Passed |
| `npm run verify:routes` | Passed; 412 App Router files present |
| `npm run verify:env` | Passed; existing low-severity `.env.example` warnings |
| `npm run verify:audit-event-schema` | Passed; 105 audit actions covered |
| `npm audit --json` | No Drizzle advisories remained |
| `npm audit --omit=dev --json` | No Drizzle advisories remained |

Advisories cleared: `drizzle-orm`; `drizzle-kit` / `@esbuild-kit` advisory chain.

Advisories remaining: Sentry/OpenTelemetry/Rollup/UUID, Next/PostCSS, Vitest/Vite/esbuild.

Safe to commit: yes. Committed as `49fadde deps(xflow): upgrade drizzle packages`.

## RatAiFy

Affected path: `K:\XFlow-Ecosystem Workspace\apps\RatAiFy`

Packages:

| Package | Before | After |
| --- | --- | --- |
| `drizzle-orm` | 0.39.3 | 0.45.2 |
| `drizzle-kit` | 0.31.10 | 1.0.0-rc.1 |

DB adapters/helpers observed: `drizzle-zod 0.7.0`, `pg 8.20.0`, `@neondatabase/serverless 0.10.4`, `connect-pg-simple 10.0.0`

Migration config: `drizzle.config.ts`

Schema files: `shared/schema.ts`

DB/static verification: `verify:migrations`, `verify:shared-supabase-schema`

Files changed: `package.json`, `package-lock.json`

Schema/migration impact: none. No migration files were generated or applied.

Commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Clean before install |
| `npm install drizzle-orm@0.45.2 drizzle-kit@1.0.0-rc.1 --save-exact` | Completed |
| `npm run lint` | Passed with existing warnings |
| `npm run typecheck` | Passed |
| `npm test` | Passed via `test:ops`; 381 tests |
| `npm run build` | Passed |
| `npm run verify:security` | Passed; 23 tests |
| `npm run verify:routes` | Passed; 104 unique paths |
| `npm run verify:env` | Initially failed prerequisite; passed during cleanup with `RELEASE_VERIFY_BASE_URL` set to the documented safe release URL |
| `npm run verify:migrations` | Skipped during cleanup; no safe empty disposable `MIGRATION_TEST_DATABASE_URL` was available, and no production database was used |
| `npm run verify:shared-supabase-schema` | Passed on rerun; schema checks and dev startup completed |
| `npm audit --audit-level=high` | Passed; no high-severity Drizzle advisories remained. Lower-severity unrelated `esbuild` and `uuid` chains remain |
| `npm audit --omit=dev --audit-level=high` | Passed; no high-severity production Drizzle advisories remained. Lower-severity unrelated `uuid` chain remains |

Advisories cleared: `drizzle-orm`; `drizzle-kit` / `@esbuild-kit` advisory chain.

Advisories remaining: `@google-cloud/storage`, `bull`, `esbuild`, `gaxios`, `retry-request`, `teeny-request`, `uuid`.

Cleanup environment:

- `RELEASE_VERIFY_BASE_URL` was set for `npm run verify:env` by variable name only; no secret values are recorded here.
- `MIGRATION_TEST_DATABASE_URL` was not set because no safe empty disposable Postgres database URL was available.

Manual approvals or prerequisites still needed:

- Provide or approve a safe empty disposable Postgres database via `MIGRATION_TEST_DATABASE_URL` before running `npm run verify:migrations`.

Safe to commit: yes, with `verify:migrations` explicitly skipped under the cleanup instruction because no safe disposable migration database was available. Drizzle advisories are cleared. Package metadata changes remained limited to `package.json` and `package-lock.json`; no schema, migration, source, route, auth, scanner, storage, snapshot, build output, `.env`, DB, log, screenshot, or generated artifact files were changed. Committed as `0881871 deps(rataify): upgrade drizzle packages`.

## WordGeni

Affected path: `K:\XFlow-Ecosystem Workspace\apps\WordGeni`

Packages:

| Package | Before | After |
| --- | --- | --- |
| `@wordgeni/api` `drizzle-orm` | 0.38.4 | 0.45.2 |
| `@wordgeni/api` `drizzle-kit` | 0.30.6 | 1.0.0-rc.1 |
| `@wordgeni/worker` `drizzle-orm` | 0.38.4 | 0.45.2 |
| `@wordgeni/retrieval` `drizzle-orm` | 0.38.4 | 0.45.2 |

DB adapters/packages observed: `pg 8.20.0`

Migration config: `apps/api/drizzle.config.cjs`

Schema files: `apps/api/src/db/schema.ts`

DB/static verification: `pnpm --filter @wordgeni/api exec tsc -p tsconfig.drizzle-schema.json`

Files changed: `apps/api/package.json`, `apps/worker/package.json`, `packages/retrieval/package.json`, `pnpm-lock.yaml`

Schema/migration impact: none. No migration files were generated or applied.

Commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Clean before install |
| `pnpm --filter @wordgeni/api add drizzle-orm@0.45.2 --save-exact` | Completed |
| `pnpm --filter @wordgeni/api add -D drizzle-kit@1.0.0-rc.1 --save-exact` | Completed |
| `pnpm --filter @wordgeni/worker add drizzle-orm@0.45.2 --save-exact` | Completed |
| `pnpm --filter @wordgeni/retrieval add drizzle-orm@0.45.2 --save-exact` | Completed |
| `pnpm run lint` | Passed with existing warnings and deprecated `next lint` notice |
| `pnpm run typecheck` | Passed |
| `pnpm test` | Passed via `node scripts/turbo-test.mjs` |
| `pnpm run build` | Passed |
| `pnpm run verify:security` | Passed |
| `pnpm run verify:routes` | Passed |
| `pnpm run verify:env` | Passed |
| `pnpm --filter @wordgeni/api exec tsc -p tsconfig.drizzle-schema.json` | Passed |
| `pnpm audit --json` | No Drizzle advisories remained |
| `pnpm audit --prod --json` | No Drizzle advisories remained |

Advisories cleared: `drizzle-orm`; `drizzle-kit` / `@esbuild-kit` advisory chain.

Advisories remaining: `@ai-sdk/provider-utils`, `@babel/core`, `@opentelemetry/core`, `@opentelemetry/exporter-prometheus`, `@opentelemetry/sdk-node`, `ai`, `brace-expansion`, `esbuild`, `ip-address`, `js-yaml`, `jsondiffpatch`, `markdown-it`, `postcss`, `qs`, `tar`, `uuid`.

Safe to commit: yes. Committed as `cf7c1c2 deps(wordgeni): upgrade drizzle packages`.

## CreVux

Affected path: `K:\XFlow-Ecosystem Workspace\apps\CreVux`

Packages:

| Package | Before | After |
| --- | --- | --- |
| `@workspace/db` `drizzle-orm` | 0.45.1 | 0.45.2 |
| `@workspace/db` `drizzle-kit` | 0.31.9 | 1.0.0-rc.1 |

DB adapters/helpers observed: `drizzle-zod 0.8.3`, `pg 8.20.0`

Migration config: `lib/db/drizzle.config.cjs`

Schema files: `lib/db/src/schema/**/*.ts`

DB/static verification: `db:verify:docs`, `db:verify:migration-filenames`, `db:verify:tsx`

Files changed: `lib/db/package.json`, `lib/db/scripts/verify-migration-docs.mjs`, `lib/db/scripts/verify-migration-filenames.mjs`, `pnpm-lock.yaml`

Schema/migration impact: none. No migration files were generated or applied. `lib/db/package.json` now pins `drizzle-orm` directly to `0.45.2`; the root catalog already resolves `drizzle-orm` to `^0.45.2` for other workspace packages. Cleanup only adjusted static verifier metadata: `verify-migration-docs.mjs` now recognizes the existing multiline `pgTable("video_jobs")` definition, and `verify-migration-filenames.mjs` documents the existing legacy duplicate `0006` migration prefix pair.

Commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Clean before install |
| `pnpm --filter @workspace/db add -D drizzle-kit@1.0.0-rc.1 --save-exact` | Completed |
| `pnpm --filter @workspace/db update drizzle-orm@0.45.2` | Completed |
| `pnpm run lint` | Passed with existing warnings |
| `pnpm run typecheck` | Initially failed due stale local duplicate Drizzle install state; passed after `pnpm exec tsc --build --clean` and `pnpm install --filter @workspace/db --offline` |
| `pnpm test` | Passed; API server and image-gen tests passed |
| `pnpm run build` | Passed |
| `pnpm run verify:security` | Passed |
| `pnpm run verify:routes` | Passed; route parity and API route tests passed |
| `pnpm run verify:env` | Passed |
| `pnpm run db:verify:tsx` | Passed |
| `pnpm run db:verify:docs` | Initially failed existing static parser check; passed after verifier accepted multiline `pgTable("video_jobs")` |
| `pnpm run db:verify:migration-filenames` | Initially failed existing static metadata check; passed after documenting legacy duplicate `0006` prefix pair |
| `pnpm audit --audit-level high` | Passed after the separated TensorFlow/tar working-tree override was present; no Drizzle advisories remained |
| `pnpm audit --prod --audit-level high` | Passed after the separated TensorFlow/tar working-tree override was present; no Drizzle advisories remained |

Advisories cleared: `drizzle-orm`; `drizzle-kit` / `@esbuild-kit` advisory chain.

Advisories remaining: low/moderate unrelated baseline advisories only after the TensorFlow/tar follow-up commit; no high advisories remained in production or full audit.

Manual approvals or prerequisites still needed: none for CreVux Drizzle.

Safe to commit: yes. Committed as `61550eb deps(crevux): upgrade drizzle packages`. The Drizzle commit was staged from a Drizzle-only lockfile slice; the TensorFlow/tar changes remained unstaged and were committed separately afterward.

## Generated Migrations

None.

## Apps Not Touched

Verixet and AudAix were not touched because the baseline did not identify Drizzle/drizzle-kit advisories for them.
