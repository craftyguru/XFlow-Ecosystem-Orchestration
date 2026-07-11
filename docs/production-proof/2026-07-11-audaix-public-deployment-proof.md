# Production Proof Record

## Metadata

- App: AudAiX
- Environment: production
- Public URL: https://audaix.com
- Test date/time: 2026-07-11T11:14:33Z
- Expected commit: 78bf08978db6427443814ff18ca19ee1f29804ea
- Observed commit: 78bf08978db6427443814ff18ca19ee1f29804ea
- Test account type: Not used; public unauthenticated health/readiness only.
- Reviewer: Codex

## Workflow

- Workflow tested: Public liveness metadata and readiness semantics.
- Commands or steps: `Invoke-WebRequest https://audaix.com/health`; `Invoke-WebRequest https://audaix.com/health/ready`.
- Expected result: Liveness returns HTTP 200 with exact approved commit. Readiness returns HTTP 200 only when SQLite/Redis readiness checks pass.
- Actual result: Liveness and readiness returned HTTP 200 with exact approved commit; readiness reported SQLite and Redis `ok`.
- Final status: PROVEN

## Evidence

- Screenshots/video paths: Not captured in this phase.
- Logs or request IDs: Not exposed by public response.
- Health/readiness response:

```json
{
  "health": {
    "statusCode": 200,
    "body": {
      "ok": true,
      "service": "audaix",
      "status": "ok",
      "app": "audaix",
      "environment": "production",
      "version": "3.4.1",
      "commit": "78bf08978db6427443814ff18ca19ee1f29804ea",
      "buildTime": "unknown"
    }
  },
  "readiness": {
    "statusCode": 200,
    "body": {
      "ok": true,
      "service": "audaix",
      "status": "ready",
      "sqlite": "ok",
      "redis": "ok",
      "app": "audaix",
      "environment": "production",
      "version": "3.4.1",
      "commit": "78bf08978db6427443814ff18ca19ee1f29804ea",
      "buildTime": "unknown"
    }
  }
}
```

- Deployment provider evidence: Railway target `Project: AudAiX`, `Environment: production`, `Service: AudAiX`. Public health/readiness report approved commit.

## Mutation And Cleanup

- Mutations performed: Deployment was completed by Railway/GitHub after approved pushed commit; no manual production data mutation.
- Provider-cost calls performed: None.
- Billing/subscription/entitlement mutations performed: None.
- Cleanup required: None.
- Rollback performed: None.

## Approval

- Approval source: User approval in Codex thread for AudAiX commit `78bf08978db6427443814ff18ca19ee1f29804ea`.
- Approval scope: Deploy AudAiX only; no migrations, secrets, Stripe/billing mutations, provider-cost calls, authenticated tests, production data mutations, unrelated config changes.
- Residual risk: Build timestamp is `unknown`; authenticated and billing runtime proof not run.
