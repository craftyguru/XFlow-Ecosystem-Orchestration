# XFlow Agent Instructions

## Development workflow (all coding agents)

This root repository is ecosystem orchestration: docs, proof scripts, shared packages, `supabase/`, and CI. Nested core apps under `apps/` are independent git repos (XFlow, Verixet, RatAiFy, AudAix, CreVux, WordGeni) and are gitignored here.

PitStrike and other personal user-connected apps are **not** ecosystem products. Do not configure them as part of this workflow, do not start ecosystem phases against them, and do not treat them as core apps. The only valid reference is a user-connected personal app.

Follow `.cursor/rules/` and `docs/development-workflow.md`. Spoken commands (`Start Phase X`, `Continue Phase X`, `Close Phase X`, `Give this task to Codex`, `Take ownership in Cursor`, `Prepare a Codex handoff`, `Create an isolated worktree for this`) are defined there.

Hard constraints:

- One implementation owner per task per worktree. Cursor and Codex must not edit the same implementation area in the same worktree at the same time.
- Pre-existing dirty files are protected. Never `git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .`, or `git stash` unless the user names that operation.
- Do not invent root scripts. Root has no `typecheck`, `lint`, `test`, or `build`. Use documented `npm run` proof/validate scripts here, and each app's own package manager in `apps/<App>`.
- Serialize schema/migrations, lockfiles, auth, CI, and shared config. Never auto-migrate in worktree setup.
- Never expose, commit, or request credentials. XFlow Builder integration stays on the test environment.
- Report validation as PASS, FAIL, BLOCKED, NOT RUN, or MANUAL VERIFICATION REQUIRED. Do not fabricate completion.

Inspect before editing: `node scripts/dev-workflow/inspect-repo.mjs`.

The remainder of this file is XFlow Builder routing policy. It does not authorize application source edits.

# XFlow Builder workspace policy

These instructions apply to XFlow Builder integration work in this repository.

## Environment and credentials

- Default all XFlow Builder integration work to the test environment.
- Use `xflow_connection_status` for integration diagnosis, startup verification, authentication or connectivity failures, or genuinely unknown or ambiguous environment state.
- Do not require a connection-status call before routine WordGeni or Crevux requests when authentication, connectivity, and the environment are already established.
- Never create, rotate, replace, or promote an XFlow credential unless the user explicitly requests that separate operation.
- Never expose, print, log, echo, serialize, paste into a command, or commit credentials.
- Refer to credential state only through boolean presence checks, redacted prefixes, or the environment name returned by an approved status tool.
- Never place a credential value in source code, configuration, generated documentation, a prompt, or command-line arguments.
- Do not enable live credentials, production billing, or paid production routes as part of ordinary builder work.

## WordGeni routing

Prefer the native WordGeni tools when:

- The user explicitly requests WordGeni.
- The writing task materially benefits from WordGeni capabilities.
- Workspace-grounded writing is needed.
- The task requires a multi-step writing workflow.

Relevant WordGeni work includes rewriting or polishing substantial text, structured drafting, prompt refinement, product or marketing copy, content plans, multi-step writing-agent workflows, and workspace-grounded writing assistance.

Do not require WordGeni for every small user-facing writing task. Codex may handle tiny edits, button labels, one-line copy changes, and similarly simple requests directly unless the user requests WordGeni or its capabilities materially improve the result.

Prefer `wordgeni_generate_text` for a focused drafting, rewriting, or prompt-improvement request.

Prefer `wordgeni_run_agent` when the request requires multiple writing steps, workspace context, planning, or an iterative writing workflow.

Use `wordgeni_request` only when the requested capability is not covered by a dedicated WordGeni tool and the route is registered as builder-safe.

Do not route source-code edits, repository configuration, factual analysis, or unrelated engineering work through WordGeni unless the user explicitly asks for WordGeni.

## Crevux read-only routing

Use Crevux read-only operations without paid-generation confirmation for:

- Listing available assets
- Inspecting a specific asset
- Searching or filtering assets
- Listing generation jobs
- Checking the state of an existing job
- Reading available credit or usage information

