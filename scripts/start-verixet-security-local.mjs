import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [".env.security-local", ".env.shared.local", ".env.phase6d.local", ".env.proof.local"];
const localStatusToken = "local-verixet-ecosystem-status-proof-token-min-32";

function loadEnvFile(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) return;
  const content = readFileSync(fullPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

for (const file of envFiles) loadEnvFile(file);

process.env.VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN ||= localStatusToken;
process.env.VERIXET_ECOSYSTEM_STATUS_LOCAL_FIXTURE ||= "1";

const child = spawn("npx", ["next", "dev", "-p", "3001"], {
  cwd: path.join(root, "apps", "Verixet"),
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
