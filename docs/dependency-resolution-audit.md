# XFlow Ecosystem Dependency Resolution Audit

Date:
- 2026-06-21.

Scope:
- Dependency/package-resolution/lockfile audit for WordGeni, XFlow, RatAiFy, Crevux, Verixet, AudAiX, and the root shared UI package.
- No runtime app behavior, auth, database, payment, business logic, nav migration, or mobile wrapper wiring was changed.
- No broad install, lockfile rewrite, or package-lock deletion was performed.

Environment:
- Node: `v22.18.0`.
- npm: `10.9.3`.
- pnpm: `10.30.3`.
- Yarn: not available from the current shell.

## Repository Metadata

| Path | Finding | Risk | Recommended action |
| --- | --- | --- | --- |
| `K:\XFlow-Ecosystem Workspace\.git` | The path exists as an empty directory. `git status` and `git rev-parse --show-toplevel` both fail with `fatal: not a git repository`. | Root-level dirty-state and commit checks are unreliable from the workspace root. App-level nested repositories may still work independently. | Repair or reclone root git metadata as a separate repository maintenance task before any broad dependency cleanup. Do not infer a clean root worktree from this workspace. |

## Package Manager Inventory

| App | Package root inspected | Package manager signal | Lockfiles | Workspace relationship |
| --- | --- | --- | --- | --- |
| WordGeni | `apps/WordGeni` | `packageManager: pnpm@9.15.0` | `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Local pnpm workspace includes `apps/*` and `packages/*` under `apps/WordGeni`. |
| WordGeni web | `apps/WordGeni/apps/web` | Inherits WordGeni pnpm workspace | none at app leaf | Leaf app declares the shared UI dependency directly. |
| XFlow | `apps/XFlow` | no `packageManager` field | `package-lock.json` v3 and `pnpm-lock.yaml` | Mixed npm/pnpm metadata in one app root. |
| RatAiFy | `apps/RatAiFy` | no `packageManager` field | `package-lock.json` v3 | npm app root with app-local package scripts still present. |
| Crevux | `apps/CreVux` | `packageManager: pnpm@10.30.3`, Volta node `22.18.0` | `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Real workspace root for Crevux. Includes `artifacts/*`, `packages/*`, `apps/*`, `lib/*`, and scripts. |
| Crevux image-gen | `apps/CreVux/artifacts/image-gen` | Inherits Crevux pnpm workspace | none at app leaf | Active web app package inside Crevux pnpm workspace. |
| Verixet | `apps/Verixet` | no `packageManager` field | `package-lock.json` v3 | npm app root. |
| AudAiX dashboard | `apps/AudAiX/dashboard` | no `packageManager` field | `package-lock.json` v3 | npm app root nested under AudAiX. |
| Shared UI package | `packages/ecosystem-assistant-ui` | no `packageManager` field | `package-lock.json` v3 | Root shared package; consumed by file dependencies and explicit aliases. |

## Lockfile Findings

| App | Lockfile state | Finding | Recommended cleanup |
| --- | --- | --- | --- |
| WordGeni | pnpm lockfile only at `apps/WordGeni` | Workspace lock is coherent for a pnpm app, but the web leaf dependency points to an app-local shared package copy while TypeScript points to the root package. | Align the web leaf dependency with the root shared package or intentionally document the app-local junction as a temporary compatibility bridge. |
| XFlow | npm v3 lock plus pnpm lock | `package-lock.json` records `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../../packages/ecosystem-assistant-ui`; `node_modules` junction points to the root package. A second `pnpm-lock.yaml` exists in the same app. | Choose one package manager for XFlow. Prefer npm if keeping the current v3 lockfile; retire or regenerate the pnpm lock only in a dedicated cleanup pass. |
| RatAiFy | npm v3 lock | `package-lock.json` records the root shared UI file dependency, but installed `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` is still a junction to `apps/RatAiFy/packages/ecosystem-assistant-ui`. | Rebuild installed links in a controlled npm install pass after root git metadata is healthy. Do not trust current `node_modules` as proof of lockfile resolution. |
| Crevux | pnpm lock at `apps/CreVux`; no lock at image-gen leaf | Active image-gen package declares root shared UI dependency through `file:../../../../packages/ecosystem-assistant-ui`. Installed link currently goes through Crevux's pnpm store path. | Keep using the Crevux pnpm workspace. Avoid adding a leaf lockfile under `artifacts/image-gen`. |
| Verixet | npm v3 lock | `package-lock.json` records root shared UI dependency, while installed `node_modules` still points to `apps/Verixet/packages/ecosystem-assistant-ui`. | Rebuild installed links in a controlled npm install pass; keep the root shared-package aliases until installed state is cleaned. |
| AudAiX dashboard | npm v3 lock | `package-lock.json` records root shared UI dependency, while installed `node_modules` points to `apps/AudAix/packages/ecosystem-assistant-ui`. | Rebuild installed links in a controlled npm install pass; keep Vite/Vitest/TS root aliases until installed state is cleaned. |
| Shared UI package | npm v3 lock | Small package-local lockfile; no shared UI dependency. | Healthy enough for current typecheck/test. |

## Shared UI Resolution Table

| App | `package.json` dependency | TS alias | bundler/test alias | Installed `node_modules` target | Stale local copy |
| --- | --- | --- | --- | --- | --- |
| WordGeni web | `file:../../packages/ecosystem-assistant-ui`, which resolves to `apps/WordGeni/packages/ecosystem-assistant-ui` from the web leaf | root `../../../../packages/ecosystem-assistant-ui/dist/index` | not found in inspected config | junction to `apps/WordGeni/packages/ecosystem-assistant-ui` | App-local copy is partially synced: source/dist match root nav exports, but package metadata is older and dependency still targets local copy. |
| XFlow | `file:../../packages/ecosystem-assistant-ui` | root `../../packages/ecosystem-assistant-ui/dist/index` | Vitest root dist alias | junction to root `packages/ecosystem-assistant-ui` | No app-local shared UI copy found in the inspected paths. |
| RatAiFy | `file:../../packages/ecosystem-assistant-ui` | root source alias | Vite root dist alias | junction to `apps/RatAiFy/packages/ecosystem-assistant-ui` | Yes. Local copy is stale relative to root package and current lock metadata. |
| Crevux image-gen | `file:../../../../packages/ecosystem-assistant-ui` | root dist alias | Vite root dist alias; Vitest root source alias | pnpm store link from Crevux workspace | Yes at `apps/CreVux/packages/ecosystem-assistant-ui`; active image-gen imports are aliased to root, but stale local package remains on disk. |
| Verixet | `file:../../packages/ecosystem-assistant-ui` | root dist alias | Next/Vitest root dist alias | junction to `apps/Verixet/packages/ecosystem-assistant-ui` | Yes. Local copy is stale and installed link conflicts with package-lock metadata; aliases currently protect builds/tests. |
| AudAiX dashboard | `file:../../../packages/ecosystem-assistant-ui` | root dist alias | Vite/Vitest root dist alias | junction to `apps/AudAix/packages/ecosystem-assistant-ui` | Yes. Local copy is stale and installed link conflicts with package-lock metadata; aliases currently protect builds/tests. |

## Stale Vendored Copy Findings

| Local copy | State | Risk |
| --- | --- | --- |
| `apps/WordGeni/packages/ecosystem-assistant-ui` | Source/dist match the root nav-enabled code closely, but package metadata is older and lacks `sideEffects`/`files`. | Split resolution remains: package install uses local copy, TypeScript uses root dist. |
| `apps/RatAiFy/packages/ecosystem-assistant-ui` | Older source/dist and older package metadata. | Installed junction points here even though lockfile declares root file dependency. Runtime/test paths can differ from Vite/TS aliases. |
| `apps/CreVux/packages/ecosystem-assistant-ui` | Older source/dist and older package metadata. | Stale copy can confuse workspace scripts or future installs, even though active image-gen aliases use root. |
| `apps/Verixet/packages/ecosystem-assistant-ui` | Older source/dist; metadata has `sideEffects`/`files` but not current root size/content. | Installed junction points here while Next/Vitest/TS aliases point to root dist. |
| `apps/AudAiX/packages/ecosystem-assistant-ui` | Older source/dist; metadata has `sideEffects`/`files` but not current root size/content. | Installed junction points here while Vite/Vitest/TS aliases point to root dist. |

## npm/arborist Findings

Prior recorded failure:
- `docs/navigation-shell-audit.md` records that `npm --prefix apps/XFlow install --ignore-scripts --package-lock-only --loglevel verbose` and `npm --prefix apps/RatAiFy install --ignore-scripts --package-lock-only --loglevel verbose` previously failed in npm/arborist at `@npmcli/arborist/lib/arborist/reify.js:updateNodes` with `Cannot read properties of undefined (reading 'spec')`.

Safe reproduction attempt in this pass:
- `npm install --package-lock-only --ignore-scripts --dry-run --no-audit --no-fund` in `apps/XFlow`: passed with `up to date`.
- `npm install --package-lock-only --ignore-scripts --dry-run --no-audit --no-fund` in `apps/RatAiFy`: passed with `up to date`.

Interpretation:
- The prior non-dry-run arborist issue is not currently reproduced by dry-run under Node `v22.18.0` and npm `10.9.3`.
- The likely trigger remains the combination of nested app-local package copies, edited `file:` dependencies, and existing `node_modules` junctions that do not match lockfile metadata.
- A non-dry-run package-lock-only install may still be risky until the root git metadata and installed-link cleanup plan are in place.

Recommended arborist cleanup path:
- First repair root git metadata or run in a clean clone so lockfile changes can be reviewed.
- For XFlow, decide whether npm or pnpm owns the app. Do not keep both lockfiles long-term.
- For RatAiFy, Verixet, AudAiX, and WordGeni, remove or retire stale app-local shared UI package copies only after package aliases and installed junctions are deliberately updated.
- Run package-manager cleanup one app at a time with `--ignore-scripts`, review lockfile diffs, then run the affected app's typecheck, focused nav/package tests, and build if package metadata changed.

## Recommended Cleanup Order

1. Repair root repository metadata or move the dependency cleanup into a clean clone.
2. Build the root shared UI package and keep `packages/ecosystem-assistant-ui` as the only intended source of navigation shell exports.
3. XFlow: choose npm vs pnpm ownership; if npm remains canonical, remove or regenerate the app-level pnpm lock in a dedicated diff.
4. WordGeni: align `apps/WordGeni/apps/web/package.json` with the root shared UI package or document the local copy as a temporary pnpm workspace bridge; then remove the split TypeScript/package resolution.
5. RatAiFy: rebuild npm installed links so `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` matches the package-lock root file dependency; then retire `apps/RatAiFy/packages/ecosystem-assistant-ui`.
6. Verixet: rebuild npm installed links after preserving the local-only QA DB harness files; then retire `apps/Verixet/packages/ecosystem-assistant-ui`.
7. AudAiX: rebuild npm installed links and remove the dashboard/local junction caveat; then retire `apps/AudAiX/packages/ecosystem-assistant-ui`.
8. Crevux: keep pnpm workspace ownership; remove stale `apps/CreVux/packages/ecosystem-assistant-ui` only after confirming no workspace package/script still references it.

## Risk Notes

- Do not run broad root installs until `.git` is repaired; the root has both npm and pnpm lock metadata and cannot currently provide reliable repository diffs.
- Do not delete stale local package copies until installed junctions and package-manager ownership are intentionally updated.
- Keep app bundler/test aliases pointing at the root shared UI package until each app's installed package link is verified.
- Crevux is pnpm-owned and has preinstall enforcement; do not use npm inside the Crevux workspace.
- XFlow's mixed npm/pnpm lockfiles are the highest lockfile-policy risk.
- RatAiFy, Verixet, and AudAiX have the highest installed-state risk because package-lock metadata and current `node_modules` junction targets disagree.

## Mobile Wrapper Readiness

It is safe to continue mobile wrapper design/implementation work if the next pass avoids dependency installs and continues using the existing root shared UI aliases. For any pass that needs install or lockfile changes, do the dependency cleanup first in a clean git state.

## Root Git and Lockfile Audit Refresh

Date:
- 2026-06-21.

Scope:
- Read-only repository, package-manager, lockfile, shared-package-resolution, and script-assumption audit after shared navigation/sidebar runtime work was closed out.
- No Git metadata repair, dependency install, package-manager lockfile rewrite, `node_modules` deletion, local package-copy deletion, runtime app code change, backend/auth/database/payment/business-logic change, push, or broad formatting was performed.

### Current Git/root state

| Path | State | Evidence | Required before broad cleanup |
| --- | --- | --- | --- |
| `K:\XFlow-Ecosystem Workspace` | Not a usable Git repository. `.git` exists as a directory, but root `git rev-parse --show-toplevel`, `git status --short`, and `git remote -v` fail with `fatal: not a git repository`. | Root `.git` was found by `Get-ChildItem -Force`; Git commands fail from workspace root. | Decide whether to repair existing root Git metadata or move dependency cleanup to a clean clone before any lockfile/package-copy cleanup. |
| `packages/ecosystem-assistant-ui` | No nested repo detected for the package itself; it sits under the broken root. | `git rev-parse --show-toplevel` from the package returned no top-level path. | Treat package changes as root-workspace changes until root Git state is repaired or a clean clone is used. |

Nested repo inventory:

| Path | Git top | Branch | Remote |
| --- | --- | --- | --- |
| `apps/WordGeni` | `apps/WordGeni` | `main` | `https://github.com/craftyguru/WordGeni.git` |
| `apps/XFlow` | `apps/XFlow` | `master` | `https://github.com/craftyguru/xflowx.git` |
| `apps/RatAiFy` | `apps/RatAiFy` | `main` | `git://gitsafe:5418/backup.git` |
| `apps/CreVux` | `apps/CreVux` | `main` | `git://gitsafe:5418/backup.git` |
| `apps/CreVux/artifacts/image-gen` | `apps/CreVux` | `main` | inherits Crevux repo |
| `apps/Verixet` | `apps/Verixet` | `main` | `https://github.com/craftyguru/verixet.git` |
| `apps/AudAix` | `apps/AudAix` | `main` | `https://github.com/craftyguru/AudAiX.git` |
| `apps/AudAix/dashboard` | `apps/AudAix` | `main` | inherits AudAiX repo |

Additional `.git` directories found within the sane-depth scan:
- `apps/PitStrike/.git`.
- `apps/XFlow/vendor/ecosystem-showcase/.git`.
- `packages/ecosystem-showcase/.git`.
- `xflow-ecosystem-ops/.git`.

Nested repo dirty-state summary:

| Repo/path | `git status --short` count | Note |
| --- | ---: | --- |
| `apps/WordGeni` | 16 | Existing modified app files remain; do not conflate with dependency cleanup. |
| `apps/XFlow` | 15 | Includes package/lockfile changes already present from earlier work. |
| `apps/RatAiFy` | 15 | Existing modified app files remain. |
| `apps/CreVux` | 12 | Existing modified app/package files remain. |
| `apps/Verixet` | 21 | Existing modified app/package files remain. |
| `apps/AudAix` | 16 | Existing dashboard package/config/nav files remain. |
| `packages/ecosystem-assistant-ui` | 0 | No nested Git repo; command did not report tracked package status. |

Interpretation:
- This workspace is a copied or partially assembled multi-repo folder, not a single healthy monorepo checkout.
- Root-level cleanup cannot be safely reviewed or committed until root Git metadata is repaired or the work is repeated in a clean clone.
- App-level repos are real and independently dirty; inspect each app repo before editing its package files.

### Package manager and lockfile refresh

| Target | Package-manager signal | Lockfiles/config present | Canonical command style for later verification | Ownership risk |
| --- | --- | --- | --- | --- |
| `packages/ecosystem-assistant-ui` | no `packageManager` field | `package-lock.json` | `npm --prefix packages/ecosystem-assistant-ui ...` | Root package is outside a healthy root repo; still safe for local typecheck/test. |
| `apps/WordGeni` | `packageManager: pnpm@9.15.0` | `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `pnpm --dir apps/WordGeni ...` or existing `npm --prefix apps/WordGeni ...` only where scripts already use npm safely | pnpm-owned app; web leaf has split shared-package resolution. |
| `apps/WordGeni/apps/web` | inherits WordGeni workspace | no leaf lockfile | use parent WordGeni workspace commands | Leaf `file:../../packages/ecosystem-assistant-ui` resolves to WordGeni-local package copy, while TS paths point to root shared UI dist. |
| `apps/XFlow` | no `packageManager` field | `package-lock.json`, `pnpm-lock.yaml` | existing npm scripts such as `npm --prefix apps/XFlow run typecheck` after ownership decision | Highest mixed-lockfile risk; do not keep npm and pnpm lock ownership long-term. |
| `apps/RatAiFy` | no `packageManager` field | `package-lock.json` | existing npm scripts such as `npm --prefix apps/RatAiFy run typecheck` | npm lockfile says root shared UI, installed junction points to stale local copy. |
| `apps/CreVux` | `packageManager: pnpm@10.30.3`, `.npmrc` | `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc` | `pnpm --dir apps/CreVux ...` and workspace filters | pnpm-owned; do not use npm inside this workspace. |
| `apps/CreVux/artifacts/image-gen` | inherits Crevux workspace | no leaf lockfile | `pnpm --dir apps/CreVux --filter @workspace/image-gen ...` | Active leaf depends on root shared package; stale Crevux-local shared UI copy remains on disk. |
| `apps/Verixet` | no `packageManager` field | `package-lock.json` | existing npm scripts such as `npm --prefix apps/Verixet run typecheck` | npm lockfile says root shared UI, installed junction points to stale local copy. |
| `apps/AudAix/dashboard` | no `packageManager` field | `package-lock.json` | existing npm scripts such as `npm --prefix apps/AudAix/dashboard run typecheck` | npm lockfile says root shared UI, installed junction points to stale AudAiX-local copy. |

Commands that would mutate or should be avoided until Stage A/B:
- Any broad root `npm install`, `pnpm install`, or package-manager install from `K:\XFlow-Ecosystem Workspace`.
- Any non-dry-run `npm install --package-lock-only` in XFlow/RatAiFy/Verixet/AudAiX before root Git and app dirty states are understood.
- Any `pnpm install` in XFlow while package-manager ownership is undecided.
- Any `npm install` inside `apps/CreVux`, because Crevux is pnpm-owned and has a preinstall/package-manager expectation.
- Any deletion of `node_modules`, app-local `packages/ecosystem-assistant-ui`, `package-lock.json`, or `pnpm-lock.yaml` without a clean Git baseline and app-specific repair plan.
- Any script that seeds, migrates, pushes DB schema, touches Stripe/payment resources, or runs production smoke tests as part of dependency cleanup.

### Shared package resolution refresh

| App | Package dependency | TS alias | Bundler/test alias | Lockfile reference | Installed link target | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| WordGeni web | `file:../../packages/ecosystem-assistant-ui` | root `../../../../packages/ecosystem-assistant-ui/dist/index` | none found in inspected config | pnpm lock links `../../packages/ecosystem-assistant-ui` within WordGeni workspace | `apps/WordGeni/packages/ecosystem-assistant-ui` | Split runtime/package install vs TypeScript resolution. |
| XFlow | `file:../../packages/ecosystem-assistant-ui` | root dist | Vitest root dist | npm and pnpm locks both reference root `../../packages/ecosystem-assistant-ui` | root `packages/ecosystem-assistant-ui` | Cleanest installed link, but mixed npm/pnpm lock ownership remains. |
| RatAiFy | `file:../../packages/ecosystem-assistant-ui` | root source | Vite root dist | npm lock references root `../../packages/ecosystem-assistant-ui` | `apps/RatAiFy/packages/ecosystem-assistant-ui` | Installed link conflicts with lockfile/aliases. |
| Crevux image-gen | `file:../../../../packages/ecosystem-assistant-ui` | root dist | Vite root dist; Vitest root source | pnpm lock references root shared package through Crevux workspace | pnpm store path for root shared package | Active app resolves to root, but stale `apps/CreVux/packages/ecosystem-assistant-ui` remains. |
| Verixet | `file:../../packages/ecosystem-assistant-ui` | root dist | Next/Vitest root dist | npm lock references root `../../packages/ecosystem-assistant-ui` | `apps/Verixet/packages/ecosystem-assistant-ui` | Installed link conflicts with lockfile/aliases. |
| AudAiX dashboard | `file:../../../packages/ecosystem-assistant-ui` | root dist | Vite/Vitest root dist | npm lock references root `../../../packages/ecosystem-assistant-ui` | `apps/AudAix/packages/ecosystem-assistant-ui` | Installed link conflicts with lockfile/aliases. |

Stale app-local shared UI package copies still present:
- `apps/WordGeni/packages/ecosystem-assistant-ui`.
- `apps/RatAiFy/packages/ecosystem-assistant-ui`.
- `apps/CreVux/packages/ecosystem-assistant-ui`.
- `apps/Verixet/packages/ecosystem-assistant-ui`.
- `apps/AudAix/packages/ecosystem-assistant-ui`.

Future repair needed:
- Make `packages/ecosystem-assistant-ui` the single canonical source.
- Update package dependencies, TS paths, Vite/Next/Vitest aliases, and installed package links app by app.
- Remove or quarantine stale app-local copies only after imports, lockfiles, and installed links are aligned and verified.

### Script and CI assumptions

Safe verification commands for later app-specific passes:
- Shared package: `npm --prefix packages/ecosystem-assistant-ui run typecheck`; `npm --prefix packages/ecosystem-assistant-ui test`.
- WordGeni: use pnpm workspace ownership; prefer existing typecheck/test/build scripts through `apps/WordGeni` after deciding exact invocation.
- XFlow: existing npm scripts are the current safest app verification style, but package-manager ownership must be settled before install/lockfile work.
- RatAiFy: existing npm scripts are the current safest app verification style; avoid `build:packages` as a cleanup signal until local package copies are deliberately retired.
- Crevux: use pnpm workspace commands only.
- Verixet: existing npm scripts are the current safest app verification style; keep local-only DB harness boundaries.
- AudAiX dashboard: existing npm scripts are the current safest dashboard verification style.

Commands to classify as mutating/high-risk in cleanup prompts:
- `db:migrate`, `db:push`, `db:seed`, `reset-db`, `bootstrap:*`, `stripe:*`, `billing:*:execute`, production smoke/live scripts, and any script that writes hosted service state.
- `npm install`, `pnpm install`, package-lock-only rewrites, and lockfile regeneration commands unless the specific stage authorizes them.

### Staged cleanup plan

Stage A - root Git metadata decision:
1. Decide whether to repair the existing root `.git` directory or move dependency cleanup to a clean root clone.
2. Before touching package files, verify each nested app repo branch, remote, and dirty state.
3. Establish where root-level docs and `packages/ecosystem-assistant-ui` changes will be committed.
4. Stop if root Git remains unhealthy.

Stage B - package manager ownership:
1. Mark Crevux and WordGeni as pnpm-owned.
2. Mark RatAiFy, Verixet, AudAiX dashboard, and the shared UI package as npm-owned unless a later app-specific decision changes that.
3. Resolve XFlow ownership explicitly. Prefer npm if preserving the current `package-lock.json` workflow; retire or regenerate the `pnpm-lock.yaml` only in a dedicated reviewed diff.
4. Stop after each app ownership change and run that app's non-install verification commands.

Stage C - shared package resolution:
1. Keep `packages/ecosystem-assistant-ui` canonical.
2. WordGeni first: remove split package dependency vs TypeScript resolution by pointing the web dependency at the root package or intentionally retaining the local bridge with explicit docs.
3. RatAiFy, Verixet, AudAiX: rebuild installed links so `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` matches the root file dependency, then retire stale app-local package copies.
4. Crevux: confirm no workspace script still references `apps/CreVux/packages/ecosystem-assistant-ui`, then retire the stale copy in a pnpm-aware pass.
5. Stop before deleting any local package copy unless all aliases, dependencies, lockfiles, and installed links are verified.

Stage D - app-by-app verification:
1. Shared package typecheck/test.
2. WordGeni typecheck/test/build using pnpm workspace ownership.
3. XFlow typecheck/test/build after lock ownership decision.
4. RatAiFy typecheck, focused sidebar/package tests, smoke auth where safe, and build.
5. Crevux image-gen typecheck/test:unit/build through pnpm.
6. Verixet typecheck/test/build with local-only DB harness boundaries preserved.
7. AudAiX dashboard typecheck/test/build.

Stage E - final dependency verification:
1. Review lockfile diffs; accept only expected app-specific churn.
2. Confirm no stale app-local `ecosystem-assistant-ui` copy remains unless deliberately documented.
3. Confirm all app aliases and installed links point to the root shared package.
4. Run browser smoke only if dependency changes affect runtime bundling or app startup.

### Future repair prompts

Prompt 1 - Root Git repair decision:
- "Inspect and repair or replace the root Git metadata for `K:\XFlow-Ecosystem Workspace` without changing app runtime code. Confirm whether this workspace should be a single root repo, a multi-repo folder, or a clean reclone target. Do not run installs or modify lockfiles."

Prompt 2 - XFlow package-manager ownership:
- "Resolve XFlow npm/pnpm lockfile ownership in `apps/XFlow` after root Git is healthy. Choose the canonical package manager, update only the conflicting lockfile metadata needed for that choice, and run XFlow typecheck/test/build. Do not touch runtime nav code."

Prompt 3 - Shared UI de-vendor cleanup:
- "Make `packages/ecosystem-assistant-ui` the canonical installed dependency app by app. Align package dependencies, TS aliases, bundler/test aliases, and installed links; then retire stale app-local shared UI copies only after verification. Work one app at a time."

Prompt 4 - WordGeni split-resolution cleanup:
- "Resolve WordGeni web's split shared UI resolution between `apps/WordGeni/packages/ecosystem-assistant-ui` and root `packages/ecosystem-assistant-ui`. Preserve the accepted dashboard nav behavior and run WordGeni typecheck/test/build."

What was not changed in this pass:
- No runtime source files.
- No package files.
- No lockfiles.
- No `node_modules` contents.
- No local package copies.
- No Git metadata.
- No backend/auth/database/payment/business logic.

## Root Git Repair Decision Plan

Date:
- 2026-06-21.

Scope:
- Follow-up inspection of the broken root Git metadata after the dependency audit refresh.
- No Git metadata was repaired, removed, initialized, or overwritten.
- No installs, lockfile rewrites, package changes, runtime changes, or broad formatting were performed.

Root `.git` finding:
- `K:\XFlow-Ecosystem Workspace\.git` is an empty directory.
- `Get-ChildItem -Force .git` returned zero children.
- There is no root `.git\HEAD`, `.git\config`, `.git\objects`, `.git\refs`, or index to recover locally.
- Root Git commands still fail with `fatal: not a git repository`.

Root repo markers that suggest this folder was intended to have root-level source control:
- `.github/workflows/ecosystem-proof.yml` exists and defines root CI.
- Root `package.json` exists and defines ecosystem proof, security, smoke, validation, and shared-package scripts.
- Root `package-lock.json` and root `pnpm-lock.yaml` both exist.
- Root `.gitignore` exists but is very small: `.env.shared.local`, `.env.*.local`, `output/dev/`, and `output/staging/`.
- Root `packages/*`, `scripts/*`, `docs/*`, `ecosystem-contracts/*`, and workflow files are not covered by any working root Git metadata.

Important nested-repo boundary:
- Several app folders are real independent Git repositories: WordGeni, XFlow, RatAiFy, Crevux, Verixet, and AudAiX.
- `packages/ecosystem-showcase` is also its own nested Git repository.
- `packages/ecosystem-assistant-ui`, `packages/ecosystem-assistant`, `packages/ecosystem-contracts`, and `packages/ecosystem-supabase` do not have their own `.git` directories in the inspected tree and currently depend on root Git metadata for source control.

Repair options:

| Option | What it does | Pros | Risks | Recommendation |
| --- | --- | --- | --- | --- |
| A. Clean root reclone | Create or use a clean checkout of the intended root repository, then copy only reviewed workspace changes into it. | Safest review path; preserves Git history and remote configuration from a known source. | Requires knowing the intended root repository URL and branch. Must reconcile nested repos carefully. | Preferred if the root repo remote is known. |
| B. Restore `.git` from backup | Replace the empty `.git` directory with a verified backup of the same root repository metadata. | Can preserve local branch/remotes/history if the backup matches this exact tree. | Dangerous if backup does not match the working tree; can misrepresent file history. | Acceptable only with a verified backup from this workspace. |
| C. Initialize a new root repo | Run `git init` at the workspace root and create a new baseline commit after reviewing nested repo boundaries. | Works without original remote metadata. | Loses previous root history and can accidentally track nested repo contents, evidence, env files, logs, or large generated files. | Use only if this is intentionally becoming a new root repo. |
| D. Keep multi-repo folder without root Git | Treat the root as an orchestration folder and commit only inside nested app/package repos. | Avoids inventing root history. | Leaves docs, root scripts, root packages without reliable source control unless each is moved into a repo. | Not recommended for ongoing shared package/dependency cleanup. |

Safe command sequence for a later repair pass:

1. Confirm intended root repository URL, branch, and whether nested app repos should remain nested independent repos or become submodules/ignored folders.
2. Export an inventory before touching Git metadata:
   - `Get-ChildItem -Force .git`
   - `Get-ChildItem -Force -Directory -Depth 4 -Filter .git`
   - per nested repo: `git rev-parse --show-toplevel`, `git branch --show-current`, `git remote -v`, `git status --short`
3. Back up the empty root `.git` directory path state, even though it has no children.
4. If using a clean clone, clone outside `K:\XFlow-Ecosystem Workspace`, then compare:
   - root `package.json`
   - root lockfiles
   - `.github/workflows/ecosystem-proof.yml`
   - `docs/`
   - `scripts/`
   - `packages/`
   - `ecosystem-contracts/`
5. Copy only reviewed docs/package/script changes into the clean clone.
6. Run non-mutating verification first:
   - `npm --prefix packages/ecosystem-assistant-ui run typecheck`
   - `npm --prefix packages/ecosystem-assistant-ui test`
7. Only after Git is healthy, start package-manager cleanup one app at a time.

Commands to avoid in the root repair pass:
- `git init` unless the user explicitly chooses new-root history.
- `git remote add` unless the intended root remote is known.
- `git add .` before `.gitignore` and nested repo treatment are reviewed.
- `git clean`, `git reset --hard`, `git checkout --`, or any destructive Git command.
- Any dependency install, lockfile rewrite, or package-copy deletion.

Stop point:
- The root `.git` directory is empty and cannot be repaired from local metadata alone.
- The next action requires a decision: provide the intended root repository remote/branch, provide a verified `.git` backup, or explicitly approve creating a new root repository baseline.

## Root Git Baseline Decision

Date:
- 2026-06-21.

Scope:
- Documentation-only root Git baseline decision pass.
- No root `.git` deletion, `git init`, clone, dependency install, lockfile rewrite, `node_modules` deletion, local package-copy deletion, runtime app code change, backend/auth/database/payment/business-logic change, or push was performed.

### Root project shape

Root-level files and folders inspected:
- Present: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `.gitignore`, `.github/workflows/ecosystem-proof.yml`, `docs/`, `packages/`, `apps/`, `scripts/`, `infra/`, `supabase/`, `ecosystem-contracts/`, and `artifacts/`.
- Not present at root: `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `tsconfig.json`, `tsconfig.base.json`, or root `README.md`.

Root project signals:
- `docs/ecosystem-root-runbook.md` states that the root is a parent folder, not a unified package workspace, and warns not to run install/build/test commands from the root unless a future root workspace is intentionally added.
- Root `package.json` still defines orchestration scripts for ecosystem contracts, shared packages, proof runs, security harnesses, and public smoke checks.
- Root `.github/workflows/ecosystem-proof.yml` exists and uses root `npm ci --ignore-scripts`, root proof scripts, root contract files, and root output artifacts.
- Root `packages/` contains shared packages such as `ecosystem-assistant`, `ecosystem-assistant-ui`, `ecosystem-contracts`, and `ecosystem-supabase`; these do not have their own `.git` directories in the inspected tree.
- Root `apps/` contains several independent nested Git repos.

Classification:
- This is a hybrid orchestration workspace: it is not a clean package-manager monorepo, but it is also not merely a disposable parent folder because root docs, scripts, workflow files, contracts, and shared packages need source-control coverage.
- The root `.git` metadata is missing/empty, so the hybrid root cannot currently provide reliable diffs, commits, or lockfile review.

### Nested repo safety inventory

| Nested repo | Git top | Branch | Remote | Dirty count | Independent repo assessment |
| --- | --- | --- | --- | ---: | --- |
| `apps/WordGeni` | `apps/WordGeni` | `main` | `https://github.com/craftyguru/WordGeni.git` | 16 | Real independent repo; dirty state must be preserved and reviewed separately. |
| `apps/XFlow` | `apps/XFlow` | `master` | `https://github.com/craftyguru/xflowx.git` | 15 | Real independent repo; dirty package/lockfile state already exists. |
| `apps/RatAiFy` | `apps/RatAiFy` | `main` | `git://gitsafe:5418/backup.git` | 15 | Real independent repo; remote is a local/private backup endpoint, not a public GitHub remote. |
| `apps/CreVux` | `apps/CreVux` | `main` | `git://gitsafe:5418/backup.git` | 12 | Real independent repo; `artifacts/image-gen` is owned by this repo. |
| `apps/Verixet` | `apps/Verixet` | `main` | `https://github.com/craftyguru/verixet.git` | 21 | Real independent repo; local-only DB harness and package changes must remain app-scoped. |
| `apps/AudAix` | `apps/AudAix` | `main` | `https://github.com/craftyguru/AudAiX.git` | 16 | Real independent repo; `dashboard/` is owned by this repo. |

Nested repos appear safe to treat as independent repositories, but not safe to blindly add from a new root repo. A future root `.gitignore` or submodule strategy must prevent accidentally tracking nested repo internals, `node_modules`, app evidence, env files, and generated output.

### Possible root remote clues

High-confidence root remote:
- None found.

Moderate/low-confidence clues:
- Nested app remotes use `craftyguru` GitHub repositories for WordGeni, XFlow, Verixet, and AudAiX.
- Root workflow is named `Ecosystem Proof`, root package scripts refer to ecosystem-level proof/security/contract checks, and docs repeatedly use `K:\XFlow-Ecosystem Workspace`.
- These clues suggest a root orchestration repository could exist, but no file inspected gives a specific root remote URL.

Missing information:
- Intended root repository URL, if one exists.
- Intended branch name for the root repository.
- Whether nested app repos should remain independent ignored folders, become submodules, or be represented only by docs/paths in the root baseline.

### Recommended option

Recommended strategy:
- Option B - New root baseline, unless the user provides a real root remote/branch or verified root `.git` backup.

Reasoning:
- Option A, clean clone, is safest if a real root remote exists, but no root remote was identified locally.
- Option C, no root repo, matches the older root runbook wording but leaves root docs, workflow files, shared packages, contracts, and scripts without reliable source control. That is not acceptable for the planned dependency/shared-package cleanup.
- Option B gives the root orchestration layer source control while preserving nested app repos as independent repos, but it must be done deliberately with an ignore/submodule policy before any `git add`.

Exact risks:
- A careless new root baseline could track nested app repo working trees as ordinary directories.
- A careless new root baseline could commit `node_modules`, `output/`, `test-results/`, local env files, logs, screenshots, local DB data, and other generated artifacts.
- Root has both `package-lock.json` and `pnpm-lock.yaml`; the baseline should record the current state but must not resolve package-manager ownership in the same pass.
- Existing nested app dirty states must not be normalized, reverted, or absorbed into a root commit.

### Future execution prompt

Recommended next prompt:

> Create a new root Git baseline for `K:\XFlow-Ecosystem Workspace` without changing runtime app code or lockfiles. Do not run installs. Archive the empty `.git` folder, run `git init`, create a conservative root `.gitignore` that excludes nested app repos, nested `.git` folders, `node_modules`, env files, output/evidence, logs, build artifacts, local DB data, and temp files, then show the proposed `git status --short` before staging anything. Do not commit until I approve the file list.

If a real root remote is known, use this prompt instead:

> Compare `K:\XFlow-Ecosystem Workspace` with a clean sibling clone of `<ROOT_REMOTE_URL>` on `<BRANCH>`. Do not clone over the existing workspace. Do not run installs. Report root docs/packages/scripts differences and a copy plan for intentional changes only.

Commands not run in this pass:
- `git init`.
- `git clone`.
- `git add`, `git commit`, `git push`, or remote changes.
- Dependency installs.
- Lockfile rewrites.
- App builds/tests.
- Runtime source edits.

## Root Git Baseline Initialization - No Commit Yet

Date:
- 2026-06-21.

Scope:
- Created a safe new root Git baseline without staging or committing files.
- No dependency install, lockfile rewrite, `node_modules` deletion, stale local package-copy deletion, app runtime code change, backend/auth/database/payment/business-logic change, push, or broad formatting was performed.

Preflight:
- Current directory confirmed: `K:\XFlow-Ecosystem Workspace`.
- Root `.git` existed and was empty.
- Root `.git\HEAD` did not exist.
- Root `.git\config` did not exist.
- Root Git commands did not work before initialization.
- Nested app repo `.git` folders were present for WordGeni, XFlow, RatAiFy, Crevux, Verixet, and AudAiX.

Archived empty root Git metadata:
- Backup folder created: `.git.empty-backup-20260621-190943`.
- Backup folder exists and contains no files.
- Backup has no `HEAD`, `config`, objects, refs, or index.
- The original root `.git` path was removed only by rename, not deletion.

Git initialization result:
- `git init` completed at the root.
- New root `.git\HEAD` exists.
- New root `.git\config` exists.
- `git status --short` runs.
- Current branch: `master`.
- No files were staged.
- No commit was created.

Root `.gitignore` rules summary:
- Dependency folders: `node_modules/` and `**/node_modules/`.
- Env/secrets: `.env`, `.env.*`, nested env files, and common key/certificate extensions.
- Build/cache outputs: `dist/`, `build/`, `out/`, `.next/`, `.turbo/`, `.vite/`, `coverage/`, `playwright-report/`, and `test-results/`, including nested equivalents.
- Logs: `*.log` and package-manager debug logs.
- Local QA/evidence: `output/`, `output/playwright/`, and Playwright cache folders.
- Local DB/temp/tool folders: `pgdata/`, `tmp/`, `tmp-*`, local smoke/tool folders, and generated test-output files.
- OS/editor files: `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`.
- Root Git archive: `.git.empty-backup-*/`.
- Nested repo protection: root `apps/`, the named app repos, `packages/ecosystem-showcase/`, and `xflow-ecosystem-ops/`.

Root status summary after `.gitignore`:
- `git status --short` visible untracked count: 44.
- `git status --ignored --short` ignored count: 367.
- Visible root baseline candidates include `.github/`, `.gitignore`, root Markdown docs, `docs/`, `ecosystem-contracts/`, `ecosystem-control/`, `infra/`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `packages/`, `scripts/`, and `supabase/`.
- Ignored generated/local material includes env files, `.next/`, `node_modules/`, `output/`, `test-results/`, logs, temp files, generated package `dist/` folders, package `node_modules/`, local smoke/tool folders, and the empty `.git` backup.
- Ignored nested app repo confirmation: `apps/` is ignored at root, which protects WordGeni, XFlow, RatAiFy, Crevux, Verixet, AudAiX, and other app folders from accidental root staging.

Files still untracked and requiring staging review:
- Root orchestration/config: `.github/`, `.gitignore`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`.
- Root docs: `docs/` and numerous root-level Markdown reports/runbooks.
- Root shared packages: `packages/`, excluding ignored generated package outputs and ignored nested `packages/ecosystem-showcase/`.
- Root contracts/scripts/infrastructure: `ecosystem-contracts/`, `scripts/`, `infra/`, `supabase/`, and `ecosystem-control/`.

