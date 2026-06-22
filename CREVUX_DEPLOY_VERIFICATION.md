# CreVux Deploy Verification

Date: 2026-06-17
App: `apps\CreVux`
Target commit: `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`
Scope: verification only. No source changes, migrations, secret rotation, artifact deletion, deploy command, commit, or push.

## Result

The stale-live-deployment exception is cleared.

`pnpm run verify:routes` passed against live `https://crevux.com`.

## Local Repo State

- `git status --short`: clean before verification and clean after verification.
- Branch: `main`
- Head: `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`
- Recent commits observed:
  - `ead7a6b security(crevux): harden media uploads and ffmpeg health access`
  - `f036b16 Preserve UUID active workspace sessions`
  - `c986bc8 Support UUID ecosystem workspace mappings`
  - `dfe110b Build web client from API build`
  - `5f3af32 Expose frontend static health diagnostic`

## Commands Run

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\CreVux"
git status --short
git log --oneline -n 5
pnpm run verify:routes
pnpm run verify:security
pnpm run verify:env
```

## Live Route Result

From `pnpm run verify:routes` / `audit:deploy-parity`:

- Base URL: `https://crevux.com`
- Expected commit: `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`
- Live `/api/healthz` build commit: `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`
- Live `/api/healthz` branch: `main`
- Live deployment ID: `0a2cda95-aaf8-4351-8a62-684eef9c992d`
- Live build time: `2026-06-17T19:40:06.267Z`
- `/api/healthz/ffmpeg`: unauthenticated 401, typed JSON
- Generic public `/api/healthz`: 200 typed JSON
- Route verifier passed 44 checks and failed 0 checks.
- No secret leak was reported by the route verifier.
- No stale WordGeni metadata was reported by the route verifier.

## Verification Gates

| Command | Result |
| --- | --- |
| `pnpm run verify:routes` | pass |
| `pnpm run verify:security` | pass |
| `pnpm run verify:env` | pass |

## Remaining Deploy/Cache Issue

None observed in this verification run.

