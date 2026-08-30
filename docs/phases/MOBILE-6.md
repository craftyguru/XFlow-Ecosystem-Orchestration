# MOBILE-6 — Foldable professional UX and accessibility

- Status: PLANNED
- Owning repository: Crevux
- Dependency: MOBILE-5 PASS

## Objective and product contract

Deliver compact, cover-screen, unfolded two-pane, landscape, tabletop, and multi-window layouts driven by window size and reported folding features, with production-grade accessibility and performance.

## In scope / out of scope

In scope: adaptive navigation/editor layout, hinge avoidance, state continuity, keyboard/voice controls, TalkBack, text scaling, contrast, reduced motion, and memory profiling. Out of scope: model-name pixel branches and unsupported hardware claims.

## Acceptance and automated verification

Screenshot/instrumentation posture matrix, rotation, resize, process restore, accessibility checks, large-text layouts, and performance budgets pass.

## Manual proof

Physical Fold8 review in cover, unfolded, landscape, tabletop where reported, and multi-window modes; TalkBack workflow review.

## Risks, rollback, dependencies

Layout fragmentation is the primary risk. Retain the canonical accessible single-pane layout as the fallback.
