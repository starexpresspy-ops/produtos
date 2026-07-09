"use server";

import { createOrdersClient } from "@/lib/supabase/orders-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createOrderSchema, mapOrderCreationError } from "@/lib/validations/order";
import {
  createPublicOrder,
  OrderCreationError,
} from "@/lib/orders/create-public-order";
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

  try {
    const orderId = await createPublicOrder(supabase, {
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
      whatsappMessage: parsed.data.whatsappMessage,
      items: parsed.data.items,
    });

    return { success: true, orderId };
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return { error: mapOrderCreationError(error.message) };
    }

    const message = error instanceof Error ? error.message : "";
    return { error: mapOrderCreationError(message) };
  }
}
