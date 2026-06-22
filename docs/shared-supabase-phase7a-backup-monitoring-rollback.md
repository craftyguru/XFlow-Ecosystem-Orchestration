# Shared Supabase Phase 7A Backup, Monitoring, And Rollback Rehearsal

Phase 7A is the first production-risk-reduction layer before any production dual-write rollout. It does not authorize deployment, production environment changes, shared reads, fail-closed behavior, legacy database removal, or old Supabase project pause.

Production dual-write rollout is not safe yet.

Production cutover remains unsafe.

Old Supabase projects remain unsafe to pause.

## Scope

Phase 7A establishes the evidence needed before production dual-write can be considered:

- Old Supabase backup/export readiness.
- Shared Supabase backup verification.
- Monitoring and alert readiness.
- Old DB write detection.
- Rollback rehearsal commands and evidence requirements.

Runtime guardrails remain:

```text
*_SHARED_SUPABASE_READ_MODE=dual_compare
*_SHARED_SUPABASE_FAIL_CLOSED=false
```

Do not use `READ_MODE=shared`.

Do not set `FAIL_CLOSED=true`.

## A. Backup And Export Plan

### Old Supabase Export Checklist Per App

Before pausing or decommissioning any old Supabase project, export or snapshot:

| App | Required export scope |
| --- | --- |
| Verixet | Billing accounts, subscriptions, Stripe mappings, checkout sessions, entitlement decisions, usage admission logs, credit ledger, billing events, audit logs, storage artifacts |
| XFlow | App connections, workspace app access/linking state, control-plane events, UCL/link events, deployment checks, workflow runs, audit logs, storage artifacts |
| AudAiX | Audits, audit reports, monitors, findings, scan jobs, report artifact references, usage/audit logs, storage objects in `audaix-reports` |
| Rataify | Sites, reviews, issues, risk events, evidence items, storage objects in `rataify-evidence`, local readiness repair notes |
| WordGeni | Documents, document sources, memory cards, writing sessions, provenance items, exports/source objects, worker/provenance logs |
| Crevux | Projects, assets, generation jobs, exports, provider runs, credit spend events, storage objects in `crevux-assets`, provider callback records |

### Shared Supabase Backup Verification Checklist

- Confirm shared Supabase automated backups are enabled for the production tier.
- Capture current backup schedule and retention policy.
- Run a restore-readiness drill into a non-production project.
- Verify `core.*` and each app schema restore with row counts.
- Verify storage bucket metadata and object restore process.
- Verify RLS policies and API grants survive restore.
- Document restore owner, restore target, restore timestamp, and validation result.

### Data That Must Be Exported Before Old Project Pause

- Auth users and profile/workspace identity mappings.
- Workspace membership and app access records.
- Billing and Stripe reference records.
- Usage, entitlement, credit, and billing audit records.
- App-owned product tables in each legacy DB.
- Storage objects and storage metadata.
- Provider jobs, callbacks, webhooks, and replay/idempotency records.
- Migration history and schema dumps.

### Restore Drill Steps

1. Export old project schema and data without printing secrets.
2. Restore into an isolated non-production database.
3. Restore storage objects or verify object export manifest.
4. Run row-count parity checks against the export manifest.
5. Run app-specific read-only smoke checks against the restored target.
6. Record restore duration, row counts, missing objects, and owner signoff.

## B. Monitoring And Alerts

Production dual-write requires monitoring before flags are enabled.

Required signals:

- Dual-write failure detection.
- Dual-compare mismatch logging.
- Shared write latency/error counters.
- Verixet usage admission errors.
- XFlow control-plane write errors.
- App-specific shared write failures.
- Storage write failures.
- Provider callback/idempotency errors.
- Auth/session exchange errors.
- Stripe webhook replay errors.

Recommended event fields:

- `app_slug`
- `workspace_id`
- `operation`
- `idempotency_key`
- `legacy_result`
- `shared_result`
- `compare_status`
- `latency_ms`
- `error_code`
- `environment`
- `source`

Alert thresholds for first production dual-write:

- Any fail-closed behavior observed: page immediately.
- Any sustained dual-write error above 0 for 5 minutes: page app owner.
- Any critical dual-compare mismatch: stop rollout and evaluate rollback.
- Any provider callback duplicate side effect: stop rollout.
- Any Stripe webhook replay duplicate authority effect: stop rollout.
- Any storage permission regression: stop rollout.

Use `node scripts/check-shared-supabase-dual-write-health.mjs` for a local non-destructive readiness summary. If `DUAL_WRITE_HEALTH_LOG_FILE` is set, it scans the log file for failure/mismatch/error markers and prints counts only.

