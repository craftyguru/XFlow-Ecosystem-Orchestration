#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const packages = [
  "ecosystem-assistant",
  "ecosystem-assistant-ui",
  "ecosystem-contracts",
  "ecosystem-showcase",
  "ecosystem-supabase",
];

const failures = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertFile(label, filePath) {
  if (!fs.existsSync(filePath)) failures.push(`${label} missing: ${path.relative(rootDir, filePath)}`);
}

function checkExportTarget(packageDir, packageName, exportName, target) {
  if (!target || typeof target !== "object") {
    failures.push(`${packageName} export ${exportName} must use conditional object exports.`);
    return;
  }

  const importPath = target.import ?? target.default;
  const typesPath = target.types;
  if (!importPath || !String(importPath).startsWith("./dist/")) {
    failures.push(`${packageName} export ${exportName} must resolve runtime code from dist.`);
  } else {
    assertFile(`${packageName} export ${exportName}`, path.join(packageDir, importPath));
  }

  if (!typesPath || !String(typesPath).startsWith("./dist/")) {
    failures.push(`${packageName} export ${exportName} must resolve types from dist.`);
  } else {
    assertFile(`${packageName} export ${exportName} types`, path.join(packageDir, typesPath));
  }
}

for (const packageFolder of packages) {
  const packageDir = path.join(rootDir, "packages", packageFolder);
  const packageJsonPath = path.join(packageDir, "package.json");
  const pkg = readJson(packageJsonPath);

  if (!pkg.name?.startsWith("@xflow-ecosystem/")) {
    failures.push(`${packageFolder} must use the @xflow-ecosystem scope.`);
  }
  if (pkg.private !== true) {
    failures.push(`${pkg.name} must stay private until publish credentials and version policy are explicit.`);
  }
  if (!pkg.scripts?.build || !pkg.scripts?.typecheck) {
    failures.push(`${pkg.name} must expose build and typecheck scripts.`);
  }
  if (pkg.sideEffects !== false) {
    failures.push(`${pkg.name} must declare sideEffects:false for package isolation.`);
  }
  if (!Array.isArray(pkg.files) || !pkg.files.includes("dist")) {
    failures.push(`${pkg.name} must publish only explicit files including dist.`);
  }
  if (!pkg.main?.startsWith("./dist/") || !pkg.types?.startsWith("./dist/")) {
    failures.push(`${pkg.name} main/types must point at dist outputs.`);
  }

  for (const [exportName, target] of Object.entries(pkg.exports ?? {})) {
    checkExportTarget(packageDir, pkg.name, exportName, target);
  }
}

console.log("Shared package release-unit validation");
console.log("======================================");
console.log(`Checked packages: ${packages.map((name) => `packages/${name}`).join(", ")}`);

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`- ${failure}`);
  console.log("\nResult: FAIL");
  process.exit(1);
}

console.log("\nResult: PASS");
