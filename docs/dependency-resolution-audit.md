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

## XFlow Lockfile Ownership and Shared Package Resolution Audit

Date:
- 2026-06-21.

Scope:
- Audit-only review of `apps/XFlow` package-manager ownership, lockfile health, shared UI package resolution, installed link targets, and stale local shared package copy status.
- No install command, lockfile rewrite, package deletion, runtime app code change, backend/auth/database/payment/business-logic change, XFlow staging, XFlow commit, root push, or app push was performed.

Preflight:
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/XFlow`, so the nested app repo is not absorbed into the root baseline.
- XFlow nested repo root: `K:\XFlow-Ecosystem Workspace\apps\XFlow`.
- XFlow branch: `master`.
- XFlow latest commit at audit time: `dde8cf2 fix(auth): expose ecosystem MFA status`.
- XFlow had an existing dirty working tree before this audit, including package/lockfile changes, shared navigation shell files, local QA/auth helper files, and tests. Those existing changes were left untouched and unstaged.

### Package-manager ownership signals

| Signal | Finding | Implication |
| --- | --- | --- |
| `package.json` name/version | `xflow` / `3.4.1`. | Matches the root package metadata in `package-lock.json`. |
| `packageManager` field | None. | Ownership must be inferred from scripts, lockfiles, CI, and tooling. |
| Volta pins | `node: 22.18.0`, `npm: 10.9.3`. | Strong npm ownership signal. |
| Local tool versions | npm `10.9.3`; pnpm `10.30.3` is installed on the machine. | pnpm availability alone does not establish app ownership. |
| Root app scripts | Scripts use `npm run`, `npx tsx`, and npm-style lifecycle commands. | npm is the current script convention. |
| CI workflows | `.github/workflows/ci.yml` and `.github/workflows/enterprise-quarterly.yml` run `npm ci` and `npm run ...`. | CI is npm-owned. |
| Dockerfile | Copies `package.json package-lock.json` and runs `npm ci`, then `npm run build`. | Production build container is npm-owned. |
| pnpm workspace config | No `pnpm-workspace.yaml`, `.pnpmrc`, or `.npmrc` found at the XFlow app root. | No active pnpm workspace ownership was found. |
| Docs/scripts mentioning pnpm | `docs/env-doctor.md`, `docs/ecosystem-status.md`, and `scripts/generate.ts` contain pnpm command examples. | These are historical/stale docs or alternate command notes, not current lockfile ownership proof. |

Ownership recommendation:
- Treat XFlow as npm-owned for now.
- The canonical lockfile should be `apps/XFlow/package-lock.json`.
- `apps/XFlow/pnpm-lock.yaml` should be considered stale/vestigial until a dedicated cleanup pass removes or regenerates it with explicit approval.

### Lockfile status

| Path | Package manager | Current status | Risk | Recommended next action |
| --- | --- | --- | --- | --- |
| `apps/XFlow/package-lock.json` | npm, lockfile v3 | Matches `package.json` root metadata and records `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../../packages/ecosystem-assistant-ui`. | Low. This is the lockfile used by CI and Docker. | Keep as canonical npm lockfile. |
| `apps/XFlow/pnpm-lock.yaml` | pnpm, lockfile v9 | Has an importer for `.`, and records the shared UI dependency as `file:../../packages/ecosystem-assistant-ui`, but other dependency entries drift from `package.json` and `package-lock.json` such as older Sentry metadata. | Medium. Mixed npm/pnpm lock ownership can cause stale dependency review and package-resolution confusion. | Retire or regenerate only in a dedicated XFlow lockfile ownership cleanup pass. |
| `apps/XFlow/agents/desktop-agent/package-lock.json` | npm nested package lockfile | Separate desktop-agent package lockfile found under a nested package. | Medium if conflated with the XFlow root app lockfile. | Treat as desktop-agent-owned and audit separately if desktop-agent dependency cleanup is needed. |

No lockfile was staged, deleted, regenerated, or edited in this audit.

### Shared UI package resolution

| Surface | Current resolution | Classification |
| --- | --- | --- |
| `package.json` dependency | `@xflow-ecosystem/ecosystem-assistant-ui`: `file:../../packages/ecosystem-assistant-ui`. | Active root shared package reference. |
| `package-lock.json` root dependency | Records `file:../../packages/ecosystem-assistant-ui`. | Active npm lock entry aligned with the root shared package. |
| `package-lock.json` package entry | `../../packages/ecosystem-assistant-ui` has package name `@xflow-ecosystem/ecosystem-assistant-ui`, version `0.1.0`, and a root-neighbor assistant dependency. | Active root shared package lock metadata. |
| `package-lock.json` node_modules entry | `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` resolves to `../../packages/ecosystem-assistant-ui` with `link: true`. | Active npm installed-link metadata. |
| `pnpm-lock.yaml` shared UI entry | Records `file:../../packages/ecosystem-assistant-ui`. | Points to the right root package, but lives in a stale/vestigial pnpm lockfile. |
| `tsconfig.json` | Maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/dist/index`. | Active root TypeScript alias. |
| `vitest.config.mts` | Maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/dist/index.js`. | Active root test/runtime alias. |
| `next.config.ts` | No explicit shared UI alias found. | Runtime resolution relies on the package dependency and installed `node_modules` link. |
| `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` | Junction target is `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui`. | Installed link is aligned to the root shared UI package. |
| `apps/XFlow/packages/ecosystem-assistant-ui` | Not present. | No stale XFlow-local shared UI package copy found. |

### Reference classification

Active root shared package references:
- `apps/XFlow/package.json`.
- `apps/XFlow/package-lock.json`.
- `apps/XFlow/tsconfig.json`.
- `apps/XFlow/vitest.config.mts`.
- `apps/XFlow/src/components/layout/AppSidebar.tsx`.
- `apps/XFlow/src/components/layout/MobileNav.tsx`.
- `apps/XFlow/src/components/layout/SidebarNav.tsx`.
- `apps/XFlow/src/components/layout/xflow-navigation-shell-config.tsx`.
- `apps/XFlow/tests/unit/shared-navigation-adapter.test.ts`.

Stale local shared package references:
- None found.

Generated or installed references:
- `apps/XFlow/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` is a junction to the root shared UI package.

Historical or stale package-manager references:
- `apps/XFlow/docs/env-doctor.md` includes pnpm command examples.
- `apps/XFlow/docs/ecosystem-status.md` includes pnpm command examples.
- `apps/XFlow/scripts/generate.ts` includes a comment mentioning `pnpm db:generate`.

Workspace membership:
- No XFlow pnpm workspace membership was found.
- No XFlow-local `packages/ecosystem-assistant-ui` workspace package was found.

### Decision

Recommended option:
- Option B - npm lock ownership cleanup needed.

Reasoning:
- XFlow's shared UI package resolution is already aligned to the root shared package across dependency metadata, npm lock metadata, TypeScript, Vitest, and the installed junction.
- No stale local XFlow shared UI package copy exists.
- The remaining risk is mixed npm/pnpm lockfile ownership, not shared UI resolution.
- npm is the safer canonical owner because XFlow Volta, CI, Docker, scripts, and the current lockfile all point to npm.

Future repair prompt:
- `XFlow Lockfile Ownership Cleanup - Retire Stale pnpm Lock and Record npm Baseline`

Future pass should:
- Reconfirm XFlow nested dirty state before touching files.
- Keep `apps/XFlow/package-lock.json` as the canonical lockfile unless a new ownership decision is made.
- Remove, ignore, or explicitly archive `apps/XFlow/pnpm-lock.yaml` only after approval.
- Update stale pnpm command references in XFlow docs only if they are no longer valid.
- Run XFlow typecheck/test/build after any lockfile or package-manager ownership change.
- Keep existing shared navigation/local-QA dirty files separate unless that pass explicitly includes them.

Commands not run:
- `npm install`.
- `pnpm install`.
- `npm ci`.
- `npm install --package-lock-only`.
- `pnpm install --lockfile-only`.
- Any lockfile rewrite command.
- Any app build/test/typecheck command.
- Any database, auth, backend, payment, or hosted-service command.
- `git add`, `git commit`, or `git push` inside XFlow.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.

## XFlow npm Lockfile Baseline and Stale pnpm Retirement

Date:
- 2026-06-21.

Scope:
- Retired the stale XFlow `pnpm-lock.yaml` after the package-manager ownership audit concluded XFlow is npm-owned for now.
- Work stayed inside `apps/XFlow` plus this root documentation update.
- No dependency install, `npm install`, `pnpm install`, package-lock rewrite, runtime app code edit, backend/auth/database/payment/business-logic change, push, or cross-app runtime edit was performed.

Preflight confirmation:
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/XFlow`, so the nested app repo was not absorbed by root Git.
- XFlow latest commit before retirement: `dde8cf2 fix(auth): expose ecosystem MFA status`.
- XFlow had a pre-existing dirty set before this pass; only `pnpm-lock.yaml` was staged for the cleanup commit.

