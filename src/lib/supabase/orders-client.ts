import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { createPublicClient } from "@/lib/supabase/public";

/** Grava pedidos no servidor; prefere service role para nao depender de RLS anon. */
export function createOrdersClient() {
  if (isSupabaseServiceConfigured()) {
    return createServiceClient() as SupabaseClient;
  }

  return createPublicClient() as SupabaseClient;
}
