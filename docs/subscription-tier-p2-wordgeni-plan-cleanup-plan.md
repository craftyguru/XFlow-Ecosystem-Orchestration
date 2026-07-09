# P2 WordGeni Plan/AI-Usage Cleanup Plan

## A. Executive Summary

Overall status: Partial.

WordGeni is already safer than a raw local package catalog because P0/P1 work made billing fail closed to Verixet by default, moved public pricing display toward the Verixet generated catalog, and labels local billing state as Verixet-managed instead of final WordGeni authority. The remaining P2 problem is structural drift: WordGeni still carries persisted local plan aliases, local AI and creator usage policies, and legacy Stripe mappings that are necessary for compatibility but can still look like package authority when read outside their guardrails.

The next cleanup should not delete `free`, `pro`, `studio`, or `enterprise` outright. Those values are persisted in the WordGeni workspace schema and enforcement services. Instead, P2 should classify them as local aliases/mirrors of Verixet public plan rows:

| Local WordGeni tier | Verixet public plan | Cleanup classification | P2 handling |
| --- | --- | --- | --- |
| `free` | No paid plan; Verixet free caps only | Fallback/local mirror | Keep as default fail-closed state. |
| `pro` | `wordgeni_starter` | Local alias of Verixet-backed plan | Keep persisted alias; consume Verixet classification/display metadata. |
| `studio` | `wordgeni_pro` | Local alias of Verixet-backed plan | Keep persisted alias; consume Verixet classification/display metadata. |
| `enterprise` | `wordgeni_elite` | Local alias of Verixet-backed plan | Keep persisted alias; consume Verixet classification/display metadata. |

Recommended sequence:

1. Add a WordGeni metadata slice to the Verixet generated catalog artifact.
2. Update WordGeni's local display/adapter tests to consume that classification slice.
3. Keep billing, checkout, Stripe webhook, schema, entitlement enforcement, and AI usage enforcement behavior unchanged during P2.
4. Record a proof doc after focused tests confirm local aliases cannot override Verixet availability or reviewed/manual states.

## B. Current WordGeni Billing, Plan, and AI-Usage Status

WordGeni has three relevant surfaces:

| Surface | Current status | P2 concern |
| --- | --- | --- |
| API billing/entitlements | `apps/WordGeni/apps/api/src/services/billing-entitlements.ts` returns Verixet-required/free entitlement by default and only trusts local legacy Stripe in explicitly enabled non-production mode. | Good P0 guardrail; do not relax it. |
| Public pricing/UI | `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts` normalizes the Verixet generated catalog and `pricing-page-client.tsx` posts handoff payloads to Verixet. | Good P1 display posture; fallback catalog still needs classification guardrails. |
| Local plan/usage constants | API services still use `free`, `pro`, `studio`, `enterprise`, AI token budgets, creator limits, local Stripe price env mappings, and legacy webhook mapping. | These must be labeled as local aliases/mirrors/compatibility, not final package authority. |

Key WordGeni files reviewed:

| File | Role | Classification |
| --- | --- | --- |
| `apps/WordGeni/apps/api/src/services/verixet-catalog-display.ts` | Static Verixet display mirror for WordGeni plans, Creator bundle rows, ecosystem rows, CTAs, and entitlement keys. | Local adapter; should consume generated Verixet classification when available. |
| `apps/WordGeni/apps/api/src/services/stripe/plan-from-price.ts` | Maps Verixet/public slugs and legacy Stripe price IDs back to persisted WordGeni tiers. | Compatibility alias layer. |
| `apps/WordGeni/apps/api/src/routes/billing.ts` | Defers checkout/portal to Verixet by default; legacy local Stripe only behind explicit non-production flag. | P0/P1 safe; no checkout behavior change. |
| `apps/WordGeni/apps/api/src/routes/stripe-webhook.ts` | Retains local Stripe webhook compatibility behind `WORDGENI_ENABLE_BILLING`. | Legacy compatibility; no webhook logic change. |
| `apps/WordGeni/apps/api/src/services/stripe/stripe-webhook-processor.ts` | Maps Stripe metadata/price IDs into persisted local workspace plan values. | Compatibility; not package authority. |
| `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts` | Enforces local token/cost budgets and exposes Verixet-safe display metadata. | Enforcement mirror; do not change limits in P2. |
| `apps/WordGeni/apps/api/src/services/creator-tier-policy.ts` | Enforces local source memory, export, and project limits. | Enforcement mirror; does not exactly match Verixet `paidTierLimits`. |
| `apps/WordGeni/apps/api/src/services/verixet-usage-admission.ts` | Fails closed unless Verixet usage ingest is configured and approved. | Strong P0 usage guardrail; keep intact. |
| `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts` | Normalizes generated Verixet artifact and hides non-public/non-active rows. | Good generated-catalog consumer; add proof around manual/reviewed rows. |
| `apps/WordGeni/apps/web/src/components/pricing/pricing-page-client.tsx` | Builds Verixet checkout handoff payload. | Good handoff behavior; no checkout change. |

