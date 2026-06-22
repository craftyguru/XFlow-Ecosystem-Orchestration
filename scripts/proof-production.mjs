#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadEnvFile(envPath) {
  const source = fs.readFileSync(envPath, "utf8");
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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

for (const envFile of [".env.shared.local", ".env.phase6d.local", ".env.proof.local"]) {
  const envPath = path.join(root, envFile);
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeBin = process.execPath;

const stages = [
  {
    id: "contract validation",
    command: [nodeBin, ["scripts/validate-ecosystem-contracts.mjs"]],
  },
  {
    id: "auth boundary proof",
    command: [nodeBin, ["scripts/validate-ecosystem-auth-boundaries.mjs"]],
  },
  {
    id: "signup redirect proof",
    command: [npmBin, ["--prefix", "apps/XFlow", "run", "test", "--", "--run", "src/app/auth/start/route.test.ts"]],
  },
  {
    id: "Stripe catalog proof",
    command: [npmBin, ["run", "stripe:price-env:verify"]],
  },
  {
    id: "checkout creation proof",
    command: [
      npmBin,
      [
        "--prefix",
        "apps/Verixet",
        "run",
        "test",
        "--",
        "src/app/api/billing/checkout/route.test.ts",
        "src/app/api/billing/top-up/route.test.ts",
        "src/lib/billing/production-stripe-env.test.ts",
      ],
    ],
  },
  {
    id: "webhook replay proof",
    command: [
      npmBin,
      [
        "--prefix",
        "apps/Verixet",
        "run",
        "test",
        "--",
        "src/lib/billing/ecosystem-billing.webhook-replay.test.ts",
        "src/lib/billing/ecosystem-billing-webhook-security.test.ts",
        "src/app/api/webhooks/stripe/workspace/[workspaceId]/[mode]/route.test.ts",
        "src/app/api/webhooks/stripe/ecosystem/route.test.ts",
      ],
    ],
  },
  {
    id: "entitlement resolver matrix",
    command: [
      npmBin,
      [
        "--prefix",
        "apps/Verixet",
        "run",
        "test",
        "--",
        "src/app/api/platform/v1/entitlements/evaluate/route.test.ts",
        "src/app/api/platform/v1/entitlements/resolve/route.test.ts",
        "src/lib/commerce/entitlements-evaluate.test.ts",
        "src/lib/billing/ecosystem-billing.test.ts",
      ],
    ],
  },
  {
    id: "production entitlement proof",
    command: [nodeBin, ["scripts/proof-verixet-entitlements-production.mjs"]],
    requiredEnv: ["VERIXET_PROOF_BASE_URL", "VERIXET_PROOF_BEARER", "VERIXET_PROOF_WORKSPACE_ID", "VERIXET_PROOF_USER_ID"],
  },
  {
    id: "Supabase RLS proof",
    command: [npmBin, ["run", "test:rls"]],
    env: { RUN_RLS_DB_TESTS: "1" },
    requiredEnvAny: [["SUPABASE_TEST_DATABASE_URL", "SUPABASE_DB_URL", "DATABASE_URL"]],
  },
  {
    id: "six-app health proof / satellite fallback shutdown proof / public CTA route proof",
    command: [nodeBin, ["scripts/production-readiness-proof.mjs"]],
    requiredEnv: [
      "XFLOW_PROOF_BASE_URL",
      "VERIXET_PROOF_BASE_URL",
      "RATAIFY_PROOF_BASE_URL",
      "AUDAIX_PROOF_BASE_URL",
      "WORDGENI_PROOF_BASE_URL",
      "CREVUX_PROOF_BASE_URL",
      "ECOSYSTEM_AUTH_STATE_SECRET",
      "XFLOW_PROOF_EVENT_BEARER",
      "XFLOW_PROOF_SAFE_WRITES",
      "VERIXET_PROOF_MODE",
      "VERIXET_PROOF_BEARER",
      "VERIXET_PROOF_WORKSPACE_ID",
      "VERIXET_PROOF_USER_ID",
    ],
    requireProofAuth: true,
    requiredEnvValues: { XFLOW_PROOF_SAFE_WRITES: "true", VERIXET_PROOF_MODE: "true" },
  },
];

function redact(text) {
  return text
    .replace(/\b(sk|rk)_live_[A-Za-z0-9_]{8,}/g, "$1_live_[redacted]")
    .replace(/\bwhsec_[A-Za-z0-9_]{8,}/g, "whsec_[redacted]")
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}/g, "sb_secret_[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer [redacted]");
}

