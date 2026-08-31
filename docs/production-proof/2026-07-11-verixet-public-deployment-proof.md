# Production Proof Record

## Metadata

- App: Verixet
- Environment: production
- Public URL: https://verixet.com
- Test date/time: 2026-07-11T11:14:42Z
- Expected commit: e224c2da0a693497692f711f4188b8c0cc1072b3
- Observed commit: e224c2da0a693497692f711f4188b8c0cc1072b3
- Test account type: Not used; public unauthenticated health/readiness only.
- Reviewer: Codex

## Workflow

- Workflow tested: Public health metadata and documented public readiness endpoint.
- Commands or steps: `Invoke-WebRequest https://verixet.com/api/v1/health`; `Invoke-WebRequest https://verixet.com/api/v1/ready`.
- Expected result: Health returns HTTP 200 and exact approved commit. Readiness returns HTTP 200 only when readiness checks pass.
- Actual result: Health returned HTTP 200 with exact approved commit. Readiness returned HTTP 200 with database reachable.
- Final status: PROVEN

## Evidence

- Screenshots/video paths: Not captured in this phase.
- Logs or request IDs: health `c0215b3f-58a4-44ea-a32c-ff71b0e82707`; readiness `b7fff3ee-b5de-4186-8ed8-511f7d07e9af`.
- Health/readiness response:

```json
{
  "health": {
    "statusCode": 200,
    "body": {
      "success": true,
      "request_id": "c0215b3f-58a4-44ea-a32c-ff71b0e82707",
      "data": {
        "status": "ok",
        "app": "verixet",
        "environment": "production",
        "version": "3.4.1",
        "commit": "e224c2da0a693497692f711f4188b8c0cc1072b3",
        "buildTime": "unknown"
      }
    }
  },
  "readiness": {
    "statusCode": 200,
    "body": {
      "success": true,
      "request_id": "b7fff3ee-b5de-4186-8ed8-511f7d07e9af",
      "data": {
        "status": "ready",
        "checks": {
          "database": "reachable"
        },
        "generated_at": "2026-07-11T11:14:42.786Z"
      }
    }
  }
}
```

- Deployment provider evidence: Railway target `Project: Verixet`, `Environment: production`, `Service: verixet`. Public health reports approved commit.

## Mutation And Cleanup

- Mutations performed: Deployment was completed by Railway/GitHub after approved pushed commit; no manual production data mutation.
- Provider-cost calls performed: None.
- Billing/subscription/entitlement mutations performed: None.
- Cleanup required: None.
- Rollback performed: None.

## Approval

- Approval source: User approval in Codex thread for Verixet commit `e224c2da0a693497692f711f4188b8c0cc1072b3`.
- Approval scope: Deploy Verixet only; no migrations, secrets, Stripe/billing mutations, provider-cost calls, authenticated tests, production data mutations, unrelated config changes.
- Residual risk: Build timestamp is `unknown`; authenticated and billing runtime proof not run.
