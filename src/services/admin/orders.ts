import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  isMissingOrderNumberColumnError,
  ORDER_LIST_SELECT_BASE,
  ORDER_LIST_SELECT_WITH_NUMBER,
} from "@/lib/formatters/order-number";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

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

function mapOrder(
  row: {
    id: string;
    order_number?: number | null;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    status: string;
    total: number;
    whatsapp_message: string | null;
    created_at: string;
    confirmed_at: string | null;
  },
  items: OrderItem[] = [],
): Order {
  return {
    id: row.id,
    orderNumber: row.order_number != null ? Number(row.order_number) : null,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    status: row.status as OrderStatus,
    total: Number(row.total),
    whatsappMessage: row.whatsapp_message,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    items,
  };
}

type OrderRow = Parameters<typeof mapOrder>[0];

async function fetchOrdersList(supabase: SupabaseClient) {
  const primary = await supabase
    .from("orders")
    .select(ORDER_LIST_SELECT_WITH_NUMBER)
    .order("created_at", { ascending: false });

  if (!isMissingOrderNumberColumnError(primary.error?.message)) {
    return primary;
  }

  return supabase
    .from("orders")
    .select(ORDER_LIST_SELECT_BASE)
    .order("created_at", { ascending: false });
}

async function fetchOrderById(supabase: SupabaseClient, id: string) {
  const primary = await supabase
    .from("orders")
    .select(ORDER_LIST_SELECT_WITH_NUMBER)
    .eq("id", id)
    .maybeSingle();

  if (!isMissingOrderNumberColumnError(primary.error?.message)) {
    return primary;
  }

  return supabase
    .from("orders")
    .select(ORDER_LIST_SELECT_BASE)
    .eq("id", id)
    .maybeSingle();
}

export async function getAdminOrdersList(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = (await createClient()) as SupabaseClient;
  const { data, error } = await fetchOrdersList(supabase);

  if (error) {
    console.error("getAdminOrdersList:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapOrder(row as OrderRow));
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = (await createClient()) as SupabaseClient;
  const { data: order, error } = await fetchOrderById(supabase, id);

  if (error || !order) {
    if (error) console.error("getAdminOrderById:", error.message);
    return null;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, product_name, product_slug, sku, short_description, unit_price, quantity, subtotal",
    )
    .eq("order_id", id)
    .order("product_name");

  return mapOrder(
    order as OrderRow,
    (items ?? []).map(mapOrderItem),
  );
}

export async function getPendingOrdersCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = (await createClient()) as SupabaseClient;
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    console.error("getPendingOrdersCount:", error.message);
    return 0;
  }

  return count ?? 0;
}
