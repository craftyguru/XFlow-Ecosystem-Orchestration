# Global Cursor Rule (all applications)

Install this as a **user-level / global** Cursor rule. It is intentionally generic. Do not paste repository-specific npm scripts into global rules.

In Cursor: Settings → Rules → User Rules. Paste the block below.

```markdown
# Agent Git And Ownership Safety

One implementation owner per task per working tree. Cursor and Codex must not independently edit the same implementation area in the same worktree at the same time.

## Git

- Inspect `git status` and `git diff` before editing or committing.
- Treat pre-existing dirty files as protected. Do not mix unrelated work into a commit.
- Never run `git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .`, or `git stash` unless the user names that exact operation.
- Never force-push `main` or `master`.
- Use commits as recovery points for coherent slices, ownership transfer, migrations, and dependency upgrades — not after every tiny edit.

## Isolation

- Prefer an isolated Git worktree or branch for meaningful parallel Cursor/Codex work.
- Do not create extra worktrees for tiny single-owner edits.
- If another agent owns files in this checkout, inspect and review only; implement elsewhere.

## Coordination-sensitive files

Serialize work on lockfiles, package manifests, schema/migrations, auth, CI, and shared configuration. Do not let two agents invent competing migrations or dependency states.

## Validation

- Run the checks this repository actually defines. Do not invent commands.
- Report PASS, FAIL, BLOCKED, NOT RUN, or MANUAL VERIFICATION REQUIRED.
- Never hide a failed gate to declare work complete.
- Never commit secrets, live `.env` files, or credentials.

## Scale

Tiny change: inspect → edit → targeted test → review diff.
Large change: inspect → isolate → implement → checkpoint → validate → QA → close.
```
