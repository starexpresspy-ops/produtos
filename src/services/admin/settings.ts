import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  readMaintenanceFromStorage,
  writeMaintenanceToStorage,
} from "@/lib/store/maintenance-state";
import {
  isMissingMaintenanceColumnsError,
  isMissingSecondaryColumnsError,
  STORE_SETTINGS_BASE_SELECT,
  STORE_SETTINGS_FULL_SELECT,
  STORE_SETTINGS_WITH_SECONDARY_SELECT,
  type StoreSettingsRow,
} from "@/lib/supabase/store-settings-shared";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/constants/store";

export type AdminStoreSettingsRow = StoreSettingsRow & { id: string };

export async function getAdminMaintenanceState(): Promise<{
  maintenanceMode: boolean;
  maintenanceMessage: string;
  hasDbMaintenanceColumns: boolean;
}> {
  const row = await getAdminStoreSettings();
  const supabase = await createClient();
  const hasDbMaintenanceColumns =
    row != null && Object.prototype.hasOwnProperty.call(row, "maintenance_mode");

  if (hasDbMaintenanceColumns && row) {
    return {
      maintenanceMode: Boolean(row.maintenance_mode),
      maintenanceMessage:
        row.maintenance_message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
      hasDbMaintenanceColumns: true,
    };
  }

  const fromStorage = await readMaintenanceFromStorage(supabase);
  return {
    maintenanceMode: fromStorage?.enabled ?? false,
    maintenanceMessage: fromStorage?.message ?? DEFAULT_MAINTENANCE_MESSAGE,
    hasDbMaintenanceColumns: false,
  };
}

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
