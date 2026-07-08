"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActionResult } from "@/types/actions";

async function requireLojista() {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    throw new Error("Acesso negado.");
  }
  return user;
}

export async function confirmOrder(orderId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  let user;
  try {
    user = await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const supabase = (await createClient()) as SupabaseClient;
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { error: "Pedido nao encontrado." };
  if (order.status !== "pending") {
    return { error: "Este pedido ja foi confirmado." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: user.id,
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { success: true, orderId };
}

export async function deleteOrder(orderId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const supabase = (await createClient()) as SupabaseClient;
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { error: "Pedido nao encontrado." };
  if (order.status !== "confirmed") {
    return { error: "Confirme o pedido antes de apagar." };
  }

  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { success: true };
}
