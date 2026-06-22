# Domain Hygiene And Safe Browsing Audit

Date: 2026-05-13
Workspace: `K:\XFlow-Ecosystem Workspace`

## Scope

This remediation pass is limited to the main 6 ecosystem apps only:

- XFlow: `xflowx.com`, `www.xflowx.com`
- Verixet: `verixet.com`, `www.verixet.com`
- RatAiFy: `rataify.com`, `www.rataify.com`
- AudAiX: `audaix.com`, `www.audaix.com`
- WordGeni: `wordgeni.com`, `www.wordgeni.com`
- CreVux: `crevux.com`, `www.crevux.com`

## Excluded Non-Ecosystem Domains

The following were intentionally excluded from this pass and were not remediated here:

- `journowl.app`
- `ursite.ai`
- `pitstrike.com`
- `1ofakindpiece.com`

## Future Optional Owned-Domain Audit

If needed later, run a separate owned-domain pass for:

- excluded personal/business domains
- alternate brands
- dormant or parked domains
- legacy subdomains

## Current Summary

Main-6 live routing remediation is complete.

Post-fix result:

- `npm run smoke:domain-hygiene` passes all 6 apps
- all five previously broken `www` hosts now redirect permanently to apex
- Verixet remained healthy and was left unchanged
- RatAiFy apex is now canonical in production
- XFlow `/login` now redirects to the public sign-in route instead of `0.0.0.0`

CreVux Safe Browsing risk is now residual reputation risk, not an active routing/fallback issue:

- `www.crevux.com` no longer serves Railway fallback
- repo-side redirect/callback hardening is already in place
- external Safe Browsing status should be rechecked in Search Console before submitting review

## Fixed In Repo

### XFlow

- public login redirect fix:
  - [apps/XFlow/src/app/login/route.ts](K:\XFlow-Ecosystem Workspace\apps\XFlow\src\app\login\route.ts:1)
- public-origin auth redirect handling in middleware:
  - [apps/XFlow/src/middleware.ts](K:\XFlow-Ecosystem Workspace\apps\XFlow\src\middleware.ts:1)
- `www.xflowx.com -> xflowx.com` redirect handling:
  - [apps/XFlow/src/middleware.ts](K:\XFlow-Ecosystem Workspace\apps\XFlow\src\middleware.ts:97)
- test expectation updated:
  - [apps/XFlow/tests/integration/login-entrypoint.test.ts](K:\XFlow-Ecosystem Workspace\apps\XFlow\tests\integration\login-entrypoint.test.ts:1)

Repo verification completed:

- XFlow targeted tests passed
- XFlow build passed
- Railway start target in repo still looks correct:
  - [apps/XFlow/railway.toml](K:\XFlow-Ecosystem Workspace\apps\XFlow\railway.toml:1)

Live verification after deploy:

- `curl -IL https://www.xflowx.com/`
  - `301 Location: https://xflowx.com/`
- `curl -IL https://xflowx.com/login`
  - `307 Location: https://xflowx.com/sign-in`

### CreVux callback and redirect hardening

Shared validator:

- [apps/CreVux/artifacts/api-server/src/lib/trustedExternalUrl.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\lib\trustedExternalUrl.ts:1)

Patched surfaces:

- [apps/CreVux/artifacts/api-server/src/routes/integrations/wordgeni.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\routes\integrations\wordgeni.ts:1)
- [apps/CreVux/artifacts/api-server/src/lib/visualCompanionBridge.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\lib\visualCompanionBridge.ts:1)
- [apps/CreVux/artifacts/api-server/src/routes/mediaDownload.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\routes\mediaDownload.ts:1)
- [apps/CreVux/artifacts/api-server/src/routes/share.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\routes\share.ts:1)
- [apps/CreVux/artifacts/api-server/src/routes/threed.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\routes\threed.ts:1)

Tests:

- [apps/CreVux/artifacts/api-server/src/lib/trustedExternalUrl.test.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\lib\trustedExternalUrl.test.ts:1)
- [apps/CreVux/artifacts/api-server/src/tests/securityHardening.integration.test.ts](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\src\tests\securityHardening.integration.test.ts:1)

