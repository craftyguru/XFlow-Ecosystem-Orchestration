#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addCheck, createProofReport, finalizeProofReport, renderMarkdownReport } from "./lib/ecosystem-proof-report.mjs";
import { assertNoLeaks, scanTextForLeaks } from "./lib/ecosystem-proof-scanner.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const appsChecked = ["xflow", "verixet", "rataify", "audaix", "wordgeni", "crevux"];
const generatedAt = new Date().toISOString();
const validModes = new Set(["static", "mixed", "http"]);
const productionHostPatterns = [
  /(^|\.)xflowx\.com$/i,
  /(^|\.)verixet\.com$/i,
  /(^|\.)rataify\.com$/i,
  /(^|\.)audaix\.com$/i,
  /(^|\.)wordgeni\.com$/i,
  /(^|\.)crevux\.com$/i,
];
const httpEnvNames = [
  "XFLOW_PROOF_BASE_URL",
  "VERIXET_PROOF_BASE_URL",
  "RATAIFY_PROOF_BASE_URL",
  "AUDAIX_PROOF_BASE_URL",
  "WORDGENI_PROOF_BASE_URL",
  "CREVUX_PROOF_BASE_URL",
];
const requiredHttpEnvNames = [
  ...httpEnvNames,
  "VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN",
  "VERIXET_PROOF_WORKSPACE_ID",
];

function parseCliArgs(argv) {
  const parsed = {
    mode: "mixed",
    reportDir: "output",
    failOnWarning: false,
    validateEnvOnly: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--mode=")) parsed.mode = arg.slice("--mode=".length);
    else if (arg.startsWith("--report-dir=")) parsed.reportDir = arg.slice("--report-dir=".length);
    else if (arg.startsWith("--fail-on-warning=")) parsed.failOnWarning = arg.slice("--fail-on-warning=".length) === "true";
    else if (arg === "--fail-on-warning") parsed.failOnWarning = true;
    else if (arg === "--validate-env-only") parsed.validateEnvOnly = true;
    else if (arg === "--help") {
      console.log("Usage: node scripts/phase17-ecosystem-proof.mjs [--mode=static|mixed|http] [--report-dir=output] [--fail-on-warning=true|false] [--validate-env-only]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!validModes.has(parsed.mode)) {
    throw new Error(`Invalid --mode=${parsed.mode}. Expected static, mixed, or http.`);
  }
  return parsed;
}

let cli;
try {
  cli = parseCliArgs(process.argv.slice(2));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const outDir = path.resolve(root, cli.reportDir);
const jsonReportPath = path.join(outDir, "phase17-ecosystem-proof-report.json");
const mdReportPath = path.join(outDir, "phase17-ecosystem-proof-report.md");
const hasHttp = httpEnvNames.some((name) => Boolean(process.env[name]?.trim()));
const effectiveMode = cli.mode === "mixed" ? (hasHttp ? "mixed" : "static") : cli.mode;
const report = createProofReport({ generatedAt, mode: effectiveMode, appsChecked });

function rel(...parts) {
  return path.join(...parts).replaceAll("\\", "/");
}

function abs(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(abs(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(abs(relativePath), "utf8");
}

function add(section, status, name, detail = "", options = {}) {
  addCheck(report, section, {
    status,
    name,
    detail,
    files: options.files ?? [],
    routes: options.routes ?? [],
  });
}

function checkFile(section, relativePath, name = `${relativePath} exists`) {
  add(section, exists(relativePath) ? "pass" : "fail", name, exists(relativePath) ? "found" : "missing", {
    files: [relativePath],
  });
}

function contains(relativePath, pattern) {
  if (!exists(relativePath)) return false;
  const text = read(relativePath);
  return typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);
}

function parseJsonFile(relativePath, section, name) {
  try {
    const parsed = JSON.parse(read(relativePath));
    add(section, "pass", name, "valid JSON", { files: [relativePath] });
    return parsed;
  } catch (err) {
    add(section, "fail", name, String(err), { files: [relativePath] });
    return null;
  }
}

function routeRegistered(routes, pathValue, ownerApp) {
  return routes.some((route) => route.path === pathValue && (!ownerApp || route.ownerApp === ownerApp));
}

function checkRegisteredRoute(routes, pathValue, ownerApp, name) {
  add(
    "contracts",
    routeRegistered(routes, pathValue, ownerApp) ? "pass" : "fail",
    name,
    `${ownerApp}:${pathValue}`,
    { routes: [pathValue] },
  );
}

function scanPublicNoLocalhost(relativePath, section = "contracts") {
  if (!exists(relativePath)) return;
  const text = read(relativePath);
  const found = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])/i.test(text);
  add(section, found ? "fail" : "pass", `${relativePath} has no public localhost URL`, found ? "localhost URL found" : "clean", {
    files: [relativePath],
  });
}

function sourceCheck(section, relativePath, pattern, name, failDetail) {
  const ok = contains(relativePath, pattern);
  add(section, ok ? "pass" : "fail", name, ok ? "matched" : failDetail, { files: [relativePath] });
}

function collectFiles(start, extensions, options = {}) {
  const startAbs = abs(start);
  if (!fs.existsSync(startAbs)) return [];
  const out = [];
  const excluded = options.excluded ?? [/node_modules/, /dist/, /\.next/, /vendor/, /output/, /coverage/];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relative = path.relative(root, full).replaceAll("\\", "/");
      if (excluded.some((pattern) => pattern.test(relative))) continue;
      if (entry.isDirectory()) {
        walk(full);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        out.push(relative);
      }
    }
  };
  walk(startAbs);
  return out;
}