Next recommended staging plan:
1. Review `git status --short` and choose a first root baseline scope.
2. Stage only root source-control scaffolding first: `.gitignore`, `.github/`, root `package.json`, root lockfiles, and root docs needed to explain the workspace.
3. Stage shared packages and contracts in a second reviewed batch: `packages/`, `ecosystem-contracts/`, and `scripts/`.
4. Keep root `apps/` ignored unless a deliberate submodule or metadata-only strategy is chosen.
5. Run shared package typecheck/test before any commit.
6. Commit only after the staged file list is explicitly approved.

Confirmation:
- No files were staged.
- No commit was created.
- No push was run.
- No install or lockfile rewrite was run.
- No runtime app source was changed.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.

## Root Git Baseline Staging Review - No Commit Yet

Date:
- 2026-06-21.

Scope:
- Reviewed the newly initialized root Git repo and staged only safe root-level baseline files.
- No commit, push, dependency install, lockfile rewrite, file deletion, app runtime code change, backend/auth/database/payment/business-logic change, or broad formatting was performed.

Candidate categories reviewed:
- Safe candidates: `.gitignore`, `.github/`, root Markdown docs, `docs/`, `packages/` source/config files, `scripts/`, `ecosystem-contracts/`, `ecosystem-control/`, `infra/`, `supabase/` source/migration files, and root `package.json`.
- Unsafe/do-not-stage categories: `apps/`, nested app repos, `node_modules/`, `.env*`, key/certificate files, `output/`, screenshots/evidence, logs, temp/cache folders, generated build output, archived `.git.empty-backup-*`, and local Supabase state.
- Ambiguous/deferred categories: root `package-lock.json`, root `pnpm-lock.yaml`, package-level `package-lock.json` files, deployment outputs, generated artifacts, and any large/binary file.

