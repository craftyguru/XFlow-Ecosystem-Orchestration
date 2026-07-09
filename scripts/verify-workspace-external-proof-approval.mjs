import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");

const failures = [];
const allowedClassifications = new Set(["approval-required-no-go"]);
const requiredApps = new Set(["XFlow", "CreVux", "WordGeni", "RatAiFy", "AudAix", "Verixet"]);

function abs(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(abs(relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(abs(relativePath))) failures.push(`missing file: ${relativePath}`);
}

function assertStaticOnly() {
  const source = read("scripts/verify-workspace-external-proof-approval.mjs");
  for (const pattern of [/\bfetch\s*\(/, /\bchild_process\b/, /\bhttps?\.(?:request|get)\s*\(/, /\bnet\.connect\s*\(/, /\bWebSocket\s*\(/]) {
    if (pattern.test(source)) failures.push(`approval verifier must remain static-only: ${String(pattern)}`);
  }
}

requireFile("docs/workspace-external-proof-approval-packet.md");
requireFile("docs/workspace-external-proof-approval-register.json");
assertStaticOnly();

const doc = existsSync(abs("docs/workspace-external-proof-approval-packet.md"))
  ? read("docs/workspace-external-proof-approval-packet.md")
  : "";

for (const phrase of [
  "Default decision: NO-GO",
  "This packet does not execute proof.",
  "No lane is approved.",
  "Stop immediately",
]) {
  if (!doc.includes(phrase)) failures.push(`approval packet missing required phrase: ${phrase}`);
}

for (const pattern of [
  /\bprovider proof approved\b/i,
  /\bbilling proof approved\b/i,
  /\bdeployment proof approved\b/i,
  /\boauth proof approved\b/i,
  /\bmutation proof approved\b/i,
  /\bproduction ready\b/i,
]) {
  if (pattern.test(doc)) failures.push(`approval packet contains unsafe approval claim: ${String(pattern)}`);
}

if (existsSync(abs("docs/workspace-external-proof-approval-register.json"))) {
  const register = JSON.parse(read("docs/workspace-external-proof-approval-register.json"));
  if (register.localOnly !== true) failures.push("approval register must be localOnly=true");
  if (register.defaultDecision !== "NO-GO") failures.push("approval register defaultDecision must be NO-GO");
  for (const flag of ["providerProofApproved", "billingProofApproved", "deploymentProofApproved", "oauthProofApproved", "mutationProofApproved"]) {
    if (register[flag] !== false) failures.push(`${flag} must be false`);
  }
  const coveredApps = new Set();
  for (const entry of register.entries ?? []) {
    if (!allowedClassifications.has(entry.classification)) failures.push(`unknown classification: ${entry.id}`);
    if (entry.approved !== false) failures.push(`entry must remain unapproved: ${entry.id}`);
    if (entry.externalCallsAuthorized !== false) failures.push(`external calls must not be authorized: ${entry.id}`);
    if (entry.mutationsAuthorized !== false) failures.push(`mutations must not be authorized: ${entry.id}`);
    if (!entry.stopCondition) failures.push(`entry missing stopCondition: ${entry.id}`);
    if (!Array.isArray(entry.requiredApprovalFields) || entry.requiredApprovalFields.length < 6) {
      failures.push(`entry missing required approval fields: ${entry.id}`);
    }
    for (const app of entry.apps ?? []) coveredApps.add(app);
  }
  for (const app of requiredApps) {
    if (!coveredApps.has(app)) failures.push(`approval register does not cover app: ${app}`);
  }
}

if (failures.length) {
  console.error("Workspace external proof approval verifier failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace external proof approval verifier passed.");
console.log("decision=NO-GO");
console.log("externalCallsAuthorized=0");
console.log("mutationsAuthorized=0");
