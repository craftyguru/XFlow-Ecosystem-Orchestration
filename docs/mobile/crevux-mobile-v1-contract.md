# Crevux Mobile API v1 Contract

Status: approved design contract; no endpoint in this document is claimed implemented until its owning phase closes.

Machine-readable invariants live in `ecosystem-contracts/crevux-mobile-v1.json`. Framework-neutral consumer types live in `packages/ecosystem-contracts/src/crevux-mobile-v1.ts`.

## Transport and authorization

- Namespace: `/api/mobile/v1`.
- JSON uses UTF-8. Media bytes use private resumable upload or short-lived signed download URLs, not routine base64 request bodies.
- Every request receives a correlation ID. Every resource is authorized for the authenticated XFlow user and selected workspace.
- List endpoints use opaque cursor pagination. Clients must not infer ordering or IDs from cursors.
- Ordinary project creation must not require workspace-admin privileges.

Android obtains authorization through XFlow using the external system browser, Authorization Code with PKCE S256, a public client, and an exact verified HTTPS App Link. Required scopes are `profile.read`, `workspace.read`, `crevux.read`, `crevux.write`, `crevux.generate`, and `offline_access`.

The two allowed authorization profiles are:

| Profile | Deployment classification | Client | XFlow origin and issuer | Required client audience | Exact callback | App package | Digital Asset Links certificate profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Production | `production` | `crevux-android` | `https://xflowx.com` | `crevux-android` | `https://crevux.com/mobile/oauth/callback` | `com.crevux.mobile` | Production release certificate, published only by `crevux.com`. |
| MOBILE-1 test | `staging` | `crevux-android-test` | `https://mobile-test.xflowx.com` | `crevux-android-test` | `https://mobile-test.crevux.com/mobile/oauth/callback` | `com.crevux.mobile` | Dedicated MOBILE-1 test certificate, published only by `mobile-test.crevux.com`. |

Each profile requires its own public-client registration and exact callback; wildcard origins and callbacks are forbidden. Explicit build configuration selects the profile. A missing, unknown, or internally mismatched profile fails closed before authorization or token use, with no production fallback. Authorization codes, access tokens, refresh tokens, and token families are accepted only when both issuer and client audience match the selected profile; cross-environment acceptance is prohibited. The production and test Digital Asset Links certificate sets must differ, and neither host may publish the other environment's certificate association.

Every authorization attempt generates fresh cryptographically random state bound to the authorization request, PKCE verifier, exact redirect URI, and client instance. The callback requires an exact constant-time state match, one-time consumption, and validation before the short server-defined expiry. A missing, mismatched, expired, or replayed state rejects the callback, clears the local authorization transaction, and requires a new attempt.

Access tokens are short-lived. Refresh tokens rotate once; replay revokes the token family and requires reauthentication. Logout first stops new authenticated work, requests refresh-family revocation, invalidates the server session, deletes local access/refresh tokens, and clears auth-bound local state. If revocation is unavailable, the client clears local tokens, fails closed, marks remote revocation pending, and requires reauthentication.

Logout revokes the refresh-token family before local deletion. Account deletion is owned by XFlow and must propagate an auditable deletion request to Crevux and Verixet.

## Endpoint contract

Every endpoint requires an XFlow OAuth access token and membership in the selected workspace. Resource-bearing operations additionally require that the referenced project, upload, asset, mask, version, or job belongs to that workspace and is accessible to the authenticated user.

| Method | Path | Scope | Resource authorization and result |
| --- | --- | --- | --- |
| POST | `/projects` | `crevux.write` | Create in the selected workspace; ordinary members are allowed without workspace-admin role; `201`. |
| GET | `/projects` | `crevux.read` | Filter to projects accessible to the user in the selected workspace; `200`. |
| GET | `/projects/{projectId}` | `crevux.read` | Project belongs to the selected workspace and is user-accessible; `200`. |
| POST | `/uploads` | `crevux.write` | Target project belongs to the selected workspace and is user-accessible; `201`. |
| POST | `/uploads/{uploadId}/complete` | `crevux.write` | Upload belongs to the authenticated user and selected workspace; `200`. |
| POST | `/assets/{sourceAssetId}/masks` | `crevux.write` | Source asset is user-accessible in the selected workspace; `201`. |
| POST | `/jobs` | `crevux.generate` | Project and all referenced assets belong to the selected workspace and are user-accessible; `202`. |
| GET | `/jobs/{jobId}` | `crevux.read` | Job is user-accessible in the selected workspace; `200`. |
| POST | `/jobs/{jobId}/cancel` | `crevux.generate` | Job is user-accessible in the selected workspace; `202` or `JOB_NOT_CANCELLABLE`. |
| POST | `/jobs/{jobId}/retry` | `crevux.generate` | Job and source assets are user-accessible in the selected workspace; `202`. |
| GET | `/projects/{projectId}/versions` | `crevux.read` | Project and versions are user-accessible in the selected workspace; `200`. |
| GET | `/assets/{assetId}/export` | `crevux.read` | Asset is user-accessible in the selected workspace; `200`. |
| GET | `/me/entitlements` | `workspace.read` | Return only the selected workspace's Verixet-authoritative limits and usage; `200`. |
| GET | `/jobs/{jobId}/events` | `crevux.read` | Job is user-accessible in the selected workspace; optional resumable stream; `200`. |

## Representative generation request

```http
POST /api/mobile/v1/jobs
Authorization: Bearer <short-lived-access-token>
Idempotency-Key: <random-128-bit-value>
Content-Type: application/json
```

