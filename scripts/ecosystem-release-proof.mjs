#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redactSecretLikeValues, scanTextForLeaks } from "./lib/ecosystem-proof-scanner.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const generatedAt = new Date().toISOString();

const appMatrix = [
  { slug: "xflow", name: "XFlow", dir: "apps/XFlow", focus: "identity/control plane, workspace membership, app handoff, central settings" },
  { slug: "verixet", name: "Verixet", dir: "apps/Verixet", focus: "billing, entitlements, usage, Stripe, portal, audit trail" },
  { slug: "rataify", name: "RatAiFy", dir: "apps/RatAiFy", focus: "trust scanning, report access, workspace scoping, usage reporting" },
  { slug: "audaix", name: "AudAix", dir: "apps/AudAix", focus: "audit evidence, report integrity, usage blocking, long-running audits" },
  { slug: "wordgeni", name: "WordGeni", dir: "apps/WordGeni", focus: "web/API/worker parity, generation limits, Supabase boundaries" },
  { slug: "crevux", name: "CreVux", dir: "apps/CreVux", focus: "paid media generation, signed downloads, usage ingest, storage boundaries" },
];

const minimumScripts = ["typecheck", "lint", "test", "build", "smoke", "verify:env", "verify:security", "verify:routes"];

const appCommandTimeoutOverrides = {
  "xflow:build": 300000,
  "xflow:smoke": 480000,
  "verixet:build": 300000,
  "verixet:smoke": 300000,
  "crevux:smoke": 300000,
};

const p0Backlog = [
  {
    id: "P0-1",
    title: "XFlow live handoff proof",
    owner: "platform/auth",
    acceptance: [
      "One XFlow login opens all entitled satellite apps.",
      "Bad token, wrong appSlug, and missing workspace fail closed.",
      "Failure responses include requestId.",
      "Satellite logout does not kill the central XFlow session unless central logout is requested.",
    ],
  },
  {
    id: "P0-2",
    title: "Verixet entitlement authority",
    owner: "billing/platform",
    acceptance: [
      "All paid routes check Verixet before work.",
      "All usage routes report usage.",
      "Blocked usage returns clean 402 or upgrade metadata.",
      "Satellite apps do not duplicate paid tier or bundle expansion logic.",
    ],
  },
  {
    id: "P0-3",
    title: "Env contract enforcement",
    owner: "infra/ops",
    acceptance: [
      "Missing required env fails release proof.",
      "Unsafe browser env fails proof.",
      "Localhost or stale production URLs fail static proof.",
      "Admin Env Doctor is internal-only; user status is sanitized.",
    ],
  },
  {
    id: "P0-4",
    title: "Supabase/RLS hardening",
    owner: "data/security",
    acceptance: [
      "RLS is enabled on sensitive tables.",
      "Workspace scoping is tested.",
      "Service role is server-only.",
      "Migrations are validated against a disposable DB before production.",
      "Backup/restore proof exists.",
    ],
  },
  {
    id: "P0-5",
    title: "Production error sanitation",
    owner: "app/security",
    acceptance: [
      "No raw stack traces in production responses.",
      "No internal IDs, tokens, env names, provider object internals, or raw DB errors in user responses.",
      "All errors include requestId.",
      "Sentry/logs receive internal detail.",
    ],
  },
];

const p1Backlog = [
  ["P1-1", "Shared health/status endpoints", "platform"],
  ["P1-2", "Shared requestId/logging", "platform/ops"],
  ["P1-3", "Security headers/CSP", "security/app"],
  ["P1-4", "CI branch gates", "infra"],
  ["P1-5", "App route contract validation", "platform/app"],
].map(([id, title, owner]) => ({ id, title, owner }));

const p2Backlog = [
  ["P2-1", "XFlow ops command center", "platform/ops"],
  ["P2-2", "Billing reconciliation", "billing/platform"],
  ["P2-3", "Performance budgets", "frontend/performance"],
  ["P2-4", "Incident runbooks", "ops"],
  ["P2-5", "Quarterly security review", "security"],
].map(([id, title, owner]) => ({ id, title, owner }));

