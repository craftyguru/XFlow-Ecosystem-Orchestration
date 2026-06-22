import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const scanRoots = [
  "apps/XFlow/src/components/showcase",
  "apps/Verixet/src/components/marketing",
  "apps/WordGeni/apps/web/src/components",
  "apps/RatAiFy/shared/seoMeta.ts",
  "apps/RatAiFy/shared/seoJsonLd.ts",
  "apps/RatAiFy/client/src/pages/marketing",
  "apps/RatAiFy/client/src/components/marketing/trust",
  "apps/RatAiFy/client/src/components/marketing/rataify",
  "apps/AudAix/dashboard/src/components/navigation",
  "apps/AudAix/dashboard/src/content/lander",
  "apps/CreVux/artifacts/image-gen/src/components/landing",
  "apps/CreVux/artifacts/image-gen/src/pages",
  "apps/CreVux/artifacts/image-gen/src/components/DocumentHead.tsx",
  "apps/CreVux/artifacts/image-gen/src/config/emails.ts",
  "apps/CreVux/artifacts/image-gen/src/legal/legalPolicies.ts",
];

const ignoredPathParts = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  "output",
  "tmp",
];

const ignoredFiles = new Set([
  "pricingEntitlementMatrix.ts",
]);

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);
const forbiddenPattern = /RatAify|CreVux|CREVUX/g;

function shouldSkipPath(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  return ignoredPathParts.some((part) => normalized.includes(`/${part}/`)) || ignoredFiles.has(path.basename(filePath));
}

function collectFiles(target) {
  const absolute = path.join(repoRoot, target);
  const stats = statSync(absolute);
  if (stats.isFile()) {
    return sourceExtensions.has(path.extname(absolute)) && !shouldSkipPath(absolute) ? [absolute] : [];
  }

  const files = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const child = path.join(absolute, entry.name);
    if (shouldSkipPath(child)) continue;
    if (entry.isDirectory()) files.push(...collectFiles(path.relative(repoRoot, child)));
    if (entry.isFile() && sourceExtensions.has(path.extname(child))) files.push(child);
  }
  return files;
}

function isAllowedInternalToken(text, index, match) {
  const after = text[index + match.length] ?? "";
  const before = text[index - 1] ?? "";

  if (match === "CREVUX" && after === "_") return true;
  if (before === "/" || after === "/") return true;
  return false;
}

const violations = [];

for (const root of scanRoots) {
  for (const file of collectFiles(root)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      forbiddenPattern.lastIndex = 0;
      let match;
      while ((match = forbiddenPattern.exec(line)) !== null) {
        if (!isAllowedInternalToken(line, match.index, match[0])) {
          violations.push(`${path.relative(repoRoot, file)}:${lineIndex + 1}: ${match[0]}`);
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Forbidden public brand casing found:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Public brand casing audit passed.");
