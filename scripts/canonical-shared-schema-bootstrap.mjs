import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertStrictMigrationOrder,
  buildDisposableSupabaseConfig,
  journalThroughTag,
  listSqlMigrations,
  redactCommandOutput,
  reserveLoopbackPorts,
} from "./lib/canonical-shared-schema-bootstrap.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const xflowRoot = path.resolve(argument("xflow-dir") || path.join(root, "apps", "XFlow"));
const supabaseCli = path.join(root, "node_modules", "supabase", "bin", process.platform === "win32" ? "supabase.exe" : "supabase");
const psql = process.env.PSQL_BIN?.trim() || "psql";
const sharedMigrations = path.join(root, "supabase", "migrations");
const xflowMigrations = path.join(xflowRoot, "drizzle", "migrations");
const xflowTsx = path.join(xflowRoot, "node_modules", "tsx", "dist", "cli.mjs");

for (const required of [supabaseCli, sharedMigrations, xflowMigrations, xflowTsx]) {
  if (!fs.existsSync(required)) throw new Error(`Required canonical-bootstrap input is missing: ${required}`);
}

const sharedFiles = listSqlMigrations(sharedMigrations);
const xflowFiles = listSqlMigrations(xflowMigrations);
assertStrictMigrationOrder(sharedFiles, "Orchestration");
assertStrictMigrationOrder(xflowFiles, "XFlow");

