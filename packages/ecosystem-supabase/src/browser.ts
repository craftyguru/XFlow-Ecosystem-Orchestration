import { createClient } from "@supabase/supabase-js";
import { resolveBrowserSupabaseEnv } from "./env";
import type { SharedSupabaseClient, SupabaseClientOptions } from "./types";

export function createBrowserSupabaseClient(options: SupabaseClientOptions = {}): SharedSupabaseClient {
  const { url, anonKey } = resolveBrowserSupabaseEnv(options.env);

  return createClient(url, anonKey, {
    ...(options.global ? { global: options.global } : {}),
    auth: {
      persistSession: options.auth?.persistSession ?? true,
      autoRefreshToken: options.auth?.autoRefreshToken ?? true,
      detectSessionInUrl: options.auth?.detectSessionInUrl ?? true,
    },
  }) as SharedSupabaseClient;
}