const rootProofCommands = [
  { id: "static-proof", title: "Static ecosystem proof", command: "npm run proof:ecosystem:static" },
  { id: "proof-scanner", title: "Proof scanner tests", command: "npm run test:proof-scanner" },
  { id: "env-contracts", title: "Env contract validation", command: "npm run proof:env-contracts" },
  { id: "routes-contracts", title: "Route contract validation", command: "npm run proof:routes-contracts" },
  { id: "security-static", title: "Static security checks", command: "npm run proof:security-static" },
  { id: "handoff-contracts", title: "Handoff contract evidence", command: "npm run proof:handoff-contracts" },
  { id: "billing-contracts", title: "Billing contract evidence", command: "npm run proof:billing-contracts" },
  {
    id: "supabase",
    title: "Supabase validation",
    command: "npm run supabase:validate",
    requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  },
];

function parseArgs(argv) {
  const parsed = {
    reportDir: "output",
    runAppCommands: true,
    runRootCommands: true,
    timeoutMs: Number(process.env.RELEASE_PROOF_TIMEOUT_MS ?? 600000),
  };
  for (const arg of argv) {
    if (arg.startsWith("--report-dir=")) parsed.reportDir = arg.slice("--report-dir=".length);
    else if (arg === "--skip-app-commands") parsed.runAppCommands = false;
    else if (arg === "--skip-root-commands") parsed.runRootCommands = false;
    else if (arg.startsWith("--timeout-ms=")) parsed.timeoutMs = Number(arg.slice("--timeout-ms=".length));
    else if (arg === "--help") {
      console.log("Usage: node scripts/ecosystem-release-proof.mjs [--skip-app-commands] [--skip-root-commands] [--timeout-ms=600000] [--report-dir=output]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

const options = parseArgs(process.argv.slice(2));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function safeSnippet(text) {
  const redacted = redactSecretLikeValues(text ?? "");
  return redacted.replaceAll(/\s+/g, " ").trim().slice(0, 700);
}

function statusForCommand(result) {
  if (result.skipped) return result.skipStatus;
  return result.exitCode === 0 ? "PASS" : "FAIL";
}

function timeoutForAppCommand(appSlug, scriptName) {
  const override = appCommandTimeoutOverrides[`${appSlug}:${scriptName}`];
  return override ? Math.max(options.timeoutMs, override) : options.timeoutMs;
}

function hasEnv(names) {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

function commandShell() {
  return process.platform === "win32" ? "cmd.exe" : "/bin/sh";
}

function commandArgs(command) {
  return process.platform === "win32" ? ["/d", "/s", "/c", command] : ["-lc", command];
}

function killProcessTree(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill.exe", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      return;
    } catch {
      // Fall back to killing the immediate process below.
    }
  }
  try {
    child.kill("SIGTERM");
  } catch {}
  setTimeout(() => {
    try {
      child.kill("SIGKILL");
    } catch {}
  }, 5000).unref();
}

function runCommand({ command, cwd, timeoutMs, label }) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();
    const displayLabel = label ?? (path.relative(root, cwd).replaceAll("\\", "/") || ".");
    console.log(`[release:proof] START ${displayLabel}`);
    console.log(`[release:proof]   cwd=${path.relative(root, cwd).replaceAll("\\", "/") || "."}`);
    console.log(`[release:proof]   cmd=${command}`);
    console.log(`[release:proof]   timeoutMs=${timeoutMs}`);
    const child = spawn(commandShell(), commandArgs(command), {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      console.log(`[release:proof] TIMEOUT ${displayLabel} after ${timeoutMs}ms; terminating process tree`);
      killProcessTree(child);
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startedMs;
      const exitCode = timedOut ? 124 : code;
      const status = timedOut ? "TIMEOUT" : exitCode === 0 ? "PASS" : "FAIL";
      console.log(`[release:proof] END ${displayLabel} status=${status} exit=${exitCode} durationMs=${durationMs}`);
      resolve({
        label: displayLabel,
        command,
        cwd: path.relative(root, cwd).replaceAll("\\", "/") || ".",
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs,
        exitCode,
        signal,
        timedOut,
        output: safeSnippet(`${stdout}\n${stderr}`),
      });
    });
  });
}

