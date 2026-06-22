import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [".env.security-local", ".env.shared.local", ".env.phase6d.local", ".env.proof.local"];

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

process.env.NEXT_PUBLIC_SUPABASE_URL ||= process.env.SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= process.env.SUPABASE_ANON_KEY;

const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
  (name) => !process.env[name]?.trim(),
);

if (missing.length > 0) {
  console.error(`WordGeni local start is missing required browser env: ${missing.join(", ")}`);
  process.exit(1);
}

const child = spawn(
  "npx",
  [
    "cross-env",
    "E2E_LOCAL_AUTH=1",
    "JWT_SECRET=ci-jwt-secret-min-32-characters-for-build-only!!",
    "pnpm",
    "exec",
    "next",
    "dev",
    "-p",
    "3004",
  ],
  {
    cwd: path.join(root, "apps", "WordGeni", "apps", "web"),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
