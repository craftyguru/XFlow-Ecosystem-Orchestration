# XFlow New DB Bootstrap And Runtime Migration

Generated: 2026-05-07

Latest update: six-app catalog and Verixet event-ingest proof bearer are now present in the new XFlow DB.

## Current State

Schema migration alone was not enough. The new XFlow database has tables, but the runtime data needed for live proof is incomplete:

- `apps`: old `5`, new `0`
- `app_connections`: old `9`, new `0`
- `credential_source = verixet_event_ingest`: old `4`, new `0`
- `users`: old `3`, new `0`
- `workspaces`: old `3`, new `1`
- `workspace_members`: old `4`, new `0`
- events, event ingest attempts, event dedupes, metric snapshots, OAuth workspace links, and Verixet workspace bindings exist in old DB and are absent in new DB
- XFlow local billing, entitlement, credit, and subscription tables are empty in both DBs, so no local billing ledger migration is indicated

The old DB app catalog is also incomplete for the six-app ecosystem. It has `verixet` and `rataify`, but it is missing `xflow`, `wordgeni`, `crevux`, and `audaix`. Do not blindly copy the old `apps` table as the final catalog.

## Scripts

Read-only plan:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/plan-xflow-new-db-bootstrap.ts
```

Runtime migration dry-run:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/migrate-xflow-runtime-data.ts
```

Runtime migration apply, only after approval:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/migrate-xflow-runtime-data.ts --apply
```

Six-app catalog dry-run:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts
```

Six-app catalog apply, only after real hosted workspace/user/member migration is approved:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts --apply
```

Verixet event-ingest proof bearer regeneration, only after the `verixet` app row exists:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_DATABASE_URL = "<new-xflow-db-url>"
$env:XFLOW_ENCRYPTION_KEY = "<deployed-xflow-encryption-key>"
$env:XFLOW_PROOF_APP_SLUG = "verixet"
npx tsx scripts/regenerate-proof-event-bearer.ts --confirm-print-secret
```

The raw bearer is printed exactly once. Store it as `XFLOW_PROOF_EVENT_BEARER` in the secure proof environment.

## Dry-Run Results

`plan-xflow-new-db-bootstrap.ts` reported:

- old six-app rows present: `verixet`, `rataify`
- old six-app rows missing: `xflow`, `wordgeni`, `crevux`, `audaix`
- new six-app rows missing: all six
- old Verixet event-ingest connections: `4`
- new Verixet event-ingest connections: `0`

`migrate-xflow-runtime-data.ts` dry-run reported:

- `roles`: propose `2`
- `users`: propose `3`
- `workspaces`: old `3`, propose `2`; reserved `system` is skipped
- `workspace_members`: old `4`, propose `3`; reserved `system` membership is skipped
- `app_connections`: propose `0` until matching new app rows exist
- sessions skipped
- encrypted tokens skipped

`seed-xflow-ecosystem-app-catalog.ts` dry-run initially refused to seed because the new DB had no usable hosted workspace yet. After the approved runtime migration below, the new DB has two usable hosted workspaces, so the next catalog seed must set `XFLOW_PROOF_WORKSPACE_ID` to the intended target workspace.

## Applied Runtime Migration

Approved command:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npx tsx scripts/migrate-xflow-runtime-data.ts --apply
```

Applied row counts:

| table | old rows | new rows before | applied | notes |
| --- | ---: | ---: | ---: | --- |
| `roles` | 2 | 0 | 2 | IDs preserved. |
| `users` | 3 | 0 | 3 | Compatible auth fields migrated; sessions skipped. |
| `workspaces` | 3 | 1 | 2 | Only real hosted workspaces applied; reserved `system` skipped. |
| `workspace_members` | 4 | 0 | 3 | Only non-system memberships applied. |
| `app_connections` | 9 | 0 | 0 | No matching new app rows yet; encrypted credential material skipped. |

Safety checks from apply output:

- `sessionsSkipped: true`
- `encryptedTokensSkipped: true`
- no paid entitlements created
- no Verixet billing state mutated
- no `token_encrypted`, access tokens, refresh tokens, webhook secrets, credential fingerprints, or encrypted bearer material migrated

Post-apply verification:

```powershell
npx tsx scripts/plan-xflow-new-db-bootstrap.ts
npx tsx scripts/diagnose-xflow-app-catalog-seed.ts
```

Verified new DB now has:

- `roles`: 2
- `users`: 3
- `workspaces`: 3 total, including 2 usable hosted workspaces and reserved `system`
- `workspace_members`: 3 non-system memberships
- `apps`: 0
- `app_connections`: 0
- `verixet_event_ingest` connections: 0

The next approval gate is the six-app catalog seed.

## Applied Six-App Catalog Seed

Approved target workspace:

```text
XFLOW_PROOF_WORKSPACE_ID=71207af2-b48f-47b7-9ab1-fd937796f771
```

Dry-run command:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_PROOF_WORKSPACE_ID = "71207af2-b48f-47b7-9ab1-fd937796f771"
npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts
```

