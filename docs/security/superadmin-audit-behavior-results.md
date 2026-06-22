# Superadmin Audit Behavior Results

Date: 2026-05-10

## Summary

The harness supports superadmin/platform-owner read probes and deliberately blocks privileged mutations unless `AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS=1` is set for disposable staging.

The fixture helper recognizes `AUTH_PERSONA_SUPERADMIN_*` and `AUTH_PERSONA_PLATFORM_OWNER_*` inputs and can seed a disposable superadmin persona in local/staging. No such fixture was present in the current environment, and seed/mint refused production-like targets.

## Current Result

| Test class | Result |
| --- | --- |
| Normal users denied superadmin/platform | Blocked live: no normal-user session fixture supplied. Existing local/proof tests remain the current evidence. |
| Superadmin read access | Blocked live: no superadmin session fixture supplied. |
| Platform mutation audit log proof | Not executed live by default to avoid destructive production mutation. |
| MFA/freshness proof | Existing app-local tests/proofs only; no live superadmin MFA fixture supplied. |

## Findings

No superadmin bypass was observed in unauthenticated probes. Live authenticated superadmin behavior remains unproved until a disposable staging platform-owner account with MFA/freshness can be used.

No platform mutation was attempted because this environment points at production-like proof URLs and `AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS=1` was not set.

## Remaining Recommended Work

Create a staging-only platform owner with MFA/passkey configured. Run read probes first, then enable audited non-destructive mutation probes only on disposable staging resources.
