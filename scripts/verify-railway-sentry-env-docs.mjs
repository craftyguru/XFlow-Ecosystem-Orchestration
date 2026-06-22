#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const DOCS = [
  "docs/observability/railway-sentry-env-matrix.md",
  "docs/observability/railway-sentry-launch-checklist.md",
  "docs/observability/sentry-production-launch-runbook.md",
  "docs/observability/sentry-ecosystem-audit.md",
];

const APP_CONTRACTS = [
  {
    app: "XFlow",
    slug: "xflow",
    services: ["XFlow web"],
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    backendEnv: "XFLOW_SENTRY_DSN",
    backendEnvPrefix: "XFLOW_SENTRY",
    frontendProject: "xflow-frontend",
    backendProject: "xflow-backend",
  },
  {
    app: "Verixet",
    slug: "verixet",
    services: ["Verixet web"],
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    backendEnv: "VERIXET_SENTRY_DSN",
    backendEnvPrefix: "VERIXET_SENTRY",
    frontendProject: "verixet-frontend",
    backendProject: "verixet-backend",
  },
  {
    app: "RatAiFy",
    slug: "rataify",
    services: ["RatAiFy frontend", "RatAiFy API"],
    browserEnv: "VITE_SENTRY_DSN",
    backendEnv: "RATAIFY_SENTRY_DSN",
    backendEnvPrefix: "RATAIFY_SENTRY",
    frontendProject: "rataify-frontend",
    backendProject: "rataify-backend",
  },
  {
    app: "AudAiX",
    slug: "audaix",
    services: ["AudAiX dashboard", "AudAiX API/workers"],
    browserEnv: "VITE_SENTRY_DSN",
    backendEnv: "AUDAIX_SENTRY_DSN",
    backendEnvPrefix: "AUDAIX_SENTRY",
    frontendProject: "audaix-frontend",
    backendProject: "audaix-backend",
  },
  {
    app: "WordGeni",
    slug: "wordgeni",
    services: ["WordGeni web", "WordGeni API", "WordGeni worker"],
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    backendEnv: "WORDGENI_SENTRY_DSN",
    backendEnvPrefix: "WORDGENI_SENTRY",
    frontendProject: "wordgeni-frontend",
    backendProject: "wordgeni-backend",
  },
  {
    app: "CreVux",
    slug: "crevux",
    services: ["CreVux image-gen", "CreVux API"],
    browserEnv: "VITE_SENTRY_DSN",
    backendEnv: "CREVUX_SENTRY_DSN",
    backendEnvPrefix: "CREVUX_SENTRY",
    frontendProject: "crevux-frontend",
    backendProject: "crevux-backend",
  },
];

const APP_ROOTS = ["apps/XFlow", "apps/Verixet", "apps/RatAiFy", "apps/AudAix", "apps/WordGeni", "apps/CreVux"];

const REQUIRED_SOURCE_MAP_ENVS = ["SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_AUTH_TOKEN", "SENTRY_RELEASE"];
const REQUIRED_BROWSER_CONTROLS = {
  NEXT_PUBLIC_SENTRY_DSN: [
    "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
    "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
    "NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE",
    "NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE",
  ],
  VITE_SENTRY_DSN: [
    "VITE_SENTRY_ENVIRONMENT",
    "VITE_SENTRY_TRACES_SAMPLE_RATE",
    "VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE",
    "VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE",
  ],
};

const SECRET_PATTERNS = [
  {
    label: "real-looking Sentry DSN",
    pattern: /https:\/\/(?![^"'\s<>]*example)[^"'\s<>]+@[^"'\s<>]+\.ingest\.sentry\.io\/\d+/i,
  },
  {
    label: "Sentry auth token",
    pattern: /\bsntrys_[A-Za-z0-9_-]{16,}\b/i,
  },
  {
    label: "Stripe key/secret",
    pattern: /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b|\bwhsec_[A-Za-z0-9]{16,}\b/,
  },
  {
    label: "database or Redis URL",
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb|redis|rediss):\/\/(?!127\.0\.0\.1|localhost|redis\.wordgeni\.com)[^\s"'<>]+/i,
  },
  {
    label: "OpenAI-style API key",
    pattern: /\bsk-proj-[A-Za-z0-9_-]{16,}\b|\bOPENAI_API_KEY\s*=\s*sk-[A-Za-z0-9_-]{16,}/i,
  },
  {
    label: "Supabase service key",
    pattern: /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*eyJ[A-Za-z0-9_-]{16,}/i,
  },
  {
    label: "Turnstile secret",
    pattern: /\bTURNSTILE_SECRET_KEY\s*=\s*(?!<|$)[A-Za-z0-9_-]{16,}/i,
  },
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function walk(dir, out = []) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return out;
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist" || entry.name === "build") {
      continue;
    }
    const rel = path.join(dir, entry.name).replaceAll(path.sep, "/");
    if (entry.isDirectory()) walk(rel, out);
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

function collectEnvExamples() {
  return APP_ROOTS.flatMap((appRoot) => walk(appRoot)).filter((file) =>
    /(^|\/)\.env(?:\.[^/]*)?\.example$/i.test(file) || /(^|\/)[^/]+\.env\.example$/i.test(file),
  );
}

function lineContainsPlainPreferredEnv(lines, index, envName) {
  const line = lines[index] ?? "";
  const plain = new RegExp(`(?<![A-Z0-9_])${envName}(?![A-Z0-9_])`);
  if (!plain.test(line)) return false;
  const context = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 2)).join("\n");
  if (/(deprecated|legacy|fallback|do not|not configure|not set|must not|plain|existing|remove)/i.test(context)) {
    return false;
  }
  return true;
}

