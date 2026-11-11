# Crevux Mobile8 production migration approval packet

Status: **READY FOR REVIEW; NOT AUTHORIZED FOR PRODUCTION**

Prepared: 2026-11-10 (America/Chicago)

Canonical repository baseline: `craftyguru/XFlow-Ecosystem-Orchestration` `main` at `5b7cc028dcec07c495c42cd1aa58841d7c4b8334`

Production project inspected read-only: `mjfzoikkoykszxzuebdf` (`Xflow-Ecosystem`, PostgreSQL 17.6)

Latest production migration before this proposal: `20261102045558`

## Proposed migration

- File: `supabase/migrations/20261111020115_crevux_mobile8_import_ledger.sql`
- SHA-256: `b19167d7eeabc1980ead7f18023d0793ef5354878cf75c7258c5f2990db2d5df`
- Size: 12,825 bytes; 305 lines
- Transactional qualification: passed with `lock_timeout = '5s'` and `statement_timeout = '60s'`
- Production execution: not performed

The migration is additive and creates only:

1. `crevux.mobile8_import_operations`
2. `crevux.mobile8_import_items`
3. `crevux.mobile8_moderation_receipts`
4. `crevux.mobile8_principal_binding_scope_uidx` on `(id, auth_user_id, core_workspace_id)`
5. `crevux.mobile8_asset_workspace_uidx` on `(id, workspace_id)`
6. The tables' required primary, unique, foreign-key and check constraints
7. Six activity/reconciliation/cleanup indexes plus one primary-item partial unique index
8. `crevux.mobile8_set_updated_at()` and three row triggers
9. Three service-only RLS policies and their table/function grants

It does not change an existing column, data row, API route, feature flag, billing rule, provider gate, Android client, or public schema contract.

## Migration-history reconciliation

The production migration ledger contains 24 applied timestamped entries that were absent from this checkout. Their recorded `statements[]` bodies were recovered through authorized read-only ledger inspection and restored locally as versioned files from `20260910070010` through `20261102045558`. Each recovered file records the MD5 of the production ledger's statement join for independent comparison.

The original byte-for-byte files were not recoverable from retained Git objects or remotes. In particular, historical Mobile8C commit `98ae1e67...` and blob `15b15e8...` are unreachable, and that migration is not in the production ledger. The restored files therefore preserve the exact ledger statement bodies but add provenance headers and statement terminators; they must not be represented as byte-identical originals.

Two local June hardening files (`20260611063431` and `20260611081601`) have effects visible in production but are not represented as matching entries in the inspected ledger. This makes a full filename-ordered rebuild from the repository historically non-authoritative: migration `064` depends on a helper supplied by the hardening sequence, while the hardening sequence itself depends on a later numbered object. The provenance/order defect should be repaired separately, but it does not block this forward migration because its dependencies and target absence were independently checked against the production catalog and reproduced in a dependency-complete clone. No production ledger row was invented or rewritten.

## Production catalog comparison

| Requirement | Production before migration | Clone after migration | Result |
| --- | --- | --- | --- |
| Three Mobile8 tables | Absent | Present with reviewed contract | PASS |
| Two composite ownership indexes | Absent | Present and unique | PASS |
| Required UUID dependency columns | Present with expected types | Preflight enforced | PASS |
| Existing target-name collision | None | Preflight rejects collision | PASS |
| `crevux` schema owner | `postgres` | Migration-owner equivalent | PASS |
| Runtime schema access | `service_role` has `USAGE`; `authenticated` has `USAGE`; `anon` does not | Production ACL reproduced for negative tests | PASS |
| Client table access | New tables absent | No grants to PUBLIC/anon/authenticated | PASS |
| Runtime table access | New tables absent | service role has SELECT/INSERT/UPDATE/DELETE | PASS |
| RLS | N/A | ENABLE + FORCE on all three tables | PASS |
| Policies | N/A | One `FOR ALL TO service_role` policy per table | PASS |

The two existing indexed relations are small in the inspected production catalog: `crevux.assets` is approximately 168 KiB with about 49 estimated rows, and `crevux.xflow_principal_bindings` is approximately 80 KiB. Both new indexes lead with an existing primary-key `id`, so duplicate-key failure is precluded by the current primary keys.

## FORCE RLS decision

FORCE RLS is retained. The tables are private server ledgers and are not a client-facing workspace query surface. PUBLIC, `anon`, and `authenticated` receive no table privileges. `service_role` receives only CRUD privileges and an explicit all-rows policy. Production already grants `service_role` schema usage. PostgreSQL roles with `BYPASSRLS` (including the platform owner and Supabase service role) retain their documented bypass; FORCE RLS principally prevents an ordinary non-bypass table owner from silently avoiding policy enforcement.

