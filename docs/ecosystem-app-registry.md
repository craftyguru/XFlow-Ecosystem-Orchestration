# Ecosystem App Registry

Date: 2026-05-04

This is the human-readable companion to `ecosystem-contracts/apps.json`. Canonical app slugs are lowercase and stable. Legacy aliases are documentation-only and must not be used as new canonical values.

| App display name | Canonical app slug | Package/repo folder name | Domain | Primary authority role | Depends on XFlow | Depends on Verixet | Owns billing | Owns identity | Owns usage metering | Allowed token types | Legacy alias notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XFlow | `xflow` | `apps/XFlow` | Control plane / identity / app hub | OAuth identity, app linking, UCL routing, event routing | No | Yes | No | Yes | No | `control_plane_service_token`, `ucl_connection_token`, `oauth_access_token`, `oauth_client_secret`, `verixet_usage_ingest_token` | `XFlow` and `XFlowX` are aliases only |
| Verixet | `verixet` | `apps/Verixet` | Billing / governance | Stripe, billing, entitlements, usage authority | Yes | No | Yes | No | Yes | `control_plane_service_token`, `stripe_secret_key`, `stripe_webhook_secret`, `turnstile_secret_key`, `db_connection_string`, `sendgrid_api_key` | `Verixet` casing is display-only |
| AudAiX | `audaix` | `apps/AudAix` | Audit / monitoring | Audit and improvement workflows | Yes | Yes | No | No | No | `control_plane_service_token`, `ucl_connection_token`, `verixet_usage_ingest_token`, `turnstile_secret_key`, `db_connection_string`, `sendgrid_api_key` | `AudAiX` and `AudAix` are aliases only |
| RatAiFy | `rataify` | `apps/RatAiFy` | Trust / reviews / risk | Trust, reviews, risk, reputation workflows | Yes | Yes | No | No | No | `control_plane_service_token`, `ucl_connection_token`, `verixet_usage_ingest_token`, `turnstile_secret_key`, `db_connection_string`, `sendgrid_api_key` | `RatAiFy` and `Rataify` are aliases only |
| WordGeni | `wordgeni` | `apps/WordGeni` | Writing intelligence | Writing workflows and Crevux companion requests | Yes | Yes | No | No | No | `control_plane_service_token`, `oauth_access_token`, `db_connection_string`, `sentry_dsn` | `WordGeni` is canonical; historical `@writexet/*` package-scope aliases have been migrated to `@wordgeni/*` |
| Crevux | `crevux` | `apps/CreVux` | AI media studio | Media generation and studio workflows | Yes | Yes | No | No | No | `control_plane_service_token`, `verixet_usage_ingest_token`, `db_connection_string`, `jwt_secret`, `media_download_signing_secret`, `sentry_dsn` | `CreVux`, `Crevux`, `workspace`, and `@workspace/*` are aliases only |

## Rules

- New code, docs, route bodies, usage events, and billing references should use the canonical lowercase slug.
- Display names may preserve product casing.
- Existing aliases can remain for backward compatibility only when documented and covered by tests.
- Verixet is the only canonical ecosystem billing, entitlement, and usage authority.
- XFlow is the only canonical ecosystem OAuth identity, app linking, UCL, and control-plane authority.
