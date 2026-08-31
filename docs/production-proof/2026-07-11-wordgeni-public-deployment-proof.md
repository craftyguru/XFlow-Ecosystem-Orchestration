# Production Proof Record

## Metadata

- App: WordGeni
- Environment: production
- Public URL: https://wordgeni.com and https://api.wordgeni.com
- Test date/time: 2026-07-11T11:14:34Z
- Expected commit: 46edcdc09242a1fd33ea7686910f9f9d514eea1a
- Observed commit: 46edcdc09242a1fd33ea7686910f9f9d514eea1a
- Test account type: Not used; public unauthenticated health/readiness only.
- Reviewer: Codex

## Workflow

- Workflow tested: Public web liveness/readiness metadata and API liveness/readiness metadata.
- Commands or steps: `Invoke-WebRequest` for `https://wordgeni.com/api/health`, `/api/ready`, `/api/health/live`, `/api/health/ready`, `https://api.wordgeni.com/health`, `/health/live`, and `/health/ready`.
- Expected result: All endpoints return HTTP 200 with exact approved commit; readiness endpoints remain readiness-specific.
- Actual result: All endpoints returned HTTP 200 with exact approved commit. API readiness reported database `ok`.
- Final status: PROVEN

## Evidence

- Screenshots/video paths: Not captured in this phase.
- Logs or request IDs: Not exposed by public response.
- Health/readiness response:

```json
{
  "web": {
    "health": {
      "statusCode": 200,
      "body": {
        "ok": true,
        "app": "wordgeni",
        "status": "healthy",
        "environment": "production",
        "version": "3.4.1",
        "commit": "46edcdc09242a1fd33ea7686910f9f9d514eea1a",
        "buildTime": "unknown"
      }
    },
    "ready": {
      "statusCode": 200,
      "body": {
        "ok": true,
        "app": "wordgeni",
        "status": "ready",
        "environment": "production",
        "version": "3.4.1",
        "commit": "46edcdc09242a1fd33ea7686910f9f9d514eea1a",
        "buildTime": "unknown"
      }
    }
  },
  "api": {
    "health": {
      "statusCode": 200,
      "body": {
        "status": "ok",
        "check": "liveness",
        "service": "wordgeni-api",
        "app": "wordgeni",
        "environment": "production",
        "version": "0.1.0",
        "commit": "46edcdc09242a1fd33ea7686910f9f9d514eea1a",
        "buildTime": "unknown"
      }
    },
    "ready": {
      "statusCode": 200,
      "body": {
        "status": "ok",
        "check": "readiness",
        "service": "wordgeni-api",
        "app": "wordgeni",
        "environment": "production",
        "version": "0.1.0",
        "commit": "46edcdc09242a1fd33ea7686910f9f9d514eea1a",
        "buildTime": "unknown",
        "database": "ok"
      }
    }
  }
}
```

- Deployment provider evidence: Railway target `Project: WordGeni`, `Environment: production`, `Service: WordGeni`. Public web/API health and readiness endpoints report approved commit.

## Mutation And Cleanup

- Mutations performed: Deployment was completed by Railway/GitHub after approved pushed commit; no manual production data mutation.
- Provider-cost calls performed: None.
- Billing/subscription/entitlement mutations performed: None.
- Cleanup required: None.
- Rollback performed: None.

## Approval

- Approval source: User approval in Codex thread for WordGeni commit `46edcdc09242a1fd33ea7686910f9f9d514eea1a`.
- Approval scope: Deploy WordGeni only; no migrations, secrets, Stripe/billing mutations, provider-cost calls, authenticated tests, production data mutations, unrelated config changes.
- Residual risk: Build timestamp is `unknown`; authenticated and billing runtime proof not run.
