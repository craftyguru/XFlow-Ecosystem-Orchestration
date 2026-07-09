# P4 Verixet/XFlow Subscription Wrapper Parity Plan

Date: 2026-07-09

## Scope

This P4 planning pass inspected Verixet and XFlow for safe, focused subscription-tier proof wrapper candidates so the root recurring verifier can eventually include all six apps as real proof participants.

No wrapper was added in this pass. No production app code, subscription logic, Stripe logic, checkout flow, entitlement behavior, schema, migration, CI config, package manifest, lockfile, dependency install, dependency rebuild, package upgrade, native rebuild, or app internal was changed.

## Current P3 State

- Root recurring verifier: `scripts/verify-subscription-tier-p3-gate.mjs`.
- Root recurring report: `docs/subscription-tier-p3-recurring-proof-gate-report.md`.
- Existing focused wrappers:
  - `apps/WordGeni/scripts/verify-subscription-tier-proof.mjs`
  - `apps/CreVux/scripts/verify-subscription-tier-proof.mjs`
  - `apps/AudAix/scripts/verify-subscription-tier-proof.mjs`
  - `apps/RatAiFy/scripts/verify-subscription-tier-proof.mjs`
- Verixet and XFlow remain status-only in the P3 verifier.
- Neither `apps/Verixet/scripts/verify-subscription-tier-proof.mjs` nor `apps/XFlow/scripts/verify-subscription-tier-proof.mjs` exists yet.

## Verixet Candidate Focused Commands

### Safe candidate: catalog, pricing, checkout, top-up, and display tests

Command:

```text
npm --prefix apps/Verixet run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx src/components/marketing/pricing/PricingCatalogClient.test.tsx src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts
```

Result: passed.

Evidence:

```text
Test Files  8 passed (8)
Tests       77 passed (77)
```

Why it is safe for a wrapper candidate:

- Uses existing local Vitest tests through the app's existing `test` script.
- Covers generated catalog proof, public pricing display, shared pricing UI, checkout route behavior, top-up route behavior, canonical billing catalog behavior, and ecosystem billing selection.
- Checkout/top-up route tests mock checkout creation and assert rejected/manual/reviewed rows do not create checkout sessions.
- Does not run installs, migrations, broad CI, Playwright, live provider proof, or Stripe catalog mutation commands.

### Safe candidate: typecheck

Command:

```text
npm --prefix apps/Verixet run typecheck
```

Result: passed.

Evidence:

```text
Generating route types...
Route types generated successfully
```

Why it is safe for a wrapper candidate:

- Uses existing app typecheck.
- Does not install dependencies or run migrations.
- Generated route type output did not dirty the Verixet repo.

### Optional/env-dependent command not included in the default wrapper candidate

Command not run:

```text
npm --prefix apps/Verixet run stripe:price-env:verify
```

Reason: the script appears local-only and validates `.env` / `.env.local` Stripe product and price IDs without network calls, but it is environment-dependent and Stripe-config specific. The P4 recurring wrapper should remain a safe focused local proof by default. This command can be documented as an optional release/env gate, not as a default root recurring participant, unless the root verifier gets explicit env-gate semantics.

## XFlow Candidate Focused Commands

### Safe candidate: pricing, selected-app handoff, auth redirect, and entitlement tests

Command:

```text
npm --prefix apps/XFlow run test -- tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/showcase-chrome.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts tests/unit/billing-entitlement-resolution.test.ts tests/unit/central-auth-start-route.test.ts tests/unit/ecosystem-auth-return-url.test.ts
```

Result: passed.

Evidence:

```text
Test Files  10 passed (10)
Tests       70 passed (70)
```

Why it is safe for a wrapper candidate:

- Uses existing local Vitest tests through the app's existing `test` script.
- Covers subscription landing/pricing display, generated/ecosystem pricing catalog behavior, signup pricing catalog behavior, static showcase pricing assertions, `selectedAppSlug` billing authority routing, Verixet signup handoff signing, Verixet billing setup handoff, entitlement consumption/resolution, central auth start provider routing, and ecosystem auth return URL validation.
- Does not run installs, migrations, broad CI, Playwright/browser proof, live provider proof, or provider mutation proof.

### Safe candidate: typecheck

Command:

```text
npm --prefix apps/XFlow run typecheck
```

Result: passed.

Evidence:

```text
tsc --noEmit
```

Why it is safe for a wrapper candidate:

- Uses existing app typecheck.
- Does not install dependencies or run migrations.
- Did not dirty the XFlow repo.

### Existing command not sufficient as the default wrapper proof

Command not run:

```text
npm --prefix apps/XFlow run verify:commercial-pack
```

Reason: `scripts/verify-commercial-pack.ts` is local-only and docs/package-content oriented, but it does not prove the subscription/auth-handoff surface requested for this P4 wrapper. It can stay outside the focused subscription-tier proof wrapper.

## Commands Intentionally Not Run

