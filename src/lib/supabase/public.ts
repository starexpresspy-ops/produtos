import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

let publicClient: ReturnType<typeof createClient> | null = null;

/** Cliente somente leitura, sem cookies — permite cache e ISR na vitrine. */
export function createPublicClient() {
  if (!publicClient) {
    publicClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}
