#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { assertBuilderSafeRequest, joinApiUrl } from "./policy.mjs";

const WORDGENI_ORIGIN = (process.env.WORDGENI_API_ORIGIN || "https://api.wordgeni.com").replace(/\/+$/, "");
const CREVUX_ORIGIN = (process.env.CREVUX_API_ORIGIN || "https://crevux.com/api").replace(/\/+$/, "");
const XFLOW_ORIGIN = (process.env.XFLOW_API_ORIGIN || "https://api.xflowx.com").replace(/\/+$/, "");
const XFLOW_API_KEY = process.env.XFLOW_API_KEY?.trim() || "";
const REQUEST_TIMEOUT_MS = Math.max(5_000, Math.min(Number(process.env.XFLOW_MCP_TIMEOUT_MS) || 120_000, 300_000));

function redact(value) {
  return String(value)
    .replace(/xflow_(?:test|live)_[A-Za-z0-9_-]+/g, "xflow_[redacted]")
    .replace(/(?:authorization|api[_-]?key)[\"']?\s*[:=]\s*[\"']?[^\s,}\"]+/gi, "$1=[redacted]");
}

function requireKey() {
  if (!/^xflow_(test|live)_[A-Za-z0-9_-]+$/.test(XFLOW_API_KEY)) {
    throw new Error("XFLOW_API_KEY is missing or is not an XFlow test/live developer key.");
  }
}

function result(payload, isError = false) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text: redact(text) }], ...(isError ? { isError: true } : {}) };
}