- `npm --prefix apps/Verixet run stripe:price-env:verify` because it is env-dependent and Stripe-config specific.
- `npm --prefix apps/Verixet run stripe:catalog:verify`, `stripe:catalog:sync`, `stripe:catalog:apply`, `billing:*:execute`, and other Stripe/catalog mutation or provider-facing commands.
- `npm --prefix apps/XFlow run proof:verixet`, `proof:read-only-provider`, browser proof commands, staged smoke commands, production proof commands, and provider-authority proof commands.
- `npm --prefix apps/Verixet run verify:routes`, `npm --prefix apps/XFlow run verify:routes`, `npm --prefix apps/XFlow run verify:ci`, broad app-health suites, all-app suites, and Playwright/e2e suites.
- Any install, dependency rebuild, package-manager purge, lockfile rewrite, package upgrade, native rebuild, schema generation/migration, database seed, or runtime mutation command.

## Wrapper Readiness

Verixet is ready for a focused wrapper in the next implementation pass.

Recommended wrapper contents:

```text
node ./node_modules/vitest/vitest.mjs run --configLoader runner src/lib/catalog-export/verixet-generated-catalog.test.ts src/lib/marketing/public-pricing-catalog.test.ts src/components/shared/pricing/shared-pricing.test.tsx src/components/marketing/pricing/PricingCatalogClient.test.tsx src/app/api/billing/checkout/route.test.ts src/app/api/billing/top-up/route.test.ts src/lib/billing/canonical-catalog.test.ts src/lib/billing/ecosystem-billing.test.ts
npm run typecheck
```

XFlow is ready for a focused wrapper in the next implementation pass.

Recommended wrapper contents:

```text
npm run test -- tests/unit/showcase-pricing-page.test.ts tests/unit/ecosystem-pricing-catalog.test.ts tests/unit/signup-pricing-catalog.test.ts tests/showcase-chrome.test.ts tests/unit/authority-routing.test.ts tests/unit/verixet-handoff.test.ts tests/unit/verixet-billing-handoff.test.ts tests/unit/billing-entitlement-resolution.test.ts tests/unit/central-auth-start-route.test.ts tests/unit/ecosystem-auth-return-url.test.ts
npm run typecheck
```

## Blockers

- No technical blocker was found for adding safe focused wrappers next.
- The only current wrapper-parity gap is absence of the two app-level wrapper files and the root verifier not yet listing them in `focusedProofs`.
- Keep Stripe env verification out of the default recurring wrapper unless a later prompt explicitly adds optional env-aware behavior.

## Final Root Status

Pre-existing unrelated root dirt before this report:

```text
 M package.json
?? docs/ratify-post-rollout-observation.md
?? docs/ratify-production-deployment-plan.md
?? docs/ratify-production-rollout-readiness.md
?? docs/ratify-staging-proof-recovery.md
?? docs/ratify-staging-proof-rollout.md
?? docs/workflow-copilot-audit.md
?? docs/workspace-external-proof-approval-packet.md
?? docs/workspace-external-proof-approval-register.json
?? docs/workspace-five-app-api-redaction-evidence.json
?? docs/workspace-five-app-api-redaction-proof-register.json
?? docs/workspace-five-app-api-redaction-proof.md
?? docs/workspace-five-app-auth-read-fixtures-evidence.json
?? docs/workspace-five-app-auth-read-fixtures-proof-register.json
?? docs/workspace-five-app-auth-read-fixtures-proof.md
?? docs/workspace-local-proof-closeout-register.json
?? docs/workspace-local-proof-closeout.md
?? docs/workspace-provider-billing-proof-plan-register.json
?? docs/workspace-provider-billing-proof-plan.md
?? docs/xflow-user-dashboard-api-redaction-proof-register.json
?? docs/xflow-user-dashboard-api-redaction-proof.md
?? docs/xflow-user-dashboard-auth-fixture-browser-proof-register.json
?? docs/xflow-user-dashboard-auth-fixture-browser-proof.md
?? docs/xflow-user-dashboard-local-browser-proof-register.json
?? docs/xflow-user-dashboard-local-browser-proof.md
?? docs/xflow-user-dashboard-local-proof-register.json
?? docs/xflow-user-dashboard-local-proof.md
?? docs/xflow-user-dashboard-mutation-boundary-proof-register.json
?? docs/xflow-user-dashboard-mutation-boundary-proof.md
?? scripts/verify-workspace-external-proof-approval.mjs
?? scripts/verify-workspace-five-app-api-redaction.mjs
?? scripts/verify-workspace-five-app-auth-read-fixtures.mjs
?? scripts/verify-workspace-local-proof-closeout.mjs
?? scripts/verify-workspace-provider-billing-proof-plan.mjs
```

Root change from this pass:

```text
?? docs/subscription-tier-p4-verixet-xflow-wrapper-parity-plan.md
```

## Final Six-App Status

| App | Status |
| --- | --- |
| WordGeni | clean |
| CreVux | clean |
| AudAix | clean |
| RatAiFy | clean |
| Verixet | clean |
| XFlow | clean |

## No-Mutation Confirmation

Confirmed: this pass did not modify production app code, subscription logic, Stripe logic, checkout flows, entitlement behavior, schemas, migrations, runtime behavior, CI, package manifests, lockfiles, app internals, or dependency state. No installs, dependency rebuilds, package-manager purges, lockfile rewrites, package upgrades, native rebuilds, migrations, broad CI, all-app suites, provider/live checks, Stripe mutations, checkout mutations, or entitlement mutations were run.
