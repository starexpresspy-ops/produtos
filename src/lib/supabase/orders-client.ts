import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";

export function createOrdersClient() {
  return createPublicClient() as SupabaseClient;
}
