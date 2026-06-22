import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromSupabasePackage = createRequire(
  path.join(repoRoot, "packages", "ecosystem-supabase", "package.json"),
);
const { createClient } = requireFromSupabasePackage("@supabase/supabase-js");

const envSources = new Map();
const rawValues = new Map();

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadDotenv(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separator = normalized.indexOf("=");
    if (separator <= 0) continue;
    const key = normalized.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    const value = unquote(normalized.slice(separator + 1));
    if (process.env[key] === undefined) {
      process.env[key] = value;
      envSources.set(key, relativePath);
      rawValues.set(key, value);
    }
  }
  return true;
}

function requireEnv(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function projectRefFromSupabaseUrl(value) {
  try {
    const host = new URL(value).host;
    const match = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return match?.[1] ?? host;
  } catch {
    return "invalid-url";
  }
}

function source(name) {
  return envSources.get(name) ?? (process.env[name] ? "process" : "missing");
}

function passwordShape(rawPassword) {
  return {
    effectiveLength: rawPassword.trim().length,
    hasLeadingOrTrailingWhitespace: rawPassword !== rawPassword.trim(),
    containsQuoteCharacters: /["']/.test(rawPassword),
  };
}

async function main() {
  const loadedShared = loadDotenv(".env.shared.local");
  const loadedPhase6d = loadDotenv(".env.phase6d.local");

  const supabaseUrl = requireEnv("SUPABASE_URL").trim();
  const anonKey = requireEnv("SUPABASE_ANON_KEY").trim();
  const email = requireEnv("TEST_USER_EMAIL").trim();
  const rawPassword = rawValues.get("TEST_USER_PASSWORD") ?? requireEnv("TEST_USER_PASSWORD");
  const effectivePassword = rawPassword.trim();
  const shape = passwordShape(rawPassword);

  console.log(
    JSON.stringify(
      {
        env: {
          sharedLoaded: loadedShared,
          phase6dLoaded: loadedPhase6d,
          supabaseUrlSource: source("SUPABASE_URL"),
          supabaseAnonKeySource: source("SUPABASE_ANON_KEY"),
          testUserEmailSource: source("TEST_USER_EMAIL"),
          testUserPasswordSource: source("TEST_USER_PASSWORD"),
        },
        supabase: {
          projectRef: projectRefFromSupabaseUrl(supabaseUrl),
        },
        testUser: {
          email,
          passwordLength: shape.effectiveLength,
          passwordHasLeadingOrTrailingWhitespace: shape.hasLeadingOrTrailingWhitespace,
          passwordContainsQuoteCharacters: shape.containsQuoteCharacters,
        },
      },
      null,
      2,
    ),
  );

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: effectivePassword,
  });

  if (error || !data?.user || !data?.session) {
    console.log(
      JSON.stringify(
        {
          signInSucceeded: false,
          error: {
            code: error?.code ?? error?.name ?? "unknown",
            message: error?.message ?? "missing user/session",
            status: error?.status ?? null,
          },
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        signInSucceeded: true,
        userIdPresent: Boolean(data.user.id),
        sessionPresent: Boolean(data.session.access_token),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(`[phase6d-auth-debug] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