Candidate inspection:
- Candidate source/doc/config set contained 324 files before lockfile/temp exclusions.
- No candidate file exceeded 5 MB.
- Secret-pattern scan found documented secret variable names, placeholder examples, and scanner code that detects secrets. It did not identify private key blocks, AWS key IDs, or live Stripe key values in the staged baseline set.
- `git check-ignore` confirmed `apps/`, nested app repos, `node_modules/`, `output/`, root env files, and generated package `dist/` files are ignored.
- Package folders were inspected; package `node_modules/` and `dist/` folders are ignored. Package-level lockfiles were deferred.

Staged file summary:

| Category | Count |
| --- | ---: |
| Total staged files | 291 |
| `.github/` workflow files | 1 |
| `.gitignore` | 1 |
| Root Markdown docs | 32 |
| `docs/` | 119 |
| `packages/` source/config files | 20 |
| `scripts/` | 72 |
| `ecosystem-contracts/` | 6 |
| `ecosystem-control/` | 10 |
| `infra/` | 2 |
| `supabase/` source/migration/test files | 27 |
| Root `package.json` | 1 |

Excluded from staging:
- `apps/` and all nested app repositories.
- `node_modules/`.
- `.env*` and secret/key/certificate files.
- `output/`, `output/playwright/`, generated screenshots, QA evidence, and logs.
- Generated build outputs such as `dist/`, `build/`, `out/`, `.next/`, `.vite/`, coverage, and test results.
- `.git.empty-backup-20260621-190943`.
- Root `package-lock.json` and root `pnpm-lock.yaml`.
- Package-level `package-lock.json` files.
- `supabase/.temp/` and `supabase/.branches/`; these were initially staged by the broad `supabase/` add, immediately unstaged, and then added to `.gitignore`.

