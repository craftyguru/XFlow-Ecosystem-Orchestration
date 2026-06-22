# XFlow Route Manifest Remediation

## Scope

- App: `apps\XFlow`
- Base context: XFlow Phase 1 commit `fe8c51948ed3173081e0e5959916acab43fa1722`
- Goal: fix `npm run verify:integrity` failure at `verify:app-router` and verifier-proven source-of-truth drift surfaced by the synchronized route set.
- Exclusions: no dependency upgrades, migrations, deploys, pushes, secret rotation, production data deletion, or cross-app changes.

## Original verifier failure

Pre-edit `npm run verify:integrity` failed at `verify:app-router`:

- `verify:routes` passed: 398 expected App Router files present.
- Missing page manifest entries:
  - `src/app/(dashboard)/apps/automation/page.tsx`
  - `src/app/(dashboard)/crevux/agents/page.tsx`
  - `src/app/(dashboard)/crevux/hub/page.tsx`
  - `src/app/(dashboard)/crevux/page.tsx`
  - `src/app/(dashboard)/crevux/tools/page.tsx`
  - `src/app/(dashboard)/developer/agent-builder/page.tsx`
  - `src/app/(dashboard)/developer/billing-limits/page.tsx`
  - `src/app/(dashboard)/developer/webhooks/page.tsx`
  - `src/app/(dashboard)/tools/chronicle/manual/page.tsx`
  - `src/app/(dashboard)/tools/groups/admin-ops/page.tsx`
  - `src/app/(dashboard)/tools/groups/ai-automation/page.tsx`
  - `src/app/(dashboard)/tools/groups/all/page.tsx`
  - `src/app/(dashboard)/tools/groups/app-connections/page.tsx`
  - `src/app/(dashboard)/tools/groups/billing-account/page.tsx`
  - `src/app/(dashboard)/tools/groups/developer-api/page.tsx`
  - `src/app/(dashboard)/tools/groups/help-guides/page.tsx`
  - `src/app/(dashboard)/tools/groups/start-here/page.tsx`
  - `src/app/(dashboard)/wordgeni/agents/page.tsx`
  - `src/app/(dashboard)/wordgeni/hub/page.tsx`
  - `src/app/(dashboard)/wordgeni/page.tsx`
  - `src/app/(dashboard)/wordgeni/tools/page.tsx`
- Stale page manifest entries removed for deleted `src/app/community/**` route files.
- Missing route manifest entries:
  - `src/app/api/apps/[appSlug]/health/automation/route.ts`
  - `src/app/api/apps/[appSlug]/health/run-check/route.ts`
  - `src/app/api/chronicle/sources/route.ts`
  - `src/app/api/webhooks/verixet/route.ts`
  - `src/app/api/xflow/automation/run-due-checks/route.ts`
  - `src/app/api/xflow/automation/summary/route.ts`

## Files changed

- `API_CONTRACTS.md`
- `docs/JSON_RESPONSE_INVENTORY.md`
- `scripts/verify-json-routes.ts`
- `src/app/api/apps/[appSlug]/domain-verification/cloudflare-auto/route.ts`
- `src/app/api/apps/[appSlug]/domain-verification/recheck/route.ts`
- `src/app/api/apps/[appSlug]/health/automation/route.ts`
- `src/app/api/apps/[appSlug]/health/run-check/route.ts`
- `src/app/api/apps/[appSlug]/ownership/route.ts`
- `src/app/api/apps/[appSlug]/telemetry/setup/check/route.ts`
- `src/app/api/apps/[appSlug]/telemetry/verify/route.ts`
- `src/app/api/integrations/cloudflare/revoke/route.ts`
- `src/app/api/integrations/cloudflare/token/route.ts`
- `src/components/legal/PublicLegalFooter.tsx`
- `src/components/showcase/ShowcaseTrustStrip.tsx`
- `src/contracts/platform/error-codes.ts`
- `src/lib/audit/api-audit-correlation-matrix.ts`
- `src/lib/audit/audit-actor-provenance-matrix.ts`
- `src/lib/audit/audit-event-schema.ts`
- `src/lib/audit/mutation-audit-matrix.ts`
- `src/lib/auth/api-route-auth-matrix.ts`
- `src/lib/auth/middleware-routing.ts`
- `src/lib/auth/page-route-auth-matrix.ts`
- `src/lib/integrity/route-manifest.ts`
- `src/lib/marketing/trust-scan-html-signals.test.ts`
- `src/lib/permissions/permission-matrix.ts`

## Manifest entries added

- Added the 21 missing dashboard page entries listed in the original verifier failure.
- Added route entries for:
  - `src/app/api/apps/[appSlug]/health/automation/route.ts`
  - `src/app/api/apps/[appSlug]/health/run-check/route.ts`
  - `src/app/api/chronicle/sources/route.ts`
  - `src/app/api/webhooks/verixet/route.ts`
  - `src/app/api/xflow/automation/run-due-checks/route.ts`
  - `src/app/api/xflow/automation/summary/route.ts`

## Stale entries removed

- Removed deleted `src/app/community/**` page manifest entries from the route manifest and page auth matrix.
- Removed stale dashboard ownership action entries for deleted `src/app/(dashboard)/apps/[slug]/config/ownership-actions.ts` action mappings.
- Removed stale audit schema registrations for deleted ownership dashboard actions:
  - `ownership_verification_created`
  - `ownership_verification_manually_completed`

## Routes intentionally excluded

- None in the App Router manifest.
- `src/app/api/internal/ownership-verifications/status/route.ts` and `src/app/api/webhooks/verixet/route.ts` remain intentionally listed in the JSON response allowlist because they preserve compact integration/bearer/webhook response contracts.

## Follow-on verifier drift resolved

- Added auth, permission, RBAC, audit mutation, audit schema, audit correlation, and actor provenance metadata for newly tracked routes.
- Added route-correlated audit logging for newly tracked mutating routes without logging tokens, provider secrets, request bodies, or raw env values.
- Registered existing API error codes `chronicle_delete_disabled` and `method_not_allowed`, and synchronized the complete API error code docs table.
- Replaced hardcoded public `mailto:` href construction with `publicMailto(...)` helper usage to satisfy the email discipline verifier.

## Commands run and results

- `git status --short`: initial XFlow repo was clean before edits.
- `npm run verify:integrity`: failed initially at `verify:app-router` with the route-manifest drift listed above.
- `npm run verify:app-router`: passed after manifest sync, `162 page entries, 242 route handlers match manifest`.
- `npm run verify:page-auth-matrix`: passed after page auth matrix sync.
- `npm run verify:api-auth-matrix`: passed after API auth and middleware route metadata sync.
- `npm run verify:rbac-matrix`: passed after permission matrix sync.
- `npm run verify:integrity`: passed end to end after all verifier source-of-truth drift was corrected.
- `npm run verify:security`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 542 test files and 2646 tests; 1 file and 2 tests skipped.
- `npm run build`: first attempt timed out at 180 seconds; second attempt with longer timeout passed. Build emitted existing warnings in `src/components/chronicle/ChronicleSourcesClient.tsx` for a `useMemo` dependency and `<img>` usage.

## Integrity status

XFlow integrity is clean locally. `npm run verify:integrity` passes.
