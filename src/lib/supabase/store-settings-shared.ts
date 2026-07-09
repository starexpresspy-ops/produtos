import type { StoreSettings } from "@/types";
import { DEFAULT_MAINTENANCE_MESSAGE, STORE } from "@/constants/store";

export const STORE_SETTINGS_BASE_SELECT =
  "store_name, whatsapp_number, whatsapp_message_template, instagram_url, contact_email, address_text, delivery_text, warranty_text, exchange_policy, business_hours";

export const STORE_SETTINGS_WITH_SECONDARY_SELECT = `${STORE_SETTINGS_BASE_SELECT}, whatsapp_number_secondary, whatsapp_secondary_label`;

export const STORE_SETTINGS_FULL_SELECT = `${STORE_SETTINGS_WITH_SECONDARY_SELECT}, maintenance_mode, maintenance_message`;

export interface StoreSettingsRow {
  store_name: string;
  whatsapp_number: string;
  whatsapp_number_secondary?: string | null;
  whatsapp_secondary_label?: string | null;
  whatsapp_message_template: string | null;
  instagram_url: string | null;
  contact_email: string | null;
  address_text: string | null;
  delivery_text: string | null;
  warranty_text: string | null;
  exchange_policy: string | null;
  business_hours: string | null;
  maintenance_mode?: boolean | null;
  maintenance_message?: string | null;
}

export function isMissingSecondaryColumnsError(message?: string) {
  return Boolean(message?.includes("whatsapp_number_secondary"));
}

export function isMissingMaintenanceColumnsError(message?: string) {
  return Boolean(message?.includes("maintenance_mode"));
}

export function mapStoreSettingsRow(row: StoreSettingsRow): StoreSettings {
  return {
    storeName: row.store_name,
    whatsappNumber: row.whatsapp_number,
    whatsappNumberSecondary: row.whatsapp_number_secondary ?? undefined,
    whatsappSecondaryLabel: row.whatsapp_secondary_label ?? undefined,
    whatsappMessageTemplate: row.whatsapp_message_template ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    addressText: row.address_text ?? undefined,
    deliveryText: row.delivery_text ?? undefined,
    warrantyText: row.warranty_text ?? undefined,
    exchangePolicy: row.exchange_policy ?? undefined,
    businessHours: row.business_hours ?? undefined,
    maintenanceMode: Boolean(row.maintenance_mode),
    maintenanceMessage: row.maintenance_message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
  };
}

/** Fallback quando o Supabase ainda nao retornou store_settings. */
export function getEnvStoreSettings(): StoreSettings {
  return {
    storeName: STORE.name,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    whatsappMessageTemplate: undefined,
    instagramUrl: undefined,
    contactEmail: undefined,
    addressText: undefined,
    deliveryText: undefined,
    warrantyText: undefined,
    exchangePolicy: undefined,
    businessHours: undefined,
    maintenanceMode: false,
    maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE,
  };
}
