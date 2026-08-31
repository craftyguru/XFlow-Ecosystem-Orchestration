import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceInstructionsPath = resolve(packageRoot, "..", "..", "AGENTS.md");

async function readInstructions() {
  return readFile(workspaceInstructionsPath, "utf8");
}

test("defines selective WordGeni routing without requiring it for tiny edits", async () => {
  const instructions = await readInstructions();
  assert.match(instructions, /Prefer the native WordGeni tools when:/);
  assert.match(instructions, /user explicitly requests WordGeni/i);
  assert.match(instructions, /materially benefits from WordGeni capabilities/i);
  assert.match(instructions, /Workspace-grounded writing is needed/i);
  assert.match(instructions, /multi-step writing workflow/i);
  assert.match(instructions, /Do not require WordGeni for every small user-facing writing task/i);
});

test("prefers the dedicated asset-list tool and restricts advanced read-only calls", async () => {
  const instructions = await readInstructions();
  assert.match(instructions, /Use `crevux_list_assets` for asset listing\./);
  for (const name of [
    "crevux_get_job_status",
    "crevux_list_jobs",
    "crevux_get_asset",
    "crevux_search_assets",
    "crevux_get_credit_balance",
    "crevux_get_credit_ledger",
    "xflow_get_usage",
    "xflow_get_entitlements",
  ]) {
    assert.match(instructions, new RegExp(`\\b${name}\\b`));
  }
  assert.match(instructions, /Use `crevux_request` only for allowlisted read-only operations that do not have a dedicated tool\./);
  assert.match(instructions, /must use an allowlisted `GET` route/);
  assert.match(instructions, /must not use `POST`, `PATCH`, or a generation tool/);
});

test("requires a specific confirmation summary before paid generation", async () => {
  const instructions = await readInstructions();
  assert.match(instructions, /`crevux_generate_image`/);
  assert.match(instructions, /`crevux_generate_video`/);
  assert.match(instructions, /do not call the generation tool immediately/i);
  for (const field of [
    "Media type",
    "Intended prompt or subject",
    "Number of outputs or jobs",
    "Known or unknown credit estimate",
    "Active environment",
  ]) {
    assert.match(instructions, new RegExp(field, "i"));
  }
  assert.match(instructions, /Confirmation is valid only when it occurs after the confirmation summary/i);
  assert.match(instructions, /Do not reuse confirmation for a materially different prompt, media type, model, provider, output count, or job\./);
  assert.match(instructions, /credit cost is unknown before requesting confirmation/i);
});

test("rejects vague generation authorization and honors no-credit constraints", async () => {
  const instructions = await readInstructions();
  for (const phrase of ["Make this better", "Create something", "Add visuals", "Render this"]) {
    assert.match(instructions, new RegExp(phrase, "i"));
  }
  assert.match(instructions, /This prohibition takes precedence/);
  assert.match(instructions, /then do not call `crevux_generate_image` or `crevux_generate_video`/);
});

test("limits connection-status checks to meaningful verification and diagnostic states", async () => {
  const instructions = await readInstructions();
  for (const reason of [
    "integration diagnosis",
    "startup verification",
    "authentication or connectivity failures",
    "unknown or ambiguous environment state",
  ]) {
    assert.match(instructions, new RegExp(reason, "i"));
  }
  assert.match(instructions, /Do not require a connection-status call before routine WordGeni or Crevux requests/i);
});

test("protects credentials and defaults builder integration work to test", async () => {
  const instructions = await readInstructions();
  assert.match(instructions, /Default all XFlow Builder integration work to the test environment\./);
  assert.match(instructions, /Never expose, print, log, echo, serialize, paste into a command, or commit credentials\./);
  assert.match(instructions, /Do not enable live credentials, production billing, or paid production routes/);
  assert.match(instructions, /without exposing or requesting the credential in chat/i);
});

test("keeps every approved Phase 1 acceptance outcome in the policy contract", async () => {
  const instructions = await readInstructions();
  const cases = [
    "clear-wordgeni-request",
    "small-writing-request",
    "clear-read-only-crevux-request",
    "ambiguous-generation-request",
    "explicit-generation-without-confirmation",
    "explicit-confirmed-generation-request",
    "changed-generation-request",
    "unknown-credit-cost",
    "credit-prohibited-request",
    "diagnostic-status-request",
    "credential-failure",
  ];
  for (const caseId of cases) assert.match(instructions, new RegExp(`\\b${caseId}\\b`));
});
