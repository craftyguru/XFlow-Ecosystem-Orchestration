# Shared Supabase Production Env Matrix

This matrix documents production variable names only. Do not print values. Do not commit real secrets.

Service-role keys and database URLs are server-only. They must never appear in `NEXT_PUBLIC_*`, `VITE_*`, browser bundles, client-side config, or public logs.

## Shared Server Env Vars

All deployed server services that write to shared Supabase need these server-only values when their production dual-write rollout is approved:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

Browser/client public values are framework-specific and may only use anon credentials with RLS:

- Next.js: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vite: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Do not set these publicly:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Any public env var containing `SERVICE_ROLE`
- Any public env var containing `DATABASE_URL` or `DIRECT_DATABASE_URL`

## Verixet

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | Use framework-specific public anon vars only if Verixet browser auth requires them |
| Runtime flags | `VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `VERIXET_SHARED_SUPABASE_READ_MODE=dual_compare`, `VERIXET_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | Stripe test/live envs as appropriate for the deployed environment, Verixet authority DB envs, webhook secrets |
| Railway/service location | Verixet Railway service variables |
| Must not be public | Service-role keys, database URLs, Stripe secrets, webhook secrets |

## XFlow

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | Use framework-specific public anon vars only if XFlow browser auth requires them |
| Runtime flags | `XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `XFLOW_SHARED_SUPABASE_READ_MODE=dual_compare`, `XFLOW_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | XFlow OAuth/social credentials, ecosystem auth issuer/token/userinfo settings, state/session secrets |
| Railway/service location | XFlow Railway service variables |
| Must not be public | Service-role keys, database URLs, OAuth client secrets, session secrets |

## AudAiX

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or Vite equivalents only if used by AudAiX browser code |
| Runtime flags | `AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `AUDAIX_SHARED_SUPABASE_READ_MODE=dual_compare`, `AUDAIX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | Verixet usage admission URL/token, XFlow auth URLs, MFA/session settings, report storage config |
| Railway/service location | AudAiX Railway service variables |
| Must not be public | Service-role keys, database URLs, Verixet tokens, session/MFA secrets |

## Rataify

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | Vite public anon vars only if used by Rataify browser code |
| Runtime flags | `RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `RATAIFY_SHARED_SUPABASE_READ_MODE=dual_compare`, `RATAIFY_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | XFlow auth URLs, Verixet usage/entitlement settings, evidence storage config, legacy DB envs |
| Railway/service location | Rataify Railway service variables |
| Must not be public | Service-role keys, database URLs, auth state/session secrets |

## WordGeni

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | Framework-specific public anon vars only if used by WordGeni browser code |
| Runtime flags | `WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `WORDGENI_SHARED_SUPABASE_READ_MODE=dual_compare`, `WORDGENI_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | XFlow auth URLs, Verixet billing gate settings, worker config, source/storage config, API auth settings |
| Railway/service location | WordGeni Railway service variables |
| Must not be public | Service-role keys, database URLs, worker secrets, API keys |

## Crevux

| Category | Vars |
| --- | --- |
| Supabase server | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Public Supabase | Framework-specific public anon vars only if used by Crevux browser code |
| Runtime flags | `CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED=true`, `CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED=true`, `CREVUX_SHARED_SUPABASE_READ_MODE=dual_compare`, `CREVUX_SHARED_SUPABASE_FAIL_CLOSED=false` |
| App-specific envs | XFlow auth URLs, Verixet credit/usage settings, provider settings, storage settings, API/web service URLs |
| Railway/service location | Crevux Railway web/API/image-gen service variables |
| Must not be public | Service-role keys, database URLs, provider keys, Stripe secrets, webhook secrets |
