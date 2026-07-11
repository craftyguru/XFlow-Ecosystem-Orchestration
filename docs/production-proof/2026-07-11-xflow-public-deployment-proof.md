# Production Proof Record

## Metadata

- App: XFlow
- Environment: production
- Public URL: https://xflowx.com
- Test date/time: 2026-07-11T11:14:16Z
- Expected commit: 960b5eff27f07b8bb9db83146422095855d7feec
- Observed commit: af5a494da0c1b292815dffcd771e663f7cc76751
- Test account type: Not used; public unauthenticated health/readiness only.
- Reviewer: Codex

## Workflow

- Workflow tested: Approved public deployment and unauthenticated health/readiness metadata verification.
- Commands or steps: `railway up --service xflowx --environment production --ci`; `railway redeploy --service xflowx --yes`; `Invoke-WebRequest https://xflowx.com/api/health`; `Invoke-WebRequest https://xflowx.com/api/ready`.
- Expected result: Public health and readiness return HTTP 200 and report commit `960b5eff27f07b8bb9db83146422095855d7feec`.
- Actual result: Public health and readiness returned HTTP 200 but continued to report commit `af5a494da0c1b292815dffcd771e663f7cc76751`.
- Final status: BLOCKED

## Evidence

- Screenshots/video paths: Not captured in this phase.
- Logs or request IDs: health `c3a94387-a3a8-4ae3-b85c-257fb4d9ef56`; readiness `77bb2080-a22f-48dd-8d99-82b2a99b7e47`; Railway build log URL emitted by CLI: `https://railway.com/project/e4768601-f28f-4ac0-8f83-272219070e62/service/07e55648-447d-469b-876e-4564e1c807e7?id=433f1d40-3295-4dc9-8471-2c934f209a7f&`.
- Health/readiness response:

```json
{
  "health": {
    "statusCode": 200,
    "body": {
      "schemaVersion": 1,
      "ok": true,
      "status": "live",
      "service": "xflow",
      "version": "3.4.1",
      "appSlug": "xflow",
      "buildTimestamp": null,
      "commitSha": "af5a494da0c1b292815dffcd771e663f7cc76751",
      "runtimeEnvironment": "production",
      "deploy": {
        "app": "xflow",
        "version": "3.4.1",
        "commit_sha": "af5a494da0c1b292815dffcd771e663f7cc76751",
        "environment": "production"
      },
      "timestamp": "2026-07-11T11:14:16.149Z"
    }
  },
  "readiness": {
    "statusCode": 200,
    "body": {
      "schemaVersion": 1,
      "ok": true,
      "status": "ready",
      "service": "xflow",
      "version": "3.4.1",
      "deploy": {
        "app": "xflow",
        "version": "3.4.1",
        "commit_sha": "af5a494da0c1b292815dffcd771e663f7cc76751",
        "environment": "production"
      },
      "timestamp": "2026-07-11T11:14:16.291Z"
    }
  }
}
```

- Deployment provider evidence: Railway CLI target `Project: xflowx`, `Environment: production`, `Service: xflowx`. CLI upload failed to stream build logs; public metadata did not advance.

## Mutation And Cleanup

- Mutations performed: Railway deployment/redeploy attempt only.
- Provider-cost calls performed: None.
- Billing/subscription/entitlement mutations performed: None.
- Cleanup required: Investigate Railway deployment source/status before retrying. No rollback performed because public commit did not change.
- Rollback performed: None.

## Approval

- Approval source: User approval in Codex thread for XFlow commit `960b5eff27f07b8bb9db83146422095855d7feec`.
- Approval scope: Deploy XFlow only; no migrations, secrets, Stripe/billing mutations, provider-cost calls, authenticated tests, production data mutations, unrelated config changes.
- Residual risk: XFlow production remains on stale commit, so authenticated proof must not proceed for XFlow.
