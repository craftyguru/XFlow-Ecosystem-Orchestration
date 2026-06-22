import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appsContract = JSON.parse(fs.readFileSync(path.join(rootDir, "ecosystem-contracts", "apps.json"), "utf8"));
const sourcePath = path.join(rootDir, "packages", "ecosystem-showcase", "src", "EcosystemShowcaseSection.tsx");
const declarationPath = path.join(rootDir, "packages", "ecosystem-showcase", "dist", "index.d.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const declaration = fs.existsSync(declarationPath) ? fs.readFileSync(declarationPath, "utf8") : "";

const expected = [...appsContract.canonicalSlugs].sort();
const slugMatches = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]).sort();
const typeMatch = source.match(/export type AppSlug = ([^;]+);/);
const typeSlugs = typeMatch
  ? [...typeMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort()
  : [];
const declarationTypeMatch = declaration.match(/export type AppSlug = ([^;]+);/);
const declarationTypeSlugs = declarationTypeMatch
  ? [...declarationTypeMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort()
  : [];

const failures = [];

function sameSet(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

if (!sameSet(slugMatches, expected)) {
  failures.push(`Showcase APPS slugs ${JSON.stringify(slugMatches)} do not match canonical slugs ${JSON.stringify(expected)}.`);
}

if (!sameSet(typeSlugs, expected)) {
  failures.push(`Showcase AppSlug union ${JSON.stringify(typeSlugs)} does not match canonical slugs ${JSON.stringify(expected)}.`);
}

if (!sameSet(declarationTypeSlugs, expected)) {
  failures.push(`Showcase dist AppSlug declaration ${JSON.stringify(declarationTypeSlugs)} does not match canonical slugs ${JSON.stringify(expected)}.`);
}

for (const slug of slugMatches) {
  if (slug !== slug.toLowerCase()) {
    failures.push(`Showcase slug is not lowercase: ${slug}`);
  }
}

if (source.includes('sourceApp = "xflowx"') || source.includes('fallback : "xflowx"')) {
  failures.push("Showcase still defaults sourceApp to legacy xflowx.");
}

console.log("Ecosystem showcase contract validation");
console.log("=======================================");
console.log(`Canonical slugs: ${expected.join(", ")}`);
console.log(`Showcase slugs: ${slugMatches.join(", ")}`);
console.log(`Declaration slugs: ${declarationTypeSlugs.join(", ")}`);

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`- ${failure}`);
  console.log("\nResult: FAIL");
  process.exit(1);
}

console.log("\nResult: PASS");
