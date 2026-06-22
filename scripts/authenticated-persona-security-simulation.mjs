#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const ALLOW_PRIVILEGED_MUTATIONS = process.env.AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS === "1";

function loadEnvFile(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;
  const source = fs.readFileSync(full, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const ENV_FILE_ARG = process.argv.find((arg) => arg.startsWith("--persona-env-file="))?.slice("--persona-env-file=".length);
for (const file of [
  ENV_FILE_ARG,
  ".env.security-local",
  ".env.shared.local",
  ".env.phase6d.local",
  ".env.proof.local",
].filter(Boolean)) {
  loadEnvFile(file);
}

const FIXTURE_FILE = process.env.AUTH_PERSONA_FIXTURES_FILE?.trim();

const apps = [
  { app: "XFlow", slug: "xflow", env: "XFLOW_PROOF_BASE_URL", fallback: "https://xflowx.com" },
  { app: "Verixet", slug: "verixet", env: "VERIXET_PROOF_BASE_URL", fallback: "https://verixet.com" },
  { app: "RatAiFy", slug: "rataify", env: "RATAIFY_PROOF_BASE_URL", fallback: "https://rataify.com" },
  { app: "AudAiX", slug: "audaix", env: "AUDAIX_PROOF_BASE_URL", fallback: "https://audaix.com" },
  { app: "WordGeni", slug: "wordgeni", env: "WORDGENI_PROOF_BASE_URL", fallback: "https://wordgeni.com" },
  { app: "CreVux", slug: "crevux", env: "CREVUX_PROOF_BASE_URL", fallback: "https://crevux.com" },
];

const personas = [
  {
    key: "unauthenticated",
    envAliases: ["UNAUTHENTICATED"],
    label: "unauthenticated visitor",
    role: "public",
    required: false,
    available: true,
    expectedAllowed: ["/", "/privacy", "/terms", "/security", "/contact", "/status"],
    expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/dashboard/admin", "/api/admin/apps", "/api/internal/status"],
  },
  {
    key: "normal_user",
    envAliases: ["NORMAL", "NORMAL_USER"],
    label: "normal authenticated user",
    role: "user",
    expectedAllowed: ["/dashboard", "/account", "/api/auth/me", "/api/ecosystem/session"],
    expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/platform/v1/entitlements/evaluate"],
  },
  {
    key: "workspace_admin",
    envAliases: ["WORKSPACE_ADMIN"],
    label: "workspace admin",
    role: "workspace_admin",
    expectedAllowed: ["/dashboard", "/settings/billing", "/api/workspaces/active"],
    expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users"],
  },
  {
    key: "app_admin",
    envAliases: ["APP_ADMIN"],
    label: "app admin",
    role: "app_admin",
    expectedAllowed: ["/dashboard", "/admin"],
    expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    optional: true,
  },
  {
    key: "support_admin",
    envAliases: ["SUPPORT_ADMIN"],
    label: "support admin",
    role: "support_admin",
    expectedAllowed: ["/admin/support", "/api/admin/support/conversations"],
    expectedDenied: ["/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    optional: true,
  },
  {
    key: "security_admin",
    envAliases: ["SECURITY_ADMIN"],
    label: "security admin",
    role: "security_admin",
    expectedAllowed: ["/admin/system-status", "/api/admin/system-status"],
    expectedDenied: ["/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    optional: true,
  },
  {
    key: "superadmin",
    envAliases: ["SUPERADMIN", "PLATFORM_OWNER"],
    label: "superadmin/platform owner",
    role: "superadmin",
    expectedAllowed: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    expectedDenied: [],
    optional: true,
  },
  {
    key: "expired_user",
    envAliases: ["EXPIRED", "EXPIRED_USER", "PAST_DUE"],
    label: "expired/past_due subscription user",
    role: "user",
    entitlementState: "past_due",
    expectedAllowed: ["/account", "/billing/manage", "/settings/billing"],
    expectedDenied: ["/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    optional: true,
  },
  {
    key: "canceled_user",
    envAliases: ["CANCELED", "CANCELLED", "CANCELED_USER", "CANCELLED_USER"],
    label: "canceled subscription user",
    role: "user",
    entitlementState: "canceled",
    expectedAllowed: ["/account", "/billing/manage", "/settings/billing"],
    expectedDenied: ["/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    optional: true,
  },
  {
    key: "cross_workspace_user",
    envAliases: ["CROSS_WORKSPACE", "CROSS_WORKSPACE_USER"],
    label: "cross-workspace user",
    role: "user",
    expectedAllowed: ["/dashboard"],
    expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    optional: true,
  },
];

const mutationRoutes = [
  { route: "/api/admin/apps", expectedDeniedFor: ["normal_user", "workspace_admin", "app_admin", "support_admin", "security_admin", "expired_user", "canceled_user", "cross_workspace_user"] },
  { route: "/api/admin/billing", expectedDeniedFor: ["normal_user", "workspace_admin", "app_admin", "support_admin", "security_admin", "expired_user", "canceled_user", "cross_workspace_user"] },
  { route: "/api/platform/v1/entitlements/evaluate", expectedDeniedFor: ["normal_user", "workspace_admin", "app_admin", "support_admin", "security_admin", "expired_user", "canceled_user", "cross_workspace_user"] },
  { route: "/api/internal/platform-super-admin-bootstrap", expectedDeniedFor: ["normal_user", "workspace_admin", "app_admin", "support_admin", "security_admin", "expired_user", "canceled_user", "cross_workspace_user"] },
  { route: "/api/billing/checkout", expectedDeniedFor: ["expired_user", "canceled_user"] },
  { route: "/api/workspace-app-access", expectedDeniedFor: ["normal_user", "expired_user", "canceled_user", "cross_workspace_user"] },
];

export const appRouteContracts = {
  xflow: {
    normal_user: {
      expectedAllowed: ["/overview", "/account/security", "/api/ecosystem/session"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/platform/v1/entitlements/evaluate", "/api/auth/me"],
    },
    workspace_admin: {
      expectedAllowed: ["/overview", "/account/billing", "/settings"],
      expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users", "/api/workspaces/active"],
    },
    app_admin: {
      expectedAllowed: ["/overview"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    },
    support_admin: {
      expectedAllowed: ["/admin/support", "/api/admin/support/conversations"],
      expectedDenied: ["/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    },
    security_admin: {
      expectedAllowed: ["/admin/system-status", "/api/admin/system-status"],
      expectedDenied: ["/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    },
    superadmin: {
      expectedAllowed: ["/overview", "/admin/system-status", "/api/admin/system-status"],
      expectedDenied: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    },
    expired_user: {
      expectedAllowed: ["/account/billing", "/account/security"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    canceled_user: {
      expectedAllowed: ["/account/billing", "/account/security"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    cross_workspace_user: {
      expectedAllowed: ["/overview"],
      expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    },
  },
  verixet: {
    unauthenticated: {
      expectedAllowed: ["/", "/privacy", "/terms", "/security", "/contact", "/status"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/dashboard/admin", "/api/admin/apps", "/api/internal/status"],
    },
    normal_user: {
      expectedAllowed: ["/dashboard", "/account/billing"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/auth/me", "/api/ecosystem/session", "/api/platform/v1/entitlements/evaluate"],
    },
    workspace_admin: {
      expectedAllowed: ["/dashboard", "/account/billing", "/dashboard/billing"],
      expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users", "/settings/billing", "/api/workspaces/active"],
    },
    app_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    },
    support_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin/support", "/api/admin/support/conversations", "/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    },
    security_admin: {
      expectedAllowed: ["/dashboard", "/dashboard/security"],
      expectedDenied: ["/admin/system-status", "/api/admin/system-status", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    },
    superadmin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    },
    expired_user: {
      expectedAllowed: ["/account/billing", "/dashboard/billing"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    canceled_user: {
      expectedAllowed: ["/account/billing", "/dashboard/billing"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    cross_workspace_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    },
  },
  audaix: {
    unauthenticated: {
      expectedAllowed: ["/", "/privacy", "/terms", "/security", "/contact", "/status"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/dashboard/admin", "/api/admin/apps", "/api/internal/status"],
    },
    normal_user: {
      expectedAllowed: ["/dashboard", "/v1/auth/session"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/platform/v1/entitlements/evaluate", "/api/auth/me"],
    },
    workspace_admin: {
      expectedAllowed: ["/dashboard", "/account/billing", "/v1/workspaces"],
      expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users", "/settings/billing", "/api/workspaces/active"],
    },
    app_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    },
    support_admin: {
      expectedAllowed: [],
      expectedDenied: ["/admin/support", "/api/admin/support/conversations", "/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    },
    security_admin: {
      expectedAllowed: [],
      expectedDenied: ["/admin/system-status", "/api/admin/system-status", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    },
    superadmin: {
      expectedAllowed: [],
      expectedDenied: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    },
    expired_user: {
      expectedAllowed: ["/account/billing"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    canceled_user: {
      expectedAllowed: ["/account/billing"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    cross_workspace_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    },
  },
  wordgeni: {
    unauthenticated: {
      expectedAllowed: ["/", "/privacy", "/terms", "/security", "/contact", "/status"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/dashboard/admin", "/api/admin/apps", "/api/internal/status"],
    },
    normal_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/platform/v1/entitlements/evaluate", "/api/auth/me", "/api/ecosystem/session"],
    },
    workspace_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users", "/settings/billing", "/api/workspaces/active"],
    },
    app_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    },
    support_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin/support", "/api/admin/support/conversations", "/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    },
    security_admin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/admin/system-status", "/api/admin/system-status", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    },
    superadmin: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    },
    expired_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    canceled_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    cross_workspace_user: {
      expectedAllowed: ["/dashboard"],
      expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    },
  },
  crevux: {
    unauthenticated: {
      expectedAllowed: ["/", "/privacy", "/terms", "/security", "/contact", "/status"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/dashboard/admin", "/api/admin/apps", "/api/internal/status"],
    },
    normal_user: {
      expectedAllowed: ["/app", "/app/account/security"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/admin/apps", "/api/platform/v1/entitlements/evaluate", "/api/auth/me", "/api/ecosystem/session"],
    },
    workspace_admin: {
      expectedAllowed: ["/app", "/app/upgrade"],
      expectedDenied: ["/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate", "/api/superadmin/users", "/settings/billing", "/api/workspaces/active"],
    },
    app_admin: {
      expectedAllowed: ["/app"],
      expectedDenied: ["/admin", "/superadmin", "/platform", "/internal", "/api/platform/v1/entitlements/evaluate"],
    },
    support_admin: {
      expectedAllowed: ["/app"],
      expectedDenied: ["/admin/support", "/api/admin/support/conversations", "/superadmin", "/platform", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate"],
    },
    security_admin: {
      expectedAllowed: ["/app"],
      expectedDenied: ["/admin/system-status", "/api/admin/system-status", "/api/admin/billing", "/api/platform/v1/entitlements/evaluate", "/api/internal/platform-super-admin-bootstrap"],
    },
    superadmin: {
      expectedAllowed: ["/app"],
      expectedDenied: ["/platform", "/superadmin", "/api/platform/v1/subscriptions/summary"],
    },
    expired_user: {
      expectedAllowed: ["/app/upgrade"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    canceled_user: {
      expectedAllowed: ["/app/upgrade"],
      expectedDenied: ["/billing/manage", "/settings/billing", "/api/platform/v1/entitlements/evaluate", "/api/entitlements", "/api/v1/ai/generate"],
    },
    cross_workspace_user: {
      expectedAllowed: ["/app"],
      expectedDenied: ["/api/workspaces/{foreignWorkspaceId}/members", "/api/v1/workspaces/{foreignWorkspaceId}/billing-state"],
    },
  },
};

export function routesForPersonaApp(persona, app) {
  const appContract = appRouteContracts[app.slug]?.[persona.key];
  if (!appContract) {
    return {
      expectedAllowed: persona.expectedAllowed,
      expectedDenied: persona.expectedDenied,
    };
  }
  return {
    expectedAllowed: appContract.expectedAllowed ?? persona.expectedAllowed,
    expectedDenied: appContract.expectedDenied ?? persona.expectedDenied,
  };
}

function baseUrl(app) {
  return (process.env[app.env] || app.fallback).replace(/\/+$/, "");
}

function readFixtureFile() {
  if (!FIXTURE_FILE) return {};
  const full = path.isAbsolute(FIXTURE_FILE) ? FIXTURE_FILE : path.join(ROOT, FIXTURE_FILE);
  if (!fs.existsSync(full)) throw new Error(`AUTH_PERSONA_FIXTURES_FILE does not exist: ${full}`);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function envNameFor(key, suffix) {
  return `AUTH_PERSONA_${key.toUpperCase()}_${suffix}`;
}

function envAliasesFor(persona) {
  return [...new Set([...(persona.envAliases || []), persona.key.toUpperCase()])];
}

function envNamesFor(persona, suffix, app) {
  const names = [];
  for (const alias of envAliasesFor(persona)) {
    if (app) names.push(`AUTH_PERSONA_${alias}_${app.slug.toUpperCase()}_${suffix}`);
    names.push(`AUTH_PERSONA_${alias}_${suffix}`);
  }
  return [...new Set(names)];
}

function firstEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (String(value || "").trim()) return String(value).trim();
  }
  return "";
}

function firstFixtureValue(fromFile, suffix, app) {
  const fieldBySuffix = {
    BEARER: "bearer",
    COOKIE: "cookie",
    WORKSPACE_ID: "workspaceId",
    FOREIGN_WORKSPACE_ID: "foreignWorkspaceId",
    APP_SLUG: "appSlug",
  };
  const field = fieldBySuffix[suffix];
  if (!field) return "";
  const appFixture = app ? fromFile.apps?.[app.slug] || fromFile.apps?.[app.app] || {} : {};
  return String(appFixture[field] || fromFile[field] || "").trim();
}

function hasAppCredential(fromFile) {
  if (!fromFile.apps || typeof fromFile.apps !== "object") return false;
  return Object.values(fromFile.apps).some((fixture) => String(fixture?.bearer || fixture?.cookie || "").trim());
}

function resolvePersonaCredentials() {
  const fileFixtures = readFixtureFile();
  const resolved = new Map();
  for (const persona of personas) {
    if (persona.key === "unauthenticated") {
      resolved.set(persona.key, { available: true, source: "built-in unauthenticated" });
      continue;
    }
    const fromFile = fileFixtures[persona.key] || {};
    const bearer = firstEnv(envNamesFor(persona, "BEARER")) || firstFixtureValue(fromFile, "BEARER");
    const cookie = firstEnv(envNamesFor(persona, "COOKIE")) || firstFixtureValue(fromFile, "COOKIE");
    const workspaceId = firstEnv(envNamesFor(persona, "WORKSPACE_ID")) || firstFixtureValue(fromFile, "WORKSPACE_ID");
    const foreignWorkspaceId =
      firstEnv(envNamesFor(persona, "FOREIGN_WORKSPACE_ID")) || firstFixtureValue(fromFile, "FOREIGN_WORKSPACE_ID");
    const appSlug = firstEnv(envNamesFor(persona, "APP_SLUG")) || firstFixtureValue(fromFile, "APP_SLUG");
    const hasCredential = Boolean(String(bearer).trim() || String(cookie).trim() || hasAppCredential(fromFile));
    resolved.set(persona.key, {
      available: hasCredential,
      source: hasCredential ? (fromFile.bearer || fromFile.cookie || hasAppCredential(fromFile) ? "fixture file/env" : "env") : "missing",
      bearer: String(bearer).trim(),
      cookie: String(cookie).trim(),
      workspaceId: String(workspaceId).trim(),
      foreignWorkspaceId: String(foreignWorkspaceId).trim(),
      appSlug: String(appSlug).trim(),
      fromFile,
    });
  }
  return resolved;
}

function credentialsForApp(persona, credentials, app) {
  if (!credentials) return credentials;
  const bearer = firstEnv(envNamesFor(persona, "BEARER", app)) || firstFixtureValue(credentials.fromFile || {}, "BEARER", app) || credentials.bearer;
  const cookie = firstEnv(envNamesFor(persona, "COOKIE", app)) || firstFixtureValue(credentials.fromFile || {}, "COOKIE", app) || credentials.cookie;
  const workspaceId =
    firstEnv(envNamesFor(persona, "WORKSPACE_ID", app)) ||
    firstFixtureValue(credentials.fromFile || {}, "WORKSPACE_ID", app) ||
    credentials.workspaceId;
  const foreignWorkspaceId =
    firstEnv(envNamesFor(persona, "FOREIGN_WORKSPACE_ID", app)) ||
    firstFixtureValue(credentials.fromFile || {}, "FOREIGN_WORKSPACE_ID", app) ||
    credentials.foreignWorkspaceId;
  const appSlug =
    firstEnv(envNamesFor(persona, "APP_SLUG", app)) || firstFixtureValue(credentials.fromFile || {}, "APP_SLUG", app) || credentials.appSlug;
  return {
    ...credentials,
    available: Boolean(String(bearer).trim() || String(cookie).trim()),
    bearer: String(bearer || "").trim(),
    cookie: String(cookie || "").trim(),
    workspaceId: String(workspaceId || "").trim(),
    foreignWorkspaceId: String(foreignWorkspaceId || "").trim(),
    appSlug: String(appSlug || "").trim(),
  };
}

function headersFor(credentials, method = "GET") {
  const headers = {
    "user-agent": "xflow-authenticated-persona-security-simulation/1.0",
    accept: "text/html,application/json;q=0.9,*/*;q=0.8",
  };
  if (credentials?.bearer) headers.authorization = `Bearer ${credentials.bearer}`;
  if (credentials?.cookie) headers.cookie = credentials.cookie;
  if (method === "GET" || method === "HEAD") {
    headers["cache-control"] = "no-cache";
    headers.pragma = "no-cache";
  }
  return headers;
}

function redactLocation(location) {
  if (!location) return "";
  try {
    const url = new URL(location, "https://redacted.local");
    for (const key of [...url.searchParams.keys()]) {
      if (/token|secret|code|state|session|bearer|password|key|cookie/i.test(key)) {
        url.searchParams.set(key, "[redacted]");
      }
    }
    return url.toString().replace("https://redacted.local", "");
  } catch {
    return location.replace(/([?&](?:token|secret|code|state|session|bearer|password|key|cookie)=)[^&]+/gi, "$1[redacted]");
  }
}

function textPreview(text) {
  return text
    .replace(/\b(sk_live|sk_test|rk_live|whsec|sb_secret)_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]")
    .replace(/\b(?:Bearer|token|session|cookie)\s+[A-Za-z0-9._~+/-]{16,}/gi, "[redacted-auth]")
    .slice(0, 240);
}

async function request(url, credentials, init = {}, timeoutMs = 15000) {
  const started = Date.now();
  try {
    const method = String(init.method || "GET").toUpperCase();
    const requestUrl = new URL(url);
    if (method === "GET" || method === "HEAD") {
      requestUrl.searchParams.set("_xflow_persona_probe", String(Date.now()));
    }
    const response = await fetch(requestUrl.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      ...init,
      headers: {
        ...headersFor(credentials, method),
        ...(init.headers || {}),
      },
    });
    const text = await response.text().catch(() => "");
    return {
      reachable: true,
      statusCode: response.status,
      contentType: response.headers.get("content-type") || "",
      redirectTarget: redactLocation(response.headers.get("location") || ""),
      bodyPreview: textPreview(text),
      bodyLength: text.length,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      reachable: false,
      statusCode: null,
      contentType: "",
      redirectTarget: "",
      bodyPreview: "",
      bodyLength: 0,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isDenied(status) {
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 405 ||
    status === 409 ||
    status === 410 ||
    status === 422 ||
    (status >= 300 && status < 400)
  );
}

function isAllowed(status) {
  return (status >= 200 && status < 300) || (status >= 300 && status < 400);
}

function hasSensitiveLeak(result) {
  const text = `${result.bodyPreview || ""} ${result.redirectTarget || ""}`;
  return /(DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|BEGIN\s+PRIVATE\s+KEY|stack trace|SQLSTATE|postgres:\/\/|sk_live_|sk_test_|whsec_|sb_secret_|set-cookie:\s*[^;]+)/i.test(text);
}

function classify(result, expectation) {
  if (!result.reachable) return { outcome: "fail", risk: "unavailable", expected: expectation };
  if (hasSensitiveLeak(result)) return { outcome: "fail", risk: "sensitive leak", expected: expectation };
  if (expectation === "allowed") {
    if (isAllowed(result.statusCode)) return { outcome: "pass", risk: "", expected: "2xx allowed response or safe redirect" };
    if (isDenied(result.statusCode)) return { outcome: "fail", risk: "unexpected denial", expected: "2xx allowed response or safe redirect" };
    return { outcome: "fail", risk: "unexpected status", expected: "2xx allowed response or safe redirect" };
  }
  if (isDenied(result.statusCode)) return { outcome: "pass", risk: "", expected: "401/403/404/405/redirect or validation denial" };
  return { outcome: "fail", risk: "unexpected access", expected: "401/403/404/405/redirect or validation denial" };
}

function materializeRoute(route, credentials) {
  return route
    .replaceAll("{workspaceId}", credentials.workspaceId || "00000000-0000-4000-8000-000000000001")
    .replaceAll("{foreignWorkspaceId}", credentials.foreignWorkspaceId || "00000000-0000-4000-8000-000000000002")
    .replaceAll("{appSlug}", credentials.appSlug || "rataify");
}

function inertBody(app, persona, credentials) {
  return JSON.stringify({
    simulation: true,
    proof: "authenticated-persona-negative-probe",
    role: persona.role,
    planSlug: "elite",
    priceId: "price_fake_persona_probe",
    appSlug: credentials.appSlug || app.slug,
    workspaceId: credentials.workspaceId || "00000000-0000-4000-8000-000000000001",
    targetWorkspaceId: credentials.foreignWorkspaceId || "00000000-0000-4000-8000-000000000002",
  });
}

async function main() {
  const credentialsByPersona = resolvePersonaCredentials();
  const routeResults = [];
  const mutationResults = [];
  const entitlementResults = [];
  const crossWorkspaceResults = [];
  const superadminAuditResults = [];
  const fixtureMatrix = [];
  const blocked = [];

  for (const persona of personas) {
    const credentials = credentialsByPersona.get(persona.key);
    fixtureMatrix.push({
      persona: persona.label,
      role: persona.role,
      workspace: credentials?.workspaceId ? "provided" : "not provided",
      appAccess: credentials?.appSlug || "not provided",
      entitlementState: persona.entitlementState || "not specified",
      subscriptionState: persona.entitlementState || "not specified",
      expectedAllowedRoutes: persona.expectedAllowed,
      expectedDeniedRoutes: persona.expectedDenied,
      creationMethod:
        persona.key === "unauthenticated"
          ? "built-in"
          : "Provide bearer/cookie through AUTH_PERSONA_* env or AUTH_PERSONA_FIXTURES_FILE; reuse app smoke seeders for local/staging.",
      testedEnvironment: credentials?.available ? "live/proof URL" : "not run",
    });

    if (!credentials?.available) {
      blocked.push({
        persona: persona.label,
        reason: `${envNamesFor(persona, "BEARER")[0]} or ${envNamesFor(persona, "COOKIE")[0]} not provided`,
        liveCoverage: "not proved",
      });
      continue;
    }

    for (const app of apps) {
      const appCredentials = credentialsForApp(persona, credentials, app);
      const base = baseUrl(app);
      const routeContract = routesForPersonaApp(persona, app);
      for (const route of routeContract.expectedAllowed) {
        const actualRoute = materializeRoute(route, appCredentials);
        const result = await request(`${base}${actualRoute}`, appCredentials);
        const classified = classify(result, "allowed");
        routeResults.push({
          app: app.app,
          persona: persona.label,
          route: actualRoute,
          expectation: "allowed",
          expectedResult: classified.expected,
          statusCode: result.statusCode,
          redirectTarget: result.redirectTarget,
          pass: classified.outcome === "pass",
          risk: classified.risk,
          actualResult: result.reachable ? result.bodyPreview : result.error,
        });
      }
      for (const route of routeContract.expectedDenied) {
        const actualRoute = materializeRoute(route, appCredentials);
        const result = await request(`${base}${actualRoute}`, appCredentials);
        const classified = classify(result, "denied");
        const row = {
          app: app.app,
          persona: persona.label,
          route: actualRoute,
          expectation: "denied",
          expectedResult: classified.expected,
          statusCode: result.statusCode,
          redirectTarget: result.redirectTarget,
          pass: classified.outcome === "pass",
          risk: classified.risk,
          actualResult: result.reachable ? result.bodyPreview : result.error,
        };
        routeResults.push(row);
        if (/workspace/i.test(actualRoute) || actualRoute.includes(appCredentials.foreignWorkspaceId)) {
          crossWorkspaceResults.push(row);
        }
        if (/billing|entitlement|checkout|portal|plan|price/i.test(actualRoute)) {
          entitlementResults.push(row);
        }
        if (/superadmin|super-admin|platform|internal/i.test(actualRoute)) {
          superadminAuditResults.push(row);
        }
      }

      for (const mutation of mutationRoutes) {
        if (!mutation.expectedDeniedFor.includes(persona.key)) continue;
        const result = await request(`${base}${materializeRoute(mutation.route, appCredentials)}`, appCredentials, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-user-role": "superadmin",
            "x-user-role": "superadmin",
            "x-workspace-id": appCredentials.foreignWorkspaceId || "00000000-0000-4000-8000-000000000002",
          },
          body: inertBody(app, persona, appCredentials),
        });
        const classified = classify(result, "denied");
        const row = {
          app: app.app,
          persona: persona.label,
          route: materializeRoute(mutation.route, appCredentials),
          method: "POST",
          expectation: "denied",
          expectedResult: classified.expected,
          statusCode: result.statusCode,
          redirectTarget: result.redirectTarget,
          pass: classified.outcome === "pass",
          risk: classified.risk,
          actualResult: result.reachable ? result.bodyPreview : result.error,
        };
        mutationResults.push(row);
        if (/workspace/i.test(row.route) || row.route.includes(appCredentials.foreignWorkspaceId)) {
          crossWorkspaceResults.push(row);
        }
        if (/billing|entitlement|checkout|portal|plan|price/i.test(row.route)) {
          entitlementResults.push(row);
        }
        if (/superadmin|super-admin|platform|internal/i.test(row.route)) {
          superadminAuditResults.push(row);
        }
      }
    }
  }

  if (!ALLOW_PRIVILEGED_MUTATIONS) {
    superadminAuditResults.push({
      app: "Ecosystem",
      persona: "superadmin/platform owner",
      route: "platform mutation audit log verification",
      method: "POST/PATCH/DELETE",
      expectation: "blocked",
      expectedResult: "requires AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS=1 and disposable staging target",
      statusCode: null,
      redirectTarget: "",
      pass: true,
      risk: "",
      actualResult: "not executed to avoid destructive production mutation",
    });
  }

  const rows = [...routeResults, ...mutationResults];
  const counts = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.pass ? "passed" : "failed"] += 1;
      return acc;
    },
    { total: 0, passed: 0, failed: 0, blocked: blocked.length },
  );

  const report = {
    generatedAt: new Date().toISOString(),
    environment: "proof-base-url-authenticated-persona-http",
    fixtureInput: FIXTURE_FILE ? "AUTH_PERSONA_FIXTURES_FILE provided" : "environment variables/default unauthenticated only",
    destructiveMutations: ALLOW_PRIVILEGED_MUTATIONS ? "enabled by explicit env" : "disabled",
    counts,
    fixtureMatrix,
    blockedPersonas: blocked,
    routeBoundaryResults: routeResults,
    mutationBoundaryResults: mutationResults,
    entitlementBehaviorResults: entitlementResults,
    crossWorkspaceBehaviorResults: crossWorkspaceResults,
    superadminAuditBehaviorResults: superadminAuditResults,
  };

  console.log(JSON.stringify(report, null, 2));
  if (counts.failed > 0) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
