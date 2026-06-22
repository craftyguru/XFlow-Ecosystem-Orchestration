# Verixet Canonical Host Remediation

Date: 2026-06-17
App: `apps\Verixet`
Scope: verification/proof only. No source changes, migrations, secret rotation, deploy command, commit, or push.

## Result

The canonical-host exception is cleared.

`npm run verify:canonical-host` now passes. All required `www.verixet.com` URLs redirect to the apex host with HTTP 301.

## Local Repo State

- `git status --short`: clean before verification and clean after verification.
- Branch: `main`
- Head: `e5ee0e4eb3e9878cfbd4775291e425904aea0901`
- Recent commits observed:
  - `e5ee0e4 fix(verixet): let middleware enforce www canonical 301`
  - `87849c0 security(verixet): clear high dependency audit findings`
  - `997c6b0 Clear security audit dependencies and update affected tests`
  - `0a13c01 Fix Verixet release env and route gates`
  - `537937f Clear security audit dependencies and update affected tests`

## Original Failure

The known exception was `www.verixet.com` redirecting to apex with HTTP 308 instead of the required permanent 301.

This verification run did not reproduce that failure.

## Hosting/CDN Change Made

No hosting/CDN change was made during this run. The current app/source/deployment behavior already satisfies the verifier.

## Commands Run

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
git status --short
npm run verify:canonical-host
npm run verify:security
npm run verify:routes
```

## Final Redirect Status

From `npm run verify:canonical-host`:

- `https://www.verixet.com/` -> `https://verixet.com/` with HTTP 301
- `https://www.verixet.com/sitemap.xml` -> `https://verixet.com/sitemap.xml` with HTTP 301
- `https://www.verixet.com/robots.txt` -> `https://verixet.com/robots.txt` with HTTP 301

## Verification Gates

| Command | Result |
| --- | --- |
| `npm run verify:canonical-host` | pass |
| `npm run verify:security` | pass exit 0; dependency audit portion still reports moderate advisories |
| `npm run verify:routes` | pass |

## Remaining Issue

No canonical-host issue remains. Dependency advisories are tracked separately in `PHASE2_BASELINE.md`.

