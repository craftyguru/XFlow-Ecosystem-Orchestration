#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputRoot = path.join("output", "supabase-backups", timestamp);

const apps = [
  {
    name: "Verixet",
    appDir: "apps/Verixet",
    storage: "verixet-billing-artifacts",
    envFiles: ["apps/Verixet/.env.local", "apps/Verixet/.env"],
  },
  {
    name: "XFlow",
    appDir: "apps/XFlow",
    storage: "xflow-artifacts",
    envFiles: ["apps/XFlow/.env.local", "apps/XFlow/.env"],
  },
  {
    name: "AudAiX",
    appDir: "apps/AudAix",
    storage: "audaix-reports",
    envFiles: ["apps/AudAix/.env.local", "apps/AudAix/.env"],
  },
  {
    name: "Rataify",
    appDir: "apps/RatAiFy",
    storage: "rataify-evidence",
    envFiles: ["apps/RatAiFy/.env.local", "apps/RatAiFy/.env"],
  },
  {
    name: "WordGeni",
    appDir: "apps/WordGeni",
    storage: "wordgeni-exports",
    envFiles: ["apps/WordGeni/.env.local", "apps/WordGeni/.env"],
  },
  {
    name: "Crevux",
    appDir: "apps/CreVux",
    storage: "crevux-assets",
    envFiles: [
      "apps/CreVux/.env.local",
      "apps/CreVux/.env",
      "apps/CreVux/artifacts/api-server/.env.local",
      "apps/CreVux/artifacts/api-server/.env",
    ],
  },
];

function readDotenv(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) return {};
  const env = {};
  for (const raw of fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function classifyHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return "local";
  if (host.includes("pooler.supabase.com") || host.includes("supabase.co")) return "Supabase";
  if (host.includes("railway") || host.includes("rlwy")) return "Railway";
  return "unknown";
}

function classifySafety(target, env) {
  const envValues = [env.NODE_ENV, env.VERCEL_ENV, env.RAILWAY_ENVIRONMENT, env.CREVUX_ENV, env.APP_ENV].filter(Boolean);
  const joined = envValues.join(" ").toLowerCase();
  if (joined.includes("production")) return "unsafe-production-marker";
  if (target?.hostClass === "local") return "safe-local";
  if (joined.includes("staging") || joined.includes("preview") || joined.includes("development") || joined.includes("local")) {
    return "staging-marker-present";
  }
  if (target?.hostClass === "Supabase") return "unknown-supabase-without-staging-marker";
  return "unknown";
}

function effectiveEnv(files) {
  const env = {};
  const source = {};
  for (const file of files) {
    const parsed = readDotenv(file);
    for (const [key, value] of Object.entries(parsed)) {
      env[key] = value;
      source[key] = file;
    }
  }
  return { env, source };
}

function describeUrl(value, source) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return {
      source,
      host: `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`,
      database: parsed.pathname.replace(/^\//, "") || "missing",
      username: parsed.username || "missing",
      hostClass: classifyHost(parsed.hostname),
    };
  } catch {
    return { source, host: "unparsable", database: "unparsable", username: "unparsable", hostClass: "unknown" };
  }
}

const plan = apps.map((app) => {
  const { env, source } = effectiveEnv(app.envFiles);
  const databaseTarget = describeUrl(env.DATABASE_URL, source.DATABASE_URL);
  const directTarget = describeUrl(env.DIRECT_DATABASE_URL, source.DIRECT_DATABASE_URL);
  const preferred = directTarget ?? databaseTarget;
  const safety = classifySafety(preferred, env);
  const appSlug = app.name.toLowerCase() === "rataify" ? "rataify" : app.name.toLowerCase();
  return {
    app: app.name,
    appDir: app.appDir,
    storageBucket: app.storage,
    databaseUrlPresent: Boolean(databaseTarget),
    directDatabaseUrlPresent: Boolean(directTarget),
    preferredTarget: preferred,
    environmentMarkers: {
      NODE_ENV: env.NODE_ENV ?? null,
      VERCEL_ENV: env.VERCEL_ENV ?? null,
      RAILWAY_ENVIRONMENT: env.RAILWAY_ENVIRONMENT ?? null,
      CREVUX_ENV: env.CREVUX_ENV ?? null,
      APP_ENV: env.APP_ENV ?? null,
    },
    safety,
    canRunExportHere: safety === "safe-local" || safety === "staging-marker-present",
    artifactDirectory: path.join(outputRoot, appSlug),
    suggestedCommands: {
      customDump: `pg_dump --format=custom --no-owner --no-acl --file \"${path.join(outputRoot, appSlug, `${appSlug}.dump`)}\" \"$DATABASE_URL\"`,
      schemaOnly: `pg_dump --schema-only --no-owner --no-acl --file \"${path.join(outputRoot, appSlug, `${appSlug}-schema.sql`)}\" \"$DATABASE_URL\"`,
      plainData: `pg_dump --data-only --inserts --no-owner --no-acl --file \"${path.join(outputRoot, appSlug, `${appSlug}-data.sql`)}\" \"$DATABASE_URL\"`,
      storageChecklist: `Export or inventory Supabase Storage bucket '${app.storage}' from the old project dashboard/CLI; store manifest under ${path.join(outputRoot, appSlug)}.`,
    },
  };
});

const shared = (() => {
  const { env, source } = effectiveEnv([".env.shared.local"]);
  return {
    projectUrlPresent: Boolean(env.SUPABASE_URL),
    databaseUrlPresent: Boolean(env.DATABASE_URL),
    directDatabaseUrlPresent: Boolean(env.DIRECT_DATABASE_URL),
    preferredTarget: describeUrl(env.DIRECT_DATABASE_URL, source.DIRECT_DATABASE_URL) ?? describeUrl(env.DATABASE_URL, source.DATABASE_URL),
    artifactDirectory: path.join(outputRoot, "shared"),
    suggestedCommands: {
      customDump: `pg_dump --format=custom --no-owner --no-acl --file \"${path.join(outputRoot, "shared", "shared-supabase.dump")}\" \"$DIRECT_DATABASE_URL\"`,
      schemaOnly: `pg_dump --schema-only --no-owner --no-acl --file \"${path.join(outputRoot, "shared", "shared-supabase-schema.sql")}\" \"$DIRECT_DATABASE_URL\"`,
      restoreDrill: "Restore the custom dump into a separate non-production database, then run Phase 1/2 validation SQL and row-count comparisons.",
    },
  };
})();

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), outputRoot, apps: plan, shared }, null, 2));
