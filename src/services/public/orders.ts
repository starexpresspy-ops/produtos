import { createOrdersClient } from "@/lib/supabase/orders-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Order, OrderItem } from "@/types/order";

function mapOrderItem(row: {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  sku: string | null;
  short_description: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    sku: row.sku,
    shortDescription: row.short_description,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    subtotal: Number(row.subtotal),
  };
}

export async function getPublicOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createOrdersClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, customer_address, status, total, whatsapp_message, created_at, confirmed_at",
    )
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !order) {
    if (error) console.error("getPublicOrderById:", error.message);
    return null;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, product_name, product_slug, sku, short_description, unit_price, quantity, subtotal",
    )
    .eq("order_id", id)
    .order("product_name");

  return {
    id: order.id,
    orderNumber: Number(order.order_number),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    status: order.status as Order["status"],
    total: Number(order.total),
    whatsappMessage: order.whatsapp_message,
    createdAt: order.created_at,
    confirmedAt: order.confirmed_at,
    items: (items ?? []).map(mapOrderItem),
  };
}