## C. P0/P1 Fixes Already Completed

P0/P1 work already established these launch safety properties:

| Area | Evidence | Status |
| --- | --- | --- |
| Billing authority | `getWorkspaceBillingEntitlement` returns `billingAuthority: "verixet"` and `paid: false` by default unless legacy local billing is explicitly trusted outside production. | Pass. |
| Checkout authority | `POST /api/billing/checkout` returns a Verixet handoff URL by default and does not create a local Stripe session. | Pass. |
| Portal authority | `POST /api/billing/portal` defers to Verixet by default. | Pass. |
| Display truthfulness | Billing state labels include `Requires Verixet entitlement`, `Managed through Verixet`, `Local mirror only`, or `Legacy WordGeni plan`. | Pass. |
| Verixet catalog display | WordGeni API tests compare local display mirror values against `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`. | Pass. |
| Web pricing truthfulness | Web pricing normalization consumes the generated artifact, hides reviewed/manual rows that are not public, and avoids raw Stripe price IDs in payloads. | Pass. |
| Usage admission | Verixet usage admission fails closed when the ingest token or Verixet response is unavailable/inconclusive. | Pass. |

P0/P1 should be treated as guardrails, not cleanup targets. P2 must avoid weakening them.

## D. Remaining Structural Drift

WordGeni still has these drift sources:

| Drift source | Current behavior | Risk | Cleanup classification |
| --- | --- | --- | --- |
| Persisted local plan enum | Workspace plan values are `free`, `pro`, `studio`, `enterprise`. | These names do not match Verixet public tiers; `pro` means WordGeni Starter, not Verixet Pro. | Local compatibility aliases. |
| Public plan alias mapping | `wordgeni_starter`, `creator_starter`, and `ecosystem_starter` map to local `pro`; `wordgeni_pro`, `creator_pro`, and `ecosystem_pro` map to `studio`; elite rows map to `enterprise`. | Can be misread as WordGeni package authority if not classified. | Verixet-backed aliases with compatibility mapping. |
| Local Stripe price env IDs | `STRIPE_PRO_PRICE_ID`, `STRIPE_STUDIO_PRICE_ID`, and `STRIPE_ENTERPRISE_PRICE_ID` still exist for webhook/legacy processing. | Local price IDs could look like live authority even though checkout is Verixet-owned by default. | Legacy Stripe compatibility only. |
| AI token/cost budgets | Local token budgets do not map one-to-one to Verixet `ai_generations_per_month`. | Enforcement drift between tokens/cost caps and generated catalog feature limits. | Local enforcement mirror; P3 candidate. |
| Creator tier policy | Local `sourceMemoryItems`, `exportsPerMonth`, and `activeProjects` differ from Verixet `documents`, `projects`, `exports`, and `source_memory`. | Could imply WordGeni local limits are final product limits. | Local enforcement mirror/compatibility. |
| Web fallback pricing catalog | Fallback vendor catalog still has generic pricing path/tier vocabulary. | Verixet unavailable fallback could reintroduce stale copy or generic tier semantics. | Fallback display only; guard with tests. |
| Dist output | `apps/WordGeni/apps/api/dist` contains built copies of old mappings. | Build artifacts can confuse audit searches. | Generated output; do not edit in P2 unless build policy requires it. |

## E. Verixet Authority Comparison

The Verixet generated catalog is the strongest current authority for public display, plan availability, bundle membership, entitlement keys, and handoff metadata.

WordGeni single-app rows:

| Verixet slug | Display | Monthly | Yearly | Availability |
| --- | --- | --- | --- | --- |
| `wordgeni_starter` | WordGeni Starter | `$19/mo` | `$190/year` | Active, public, self-serve. |
| `wordgeni_pro` | WordGeni Pro | `$49/mo` | `$490/year` | Active, public, self-serve. |
| `wordgeni_elite` | WordGeni Elite | `$99/mo` | `$990/year` | Active, public, self-serve. |

