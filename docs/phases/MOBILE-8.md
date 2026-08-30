# MOBILE-8 — Embroidery preparation

- Status: PLANNED
- Owning repository: Crevux
- Dependencies: MOBILE-7 PASS; owner-approved output formats and quality criteria

## Objective and product contract

Prepare selected versions through background removal, palette reduction, edge cleanup, separated regions, and explicitly approved raster/vector/embroidery-preparation exports.

## In scope / out of scope

In scope: measurable preparation operations, previews, region/palette metadata, provider cost disclosure, and supported export formats. Out of scope: claiming machine-ready DST/PES digitization without a proven implementation and specialist acceptance.

## Acceptance and automated verification

Transparency, palette bounds, small-region handling, edge quality fixtures, deterministic export, safety/accounting, unsupported-format messaging, and regression tests pass.

## Manual proof

An embroidery specialist reviews representative outputs and confirms the supported handoff formats and limitations.

## Risks, rollback, dependencies

Misrepresenting vectorization as production digitization is the primary risk. Feature-flag the entire workflow; prior editing/export remains unaffected.