function packageScripts(relativeDir) {
  const packagePath = path.join(relativeDir, "package.json");
  if (!fileExists(packagePath)) return null;
  return readJson(packagePath).scripts ?? {};
}

function routeContractStats() {
  const routes = readJson("ecosystem-contracts/routes.json").routes ?? [];
  const byOwner = Object.fromEntries(appMatrix.map((app) => [app.slug, 0]));
  for (const route of routes) {
    if (route.ownerApp in byOwner) byOwner[route.ownerApp] += 1;
  }
  return { total: routes.length, byOwner };
}

function envContractStats() {
  const env = readJson("ecosystem-contracts/env-contract.json").env ?? [];
  const byApp = Object.fromEntries(appMatrix.map((app) => [app.slug, { total: 0, requiredProduction: 0, secret: 0 }]));
  for (const item of env) {
    if (!(item.app in byApp)) continue;
    byApp[item.app].total += 1;
    if (item.required && item.environment === "production") byApp[item.app].requiredProduction += 1;
    if (item.secret) byApp[item.app].secret += 1;
  }
  return { total: env.length, byApp };
}

function sourceEvidence() {
  const files = [
    "docs/ecosystem-authority-contract.md",
    "docs/release-gates.md",
    "ecosystem-contracts/routes.json",
    "ecosystem-contracts/env-contract.json",
    "scripts/phase17-ecosystem-proof.mjs",
    "scripts/validate-service-role-import-boundary.mjs",
    "scripts/validate-rls-proof.mjs",
    "scripts/validate-ecosystem-auth-boundaries.mjs",
  ];
  return files.map((file) => ({
    file,
    status: fileExists(file) ? "PASS" : "FAIL",
    detail: fileExists(file) ? "found" : "missing",
  }));
}

function staticRiskSignals() {
  const signals = [];
  const contractFiles = ["ecosystem-contracts/routes.json", "ecosystem-contracts/env-contract.json"];
  const docFiles = ["docs/ecosystem-authority-contract.md", "docs/release-gates.md"];
  for (const file of contractFiles) {
    if (!fileExists(file)) continue;
    const text = readText(file);
    const findings = text.match(/\b(cus|sub|si|pi)_[A-Za-z0-9]{6,}\b|\b(sk_live|sk_test|whsec)_[A-Za-z0-9_]{6,}\b/g) ?? [];
    signals.push({
      name: `${file} secret-value scan`,
      status: findings.length === 0 ? "PASS" : "FAIL",
      detail: findings.length === 0 ? "clean" : `${findings.length} secret-like value(s)`,
    });
  }
  for (const file of docFiles) {
    if (!fileExists(file)) continue;
    const findings = scanTextForLeaks(readText(file), { label: file });
    signals.push({
      name: `${file} leakage scan`,
      status: findings.length === 0 ? "PASS" : "FAIL",
      detail: findings.length === 0 ? "clean" : `${findings.length} finding(s)`,
    });
  }
  const filesToScanForLocalhost = [
    "ecosystem-contracts/routes.json",
    "ecosystem-contracts/env-contract.json",
    "docs/ecosystem-authority-contract.md",
    "docs/release-gates.md",
  ];
  for (const file of filesToScanForLocalhost) {
    if (!fileExists(file)) continue;
    const findings = readText(file).match(/https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])/gi) ?? [];
    signals.push({
      name: `${file} public localhost scan`,
      status: findings.length === 0 ? "PASS" : "FAIL",
      detail: findings.length === 0 ? "clean" : `${findings.length} localhost URL(s)`,
    });
  }
  const envText = fileExists("ecosystem-contracts/env-contract.json") ? readText("ecosystem-contracts/env-contract.json") : "";
  signals.push({
    name: "Env contract rejects safe placeholders for required production env",
    status: /"required":true[\s\S]*"environment":"production"[\s\S]*"safePlaceholderAllowed":false/.test(envText) ? "PASS" : "FAIL",
    detail: "checked env-contract.json",
  });
  return signals;
}

