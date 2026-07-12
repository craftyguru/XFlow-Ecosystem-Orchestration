# Phase 2F Fixture Provisioner Implementation

Date: 2026-07-12

## Purpose

Phase 2F authenticated production proof requires isolated test identities, one proof workspace, and stored app fixtures. The provisioner in `scripts/phase2f/` is a bounded root-level mechanism for planning, validating, verifying, and eventually creating those fixtures without broad seed scripts, provider calls, Stripe mutations, migrations, or secret exposure.

## Commands

```text
npm run phase2f:fixtures:dry-run
npm run phase2f:fixtures:validate-unit
npm run phase2f:fixtures:validate-db
npm run phase2f:fixtures:verify
npm run phase2f:fixtures:cleanup
node scripts/phase2f/provision-production-proof-fixtures.mjs --dry-run
node scripts/phase2f/validate-production-proof-fixtures.mjs --environment local --confirm-test-fixtures
node scripts/phase2f/validate-production-proof-fixtures-db.mjs --environment local --confirm-test-fixtures
node scripts/phase2f/provision-production-proof-fixtures.mjs --environment production --confirm-production-fixtures
```

Unit validation executes the actual write adapter methods against an in-memory non-production fixture store. Database validation executes deterministic marked fixture rows against a real non-production PostgreSQL database created from the repository Supabase migrations. Real production writes require explicit approval, production flags, expected project validation, and `--enable-reviewed-write-adapters`.

## Write Adapter Architecture

Adapters live in `scripts/phase2f/adapters/` and expose:

```text
plan(context)
provision(context)
verify(context)
cleanup(context)
```

Implemented adapters:

| Adapter | Scope |
| --- | --- |
| `auth-adapter.mjs` | Shared test identities without logging credentials. |
| `xflow-adapter.mjs` | Proof workspace, memberships, app catalog metadata. |
| `verixet-adapter.mjs` | Non-Stripe billing account and denied-entitlement verification. |
| `rataify-adapter.mjs` | Stored site, scan, and metadata-only report fixture. |
| `audaix-adapter.mjs` | Stored audit, report, and evidence fixture. |
| `crevux-adapter.mjs` | Stored project, placeholder asset, and metadata-only export. |
| `wordgeni-adapter.mjs` | Stored project, source, document, and provenance fixture. |

## Environment Variables

Use only the ignored local file `.env.phase2f.local` or an approved secret store.

Required for real execution:

```text
PHASE2F_STANDARD_EMAIL
PHASE2F_STANDARD_PASSWORD
PHASE2F_DENIED_EMAIL
PHASE2F_DENIED_PASSWORD
PHASE2F_OUTSIDER_EMAIL
PHASE2F_OUTSIDER_PASSWORD
PHASE2F_PROOF_WORKSPACE_SLUG
```

Optional:

```text
PHASE2F_ENTITLED_EMAIL
PHASE2F_ENTITLED_PASSWORD
PHASE2F_ADMIN_EMAIL
PHASE2F_ADMIN_PASSWORD
PHASE2F_SUPABASE_URL
PHASE2F_SUPABASE_SERVICE_ROLE_KEY
PHASE2F_EXPECTED_SUPABASE_PROJECT_REF
```

The provisioner validates variable names and redacts secret-shaped fields from structured output. It does not print credential values.

## Identity Model

Supported identities:

| Identity | Required | Purpose |
| --- | --- | --- |
| `ecosystem_test_standard` | Yes | Normal proof workspace member. |
| `ecosystem_test_denied` | Yes | Authenticated user with no paid entitlement. |
| `ecosystem_test_outsider` | Yes | Authenticated user with no proof workspace membership. |
| `ecosystem_test_entitled` | Optional | Non-billable test entitlement subject. |
| `ecosystem_test_admin` | Optional | Workspace-scoped test admin only when unavoidable. |

## Fixture Model

Every planned operation has a deterministic key, precondition, idempotency rule, verification rule, cleanup rule, cost control, and schema evidence path.

| App | Fixture Category | Stored-only Scope |
| --- | --- | --- |
| XFlow | Workspace/catalog/handoff | Workspace, memberships, app catalog metadata, Verixet handoff metadata. |
| Verixet | Billing/entitlement | Non-Stripe billing account representation, denied subject, optional non-billable grant. |
| RatAiFy | Stored scan/report | Test-owned site, completed stored scan/report metadata. |
| AudAiX | Stored audit/report | Completed stored audit/report/evidence rows. |
| Crevux | Stored asset/export | Project, placeholder asset, metadata-only export fixture. |
| WordGeni | Stored document/source/export | Project, source, document, provenance, stored export fixture. |

## Production Guardrails

- `--dry-run` is the default safe path.
- Real execution requires `--environment production --confirm-production-fixtures`.
- Real writes currently refuse until app-specific write adapters are separately reviewed.
- Production project URL can be pinned with `PHASE2F_EXPECTED_SUPABASE_PROJECT_REF`.
- State is written atomically to `.phase2f-fixture-state.local.json`.
- Cleanup refuses any record that lacks the Phase 2F marker, does not match state, or has non-test dependents.
- `phase2f:fixtures:validate-db` refuses production targets and requires `--confirm-test-fixtures`.

## Known Limitations

- No production fixtures are created by this phase.
- Unit validation uses an in-memory fixture store; database validation uses disposable migrated PostgreSQL. Production execution still requires approval and live target validation.
- Supabase Auth Admin API behavior remains blocked locally because the Docker-backed Supabase stack was unavailable; database validation covers only `auth.users` table-level fixture rows.
- App-local auth password hash behavior still needs production-target approval before real writes.
- Verixet non-billable entitlement may require an approved non-Stripe subscription/test entitlement representation because `entitlement_grants` references commerce subscription state.
- Authenticated screenshots remain separately approval-bound.
- Provider-backed workflows remain impossible without provider calls and must use stored fixtures or denied-gate checks.
