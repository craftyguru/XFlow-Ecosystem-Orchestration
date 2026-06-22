import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(repoRoot, ".env.phase6d.local");
const requireInputs = /^true$/i.test(process.env.PHASE6D_REQUIRE_INPUTS ?? "");

const urlVars = [
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

const secretOrSensitiveVars = ["TEST_USER_EMAIL", "TEST_USER_PASSWORD"];
const allRequired = [...urlVars, ...secretOrSensitiveVars];
const errors = [];
const warnings = [];
const loaded = new Set();

function parseDotenvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) return null;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return [match[1], value];
}

if (fs.existsSync(envFile)) {
  const text = fs.readFileSync(envFile, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseDotenvLine(line);
    if (!parsed) continue;
    const [key, value] = parsed;
    if (process.env[key] === undefined) {
      process.env[key] = value;
      loaded.add(key);
    }
  }
}

function present(name) {
  return Boolean(process.env[name]?.trim());
}

function validateUrl(name) {
  if (!present(name)) {
    warnings.push(`${name}: missing`);
    return;
  }
  try {
    const url = new URL(process.env[name]);
    if (!["http:", "https:"].includes(url.protocol)) {
      warnings.push(`${name}: invalid protocol ${url.protocol}; expected http or https`);
      return;
    }
    console.log(`${name}: present, valid URL, source=${loaded.has(name) ? ".env.phase6d.local" : "environment"}`);
  } catch {
    warnings.push(`${name}: present but not a valid URL`);
  }
}

for (const name of urlVars) validateUrl(name);

for (const name of secretOrSensitiveVars) {
  if (present(name)) {
    console.log(`${name}: present, source=${loaded.has(name) ? ".env.phase6d.local" : "environment"}`);
  } else {
    warnings.push(`${name}: missing`);
  }
}

for (const warning of warnings) {
  if (requireInputs) errors.push(warning);
  else console.warn(`warning: ${warning}`);
}

const summary = allRequired.reduce(
  (acc, name) => {
    if (present(name)) acc.present += 1;
    else acc.missing += 1;
    return acc;
  },
  { present: 0, missing: 0 },
);

if (errors.length > 0) {
  console.error("validate-supabase-phase6d-local-inputs: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `validate-supabase-phase6d-local-inputs: ok (env_file=${fs.existsSync(envFile) ? "loaded" : "absent"}, present=${summary.present}, missing=${summary.missing}, strict=${requireInputs})`,
);