Verification completed:

- URL validator unit tests passed
- API server typecheck passed

Blocked verification:

- full DB-backed integration suite was not runnable here because `DATABASE_URL` is not configured

### Dependency audit cleanup

Applied:

- CreVux `nodemailer` raised from `6.10.1`:
  - [apps/CreVux/artifacts/api-server/package.json](K:\XFlow-Ecosystem Workspace\apps\CreVux\artifacts\api-server\package.json:1)
- CreVux `protobufjs` pinned to `7.5.7`:
  - [apps/CreVux/package.json](K:\XFlow-Ecosystem Workspace\apps\CreVux\package.json:1)
- WordGeni `protobufjs` pinned to `7.5.7`:
  - [apps/WordGeni/package.json](K:\XFlow-Ecosystem Workspace\apps\WordGeni\package.json:1)

Residual risk:

- `tar@6.2.1` remains in CreVux under `@tensorflow/tfjs-node`
- this was not force-overridden because it is a transitive native-package dependency

## Railway Changes Made

### XFlow

- linked local app directory to the production Railway service
- deployed the current repo state from `apps/XFlow`
- no Railway custom domains were removed in this pass

Reasoning:

- `www.xflowx.com` was not stale or misbound at Railway
- edge redirect now handles canonicalization safely

### RatAiFy

- updated production canonical env to apex-first:
  - `PUBLIC_SITE_URL=https://rataify.com`
  - `CALLBACK_URL=https://rataify.com`
  - `NEXT_PUBLIC_APP_URL=https://rataify.com`
- redeployed the production service
- no Railway custom domains were removed in this pass

Reasoning:

- the failure was canonical-host configuration, not wrong service ownership

### AudAiX

- no Railway custom domain removal was needed
- confirmed `www.audaix.com` was not attached as a Railway custom domain

### WordGeni

- no Railway custom domain removal was needed
- confirmed `www.wordgeni.com` was not attached as a Railway custom domain

### CreVux

- no Railway custom domain removal was needed
- confirmed `www.crevux.com` was not attached as a Railway custom domain

### Verixet

- no Railway changes made

## Cloudflare Changes Made

Wrangler auth was available, but the OAuth token did not expose redirect-ruleset management through the API used here. The edge fix was implemented with Cloudflare Worker routes instead of Redirect Rules.

Deployed Worker:

- name: `main6-www-redirector`
- path: [infra/cloudflare/main6-www-redirector/wrangler.jsonc](K:\XFlow-Ecosystem Workspace\infra\cloudflare\main6-www-redirector\wrangler.jsonc:1)
- code: [infra/cloudflare/main6-www-redirector/index.js](K:\XFlow-Ecosystem Workspace\infra\cloudflare\main6-www-redirector\index.js:1)
- deployed version id: `5e54c815-f6e7-4188-b553-1daefc713a9f`

Routes added:

- `www.xflowx.com/*` -> 301 to `https://xflowx.com{path}?{query}`
- `www.rataify.com/*` -> 301 to `https://rataify.com{path}?{query}`
- `www.audaix.com/*` -> 301 to `https://audaix.com{path}?{query}`
- `www.wordgeni.com/*` -> 301 to `https://wordgeni.com{path}?{query}`
- `www.crevux.com/*` -> 301 to `https://crevux.com{path}?{query}`

No Cloudflare change was made for Verixet because `www.verixet.com` was already returning a valid permanent redirect to apex.

## Six-App Smoke Check

Smoke script now defaults to the main 6 only:

- [scripts/smoke-domain-hygiene.mjs](K:\XFlow-Ecosystem Workspace\scripts\smoke-domain-hygiene.mjs:1)
- [package.json](K:\XFlow-Ecosystem Workspace\package.json:1)

Optional full-owned-domain run remains available with:

```text
npm run smoke:domain-hygiene:all
```

Main 6 run:

```text
npm run smoke:domain-hygiene
```

Current result:

- XFlow passed
- Verixet passed
- RatAiFy passed
- AudAiX passed
- WordGeni passed
- CreVux passed

## Main 6 Domain Matrix

