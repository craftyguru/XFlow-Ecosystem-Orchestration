import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function callOk(result) {
  return result.isError !== true && Array.isArray(result.content) && result.content.length > 0;
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["src/server.mjs"],
  cwd: packageRoot,
  env: process.env,
});
const client = new Client({ name: "xflow-builder-live-smoke", version: "0.1.0" });

try {
  await client.connect(transport);
  const status = await client.callTool({ name: "xflow_connection_status", arguments: {} });
  const statusPayload = JSON.parse(status.content[0].text);
  if (!statusPayload.keyConfigured || !statusPayload.wordgeni.reachable || !statusPayload.crevux.reachable) {
    throw new Error(`Connection status failed: ${status.content[0].text}`);
  }

  const wordgeni = await client.callTool({
    name: "wordgeni_generate_text",
    arguments: {
      prompt: "Rewrite this connection test as one concise sentence: WordGeni is connected to Codex through XFlow.",
      domain: "business",
      documentType: "connection test",
    },
  });
  if (!callOk(wordgeni)) throw new Error(`WordGeni smoke failed: ${wordgeni.content?.[0]?.text || "unknown error"}`);

  const crevux = await client.callTool({ name: "crevux_list_assets", arguments: {} });
  if (!callOk(crevux)) throw new Error(`Crevux smoke failed: ${crevux.content?.[0]?.text || "unknown error"}`);

  process.stdout.write(`${JSON.stringify({
    ok: true,
    environment: statusPayload.environment,
    wordgeni: "authenticated request succeeded",
    crevux: "authenticated request succeeded",
  }, null, 2)}\n`);
} finally {
  await client.close();
}