Staged-set safety confirmation:
- Staged paths under `apps/`: 0.
- Staged `node_modules` paths: 0.
- Staged `.env` paths: 0.
- Staged `output/` paths: 0.
- Staged backup `.git.empty-backup-*` paths: 0.
- Staged package/root lockfiles: 0.
- Staged generated `dist/` or `build/` paths: 0.
- Staged logs/screenshots/evidence: 0.

Nested app repo confirmation:
- Root `.gitignore` ignores `apps/`.
- WordGeni, XFlow, RatAiFy, Crevux, Verixet, and AudAiX remain independent nested repos and were not staged into the root baseline.

Recommended initial commit message for the next pass:
- `chore: establish root orchestration baseline`

Next pass:
- Review `git diff --cached --name-only`.
- If the staged set is still clean, create the initial root commit only.
- Do not add root lockfiles, nested apps, generated outputs, or dependency cleanup changes in the initial commit.

## Root Lockfile and Package Manager Ownership Review

Date:
- 2026-06-21.

Scope:
- Read-only review of the remaining untracked root/package lockfiles after the initial root baseline commit `fe103fc chore: establish root orchestration baseline`.
- No dependency install, npm install, pnpm install, lockfile rewrite, lockfile deletion, lockfile staging, commit, push, app runtime code change, backend/auth/database/payment/business-logic change, or `apps/` edit was performed.

