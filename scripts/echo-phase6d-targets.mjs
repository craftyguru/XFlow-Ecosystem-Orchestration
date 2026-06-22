import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [".env.shared.local", ".env.phase6d.local"];
const targetVars = [
  "VERIXET_SMOKE_BASE_URL",
  "XFLOW_RELEASE_SMOKE_BASE_URL",
  "AUDAIX_PUBLIC_URL",
  "AUDAIX_API_URL",
  "RELEASE_VERIFY_BASE_URL",
  "WEB_URL",
  "API_URL",
  "CREVUX_AUTH_SMOKE_WEB_URL",
  "CREVUX_AUTH_SMOKE_API_URL",
];

const values = new Map();

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) return null;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key: match[1], value };
}

for (const relativePath of envFiles) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) continue;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const parsed = parseLine(line);
    if (!parsed || !targetVars.includes(parsed.key)) continue;
    values.set(parsed.key, { value: parsed.value, source: relativePath });
  }
}

for (const name of targetVars) {
  const target = values.get(name);
  if (!target) {
    console.log(`${name}: <missing> source=<none>`);
    continue;
  }
  console.log(`${name}: ${target.value} source=${target.source}`);
}
