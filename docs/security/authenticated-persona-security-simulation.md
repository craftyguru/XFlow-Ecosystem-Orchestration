# Authenticated Persona Security Simulation

Date: 2026-05-10

## Summary

Added `scripts/authenticated-persona-security-simulation.mjs` as the repeatable harness for authenticated role-boundary proof across XFlow, Verixet, RatAiFy, AudAiX, WordGeni, and CreVux.

The harness is intentionally fixture-driven. It accepts persona bearer tokens or cookies only through environment variables or `AUTH_PERSONA_FIXTURES_FILE`, redacts auth material from output, sends no-cache probes, and avoids destructive privileged mutations unless `AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS=1` is explicitly set for disposable staging.

2026-05-10 fixture update:

- Added aliases for the requested env contract, including `AUTH_PERSONA_NORMAL_*`, `AUTH_PERSONA_EXPIRED_*`, `AUTH_PERSONA_CANCELED_*`, and `AUTH_PERSONA_CROSS_WORKSPACE_*`.
- Added optional app-specific fixture overrides, for example `AUTH_PERSONA_NORMAL_XFLOW_COOKIE`.
- Added `scripts/setup-staging-security-personas.mjs` to produce a redacted fixture readiness summary, write an ignored local fixture template, and seed/mint local/staging personas when explicitly allowed.

Current artifacts:

- `output/authenticated-persona-security-simulation-2026-05-10.json`
- `output/authenticated-persona-fixture-setup-summary-2026-05-10.json`
- `output/dev/auth-personas.fixture.local.json` (ignored local template)

## Existing Helpers Reused Or Mapped

| Area | Existing helper or test source | Use |
| --- | --- | --- |
| Root proof | `scripts/proof-production.mjs` | Confirms auth/billing/RLS proof suite remains green. |
| Live direct-access | `scripts/live-attack-simulation.mjs` | Baseline unauthenticated/direct-access proof. |
| Shared Supabase access seed | `scripts/seed-phase6d-test-access.mjs` | Existing local/staging-safe seed pattern for shared Supabase workspace/app access. |
| Supabase RLS | `scripts/validate-rls-proof.mjs` | Static proof now; DB execution requires `RUN_RLS_DB_TESTS=1`. |
| CreVux smoke users | `apps/CreVux/scripts/smoke-authenticated-beta.mjs` and `artifacts/api-server/scripts/create-smoke-users.ts` | Reusable local/staging auth smoke pattern. |
| RatAiFy tenants | `apps/RatAiFy/tests/lib/multitenantIntegrationFixture.ts` | Reusable two-tenant isolation fixture pattern. |
| Verixet auth/admin | `apps/Verixet/scripts/create-test-auth-user.ts`, route tests under `src/app/api/**` | Reusable local/staging fixture and route proof patterns. |
| App RBAC tests | Existing app-level tests in XFlow, Verixet, RatAiFy, AudAiX, WordGeni, CreVux | Local server-side proof remains source of coverage until live persona sessions are supplied. |

## Fixture Inputs

For each persona, provide either:

- `AUTH_PERSONA_<PERSONA>_BEARER`
- `AUTH_PERSONA_<PERSONA>_COOKIE`
- or a JSON file via `AUTH_PERSONA_FIXTURES_FILE`

The preferred persona prefixes are:

`NORMAL`, `WORKSPACE_ADMIN`, `APP_ADMIN`, `SUPPORT_ADMIN`, `SECURITY_ADMIN`, `SUPERADMIN`, `EXPIRED`, `CANCELED`, and `CROSS_WORKSPACE`.

Optional scoping inputs:

- `AUTH_PERSONA_<PERSONA>_WORKSPACE_ID`
- `AUTH_PERSONA_<PERSONA>_FOREIGN_WORKSPACE_ID`
- `AUTH_PERSONA_<PERSONA>_APP_SLUG`

The fixture file also supports per-app credential overrides under `apps.xflow`, `apps.verixet`, `apps.rataify`, `apps.audaix`, `apps.wordgeni`, and `apps.crevux`.

No token, cookie, password, or secret value is printed in reports.

## Current Run

| Metric | Count |
| --- | ---: |
| Executed probes | 645 |
| Passed | 645 |
| Failed | 0 |
| Blocked persona classes | 0 |

The local harness now uses local Supabase and all six local app ports. Disposable local personas were seeded, XFlow cookies and per-app fixture sessions were minted into the ignored local fixture file, and all authenticated persona probes passed.

## Verification Commands Run

- `node --check scripts/authenticated-persona-security-simulation.mjs` - passed.
- `node --check scripts/setup-staging-security-personas.mjs` - passed.
- `node --check scripts/security-local-harness-preflight.mjs` - passed.
- `node --test scripts/authenticated-persona-security-simulation.route-map.test.mjs` - passed 8/8.
- `npm --prefix apps/XFlow run db:migrate` - passed against local Supabase.
- `npm run security:local:preflight` - passed.
- `npm run security:local:seed-personas` - passed with 0 blocked persona session writes.
- `node scripts/authenticated-persona-security-simulation.mjs` - passed 645/645 with 0 blocked.
- `node scripts/live-attack-simulation.mjs` - passed 270/270.
- `npm run proof:production` - passed 10/10.
- `npm run supabase:validate` - passed static RLS proof.

## Remaining Recommended Work

Repeat the same run against a separate disposable staging target. Do not use production customer accounts or production Supabase.
