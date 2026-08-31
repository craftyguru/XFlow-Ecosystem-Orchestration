# XFlow builder connection guide

This workspace includes an MCP bridge for Codex and any other MCP-compatible builder. It turns XFlow-scoped access into native WordGeni and Crevux tools without placing a raw API key in source control.

## What is connected

- XFlow owns key issuance, app access, scopes, entitlements, request logs, and usage.
- WordGeni executes writing, document, RAG, and writing-agent requests at `https://api.wordgeni.com`.
- Crevux executes image, video, asset, storyboard, and creative-agent requests at `https://crevux.com/api`.
- `packages/xflow-builder-mcp` exposes those execution services as MCP tools and restricts advanced requests to the route families already registered as builder-safe.

## Create the right key

1. Open XFlow **Developer > API Keys**.
2. Choose **ALL Full agent builder** for a builder that needs both products.
3. Start with a **Test key**.
4. Give the key a unique label for the builder and environment, such as `Codex Workspace - Test`.
5. Confirm all eight WordGeni and Crevux scopes are selected.
6. Create the key and copy the raw value immediately. XFlow shows it once.

For production, create a separate live key after the test workflow succeeds. Never reuse one key across unrelated builders or environments.

## Connect Codex on Windows

From PowerShell, store the copied key in the current Windows user's environment:

```powershell
[Environment]::SetEnvironmentVariable("XFLOW_API_KEY", "xflow_test_REPLACE_ME", "User")
```

Then fully restart Codex and open this trusted workspace. Codex reads `.codex/config.toml`, starts the workspace MCP server, and forwards only `XFLOW_API_KEY` to it.

Do not commit the key, paste it into `.codex/config.toml`, or place it in frontend code.

## Connect another MCP builder

Install the bridge once:

```bash
npm --prefix packages/xflow-builder-mcp install
```

Configure the builder to run:

```text
node packages/xflow-builder-mcp/src/server.mjs
```

Provide these server-side environment variables through that builder's secret manager:

```text
XFLOW_API_KEY=xflow_test_REPLACE_ME
WORDGENI_API_ORIGIN=https://api.wordgeni.com
CREVUX_API_ORIGIN=https://crevux.com/api
XFLOW_API_ORIGIN=https://api.xflowx.com
```

For builders without MCP support, use the same bearer key directly against the product API origin. Do not send WordGeni or Crevux execution requests to `api.xflowx.com`; XFlow validates and records the key, while the satellite product executes the request.

## Verify

After restarting the builder:

1. Call `xflow_connection_status`. Both origins must be reachable and `keyConfigured` must be `true`.
2. Call `wordgeni_generate_text` with a short test prompt.
3. Call a non-billable Crevux read through `crevux_list_assets` before starting image or video generation.
4. Open XFlow **Developer > Usage & Logs** and confirm the calls appear with the expected app and scope.
5. Revoke the test key if any builder or log output ever exposes its raw value.

## Tool map

| MCP tool | Product | Primary XFlow scope |
| --- | --- | --- |
| `wordgeni_generate_text` | WordGeni | `wordgeni:text.generate` |
| `wordgeni_run_agent` | WordGeni | `wordgeni:agent.run` |
| `wordgeni_request` | WordGeni | Determined by the registered route |
| `crevux_generate_image` | Crevux | `crevux:image.generate` |
| `crevux_generate_video` | Crevux | `crevux:video.generate` |
| `crevux_list_assets` | Crevux | `crevux:asset.create` |
| `crevux_get_asset` | Crevux | `crevux:asset.create` |
| `crevux_search_assets` | Crevux | `crevux:asset.create` |
| `crevux_list_jobs` | Crevux | `crevux:video.generate` |
| `crevux_get_job_status` | Crevux | `crevux:video.generate` |
| `crevux_get_credit_balance` | Crevux | `crevux:asset.create` |
| `crevux_get_credit_ledger` | Crevux | `crevux:asset.create` |
| `xflow_get_usage` | XFlow | The connected active developer key |
| `xflow_get_entitlements` | XFlow | The connected active developer key |
| `crevux_request` | Crevux | Determined by the registered route |

The advanced request tools do not permit arbitrary URLs or unregistered methods. XFlow and each satellite service still enforce the key's app access, scope, workspace mapping, plan, quota, and credit rules.
