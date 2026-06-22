# Reviewer Engineering Packet

## A. Executive Summary

Robert Schuelke built a six-product SaaS ecosystem rather than a single isolated application. XFlow is the central control, account, settings, routing, and app visibility hub. Verixet is the billing, entitlement, usage, lifecycle, plan-change, invoice, and customer portal authority. The satellite products handle trust, audits, writing, media, and app-specific workflows without becoming billing authorities.

The proof harness validates that the architecture is more than public copy. It checks contract files, public route coverage, XFlow to Verixet status behavior, billing DTO sanitization, usage catalog behavior, usage ingestion hardening, satellite usage writer safety, and release proof artifacts.

## B. Six Apps At A Glance

| App | Purpose | Ecosystem Role | Relevant Technical Surface |
| --- | --- | --- | --- |
| XFlow | Central account, settings, app routing, and operations hub | Owns identity, settings, app overview, and control-plane surfaces | `/settings`, `/ecosystem`, `/for-reviewers`, Verixet status client, fallback mirror display |
| Verixet | Billing, plans, entitlements, usage, lifecycle, and portal authority | Owns commercial authority and usage decisions | ecosystem status API, billing status DTO, plan-change preview/execution, portal session route, usage ingest |
| Rataify | Trust, reputation, proof, and verification workflows | Satellite app with app-owned usage reporting and proof surfaces | reputation scan reporting, proof metric split, workspace UUID resolver, public badge route guardrails |
| AudAiX | Site audits, accessibility checks, UX review, and reports | Satellite app for audit/report workflows | canonical usage reporter, metadata sanitization, server-side reporting |
| WordGeni | AI writing, source-grounded drafts, publishing, and exports | Satellite app for writing workflows | AI generation usage reporting, prompt/raw payload sanitization, fail-soft Verixet reporter |
| Crevux | AI media, image/video generation, storyboards, and exports | Satellite app for media workflows | UCL workspace mapping, UUID-gated image/video usage reporting, fail-soft usage admission |

## C. Architecture Evidence

- Centralized auth/account model: XFlow owns the account hub and central settings experience.
- Service-to-service status contract: XFlow reads Verixet ecosystem status through a stable authenticated DTO instead of raw Stripe objects.
- Entitlement composition: Verixet composes Free baseline, individual app upgrades, bundles, intervals, and tier precedence.
- Usage catalog: active metrics define owner, attribution, visibility, aggregation, units, allowed source apps, and display grouping.
- Satellite boundary cleanup: satellites route global billing/account authority back to XFlow and Verixet.
- Proof harness: `scripts/phase17-ecosystem-proof.mjs` validates static architecture evidence and optional protected HTTP smoke.

## D. Billing And Entitlement Evidence

- Every workspace has Free baseline access to all six apps.
- Individual app upgrades and bundle upgrades compose.
- Higher tier wins per app.
- Plan-change preview blocks redundant, lower-tier, no-improvement, unknown, and wrong app/bundle selections before checkout.
- Plan-change execution only mutates Stripe when a single safe persisted subscription item exists.
- Ambiguous consolidation is routed to portal/manual resolution rather than silent duplicate subscriptions.
- Frontend-safe billing DTOs do not expose raw Stripe customer, subscription, or subscription item IDs.

## E. Usage And Metering Evidence

- Verixet usage summary reads real `usageEvents` and `creditBalances`.
- Usage metric catalog separates app-owned, shared ecosystem, billing credit, workspace seat, storage, internal, and unknown metrics.
- App-owned metrics render under the owning app.
- Shared metrics render under ecosystem usage and are not randomly assigned to satellites.
- Internal-only and unknown metrics are hidden or warned safely.
- Satellite reporters use deterministic idempotency keys and sanitized metadata.
- Crevux reports only after verified UCL ecosystem workspace mapping exists.
- Rataify proof/import/refresh/visibility metrics were split so `rataify.audit_proof_badge` is reserved for true badge refresh/check semantics.

## F. Security And Safety Evidence

- Browser code does not receive service tokens.
- Frontend-safe DTOs do not expose raw Stripe/customer/subscription/payment identifiers.
- Local numeric IDs are not accepted as ecosystem workspace IDs.
- Static proof is non-mutating and does not need HTTP credentials.
- Protected HTTP proof is manual-only and staging/review scoped.
- Release checklist hard blockers prevent promotion with token leakage, raw Stripe leakage, fake usage data, broken contracts, public localhost production links, or satellite billing authority regression.

## G. Proof Evidence

Command:

```bash
npm run proof:ecosystem:static
```

Reports:

- `output/phase17-ecosystem-proof-report.json`
- `output/phase17-ecosystem-proof-report.md`

Latest known static result:

- 68 pass
- 0 warnings
- 0 failures

Protected HTTP smoke is available as a manual staging workflow and still awaits GitHub staging environment variable and secret configuration.

## H. What Reviewers Can Inspect Quickly

- XFlow public reviewer page: `/for-reviewers`
- XFlow ecosystem page: `/ecosystem`
- Release checklist: `docs/release-proof-checklist.md`
- Proof runbook: `docs/ecosystem-proof-runbook.md`
- Latest static proof report: `output/phase17-ecosystem-proof-report.md`
- Contract registry: `ecosystem-contracts/routes.json`
- Ecosystem status DTO: `ecosystem-contracts/types/ecosystem-status.ts`
- Usage metric catalog: `ecosystem-contracts/types/usage-metrics.ts`

## I. Honest Remaining Gaps

- Protected staging HTTP smoke still needs GitHub environment variables/secrets and its first manual staging run.
- Production promotion should wait for a reviewed staging HTTP proof artifact.
- Known unrelated lint noise should be tracked separately if unchanged:
  - Verixet vendor `no-empty-object-type` lint errors.
  - Existing unused `RatAiFyWordmarkText` warnings.
  - Existing XFlow Turnstile hook dependency warning.
