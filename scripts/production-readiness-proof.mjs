#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
function loadEnvFile(envPath) {
  const source = fs.readFileSync(envPath, "utf8");
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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
for (const envFile of [".env.shared.local", ".env.phase6d.local", ".env.proof.local"]) {
  const envPath = path.join(ROOT, envFile);
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

const DEFAULT_APPS = [
  { slug: "xflow", name: "XFlow", baseEnv: "XFLOW_PROOF_BASE_URL", baseUrl: "https://xflowx.com" },
  { slug: "verixet", name: "Verixet", baseEnv: "VERIXET_PROOF_BASE_URL", baseUrl: "https://verixet.com" },
  { slug: "rataify", name: "Rataify", baseEnv: "RATAIFY_PROOF_BASE_URL", baseUrl: "https://rataify.com" },
  { slug: "audaix", name: "AudAiX", baseEnv: "AUDAIX_PROOF_BASE_URL", baseUrl: "https://audaix.com" },
  { slug: "wordgeni", name: "WordGeni", baseEnv: "WORDGENI_PROOF_BASE_URL", baseUrl: "https://wordgeni.com" },
  { slug: "crevux", name: "Crevux", baseEnv: "CREVUX_PROOF_BASE_URL", baseUrl: "https://crevux.com" },
];

const REQUIRED_PROOF_ENV = [
  "XFLOW_PROOF_BASE_URL",
  "VERIXET_PROOF_BASE_URL",
  "RATAIFY_PROOF_BASE_URL",
  "AUDAIX_PROOF_BASE_URL",
  "WORDGENI_PROOF_BASE_URL",
  "CREVUX_PROOF_BASE_URL",
  "ECOSYSTEM_AUTH_STATE_SECRET",
  "XFLOW_PROOF_EVENT_BEARER",
  "XFLOW_PROOF_SAFE_WRITES",
  "VERIXET_PROOF_MODE",
  "VERIXET_PROOF_BEARER",
  "VERIXET_PROOF_WORKSPACE_ID",
  "VERIXET_PROOF_USER_ID",
];

const SECRET_NAME_PATTERNS = [
  /\bSUPABASE_SERVICE_ROLE_KEY\b/g,
  /\bSTRIPE_SECRET_KEY\b/g,
  /\bSTRIPE_WEBHOOK_SECRET\b/g,
  /\bOAUTH_CLIENT_SECRET\b/g,
  /\bAUTH_OIDC_CLIENT_SECRET\b/g,
  /\bCONTROL_PLANE_SERVICE_TOKEN\b/g,
  /\bEVENT_INGEST_BEARER\b/g,
  /\bXFLOW_PROOF_EVENT_BEARER\b/g,
  /\bVERIXET_[A-Z0-9_]*(?:SECRET|TOKEN|BEARER)\b/g,
];

const SECRET_VALUE_PATTERNS = [
  /\bsk_live_[A-Za-z0-9_]{16,}\b/g,
  /\brk_live_[A-Za-z0-9_]{16,}\b/g,
  /\bwhsec_[A-Za-z0-9_]{16,}\b/g,
  /\bsb_secret_[A-Za-z0-9_-]{16,}\b/g,
];

function envValue(name) {
  return (process.env[name] ?? "").trim();
}

function hasProofAuth() {
  return Boolean(envValue("XFLOW_PROOF_SESSION_COOKIE")) || Boolean(envValue("XFLOW_PROOF_EMAIL") && envValue("XFLOW_PROOF_PASSWORD"));
}

function normalizeBaseUrl(app) {
  return (envValue(app.baseEnv) || app.baseUrl).replace(/\/+$/, "");
}

function statusFor(ok, fallback = "FAIL") {
  return ok ? "PASS" : fallback;
}

function add(results, status, area, route, detail, meta = {}) {
  results.push({ status, area, route, detail, ...meta });
}

async function request(url, init = {}, timeoutMs = 30000) {
  const started = Date.now();
  try {
    const mergedHeaders = {
      "user-agent": "xflow-ecosystem-production-readiness-proof/1.0",
      accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      ...(init.headers ?? {}),
    };
    const response = await fetch(url, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: mergedHeaders,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const location = response.headers.get("location") ?? "";
    const text = await response.text().catch(() => "");
    return {
      ok: true,
      status: response.status,
      contentType,
      location,
      text,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      contentType: "",
      location: "",
      text: "",
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function setCookieValues(headers) {
  const getSetCookie = headers.getSetCookie;
  if (typeof getSetCookie === "function") {
    try {
      return getSetCookie.call(headers);
    } catch {}
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

function appendSetCookieToJar(headers, jar) {
  for (const header of setCookieValues(headers)) {
    for (const part of header.split(/,(?=\s*[^;,=\s]+=[^;,]+)/)) {
      const pair = part.split(";", 1)[0]?.trim();
      if (!pair || !pair.includes("=")) continue;
      const [name, ...rest] = pair.split("=");
      if (!name) continue;
      jar.set(name, rest.join("="));
    }
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function fetchWithJar(url, jar, init = {}, timeoutMs = 30000) {
  const cookie = cookieHeader(jar);
  const mergedHeaders = {
    ...(cookie ? { Cookie: cookie } : {}),
    ...(init.headers ?? {}),
  };
  const response = await fetch(url, {
    ...init,
    redirect: init.redirect ?? "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: mergedHeaders,
  });
  appendSetCookieToJar(response.headers, jar);
  return response;
}

async function verifySessionCookie(origin, cookie) {
  const res = await request(`${origin}/api/auth/sessions`, {
    headers: { cookie },
  });
  return res.ok && res.status === 200;
}

async function resolveProofCookie(results) {
  const configuredCookie = envValue("XFLOW_PROOF_SESSION_COOKIE");
  if (configuredCookie) {
    const ok = await verifySessionCookie(normalizeBaseUrl(DEFAULT_APPS[0]), configuredCookie);
    add(
      results,
      ok ? "PASS" : "FAIL",
      "proof auth",
      `${normalizeBaseUrl(DEFAULT_APPS[0])}/api/auth/sessions`,
      ok ? "configured proof session cookie authenticated" : "configured proof session cookie did not authenticate",
    );
    return ok ? configuredCookie : null;
  }

  const email = envValue("XFLOW_PROOF_EMAIL");
  const password = envValue("XFLOW_PROOF_PASSWORD");
  if (!email || !password) {
    add(
      results,
      "ENV MISSING",
      "proof auth",
      "XFlow proof credentials",
      "set XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL plus XFLOW_PROOF_PASSWORD",
    );
    return null;
  }

  const origin = normalizeBaseUrl(DEFAULT_APPS[0]);
  const jar = new Map();
  const loginIntent = await request(`${origin}/api/auth/login/intent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const csrf = await fetchWithJar(`${origin}/api/auth/csrf`, jar, {
    headers: { accept: "application/json" },
  });
  const csrfBody = await csrf.json().catch(() => null);
  const csrfToken = csrfBody?.csrfToken;
  if (!csrfToken || csrf.status !== 200) {
    add(results, "FAIL", "proof auth", `${origin}/api/auth/csrf`, `csrf bootstrap failed after login intent: ${statusSummary(loginIntent)} / csrf=${csrf.status}`);
    return null;
  }

  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: "false",
    callbackUrl: `${origin}/overview`,
  });
  const callback = await fetchWithJar(`${origin}/api/auth/callback/credentials`, jar, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const cookie = cookieHeader(jar);
  const sessionOk = cookie ? await verifySessionCookie(origin, cookie) : false;
  add(
    results,
    sessionOk ? "PASS" : "FAIL",
    "proof auth",
    `${origin}/api/auth/callback/credentials`,
    sessionOk
      ? "proof credentials established an authenticated session"
      : `proof credential login failed: loginIntent=${loginIntent.status} callback=${callback.status}`,
  );
  return sessionOk ? cookie : null;
}

function statusSummary(res) {
  if (!res.ok) return `request failed: ${res.error}`;
  const redirect = res.location ? ` location=${res.location}` : "";
  return `status=${res.status}${redirect} latencyMs=${res.latencyMs}`;
}

function isPublicReachable(status) {
  return status != null && status >= 200 && status < 400;
}

function isRejected(status) {
  return status === 400 || status === 401 || status === 403 || status === 405;
}

function isNotPubliclyMutable(status) {
  return status === 401 || status === 403 || status === 404 || status === 405;
}

function extractScriptUrls(baseUrl, html) {
  const urls = new Set();
  const regex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(regex)) {
    try {
      urls.add(new URL(match[1], baseUrl).toString());
    } catch {
      // Ignore malformed asset references.
    }
  }
  return [...urls].slice(0, 30);
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function scanTextForSecrets(sourceUrl, text) {
  const findings = [];
  for (const pattern of SECRET_VALUE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      findings.push({ severity: "FAIL", sourceUrl, kind: "secret_value", match: match[0].slice(0, 12) + "..." });
    }
  }
  for (const pattern of SECRET_NAME_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      findings.push({ severity: "RISK", sourceUrl, kind: "secret_name", match: match[0] });
    }
  }
  const jwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
  for (const match of text.matchAll(jwtPattern)) {
    const payload = decodeJwtPayload(match[0]);
    if (payload?.role === "service_role") {
      findings.push({ severity: "FAIL", sourceUrl, kind: "supabase_service_role_jwt", match: "role=service_role" });
    }
  }
  return findings;
}

async function smokePublicRoutes(app, results) {
  const base = normalizeBaseUrl(app);
  const publicPaths = ["/", "/pricing", "/auth/sign-up"];
  for (const path of publicPaths) {
    const res = await request(`${base}${path}`);
    add(
      results,
      statusFor(res.ok && isPublicReachable(res.status)),
      `${app.name} public route`,
      `${base}${path}`,
      statusSummary(res),
      { httpStatus: res.status },
    );
  }

  const healthPaths = ["/api/health", "/api/ready", "/api/v1/health", "/api/v1/ready", "/health", "/ready", "/api/healthz"];
  const healthResults = [];
  for (const path of healthPaths) {
    const res = await request(`${base}${path}`);
    healthResults.push({ path, status: res.status, ok: res.ok && isPublicReachable(res.status) });
  }
  const anyHealth = healthResults.some((item) => item.ok);
  add(
    results,
    anyHealth ? "PASS" : "FAIL",
    `${app.name} health/ready route`,
    base,
    anyHealth
      ? healthResults.filter((item) => item.ok).map((item) => `${item.path}=${item.status}`).join(", ")
      : healthResults.map((item) => `${item.path}=${item.status ?? "error"}`).join(", "),
  );
}

async function proveXflowAuth(results) {
  const xflow = normalizeBaseUrl(DEFAULT_APPS[0]);
  const invalidUserinfo = await request(`${xflow}/oauth/userinfo`, {
    headers: { authorization: "Bearer invalid-production-readiness-proof-token" },
  });
  add(
    results,
    isRejected(invalidUserinfo.status) ? "PASS" : "FAIL",
    "XFlow OAuth",
    `${xflow}/oauth/userinfo`,
    `invalid bearer rejected proof: ${statusSummary(invalidUserinfo)}`,
    { httpStatus: invalidUserinfo.status },
  );

  const token = await request(`${xflow}/api/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: "invalid-production-readiness-code",
      client_id: "invalid-client",
      client_secret: "invalid-secret",
      redirect_uri: "https://verixet.com/api/xflow/oauth/callback",
    }),
  });
  add(
    results,
    isRejected(token.status) ? "PASS" : "FAIL",
    "XFlow OAuth",
    `${xflow}/api/oauth/token`,
    `invalid token exchange rejected proof: ${statusSummary(token)}`,
    { httpStatus: token.status },
  );

  const badRedirect = encodeURIComponent("https://evil.example/owned");
  const authStart = await request(`${xflow}/auth/start?selectedAppSlug=rataify&app=rataify&returnTo=${badRedirect}&signupMode=signup`, {
    method: "GET",
  });
  const openRedirect = authStart.location.includes("evil.example");
  add(
    results,
    openRedirect ? "FAIL" : "PASS",
    "returnTo validation",
    `${xflow}/auth/start`,
    openRedirect
      ? `invalid returnTo redirected externally: ${statusSummary(authStart)}`
      : `invalid returnTo did not redirect to disallowed origin: ${statusSummary(authStart)}`,
    { httpStatus: authStart.status },
  );

  const validReturnTo = encodeURIComponent("https://rataify.com/dashboard");
  const validStart = await request(
    `${xflow}/auth/start?selectedAppSlug=rataify&app=rataify&returnTo=${validReturnTo}&planSlug=rataify_free&billingInterval=monthly&signupMode=signup`,
  );
  let unsafeInternalRedirect = false;
  try {
    const redirectUrl = new URL(validStart.location);
    unsafeInternalRedirect =
      redirectUrl.hostname === "0.0.0.0" ||
      redirectUrl.hostname === "localhost" ||
      redirectUrl.hostname === "127.0.0.1";
  } catch {
    unsafeInternalRedirect = false;
  }
  const preservesAppIntent =
    validStart.location.includes("rataify") ||
    validStart.text.includes("rataify") ||
    validStart.text.includes("RatAiFy");
  add(
    results,
    unsafeInternalRedirect ? "FAIL" : preservesAppIntent ? "PASS" : "RISK",
    "signup routing proof",
    `${xflow}/auth/start`,
    unsafeInternalRedirect
      ? `selectedAppSlug/returnTo state is signed, but production redirect uses an internal host: ${statusSummary(validStart)}`
      : `selectedAppSlug=rataify/returnTo proof ${statusSummary(validStart)}`,
    { httpStatus: validStart.status },
  );
}

async function proveEventIngest(results) {
  const xflow = normalizeBaseUrl(DEFAULT_APPS[0]);
  const eventRequestId = crypto.randomUUID();
  const payload = {
    event_type: "production_readiness.invalid_bearer_probe",
    app_slug: "verixet",
    request_id: eventRequestId,
    occurred_at: new Date().toISOString(),
    metadata: { proof: "read_only_invalid_bearer" },
  };
  for (const [label, authorization] of [
    ["missing bearer", ""],
    ["wrong bearer", "Bearer invalid-production-readiness-proof-bearer"],
  ]) {
    const headers = { "content-type": "application/json", "x-xflow-app-slug": "verixet" };
    if (authorization) headers.authorization = authorization;
    const res = await request(`${xflow}/api/control-plane/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    add(
      results,
      res.status === 401 || res.status === 403 ? "PASS" : "FAIL",
      "event ingest",
      `${xflow}/api/control-plane/events`,
      `${label} rejection proof: ${statusSummary(res)}`,
      { httpStatus: res.status },
    );
  }

  if (envValue("XFLOW_PROOF_EVENT_BEARER") && envValue("XFLOW_PROOF_SAFE_WRITES") === "true") {
    const res = await request(`${xflow}/api/control-plane/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${envValue("XFLOW_PROOF_EVENT_BEARER")}`,
        "x-xflow-app-slug": "verixet",
      },
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        event_type: "production_readiness.proof_event",
        app_slug: "verixet",
        environment: "live",
        category: "billing",
        severity: "info",
        title: "Production readiness proof event",
        dedupe_key: `production-readiness-proof-${Date.now()}`,
        occurred_at: new Date().toISOString(),
        metadata: { proofSafe: true },
      }),
    });
    add(
      results,
      res.status === 200 || res.status === 201 ? "PASS" : "FAIL",
      "event ingest",
      `${xflow}/api/control-plane/events`,
      `valid proof bearer write-safe probe: ${statusSummary(res)}`,
      { httpStatus: res.status },
    );
  } else {
    add(
      results,
      "ENV MISSING",
      "event ingest",
      `${xflow}/api/control-plane/events`,
      "valid bearer proof requires XFLOW_PROOF_EVENT_BEARER and XFLOW_PROOF_SAFE_WRITES=true",
    );
  }
}

async function scanBundles(app, results) {
  const base = normalizeBaseUrl(app);
  const pages = ["/", "/pricing", "/auth/sign-up"];
  const scripts = new Set();
  const findings = [];
  let reachablePages = 0;

  for (const path of pages) {
    const url = `${base}${path}`;
    const res = await request(url);
    if (res.ok && res.text) {
      if (isPublicReachable(res.status)) reachablePages += 1;
      findings.push(...scanTextForSecrets(url, res.text));
      for (const scriptUrl of extractScriptUrls(base, res.text)) scripts.add(scriptUrl);
    }
  }

  for (const scriptUrl of [...scripts].slice(0, 40)) {
    const res = await request(scriptUrl);
    if (res.ok && res.text) findings.push(...scanTextForSecrets(scriptUrl, res.text));
  }

  const failCount = findings.filter((item) => item.severity === "FAIL").length;
  const riskCount = findings.filter((item) => item.severity === "RISK").length;
  const unreachable = reachablePages === 0 && scripts.size === 0;
  add(
    results,
    unreachable ? "FAIL" : failCount > 0 ? "FAIL" : riskCount > 0 ? "RISK" : "PASS",
    `${app.name} secret exposure`,
    base,
    unreachable
      ? "bundle scan could not run because no public page was reachable"
      : failCount || riskCount
      ? `${failCount} secret value findings, ${riskCount} secret-name findings across ${scripts.size} scripts`
      : `no high-confidence secret values or service-role JWTs found across ${scripts.size} scripts`,
    { findings: findings.slice(0, 20) },
  );
}

async function adminBoundarySmoke(results) {
  const probes = [
    [DEFAULT_APPS[0], "/api/admin/apps"],
    [DEFAULT_APPS[0], "/api/oauth/clients"],
    [DEFAULT_APPS[0], "/api/super-admin/apps"],
    [DEFAULT_APPS[1], "/api/admin/billing"],
    [DEFAULT_APPS[1], "/api/entitlements"],
    [DEFAULT_APPS[1], "/api/workspace-app-access"],
    [DEFAULT_APPS[2], "/api/admin/apps"],
    [DEFAULT_APPS[3], "/api/admin/apps"],
    [DEFAULT_APPS[4], "/api/admin/apps"],
    [DEFAULT_APPS[5], "/api/admin/apps"],
  ];

  for (const [app, path] of probes) {
    const base = normalizeBaseUrl(app);
    const res = await request(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ proof: "unauthenticated-mutation-probe" }),
    });
    add(
      results,
      isNotPubliclyMutable(res.status) ? "PASS" : "FAIL",
      "admin boundary smoke",
      `${base}${path}`,
      `unauthenticated mutation probe ${statusSummary(res)}`,
      { httpStatus: res.status },
    );
  }

  const sessionCookie = await resolveProofCookie(results);
  if (!sessionCookie) {
    add(
      results,
      "FAIL",
      "admin boundary smoke",
      "authenticated regular-user/admin APIs",
      "regular-user/admin denial proof requires a valid proof session cookie or working XFLOW_PROOF_EMAIL/XFLOW_PROOF_PASSWORD login",
    );
    return;
  }

  for (const [app, path] of probes) {
    const base = normalizeBaseUrl(app);
    const res = await request(`${base}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: sessionCookie,
      },
      body: JSON.stringify({ proof: "regular-user-authenticated-mutation-probe" }),
    });
    add(
      results,
      isNotPubliclyMutable(res.status) ? "PASS" : "FAIL",
      "admin boundary smoke",
      `${base}${path}`,
      `regular-user mutation probe ${statusSummary(res)}`,
      { httpStatus: res.status },
    );
  }
}

async function verixetEntitlementProof(results) {
  const base = normalizeBaseUrl(DEFAULT_APPS[1]);
  const proofUrl = envValue("VERIXET_ENTITLEMENT_PROOF_URL") || `${base}/api/platform/v1/entitlements/evaluate`;
  if (!envValue("VERIXET_PROOF_BEARER") || envValue("VERIXET_PROOF_MODE") !== "true" || !envValue("VERIXET_PROOF_WORKSPACE_ID") || !envValue("VERIXET_PROOF_USER_ID")) {
    add(
      results,
      "ENV MISSING",
      "Verixet entitlement proof",
      proofUrl,
      "deployed entitlement proof requires VERIXET_PROOF_MODE=true plus VERIXET_PROOF_BEARER, VERIXET_PROOF_WORKSPACE_ID, and VERIXET_PROOF_USER_ID",
    );
    return;
  }
  const res = await request(proofUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${envValue("VERIXET_PROOF_BEARER")}`,
      "content-type": "application/json",
      "x-app-slug": "verixet",
      "x-workspace-id": envValue("VERIXET_PROOF_WORKSPACE_ID"),
      "x-correlation-id": `production-readiness-proof-${Date.now()}`,
      "idempotency-key": `production-readiness-proof-${Date.now()}`,
    },
    body: JSON.stringify({
      workspace_id: envValue("VERIXET_PROOF_WORKSPACE_ID"),
      user_id: envValue("VERIXET_PROOF_USER_ID"),
      feature_keys: ["proof_wordgeni_free"],
      environment: "live",
      include_provenance: true,
    }),
  });
  add(
    results,
    res.status === 200 ? "PASS" : "FAIL",
    "Verixet entitlement proof",
    proofUrl,
    `proof fixture endpoint ${statusSummary(res)}`,
    { httpStatus: res.status },
  );
}

function productionEnvReadiness(results) {
  const configured = REQUIRED_PROOF_ENV.filter((name) => envValue(name));
  const missing = REQUIRED_PROOF_ENV.filter((name) => !envValue(name));
  if (!hasProofAuth()) {
    missing.push("XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL+XFLOW_PROOF_PASSWORD");
  }
  add(
    results,
    missing.length ? "ENV MISSING" : "PASS",
    "production env readiness",
    "local proof environment",
    `configured=${configured.length}, missing=${missing.join(", ") || "none"}`,
  );
}

async function main() {
  const results = [];
  productionEnvReadiness(results);

  for (const app of DEFAULT_APPS) {
    await smokePublicRoutes(app, results);
  }
  await proveXflowAuth(results);
  await proveEventIngest(results);
  await verixetEntitlementProof(results);
  for (const app of DEFAULT_APPS) {
    await scanBundles(app, results);
  }
  await adminBoundarySmoke(results);

  const counts = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), counts, results }, null, 2));

  if ((counts.FAIL ?? 0) > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
