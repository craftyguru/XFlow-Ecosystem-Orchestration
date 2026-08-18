#!/usr/bin/env node
/**
 * Non-mutating repository inspect for phase start and ownership transfer.
 * Does not reset, stash, clean, or modify files.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function gitOrEmpty(args) {
  try {
    return git(args);
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error ? String(error.stderr) : "";
    const message = error instanceof Error ? error.message : String(error);
    return `ERROR: ${stderr || message}`;
  }
}

export function classifyPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  if (
    normalized.startsWith(".cursor/") ||
    normalized === "AGENTS.md" ||
    normalized === "CONTRIBUTING.md" ||
    normalized === "README.md" ||
    normalized === ".gitignore" ||
    normalized === "docs/development-workflow.md" ||
    normalized === "docs/cursor-global-rule.md" ||
    normalized === "docs/ecosystem/README.md" ||
    normalized.startsWith("docs/templates/") ||
    normalized.startsWith("scripts/dev-workflow/")
  ) {
    return "workflow-setup";
  }
  return "pre-existing-or-unrelated";
}

export function parseStatusLines(statusOutput) {
  const lines = statusOutput
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !line.startsWith("##"));

  return lines.map((line) => {
    const code = line.slice(0, 2);
    const filePath = line.slice(3).replaceAll("\\", "/");
    return { code, path: filePath, category: classifyPath(filePath) };
  });
}

function printSection(title, body) {
  console.log(`\n## ${title}`);
  console.log(body || "(empty)");
}

function main() {
  console.log("XFlow ecosystem repository inspect (read-only)");
  console.log(`root: ${repoRoot}`);
  printSection("branch", gitOrEmpty(["rev-parse", "--abbrev-ref", "HEAD"]));
  printSection("head", gitOrEmpty(["rev-parse", "--short", "HEAD"]));
  printSection("status", gitOrEmpty(["status", "--short", "--branch"]));
  printSection("worktrees", gitOrEmpty(["worktree", "list"]));

  const status = gitOrEmpty(["status", "--short"]);
  const entries = parseStatusLines(status);
  const workflow = entries.filter((entry) => entry.category === "workflow-setup");
  const other = entries.filter((entry) => entry.category !== "workflow-setup");

  printSection(
    "workflow-setup files in working tree",
    workflow.length ? workflow.map((entry) => `${entry.code} ${entry.path}`).join("\n") : "(none)",
  );
  printSection(
    "protected pre-existing / unrelated dirty files",
    other.length ? other.map((entry) => `${entry.code} ${entry.path}`).join("\n") : "(none)",
  );

  const expectedRules = [
    "development-workflow.mdc",
    "git-safety.mdc",
    "cursor-codex-coordination.mdc",
    "phase-management.mdc",
    "testing-and-acceptance.mdc",
    "worktree-policy.mdc",
    "database-and-migrations.mdc",
    "dependency-and-lockfile-safety.mdc",
  ];
  const missingRules = expectedRules.filter(
    (name) => !existsSync(path.join(repoRoot, ".cursor", "rules", name)),
  );
  printSection("cursor rules", missingRules.length ? `MISSING: ${missingRules.join(", ")}` : "present");
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
