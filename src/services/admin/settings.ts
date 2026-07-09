import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  isMissingMaintenanceColumnsError,
  isMissingSecondaryColumnsError,
  STORE_SETTINGS_BASE_SELECT,
  STORE_SETTINGS_FULL_SELECT,
  STORE_SETTINGS_WITH_SECONDARY_SELECT,
  type StoreSettingsRow,
} from "@/lib/supabase/store-settings-shared";

export type AdminStoreSettingsRow = StoreSettingsRow & { id: string };

export async function getAdminStoreSettings(): Promise<AdminStoreSettingsRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  let { data, error } = await supabase
    .from("store_settings")
    .select(`id, ${STORE_SETTINGS_FULL_SELECT}`)
    .limit(1)
    .maybeSingle();

  if (isMissingMaintenanceColumnsError(error?.message)) {
    ({ data, error } = await supabase
      .from("store_settings")
      .select(`id, ${STORE_SETTINGS_WITH_SECONDARY_SELECT}`)
      .limit(1)
      .maybeSingle());
  }

  if (isMissingSecondaryColumnsError(error?.message)) {
    ({ data, error } = await supabase
      .from("store_settings")
      .select(`id, ${STORE_SETTINGS_BASE_SELECT}`)
      .limit(1)
      .maybeSingle());
  }

  if (error) {
    console.error("getAdminStoreSettings:", error.message);
    return null;
  }

  return data;
}
