# Staging Authenticated Security Harness

Date: 2026-05-10

## Summary

The local authenticated persona harness is clean at 645/645 probes. The staging version must run the same proof against disposable staging apps and a separate disposable staging Supabase project only. It must not touch production app URLs, production Supabase, production users, production Stripe objects, or production secrets.

## Staging Proof Plan

1. Create a separate staging Supabase project or disposable staging reset target.
2. Apply the same Supabase migrations and XFlow runtime migrations used by local proof.
3. Deploy or point all six apps to staging URLs that are clearly non-production.
4. Copy `.env.security-staging.example` to `.env.security-staging`.
5. Fill only staging values and keep local-only bypass flags unset.
6. Run dry-run/preflight first. Do not seed until dry-run passes.
7. Seed disposable personas and mint staging session material into `output/staging/auth-personas.fixture.staging.json`.
8. Run the authenticated simulation.
9. Cleanup disposable fixture users/workspaces after proof.

## Required Staging Env Var Checklist

Required app targets:

- `XFLOW_PROOF_BASE_URL`
- `VERIXET_PROOF_BASE_URL`
- `RATAIFY_PROOF_BASE_URL`
- `AUDAIX_PROOF_BASE_URL`
- `WORDGENI_PROOF_BASE_URL`
- `CREVUX_PROOF_BASE_URL`

Required staging Supabase:

- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` when XFlow credential/session minting needs XFlow runtime migrations or app DB access

Required fixture controls:

- `AUTH_PERSONA_SUPABASE_IS_STAGING=1`
- `AUTH_PERSONA_STAGING_FIXTURES_ARE_DISPOSABLE=1`
- `AUTH_PERSONA_TARGETS_ARE_DISPOSABLE_STAGING=1` only when staging hostnames do not include `staging`, `stage`, `preview`, `dev`, `test`, `qa`, or `sandbox`
- `AUTH_PERSONA_FIXTURE_RUN_ID`
- `AUTH_PERSONA_FIXTURE_OUTPUT_FILE`
- `AUTH_PERSONA_FIXTURES_FILE`

Required XFlow/Auth.js staging runtime values:

- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET`

Optional app-specific proof secrets, if a staging deployment requires them:

- `XFLOW_PROOF_SHARED_SECRET`
- `VERIXET_PROOF_SHARED_SECRET`
- `RATAIFY_PROOF_SHARED_SECRET`
- `AUDAIX_PROOF_SHARED_SECRET`
- `WORDGENI_PROOF_SHARED_SECRET`
- `CREVUX_PROOF_SHARED_SECRET`

## Local-Only Flags That Must Stay Disabled

These must not be set during staging proof unless replaced by a reviewed staging-safe equivalent:

- `RATAIFY_SECURITY_HARNESS`
- `E2E_LOCAL_AUTH`
- `AUDAIX_SECURITY_HARNESS`
- `AUDAIX_LOAD_SECURITY_LOCAL_ENV`
- `XFLOW_SECURITY_HARNESS`
- `WORDGENI_SECURITY_HARNESS`
- `CREVUX_SECURITY_HARNESS`

## Refuse-To-Run Guardrails

The staging dry-run/preflight blocks if:

- `.env.security-staging` is missing.
- Any app URL is missing, localhost, one of the known production domains, invalid, or production-like.
- `SUPABASE_URL` is not staging-looking or not explicitly confirmed with staging flags.
- `SUPABASE_SERVICE_ROLE_KEY` or the anon key is missing.
- `NODE_ENV=production`.
- Local-only bypass flags are set.
- Privileged/destructive mutation probes are enabled without `AUTH_PERSONA_STAGING_ALLOW_DESTRUCTIVE_MUTATIONS=1`.
- Fixture output paths are missing.

The persona setup script also refuses production-like app targets and production-like Supabase URLs. Legacy production fixture override flags are not accepted for fixture mutation.

## Commands

Dry-run, no seeding and no app route calls:

```powershell
npm run security:staging:dry-run
```

Preflight:

```powershell
npm run security:staging:preflight
```

Seed disposable staging personas and mint sessions:

```powershell
npm run security:staging:seed-personas
```

Run the authenticated simulation:

```powershell
npm run security:staging:simulate
```

Cleanup disposable staging fixtures:

```powershell
npm run security:staging:cleanup
```

## Safe Staging Seeding Flow

The seed helper creates disposable fixture users, two disposable workspaces, app access records for all six apps, Verixet-sourced entitlement/subscription states, audit entries, and session material. It writes real bearer/cookie material only to the ignored staging fixture file under `output/staging/`.

It does not create real Stripe customers or mutate production Stripe. Privileged platform mutation probes remain disabled by default.

## Current Status

`npm run security:staging:dry-run` currently blocks because `.env.security-staging` has not been created. This is expected and safe.

## Remaining Risks

- Staging proof still depends on a real disposable staging Supabase/project and six staging app URLs.
- If staging hostnames do not look like staging, `AUTH_PERSONA_TARGETS_ARE_DISPOSABLE_STAGING=1` must be set intentionally.
- The staging service-role key must be isolated to the staging Supabase project. The scripts redact but cannot cryptographically prove project ownership from the key alone.
- Destructive privileged mutation proof remains disabled unless a disposable staging target is explicitly confirmed.
