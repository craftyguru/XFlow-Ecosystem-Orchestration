#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();

const APPS = [
  {
    app: "XFlow",
    slug: "xflow",
    root: "apps/XFlow",
    runtimes: ["nextjs", "browser", "server"],
    backendEnv: "XFLOW_SENTRY_DSN",
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    sourceMapFiles: ["next.config.ts"],
  },
  {
    app: "Verixet",
    slug: "verixet",
    root: "apps/Verixet",
    runtimes: ["nextjs", "browser", "server", "edge"],
    backendEnv: "VERIXET_SENTRY_DSN",
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    sourceMapFiles: ["next.config.ts"],
  },
  {
    app: "RatAiFy",
    slug: "rataify",
    root: "apps/RatAiFy",
    runtimes: ["vite", "browser", "express"],
    backendEnv: "RATAIFY_SENTRY_DSN",
    browserEnv: "VITE_SENTRY_DSN",
    sourceMapFiles: ["vite.config.ts"],
  },
  {
    app: "AudAiX",
    slug: "audaix",
    root: "apps/AudAix",
    runtimes: ["node", "worker", "vite", "browser"],
    backendEnv: "AUDAIX_SENTRY_DSN",
    browserEnv: "VITE_SENTRY_DSN",
    sourceMapFiles: ["dashboard/vite.config.ts"],
  },
  {
    app: "WordGeni",
    slug: "wordgeni",
    root: "apps/WordGeni",
    runtimes: ["nextjs", "browser", "server", "edge", "api", "worker"],
    backendEnv: "WORDGENI_SENTRY_DSN",
    browserEnv: "NEXT_PUBLIC_SENTRY_DSN",
    sourceMapFiles: ["apps/web/next.config.mjs"],
  },
  {
    app: "CreVux",
    slug: "crevux",
    root: "apps/CreVux",
    runtimes: ["express", "api", "vite", "browser"],
    backendEnv: "CREVUX_SENTRY_DSN",
    browserEnv: "VITE_SENTRY_DSN",
    sourceMapFiles: ["artifacts/api-server/build.mjs", "artifacts/image-gen/vite.config.ts"],
  },
];

const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  ".next-prod",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  "vendor",
  ".local",
  "android",
  "ios",
  "attached_assets",
  "_blueprint_import",
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);

const MAX_TEXT_FILE_BYTES = 512 * 1024;

const SENTRY_ENV_PATTERN =
  /\b(?:NEXT_PUBLIC_SENTRY_DSN|VITE_SENTRY_DSN|[A-Z0-9]+_SENTRY_DSN|SENTRY_DSN|SENTRY_AUTH_TOKEN|SENTRY_ORG|SENTRY_PROJECT|SENTRY_RELEASE|NEXT_PUBLIC_SENTRY_[A-Z0-9_]+|VITE_SENTRY_[A-Z0-9_]+|[A-Z0-9]+_SENTRY_[A-Z0-9_]+|SENTRY_TRACES_SAMPLE_RATE)\b/g;

