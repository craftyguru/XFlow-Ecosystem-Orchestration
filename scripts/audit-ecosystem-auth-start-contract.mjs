import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = [
  "apps/XFlow/src",
  "apps/Verixet/src",
  "apps/RatAiFy/server",
  "apps/RatAiFy/src",
  "apps/AudAix/src",
  "apps/WordGeni/apps/web/src",
  "apps/CreVux/artifacts/api-server/src",
  "apps/CreVux/artifacts/image-gen/src",
];

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const ignoredSegments = new Set([
  "node_modules",
  "dist",
  ".next",
  "coverage",
  "test-results",
  "__snapshots__",
]);
const ignoredFilePatterns = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /tests?[\\/]/,
  /__tests__[\\/]/,
];

const forbiddenPatterns = [
  { name: "redirect_uri", pattern: /\bredirect_uri\b/ },
  { name: "return_to", pattern: /\breturn_to\b/ },
  { name: "callback returnTo", pattern: /\/auth\/callback/i },
  { name: "localhost", pattern: /\blocalhost\b|127\.0\.0\.1|0\.0\.0\.0/ },
  { name: "legacy app_slug", pattern: /\bapp_slug\b/ },
];

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredSegments.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
      continue;
    }
    if (!sourceExtensions.has(path.extname(entry.name))) continue;
    if (ignoredFilePatterns.some((pattern) => pattern.test(full))) continue;
    yield full;
  }
}

const findings = [];
for (const scanRoot of scanRoots) {
  for (const file of walk(path.join(root, scanRoot))) {
    const rel = path.relative(root, file).replaceAll(path.sep, "/");
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const hasXflowAuthStart =
        line.includes("xflowx.com/auth/start") ||
        line.includes('new URL("/auth/start"') ||
        line.includes("new URL('/auth/start'");
      if (!hasXflowAuthStart) continue;
      const inspectedText = line;
      for (const forbidden of forbiddenPatterns) {
        if (!forbidden.pattern.test(inspectedText)) continue;
        findings.push({
          file: rel,
          line: i + 1,
          reason: forbidden.name,
          excerpt: inspectedText.trim(),
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("auth-start-contract audit failed:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.reason} :: ${finding.excerpt}`);
  }
  process.exit(1);
}

console.log("auth-start-contract audit passed: XFlow /auth/start production sources avoid redirect_uri, return_to, /auth/callback, localhost, and app_slug.");
