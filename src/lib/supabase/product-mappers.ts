import { getPublicImageUrl } from "@/lib/supabase/mappers";
import type { ProductWithRelations } from "@/types";

export const MAX_PRODUCT_IMAGES = 8;

export function mapDbProduct(row: any): ProductWithRelations {
  const images = (row.product_images ?? []).map((img: any) => ({
    id: img.id,
    url: getPublicImageUrl("product-images", img.storage_path) ?? "",
    alt: img.alt_text ?? undefined,
    sortOrder: img.sort_order ?? 0,
    isCover: img.is_cover ?? false,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price ?? 0),
    promotionalPrice:
      row.promotional_price == null ? null : Number(row.promotional_price),
    categoryId: row.category_id,
    brandId: row.brand_id,
    stockQuantity: Number(row.stock_quantity ?? 0),
    stockStatus: row.stock_status,
    hideWhenOutOfStock: row.hide_when_out_of_stock ?? false,
    condition: row.condition,
    featured: row.featured ?? false,
    active: row.active ?? true,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    images,
    category: row.categories
      ? {
          id: row.categories.id,
          name: row.categories.name,
          slug: row.categories.slug,
          description: row.categories.description ?? undefined,
          imageUrl: getPublicImageUrl("store-assets", row.categories.image_path),
          active: row.categories.active ?? true,
          sortOrder: row.categories.sort_order ?? 0,
        }
      : undefined,
    brand: row.brands
      ? {
          id: row.brands.id,
          name: row.brands.name,
          slug: row.brands.slug,
          logoUrl: getPublicImageUrl("store-assets", row.brands.logo_path),
          active: row.brands.active ?? true,
        }
      : undefined,
  };
}