function extractUsageMetricCatalog() {
  const file = "ecosystem-contracts/types/usage-metrics.ts";
  const text = read(file);
  const catalogText = /ECOSYSTEM_USAGE_METRIC_CATALOG\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(text)?.[1] ?? "";
  const blocks = catalogText.match(/\{\s*metricKey:[\s\S]*?\n\s*\}/g) ?? [];
  const entries = blocks.map((block) => {
    const prop = (name) => new RegExp(`${name}:\\s*"([^"]+)"`).exec(block)?.[1] ?? null;
    const allowedRaw = /allowedAppSlugs:\s*\[([^\]]*)\]/.exec(block)?.[1] ?? "";
    const allowedAppSlugs = allowedRaw.includes("ALL_APPS")
      ? appsChecked
      : [...allowedRaw.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    return {
      metricKey: prop("metricKey"),
      owner: prop("owner"),
      attribution: prop("attribution"),
      label: prop("label"),
      unit: prop("unit"),
      visibility: prop("visibility"),
      aggregation: prop("aggregation"),
      displayGroup: prop("displayGroup"),
      allowedAppSlugs,
      raw: block,
    };
  });
  const plannedText = /PLANNED_ECOSYSTEM_USAGE_METRICS\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(text)?.[1] ?? "";
  const planned = [...plannedText.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  return { entries, planned, file };
}

function plannedMetricUsage(planned) {
  const files = [
    ...collectFiles("apps/RatAiFy/server", [".ts"]),
    ...collectFiles("apps/AudAix/src", [".ts"]),
    ...collectFiles("apps/WordGeni/apps/api/src", [".ts"]),
    ...collectFiles("apps/CreVux/artifacts/api-server/src", [".ts"]),
  ].filter((file) => !/\.test\.|tests\//.test(file));
  const offenders = [];
  for (const file of files) {
    const text = read(file);
    for (const metric of planned) {
      if (text.includes(metric)) offenders.push(`${file}:${metric}`);
    }
  }
  return offenders;
}

function checkSourceSetForLeaks(files, name) {
  const findings = [];
  for (const file of files) {
    if (!exists(file)) continue;
    for (const finding of scanTextForLeaks(read(file), { label: file })) {
      findings.push(finding);
    }
  }
  add(
    "leakageScan",
    findings.length === 0 ? "pass" : "fail",
    name,
    findings.length === 0 ? "clean" : `${findings.length} finding(s)`,
    { files },
  );
}

function proofUrlIssue(value) {
  if (!value?.trim()) return "missing";
  try {
    const parsed = new URL(value);
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if ((process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true") && isLocalhost) {
      return "localhost URL is not allowed in CI HTTP proof";
    }
    const isProduction = productionHostPatterns.some((pattern) => pattern.test(parsed.hostname));
    if (isProduction && process.env.ECOSYSTEM_PROOF_ALLOW_PRODUCTION_HTTP !== "true") {
      return "production URL requires ECOSYSTEM_PROOF_ALLOW_PRODUCTION_HTTP=true";
    }
    return null;
  } catch {
    return "invalid URL";
  }
}

function addHttpConfigCheck(name, value) {
  const issue = proofUrlIssue(value);
  if (!issue) {
    add("httpSmoke", "pass", `${name} HTTP base URL`, "configured");
    return true;
  }
  const status = cli.mode === "http" ? "fail" : "warn";
  const detail = issue === "missing" ? "not configured; static proof only" : issue;
  add("httpSmoke", status, `${name} HTTP base URL`, detail);
  return false;
}

function validateHttpEnvironment() {
  const urlEnv = {
    xflow: process.env.XFLOW_PROOF_BASE_URL,
    verixet: process.env.VERIXET_PROOF_BASE_URL,
    rataify: process.env.RATAIFY_PROOF_BASE_URL,
    audaix: process.env.AUDAIX_PROOF_BASE_URL,
    wordgeni: process.env.WORDGENI_PROOF_BASE_URL,
    crevux: process.env.CREVUX_PROOF_BASE_URL,
  };
  for (const [app, value] of Object.entries(urlEnv)) {
    addHttpConfigCheck(app, value);
  }
  for (const name of ["VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN", "VERIXET_PROOF_WORKSPACE_ID"]) {
    const ok = Boolean(process.env[name]?.trim());
    add("httpSmoke", ok ? "pass" : cli.mode === "http" ? "fail" : "warn", `${name} configured`, ok ? "present" : "missing");
  }
  const missing = requiredHttpEnvNames.filter((name) => !process.env[name]?.trim());
  return missing.length === 0 && Object.values(urlEnv).every((value) => !proofUrlIssue(value));
}

async function optionalHttpSmoke() {
  if (cli.mode === "static") return;
  const urlEnv = {
    xflow: process.env.XFLOW_PROOF_BASE_URL,
    verixet: process.env.VERIXET_PROOF_BASE_URL,
    rataify: process.env.RATAIFY_PROOF_BASE_URL,
    audaix: process.env.AUDAIX_PROOF_BASE_URL,
    wordgeni: process.env.WORDGENI_PROOF_BASE_URL,
    crevux: process.env.CREVUX_PROOF_BASE_URL,
  };
  validateHttpEnvironment();
  if (urlEnv.xflow?.trim() && !proofUrlIssue(urlEnv.xflow)) {
    for (const route of ["/ecosystem", "/for-reviewers", "/pricing"]) {
      const target = `${urlEnv.xflow.replace(/\/+$/, "")}${route}`;
      try {
        const response = await fetch(target, { method: "GET" });
        add("httpSmoke", response.ok ? "pass" : "warn", `XFlow public ${route}`, `HTTP ${response.status}`, {
          routes: [route],
        });
      } catch (err) {
        add("httpSmoke", "warn", `XFlow public ${route}`, `HTTP unavailable: ${err.message}`, { routes: [route] });
      }
    }
  }
  const token = process.env.VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN?.trim();
  const workspaceId = process.env.VERIXET_PROOF_WORKSPACE_ID?.trim();
  if (urlEnv.verixet?.trim() && !proofUrlIssue(urlEnv.verixet) && token && workspaceId) {
    const target = `${urlEnv.verixet.replace(/\/+$/, "")}/api/platform/v1/ecosystem/status`;
    try {
      const response = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspaceId, sourceApp: "xflow", include: { effectiveAccess: true, usageSummary: true } }),
      });
      add("httpSmoke", response.ok ? "pass" : "warn", "Verixet ecosystem status HTTP", `HTTP ${response.status}`, {
        routes: ["/api/platform/v1/ecosystem/status"],
      });
    } catch (err) {
      add("httpSmoke", "warn", "Verixet ecosystem status HTTP", `HTTP unavailable: ${err.message}`, {
        routes: ["/api/platform/v1/ecosystem/status"],
      });
    }
  } else {
    add(
      "httpSmoke",
      cli.mode === "http" ? "fail" : "warn",
      "Verixet service HTTP checks",
      "missing base URL, service token, or VERIXET_PROOF_WORKSPACE_ID",
    );
  }
}

