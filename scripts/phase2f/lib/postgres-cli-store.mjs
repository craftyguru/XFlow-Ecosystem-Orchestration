import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export const DEFAULT_PHASE2F_DB_URL = "postgresql://postgres@127.0.0.1:55452/phase2f_validation";

export function redactDatabaseUrl(value) {
  if (!value) return "";
  return String(value)
    .replace(/:\/\/([^:@/]+):([^@/]+)@/, "://[REDACTED]:[REDACTED]@")
    .replace(/([?&](?:password|pass|sslpassword)=)[^&]+/gi, "$1[REDACTED]");
}

export function resolveDatabaseUrl(env = process.env) {
  return env.PHASE2F_DB_URL || env.DATABASE_URL || DEFAULT_PHASE2F_DB_URL;
}

export function runPsqlJson({ databaseUrl, sql, label }) {
  const dir = mkdtempSync(join(tmpdir(), "phase2f-db-"));
  const sqlPath = join(dir, `${label.replace(/[^a-z0-9_-]/gi, "-")}.sql`);
  writeFileSync(sqlPath, sql, "utf8");
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-X", "-q", "-t", "-A", "-f", sqlPath], {
    encoding: "utf8",
    env: process.env,
  });
  rmSync(dir, { recursive: true, force: true });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`psql ${label} failed with exit ${result.status}: ${detail}`);
  }
  const output = result.stdout.trim();
  return output ? JSON.parse(output) : null;
}

export function runPsqlText({ databaseUrl, sql, label, allowFailure = false }) {
  const dir = mkdtempSync(join(tmpdir(), "phase2f-db-"));
  const sqlPath = join(dir, `${label.replace(/[^a-z0-9_-]/gi, "-")}.sql`);
  writeFileSync(sqlPath, sql, "utf8");
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-X", "-q", "-t", "-A", "-f", sqlPath], {
    encoding: "utf8",
    env: process.env,
  });
  rmSync(dir, { recursive: true, force: true });
  if (!allowFailure && result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`psql ${label} failed with exit ${result.status}: ${detail}`);
  }
  return {
    exitCode: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}
