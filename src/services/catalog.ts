import { cache } from "react";
import { unstable_cache } from "next/cache";
import type {
  Brand,
  Category,
  Product,
  ProductSort,
  ProductWithRelations,
  StockStatus,
  StoreSettings,
} from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  fetchAllProducts,
  fetchBrands,
  fetchCategories,
  fetchCategoryBySlug,
  fetchProductBySlug,
  fetchRelatedProducts,
  filterProducts,
  type ProductFilters,
} from "@/services/supabase/public-catalog";
import { DEMO_CATEGORIES } from "@/lib/data/categories";
import { DEMO_BRANDS } from "@/lib/data/brands";
import { DEMO_PRODUCTS } from "@/lib/data/products";
import { DEMO_STORE_SETTINGS } from "@/lib/data/store-settings";
import { getEnvStoreSettings } from "@/lib/supabase/store-settings-shared";

export type { ProductFilters };

const CACHE_SECONDS = 60;

const getCachedStoreSettings = unstable_cache(
  async () => {
    const { fetchStoreSettings } = await import(
      "@/services/supabase/public-catalog"
    );
    return fetchStoreSettings();
  },
  ["store-settings"],
  { revalidate: CACHE_SECONDS, tags: ["catalog"] },
);

const getCachedCategories = unstable_cache(
  async () => fetchCategories(),
  ["categories"],
  { revalidate: CACHE_SECONDS, tags: ["catalog"] },
);

const getCachedBrands = unstable_cache(
  async () => fetchBrands(),
  ["brands"],
  { revalidate: CACHE_SECONDS, tags: ["catalog"] },
);

const getCachedAllProducts = unstable_cache(
  async () => fetchAllProducts(),
  ["products"],
  { revalidate: CACHE_SECONDS, tags: ["catalog", "products"] },
);

function resolveProduct(product: Product): ProductWithRelations {
  return {
    ...product,
    category: DEMO_CATEGORIES.find((c) => c.id === product.categoryId),
    brand: product.brandId
      ? DEMO_BRANDS.find((b) => b.id === product.brandId)
      : undefined,
  };
}

function isPubliclyVisible(product: Product): boolean {
  if (!product.active) return false;
  if (product.hideWhenOutOfStock && product.stockStatus === "unavailable") {
    return false;
  }
  return true;
}

function sortProducts(
  products: ProductWithRelations[],
  sort: ProductSort = "recent",
): ProductWithRelations[] {
  const list = [...products];
  switch (sort) {
    case "price_asc":
      return list.sort(
        (a, b) => effectivePrice(a) - effectivePrice(b),
      );
    case "price_desc":
      return list.sort(
        (a, b) => effectivePrice(b) - effectivePrice(a),
      );
    case "featured":
      return list.sort(
        (a, b) => Number(b.featured) - Number(a.featured),
      );
    case "custom":
      return list.sort((a, b) => a.sortOrder - b.sortOrder);
    case "recent":
    default:
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export function effectivePrice(product: Product): number {
  return product.promotionalPrice != null
    ? product.promotionalPrice
    : product.price;
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (isSupabaseConfigured()) {
    const settings = await getCachedStoreSettings();
    if (settings) return settings;
    const fromEnv = getEnvStoreSettings();
    if (fromEnv.whatsappNumber) return fromEnv;
  }
  return DEMO_STORE_SETTINGS;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    return getCachedCategories();
  }
  return DEMO_CATEGORIES.filter((c) => c.active).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
});

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | undefined> => {
    if (isSupabaseConfigured()) {
      return fetchCategoryBySlug(slug);
    }
    return DEMO_CATEGORIES.find((c) => c.active && c.slug === slug);
  },
);

export const getBrands = cache(async (): Promise<Brand[]> => {
  if (isSupabaseConfigured()) {
    return getCachedBrands();
  }
  return DEMO_BRANDS.filter((b) => b.active).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
});

export const getProducts = cache(
  async (filters: ProductFilters = {}): Promise<ProductWithRelations[]> => {
    if (isSupabaseConfigured()) {
      const all = await getCachedAllProducts();
      return filterProducts(all, filters);
    }

    let result = DEMO_PRODUCTS.filter(isPubliclyVisible).map(resolveProduct);

    if (filters.categorySlug) {
      result = result.filter(
        (p) => p.category?.slug === filters.categorySlug,
      );
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
        result = result.filter((p) => {
          const haystack = [
            p.name,
            p.sku ?? "",
            p.shortDescription ?? "",
            p.brand?.name ?? "",
            p.category?.name ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(term);
        });
      }
    }

    return sortProducts(result, filters.sort);
  },
);

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductWithRelations | undefined> => {
    if (isSupabaseConfigured()) {
      return fetchProductBySlug(slug);
    }

    const product = DEMO_PRODUCTS.find(
      (p) => p.slug === slug && isPubliclyVisible(p),
    );
    return product ? resolveProduct(product) : undefined;
  },
);

export async function getFeaturedProducts(
  limit = 4,
): Promise<ProductWithRelations[]> {
  const featured = await getProducts({ featuredOnly: true, sort: "custom" });
  return featured.slice(0, limit);
}

export async function getRecentProducts(
  limit = 8,
): Promise<ProductWithRelations[]> {
  const recent = await getProducts({ sort: "recent" });
  return recent.slice(0, limit);
}

/** Uma unica busca para a home — evita 2 downloads do catalogo. */
export async function getHomeProducts(): Promise<{
  featured: ProductWithRelations[];
  recent: ProductWithRelations[];
}> {
  const all = await getProducts();
  const featured = sortProducts(
    all.filter((p) => p.featured),
    "custom",
  ).slice(0, 4);
  const recent = sortProducts(all, "recent").slice(0, 8);
  return { featured, recent };
}

export async function getRelatedProducts(
  product: ProductWithRelations,
  limit = 4,
): Promise<ProductWithRelations[]> {
  if (isSupabaseConfigured() && product.categoryId) {
    return fetchRelatedProducts(product.categoryId, product.id, limit);
  }

  const sameCategory = await getProducts({
    categorySlug: product.category?.slug,
    sort: "custom",
  });
  return sameCategory.filter((p) => p.id !== product.id).slice(0, limit);
}