Cleanup performed:
- Deleted `apps/XFlow/pnpm-lock.yaml`.
- Kept `apps/XFlow/package-lock.json` as the canonical npm baseline.
- Did not touch or regenerate `apps/XFlow/package-lock.json`.
- `package-lock.json` SHA-256 before and after the pnpm lock deletion stayed `39B6F2EC286A204825C8A096ED587C8852580E236C1EDDE7C3ECAE5CBC268323`.

npm/package-lock baseline confirmation:
- XFlow Volta metadata pins npm `10.9.3`.
- XFlow package scripts use npm/npx conventions.
- XFlow CI and Docker build paths use `npm ci`.
- No `pnpm-workspace.yaml`, `.pnpmrc`, or `.npmrc` was found at the XFlow app root.
- `package-lock.json` is lockfile version 3 and records root package `xflow` version `3.4.1`.
- `package-lock.json` records `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../../packages/ecosystem-assistant-ui`.

Shared UI link confirmation:
- `apps/XFlow/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` is a junction to `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui`.
- No `apps/XFlow/packages/ecosystem-assistant-ui` stale local package copy exists.

Verification results:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/XFlow run typecheck`: passed.
- `npm --prefix apps/XFlow test`: failed with 4 failures out of 2,652 tests.
  - `tests/api/forum-ai-search.test.ts`: timeout in `parses public search filters and returns filtered browse results without q`.
  - `tests/api/forum-analytics.test.ts`: timeout in `normalizes search analytics queries and detects secrets`.
  - `tests/unit/assistant-e2e-workflow-validation.test.ts`: timeout in the full six-app assistant workflow validation.
  - `tests/unit/design-system-discipline-contract.test.ts`: existing untracked `src/components/layout/xflow-navigation-shell-config.tsx` uses forbidden raw palette class `text-white`.
- `npm --prefix apps/XFlow run build`: passed.
  - Build emitted existing warnings in `src/components/chronicle/ChronicleSourcesClient.tsx` for `react-hooks/exhaustive-deps` and `<img>` usage.
  - Build emitted webpack cache serialization warnings for large strings.

XFlow commit:
- `f670174 chore: retire stale pnpm lockfile`.

Staged XFlow files:
- `pnpm-lock.yaml` deletion only.

Remaining unrelated XFlow dirty files after the cleanup commit:
- `package-lock.json`.
- `package.json`.
- `scripts/seed-qa-account.ts`.
- `src/components/layout/AppSidebar.tsx`.
- `src/components/layout/MobileNav.tsx`.
- `src/components/layout/SidebarNav.tsx`.
- `src/lib/ecosystem/public-urls.ts`.
- `src/lib/onboarding/profile-onboarding.ts`.
- `tsconfig.json`.
- `vitest.config.mts`.
- `scripts/bootstrap-local-nav-qa-auth-schema.ts`.
- `src/components/layout/xflow-navigation-shell-config.tsx`.
- `src/lib/navigation/provider-app-stubs.ts`.
- `tests/unit/shared-navigation-adapter.test.ts`.

Commands not run:
- `npm install`.
- `pnpm install`.
- `npm ci`.
- `npm install --package-lock-only`.
- `pnpm install --lockfile-only`.
- Any lockfile rewrite command.
- Any database, auth, backend, payment, hosted-service, or push command.

Recommended next cleanup target:
- Review and commit or fix the remaining XFlow shared navigation/local-QA dirty set, starting with the design-system violation in `src/components/layout/xflow-navigation-shell-config.tsx`.

## WordGeni Remaining Dirty Set Review

Date:
- 2026-06-21.

Scope:
- Reviewed the remaining WordGeni nested-repo dirty files left after package-resolution cleanup and stale local shared UI package retirement.
- Work stayed inside `apps/WordGeni` plus this root documentation update.
- No dependency install, lockfile rewrite, backend/auth/database/payment/business-logic change, cross-app runtime edit, push, or root app staging was performed.

Preflight:
- Root Git was clean before this documentation update.
- Root `.gitignore` still ignores `apps/WordGeni`.
- WordGeni latest commit before this review: `d1c44d1 chore: retire local shared ui workspace package`.
- WordGeni dirty files before classification:
  - `apps/web/next-env.d.ts`.
  - `apps/web/src/components/layout/app-sidebar-nav.tsx`.
  - `apps/web/src/components/layout/mobile-nav-drawer.tsx`.
  - `apps/web/k.includes('Nav')`.
  - `apps/web/src/components/layout/wordgeni-navigation-config.test.ts`.
  - `apps/web/src/components/layout/wordgeni-navigation-config.tsx`.

Classification:

| File | Classification | Decision |
| --- | --- | --- |
| `apps/web/src/components/layout/app-sidebar-nav.tsx` | Accepted shared navigation shell work | Committed. It adapts the existing WordGeni desktop nav to the shared `SidebarNav` while preserving WordGeni-specific cards, metadata, user/logout state, and existing shell context. |
| `apps/web/src/components/layout/mobile-nav-drawer.tsx` | Accepted shared navigation shell work | Committed. It wires the existing WordGeni mobile drawer surface through the shared `MobileNavDrawer` while keeping the WordGeni-owned wrapper and route metadata intro. |
| `apps/web/src/components/layout/wordgeni-navigation-config.tsx` | Accepted shared navigation adapter | Committed. It maps WordGeni `NavDef` groups into shared navigation section/item config. |
| `apps/web/src/components/layout/wordgeni-navigation-config.test.ts` | Accepted adapter test coverage | Committed. It verifies section mapping plus external and disabled item semantics. |
| `apps/web/next-env.d.ts` | Generated/unwanted for commit | Restored to HEAD and not committed. The dirty change only pointed Next's generated type reference at `.next-prod`. |
| `apps/web/k.includes('Nav')` | Accidental/unwanted zero-byte file | Removed and not committed. |

Verification before commit:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/WordGeni run typecheck`: passed.
- `npm --prefix apps/WordGeni test`: passed.
- `npm --prefix apps/WordGeni run build`: passed.

