#!/usr/bin/env node

import { fileURLToPath } from "node:url";

const HOSTED_HOST_PATTERNS = [
  "supabase.co",
  "supabase.com",
  "pooler.supabase.com",
  "neon.tech",
  "neon.build",
  "railway.app",
  "rlwy.net",
  "rds.amazonaws.com",
  "amazonaws.com",
  "render.com",
  "fly.dev",
  "herokuapp.com",
  "planetscale.com",
  "database.azure.com",
  "cloudsql",
];

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);

function parseArgs(argv) {
  const args = { envName: null, url: null, label: "DATABASE_URL" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--url") {
      args.url = argv[++i] ?? "";
      args.label = "--url";
    } else if (arg === "--env") {
      args.envName = argv[++i] ?? "";
      args.label = args.envName || "DATABASE_URL";
    } else if (!arg.startsWith("-") && !args.envName) {
      args.envName = arg;
      args.label = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function isDockerServiceName(hostname) {
  return /^[a-z0-9][a-z0-9-]*$/i.test(hostname) && !hostname.includes(".");
}

export function classifyDatabaseUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) {
    return { ok: false, reason: "missing" };
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    return { ok: false, reason: "not_postgres" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const matchedHostedPattern = HOSTED_HOST_PATTERNS.find((pattern) => hostname.includes(pattern));
  if (matchedHostedPattern) {
    return { ok: false, reason: "hosted_url", hostname, matchedHostedPattern };
  }

  if (LOOPBACK_HOSTS.has(hostname) || isDockerServiceName(hostname)) {
    return { ok: true, hostname };
  }

  return { ok: false, reason: "not_local", hostname };
}

export function assertLocalDatabaseUrl(rawUrl, label = "DATABASE_URL") {
  const result = classifyDatabaseUrl(rawUrl);
  if (result.ok) return result;

  const suffix = result.hostname ? ` Host: ${result.hostname}.` : "";
  const hosted = result.matchedHostedPattern ? ` Matched hosted pattern: ${result.matchedHostedPattern}.` : "";
  throw new Error(
    `${label} must point at local disposable Postgres before running navigation QA seeds.${suffix}${hosted} ` +
      "Allowed hosts: localhost, 127.0.0.1, ::1, host.docker.internal, or a single-label Docker service name such as postgres.",
  );
}

function printHelp() {
  console.log(`Usage:
  node scripts/assert-local-db.mjs DATABASE_URL
  node scripts/assert-local-db.mjs --env DATABASE_URL
  node scripts/assert-local-db.mjs --url postgresql://postgres:postgres@localhost:5432/app_qa

Refuses hosted Postgres URLs and exits non-zero before local navigation QA seed/bootstrap commands.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      printHelp();
      process.exit(0);
    }
    const rawUrl = args.url ?? process.env[args.envName || "DATABASE_URL"];
    const result = assertLocalDatabaseUrl(rawUrl, args.label);
    console.log(`${args.label} OK for local disposable navigation QA. Host: ${result.hostname}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