### Root ownership decision

Root package-manager ownership recommendation:
- Treat the root orchestration layer as npm-owned for CI/proof scripts unless a future deliberate workspace migration is approved.

Evidence:
- Root `.github/workflows/ecosystem-proof.yml` uses `actions/setup-node` with `cache: npm` and runs `npm ci --ignore-scripts`.
- Root `package.json` has no `packageManager` field and no workspace declaration.
- Root scripts use npm for shared package orchestration, for example `npm --prefix packages/ecosystem-assistant-ui ...`.
- Root `package-lock.json` is npm lockfile v3 and records only the root `supabase` devDependency from `package.json`.
- No root `pnpm-workspace.yaml`, `.npmrc`, or `.pnpmrc` exists.
- Root `pnpm-lock.yaml` has lockfile version `9.0` and an empty root importer (`.: {}`), so it does not currently describe the root `supabase` devDependency or the `packages/*` shared packages.
- `docs/ecosystem-root-runbook.md` states that the root is a parent/orchestration folder, not a unified package workspace. This remains compatible with npm-owned root CI and package-local npm commands.

Interpretation:
- Root is not a pnpm workspace today.
- Root `package-lock.json` appears current enough to support the existing CI shape, but it should stay untracked until root lockfile policy is explicitly approved.
- Root `pnpm-lock.yaml` appears stale or vestigial at the root. It should not be staged as an authoritative root lockfile. Delete it only in a separate approved cleanup pass after confirming no root workflow depends on it.

