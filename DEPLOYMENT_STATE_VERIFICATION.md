# Deployment State Verification

Date: 2026-06-18 America/Chicago

Scope:

- `apps\XFlow`
- `apps\Verixet`
- `apps\CreVux`
- `apps\RatAiFy`
- `apps\AudAix`
- `apps\WordGeni`

Sources used:

- `FINAL_DEPLOYMENT_EXECUTION_CHECKLIST.md`
- `FINAL_POST_PUSH_RELEASE_CHECKPOINT.md`
- `FINAL_PUSH_DEPLOY_READINESS_PLAN.md`
- `DEPLOY_VERIFICATION_RUNBOOK.md`
- `SECURITY_RELEASE_CHECKLIST.md`
- Local git state for each app repository
- GitHub Actions run status via `gh run list`
- GitHub deployments/statuses via `gh api repos/<repo>/deployments`
- Non-mutating unauthenticated HTTP checks against documented public health or release URLs

No deploys, pushes, migrations, secret rotations, data deletion, or app repository file changes were performed while creating this verification.

## Executive Summary

| Check | Result |
| --- | --- |
| All app repos clean | Yes |
| All app `HEAD` values match origin tracking branch | Yes |
| All latest pushed commits have green CI | Yes |
| All latest pushed commits have green Security workflow | Yes |
| Latest GitHub deployment status is success for expected commit | Yes, all six |
| Railway-backed deployment platform status available | Yes, all six via GitHub deployment environment URLs |
| Live commit metadata exposed by app health endpoint | XFlow, CreVux, RatAiFy yes; Verixet, AudAix, WordGeni unknown |
| Basic unauthenticated live smoke checks | Pass for documented/public endpoints checked |
| Redeploy needed | No for all six based on current evidence |

Important limitation: for apps whose live health endpoints do not expose commit metadata, the live app process could not be independently proven from HTTP alone. For those apps, the deployed commit is taken from the latest successful GitHub deployment record. Manual confirmation is still required if the release owner requires an in-app release marker, authenticated workflow smoke, or deployment dashboard review.

## Repository, CI, Security, And Deployment State

| App | Repo branch | Repo HEAD | Origin HEAD | Latest pushed commit | CI status | Security status | Deployment platform |
| --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | `master` | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | `CI` run `27756368241` success | `Security` run `27756368245` success | Railway via GitHub deployment `xflowx / production` |
| Verixet | `main` | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | `CI` run `27760505991` success | `Security` run `27760506002` success | Railway via GitHub deployment `Verixet / production` |
| CreVux | `main` | `505fe53c19e76257d8af57a645afabd6ef868860` | `505fe53c19e76257d8af57a645afabd6ef868860` | `505fe53c19e76257d8af57a645afabd6ef868860` | `CI` run `27762120141` success | `Security Checks` run `27762120177` success; `CodeQL` run `27762120211` success overall | Railway via GitHub deployment `Crevux / production` |
| RatAiFy | `main` | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | `CI` run `27788204745` success | `Security` run `27788204762` success | Railway via GitHub deployment `Rataify / production` |
| AudAix | `main` | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | `CI` run `27785810462` success | `Security` run `27785810485` success | Railway via GitHub deployment `AudAiX / production` |
| WordGeni | `main` | `564e827f998b0a33b5aa256095ccb9872ac0d236` | `564e827f998b0a33b5aa256095ccb9872ac0d236` | `564e827f998b0a33b5aa256095ccb9872ac0d236` | `CI` run `27789804405` success | `Security` run `27789804502` success | Railway via GitHub deployment `WordGeni / production` |

All `git log --oneline @{u}..HEAD` checks were empty, so no unpushed commits remain in the scoped app repositories.

## Deployment Records And Live Verification

