# Ecosystem Assistant Support Production Rollout

This is the final production checklist for the six-app ecosystem assistant/support rollout across XFlow, AudAiX, Verixet, Crevux, Rataify, and WordGeni.

Do not redesign the assistant architecture, replace app-specific copilots, hardcode pricing, expose service tokens, or mix Crevux TensorFlow/Rataify bootstrap cleanup into assistant logic.

## Production Env Map

### XFlow

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| XFlow | `DATABASE_URL` | Required | Server-only | Production Postgres URL used by XFlow Drizzle migrations/runtime | N/A | XFlow Railway service |
| XFlow | `XFLOW_ECOSYSTEM_ASSISTANT_AUDAIX_PROXY_TOKEN` | Required | Server-only | High-entropy opaque bearer token, no quotes in Railway | AudAiX `XFLOW_ASSISTANT_SERVICE_TOKEN` | XFlow Railway service |
| XFlow | `XFLOW_ECOSYSTEM_ASSISTANT_VERIXET_PROXY_TOKEN` | Required | Server-only | High-entropy opaque bearer token, no quotes in Railway | Verixet `XFLOW_ASSISTANT_SERVICE_TOKEN` | XFlow Railway service |
| XFlow | `XFLOW_ECOSYSTEM_ASSISTANT_CREVUX_PROXY_TOKEN` | Required | Server-only | High-entropy opaque bearer token, no quotes in Railway | Crevux `XFLOW_ASSISTANT_SERVICE_TOKEN` | XFlow Railway service |
| XFlow | `XFLOW_ECOSYSTEM_ASSISTANT_RATAIFY_PROXY_TOKEN` | Required | Server-only | High-entropy opaque bearer token, no quotes in Railway | Rataify `XFLOW_ASSISTANT_SERVICE_TOKEN` | XFlow Railway service |
| XFlow | `XFLOW_ECOSYSTEM_ASSISTANT_WORDGENI_PROXY_TOKEN` | Required | Server-only | High-entropy opaque bearer token, no quotes in Railway | WordGeni `XFLOW_ASSISTANT_SERVICE_TOKEN` | XFlow Railway service |

### AudAiX

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| AudAiX | `XFLOW_ASSISTANT_BASE_URL` | Required | Server-only | XFlow production origin, for example `https://xflowx.com` | N/A | AudAiX API/backend Railway service |
| AudAiX | `XFLOW_ASSISTANT_SERVICE_TOKEN` | Required | Server-only | Same opaque token configured in XFlow for AudAiX | XFlow `XFLOW_ECOSYSTEM_ASSISTANT_AUDAIX_PROXY_TOKEN` | AudAiX API/backend Railway service |
| AudAiX | `VITE_ECOSYSTEM_ASSISTANT_ENABLED` | Optional, only if wired as build flag | Public | `true` or `false`; public bundle value, never a secret | N/A | AudAiX dashboard/web build service if used |

### Verixet

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| Verixet | `XFLOW_ASSISTANT_BASE_URL` | Required | Server-only | XFlow production origin, for example `https://xflowx.com` | N/A | Verixet web Railway service |
| Verixet | `XFLOW_ASSISTANT_SERVICE_TOKEN` | Required | Server-only | Same opaque token configured in XFlow for Verixet | XFlow `XFLOW_ECOSYSTEM_ASSISTANT_VERIXET_PROXY_TOKEN` | Verixet web Railway service |
| Verixet | `NEXT_PUBLIC_ECOSYSTEM_ASSISTANT_ENABLED` | Optional, only if wired as build flag | Public | `true` or `false`; public bundle value, never a secret | N/A | Verixet web Railway service if used |

### Crevux

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| Crevux | `XFLOW_ASSISTANT_BASE_URL` | Required | Server-only | XFlow production origin, for example `https://xflowx.com` | N/A | Crevux API server Railway service |
| Crevux | `XFLOW_ASSISTANT_SERVICE_TOKEN` | Required | Server-only | Same opaque token configured in XFlow for Crevux | XFlow `XFLOW_ECOSYSTEM_ASSISTANT_CREVUX_PROXY_TOKEN` | Crevux API server Railway service |
| Crevux | `VITE_ECOSYSTEM_ASSISTANT_ENABLED` | Optional, only if wired as build flag | Public | `true` or `false`; public bundle value, never a secret | N/A | Crevux image-gen/web Railway service if used |

### Rataify

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| Rataify | `XFLOW_ASSISTANT_BASE_URL` | Required | Server-only | XFlow production origin, for example `https://xflowx.com` | N/A | Rataify API/web Railway service |
| Rataify | `XFLOW_ASSISTANT_SERVICE_TOKEN` | Required | Server-only | Same opaque token configured in XFlow for Rataify | XFlow `XFLOW_ECOSYSTEM_ASSISTANT_RATAIFY_PROXY_TOKEN` | Rataify API/web Railway service |
| Rataify | `VITE_ECOSYSTEM_ASSISTANT_ENABLED` | Required for public bubble rollout | Public | `true` enables public ecosystem assistant; `false` hides it | N/A | Rataify web build/runtime Railway service |

