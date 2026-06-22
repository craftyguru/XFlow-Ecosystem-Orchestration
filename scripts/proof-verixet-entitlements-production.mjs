#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
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
  const envPath = path.join(ROOT, envFile);
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

const scenarios = [
  { name: "new free user", plan: "free", expected: "allow" },
  { name: "starter plan", plan: "starter", expected: "allow" },
  { name: "pro plan", plan: "pro", expected: "allow" },
  { name: "elite plan", plan: "elite", expected: "allow" },
  { name: "ecosystem bundle", plan: "ecosystem_pro", expected: "allow" },
  { name: "creator bundle", plan: "creator_pro", expected: "allow" },
  { name: "main4 bundle", plan: "main4_pro", expected: "allow" },
  { name: "cancelled subscription", plan: "cancelled", expected: "deny_or_downgrade" },
  { name: "past-due subscription", plan: "past_due", expected: "deny_or_grace" },
  { name: "exhausted usage", plan: "pro", expected: "deny", featureKey: "proof_wordgeni_ai_generation_exhausted" },
  { name: "wrong workspace", plan: "pro", expected: "deny", workspace: "wrong" },
  { name: "wrong appSlug", plan: "pro", expected: "deny", appSlug: "unknown-app" },
  { name: "missing bearer", plan: "pro", expected: "deny", bearer: "" },
  { name: "invalid bearer", plan: "pro", expected: "deny", bearer: "invalid-proof-bearer" },
];

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for production entitlement proof.`);
  return value;
}

function endpoint(base) {
  return new URL("/api/platform/v1/entitlements/evaluate", base.replace(/\/+$/, "")).toString();
}

function responseFeatures(json) {
  if (Array.isArray(json?.features)) return json.features;
  if (Array.isArray(json?.data?.features)) return json.data.features;
  return [];
}

async function postScenario(url, baseBearer, workspaceId, userId, scenario) {
  const bearer = scenario.bearer === undefined ? baseBearer : scenario.bearer;
  const targetWorkspace = scenario.workspace === "wrong"
    ? "11111111-1111-4111-8111-111111111111"
    : workspaceId;
  const requestedAppSlug = scenario.appSlug ?? "wordgeni";
  const featureKey = scenario.featureKey ?? `proof_${requestedAppSlug.replace(/[^a-z0-9]+/gi, "_")}_${scenario.plan.replace(/[^a-z0-9]+/gi, "_")}`;
  const correlationId = `proof-${Date.now()}-${scenario.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const headers = {
    "content-type": "application/json",
    "x-app-slug": requestedAppSlug,
    "x-workspace-id": workspaceId,
    "x-correlation-id": correlationId,
    "idempotency-key": correlationId,
  };
  if (bearer) headers.authorization = `Bearer ${bearer}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      workspace_id: targetWorkspace,
      user_id: userId,
      feature_keys: [featureKey],
      environment: "live",
      include_provenance: true,
    }),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  const deniedByHttp = res.status === 401 || res.status === 403;
  const features = responseFeatures(json);
  const firstFeature = features[0] ?? null;
  const allowedFeature = Boolean(firstFeature?.value?.enabled ?? firstFeature?.allowed);
  const deniedFeature = firstFeature && !allowedFeature;
  const ok =
    scenario.expected === "allow"
      ? res.ok && allowedFeature
      : deniedByHttp || deniedFeature || (res.ok && scenario.expected.includes("downgrade"));

  return { ok, status: res.status, body: json ?? text.slice(0, 240) };
}

async function main() {
  const baseUrl = requiredEnv("VERIXET_PROOF_BASE_URL");
  const bearer = requiredEnv("VERIXET_PROOF_BEARER");
  const workspaceId = requiredEnv("VERIXET_PROOF_WORKSPACE_ID");
  const userId = requiredEnv("VERIXET_PROOF_USER_ID");
  const url = endpoint(baseUrl);

  let failed = 0;
  const results = [];
  for (const scenario of scenarios) {
    const result = await postScenario(url, bearer, workspaceId, userId, scenario);
    if (!result.ok) failed += 1;
    results.push({ scenario: scenario.name, ...result });
  }

  console.log(JSON.stringify({ failed, skipped: 0, notTested: 0, results }, null, 2));
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
