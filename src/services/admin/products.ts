import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getAdminProductsList() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, promotional_price, stock_status, active, featured, categories(id,name), brands(id,name)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminProductsList:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAdminProductById(id: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, short_description, description, price, promotional_price, category_id, brand_id, stock_quantity, stock_status, condition, featured, active, product_images(id,storage_path,is_cover)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}
