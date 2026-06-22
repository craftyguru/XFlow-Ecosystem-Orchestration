# Stale App Folder Inventory

Date: 2026-05-28

Purpose: classify `apps/*` folders before any cleanup, refactor, or Architecture Doctor scan. This document is evidence for planning only. It does not approve deleting, moving, archiving, or modifying any folder.

## Hard Rules

- Do not delete any app folder without explicit approval.
- Do not treat duplicate XFlow folders as live unless deployment/config evidence proves it.
- Do not scan duplicate, stale, temp, build, or deployment snapshot folders as canonical product source.
- Do not use stale folder contents to decide production architecture unless the file is explicitly referenced by current root scripts, registry docs, deploy config, or imports.

## Classification Summary

| Folder | Classification | Evidence | Cleanup Recommendation |
| --- | --- | --- | --- |
| `apps/XFlow` | Live | Root scripts and docs reference `apps/XFlow`; `ecosystem-contracts/apps.json` lists `apps/XFlow`; `docs/ecosystem-app-registry.md` marks it canonical; package version is `3.3.0`; latest timestamp among XFlow folders; largest route/page count among XFlow folders. | Keep as canonical source. |
| `apps/Verixet` | Live | Root scripts call `npm --prefix apps/Verixet`; registry marks it canonical; package version is `3.3.0`; active billing, Stripe, control-plane, and test scripts. | Keep as canonical source. |
| `apps/AudAix` | Live | Root scripts start AudAiX from `apps/AudAix`; registry marks it canonical; package version is `3.3.0`; active API/dashboard/test/proof scripts. | Keep as canonical source. |
| `apps/RatAiFy` | Live | Root scripts start RatAiFy from `apps/RatAiFy`; registry marks it canonical; package version is `3.3.0`; active Express/Vite/test/control-plane scripts. | Keep as canonical source. |
| `apps/WordGeni` | Live | Root scripts and docs reference `apps/WordGeni`; registry marks it canonical; active web/API/worker scripts. | Keep as canonical source. |
| `apps/CreVux` | Live | Root scripts start CreVux from `apps/CreVux`; registry marks it canonical; active pnpm workspace, API, web, smoke, and deploy scripts. | Keep as canonical source. |
| `apps/XFlow-push-through` | Duplicate / stale candidate | Same package name `xflow`; package version `0.1.0`; older timestamps than `apps/XFlow`; fewer route/page files; not referenced by root scripts found in this pass. | Do not delete yet. Diff against `apps/XFlow`; archive or ignore after approval. |
| `apps/xflow-master-release` | Duplicate / stale candidate | Same package name `xflow`; package version `0.1.0`; older timestamps than `apps/XFlow`; fewer route/page files; not canonical in registry. | Do not delete yet. Treat as release snapshot candidate until diff reviewed. |
| `apps/XFlow-phase4b-pr` | Duplicate / stale candidate | Same package name `xflow`; package version `0.1.0`; older timestamps than `apps/XFlow`; fewer route/page files; name indicates PR snapshot. | Do not delete yet. Treat as PR snapshot candidate until diff reviewed. |

## Evidence Notes

Observed root app folders:

- `apps/AudAix`
- `apps/CreVux`
- `apps/RatAiFy`
- `apps/Verixet`
- `apps/WordGeni`
- `apps/XFlow`
- `apps/xflow-master-release`
- `apps/XFlow-phase4b-pr`
- `apps/XFlow-push-through`

Root package scripts reference the canonical six app roots:

- `apps/XFlow`
- `apps/Verixet`
- `apps/RatAiFy`
- `apps/AudAix`
- `apps/WordGeni`
- `apps/CreVux`

The human registry `docs/ecosystem-app-registry.md` and machine registry `ecosystem-contracts/apps.json` identify the canonical six app roots. They do not identify the duplicate XFlow folders as canonical app roots.

The duplicate XFlow folders each contain their own `.git`, `Dockerfile`, `docs`, and `package.json`, so they are not empty artifacts. They must be treated as potentially valuable snapshots until a diff review proves otherwise.

## Cleanup Plan Before Any Deletion

1. Generate a non-destructive diff summary for each duplicate XFlow folder against `apps/XFlow`.
2. Identify files present only in duplicates.
3. Identify files newer than their `apps/XFlow` equivalents.
4. Identify migrations, scripts, docs, or tests that do not exist in canonical `apps/XFlow`.
5. Decide whether each duplicate is:
   - archive-only,
   - contains changes to cherry-pick,
   - safe to ignore in scans,
   - safe to move under an archive folder,
   - unsafe to delete.
6. Add scanner ignore rules before running Architecture Doctor on the workspace.
7. Only after approval, perform any move/archive/delete action.

## Architecture Doctor Default Ignore Recommendation

Architecture Doctor should ignore these folders by default unless a user explicitly selects them as historical snapshots:

- `apps/XFlow-push-through`
- `apps/xflow-master-release`
- `apps/XFlow-phase4b-pr`
- `tmp`
- `.next`
- `node_modules`
- `dist`
- `build`
- `coverage`
- `.cache`
- `.railway-links`
- `test-results`
- deployment worktrees or snapshots under `tmp/*`

