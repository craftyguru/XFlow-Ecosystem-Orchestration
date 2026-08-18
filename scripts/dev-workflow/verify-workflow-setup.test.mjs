import test from "node:test";
import assert from "node:assert/strict";
import { parseStatusLines, classifyPath } from "./inspect-repo.mjs";
import { parseFrontmatter, verifyWorkflowSetup } from "./verify-workflow-setup.mjs";

test("classifyPath isolates workflow files from unrelated dirty files", () => {
  assert.equal(classifyPath(".cursor/rules/git-safety.mdc"), "workflow-setup");
  assert.equal(classifyPath("docs/development-workflow.md"), "workflow-setup");
  assert.equal(classifyPath("README.md"), "workflow-setup");
  assert.equal(classifyPath(".gitignore"), "workflow-setup");
  assert.equal(classifyPath("package.json"), "pre-existing-or-unrelated");
  assert.equal(classifyPath("docs/chronicle-roadmap.md"), "pre-existing-or-unrelated");
});

test("parseStatusLines ignores the branch header", () => {
  const parsed = parseStatusLines("## main\n M package.json\n?? .cursor/rules/git-safety.mdc");
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].category, "pre-existing-or-unrelated");
  assert.equal(parsed[1].category, "workflow-setup");
});

test("parseFrontmatter requires description and alwaysApply", () => {
  const fields = parseFrontmatter("---\ndescription: Example\nalwaysApply: true\n---\n\n# Title\n");
  assert.equal(fields.description, "Example");
  assert.equal(fields.alwaysApply, "true");
  assert.throws(() => parseFrontmatter("# no frontmatter\n"));
});

test("verifyWorkflowSetup matches repository files and real root scripts", () => {
  const errors = verifyWorkflowSetup();
  assert.deepEqual(errors, []);
});
