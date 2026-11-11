# Crevux Mobile8 production migration approval packet

Status: **PRODUCTION MIGRATION APPLIED AND VERIFIED; RESTORE DRILL NOT PERFORMED; STUDIO/DEPLOYMENT REMAIN HELD**

Prepared: 2026-11-10 (America/Chicago)

Canonical repository baseline: `craftyguru/XFlow-Ecosystem-Orchestration` `main` at `5b7cc028dcec07c495c42cd1aa58841d7c4b8334`

Production project: `mjfzoikkoykszxzuebdf` (`Xflow-Ecosystem`, PostgreSQL 17.6)

Latest production migration before this proposal: `20261102045558`

## Reviewed migration

- File: `supabase/migrations/20261111020115_crevux_mobile8_import_ledger.sql`
- SHA-256: `b19167d7eeabc1980ead7f18023d0793ef5354878cf75c7258c5f2990db2d5df`
- Size: 12,825 bytes; 305 lines
- Transactional qualification: passed with `lock_timeout = '5s'` and `statement_timeout = '60s'`
- Production execution: applied once and verified at 2026-11-11T03:44Z

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

The two June hardening files (`20260611063431` and `20260611081601`) and `20261030055853` were already present locally and match entries in the inspected ledger. A full filename-ordered rebuild is nevertheless historically non-authoritative: migration `064` depends on a helper whose retained source is ordered later, while that hardening sequence itself depends on a later numbered object. The provenance/order defect should be repaired separately, but it does not block this forward migration because its dependencies and target absence were independently checked against the production catalog and reproduced in a dependency-complete clone. No production ledger row was invented or rewritten.

The complete timestamped inventory now matches production exactly: 27 version/name pairs through `20261102045558`, with MD5 `6532cc1b55f027b0c962766763344aba` on both the production ledger and local filename inventory.

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
| PostgreSQL 17 production compatibility | Production 17.6 catalog reports every required UUID dependency, role, and target-absence precondition; the migration uses syntax supported by 16.15 and 17 | PASS (catalog/static) |
| Exact recovered ledger inventory | 27/27 timestamped version/name pairs; matching MD5 `6532cc1b55f027b0c962766763344aba` | PASS |
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

The trigger is `SECURITY INVOKER`, not `SECURITY DEFINER`. PUBLIC, `anon`, and `authenticated` cannot execute it and have no UPDATE privilege or RLS policy on the tables. Only `service_role` has function execution and table CRUD. Therefore an untrusted client cannot supply or override reconciliation timestamps; an explicit timestamp is available only to the trusted server role or the database owner. This boundary was verified from the cloned function ACL and table grants.

## Lock and operational risk

- The migration takes normal PostgreSQL DDL locks while creating the three tables, their constraints, triggers, policies, and grants.
- Creating each composite index takes a `SHARE` lock on one existing small table and can briefly wait behind or block concurrent writes. The 5-second lock timeout makes lock contention fail closed instead of waiting indefinitely.
- Foreign-key validation touches the new empty tables and referenced indexes; no historical Mobile8 rows require validation or backfill.
- Expected runtime impact is low and bounded, but the change should still be scheduled during a quiet write window with active connection/lock monitoring.
- A failure inside the migration transaction leaves no partial schema.

## Backup and restoration gate

Production project health is `ACTIVE_HEALTHY`. The authenticated Supabase Dashboard showed seven completed daily physical backups:

- 2026-11-10 05:09:22 UTC (latest; `COMPLETED`)
- 2026-11-09 05:08:36 UTC
- 2026-11-08 05:08:38 UTC
- 2026-11-07 05:09:50 UTC
- 2026-11-06 05:08:34 UTC
- 2026-11-05 05:08:37 UTC
- 2026-11-04 05:08:40 UTC

PITR is **not enabled**; the Dashboard offers it only as a paid add-on. The latest available recovery point is therefore the latest completed daily backup, not an arbitrary pre-migration timestamp. The Dashboard also exposes `Restore to new project` for each completed backup. Supabase documents this as a database-only, independent project clone that incurs additional project cost and does not copy Storage objects/settings, Edge Functions, Auth settings/API keys, Realtime settings, or all project configuration.

The non-final restore review for the latest backup quoted **$10.18 additional monthly cost**: $9.68 compute plus $0.50 disk. It would remain in `craftyguru's Org`, region `us-east-1`, use the same compute size, and allocate a disk 1.5 times larger for restore headroom. The dialog was cancelled; no project was created and no restore began.

Backup availability and platform restore support are **PASS**. An actual restore drill is **NOT PERFORMED**. Authorization for the proposed paid clone was withdrawn before a project name or database password was submitted. The restore form was cancelled, the browser tab was closed, and a subsequent project inventory confirmed that no new Supabase project exists. Backup existence alone is not represented as successful restoration.

Read-only production checks found no `pg_cron`, `pg_net`, `wrappers`, or `http` extensions, no subscriptions, and no non-Realtime replication slots. That reduces—but does not eliminate—the risk of a restored project performing outbound work.

