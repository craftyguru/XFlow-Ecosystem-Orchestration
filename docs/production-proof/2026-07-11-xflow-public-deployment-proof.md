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

## Phase 2B Railway Drift Closeout

- Closeout date/time: 2026-07-11T11:14:16Z through Railway GraphQL inspection after the Phase 2A failed public deployment attempt.
- Railway project: `xflowx` (`e4768601-f28f-4ac0-8f83-272219070e62`)
- Railway environment: `production` (`7b0d90f9-2837-40b2-a549-f843a70a9bb2`)
- Railway service: `xflowx` (`07e55648-447d-469b-876e-4564e1c807e7`)
- Connected repository: `craftyguru/xflowx`
- Connected branch: `master`
- Deployment trigger: provider `github`, repository `craftyguru/xflowx`, branch `master`, service `xflowx`, environment `production`
- Root directory: `null`
- Public domains: `xflowx.com` and `www.xflowx.com`, both active custom domains on service `07e55648-447d-469b-876e-4564e1c807e7`
- Last successful deployment: `a7a79f3d-0797-47a2-a322-e4029b7acdfc`, commit `af5a494da0c1b292815dffcd771e663f7cc76751`, status `SUCCESS`, created `2026-07-07T23:37:43.210Z`
- Approved commit deployment: `673f961e-8bcb-40c8-8612-0f4290f256d4`, commit `960b5eff27f07b8bb9db83146422095855d7feec`, status `FAILED`, created `2026-07-09T10:36:27.156Z`, status updated `2026-07-09T10:37:38.710Z`
- Approved commit deployment failure step: `BUILD_IMAGE`
- Approved commit deployment failure message: `Failed to build an image. Please check the build logs for more details.`
- Manual CLI upload attempt: `433f1d40-3295-4dc9-8471-2c934f209a7f`, status `FAILED`, step `BUILD_IMAGE`, created `2026-07-11T11:09:58.979Z`
- Manual redeploy attempt: `6e7bf7de-7c60-4ed6-8662-bd751ba79d0c`, status `FAILED`, step `BUILD_IMAGE`, created `2026-07-11T11:12:35.920Z`
- Root cause classification: `FAILED BUILD`
- Final XFlow closeout status: `BLOCKED`
- Smallest next approval required: investigate and fix the Railway Docker build failure for XFlow. This may require reviewing build logs in the Railway dashboard and approving code or deployment-configuration changes if the build failure points to a repository or Dockerfile defect.

## Phase 2C Build Failure Investigation

- Investigation date/time: 2026-07-11
- Failed deployment IDs inspected: `673f961e-8bcb-40c8-8612-0f4290f256d4`, `433f1d40-3295-4dc9-8471-2c934f209a7f`, `6e7bf7de-7c60-4ed6-8662-bd751ba79d0c`
- Railway finite log result: `deploymentLogs` returned no log rows for unfiltered, `build`, `error`, `docker`, `npm`, `pnpm`, and `yarn` filters.
- Railway event result: all three failed deployments completed `SNAPSHOT_CODE` and failed at `BUILD_IMAGE` with `Failed to build an image. Please check the build logs for more details.`
- Build configuration inspected: `package.json`, `package-lock.json`, `Dockerfile`, `railway.toml`, `.dockerignore`, `.railwayignore`, `next.config.ts`, `tsconfig.json`, `scripts/next-build.cjs`, `scripts/next-build-skip-standalone.cjs`.
- Build-relevant config diff between last successful commit `af5a494da0c1b292815dffcd771e663f7cc76751` and approved commit `960b5eff27f07b8bb9db83146422095855d7feec`: no changes to `Dockerfile`, lockfile, package scripts, Railway config, Next config, or TypeScript config.
- Changed area between last successful and approved commit: pricing/catalog/billing presentation files and focused tests/proof script.
- Local install verification: `npm ci --dry-run` passed with Node `v22.18.0` and npm `10.9.3`.
- Docker deps-stage install simulation: copied the same dependency-context files as the Dockerfile `deps` stage and ran `npm ci`; install passed.
- Local build verification: `npm run build` passed.
- Local forced standalone build verification: `XFLOW_NEXT_FORCE_STANDALONE=1 XFLOW_NEXT_IGNORE_BUILD_TYPE_ERRORS=1 npm run build` passed and produced `.next/standalone/server.js`.
- Typecheck verification: `npm run typecheck` passed.
- Focused tests: pricing/catalog/billing proof tests passed.
- Docker verification limitation: `docker build --progress=plain -t xflow-phase2c-build .` could not run because Docker Desktop Linux engine was unavailable locally.
- Defect classification: `INSUFFICIENT EVIDENCE`
- Fix status: no code or deployment-configuration fix applied because no exact repository defect was proven.
- Final XFlow Phase 2C status: `BLOCKED`

