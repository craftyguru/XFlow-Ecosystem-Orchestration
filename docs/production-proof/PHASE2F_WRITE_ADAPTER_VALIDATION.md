# Phase 2F Write Adapter Validation

Date: 2026-07-12

## Summary

Phase 2F.4 implemented executable bounded write adapters for the six-app fixture system. This document records the local in-memory unit validation. Phase 2F.4B separately validated the adapter fixture shape against a real disposable PostgreSQL database built from the repository Supabase migrations; see `docs/production-proof/PHASE2F_DATABASE_ADAPTER_VALIDATION.md`.

No production users, workspaces, entitlements, app fixture rows, Stripe objects, provider jobs, deployments, or production migrations were created.

## Commands

```text
npm run test:phase2f-fixtures
npm run phase2f:fixtures:validate-unit -- --json
npm run phase2f:fixtures:validate-db
npm run phase2f:fixtures:dry-run -- --json
npm run phase2f:fixtures:verify -- --json
npm run phase2f:fixtures:cleanup -- --json
```

## Adapter Matrix

| Adapter | Implemented | Validation Scope | Production Status |
| --- | --- | --- | --- |
| Auth | Yes | Create/reuse/verify/cleanup synthetic identities | Requires approval and production auth credentials |
| XFlow | Yes | Workspace, standard/denied memberships, outsider denial, app catalog metadata | Requires approval and live target validation |
| Verixet | Yes | Non-Stripe billing account and denied entitlement verification | Requires approval; no Stripe mutation |
| RatAiFy | Yes | Stored site, completed scan, metadata-only report | Requires approval; no crawler/provider |
| AudAiX | Yes | Stored audit, report, evidence row | Requires approval; no audit/provider |
| Crevux | Yes | Project, placeholder asset, metadata-only export | Requires approval; no generation/export provider |
| WordGeni | Yes | Project, source, document, provenance | Requires approval; no writing/embedding/ingestion |

## Validation Environment

Environment for this document: local in-memory fixture store.

The unit adapters execute real create/reuse/verify/cleanup methods against the fixture store and enforce markers, deterministic IDs, cleanup order, collision refusal, and idempotency. The real database validation command now covers migrated PostgreSQL tables, constraints, FKs, RLS visibility, idempotency, and cleanup separately.

## Validation Evidence

| Step | Created | Reused | Verified | Deleted | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| First provision | 29 | 0 | 0 | 0 | PASS |
| First verify | 0 | 0 | 9 | 0 | PASS |
| Second provision | 0 | 29 | 0 | 0 | PASS |
| Second verify | 0 | 0 | 9 | 0 | PASS |
| Cleanup | 0 | 0 | 0 | 29 | PASS |

Unrelated rows unchanged: true.

## Safety Checks

- Non-test collision refusal is covered by focused tests.
- Cleanup deletes only rows with the Phase 2F marker.
- Reused rows are preserved unless state records creation by the current run.
- Denied entitlement verification confirms no active Verixet grant for the denied identity.
- XFlow outsider verification confirms no proof workspace membership.
- Verixet billing fixture has no Stripe customer id.
- Crevux export fixture charges zero credits.
- Stored fixture adapters do not enqueue provider jobs.

## Production Gate Requirements

Production execution remains approval-bound and requires:

```text
--environment production
--confirm-production-fixtures
--enable-reviewed-write-adapters
```

Required private values must come from `.env.phase2f.local` or an approved secret store and must not be printed.

## Remaining Risks

- Unit validation does not prove live production schema/RLS behavior.
- Database validation proves behavior against a disposable migrated PostgreSQL database, not production.
- Auth provider creation must be validated against the approved production auth service before real execution.
- Verixet optional non-billable entitlement grants may require an approved non-Stripe subscription/test entitlement representation.
- Authenticated production smoke tests and screenshot capture remain separately approval-bound.
