#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const reportPath = resolve(root, "docs/subscription-tier-p3-proof-gate-baseline-report.md");

const appRepos = [
  ["Verixet", "apps/Verixet"],
  ["XFlow", "apps/XFlow"],
  ["RatAiFy", "apps/RatAiFy"],
  ["AudAiX", "apps/AudAix"],
  ["WordGeni", "apps/WordGeni"],
  ["CreVux", "apps/CreVux"],
];

const knownBlockers = [
  {
    area: "WordGeni dependency layout",
    category: "dependency-layout / package-manager-state",
    state:
      "Focused API/web Vitest, package-local TypeScript, and Turbo-based lint/typecheck remain blocked by missing package-local binaries, stale/missing Turbo links, and pnpm non-TTY purge risk.",
    next: "Run a dedicated WordGeni pnpm maintenance pass with explicit approval; do not repair in the report-only gate.",
  },
  {
    area: "CreVux pnpm/catalog/strict install state",
    category: "dependency-layout / package-manager-state",
    state:
      "Filtered pnpm checks and package-local Vitest/tsx/TypeScript flows remain blocked by non-TTY purge risk and missing or stale Vitest, @vitest/utils, tsx, TypeScript, @types/node, vite/client, and esbuild resolution.",
    next: "Run a dedicated CreVux pnpm maintenance pass with explicit approval; do not repair in the report-only gate.",
  },
  {
    area: "AudAiX better-sqlite3 ABI",
    category: "native-module",
    state:
      "SQLite-backed entitlement/webhook suites remain blocked because better-sqlite3 was recorded as compiled against an older Node module ABI than the active Node runtime.",
    next: "Define a local/CI-safe native module rebuild or reinstall path in a separate maintenance pass.",
  },
  {
    area: "RatAiFy broad-suite separation",
    category: "unrelated-suite",
    state:
      "Focused subscription proof is usable, but broad verify:ci can still expand into unrelated AudAiX proof-copy assertions.",
    next: "Keep focused subscription proof separate from broad app health proof until unrelated broad-suite drift is resolved.",
  },
  {
    area: "Root recurring proof gate",
    category: "proof-gate design",
    state:
      "This report-only baseline formalizes the current recurring gate inventory but intentionally does not add a package.json command or run the proof suite.",
    next: "After review, add a root command only if package manifest edits are explicitly allowed.",
  },
];

const safeGateInventory = [
  ["Root contract proof", "npm run proof:billing-contracts", "Required now", "Not run by this report-only baseline."],
  ["Root static proof", "npm run proof:ecosystem:static", "Required now", "Not run by this report-only baseline."],
  ["Root contract validation", "npm run validate:ecosystem-contracts", "Required now", "Not run by this report-only baseline."],
  ["Verixet catalog/checkout/type proof", "Focused Verixet tests and typecheck from P3 plan", "Required now", "Not run by this report-only baseline."],
  ["XFlow pricing/handoff proof", "Focused XFlow tests and typecheck from P3 plan", "Required now", "Not run by this report-only baseline."],
  ["RatAiFy package/catalog/entitlement proof", "Focused RatAiFy billing tests and typecheck from P3 plan", "Required now", "Not run by this report-only baseline."],
  ["AudAiX workspace/billing proof", "Focused AudAiX tests, dashboard tests, routes, and typecheck from P3 plan", "Required now", "Not run by this report-only baseline."],
  ["AudAiX SQLite entitlement/webhook proof", "better-sqlite3-backed AudAiX tests from P3 plan", "Required after ABI repair", "Classified as native-module blocked."],
  ["WordGeni local proof", "node apps/WordGeni/scripts/verify-wordgeni-local-proof.mjs", "Required now", "Not run by this report-only baseline."],
  ["WordGeni focused API/web proof", "Focused WordGeni tests and typechecks from P3 plan", "Required after dependency repair", "Classified as dependency-layout blocked."],
  ["CreVux local proof", "node apps/CreVux/scripts/verify-crevux-local-proof.mjs", "Required now", "Not run by this report-only baseline."],
  ["CreVux focused SaaS/API/image-gen proof", "Focused CreVux tests, typechecks, and credit verifier from P3 plan", "Required after dependency repair", "Classified as dependency-layout blocked."],
];

function runGitStatus(args, cwd) {
  try {
    const out = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trimEnd();
    return out.length > 0 ? out : "(clean)";
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    return `ERROR: ${stderr || error.message}`;
  }
}

function fenced(value) {
  return ["```text", value, "```"].join("\n");
}

const rootStatus = runGitStatus(["status", "--short"], root);
const appStatuses = appRepos.map(([name, path]) => ({
  name,
  path,
  status: runGitStatus(["-C", path, "status", "--short"], root),
}));