function missingRequiredEnv(stage) {
  const missing = [];
  for (const name of stage.requiredEnv ?? []) {
    if (!process.env[name]?.trim()) missing.push(name);
  }
  for (const group of stage.requiredEnvAny ?? []) {
    if (!group.some((name) => process.env[name]?.trim())) {
      missing.push(`one of ${group.join(", ")}`);
    }
  }
  if (stage.requireProofAuth) {
    const hasProofAuth = Boolean(process.env.XFLOW_PROOF_SESSION_COOKIE?.trim()) || Boolean(process.env.XFLOW_PROOF_EMAIL?.trim() && process.env.XFLOW_PROOF_PASSWORD?.trim());
    if (!hasProofAuth) {
      missing.push("XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL+XFLOW_PROOF_PASSWORD");
    }
  }
  for (const [name, expected] of Object.entries(stage.requiredEnvValues ?? {})) {
    if ((process.env[name] ?? "").trim() !== expected) {
      missing.push(`${name}=${expected}`);
    }
  }
  return missing;
}

function outputViolations(output) {
  const violations = [];
  const patterns = [
    ["NOT TESTED output is forbidden in production proof", /\bNOT\s+TESTED\b/i],
    ["ENV MISSING output is forbidden in production proof", /\bENV\s+MISSING\b/i],
    ["nonzero notTested count is forbidden", /"?notTested"?\s*[:=]\s*[1-9]\d*/i],
    ["nonzero skipped count is forbidden", /"?skipped"?\s*[:=]\s*[1-9]\d*/i],
    ["truthy skipped flag is forbidden", /"?skipped"?\s*:\s*true/i],
    ["nonzero failed count is forbidden", /"?failed"?\s*[:=]\s*[1-9]\d*/i],
  ];

  for (const [message, pattern] of patterns) {
    if (pattern.test(output)) violations.push(message);
  }
  return violations;
}

function runStage(stage) {
  const missing = missingRequiredEnv(stage);
  if (missing.length) {
    return {
      id: stage.id,
      status: "FAIL",
      durationMs: 0,
      issues: [`missing launch-critical proof env: ${missing.join(", ")}`],
    };
  }

  const [command, args] = stage.command;
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...(stage.env ?? {}) },
    encoding: "utf8",
    shell: process.platform === "win32" && command.endsWith(".cmd"),
    maxBuffer: 1024 * 1024 * 20,
  });
  const durationMs = Date.now() - started;
  const stdout = redact(result.stdout ?? "");
  const stderr = redact(result.stderr ?? "");
  const output = `${stdout}\n${stderr}`;
  const issues = [];

  if (result.error) issues.push(result.error.message);
  if (result.status !== 0) issues.push(`command exited with ${result.status ?? "unknown"}`);
  issues.push(...outputViolations(output));

  return {
    id: stage.id,
    status: issues.length ? "FAIL" : "PASS",
    durationMs,
    command: [command, ...args].join(" "),
    issues: [...new Set(issues)],
    stdout,
    stderr,
  };
}

function printStageResult(result) {
  const prefix = result.status === "PASS" ? "PASS" : "FAIL";
  console.log(`${prefix} ${result.id} (${result.durationMs}ms)`);
  for (const issue of result.issues ?? []) console.log(`  - ${issue}`);
  if (result.status !== "PASS") {
    const excerpt = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
    if (excerpt) {
      const lines = excerpt.split(/\r?\n/).slice(-20);
      console.log("  output:");
      for (const line of lines) console.log(`    ${line}`);
    }
  }
}

const results = [];
for (const stage of stages) {
  const result = runStage(stage);
  results.push(result);
  printStageResult(result);
}

const failed = results.filter((result) => result.status !== "PASS");
const summary = {
  generatedAt: new Date().toISOString(),
  passed: results.length - failed.length,
  failed: failed.length,
  results: results.map(({ stdout, stderr, ...result }) => result),
};

console.log(JSON.stringify(summary, null, 2));

if (failed.length) {
  console.error(`Production proof failed: ${failed.length}/${results.length} launch-critical stages failed.`);
  process.exit(1);
}