Commit decision:
- The accepted shared navigation work was safe to commit as one nested WordGeni commit because all remaining meaningful dirty files belonged to the same WordGeni shared navigation adapter/wiring change.
- WordGeni commit: `265ccc3 chore: commit shared navigation shell updates`.
- No generated files, accidental files, dependency lockfiles, or unrelated app feature work were included in the commit.

Post-review status:
- WordGeni nested repo was clean after commit.
- Root repo only contains this documentation update.
- WordGeni stale local shared UI package retirement remains complete from commit `d1c44d1`.
- Recommended next cleanup target: proceed to the next app-level shared package resolution/stale-copy audit, starting with RatAiFy unless a higher-priority app is selected.

## RatAiFy Shared Package Resolution Audit

Date:
- 2026-06-21.

Scope:
- Audit-only review of RatAiFy shared package resolution and stale local shared UI package status.
- No RatAiFy files were staged, committed, repaired, deleted, or reverted in this pass.
- No dependency install, lockfile rewrite, backend/auth/database/payment/business-logic change, cross-app runtime edit, or push was performed.

Preflight:
- Root latest commit before this audit: `4f22787 docs: record wordgeni remaining dirty set review`.
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/RatAiFy`, so the nested app repo is not absorbed by the root baseline.
- RatAiFy nested repo root: `K:\XFlow-Ecosystem Workspace\apps\RatAiFy`.
- RatAiFy branch: `main`.
- RatAiFy latest commit at audit time: `a2d85d3 fix(auth): disable local MFA endpoints under XFlow`.
- RatAiFy had an existing dirty working tree before this audit, including package-resolution files, navigation shell files, local QA/server files, and tests. Those existing changes were left untouched.

### Resolution Inventory

| Surface | Current finding | Classification |
| --- | --- | --- |
| `package.json` dependency | Current working tree points `@xflow-ecosystem/ecosystem-assistant-ui` to `file:../../packages/ecosystem-assistant-ui`. Git diff shows this is an uncommitted change from the older `file:./packages/ecosystem-assistant-ui`. | Active root shared package reference, not yet committed in RatAiFy. |
| `package-lock.json` root dependency | Current lockfile metadata points to `file:../../packages/ecosystem-assistant-ui`. Git diff shows this is an uncommitted change from the older local package path. | Active root shared package lock entry, not yet committed in RatAiFy. |
| `package-lock.json` linked package entry | `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` resolves to `../../packages/ecosystem-assistant-ui` in lockfile metadata. | Lockfile points root. |
| `tsconfig.json` path alias | Current working tree maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/src/index`. Git diff shows this changed from the local package path. | Active root TypeScript alias, not yet committed in RatAiFy. |
| `vite.config.ts` runtime alias | Current working tree maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/dist/index.js`. Git diff shows this changed from the local package path. | Active root Vite/runtime alias, not yet committed in RatAiFy. |
| `vitest.config.ts` | Does not currently define an alias for `@xflow-ecosystem/ecosystem-assistant-ui`. Existing tests that need shared nav source use direct root file paths. | Test alias gap / needs review. |
| `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` | Actual installed junction still points to `K:\XFlow-Ecosystem Workspace\apps\RatAiFy\packages\ecosystem-assistant-ui`. | Stale local installed link. |
| `packages/ecosystem-assistant-ui` | Local app copy exists and declares the same package name. Its package metadata lacks current root package fields such as `test`, `sideEffects`, and `files`. | Stale local package copy still present. |
| `package.json` `build:packages` | Still runs `npm --prefix packages/ecosystem-assistant-ui run build`. | Active script reference to stale local package. |
| Workspace membership | No `pnpm-workspace.yaml`, `packageManager`, or npm `workspaces` field was found for RatAiFy. | Not a package-manager workspace member, but still script/link referenced. |

### Reference Classification

Active root shared package references:
- `package.json`: `file:../../packages/ecosystem-assistant-ui`.
- `package-lock.json`: `resolved: ../../packages/ecosystem-assistant-ui`.
- `tsconfig.json`: `../../packages/ecosystem-assistant-ui/src/index`.
- `vite.config.ts`: `../../packages/ecosystem-assistant-ui/dist/index.js`.
- `tests/trust-dashboard-rendering.node.test.ts`: direct root shared shell source path.
- `tests/rataify-navigation-shell-config.node.test.ts`: direct root shared shell source path.

Stale local package references:
- `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` junction target.
- `packages/ecosystem-assistant-ui`.
- `package.json` `build:packages` script.
- `tests/rataify-ecosystem-assistant-integration.node.test.ts`, which reads `packages/ecosystem-assistant-ui/src/index.tsx`.

Package-name import callsites:
- `client/src/features/trustDashboard/components/RataifyTrustShell.tsx`.
- `client/src/components/ecosystem-assistant/EcosystemAssistantBubbleMount.tsx`.
- `client/src/components/layout/rataify-navigation-shell-config.tsx`.

Generated or install-state references:
- `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` is generated install state and currently stale.
- `package-lock.json` is root-oriented in the working tree but has not yet been reconciled with the actual junction target.

### Decision

Recommendation:
- Option C - config repair needed, followed by a controlled link/lock refresh.

Reasoning:
- The main dependency, lockfile, TypeScript alias, and Vite alias already point to the root shared UI package in the current RatAiFy working tree, but those changes are uncommitted.
- The actual installed `node_modules` junction still points to the stale local copy, so package-manager install state is inconsistent with current lockfile metadata.
- `package.json` `build:packages` still builds `packages/ecosystem-assistant-ui`, and at least one test still reads the local package source path directly.
- The stale local package is not a workspace member, but it cannot be safely retired until script/test references and installed link state are repaired and verified.

Exact future repair prompt:
- `RatAiFy Shared Package Resolution - Controlled Link Refresh and Local Package Copy Retirement Prep`

Future pass should:
- Review and commit the existing RatAiFy package-resolution changes separately from unrelated dirty files.
- Update `build:packages` so shared UI build ownership is explicit and root-oriented, or document why RatAiFy should not build the shared root package.
- Update stale local test/file references to root shared package paths or package-name imports.
- Run a controlled npm package-lock-only/install-state refresh only after the staged config set is reviewed.
- Verify the installed `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` junction points to `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui`.
- Only then audit whether `apps/RatAiFy/packages/ecosystem-assistant-ui` can be deleted in a later pass.

Commands not run:
- `npm install`.
- `pnpm install`.
- Any package-lock rewrite command.
- Any dependency install or node_modules relink command.
- Any deletion command.
- Any RatAiFy build/test/typecheck command.
- `git add`, `git commit`, or `git push` inside RatAiFy.

## RatAiFy Shared UI Link Refresh and Local Copy Retirement Prep

Date:
- 2026-06-21.

Scope:
- Completed RatAiFy's shared UI package-resolution repair and retired the stale app-local shared UI copy after verification.
- Work stayed inside `apps/RatAiFy` plus this root documentation update.
- No root install, pnpm install, backend/auth/database/payment/business-logic change, cross-app runtime edit, or push was performed.

Before state:
- RatAiFy `package.json`, `package-lock.json`, `tsconfig.json`, and `vite.config.ts` already had uncommitted working-tree changes pointing shared UI resolution to the root package.
- Actual installed link was stale:
  - `K:\XFlow-Ecosystem Workspace\apps\RatAiFy\node_modules\@xflow-ecosystem\ecosystem-assistant-ui`
  - Target: `K:\XFlow-Ecosystem Workspace\apps\RatAiFy\packages\ecosystem-assistant-ui`.
- Stale local package copy existed at `apps/RatAiFy/packages/ecosystem-assistant-ui`.
- `package.json` `build:packages` still built `packages/ecosystem-assistant-ui`.
- `tests/rataify-ecosystem-assistant-integration.node.test.ts` still read `packages/ecosystem-assistant-ui/src/index.tsx`.

Changes made:
- `package.json` dependency for `@xflow-ecosystem/ecosystem-assistant-ui` remains pointed at `file:../../packages/ecosystem-assistant-ui`.
- `package.json` `build:packages` now builds the root shared UI package with `npm --prefix ../../packages/ecosystem-assistant-ui run build`.
- `package-lock.json` now records the root file dependency package entry at `../../packages/ecosystem-assistant-ui` and no longer records the local `packages/ecosystem-assistant-ui` package entry.
- `tsconfig.json` maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/src/index`.
- `vite.config.ts` maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/dist/index.js`.
- `tests/rataify-ecosystem-assistant-integration.node.test.ts` now reads the root shared UI source through a root-relative helper.
- Deleted only the stale local package copy:
  - `apps/RatAiFy/packages/ecosystem-assistant-ui/package.json`.
  - `apps/RatAiFy/packages/ecosystem-assistant-ui/src/index.tsx`.
  - `apps/RatAiFy/packages/ecosystem-assistant-ui/tsconfig.json`.

npm command run:
- From `apps/RatAiFy`: `npm install --ignore-scripts`.
- Purpose: refresh the stale installed file-dependency junction after package metadata already pointed to the root shared UI package.
- Result: npm removed one package, changed one package, and reported existing audit findings of 7 vulnerabilities, 1 low and 6 moderate.
- No lifecycle scripts were run.
- No root install was run.

After state:
- Installed link now points to the root package:
  - `K:\XFlow-Ecosystem Workspace\apps\RatAiFy\node_modules\@xflow-ecosystem\ecosystem-assistant-ui`.
  - Target: `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui`.
- `Test-Path apps\RatAiFy\packages\ecosystem-assistant-ui`: false.
- Reference search found root shared UI references only in config, lockfile, package dependency, build script, and tests; no active runtime/test/script reference remains to the deleted app-local copy.

Verification:
- Before deletion:
  - `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
  - `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
  - `npm --prefix apps/RatAiFy run typecheck`: passed.
  - `npm --prefix apps/RatAiFy test`: passed, 381 tests.
  - `npm --prefix apps/RatAiFy run build`: passed.
- After deletion:
  - `npm --prefix apps/RatAiFy run typecheck`: passed.
  - `npm --prefix apps/RatAiFy test`: passed, 381 tests.
  - `npm --prefix apps/RatAiFy run build`: passed.

Git handling:
- RatAiFy nested commit: `a5fed67 chore: align shared ui package resolution`.
- Staged RatAiFy files were limited to `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `tests/rataify-ecosystem-assistant-integration.node.test.ts`, and the deleted stale local shared UI package files.
- Existing RatAiFy navigation/local-QA dirty files remained unstaged and uncommitted.

