# XFlow Builder MCP

This stdio MCP server gives Codex, Claude, and other MCP clients scoped tools for the WordGeni and Crevux APIs. XFlow remains the key, scope, entitlement, usage, and request-log authority.

## Requirements

- Node.js 22.18 or newer
- An XFlow `xflow_test_*` or `xflow_live_*` developer key
- WordGeni and/or Crevux scopes appropriate to the tools the client will call

## Install and run

```bash
npm install
XFLOW_API_KEY=xflow_test_REPLACE_ME npm start
```

Optional environment variables:

```text
WORDGENI_API_ORIGIN=https://api.wordgeni.com
CREVUX_API_ORIGIN=https://crevux.com/api
XFLOW_API_ORIGIN=https://api.xflowx.com
XFLOW_MCP_TIMEOUT_MS=120000
```

Keep `XFLOW_API_KEY` in the MCP client's secret manager or process environment. Never put it in client-side code, a prompt, a committed config file, or command-line history.

## Codex

Use the workspace-level `.codex/config.toml` included in this repository. Codex loads project config only for trusted repositories. Restart Codex after adding or changing the key environment variable.

## Claude and other MCP clients

Register a stdio server whose command is `node`, whose first argument is the absolute path to `src/server.mjs`, and whose environment contains `XFLOW_API_KEY`. The exact settings UI varies by client, but the MCP transport and tool behavior are the same.

## Replit or builders without MCP

Run this package as a long-lived backend process only when the builder supports stdio MCP. Otherwise, call the product APIs from server actions using the same bearer key:

- WordGeni: `https://api.wordgeni.com`
- Crevux: `https://crevux.com/api`

Do not expose the key in browser code or send execution requests to `api.xflowx.com`.

## Verification

```bash
npm test
```

The tests start the server through the MCP SDK, enumerate all tools, confirm both production health endpoints are reachable, and verify that unsafe route/method combinations are blocked.

## Read-only operational tools

- `crevux_list_assets` lists assets.
- `crevux_get_asset` reads one asset by UUID.
- `crevux_search_assets` filters assets by supported Crevux list filters.
- `crevux_list_jobs` lists existing video jobs.
- `crevux_get_job_status` reads one video job without starting or retrying it.
- `crevux_get_credit_balance` reads the current Crevux credit summary.
- `crevux_get_credit_ledger` reads debit and refund history.
- `xflow_get_usage` reads usage scoped to the connected developer key.
- `xflow_get_entitlements` reads sanitized scopes, app access, expiration, and entitlement state.

These tools use only registered `GET` routes and are declared read-only and non-destructive in their MCP annotations.