| App | Live target | Deployed commit/version | Expected commit | Match | Health/smoke check result | Deployment platform status | Redeploy needed | Blocker if any | Manual confirmation needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | `https://xflowx.com`; health `https://xflowx.com/api/health`, ready `https://xflowx.com/api/ready` | Health exposes `commit_sha=fe9e0b0551c62a845840af4496b5cfcbc74a21c4`, version `3.4.1`; latest deployment `5108277116` same SHA | `fe9e0b0551c62a845840af4496b5cfcbc74a21c4` | Yes | `/api/health` 200 JSON `status=live`; `/api/ready` 200 JSON `status=ready`; both expose matching commit | GitHub deployment `xflowx / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in unauthenticated checks | Auth/control-plane/operator smoke remains manual if full release sign-off is required |
| Verixet | `https://verixet.com`; canonical checks on `https://www.verixet.com` | Latest deployment `5109196108` SHA `28d4d8eb04222d2cfc132f1cd460970086af6c85`; live HTTP does not expose commit metadata | `28d4d8eb04222d2cfc132f1cd460970086af6c85` | Yes by platform deployment; live in-app commit metadata unknown | Apex `/` returned 200; `www` `/`, `/sitemap.xml`, and `/robots.txt` returned 301 to apex paths | GitHub deployment `Verixet / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in unauthenticated checks | Entitlement/API-key/billing smoke and in-app commit proof require manual confirmation |
| CreVux | `https://crevux.com`; health `https://crevux.com/api/healthz`, ffmpeg proof `https://crevux.com/api/healthz/ffmpeg` | Health exposes build commit `505fe53c19e76257d8af57a645afabd6ef868860`, branch `main`, deployment ID `06e2acc2-ecef-491a-97ab-175b2767a12b`; latest deployment `5109564669` same SHA | `505fe53c19e76257d8af57a645afabd6ef868860` | Yes | `/api/healthz` 200 typed JSON with database/redis ok; `/api/healthz/ffmpeg` unauthenticated 401 typed JSON `NO_BEARER_TOKEN` | GitHub deployment `Crevux / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in unauthenticated checks | Media/upload smoke and derived artifact exposure proof require manual confirmation |
| RatAiFy | `https://rataify.com`; liveness `https://rataify.com/health` | `/health` exposes `version` and `commit_sha` `83697c45d604c4e7f139fa9bc0b298ba8454ff31`; latest deployment `5115187634` same SHA | `83697c45d604c4e7f139fa9bc0b298ba8454ff31` | Yes | `/health` 200 JSON with matching commit; `/api/health` 200 JSON with DB/Redis up; `/api/healthz` and `/api/ready` returned 401 auth-required | GitHub deployment `Rataify / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in unauthenticated checks | `RELEASE_VERIFY_BASE_URL`, scanner/report smoke, SSRF proof, and shared schema check if DB env exists require manual confirmation |
| AudAix | `https://audaix.com`; root health `https://audaix.com/health` | Latest deployment `5114694956` SHA `8b4929d1003bc75db1075654e011ca6b61e8f8a3`; live `/health` does not expose commit metadata | `8b4929d1003bc75db1075654e011ca6b61e8f8a3` | Yes by platform deployment; live in-app commit metadata unknown | `/health` 200 JSON `{ ok: true, service: "audaix" }`; `/dashboard/health` returned 200 app shell HTML; `/api/health` returned 404 | GitHub deployment `AudAiX / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in root health check; nested dashboard health route shape needs manual confirmation | Root scanner smoke, dashboard auth, audit result isolation, and in-app commit proof require manual confirmation |
| WordGeni | `https://wordgeni.com`; API target `https://api.wordgeni.com` | Latest deployment `5115546444` SHA `564e827f998b0a33b5aa256095ccb9872ac0d236`; live health endpoints do not expose commit metadata | `564e827f998b0a33b5aa256095ccb9872ac0d236` | Yes by platform deployment; live in-app commit metadata unknown | Web `/`, `/api/health`, `/api/health/live`, `/api/health/ready`, `/api/ready` returned 200 JSON/HTML as expected; API `https://api.wordgeni.com/health` returned 200; API root returned 404 JSON | GitHub deployment `WordGeni / production` state `success` at expected SHA; Railway project environment URL recorded | No | None observed in checked health endpoints; worker health not exposed in unauthenticated checks | Worker proof, export/download smoke, authorization/isolation proof, and in-app commit proof require manual confirmation |

## Deployment Platform Details

