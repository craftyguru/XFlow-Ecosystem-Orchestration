# Ecosystem Contract Package

Date: 2026-05-04

Package: `@xflow-ecosystem/contracts`

Location: `packages/ecosystem-contracts`

This package is generated from the root machine-readable contract registries:

- `ecosystem-contracts/apps.json`
- `ecosystem-contracts/env-contract.json`
- `ecosystem-contracts/routes.json`
- `ecosystem-contracts/token-types.json`

## Purpose

The package gives the six apps one importable source for:

- canonical lowercase app slugs
- app metadata and authority boundaries
- env contract rows
- cross-app route contracts
- token type rules
- helper functions for app, env, and route lookup

It does not contain real secrets, provider values, or deployment-specific env values.

## Generate

Run from the ecosystem root:

```bash
node scripts/generate-ecosystem-contract-package.mjs
```

Then validate:

```bash
node scripts/validate-ecosystem-contracts.mjs
```

## Typecheck

Until the root becomes a real workspace, use an already-installed TypeScript binary from an app dependency tree:

```bash
node apps/AudAix/dashboard/node_modules/typescript/bin/tsc -p packages/ecosystem-contracts/tsconfig.json --noEmit
```

Do not install root dependencies just for this package until a root package-manager decision is made.

## Adoption Rule

Apps should adopt this package in focused Phase 2 slices. Do not mass-rewrite app runtime code. Start with tests, docs, constants, and non-auth/non-billing consumers before touching production route/auth/billing flows.
