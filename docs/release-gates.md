# Ecosystem Release Gates

The root release proof command is:

```powershell
npm run release:proof
```

It produces an evidence-backed report at:

- `output/ecosystem-audit-hardening-report.json`
- `output/ecosystem-audit-hardening-report.md`

## Result Semantics

Each check must report one of:

- `PASS`: the check ran and passed.
- `FAIL`: the check ran and failed, or a required contract is missing.
- `SKIP - script missing`: the app does not expose the required script yet.
- `SKIP - env missing`: required local/live proof env is missing.
- `SKIP - unsafe without proof env`: the check could touch live/protected systems and safe proof env was not configured.

The report must not invent data. Missing proof is recorded as not verified.

## Root Proof Areas

`release:proof` covers:

- Static ecosystem proof.
- Proof scanner tests.
- Supabase validation when safe env is available.
- Env contract validation.
- Route contract validation.
- Static security checks.
- Six-app build/release script matrix.
- XFlow handoff contract evidence.
- Verixet billing and entitlement contract evidence.

## Merge Gate Target

No merge to the production branch should be allowed unless these pass:

- Typecheck.
- Lint.
- Tests.
- Build.
- Proof scanner.
- Env contract validation.
- Route contract validation.
- Static security checks.

## Production Deploy Target

No production deploy should proceed unless these pass:

- `release:proof`.
- Migration dry run on a disposable database.
- Staging migration proof.
- App smoke checks.
- XFlow handoff smoke checks.
- Verixet billing/entitlement smoke checks.
- Rollback path is documented.

## Migration Gate Target

No production database migration should run without:

- Disposable database proof.
- Staging proof.
- Rollback note.
- RLS/workspace-scope check.
- Affected route list.

