# Ecosystem UX, Navigation, And Layout Audit

This audit is source-inspected planning work. Apps were not run locally in this phase, so runtime behavior is marked needs verification unless an existing source file or app doc gives direct evidence.

## Current Findings

The ecosystem has substantial app-specific UI work, but it does not yet read as one product family. Source inspection shows different shell patterns, different status language, different dashboard depth, and uneven placement of help, status, settings, account, admin, and ecosystem links.

| App | Source evidence inspected | Current finding | Runtime status |
| --- | --- | --- | --- |
| XFlow | App Router docs/tests including dashboard navigation, status, auth, and route contracts | Strongest control-plane shell and verification posture, but many operator/admin surfaces raise information hierarchy risk. | needs verification |
| Verixet | Existing `docs/dashboard-audit.md`, dashboard components, status screenshots, route checks | Mature dashboard audit trail exists, but dashboard scope is broad and likely needs tighter primary navigation hierarchy. | needs verification |
| Rataify | `client/src/App.tsx`, dashboard/status/settings pages, app navigation helpers, sidebar route verifier | Product has many trust/admin/support routes; risk is crowded navigation and loud superadmin/debug surfaces. | needs verification |
| AudAiX | Dashboard pages, site layout/tabs, `docs/ui/DASHBOARD_UI.md`, E2E smoke | Strong audit domain structure, but many public/dashboard/security pages need a clearer global shell standard. | needs verification |
| Crevux | Navigation shell audit docs, dashboard architecture docs, image-gen shell scripts, studio assets | Rich product surface with multiple shells; risk is mode sprawl across studio, admin, mobile, and media workflows. | needs verification |
| WordGeni | Next dashboard layout, workspace shell, sidebar package, status/support pages, route contracts | Clear workspace/app split, but dashboard, admin, onboarding, and workspace shells need shared status/help conventions. | needs verification |

## Recommended Standard

Each core app should converge on a common shell contract:

- Top zone: product mark, primary app navigation, ecosystem/docs/status links, account entry.
- Side zone: workflow-specific navigation only after sign-in or inside a dashboard.
- Footer zone: support, security, changelog, system status, docs, and version where appropriate.
- Dashboard home: what this app does, current status, next actions, recent activity, and honest empty states.
- Admin/debug: accessible by role but visually separated from normal user workflows.
- Mobile: one consistent menu pattern, visible active route state, and no hidden critical actions.

## App-By-App Gaps

| App | Priority | Gaps |
| --- | --- | --- |
| XFlow | P1 | Normalize account/help/status placement; reduce operator surface density on first dashboard; ensure ecosystem docs link appears in product chrome; verify mobile shell behavior. |
| Verixet | P1 | Compress overlapping dashboard modules; make release/status/help links predictable; keep API/debug/admin controls secondary; verify dashboard entry path against README. |
| Rataify | P1 | Separate user trust workflow from admin/superadmin tools; standardize sidebar active states; add consistent ecosystem/docs/status location; verify support and settings placement. |
| AudAiX | P1 | Align site tabs with global shell; standardize public vs dashboard navigation; verify empty/error/loading states across many audit tabs; reduce security/admin page prominence for normal users. |
| Crevux | P1 | Consolidate studio/admin/Labs navigation language; define one dashboard entry point; keep experimental media modes visually secondary; verify mobile and studio dock behavior. |
| WordGeni | P1 | Align workspace shell, dashboard shell, admin shell, status/support pages; make provenance/source actions the primary dashboard path; verify mobile nav store behavior. |

## Priority Ranking

| Priority | Issue | Apps |
| --- | --- | --- |
| P1 | Dashboard entry points do not yet follow one ecosystem information pattern. | XFlow, Verixet, Rataify, AudAiX, Crevux, WordGeni |
| P1 | Admin/debug/operator controls risk being too visible on main screens. | XFlow, Verixet, Rataify, Crevux |
| P1 | Status, docs, support, security, and changelog links need consistent placement. | six core apps |
| P1 | Runtime mobile behavior needs verification across shells. | six core apps |
| P2 | Product-family visual language is uneven across mascots, colors, cards, and type scale. | six core apps |
| P2 | Empty/loading/error/degraded states need a shared vocabulary and visual treatment. | six core apps |
| P3 | Shared component extraction can follow after standards stabilize. | six core apps |

## Six-App Polish Priority