### Package-level lockfile table

| Path | Owner | Package manager | Current status | Should stage later? | Should ignore? | Should delete later? | Risk | Recommended next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `package-lock.json` | Root orchestration CI/proof layer | npm | Lockfile v3. Root entry has `devDependencies.supabase: ^2.98.2`, matching root `package.json`. | Yes, but only after approving npm as the root owner. | No, if npm remains root owner. | No, unless root CI is intentionally migrated away from npm. | Low/medium: staging it establishes npm as root owner and may constrain future pnpm migration. | Keep untracked for now; stage in a focused "root npm lockfile baseline" pass if npm ownership is approved. |
| `pnpm-lock.yaml` | No clear current owner | pnpm | Lockfile v9 with an empty root importer and no root package dependencies. No root `pnpm-workspace.yaml` exists. | No. | Yes, or leave untracked until deletion is approved. | Yes, likely, but only after an explicit cleanup approval. | Medium: keeping it visible perpetuates mixed root ownership; staging it would misrepresent root dependency state. | Do not stage. Add to ignore or delete in a later root lockfile cleanup pass after approval. |
| `packages/ecosystem-assistant/package-lock.json` | `@xflow-ecosystem/ecosystem-assistant` package | npm | Lockfile v3. Name/version match package `0.1.0`; only `typescript` devDependency. | Yes, if package-local npm lockfiles are approved. | No, if packages remain independently installable npm packages. | No. | Low: independent package lock is coherent, but root is not a workspace. | Keep untracked for now; later stage with package-local npm lockfile policy. |
| `packages/ecosystem-assistant-ui/package-lock.json` | `@xflow-ecosystem/ecosystem-assistant-ui` package | npm | Lockfile v3. Name/version match package `0.1.0`; records `file:../ecosystem-assistant`, React peer, TypeScript and React type devDeps. | Yes, if package-local npm lockfiles are approved. | No, if packages remain independently installable npm packages. | No. | Low/medium: includes a package-local file link and peer-resolved React metadata; useful for current test/typecheck workflow. | Keep untracked for now; later stage with package-local npm lockfile policy. |
| `packages/ecosystem-contracts/package-lock.json` | `@xflow-ecosystem/contracts` package | npm | Lockfile v3. Name/version match package `0.1.0`; only `typescript` devDependency. | Yes, if package-local npm lockfiles are approved. | No, if packages remain independently installable npm packages. | No. | Low: independent package lock is coherent. | Keep untracked for now; later stage with package-local npm lockfile policy. |
| `packages/ecosystem-supabase/package-lock.json` | `@xflow-ecosystem/supabase` package | npm | Lockfile v3. Name/version match package `0.1.0`; records `@supabase/supabase-js` dev/peer dependency and TypeScript. | Yes, if package-local npm lockfiles are approved. | No, if packages remain independently installable npm packages. | No. | Medium: Supabase package dependency graph is larger; still coherent with package metadata. | Keep untracked for now; later stage with package-local npm lockfile policy. |

