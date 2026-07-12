# Phase 2F.5A Production Write Enablement

Date: 2026-07-12

## Summary

Phase 2F.5A replaced the previous unconditional production-write refusal with strict calculated gates and wired the live fixture commands to the same bounded PostgreSQL lifecycle that was validated in Phase 2F.4B.

Production was not touched. No production credentials were used.

Final enablement status: PRODUCTION WRITE PATH ENABLED - PRIVATE CONFIGURATION REQUIRED.

Phase 2F.5B private configuration status: target identity was populated from approved private sources and read-only schema validation passed. The runtime now rejects template placeholders such as `REQUIRES_PRIVATE_INPUT`. Production execution remains blocked until the three required test identity passwords are entered privately.

Phase 2F.5D status: production auth fixture creation now requires the bounded Supabase Auth Admin path and configured private credentials. Production execution also requires successful real non-production Auth lifecycle validation before approval can proceed.

## Previous Blockers

Phase 2F.5 was blocked because:

- `.env.phase2f.local` was absent;
- production target identity could not be validated;
- the provisioner reported `productionWritesEnabled: false`;
- non-dry production execution was unconditionally refused.

## Command Separation

| Command | Purpose |
| --- | --- |
| `npm run phase2f:fixtures:dry-run` | Plan-only dry run. |
| `npm run phase2f:fixtures:validate-unit` | In-memory unit validation. |
| `npm run phase2f:fixtures:validate-db` | Real disposable PostgreSQL lifecycle validation. |
| `npm run phase2f:fixtures:provision` | Guarded live PostgreSQL provision path. |
| `npm run phase2f:fixtures:verify-live` | Guarded live PostgreSQL verification path. |
| `npm run phase2f:fixtures:cleanup-live` | Guarded live PostgreSQL cleanup path. |

## Reviewed Adapter Manifest

Manifest version: `phase2f-production-fixtures-v1`

Reviewed implementation commit: `161a410b8b96849d8790bbd2d857fab01f579928`

Adapters:

- auth;
- xflow;
- verixet;
- rataify;
- audaix;
- crevux;
- wordgeni.

Permitted operation types:

- create or reuse marked fixtures;
- verify marked fixtures;
- delete marked fixtures in dependency order.
- bounded Supabase Auth Admin lookup, create, password verification, and delete-created-user operations.

Prohibited operation types:

- Stripe mutations;
- checkout, subscription, invoice, or payment-method creation;
- provider calls;
- crawl, scan, audit, AI, embedding, ingestion, media rendering, transcription, or paid export execution.

## Production Gate

Production writes default to false and require all of:

- `--environment production`;
- `--confirm-production-fixtures`;
- `--enable-reviewed-write-adapters`;
- reviewed manifest version `phase2f-production-fixtures-v1`;
- all required private env names populated;
- Supabase Auth Admin URL, service-role key, anon key, and project-ref validation;
- production target identity validation;
- expected schema/migration contract;
- clean state-file target binding;
- provider/billing guard passing;
- no collision or marker failure.

There is no force, skip-validation, unsafe, or ignore-collision flag.

## Target Identity Validation

The live path validates:

- expected project reference;
- expected database host;
- expected database name;
- expected environment name;
- localhost refusal for production;
- non-local refusal for local execution;
- schema identity: 6 seeded apps and at least 48 migrated app-schema tables.

Full connection strings are never printed.

## State Binding

`.phase2f-fixture-state.local.json` remains ignored. Live execution stores non-secret target binding only:

- environment;
- manifest version;
- hashed target identity;
- database name.

The provisioner refuses reuse when an existing state file is bound to a different target.

## Private Configuration Template

Template path:

```text
docs/production-proof/PHASE2F_ENVIRONMENT_VARIABLES.example
```

Do not commit `.env.phase2f.local`.

Required variables:

| Variable | Required | Class |
| --- | --- | --- |
| `PHASE2F_DATABASE_URL` | Yes | secret |
| `PHASE2F_EXPECTED_PROJECT_REF` | Yes | non-secret target identity |
| `PHASE2F_EXPECTED_DB_HOST` | Yes | non-secret target identity |
| `PHASE2F_EXPECTED_DB_NAME` | Yes | non-secret target identity |
| `PHASE2F_EXPECTED_ENVIRONMENT_NAME` | Yes | non-secret target identity |
| `PHASE2F_REVIEWED_MANIFEST_VERSION` | Yes | deterministic fixture label |
| `PHASE2F_STANDARD_EMAIL` | Yes | deterministic fixture label |
| `PHASE2F_STANDARD_PASSWORD` | Yes | secret |
| `PHASE2F_DENIED_EMAIL` | Yes | deterministic fixture label |
| `PHASE2F_DENIED_PASSWORD` | Yes | secret |
| `PHASE2F_OUTSIDER_EMAIL` | Yes | deterministic fixture label |
| `PHASE2F_OUTSIDER_PASSWORD` | Yes | secret |
| `PHASE2F_PROOF_WORKSPACE_SLUG` | Yes | deterministic fixture label |
| `PHASE2F_ENTITLED_EMAIL` | Optional | deterministic fixture label |
| `PHASE2F_ENTITLED_PASSWORD` | Optional | secret |
| `PHASE2F_ADMIN_EMAIL` | Optional | deterministic fixture label |
| `PHASE2F_ADMIN_PASSWORD` | Optional | secret |

The previous seven missing values are still required. Six new production target/manifest values were added: `PHASE2F_DATABASE_URL`, `PHASE2F_EXPECTED_PROJECT_REF`, `PHASE2F_EXPECTED_DB_HOST`, `PHASE2F_EXPECTED_DB_NAME`, `PHASE2F_EXPECTED_ENVIRONMENT_NAME`, and `PHASE2F_REVIEWED_MANIFEST_VERSION`.

## Local Validation Evidence

Disposable database target: `127.0.0.1:55452/phase2f_validation`.

Schema evidence:

- seeded ecosystem apps: 6;
- migrated app-schema tables: 48.

Exact live local path:

| Step | Result |
| --- | --- |
| First provision | 33 created |
| Live verify | counts matched; RLS standard visible / outsider denied |
| Second provision | 33 reused, 0 created |
| Cleanup dry-run | safety plan passed |
| Cleanup | 33 deleted |
| Cleanup verification | 0 marked rows remained |
| Provider/billing rows | 0 provider-cost rows; no Stripe tables used |

The original `phase2f:fixtures:validate-db` lifecycle also passed after the refactor.

## Production Boundary

This phase did not:

- use production credentials;
- create production users;
- create production workspaces;
- create production fixtures;
- mutate billing or Stripe state;
- call providers;
- deploy;
- run migrations;
- capture authenticated screenshots.

## Next Approval Required

The next approval is for Phase 2F.5 retry using the private `.env.phase2f.local` values and the guarded production provision command. Production execution must still stop if target identity, state binding, marker checks, provider/billing guard, schema validation, or collision checks fail.
