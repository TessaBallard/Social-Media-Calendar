import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";

let supabaseClient: SupabaseClient | null = null;

export function missingSupabaseConfigError(): Error {
  return new Error("App storage is not configured.");
}

export function isSupabaseConfigured(
  url = import.meta.env.VITE_SUPABASE_URL,
  anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY,
): boolean {
  return Boolean(url && anonKey);
}

// Creates one browser client from environment variables. The anon key is public
// and is protected by Supabase row level security, not by hiding it.
export function getSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    logger.error("Supabase environment variables are missing");
    throw missingSupabaseConfigError();
  }

  if (!supabaseClient) {
    logger.debug("Creating Supabase client");
    supabaseClient = createClient(url, anonKey);
  }

  return supabaseClient;
}

export function requireSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw missingSupabaseConfigError();
  }

  return getSupabaseClient();
}
