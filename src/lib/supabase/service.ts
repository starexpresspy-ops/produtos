import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

let serviceClient: ReturnType<typeof createClient> | null = null;

/** Cliente com service role — apenas em Server Actions / API (nunca no browser). */
export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada.");
  }

  if (!serviceClient) {
    serviceClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return serviceClient;
}

export function isSupabaseServiceConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}
