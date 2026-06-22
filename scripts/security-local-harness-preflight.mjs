#!/usr/bin/env node

import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const TIMEOUT_MS = 700;
const ALLOW_STAGING_FIXTURES = process.argv.includes("--allow-staging-fixtures") || process.env.AUTH_PERSONA_SUPABASE_IS_STAGING === "1";

const ENV_FILES = [".env.security-local", ".env.shared.local", ".env.phase6d.local", ".env.proof.local"];

const APPS = [
  {
    app: "XFlow",
    folder: "apps/XFlow",
    proofEnv: "XFLOW_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3000",
    port: 3000,
    devCommand: "npm run security:local:start:xflow",
  },
  {
    app: "Verixet",
    folder: "apps/Verixet",
    proofEnv: "VERIXET_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3001",
    port: 3001,
    devCommand: "cd apps/Verixet; npx next dev -p 3001",
  },
  {
    app: "RatAiFy",
    folder: "apps/RatAiFy",
    proofEnv: "RATAIFY_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3002",
    port: 3002,
    devCommand: "cd apps/RatAiFy; npx cross-env NODE_ENV=development PORT=3002 HOST=127.0.0.1 DOTENV_CONFIG_PATH=.env tsx -r dotenv/config -r ./server/load-local-env.cjs server/index.ts",
  },
  {
    app: "AudAiX",
    folder: "apps/AudAix",
    proofEnv: "AUDAIX_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3003",
    port: 3003,
    devCommand: "cd apps/AudAix; npx cross-env PORT=3003 tsx src/server.ts",
  },
  {
    app: "WordGeni",
    folder: "apps/WordGeni",
    proofEnv: "WORDGENI_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3004",
    port: 3004,
    devCommand: "pnpm --dir apps/WordGeni/apps/web exec next dev -p 3004",
  },
  {
    app: "CreVux",
    folder: "apps/CreVux",
    proofEnv: "CREVUX_PROOF_BASE_URL",
    expectedUrl: "http://localhost:3005",
    port: 3005,
    devCommand: "cd apps/CreVux; $env:PORT='3005'; pnpm --filter @workspace/api-server dev",
  },
];

function loadEnvFile(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return false;
  const source = fs.readFileSync(full, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
  return true;
}

const loadedEnvFiles = ENV_FILES.filter(loadEnvFile);

function commandExists(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", shell: false, timeout: 10_000 });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: sanitize(result.stdout),
    stderr: sanitize(result.stderr),
    error: result.error ? sanitize(result.error.message) : "",
  };
}

function runCommand(command, args, timeout = 20_000) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", shell: false, timeout });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: sanitize(result.stdout),
    stderr: sanitize(result.stderr),
    error: result.error ? sanitize(result.error.message) : "",
    rawStdout: result.stdout || "",
    rawStderr: result.stderr || "",
  };
}

function resolveSupabaseCli() {
  const globalCli = runCommand("supabase", ["--version"], 10_000);
  if (globalCli.ok) {
    return {
      ok: true,
      mode: "global supabase",
      command: "supabase",
      baseArgs: [],
      version: globalCli.stdout.trim() || "supabase found",
      error: "",
    };
  }

  const npxCli = runCommand("npx", ["supabase", "--version"], 20_000);
  if (npxCli.ok) {
    return {
      ok: true,
      mode: "npx supabase",
      command: "npx",
      baseArgs: ["supabase"],
      version: npxCli.stdout.trim() || "supabase found through npx",
      error: "",
    };
  }

  return {
    ok: false,
    mode: "unavailable",
    command: "",
    baseArgs: [],
    version: "",
    error:
      globalCli.error ||
      globalCli.stderr ||
      npxCli.error ||
      npxCli.stderr ||
      "Neither global `supabase` nor repo-local `npx supabase` is available.",
  };
}

function sanitize(text) {
  return String(text || "")
    .replace(/postgresql:\/\/([^:\s]+):([^@\s]+)@/g, "postgresql://$1:[redacted-password]@")
    .replace(/\b(sk_live|sk_test|rk_live|whsec|sb_secret|sb_publishable)_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-jwt]")
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, "[redacted-hex]")
    .replace(/(?<==)[A-Za-z0-9._~+/-]{24,}\b/g, "[redacted-value]")
    .replace(/\b(?:Bearer|token|session|cookie|password)\s+[A-Za-z0-9._~+/-]{12,}/gi, "[redacted-auth]")
    .slice(0, 2000);
}

function hostType(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) return "local";
    if (host.includes("staging") || host.includes("preview") || host.includes("dev") || host.includes("test")) return "staging";
    return "production-like";
  } catch {
    return "invalid";
  }
}

function safeUrl(name, url, allowStaging = false) {
  if (!url) return { name, status: "BLOCKED", reason: `${name} is missing`, type: "missing" };
  const type = hostType(url);
  if (type === "local") return { name, status: "PASS", reason: "local URL", type };
  if (type === "staging" && allowStaging) return { name, status: "PASS", reason: "staging URL explicitly allowed", type };
  if (type === "staging") return { name, status: "BLOCKED", reason: "staging URL requires --allow-staging-fixtures or AUTH_PERSONA_SUPABASE_IS_STAGING=1", type };
  return { name, status: "BLOCKED", reason: "production-like or invalid URL", type };
}

function redactedPresence(name) {
  const value = process.env[name]?.trim();
  return { name, status: value ? "PASS" : "BLOCKED", present: Boolean(value), value: value ? "[redacted]" : "" };
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (listening) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(Boolean(listening));
    };
    socket.setTimeout(TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, "127.0.0.1");
  });
}

