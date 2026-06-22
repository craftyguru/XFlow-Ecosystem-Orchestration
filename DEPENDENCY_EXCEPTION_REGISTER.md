# Dependency Exception Register

Date: 2026-06-18

This register tracks remaining low and moderate dependency advisories after Phase 2 high-severity remediation and Phase 3 CI enforcement.

High-severity status: cleared for all scoped app-root production and full audits, plus AudAix dashboard production and full audits.

Review cadence: every maintenance cycle and before approved production deploys.

Next review date: TBD

## Exception Policy

Accepted exceptions are advisories intentionally allowed for a defined period because the remaining risk is low/moderate, the fix requires a larger compatibility upgrade, or the dependency is dev-only and not part of production runtime.

Deferred work items are advisories that should be remediated once compatible upstream packages, lockfile updates, or framework upgrades are available.

No high or critical advisory is accepted as an exception in this register.

## XFlow

| Field | Value |
| --- | --- |
| Remaining advisories | 4 moderate Next/PostCSS findings |
| Production or dev-only | Requires manual confirmation by advisory |
| Current status | Deferred work |
| Why not fixed now | Phase 2 cleared high-severity findings; remaining moderate findings require compatible framework/package maintenance beyond the high-severity closure scope. |
| Risk rating | Moderate |
| Owner/action | App owner to review framework/PostCSS upgrade path during next maintenance cycle. |
| Blocked by | Compatible upgrade availability and regression testing. |
| Next review date | TBD |

## Verixet

| Field | Value |
| --- | --- |
| Remaining advisories | 2 moderate `swagger-ui-react` to `js-yaml` findings |
| Production or dev-only | Requires manual confirmation by dependency usage |
| Current status | Deferred work |
| Why not fixed now | High-severity audit findings were cleared; remaining moderate Swagger UI chain needs compatibility review. |
| Risk rating | Moderate |
| Owner/action | App owner to review Swagger UI dependency path and route exposure. |
| Blocked by | Compatible dependency update and API documentation regression testing. |
| Next review date | TBD |

## CreVux

| Field | Value |
| --- | --- |
| Remaining advisories | Full audit: 3 low / 17 moderate. Production audit: 2 low / 15 moderate. |
| Production or dev-only | Mixed production and dev dependency findings |
| Current status | Deferred work |
| Why not fixed now | Phase 2 removed high-severity TensorFlow/tar and related findings; remaining low/moderate items require broader package maintenance. |
| Risk rating | Moderate |
| Owner/action | App owner to review production dependency advisories first, then dev-only advisories. |
| Blocked by | Compatible dependency upgrades and media/upload regression testing. |
| Next review date | TBD |

## RatAiFy

| Field | Value |
| --- | --- |
| Remaining advisories | Full audit: 1 low `esbuild` plus 6 moderate `uuid`/storage findings. Production audit: 6 moderate `uuid`/storage findings. |
| Production or dev-only | `esbuild` appears full-audit only; `uuid`/storage findings appear in production audit |
| Current status | Deferred work |
| Why not fixed now | Phase 2 cleared high-severity findings; remaining storage and UUID chain requires compatibility validation. |
| Risk rating | Moderate |
| Owner/action | App owner to review storage dependency chain and scanner/reporting regression tests. |
| Blocked by | Compatible storage package updates and SSRF/report access regression testing. |
| Next review date | TBD |

## AudAix Root

| Field | Value |
| --- | --- |
| Remaining advisories | Full audit: 1 low `esbuild` plus 17 moderate Lighthouse/Sentry/OpenTelemetry findings. Production audit: 17 moderate findings. |
| Production or dev-only | `esbuild` appears full-audit only; observability findings appear in production audit |
| Current status | Deferred work |
| Why not fixed now | High-severity findings were cleared; observability and scanner dependency chains require compatibility review. |
| Risk rating | Moderate |
| Owner/action | App owner to review observability package upgrades and scanner behavior. |
| Blocked by | Compatible Lighthouse/Sentry/OpenTelemetry upgrades and audit/dashboard regression testing. |
| Next review date | TBD |

## AudAix Dashboard

| Field | Value |
| --- | --- |
| Remaining advisories | Full audit: low `@babel/core <=7.29.0`, moderate `js-yaml <=4.1.1`. Production audit: 0 vulnerabilities. |
| Production or dev-only | Recorded as full-audit only; production audit has 0 vulnerabilities |
| Current status | Accepted exception for release readiness; deferred work for maintenance |
| Why not fixed now | Findings are not present in production audit and high-severity status is cleared. |
| Risk rating | Low to moderate |
| Owner/action | App owner to review dashboard build/test dependency updates during maintenance. |
| Blocked by | Compatible dashboard toolchain updates and dashboard regression testing. |
| Next review date | TBD |

## WordGeni

| Field | Value |
| --- | --- |
| Remaining advisories | Full audit: 4 low / 10 moderate. Production audit: 4 low / 8 moderate. |
| Production or dev-only | Mixed production and dev dependency findings |
| Current status | Deferred work |
| Why not fixed now | Phase 2 cleared high-severity findings; remaining low/moderate items require broader package maintenance and export workflow regression testing. |
| Risk rating | Moderate |
| Owner/action | App owner to review production advisories first, then dev-only advisories. |
| Blocked by | Compatible package upgrades and export/download regression testing. |
| Next review date | TBD |

## Release Rule

Before release, each app must continue to pass:

- Production audit at the high threshold.
- Full audit at the high threshold.
- App-specific verifier gates from `SECURITY_RELEASE_CHECKLIST.md`.

Any new high or critical advisory blocks release until remediated or explicitly reviewed outside this exception register.
