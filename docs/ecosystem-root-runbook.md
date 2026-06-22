# Ecosystem Root Runbook

Date: 2026-05-04

This root is a parent folder, not a unified package workspace. Do not run install/build/test commands from the root unless a future root workspace is intentionally added.

## Safe App Commands

| App | Folder | Package manager currently used | Authoritative lockfile today | Safe local commands | Notes |
| --- | --- | --- | --- | --- | --- |
| XFlow | `apps/XFlow` | npm | `package-lock.json` | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run smoke` | Live checks remain behind explicit live commands |
| Verixet | `apps/Verixet` | npm | `package-lock.json` | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run smoke` | Billing scripts can call live Stripe; keep dry-run unless explicitly approved |
| AudAiX | `apps/AudAix` | npm | `package-lock.json` | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run smoke` | Dashboard validation is included through documented scripts |
| RatAiFy | `apps/RatAiFy` | npm | `package-lock.json` | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run smoke` | Canonical app slug is `rataify` |
| WordGeni | `apps/WordGeni` | pnpm | `pnpm-lock.yaml` | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm smoke` | Root package uses `pnpm@9.15.0`; workspace packages use canonical `@wordgeni/*` names |
| CreVux | `apps/CreVux` | pnpm | `pnpm-lock.yaml` | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm smoke` | Requires Node `>=22.18.0` and `pnpm@10.30.3` |

## Authority Boundaries

- Billing owner: Verixet.
- OAuth identity owner: XFlow.
- UCL/event routing owner: XFlow.
- Usage metering owner: Verixet.
- Consumer apps may keep local auth/billing code only as legacy, cache, migration, or app-local behavior when explicitly documented.

## Env Files

Allowed:

- `.env.example`
- `.env.local.example`
- app-specific documented examples that contain placeholders only
- local `.env`, `.env.local`, `.env.test`, and dashboard-specific local env files that are gitignored and never committed

Should never exist in git:

- `.env.production` with real values
- `.env.local` with real values
- `.env.railway` with real values
- copied Railway export files
- Stripe, Supabase, OAuth, SendGrid, Turnstile, DB, JWT, or media signing secrets in docs

## Safe Local Scripts

- Root: `node scripts/validate-ecosystem-contracts.mjs`
- Root: `node scripts/validate-ecosystem-showcase-contracts.mjs`
- Root: `node scripts/generate-ecosystem-contract-package.mjs`
- Per app: typecheck/check, unit tests, and builds listed above
- Verixet Stripe billing scripts: dry-run only unless explicitly approved and test/prod target is verified

## Production-Unsafe Scripts

- DB reset, destructive migrations, seed/admin bootstrap, live smoke against production, Stripe execute/sync/metadata patch, production workspace bootstrap, and any script requiring real provider secrets.
- Do not run live Stripe or production DB scripts from this Phase 1 root workflow.

## Readiness Terms

- Local-demo only: app can run locally with mocks/placeholders but authority boundaries are not proven.
- Staging-ready: app builds and contract validation passes, but real dashboard secrets and cross-app authority proof are still incomplete.
- Production-ready: all app tests/builds pass, real env/dashboard values are configured, XFlow/Verixet authority checks are proven, billing/auth/UCL/usage fail closed, and no fake connected/metric states remain.

Current verdict after Phase 1: staging-ready as a contract cleanup baseline, not production-ready as a six-app ecosystem.
