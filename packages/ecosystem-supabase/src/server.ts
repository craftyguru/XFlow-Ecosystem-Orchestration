import { createClient } from "@supabase/supabase-js";
import { resolveServerSupabaseEnv } from "./env";
import type { SharedSupabaseClient, SupabaseClientOptions } from "./types";

export function createServerSupabaseClient(options: SupabaseClientOptions = {}): SharedSupabaseClient {
  const { url, anonKey } = resolveServerSupabaseEnv(options.env);

  return createClient(url, anonKey, {
    ...(options.global ? { global: options.global } : {}),
    auth: {
      persistSession: options.auth?.persistSession ?? false,
      autoRefreshToken: options.auth?.autoRefreshToken ?? false,
      detectSessionInUrl: options.auth?.detectSessionInUrl ?? false,
    },
  }) as SharedSupabaseClient;
}