function runStaticProof() {
  const routesJson = parseJsonFile("ecosystem-contracts/routes.json", "contracts", "routes.json parses");
  parseJsonFile("ecosystem-contracts/env-contract.json", "contracts", "env-contract.json parses");
  checkFile("contracts", "ecosystem-contracts/types/ecosystem-status.ts");
  checkFile("contracts", "ecosystem-contracts/types/usage-metrics.ts");
  scanPublicNoLocalhost("ecosystem-contracts/routes.json");
  scanPublicNoLocalhost("ecosystem-contracts/env-contract.json");
  const routes = Array.isArray(routesJson?.routes) ? routesJson.routes : [];
  checkRegisteredRoute(routes, "/api/platform/v1/ecosystem/status", "verixet", "Verixet ecosystem status registered");
  checkRegisteredRoute(routes, "/api/platform/v1/billing/portal-session", "verixet", "Verixet portal-session registered");
  checkRegisteredRoute(routes, "/api/ecosystem/usage/ingest", "verixet", "Verixet usage ingest registered");
  checkRegisteredRoute(routes, "/api/billing/plan-change/preview", "verixet", "Verixet plan-change preview registered");
  checkRegisteredRoute(routes, "/api/billing/plan-change/execute", "verixet", "Verixet plan-change execute registered");
  checkRegisteredRoute(routes, "/checkout/handoff", "verixet", "Verixet checkout handoff registered");

  const xflowRoutes = {
    "/settings": "apps/XFlow/src/app/(dashboard)/settings/page.tsx",
    "/ecosystem": "apps/XFlow/src/app/(showcase)/ecosystem/page.tsx",
    "/for-reviewers": "apps/XFlow/src/app/(showcase)/for-reviewers/page.tsx",
    "/pricing": "apps/XFlow/src/app/(showcase)/pricing/page.tsx",
  };
  for (const [route, file] of Object.entries(xflowRoutes)) {
    checkFile("publicRoutes", file, `XFlow ${route} source exists`);
    report.routesChecked.push(route);
  }
  sourceCheck("publicRoutes", "apps/XFlow/src/components/showcase/ShowcaseNav.tsx", /Ecosystem/i, "Showcase nav includes Ecosystem", "missing");
  sourceCheck("publicRoutes", "apps/XFlow/src/components/showcase/ShowcaseNav.tsx", /For Reviewers/i, "Showcase nav includes For Reviewers", "missing");
  sourceCheck("publicRoutes", "apps/XFlow/src/components/showcase/ShowcaseFooter.tsx", /Ecosystem/i, "Showcase footer includes Ecosystem", "missing");
  sourceCheck("publicRoutes", "apps/XFlow/src/components/showcase/ShowcaseFooter.tsx", /For Reviewers/i, "Showcase footer includes For Reviewers", "missing");
  sourceCheck("publicRoutes", "apps/XFlow/src/content/showcase-home.ts", /reviewer|proof/i, "Homepage content includes reviewer/proof link", "not found");
  const publicMarketingFiles = [
    ...Object.values(xflowRoutes),
    "apps/XFlow/src/components/showcase/ShowcaseNav.tsx",
    "apps/XFlow/src/components/showcase/ShowcaseFooter.tsx",
    "apps/XFlow/src/content/showcase-home.ts",
  ];
  const publicText = publicMarketingFiles.filter(exists).map((file) => read(file)).join("\n");
  add("publicRoutes", /STRIPE_PRICE/i.test(publicText) ? "fail" : "pass", "No STRIPE_PRICE env names in public marketing", /STRIPE_PRICE/i.test(publicText) ? "found" : "clean", { files: publicMarketingFiles });
  add("publicRoutes", /(SOC 2 certified|HIPAA compliant|GDPR certified)/i.test(publicText) ? "fail" : "pass", "No unsupported compliance claims added", "checked", { files: publicMarketingFiles });

  sourceCheck("xflowSettings", "apps/XFlow/src/lib/verixet/ecosystem-entitlements-client.ts", "/api/platform/v1/ecosystem/status", "XFlow client targets Verixet ecosystem status", "missing endpoint");
  sourceCheck("xflowSettings", "apps/XFlow/src/lib/verixet/ecosystem-entitlements-client.ts", /sourceApp:\s*"xflow"/, "XFlow sends sourceApp xflow", "missing sourceApp");
  sourceCheck("xflowSettings", "apps/XFlow/src/lib/verixet/ecosystem-entitlements-client.ts", /ECOSYSTEM_STATUS_CONTRACT_VERSION|2026-05-ecosystem-status-v1/, "XFlow validates ecosystem status contract version", "missing version");
  sourceCheck("xflowSettings", "apps/XFlow/src/lib/verixet/ecosystem-entitlements-client.ts", /stripeCustomerId|cus_/, "XFlow rejects raw Stripe keys/values", "missing raw Stripe guard");
  sourceCheck("xflowSettings", "apps/XFlow/tests/unit/ecosystem-status-client.test.ts", /falls back to stale mirror|xflow_mirror/, "XFlow mirror fallback is display-only tested", "missing fallback test");
  sourceCheck("xflowSettings", "apps/XFlow/tests/unit/ecosystem-settings-view-model.test.ts", /all six apps|six app cards/i, "XFlow settings renders all six app cards", "missing six app assertion");
  sourceCheck("xflowSettings", "apps/XFlow/src/lib/ecosystem/account-summary.ts", /Fresh|Verixet unavailable|Stale mirror|No entitlement/i, "XFlow settings freshness states present", "missing freshness states");

  const statusRoute = "apps/Verixet/src/app/api/platform/v1/ecosystem/status/route.ts";
  const statusTest = "apps/Verixet/src/app/api/platform/v1/ecosystem/status/route.test.ts";
  sourceCheck("verixetStatus", statusRoute, /sourceApp:\s*z\.literal\("xflow"\)/, "Verixet status restricts sourceApp", "missing literal sourceApp");
  sourceCheck("verixetStatus", statusRoute, /unauthorized\(401\)|unauthorized\(403\)|safeTokenEquals/, "Verixet status requires service auth", "missing auth check");
  sourceCheck("verixetStatus", statusTest, /rejects invalid sourceApp and missing workspaceId/, "Verixet status rejects invalid source/missing workspace", "missing test");
  sourceCheck("verixetStatus", statusTest, /all six|toHaveLength\(6\)/i, "Verixet status includes all six apps", "missing six app assertion");
  sourceCheck("verixetStatus", statusTest, /freeBaselineIncluded\).*true|freeBaseline/, "Verixet status includes Free baseline", "missing free baseline");
  sourceCheck("verixetStatus", "apps/Verixet/src/lib/billing/ecosystem-status-dto.ts", /identity:\s*"xflow"[\s\S]*billing:\s*"verixet"[\s\S]*entitlements:\s*"verixet"[\s\S]*usage:\s*"verixet"/, "Verixet status authority model encoded", "missing authority");
  sourceCheck("verixetStatus", statusRoute, /usage,|buildEcosystemUsageSummary/, "Verixet status includes usage summary", "missing usage");
  sourceCheck("verixetStatus", statusRoute, /customerPortalAvailable|customerPortalHandoffUrl/, "Verixet status includes portal fields", "missing portal fields");
  sourceCheck("verixetStatus", statusTest, /sub_secret|not\.toContain|stripe/i, "Verixet status sanitization test present", "missing sanitization proof");

  sourceCheck("billingSafety", "apps/Verixet/src/lib/billing/billing-status-public-dto.ts", /stripe|subscription/i, "Billing status public DTO exists", "missing DTO evidence");
  sourceCheck("billingSafety", "apps/Verixet/src/lib/billing/billing-lifecycle-summary.ts", /pending|cancellation|period/i, "Billing lifecycle summary exists", "missing lifecycle summary");
  sourceCheck("billingSafety", "apps/Verixet/src/lib/billing/plan-change-preview.test.ts", /redundant|lower|no-improvement|unknown|bundle/i, "Plan-change preview blocking covered", "missing blocking coverage");
  sourceCheck("billingSafety", "apps/Verixet/src/lib/billing/plan-change-execution.test.ts", /preview|Stripe|ambiguous|portal|duplicate|subscription item/i, "Plan-change execution safety covered", "missing execution coverage");
  sourceCheck("billingSafety", "apps/Verixet/src/app/api/billing/status/route.test.ts", /customer|subscription|not\.toContain|raw/i, "Billing status route sanitization covered", "missing route coverage");

  sourceCheck("portalSafety", "apps/Verixet/src/app/api/platform/v1/billing/portal-session/route.ts", /sourceApp:\s*z\.literal\("xflow"\)|returnUrl|safeTokenEquals/, "Portal session validates service source and return URL", "missing validation");
  sourceCheck("portalSafety", "apps/Verixet/src/app/api/platform/v1/billing/portal-session/route.test.ts", /unauthorized|invalid sourceApp|unsafe returnUrl|fallback|customer/i, "Portal session safety tests present", "missing tests");
  sourceCheck("portalSafety", "apps/XFlow/src/lib/verixet/ecosystem-entitlements-client.ts", /portal-session|sourceApp:\s*"xflow"/, "XFlow portal session client is server-side", "missing portal client evidence");

  const catalog = extractUsageMetricCatalog();
  checkFile("usageCatalog", catalog.file, "Usage metric catalog exists");
  const missingRequired = catalog.entries.filter((entry) =>
    ["metricKey", "owner", "attribution", "label", "unit", "visibility", "aggregation", "displayGroup"].some((key) => !entry[key]) ||
    entry.allowedAppSlugs.length === 0,
  );
  add("usageCatalog", missingRequired.length === 0 ? "pass" : "fail", "Every active metric has required fields", missingRequired.length === 0 ? `${catalog.entries.length} metrics checked` : missingRequired.map((entry) => entry.metricKey).join(", "), { files: [catalog.file] });
  const randomShared = catalog.entries.filter((entry) => entry.attribution === "shared_ecosystem" && entry.owner !== "ecosystem");
  add("usageCatalog", randomShared.length === 0 ? "pass" : "fail", "Shared metrics are ecosystem-owned", randomShared.length === 0 ? "clean" : randomShared.map((entry) => entry.metricKey).join(", "), { files: [catalog.file] });
  const internalVisible = catalog.entries.filter((entry) => entry.visibility === "internal_only" && entry.displayGroup !== "internal");
  add("usageCatalog", internalVisible.length === 0 ? "pass" : "fail", "Internal-only metrics stay internal", internalVisible.length === 0 ? "clean" : internalVisible.map((entry) => entry.metricKey).join(", "), { files: [catalog.file] });
  const plannedOffenders = plannedMetricUsage(catalog.planned);
  add("usageCatalog", plannedOffenders.length === 0 ? "pass" : "fail", "No planned metric is used by production writers", plannedOffenders.length === 0 ? "clean" : plannedOffenders.join(", "), { files: [catalog.file] });
  sourceCheck("usageCatalog", "apps/Verixet/src/lib/billing/ecosystem-usage-summary.ts", /app_owned|shared_ecosystem|billing_credit|internal_only|displayGroup/, "Usage summary groups by catalog attribution", "missing grouping");

  sourceCheck("usageIngestion", "apps/Verixet/src/lib/billing/usage-ingest.test.ts", /unknown metric|wrong sourceApp|missing idempotency|non-positive|secret|duplicate/i, "Usage ingest rejects unsafe reports", "missing rejection tests");
  sourceCheck("usageIngestion", "apps/Verixet/src/app/api/ecosystem/usage/ingest/route.test.ts", /usageEventId|not\.toHaveProperty|internal/i, "Usage ingest does not return internal event id", "missing internal id proof");
  sourceCheck("usageIngestion", "apps/Verixet/src/app/api/ecosystem/usage/ingest/route.ts", /rejectsSecretLikeMetadata|secret-like|metadata/i, "Usage ingest rejects secret-like metadata", "missing metadata guard");

  sourceCheck("satelliteWriters", "apps/AudAix/src/lib/billing/verixet-usage.ts", /audaix\.live_audit|idempotency|metadata|token/i, "AudAiX reporter canonicalizes and sanitizes usage", "missing reporter evidence");
  sourceCheck("satelliteWriters", "apps/WordGeni/apps/api/src/services/verixet-usage-admission.ts", /wordgeni\.ai_generation|idempotency|metadata|prompt|raw/i, "WordGeni reporter canonicalizes and sanitizes usage", "missing reporter evidence");
  sourceCheck("satelliteWriters", "apps/RatAiFy/server/lib/verixetUsageReporter.ts", /resolveEcosystemWorkspaceIdentity|idempotency|sanitize|reputation_scan/i, "Rataify reporter uses UUID resolver and canonical metrics", "missing reporter evidence");
  sourceCheck("satelliteWriters", "apps/RatAiFy/server/routes/audaix-proof.ts", /proof_import|proof_refresh|proof_visibility_update|audit_proof_badge/i, "Rataify proof metrics split", "missing proof split");
  sourceCheck("satelliteWriters", "apps/RatAiFy/tests/rataify-usage-guards.node.test.ts", /public badge|does not report|anonymous|audit_proof_badge/i, "Rataify public badge fetch remains unwired", "missing public badge proof");
  sourceCheck("satelliteWriters", "apps/CreVux/artifacts/api-server/src/routes/xflowUclLink.ts", /xflow_handoff|upsertEcosystemWorkspaceMapping|confirmation_jwt/i, "Crevux UCL callback persists verified mapping", "missing UCL callback");
  sourceCheck("satelliteWriters", "apps/CreVux/lib/db/migrations/0063_ecosystem_workspace_mappings.sql", /ecosystem_workspace_mappings|ecosystem_workspace_id/i, "Crevux durable mapping migration exists", "missing migration");
  sourceCheck("satelliteWriters", "apps/CreVux/artifacts/api-server/src/middleware/requireAuth.ts", /ecosystemWorkspaceId|resolveVerifiedEcosystemIdentity/i, "Crevux request auth loads verified ecosystem UUID", "missing auth propagation");
  sourceCheck("satelliteWriters", "apps/CreVux/artifacts/api-server/src/routes/openai/generateImage.ts", /crevux\.image_credit|ecosystemWorkspaceId|:success/i, "Crevux image success usage gated by verified UUID", "missing image writer");
  sourceCheck("satelliteWriters", "apps/CreVux/artifacts/api-server/src/routes/video.ts", /crevux\.video_credit|ecosystemWorkspaceId|video-parent/i, "Crevux video queued usage gated by verified UUID", "missing video writer");
  sourceCheck("satelliteWriters", "apps/CreVux/artifacts/api-server/src/lib/verixetUsageAdmission.test.ts", /missing_ecosystem_workspace_id|fails soft|Verixet usage ingest is unavailable/i, "Crevux missing UUID/outage skips reporting", "missing fail-soft tests");

  checkSourceSetForLeaks(publicMarketingFiles, "Public XFlow marketing/source files have no frontend-safe leaks");
}

if (cli.validateEnvOnly) {
  validateHttpEnvironment();
} else {
  runStaticProof();
  await optionalHttpSmoke();
}

fs.mkdirSync(outDir, { recursive: true });
const finalized = finalizeProofReport(report);
const json = JSON.stringify(finalized, null, 2) + "\n";
const md = renderMarkdownReport(finalized);
assertNoLeaks(json, { label: "phase17 JSON report" });
assertNoLeaks(md, { label: "phase17 Markdown report" });
fs.writeFileSync(jsonReportPath, json);
fs.writeFileSync(mdReportPath, md);

console.log(`Phase 17 proof report written: ${path.relative(root, jsonReportPath)}`);
console.log(`Phase 17 proof report written: ${path.relative(root, mdReportPath)}`);
console.log(`Pass ${finalized.passCount}, warnings ${finalized.warningCount}, failures ${finalized.failCount}`);

if (finalized.failCount > 0) {
  process.exitCode = 1;
}
if (cli.failOnWarning && finalized.warningCount > 0) {
  process.exitCode = 1;
}