const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "xflow-shared-schema-1-"));
const supabaseDir = path.join(runtimeRoot, "supabase");
const runtimeMigrations = path.join(supabaseDir, "migrations");
const partialMigrations = path.join(runtimeRoot, "xflow-through-0051");
const projectId = `xflow-shared-schema-1-${process.pid}`;
const ports = await reserveLoopbackPorts(6);
const databasePort = ports[1];
const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${databasePort}/postgres`;
let started = false;

function run(executable, args, options = {}) {
  try {
    return execFileSync(executable, args, {
      cwd: options.cwd || root,
      env: options.env || process.env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (error) {
    const output = `${error.stdout || ""}\n${error.stderr || ""}`;
    throw new Error(`${path.basename(executable)} failed:\n${redactCommandOutput(output)}`);
  }
}

function sql(statement) {
  return run(psql, ["-h", "127.0.0.1", "-p", String(databasePort), "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA", "-c", statement], {
    env: { ...process.env, PGPASSWORD: "postgres" },
  }).trim();
}

function resetPlatform() {
  fs.rmSync(runtimeMigrations, { recursive: true, force: true });
  fs.mkdirSync(runtimeMigrations, { recursive: true });
  run(supabaseCli, ["db", "reset", "--local", "--no-seed", "--workdir", runtimeRoot, "--yes"]);
}

function copySharedMigrations() {
  fs.mkdirSync(runtimeMigrations, { recursive: true });
  for (const file of sharedFiles) {
    fs.copyFileSync(path.join(sharedMigrations, file), path.join(runtimeMigrations, file));
  }
}

function applySharedMigrations() {
  copySharedMigrations();
  run(supabaseCli, ["migration", "up", "--local", "--include-all", "--workdir", runtimeRoot, "--yes"]);
}

function runXFlow(migrationsFolder = xflowMigrations, expectFailure = false) {
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    XFLOW_SHARED_SCHEMA_MODE: "canonical",
    XFLOW_DESKTOP_LOCAL_TEST_ENV_LOADED: "true",
  };
  if (migrationsFolder !== xflowMigrations) {
    env.XFLOW_CANONICAL_BOOTSTRAP_PROOF = "true";
    env.XFLOW_MIGRATIONS_FOLDER = migrationsFolder;
  }
  try {
    const output = run(process.execPath, [xflowTsx, "scripts/migrate.ts"], { cwd: xflowRoot, env });
    if (expectFailure) throw new Error("XFlow migrations unexpectedly accepted an invalid shared-schema prerequisite.");
    return output;
  } catch (error) {
    if (!expectFailure) throw error;
    const message = String(error.message);
    if (!message.includes("Canonical shared schema prerequisite failed")) throw error;
    return message;
  }
}

function validateCanonicalSharedSchema() {
  const failures = sql(`
    SELECT concat_ws(';',
      CASE WHEN to_regclass('auth.users') IS NULL THEN 'auth.users missing' END,
      CASE WHEN to_regprocedure('auth.uid()') IS NULL THEN 'auth.uid missing' END,
      CASE WHEN to_regclass('core.profiles') IS NULL THEN 'core.profiles missing' END,
      CASE WHEN (SELECT format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid = 'core.profiles'::regclass AND attname = 'user_id') <> 'uuid' THEN 'profile user_id not uuid' END,
      CASE WHEN EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
          AND c.relkind = 'r'
          AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)
      ) THEN 'ecosystem table without RLS/FORCE RLS' END,
      CASE WHEN to_regprocedure('private.has_workspace_app_access(uuid,text)') IS NULL THEN 'private workspace-app helper missing' END,
      CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname IN ('core', 'xflow', 'verixet', 'audaix', 'rataify', 'wordgeni', 'crevux')
          AND p.prosecdef
      ) THEN 'security-definer helper remains in exposed ecosystem schema' END,
      CASE WHEN has_schema_privilege('anon', 'private', 'USAGE') THEN 'anon can use private schema' END,
      CASE WHEN has_function_privilege('anon', 'private.has_workspace_app_access(uuid,text)', 'EXECUTE') THEN 'anon can execute private workspace-app helper' END
    )
  `);
  if (failures) throw new Error(`Canonical shared-schema validation failed: ${failures}`);
}

function prepareThrough0051() {
  fs.mkdirSync(path.join(partialMigrations, "meta"), { recursive: true });
  const journal = JSON.parse(fs.readFileSync(path.join(xflowMigrations, "meta", "_journal.json"), "utf8"));
  const partialJournal = journalThroughTag(journal, "0051_agent_findings");
  for (const entry of partialJournal.entries) {
    const filename = `${entry.tag}.sql`;
    fs.copyFileSync(path.join(xflowMigrations, filename), path.join(partialMigrations, filename));
  }
  fs.writeFileSync(
    path.join(partialMigrations, "meta", "_journal.json"),
    `${JSON.stringify(partialJournal, null, 2)}\n`,
  );
}

try {
  fs.mkdirSync(supabaseDir, { recursive: true });
  fs.writeFileSync(
    path.join(supabaseDir, "config.toml"),
    buildDisposableSupabaseConfig({ projectId, ports }),
  );
  fs.mkdirSync(runtimeMigrations, { recursive: true });

  run(supabaseCli, ["start", "--workdir", runtimeRoot, "--yes"]);
  started = true;
  console.log("PASS disposable Supabase-compatible Auth/PostgreSQL stack started on loopback");

  runXFlow(xflowMigrations, true);
  if (sql("SELECT to_regclass('drizzle.__drizzle_migrations') IS NULL") !== "t") {
    throw new Error("Missing-prerequisite proof changed XFlow migration state.");
  }
  console.log("PASS missing core.profiles fails before XFlow migration state is created");

  sql(`CREATE SCHEMA core; CREATE TABLE core.profiles (user_id text PRIMARY KEY);`);
  runXFlow(xflowMigrations, true);
  console.log("PASS incompatible shared UUID/Auth relationship fails closed");

  resetPlatform();
  applySharedMigrations();
  validateCanonicalSharedSchema();
  runXFlow();
  const latestCount = Number(sql("SELECT count(*) FROM drizzle.__drizzle_migrations"));
  if (latestCount !== xflowFiles.length) {
    throw new Error(`Expected ${xflowFiles.length} XFlow migrations, found ${latestCount}.`);
  }
  console.log(`PASS empty database -> ${sharedFiles.length} canonical migrations -> ${latestCount} XFlow migrations`);

  resetPlatform();
  applySharedMigrations();
  validateCanonicalSharedSchema();
  prepareThrough0051();
  runXFlow(partialMigrations);
  const through0051 = Number(sql("SELECT count(*) FROM drizzle.__drizzle_migrations"));
  if (through0051 !== 52) throw new Error(`Expected 52 XFlow migrations through 0051, found ${through0051}.`);
  runXFlow();
  const upgradedCount = Number(sql("SELECT count(*) FROM drizzle.__drizzle_migrations"));
  if (upgradedCount !== xflowFiles.length) {
    throw new Error(`Expected ${xflowFiles.length} XFlow migrations after 0051 upgrade, found ${upgradedCount}.`);
  }
  console.log(`PASS shared schema + XFlow 0051 -> 0052+ -> current (${upgradedCount} migrations)`);

  const helperSecurityState = `
    SELECT concat_ws('|', p.prosecdef, p.provolatile, array_to_string(p.proconfig, ','),
      has_function_privilege('authenticated', p.oid, 'EXECUTE'),
      has_function_privilege('service_role', p.oid, 'EXECUTE'),
      has_function_privilege('anon', p.oid, 'EXECUTE'))
    FROM pg_proc p
    WHERE p.oid = 'private.has_workspace_app_access(uuid,text)'::regprocedure
  `;
  const helperBefore = sql(helperSecurityState);
  sql("DELETE FROM supabase_migrations.schema_migrations WHERE version = '063'");
  applySharedMigrations();
  const helperAfter = sql(helperSecurityState);
  if (helperBefore !== helperAfter || sql("SELECT count(*) FROM supabase_migrations.schema_migrations WHERE version = '063'") !== "1") {
    throw new Error("Late application of the idempotent 063 prerequisite changed the hardened helper or failed to restore history.");
  }
  console.log("PASS already-hardened database safely records the missing 063 prerequisite with --include-all");

  const sharedHistoryBefore = sql("SELECT string_agg(version, ',' ORDER BY version) FROM supabase_migrations.schema_migrations");
  const xflowHistoryBefore = sql("SELECT string_agg(hash, ',' ORDER BY created_at) FROM drizzle.__drizzle_migrations");
  applySharedMigrations();
  validateCanonicalSharedSchema();
  runXFlow();
  const sharedHistoryAfter = sql("SELECT string_agg(version, ',' ORDER BY version) FROM supabase_migrations.schema_migrations");
  const xflowHistoryAfter = sql("SELECT string_agg(hash, ',' ORDER BY created_at) FROM drizzle.__drizzle_migrations");
  if (sharedHistoryBefore !== sharedHistoryAfter || xflowHistoryBefore !== xflowHistoryAfter) {
    throw new Error("Already-current rerun changed migration history.");
  }
  console.log("PASS already-current validation/rerun is idempotent");
  console.log("canonical-shared-schema-bootstrap: ok");
} finally {
  if (started) {
    try {
      run(supabaseCli, ["stop", "--project-id", projectId, "--no-backup", "--yes"]);
    } catch (error) {
      console.error(redactCommandOutput(error.message));
    }
  }
  fs.rmSync(runtimeRoot, { recursive: true, force: true });
}
