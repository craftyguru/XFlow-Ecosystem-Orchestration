# Architecture Doctor Scanner Plan

This is a planning document only. It does not authorize a real repository scanner, billing change, database schema change, GitHub write flow, or auto-fix flow.

## Hard Boundaries

- Audit only.
- Report only.
- Refactor plan only.
- Prompt generation only.
- No automatic code modification.
- No GitHub PR creation.
- No database redesign.
- No fake report results.
- No fake completed scans.
- No XFlow production behavior changes.
- No satellite app rewrites.

## Scanner Inputs

Initial scanner inputs should be introduced in this order:

1. Existing Project Architect scan metadata, read-only.
2. GitHub connector inventory, read-only.
3. ZIP upload, only after file-size and secret-exclusion rules exist.
4. Local repo root, development-only unless explicitly productized.

The scanner should not accept arbitrary filesystem paths from a browser request.

## Default Ignore Policy

Architecture Doctor should never scan a full repository blindly. Default ignored paths:

- `node_modules`
- `.next`
- `dist`
- `build`
- `coverage`
- `tmp`
- `.cache`
- `.turbo`
- `.vercel`
- `.railway-links`
- `test-results`
- `playwright-report`
- `artifacts`
- `baselines`
- `.env`
- `.env.local`
- `.env.*`
- `*.db`
- `*.db-shm`
- `*.db-wal`
- large binary files
- images/videos unless explicitly requested for UI evidence
- deployment snapshots
- generated package/vendor output unless summarized

For this workspace specifically, Architecture Doctor should also ignore stale duplicate app folders until they are intentionally archived:

- `apps/XFlow-push-through`
- `apps/xflow-master-release`
- `apps/XFlow-phase4b-pr`

## Cost And Rate-Limit Policy

Before real scans are enabled, the product needs explicit limits:

- Max files per scan.
- Max bytes per file.
- Max total repository bytes.
- Max tokens sent to AI summarization.
- Max findings generated per category.
- Max evidence references per finding.
- Ignored directory count surfaced in the report.
- Partial scan status when a limit is hit.
- Cancel scan.
- Retry failed scan.
- Queue status.
- User plan limits.

No scan should silently skip major repository areas without recording that skip as evidence.

## File Inventory Model

The scanner should first build a file inventory before AI summarization:

- Path.
- Extension.
- Size.
- Language.
- Hash.
- Generated/vendor/ignored classification.
- App/workspace/package boundary.
- Route/page/component/service/repository/helper/script classification when detectable.

The inventory should be persisted or attached to the report before findings are generated. Findings without evidence references should be treated as drafts.

## Evidence Reference Requirements

Each professional finding should cite:

- File path.
- Line number or line range when available.
- Function/component name when available.
- Finding type.
- Severity.
- Recommendation.
- Confidence.

Findings that cannot cite evidence should be labeled as low-confidence advisory notes, not confirmed architecture findings.

## Analysis Pipeline

Future scanner stages:

1. Build file inventory.
2. Apply ignore policy.
3. Classify files by architectural layer.
4. Run static checks for route/service/repository/UI boundary violations.
5. Run duplicate detection across auth, workspace, entitlement, setup, repair, and status logic.
6. Run AST checks for large handlers, direct database access, and repeated workflow orchestration.
7. Materialize an evidence-first report.
8. Run AI summarization over bounded evidence chunks.
9. Generate scorecard only after confirmed evidence exists.
10. Generate refactor plan only after scorecard and findings are available.

## Lifecycle States

Supported lifecycle states should be:

- `draft`
- `requires_connector`
- `ready`
- `queued`
- `running`
- `partial`
- `completed`
- `failed`
- `cancelled`

The dashboard must make these truth labels visible. It should not show completed scores unless a report with evidence exists.

## Safe Patch Mode

Safe patch mode is a later phase. It should only exist after:

- Report evidence is reliable.
- Route/service/repository boundaries are modeled.
- Tests can be run automatically.
- A patch proposal can be reviewed before any write.
- GitHub PR creation is explicitly approved.

The MVP should stop at audit framework, honest empty states, placeholder API responses, and evidence-backed report model types.
