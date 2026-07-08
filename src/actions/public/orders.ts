"use server";

import { createOrdersClient } from "@/lib/supabase/orders-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createOrderSchema } from "@/lib/validations/order";
import type { CartCustomerInfo, CartItem } from "@/types/cart";
import { getCartTotal, getLineTotal } from "@/lib/cart";
import type { ActionResult } from "@/types/actions";

export async function createOrderFromCart(input: {
  items: CartItem[];
  customer: CartCustomerInfo;
  whatsappMessage: string;
}): Promise<ActionResult & { orderId?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Sistema indisponivel no momento. Tente novamente." };
  }

  let supabase;
  try {
    supabase = createOrdersClient();
  } catch {
    return {
      error:
        "Pedidos temporariamente indisponiveis. A loja precisa configurar SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const total = getCartTotal(input.items);

  const parsed = createOrderSchema.safeParse({
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    customerAddress: input.customer.address,
    total,
    whatsappMessage: input.whatsappMessage,
    items: input.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      productSlug: item.slug,
      sku: item.sku,
      shortDescription: item.shortDescription,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: getLineTotal(item),
    })),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados do pedido invalidos." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: parsed.data.customerName,
      customer_phone: parsed.data.customerPhone,
      customer_address: parsed.data.customerAddress,
      total: parsed.data.total,
      whatsapp_message: parsed.data.whatsappMessage,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    const raw = orderError?.message ?? "";
    if (raw.includes("row-level security") || raw.includes("permission denied")) {
      return {
        error:
          "Nao foi possivel registrar o pedido. Verifique se as migrations de pedidos foram aplicadas no Supabase.",
      };
    }
    return { error: raw || "Nao foi possivel registrar o pedido." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    parsed.data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_slug: item.productSlug ?? null,
      sku: item.sku ?? null,
      short_description: item.shortDescription ?? null,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  return { success: true, orderId: order.id };
}
