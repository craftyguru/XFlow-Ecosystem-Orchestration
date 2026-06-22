import fs from "node:fs";
import path from "node:path";

export type LoadedSharedLocalEnvFile = {
  path: string;
  loaded: boolean;
  appliedKeys: string[];
};

export type LoadSharedLocalEnvOptions = {
  repoRoot: string;
  appDir?: string;
  env?: NodeJS.ProcessEnv;
};

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(filePath: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separator = normalized.indexOf("=");
    if (separator <= 0) continue;

    const key = normalized.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    parsed[key] = unquote(normalized.slice(separator + 1));
  }

  return parsed;
}

function loadFile(filePath: string, env: NodeJS.ProcessEnv, override: boolean): LoadedSharedLocalEnvFile {
  if (!fs.existsSync(filePath)) {
    return { path: filePath, loaded: false, appliedKeys: [] };
  }

  const parsed = parseEnvFile(filePath);
  const appliedKeys: string[] = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (override || env[key] === undefined) {
      env[key] = value;
      appliedKeys.push(key);
    }
  }

  return { path: filePath, loaded: true, appliedKeys };
}

export function loadSharedLocalEnv(options: LoadSharedLocalEnvOptions): LoadedSharedLocalEnvFile[] {
  const env = options.env ?? process.env;
  const loadedFiles: LoadedSharedLocalEnvFile[] = [];

  loadedFiles.push(loadFile(path.join(options.repoRoot, ".env.shared.local"), env, false));

  if (options.appDir) {
    loadedFiles.push(loadFile(path.join(options.appDir, ".env.local"), env, true));
    loadedFiles.push(loadFile(path.join(options.appDir, ".env"), env, true));
  }

  return loadedFiles;
}