No hosted clone, Supabase branch, additional database, or other paid resource is permitted for this change. The accepted isolation evidence is the existing loopback-only PostgreSQL 16 environment and the completed focused qualification already recorded above. Its cleanup is deferred until Crevux release qualification is complete and separately authorized.

## Exact production migration sequence

All steps remain held until one explicit production-migration approval names the exact migration and checksum.

1. Confirm production project `mjfzoikkoykszxzuebdf` is `ACTIVE_HEALTHY`, the latest successful daily physical backup is still visible, and no incident or unrelated migration is active.
2. Re-hash `supabase/migrations/20261111020115_crevux_mobile8_import_ledger.sql` and require SHA-256 `b19167d7eeabc1980ead7f18023d0793ef5354878cf75c7258c5f2990db2d5df`.
3. Run `supabase migration list --linked` from the canonical XFlow checkout and require exact alignment through production version `20261102045558`.
4. Run `supabase db push --linked --dry-run` and require that the only pending migration is `20261111020115_crevux_mobile8_import_ledger.sql`. Do not use `--include-all`, roles, or seed data.
5. Repeat the metadata-only prerequisite query: PostgreSQL 17, all seven required UUID columns present, the three target tables absent, the two target indexes absent, and `service_role` present with `USAGE` on schema `crevux`.
6. Keep every Crevux Studio, provider-dispatch, billing, and Android release flag unchanged and disabled. Select a quiet write window and monitor database locks.
7. After explicit approval, run `supabase db push --linked` once from the reviewed checkout. Abort on checksum, ledger, preflight, lock-timeout, or statement-timeout mismatch; do not retry blindly.
8. Perform the post-migration checks below before any application deployment or feature activation.
9. Record the applied ledger version, catalog fingerprint, operator, timestamps, and outcome. This database change does not authorize Railway deployment or feature enablement.

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

## Production application record

The owner approved the bounded production migration while explicitly accepting that the restore drill was not performed and PITR was not enabled. The migration was applied once through the linked Supabase CLI. It was not retried.

Preflight evidence immediately before DDL:

- Project ref/name/status: `mjfzoikkoykszxzuebdf`, `Xflow-Ecosystem`, `ACTIVE_HEALTHY`; PostgreSQL `17.6`.
- Latest visible completed physical backup: `2026-11-10 05:09:22 UTC`; seven daily backups remained visible.
- Source SHA-256: `b19167d7eeabc1980ead7f18023d0793ef5354878cf75c7258c5f2990db2d5df`.
- Linked migration ledger matched the canonical checkout through `20261102045558`.
- `supabase db push --linked --dry-run` listed only `20261111020115_crevux_mobile8_import_ledger.sql`.
- All seven UUID prerequisites, `service_role`, schema usage, and `gen_random_uuid()` were present.
- All three target tables and both target composite indexes were absent; duplicate-scope checks were zero; there were no conflicting DDL/lock sessions.
- Railway production had no staged/applying work. All Studio project/library/quote/submit, Studio accounting, and Studio provider flags were absent and therefore fail-closed. Diagnostic dispatch and paid reservation were `false`; reusable execution was `false`.

Application result:

- `supabase db push --linked` returned `Applying migration 20261111020115_crevux_mobile8_import_ledger.sql...` followed by `Finished supabase db push.` with exit code `0`.
- The authoritative ledger now contains one entry for version `20261111020115`, name `crevux_mobile8_import_ledger`.
- A post-application linked dry-run returned `Remote database is up to date`.

Post-migration verification:

- All three tables exist under owner `postgres`; all three have RLS enabled and FORCE RLS enabled.
- Both composite ownership indexes and all seven table-specific indexes are valid and ready.
- All primary, unique, check, and ten foreign-key constraints are validated; no target constraint or index is invalid.
- All three timestamp triggers are enabled. `crevux.mobile8_set_updated_at()` remains `SECURITY INVOKER`, has `search_path=pg_catalog`, and is executable only by `service_role`.
- Exactly three `ALL` policies exist, each restricted to `service_role` with `USING (true)` and `WITH CHECK (true)`.
- PUBLIC, `anon`, and `authenticated` have no table CRUD privileges. Direct read-only probes as `anon` and `authenticated` returned permission denied. A read-only probe as `service_role` succeeded and confirmed all three new tables were empty.
- Supabase health advisors returned no health lint. No security-advisor finding referenced a new Mobile8 table or trigger function.
- Production `/health` returned HTTP 200. `/ready` remained intentionally HTTP 503/degraded because bounded qualification, provider configuration, pricing authority, and public upload security remain held; its database and schema-authority checks both returned `ok`.
- Existing single-image compatibility remains PASS using the retained 35/35 qualification evidence plus the post-change liveness/database/schema smoke. No generation, upload, billing, or provider request was submitted.
- The Railway deployment and Android v22 were unchanged.

## Remaining approval boundaries

The database migration is complete. Railway deployment, Android changes, Studio activation, billing changes, provider execution, hosted test resources, and local test-environment cleanup remain out of scope and held pending separate approval.
