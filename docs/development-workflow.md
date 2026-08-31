# Development Workflow

This document is the human-readable Cursor + Codex workflow for the XFlow ecosystem workspace. Cursor rules under `.cursor/rules/` enforce the same policy during agent sessions. `AGENTS.md` holds durable agent constraints, including XFlow Builder routing.

Scale the process to risk. A one-line docs fix does not need a worktree, handoff, or phase closeout. A named product phase does.

## Repository shape

This folder is a **parent orchestration repo**, not a single application and not a unified npm workspace.

| Layer | What it is | Git |
| --- | --- | --- |
| Root | Docs, proof scripts, shared packages, `supabase/`, CI | This repository |
| `apps/XFlow`, `apps/Verixet`, `apps/RatAiFy`, `apps/AudAix`, `apps/CreVux`, `apps/WordGeni` | Core product apps | Independent git repos; ignored by root `.gitignore` |
| Personal user-connected apps (including `apps/PitStrike`) | Not part of this ecosystem | Do not configure, phase, or treat as a sixth-plus product. The only valid reference is a user-connected personal app. |

Do not roll out Cursor/Codex ecosystem workflow into PitStrike. Do not add PitStrike to six-app proof, capability catalogs, or phase tracks.

Authority (do not blur):

- Identity / OAuth / UCL routing: XFlow
- Billing / entitlement / usage: Verixet
- Domain data: the owning app

App command matrix: `docs/ecosystem-root-runbook.md`.

## Spoken commands

| You say | Agent does |
| --- | --- |
| Start Phase 15 / Start the next phase / Start Phase NEXT | Phase-start workflow only. No feature implementation unless you also ask. |
| Continue Phase 15 | Resume inside existing scope. |
| Close Phase 15 | Closeout report. Blocked work is not complete. |
| Give this task to Codex / Prepare a Codex handoff | Status, diff, validation, checkpoint if appropriate, handoff template. |
| Take ownership in Cursor | Inspect Codex/protected files, then take implementation ownership. |
| Create an isolated worktree for this | Isolated branch/worktree. Do not edit overlapping files in the dirty main checkout. |

## Phase start

1. Inspect: `node scripts/dev-workflow/inspect-repo.mjs`
2. Confirm branch and dirty-tree categories (workflow vs protected pre-existing files)
3. Read the previous phase closeout if it exists
4. Write goal, in scope, out of scope, acceptance, risks, validation plan
5. Choose owner: Cursor or Codex, one per worktree
6. Choose isolation: same checkout only if the tree is safe for that owner
7. Stop at implementation readiness unless asked to implement

Phases are **named** in this workspace (Chronicle Companion phases, Phase 2F fixtures, Phase 17 proof, and others). Do not assume a single incrementing integer. Inspect `docs/**` before assigning a number.

Templates: `docs/templates/phase-plan.md`, `docs/templates/phase-closeout.md`, `docs/templates/agent-handoff.md`.

## Ownership

One implementation owner per task per working tree.

- Cursor-owned: Cursor may edit. Codex reviews or implements only in another worktree.
- Codex-owned: Cursor inspects and reviews only. No formatting or rewrites of Codex files in the same tree.
- Overlapping auth, schema, lockfiles, CI, or global config: serialize. Do not parallelize.

## Worktrees

Preferred for parallel Cursor/Codex implementation.

Cursor setup: `.cursor/worktrees.json` runs `.cursor/setup-worktree-windows.ps1` or `.cursor/setup-worktree-unix.sh`. Those scripts install **root** npm deps only, copy env **templates**, and never migrate databases or copy secret `.env` files.

A root worktree does **not** include nested app source. App work happens in that app's repository:

```text
git -C apps/XFlow worktree add <path> -b <branch>
```

Manual root worktree:

```text
git worktree add .worktrees/<name> -b <branch>
```

`.worktrees/` is gitignored.

## Branches

Prefer existing names on the current repo. Otherwise:

- `phase/<n>-<short-description>`
- `feature/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `cursor/phase-<n>-<desc>` / `codex/phase-<n>-<desc>` when parallel agents need labels

## Checkpoints

Commits are recovery points, not a diary. Checkpoint before risky architecture, migrations, dependency upgrades, ownership transfer, and known-good slices. Do not mix unrelated dirty files into the commit. Do not create a commit unless asked, except when the user requested checkpoints as part of handoff.

## Validation

Root does **not** define `typecheck`, `lint`, `test`, or `build`.

| Gate | When | Commands |
| --- | --- | --- |
| Fast | Almost every change | `node scripts/dev-workflow/inspect-repo.mjs`; targeted `node --test`; `node scripts/validate-ecosystem-contracts.mjs` if contracts changed |
| Workflow files | This setup | `node --test scripts/dev-workflow/verify-workflow-setup.test.mjs` |
| Shared Supabase | Schema/RLS | `npm run supabase:validate` |
| Auth/service-role | Security boundaries | `npm run proof:security-static` |
| Ecosystem static proof | Contract/proof docs | `npm run proof:ecosystem:static` |
| App implementation | Code in an app repo | That app's lint, typecheck, test, build (npm or pnpm per runbook) |
| Phase acceptance | Named phase closeout | The phase's stated gates, plus required manual QA |

Report PASS, FAIL, BLOCKED, NOT RUN, or MANUAL VERIFICATION REQUIRED. Do not hide failures.

## Coordination-sensitive files

Usually one owner at a time:

- `package.json`, `package-lock.json`, app lockfiles
- `supabase/migrations/**`
- `.github/workflows/**`
- Auth, session, billing, and routing entrypoints in the owning app
- Env templates and CI secrets configuration
- Native packaging (Tauri/Cargo/Gradle) in the owning app

## Generated files and secrets

Ignored at root: `node_modules/`, `dist/`, `.next/`, coverage, Playwright output, `.env` / `.env.*`, keys, `.codex/` local checkouts, `.worktrees/`.

Never commit API keys, tokens, passwords, private keys, or production secrets. Copy `.env.example` / documented templates into a worktree; do not copy live `.env` into git.

## Dangerous operations

Never run unless the user names that exact command: `git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .`, `git stash`, production DB resets, live Stripe execute, or credential rotation.

## Global vs repository rules

Git safety, dirty-tree protection, ownership, worktrees, checkpoints, and truthful validation belong in a **user-level** Cursor rule so other apps inherit them. Repository-specific commands, Supabase, nested `apps/`, and XFlow Builder routing stay here.

Install the user-level rule from `docs/cursor-global-rule.md`.
