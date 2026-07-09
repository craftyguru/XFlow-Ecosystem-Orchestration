# Workspace External Proof Approval Packet

Date: 2026-07-06

Scope: approval packet only for future external provider, billing, entitlement, OAuth/connectivity, deployment, scan/audit/audio/AI, webhook, and control-plane proof across XFlow, CreVux, WordGeni, RatAiFy, AudAix, and Verixet.

Default decision: NO-GO.

This packet does not execute proof. It does not start servers, create users, seed databases, call providers, call Stripe or billing systems, call deployment services, touch staging or production, execute OAuth/connectivity proof, send email/SMS, run scan/audit/audio/AI jobs, or execute mutations.

## Required Approval Fields

Before any external proof can run, an operator must provide all of the following in a separate approval update:

- exact app and proof surface;
- exact command to run;
- exact environment name and base URL;
- confirmation that the target is disposable or approved for proof;
- credential references only, never raw secret values;
- expected read/write behavior;
- rollback or cleanup owner;
- redaction and evidence path;
- maximum allowed blast radius;
- stop condition;
- timestamped operator approval.

## Candidate Proof Lanes

| Lane | Apps | Default | Allowed only after approval |
| --- | --- | --- | --- |
| Read-only provider status | XFlow, CreVux, WordGeni, RatAiFy, AudAix, Verixet | NO-GO | Provider-safe read-only checks against approved fixtures or sandbox accounts |
| Billing/Stripe authority | XFlow, CreVux, WordGeni, RatAiFy, AudAix, Verixet | NO-GO | Test-mode catalog, webhook, entitlement, and portal checks with explicit billing owner approval |
| OAuth/connectivity | XFlow, RatAiFy, AudAix, Verixet | NO-GO | Disposable OAuth client/callback proof with revocation/cleanup |
| Deployment/staging | XFlow, CreVux, WordGeni, RatAiFy, AudAix, Verixet | NO-GO | Approved staging or disposable deployment smoke with exact URLs |
| Scan/audit/audio/AI jobs | CreVux, WordGeni, RatAiFy, AudAix, Verixet | NO-GO | Provider-safe test jobs with spend limits and no customer data |
| Mutations/write proof | All apps | NO-GO | Separate disposable mutation plan with rollback and audit proof |

## Current Decision

No lane is approved. All external-proof candidates remain blocked until the missing approval fields are supplied.

## Stop Line

Stop immediately if a command would contact production, staging, a provider, billing/payment systems, deployment services, OAuth/connectivity targets, email/SMS, scan/audit/audio/AI providers, connected-app services, or would execute a mutation without an explicit approval update.

