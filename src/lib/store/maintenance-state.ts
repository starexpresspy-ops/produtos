import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/constants/store";
import type { StoreSettings } from "@/types";

const BUCKET = "store-assets";
const STORAGE_PATH = "config/maintenance.json";

export type MaintenanceState = {
  enabled: boolean;
  message: string;
};

export async function readMaintenanceFromStorage(
  supabase: SupabaseClient,
): Promise<MaintenanceState | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH);

  if (error || !data) {
    return null;
  }

  try {
    const parsed = JSON.parse(await data.text()) as Partial<MaintenanceState>;
    return {
      enabled: Boolean(parsed.enabled),
      message: parsed.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
    };
  } catch {
    return null;
  }
}

export async function writeMaintenanceToStorage(
  supabase: SupabaseClient,
  state: MaintenanceState,
): Promise<{ error?: string }> {
  const body = JSON.stringify({
    enabled: state.enabled,
    message: state.message.trim() || DEFAULT_MAINTENANCE_MESSAGE,
  });

  const { error } = await supabase.storage.from(BUCKET).upload(
    STORAGE_PATH,
    new Blob([body], { type: "application/json" }),
    {
      upsert: true,
      contentType: "application/json",
    },
  );

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function enrichStoreSettingsWithMaintenance(
  supabase: SupabaseClient,
  settings: StoreSettings,
  hasDbMaintenanceColumns: boolean,
): Promise<StoreSettings> {
  if (hasDbMaintenanceColumns) {
    return settings;
  }

  const fromStorage = await readMaintenanceFromStorage(supabase);
  if (!fromStorage) {
    return settings;
  }

  return {
    ...settings,
    maintenanceMode: fromStorage.enabled,
    maintenanceMessage: fromStorage.message,
  };
}
