#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const REQUIRED_RULES = [
  "development-workflow.mdc",
  "git-safety.mdc",
  "cursor-codex-coordination.mdc",
  "phase-management.mdc",
  "testing-and-acceptance.mdc",
  "worktree-policy.mdc",
  "ecosystem-product-boundary.mdc",
  "database-and-migrations.mdc",
  "dependency-and-lockfile-safety.mdc",
];

const REQUIRED_FILES = [
  ".cursor/worktrees.json",
  ".cursor/setup-worktree-windows.ps1",
  ".cursor/setup-worktree-unix.sh",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "docs/development-workflow.md",
  "docs/cursor-global-rule.md",
  "docs/templates/phase-plan.md",
  "docs/templates/agent-handoff.md",
  "docs/templates/phase-closeout.md",
  "scripts/dev-workflow/inspect-repo.mjs",
];

const DOCUMENTED_ROOT_SCRIPTS = [
  "validate:ecosystem-contracts",
  "supabase:validate",
  "proof:security-static",
  "proof:ecosystem:static",
];

export function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) {
    throw new Error("missing YAML frontmatter");
  }
  const closing = raw.indexOf("\n---", 4);
  if (closing === -1) {
    throw new Error("unterminated YAML frontmatter");
  }
  const block = raw.slice(4, closing).replaceAll("\r", "");
  const fields = {};
  for (const line of block.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) {
      throw new Error(`invalid frontmatter line: ${line}`);
    }
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  if (!fields.description) {
    throw new Error("frontmatter missing description");
  }
  if (fields.alwaysApply !== "true" && fields.alwaysApply !== "false") {
    throw new Error("frontmatter alwaysApply must be true or false");
  }
  return fields;
}

export function loadJson(relativePath) {
  const raw = readFileSync(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(raw);
}

export function verifyWorkflowSetup() {
  const errors = [];
  const packageJson = loadJson("package.json");

  for (const name of REQUIRED_RULES) {
    const relativePath = path.posix.join(".cursor/rules", name);
    try {
      parseFrontmatter(readFileSync(path.join(repoRoot, ".cursor", "rules", name), "utf8"));
    } catch (error) {
      errors.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const relativePath of REQUIRED_FILES) {
    try {
      readFileSync(path.join(repoRoot, relativePath), "utf8");
    } catch {
      errors.push(`missing ${relativePath}`);
    }
  }

  try {
    const worktrees = loadJson(".cursor/worktrees.json");
    if (!worktrees["setup-worktree-windows"] || !worktrees["setup-worktree-unix"]) {
      errors.push(".cursor/worktrees.json must define Windows and Unix setup keys");
    }
  } catch (error) {
    errors.push(`.cursor/worktrees.json: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const scriptName of DOCUMENTED_ROOT_SCRIPTS) {
    if (!packageJson.scripts || typeof packageJson.scripts[scriptName] !== "string") {
      errors.push(`documented root script missing: ${scriptName}`);
    }
  }

  const forbiddenRootScripts = ["typecheck", "lint", "test", "build"];
  for (const scriptName of forbiddenRootScripts) {
    if (packageJson.scripts?.[scriptName]) {
      errors.push(`docs assume root has no ${scriptName} script, but package.json now defines it`);
    }
  }

  const gitignore = readFileSync(path.join(repoRoot, ".gitignore"), "utf8");
  for (const token of [".worktrees/", ".cursor/ownership.local.md"]) {
    if (!gitignore.includes(token)) {
      errors.push(`.gitignore missing ${token}`);
    }
  }

  const appsContract = loadJson("ecosystem-contracts/apps.json");
  const slugs = Array.isArray(appsContract.canonicalSlugs) ? appsContract.canonicalSlugs : [];
  if (slugs.length !== 6 || slugs.includes("pitstrike")) {
    errors.push("ecosystem-contracts/apps.json must list exactly six products and must not include pitstrike");
  }
  if (appsContract.apps?.some((app) => app.slug === "pitstrike")) {
    errors.push("PitStrike must not be an ecosystem-contracts apps[] member");
  }

  return errors;
}

function main() {
  const errors = verifyWorkflowSetup();
  if (errors.length > 0) {
    console.error("Workflow setup verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log("Workflow setup verification PASS");
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
