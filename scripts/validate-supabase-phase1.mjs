import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredMigrations = [
  "001_core_schema.sql",
  "002_core_rls.sql",
  "010_xflow_schema.sql",
  "011_xflow_rls.sql",
  "020_verixet_schema.sql",
  "021_verixet_rls.sql",
  "030_audaix_schema.sql",
  "031_audaix_rls.sql",
  "040_rataify_schema.sql",
  "041_rataify_rls.sql",
  "050_wordgeni_schema.sql",
  "051_wordgeni_rls.sql",
  "060_crevux_schema.sql",
  "061_crevux_rls.sql",
  "090_storage_buckets.sql",
  "091_seed_ecosystem_apps.sql",
  "099_validation_checks.sql",
  "100_api_role_grants.sql",
];

const requiredDocs = [
  "docs/supabase-consolidation-audit.md",
  "docs/supabase-shared-db-architecture.md",
  "docs/supabase-migration-runbook.md",
  "docs/supabase-future-extraction-checklist.md",
  "docs/supabase-phase1-validation-report.md",
];

const requiredBuckets = [
  "xflow-artifacts",
  "verixet-billing-artifacts",
  "audaix-reports",
  "rataify-evidence",
  "wordgeni-exports",
  "crevux-assets",
];

const requiredSlugs = ["xflow", "verixet", "audaix", "rataify", "wordgeni", "crevux"];

const errors = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const migration of requiredMigrations) {
  const relativePath = path.join("supabase", "migrations", migration);
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing migration: ${relativePath}`);
  }
}

for (const doc of requiredDocs) {
  if (!fs.existsSync(path.join(root, doc))) {
    errors.push(`Missing document: ${doc}`);
  }
}

if (fs.existsSync(path.join(root, "supabase", "migrations", "090_storage_buckets.sql"))) {
  const storageSql = readText("supabase/migrations/090_storage_buckets.sql");
  for (const bucket of requiredBuckets) {
    if (!storageSql.includes(bucket)) {
      errors.push(`Storage migration is missing bucket ${bucket}`);
    }
  }
}

if (fs.existsSync(path.join(root, "supabase", "migrations", "091_seed_ecosystem_apps.sql"))) {
  const seedSql = readText("supabase/migrations/091_seed_ecosystem_apps.sql");
  for (const slug of requiredSlugs) {
    if (!seedSql.includes(`'${slug}'`)) {
      errors.push(`Ecosystem app seed is missing slug ${slug}`);
    }
  }
}

const ignoredDirs = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "build",
  "node_modules",
  "supabase",
  "docs",
]);

const ignoredFileNames = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
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

function isEnvFile(fileName) {
  return fileName === ".env" || fileName.startsWith(".env.");
}

function isTestFile(filePath) {
  return /(?:^|[\\/])(?:tests?|__tests__|e2e)[\\/]/i.test(filePath) || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(filePath);
}

function isLikelyBrowserFile(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  return (
    normalized.includes("/client/") ||
    normalized.includes("/dashboard/src/") ||
    normalized.includes("/apps/web/src/") ||
    normalized.includes("/artifacts/image-gen/src/") ||
    normalized.includes("/src/components/") ||
    normalized.includes("/src/pages/") ||
    normalized.includes("/src/context/") ||
    normalized.includes("/src/hooks/") ||
    normalized.includes("/src/app/(dashboard)/") ||
    normalized.includes("/src/app/(marketing)/") ||
    normalized.includes("/src/app/(auth)/")
  );
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath, onFile);
      continue;
    }
    if (!entry.isFile()) continue;
    if (ignoredFileNames.has(entry.name) || isEnvFile(entry.name)) continue;
    if (!textExtensions.has(path.extname(entry.name))) continue;
    onFile(fullPath);
  }
}

const publicServiceRolePattern = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\b/;
const serviceRoleReferencePattern = /\b(?:SUPABASE_SERVICE_ROLE_KEY|SUPABASE_STORAGE_SERVICE_KEY|SERVICE_ROLE_KEY)\b/;
const browserEnvServiceRolePattern =
  /(?:process\.env|import\.meta\.env)\.(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*/;

walk(path.join(root, "apps"), (filePath) => {
  const relativePath = path.relative(root, filePath);
  const text = fs.readFileSync(filePath, "utf8");

  if (publicServiceRolePattern.test(text) || browserEnvServiceRolePattern.test(text)) {
    errors.push(`Public service-role env reference found in ${relativePath}`);
  }

  if (!isTestFile(relativePath) && isLikelyBrowserFile(relativePath) && serviceRoleReferencePattern.test(text)) {
    errors.push(`Service-role key reference found in likely browser file ${relativePath}`);
  }
});

if (errors.length > 0) {
  console.error("validate-supabase-phase1 failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-supabase-phase1: ok");
