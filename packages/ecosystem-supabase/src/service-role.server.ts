import { createClient } from "@supabase/supabase-js";
import { resolveServiceSupabaseEnv } from "./env";
import type { SharedSupabaseClient, SupabaseClientOptions } from "./types";

type BrowserLikeGlobal = typeof globalThis & {
  window?: unknown;
};

function assertServerRuntime(): void {
  if (typeof (globalThis as BrowserLikeGlobal).window !== "undefined") {
    throw new Error("createServiceSupabaseClient is server-only and must not run in a browser/client bundle");
  }
}

export function createServiceSupabaseClient(options: SupabaseClientOptions = {}): SharedSupabaseClient {
  assertServerRuntime();
  // Server-only contract: resolveServiceSupabaseEnv reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
  const { url, serviceRoleKey } = resolveServiceSupabaseEnv(options.env);

  return createClient(url, serviceRoleKey, {
    ...(options.global ? { global: options.global } : {}),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }) as SharedSupabaseClient;
}