### Package classification

| Package | Classification | Reason |
| --- | --- | --- |
| `packages/ecosystem-assistant` | Independent npm package | Has its own `package.json`, build/typecheck scripts, npm lockfile v3, no root workspace owner. |
| `packages/ecosystem-assistant-ui` | Independent npm package | Has package-local build/typecheck/test scripts, npm lockfile v3, and current verification is invoked through `npm --prefix`. |
| `packages/ecosystem-contracts` | Independent npm package | Has package-local TypeScript build/typecheck scripts and npm lockfile v3. |
| `packages/ecosystem-supabase` | Independent npm package | Has package-local TypeScript build/typecheck scripts and npm lockfile v3 with Supabase peer/dev dependency. |
| `packages/ecosystem-showcase` | Separate nested Git repo / excluded root package | Root `.gitignore` excludes it from the root baseline; do not include its lockfile policy in the root package decision. |

### Mixed npm/pnpm risk

- Root npm ownership is supported by CI and root scripts.
- Root pnpm ownership is not supported by a root workspace file or by the current root pnpm lock contents.
- WordGeni and Crevux remain pnpm-owned app workspaces under ignored `apps/` and are outside this root lockfile pass.
- XFlow/RatAiFy/Verixet/AudAiX app-level lockfile cleanup remains separate because `apps/` is ignored from the root baseline.
- The highest immediate root risk is accidentally staging both root lockfiles and making mixed ownership look intentional.

