# Contributing

This workspace is a six-app ecosystem plus a root orchestration repository.

## Where to work

- Root repo: docs, proof scripts, shared packages, `supabase/`, CI.
- Product apps: independent git repositories for the six core apps under `apps/` (XFlow, Verixet, RatAiFy, AudAix, CreVux, WordGeni). They are not part of the root git tree.
- PitStrike is a personal user-connected app, not an ecosystem product. Do not treat it as a rollout or phase target.

## Agent workflow

Cursor and Codex follow `docs/development-workflow.md` and `.cursor/rules/`. Durable agent constraints live in `AGENTS.md`.

Spoken shortcuts such as `Start Phase 15`, `Close Phase 15`, `Prepare a Codex handoff`, and `Create an isolated worktree for this` are defined in that workflow.

## Validation

There is no root `lint` / `typecheck` / `test` / `build` script. Use the commands in `docs/ecosystem-root-runbook.md` for each app, and the root proof scripts documented in `docs/development-workflow.md`.

## Safety

Do not reset, clean, or stash a dirty tree unless the owner explicitly requests that operation. Do not commit secrets. Do not let two agents edit the same implementation area in the same worktree.
