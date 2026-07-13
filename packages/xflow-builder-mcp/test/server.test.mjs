import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("starts over stdio and exposes the XFlow builder tool set", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["src/server.mjs"],
    cwd: packageRoot,
    env: {
      ...process.env,
      XFLOW_API_KEY: "xflow_test_testonly",
      WORDGENI_API_ORIGIN: "https://api.wordgeni.com",
      CREVUX_API_ORIGIN: "https://crevux.com/api",
    },
  });
  const client = new Client({ name: "xflow-builder-test", version: "0.1.0" });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    const names = listed.tools.map((tool) => tool.name);
    assert.deepEqual(names.sort(), [
      "crevux_generate_image",
      "crevux_generate_video",
      "crevux_get_asset",
      "crevux_get_credit_balance",
      "crevux_get_credit_ledger",
      "crevux_get_job_status",
      "crevux_list_assets",
      "crevux_list_jobs",
      "crevux_request",
      "crevux_search_assets",
      "wordgeni_generate_text",
      "wordgeni_request",
      "wordgeni_run_agent",
      "xflow_connection_status",
      "xflow_get_entitlements",
      "xflow_get_usage",
    ]);
    for (const name of [
      "crevux_get_asset",
      "crevux_get_credit_balance",
      "crevux_get_credit_ledger",
      "crevux_get_job_status",
      "crevux_list_assets",
      "crevux_list_jobs",
      "crevux_search_assets",
      "xflow_get_entitlements",
      "xflow_get_usage",
      "xflow_connection_status",
    ]) {
      const tool = listed.tools.find((candidate) => candidate.name === name);
      assert.equal(tool?.annotations?.readOnlyHint, true, `${name} must be declared read-only`);
      assert.equal(tool?.annotations?.destructiveHint, false, `${name} must be declared non-destructive`);
    }
    const status = await client.callTool({ name: "xflow_connection_status", arguments: {} });
    const payload = JSON.parse(status.content[0].text);
    assert.equal(payload.keyConfigured, true);
    assert.equal(payload.wordgeni.reachable, true);
    assert.equal(payload.crevux.reachable, true);
  } finally {
    await client.close();
  }
});