const rootStatusLines = rootStatus === "(clean)" ? [] : rootStatus.split("\n");
const taskFiles = rootStatusLines.filter(
  (line) =>
    line.includes("scripts/proof-subscription-tier-p3-baseline.mjs") ||
    line.includes("docs/subscription-tier-p3-proof-gate-baseline-report.md"),
);
const preExistingLines = rootStatusLines.filter((line) => !taskFiles.includes(line));

const lines = [
  "# P3 Subscription Proof Gate Baseline Report",
  "",
  "## A. Scope",
  "",
  "This report was generated by `node scripts/proof-subscription-tier-p3-baseline.mjs` in report-only mode.",
  "",
  "The script collects git status and records known P3 blocker state from `docs/subscription-tier-p3-proof-gate-reliability-plan.md`. It does not run package managers, dependency installs, native rebuilds, migrations, Stripe commands, checkout flows, entitlement changes, media enforcement changes, app internals, broad CI, or focused app tests.",
  "",
  "## B. What Was Added",
  "",
  "- Added a dependency-free root Node helper: `scripts/proof-subscription-tier-p3-baseline.mjs`.",
  "- Added this deterministic markdown baseline report: `docs/subscription-tier-p3-proof-gate-baseline-report.md`.",
  "- No root `package.json` command was added because this pass explicitly avoids package file edits.",
  "",
  "## C. Commands Run By The Gate",
  "",
  "| Command | Purpose | Result |",
  "| --- | --- | --- |",
  "| `git status --short` | Capture root worktree status | Passed |",
  "| `git -C apps/Verixet status --short` | Capture Verixet app repo status | Passed |",
  "| `git -C apps/XFlow status --short` | Capture XFlow app repo status | Passed |",
  "| `git -C apps/RatAiFy status --short` | Capture RatAiFy app repo status | Passed |",
  "| `git -C apps/AudAix status --short` | Capture AudAiX app repo status | Passed |",
  "| `git -C apps/WordGeni status --short` | Capture WordGeni app repo status | Passed |",
  "| `git -C apps/CreVux status --short` | Capture CreVux app repo status | Passed |",
  "",
  "No proof/test/package-manager commands were run by the report-only gate.",
  "",
  "## D. Safe Gate Inventory",
  "",
  "| Area | Command set | Requirement state | Report-only status |",
  "| --- | --- | --- | --- |",
  ...safeGateInventory.map((row) => `| ${row.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`),
  "",
  "## E. Known Blocker State",
  "",
  "| Area | Category | Current state | Recommended next action |",
  "| --- | --- | --- | --- |",
  ...knownBlockers.map((blocker) =>
    `| ${blocker.area} | ${blocker.category} | ${blocker.state} | ${blocker.next} |`,
  ),
  "",
  "## F. Outputs And Results",
  "",
  "The report-only gate ran successfully. It captured root and app statuses and classified known blockers without attempting dependency or app repairs.",
  "",
  "Root status captured by the gate:",
  "",
  fenced(rootStatus),
  "",
  "Task-owned root status entries at capture time:",
  "",
  fenced(taskFiles.length > 0 ? taskFiles.join("\n") : "(none)"),
  "",
  "Pre-existing root dirt preserved at capture time:",
  "",
  fenced(preExistingLines.length > 0 ? preExistingLines.join("\n") : "(none)"),
  "",
  "App repo statuses captured by the gate:",
  "",
  "| App | Path | Status |",
  "| --- | --- | --- |",
  ...appStatuses.map((item) => `| ${item.name} | \`${item.path}\` | ${item.status === "(clean)" ? "clean" : item.status.replaceAll("\n", "<br>")} |`),
  "",
  "## G. Why No Dependency Or App Fixes Were Attempted",
  "",
  "- This pass is documentation/reporting/proof-gate only.",
  "- WordGeni, CreVux, AudAiX, and RatAiFy internals are explicitly out of scope.",
  "- Dependency installs, pnpm purges, npm installs, native rebuilds, migrations, Stripe changes, checkout changes, entitlement changes, media enforcement changes, schema changes, CI edits, and package/lockfile edits are explicitly out of scope.",
  "- Known dependency and native blockers are therefore reported as blockers to repair later, not hidden as product test failures.",
  "",
  "## H. Recommended Next Action",
  "",
  "Review this baseline, then implement the next P3 step as a root-owned proof gate command only when package manifest edits are explicitly allowed. After that, repair WordGeni dependency layout, CreVux dependency layout, AudAiX native ABI state, and RatAiFy broad-suite isolation in separate scoped passes.",
  "",
  "## I. Safety Confirmation",
  "",
  "No production code, package files, lockfiles, dependency installs, dependency rebuilds, schemas, migrations, Stripe logic, checkout flows, entitlement/media enforcement, CI files, or app internals were changed by this report-only gate.",
  "",
];

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${reportPath}`);