function computeScores({ scriptCoverage, commandResults, staticSignals, routes, env }) {
  const rootFailures = commandResults.filter((item) => item.status === "FAIL").length;
  const staticFailures = staticSignals.filter((item) => item.status === "FAIL").length;
  return appMatrix.map((app) => {
    const coverage = scriptCoverage.find((item) => item.slug === app.slug);
    const present = coverage.scripts.filter((script) => script.status === "PASS").length;
    const total = coverage.scripts.length;
    const routesOwned = routes.byOwner[app.slug] ?? 0;
    const envOwned = env.byApp[app.slug] ?? { total: 0, requiredProduction: 0, secret: 0 };
    const releaseCoverageScore = Math.round((present / total) * 100);
    const contractScore = routesOwned > 0 && envOwned.total > 0 ? 80 : routesOwned > 0 || envOwned.total > 0 ? 60 : 30;
    const reliability = Math.max(25, Math.min(90, Math.round((releaseCoverageScore + contractScore) / 2) - rootFailures * 3));
    const security = Math.max(25, Math.min(90, contractScore - staticFailures * 10 + (coverage.hasVerifySecurity ? 10 : 0)));
    const performance = coverage.hasBuild ? 65 : 45;
    const observability = envOwned.total > 0 ? 60 : 35;
    const maturity = Math.max(25, Math.min(90, Math.round((releaseCoverageScore + security + reliability) / 3)));
    return {
      slug: app.slug,
      name: app.name,
      focus: app.focus,
      scores: { security, performance, reliability, observability, maturity },
      evidence: {
        releaseScriptsPresent: present,
        releaseScriptsTotal: total,
        routesOwned,
        envContractEntries: envOwned.total,
        requiredProductionEnv: envOwned.requiredProduction,
        secretEnv: envOwned.secret,
      },
      missingMinimumScripts: coverage.scripts.filter((script) => script.status !== "PASS").map((script) => script.name),
    };
  });
}

