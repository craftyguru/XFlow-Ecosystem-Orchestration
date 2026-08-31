# MOBILE-0 — Architecture and contracts

- Status: PASS/CLOSED
- Owner: Codex
- Repository: XFlow Ecosystem Orchestration
- Branch: `codex/mobile-0-architecture-contracts`
- Intended base SHA: `bfd341c6052390877a2199a7694090f08d81b2c4`
- Parent phase: none

## Objective

Lock the product boundary, trust model, ownership, mobile API v1 semantics, security invariants, and bounded MOBILE-1–9 roadmap before runtime implementation.

## Problem statement

Crevux has useful mobile and image-pipeline components, but authentication, persistence, job durability, billing authority, native Android integration, and version lineage are not yet one production-safe mobile contract.

## In scope

- Root-owned architecture and API contract documentation.
- A checked Crevux mobile v1 JSON contract and framework-neutral TypeScript exports.
- Contract validation/tests.
- MOBILE-1–9 phase specifications and roadmap index.

## Out of scope

App runtime code, OAuth registration, Android project/native modules, schemas/migrations, providers, production services, dependencies, CI, deployment, MOBILE-1, commits, pushes, and merges.

## Product contract

Shared mobile foundation with separately delivered apps; Crevux first; Expo/React Native retained with Kotlin where required; XFlow owns identity; Verixet owns billing/entitlements/usage; Crevux owns projects/media/editing/jobs/providers; `/api/mobile/v1` is the future boundary; no Fold8 S Pen claim.

## Acceptance criteria

- Current behavior and target behavior are explicitly separated.
- API operations, authorization, UUID/workspace ownership, idempotency, errors, lineage, cancellation, retention, export, and authority boundaries are specified.
- Contracts prohibit secrets in the APK and unproven provider/Samsung/S Pen claims.
- Shared contracts typecheck/build and validators/tests pass.
- Nested app repositories and rejected checkpoint remain unchanged.
- Architecture/security owner reviews the produced contract before PASS.

## Automated verification

- `node scripts/dev-workflow/inspect-repo.mjs`
- `node scripts/validate-ecosystem-contracts.mjs`
- `npm run validate:ecosystem-contracts`
- `node --test scripts/crevux-mobile-contract.test.mjs`
- `npm --prefix packages/ecosystem-contracts run typecheck`
- `npm --prefix packages/ecosystem-contracts run build`

Root lint, generic test, and generic build commands do not exist and must not be invented.

## Manual verification

Architecture/security owner confirms the trust boundaries, endpoint semantics, retention decision placeholders, and phase boundaries. No device proof is required in MOBILE-0.

## Risks and rollback

Risk: a documentation contract can drift before runtime work. Each later phase must consume the shared contract and add conformance tests. Rollback is a root-only revert of MOBILE-0 files; there is no runtime or data rollback.

## Closeout requirements

Record exact validation outcomes, review evidence, repository status, changed files, and confirmation that no app/runtime/schema/dependency/production action occurred. Without owner review, final status remains MANUAL VERIFICATION REQUIRED.
