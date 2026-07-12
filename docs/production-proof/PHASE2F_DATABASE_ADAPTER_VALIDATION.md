# Phase 2F Database Adapter Validation

Date: 2026-07-12

## Summary

Phase 2F.4B validated the production-proof fixture adapter shape against a real non-production PostgreSQL database built from the repository Supabase migrations. No production database, production auth service, Stripe object, provider-cost workflow, deployment, secret, or customer data was touched.

Final validation status: DATABASE ADAPTERS VALIDATED - PRODUCTION EXECUTION REQUIRES APPROVAL.

## Target

Preferred local Supabase was not available because Docker Desktop Linux engine was unavailable. The validation used an isolated disposable PostgreSQL 17 cluster on `127.0.0.1:55452` with database `phase2f_validation`.

The database was created from:

- a local Supabase compatibility bootstrap for `auth.users`, `auth.uid()`, `auth.role()`, `storage.buckets`, `storage.objects`, roles, and the early `private.has_workspace_app_access()` reference;
- all repository files in `supabase/migrations/*.sql`, applied in filename order.

Migration result:

| Check | Result |
| --- | --- |
| Seeded ecosystem apps | 6 |
| Migrated ecosystem app-schema tables | 48 |
| Schemas present | `auth`, `storage`, `core`, `xflow`, `verixet`, `rataify`, `audaix`, `crevux`, `wordgeni` |

## Commands

Unit validation remains in-memory:

```text
npm run phase2f:fixtures:validate-unit
```

Real database validation:

```text
npm run phase2f:fixtures:validate-db
```

The legacy alias remains unit-scoped:

```text
npm run phase2f:fixtures:validate
```

## Validation Evidence

Command run:

```text
npm run phase2f:fixtures:validate-db
```

Completion timestamp: 2026-07-12T09:54:28.122Z.

| Adapter | First provision | Second provision | Verify | Cleanup | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Auth | 3 created | 3 reused | 3 rows verified | 3 deleted | PASS |
| XFlow/Core | 15 created | 15 reused | 15 rows verified | 15 deleted | PASS |
| Verixet | 2 created | 2 reused | 2 rows verified | 2 deleted | PASS |
| RatAiFy | 4 created | 4 reused | 4 rows verified | 4 deleted | PASS |
| AudAiX | 3 created | 3 reused | 3 rows verified | 3 deleted | PASS |
| Crevux | 3 created | 3 reused | 3 rows verified | 3 deleted | PASS |
| WordGeni | 3 created | 3 reused | 3 rows verified | 3 deleted | PASS |

Total created on first provision: 33.

Total reused on second provision: 33.

Total deleted during cleanup: 33.

Remaining marked rows after cleanup: 0.

Unrelated table counts unchanged: true.

## Real Database Behavior Proven

| Requirement | Evidence | Result |
| --- | --- | --- |
| Connect to real DB | `phase2f_validation` on disposable PostgreSQL cluster | PROVEN |
| Schema identity | 6 seeded ecosystem apps, 48 app-schema tables | PROVEN |
| Create fixtures | 33 rows inserted across real migrated tables | PROVEN |
| Reuse fixtures | second provision reused all 33 rows and created 0 | PROVEN |
| Verify fixtures | exact count checks matched per adapter | PROVEN |
| Idempotency | create/reuse counts matched expected adapter counts | PROVEN |
| Cleanup | 33 marked rows deleted and 0 marked rows remained | PROVEN |
| Unrelated counts | before and after snapshots matched | PROVEN |
| DB constraints/FKs/enums | inserts ran through migrated tables and constraints | PROVEN |
| RLS visibility | standard user saw workspace; outsider saw 0 workspaces | PROVEN |
| Denied entitlement state | one Verixet deny decision row verified | PROVEN |
| Provider-cost absence | no scan/job/provider/credit/writing-session rows created | PROVEN |
| Stripe mutation absence | no Stripe tables or checkout rows used | PROVEN |
| Supabase Auth Admin API | Docker Supabase unavailable; table-level auth fixture only | BLOCKED |

## Adapter Matrix

| Adapter | Real tables exercised | Notes |
| --- | --- | --- |
| Auth | `auth.users` | Local compatibility table from Supabase bootstrap; not GoTrue Admin API. |
| XFlow/Core | `core.workspaces`, `core.workspace_members`, `core.workspace_app_access`, `core.app_connections`, `xflow.app_links` | Membership rows do not have metadata, so cleanup is bounded by parent marked workspace plus deterministic IDs. |
| Verixet | `verixet.billing_accounts`, `verixet.entitlement_decisions` | Non-Stripe billing account representation and denied entitlement only. |
| RatAiFy | `rataify.sites`, `rataify.reviews`, `rataify.issues`, `rataify.evidence_items` | Stored fixture rows only; no scan/provider job. |
| AudAiX | `audaix.audits`, `audaix.audit_reports`, `audaix.audit_findings` | Stored fixture rows only; no audit/provider job. |
| Crevux | `crevux.projects`, `crevux.assets`, `crevux.exports` | Stored placeholder asset/export only; no generation/provider/credit job. |
| WordGeni | `wordgeni.documents`, `wordgeni.document_sources`, `wordgeni.provenance_items` | Stored document/source/provenance only; no writing session/provider call. |

## Safety Boundary

The validation did not:

- use production credentials;
- create production users;
- create production workspaces;
- mutate production data;
- create Stripe customers, sessions, subscriptions, products, or prices;
- call paid providers;
- run deployments;
- run production migrations;
- change secrets or environment variables.

## Remaining Approval Gate

Production fixture creation remains blocked until explicitly approved with:

```text
--environment production
--confirm-production-fixtures
--enable-reviewed-write-adapters
```

Authenticated production smoke tests remain blocked until approved production test identities and fixtures exist and are recorded privately.

## Phase 2F.5 Follow-Up

Phase 2F.5 did not create production fixtures. The local database validation result remains valid evidence for the adapter shape, but production execution is blocked until the ignored env file exists and the reviewed provisioner has production writes explicitly enabled through a separate reviewed change.

Phase 2F.5A refactored the database validation SQL into reusable lifecycle functions used by both validation and live commands. The exact live local path was validated against the disposable migrated PostgreSQL database: 33 created, 33 reused on second provision, 33 cleaned up, and 0 marked rows remaining.
