export type UserRole = "admin" | "lojista" | "cliente";

export type StockStatus = "available" | "unavailable" | "on_request";
export type ProductCondition = "new" | "used" | "open_box";
export type ProductSort =
  | "recent"
  | "price_asc"
  | "price_desc"
  | "featured"
  | "custom";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  active: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  promotionalPrice?: number | null;
  categoryId?: string | null;
  brandId?: string | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  hideWhenOutOfStock?: boolean;
  condition: ProductCondition;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  images: ProductImage[];
  warrantyText?: string | null;
  originText?: string | null;
}

export interface ProductWithRelations extends Product {
  category?: Category;
  brand?: Brand;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  whatsappNumberSecondary?: string;
  whatsappSecondaryLabel?: string;
  whatsappMessageTemplate?: string;
  instagramUrl?: string;
  contactEmail?: string;
  addressText?: string;
  deliveryText?: string;
  warrantyText?: string;
  exchangePolicy?: string;
  businessHours?: string;
}
