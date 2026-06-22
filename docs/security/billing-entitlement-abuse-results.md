# Billing And Entitlement Abuse Results

Date: 2026-05-10

## Summary

Executed forged billing/entitlement mutation probes with fake `planSlug`, `priceId`, `appSlug`, role, and workspace IDs. Also ran existing proof suites for checkout creation, webhook replay, entitlement resolver matrix, production entitlement proof, and satellite fallback shutdown.

## Live Probe Results

| Class | Result |
| --- | --- |
| Fake `planSlug`/`priceId` submitted to billing/checkout-style routes | Denied, not found, validation denied, or redirected. |
| Entitlement evaluate-style routes without valid service proof bearer | Denied or not found. |
| Workspace app access mutation without auth/service authority | Denied or not found. |
| Stripe webhook-style POST without signature | Denied, deprecated, or not found. |
| Satellite local billing grant attempts | No premium entitlement grant observed. |

## Existing Proof Results

| Proof | Result |
| --- | --- |
| Stripe catalog proof | Passed. |
| Checkout creation proof | Passed. |
| Webhook replay proof | Passed. |
| Entitlement resolver matrix | Passed. |
| Production entitlement proof | Passed. |
| Satellite fallback shutdown proof | Passed through `npm run proof:production`. |

## Findings

No live billing/entitlement abuse path produced premium access or a successful mutation.

## Remaining Risk

Expired, canceled, and past_due personas were not available as live authenticated fixtures. Their behavior remains covered by static/unit proof but needs a staging account matrix before final production signoff.
