# MOBILE-5 — Masks, iterative editing, and history

- Status: PLANNED
- Owning repository: Crevux
- Dependency: MOBILE-4 PASS

## Objective and product contract

Add a performant non-destructive mask editor, touch/generic-stylus input, immutable version lineage, variant selection, and conversational refinement that never overwrites the original.

## In scope / out of scope

In scope: native mask surface, brush/erase/invert/clear/undo/redo, source-dimension normalization, prompt/mask snapshots, parent versions, comparison, and history. Out of scope: Fold8 S Pen claims, guaranteed identity preservation, and embroidery.

## Acceptance and automated verification

- Mask dimensions/alpha and authorization are validated server-side.
- Undo/redo, process restore, lineage, parent/child jobs, provider refusal, identity/composition drift fixtures, and editor memory/latency tests pass.
- Touch remains fully functional when stylus signals are absent.

## Manual proof

Review touch masking on Fold8 and generic stylus pressure/tool behavior on separately supported hardware.

## Risks, rollback, dependencies

Canvas latency and misleading identity claims are primary risks. Feature-flag masked operations; prompt/reference edits remain available.
