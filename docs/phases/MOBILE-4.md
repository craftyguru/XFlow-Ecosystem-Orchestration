# MOBILE-4 — Generation, variants, progress, and notifications

- Status: PLANNED
- Owning repository: Crevux
- Dependency: MOBILE-3 PASS

## Objective and product contract

Deliver durable prompt/reference generation, multiple variants, canonical polling, optional events, safe retries/cancellation, background status recovery, and privacy-safe completion notifications.

## In scope / out of scope

In scope: capability-based provider adapter, server estimates, Verixet gate, debit/refund accounting, WorkManager synchronization, result ingestion, and notification state. Out of scope: masks/history UI, embroidery, production rollout, and permanent model-name promises.

## Acceptance and automated verification

- App closure/network change does not lose the job.
- Success, partial result, refusal, entitlement denial, usage exhaustion, timeout, provider outage, cancellation, retry, and duplicate-charge tests pass.
- Crevux/mobile gates, WorkManager tests, API contract tests, and build pass.

## Manual proof

Submit test-environment work, close/restart the app, change network, and confirm one accounting outcome and correct completion notification.

## Risks, rollback, dependencies

Paid duplicate execution is the main risk. Disable mobile generation while preserving imported projects and completed assets. Private beta may begin only after closeout and owner approval.