Creator bundle rows:

| Verixet slug | Display | Availability | WordGeni implication |
| --- | --- | --- | --- |
| `creator_starter` | Creator Starter | Active, public, self-serve. | Includes WordGeni and CreVux; maps to local `pro` for compatibility. |
| `creator_pro` | Creator Pro | Pricing under review/manual setup; not self-serve public checkout. | Must not be hard-sold by WordGeni local rows. |
| `creator_elite` | Creator Elite | Active, public, self-serve. | Includes WordGeni and CreVux; maps to local `enterprise` for compatibility. |

Ecosystem bundle rows:

| Verixet slug | Display | Availability | WordGeni implication |
| --- | --- | --- | --- |
| `ecosystem_starter` | Full Ecosystem Starter | Active, public, self-serve. | Includes all six apps. |
| `ecosystem_pro` | Full Ecosystem Pro | Pricing under review/manual setup; not self-serve public checkout. | Must not be hard-sold by WordGeni local rows. |
| `ecosystem_elite` | Full Ecosystem Elite | Pricing under review/manual setup; not self-serve public checkout. | Must not be hard-sold by WordGeni local rows. |

Bundle membership authority:

| Bundle | Verixet membership |
| --- | --- |
| `main4` | XFlow, Verixet, RatAiFy, AudAiX |
| `creator` | WordGeni, CreVux |
| `ecosystem` | XFlow, Verixet, RatAiFy, AudAiX, WordGeni, CreVux |

Verixet WordGeni limits:

| Type | Current generated values |
| --- | --- |
| Free caps | `drafts_per_month: 5`, `ai_generations_per_month: 25`, `token_budget_per_month: 50000`, `exports: 0`. |
| Paid tier limits | Starter: 25 documents, 3 projects, 500 AI generations/month, standard source memory, 25 exports. Pro: 250 documents, 25 projects, 5000 AI generations/month, advanced source memory, 250 exports. Elite: unlimited documents/projects/exports, 25000 AI generations/month, priority source memory. |
| Top-ups | Generic AI action credit packs `ai_small`, `ai_builder`, `ai_power`, `ai_studio` are active/self-serve; deprecated compatibility packs are not public/self-serve. |

## F. Cleanup Classification

P2 should use these classifications consistently in Verixet export and WordGeni adapter code:

| Classification | Meaning | WordGeni examples |
| --- | --- | --- |
| Verixet-backed canonical | Public plan row or top-up row governed by Verixet generated catalog. | `wordgeni_starter`, `wordgeni_pro`, `wordgeni_elite`, active AI credit top-ups. |
| Local alias | Persisted WordGeni tier that points at a Verixet row but is not itself public pricing authority. | `pro -> wordgeni_starter`, `studio -> wordgeni_pro`, `enterprise -> wordgeni_elite`. |
| Local mirror | Local display/enforcement data copied from or aligned to Verixet for UI or compatibility. | `WORDGENI_VERIXET_DISPLAY_PLANS`, `WORDGENI_FREE_DISPLAY`. |
| Legacy/manual compatibility | Local Stripe or old plan processing retained for historical subscriptions or non-production proof paths. | `STRIPE_PRO_PRICE_ID`, `WORDGENI_LOCAL_STRIPE_LEGACY_CHECKOUT_ENABLED`, Stripe webhook processor mappings. |
| Fallback-only | Values used only when Verixet catalog/entitlement cannot be read and must not create paid authority. | Free/default display, web fallback pricing catalog. |
| Missing/export gap | Metadata WordGeni needs but Verixet does not yet export as a WordGeni-specific slice. | Local alias classifications, AI token policy mapping, local enforcement vs catalog-limit relationship. |

## G. Verixet Export Gaps

Verixet already exports the raw facts WordGeni needs: plan prices, checkout availability, manual/review state, entitlement keys, free caps, paid tier limits, bundle membership, handoff URLs, and top-up metadata. It does not yet export a WordGeni-focused metadata slice comparable to the RatAiFy slice.

