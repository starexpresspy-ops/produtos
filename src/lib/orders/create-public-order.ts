import type { SupabaseClient } from "@supabase/supabase-js";
import { CART_SHIPPING_FEE } from "@/constants/cart";
import { isMissingOrderNumberColumnError } from "@/lib/formatters/order-number";

export type CreateOrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  whatsappMessage: string;
  items: CreateOrderItemInput[];
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  price: number;
  promotional_price: number | null;
  stock_status: string;
  stock_quantity: number;
};

export class OrderCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderCreationError";
  }
}

async function pendingQuantityForProduct(
  supabase: SupabaseClient,
  productId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, orders!inner(status)")
    .eq("product_id", productId)
    .eq("orders.status", "pending");

  if (error) return 0;

  return (data ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
}

export async function createPublicOrder(
  supabase: SupabaseClient,
  input: CreateOrderInput,
): Promise<string> {
  if (!input.items.length) {
    throw new OrderCreationError("ORDER_EMPTY: O pedido precisa ter ao menos um item.");
  }

  const grouped = new Map<string, { productName: string; quantity: number }>();
  for (const item of input.items) {
    if (item.quantity < 1) {
      throw new OrderCreationError("ORDER_INVALID_QTY: Quantidade invalida.");
    }
    const existing = grouped.get(item.productId);
    grouped.set(item.productId, {
      productName: item.productName,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  let subtotal = 0;
  const lines: Array<{
    product: ProductRow;
    quantity: number;
    unitPrice: number;
  }> = [];

  for (const [productId, { productName, quantity }] of grouped) {
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, sku, short_description, price, promotional_price, stock_status, stock_quantity",
      )
      .eq("id", productId)
      .eq("active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !product) {
      throw new OrderCreationError(`ORDER_UNAVAILABLE:${productName}`);
    }

    if (product.stock_status === "unavailable") {
      throw new OrderCreationError(`ORDER_UNAVAILABLE:${product.name}`);
    }

    if (product.stock_quantity > 0) {
      const pendingQty = await pendingQuantityForProduct(supabase, productId);
      if (pendingQty + quantity > product.stock_quantity) {
        throw new OrderCreationError(`ORDER_OUT_OF_STOCK:${product.name}`);
      }
    }

    const unitPrice = Number(product.promotional_price ?? product.price);
    subtotal += unitPrice * quantity;
    lines.push({ product, quantity, unitPrice });
  }

  const total = subtotal + CART_SHIPPING_FEE;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_address: input.customerAddress,
      total,
      whatsapp_message: input.whatsappMessage,
      status: "pending",
    })
    .select("id, order_number")
    .maybeSingle();

  if (orderError || !order) {
    if (!isMissingOrderNumberColumnError(orderError?.message)) {
      throw new Error(orderError?.message ?? "Nao foi possivel registrar o pedido.");
    }

    const { data: fallbackOrder, error: fallbackError } = await supabase
      .from("orders")
      .insert({
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_address: input.customerAddress,
        total,
        whatsapp_message: input.whatsappMessage,
        status: "pending",
      })
      .select("id")
      .single();

    if (fallbackError || !fallbackOrder) {
      throw new Error(fallbackError?.message ?? "Nao foi possivel registrar o pedido.");
    }

    await finalizeOrder(supabase, fallbackOrder.id, null, input.whatsappMessage, lines);
    return fallbackOrder.id;
  }

  const orderNumber =
    order.order_number != null ? Number(order.order_number) : null;

  await finalizeOrder(supabase, order.id, orderNumber, input.whatsappMessage, lines);

  return order.id;
}

async function finalizeOrder(
  supabase: SupabaseClient,
  orderId: string,
  orderNumber: number | null,
  whatsappMessage: string,
  lines: Array<{ product: ProductRow; quantity: number; unitPrice: number }>,
) {
  const orderLabel =
    orderNumber != null
      ? `Pedido #${orderNumber}`
      : `Pedido ${orderId.slice(0, 8).toUpperCase()}`;

  await supabase
    .from("orders")
    .update({
      whatsapp_message: `${orderLabel}\n\n${whatsappMessage}`,
    })
    .eq("id", orderId);

  for (const line of lines) {
    const { error } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: line.product.id,
      product_name: line.product.name,
      product_slug: line.product.slug,
      sku: line.product.sku,
      short_description: line.product.short_description,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      subtotal: line.unitPrice * line.quantity,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
