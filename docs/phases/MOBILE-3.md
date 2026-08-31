# MOBILE-3 — Project, upload, and job API hardening

- Status: PLANNED
- Owning repository: Crevux
- Parent/base: approved Crevux baseline containing required MOBILE-1 integration
- Dependencies: MOBILE-1 PASS; MOBILE-2 import contract stable

## Objective and product contract

Implement `/api/mobile/v1` project, resumable upload, asset, mask, entitlement-preflight, and durable queued-job foundations using canonical UUID/user/workspace ownership.

## In scope / out of scope

In scope: ordinary-user authorization, upload checksums/expiry/scan/decode/EXIF policy, idempotency fingerprint, queue handoff, immutable original, lineage foundation, signed media, and a forward legacy-job migration plan. Out of scope: Android editor UI, provider feature expansion, unrelated schema cleanup, and production migration execution without separate approval.

## Acceptance and automated verification

- HTTP submission returns after durable acceptance and does not perform provider work inline.
- Same idempotency key/fingerprint replays; conflicting fingerprint returns 409.
- Cross-user/workspace, malformed media, decompression-bomb, expired upload, interrupted upload, and signed-URL tests pass.
- Crevux lint/typecheck/unit/integration/build and explicit migration/schema checks pass.

## Manual proof

Test-environment upload resumes after network/app interruption and remains private to the selected workspace.

## Risks, rollback, dependencies

Dual authority between legacy and UUID jobs is the primary risk. Feature-flag v1 routes/worker consumption and retain the prior web contract for rollback; do not silently dual-write.
