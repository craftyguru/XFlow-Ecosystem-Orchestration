import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");
const failures = [];

const requiredFiles = [
  "docs/workspace-local-proof-closeout.md",
  "docs/workspace-local-proof-closeout-register.json",
  "docs/workspace-external-proof-approval-register.json",
  "docs/workspace-provider-billing-proof-plan-register.json",
  "docs/workspace-five-app-auth-read-fixtures-proof-register.json",
  "docs/workspace-five-app-api-redaction-proof-register.json",
];

function abs(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(abs(relativePath), "utf8");
}

for (const file of requiredFiles) {
  if (!existsSync(abs(file))) failures.push(`missing file: ${file}`);
}

const source = read("scripts/verify-workspace-local-proof-closeout.mjs");
for (const pattern of [/\bfetch\s*\(/, /\bchild_process\b/, /\bhttps?\.(?:request|get)\s*\(/, /\bnet\.connect\s*\(/, /\bWebSocket\s*\(/]) {
  if (pattern.test(source)) failures.push(`closeout verifier must remain static-only: ${String(pattern)}`);
}

if (existsSync(abs("docs/workspace-local-proof-closeout.md"))) {
  const doc = read("docs/workspace-local-proof-closeout.md");
  for (const phrase of [
    "This closeout does not execute proof.",
    "default decision is NO-GO",
    "Do not continue adding local proof phases",
    "requires an explicit approval update",
  ]) {
    if (!doc.includes(phrase)) failures.push(`closeout doc missing required phrase: ${phrase}`);
  }
  for (const pattern of [
    /\bproduction ready\b/i,
    /\bprovider proof complete\b/i,
    /\bbilling proof complete\b/i,
    /\bdeployment proof complete\b/i,
    /\bmutation success proved\b/i,
  ]) {
    if (pattern.test(doc)) failures.push(`closeout doc contains unsafe completion claim: ${String(pattern)}`);
  }
}

if (existsSync(abs("docs/workspace-local-proof-closeout-register.json"))) {
  const register = JSON.parse(read("docs/workspace-local-proof-closeout-register.json"));
  if (register.localOnly !== true) failures.push("closeout register must be localOnly=true");
  for (const flag of ["productionReady", "providerProof", "billingProof", "deploymentProof", "oauthProof", "mutationProof"]) {
    if (register[flag] !== false) failures.push(`${flag} must be false`);
  }
  if (register.externalApprovalDecision !== "NO-GO") failures.push("externalApprovalDecision must be NO-GO");
  if (!Array.isArray(register.completed) || register.completed.length < 10) failures.push("closeout register missing completed local work list");
  if (!Array.isArray(register.remainingBlocked) || !register.remainingBlocked.includes("production readiness")) {
    failures.push("closeout register must keep production readiness blocked");
  }
  if (!register.stopCondition?.includes("Stop before any provider")) failures.push("closeout register missing stop condition");
}

if (existsSync(abs("docs/workspace-external-proof-approval-register.json"))) {
  const approval = JSON.parse(read("docs/workspace-external-proof-approval-register.json"));
  if (approval.defaultDecision !== "NO-GO") failures.push("external approval register must remain NO-GO");
  for (const entry of approval.entries ?? []) {
    if (entry.approved !== false || entry.externalCallsAuthorized !== false || entry.mutationsAuthorized !== false) {
      failures.push(`external approval entry is no longer blocked: ${entry.id}`);
    }
  }
}

if (failures.length) {
  console.error("Workspace local proof closeout verifier failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace local proof closeout verifier passed.");
console.log("externalApprovalDecision=NO-GO");
console.log("productionReady=false");
