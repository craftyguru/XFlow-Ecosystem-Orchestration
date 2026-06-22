#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

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

for (const file of [".env.shared.local", ".env.phase6d.local", ".env.proof.local"]) loadEnvFile(file);

const apps = [
  { app: "XFlow", slug: "xflow", env: "XFLOW_PROOF_BASE_URL", fallback: "https://xflowx.com" },
  { app: "Verixet", slug: "verixet", env: "VERIXET_PROOF_BASE_URL", fallback: "https://verixet.com" },
  { app: "RatAiFy", slug: "rataify", env: "RATAIFY_PROOF_BASE_URL", fallback: "https://rataify.com" },
  { app: "AudAiX", slug: "audaix", env: "AUDAIX_PROOF_BASE_URL", fallback: "https://audaix.com" },
  { app: "WordGeni", slug: "wordgeni", env: "WORDGENI_PROOF_BASE_URL", fallback: "https://wordgeni.com" },
  { app: "CreVux", slug: "crevux", env: "CREVUX_PROOF_BASE_URL", fallback: "https://crevux.com" },
];

const sensitiveGetRoutes = [
  "/admin",
  "/superadmin",
  "/super-admin",
  "/platform",
  "/internal",
  "/dashboard/admin",
  "/api/admin/apps",
  "/api/admin/billing",
  "/api/admin/support/conversations",
  "/api/admin/assistant/conversations",
  "/api/admin/assistant/analytics",
  "/api/internal/status",
  "/api/platform/v1/entitlements/evaluate",
  "/api/superadmin/users",
  "/api/super-admin/apps",
  "/api/entitlements",
  "/api/workspace-app-access",
  "/billing/manage",
  "/settings/billing",
  "/api/billing/checkout",
  "/api/billing/portal",
  "/api/debug/env",
  "/api/diagnostics",
  "/api/proof",
  "/debug",
  "/diagnostics",
  "/proof",
];

const mutationRoutes = [
  "/api/admin/apps",
  "/api/admin/billing",
  "/api/admin/support/conversations/probe/reply",
  "/api/admin/assistant/conversations",
  "/api/internal/platform-super-admin-bootstrap",
  "/api/platform/v1/entitlements/evaluate",
  "/api/workspace-app-access",
  "/api/billing/checkout",
  "/api/billing/portal",
  "/api/auth/consent/accept",
  "/api/webhooks/stripe",
  "/api/webhooks/stripe/ecosystem",
];

const trustRoutes = ["/", "/privacy", "/terms", "/security", "/contact", "/status"];

function baseUrl(app) {
  return (process.env[app.env] || app.fallback).replace(/\/+$/, "");
}

function redactLocation(location) {
  if (!location) return "";
  try {
    const url = new URL(location, "https://redacted.local");
    for (const key of [...url.searchParams.keys()]) {
      if (/token|secret|code|state|session|bearer|password|key/i.test(key)) url.searchParams.set(key, "[redacted]");
    }
    return url.toString().replace("https://redacted.local", "");
  } catch {
    return location.replace(/([?&](?:token|secret|code|state|session|bearer|password|key)=)[^&]+/gi, "$1[redacted]");
  }
}

function textPreview(text) {
  return text
    .replace(/\b(sk_live|sk_test|rk_live|whsec|sb_secret)_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]")
    .slice(0, 240);
}

