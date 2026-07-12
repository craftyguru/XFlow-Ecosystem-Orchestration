# Phase 2F.5E Real Auth Lifecycle Validation

Date: 2026-07-12

## Executive Summary

The selected Phase 2F.5E target was the local Supabase stack. The local target could not be established because Docker Desktop's Linux engine did not become healthy enough to list or run containers.

No Supabase Auth users were created. No production resources were touched. No production credentials, production users, Stripe state, provider state, migrations, deployments, or production data were used.

Final decision: `BLOCKED`.

## Starting State

| Check | Result |
| --- | --- |
| Root HEAD | `90ad5c98b3be5585581f82bb11d4e103a916e5eb` |
| Branch | `ci-pr-advisory-validation` |
| Root tracked state | Clean |
| App repositories | Clean |
| Pre-existing unrelated untracked files | `docs/interview-teleprompter-final.md`, `docs/interview-teleprompter-research.md`, `docs/teleprompter-export/` |
| `.env.phase2f.local` | Ignored |
| `.phase2f-fixture-state.local.json` | Ignored |
| `.env.phase2f.auth-validation.local` | Ignored by `.gitignore`; not created because no usable target was established |

## Supabase Changelog Review

The Supabase changelog was checked before attempting local validation. Relevant current items noted:

- Supabase CLI installed locally: `2.98.2`;
- newer CLI available: `2.109.1`;
- recent self-hosted/Auth changelog item: API external URL behavior includes `/auth/v1`;
- no changelog item justified bypassing the local Docker/Supabase health requirement.

## Target Selection

Selected target: local Supabase stack.

Reason:

- user explicitly selected local;
- local stack is isolated from production;
- local URL would be `http://127.0.0.1:54321`;
- local database would be `127.0.0.1:54322`;
- no production project reference or production credential would be needed.

## Target Setup Attempt

Observed local configuration:

- root `supabase/config.toml` exists;
- project id: `XFlow-Ecosystem_Workspace`;
- Auth enabled;
- API port: `54321`;
- DB port: `54322`;
- Auth email confirmations disabled for local sign-in validation.

Docker state:

- Docker Desktop is installed;
- Docker service `com.docker.service` was stopped initially;
- Docker Desktop was started;
- one bounded Docker restart attempt was performed;
- Docker did not become healthy.

## Exact Blocker

Commands failed before Supabase could start:

```text
docker ps
docker info
docker run --rm hello-world
npx supabase status
```

Observed errors:

```text
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.54/containers/json
```

```text
failed to inspect container health: request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/containers/supabase_db_XFlow-Ecosystem_Workspace/json
```

Auth health check:

```text
http://127.0.0.1:54321/auth/v1/health
```

Result:

```text
Unable to connect to the remote server
```

## Auth Lifecycle Result

| Step | Result |
| --- | --- |
| Local Supabase start | BLOCKED |
| Auth health | BLOCKED |
| Database health | BLOCKED |
| First standard-user provision | NOT RUN |
| First denied-user provision | NOT RUN |
| First outsider-user provision | NOT RUN |
| Standard password sign-in | NOT RUN |
| Denied password sign-in | NOT RUN |
| Outsider password sign-in | NOT RUN |
| Identity/provider verification | NOT RUN |
| Profile/trigger verification | NOT RUN |
| Second provision/idempotency | NOT RUN |
| Credential mismatch test | NOT RUN |
| Collision refusal test | NOT RUN |
| Cleanup | NOT RUN |
| Post-cleanup sign-in failure | NOT RUN |
| Unrelated-user preservation | NOT RUN |

## Full Fixture Lifecycle Result

Not run. The local Supabase Auth service did not become reachable, so the Auth-backed fixture lifecycle could not begin.

The existing mocked/unit coverage from Phase 2F.5D remains useful repository evidence but is not real Auth lifecycle proof.

## Production No-Write Recheck

Not rerun as a promotion check because the required non-production Auth lifecycle did not pass.

The Phase 2F.5D production refusal behavior remains the current repository-side guard: production execution is blocked when Auth Admin variables are missing or invalid.

## Secret Handling

No local auth-validation env file was created. No service-role key, anon key, password, token, session, production connection string, or generated credential was printed, staged, committed, or stored.

## Production Mutation Confirmation

No production mutation occurred. No production project, production Auth, production database, production environment variables, Stripe, provider-cost API, migration, deployment, or production data path was used.

## Required Next Step

Restore Docker Desktop Linux engine health, then rerun Phase 2F.5E local validation from the beginning.

Minimum acceptance before retry:

```text
docker ps
docker run --rm hello-world
npx supabase start
Invoke-WebRequest http://127.0.0.1:54321/auth/v1/health
```

must all succeed before Auth lifecycle validation can begin.

## Final Decision

`BLOCKED`