1. XFlow, because it is the control plane and should define the ecosystem shell.
2. Crevux, because it is the most visual and recruiter-facing product.
3. Rataify, because trust/risk apps need high credibility.
4. Verixet, because validation and release gates need clear operator UX.
5. AudAiX, because audit/evidence workflows need clean information hierarchy.
6. WordGeni, because writing/research UX should feel polished but can follow the shared shell.

## Implementation Checklist

- [ ] Verify each core app runtime at desktop and mobile widths.
- [ ] Capture route inventory against README/docs links.
- [ ] Identify current dashboard entry route per app.
- [ ] Classify admin/debug/operator routes and hide them behind role-specific secondary navigation.
- [x] Add or normalize docs/support/security/changelog/status links in a consistent chrome or sidebar zone for XFlow, Verixet, Rataify, AudAiX, Crevux, and WordGeni.
- [ ] Standardize dashboard home content blocks.
- [ ] Standardize state components before extracting shared code.
- [ ] Re-audit after the first app is updated and use it as the reference implementation.

## Phase 5 Implementation Notes

This pass began the six-app shell standard without introducing a shared package or a full redesign.

| App | Implemented | Remaining verification |
| --- | --- | --- |
| XFlow | Added the reference utility cluster in the dashboard header: Docs, Support, Security, Changelog, Status. | Runtime desktop/mobile verification still needed. |
| Crevux | Added Docs, Support, Security, Changelog, and Status to the authenticated navigation config while leaving internal studio/admin tools secondary. | Runtime desktop/mobile verification still needed. |
| Rataify | Added Docs, Security, Changelog, and Status to authenticated workspace navigation, kept Support visible, renamed advanced tooling group to Diagnostics, and normalized loading/access copy toward shared state language. | Runtime desktop/mobile verification still needed. |
| Verixet | Added Docs, Support, Security, Changelog, and Status to the command bar, and removed the static alert count so no fake metric appears in the shell. | Runtime desktop/mobile verification still needed. |
| AudAiX | Added Docs, Support, Security, Changelog, and Status to the authenticated studio navigation config. | Runtime desktop/mobile verification still needed. |
| WordGeni | Added Docs, Support, Changelog, Status, and public Security to the authenticated system navigation. | Runtime desktop/mobile verification still needed. |

The shared shell terminology for future work remains: Ready, Needs setup, Degraded, Unavailable, Draft, and Verified. This pass only changed user-visible copy where the current UI already had a clear loading, access, or utility-navigation surface.

## Phase 6 Dashboard Notes

Phase 6 standardized the main dashboard entry screens for XFlow, Verixet, Rataify, AudAiX, Crevux, and WordGeni. Each now has first-screen framing for product purpose, best next step, readiness/status, primary real actions, and recent activity or an honest empty state.

Remaining dashboard gaps:

- Runtime desktop/mobile verification is still needed for all six apps.
- XFlow still has dense operator panels below the summary; deeper prioritization can follow after screenshot review.
- Verixet still has rich telemetry and diagnostics on the main dashboard; release-gate operator hierarchy should be refined after runtime review.
- Rataify still needs a deeper pass separating diagnostics/live monitor detail from normal trust workflows.
- AudAiX still needs visual hierarchy verification across the detail drawer sections.
- Crevux still needs visual QA for the recruiter-facing first viewport after the action-count reduction.
- WordGeni still needs right-rail and dashboard route hierarchy review after runtime verification.

## Phase 7.5 Product Proof Notes

Phase 7.5 added safe local-only screenshot harnesses for the six core app dashboards and captured current desktop and mobile proof images. The harnesses do not seed databases, call production APIs, bypass production auth, or claim live health.

| App | Local proof route | Remaining UX note |
| --- | --- | --- |
| XFlow | `/local-screenshot/dashboard` | Proof route shows local sample ecosystem state; live workspace data still needs separate authenticated runtime QA. |
| Verixet | `/local-screenshot/dashboard` | Proof route shows local sample release-gate state; live telemetry hierarchy still needs authenticated runtime QA. |
| Rataify | `/__screenshot/dashboard` in non-production Vite builds | Empty/no-selected-site proof state is honest, but the full selected-site trust workflow still needs runtime QA. |
| AudAiX | `/__screenshot/dashboard` in non-production Vite builds | Empty portfolio proof state is honest, but evidence/report detail flows still need runtime QA. |
| Crevux | `/__screenshot/dashboard` in non-production Vite builds | Local empty workspace proof renders cleanly; real asset/job previews still need authenticated runtime QA. |
| WordGeni | `/local-screenshot/dashboard` | Local route disables project API loading and shows empty project state; loading panels below the first screen still need a deeper state pass. |