async function request(url, init = {}, timeoutMs = 15000) {
  const started = Date.now();
  try {
    const method = String(init.method || "GET").toUpperCase();
    const requestUrl = new URL(url);
    if (method === "GET" || method === "HEAD") {
      requestUrl.searchParams.set("_xflow_attack_probe", String(Date.now()));
    }
    const response = await fetch(requestUrl.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      ...init,
      headers: {
        "user-agent": "xflow-live-attack-simulation/1.0",
        accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        ...(method === "GET" || method === "HEAD"
          ? {
              "cache-control": "no-cache",
              pragma: "no-cache",
            }
          : {}),
        ...(init.headers || {}),
      },
    });
    const contentType = response.headers.get("content-type") || "";
    const location = redactLocation(response.headers.get("location") || "");
    const text = await response.text().catch(() => "");
    return {
      reachable: true,
      statusCode: response.status,
      contentType,
      redirectTarget: location,
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

function hasSensitiveLeak(result) {
  const text = `${result.bodyPreview || ""} ${result.redirectTarget || ""}`;
  return /(DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|BEGIN\s+PRIVATE\s+KEY|stack trace|SQLSTATE|postgres:\/\/|sk_live_|sk_test_|whsec_|sb_secret_)/i.test(text);
}

function classifySensitive(result) {
  if (!result.reachable) return { pass: false, risk: "unavailable", expected: "reachable denial or safe redirect" };
  if (hasSensitiveLeak(result)) return { pass: false, risk: "sensitive leak", expected: "no secret/internal error disclosure" };
  if (isDenied(result.statusCode)) return { pass: true, risk: "", expected: "401/403/404/405/redirect or validation denial" };
  return { pass: false, risk: "sensitive route returned non-denial", expected: "401/403/404/405/redirect or validation denial" };
}

function classifyTrust(result, route) {
  if (!result.reachable) return { pass: false, expected: "reachable public trust surface", notes: "request failed" };
  if (route !== "/" && result.statusCode === 404) return { pass: true, expected: "route exists or cleanly 404s if unsupported", notes: "not available" };
  if (result.statusCode >= 200 && result.statusCode < 400) return { pass: true, expected: "public route reachable without secret disclosure", notes: hasSensitiveLeak(result) ? "sensitive-looking text found" : "" };
  return { pass: false, expected: "public route reachable", notes: `unexpected status ${result.statusCode}` };
}

function mutationBody(app) {
  return JSON.stringify({
    simulation: true,
    proof: "live-direct-access-negative-probe",
    role: "superadmin",
    planSlug: "elite",
    priceId: "price_fake_attack_probe",
    appSlug: app.slug,
    workspaceId: "00000000-0000-4000-8000-000000000001",
    targetWorkspaceId: "00000000-0000-4000-8000-000000000002",
  });
}

async function main() {
  const directAccess = [];
  const apiMutations = [];
  const billingAbuse = [];
  const crossWorkspace = [];
  const debugProof = [];
  const superadmin = [];
  const trustUx = [];

  for (const app of apps) {
    const base = baseUrl(app);

    for (const route of sensitiveGetRoutes) {
      const result = await request(`${base}${route}`);
      const classified = classifySensitive(result);
      const row = {
        app: app.app,
        route,
        persona: "unauthenticated visitor",
        expectedResult: classified.expected,
        actualResult: result.reachable ? result.bodyPreview : result.error,
        statusCode: result.statusCode,
        redirectTarget: result.redirectTarget,
        pass: classified.pass,
        risk: classified.risk,
      };
      directAccess.push(row);
      if (/debug|diagnostic|proof|internal/i.test(route)) debugProof.push(row);
      if (/superadmin|super-admin|platform|internal/i.test(route)) superadmin.push(row);
    }

    for (const route of mutationRoutes) {
      const result = await request(`${base}${route}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-user-role": "superadmin",
          "x-user-role": "superadmin",
          "x-workspace-id": "00000000-0000-4000-8000-000000000002",
        },
        body: mutationBody(app),
      });
      const classified = classifySensitive(result);
      const row = {
        app: app.app,
        route,
        persona: "unauthenticated visitor with forged client role/plan/workspace claims",
        method: "POST",
        expectedResult: classified.expected,
        actualResult: result.reachable ? result.bodyPreview : result.error,
        statusCode: result.statusCode,
        redirectTarget: result.redirectTarget,
        pass: classified.pass,
        risk: classified.risk,
      };
      apiMutations.push(row);
      if (/billing|entitlement|webhook|workspace-app-access/i.test(route)) billingAbuse.push(row);
      if (/workspace|entitlement|admin|support|assistant/i.test(route)) crossWorkspace.push(row);
      if (/super-admin|platform|internal/i.test(route)) superadmin.push(row);
    }

    for (const route of trustRoutes) {
      const result = await request(`${base}${route}`);
      const classified = classifyTrust(result, route);
      trustUx.push({
        app: app.app,
        route,
        persona: "public visitor",
        expectedResult: classified.expected,
        statusCode: result.statusCode,
        redirectTarget: result.redirectTarget,
        pass: classified.pass && !hasSensitiveLeak(result),
        notes: classified.notes,
      });
    }
  }

  const all = [...directAccess, ...apiMutations, ...trustUx];
  const counts = all.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.pass ? "passed" : "failed"] += 1;
      return acc;
    },
    { total: 0, passed: 0, failed: 0 },
  );

  const report = {
    generatedAt: new Date().toISOString(),
    environment: "proof-base-url-live-http",
    personasTested: [
      "unauthenticated visitor",
      "unauthenticated visitor with forged client role/plan/workspace claims",
      "public visitor",
    ],
    personasUnavailable: [
      "normal authenticated user",
      "workspace admin",
      "app admin",
      "expired/past_due subscription user",
      "cross-workspace authenticated user",
      "superadmin/platform owner",
    ],
    counts,
    directAccess,
    apiMutations,
    billingAbuse,
    crossWorkspace,
    debugProof,
    superadmin,
    trustUx,
  };

  console.log(JSON.stringify(report, null, 2));
  if (counts.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
