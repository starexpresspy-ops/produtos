"use server";

import { createOrdersClient } from "@/lib/supabase/orders-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createOrderSchema, mapOrderCreationError } from "@/lib/validations/order";
import type { CartCustomerInfo, CartItem } from "@/types/cart";
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

  const parsed = createOrderSchema.safeParse({
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    customerAddress: input.customer.address,
    whatsappMessage: input.whatsappMessage,
    items: input.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
    })),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados do pedido invalidos." };
  }

  const { data: orderId, error: orderError } = await supabase.rpc("create_public_order", {
    p_customer_name: parsed.data.customerName,
    p_customer_phone: parsed.data.customerPhone,
    p_customer_address: parsed.data.customerAddress,
    p_whatsapp_message: parsed.data.whatsappMessage,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
    })),
  });

  if (orderError || !orderId) {
    return { error: mapOrderCreationError(orderError?.message ?? "") };
  }

  return { success: true, orderId: orderId as string };
}
