import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const helperRoot = "packages/ecosystem-supabase";
const requiredHelperFiles = [
  "package.json",
  "tsconfig.json",
  "src/browser.ts",
  "src/server.ts",
  "src/service-role.server.ts",
  "src/core.ts",
  "src/env.ts",
  "src/types.ts",
  "src/index.ts",
];

const sharedEnvExampleFile = ".env.shared.example";
const requiredSharedEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const requiredHelperNames = [
  "createBrowserSupabaseClient",
  "createServerSupabaseClient",
  "createServiceSupabaseClient",
  "getCurrentUser",
  "getCurrentWorkspace",
  "requireWorkspaceMember",
  "requireWorkspaceAppAccess",
  "requireEntitlement",
  "recordUsageEvent",
  "writeAuditLog",
];

const envExampleContracts = [
  {
    app: "XFlow",
    file: "apps/XFlow/.env.example",
    publicVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  },
  {
    app: "Verixet",
    file: "apps/Verixet/.env.example",
    publicVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  },
  {
    app: "AudAiX",
    file: "apps/AudAix/.env.example",
    publicVars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  },
  {
    app: "Rataify",
    file: "apps/RatAiFy/.env.example",
    publicVars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  },
  {
    app: "WordGeni",
    file: "apps/WordGeni/.env.example",
    publicVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  },
  {
    app: "Crevux",
    file: "apps/CreVux/.env.example",
    publicVars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  },
];

const serverOnlyVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

for (const file of requiredHelperFiles) {
  const relativePath = path.join(helperRoot, file);
  if (!fs.existsSync(absolute(relativePath))) {
    errors.push(`Missing helper file: ${relativePath}`);
  }
}

if (!fs.existsSync(absolute(sharedEnvExampleFile))) {
  errors.push(`Missing shared local env example: ${sharedEnvExampleFile}`);
} else {
  const sharedEnvText = readText(sharedEnvExampleFile);
  for (const envVar of requiredSharedEnvVars) {
    if (!sharedEnvText.includes(`${envVar}=`)) {
      errors.push(`${sharedEnvExampleFile} missing ${envVar}`);
    }
  }

  const publicServiceRoleInSharedEnv = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\s*=/;
  if (publicServiceRoleInSharedEnv.test(sharedEnvText)) {
    errors.push(`${sharedEnvExampleFile} must not define public service-role env vars`);
  }

  const envExampleAssignments = sharedEnvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="));
  for (const line of envExampleAssignments) {
    const [key, ...valueParts] = line.split("=");
    if (requiredSharedEnvVars.includes(key.trim()) && valueParts.join("=").trim()) {
      errors.push(`${sharedEnvExampleFile} must contain empty example values only`);
      break;
    }
  }
}

if (!fs.existsSync(absolute(".gitignore"))) {
  errors.push("Missing root .gitignore with shared local env protections");
} else {
  const gitignoreText = readText(".gitignore");
  if (!/^\.env\.shared\.local$/m.test(gitignoreText)) {
    errors.push("Root .gitignore must ignore .env.shared.local");
  }
  if (!/^\.env\.\*\.local$/m.test(gitignoreText)) {
    errors.push("Root .gitignore must ignore .env.*.local");
  }
  if (/^\.env\.shared\.example$/m.test(gitignoreText)) {
    errors.push("Root .gitignore must not ignore .env.shared.example");
  }
}

if (fs.existsSync(absolute(path.join(helperRoot, "src", "index.ts")))) {
  const indexText = readText(path.join(helperRoot, "src", "index.ts"));
  if (indexText.includes("createServiceSupabaseClient") || indexText.includes("service-role.server")) {
    errors.push("Service-role helper must not be exported from packages/ecosystem-supabase/src/index.ts");
  }
}

if (fs.existsSync(absolute(path.join(helperRoot, "src", "service-role.server.ts")))) {
  const serviceText = readText(path.join(helperRoot, "src", "service-role.server.ts"));
  if (!serviceText.includes("createServiceSupabaseClient")) {
    errors.push("Service-role helper file is missing createServiceSupabaseClient");
  }
  if (!serviceText.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    errors.push("Service-role helper must read only the server-only SUPABASE_SERVICE_ROLE_KEY contract");
  }
  if (!serviceText.includes("window")) {
    errors.push("Service-role helper must include a browser-runtime guard");
  }
}

const helperSource = requiredHelperFiles
  .filter((file) => file.startsWith("src/") && fs.existsSync(absolute(path.join(helperRoot, file))))
  .map((file) => readText(path.join(helperRoot, file)))
  .join("\n");

for (const helperName of requiredHelperNames) {
  if (!helperSource.includes(helperName)) {
    errors.push(`Missing shared helper export/implementation: ${helperName}`);
  }
}

for (const contract of envExampleContracts) {
  if (!fs.existsSync(absolute(contract.file))) {
    errors.push(`Missing ${contract.app} env example: ${contract.file}`);
    continue;
  }

  const text = readText(contract.file);
  for (const publicVar of contract.publicVars) {
    if (!text.includes(publicVar)) {
      errors.push(`${contract.app} env example missing public Supabase var ${publicVar}`);
    }
  }
  for (const serverVar of serverOnlyVars) {
    if (!text.includes(serverVar)) {
      errors.push(`${contract.app} env example missing server-only Supabase var ${serverVar}`);
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
    if (isEnvFile(entry.name) || !textExtensions.has(path.extname(entry.name))) continue;
    onFile(fullPath);
  }
}

const publicServiceRolePattern = /\b(?:NEXT_PUBLIC|VITE)_[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\b/;
const serviceRoleImportPattern =
  /(?:createServiceSupabaseClient|@xflow-ecosystem\/supabase\/service-role\.server|["'][^"']*service-role\.server["'])/;
const serviceRoleEnvPattern = /\bSUPABASE_SERVICE_ROLE_KEY\b/;

for (const scanRoot of ["apps", "packages"]) {
  const scanPath = absolute(scanRoot);
  if (!fs.existsSync(scanPath)) continue;

  walk(scanPath, (filePath) => {
    const relativePath = path.relative(root, filePath);
    if (relativePath.replaceAll("\\", "/").startsWith("packages/ecosystem-supabase/src/service-role.server.ts")) return;

    const text = fs.readFileSync(filePath, "utf8");
    if (publicServiceRolePattern.test(text)) {
      errors.push(`Public service-role env reference found in ${relativePath}`);
    }

    if (isTestFile(relativePath)) return;

    const browserFile = isLikelyBrowserFile(relativePath);
    if (browserFile && serviceRoleImportPattern.test(text)) {
      errors.push(`Service-role helper import/reference found in likely browser file ${relativePath}`);
    }
    if (browserFile && serviceRoleEnvPattern.test(text)) {
      errors.push(`Service-role env reference found in likely browser file ${relativePath}`);
    }
  });
}

if (errors.length > 0) {
  console.error("validate-supabase-phase2 failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("validate-supabase-phase2: ok");
