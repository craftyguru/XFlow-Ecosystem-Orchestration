# Phase 2F Fixture Provisioner Implementation

Date: 2026-07-12

## Purpose

Phase 2F authenticated production proof requires isolated test identities, one proof workspace, and stored app fixtures. The provisioner in `scripts/phase2f/` is a bounded root-level mechanism for planning, validating, verifying, and eventually creating those fixtures without broad seed scripts, provider calls, Stripe mutations, migrations, or secret exposure.

## Commands

```text
npm run phase2f:fixtures:dry-run
npm run phase2f:fixtures:verify
npm run phase2f:fixtures:cleanup
node scripts/phase2f/provision-production-proof-fixtures.mjs --dry-run
node scripts/phase2f/provision-production-proof-fixtures.mjs --environment production --confirm-production-fixtures
```

Real production writes are intentionally disabled until the app-specific write adapter is reviewed and approved. The production flags are still required so the command surface cannot accidentally treat staging or local execution as production.

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

## Known Limitations

- No production fixtures are created by this phase.
- App-local auth password hash behavior still needs adapter-level approval before real writes.
- Verixet non-billable entitlement may require an approved non-Stripe subscription/test entitlement representation because `entitlement_grants` references commerce subscription state.
- Authenticated screenshots remain separately approval-bound.
- Provider-backed workflows remain impossible without provider calls and must use stored fixtures or denied-gate checks.