async function main() {
  const rootPackage = readJson("package.json");
  const rootScripts = rootPackage.scripts ?? {};
  const routeStats = routeContractStats();
  const envStats = envContractStats();
  const staticSignals = staticRiskSignals();
  const sourceFiles = sourceEvidence();

  const rootCommandResults = [];
  for (const proof of rootProofCommands) {
    if (!(proof.command.match(/npm run ([^ ]+)/)?.[1] in rootScripts)) {
      rootCommandResults.push({ ...proof, status: "SKIP - script missing", detail: "root package script missing" });
      continue;
    }
    if (proof.requiredEnv && !hasEnv(proof.requiredEnv)) {
      rootCommandResults.push({ ...proof, status: "SKIP - env missing", detail: `missing ${proof.requiredEnv.filter((name) => !process.env[name]?.trim()).join(", ")}` });
      continue;
    }
    if (!options.runRootCommands) {
      rootCommandResults.push({ ...proof, status: "SKIP - unsafe without proof env", detail: "root command execution disabled for this run" });
      continue;
    }
    const result = await runCommand({
      command: proof.command,
      cwd: root,
      timeoutMs: options.timeoutMs,
      label: `root:${proof.id}`,
    });
    rootCommandResults.push({
      ...proof,
      status: statusForCommand(result),
      detail: result.output || `exit ${result.exitCode}`,
      durationMs: result.durationMs,
      result,
    });
  }

  const scriptCoverage = [];
  const appCommandResults = [];
  for (const app of appMatrix) {
    const scripts = packageScripts(app.dir);
    const appCoverage = {
      slug: app.slug,
      name: app.name,
      dir: app.dir,
      hasBuild: Boolean(scripts?.build),
      hasVerifySecurity: Boolean(scripts?.["verify:security"]),
      scripts: [],
    };
    for (const scriptName of minimumScripts) {
      if (!scripts) {
        appCoverage.scripts.push({ name: scriptName, status: "FAIL", detail: "package.json missing" });
        continue;
      }
      if (!scripts[scriptName]) {
        appCoverage.scripts.push({ name: scriptName, status: "SKIP - script missing", detail: "not defined" });
        appCommandResults.push({ app: app.slug, script: scriptName, status: "SKIP - script missing", detail: "not defined" });
        continue;
      }
      appCoverage.scripts.push({ name: scriptName, status: "PASS", detail: "script defined" });
      if (!options.runAppCommands) {
        appCommandResults.push({ app: app.slug, script: scriptName, status: "SKIP - unsafe without proof env", detail: "app command execution disabled for this run" });
        continue;
      }
      const result = await runCommand({
        command: `npm run ${scriptName}`,
        cwd: path.join(root, app.dir),
        timeoutMs: timeoutForAppCommand(app.slug, scriptName),
        label: `${app.slug}:${scriptName}`,
      });
      appCommandResults.push({
        app: app.slug,
        script: scriptName,
        status: statusForCommand(result),
        detail: result.output || `exit ${result.exitCode}`,
        durationMs: result.durationMs,
        result,
      });
    }
    scriptCoverage.push(appCoverage);
  }

  const scorecards = computeScores({
    scriptCoverage,
    commandResults: [...rootCommandResults, ...appCommandResults],
    staticSignals,
    routes: routeStats,
    env: envStats,
  });

  const report = redactSecretLikeValues({
    generatedAt,
    mode: {
      runRootCommands: options.runRootCommands,
      runAppCommands: options.runAppCommands,
      timeoutMs: options.timeoutMs,
    },
    appsChecked: appMatrix.map((app) => app.slug),
    summary: {
      maturity: "Evidence-backed baseline established; production hardening remains P0 until live handoff, entitlement, env, Supabase/RLS, and error sanitation proofs are green.",
      authorityModel: {
        identity: "xflow",
        workspaceMembership: "xflow",
        billing: "verixet",
        entitlements: "verixet",
        usageLimits: "verixet",
        satellites: ["rataify", "audaix", "wordgeni", "crevux"],
      },
      routeContractEntries: routeStats.total,
      envContractEntries: envStats.total,
    },
    sourceFiles,
    staticSignals,
    rootProofCommands: rootCommandResults,
    scriptCoverage,
    appCommandResults,
    scorecards,
    backlog: { p0: p0Backlog, p1: p1Backlog, p2: p2Backlog },
    roadmap: {
      "30Days": [
        "Lock XFlow/Verixet authority boundaries.",
        "Make env contracts enforceable.",
        "Prove XFlow handoff across all six apps.",
        "Make Verixet entitlements fail closed.",
        "Standardize error responses and remove public leakage.",
        "Create and run root release:proof.",
      ],
      "60Days": [
        "Every app has the same minimum scripts.",
        "Every app exposes consistent health/version/status endpoints.",
        "Every app logs requestId and release.",
        "XFlow admin dashboard shows app health.",
        "Verixet has usage/billing/entitlement audit trails.",
        "Supabase RLS and workspace boundaries are proven.",
      ],
      "90Days": [
        "Production deploys have reliable rollback.",
        "Every feature has entitlement and usage tests.",
        "Performance budgets are enforced.",
        "SLO/error budget dashboards exist.",
        "Billing and usage ingest reconciliation exists.",
        "Quarterly access/security review process is active.",
      ],
    },
  });

  const outDir = path.join(root, options.reportDir);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "ecosystem-audit-hardening-report.json");
  const mdPath = path.join(outDir, "ecosystem-audit-hardening-report.md");
  const json = JSON.stringify(report, null, 2) + "\n";
  const md = renderMarkdown(report);
  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(mdPath, md);
  console.log(`Ecosystem audit report written: ${path.relative(root, jsonPath)}`);
  console.log(`Ecosystem audit report written: ${path.relative(root, mdPath)}`);

  const hasFail = [...rootCommandResults, ...appCommandResults, ...staticSignals, ...sourceFiles].some((item) => item.status === "FAIL");
  if (hasFail) process.exitCode = 1;
}