async function apiRequest(product, method, path, body) {
  requireKey();
  const safe = assertBuilderSafeRequest(product, method, path);
  const origin = product === "wordgeni" ? WORDGENI_ORIGIN : CREVUX_ORIGIN;
  const response = await fetch(joinApiUrl(origin, safe.path), {
    method: safe.method,
    headers: {
      authorization: `Bearer ${XFLOW_API_KEY}`,
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(safe.method === "GET" ? {} : { "idempotency-key": randomUUID() }),
      "x-xflow-builder": "mcp",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({ error: "Invalid JSON response" }))
    : await response.text();
  if (!response.ok) {
    return result({ ok: false, status: response.status, product, path: safe.path, error: payload }, true);
  }
  return result({ ok: true, status: response.status, product, path: safe.path, data: payload });
}

async function xflowRead(path) {
  requireKey();
  if (!["/api/developer/runtime/usage", "/api/developer/runtime/entitlements"].some(
    (allowed) => path === allowed || path.startsWith(`${allowed}?`),
  )) {
    throw new Error("Only registered read-only XFlow runtime routes are accepted.");
  }
  const response = await fetch(joinApiUrl(XFLOW_ORIGIN, path), {
    method: "GET",
    headers: {
      authorization: `Bearer ${XFLOW_API_KEY}`,
      accept: "application/json",
      "x-xflow-builder": "mcp",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const payload = await response.json().catch(() => ({ error: "Invalid JSON response" }));
  if (!response.ok) {
    return result({ ok: false, status: response.status, product: "xflow", path, error: payload }, true);
  }
  return result({ ok: true, status: response.status, product: "xflow", path, data: payload });
}

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const server = new McpServer({ name: "xflow-builder", version: "0.1.0" });

server.registerTool(
  "xflow_connection_status",
  {
    title: "Check XFlow builder connection",
    description: "Verify that the XFlow key is configured and that the WordGeni and Crevux production APIs are reachable. Does not reveal the key.",
    inputSchema: {},
    annotations: readOnlyAnnotations,
  },
  async () => {
    const checks = await Promise.all([
      fetch(`${WORDGENI_ORIGIN}/health`, { signal: AbortSignal.timeout(15_000) }),
      fetch(joinApiUrl(CREVUX_ORIGIN, "/api/healthz"), { signal: AbortSignal.timeout(15_000) }),
    ].map(async (promise) => {
      try {
        const response = await promise;
        return { reachable: response.ok, status: response.status };
      } catch (error) {
        return { reachable: false, error: error instanceof Error ? error.message : "Connection failed" };
      }
    }));
    return result({
      keyConfigured: /^xflow_(test|live)_/.test(XFLOW_API_KEY),
      environment: XFLOW_API_KEY.startsWith("xflow_live_") ? "live" : XFLOW_API_KEY.startsWith("xflow_test_") ? "test" : "missing",
      wordgeni: { origin: WORDGENI_ORIGIN, ...checks[0] },
      crevux: { origin: CREVUX_ORIGIN, ...checks[1] },
    });
  },
);

server.registerTool(
  "wordgeni_generate_text",
  {
    title: "Generate or improve text with WordGeni",
    description: "Use WordGeni text intelligence for drafting, rewriting, and prompt improvement. Requires wordgeni:text.generate.",
    inputSchema: {
      prompt: z.string().min(1).describe("The text-generation or rewriting request."),
      domain: z.string().optional().describe("Optional content domain, such as business or marketing."),
      documentType: z.string().optional().describe("Optional target document type."),
    },
  },
  async ({ prompt, domain, documentType }) => apiRequest("wordgeni", "POST", "/api/ai/touchup-prompt", {
    prompt,
    domain: domain || "general",
    documentType: documentType || "document",
  }),
);

server.registerTool(
  "wordgeni_run_agent",
  {
    title: "Run a WordGeni writing agent",
    description: "Run WordGeni's builder agent for multi-step writing and workspace-grounded assistance. Requires wordgeni:agent.run.",
    inputSchema: {
      message: z.string().min(1),
      context: z.record(z.string(), z.unknown()).optional(),
    },
  },
  async ({ message, context }) => apiRequest("wordgeni", "POST", "/api/genie/chat", {
    message,
    mode: "builder_agent",
    ...(context ? { context } : {}),
  }),
);

server.registerTool(
  "wordgeni_request",
  {
    title: "Call an advanced WordGeni builder route",
    description: "Advanced access to WordGeni document, RAG, voice-draft, text, and agent routes. Requests are restricted to the server's builder-safe allowlist and the XFlow key's scopes.",
    inputSchema: {
      method: z.enum(["GET", "POST", "PATCH"]),
      path: z.string().startsWith("/api/"),
      body: z.unknown().optional(),
    },
  },
  async ({ method, path, body }) => apiRequest("wordgeni", method, path, body),
);

server.registerTool(
  "crevux_generate_image",
  {
    title: "Generate an image with Crevux",
    description: "Generate a governed image or visual variant with Crevux. Requires crevux:image.generate and consumes media credits.",
    inputSchema: {
      prompt: z.string().min(1),
      model: z.string().optional(),
      size: z.string().optional(),
      count: z.number().int().min(1).max(4).optional(),
      options: z.record(z.string(), z.unknown()).optional(),
    },
  },
  async ({ prompt, model, size, count, options }) => apiRequest("crevux", "POST", "/api/openai/generate-image", {
    prompt,
    ...(model ? { model } : {}),
    ...(size ? { size } : {}),
    ...(count ? { count } : {}),
    ...(options || {}),
  }),
);

server.registerTool(
  "crevux_generate_video",
  {
    title: "Start a Crevux video job",
    description: "Start a governed Crevux video-generation job. Requires crevux:video.generate and consumes media credits.",
    inputSchema: {
      prompt: z.string().min(1),
      options: z.record(z.string(), z.unknown()).optional(),
    },
  },
  async ({ prompt, options }) => apiRequest("crevux", "POST", "/api/video/generate", { prompt, ...(options || {}) }),
);

server.registerTool(
  "crevux_list_assets",
  {
    title: "List Crevux assets",
    description: "List reusable Crevux media assets available to the connected workspace. Requires crevux:asset.create under the XFlow scope model.",
    inputSchema: {},
    annotations: readOnlyAnnotations,
  },
  async () => apiRequest("crevux", "GET", "/api/assets"),
);

server.registerTool(
  "crevux_get_job_status",
  {
    title: "Get Crevux video job status",
    description: "Read the current state of an existing Crevux video job without starting or retrying generation.",
    inputSchema: { jobId: z.number().int().positive() },
    annotations: readOnlyAnnotations,
  },
  async ({ jobId }) => apiRequest("crevux", "GET", `/api/video/jobs/${jobId}`),
);

server.registerTool(
  "crevux_list_jobs",
  {
    title: "List Crevux video jobs",
    description: "List existing Crevux video jobs with read-only pagination.",
    inputSchema: {
      limit: z.number().int().min(1).max(200).optional(),
      offset: z.number().int().nonnegative().optional(),
    },
    annotations: readOnlyAnnotations,
  },
  async ({ limit, offset }) => {
    const query = new URLSearchParams();
    if (limit !== undefined) query.set("limit", String(limit));
    if (offset !== undefined) query.set("offset", String(offset));
    return apiRequest("crevux", "GET", `/api/video/jobs/list${query.size ? `?${query}` : ""}`);
  },
);

server.registerTool(
  "crevux_get_asset",
  {
    title: "Get a Crevux asset",
    description: "Read one workspace-owned Crevux asset by UUID.",
    inputSchema: { assetId: z.string().uuid() },
    annotations: readOnlyAnnotations,
  },
  async ({ assetId }) => apiRequest("crevux", "GET", `/api/assets/${assetId}`),
);

server.registerTool(
  "crevux_search_assets",
  {
    title: "Search Crevux assets",
    description: "Filter workspace-owned Crevux assets by media type or project without modifying them.",
    inputSchema: {
      type: z.enum(["image", "video", "upload", "panel", "storyboard", "mesh", "texture_set", "rig", "animatic", "export_package"]).optional(),
      projectId: z.string().uuid().optional(),
      favorite: z.boolean().optional(),
      archived: z.boolean().optional(),
      sourceImageId: z.number().int().optional(),
    },
    annotations: readOnlyAnnotations,
  },
  async ({ type, projectId, favorite, archived, sourceImageId }) => {
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (projectId) query.set("projectId", projectId);
    if (favorite !== undefined) query.set("favorite", String(favorite));
    if (archived !== undefined) query.set("archived", String(archived));
    if (sourceImageId !== undefined) query.set("sourceImageId", String(sourceImageId));
    return apiRequest("crevux", "GET", `/api/assets${query.size ? `?${query}` : ""}`);
  },
);

server.registerTool(
  "crevux_get_credit_balance",
  {
    title: "Get Crevux credit balance",
    description: "Read the current Crevux credit balance and billing-state summary without consuming credits.",
    inputSchema: {},
    annotations: readOnlyAnnotations,
  },
  async () => apiRequest("crevux", "GET", "/api/ai/credits/balance"),
);

server.registerTool(
  "crevux_get_credit_ledger",
  {
    title: "Get Crevux credit ledger",
    description: "Read paginated Crevux credit debit and refund events without consuming credits.",
    inputSchema: {
      limit: z.number().int().min(1).max(200).optional(),
      beforeId: z.number().int().positive().optional(),
    },
    annotations: readOnlyAnnotations,
  },
  async ({ limit, beforeId }) => {
    const query = new URLSearchParams();
    if (limit !== undefined) query.set("limit", String(limit));
    if (beforeId !== undefined) query.set("beforeId", String(beforeId));
    return apiRequest("crevux", "GET", `/api/ai/credits/ledger${query.size ? `?${query}` : ""}`);
  },
);

server.registerTool(
  "xflow_get_usage",
  {
    title: "Get XFlow builder usage",
    description: "Read sanitized usage recorded for the connected XFlow developer key.",
    inputSchema: { since: z.string().datetime().optional() },
    annotations: readOnlyAnnotations,
  },
  async ({ since }) => xflowRead(`/api/developer/runtime/usage${since ? `?since=${encodeURIComponent(since)}` : ""}`),
);

server.registerTool(
  "xflow_get_entitlements",
  {
    title: "Get XFlow builder entitlements",
    description: "Read the connected key's sanitized environment, scopes, app access, expiration, and entitlement state.",
    inputSchema: {},
    annotations: readOnlyAnnotations,
  },
  async () => xflowRead("/api/developer/runtime/entitlements"),
);

server.registerTool(
  "crevux_request",
  {
    title: "Call an advanced Crevux builder route",
    description: "Advanced access to Crevux image, video, asset, storyboard, credit, copilot, and studio routes. Requests are restricted to the server's builder-safe allowlist and the XFlow key's scopes.",
    inputSchema: {
      method: z.enum(["GET", "POST", "PATCH"]),
      path: z.string().startsWith("/api/"),
      body: z.unknown().optional(),
    },
  },
  async ({ method, path, body }) => apiRequest("crevux", method, path, body),
);

await server.connect(new StdioServerTransport());
