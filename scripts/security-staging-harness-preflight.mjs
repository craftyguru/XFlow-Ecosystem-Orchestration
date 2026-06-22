#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_FILE = process.argv.find((arg) => arg.startsWith("--persona-env-file="))?.slice("--persona-env-file=".length) || ".env.security-staging";
const DRY_RUN = process.argv.includes("--dry-run") || process.argv.includes("--staging-dry-run");

const APPS = [
  { app: "XFlow", env: "XFLOW_PROOF_BASE_URL" },
  { app: "Verixet", env: "VERIXET_PROOF_BASE_URL" },
  { app: "RatAiFy", env: "RATAIFY_PROOF_BASE_URL" },
  { app: "AudAiX", env: "AUDAIX_PROOF_BASE_URL" },
  { app: "WordGeni", env: "WORDGENI_PROOF_BASE_URL" },
  { app: "CreVux", env: "CREVUX_PROOF_BASE_URL" },
];

const REQUIRED_SECRET_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "AUTH_PERSONA_FIXTURES_FILE",
  "AUTH_PERSONA_FIXTURE_OUTPUT_FILE",
  "AUTH_PERSONA_SUPABASE_IS_STAGING",
  "AUTH_PERSONA_FIXTURE_RUN_ID",
];

const OPTIONAL_SECRET_VARS = [
  "DATABASE_URL",
  "AUTH_URL",
  "NEXTAUTH_URL",
  "AUTH_SECRET",
  "SUPABASE_ANON_KEY",
  "XFLOW_PROOF_SHARED_SECRET",
  "VERIXET_PROOF_SHARED_SECRET",
  "RATAIFY_PROOF_SHARED_SECRET",
  "AUDAIX_PROOF_SHARED_SECRET",
  "WORDGENI_PROOF_SHARED_SECRET",
  "CREVUX_PROOF_SHARED_SECRET",
];

const LOCAL_ONLY_FLAGS = [
  "RATAIFY_SECURITY_HARNESS",
  "E2E_LOCAL_AUTH",
  "AUDAIX_SECURITY_HARNESS",
  "AUDAIX_LOAD_SECURITY_LOCAL_ENV",
  "CREVUX_SECURITY_HARNESS",
  "WORDGENI_SECURITY_HARNESS",
  "XFLOW_SECURITY_HARNESS",
];

const PRODUCTION_HOSTS = new Set([
  "xflowx.com",
  "www.xflowx.com",
  "verixet.com",
  "www.verixet.com",
  "rataify.com",
  "www.rataify.com",
  "audaix.com",
  "www.audaix.com",
  "wordgeni.com",
  "www.wordgeni.com",
  "crevux.com",
  "www.crevux.com",
]);

function sanitize(text) {
  return String(text || "")
    .replace(/postgresql:\/\/([^:\s]+):([^@\s]+)@/g, "postgresql://$1:[redacted-password]@")
    .replace(/\b(sk_live|sk_test|rk_live|whsec|sb_secret|sb_publishable)_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-jwt]")
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, "[redacted-hex]")
    .replace(/(?<==)[A-Za-z0-9._~+/-]{24,}\b/g, "[redacted-value]")
    .slice(0, 2000);
}

function loadEnvFile(file) {
  const full = path.isAbsolute(file) ? file : path.join(ROOT, file);
  if (!fs.existsSync(full)) return { loaded: false, full };
  const source = fs.readFileSync(full, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return { loaded: true, full };
}

function classifyUrl(raw) {
  if (!raw) return { type: "missing", host: "", protocol: "" };
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const stagingByName = /(^|[.-])(staging|stage|preview|dev|test|qa|sandbox)([.-]|$)/i.test(host);
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) {
      return { type: "local", host, protocol: url.protocol };
    }
    if (PRODUCTION_HOSTS.has(host)) return { type: "production", host, protocol: url.protocol };
    if (stagingByName || process.env.AUTH_PERSONA_TARGETS_ARE_DISPOSABLE_STAGING === "1") {
      return { type: "staging", host, protocol: url.protocol };
    }
    return { type: "production-like", host, protocol: url.protocol };
  } catch {
    return { type: "invalid", host: "", protocol: "" };
  }
}

function redactedPresence(name) {
  const value = process.env[name]?.trim();
  return { name, present: Boolean(value), value: value ? "[redacted]" : "" };
}

