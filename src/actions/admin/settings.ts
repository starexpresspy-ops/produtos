"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { storeSettingsFormSchema, storeMaintenanceSchema } from "@/lib/validations/store-settings";
import { isMissingMaintenanceColumnsError, isMissingSecondaryColumnsError } from "@/lib/supabase/store-settings-shared";
import { writeMaintenanceToStorage } from "@/lib/store/maintenance-state";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { DEFAULT_MAINTENANCE_MESSAGE, STORE } from "@/constants/store";
import type { ActionResult } from "@/types/actions";

export async function saveStoreSettings(
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const parsed = storeSettingsFormSchema.safeParse({
    storeName: formData.get("storeName"),
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappNumberSecondary: formData.get("whatsappNumberSecondary"),
    whatsappSecondaryLabel: formData.get("whatsappSecondaryLabel"),
    whatsappMessageTemplate: formData.get("whatsappMessageTemplate"),
    instagramUrl: formData.get("instagramUrl"),
    contactEmail: formData.get("contactEmail"),
    addressText: formData.get("addressText"),
    deliveryText: formData.get("deliveryText"),
    warrantyText: formData.get("warrantyText"),
    exchangePolicy: formData.get("exchangePolicy"),
    businessHours: formData.get("businessHours"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createClient();
  const basePayload = {
    store_name: parsed.data.storeName,
    whatsapp_number: parsed.data.whatsappNumber.replace(/\D/g, ""),
    whatsapp_message_template: parsed.data.whatsappMessageTemplate,
    instagram_url: parsed.data.instagramUrl,
    contact_email: parsed.data.contactEmail,
    address_text: parsed.data.addressText,
    delivery_text: parsed.data.deliveryText,
    warranty_text: parsed.data.warrantyText,
    exchange_policy: parsed.data.exchangePolicy,
    business_hours: parsed.data.businessHours,
  };
  const fullPayload = {
    ...basePayload,
    whatsapp_number_secondary: parsed.data.whatsappNumberSecondary,
    whatsapp_secondary_label: parsed.data.whatsappSecondaryLabel,
  };

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  async function persist(payload: Record<string, unknown>) {
    if (existing?.id) {
      return supabase.from("store_settings").update(payload).eq("id", existing.id);
    }
    return supabase.from("store_settings").insert(payload);
  }

  let { error } = await persist(fullPayload);
  if (error && isMissingSecondaryColumnsError(error.message)) {
    ({ error } = await persist(basePayload));
  }

  if (error) return { error: error.message };

  revalidatePath("/admin/configuracoes");
  revalidateStorefront();
  return { success: true };
}

export async function setStoreMaintenance(
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const parsed = storeMaintenanceSchema.safeParse({
    enabled: formData.get("enabled") === "true",
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    maintenance_mode: parsed.data.enabled,
    maintenance_message: parsed.data.message,
  };

  let error;
  if (existing?.id) {
    ({ error } = await supabase
      .from("store_settings")
      .update(payload)
      .eq("id", existing.id));
  } else {
    const basePayload = {
      store_name: STORE.name,
      whatsapp_number: (
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5500000000000"
      ).replace(/\D/g, ""),
      ...payload,
    };
    ({ error } = await supabase.from("store_settings").insert(basePayload));
  }

  if (error) {
    if (isMissingMaintenanceColumnsError(error.message)) {
      const storageClient = isSupabaseServiceConfigured()
        ? createServiceClient()
        : supabase;
      const storageResult = await writeMaintenanceToStorage(storageClient, {
        enabled: parsed.data.enabled,
        message: parsed.data.message,
      });

      if (storageResult.error) {
        return {
          error:
            "Nao foi possivel salvar o modo manutencao. Execute supabase/migrations/20260713_store_maintenance.sql no Supabase ou verifique permissoes do storage.",
        };
      }

      revalidatePath("/admin/configuracoes");
      revalidateStorefront();
      return { success: true };
    }

    return { error: error.message };
  }

  revalidatePath("/admin/configuracoes");
  revalidateStorefront();
  return { success: true };
}

export async function getDefaultStoreSettingsForForm() {
  return {
    storeName: STORE.name,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    whatsappNumberSecondary: "",
    whatsappSecondaryLabel: "",
    whatsappMessageTemplate: "",
    instagramUrl: "",
    contactEmail: "",
    addressText: "",
    deliveryText: "",
    warrantyText: "",
    exchangePolicy: "",
    businessHours: "",
    maintenanceMode: false,
    maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE,
  };
}
