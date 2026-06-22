# Shared package de-vendor plan

## Inventory

| Package | Canonical source | Matching copies | Divergent copies | Initial action |
| --- | --- | --- | --- | --- |
| `@xflow-ecosystem/ecosystem-showcase` | `packages/ecosystem-showcase` | `apps/RatAiFy/packages/ecosystem-showcase`, `apps/RatAiFy/vendor/ecosystem-showcase`, `apps/Verixet/vendor/ecosystem-showcase`, `apps/AudAix/packages/ecosystem-showcase`, `apps/AudAix/dashboard/vendor/ecosystem-showcase`, `apps/CreVux/artifacts/image-gen/vendor/ecosystem-showcase` | `apps/XFlow/vendor/ecosystem-showcase`, `apps/WordGeni/apps/web/vendor/ecosystem-showcase` | Matching copies migrated; keep divergent copies temporary until diff is reviewed. |
| `@xflow-ecosystem/ecosystem-assistant` | `packages/ecosystem-assistant` | `apps/RatAiFy/packages/ecosystem-assistant`, `apps/RatAiFy/vendor/ecosystem-assistant`, `apps/Verixet/vendor/ecosystem-assistant`, `apps/AudAix/packages/ecosystem-assistant`, `apps/AudAix/dashboard/vendor/ecosystem-assistant`, `apps/CreVux/packages/ecosystem-assistant` | `apps/XFlow/vendor/ecosystem-assistant`, `apps/WordGeni/packages/ecosystem-assistant` | Matching copies migrated; XFlow and WordGeni require API-delta review. |
| `@xflow-ecosystem/ecosystem-assistant-ui` | `packages/ecosystem-assistant-ui` | `apps/RatAiFy/packages/ecosystem-assistant-ui`, `apps/RatAiFy/vendor/ecosystem-assistant-ui`, `apps/Verixet/vendor/ecosystem-assistant-ui`, `apps/AudAix/packages/ecosystem-assistant-ui`, `apps/AudAix/dashboard/vendor/ecosystem-assistant-ui`, `apps/CreVux/packages/ecosystem-assistant-ui` | `apps/WordGeni/packages/ecosystem-assistant-ui` | Matching copies migrated; WordGeni remains intentionally held with its assistant API delta. |
| `@xflow-ecosystem/supabase` | `packages/ecosystem-supabase` | `apps/AudAix/vendor/ecosystem-supabase`, `apps/CreVux/packages/ecosystem-supabase`, `apps/Verixet/vendor/ecosystem-supabase` | `apps/RatAiFy/vendor/ecosystem-supabase`, `apps/XFlow/vendor/ecosystem-supabase`, `apps/WordGeni/packages/ecosystem-supabase`, release snapshots | Defer; this package has real source divergence and database/runtime risk. |

## Risk Plan

1. Migrate only byte-identical or API-equivalent package copies first.
2. Keep divergent packages in place until their source diff is reviewed and reconciled.
3. Update dependency declarations, TypeScript paths, Vite/Vitest aliases, Docker build context, and lockfiles with each migration.
4. Remove the vendored package directory only after the consumer resolves through the canonical package and local verification passes.
5. Treat `@xflow-ecosystem/supabase` as the highest-risk migration because it affects env loading, service-role boundaries, and database clients.

## Pilot

The pilot migration is `@xflow-ecosystem/ecosystem-showcase` for RatAiFy, Verixet, AudAiX dashboard, and CreVux image-gen. XFlow and WordGeni keep their current vendored showcase packages temporarily because their built artifacts differ from the canonical package.

## De-vendor Result

The byte-identical package copies now resolve from the root `packages/*` release units:

- `apps/RatAiFy`
- `apps/Verixet`
- `apps/AudAix/dashboard`
- `apps/CreVux/artifacts/image-gen`

The old package directories were removed from those consumers:

- `apps/RatAiFy/packages/ecosystem-assistant`
- `apps/RatAiFy/packages/ecosystem-assistant-ui`
- `apps/RatAiFy/packages/ecosystem-showcase`
- `apps/RatAiFy/vendor/ecosystem-assistant`
- `apps/RatAiFy/vendor/ecosystem-assistant-ui`
- `apps/RatAiFy/vendor/ecosystem-showcase`
- `apps/Verixet/vendor/ecosystem-assistant`
- `apps/Verixet/vendor/ecosystem-assistant-ui`
- `apps/Verixet/vendor/ecosystem-showcase`
- `apps/AudAix/dashboard/vendor/ecosystem-assistant`
- `apps/AudAix/dashboard/vendor/ecosystem-assistant-ui`
- `apps/AudAix/packages/ecosystem-assistant`
- `apps/AudAix/packages/ecosystem-assistant-ui`
- `apps/AudAix/packages/ecosystem-showcase`
- `apps/AudAix/dashboard/vendor/ecosystem-showcase`
- `apps/CreVux/packages/ecosystem-assistant`
- `apps/CreVux/packages/ecosystem-assistant-ui`
- `apps/CreVux/artifacts/image-gen/vendor/ecosystem-showcase`

Remaining vendor references are intentional temporary hold points until source divergence is reconciled:

| Package | Temporary paths | Reason held |
| --- | --- | --- |
| `@xflow-ecosystem/ecosystem-showcase` | `apps/XFlow/vendor/ecosystem-showcase`, `apps/WordGeni/apps/web/vendor/ecosystem-showcase` | Built artifacts differ from the canonical package and need a diff review before replacement. |
| `@xflow-ecosystem/ecosystem-assistant` | `apps/XFlow/vendor/ecosystem-assistant`, `apps/WordGeni/packages/ecosystem-assistant` | These copies diverge from the canonical source and need an API-delta reconciliation pass. |
| `@xflow-ecosystem/ecosystem-assistant-ui` | `apps/WordGeni/packages/ecosystem-assistant-ui` | Held with WordGeni assistant because it depends on the local assistant delta. |
| `@xflow-ecosystem/supabase` | `apps/RatAiFy/vendor/ecosystem-supabase`, `apps/Verixet/vendor/ecosystem-supabase`, `apps/AudAix/vendor/ecosystem-supabase`, `apps/XFlow/vendor/ecosystem-supabase`, `apps/WordGeni/packages/ecosystem-supabase`, `apps/CreVux/packages/ecosystem-supabase`, release snapshots | Highest-risk package: source divergence touches env loading, service-role boundaries, database clients, and runtime auth assumptions. |
| `@xflow-ecosystem/contracts` | `apps/RatAiFy/vendor/ecosystem-contracts`, `apps/Verixet/vendor/ecosystem-contracts`, `apps/XFlow/vendor/ecosystem-contracts` | Imported by billing/entitlement clients; should move after contract compatibility is checked across Verixet and XFlow. |

Validation:

- `npm run validate:shared-package-devendor`
- `npm run build:shared-packages`
- `npm run validate:shared-package-release-units`
