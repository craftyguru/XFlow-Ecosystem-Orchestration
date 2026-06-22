import { redactSecretLikeValues } from "./ecosystem-proof-scanner.mjs";

export function createProofReport({ generatedAt, mode, appsChecked }) {
  return {
    generatedAt,
    mode,
    appsChecked,
    contracts: [],
    publicRoutes: [],
    xflowSettings: [],
    verixetStatus: [],
    billingSafety: [],
    portalSafety: [],
    usageCatalog: [],
    usageIngestion: [],
    satelliteWriters: [],
    leakageScan: [],
    httpSmoke: [],
    passCount: 0,
    warningCount: 0,
    failCount: 0,
    blockers: [],
    warnings: [],
    filesChecked: [],
    routesChecked: [],
    remainingGaps: [],
  };
}

export function addCheck(report, section, check) {
  const normalized = {
    status: check.status,
    name: check.name,
    detail: check.detail ?? "",
    files: check.files ?? [],
    routes: check.routes ?? [],
  };
  report[section].push(normalized);
  if (normalized.status === "pass") report.passCount += 1;
  if (normalized.status === "warn") {
    report.warningCount += 1;
    report.warnings.push(`${normalized.name}: ${normalized.detail}`);
  }
  if (normalized.status === "fail") {
    report.failCount += 1;
    report.blockers.push(`${normalized.name}: ${normalized.detail}`);
  }
  for (const file of normalized.files) {
    if (!report.filesChecked.includes(file)) report.filesChecked.push(file);
  }
  for (const route of normalized.routes) {
    if (!report.routesChecked.includes(route)) report.routesChecked.push(route);
  }
}

export function finalizeProofReport(report) {
  const safe = redactSecretLikeValues(report);
  safe.blockers = [...new Set(safe.blockers)];
  safe.warnings = [...new Set(safe.warnings)];
  safe.filesChecked = [...new Set(safe.filesChecked)].sort();
  safe.routesChecked = [...new Set(safe.routesChecked)].sort();
  return safe;
}

function renderSection(title, checks) {
  const lines = [`## ${title}`];
  if (checks.length === 0) {
    lines.push("- warn: no checks recorded");
    return lines.join("\n");
  }
  for (const check of checks) {
    const detail = check.detail ? ` - ${check.detail}` : "";
    lines.push(`- ${check.status}: ${check.name}${detail}`);
  }
  return lines.join("\n");
}

export function renderMarkdownReport(report) {
  const safe = finalizeProofReport(report);
  const lines = [
    "# Phase 17 Ecosystem Proof Report",
    "",
    `Generated: ${safe.generatedAt}`,
    `Mode: ${safe.mode}`,
    `Apps checked: ${safe.appsChecked.join(", ")}`,
    "",
    `Pass: ${safe.passCount}`,
    `Warnings: ${safe.warningCount}`,
    `Failures: ${safe.failCount}`,
    "",
    renderSection("Contracts", safe.contracts),
    "",
    renderSection("Public Routes", safe.publicRoutes),
    "",
    renderSection("XFlow Settings And Status", safe.xflowSettings),
    "",
    renderSection("Verixet Status", safe.verixetStatus),
    "",
    renderSection("Billing Safety", safe.billingSafety),
    "",
    renderSection("Portal Safety", safe.portalSafety),
    "",
    renderSection("Usage Catalog", safe.usageCatalog),
    "",
    renderSection("Usage Ingestion", safe.usageIngestion),
    "",
    renderSection("Satellite Writers", safe.satelliteWriters),
    "",
    renderSection("Leakage Scan", safe.leakageScan),
    "",
    renderSection("Optional HTTP Smoke", safe.httpSmoke),
    "",
    "## Blockers",
    ...(safe.blockers.length > 0 ? safe.blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    ...(safe.warnings.length > 0 ? safe.warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Remaining Gaps",
    ...(safe.remainingGaps.length > 0 ? safe.remainingGaps.map((item) => `- ${item}`) : ["- None recorded by proof harness"]),
  ];
  return lines.join("\n") + "\n";
}
