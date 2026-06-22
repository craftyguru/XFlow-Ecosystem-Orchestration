# Superadmin Behavior Results

Date: 2026-05-10

## Summary

Probed superadmin, super-admin, platform, internal, and admin API classes without credentials and with forged client-side role headers/body claims.

## Live Results

| Class | Result |
| --- | --- |
| XFlow superadmin/platform/internal route probes | Denied, redirected, or safe not-found. |
| Verixet platform/internal/admin route probes | Denied, safe not-found, or safe deprecated response. |
| RatAiFy superadmin/admin route probes | Denied or safe not-found. |
| WordGeni admin/local-auth sensitive routes | Denied, redirected, or safe deprecation response. |
| AudAiX reserved superadmin/platform/internal page paths | Public SPA fallback returned 200; source fixed to 404. |
| CreVux reserved superadmin/platform/internal page paths | Public SPA fallback returned 200; source fixed to 404. |
| Forged `superadmin` role headers/body on API POST probes | No successful privileged mutation observed. |

## Audit Logging

Existing XFlow `verify:ci` passed audit mutation coverage, audit event schema, deny coverage, API correlation, and actor provenance checks after the prior release-gate fixes.

## Remaining Risk

No live superadmin/platform-owner account was used for mutation proof. This was intentional to avoid destructive production operations. A staging superadmin fixture should be used next to verify successful privileged actions produce audit logs and require MFA freshness where supported.
