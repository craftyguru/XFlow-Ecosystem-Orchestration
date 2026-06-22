# Supabase Phase 1 Validation Report

Date: 2026-05-04

## Apps Scanned

- XFlow
- Verixet
- AudAiX
- Rataify
- WordGeni
- Crevux

## Files Added

- `docs/supabase-consolidation-audit.md`
- `docs/supabase-shared-db-architecture.md`
- `docs/supabase-migration-runbook.md`
- `docs/supabase-future-extraction-checklist.md`
- `docs/supabase-phase1-validation-report.md`
- `scripts/validate-supabase-phase1.mjs`
- `supabase/migrations/001_core_schema.sql`
- `supabase/migrations/002_core_rls.sql`
- `supabase/migrations/010_xflow_schema.sql`
- `supabase/migrations/011_xflow_rls.sql`
- `supabase/migrations/020_verixet_schema.sql`
- `supabase/migrations/021_verixet_rls.sql`
- `supabase/migrations/030_audaix_schema.sql`
- `supabase/migrations/031_audaix_rls.sql`
- `supabase/migrations/040_rataify_schema.sql`
- `supabase/migrations/041_rataify_rls.sql`
- `supabase/migrations/050_wordgeni_schema.sql`
- `supabase/migrations/051_wordgeni_rls.sql`
- `supabase/migrations/060_crevux_schema.sql`
- `supabase/migrations/061_crevux_rls.sql`
- `supabase/migrations/090_storage_buckets.sql`
- `supabase/migrations/091_seed_ecosystem_apps.sql`
- `supabase/migrations/099_validation_checks.sql`

## Migrations Created

The root shared migration source is `supabase/migrations`.

Domains covered:

- `core.*` shared schema and RLS
- `xflow.*` schema and RLS
- `verixet.*` schema and RLS
- `audaix.*` schema and RLS
- `rataify.*` schema and RLS
- `wordgeni.*` schema and RLS
- `crevux.*` schema and RLS
- private app-specific storage buckets
- `core.ecosystem_apps` seed data
- SQL validation checks

## Env Vars Required Later

Public browser env, framework-specific:

- Next.js: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vite: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Server-only:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

## Tests And Checks Added

- `scripts/validate-supabase-phase1.mjs`
  - checks required migration files
  - checks required docs
  - checks bucket names in storage SQL
  - checks app slugs in seed SQL
  - scans likely frontend/client files for service-role leakage

## Commands Run

| Command | Result |
| --- | --- |
| `node --check scripts/validate-supabase-phase1.mjs` | Passed |
| Required migration filename comparison | Passed |
| SQL placeholder/forbidden-token scan | Passed |
| `node scripts/validate-supabase-phase1.mjs` | Failed |

## Failed Command Detail

`node scripts/validate-supabase-phase1.mjs` failed because it found pre-existing service-role env-name references in a likely browser file:

- `apps/AudAix/dashboard/src/lib/sentry.tsx`

The reference is in a redaction regex, not a real secret value. It still violates the tightened Phase 1 policy because browser bundles should not reference service-role env names at all.

This was not fixed in Phase 1 because the requested scope explicitly excludes runtime app code changes.

## Manual Supabase Setup Still Required

- Create the new Supabase project.
- Configure auth site URL and redirect URLs.
- Apply migrations in order.
- Verify RLS in the dashboard.
- Verify private storage buckets.
- Add real env values to secret stores.
- Run `099_validation_checks.sql` in the new project.
- Run app-specific typecheck/test/build commands after runtime phases begin.

## Known Risks

- The SQL migrations were statically inspected but not applied to a live Supabase project in this turn.
- One existing AudAiX browser file violates the strict service-role-reference validation policy.
- Existing app migrations remain legacy references and have not been reconciled table-by-table.
- Runtime helper utilities and app code updates are intentionally deferred.

## Future Extraction Readiness

| App | Score |
| --- | ---: |
| XFlow | 7 |
| Verixet | 7 |
| AudAiX | 6 |
| Rataify | 5 |
| WordGeni | 6 |
| Crevux | 6 |
