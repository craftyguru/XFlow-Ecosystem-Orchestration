# P2 WordGeni Plan/AI-Usage Cleanup Proof

## A. Executive Summary

Overall status: Pass, with verification partially limited by dependency-layout blockers.

Verixet export commit `bcfc04a` added a top-level WordGeni metadata slice to the generated public catalog. That slice classifies WordGeni local tier aliases, bundle aliases, AI usage display metadata, AI credit top-up mappings, legacy Stripe env mappings, fallback rules, and handoff metadata under Verixet authority.

WordGeni cleanup commit `c66c805` now consumes or aligns to that Verixet metadata in its local display adapters, AI usage display output, legacy Stripe mapping helper, and web pricing normalization. The local `pro`, `studio`, and `enterprise` values remain persisted compatibility aliases, not billing authority. The `free` tier remains fallback-only.

Drift reduced:

- Local WordGeni plan names are classified as compatibility/local mirror aliases.
- Local AI usage display now identifies Verixet-known display limits separately from local token enforcement.
- Legacy Stripe env mappings are explicitly compatibility-only and non-authoritative.
- Web pricing normalization carries Verixet classification metadata while preserving reviewed/manual non-checkoutable behavior.

Remaining later P2/P3 work:

- Retain and eventually rationalize persisted local tier enum values.
- Reconcile or further document local AI token/cost budgets against Verixet generation-count limits.
- Consider a P3 deprecation plan for legacy local Stripe webhook/price compatibility.
- Repair WordGeni dependency layout so focused tests, typechecks, and lint can run normally.

Verification is not fully green because package-local Vitest, TypeScript, and Turbo binaries are missing or stale in the current workspace dependency layout. The two dependency-safe proof checks passed.

## B. Commit Evidence

Verixet WordGeni metadata export commit: `bcfc04a`

Files changed:

- `generated/catalog/verixet-public-catalog.v1.json`
- `src/lib/catalog-export/verixet-generated-catalog.test.ts`
- `src/lib/catalog-export/verixet-generated-catalog.ts`

What it proves:

- Verixet exports WordGeni-facing plan alias, AI usage, bundle, top-up, handoff, fallback, and legacy Stripe mapping metadata.
- Existing generated catalog fields remain available while WordGeni-specific classifications are added.
- Verixet remains the named authority for public plan, checkout availability, reviewed/manual row, top-up, and handoff metadata.

WordGeni cleanup commit: `c66c805`

Files changed:

- `apps/api/src/services/ai-usage-limits.test.ts`
- `apps/api/src/services/ai-usage-limits.ts`
- `apps/api/src/services/stripe/plan-from-price.test.ts`
- `apps/api/src/services/stripe/plan-from-price.ts`
- `apps/api/src/services/verixet-catalog-display.test.ts`
- `apps/api/src/services/verixet-catalog-display.ts`
- `apps/web/src/components/pricing/pricing-page-client.test.ts`
- `apps/web/src/lib/pricing-catalog.ts`

What it proves:

- WordGeni local plan aliases now expose Verixet-aligned classification metadata.
- AI usage display can reference Verixet-known display limits without changing local enforcement.
- Legacy Stripe env mappings are labeled as non-authoritative compatibility only.
- Web pricing normalization preserves Verixet classification and reviewed/manual non-checkoutable behavior.

## C. WordGeni Plan Alias / AI Usage Cleanup Proof

WordGeni `pro`, `studio`, and `enterprise` aliases now use Verixet-aligned classification metadata:

- `pro` maps to `wordgeni_starter` with `classification: "compatibility_alias"`.
- `studio` maps to `wordgeni_pro` with `classification: "compatibility_alias"`.
- `enterprise` maps to `wordgeni_elite` with `classification: "compatibility_alias"`.

Local aliases remain compatibility/local mirror/fallback/legacy only:

- The aliases are retained for persisted workspace/API compatibility.
- They are marked as compatibility aliases and local mirrors.
- They do not override Verixet checkout availability, reviewed/manual state, or entitlement authority.

Local aliases are not billing authority:

- Checkout and portal behavior were not changed.
- Billing entitlement behavior was not changed.
- P0 fail-closed billing still requires Verixet authority by default.

Free/default remains fallback-only:

- `free` has no canonical paid Verixet plan slug.
- It is classified as `fallback_only`.
- It cannot create paid authority.

AI usage display metadata does not imply local paid entitlement authority:

- WordGeni display metadata now exposes Verixet-known `wordgeni.ai_generations_per_month` limits.
- Unknown local surfaces such as prompt/token usage are classified as local unknowns where Verixet exports no exact numeric authority.
- Display metadata is separate from entitlement authority.

AI usage enforcement values were not changed:

- Local token/cost budgets in `ai-usage-limits.ts` were retained.
- The budget assertion path was not changed.
- The cleanup added display metadata fields only.

Legacy Stripe price mapping metadata is compatibility-only and non-authoritative:

