# Phase 2F Execution Checklist

Date: 2026-07-11

Use this checklist only after `docs/production-proof/PHASE2F_TEST_ACCOUNT_FIXTURE_PACKET.md` is approved and the approved test identities and fixtures exist.

## Before Testing

- [ ] Confirm the target environment is production and public health/readiness still expose the expected deployed commit for each app.
- [ ] Load credentials securely from an approved secret store or ignored local env file.
- [ ] Confirm `.env.phase2f.local` or equivalent secret file is not tracked by Git.
- [ ] Confirm `ecosystem_test_standard` exists and can authenticate.
- [ ] Confirm `ecosystem_test_denied` exists and has no paid/test entitlement.
- [ ] Confirm `ecosystem_test_outsider` exists and has no proof-workspace membership.
- [ ] Confirm `ecosystem_test_entitled` exists only if non-billable entitlement proof was approved.
- [ ] Confirm `ecosystem_test_admin` exists only if admin proof was approved.
- [ ] Confirm the proof workspace/account is clearly labeled as test/demo.
- [ ] Confirm the proof workspace has no real customer data, integrations, provider keys, or live webhooks.
- [ ] Confirm each app fixture exists and is test-owned.
- [ ] Confirm provider calls are disabled, mocked, or avoided by stored fixtures.
- [ ] Confirm billing mutations are disabled and no checkout will be completed.
- [ ] Confirm any entitlement evaluation is non-mutating or that bounded audit/usage writes are explicitly approved.
- [ ] Confirm screenshot capture is approved.
- [ ] Confirm cleanup procedure and owner are ready.

## During Testing

- [ ] Use only the approved test users.
- [ ] Use only approved fixture routes and object slugs.
- [ ] Do not browse or search real customer data.
- [ ] Do not guess object IDs.
- [ ] Stop immediately on unexpected mutation, provider call, checkout creation, or cross-workspace access.
- [ ] Stop immediately if the deployed commit does not match the expected commit.
- [ ] Do not complete purchases.
- [ ] Do not run live scans, audits, AI generation, media generation, ingestion, embeddings, or external provider workflows.
- [ ] Record route, timestamp, account type, expected result, observed result, and safe request ID.
- [ ] Capture screenshots only of approved test-owned data.
- [ ] Redact emails where unnecessary, user IDs, workspace IDs, tokens, cookies, session values, private content, and headers.

## App-Specific Checks

### XFlow

- [ ] Login as `ecosystem_test_standard`.
- [ ] Verify proof workspace membership is visible.
- [ ] Verify app catalog loads.
- [ ] Verify app connection/readiness surfaces load.
- [ ] Verify Verixet handoff destination.
- [ ] Verify outsider denial.
- [ ] Verify standard user is denied from admin-only surface.
- [ ] Logout and verify session invalidation.

### Verixet

- [ ] Login as approved test user.
- [ ] Verify canonical catalog.
- [ ] Verify billing/account page without purchase.
- [ ] Verify entitlement denied path.
- [ ] Verify entitlement allowed path only if non-billable test grant is approved.
- [ ] Verify account isolation.
- [ ] Inspect checkout destination without completing purchase.
- [ ] Logout and verify session invalidation.

### RatAiFy

- [ ] Login as approved test user.
- [ ] Verify approved test-owned site.
- [ ] Open existing stored scan/report fixture.
- [ ] Verify report/artifact authorization.
- [ ] Verify outsider denial.
- [ ] Verify denied paid scan gate without running scan.
- [ ] Verify billing handoff routes to Verixet.
- [ ] Logout.

### AudAiX

- [ ] Login as approved test user.
- [ ] Open stored audit fixture.
- [ ] Open report/evidence fixture.
- [ ] Verify workspace isolation.
- [ ] Verify unauthorized result denial.
- [ ] Verify denied paid audit gate without running audit.
- [ ] Verify billing handoff routes to Verixet.
- [ ] Logout.

### Crevux

- [ ] Login as approved test user.
- [ ] Open approved project.
- [ ] Verify existing asset visibility.
- [ ] Verify outsider asset denial.
- [ ] Verify generation entitlement check blocks denied user before provider invocation.
- [ ] Verify export/download authorization using existing asset.
- [ ] Verify billing handoff routes to Verixet.
- [ ] Logout.

### WordGeni

- [ ] Login as approved test user.
- [ ] Open approved document/source fixture.
- [ ] Verify provenance/source-backed draft display.
- [ ] Verify cross-workspace document/source denial.
- [ ] Verify export authorization using existing fixture.
- [ ] Verify worker/readiness state through approved health evidence.
- [ ] Verify denied paid writing gate blocks before provider invocation.
- [ ] Verify billing handoff routes to Verixet.
- [ ] Logout.

## After Testing

- [ ] Logout all test users.
- [ ] Revoke temporary sessions if supported.
- [ ] Verify no Stripe charges or subscriptions were created.
- [ ] Verify no Stripe products, prices, customers, subscriptions, or webhooks were changed.
- [ ] Verify no provider-cost calls were made.
- [ ] Verify no uncontrolled scans, audits, generations, exports, or ingestion jobs were started.
- [ ] Remove temporary data only if cleanup was approved.
- [ ] Preserve proof records and screenshots.
- [ ] Update `docs/ECOSYSTEM_READINESS_STATUS.md` only for evidence-backed promotions.
- [ ] Record defects with severity, route, expected result, observed result, evidence, and recommended next action.

## Stop Conditions

- [ ] Missing approved credential or fixture.
- [ ] Wrong deployed commit.
- [ ] Unexpected billing mutation.
- [ ] Unexpected provider-cost action.
- [ ] Unexpected production data mutation.
- [ ] Access to non-test customer data.
- [ ] Authorization bypass or cross-workspace access.
- [ ] Secret, cookie, token, session, or private ID exposure in evidence.

