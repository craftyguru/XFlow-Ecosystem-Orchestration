# Phase 2F Fixture Cleanup Runbook

Date: 2026-07-12

## Scope

This runbook covers cleanup planning for Phase 2F production proof fixtures only. It does not approve deletion of production data.

## Dry Run

```text
npm run phase2f:fixtures:cleanup
node scripts/phase2f/cleanup-production-proof-fixtures.mjs --dry-run
```

The dry run reports cleanup categories and safety rules without deleting data.

Local validation cleanup is exercised through:

```text
npm run phase2f:fixtures:validate
```

The latest unit validation deleted 29 locally created fixture rows and confirmed unrelated row counts were unchanged.

Real database validation cleanup is exercised through:

```text
npm run phase2f:fixtures:validate-db
```

The latest database validation deleted 33 marked rows from the disposable migrated PostgreSQL database, confirmed 0 marked rows remained, and confirmed unrelated row counts were unchanged.

## Cleanup Approval Boundary

Destructive cleanup requires separate approval after fixture creation and proof capture. Do not run a non-dry cleanup unless all of these are true:

- the record has the Phase 2F marker;
- the record is linked to the known proof workspace;
- the local state file id matches the live record;
- no dependent non-test data exists;
- the app owner approves cleanup timing.

## Cleanup Order

1. Logout test users and revoke temporary sessions where supported.
2. Revoke optional Verixet non-billable test entitlement.
3. Remove app stored fixtures: WordGeni, Crevux, AudAiX, RatAiFy.
4. Remove Verixet billing-account test representation if it has no Stripe customer id.
5. Remove XFlow app catalog/handoff metadata rows.
6. Remove proof workspace memberships.
7. Remove the proof workspace.
8. Remove test identities only after all app-local references are gone.
9. Preserve public proof records and screenshots.

## Refusal Conditions

Cleanup must stop when:

- the record lacks the expected marker;
- the state file is missing or does not match;
- a Stripe id, provider job id, or real customer reference is present;
- ownership cannot be proven;
- the deletion would remove non-test data.

## Cost and Provider Controls

Cleanup must not call Stripe, AI providers, scan/audit providers, media providers, object-generation providers, embeddings, ingestion workers, or webhook replay paths.

## Phase 2F.5 Cleanup Status

Phase 2F.5 created no production fixtures, so no production cleanup was required. The cleanup command was run only in plan-only dry-run mode and reported the expected safety rules.