function checkUrlEnv(name) {
  const value = process.env[name]?.trim() || "";
  const classified = classifyUrl(value);
  const ok = classified.type === "staging";
  return {
    name,
    url: value ? sanitize(value) : "",
    host: classified.host,
    type: classified.type,
    status: ok ? "PASS" : "BLOCKED",
    reason: ok ? "staging target" : "must be an explicit disposable staging URL, not local or production-like",
  };
}

function checkSupabase() {
  const url = process.env.SUPABASE_URL?.trim() || "";
  const classified = classifyUrl(url);
  const stagingConfirmed = process.env.AUTH_PERSONA_SUPABASE_IS_STAGING === "1";
  const disposableConfirmed = process.env.AUTH_PERSONA_STAGING_FIXTURES_ARE_DISPOSABLE === "1";
  const ok = classified.type === "staging" && stagingConfirmed && disposableConfirmed;
  return {
    url: sanitize(url),
    host: classified.host,
    type: classified.type,
    status: ok ? "PASS" : "BLOCKED",
    reason: ok
      ? "staging Supabase confirmed disposable"
      : "requires staging-looking SUPABASE_URL plus AUTH_PERSONA_SUPABASE_IS_STAGING=1 and AUTH_PERSONA_STAGING_FIXTURES_ARE_DISPOSABLE=1",
  };
}

function main() {
  const envLoad = loadEnvFile(ENV_FILE);
  const appTargets = APPS.map((app) => ({ app: app.app, ...checkUrlEnv(app.env) }));
  const supabase = checkSupabase();
  const requiredVars = REQUIRED_SECRET_VARS.map(redactedPresence);
  const optionalVars = OPTIONAL_SECRET_VARS.map(redactedPresence);
  const localOnlyFlags = LOCAL_ONLY_FLAGS.map((name) => ({
    name,
    present: Boolean(process.env[name]?.trim()),
    status: process.env[name]?.trim() ? "BLOCKED" : "PASS",
  }));
  const nodeEnv = process.env.NODE_ENV?.trim() || "";
  const destructiveMutations = process.env.AUTH_PERSONA_ALLOW_PRIVILEGED_MUTATIONS === "1";
  const destructiveConfirmed = process.env.AUTH_PERSONA_STAGING_ALLOW_DESTRUCTIVE_MUTATIONS === "1";
  const checks = [
    { area: "Env file", status: envLoad.loaded ? "PASS" : "BLOCKED", detail: envLoad.loaded ? ENV_FILE : `${ENV_FILE} missing` },
    { area: "NODE_ENV", status: nodeEnv === "production" ? "BLOCKED" : "PASS", detail: nodeEnv || "not set" },
    { area: "Supabase staging", status: supabase.status, detail: supabase.reason },
    ...appTargets.map((target) => ({ area: target.name, status: target.status, detail: `${target.type}: ${target.url || "missing"}` })),
    ...requiredVars.map((item) => ({ area: item.name, status: item.present ? "PASS" : "BLOCKED", detail: item.present ? "present ([redacted])" : "missing" })),
    ...localOnlyFlags.map((item) => ({ area: item.name, status: item.status, detail: item.present ? "local-only bypass flag is set" : "not set" })),
    {
      area: "Privileged mutations",
      status: destructiveMutations && !destructiveConfirmed ? "BLOCKED" : "PASS",
      detail: destructiveMutations ? "requested" : "disabled",
    },
  ];

  const blocked = checks.filter((check) => check.status !== "PASS");
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "staging",
    dryRun: DRY_RUN,
    status: blocked.length === 0 ? "PASS" : "BLOCKED",
    envFile: envLoad.loaded ? path.relative(ROOT, envLoad.full) : ENV_FILE,
    appTargets,
    supabase,
    requiredVars,
    optionalVars,
    localOnlyFlags,
    destructiveMutations: {
      enabled: destructiveMutations,
      disposableOverride: destructiveConfirmed,
    },
    checks,
    blocked,
    nextCommands:
      blocked.length === 0
        ? [
            "npm run security:staging:seed-personas",
            "npm run security:staging:simulate",
            "npm run security:staging:cleanup",
          ]
        : ["Fix BLOCKED rows, then rerun npm run security:staging:dry-run."],
  };
  console.log(JSON.stringify(report, null, 2));
  if (blocked.length > 0) process.exitCode = 1;
}

main();
