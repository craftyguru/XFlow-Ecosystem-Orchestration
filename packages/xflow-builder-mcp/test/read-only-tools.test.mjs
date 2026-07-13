import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("dedicated operational tools issue only the registered read-only GET requests", async () => {
  const requests = [];
  const httpServer = createServer((request, response) => {
    requests.push({ method: request.method, url: request.url });
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
  });
  httpServer.listen(0, "127.0.0.1");
  await once(httpServer, "listening");
  const address = httpServer.address();
  assert.equal(typeof address, "object");
  const origin = `http://127.0.0.1:${address.port}`;

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["src/server.mjs"],
    cwd: packageRoot,
    env: {
      ...process.env,
      XFLOW_API_KEY: "xflow_test_testonly",
      CREVUX_API_ORIGIN: `${origin}/api`,
      XFLOW_API_ORIGIN: origin,
    },
  });
  const client = new Client({ name: "xflow-read-only-test", version: "0.1.0" });
  try {
    await client.connect(transport);
    const calls = [
      ["crevux_get_job_status", { jobId: 42 }],
      ["crevux_list_jobs", { limit: 20, offset: 5 }],
      ["crevux_get_asset", { assetId: "00000000-0000-4000-8000-000000000042" }],
      ["crevux_search_assets", { type: "image", favorite: true }],
      ["crevux_get_credit_balance", {}],
      ["crevux_get_credit_ledger", { limit: 10, beforeId: 99 }],
      ["xflow_get_usage", { since: "2026-07-01T00:00:00.000Z" }],
      ["xflow_get_entitlements", {}],
    ];
    for (const [name, args] of calls) {
      const response = await client.callTool({ name, arguments: args });
      assert.notEqual(response.isError, true, `${name} should succeed`);
    }

    assert.deepEqual(requests, [
      { method: "GET", url: "/api/video/jobs/42" },
      { method: "GET", url: "/api/video/jobs/list?limit=20&offset=5" },
      { method: "GET", url: "/api/assets/00000000-0000-4000-8000-000000000042" },
      { method: "GET", url: "/api/assets?type=image&favorite=true" },
      { method: "GET", url: "/api/ai/credits/balance" },
      { method: "GET", url: "/api/ai/credits/ledger?limit=10&beforeId=99" },
      { method: "GET", url: "/api/developer/runtime/usage?since=2026-07-01T00%3A00%3A00.000Z" },
      { method: "GET", url: "/api/developer/runtime/entitlements" },
    ]);
    assert.ok(requests.every((request) => request.method === "GET"));
    assert.ok(
      requests.every((request) => !request.url.includes("/generate")),
      "Phase 2A reads must never call an image or video generation route",
    );
  } finally {
    await client.close();
    httpServer.close();
    await once(httpServer, "close");
  }
});
