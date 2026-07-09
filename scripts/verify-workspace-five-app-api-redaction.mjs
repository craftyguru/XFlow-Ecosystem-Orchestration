import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");

const allowedClassifications = new Set([
  "locally-static-redaction-proved",
  "locally-response-shape-proved",
  "auth-required-not-exercised",
  "provider-proof-needed",
  "billing-proof-needed",
  "entitlement-proof-needed",
  "deployment-proof-needed",
  "ai-provider-proof-needed",
  "scan-provider-proof-needed",
  "audit-provider-proof-needed",
  "audio-provider-proof-needed",
  "mutation-proof-not-executed",
  "intentionally-unavailable",
  "not-applicable",
]);

const apps = [
  {
    app: "CreVux",
    root: "apps/CreVux",
    proofRegister: "apps/CreVux/docs/crevux-local-route-auth-proof-register.json",
    apiDirs: ["artifacts/api-server/src/routes"],
    clientDirs: ["apps/mobile/app", "apps/mobile/src/api"],
    requiredFiles: [
      "artifacts/api-server/src/routes/auth.ts",
      "artifacts/api-server/src/routes/settings.ts",
      "artifacts/api-server/src/routes/billing.ts",
      "artifacts/api-server/src/routes/mobile.ts",
      "artifacts/api-server/src/routes/openai/generateImage.ts",
      "artifacts/api-server/src/routes/index.ts",
      "apps/mobile/src/api/client.ts",
      "apps/mobile/app/(tabs)/account.tsx",
      "apps/mobile/app/(tabs)/credits.tsx",
      "apps/mobile/app/(tabs)/jobs.tsx",
    ],
  },
  {
    app: "WordGeni",
    root: "apps/WordGeni",
    proofRegister: "apps/WordGeni/docs/wordgeni-local-route-auth-proof-register.json",
    apiDirs: ["apps/api/src/routes", "apps/web/src/app/api"],
    clientDirs: ["apps/web/src/app/(dashboard)", "apps/web/src/app/account"],
    requiredFiles: [
      "apps/api/src/routes/auth.ts",
      "apps/api/src/routes/workspace.ts",
      "apps/api/src/routes/projects.ts",
      "apps/api/src/routes/sources.ts",
      "apps/api/src/routes/ai.ts",
      "apps/api/src/routes/billing.ts",
      "apps/api/src/routes/exports.ts",
      "apps/api/src/routes/stripe-webhook.ts",
      "apps/web/src/app/api/[...path]/route.ts",
    ],
  },
  {
    app: "RatAiFy",
    root: "apps/RatAiFy",
    proofRegister: "apps/RatAiFy/docs/rataify-local-workspace-auth-proof-register.json",
    apiDirs: ["server/routes"],
    clientDirs: ["client/src/pages", "client/src/components"],
    requiredFiles: [
      "server/routes/auth.ts",
      "server/routes/billing.ts",
      "server/routes/connected-apps.ts",
      "server/routes/control-plane.ts",
      "server/routes/orgs.ts",
      "server/routes/sites.ts",
      "server/routes/site-scans.ts",
      "server/routes/api-keys.ts",
      "client/src/pages/account-security.tsx",
      "client/src/pages/account-billing.tsx",
    ],
  },
  {
    app: "AudAix",
    root: "apps/AudAix",
    proofRegister: "apps/AudAix/docs/audaix-local-dashboard-auth-api-proof-register.json",
    apiDirs: ["src/routes", "src/security-scanner/routes", "src/ucl"],
    clientDirs: ["dashboard/src/api", "dashboard/src/pages", "dashboard/src/features"],
    requiredFiles: [
      "src/routes/auth-session-routes.ts",
      "src/routes/workspace-routes.ts",
      "src/routes/site-routes.ts",
      "src/routes/stripe-billing-routes.ts",
      "src/routes/xflow-routes.ts",
      "src/routes/verixet-routes.ts",
      "src/routes/rataify-routes.ts",
      "src/security-scanner/routes/security-scan-routes.ts",
      "dashboard/src/api/client.ts",
      "dashboard/src/api/workspaces.ts",
    ],
  },
  {
    app: "Verixet",
    root: "apps/Verixet",
    proofRegister: "apps/Verixet/docs/verixet-local-dashboard-auth-billing-proof-register.json",
    apiDirs: ["src/app/api", "src/app/auth", "src/app/checkout"],
    clientDirs: ["src/app/dashboard", "src/app/account", "src/app/billing", "src/components/dashboard"],
    requiredFiles: [
      "src/app/api/auth/sign-in/route.ts",
      "src/app/api/dashboard/login/route.ts",
      "src/app/api/dashboard/billing/overview/route.ts",
      "src/app/api/dashboard/billing/stripe-connection/route.ts",
      "src/app/api/platform/v1/entitlements/route.ts",
      "src/app/api/webhooks/stripe/route.ts",
      "src/app/api/v1/connected-apps/link/route.ts",
      "src/app/api/v1/control-plane/config/route.ts",
      "src/app/api/dashboard/security/status/route.ts",
      "src/app/api/dashboard/webhooks/endpoints/route.ts",
    ],
  },
];