const SECRET_PATTERNS = [
  /https:\/\/[^"'\s]+@[^"'\s]+\.ingest\.sentry\.io\/\d+/i,
  /\bSENTRY_AUTH_TOKEN\s*=\s*["']?sntrys_[A-Za-z0-9_-]+/i,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bwhsec_[A-Za-z0-9]{16,}\b/,
  /\b(?:postgres(?:ql)?|redis|rediss|mysql):\/\/[^\s"'<>]+/i,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i,
];

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith(".next-prod")) continue;
      out.push(...walkFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (/^(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/i.test(entry.name)) continue;
    try {
      if (fs.statSync(full).size > MAX_TEXT_FILE_BYTES) continue;
    } catch {
      continue;
    }
    if (TEXT_EXTENSIONS.has(path.extname(entry.name)) || entry.name.startsWith(".env")) {
      out.push(full);
    }
  }
  return out;
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function rel(file) {
  return path.relative(workspaceRoot, file).replaceAll(path.sep, "/");
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function packageFiles(root) {
  return walkFiles(root).filter((file) => path.basename(file) === "package.json");
}

function sentryPackages(root) {
  const packages = [];
  for (const file of packageFiles(root)) {
    const normalized = rel(file);
    if (normalized.includes("/vendor/")) continue;
    try {
      const json = JSON.parse(read(file));
      const deps = { ...(json.dependencies ?? {}), ...(json.devDependencies ?? {}) };
      for (const [name, version] of Object.entries(deps)) {
        if (name.startsWith("@sentry/")) packages.push(`${normalized}: ${name}@${version}`);
      }
    } catch {
      packages.push(`${normalized}: <invalid package.json>`);
    }
  }
  return packages;
}

function collectMatches(files, pattern) {
  const matches = [];
  for (const file of files) {
    const text = read(file);
    if (pattern.test(text)) matches.push(rel(file));
    pattern.lastIndex = 0;
  }
  return uniq(matches);
}

function collectEnvNames(files) {
  const names = [];
  for (const file of files) {
    const text = read(file);
    for (const match of text.matchAll(SENTRY_ENV_PATTERN)) {
      names.push(match[0]);
    }
  }
  return uniq(names);
}

function detectRuntimeCoverage(files) {
  const joined = files.map((file) => `${rel(file)}\n${read(file)}`).join("\n");
  return {
    browser:
      /@sentry\/(?:nextjs|react)|sentry\.client\.config|instrumentation-client|VITE_SENTRY_DSN|NEXT_PUBLIC_SENTRY_DSN/i.test(joined),
    server:
      /@sentry\/(?:node|nextjs)|sentry\.server\.config|SENTRY_DSN|[A-Z0-9]+_SENTRY_DSN/i.test(joined),
    edge: /sentry\.edge\.config|NEXT_RUNTIME\s*===\s*["']edge["']/i.test(joined),
    worker: files.some((file) => {
      const normalized = rel(file);
      if (!/worker/i.test(normalized)) return false;
      return /@sentry\/node|[A-Z0-9]+_SENTRY_DSN|Sentry\.init|initSentry|captureExceptionFromUnknown/i.test(read(file));
    }),
  };
}

function detectSourceMapConfig(root, app) {
  const files = app.sourceMapFiles.map((file) => path.join(root, file)).filter(fs.existsSync);
  const evidence = [];
  for (const file of files) {
    const text = read(file);
    if (/withSentryConfig|sourcemap|sourceMap|sourcemaps|SENTRY_AUTH_TOKEN|SENTRY_ORG|SENTRY_PROJECT/i.test(text)) {
      evidence.push(rel(file));
    }
  }
  return uniq(evidence);
}

function detectPublicCrashRisk(files) {
  const risks = [];
  for (const file of files) {
    const normalized = rel(file);
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) continue;
    const text = read(file);
    if (!/(crash|sentry[-_]?(scenario|smoke)|captureMessage|captureException)/i.test(text)) continue;
    const routeLike = /app\/api\/|\/routes\/|src\/routes\//i.test(normalized) || /app\.(get|post|use)\(/i.test(text);
    if (!routeLike) continue;
    const guarded = /(internal|shared[_-]?secret|bootstrap[_-]?secret|authorize|x-[a-z0-9-]*secret|superadmin|admin)/i.test(
      `${normalized}\n${text}`,
    );
    if (!guarded) risks.push(normalized);
  }
  return uniq(risks);
}

function detectHardcodedSecrets(files) {
  const risks = [];
  for (const file of files) {
    const normalized = rel(file);
    if (/pnpm-lock\.yaml|package-lock\.json|SECURITY_AUDIT\.md/i.test(normalized)) continue;
    const text = read(file);
    if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) {
      risks.push(normalized);
    }
  }
  return uniq(risks);
}

function detectStaleDocs(files) {
  const docs = [];
  for (const file of files) {
    const normalized = rel(file);
    if (!/\.(md|txt|json|env|example)$/i.test(normalized) && !normalized.endsWith(".env.example")) continue;
    const text = read(file);
    if (/\bSENTRY_DSN\b/.test(text) && !/[A-Z0-9]+_SENTRY_DSN/.test(text)) {
      docs.push(normalized);
    }
    if (/process\.env\.SENTRY_DSN|set `SENTRY_DSN`|SENTRY_DSN for server/i.test(text)) {
      docs.push(normalized);
    }
  }
  return uniq(docs);
}

function detectMissingControls(initFiles, app, files) {
  const missing = [];
  const controlFiles = uniq([
    ...initFiles,
    ...files
      .map(rel)
      .filter((file) => /sentry|observability/i.test(file)),
  ]);
  const initText = controlFiles.map((file) => read(path.join(workspaceRoot, file))).join("\n");
  if (initFiles.length === 0) {
    missing.push("no Sentry init file found");
    return missing;
  }
  if (!/\bappSlug\b/.test(initText)) missing.push("missing appSlug tag");
  if (!/\bruntime\b/.test(initText)) missing.push("missing runtime tag");
  if (!/\brelease\b|SENTRY_RELEASE|VERCEL_GIT_COMMIT_SHA|GITHUB_SHA/.test(initText)) missing.push("missing release config");
  if (!/\benvironment\b/.test(initText)) missing.push("missing environment config");
  if (!/tracesSampleRate/.test(initText)) missing.push("missing tracing sample control");
  if (
    app.browserEnv &&
    !/REPLAYS_SESSION_SAMPLE_RATE|replaysSessionSampleRate|replayIntegration/.test(initText)
  ) {
    missing.push("missing replay sample controls");
  }
  if (!/beforeSend|redact/i.test(initText)) missing.push("missing beforeSend redaction");
  return uniq(missing);
}

function duplicateInitRisk(initFiles) {
  const runtimeBuckets = new Map();
  for (const file of initFiles) {
    let runtime = "unknown";
    if (/client|browser|frontend|dashboard|image-gen|vite/i.test(file)) runtime = "browser";
    if (/server|api-server|backend|observability\/sentry\.ts/i.test(file)) runtime = "server";
    if (/apps\/api\//i.test(file)) runtime = "api";
    if (/edge/i.test(file)) runtime = "edge";
    if (/worker/i.test(file)) runtime = "worker";
    const count = (read(path.join(workspaceRoot, file)).match(/Sentry\.init/g) ?? []).length;
    if (count > 0) runtimeBuckets.set(runtime, (runtimeBuckets.get(runtime) ?? 0) + count);
  }
  return [...runtimeBuckets.entries()]
    .filter(([, count]) => count > 1)
    .map(([runtime, count]) => `${runtime}:${count}`);
}

function auditApp(app) {
  const root = path.join(workspaceRoot, app.root);
  const files = walkFiles(root);
  const initFiles = collectMatches(files, /Sentry\.init/).filter(
    (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
  );
  const redactionFiles = collectMatches(files, /beforeSend|redactSentry|redactSensitiveTelemetry|Authorization|set-cookie|SENTRY_AUTH_TOKEN/);
  const envNames = collectEnvNames(files);
  const sourceMaps = detectSourceMapConfig(root, app);
  const staleDocs = detectStaleDocs(files);
  const deprecatedEnvNames = envNames.filter((name) => ["SENTRY_DSN", "SENTRY_TRACES_SAMPLE_RATE"].includes(name));
  const coverage = detectRuntimeCoverage(files);
  const missingControls = detectMissingControls(initFiles, app, files);
  const duplicateRisk = duplicateInitRisk(initFiles);
  const publicCrashRisk = detectPublicCrashRisk(files);
  const hardcodedSecretRisk = detectHardcodedSecrets(files);
  const packages = sentryPackages(root);
  const missingCoverage = [];
  if (app.runtimes.includes("browser") && !coverage.browser) missingCoverage.push("browser");
  if ((app.runtimes.includes("server") || app.runtimes.includes("api") || app.runtimes.includes("express")) && !coverage.server) {
    missingCoverage.push("server/backend");
  }
  if (app.runtimes.includes("edge") && !coverage.edge) missingCoverage.push("edge");
  if (app.runtimes.includes("worker") && !coverage.worker) missingCoverage.push("worker");

  return {
    app: app.app,
    root: app.root,
    packages,
    initFiles,
    runtimeCoverage: coverage,
    envNames,
    redactionFiles,
    sourceMaps,
    duplicateInitRisk: duplicateRisk,
    publicCrashRisk,
    hardcodedSecretRisk,
    staleDocs,
    deprecatedEnvNames,
    missingControls,
    missingCoverage,
  };
}

function formatList(values) {
  return values.length ? values.join(", ") : "none";
}

const results = APPS.map(auditApp);
let hasWarnings = false;

console.log("# Sentry Ecosystem Audit");
console.log("");
for (const result of results) {
  const warningFields = [
    result.duplicateInitRisk,
    result.publicCrashRisk,
    result.hardcodedSecretRisk,
    result.staleDocs,
    result.deprecatedEnvNames,
    result.missingControls,
    result.missingCoverage,
  ];
  if (warningFields.some((field) => field.length > 0)) hasWarnings = true;
  console.log(`## ${result.app}`);
  console.log(`- packages: ${formatList(result.packages)}`);
  console.log(`- init files: ${formatList(result.initFiles)}`);
  console.log(`- coverage: browser=${result.runtimeCoverage.browser}, server=${result.runtimeCoverage.server}, edge=${result.runtimeCoverage.edge}, worker=${result.runtimeCoverage.worker}`);
  console.log(`- env names: ${formatList(result.envNames)}`);
  console.log(`- redaction: ${formatList(result.redactionFiles)}`);
  console.log(`- source maps: ${formatList(result.sourceMaps)}`);
  console.log(`- duplicate init risk: ${formatList(result.duplicateInitRisk)}`);
  console.log(`- public crash route risk: ${formatList(result.publicCrashRisk)}`);
  console.log(`- hardcoded secret risk: ${formatList(result.hardcodedSecretRisk)}`);
  console.log(`- stale docs: ${formatList(result.staleDocs)}`);
  console.log(`- deprecated envs: ${formatList(result.deprecatedEnvNames)}`);
  console.log(`- missing controls: ${formatList(result.missingControls)}`);
  console.log(`- missing coverage: ${formatList(result.missingCoverage)}`);
  console.log("");
}

console.log(`audit status: ${hasWarnings ? "WARNINGS_FOUND" : "OK"}`);
