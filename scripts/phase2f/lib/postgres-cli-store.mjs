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
  return env.PHASE2F_DATABASE_URL || env.PHASE2F_DB_URL || env.DATABASE_URL || DEFAULT_PHASE2F_DB_URL;
}

export function inspectDatabaseTarget(databaseUrl) {
  const parsed = new URL(databaseUrl);
  return {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    port: parsed.port || "5432",
    database: parsed.pathname.replace(/^\//, ""),
    isLocalhost: ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname),
  };
}

export function validateDatabaseTargetIdentity({ environment, databaseUrl, env = process.env }) {
  const errors = [];
  const target = inspectDatabaseTarget(databaseUrl);
  if (environment === "production") {
    if (!env.PHASE2F_EXPECTED_PROJECT_REF) errors.push("production execution requires PHASE2F_EXPECTED_PROJECT_REF");
    if (!env.PHASE2F_EXPECTED_DB_HOST) errors.push("production execution requires PHASE2F_EXPECTED_DB_HOST");
    if (!env.PHASE2F_EXPECTED_DB_NAME) errors.push("production execution requires PHASE2F_EXPECTED_DB_NAME");
    if (!env.PHASE2F_EXPECTED_ENVIRONMENT_NAME) errors.push("production execution requires PHASE2F_EXPECTED_ENVIRONMENT_NAME");
    if (target.isLocalhost) errors.push("production execution refuses localhost database targets");
    if (env.PHASE2F_EXPECTED_PROJECT_REF && !databaseUrl.includes(env.PHASE2F_EXPECTED_PROJECT_REF)) {
      errors.push("database target does not contain PHASE2F_EXPECTED_PROJECT_REF");
    }
    if (env.PHASE2F_EXPECTED_DB_HOST && target.hostname !== env.PHASE2F_EXPECTED_DB_HOST) {
      errors.push("database host does not match PHASE2F_EXPECTED_DB_HOST");
    }
    if (env.PHASE2F_EXPECTED_DB_NAME && target.database !== env.PHASE2F_EXPECTED_DB_NAME) {
      errors.push("database name does not match PHASE2F_EXPECTED_DB_NAME");
    }
    if (env.PHASE2F_EXPECTED_ENVIRONMENT_NAME !== "production") {
      errors.push("PHASE2F_EXPECTED_ENVIRONMENT_NAME must be production for production execution");
    }
  } else if (environment === "local") {
    if (!target.isLocalhost) errors.push("local execution refuses non-local database targets");
  }
  return { target, errors };
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