### WordGeni

| App | Variable | Required | Scope | Expected value shape | Should match | Railway/service location |
| --- | --- | --- | --- | --- | --- | --- |
| WordGeni | `XFLOW_ASSISTANT_BASE_URL` | Required | Server-only | XFlow production origin, for example `https://xflowx.com` | N/A | WordGeni web Railway service |
| WordGeni | `XFLOW_ASSISTANT_SERVICE_TOKEN` | Required | Server-only | Same opaque token configured in XFlow for WordGeni | XFlow `XFLOW_ECOSYSTEM_ASSISTANT_WORDGENI_PROXY_TOKEN` | WordGeni web Railway service |
| WordGeni | `NEXT_PUBLIC_ECOSYSTEM_ASSISTANT_ENABLED` | Optional, only if wired as build flag | Public | `true` or `false`; public bundle value, never a secret | N/A | WordGeni web Railway service if used |

## Token Matching Checklist

| App | Satellite value | Must equal XFlow value |
| --- | --- | --- |
| AudAiX | `XFLOW_ASSISTANT_SERVICE_TOKEN` | `XFLOW_ECOSYSTEM_ASSISTANT_AUDAIX_PROXY_TOKEN` |
| Verixet | `XFLOW_ASSISTANT_SERVICE_TOKEN` | `XFLOW_ECOSYSTEM_ASSISTANT_VERIXET_PROXY_TOKEN` |
| Crevux | `XFLOW_ASSISTANT_SERVICE_TOKEN` | `XFLOW_ECOSYSTEM_ASSISTANT_CREVUX_PROXY_TOKEN` |
| Rataify | `XFLOW_ASSISTANT_SERVICE_TOKEN` | `XFLOW_ECOSYSTEM_ASSISTANT_RATAIFY_PROXY_TOKEN` |
| WordGeni | `XFLOW_ASSISTANT_SERVICE_TOKEN` | `XFLOW_ECOSYSTEM_ASSISTANT_WORDGENI_PROXY_TOKEN` |

The satellite token is server-only. It must never be referenced from `VITE_`, `NEXT_PUBLIC_`, client components, browser bundles, static assets, or generated public config.

## Production Smoke Commands

Set an authenticated XFlow admin cookie before running any production smoke that must confirm the created support record in XFlow admin:

```powershell
$env:XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE="<xflow admin session cookie>"
```

If an admin cookie is not available, the smoke runner can confirm the support record directly from the XFlow database instead:

```powershell
$env:ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL="<xflow production database url>"
```

Each smoke verifies chat `200`, `usedAppSlugs` includes the source app plus `xflow`, pricing cites Verixet/catalog authority, anonymous no-email escalation returns `400`, email escalation returns `201`, and XFlow admin support confirms the created record with the expected `appSlug`.

| App | Command |
| --- | --- |
| XFlow | `npm run smoke:ecosystem-assistant:production -- --app=xflow --app-base-url=https://xflowx.com --xflow-base-url=https://xflowx.com` |
| AudAiX | `npm run smoke:ecosystem-assistant:production -- --app=audaix --app-base-url=https://audaix.com --xflow-base-url=https://xflowx.com` |
| Verixet | `npm run smoke:ecosystem-assistant:production -- --app=verixet --app-base-url=https://verixet.com --xflow-base-url=https://xflowx.com` |
| Crevux | `npm run smoke:ecosystem-assistant:production -- --app=crevux --app-base-url=https://crevux.com --xflow-base-url=https://xflowx.com` |
| Rataify | `npm run smoke:ecosystem-assistant:production -- --app=rataify --app-base-url=https://rataify.com --xflow-base-url=https://xflowx.com` |
| WordGeni | `npm run smoke:ecosystem-assistant:production -- --app=wordgeni --app-base-url=https://wordgeni.com --xflow-base-url=https://xflowx.com` |

For Rataify-specific legacy-support regression proof, also keep this available after the general smoke:

```powershell
cd "D:\XFlow-Ecosystem Workspace\apps\RatAiFy"
$env:RATAIFY_ECOSYSTEM_ASSISTANT_SMOKE_API_BASE_URL="https://rataify.com"
$env:XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL="https://xflowx.com"
$env:RATAIFY_ECOSYSTEM_ASSISTANT_SMOKE_XFLOW_ADMIN_COOKIE=$env:XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE
npm run smoke:ecosystem-assistant
```

## Rollback Flags

Rollback should disable the public bubble without removing backend proxy routes.