Use `crevux_list_assets` for asset listing.

Prefer these dedicated read-only tools for their matching operations:

- `crevux_get_job_status` for one video job
- `crevux_list_jobs` for video-job history
- `crevux_get_asset` for one asset
- `crevux_search_assets` for filtered asset lookup
- `crevux_get_credit_balance` for the current Crevux credit summary
- `crevux_get_credit_ledger` for credit debit and refund history
- `xflow_get_usage` for usage scoped to the connected developer key
- `xflow_get_entitlements` for sanitized key scopes, app access, expiration, and entitlement state

Use `crevux_request` only for allowlisted read-only operations that do not have a dedicated tool. For a read-only operation, it must use an allowlisted `GET` route.

A request described as read-only must not use `POST`, `PATCH`, or a generation tool.

## Credit-consuming generation

The following tools are credit-consuming operations:

- `crevux_generate_image`
- `crevux_generate_video`

Never call either tool based only on vague or indirect language, including:

- "Make this better"
- "Create something"
- "Add visuals"
- "Render this"
- "Improve the presentation"
- "Make it more engaging"
- "Give this some polish"

If such a request might benefit from generated media, explain the option without calling a generation tool.

Even when the user explicitly asks to generate an image or video, do not call the generation tool immediately. First present a concise confirmation summary containing:

- Media type
- Intended prompt or subject
- Number of outputs or jobs
- Requested model or provider, if specified
- Known or unknown credit estimate
- Active environment

Then ask the user to confirm that specific credit-consuming operation.

Confirmation is valid only when it occurs after the confirmation summary and clearly authorizes that operation. A valid confirmation may be a direct response such as "Confirm," "Proceed," or "Yes, generate it."

Do not reuse confirmation for a materially different prompt, media type, model, provider, output count, or job.

If the estimate is unavailable, state that the credit cost is unknown before requesting confirmation.

Phase 1 confirmation is an instruction-level safeguard. Do not represent it as a server-issued quote or cryptographic authorization token.

## Requests prohibiting credit use

If the user says any equivalent of:

- "Do not consume credits"
- "Read-only"
- "Do not generate media"
- "Do not call paid tools"
- "No image or video generation"

then do not call `crevux_generate_image` or `crevux_generate_video` during that request.

This prohibition takes precedence over suggestions that generated media might improve the result.

Read-only status, asset, job, and credit-balance operations remain allowed when relevant.

## Failure handling

- Use `xflow_connection_status` before concluding that XFlow authentication or connectivity is broken.
- Distinguish API reachability from authentication and authorization.
- Do not respond to authentication failure by printing or requesting the credential in chat.
- Direct the user to the approved secret environment or builder secret manager.
- Do not retry a credit-consuming operation after an uncertain timeout until job state or idempotency status has been checked.

## Phase 1 acceptance outcomes

- `clear-wordgeni-request`: Explicit or materially beneficial WordGeni work uses the appropriate WordGeni tool.
- `small-writing-request`: A tiny writing edit does not require a WordGeni call.
- `clear-read-only-crevux-request`: Asset listing uses `crevux_list_assets`; dedicated operational reads use their matching tools; unsupported read-only inspections use an allowlisted `GET` through `crevux_request`.
- `ambiguous-generation-request`: Vague visual language does not authorize image or video generation.
- `explicit-generation-without-confirmation`: An explicit generation request receives a confirmation summary before any paid tool call.
- `explicit-confirmed-generation-request`: Confirmation after the summary authorizes only the specific summarized operation.
- `changed-generation-request`: A material change invalidates prior confirmation.
- `unknown-credit-cost`: An unavailable estimate is disclosed as unknown before confirmation.
- `credit-prohibited-request`: An explicit no-credit or read-only constraint prevents all image and video generation.
- `diagnostic-status-request`: Status is used for diagnosis, startup verification, failures, or genuinely unknown environment state, not every routine request.
- `credential-failure`: Authentication problems are reported without exposing or requesting the credential in chat.