## C. Old DB Write Detection

Old Supabase projects are unsafe to pause until old DB writes have stopped after a later shared-read cutover and observation window.

### How To Detect Continued Old DB Writes

- Enable DB query logging or app-level write logging on legacy write paths.
- Tag legacy write logs with app slug, operation, workspace id, and table name.
- Watch old DB table `updated_at` movement during the observation window.
- Compare legacy write counts to shared write counts during dual-write.
- Confirm no legacy-only writes occur after shared-read cutover in a later phase.

### Per-App Indicators

| App | Old DB write indicators |
| --- | --- |
| Verixet | Billing account writes, subscription updates, Stripe webhook writes, credit ledger movement, usage admission writes |
| XFlow | App connection writes, app link changes, control-plane events, deploy validation writes, workflow run writes |
| AudAiX | Audit creation/completion, report writes, monitor changes, finding writes, scan job updates |
| Rataify | Site/review/issue/risk/evidence writes and legacy readiness repair dependencies |
| WordGeni | Document/source/memory/session/provenance writes and worker-origin writes |
| Crevux | Project/asset/job/export/provider-run/credit-spend writes and provider callback writes |

Use `node scripts/check-old-db-write-detection.mjs` for a non-destructive checklist. If `OLD_DB_WRITE_LOG_FILE` is set, it scans a local log export for old DB write markers and prints aggregate counts only.

### Proof Required Before Old Supabase Pause

- Old DB backups/export complete.
- Shared-read cutover has happened in a later approved phase.
- Old DB write detection shows no legacy writes for the observation window.
- Rollback window has passed.
- Owners approve old project pause.

## D. Rollback Rehearsal

Rollback rehearsal must be completed per app before production dual-write.

For each app:

1. Turn runtime flags off.
2. Confirm legacy path still works.
3. Confirm shared write path stops.
4. Confirm no user-facing failure.
5. Document command and evidence.

### Verixet Rollback Rehearsal

```text
VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=false
VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
VERIXET_SHARED_SUPABASE_READ_MODE=legacy
VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Health/public smoke passes.
- Entitlement decision path uses legacy source.
- Usage admission path uses legacy source.
- Shared rows stop increasing in `core.usage_events`, `core.billing_events`, `core.audit_logs`, `verixet.entitlement_decisions`, and `verixet.usage_admission_logs`.

### XFlow Rollback Rehearsal

```text
XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=false
XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
XFLOW_SHARED_SUPABASE_READ_MODE=legacy
XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Public and authenticated smoke passes.
- App connection/control-plane paths use legacy source.
- Shared rows stop increasing in `core.app_connections`, `core.workspace_app_access`, `core.audit_logs`, and `xflow.*`.

### AudAiX Rollback Rehearsal

```text
AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=false
AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
AUDAIX_SHARED_SUPABASE_READ_MODE=legacy
AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Auth/MFA proof still passes.
- Audit/report path still works through legacy runtime.
- Shared rows stop increasing in `core.audit_logs`, `core.usage_events`, and `audaix.*`.

### Rataify Rollback Rehearsal

```text
RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=false
RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
RATAIFY_SHARED_SUPABASE_READ_MODE=legacy
RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Readiness and authenticated release proof still pass.
- Site/review/issue/risk/evidence paths still work through legacy runtime.
- Shared rows stop increasing in `core.audit_logs`, `core.usage_events`, and `rataify.*`.

### WordGeni Rollback Rehearsal

```text
WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=false
WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
WORDGENI_SHARED_SUPABASE_READ_MODE=legacy
WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Web/API/worker proof still passes.
- Document/source/memory/provenance paths still work through legacy runtime.
- Shared rows stop increasing in `core.audit_logs`, `core.usage_events`, and `wordgeni.*`.

### Crevux Rollback Rehearsal

```text
CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=false
CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=false
CREVUX_SHARED_SUPABASE_READ_MODE=legacy
CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false
```

Evidence required:

- Authenticated beta proof still passes.
- Project/asset/job/export/provider-run paths still work through legacy runtime.
- Shared rows stop increasing in `core.audit_logs`, `core.usage_events`, and `crevux.*`.

## Phase 7A Readiness Verdict

Backup readiness: not complete until exports and restore drill evidence are recorded.

Monitoring readiness: not complete until alerts are configured and observed.

Rollback readiness: not complete until every app has rehearsal evidence.

Production dual-write rollout is not safe yet.

Old Supabase projects are not safe to pause.