function isPlaceholderLine(line) {
  return /(<[^>]+>|YOUR_|your-|your_|PROJECT_REF|REGION|password|user:password|host:5432|localhost|127\.0\.0\.1|example|aws-0-region|aws-0-REGION|redis\.wordgeni\.com|db\.your-project-ref)/i.test(
    line,
  );
}

function secretFindingForLine(line) {
  for (const { label, pattern } of SECRET_PATTERNS) {
    if (!pattern.test(line)) continue;
    pattern.lastIndex = 0;
    if (isPlaceholderLine(line)) continue;
    return label;
  }
  return null;
}

function addFailure(failures, message) {
  failures.push(message);
}

const failures = [];

for (const doc of DOCS) {
  if (!exists(doc)) addFailure(failures, `missing required doc: ${doc}`);
}

const combinedDocs = DOCS.filter(exists).map((file) => `\n# ${file}\n${read(file)}`).join("\n");
const matrix = exists(DOCS[0]) ? read(DOCS[0]) : "";
const checklist = exists(DOCS[1]) ? read(DOCS[1]) : "";

for (const contract of APP_CONTRACTS) {
  if (!combinedDocs.includes(contract.app) && !combinedDocs.includes(contract.slug)) {
    addFailure(failures, `app not represented: ${contract.app}`);
  }
  for (const service of contract.services) {
    if (!matrix.includes(service) || !checklist.includes(service)) {
      addFailure(failures, `service missing from matrix/checklist: ${service}`);
    }
  }
  for (const value of [
    contract.browserEnv,
    contract.backendEnv,
    `${contract.backendEnvPrefix}_ENVIRONMENT`,
    `${contract.backendEnvPrefix}_TRACES_SAMPLE_RATE`,
    contract.frontendProject,
    contract.backendProject,
  ]) {
    if (!combinedDocs.includes(value)) {
      addFailure(failures, `missing documented contract value for ${contract.app}: ${value}`);
    }
  }
  for (const control of REQUIRED_BROWSER_CONTROLS[contract.browserEnv] ?? []) {
    if (!combinedDocs.includes(control)) {
      addFailure(failures, `missing browser control for ${contract.app}: ${control}`);
    }
  }
}

for (const envName of REQUIRED_SOURCE_MAP_ENVS) {
  if (!combinedDocs.includes(envName)) {
    addFailure(failures, `missing source-map env: ${envName}`);
  }
}

for (const project of APP_CONTRACTS.flatMap((contract) => [contract.frontendProject, contract.backendProject])) {
  if (!combinedDocs.includes(project)) {
    addFailure(failures, `missing Sentry project name: ${project}`);
  }
}

if (!/source-map variables are separate from runtime DSNs|Build\/source maps|Source-map envs/i.test(combinedDocs)) {
  addFailure(failures, "source-map envs are not documented separately from runtime DSNs");
}

const combinedDocLines = combinedDocs.split(/\r?\n/);
for (const [index, line] of combinedDocLines.entries()) {
  if (lineContainsPlainPreferredEnv(combinedDocLines, index, "SENTRY_DSN")) {
    addFailure(failures, `plain SENTRY_DSN appears preferred on docs line ${index + 1}: ${line.trim()}`);
  }
  if (lineContainsPlainPreferredEnv(combinedDocLines, index, "SENTRY_TRACES_SAMPLE_RATE")) {
    addFailure(failures, `plain SENTRY_TRACES_SAMPLE_RATE appears preferred on docs line ${index + 1}: ${line.trim()}`);
  }
}

const secretScanFiles = [...DOCS.filter(exists), ...collectEnvExamples()];
for (const file of secretScanFiles) {
  const lines = read(file).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const finding = secretFindingForLine(line);
    if (finding) {
      addFailure(failures, `${finding} found in ${file}:${index + 1}`);
    }
  }
}

console.log("# Railway Sentry Env Docs Verification");
console.log(`- docs checked: ${DOCS.filter(exists).join(", ")}`);
console.log(`- env examples checked: ${collectEnvExamples().length}`);
console.log(`- apps represented: ${APP_CONTRACTS.map((contract) => contract.app).join(", ")}`);
console.log(`- Sentry projects represented: ${APP_CONTRACTS.length * 2}`);
console.log(`- failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log("verification status: OK");