```json
{
  "projectId": "5a1fcad8-2b6a-49d5-a8b8-ad2dc13ce9c9",
  "operation": "masked_image_edit",
  "sourceAssetId": "b4fe7df5-157a-4e7b-aacb-e014968e5529",
  "maskAssetId": "1da9f179-759f-4b54-ac15-9c518e9f4c93",
  "prompt": "Preserve the person and composition; replace only the marked sky.",
  "variantCount": 4,
  "parentVersionId": "ae80b592-2268-4c0f-a685-a243e17bdde1",
  "output": { "aspect": "source", "quality": "high" }
}
```

```json
{
  "job": {
    "id": "d9e8cba8-a889-4391-9184-b6c44ee35fd3",
    "projectId": "5a1fcad8-2b6a-49d5-a8b8-ad2dc13ce9c9",
    "status": "queued",
    "requestFingerprint": "sha256:...",
    "estimatedUsage": { "unit": "credits", "amount": 4 }
  }
}
```

The `202` response means accepted for durable processing, not provider success.

## Idempotency and retries

- Scope is authenticated workspace plus `Idempotency-Key`.
- Fingerprint is SHA-256 over the canonical validated request, including project, operation, source, mask, prompt, options, and parent version.
- Same key and fingerprint returns the original resource without another charge.
- Same key and different fingerprint returns HTTP `409` with `IDEMPOTENCY_CONFLICT`.
- Infrastructure and provider-attempt retries remain attempts under the same logical job and idempotency identity; they do not create a new user charge authorization.
- A user-requested retry creates a new child job with a new job ID and new idempotency key, records the failed or cancelled parent job, and preserves its version/source lineage.
- Every user retry repeats the authoritative entitlement check and returns a fresh usage/cost estimate before explicit user submission. It may incur a new charge and must never silently reuse an earlier charge authorization.

## Cancellation

Queued work may be cancelled before provider execution. After provider execution starts, Crevux sends a cancellation request only when the adapter supports it; otherwise the API returns or records `JOB_NOT_CANCELLABLE`. A local `cancelling` or `cancelled` state never proves provider cancellation. Late provider results are quarantined instead of exposed as ordinary completed results. Usage and refund accounting follows authoritative provider-execution evidence.

## Error envelope

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Image generation is temporarily unavailable.",
    "retryable": true,
    "requestId": "52f69ad8-6c79-4f5a-bcc0-20ea3e7e4984",
    "details": {}
  }
}
```

Stable codes are `AUTH_REQUIRED`, `TOKEN_EXPIRED`, `INSUFFICIENT_SCOPE`, `WORKSPACE_FORBIDDEN`, `VALIDATION_FAILED`, `INVALID_MEDIA`, `MEDIA_TOO_LARGE`, `DIMENSIONS_TOO_LARGE`, `UPLOAD_EXPIRED`, `CHECKSUM_MISMATCH`, `IDEMPOTENCY_CONFLICT`, `ENTITLEMENT_REQUIRED`, `USAGE_LIMIT`, `PAYMENT_REQUIRED`, `BILLING_AUTHORITY_UNAVAILABLE`, `RATE_LIMITED`, `SAFETY_REFUSAL`, `PROVIDER_UNAVAILABLE`, `PROVIDER_FAILURE`, `JOB_NOT_CANCELLABLE`, `INFRASTRUCTURE_RETRYABLE`, and `INTERNAL_ERROR`.

`PAYMENT_REQUIRED` represents a payment/subscription state that prevents work. `BILLING_AUTHORITY_UNAVAILABLE` represents failure to obtain an authoritative Verixet decision and fails closed. Neither is interchangeable with entitlement denial or usage exhaustion.

Messages are safe for display but are not the programmatic discriminator. Details must not contain credentials, raw provider payloads, prompts, signed URLs, or private media.

## Media, retention, and export

- Mandatory limits are server-configured and returned by the entitlement/capability response: maximum compressed bytes, decoded pixels, width, height, and frame count. Upload fails closed before transfer when any mandatory limit is unavailable; the APK does not invent tier values.
- The server distrusts the declared MIME type and filename and validates magic bytes plus bounded decode. It rejects MIME/magic mismatch, malformed or polyglot input, unsupported animation/frame counts, decompression bombs, malformed masks, and cross-workspace completion.
- Upload sessions use SHA-256, resumable checkpoints, explicit expiry, and idempotent completion. An expired upload session is rejected with `UPLOAD_EXPIRED`; a checksum mismatch is rejected with `CHECKSUM_MISMATCH`. Checksum and security scanning must pass before asset finalization.
- Location/device EXIF is stripped by default. Temporary parts expire within the documented upload window and orphaned parts are cleaned up.
- Project assets remain private until an explicit export. Signed URLs expire in minutes and require authorization to renew.
- Gallery export metadata includes checksum and EXIF policy; Android verifies the download before committing through MediaStore.
- The exact retained-project duration requires privacy/legal approval. User deletion and XFlow account deletion remain mandatory regardless of duration.

## Account deletion lifecycle

XFlow owns the deletion decision. Deletion immediately revokes the token family and blocks new work. Crevux cancels queued jobs, requests provider cancellation for active jobs only when supported, and quarantines every late result instead of exposing it as normally completed. Private project assets are deleted after jobs reach terminal state or a bounded cleanup timeout. Completion is recorded as an auditable terminal deletion state using a minimal content-free tombstone. The tombstone retention duration is owner/legal policy-controlled and has no default in this contract.

## Model, cost, and entitlement boundaries

The contract names capabilities, not a permanent provider model. Verixet supplies authoritative feature and usage limits. Crevux supplies a server-calculated estimate based on variants, quality, references, and current adapter pricing. Safety refusal, entitlement denial, usage exhaustion, provider outage, and internal failure remain distinct and auditable.