## Qualification evidence

| Gate | Evidence | Result |
| --- | --- | --- |
| Fresh transactional application | Two independently rebuilt PostgreSQL 16.15 clones | PASS |
| Repeatability/catalog drift | Both clones produced 155 target catalog records with MD5 `3b5f4e5e0b12844f6af7ef088e18a9e3` | PASS |
| Crevux schema verifier | `pnpm run db:verify:mobile8-schema` | PASS |
| Scanner/import PostgreSQL suite | `service.pg.test.ts`: 25/25 | PASS |
| Verixet accounting PostgreSQL suite | `service.pg16.test.ts`: 13/13 | PASS |
| Crevux-to-Verixet fake-provider lifecycle | `studioMediaCrossService.pg16.integration.test.ts`: 8/8 | PASS |
| Combined retained integration gate | The accepted evidence enumerates 13 + 8 = 21 cases, despite the request's shorthand “20” | PASS (21/21) |
| RLS/ownership negative checks | `service_role` read succeeds; `authenticated` and `anon` are permission-denied | PASS |
| Existing single-image compatibility | Create worker, Create service, and generation executor: 35/35 | PASS |
| Paid/external provider execution | Not invoked | HELD AS REQUIRED |

The timestamp trigger was corrected during qualification. It updates `updated_at` on ordinary changes, but preserves an explicitly supplied timestamp so bounded stale-operation reconciliation can test and record recovery age. The corrected migration passed all 25 scanner/import cases from a fresh clone.

## Lock and operational risk

- The migration takes normal PostgreSQL DDL locks while creating the three tables, their constraints, triggers, policies, and grants.
- Creating each composite index takes a `SHARE` lock on one existing small table and can briefly wait behind or block concurrent writes. The 5-second lock timeout makes lock contention fail closed instead of waiting indefinitely.
- Foreign-key validation touches the new empty tables and referenced indexes; no historical Mobile8 rows require validation or backfill.
- Expected runtime impact is low and bounded, but the change should still be scheduled during a quiet write window with active connection/lock monitoring.
- A failure inside the migration transaction leaves no partial schema.

## Backup and restoration gate

Production project health is `ACTIVE_HEALTHY`, but this inspection did not expose independently verifiable backup/PITR status or perform a restoration drill. Therefore:

- **Backup existence and restoration readiness: BLOCKED pending operator verification.**
- Before migration approval, record the latest successful platform backup/PITR timestamp and confirm the documented restore procedure is available to the operator.
- Do not create a paid branch, restore production, or change backup settings as part of this packet.

## Rollback strategy

1. Before execution: no rollback is needed; nothing has changed.
2. During execution: rely on the single transaction and lock/statement timeouts; any error rolls back all migration statements.
3. Immediately after execution, while Studio flags remain disabled and the three tables are verified empty: an explicitly approved rollback migration may drop the three tables, then the trigger function, then the two composite indexes.
4. After any Mobile8 data exists: do **not** use destructive rollback. Disable all Studio/import feature flags, preserve the ledger as evidence, and ship a reviewed forward repair.
5. Existing single-image service and Android v22 remain the operational fallback because this migration neither changes nor enables their routes.

No rollback SQL is executed or registered by this packet.

## Required post-migration checks

1. Confirm the new ledger version and migration checksum in the authoritative ledger.
2. Confirm exactly three target tables and both composite indexes exist under owner `postgres`.
3. Re-run the catalog contract verifier for columns, defaults, constraints, indexes, triggers, FORCE RLS, policies, grants, and schema ownership.
4. Confirm PUBLIC/anon/authenticated have no privileges on the three tables and that `service_role` has only CRUD.
5. Confirm `service_role` can access an empty table while authenticated/anon access is denied.
6. Confirm all three tables are empty and no Studio/import flag has changed.
7. Run health and existing single-image smoke checks without submitting a provider job.
8. Keep Studio, billing, and provider-dispatch flags disabled pending separate deployment and acceptance approval.

## Approval boundaries and smallest next action

This packet is not deployment authorization. The smallest safe next action is for the production operator to verify and record backup/PITR restoration readiness, then review the migration checksum and FORCE RLS decision. Only after a separate explicit approval should the exact migration be applied to production. Railway deployment, Android changes, Studio activation, billing changes, and provider execution remain out of scope and held.
