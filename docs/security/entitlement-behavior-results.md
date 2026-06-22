# Entitlement Behavior Results

Date: 2026-05-10

## Summary

Entitlement behavior was verified through the existing Verixet/root proof suite and through unauthenticated forged-claim live probes. Authenticated expired/canceled persona behavior is blocked pending staging-safe fixture sessions.

The fixture helper defines expired/past_due and canceled user personas and can seed Verixet-sourced deny entitlement/billing rows in local/staging. It did not seed Verixet subscription state in this run because all configured proof URLs are production-like.

## Results

| Test class | Result |
| --- | --- |
| Fake plan/price/app claims in unauthenticated probes | Denied in live direct-access simulation. |
| Verixet checkout creation tests | Passed through `npm run proof:production`. |
| Verixet webhook replay/idempotency tests | Passed through `npm run proof:production`. |
| Entitlement resolver matrix | Passed through `npm run proof:production`. |
| Production entitlement proof | Passed through `npm run proof:production`. |
| Expired/past_due user paid-feature denial | Blocked: no staging-safe expired session fixture supplied. |
| Canceled user paid-feature denial | Blocked: no staging-safe canceled session fixture supplied. |
| Satellite local entitlement grant abuse with authenticated user | Blocked: no staging-safe session fixture supplied. |

## Findings

No entitlement bypass was observed in available proof. The live authenticated subscription-state cases remain unproved because no disposable expired/canceled accounts were available.

## Remaining Recommended Work

Run `scripts/setup-staging-security-personas.mjs --allow-local-fixtures --seed-personas --mint-sessions` against local proof URLs to create Verixet-owned active, past_due, and canceled fixture states, then run the harness with the generated fixture file.

Use XFlow-issued sessions for identity and Verixet-owned fixture state for subscription/entitlement results. Do not grant entitlement state from satellite-local fixture code.
