# Shared Supabase Production Communications

Use this lightweight template for internal rollout coordination. Do not include secrets, database URLs, tokens, webhook secrets, OAuth secrets, or passwords.

## Pre-Rollout Notice

Subject: Shared Supabase production dual-write preparation for `<app>`

Purpose:

- Enable production dual-write/compare mode for `<app>` into the shared Supabase project.
- Keep legacy DB as source of truth.
- Keep `READ_MODE=dual_compare`.
- Keep `FAIL_CLOSED=false`.

Expected user impact:

- No expected user-visible change.
- Reads remain on legacy runtime paths.
- Rollback is flag-off and service restart/redeploy if needed.

Owner:

- Rollout owner:
- Engineering reviewer:
- Product/business owner:
- Emergency contact:

Rollback plan:

- Turn runtime flag off.
- Turn dual-write flag off.
- Set read mode to legacy.
- Keep fail-closed false.
- Verify legacy flow and shared write stop.

Current status:

- Preflight:
- Monitoring:
- Backup/export:
- Owner approval:

## During Rollout Update

Subject: Shared Supabase dual-write in progress for `<app>`

Status:

- Runtime flag:
- Dual-write flag:
- Read mode:
- Fail-closed:
- Smoke result:
- Shared row verification:
- Legacy verification:
- Monitoring summary:

## Rollback Notice

Subject: Shared Supabase dual-write rollback for `<app>`

Reason:

- Trigger:
- Impact:
- Rollback action:
- Legacy verification:
- Shared write stop verification:
- Follow-up owner:

## Post-Rollout Summary

Subject: Shared Supabase dual-write summary for `<app>`

Summary:

- Start time:
- End time:
- Result:
- Shared rows verified:
- Legacy rows verified:
- Compare mismatches:
- Latency/errors:
- Storage/provider/webhook notes:
- Rollback rehearsal status:
- Next phase recommendation:

Production cutover remains unsafe until a later approved phase.

Old Supabase projects remain unsafe to pause until pause criteria are met.
