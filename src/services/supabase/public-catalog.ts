import { createPublicClient } from "@/lib/supabase/public";
import { getPublicImageUrl } from "@/lib/supabase/mappers";
import {
  isMissingMaintenanceColumnsError,
  isMissingSecondaryColumnsError,
  mapStoreSettingsRow,
  STORE_SETTINGS_BASE_SELECT,
  STORE_SETTINGS_FULL_SELECT,
  STORE_SETTINGS_WITH_SECONDARY_SELECT,
  type StoreSettingsRow,
} from "@/lib/supabase/store-settings-shared";
import { enrichStoreSettingsWithMaintenance } from "@/lib/store/maintenance-state";
import { mapDbProduct } from "@/lib/supabase/product-mappers";
import type {
  Brand,
  Category,
  ProductSort,
  ProductWithRelations,
  StockStatus,
  StoreSettings,
} from "@/types";

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  availability?: StockStatus | "all";
  search?: string;
  sort?: ProductSort;
  featuredOnly?: boolean;
}

const PRODUCT_LIST_SELECT = `
  id, name, slug, sku, short_description,
  price, promotional_price, category_id, brand_id,
  stock_quantity, stock_status, hide_when_out_of_stock,
  condition, featured, active, sort_order, created_at,
  categories(id, name, slug, active, sort_order),
  brands(id, name, slug, active),
  product_images(id, storage_path, alt_text, sort_order, is_cover)
`;

const PRODUCT_DETAIL_SELECT = `
  id, name, slug, sku, short_description, description,
  price, promotional_price, category_id, brand_id,
  stock_quantity, stock_status, hide_when_out_of_stock,
  condition, featured, active, sort_order, created_at,
  categories(id, name, slug, description, image_path, active, sort_order),
  brands(id, name, slug, logo_path, active),
  product_images(id, storage_path, alt_text, sort_order, is_cover)
`;

function mapCategoryRow(c: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  active: boolean;
  sort_order: number;
}): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    imageUrl: c.image_path
      ? getPublicImageUrl("store-assets", c.image_path)
      : undefined,
    active: c.active,
    sortOrder: c.sort_order,
  };
}

function mapBrandRow(b: {
  id: string;
  name: string;
  slug: string;
  logo_path?: string | null;
  active: boolean;
}): Brand {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logo_path
      ? getPublicImageUrl("store-assets", b.logo_path)
      : undefined,
    active: b.active,
  };
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createPublicClient();
  let hasDbMaintenanceColumns = true;

  let { data, error } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_FULL_SELECT)
    .limit(1)
    .maybeSingle();

  if (isMissingMaintenanceColumnsError(error?.message)) {
    hasDbMaintenanceColumns = false;
    ({ data, error } = await supabase
      .from("store_settings")
      .select(STORE_SETTINGS_WITH_SECONDARY_SELECT)
      .limit(1)
      .maybeSingle());
  }

  if (isMissingSecondaryColumnsError(error?.message)) {
    ({ data, error } = await supabase
      .from("store_settings")
      .select(STORE_SETTINGS_BASE_SELECT)
      .limit(1)
      .maybeSingle());
  }

  if (error) {
    console.error("fetchStoreSettings:", error.message);
    return null;
  }

  if (!data) return null;

  const settings = mapStoreSettingsRow(data as StoreSettingsRow);
  return enrichStoreSettingsWithMaintenance(
    supabase,
    settings,
    hasDbMaintenanceColumns,
  );
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, active, sort_order")
    .eq("active", true)
    .order("sort_order");
  return (data ?? []).map(mapCategoryRow);
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, active, sort_order")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data ? mapCategoryRow(data) : undefined;
}

export async function fetchBrands(): Promise<Brand[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug, logo_path, active")
    .eq("active", true)
    .order("name");
  return (data ?? []).map(mapBrandRow);
}

export async function fetchAllProducts(): Promise<ProductWithRelations[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("active", true)
    .is("deleted_at", null);

  if (error || !data) return [];

  return data
    .map((row) => mapDbProduct(row))
    .filter(
      (p) => !(p.hideWhenOutOfStock && p.stockStatus === "unavailable"),
    );
}

export function filterProducts(
  products: ProductWithRelations[],
  filters: ProductFilters = {},
): ProductWithRelations[] {
  let result = products;

  if (filters.categorySlug) {
    result = result.filter((p) => p.category?.slug === filters.categorySlug);
  }
  if (filters.brandSlug) {
    result = result.filter((p) => p.brand?.slug === filters.brandSlug);
  }
  if (filters.availability && filters.availability !== "all") {
    result = result.filter((p) => p.stockStatus === filters.availability);
  }
  if (filters.featuredOnly) {
    result = result.filter((p) => p.featured);
  }
  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    if (term) {
      result = result.filter((p) =>
        [p.name, p.sku ?? "", p.shortDescription ?? "", p.brand?.name ?? "", p.category?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }
  }

  return sortProducts(result, filters.sort);
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<ProductWithRelations[]> {
  const all = await fetchAllProducts();
  return filterProducts(all, filters);
}

export async function fetchProductBySlug(
  slug: string,
): Promise<ProductWithRelations | undefined> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return undefined;
  const product = mapDbProduct(data);
  if (product.hideWhenOutOfStock && product.stockStatus === "unavailable") {
    return undefined;
  }
  return product;
}

export async function fetchRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductWithRelations[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .is("deleted_at", null)
    .limit(limit);

  return (data ?? [])
    .map((row) => mapDbProduct(row))
    .filter(
      (p) => !(p.hideWhenOutOfStock && p.stockStatus === "unavailable"),
    );
}

function sortProducts(
  products: ProductWithRelations[],
  sort: ProductSort = "recent",
): ProductWithRelations[] {
  const list = [...products];
  const price = (p: ProductWithRelations) =>
    p.promotionalPrice != null ? p.promotionalPrice : p.price;

  switch (sort) {
    case "price_asc":
      return list.sort((a, b) => price(a) - price(b));
    case "price_desc":
      return list.sort((a, b) => price(b) - price(a));
    case "featured":
      return list.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "custom":
      return list.sort((a, b) => a.sortOrder - b.sortOrder);
    default:
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}
