import type { StockStatus } from "@/types";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  stockStatus: StockStatus;
  stockQuantity: number;
}

export interface CartCustomerInfo {
  name: string;
  cpf: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  zip: string;
  phone: string;
}