Remaining risks:
- RatAiFy still has a separate dirty working set from prior shared navigation/local-QA work; it should be reviewed in its own pass before committing.
- npm reported existing audit vulnerabilities during the controlled install; this pass did not run `npm audit fix` or dependency upgrades.
- Recommended next prompt: `RatAiFy Remaining Shared Navigation and Local QA Dirty Set Review`.

## RatAiFy Remaining Dirty Set Review

Date:
- 2026-06-21.

Scope:
- Reviewed the remaining RatAiFy nested-repo dirty files after shared UI package-resolution repair.
- Committed accepted shared navigation shell work only.
- Deferred local disposable/browser QA harness changes because they touch login fallback, demo seeding, and local smoke-server behavior and need their own focused backend/auth/data-safety review.
- No dependency install, lockfile rewrite, audit fix, backend/auth/database/payment change, cross-app runtime edit, or push was performed in this review pass.

Preflight:
- Root latest commit before this review: `a5d77c1 docs: record rataify shared ui link refresh`.
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/RatAiFy`.
- RatAiFy latest commit before this review: `a5fed67 chore: align shared ui package resolution`.

Files reviewed and classification:

| File | Classification | Decision |
| --- | --- | --- |
| `client/src/features/trustDashboard/components/RataifyTrustShell.tsx` | Accepted shared navigation shell work | Committed. Wires RatAiFy desktop/mobile shell surfaces to shared `SidebarNav`, `MobileNavDrawer`, and `NavigationShellStyles` while preserving app-owned selected-site, billing, platform, scan, and account/logout controls. |
| `client/src/components/layout/rataify-navigation-shell-config.tsx` | Accepted shared navigation adapter | Committed. Maps RatAiFy trust-shell groups into shared navigation config and preserves badges, disabled setup semantics, external links, platform control-plane visibility, and route-active quirks. |
| `client/src/index.css` | Accepted shared navigation styling support | Committed. Adds account/action layout styles used by the app-owned RatAiFy sidebar footer around the shared route renderer. |
| `tests/rataify-navigation-shell-config.node.test.ts` | Accepted shared navigation test coverage | Committed. Covers badges, disabled setup items, external links, route-active behavior, role visibility, desktop/mobile section parity, and app-owned slot boundaries. |
| `tests/trust-dashboard-rendering.node.test.ts` | Accepted shared navigation regression update | Committed. Updates assertions to verify shared sidebar rendering, shared active-state accessibility, disabled item accessibility, and adapter-owned setup badge behavior. |
| `client/src/App.tsx` | Local disposable/browser QA harness work | Deferred. Adds a development-only demo-login path and should be reviewed with the local QA harness because it touches login routing. |
| `scripts/dev/start-smoke-server.mjs` | Local disposable/browser QA harness work | Deferred. Changes demo seed behavior and smoke database safety checks; needs focused local-QA review. |
| `server/lib/reservedPathFallback.ts` | Local disposable/browser QA harness work / risky auth-adjacent surface | Deferred. Allows local demo login to bypass central auth redirect only under development/demo conditions; needs focused auth-safety review. |
| `server/services/demoSeeder.ts` | Local disposable/browser QA harness work / data-seeding surface | Deferred. Adds existing demo org repair and legal-consent seeding; needs focused data-safety review. |
| `tests/reserved-demo-login.node.test.ts` | Local disposable/browser QA harness test | Deferred with its corresponding runtime guard change. |
| `tests/start-smoke-server.node.test.ts` | Local disposable/browser QA harness test | Deferred with its corresponding smoke-server change. |

Verification before commit:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/RatAiFy run typecheck`: passed.
- `npm --prefix apps/RatAiFy test`: passed, 381 tests.
- `npm --prefix apps/RatAiFy run build`: passed.

