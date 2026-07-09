# Workspace Provider and Billing Proof Plan

Date: 2026-07-06

Scope: planning only for provider, billing, entitlement, OAuth/connectivity, deployment, scan/audit/audio/AI, webhook, and control-plane proof across XFlow, CreVux, WordGeni, RatAiFy, AudAix, and Verixet.

This document is not proof execution. It does not start servers, create users, seed databases, call providers, call Stripe or other billing systems, call deployment services, touch staging or production, execute OAuth/connectivity proof, run live scan/audit/audio/AI jobs, send email/SMS, or execute mutations.

## Proof Order

1. Confirm local proof baseline is green.
2. Prepare disposable fixtures and approval packet.
3. Run read-only provider or billing checks only after explicit approval.
4. Run mutation or write proof only in a disposable approved environment with rollback.

## App Plan

| App | External proof needed | Prerequisites | Stop condition |
| --- | --- | --- | --- |
| XFlow | Provider authority, staged smoke, Verixet OAuth, Stripe billing readiness, deployment credential handling | approved environment, disposable workspace, operator approval, redaction evidence, rollback plan | any command needs production/staging/provider/billing/deployment credentials without approval |
| CreVux | OpenAI/media providers, Stripe webhook/test billing, Railway/deploy parity, Supabase runtime | test provider keys, test Stripe objects, local fixture account, deploy target approval | any script attempts hosted CreVux, Railway, Stripe, OpenAI, Supabase runtime, or mutation without approval |
| WordGeni | AI provider, export provider, Stripe proof, Railway deploy proof, live API health | provider-safe fixtures, test billing catalog, deployment URLs, worker queue safety | any pnpm path tries install/purge or any script calls live/prod/provider/billing systems |
| RatAiFy | Connected apps, control-plane proof, scan provider, billing/entitlement, staging proof | disposable org/site, scan-safe target, approved connected-app tokens, billing fixtures | any live SEO/control-plane/staging/bootstrap script attempts external network or writes |
| AudAix | Supabase runtime, audit/scan workers, Stripe billing, XFlow/Verixet/RatAiFy connectors, staging/admin proof | disposable workspace/site, scan-safe target, connector-safe credentials, billing fixtures | any smoke/proof script attempts Supabase/provider/billing/scan/staging execution |
| Verixet | Stripe catalog/billing, entitlement authority, OAuth/connectivity, webhooks, deployment/staging, provider adapters | test Stripe catalog, disposable workspace, entitlement fixture, OAuth callback target, rollback | any billing execute/apply/sync, staging, post-deploy, OAuth, webhook, or mutation command is about to run |

## Safe Local Validations

- `npm run verify:workspace-auth-read-fixtures`
- `npm run verify:workspace-api-redaction`
- app-level local proof verifiers
- typechecks already proven local-safe
- `git diff --check`
- `npm run verify:workspace-provider-billing-plan`

## Avoid For Now

- more XFlow-only proof
- provider proof execution
- production/staging smoke
- Stripe or billing authority proof
- deployment proof
- OAuth/connectivity proof
- mutation success proof
- broad refactors

## Definition Of Done

This package is done when every app has a documented external-proof prerequisite list, unsafe scripts remain explicitly classified, local verifiers still pass, and the next human decision is an approval packet rather than another local proof chain.
