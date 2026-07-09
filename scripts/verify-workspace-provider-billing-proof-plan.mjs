import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");

const apps = [
  {
    app: "XFlow",
    packageJson: "apps/XFlow/package.json",
    expectedExternalScripts: [
      "smoke:production",
      "proof:verixet",
      "ops:verify-stripe-billing",
      "proof:read-only-provider",
      "proof:staged-smoke:approved",
      "add-bearer-connection",
      "set-railway-deployment-credential",
    ],
  },
  {
    app: "CreVux",
    packageJson: "apps/CreVux/package.json",
    expectedExternalScripts: [
      "audit:deploy-parity",
      "verify:deploy-parity",
      "verify:railway",
      "smoke:stripe-test",
      "stripe:webhook:setup",
      "stripe:webhook:verify",
    ],
  },
  {
    app: "WordGeni",
    packageJson: "apps/WordGeni/package.json",
    expectedExternalScripts: [
      "validate:deploy",
      "validate:production-proof",
      "live:verify",
      "smoke:live",
      "stripe:proof",
      "audit:env",
    ],
  },
  {
    app: "RatAiFy",
    packageJson: "apps/RatAiFy/package.json",
    expectedExternalScripts: [
      "verify:live-seo",
      "verify:control-plane",
      "proof:control-plane",
      "preflight:staging-proof",
      "bootstrap:staging-proof-fixtures",
      "verify:production-release",
    ],
  },
  {
    app: "AudAix",
    packageJson: "apps/AudAix/package.json",
    expectedExternalScripts: [
      "validate:production-env",
      "verify:production",
      "smoke:live",
      "preflight:superadmin:staging",
      "verify:supabase",
      "bootstrap:supabase",
      "proof:publish-ecosystem-audit-summary",
    ],
  },
  {
    app: "Verixet",
    packageJson: "apps/Verixet/package.json",
    expectedExternalScripts: [
      "verify:post-deploy-smoke",
      "smoke:live",
      "validate:staging",
      "preflight:superadmin-staging",
      "billing:audit-stripe",
      "billing:metadata-patch:execute",
      "billing:create-missing-products:execute",
      "stripe:catalog:sync",
    ],
  },
];

const allowedClassifications = new Set([
  "provider-proof-planned",
  "billing-proof-planned",
  "entitlement-proof-planned",
  "deployment-proof-planned",
  "oauth-connectivity-proof-planned",
  "ai-provider-proof-planned",
  "audit-provider-proof-planned",
  "scan-audit-audio-ai-proof-planned",
  "mutation-proof-not-executed",
  "not-applicable",
]);

const forbiddenPlanClaims = [
  /\bprovider verified\b/i,
  /\bbilling verified\b/i,
  /\bdeployment verified\b/i,
  /\bproduction ready\b/i,
  /\bstaging passed\b/i,
  /\bstripe proof passed\b/i,
  /\boauth proof passed\b/i,
  /\bmutation success proved\b/i,
];

const failures = [];
const evidence = {
  proof: "workspace-provider-billing-proof-plan",
  localOnly: true,
  apps: [],
  totals: { externalScriptsClassified: 0 },
};

function abs(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(abs(relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(abs(relativePath))) failures.push(`missing file: ${relativePath}`);
}

function assertNoRuntimeCapabilities() {
  const source = read("scripts/verify-workspace-provider-billing-proof-plan.mjs");
  const forbidden = [
    /\bfetch\s*\(/,
    /\bchild_process\b/,
    /\bhttps?\.(?:request|get)\s*\(/,
    /\bnet\.connect\s*\(/,
    /\bWebSocket\s*\(/,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(source)) failures.push(`planning verifier must remain static-only: ${String(pattern)}`);
  }
}

assertNoRuntimeCapabilities();

for (const app of apps) {
  requireFile(app.packageJson);
  if (!existsSync(abs(app.packageJson))) continue;
  const pkg = JSON.parse(read(app.packageJson));
  const scripts = pkg.scripts ?? {};
  const missing = app.expectedExternalScripts.filter((name) => !scripts[name]);
  if (missing.length) failures.push(`${app.app} missing expected external-proof script classification: ${missing.join(", ")}`);
  evidence.apps.push({
    app: app.app,
    externalScriptsClassified: app.expectedExternalScripts.length - missing.length,
    expectedExternalScripts: app.expectedExternalScripts,
  });
  evidence.totals.externalScriptsClassified += app.expectedExternalScripts.length - missing.length;
}

const docPath = "docs/workspace-provider-billing-proof-plan.md";
const registerPath = "docs/workspace-provider-billing-proof-plan-register.json";
requireFile(docPath);
requireFile(registerPath);

if (existsSync(abs(docPath))) {
  const doc = read(docPath);
  for (const pattern of forbiddenPlanClaims) {
    if (pattern.test(doc)) failures.push(`proof plan doc contains executed-proof claim: ${String(pattern)}`);
  }
}

if (existsSync(abs(registerPath))) {
  const register = JSON.parse(read(registerPath));
  if (register.localOnly !== true) failures.push("proof plan register must be localOnly=true");
  if (register.providerProof !== false) failures.push("proof plan register must declare providerProof=false");
  if (register.billingProof !== false) failures.push("proof plan register must declare billingProof=false");
  if (register.deploymentProof !== false) failures.push("proof plan register must declare deploymentProof=false");
  if (register.mutationProof !== false) failures.push("proof plan register must declare mutationProof=false");
  for (const entry of register.entries ?? []) {
    if (!allowedClassifications.has(entry.classification)) failures.push(`unknown classification for ${entry.id}`);
    if (entry.localOnly !== true) failures.push(`register entry must be localOnly=true: ${entry.id}`);
    if (!entry.stopCondition) failures.push(`register entry missing stopCondition: ${entry.id}`);
  }
  for (const app of apps) {
    if (!register.entries?.some((entry) => entry.app === app.app)) failures.push(`register missing app entry: ${app.app}`);
  }
}

if (failures.length) {
  console.error("Workspace provider/billing proof plan verifier failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace provider/billing proof plan verifier passed.");
console.log(`externalScriptsClassified=${evidence.totals.externalScriptsClassified}`);
