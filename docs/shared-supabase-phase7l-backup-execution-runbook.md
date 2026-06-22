# Shared Supabase Phase 7L Backup Execution Runbook

This runbook is for completing the remaining backup/export and restore evidence before any production dual-write rollout.

Do not run exports automatically from Codex. Do not print secrets. Do not delete or pause old Supabase projects. Do not change production env vars. Do not mark evidence rows `pass` until export/restore proof exists.

## Safety Rules

- Run commands only from a secure operator shell where database URLs are already available as environment variables.
- Never paste database URLs, passwords, service-role keys, backup encryption keys, or provider secrets into docs.
- Store backup artifacts in a timestamped local folder under `output/supabase-backups/<timestamp>/`.
- Do not use customer data in filenames.
- Prefer `pg_dump --format=custom --no-owner --no-acl` for database exports.
- Keep storage bucket exports or manifests beside the matching DB dump.
- Restore drills must use a separate non-production database/project.

## Preflight

Run the planning helper from repo root:

```powershell
node scripts/plan-supabase-backup-exports.mjs
```

Use the output to confirm:

- app name
- env source file
- host class
- host
- database name
- username
- storage bucket
- suggested artifact directory

The helper does not print secrets. If an app target is production-marked or unknown, export only from an approved operator environment.

## Artifact Layout

Use this shape:

```text
output/supabase-backups/<YYYYMMDD-HHMMSS>/
  verixet/
    verixet.dump
    verixet-schema.sql
    verixet-storage-manifest.json
    evidence-notes.md
  xflow/
  audaix/
  rataify/
  wordgeni/
  crevux/
  shared/
    shared-supabase.dump
    shared-supabase-schema.sql
    restore-drill-notes.md
```

Do not commit this output folder unless a separate archival policy explicitly requires a redacted manifest.

## Per-App Export Targets

| App | Old DB env source to confirm | Storage bucket | Evidence row |
| --- | --- | --- | --- |
| Verixet | `apps/Verixet/.env`, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `verixet-billing-artifacts` | Verixet old Supabase backup/export |
| XFlow | `apps/XFlow/.env` or deployment variable store, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `xflow-artifacts` | XFlow old Supabase backup/export |
| AudAiX | `apps/AudAix/.env`, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `audaix-reports` | AudAiX old Supabase backup/export |
| Rataify | `apps/RatAiFy/.env`, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `rataify-evidence` | Rataify old Supabase backup/export |
| WordGeni | `apps/WordGeni/.env` or deployment variable store, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `wordgeni-exports` | WordGeni old Supabase backup/export |
| Crevux | `apps/CreVux/.env` or deployment variable store, `DATABASE_URL` or `DIRECT_DATABASE_URL` | `crevux-assets` | Crevux old Supabase backup/export |

## Project Ref Verification

Before exporting, verify the target project without revealing credentials:

1. Confirm the Supabase project ref in the dashboard.
2. Confirm the DB host/project ref matches the intended old app project.
3. Confirm the storage bucket belongs to that same old app project.
4. Confirm the environment is the old project, not the new shared project.
5. Record only project label/ref, host class, database name, and operator initials in evidence notes.

Optional read-only SQL for project sanity:

```sql
select current_database() as database_name, current_user as database_user;
select now() as checked_at;
```

Do not paste connection strings into the SQL console or evidence log.

## pg_dump Templates

Run these from the secure operator shell after setting the correct DB env var locally.

Custom dump:

```powershell
pg_dump --format=custom --no-owner --no-acl --file "output/supabase-backups/<timestamp>/<app>/<app>.dump" "$env:DATABASE_URL"
```

Schema-only dump:

```powershell
pg_dump --schema-only --no-owner --no-acl --file "output/supabase-backups/<timestamp>/<app>/<app>-schema.sql" "$env:DATABASE_URL"
```

Optional plain data dump:

```powershell
pg_dump --data-only --inserts --no-owner --no-acl --file "output/supabase-backups/<timestamp>/<app>/<app>-data.sql" "$env:DATABASE_URL"
```

If using `DIRECT_DATABASE_URL`, substitute `$env:DIRECT_DATABASE_URL`.

For Bash:

```bash
pg_dump --format=custom --no-owner --no-acl --file "output/supabase-backups/<timestamp>/<app>/<app>.dump" "$DATABASE_URL"
```

## Supabase Dashboard Export Alternative

If command-line export is not approved:

1. Open the old app Supabase project dashboard.
2. Use database backup/export tooling from the dashboard.
3. Export or inventory required storage buckets.
4. Download artifacts to the timestamped local evidence folder.
5. Record the dashboard export method, timestamp, artifact reference, owner initials, and restore-tested status in `docs/shared-supabase-phase7b-evidence-log.md`.

## Storage Bucket Export Checklist

For each app bucket:

- Capture bucket name.
- Capture object count.
- Export objects or produce an object manifest.
- Include object path, size, checksum if available, and last modified time.
- Store the manifest beside the DB dump.
- Do not include signed URLs, service keys, or private object tokens in the manifest.

Buckets:

- XFlow: `xflow-artifacts`
- Verixet: `verixet-billing-artifacts`
- AudAiX: `audaix-reports`
- Rataify: `rataify-evidence`
- WordGeni: `wordgeni-exports`
- Crevux: `crevux-assets`

## Shared Supabase Backup And Restore Drill

The shared project needs both backup and restore verification.

Export from secure operator shell:

```powershell
pg_dump --format=custom --no-owner --no-acl --file "output/supabase-backups/<timestamp>/shared/shared-supabase.dump" "$env:DIRECT_DATABASE_URL"
pg_dump --schema-only --no-owner --no-acl --file "output/supabase-backups/<timestamp>/shared/shared-supabase-schema.sql" "$env:DIRECT_DATABASE_URL"
```

Restore drill target requirements:

- Separate non-production Postgres database or Supabase project.
- No production app points at it.
- No live Stripe/provider callbacks point at it.
- Restore operator has permission to drop/recreate only the drill target.

Restore drill command shape:

```powershell
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$env:RESTORE_DRILL_DATABASE_URL" "output/supabase-backups/<timestamp>/shared/shared-supabase.dump"
```

After restore, verify:

```sql
select count(*) from core.ecosystem_apps;
select count(*) from core.workspaces;
select count(*) from core.workspace_members;
select count(*) from core.workspace_app_access;
select count(*) from core.audit_logs;
select count(*) from core.usage_events;
select count(*) from xflow.control_plane_events;
select count(*) from verixet.usage_admission_logs;
select count(*) from audaix.audits;
select count(*) from rataify.sites;
select count(*) from wordgeni.documents;
select count(*) from crevux.projects;
```

Then run validation against the restored drill target if your environment is wired for it:

```powershell
node scripts/validate-supabase-phase1.mjs
node scripts/validate-supabase-phase2.mjs
```

Record restore target label, timestamp, validation commands, and row-count comparison result. Do not record credentials.

## Evidence Fields To Fill

Update `docs/shared-supabase-phase7b-evidence-log.md`.

For each old Supabase backup/export row:

- `Old project/source`: old project label/ref and sanitized source.
- `Export method`: `pg_dump custom`, dashboard export, or approved equivalent.
- `Timestamp`: exact export time in UTC.
- `File/location reference without secrets`: local artifact folder or secure backup reference.
- `Restore-tested`: `yes` only if restored and verified; otherwise keep `no`.
- `Owner initials`: operator initials.
- `Result`: `pass` only after export artifact exists and evidence fields are complete.

For shared Supabase backup verification:

- `Backup method`: custom dump/schema-only dump and artifact reference.
- `Restore drill target`: non-production target label.
- `Timestamp`: exact restore drill time in UTC.
- `Validation query`: row-count and validator summary.
- `Result`: `pass` only after restore drill and validation pass.

## Do Not Mark Pass Until

- Artifact exists.
- Timestamp is real.
- Artifact reference is recorded without secrets.
- Owner initials are recorded.
- Restore-tested value is accurate.
- Shared restore drill actually ran for the shared backup row.

## Current Verdict

Production dual-write remains NO-GO until backup/export, shared restore verification, full Stripe test-mode proof, and the remaining Crevux rollback decision are complete.

Old Supabase projects remain NO-GO to pause.
