import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contractsDir = path.join(rootDir, "ecosystem-contracts");
const generatedPackageDir = path.join(rootDir, "packages", "ecosystem-contracts");
const generatedIndexPath = path.join(generatedPackageDir, "src", "index.ts");

const files = {
  apps: "apps.json",
  env: "env-contract.json",
  routes: "routes.json",
  tokenTypes: "token-types.json",
};

const errors = [];
const warnings = [];

function readJson(name) {
  const filePath = path.join(contractsDir, files[name]);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Failed to read ${files[name]}: ${error.message}`);
    return null;
  }
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const appsContract = readJson("apps");
const envContract = readJson("env");
const routesContract = readJson("routes");
const tokensContract = readJson("tokenTypes");

if (!appsContract || !envContract || !routesContract || !tokensContract) {
  printReport();
  process.exit(1);
}

const apps = Array.isArray(appsContract.apps) ? appsContract.apps : [];
const envRows = Array.isArray(envContract.env) ? envContract.env : [];
const routes = Array.isArray(routesContract.routes) ? routesContract.routes : [];
const tokenTypes = Array.isArray(tokensContract.tokenTypes) ? tokensContract.tokenTypes : [];

if (apps.length === 0) fail("apps.json must contain a non-empty apps array.");
const expectedCanonicalSlugs = ["xflow", "verixet", "audaix", "rataify", "wordgeni", "crevux"];
if (!Array.isArray(appsContract.canonicalSlugs)) fail("apps.json must declare canonicalSlugs.");
if (appsContract.canonicalSlugs.length !== 6) {
  fail(`apps.json canonicalSlugs must contain exactly 6 ecosystem products, found ${appsContract.canonicalSlugs.length}.`);
}
if (apps.length !== 6) fail(`apps.json apps must contain exactly 6 ecosystem products, found ${apps.length}.`);
for (const slug of expectedCanonicalSlugs) {
  if (!appsContract.canonicalSlugs.includes(slug)) fail(`apps.json canonicalSlugs missing ${slug}.`);
}
if (apps.some((app) => app.slug === "pitstrike") || appsContract.canonicalSlugs.includes("pitstrike")) {
  fail("PitStrike must not appear in ecosystem product membership (canonicalSlugs/apps).");
}
const personal = Array.isArray(appsContract.externalPersonalApps) ? appsContract.externalPersonalApps : [];
const pitstrikePersonal = personal.find((app) => app.slug === "pitstrike");
if (!pitstrikePersonal || pitstrikePersonal.ecosystemProduct !== false) {
  fail("apps.json must declare PitStrike as an externalPersonalApp with ecosystemProduct false.");
}
if (envRows.length === 0) fail("env-contract.json must contain a non-empty env array.");
if (routes.length === 0) fail("routes.json must contain a non-empty routes array.");
if (tokenTypes.length === 0) fail("token-types.json must contain a non-empty tokenTypes array.");

const appSlugs = new Set();
const tokenIds = new Set();

for (const app of apps) {
  if (!isNonEmptyString(app.slug)) fail("Every app must have a slug.");
  if (app.slug && app.slug !== app.slug.toLowerCase()) fail(`Canonical app slug must be lowercase: ${app.slug}`);
  if (appSlugs.has(app.slug)) fail(`Duplicate canonical app slug: ${app.slug}`);
  appSlugs.add(app.slug);

  for (const field of ["displayName", "folderName", "domain", "role"]) {
    if (!isNonEmptyString(app[field])) fail(`App ${app.slug || "<unknown>"} is missing ${field}.`);
  }

  for (const boolField of ["ownsIdentity", "ownsBilling", "ownsEntitlements", "ownsUsageMetering"]) {
    if (typeof app[boolField] !== "boolean") fail(`App ${app.slug || "<unknown>"} ${boolField} must be boolean.`);
  }

  if (!Array.isArray(app.dependsOn)) fail(`App ${app.slug || "<unknown>"} dependsOn must be an array.`);
  if (!Array.isArray(app.legacyAliases)) fail(`App ${app.slug || "<unknown>"} legacyAliases must be an array.`);
}

for (const app of apps) {
  for (const dependency of app.dependsOn || []) {
    if (!appSlugs.has(dependency)) fail(`App ${app.slug} depends on unknown app ${dependency}.`);
  }
}

for (const tokenType of tokenTypes) {
  if (!isNonEmptyString(tokenType.id)) fail("Every token type must have an id.");
  if (tokenType.id && tokenIds.has(tokenType.id)) fail(`Duplicate token type id: ${tokenType.id}`);
  tokenIds.add(tokenType.id);

  for (const field of ["owner", "allowedUse", "forbiddenUse", "exampleHeaderName", "rotationNotes"]) {
    if (!isNonEmptyString(tokenType[field])) fail(`Token type ${tokenType.id || "<unknown>"} is missing ${field}.`);
  }
  if (!Array.isArray(tokenType.allowedConsumers)) fail(`Token type ${tokenType.id || "<unknown>"} allowedConsumers must be an array.`);
  if (typeof tokenType.shouldBeAppScoped !== "boolean") fail(`Token type ${tokenType.id || "<unknown>"} shouldBeAppScoped must be boolean.`);
  if (typeof tokenType.shouldBeWorkspaceScoped !== "boolean") fail(`Token type ${tokenType.id || "<unknown>"} shouldBeWorkspaceScoped must be boolean.`);
}

const envKeys = new Map();
const allowedEnvironments = new Set(["local", "staging", "production", "all"]);

for (const row of envRows) {
  if (!appSlugs.has(row.app)) fail(`Env row ${row.name || "<unknown>"} references unknown app ${row.app}.`);
  if (!isNonEmptyString(row.name)) fail(`Env row for app ${row.app || "<unknown>"} is missing name.`);
  if (typeof row.required !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} required must be boolean.`);
  if (!allowedEnvironments.has(row.environment)) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} has invalid environment ${row.environment}.`);
  if (typeof row.secret !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} secret must be boolean.`);
  if (typeof row.safePlaceholderAllowed !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} safePlaceholderAllowed must be boolean.`);
  for (const field of ["purpose", "sourceOfTruth", "notes"]) {
    if (!isNonEmptyString(row[field])) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} is missing ${field}.`);
  }
  if (!Array.isArray(row.usedBy)) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} usedBy must be an array.`);

  const duplicateKey = `${row.app}:${row.name}:${row.environment}`;
  if (envKeys.has(duplicateKey) && row.alias !== true) {
    fail(`Duplicate env row for ${duplicateKey}. Mark true aliases with alias:true.`);
  }
  envKeys.set(duplicateKey, row);
}

const allowedAuthTypes = new Set(["public", "service", "ucl", "usage-ingest", "oauth-client", "oauth-user", "webhook", "none"]);
const uclRequiredHeaders = ["Authorization", "X-App-Slug", "X-Workspace-ID"];
const usageTokenType = tokenTypes.find((tokenType) => tokenType.id === "verixet_usage_ingest_token");

for (const route of routes) {
  if (!appSlugs.has(route.ownerApp)) fail(`Route ${route.path || "<unknown>"} references unknown ownerApp ${route.ownerApp}.`);
  if (!Array.isArray(route.consumerApps)) fail(`Route ${route.path || "<unknown>"} consumerApps must be an array.`);
  for (const consumer of route.consumerApps || []) {
    if (!appSlugs.has(consumer) && !["browser", "stripe"].includes(consumer)) {
      fail(`Route ${route.path || "<unknown>"} references unknown consumer app ${consumer}.`);
    }
  }
  for (const field of ["method", "path", "purpose", "authType", "responseEnvelope", "productionFailureMode", "notes"]) {
    if (!isNonEmptyString(route[field])) fail(`Route ${route.path || "<unknown>"} is missing ${field}.`);
  }
  if (!allowedAuthTypes.has(route.authType)) fail(`Route ${route.path || "<unknown>"} has unsupported authType ${route.authType}.`);
  if (!Array.isArray(route.requiredHeaders)) fail(`Route ${route.path || "<unknown>"} requiredHeaders must be an array.`);
  if (!Array.isArray(route.requiredBodyFields)) fail(`Route ${route.path || "<unknown>"} requiredBodyFields must be an array.`);

  if (route.tokenType !== null && route.tokenType !== undefined && !tokenIds.has(route.tokenType)) {
    fail(`Route ${route.path || "<unknown>"} references unknown tokenType ${route.tokenType}.`);
  }

  if (route.authType === "none" && route.public !== true) {
    fail(`Route ${route.path || "<unknown>"} claims authType none without public:true.`);
  }

  if (route.authType !== "public" && route.authType !== "none" && !route.tokenType) {
    fail(`Route ${route.path || "<unknown>"} authType ${route.authType} must specify tokenType.`);
  }

  if (route.authType === "public" && route.public !== true) {
    warn(`Route ${route.path || "<unknown>"} is public but does not explicitly set public:true.`);
  }

  if (route.authType === "ucl" || route.tokenType === "ucl_connection_token") {
    for (const header of uclRequiredHeaders) {
      if (!route.requiredHeaders.includes(header)) {
        fail(`UCL route ${route.path || "<unknown>"} must require ${header}.`);
      }
    }
  }

  if (route.authType === "usage-ingest" || route.tokenType === "verixet_usage_ingest_token") {
    if (route.tokenType !== "verixet_usage_ingest_token") {
      fail(`Usage route ${route.path || "<unknown>"} must use verixet_usage_ingest_token.`);
    }
    if (!usageTokenType?.shouldBeAppScoped) {
      fail("verixet_usage_ingest_token must be app-scoped.");
    }
    if (!route.requiredHeaders.includes("X-App-Slug")) {
      fail(`Usage route ${route.path || "<unknown>"} must require X-App-Slug.`);
    }
  }
}

validateGeneratedContractPackage();

printReport();

if (errors.length > 0) {
  process.exit(1);
}

function printReport() {
  console.log("Ecosystem contract validation");
  console.log("==============================");
  console.log(`Apps: ${apps.length}`);
  console.log(`Env rows: ${envRows.length}`);
  console.log(`Routes: ${routes.length}`);
  console.log(`Token types: ${tokenTypes.length}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const message of warnings) console.log(`- ${message}`);
  }

  if (errors.length > 0) {
    console.log("\nFailures:");
    for (const message of errors) console.log(`- ${message}`);
    console.log("\nResult: FAIL");
  } else {
    console.log("\nResult: PASS");
  }
}

function validateGeneratedContractPackage() {
  const packageJsonPath = path.join(generatedPackageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fail("Generated contract package is missing packages/ecosystem-contracts/package.json.");
    return;
  }
  if (!fs.existsSync(generatedIndexPath)) {
    fail("Generated contract package is missing packages/ecosystem-contracts/src/index.ts.");
    return;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    fail(`Generated contract package package.json is invalid JSON: ${error.message}`);
    return;
  }

  if (packageJson.name !== "@xflow-ecosystem/contracts") {
    fail(`Generated contract package has unexpected name: ${packageJson.name}`);
  }

  const generatedSource = fs.readFileSync(generatedIndexPath, "utf8");
  if (!generatedSource.includes("GENERATED FILE")) {
    fail("Generated contract package index.ts is missing the generated-file marker.");
  }

  for (const slug of appSlugs) {
    if (!generatedSource.includes(JSON.stringify(slug))) {
      fail(`Generated contract package index.ts is missing canonical app slug ${slug}.`);
    }
  }

  for (const tokenId of tokenIds) {
    if (!generatedSource.includes(JSON.stringify(tokenId))) {
      fail(`Generated contract package index.ts is missing token type ${tokenId}.`);
    }
  }
}