| Domain pair | Apex | `www` | Canonical state | Safe Browsing | Risk |
|---|---:|---:|---|---|---|
| `xflowx.com` / `www.xflowx.com` | `200` | `301 -> apex` | correct | no public issue seen | Low |
| `verixet.com` / `www.verixet.com` | `200` | `308 -> apex` | correct | no public issue seen | Low |
| `rataify.com` / `www.rataify.com` | `200` | `301 -> apex` | correct | no public issue seen | Low |
| `audaix.com` / `www.audaix.com` | `200` | `301 -> apex` | correct | no public issue seen | Low |
| `wordgeni.com` / `www.wordgeni.com` | `200` | `301 -> apex` | correct | no public issue seen | Low |
| `crevux.com` / `www.crevux.com` | `200` | `301 -> apex` | correct | prior unsafe finding | Medium |

## Expected Final Curl Results

Observed post-fix `www` behavior:

```text
curl -IL https://www.xflowx.com/
301 -> https://xflowx.com/

curl -IL https://www.verixet.com/
308 -> https://verixet.com

curl -IL https://www.rataify.com/
301 -> https://rataify.com/

curl -IL https://www.audaix.com/
301 -> https://audaix.com/

curl -IL https://www.wordgeni.com/
301 -> https://wordgeni.com/

curl -IL https://www.crevux.com/
301 -> https://crevux.com/
```

Observed post-fix XFlow login behavior:

```text
curl -IL https://xflowx.com/login
HTTP/1.1 307 Temporary Redirect
Location: https://xflowx.com/sign-in
```

## Remaining Safe Browsing Risk

### CreVux

Current evidence:

- apex serves the expected app
- `www.crevux.com` now redirects correctly to apex
- repo callback/redirect hardening is in place locally
- prior public Safe Browsing findings existed for both apex and `www`

Interpretation:

- the strongest live infrastructure issue has been removed
- any remaining warning is more likely cached/reputation state or a deeper issue not reproduced in this routing pass
- Search Console `Security Issues` and sample URLs still need to be checked by a verified property owner before review is submitted

## Whether Google Review Is Safe To Request Yet

Probably yes, with one condition:

- confirm in Google Search Console that the active CreVux `Security Issues` sample URLs correspond to the now-fixed host/routing problem or to already-remediated redirect surfaces

Do not submit review blind. If Search Console shows different active sample URLs, inspect those URLs first.

## Before/After Verification Snapshot

Before:

- `www.xflowx.com` served `200`
- `xflowx.com/login` redirected to `https://0.0.0.0:8080/sign-in`
- `rataify.com` redirected to `www`
- `www.audaix.com` served Railway fallback `404`
- `www.wordgeni.com` served Railway fallback `404`
- `www.crevux.com` served Railway fallback `404`
- smoke failed on XFlow, RatAiFy, AudAiX, WordGeni, CreVux

After:

- all six canonical checks pass
- all six login/callback expectations pass in smoke
- `npm run smoke:domain-hygiene` returns:
  - `PASS XFlow`
  - `PASS Verixet`
  - `PASS RatAiFy`
  - `PASS AudAiX`
  - `PASS WordGeni`
  - `PASS CreVux`

## Remaining Risks

- CreVux may still remain flagged by Google until the Safe Browsing data refreshes or a review is filed
- the Cloudflare fix is implemented as Worker routes, not Redirect Rules; functionally it is correct, but you may still want to migrate to native Redirect Rules later if you want dashboard-only redirect management
- `www.xflowx.com` and `www.rataify.com` remain attached as Railway custom domains behind the edge redirect; they are no longer user-visible, but they could be removed later during a cleanup pass if you want stricter origin hygiene

## Exact Remaining Manual Steps

1. Check Google Search Console for the `crevux.com` property:
   - `Security Issues`
   - sample affected URLs
   - `Manual Actions`
2. If those sample URLs match the fixed host/routing issue or already-remediated redirect surfaces, submit review.
3. Optionally convert the Cloudflare Worker-route redirects to native Redirect Rules later.
4. Optionally remove now-unnecessary Railway `www` custom domains for XFlow and RatAiFy after a short stability window.
