# Phase 2F.5D Auth Credential Fix Validation

## Executive Summary

Phase 2F.5D removes the production-path dependency on hardcoded fixture emails and homemade `auth.users.encrypted_password` values.

The selected mechanism is Supabase Auth Admin API with configured Phase 2F emails and private passwords. The implementation creates or reuses marked test identities, verifies sign-in through the Auth password endpoint, and passes the resulting Auth user IDs into the database fixture lifecycle.

Production remains untouched. Real non-production Auth validation is blocked in this workspace because no non-production Supabase Auth service is currently reachable.

Final decision: `BLOCKED`.

## Starting Point

- Branch: `ci-pr-advisory-validation`
- Starting commit: `ad07920201a3d6abf8bbb78c6079abd90b958239`
- Root tracked state before edits: clean
- Pre-existing unrelated untracked files: `docs/interview-teleprompter-final.md`, `docs/interview-teleprompter-research.md`, `docs/teleprompter-export/`

## Original Credential Defect

The prior live database fixture path inserted three direct `auth.users` rows with fixed `phase2f.*@example.invalid` emails and a placeholder `encrypted_password`. That path did not consume:

- `PHASE2F_STANDARD_EMAIL`
- `PHASE2F_STANDARD_PASSWORD`
- `PHASE2F_DENIED_EMAIL`
- `PHASE2F_DENIED_PASSWORD`
- `PHASE2F_OUTSIDER_EMAIL`
- `PHASE2F_OUTSIDER_PASSWORD`

Direct password-row insertion is not a supported way to prove Supabase Auth login.

## Supported Auth Mechanism

Production fixture execution now requires Supabase Auth Admin API configuration:

- `PHASE2F_SUPABASE_URL`
- `PHASE2F_SUPABASE_SERVICE_ROLE_KEY`
- `PHASE2F_SUPABASE_ANON_KEY`
- `PHASE2F_EXPECTED_SUPABASE_PROJECT_REF` or `PHASE2F_EXPECTED_PROJECT_REF`

The Auth Admin path uses:

- `GET /auth/v1/admin/users` to look up exact email matches;
- `POST /auth/v1/admin/users` to create absent marked test identities;
- `POST /auth/v1/token?grant_type=password` to verify configured password sign-in;
- `DELETE /auth/v1/admin/users/{id}` only for users created by the current fixture execution.

## Password Handling

Passwords remain in ignored private configuration and runtime memory only.

The implementation does not print passwords, write them into SQL, write them into fixture state, or include them in structured result output. Dynamic redaction covers configured passwords, service-role keys, anon keys, bearer headers, and API key fields.

## Create-Or-Reuse Policy

Absent identity:

- create through Supabase Auth Admin using configured email and password;
- set email confirmed for test login;
- attach deterministic Phase 2F test metadata.

Exact marked identity:

- reuse only when metadata matches Phase 2F marker, fixture version, persona, role, and identity label;
- verify password sign-in with the configured password;
- do not reset password automatically.

Conflicting identity:

- refuse when an email exists without the exact Phase 2F marker;
- refuse when multiple users match the same email;
- refuse when marker or fixture version is ambiguous.

Credential mismatch:

- return `credential_mismatch`;
- do not recreate the user;
- do not reset the password without separate approval.

## Database Fixture Integration

The local disposable PostgreSQL compatibility harness can still insert placeholder auth rows for table-level RLS and fixture lifecycle validation only.

The production provision path now passes Auth Admin-created or reused user IDs into the SQL fixture lifecycle and skips direct auth-user password inserts.

Application profile and trigger side effects still require real non-production Auth validation before production fixture execution can be approved.

## Cleanup Policy

Auth cleanup deletes only user IDs recorded as created by the current fixture run and only after revalidating current Phase 2F metadata. Reused users are preserved. Ambiguous or unmarked users are refused.

## Real Non-Production Auth Validation

Status: `BLOCKED`.

Attempted target checks:

- local Supabase CLI is installed;
- local Supabase status fails because Docker Desktop Linux engine is unavailable;
- `http://127.0.0.1:54321/auth/v1/health` is unreachable;
- no isolated staging/non-production Supabase URL and service-role/anon key were present in `.env.phase2f.local`.

Plain PostgreSQL validation is not sufficient for Auth login proof, so real test-user authentication is not validated in this phase.

## Production No-Write Status

Production was not mutated. Production fixture execution remains blocked until:

1. a real non-production Supabase Auth service is supplied or local Supabase Auth is available;
2. standard, denied, and outsider users are created or reused through Auth Admin;
3. all three identities authenticate with configured passwords;
4. second provision is idempotent;
5. cleanup removes only users created by the fixture run;
6. full fixture lifecycle passes using the same Auth Admin path;
7. production no-write checks are rerun with the new required Auth variables.

## Final Decision

`BLOCKED`
