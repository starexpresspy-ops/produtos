import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface AdminStoreSettingsRow {
  id: string;
  store_name: string;
  whatsapp_number: string;
  whatsapp_message_template: string | null;
  instagram_url: string | null;
  contact_email: string | null;
  address_text: string | null;
  delivery_text: string | null;
  warranty_text: string | null;
  exchange_policy: string | null;
  business_hours: string | null;
}

export async function getAdminStoreSettings(): Promise<AdminStoreSettingsRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "id, store_name, whatsapp_number, whatsapp_message_template, instagram_url, contact_email, address_text, delivery_text, warranty_text, exchange_policy, business_hours",
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getAdminStoreSettings:", error.message);
    return null;
  }

  return data;
}