function parseSupabaseStatus(raw) {
  const text = raw || "";
  return {
    hasOutput: Boolean(text.trim()),
    apiUrlMentioned: /API URL|API_URL|54321|localhost|127\.0\.0\.1/i.test(text),
    anonKeyMentioned: /anon key|anon_key|anon\b/i.test(text),
    serviceRoleMentioned: /service_role|service role/i.test(text),
    redactedPreview: sanitize(text),
  };
}

async function main() {
  const docker = commandExists("docker", ["info"]);
  const supabaseCli = resolveSupabaseCli();
  const supabaseStatusRaw = supabaseCli.ok
    ? spawnSync(supabaseCli.command, [...supabaseCli.baseArgs, "status"], { cwd: ROOT, encoding: "utf8", timeout: 20_000 })
    : null;
  const supabaseStatus = supabaseStatusRaw
    ? {
        ok: supabaseStatusRaw.status === 0,
        ...parseSupabaseStatus(`${supabaseStatusRaw.stdout || ""}\n${supabaseStatusRaw.stderr || ""}`),
      }
    : { ok: false, hasOutput: false, redactedPreview: "Supabase CLI unavailable." };

  const supabaseConfig = {
    configTomlExists: fs.existsSync(path.join(ROOT, "supabase", "config.toml")),
    migrationsExists: fs.existsSync(path.join(ROOT, "supabase", "migrations")),
  };

  const proofUrls = APPS.map((app) => ({
    app: app.app,
    env: app.proofEnv,
    expectedUrl: app.expectedUrl,
    actualUrl: process.env[app.proofEnv] || "",
    devCommand: app.devCommand,
    ...safeUrl(app.proofEnv, process.env[app.proofEnv] || "", ALLOW_STAGING_FIXTURES),
  }));

  const ports = [];
  for (const app of APPS) {
    ports.push({
      app: app.app,
      port: app.port,
      listening: await checkPort(app.port),
      devCommand: app.devCommand,
    });
  }

  const supabaseUrl = safeUrl("SUPABASE_URL", process.env.SUPABASE_URL || "", ALLOW_STAGING_FIXTURES);
  const serviceRole = redactedPresence("SUPABASE_SERVICE_ROLE_KEY");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    ? redactedPresence("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    : redactedPresence("SUPABASE_ANON_KEY");

  const checks = [
    { area: "Docker", status: docker.ok ? "PASS" : "BLOCKED", detail: docker.ok ? "Docker daemon is available." : "Docker is unavailable or not running." },
    { area: "Supabase CLI", status: supabaseCli.ok ? "PASS" : "BLOCKED", detail: supabaseCli.ok ? `${supabaseCli.mode}: ${supabaseCli.version}` : "Install Supabase CLI or add the repo-local supabase package so `npx supabase --version` works." },
    { area: "Supabase status", status: supabaseStatus.ok && supabaseStatus.hasOutput ? "PASS" : "BLOCKED", detail: supabaseStatus.ok ? "supabase status returned output." : "Run `supabase start` after local config exists." },
    { area: "Supabase config", status: supabaseConfig.configTomlExists && supabaseConfig.migrationsExists ? "PASS" : "BLOCKED", detail: `config.toml=${supabaseConfig.configTomlExists}; migrations=${supabaseConfig.migrationsExists}` },
    { area: "SUPABASE_URL", status: supabaseUrl.status, detail: supabaseUrl.reason },
    { area: "SUPABASE_SERVICE_ROLE_KEY", status: serviceRole.status, detail: serviceRole.present ? "present ([redacted])" : "missing" },
    { area: "Supabase anon key", status: anon.status, detail: anon.present ? `${anon.name} present ([redacted])` : "NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY missing" },
    ...proofUrls.map((row) => ({ area: row.env, status: row.status, detail: `${row.actualUrl || "missing"} (${row.reason})` })),
    ...ports.map((row) => ({ area: `${row.app} port ${row.port}`, status: row.listening ? "PASS" : "BLOCKED", detail: row.listening ? "listening" : `not listening; start with: ${row.devCommand}` })),
  ];

  const blocked = checks.filter((check) => check.status !== "PASS");
  const report = {
    generatedAt: new Date().toISOString(),
    status: blocked.length === 0 ? "PASS" : "BLOCKED",
    loadedEnvFiles,
    allowStagingFixtures: ALLOW_STAGING_FIXTURES,
    supabaseConfig,
    docker: { status: docker.ok ? "PASS" : "BLOCKED", detail: docker.ok ? "available" : docker.error || docker.stderr || "not available" },
    supabaseCli: { status: supabaseCli.ok ? "PASS" : "BLOCKED", mode: supabaseCli.mode, detail: supabaseCli.ok ? supabaseCli.version : supabaseCli.error },
    supabaseStatus,
    proofUrls,
    ports,
    checks,
    blocked,
    nextSteps:
      blocked.length === 0
        ? [
            "Run: npm run security:local:seed-personas",
            "Run: npm run security:local:simulate",
            "Run cleanup after testing: npm run security:local:cleanup",
          ]
        : [
            "Use .env.security-local copied from .env.security-local.example.",
            "Initialize local Supabase only if intended; do not overwrite existing config.",
            "Start missing app services on the expected ports.",
            "Rerun npm run security:local:preflight.",
          ],
  };

  console.log(JSON.stringify(report, null, 2));
  if (blocked.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? sanitize(error.message) : sanitize(String(error)));
  process.exit(1);
});
