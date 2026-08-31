# Phase 2F.5B Private Configuration Readiness

Date: 2026-07-12

## Summary

Phase 2F.5B prepared the ignored private configuration file for a future approved Phase 2F.5 production fixture execution. No production fixtures were created.

Final decision: PRIVATE INPUT REQUIRED.

Phase 2F.5C update: the three password values were completed privately and final no-write preflight checks passed, but production execution was BLOCKED because the live SQL fixture path still hardcoded auth emails and placeholder password hashes instead of consuming the private Phase 2F credential variables.

Phase 2F.5D update: the production auth path now uses Supabase Auth Admin and requires Supabase URL, service-role key, anon key, and matching project reference. Real non-production Auth validation is still BLOCKED in this workspace.

## Starting State

| Check | Result |
| --- | --- |
| Root HEAD | `f62745ae7daee0e7afa54710ff354d0704f5746b` |
| Branch | `ci-pr-advisory-validation` |
| Root tracked state | Clean before Phase 2F.5B edits; unrelated teleprompter files remained untracked |
| Six app repositories | Clean |
| `.env.phase2f.local` | Ignored |
| `.phase2f-fixture-state.local.json` | Ignored |

## Variable Inventory

| Variable | Required | Secret | Purpose | Source of truth | Auto-derived | Current readiness | User input required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PHASE2F_DATABASE_URL` | Yes | Yes | Direct PostgreSQL connection for fixture adapter | Approved private `.env.shared.local` database URL | Yes, from approved private source | Present privately | No |
| `PHASE2F_EXPECTED_PROJECT_REF` | Yes | No | Supabase project identity check | Supabase URL and DB username suffix | Yes | Present privately | No |
| `PHASE2F_EXPECTED_DB_HOST` | Yes | No | Database host identity check | Parsed PostgreSQL URL host | Yes | Present privately | No |
| `PHASE2F_EXPECTED_DB_NAME` | Yes | No | Database name identity check | Parsed PostgreSQL URL database | Yes | Present privately | No |
| `PHASE2F_EXPECTED_ENVIRONMENT_NAME` | Yes | No | Production target assertion | Phase 2F execution policy | Yes | Present | No |
| `PHASE2F_REVIEWED_MANIFEST_VERSION` | Yes | No | Reviewed adapter manifest acknowledgement | `scripts/phase2f/lib/provisioner-core.mjs` | Yes | Present | No |
| `PHASE2F_STANDARD_EMAIL` | Yes | No | Standard member synthetic identity label | Phase 2F naming pattern | Yes | Present | No |
| `PHASE2F_STANDARD_PASSWORD` | Yes | Yes | Standard test identity password | Private operator input | No | Placeholder | Yes |
| `PHASE2F_DENIED_EMAIL` | Yes | No | Denied member synthetic identity label | Phase 2F naming pattern | Yes | Present | No |
| `PHASE2F_DENIED_PASSWORD` | Yes | Yes | Denied test identity password | Private operator input | No | Placeholder | Yes |
| `PHASE2F_OUTSIDER_EMAIL` | Yes | No | Outsider synthetic identity label | Phase 2F naming pattern | Yes | Present | No |
| `PHASE2F_OUTSIDER_PASSWORD` | Yes | Yes | Outsider test identity password | Private operator input | No | Placeholder | Yes |
| `PHASE2F_PROOF_WORKSPACE_SLUG` | Yes | No | Deterministic proof workspace slug | Phase 2F naming pattern | Yes | Present | No |
| `PHASE2F_ENTITLED_EMAIL` | Optional | No | Optional allowed-entitlement identity | Phase 2F.6 if needed | No | Omitted | No for minimum set |
| `PHASE2F_ENTITLED_PASSWORD` | Optional | Yes | Optional entitled password | Private operator input if selected | No | Omitted | No for minimum set |
| `PHASE2F_ADMIN_EMAIL` | Optional | No | Optional scoped admin identity | Phase 2F.6 if needed | No | Omitted | No for minimum set |
| `PHASE2F_ADMIN_PASSWORD` | Optional | Yes | Optional scoped admin password | Private operator input if selected | No | Omitted | No for minimum set |
| `PHASE2F_SUPABASE_URL` | Yes | No | Supabase Auth Admin/Auth API base URL | Private/project config | Available elsewhere | Required for 2F.5D | No if supplied privately |
| `PHASE2F_SUPABASE_SERVICE_ROLE_KEY` | Yes | Yes | Supabase Auth Admin service-role API key | Supabase dashboard | No | Required for 2F.5D | Yes if absent |
| `PHASE2F_SUPABASE_ANON_KEY` | Yes | Yes | Supabase Auth password sign-in verification key | Supabase dashboard | No | Required for 2F.5D | Yes if absent |
| `PHASE2F_EXPECTED_SUPABASE_PROJECT_REF` | Optional | No | Auth URL project-ref check; falls back to `PHASE2F_EXPECTED_PROJECT_REF` | Project metadata | Available elsewhere | Recommended | No |

The earlier seven missing values were the original identity/workspace requirements. The current production execution gate has thirteen true required values: those seven plus `PHASE2F_DATABASE_URL`, `PHASE2F_EXPECTED_PROJECT_REF`, `PHASE2F_EXPECTED_DB_HOST`, `PHASE2F_EXPECTED_DB_NAME`, `PHASE2F_EXPECTED_ENVIRONMENT_NAME`, and `PHASE2F_REVIEWED_MANIFEST_VERSION`.

## Target Validation

Two independent project signals were available privately:

- Supabase URL project reference;
- PostgreSQL pooler username project-reference suffix.

The direct PostgreSQL URL target was parsed without printing the connection string. The configured target passed production identity validation:

- non-localhost target;
- expected project reference present in the connection identity;
- expected host matched the parsed database host;
- expected database name matched `postgres`;
- expected environment name was `production`.

Read-only schema validation passed:

| Check | Result |
| --- | --- |
| Database | `postgres` |
| Required schemas | auth, storage, core, xflow, verixet, rataify, audaix, crevux, wordgeni |
| Seeded ecosystem apps | 6 |
| Required app-schema tables | 48 |

## Selected Identity Set

Minimum identity set selected:

- `ecosystem_test_standard`;
- `ecosystem_test_denied`;
- `ecosystem_test_outsider`.

Optional identities omitted:

- `ecosystem_test_entitled`;
- `ecosystem_test_admin`.

The entitled identity should remain omitted until Phase 2F.6 proves an allowed paid-entitlement path cannot be covered with the standard identity plus an explicitly approved reversible non-billable test grant. The admin identity remains omitted because no current smoke proof requires a scoped admin.

## Naming Pattern

Synthetic email labels use the controlled project domain pattern:

```text
phase2f.<persona>@xflowx.com
```

Workspace slug:

```text
ecosystem-production-proof-20260712
```

Fixture marker:

```text
phase=2F
label=phase2f-production-proof
environment=production-proof
isTest=true
```

## Preflight Results

| Check | Result |
| --- | --- |
| Environment file parsing | PASS |
| Required variable presence | BLOCKED - three password placeholders remain |
| Placeholder rejection | PASS |
| Target identity | PASS |
| Manifest version | PASS |
| Schema availability | PASS |
| Migration/schema compatibility | PASS - 6 apps and 48 app-schema tables |
| Table allow-list | PASS - reviewed manifest only |
| Fixture marker version | PASS |
| State-file target binding | PASS - old dry-run state has no conflicting target binding |
| Collision checks | NOT RUN - collision probe is part of write-path lifecycle and was not executed in this no-write phase |
| Prohibited operation checks | PASS |
| Credential capability without writing | PASS - read-only schema query succeeded |

## Dry-Run And Refusal

Production dry-run command:

```text
npm run phase2f:fixtures:dry-run -- --environment production --json
```

Result: PASS for plan generation and no-write target validation. Missing required values were limited to:

- `PHASE2F_STANDARD_PASSWORD`;
- `PHASE2F_DENIED_PASSWORD`;
- `PHASE2F_OUTSIDER_PASSWORD`.

Guarded provision refusal command:

```text
node scripts/phase2f/provision-production-proof-fixtures.mjs --environment production --enable-reviewed-write-adapters --json
```

Result: PASS as a refusal. The command stopped before target connection or write because `--confirm-production-fixtures` was omitted and the three password placeholders remain.

## Private File Result

`.env.phase2f.local` was created as an ignored local file. It contains:

- the private database URL copied from an approved repo-local private source;
- derived non-secret target validation fields;
- deterministic synthetic identity labels;
- deterministic workspace slug;
- explicit `REQUIRES_PRIVATE_INPUT` placeholders for the three required passwords.

The complete file was not printed and must not be committed.

`.phase2f-fixture-state.local.json` remains ignored. It currently contains dry-run-only state and no production-created fixture IDs.

## Blockers

Phase 2F.5 cannot proceed until the operator privately replaces these placeholders in `.env.phase2f.local`:

| Variable | Secret | Retrieve or create from | Required before Phase 2F.5 |
| --- | --- | --- | --- |
| `PHASE2F_STANDARD_PASSWORD` | Yes | Private production-proof test-account password store | Yes |
| `PHASE2F_DENIED_PASSWORD` | Yes | Private production-proof test-account password store | Yes |
| `PHASE2F_OUTSIDER_PASSWORD` | Yes | Private production-proof test-account password store | Yes |

Do not paste these values into chat. Enter them directly into `.env.phase2f.local`.

## Safety Confirmation

This phase did not:

- run the full production provision command;
- create users, workspaces, memberships, entitlements, scans, audits, projects, assets, documents, reports, billing records, or provider jobs;
- mutate Stripe, billing, providers, databases, deployments, migrations, secrets, domains, or production data;
- commit `.env.phase2f.local` or `.phase2f-fixture-state.local.json`.

## Next Approval Required

After the three passwords are entered privately, rerun the read-only preflight and dry-run. Production fixture creation still requires explicit renewed approval to run the full guarded command with:

```text
--environment production --confirm-production-fixtures --enable-reviewed-write-adapters
```