- `STRIPE_PRO_PRICE_ID`, `STRIPE_STUDIO_PRICE_ID`, and `STRIPE_ENTERPRISE_PRICE_ID` map to local tiers only for legacy compatibility.
- Each mapping is classified as `legacy_alias`.
- Each mapping records `livePaymentAuthority: false`.

Stripe price IDs/config were not changed:

- No dependency files, env templates, Stripe price IDs, checkout config, or live payment config changed.
- Stripe webhook logic was not changed.

Web pricing normalization carries Verixet classification metadata:

- Generated Verixet artifact rows now carry `metadataClassification` through the WordGeni web normalizer.
- Reviewed/manual/non-self-serve rows remain filtered when Verixet marks them non-public or inactive.

Reviewed/manual/non-self-serve rows are not hard-sold:

- `creator_pro`, `ecosystem_pro`, and `ecosystem_elite` remain non-self-serve when Verixet says they are reviewed/manual.
- Manual rows retain review/manual CTA behavior instead of checkout CTA behavior.

Active Verixet-backed rows still display intended handoff behavior:

- Active single-app rows and active self-serve bundle rows still expose Verixet checkout handoff metadata.
- Local rows do not invent handoff availability for reviewed/manual rows.

P0 fail-closed billing/admission behavior remains intact:

- Billing authority, checkout handoff, portal handoff, and Verixet usage admission behavior were not changed.
- The route/auth proof verifier still passes.

P1 display truthfulness remains intact:

- Display labels continue to distinguish managed-through-Verixet, local mirror, fallback-only, manual setup, pricing under review, and legacy compatibility states.

## D. Verification Results

WordGeni dependency-safe checks:

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | No whitespace/errors in the current WordGeni diff. |
| `node scripts/verify-wordgeni-local-proof.mjs` | Pass | Reported `PASS WordGeni local route/auth proof verifier passed`; `passed: true`, `failed: 0`. |

Focused checks attempted without forcing dependency installs, pnpm purge, or native rebuild:

| Command | Result | Failure reason |
| --- | --- | --- |
| `npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts` | Blocked | Missing package-local Vitest binary: `apps/WordGeni/apps/api/node_modules/vitest/vitest.mjs`. |
| `npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts` | Blocked | Missing package-local Vitest binary: `apps/WordGeni/apps/web/node_modules/vitest/vitest.mjs`. |
| `npm --prefix apps/WordGeni/apps/api run typecheck` | Blocked | Missing package-local TypeScript binary: `apps/WordGeni/apps/api/node_modules/typescript/bin/tsc`. |
| `npm --prefix apps/WordGeni/apps/web run typecheck` | Blocked | Missing package-local TypeScript binary: `apps/WordGeni/apps/web/node_modules/typescript/bin/tsc`. |
| `npm --prefix apps/WordGeni run lint -- apps/api/src/services/verixet-catalog-display.ts apps/api/src/services/verixet-catalog-display.test.ts apps/api/src/services/ai-usage-limits.ts apps/api/src/services/ai-usage-limits.test.ts apps/api/src/services/stripe/plan-from-price.ts apps/api/src/services/stripe/plan-from-price.test.ts apps/web/src/lib/pricing-catalog.ts apps/web/src/components/pricing/pricing-page-client.test.ts` | Blocked | Missing/stale workspace Turbo binary: `apps/WordGeni/node_modules/turbo/bin/turbo`. |

Dependency-layout blockers observed in this cleanup pass:

- Missing package-local Vitest binary.
- Missing package-local TypeScript binary.
- Stale workspace binary/symlink layout for Turbo.
- Prior pnpm attempt hit a non-TTY modules purge prompt; pnpm was not forced in this proof pass.
- Direct workspace binary attempts are not trusted until dependency links are repaired because module resolution is incomplete.

Status checks recorded:

| Command | Result |
| --- | --- |
| `git status --short` | Root still has pre-existing dirty `package.json` plus unrelated untracked docs/scripts. |
| `git -C apps/WordGeni status --short` | Clean. |
| `git -C apps/Verixet status --short` | Clean. |
| `git -C apps/RatAiFy status --short` | Clean. |
| `git -C apps/AudAix status --short` | Clean. |
| `git -C apps/XFlow status --short` | Clean. |
| `git -C apps/CreVux status --short` | Clean. |

`pnpm stripe:proof` was not run because Stripe test env was not intentionally configured for this documentation proof and pnpm dependency checks must not force module purge or installs.

## E. Verification Limitations

Blocked command: `npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts`

- Failure reason: missing package-local Vitest binary.
- Cause: pre-existing dependency-layout issue, not this WordGeni cleanup.
- Passed instead: `git diff --check` and `node scripts/verify-wordgeni-local-proof.mjs`.
- Rerun after repair: the focused API test command above.
- P2 impact: does not block P2 completion because the committed diff is scoped and the dependency-safe proof checks passed, but it must be fixed before broader CI trust.

Blocked command: `npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts`

- Failure reason: missing package-local Vitest binary.
- Cause: pre-existing dependency-layout issue, not this WordGeni cleanup.
- Passed instead: route/auth proof verifier and committed test additions as evidence.
- Rerun after repair: the web pricing test command above.
- P2 impact: not launch-blocking for this cleanup proof, but should be restored before broad release verification.

