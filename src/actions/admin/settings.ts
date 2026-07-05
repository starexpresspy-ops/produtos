"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { storeSettingsFormSchema } from "@/lib/validations/store-settings";
import { STORE } from "@/constants/store";
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
  const payload = {
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

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("store_settings")
      .update(payload)
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("store_settings").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/configuracoes");
  revalidateStorefront();
  return { success: true };
}

export async function getDefaultStoreSettingsForForm() {
  return {
    storeName: STORE.name,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    whatsappMessageTemplate: "",
    instagramUrl: "",
    contactEmail: "",
    addressText: "",
    deliveryText: "",
    warrantyText: "",
    exchangePolicy: "",
    businessHours: "",
  };
}