| App | Latest deployment ID | Environment | State | State timestamp | Environment URL |
| --- | --- | --- | --- | --- | --- |
| XFlow | `5108277116` | `xflowx / production` | `success` | `2026-06-18T11:33:27Z` | `https://railway.com/project/e4768601-f28f-4ac0-8f83-272219070e62?environmentId=7b0d90f9-2837-40b2-a549-f843a70a9bb2` |
| Verixet | `5109196108` | `Verixet / production` | `success` | `2026-06-18T12:51:16Z` | `https://railway.com/project/90aca753-ad4c-4e90-859a-55b4fb96f2a9?environmentId=05d5f8b3-a852-4b8e-912a-b24f89a03109` |
| CreVux | `5109564669` | `Crevux / production` | `success` | `2026-06-18T13:19:36Z` | `https://railway.com/project/0686bcb7-a156-4552-a7b1-438829c4f233?environmentId=8052eadd-386a-4680-aab2-52b6bb060f21` |
| RatAiFy | `5115187634` | `Rataify / production` | `success` | `2026-06-18T20:45:58Z` | `https://railway.com/project/e927d2aa-1311-43b2-b430-b49e687701aa?environmentId=e224fd6b-14c8-4803-bd7c-c540f932dd10` |
| AudAix | `5114694956` | `AudAiX / production` | `success` | `2026-06-18T20:01:38Z` | `https://railway.com/project/e7f09757-c496-409c-805c-fe3f62bde843?environmentId=862bc7c3-ea26-406c-97e2-6ae6f4ada0ff` |
| WordGeni | `5115546444` | `WordGeni / production` | `success` | `2026-06-18T21:18:37Z` | `https://railway.com/project/575ff2d3-dab7-45f2-ab84-8a4cb7211816?environmentId=c7ed38c3-3710-422c-847e-5f6c6a1bb936` |

These are read-only GitHub deployment records written by the deployment integration. No Railway mutation or redeploy command was executed.

## Smoke Check Notes

- XFlow: live process and readiness checks passed and independently expose the expected commit.
- Verixet: canonical host proof passed for the documented `www` to apex checks; billing, entitlement, API-key, and deploy-gate smoke were not run because they require authenticated/manual release context.
- CreVux: live health and unauthenticated ffmpeg 401 proof passed and independently expose the expected commit in `/api/healthz`.
- RatAiFy: public liveness exposes the expected commit; authenticated scanner/report and release env verification remain manual.
- AudAix: root health passed; nested dashboard route returned app shell HTML at `/dashboard/health`, but a dedicated nested dashboard health contract was not independently proven from an unauthenticated endpoint.
- WordGeni: web and API health endpoints passed; API root returning 404 is not treated as a failure because `https://api.wordgeni.com/health` is the liveness endpoint that returned 200. Worker and export/download smoke remain manual.

## Redeploy Assessment

| App | Redeploy needed | Reason |
| --- | --- | --- |
| XFlow | No | Platform auto-deployed successfully at the expected pushed commit; live health and ready endpoints match the expected commit and pass. |
| Verixet | No | Platform auto-deployed successfully at the expected pushed commit; unauthenticated apex and canonical redirect checks pass. |
| CreVux | No | Platform auto-deployed successfully at the expected pushed commit; live health exposes matching commit and ffmpeg unauthenticated 401 proof passes. |
| RatAiFy | No | Platform auto-deployed successfully at the expected pushed commit; live liveness exposes matching commit and basic health passes. |
| AudAix | No | Platform auto-deployed successfully at the expected pushed commit; root health passes. In-app commit metadata remains manual confirmation. |
| WordGeni | No | Platform auto-deployed successfully at the expected pushed commit; web/API health checks pass. In-app commit metadata and worker/export proof remain manual confirmation. |

## Remaining Manual Confirmations

- Confirm deployment dashboards directly if release governance requires visual provider proof.
- Confirm Verixet entitlement, API-key, billing, and deploy-gate behavior with authorized test context.
- Confirm CreVux media upload smoke and derived artifact exposure policy with authorized test context.
- Confirm RatAiFy scanner/report smoke, SSRF protections, and `RELEASE_VERIFY_BASE_URL` release verification with the approved target.
- Confirm AudAix root scanner smoke, dashboard auth, nested dashboard health contract, and audit result isolation.
- Confirm WordGeni worker health/proof, export/download authorization, source/prompt/writing-context isolation, and authenticated writing/export flows.
- Confirm no deployment logs expose secrets before final release sign-off.

## Final State

Current production deployment state: all six apps have successful Railway-backed GitHub deployment records at the expected pushed commits, green CI/Security for those commits, clean local app repositories, and passing available unauthenticated smoke checks.

Deployment action: no redeploy is currently indicated by the evidence gathered here.

Release sign-off status: still requires manual confirmation for authenticated, tenant-scoped, billing, scanner, media, export, worker, and dashboard checks that cannot be safely proven from unauthenticated read-only probes.