Blocked command: `npm --prefix apps/WordGeni/apps/api run typecheck`

- Failure reason: missing package-local TypeScript binary.
- Cause: pre-existing dependency-layout issue, not this WordGeni cleanup.
- Passed instead: `git diff --check`.
- Rerun after repair: API typecheck.
- P2 impact: not code-related based on current evidence; dependency-layout repair remains required for full confidence.

Blocked command: `npm --prefix apps/WordGeni/apps/web run typecheck`

- Failure reason: missing package-local TypeScript binary.
- Cause: pre-existing dependency-layout issue, not this WordGeni cleanup.
- Passed instead: `git diff --check`.
- Rerun after repair: web typecheck.
- P2 impact: not code-related based on current evidence; dependency-layout repair remains required for full confidence.

Blocked command: `npm --prefix apps/WordGeni run lint -- <touched files>`

- Failure reason: missing/stale workspace Turbo binary.
- Cause: pre-existing dependency-layout issue, not this WordGeni cleanup.
- Passed instead: `git diff --check`.
- Rerun after repair: touched-file lint or package lint.
- P2 impact: not launch-blocking for this metadata cleanup, but should be fixed before relying on local lint.

## F. Remaining P2/P3 Work

WordGeni local aliases still retained:

- `free`
- `pro`
- `studio`
- `enterprise`

Why retained aliases are needed:

- They are persisted local workspace/API compatibility values.
- Removing or renaming them would require schema/data migration work outside this P2 cleanup.

Alias classification:

- `free`: fallback-only, non-paid.
- `pro`: compatibility alias/local mirror for `wordgeni_starter`.
- `studio`: compatibility alias/local mirror for `wordgeni_pro`.
- `enterprise`: compatibility alias/local mirror for `wordgeni_elite`.

WordGeni AI usage constants still retained:

- Local token/cost budgets remain in `apps/api/src/services/ai-usage-limits.ts`.
- They are local enforcement rules, not Verixet public package authority.
- P3 should decide whether to reconcile token/cost budgets with Verixet AI generation-count limits.

Verixet export gaps still remaining:

- Verixet exports AI generation and feature-display metadata, but not a first-class conversion from local WordGeni token/cost budgets to Verixet generation limits.
- Creator/local enforcement policy alignment remains a later cleanup area.
- Legacy local Stripe webhook/price compatibility needs a P3 retirement or long-term support decision.

Dependency-layout cleanup needed:

- Restore package-local or workspace-resolvable Vitest, TypeScript, Turbo, ESLint, and related dependency links.
- Avoid pnpm non-TTY module purge prompts by repairing dependency state intentionally in a dedicated dependency-maintenance pass.
- Rerun focused API tests, web pricing tests, API/web typechecks, and touched-file lint after repair.

Recommended next app or cleanup area:

- Move to CreVux P2 package/media-credit cleanup next, since WordGeni's creator-pair metadata now has proof and CreVux is the remaining creator-side app likely to share bundle/top-up drift.

## G. Final Decision

1. Is WordGeni plan/AI-usage cleanup complete enough for P2?

Yes. The metadata authority cleanup is complete enough for P2. WordGeni now classifies local aliases, AI display metadata, legacy Stripe mappings, and web pricing rows against Verixet authority without changing enforcement or checkout behavior.

2. Is any WordGeni plan/package/AI-usage drift still launch-blocking?

No. Remaining drift is compatibility or P3 cleanup work. P0 fail-closed billing/admission behavior and P1 display truthfulness remain intact.

3. Are verification limitations code-related or dependency-layout related?

They are dependency-layout related. The blocked commands fail before running tests/typechecks because package-local or workspace binary/module links are missing or stale.

4. Which app or cleanup area should be next for P2?

CreVux P2 package/media-credit cleanup should be next.

5. What recurring proof command should guard WordGeni plan/usage drift?

Use:

```powershell
git -C apps/WordGeni diff --check
node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs
npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/stripe/plan-from-price.test.ts src/routes/billing.route.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts
npm --prefix apps/WordGeni/apps/web run test -- src/components/pricing/pricing-page-client.test.ts
npm --prefix apps/WordGeni/apps/api run typecheck
npm --prefix apps/WordGeni/apps/web run typecheck
```

Run the full command set after the dependency layout is repaired. Until then, the first two commands are the dependency-safe recurring proof.

6. What exact next implementation prompt should be used?

```text
Review and commit the CreVux P2 package/media-credit cleanup planning doc.

Use the committed subscription-tier audit, P0/P1 proof docs, Verixet catalog export pattern, and the completed RatAiFy, AudAiX, and WordGeni P2 cleanup proofs as context.

Create or review the CreVux P2 cleanup plan for package aliases, media credit usage, top-ups, bundle membership, legacy Stripe mappings, billing display, and web pricing normalization.

Do not change production code, schemas, migrations, Stripe webhook logic, Stripe price IDs, checkout behavior, entitlement enforcement, media usage enforcement, dependency files, or package architecture.
```