Commit decision:
- RatAiFy shared navigation commit: `e65566b chore: commit shared navigation shell updates`.
- No local QA harness files, auth-adjacent files, demo-seeding files, package-resolution files, generated files, or unrelated files were included in that commit.

Remaining dirty files in RatAiFy:
- `client/src/App.tsx`.
- `scripts/dev/start-smoke-server.mjs`.
- `server/lib/reservedPathFallback.ts`.
- `server/services/demoSeeder.ts`.
- `tests/reserved-demo-login.node.test.ts`.
- `tests/start-smoke-server.node.test.ts`.

Recommended next prompt:
- `RatAiFy Local Disposable Browser QA Harness Safety Review`.

## RatAiFy Local Disposable Browser QA Harness Safety Review

Date:
- 2026-06-21.

Scope:
- Reviewed the six RatAiFy local disposable/browser QA harness files that were deferred from the shared navigation dirty-set commit.
- Applied safety tightening only to local QA harness surfaces: development demo login routing, reserved-path fallback, smoke server seed gating, demo seed target validation, and source tests.
- No dependency install, lockfile rewrite, audit fix, push, cross-app runtime edit, production auth behavior change, payment change, migration, or hosted DB operation was performed.

Preflight:
- Root latest commit before this review: `e3bfb43 docs: record rataify remaining dirty set review`.
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/RatAiFy`.
- RatAiFy latest commit before this review: `e65566b chore: commit shared navigation shell updates`.

Files reviewed and classification:

| File | Classification | Decision |
| --- | --- | --- |
| `client/src/App.tsx` | Local disposable browser QA harness | Committed. Adds a non-production `/login?demo=1` route path to the existing local login page while production keeps central auth redirect behavior. |
| `scripts/dev/start-smoke-server.mjs` | Local disposable smoke harness | Committed with tightening. Demo seeding is no longer passed through or defaulted blindly; it is enabled only for local disposable DB names or an explicit non-production remote seed confirmation. |
| `server/lib/reservedPathFallback.ts` | Auth-adjacent local fallback guard | Committed. Allows `/login?demo=1` through only outside production and only when `DEMO_MODE` or `SEED_DEMO_DATA` is truthy; normal `/login` still redirects to central auth. |
| `server/services/demoSeeder.ts` | Data-seeding surface | Committed with tightening. Seeder now refuses to run unless `DATABASE_URL` is a local disposable target or the operator provides explicit non-production remote seed confirmation before any DB writes. Existing demo org repair and legal-consent seeding remain scoped to the deterministic demo IDs. |
| `tests/reserved-demo-login.node.test.ts` | Harness guard coverage | Committed. Covers local demo pass-through, normal central-auth redirect, missing demo-env denial, and production denial. |
| `tests/start-smoke-server.node.test.ts` | Harness seed-safety coverage | Committed. Covers source-level guards for smoke server seed gating and demo seeder database-target refusal. |

Safety gates confirmed:
- Production `/login` behavior remains a central auth redirect.
- Local demo login requires `?demo=1` plus non-production runtime; server fallback also requires `DEMO_MODE` or `SEED_DEMO_DATA`.
- Smoke server no longer fabricates a placeholder `DATABASE_URL`.
- Smoke server no longer forwards arbitrary `SEED_DEMO_DATA` as an unconditional seed shortcut.
- Demo seeding refuses hosted or ambiguous database targets unless `RATAIFY_ALLOW_REMOTE_SMOKE_SEED` is truthy and `RATAIFY_CONFIRM_REMOTE_SMOKE_SEED` equals `I_UNDERSTAND_THIS_CAN_SEED_REMOTE_DB` in a non-production process.
- No hosted database was touched.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/RatAiFy run typecheck`: passed.
- `npm --prefix apps/RatAiFy test`: passed, 381 tests.
- `npm --prefix apps/RatAiFy run build`: passed.

Commit decision:
- RatAiFy local QA harness commit: `33a231c test: add local disposable navigation qa harness`.
- Staged RatAiFy files were limited to the six reviewed harness files.
- No generated files, `node_modules`, env files, output/evidence files, package files, lockfiles, or unrelated runtime files were staged.

After state:
- RatAiFy nested repo was clean after the harness commit.
- Root repo remained separate; `apps/RatAiFy` was not staged in root.

Recommended next prompt:
- `RatAiFy Local Disposable Browser QA Harness Run`.

## RatAiFy Local Disposable Browser QA Harness Rerun

Date:
- 2026-06-21.

Scope:
- Ran the committed RatAiFy local disposable browser QA harness after the shared UI resolution, shared navigation, and local QA safety commits.
- Work used only a loopback PostgreSQL target and local app URL.
- No app runtime code, package files, lockfiles, backend/auth/payment/business logic, dependency installs, audit fixes, hosted DBs, or pushes were changed or used.

Preflight:
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/RatAiFy`.
- RatAiFy nested repo was clean and latest commit was `33a231c test: add local disposable navigation qa harness`.
- RatAiFy `package.json` points `@xflow-ecosystem/ecosystem-assistant-ui` at `file:../../packages/ecosystem-assistant-ui`.
- `apps/RatAiFy/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` targets `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui`.
- `apps/RatAiFy/packages/ecosystem-assistant-ui` does not exist.

Local disposable environment:
- Evidence folder: `output/playwright/rataify-local-disposable-qa-rerun/`.
- Local DB URL: `postgresql://postgres@127.0.0.1:55421/rataify_nav_qa_rerun`.
- Local DB guard: `node scripts/assert-local-db.mjs --url ...` passed.
- PostgreSQL data directory: `output/playwright/rataify-local-disposable-qa-rerun/pgdata`.
- PostgreSQL was bound to `127.0.0.1:55421` only and stopped after browser QA.
- The committed RatAiFy SQL migrations were applied directly to the disposable database, matching the prior accepted local QA approach because `db:migrate` remains blocked by the installed Drizzle package mismatch documented earlier.
- Schema check after migrations: 83 public tables; `orgs`, `users`, and `user_legal_consents` existed.