| App | Rollback action |
| --- | --- |
| XFlow | Keep assistant/support routes and support records intact. If needed, hide only public mount surfaces; do not remove admin support list/detail. |
| AudAiX | Keep `/api/ecosystem-assistant/*` proxy routes deployed. Hide the dashboard/public bubble mount or set the public enable flag to `false` if the build is wired to it. Keep AudAiX app-specific copilots. |
| Verixet | Keep Next API proxy routes deployed. Hide the marketing bubble mount or set `NEXT_PUBLIC_ECOSYSTEM_ASSISTANT_ENABLED=false` if wired. Keep Vera and billing/governance assistant behavior. |
| Crevux | Keep API-server assistant proxy routes deployed. Hide the image-gen/web bubble mount or set `VITE_ECOSYSTEM_ASSISTANT_ENABLED=false` if wired. Keep Crevux Copilot and avoid TensorFlow cleanup in assistant rollback. |
| Rataify | Set `VITE_ECOSYSTEM_ASSISTANT_ENABLED=false` and redeploy the web bundle. Keep proxy routes deployed and unused. `ContactWidget` should reappear only when the ecosystem assistant is disabled. |
| WordGeni | Keep web API proxy routes deployed. Hide the public bubble mount or set `NEXT_PUBLIC_ECOSYSTEM_ASSISTANT_ENABLED=false` if wired. Keep Geni and writing/source copilots. |

Rollback rules:

- Keep XFlow support records intact.
- Keep proxy routes deployed but unused.
- Keep existing app-specific copilots.
- Restore or hide legacy public contact widgets carefully.
- Do not create duplicate support bubbles on the same public surface.

## Deployment Order

| Stage | App | Steps |
| --- | --- | --- |
| 1 | XFlow | Deploy XFlow, run `/api/ready`, run XFlow assistant smoke, check XFlow admin support list/detail with `appSlug=xflow`, check browser bubble, verify rollback hiding path. |
| 2 | Verixet | Deploy Verixet, run Verixet health/readiness, run Verixet assistant smoke, check XFlow admin support `appSlug=verixet`, check browser bubble, check rollback flag/path. |
| 3 | AudAiX | Deploy AudAiX, run health check, run AudAiX assistant smoke, check XFlow admin support `appSlug=audaix`, check browser bubble, check rollback flag/path. |
| 4 | WordGeni | Deploy WordGeni, run `/health` and `/health/ready`, run WordGeni assistant smoke, check XFlow admin support `appSlug=wordgeni`, check browser bubble, check rollback flag/path. |
| 5 | Rataify | Deploy Rataify, run `/api/health/live`, run Rataify assistant smoke, check XFlow admin support `appSlug=rataify`, check browser bubble, confirm `ContactWidget` stays hidden while enabled and returns when disabled. |
| 6 | Crevux | Deploy Crevux, run API/web health check, run Crevux assistant smoke, check XFlow admin support `appSlug=crevux`, check browser bubble, check rollback flag/path. |

## Known Nonfatal Issues

| Issue | Production interpretation |
| --- | --- |
| Crevux TensorFlow native addon fallback | Nonfatal when JS fallback is active and assistant routes are healthy. Do not mix TensorFlow native cleanup into assistant rollout. |
| Crevux Redis/local DB dev warnings | Nonfatal for production assistant rollout unless they appear against production dependencies or block health/readiness. |
| XFlow Next dev/build `.next` race | Nonfatal local/dev artifact. For production, run clean Railway builds and avoid sharing `.next` between dev/build processes. |
| Rataify stale bootstrap token cleanup if still present | Track separately from assistant rollout. Do not change assistant proxy token handling as part of stale bootstrap cleanup. |
| WordGeni local turbo shim issue if still present | Nonfatal local tooling issue. Production Railway build/start scripts remain the deployment authority. |

## Final Go/No-Go Checklist

- [ ] All XFlow env vars are set in the XFlow Railway service.
- [ ] All satellite `XFLOW_ASSISTANT_BASE_URL` values point to the production XFlow origin.
- [ ] Each satellite `XFLOW_ASSISTANT_SERVICE_TOKEN` exactly matches its XFlow app-scoped proxy token.
- [ ] No service token appears in browser bundles, static assets, `VITE_`, `NEXT_PUBLIC_`, or client-side code.
- [ ] XFlow DB is migrated and includes assistant/support tables.
- [ ] XFlow admin can filter support by every `appSlug`.
- [ ] Public bubbles are enabled only where intended.
- [ ] No duplicate support bubbles or legacy contact widgets appear.
- [ ] Support test records are created successfully for all six apps.
- [ ] Rollback flags or mount-hiding paths are tested.
- [ ] Logs include `requestId` and `appSlug` for chat and escalation requests.
- [ ] Production smoke passes for XFlow, AudAiX, Verixet, Crevux, Rataify, and WordGeni.

## Final Deployment Recommendation

Go only after the six production smoke commands pass with an XFlow admin cookie and the browser bundle token scan remains clean. The rollout is approved for staged deployment in this order: XFlow, Verixet, AudAiX, WordGeni, Rataify, Crevux.
