#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const windowMinutes = Number.parseInt(process.env.PHASE7J_WRITE_WINDOW_MINUTES || "15", 10);
const runDbCounts = process.env.PHASE7J_RUN_DB_COUNTS === "true";
const confirmReadOnly = process.env.PHASE7J_CONFIRM_READ_ONLY === "true";
const allowProductionReadOnly = process.env.PHASE7J_ALLOW_PRODUCTION_READ_ONLY === "true";

const apps = [
  {
    app: "Verixet",
    envFiles: ["apps/Verixet/.env.local", "apps/Verixet/.env"],
    test: "apps/Verixet/src/lib/supabase/runtime.server.test.ts",
    tables: ["usage_events", "billing_accounts", "subscriptions", "credit_balances", "credit_transactions", "audit_events"],
  },
  {
    app: "XFlow",
    envFiles: ["apps/XFlow/.env.local", "apps/XFlow/.env"],
    test: "apps/XFlow/tests/supabase/runtime.server.test.ts",
    tables: ["app_connections", "workspace_app_access", "control_plane_events", "app_links", "deployment_checks", "workflow_runs", "audit_logs"],
  },
  {
    app: "AudAiX",
    envFiles: ["apps/AudAix/.env.local", "apps/AudAix/.env"],
    test: "apps/AudAix/tests/audaix-shared-supabase-runtime.test.ts",
    tables: ["sites", "audits", "audit_reports", "audit_findings", "scan_jobs", "security_audit_logs"],
  },
  {
    app: "Rataify",
    envFiles: ["apps/RatAiFy/.env.local", "apps/RatAiFy/.env"],
    test: "apps/RatAiFy/server/lib/supabase/runtime.server.test.ts",
    tables: ["users", "sites", "reviews", "issues", "risk_events", "evidence_items", "audit_logs"],
  },
  {
    app: "WordGeni",
    envFiles: ["apps/WordGeni/.env.local", "apps/WordGeni/.env"],
    test: "apps/WordGeni/apps/api/src/supabase/runtime.server.test.ts",
    tables: ["documents", "document_sources", "memory_cards", "writing_sessions", "provenance_items", "usage_events", "audit_logs"],
  },
  {
    app: "Crevux",
    envFiles: [
      "apps/CreVux/.env.local",
      "apps/CreVux/.env",
      "apps/CreVux/artifacts/api-server/.env.local",
      "apps/CreVux/artifacts/api-server/.env",
    ],
    test: "apps/CreVux/artifacts/api-server/src/supabase/runtime.server.test.ts",
    tables: ["users", "projects", "assets", "generation_jobs", "asset_exports", "ai_usage_events", "provider_runs", "credit_transactions"],
  },
];

const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function parseEnvFile(relativePath) {
  const absolute = path.join(repoRoot, relativePath);
  if (!existsSync(absolute)) return {};
  const values = {};
  for (const line of readFileSync(absolute, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function classifyUrl(raw) {
  if (!raw) return { present: false, hostClass: "missing", host: "missing", database: "missing", username: "missing" };
  try {
    const parsed = new URL(raw);
    const host = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;
    const hostClass = parsed.hostname.includes("supabase.com")
      ? parsed.hostname.includes("pooler")
        ? "Supabase pooler"
        : "Supabase direct"
      : parsed.hostname.includes("railway")
        ? "Railway"
        : parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
          ? "local"
          : "unknown";
    return {
      present: true,
      hostClass,
      host,
      database: parsed.pathname.replace(/^\//, "") || "unknown",
      username: decodeURIComponent(parsed.username || "unknown"),
    };
  } catch {
    return { present: true, hostClass: "invalid", host: "invalid", database: "invalid", username: "invalid" };
  }
}

function firstDbSource(app) {
  for (const envFile of app.envFiles) {
    const values = parseEnvFile(envFile);
    const raw = values.DIRECT_DATABASE_URL || values.DATABASE_URL;
    if (raw) {
      return {
        source: envFile,
        key: values.DIRECT_DATABASE_URL ? "DIRECT_DATABASE_URL" : "DATABASE_URL",
        values,
        target: classifyUrl(raw),
      };
    }
  }
  return {
    source: "missing",
    key: "missing",
    values: {},
    target: classifyUrl(null),
  };
}

function hasLegacyFirstTest(app) {
  const absolute = path.join(repoRoot, app.test);
  if (!existsSync(absolute)) return false;
  const text = readFileSync(absolute, "utf8").toLowerCase();
  return (
    text.includes("legacy") &&
    (text.includes("dual-write") || text.includes("dual write") || text.includes("dualwrites")) &&
    (text.includes("does not break legacy") || text.includes("preserves legacy") || text.includes("keeps legacy"))
  );
}

function productionMarker(values, target) {
  const markers = [];
  for (const key of ["NODE_ENV", "APP_ENV", "CREVUX_ENV", "VERCEL_ENV", "RAILWAY_ENVIRONMENT"]) {
    const value = values[key]?.trim().toLowerCase();
    if (value) markers.push(`${key}=${value}`);
  }
  const prodLike = markers.some((marker) => marker.includes("production")) || target.hostClass.includes("Supabase");
  return { prodLike, markers };
}

console.log("old-db-write-detection: read-only report");
console.log(`mode=${runDbCounts ? "db-counts" : "plan-only"}`);
console.log(`windowMinutes=${Number.isFinite(windowMinutes) ? windowMinutes : 15}`);

if (runDbCounts && !confirmReadOnly) {
  failures.push("PHASE7J_RUN_DB_COUNTS=true requires PHASE7J_CONFIRM_READ_ONLY=true");
}

const report = [];

for (const app of apps) {
  const source = firstDbSource(app);
  const marker = productionMarker(source.values, source.target);
  const legacyFirstTest = hasLegacyFirstTest(app);
  if (!legacyFirstTest) failures.push(`${app.app} legacy-first runtime adapter test was not found or is incomplete`);

  const canQuery = runDbCounts && confirmReadOnly && (!marker.prodLike || allowProductionReadOnly);
  const skippedReason = runDbCounts && !canQuery
    ? marker.prodLike && !allowProductionReadOnly
      ? "production_or_supabase_target_requires_PHASE7J_ALLOW_PRODUCTION_READ_ONLY"
      : "read_only_confirmation_missing"
    : runDbCounts
      ? "db_count_query_not_implemented_in_this_safe_helper"
      : "plan_only";

  console.log(
    `${app.app}: source=${source.source}; key=${source.key}; hostClass=${source.target.hostClass}; host=${source.target.host}; database=${source.target.database}; username=${source.target.username}; envMarkers=${marker.markers.join(",") || "none"}; legacyFirstTest=${legacyFirstTest ? "present" : "missing"}`,
  );
  for (const table of app.tables) {
    console.log(`${app.app}.${table}: windowMinutes=${windowMinutes}; count=${canQuery ? "not_queried" : "not_queried"}; status=${skippedReason}`);
  }
  report.push({ app: app.app, source, marker, legacyFirstTest, tables: app.tables, skippedReason });
}

if (failures.length) {
  console.error("old-db-write-detection: failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("old-db-write-detection: ok");
console.log("note=No database writes were performed. Default plan-only mode does not open DB connections.");