P2 should add a new top-level `wordgeni` slice to `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json` without breaking existing fields.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `authority: "verixet"` | Makes Verixet the named source for WordGeni-facing plan metadata. |
| `appSlug: "wordgeni"` | Identifies the slice owner. |
| `localTierAliases` | Classifies `free`, `pro`, `studio`, and `enterprise` as fallback/local alias/legacy/missing where appropriate. |
| `canonicalPlanSlugs` | Lists `wordgeni_starter`, `wordgeni_pro`, `wordgeni_elite`. |
| `bundleAliases` | Classifies `creator_*` and `ecosystem_*` rows for WordGeni display, including reviewed/manual states. |
| `usageLimitMappings` | Maps Verixet feature limits to local WordGeni enforcement concepts: documents, projects, exports, source memory, AI generations, token budgets. |
| `aiCreditTopUpMappings` | Identifies active `ai_action_credits` packs as Verixet self-serve and deprecated/legacy packs as non-public compatibility. |
| `legacyStripeMappings` | Marks local Stripe env-name mappings as legacy compatibility, not live checkout authority. |
| `fallbackRules` | States that free/default fallback is non-paid and cannot override Verixet/manual/reviewed rows. |
| `proofExpectations` | Captures tests that must remain green when WordGeni consumes the slice. |

Export gap priority:

1. Local tier alias classification.
2. Reviewed/manual bundle classification for Creator and ecosystem rows.
3. AI usage/credit mapping, including the distinction between Verixet `ai_generations_per_month`, local token budgets, and `ai_action_credits` top-ups.
4. Local Stripe compatibility classification.

## H. WordGeni Implementation Plan

Implementation should be split into small commits.

### Commit 1: Verixet WordGeni metadata export

Scope:

- Modify only Verixet catalog export files and generated artifact.
- Add `wordgeni` top-level metadata slice.
- Keep existing artifact fields backward-compatible.
- Add tests that prove existing pricing/checkout/top-up fields remain unchanged.

Files likely involved:

- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.ts`
- `apps/Verixet/src/lib/catalog-export/verixet-generated-catalog.test.ts`
- `apps/Verixet/generated/catalog/verixet-public-catalog.v1.json`

Do not change:

- Checkout behavior.
- Stripe webhook logic.
- Stripe price IDs or live payment config.
- Schemas or migrations.
- Entitlement enforcement.
- Dependency files.
- Satellite app code.

### Commit 2: WordGeni adapter cleanup

Scope:

- Consume or mirror the new Verixet `wordgeni` metadata slice in WordGeni's display/adapter layer.
- Classify persisted local tiers as aliases rather than public package rows.
- Keep active Verixet-backed rows self-serve only when Verixet says they are self-serve.
- Keep reviewed/manual rows such as `creator_pro`, `ecosystem_pro`, and `ecosystem_elite` non-self-serve.
- Keep free/default fallback as non-paid.
- Keep local AI usage and creator limits enforced exactly as they are, but label them as local enforcement mirrors.
- Keep legacy local Stripe mappings quarantined behind existing flags and labels.

Files likely involved:

- `apps/WordGeni/apps/api/src/services/verixet-catalog-display.ts`
- `apps/WordGeni/apps/api/src/services/verixet-catalog-display.test.ts`
- `apps/WordGeni/apps/api/src/services/stripe/plan-from-price.ts`
- `apps/WordGeni/apps/api/src/services/ai-usage-limits.ts`
- `apps/WordGeni/apps/api/src/services/ai-usage-limits.test.ts`
- `apps/WordGeni/apps/api/src/services/creator-tier-policy.ts`
- `apps/WordGeni/apps/api/src/services/creator-tier-policy.test.ts`
- `apps/WordGeni/apps/web/src/lib/pricing-catalog.ts`
- `apps/WordGeni/apps/web/src/components/pricing/pricing-page-client.test.ts`

Do not change:

- DB enum/schema/migrations for `free`, `pro`, `studio`, `enterprise`.
- `assertWorkspacePaidEntitlement`.
- `assertAiGenerationBudget`.
- `assertVerixetUsageAdmission`.
- Local Stripe webhook processing behavior.
- Checkout/portal handoff behavior.
- Stripe price IDs.
- Dependency files.

### Commit 3: Proof doc

After Commit 1 and Commit 2, create a root proof document showing:

- Verixet export commit hash.
- WordGeni cleanup commit hash.
- Files changed in each commit.
- Focused verification results.
- Remaining P2/P3 work and final decision.

## I. Test/Proof Plan

Verification for Verixet metadata export:

```powershell
npm run test -- src/lib/catalog-export/verixet-generated-catalog.test.ts
npm run typecheck
npm run stripe:price-env:verify
```

Verification for WordGeni adapter cleanup:

```powershell
npm --prefix apps/WordGeni run typecheck
npm --prefix apps/WordGeni/apps/api run test -- src/services/verixet-catalog-display.test.ts src/services/ai-usage-limits.test.ts src/services/creator-tier-policy.test.ts src/services/billing-entitlements.authority.test.ts src/services/verixet-usage-admission.test.ts src/routes/billing.route.test.ts src/routes/stripe-webhook.route.test.ts
npm --prefix apps/WordGeni/apps/web run test -- src/lib/pricing-catalog.test.ts src/components/pricing/pricing-page-client.test.ts
npm --prefix apps/WordGeni run verify:routes
```

Proof assertions:

- Local `pro`, `studio`, and `enterprise` aliases cannot create paid authority without Verixet or explicit legacy non-production trust flags.
- `wordgeni_starter`, `wordgeni_pro`, and `wordgeni_elite` display as active/self-serve when the Verixet artifact says so.
- `creator_pro`, `ecosystem_pro`, and `ecosystem_elite` remain reviewed/manual/non-self-serve.
- WordGeni checkout still hands off to Verixet by default.
- Local Stripe checkout still only works behind `WORDGENI_LOCAL_STRIPE_LEGACY_CHECKOUT_ENABLED` in non-production.
- Stripe webhook route behavior is unchanged.
- Verixet usage admission still fails closed when not configured or not allowed.
- AI token/cost enforcement values are unchanged.
- Web checkout payloads contain Verixet-governed app/scope/tier fields and no raw Stripe price IDs.
- Free/default fallback remains stable and non-paid.

If broad WordGeni tests expand into unrelated app or proof-copy failures, record those as unrelated and do not fix them in the package cleanup pass.

## J. Launch Safety Rules

P2 implementation must follow these rules:

- Do not change production schemas or migrations.
- Do not rename the persisted WordGeni workspace plan enum in P2.
- Do not change Stripe webhook behavior.
- Do not change Stripe price IDs or live payment config.
- Do not change checkout or portal behavior.
- Do not relax fail-closed entitlement enforcement.
- Do not relax fail-closed AI usage admission.
- Do not change AI token/cost enforcement values unless a separate usage-limit migration is approved.
- Do not run dependency installs.
- Do not change dependency files.
- Do not change broad package architecture.
- Do not let local WordGeni rows override Verixet reviewed/manual/non-self-serve states.
- Do not present deprecated Verixet top-up aliases as public self-serve offers.
- Do not treat web fallback pricing as final authority.

## K. Open Questions

1. Should Verixet's WordGeni slice classify local `enterprise` strictly as `wordgeni_elite`, or also preserve the legacy "enterprise" label for historical customers?
2. Should `creator_pro` continue mapping to local `studio` for compatibility even while the Verixet row is reviewed/manual and non-self-serve?
3. Should Verixet export a first-class mapping from `ai_generations_per_month` to WordGeni token/cost budgets, or should token/cost budgets remain purely local enforcement mirrors until P3?
4. Should local `WORDGENI_CREATOR_BALANCED_POLICY` limits be reconciled with Verixet `paidTierLimits`, or merely labeled as local enforcement rules?
5. Should WordGeni's web fallback vendor catalog be replaced with a generated-artifact fixture or kept as last-resort display fallback?
6. Should legacy local Stripe webhook processing remain indefinitely for historical imports, or get a P3 deprecation plan after Verixet subscription authority is fully proven?

## L. Final Recommendation

Proceed with WordGeni P2, but start in Verixet.

Recommended next implementation prompt:

```text
Review and commit the Verixet-only WordGeni metadata export additions.

Purpose:
Extend the Verixet generated catalog artifact with WordGeni-facing plan alias, AI usage, creator-limit, top-up, bundle, and legacy Stripe metadata so WordGeni can later clean up local plan architecture without treating local constants as authority.

Do not touch WordGeni or any other satellite app.
Do not change checkout behavior, Stripe webhook logic, Stripe price IDs, schemas, migrations, entitlement enforcement, AI usage enforcement, dependency files, or package architecture.
```

Final decision:

1. WordGeni is ready for P2 planning and should be the next app after AudAiX.
2. No current WordGeni drift appears launch-blocking because P0 fail-closed entitlement and usage admission behavior remains intact.
3. The highest-priority cleanup is metadata authority, not enforcement behavior.
4. Verixet should export the missing WordGeni classification slice before WordGeni consumes it.
5. The recurring proof command should cover Verixet generated catalog tests, WordGeni API billing/catalog/usage tests, WordGeni web pricing tests, WordGeni typecheck, and route proof.
