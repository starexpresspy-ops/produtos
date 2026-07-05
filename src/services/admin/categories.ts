import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getAdminCategoriesList(options?: { activeOnly?: boolean }) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id, name, slug, active, sort_order")
    .order("sort_order");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getAdminCategoriesList:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAdminCategoryById(id: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, sort_order, active")
    .eq("id", id)
    .maybeSingle();
  return data;
}
