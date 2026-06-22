# Stripe Webhook Audit

Date: 2026-05-10

## Summary

Stripe and billing security review focused on Verixet authority, webhook signature verification, idempotency, canonical plan validation, fail-closed satellite behavior, and avoiding client-submitted entitlement trust.

## Files And Routes Reviewed

- Verixet Stripe/billing tests and canonical billing authority paths
- Root proof checks for Stripe catalog, checkout creation, webhook replay, entitlement resolver, and production entitlement proof
- AudAiX `src/stripe-billing-webhook.ts`, billing delegation tests, and workspace billing tests
- WordGeni API Stripe webhook processor and billing/entitlement tests
- CreVux `artifacts/api-server/src/routes/billing.ts` and webhook/idempotency verification scripts
- RatAiFy Verixet Stripe metadata and billing fail-closed tests

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | CreVux exposed a public subscription catalog route that could depend on local Stripe secret-backed price retrieval. | Fixed by static Verixet-authority public catalog in production/nonlocal mode. |
| Medium | Local Stripe fallback modes exist in some satellites for development/test. Production proofs and tests indicate they fail closed or delegate when configured for Verixet. | Accepted with continued CI enforcement. |
| Low | Full live webhook verification was not run against a real Stripe endpoint in this pass. | Remaining staging verification gap. |
| Informational | Verixet test suite passed, root webhook replay proof passed, AudAiX Stripe webhook tests passed, WordGeni Stripe webhook processor tests passed, and CreVux webhook config/idempotency scripts are wired into app tests. | Verified. |

## Fixes Applied

- `apps/CreVux/artifacts/api-server/src/routes/billing.ts` now returns Verixet-source display catalog without local Stripe price lookup unless local billing mode is explicitly allowed.

## Remaining Recommended Work

- Run Stripe CLI signed webhook replay against a staging Verixet deployment and verify idempotency ledger persistence.
- Add a root contract that fails if any satellite production checkout route grants entitlements without Verixet confirmation.
- Keep plan/price mappings canonical in Verixet and treat satellite plan slugs as display or delegation inputs only.

## Verification Commands Run

- Root: `npm run proof:production` - passed Stripe catalog, checkout creation, webhook replay, entitlement resolver, and production entitlement proof.
- Verixet: `npm run test` - passed billing/Stripe tests.
- AudAiX: `npm run test:ci` - passed Stripe billing webhook and billing delegation tests.
- WordGeni: `pnpm test` - passed Stripe webhook processor and billing-related tests.
- CreVux: `pnpm run test` - passed Stripe webhook config test suite.