const unsafeUserFacingPatterns = [
  /\bbearer token\b/i,
  /\braw token\b/i,
  /\bapi secret\b/i,
  /\bsecret available\b/i,
  /\bstored key\b/i,
  /\bclient secret\b/i,
  /\bwebhook secret\b/i,
  /\bprivate key\b/i,
  /\bpayment secret\b/i,
  /\bconnection string\b/i,
  /\bauthorization header\b/i,
  /\braw cookie\b/i,
  /\braw session\b/i,
  /\braw provider error body\b/i,
  /\bstack trace\b/i,
  /\braw correlation id\b/i,
  /\bprovider[- ]verified\b/i,
  /\bconnected and synced\b/i,
  /\bproduction ready\b/i,
];

const unsafeResponseKeyPatterns = [
  /["'](?:access_token|refresh_token|id_token|raw_token|bearer_token)["']\s*:/i,
  /["'](?:api_key|private_key|client_secret|webhook_secret|payment_secret)["']\s*:/i,
  /["'](?:password|password_hash|secret|secret_key)["']\s*:/i,
  /["'](?:STRIPE_SECRET_KEY|DATABASE_URL)["']\s*:/,
  /["'](?:connection_string|authorization_header|raw_cookie|raw_session_value)["']\s*:/i,
  /["'](?:provider_credential_payload|raw_provider_error_body|stack_trace)["']\s*:/i,
  /["'](?:raw_correlation_id)["']\s*:/i,
];

const unsafeValuePatterns = [
  /\bsk_(?:live|test)_[A-Za-z0-9]{8,}\b/i,
  /\bpk_(?:live|test)_[A-Za-z0-9]{8,}\b/i,
  /\bBearer\s+[A-Za-z0-9._-]{12,}\b/i,
  /\bpostgres(?:ql)?:\/\/[^"'\s]+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
];

const proofPathUnsafePatterns = [
  /https:\/\/(?:www\.)?(?:crevux|wordgeni|rataify|audaix|verixet|xflowx)\.com\b/i,
  /https:\/\/api\.openai\.com\b/i,
  /https:\/\/(?:api\.)?stripe\.com\b/i,
  /https:\/\/[^"'\s]*supabase\.co\b/i,
  /https:\/\/[^"'\s]*railway\.(?:app|com)\b/i,
  /https:\/\/[^"'\s]*vercel\.app\b/i,
  /\bprovider verified\b/i,
  /\bbilling verified\b/i,
  /\bdeployment verified\b/i,
  /\brailway\.app\b/i,
  /\bstaging\.[a-z0-9.-]+\b/i,
  /\bproduction smoke passed\b/i,
];

const responseMarkers = [
  "json(",
  "NextResponse.json",
  "Response.json",
  "reply.send",
  "reply.code",
  "res.json",
  "sendJson",
  "okJson",
  "errorEnvelope",
];

const failures = [];
const evidence = {
  proof: "workspace-five-app-api-redaction",
  localOnly: true,
  generatedAt: new Date().toISOString(),
  apps: [],
  totals: {
    apiFiles: 0,
    clientFiles: 0,
    responseSnippetsScanned: 0,
    unsafeFindings: 0,
  },
};

function fail(message) {
  failures.push(message);
}

function abs(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(abs(relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(abs(relativePath));
}

function requireFile(relativePath) {
  if (!exists(relativePath)) fail(`missing file: ${relativePath}`);
}

function walk(relativeDir, predicate, out = []) {
  const dir = abs(relativeDir);
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    const relativePath = path.relative(workspaceRoot, full).replaceAll("\\", "/");
    if (stat.isDirectory()) {
      if (!relativePath.includes("node_modules") && !relativePath.includes(".next") && !relativePath.includes("dist")) {
        walk(relativePath, predicate, out);
      }
    } else if (predicate(relativePath)) {
      out.push(relativePath);
    }
  }
  return out;
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function redactPattern(pattern) {
  return String(pattern).replaceAll("\\b", "");
}

function scanValueLeaks(text, label, findings) {
  for (const pattern of unsafeValuePatterns) {
    const match = text.match(pattern);
    if (match) {
      findings.push({ label, line: lineForOffset(text, match.index ?? 0), pattern: redactPattern(pattern) });
    }
  }
}

function responseSnippets(text) {
  const snippets = [];
  for (const marker of responseMarkers) {
    let index = text.indexOf(marker);
    while (index !== -1) {
      snippets.push({ marker, index, text: text.slice(index, index + 900) });
      index = text.indexOf(marker, index + marker.length);
    }
  }
  return snippets;
}

function classifyFile(file) {
  const lower = file.toLowerCase();
  if (/webhook|billing|stripe|checkout|payment|subscription|invoice/.test(lower)) return "billing-proof-needed";
  if (/entitlement|usage|meter|plan|guard/.test(lower)) return "entitlement-proof-needed";
  if (/openai|genie|copilot|ai|voice/.test(lower)) return "ai-provider-proof-needed";
  if (/scan|audit|lighthouse|crawler/.test(lower)) return lower.includes("audit") ? "audit-provider-proof-needed" : "scan-provider-proof-needed";
  if (/audio|tts|voice/.test(lower)) return "audio-provider-proof-needed";
  if (/deploy|ready|health|railway|production/.test(lower)) return "deployment-proof-needed";
  if (/xflow|rataify|audaix|verixet|ucl|connected|integration|provider|control-plane/.test(lower)) return "provider-proof-needed";
  if (/auth|session|security|account|workspace|org|settings/.test(lower)) return "auth-required-not-exercised";
  return "locally-static-redaction-proved";
}

function routeMethodCount(text) {
  const patterns = [
    /\bapp\.(?:get|post|put|patch|delete)\s*\(/g,
    /\brouter\.(?:get|post|put|patch|delete)\s*\(/g,
    /\bexport\s+(?:async\s+)?(?:function|const)\s+(?:GET|POST|PUT|PATCH|DELETE)\b/g,
  ];
  return patterns.reduce((count, pattern) => count + Array.from(text.matchAll(pattern)).length, 0);
}

for (const app of apps) {
  const appEvidence = {
    app: app.app,
    apiFiles: 0,
    clientFiles: 0,
    routeMethods: 0,
    responseSnippetsScanned: 0,
    classifications: {},
    findings: [],
  };

  requireFile(app.proofRegister);
  for (const file of app.requiredFiles) requireFile(`${app.root}/${file}`);

  const proofText = read(app.proofRegister);
  for (const pattern of proofPathUnsafePatterns) {
    if (pattern.test(proofText)) fail(`${app.app} proof register contains unsafe proof-path wording: ${redactPattern(pattern)}`);
  }

  const apiFiles = app.apiDirs.flatMap((dir) =>
    walk(`${app.root}/${dir}`, (file) => /\.(ts|tsx|js|mjs)$/.test(file) && !file.includes(".test.")),
  );
  const clientFiles = app.clientDirs.flatMap((dir) =>
    walk(`${app.root}/${dir}`, (file) => /\.(ts|tsx|js|mjs)$/.test(file) && !file.includes(".test.")),
  );

  appEvidence.apiFiles = apiFiles.length;
  appEvidence.clientFiles = clientFiles.length;
  evidence.totals.apiFiles += apiFiles.length;
  evidence.totals.clientFiles += clientFiles.length;

  for (const file of apiFiles) {
    const text = read(file);
    appEvidence.routeMethods += routeMethodCount(text);
    const classification = classifyFile(file);
    appEvidence.classifications[classification] = (appEvidence.classifications[classification] ?? 0) + 1;
    scanValueLeaks(text, file, appEvidence.findings);

    for (const snippet of responseSnippets(text)) {
      appEvidence.responseSnippetsScanned += 1;
      for (const pattern of unsafeResponseKeyPatterns) {
        if (pattern.test(snippet.text)) {
          appEvidence.findings.push({
            label: file,
            line: lineForOffset(text, snippet.index),
            marker: snippet.marker,
            pattern: redactPattern(pattern),
          });
        }
      }
    }
  }

  for (const file of clientFiles) {
    const text = read(file);
    scanValueLeaks(text, file, appEvidence.findings);
    for (const pattern of unsafeUserFacingPatterns) {
      const match = text.match(pattern);
      if (match) {
        appEvidence.findings.push({
          label: file,
          line: lineForOffset(text, match.index ?? 0),
          pattern: redactPattern(pattern),
        });
      }
    }
  }

  evidence.totals.responseSnippetsScanned += appEvidence.responseSnippetsScanned;
  evidence.totals.unsafeFindings += appEvidence.findings.length;
  if (appEvidence.apiFiles === 0) fail(`${app.app} API file inventory is empty`);
  if (appEvidence.responseSnippetsScanned === 0) fail(`${app.app} response snippet inventory is empty`);
  if (appEvidence.findings.length > 0) {
    for (const finding of appEvidence.findings.slice(0, 20)) {
      fail(`${app.app} unsafe redaction finding in ${finding.label}:${finding.line} (${finding.pattern})`);
    }
    if (appEvidence.findings.length > 20) fail(`${app.app} has ${appEvidence.findings.length - 20} additional unsafe redaction findings`);
  }

  evidence.apps.push(appEvidence);
}

const registerPath = "docs/workspace-five-app-api-redaction-proof-register.json";
const docPath = "docs/workspace-five-app-api-redaction-proof.md";
requireFile(registerPath);
requireFile(docPath);

for (const proofFile of [registerPath, docPath]) {
  const proofText = read(proofFile);
  for (const pattern of proofPathUnsafePatterns) {
    if (pattern.test(proofText)) fail(`${proofFile} contains unsafe proof-path wording: ${redactPattern(pattern)}`);
  }
}

const register = JSON.parse(read(registerPath));
if (!Array.isArray(register.entries)) fail("workspace API redaction register must contain entries array");
for (const entry of register.entries ?? []) {
  if (!allowedClassifications.has(entry.classification)) fail(`unknown register classification for ${entry.id}: ${entry.classification}`);
  if (entry.localOnly !== true) fail(`register entry must be localOnly=true: ${entry.id}`);
}
for (const app of apps) {
  if (!register.entries?.some((entry) => entry.app === app.app)) fail(`register missing entries for ${app.app}`);
}

const evidencePath = abs("docs/workspace-five-app-api-redaction-evidence.json");
mkdirSync(path.dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

if (failures.length > 0) {
  console.error("Workspace five-app API redaction verifier failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace five-app API redaction verifier passed.");
console.log(`apiFiles=${evidence.totals.apiFiles}`);
console.log(`clientFiles=${evidence.totals.clientFiles}`);
console.log(`responseSnippetsScanned=${evidence.totals.responseSnippetsScanned}`);
console.log(`evidence=docs/workspace-five-app-api-redaction-evidence.json`);