Local app flags:
- Local URL: `http://127.0.0.1:5000`.
- `DATABASE_URL=postgresql://postgres@127.0.0.1:55421/rataify_nav_qa_rerun`.
- `NODE_ENV=development`.
- `PORT=5000`.
- `HOST=127.0.0.1`.
- `DEMO_MODE=true`.
- `SEED_DEMO_DATA=true`.
- `RATAIFY_SECURITY_HARNESS=0`.
- Local-only `SESSION_SECRET` and `APP_ENCRYPTION_KEY` values were used.
- The demo seed created the deterministic demo user, org, and current legal consent rows in the disposable database.

Browser QA result:
- Result file: `output/playwright/rataify-local-disposable-qa-rerun/browser-qa-results.json`.
- Pass: true.
- Screenshots:
  - `output/playwright/rataify-local-disposable-qa-rerun/desktop-dashboard.png`.
  - `output/playwright/rataify-local-disposable-qa-rerun/desktop-sites-active.png`.
  - `output/playwright/rataify-local-disposable-qa-rerun/mobile-dashboard-closed.png`.
  - `output/playwright/rataify-local-disposable-qa-rerun/mobile-drawer-open.png`.
- Logs:
  - `output/playwright/rataify-local-disposable-qa-rerun/rataify-smoke.stdout.log`.
  - `output/playwright/rataify-local-disposable-qa-rerun/rataify-smoke.stderr.log`.
  - `output/playwright/rataify-local-disposable-qa-rerun/postgres.log`.
  - `output/playwright/rataify-local-disposable-qa-rerun/postgres-stop.log`.
  - `output/playwright/rataify-local-disposable-qa-rerun/migrations-0001-onward.log`.

Routes and behaviors checked:
- `/login?demo=1` reached `/dashboard` with the demo user.
- Normal `/login` returned a 302 central-auth redirect and did not render the local login page.
- Desktop `/dashboard`, `/sites`, `/issues`, and back to `/dashboard` route links worked.
- Desktop shared `Rataify navigation` rendered once visibly.
- Desktop mobile drawer DOM count was zero.
- Active state worked for Dashboard and Sites.
- Disabled setup items retained `aria-disabled`.
- Community stayed an external link.
- Selected-site selector rendered with `demo-marketing-site.com`.
- Scan CTA rendered.
- Account security and logout links rendered.
- Platform-admin card stayed hidden for the demo user.
- Demo user `/superadmin` access remained gated with a local redirect to `/login?returnTo=%2Fsuperadmin`.
- Mobile closed and open drawer screenshots were captured.
- Mobile drawer rendered once, locked body scroll, exposed active state, closed on route change, closed on Escape with focus returned to the hamburger, and closed on backdrop click.
- No horizontal scroll was detected.
- Browser network hosts were limited to `127.0.0.1:5000`, Google font hosts, and an empty internal entry; no hosted database host was contacted.

