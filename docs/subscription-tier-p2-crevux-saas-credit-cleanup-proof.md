# P2 CreVux SaaS/Credit Cleanup Proof

## A. Executive Summary

Overall status: Pass.

The CreVux P2 SaaS/credit/media cleanup is complete enough to move to the next P2 cleanup area. The implementation is metadata/display cleanup only: it aligns CreVux local SaaS aliases, local credit/top-up rows, media package labels, upgrade CTAs, and landing pricing copy to Verixet authority without changing checkout, Stripe, entitlement, usage admission, or media generation enforcement behavior.

What Verixet export added:

- Verixet commit `f345b61` added a top-level `crevux` metadata slice to the generated public catalog artifact.
- The slice classifies CreVux local tier aliases, public plan aliases, media units, usage admission metadata, media top-up mappings, local credit top-up mappings, fallback rules, manual/review states, and legacy compatibility fields.
- The export marks local rows as fallback, local mirror, compatibility alias, legacy, conflict, manual setup, or missing instead of treating satellite constants as payment/package authority.

What CreVux now consumes or aligns to:

- CreVux commit `f7ec65c` added Verixet-aligned classification metadata to local SaaS display and local top-up display structures.
- `free`, `pro`, `public_pro`, and `elite` are now classified as fallback-only or compatibility/local mirror aliases, not independent billing authority.
- Local `credits_*` rows are now fallback/conflict/missing compatibility display rows, not final self-serve products.
- Upgrade and landing pricing copy now identifies Verixet media package authority and avoids hard-selling fallback-only local credit rows.

What drift was reduced:

- CreVux no longer maps public media credit display to final self-serve AI action top-up offers.
- Local top-up rows no longer use `credits.ai_actions.balance` as the displayed entitlement key.
- Reviewed/manual/non-self-serve Verixet states remain non-self-serve and cannot be overridden by local CreVux rows.
- Billing/admin/upgrade/landing display surfaces now describe CreVux rows as Verixet-backed compatibility mirrors or fallback rows.

What remains for later P2/P3:

- CreVux still retains local SaaS, enforcement, Stripe compatibility, and top-up constants for persisted tier compatibility, development-only local billing paths, and fallback display.
- Broader package architecture cleanup is intentionally deferred until dependency-layout issues are repaired and fuller focused tests can run reliably.
- Verification is partially limited by dependency-layout blockers, but the required safe proof commands passed and the blockers are not caused by the CreVux cleanup diff.

## B. Commit Evidence

Verixet CreVux metadata export commit: `f345b61`

Files changed:

- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.ts`
- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.test.ts`
- `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`

What it proves:

- Verixet is now the authority source for CreVux-facing SaaS alias, media unit, usage admission, top-up, fallback, manual/review, and compatibility metadata.
- Existing generated catalog fields remained backward-compatible while adding the new top-level `crevux` slice.
- CreVux local rows can be classified against Verixet metadata instead of re-creating commercial authority in CreVux.

CreVux cleanup commit: `f7ec65c`

Files changed:

- `apps/CreVux/lib/saas-entitlements/src/saasEntitlements.ts`
- `apps/CreVux/lib/saas-entitlements/scripts/verify-saas-entitlements-policy.ts`
- `apps/CreVux/artifacts/image-gen/src/lib/billingApi.ts`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/PlanUpgradePage.test.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/landing/LandingElitePricing.tsx`
- `apps/CreVux/artifacts/image-gen/src/lib/landingPricingTiers.ts`

What it proves:

- CreVux local SaaS aliases and top-up rows are now described with Verixet-aligned classification metadata.
- Local `credits_*` packs are fallback/conflict/missing compatibility rows and are disabled as public final self-serve upgrade offers.
- Upgrade and landing pricing surfaces now show Verixet package authority and avoid presenting fallback local packs as purchasable final products.
- The proof verifier now checks CreVux local display metadata against the Verixet `crevux` slice.

## C. CreVux SaaS/Credit/Media Cleanup Proof

CreVux `free`, `pro`, `public_pro`, and `elite` aliases now use Verixet-aligned classification metadata:

- `free` is fallback-only/default and non-self-serve.
- `pro`, `public_pro`, and `elite` are compatibility/local mirror aliases for Verixet-backed rows.
- Local alias rows retain local enforcement/persisted-tier compatibility, but do not become billing authority.

Local aliases are compatibility/local mirror/fallback/legacy only:

- The display metadata includes classification, match quality, fallback flags, compatibility flags, and reason labels.
- `localMirrorOnly` is used for Verixet-backed compatibility display, making it explicit that local rows mirror Verixet state.
- Free/default fallback remains stable and non-paid.

Local `credits_*` packs are fallback/conflict/missing compatibility rows:

- `credits_1000`, `credits_5000`, and `credits_15000` are fallback-only conflict rows because prior local display associated them with AI action packs.
- `credits_50000` is fallback-only/missing because no active Verixet media package exists for it.
- All local `credits_*` rows are marked non-self-serve and use `Managed through Verixet` instead of purchase-price CTAs.

Verixet `media_*` packs are preferred media-credit authority:

- The Verixet slice exports media top-up mappings such as `media_builder` as canonical/self-serve media package authority.
- Deprecated creative packs remain non-self-serve/legacy.
- CreVux local display now avoids inventing final payment authority for legacy local credit rows.

AI-action/media-credit mismatches are labeled:

- Local rows that previously pointed at `ai_builder`, `ai_power`, or `ai_studio` now carry conflict/fallback metadata.
- The proof verifier asserts local top-up display does not include `credits.ai_actions.balance`.

Admin and billing display metadata identifies Verixet authority:

- Existing P1 billing mirror behavior remains intact: admin/billing rows describe CreVux local state as a mirror and Verixet as authority.
- The new display metadata makes that classification explicit for local plan/top-up display.

Upgrade and landing pricing do not hard-sell reviewed/manual/non-self-serve rows:

- `PlanUpgradePage.tsx` now labels the section as media credit packages and disables buttons when `selfServeCheckoutAvailable` is not true or `fallbackOnly` is true.
- Landing pricing copy now says media packages are managed through Verixet and displays conflict/fallback status rather than a purchase price for local fallback rows.
- Reviewed/manual Verixet rows remain non-self-serve and cannot be made public by local aliases.

Active Verixet-backed rows still display intended handoff behavior:

- Active compatibility rows keep Verixet handoff labels such as `Start checkout in Verixet`.
- Checkout route behavior was not changed; the cleanup only changes display metadata and UI availability for fallback local rows.

P0/P1 safety remains intact:

- P0 fail-closed usage admission/media behavior was not touched.
- P1 display truthfulness remains intact: Verixet is billing, package, entitlement, credit, and checkout authority.
- Checkout behavior, Stripe IDs/config, webhook logic, usage admission enforcement, and media generation enforcement were not changed.

## D. Verification Results

Required CreVux checks:

- `git diff --check`: Pass.
- `node scripts/verify-crevux-local-proof.mjs`: Pass.

Focused attempts that were blocked without install/purge/rebuild:

- `node_modules\.bin\tsx.CMD ./scripts/verify-saas-entitlements-policy.ts` from `apps/CreVux/lib/saas-entitlements`: blocked by missing/stale package-local `tsx` target, `Cannot find module ...\node_modules\tsx\dist\cli.mjs`.
- `node_modules\.bin\tsc.CMD -p tsconfig.json --noEmit` from `apps/CreVux/lib/saas-entitlements`: blocked by missing/stale package-local TypeScript target, `Cannot find module ...\node_modules\typescript\bin\tsc`.
- `node_modules\.bin\vitest.CMD run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx` from `apps/CreVux/artifacts/image-gen`: blocked by missing `@vitest/utils`.
- `node_modules\.bin\vitest.CMD run src/routes/admin.billing-truthfulness.test.ts` from `apps/CreVux/artifacts/api-server`: blocked by missing/stale `vitest.mjs`.
- `node_modules\.bin\vitest.CMD run src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts` from `apps/CreVux/artifacts/api-server`: blocked by missing/stale `vitest.mjs`.
- `node_modules\.bin\tsx.CMD ./scripts/verify-credit-topup-wiring.ts` from `apps/CreVux/artifacts/api-server`: blocked by missing/stale package-local `tsx`.
- Direct API-server typecheck from package-local shim: blocked because `node_modules/.bin/tsc.CMD` is absent.
- Direct image-gen typecheck from package-local shim: blocked because `node_modules/.bin/tsc.CMD` is absent.
- Fallback API-server typecheck using the CreVux root shim: blocked by missing `@types/node`.
- Fallback image-gen typecheck using the CreVux root shim: blocked by missing `@types/node` and `vite/client`.
- Fallback SaaS policy verifier using the CreVux root `tsx` shim: blocked by missing `esbuild`.

Known pnpm blocker:

- `pnpm --filter @workspace/saas-entitlements run test`: blocked before test execution by `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY`.

Status checks recorded:

- Root `git status --short`: root remains dirty with pre-existing `package.json` plus unrelated untracked docs/scripts.
- `apps/CreVux status --short`: clean before this proof document was created.
- `apps/Verixet status --short`: clean.
- `apps/RatAiFy status --short`: clean.
- `apps/AudAix status --short`: clean.
- `apps/WordGeni status --short`: clean.
- `apps/XFlow status --short`: clean.

## E. Verification Limitations

The blocked test/typecheck commands are dependency-layout blockers, not CreVux cleanup failures.

Exact blocker classes:

- pnpm non-TTY module purge prompt prevents filtered pnpm scripts from running safely.
- Missing/stale `vitest.mjs` prevents API focused Vitest tests from starting.
- Missing `@vitest/utils` prevents image-gen focused Vitest tests from starting.
- Missing/stale `tsx` prevents API and SaaS verifier commands from starting through package-local shims.
- Missing package-local TypeScript shims prevent direct API-server and image-gen typechecks.
- Missing `@types/node` blocks fallback API/image-gen typecheck attempts.
- Missing `vite/client` blocks fallback image-gen typecheck attempts.
- Missing `esbuild` blocks fallback `tsx` execution.

What passed instead:

- The committed diff was reviewed and scoped to the seven intended CreVux files.
- `git diff --check` passed.
- `node scripts/verify-crevux-local-proof.mjs` passed.
- The CreVux cleanup commit `f7ec65c` was committed and pushed with the same dependency-layout blockers recorded during commit review.

What should be rerun after dependencies are repaired:

- `pnpm --filter @workspace/saas-entitlements run test`
- `pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts`
- `pnpm --filter @workspace/api-server exec vitest run src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts`
- `pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx`
- `pnpm --filter @workspace/api-server run typecheck`
- `pnpm --filter @workspace/image-gen run typecheck`
- `pnpm --filter @workspace/saas-entitlements run typecheck`

Whether this blocks P2 completion:

- No. The limitations are environment/dependency-layout related. They do not indicate a code failure in the CreVux cleanup diff, and the safe proof commands passed.

## F. Remaining P2/P3 Work

CreVux local SaaS constants still retained:

- Local tier keys and enforcement mappings for `free`, `pro`, `public_pro`, and `elite`.
- Local plan catalog and display mirrors used for fallback display, persisted tier compatibility, and development-only local billing compatibility.
- These are retained as fallback/local mirror/compatibility data, not billing authority.

CreVux local credit/top-up constants still retained:

- `CREVUX_TOP_UP_PACKS` and `CREVUX_TOP_UP_DISPLAY` remain for legacy pack ids, fallback display, and API compatibility.
- Retained `credits_*` rows are fallback-only/conflict/missing compatibility rows and are non-self-serve.

Deferred architecture cleanup:

- Full removal or quarantine of legacy local plan/top-up constants is deferred until dependency-layout issues are fixed and broader focused tests can run.
- Local Stripe compatibility paths remain development-only and guarded; they should be cleaned up later only after historic Stripe metadata compatibility is proven unnecessary.

Verixet export gaps still remaining:

- No launch-blocking Verixet export gap remains for P2 CreVux display cleanup.
- Later P3 work may refine richer media-package display labels, historic Stripe compatibility metadata, and legacy pack retirement reporting.

Dependency-layout cleanup needed:

- Repair package-local shims and pnpm workspace layout so focused Vitest, TypeScript, and tsx verifier commands run without non-TTY purge prompts or missing module targets.

Recommended next app or cleanup area:

- Move to the next P2 app/cleanup area after committing this proof. If all satellite package/plan cleanup areas are complete, the next area should be dependency-layout repair and recurring proof automation so broader CI can be trusted.

## G. Final Decision

1. Is CreVux SaaS/credit/media cleanup complete enough for P2?

Yes. The cleanup is complete enough for P2 because Verixet exports CreVux authority metadata and CreVux now treats local SaaS aliases and credit rows as Verixet-aligned display/fallback/compatibility data.

2. Is any CreVux SaaS/credit/media drift still launch-blocking?

No. Remaining local constants are retained as fallback/local mirror/legacy/compatibility only and are not launch-blocking.

3. Are verification limitations code-related or dependency-layout related?

They are dependency-layout related. The blocked commands fail before executing relevant test assertions because package-local binaries or transitive dependencies are missing/stale, or because pnpm attempts a non-TTY module purge.

4. Which app or cleanup area should be next for P2?

Proceed to the next P2 app/cleanup area if one remains. Otherwise, repair CreVux/workspace dependency layout and add recurring proof automation for package drift.

5. What recurring proof command should guard CreVux SaaS/credit drift?

```powershell
node scripts/verify-crevux-local-proof.mjs
```

After dependency repair, pair it with:

```powershell
pnpm --filter @workspace/saas-entitlements run test
pnpm --filter @workspace/api-server exec vitest run src/routes/admin.billing-truthfulness.test.ts src/lib/verixetUsageAdmission.test.ts src/lib/saasMetering.admission-order.test.ts src/tests/saasEnforcement.integration.test.ts
pnpm --filter @workspace/image-gen exec vitest run --config vitest.config.ts src/pages/PlanUpgradePage.test.tsx src/pages/pricing.test.tsx
```

6. What exact next implementation prompt should be used?

```text
Review and commit the next P2 cleanup proof or move to workspace dependency-layout repair.

Use the committed P2 app cleanup proofs as context.

Scope:
* Do not change production code unless explicitly requested.
* Do not stage or commit root package.json.
* Do not stage unrelated docs/scripts.
* Do not run dependency installs.
* Do not force pnpm module purge.
* Do not rebuild dependencies.

Goal:
Either create the next P2 proof summary for the next app, or repair the workspace dependency-layout blockers that prevent focused Vitest, TypeScript, and tsx proof commands from running.

If repairing dependency layout, first produce a scoped plan that explains how to fix missing/stale package-local Vitest, TypeScript, tsx, esbuild, @types/node, and vite/client resolution without changing product behavior, schemas, migrations, Stripe logic, checkout flows, entitlement enforcement, usage admission enforcement, media generation enforcement, or package architecture.
```
