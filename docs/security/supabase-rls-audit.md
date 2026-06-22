# Supabase RLS Audit

Date: 2026-05-10

## Summary

Supabase review covered service-role isolation, client import boundaries, static RLS proof, schema separation, workspace scoping, entitlement/audit table access, storage policy posture, and public schema exposure.

## Files And Routes Reviewed

- Root Supabase validators and migrations under `supabase/`
- Shared service-role import boundary scripts
- WordGeni Supabase env/admin/server modules
- Verixet client DB import checks
- AudAiX Supabase shared runtime/local/schema tests
- WordGeni workspace, API key, admin, upload, and security audit route tests

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | WordGeni service-role access was not isolated in a dedicated server-only module. | Fixed. |
| Medium | Live DB RLS tests were not executed; root validator reported static proof unless `RUN_RLS_DB_TESTS=1` is set. | Remaining verification gap. |
| Medium | Broad authenticated select grants rely on RLS. This can be acceptable, but should be kept under migration review. | Remaining review item. |
| Low | Audit log visibility should be reviewed for least privilege; workspace-member reads may be broader than desired for security/admin events. | Remaining review item. |
| Informational | Root Supabase validation, service-role import boundary, and static RLS proof passed. Verixet client DB import check passed. | Verified. |

## Fixes Applied

- WordGeni server-only Supabase env module created.
- WordGeni server/admin Supabase clients now consume server-only env helper.

## Remaining Recommended Work

- Run `RUN_RLS_DB_TESTS=1 npm run supabase:validate` against a disposable staging Supabase project.
- Add migration tests that reject broad authenticated write grants unless explicitly allowlisted.
- Add storage bucket policy tests for every app-owned bucket.
- Consider narrowing audit log select policies to workspace admins/security admins where product requirements allow.

## Verification Commands Run

- Root: `npm run supabase:validate` - passed static validation and service-role boundary proof.
- Verixet: `npm run check:client-db-imports` - passed.
- AudAiX: `npm run test:ci` - passed Supabase config/schema/runtime tests.
- WordGeni: `pnpm test` and `pnpm lint` - passed after Supabase env split.