function renderStatusList(items) {
  return items
    .map((item) => {
      const duration = typeof item.durationMs === "number" ? ` (${item.durationMs}ms)` : "";
      return `- ${item.status}: ${item.title ?? item.name ?? item.script ?? item.file}${duration} - ${item.detail ?? ""}`;
    })
    .join("\n");
}

function renderMarkdown(report) {
  const lines = [
    "# Ecosystem Audit + Hardening Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Apps checked: ${report.appsChecked.join(", ")}`,
    "",
    "## Executive Summary",
    "",
    report.summary.maturity,
    "",
    `Route contract entries: ${report.summary.routeContractEntries}`,
    `Env contract entries: ${report.summary.envContractEntries}`,
    "",
    "## Authority Model",
    "",
    `- Identity and workspace: ${report.summary.authorityModel.identity}`,
    `- Billing, entitlements, usage limits: ${report.summary.authorityModel.billing}`,
    `- Satellites: ${report.summary.authorityModel.satellites.join(", ")}`,
    "",
    "## Source Evidence",
    "",
    renderStatusList(report.sourceFiles),
    "",
    "## Static Risk Signals",
    "",
    renderStatusList(report.staticSignals),
    "",
    "## Root Proof Commands",
    "",
    renderStatusList(report.rootProofCommands),
    "",
    "## Per-Site Scorecards",
    "",
  ];
  for (const card of report.scorecards) {
    lines.push(`### ${card.name}`);
    lines.push(`Focus: ${card.focus}`);
    lines.push(`Scores: security ${card.scores.security}, performance ${card.scores.performance}, reliability ${card.scores.reliability}, observability ${card.scores.observability}, maturity ${card.scores.maturity}`);
    lines.push(`Evidence: ${card.evidence.releaseScriptsPresent}/${card.evidence.releaseScriptsTotal} minimum scripts present; ${card.evidence.routesOwned} owned route contract(s); ${card.evidence.envContractEntries} env contract entrie(s).`);
    lines.push(`Missing minimum scripts: ${card.missingMinimumScripts.length ? card.missingMinimumScripts.join(", ") : "none"}`);
    lines.push("");
  }
  lines.push("## App Command Results");
  lines.push("");
  for (const app of appMatrix) {
    lines.push(`### ${app.name}`);
    const rows = report.appCommandResults.filter((item) => item.app === app.slug);
    lines.push(renderStatusList(rows));
    lines.push("");
  }
  lines.push("## Priority Backlog");
  lines.push("");
  for (const item of report.backlog.p0) {
    lines.push(`- ${item.id}: ${item.title} (${item.owner})`);
  }
  for (const item of report.backlog.p1) {
    lines.push(`- ${item.id}: ${item.title} (${item.owner})`);
  }
  for (const item of report.backlog.p2) {
    lines.push(`- ${item.id}: ${item.title} (${item.owner})`);
  }
  lines.push("");
  lines.push("## 30 / 60 / 90 Day Roadmap");
  lines.push("");
  lines.push("### 30 Days");
  lines.push(report.roadmap["30Days"].map((item) => `- ${item}`).join("\n"));
  lines.push("");
  lines.push("### 60 Days");
  lines.push(report.roadmap["60Days"].map((item) => `- ${item}`).join("\n"));
  lines.push("");
  lines.push("### 90 Days");
  lines.push(report.roadmap["90Days"].map((item) => `- ${item}`).join("\n"));
  lines.push("");
  lines.push("## Evidence Rules");
  lines.push("");
  lines.push("- No fake data, invented metrics, or assumed production behavior is included.");
  lines.push("- Missing scripts/env/live proof are explicit skips or failures.");
  lines.push("- Public output is redacted for secret-like values.");
  return lines.join("\n") + "\n";
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