Apply command:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_PROOF_WORKSPACE_ID = "71207af2-b48f-47b7-9ab1-fd937796f771"
npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts --apply
```

Applied rows:

| slug | status |
| --- | --- |
| `xflow` | active |
| `verixet` | active |
| `wordgeni` | active |
| `crevux` | active |
| `rataify` | active |
| `audaix` | active |

The seed created only missing app rows. It did not create entitlements, billing state, app connections, paid plans, or secrets.

## Verixet Event-Ingest Bearer

Confirmed target:

```text
XFLOW_PROOF_WORKSPACE_ID=71207af2-b48f-47b7-9ab1-fd937796f771
XFLOW_PROOF_APP_SLUG=verixet
```

Command run:

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
$env:XFLOW_PROOF_WORKSPACE_ID = "71207af2-b48f-47b7-9ab1-fd937796f771"
$env:XFLOW_PROOF_APP_SLUG = "verixet"
npx tsx scripts/regenerate-proof-event-bearer.ts --confirm-print-secret
```

Result:

- created/updated only the `verixet_event_ingest` app connection for the `verixet` app
- `auth_type`: `bearer`
- `credential_source`: `verixet_event_ingest`
- `connection_status`: `connected`
- encrypted bearer and safe fingerprint stored in `app_connections`
- raw bearer printed exactly once by the script and intentionally not repeated in this document
- no billing state or paid entitlement state created

Post-generation diagnostics:

```text
apps row count: 6
app_connections row count: 1
verixet_event_ingest rows: 1
verixet app row exists: yes
```

## What Is Safe To Seed

- Canonical six `apps` rows are safe to seed after a real hosted workspace exists:
  - `xflow`
  - `verixet`
  - `rataify`
  - `audaix`
  - `wordgeni`
  - `crevux`
- Free ecosystem baseline memberships/snapshots are safe to backfill after workspace/user/app catalog state is correct.

## What Should Be Migrated

- Real hosted `workspaces`, excluding reserved `system`
- `roles`, because `workspace_members.role_id` depends on them
- `users`, if preserving password hashes/MFA encrypted fields is approved and schema remains compatible
- `workspace_members`, excluding memberships for reserved `system`
- Non-secret `app_connections` metadata only after matching app rows exist in new DB

If preserving auth hashes/MFA encrypted fields is not approved, recreate users through signup and migrate/recreate memberships after user IDs are known.

## Regenerate Instead Of Copy

Do not blindly copy:

- `token_encrypted`
- `managed_token_fingerprint_sha256`
- `previous_token_encrypted`
- refresh/access tokens
- webhook secrets
- OAuth secrets
- raw metadata or payload JSON

If old and new XFlow encryption keys differ, copied encrypted credentials will not decrypt. Prefer regenerating Verixet event-ingest bearers and re-registering them with Verixet.

## Rollback Considerations

- The migration script uses `on conflict do nothing`, so re-running is idempotent for primary keys.
- Before any apply, take a new DB backup/snapshot.
- For catalog seed rollback, delete only the six app rows created in the reviewed apply window and only if no dependent rows were created afterward.
- For workspace/user/member migration rollback, prefer restoring the new DB snapshot instead of manually deleting auth/workspace rows.
- Do not roll back by copying old encrypted credential fields into new DB.

## Recommended Migration/Backfill Order

1. Run read-only plan:
   `npx tsx scripts/plan-xflow-new-db-bootstrap.ts`
2. Run migration dry-run:
   `npx tsx scripts/migrate-xflow-runtime-data.ts`
3. If approved, apply role/user/workspace/member migration:
   `npx tsx scripts/migrate-xflow-runtime-data.ts --apply`
4. Run six-app catalog dry-run:
   `npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts`
5. If approved, apply six-app catalog seed:
   `npx tsx scripts/seed-xflow-ecosystem-app-catalog.ts --apply`
6. Regenerate/re-register Verixet event-ingest bearer. Completed for proof bearer.
7. Add `XFLOW_PROOF_EVENT_BEARER` to `.env.proof.local` or the secure proof shell.
8. Run live-proof preflight:
   `node scripts/six-app-live-proof-preflight.mjs`
9. Run XFlow six-app live proof:
   `npm run proof:verixet`
10. Update `docs/six-app-baseline-production-proof.md`.

Safe runtime migration has been applied. Canonical app catalog seed has been applied. Verixet event-ingest proof bearer has been generated. No entitlement backfill or live-proof mutation has been applied yet.
