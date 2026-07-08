import { CART_MAX_QUANTITY } from "@/constants/cart";
import type { CartItem } from "@/types/cart";
import type { ProductWithRelations } from "@/types";

export function getLineTotal(item: CartItem) {
  return item.unitPrice * item.quantity;
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function productToCartItem(product: ProductWithRelations): CartItem {
  const cover = product.images.find((img) => img.isCover) ?? product.images[0];

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    sku: product.sku,
    unitPrice: product.promotionalPrice ?? product.price,
    quantity: 1,
    imageUrl: cover?.url,
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity,
  };
}

export function getMaxQuantity(item: Pick<CartItem, "stockStatus" | "stockQuantity">) {
  if (item.stockStatus === "unavailable") return 0;
  if (item.stockQuantity > 0) {
    return Math.min(item.stockQuantity, CART_MAX_QUANTITY);
  }
  return CART_MAX_QUANTITY;
}

export function clampQuantity(
  item: Pick<CartItem, "stockStatus" | "stockQuantity">,
  quantity: number,
) {
  const max = getMaxQuantity(item);
  if (max === 0) return 0;
  return Math.max(1, Math.min(quantity, max));
}