### Lockfile disposition recommendation

Lockfiles to keep untracked for now:
- `package-lock.json`.
- `packages/ecosystem-assistant/package-lock.json`.
- `packages/ecosystem-assistant-ui/package-lock.json`.
- `packages/ecosystem-contracts/package-lock.json`.
- `packages/ecosystem-supabase/package-lock.json`.

Lockfiles to stage later only after approval:
- The npm lockfiles above, as a focused root/package npm lockfile baseline.

Lockfiles to ignore or delete later only after approval:
- `pnpm-lock.yaml`, because the root is not a pnpm workspace and the lockfile has an empty root importer.

Commands explicitly not run:
- `npm install`.
- `pnpm install`.
- `npm ci`.
- `npm install --package-lock-only`.
- `pnpm install --lockfile-only`.
- Any lockfile rewrite/regeneration command.
- `git add` for lockfiles.
- `git commit`.
- `git push`.

Next recommended prompt:
- `Root Git Baseline - Stage Approved npm Lockfiles and Ignore Stale Root pnpm Lockfile`

## npm Lockfile Baseline and Stale pnpm Ignore

Date:
- 2026-06-21.

Scope:
- Baseline the approved npm lockfiles after the root/package manager ownership review.
- Keep the stale root `pnpm-lock.yaml` out of root Git tracking with an explicit root-only ignore rule.
- No dependency install, npm install, pnpm install, lockfile rewrite, lockfile deletion, app runtime code change, backend/auth/database/payment/business-logic change, `apps/` edit, push, or production-service operation was performed.

Staged npm lockfiles:
- `package-lock.json`.
- `packages/ecosystem-assistant/package-lock.json`.
- `packages/ecosystem-assistant-ui/package-lock.json`.
- `packages/ecosystem-contracts/package-lock.json`.
- `packages/ecosystem-supabase/package-lock.json`.

Staged supporting files:
- `.gitignore`, adding `/pnpm-lock.yaml` as a root-only ignore rule.
- `docs/dependency-resolution-audit.md`, recording this baseline decision.

Stale pnpm decision:
- `pnpm-lock.yaml` remains on disk but is not staged.
- The root is currently npm-owned for CI/proof orchestration, and there is no root `pnpm-workspace.yaml`.
- The root pnpm lock has an empty importer and does not describe the root `supabase` devDependency, so it should remain ignored unless a future approved pass intentionally migrates root ownership to pnpm.

Validation results:
- `git check-ignore -v pnpm-lock.yaml` confirms the root-only ignore rule applies.
- Staged paths contain no `apps/`, `node_modules/`, `.env*`, `output/`, evidence, generated build output, or `pnpm-lock.yaml`.
- Only approved npm lockfiles, `.gitignore`, and this audit document are intended for the lockfile baseline commit.

Verification results:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.

Commit plan:
- If validation and verification pass, commit with `chore: baseline npm lockfiles`.

Next recommended cleanup target:
- Shared package resolution cleanup, starting with WordGeni split resolution and stale local package copies.