Known non-blocking warnings:
- Browser console captured Sentry ingest CSP blocks from existing app instrumentation.
- Browser console captured existing local `400` responses from `/api/org/connected-apps`.
- These were recorded in `rawConsoleErrors` and `knownNonBlockingConsoleWarnings` in the result JSON; filtered shared-nav console errors were empty.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/RatAiFy run typecheck`: passed.
- `npm --prefix apps/RatAiFy test`: passed, 381 tests.
- `npm --prefix apps/RatAiFy run build`: passed.

Commit decision:
- No RatAiFy code changes were needed and no RatAiFy commit was made.
- Only this root documentation section was changed.

Recommended next prompt:
- `Shared Package Resolution Cleanup - XFlow Lockfile Ownership and Stale Package Audit`.

## WordGeni Local Shared UI Package Retirement

Date:
- 2026-06-21.

Scope:
- Removed the stale WordGeni-local shared UI package from WordGeni workspace membership and retired the local copy after verification.
- No root dependency install, root lockfile rewrite, backend/auth/database/payment/business-logic change, app route invention, root push, or WordGeni push was performed.
- Root Git and WordGeni nested Git handling stayed separate.

Preflight:
- Root latest commit before this pass: `77f49fb docs: audit wordgeni stale shared ui copy`.
- Root Git was clean before this documentation update.
- Root `.gitignore` continues to ignore `apps/WordGeni`, so the nested app repo was not absorbed into the root baseline.
- WordGeni latest commit before this pass: `257fbfd chore: align shared ui package resolution`.
- Existing unrelated WordGeni dirty files were recorded before the retirement pass and were not staged as part of this cleanup.

Workspace membership change:
- Before: `apps/WordGeni/pnpm-workspace.yaml` included `packages/*`, so `packages/ecosystem-assistant-ui` was still a WordGeni workspace package.
- After: `apps/WordGeni/pnpm-workspace.yaml` keeps the broad package workspace but explicitly excludes the stale local package with `!packages/ecosystem-assistant-ui`.
- Before: `pnpm --filter @xflow-ecosystem/ecosystem-assistant-ui list --depth 0` resolved to `K:\XFlow-Ecosystem Workspace\apps\WordGeni\packages\ecosystem-assistant-ui`.
- After: the same filter reports no matching WordGeni workspace project.

Controlled pnpm command run:
- From `apps/WordGeni`: `pnpm install --lockfile-only --ignore-scripts`.
- Purpose: remove the stale local workspace importer from `apps/WordGeni/pnpm-lock.yaml` without running lifecycle scripts.
- No broad install command, script-running install, root install, or package upgrade command was run.

Lockfile result:
- The `packages/ecosystem-assistant-ui` workspace importer was removed from `apps/WordGeni/pnpm-lock.yaml`.
- The `apps/web` importer still points to the root shared UI file dependency: `file:../../../../packages/ecosystem-assistant-ui`.
- Root file dependency package entries remain for `@xflow-ecosystem/ecosystem-assistant-ui@file:../../packages/ecosystem-assistant-ui`.
- No manual lockfile editing was performed.

Deletion:
- Deleted exact target only: `K:\XFlow-Ecosystem Workspace\apps\WordGeni\packages\ecosystem-assistant-ui`.
- The resolved deletion target was confirmed to be inside `K:\XFlow-Ecosystem Workspace\apps\WordGeni` and exactly equal to the intended stale package path before recursive removal.
- Post-deletion check confirmed `apps/WordGeni/packages/ecosystem-assistant-ui` no longer exists.
- No generated evidence, root package, app runtime source outside the stale local package, `node_modules`, env file, or hosted-service configuration was deleted.

Post-deletion verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/WordGeni run typecheck`: passed.
- `npm --prefix apps/WordGeni test`: passed.
- `npm --prefix apps/WordGeni run build`: passed.

Git handling:
- Root intended change: this documentation update only.
- WordGeni intended changes: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and tracked deletions under `packages/ecosystem-assistant-ui`.
- Existing unrelated WordGeni working-tree files under `apps/web` remained separate and should not be included in the local package retirement commit.

Remaining risks and follow-up:
- The stale WordGeni-local shared UI package copy is retired, but WordGeni still has unrelated pre-existing navigation/shared-package dirty files that should be reviewed in a separate pass.
- Root dependency/lockfile cleanup can proceed to the next app only after confirming no downstream docs still refer to the retired local package as active.
- Recommended next cleanup target: review the remaining WordGeni navigation/shared-package dirty set, or move to the next app-level shared package resolution audit if those files are intentional in the nested repo.

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

## WordGeni Shared Package Resolution Review

Date:
- 2026-06-21.

Scope:
- Audited and repaired WordGeni shared UI package resolution so package/runtime/type/test config targets the root shared UI package instead of the WordGeni-local copy.
- No dependency install, pnpm install, npm install, lockfile rewrite, local package-copy deletion, backend/auth/database/payment/business-logic change, root push, or WordGeni push was performed.
- WordGeni remains an independent nested Git repo under `apps/WordGeni`; root Git continues to ignore `apps/`.

Preflight:
- Root latest commit: `ae897a8 chore: baseline npm lockfiles`.
- Root working tree was clean before this pass.
- Root `.gitignore` ignores `apps/WordGeni` and `apps/WordGeni/package.json`.
- WordGeni nested repo top: `K:/XFlow-Ecosystem Workspace/apps/WordGeni`.
- WordGeni branch: `main`.
- WordGeni remote: `https://github.com/craftyguru/WordGeni.git`.
- WordGeni already had existing dirty shared-navigation/shared-package files from prior work; this pass did not revert or absorb them into root Git.

### Before/after resolution table

| Resolution surface | Before | After | Notes |
| --- | --- | --- | --- |
| Web package dependency | `apps/web/package.json` used `file:../../packages/ecosystem-assistant-ui`, which resolves to `apps/WordGeni/packages/ecosystem-assistant-ui`. | `file:../../../../packages/ecosystem-assistant-ui`, which resolves to the root shared package. | `pnpm-lock.yaml` still records the old local link and needs a later controlled lock update. |
| TypeScript path | `apps/web/tsconfig.json` pointed to `../../../../packages/ecosystem-assistant-ui/dist/index`. | Unchanged; already pointed to the root shared package. | Type resolution was already root-owned. |
| Next/runtime alias | No alias for `@xflow-ecosystem/ecosystem-assistant-ui`; webpack could follow `node_modules`, which currently points at the app-local package copy. | `apps/web/next.config.mjs` aliases `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package `dist/index.js`. | Runtime bundling no longer depends on the stale installed junction once the root package is built. |
| Vitest/test alias | No alias for `@xflow-ecosystem/ecosystem-assistant-ui`. | `apps/web/vitest.config.mjs` aliases `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package `dist/index.js`. | Test resolution now matches runtime intent. |
| Installed `node_modules` link | `apps/web/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` is a junction to `apps/WordGeni/packages/ecosystem-assistant-ui`. | Unchanged on disk. | Requires controlled pnpm install/lockfile update later; no install was run in this pass. |
| App-local package copy | Present at `apps/WordGeni/packages/ecosystem-assistant-ui`; source/dist were modified by earlier nav work but package metadata differs from root. | Left in place but no longer intended as the web app's package/runtime/type/test target. | Do not delete until a later stale-copy cleanup pass confirms no scripts/workspace packages still depend on it. |

Files changed in this pass:
- `apps/WordGeni/apps/web/package.json`.
- `apps/WordGeni/apps/web/next.config.mjs`.
- `apps/WordGeni/apps/web/vitest.config.mjs`.
- `docs/dependency-resolution-audit.md`.

Lockfile/install follow-up:
- A controlled WordGeni pnpm lock update is required later because `apps/web/package.json` changed from a WordGeni-local `file:` dependency to a root `file:` dependency.
- Do not manually hack `apps/WordGeni/pnpm-lock.yaml`.
- Recommended later command, after reviewing WordGeni dirty state and with no production services involved: `pnpm --dir apps/WordGeni install --lockfile-only --ignore-scripts`.
- Then review only the `@xflow-ecosystem/ecosystem-assistant-ui` lockfile diff, verify the `apps/web/node_modules` junction target, and run WordGeni typecheck/test/build.

Verification results:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/WordGeni run typecheck`: passed.
- `npm --prefix apps/WordGeni test`: passed.
- `npm --prefix apps/WordGeni run build`: passed.

Next recommended action:
- If safe checks pass but WordGeni reports lockfile or installed-link mismatch, run a dedicated WordGeni controlled pnpm lockfile update pass before deleting stale local package copies.

## WordGeni Controlled pnpm Lockfile Update and Junction Verification

Date:
- 2026-06-21.

Scope:
- Ran a controlled WordGeni pnpm lockfile and installed-link update for the repaired root shared UI package dependency.
- No root install, npm install inside WordGeni, root lockfile change, stale local package-copy deletion, backend/auth/database/payment/business-logic change, push, or cross-app runtime edit was performed.
- WordGeni remains an independent nested repo under `apps/WordGeni`.

Before state:
- `apps/web/package.json` already pointed `@xflow-ecosystem/ecosystem-assistant-ui` to `file:../../../../packages/ecosystem-assistant-ui`.
- `pnpm-lock.yaml` still recorded `specifier: file:../../packages/ecosystem-assistant-ui` and `version: link:../../packages/ecosystem-assistant-ui`.
- `apps/web/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` was a junction to `K:\XFlow-Ecosystem Workspace\apps\WordGeni\packages\ecosystem-assistant-ui`.
- `pnpm list @xflow-ecosystem/ecosystem-assistant-ui --filter @wordgeni/web --depth 0` reported `link:../../packages/ecosystem-assistant-ui`.

pnpm commands run:
- `pnpm install --lockfile-only --ignore-scripts`.
- `pnpm --filter @wordgeni/web install --ignore-scripts --offline`.

Lockfile changes summary:
- `apps/web` importer now records `specifier: file:../../../../packages/ecosystem-assistant-ui`.
- `apps/web` importer now records `version: file:../../packages/ecosystem-assistant-ui(react@19.2.5)`.
- New package/snapshot entries were added for `@xflow-ecosystem/ecosystem-assistant-ui@file:../../packages/ecosystem-assistant-ui` and `@xflow-ecosystem/ecosystem-assistant@file:../../packages/ecosystem-assistant`.
- No dependency version upgrades were intentionally performed.

After state:
- `pnpm list @xflow-ecosystem/ecosystem-assistant-ui --filter @wordgeni/web --depth 0` reports `file:../../packages/ecosystem-assistant-ui(react@19.2.5)`.
- `apps/web/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` now points through pnpm's virtual store path for `@xflow-ecosystem+ecosystem-assistant-ui@file+..+..+packages+ecosystem-assistant-ui_react@19.2.5`.
- The installed package metadata matches the root shared UI package metadata, including `test`, `sideEffects`, and `files`, rather than the stale WordGeni-local copy.
- Next runtime alias, Vitest alias, and TypeScript path continue to target the root shared UI package build under `K:\XFlow-Ecosystem Workspace\packages\ecosystem-assistant-ui\dist\index.js`.

Stale local package copy status:
- `apps/WordGeni/packages/ecosystem-assistant-ui` remains present.
- It was not deleted, copied into, staged, or intentionally modified in this pass.
- WordGeni Turbo still sees the local workspace package as a workspace member, so removing or retiring it needs a separate workspace cleanup pass.

Verification results:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/WordGeni run typecheck`: passed.
- `npm --prefix apps/WordGeni test`: passed.
- `npm --prefix apps/WordGeni run build`: passed.

Git handling:
- Root docs were updated separately in this root repository.
- WordGeni intended nested-repo files for this pass are `apps/web/package.json`, `apps/web/next.config.mjs`, `apps/web/vitest.config.mjs`, and `pnpm-lock.yaml`.
- Existing prior WordGeni navigation/shared-package changes remain separate and should not be conflated with the lockfile/link update commit.

Next cleanup target:
- WordGeni stale local shared package workspace cleanup: audit whether `apps/WordGeni/packages/ecosystem-assistant-ui` can be removed from the pnpm workspace without breaking Turbo tasks or accepted navigation behavior.

## WordGeni Stale Local Shared Package Copy Retirement Audit

Date:
- 2026-06-21.

Scope:
- Audit-only review of whether `apps/WordGeni/packages/ecosystem-assistant-ui` can be safely retired after WordGeni web package/runtime/type/test resolution was aligned to the root shared UI package.
- No package deletion, pnpm install, npm install, lockfile rewrite, runtime app code change, backend/auth/database/payment/business-logic change, root push, or WordGeni push was performed.

Preflight:
- Root latest commit before this audit: `f52ee14 docs: record wordgeni pnpm resolution update`.
- Root Git was clean before the documentation update.
- Root `.gitignore` continues to ignore `apps/WordGeni` and `apps/WordGeni/packages/ecosystem-assistant-ui`.
- WordGeni latest commit: `257fbfd chore: align shared ui package resolution`.
- WordGeni dirty files before audit were existing prior navigation/shared-package working-tree files; this audit did not stage or modify WordGeni files.

### Reference inventory

| Reference | Classification | Finding |
| --- | --- | --- |
| `apps/web/package.json` | Active root shared package reference | `@xflow-ecosystem/ecosystem-assistant-ui` points to `file:../../../../packages/ecosystem-assistant-ui`, which resolves to the root shared UI package. |
| `apps/web/tsconfig.json` | Active root shared package reference | Path alias points to `../../../../packages/ecosystem-assistant-ui/dist/index`. |
| `apps/web/next.config.mjs` | Active root shared package reference | Webpack alias points to the root shared UI package build. |
| `apps/web/vitest.config.mjs` | Active root shared package reference | Vitest alias points to the root shared UI package build. |
| Web imports in `apps/web/src/components/...` | Active package-name imports | Components import `@xflow-ecosystem/ecosystem-assistant-ui`; package/config resolution now routes those imports to the root shared package for web runtime/type/test surfaces. |
| `apps/web/node_modules/@xflow-ecosystem/ecosystem-assistant-ui` | Generated installed link | Junction points through pnpm's virtual store for `@xflow-ecosystem+ecosystem-assistant-ui@file+..+..+packages+ecosystem-assistant-ui_react@19.2.5`, not directly to `apps/WordGeni/packages/ecosystem-assistant-ui`. |
| `pnpm-lock.yaml` `apps/web` importer | Active root shared package lock entry | Records `specifier: file:../../../../packages/ecosystem-assistant-ui` and `version: file:../../packages/ecosystem-assistant-ui(react@19.2.5)`. No old `version: link:../../packages/ecosystem-assistant-ui` web dependency remains. |
| `pnpm-lock.yaml` `packages/ecosystem-assistant-ui` importer | Workspace membership reference | The stale local package copy is still represented as a workspace importer because `pnpm-workspace.yaml` includes `packages/*`. |
| `pnpm-workspace.yaml` | Workspace membership reference | Includes all `packages/*`, so `packages/ecosystem-assistant-ui` is still a first-class WordGeni workspace package. |
| `turbo.json` | Workspace task implication | `build`, `typecheck`, and `test` run across workspace packages. As long as the local shared UI package remains in the workspace, Turbo can still include it in scoped runs. |
| `packages/ecosystem-assistant-ui/package.json` | Stale local package metadata | Local copy still declares the same package name as the root package but lacks current root package metadata such as the `test` script, `sideEffects`, and `files`. |
| `packages/ecosystem-assistant-ui/src/*` and `dist/*` | Stale local package implementation | Local source/dist files remain present and dirty from prior nav work. They are no longer the intended web app resolution target, but they still belong to a workspace package until membership is removed. |
| `README.md` and `eslint.config.mjs` package globs | General workspace docs/config | References to `packages/*` are broad workspace references, not specific dependencies on the local shared UI copy. |

### Workspace membership status

- `pnpm-workspace.yaml` contains:
  - `apps/*`.
  - `packages/*`.
- Because of the broad `packages/*` glob, `apps/WordGeni/packages/ecosystem-assistant-ui` is still a workspace package.
- `pnpm --filter @xflow-ecosystem/ecosystem-assistant-ui list --depth 0` resolves to `K:\XFlow-Ecosystem Workspace\apps\WordGeni\packages\ecosystem-assistant-ui`.
- WordGeni Turbo still includes `@xflow-ecosystem/ecosystem-assistant-ui` as a package in workspace-scoped typecheck/test/build output.

### Lockfile status

- The web app lock entry now points to the root shared package file dependency.
- The stale local package copy still has a separate workspace importer at `packages/ecosystem-assistant-ui`.
- That importer should disappear only after the local package is removed from workspace membership and a controlled pnpm lockfile update is run.
- Do not manually edit `pnpm-lock.yaml`.

### Node modules status

- The web package `node_modules` link no longer points directly at `apps/WordGeni/packages/ecosystem-assistant-ui`.
- The generated pnpm virtual-store path is consistent with the root file dependency and includes root package metadata.
- Generated `node_modules` references are safe to ignore for retirement planning.

### Retirement recommendation

Recommendation:
- Option B - first remove workspace membership.

Reasoning:
- No active web package/runtime/type/test references still require the local package copy.
- However, `pnpm-workspace.yaml` still makes `packages/ecosystem-assistant-ui` a workspace member, and `pnpm-lock.yaml` still has a workspace importer for it.
- Deleting the directory without first addressing workspace membership would create a package-manager/workspace diff that should be handled deliberately.

Exact future prompt:
- `WordGeni Stale Local Shared Package Copy - Remove Workspace Membership and Retire Copy Safely`

Future pass should:
- Narrow `pnpm-workspace.yaml` so `packages/ecosystem-assistant-ui` is no longer included, or move to explicit package globs that exclude it.
- Run a controlled `pnpm install --lockfile-only --ignore-scripts` from `apps/WordGeni`.
- Verify `pnpm --filter @xflow-ecosystem/ecosystem-assistant-ui` no longer resolves to the WordGeni-local package.
- Verify WordGeni typecheck/test/build still pass.
- Only then delete `apps/WordGeni/packages/ecosystem-assistant-ui` in the same reviewed nested-repo pass.

Commands not run:
- `pnpm install`.
- `pnpm install --lockfile-only`.
- `npm install`.
- Any lockfile rewrite command.
- Any deletion command.
- Any app build/test command.
- `git add`, `git commit`, or `git push` inside WordGeni.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
