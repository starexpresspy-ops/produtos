export type OrderStatus = "pending" | "confirmed";

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productSlug?: string | null;
  sku?: string | null;
  shortDescription?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber?: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  total: number;
  whatsappMessage?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  items?: OrderItem[];
}
