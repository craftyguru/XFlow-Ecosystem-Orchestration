import type { SupabaseEnv } from "./types";

type RuntimeGlobal = typeof globalThis & {
  process?: {
    env?: SupabaseEnv;
  };
};

type ImportMetaWithEnv = ImportMeta & {
  env?: SupabaseEnv;
};

function getRuntimeEnv(): SupabaseEnv {
  const env: SupabaseEnv = {};
  const processEnv = (globalThis as RuntimeGlobal).process?.env;
  if (processEnv) Object.assign(env, processEnv);

  const importMetaEnv = (import.meta as ImportMetaWithEnv).env;
  if (importMetaEnv) Object.assign(env, importMetaEnv);

  return env;
}

export function resolveEnv(providedEnv?: SupabaseEnv): SupabaseEnv {
  return providedEnv ?? getRuntimeEnv();
}

export function requireEnv(env: SupabaseEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }
  return value;
}

export function resolveBrowserSupabaseEnv(providedEnv?: SupabaseEnv): { url: string; anonKey: string } {
  const env = resolveEnv(providedEnv);
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing public Supabase URL: expected NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL");
  }
  if (!anonKey) {
    throw new Error("Missing public Supabase anon key: expected NEXT_PUBLIC_SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function resolveServerSupabaseEnv(providedEnv?: SupabaseEnv): { url: string; anonKey: string } {
  const env = resolveEnv(providedEnv);
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing Supabase URL: expected SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or VITE_SUPABASE_URL");
  }
  if (!anonKey) {
    throw new Error("Missing Supabase anon key: expected SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, or VITE_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function resolveServiceSupabaseEnv(providedEnv?: SupabaseEnv): { url: string; serviceRoleKey: string } {
  const env = resolveEnv(providedEnv);
  return {
    url: requireEnv(env, "SUPABASE_URL"),
    serviceRoleKey: requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY"),
  };
}
