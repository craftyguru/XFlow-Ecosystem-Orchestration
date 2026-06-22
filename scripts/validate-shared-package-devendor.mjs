#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const removedPackageDirs = [
  "apps/RatAiFy/vendor/ecosystem-assistant",
  "apps/RatAiFy/vendor/ecosystem-assistant-ui",
  "apps/RatAiFy/packages/ecosystem-assistant",
  "apps/RatAiFy/packages/ecosystem-assistant-ui",
  "apps/RatAiFy/packages/ecosystem-showcase",
  "apps/Verixet/vendor/ecosystem-assistant",
  "apps/Verixet/vendor/ecosystem-assistant-ui",
  "apps/AudAix/dashboard/vendor/ecosystem-assistant",
  "apps/AudAix/dashboard/vendor/ecosystem-assistant-ui",
  "apps/AudAix/packages/ecosystem-assistant",
  "apps/AudAix/packages/ecosystem-assistant-ui",
  "apps/AudAix/packages/ecosystem-showcase",
  "apps/CreVux/packages/ecosystem-assistant",
  "apps/CreVux/packages/ecosystem-assistant-ui",
];

const expectedDependencyTargets = new Map([
  ["apps/RatAiFy/package.json", {
    "@xflow-ecosystem/ecosystem-assistant": "file:../../packages/ecosystem-assistant",
    "@xflow-ecosystem/ecosystem-assistant-ui": "file:../../packages/ecosystem-assistant-ui",
    "@xflow-ecosystem/ecosystem-showcase": "file:../../packages/ecosystem-showcase",
  }],
  ["apps/Verixet/package.json", {
    "@xflow-ecosystem/ecosystem-assistant": "file:../../packages/ecosystem-assistant",
    "@xflow-ecosystem/ecosystem-assistant-ui": "file:../../packages/ecosystem-assistant-ui",
  }],
  ["apps/AudAix/dashboard/package.json", {
    "@xflow-ecosystem/ecosystem-assistant": "file:../../../packages/ecosystem-assistant",
    "@xflow-ecosystem/ecosystem-assistant-ui": "file:../../../packages/ecosystem-assistant-ui",
    "@xflow-ecosystem/ecosystem-showcase": "file:../../../packages/ecosystem-showcase",
  }],
  ["apps/CreVux/artifacts/image-gen/package.json", {
    "@xflow-ecosystem/ecosystem-assistant-ui": "file:../../../../packages/ecosystem-assistant-ui",
  }],
]);

const failures = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

for (const relativePath of removedPackageDirs) {
  if (fs.existsSync(path.join(rootDir, relativePath))) {
    failures.push(`Vendored package directory still exists: ${relativePath}`);
  }
}

for (const [relativePath, expectedDeps] of expectedDependencyTargets) {
  const pkg = readJson(relativePath);
  for (const [depName, expectedTarget] of Object.entries(expectedDeps)) {
    const actual = pkg.dependencies?.[depName];
    if (actual !== expectedTarget) {
      failures.push(`${relativePath} ${depName} should be ${expectedTarget}, got ${actual ?? "missing"}`);
    }
  }
}

console.log("Shared package de-vendor validation");
console.log("===================================");
console.log(`Removed dirs checked: ${removedPackageDirs.length}`);
console.log(`Consumer manifests checked: ${expectedDependencyTargets.size}`);

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`- ${failure}`);
  console.log("\nResult: FAIL");
  process.exit(1);
}

console.log("\nResult: PASS");