## Phase 2D Missing Verixet Catalog Dependency Fix

- Investigation date/time: 2026-07-11
- Railway deployment ID: `673f961e-8bcb-40c8-8612-0f4290f256d4`
- Builder: Railway Docker/BuildKit image build using repository `Dockerfile`
- Failing stage: `builder`
- Failing Dockerfile line: `28`, `RUN npm run build`
- First actionable error: `Module not found: Can't resolve '../../../../Verixet/generated/catalog/verixet-public-catalog.v1.json'`
- Import trace: `src/lib/pricing/verixet-generated-catalog.ts` -> `src/lib/pricing/ecosystemPlans.ts` -> `src/app/(auth)/sign-up/SignUpClient.tsx` and `src/app/api/auth/signup/start/route.ts`
- Root cause classification: XFlow had a runtime build dependency on a sibling Verixet repository artifact that exists in the local multi-repo workspace but is absent from Railway's standalone XFlow build context.
- Repository fix: XFlow commit `965989a165926ce1de40e6353d6140a45a636d16` replaces the cross-repo runtime import with a checked-in generated mirror at `apps/XFlow/src/generated/verixet-public-catalog.v1.json`; adds `npm run sync:verixet-catalog` for release-prep refresh from the sibling Verixet artifact; adds `npm run verify:standalone-catalog-mirror` to fail if the cross-repo import is reintroduced or the mirror becomes invalid.
- Authority note: Verixet remains the canonical billing, subscription, entitlement, usage, credit, checkout, and catalog authority. The XFlow mirror is a deployment artifact/cache for public display and handoff metadata only.
- Production status after fix: still `BLOCKED` until a new approved deployment proves public health/readiness commit metadata has advanced from `af5a494da0c1b292815dffcd771e663f7cc76751`.
- Deployment performed in this phase: none.

## Phase 2E Redeploy And Public Verification

- Verification date/time: 2026-07-11T20:23:12.9148274Z
- Target Railway project: `xflowx` (`e4768601-f28f-4ac0-8f83-272219070e62`)
- Target Railway environment: `production` (`7b0d90f9-2837-40b2-a549-f843a70a9bb2`)
- Target Railway service: `xflowx` (`07e55648-447d-469b-876e-4564e1c807e7`)
- Approved commit: `965989a165926ce1de40e6353d6140a45a636d16`
- Successful Railway deployment: `350ccf4e-835e-4317-9edf-fbc6d095ef69`
- Deployment status: `SUCCESS`
- Build result: build succeeded and deployed.
- Public health result: HTTP 200, `status` `live`, commit `965989a165926ce1de40e6353d6140a45a636d16`
- Public readiness result: HTTP 200, `status` `ready`, commit `965989a165926ce1de40e6353d6140a45a636d16`
- Metadata result: public endpoints expose app/service `xflow`, version `3.4.1`, environment `production`, and the full expected commit SHA. `buildTimestamp` remains `null` in the existing XFlow response contract.
- Note: An initial `railway up` local upload deployment `338c60b4-4a9d-4d7d-8cf6-4f01d3fea9e8` succeeded without commit metadata and was removed with `railway down`; XFlow was then redeployed through Railway's targeted service-instance deploy for exact commit `965989a165926ce1de40e6353d6140a45a636d16`.
- Final public commit status: `PROVEN`

Health response:

```json
{
  "schemaVersion": 1,
  "ok": true,
  "status": "live",
  "service": "xflow",
  "version": "3.4.1",
  "appSlug": "xflow",
  "buildMarker": "support-phase-5b",
  "supportRouteVersion": "support-route-phase-5b",
  "buildTimestamp": null,
  "commitSha": "965989a165926ce1de40e6353d6140a45a636d16",
  "runtimeEnvironment": "production",
  "serviceRootMarker": "xflow-health-route",
  "deploy": {
    "app": "xflow",
    "version": "3.4.1",
    "commit_sha": "965989a165926ce1de40e6353d6140a45a636d16",
    "commit_short": "965989a16592",
    "environment": "production"
  },
  "requestId": "1f42b9a6-e240-42b5-bcfa-0c29bb363de0",
  "timestamp": "2026-07-11T20:23:12.251Z"
}
```

Readiness response:

```json
{
  "schemaVersion": 1,
  "ok": true,
  "status": "ready",
  "service": "xflow",
  "version": "3.4.1",
  "deploy": {
    "app": "xflow",
    "version": "3.4.1",
    "commit_sha": "965989a165926ce1de40e6353d6140a45a636d16",
    "commit_short": "965989a16592",
    "environment": "production"
  },
  "requestId": "45c6192c-534b-466a-8d61-55d898c4ba2a",
  "timestamp": "2026-07-11T20:23:12.400Z"
}
```
