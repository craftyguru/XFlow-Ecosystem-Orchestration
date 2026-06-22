import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const ignoredDirs = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "build",
  "node_modules",
  "supabase",
]);

const textExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
]);

const allowedServerSurfacePatterns = [
  /(?:^|[\\/])app[\\/].*[\\/]route\.[cm]?[jt]s$/i,
  /(?:^|[\\/])app[\\/].*[\\/]actions\.[cm]?[jt]s$/i,
  /(?:^|[\\/])server[\\/]/i,
  /(?:^|[\\/])scripts[\\/]/i,
  /(?:^|[\\/])tests?[\\/]/i,
  /(?:^|[\\/])__tests__[\\/]/i,
  /\.(test|spec)\.[cm]?[jt]sx?$/i,
  /\.server\.[cm]?[jt]sx?$/i,
  /(?:^|[\\/])src[\\/]lib[\\/].*[\\/][^\\/]+\.server\.[cm]?[jt]sx?$/i,
];

const likelyBrowserPathPatterns = [
  /(?:^|[\\/])client[\\/]/i,
  /(?:^|[\\/])components[\\/]/i,
  /(?:^|[\\/])context[\\/]/i,
  /(?:^|[\\/])hooks[\\/]/i,
  /(?:^|[\\/])pages[\\/]/i,
  /(?:^|[\\/])dashboard[\\/]src[\\/]/i,
  /(?:^|[\\/])apps[\\/]web[\\/]src[\\/]/i,
  /(?:^|[\\/])artifacts[\\/]image-gen[\\/]src[\\/]/i,
  /(?:^|[\\/])src[\\/]app[\\/]\(dashboard\)[\\/]/i,
  /(?:^|[\\/])src[\\/]app[\\/]\(marketing\)[\\/]/i,
  /(?:^|[\\/])src[\\/]app[\\/]\(auth\)[\\/]/i,
];

const forbiddenPatterns = [
  {
    name: "service-role helper",
    pattern: /(?:service-role\.server|createServiceSupabaseClient|SUPABASE_SERVICE_ROLE_KEY)/,
  },
  {
    name: "admin Supabase client",
    pattern: /(?:createAdminSupabaseClient|adminSupabase|supabaseAdmin|\/supabase\/admin|\\supabase\\admin)/,
  },
  {
    name: "server-only entitlement writer",
    pattern: /(?:writeEntitlement|upsertEntitlement|grantEntitlement|revokeEntitlement|entitlement-writer|entitlements\.server)/,
  },
  {
    name: "server-only Stripe helper",
    pattern: /(?:from\s+["'][^"']*(?:\/stripe\.server|\/billing\/stripe|\/billing\/ecosystem-billing|\/stripe\/webhook-process|\/stripe\/stripe-webhook)|require\(["'][^"']*(?:\/stripe\.server|\/billing\/stripe|\/billing\/ecosystem-billing|\/stripe\/webhook-process|\/stripe\/stripe-webhook))/,
  },
];

function isEnvFile(fileName) {
  return fileName === ".env" || fileName.startsWith(".env.");
}

function isAllowedServerSurface(relativePath) {
  return allowedServerSurfacePatterns.some((pattern) => pattern.test(relativePath));
}

function isLikelyBrowserPath(relativePath) {
  return likelyBrowserPathPatterns.some((pattern) => pattern.test(relativePath));
}

function hasUseClientDirective(text) {
  const firstStatements = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//") && !line.startsWith("/*"))
    .slice(0, 3);
  return firstStatements.some((line) => line === '"use client";' || line === "'use client';");
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath, onFile);
      continue;
    }
    if (!entry.isFile()) continue;
    if (isEnvFile(entry.name) || !textExtensions.has(path.extname(entry.name))) continue;
    onFile(fullPath);
  }
}

for (const scanRoot of ["apps", "packages"]) {
  const scanPath = path.join(root, scanRoot);
  if (!fs.existsSync(scanPath)) continue;

  walk(scanPath, (filePath) => {
    const relativePath = path.relative(root, filePath);
    const normalized = relativePath.replaceAll("\\", "/");
    const text = fs.readFileSync(filePath, "utf8");
    const browserSurface = hasUseClientDirective(text) || isLikelyBrowserPath(normalized);
    if (!browserSurface || isAllowedServerSurface(normalized)) return;

    for (const forbidden of forbiddenPatterns) {
      if (forbidden.pattern.test(text)) {
        errors.push(`${relativePath} imports or references forbidden ${forbidden.name}`);
      }
    }
  });
}

if (errors.length > 0) {
  console.error("validate-service-role-import-boundary failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-service-role-import-boundary: ok");
