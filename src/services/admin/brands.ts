import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getAdminBrandsList(options?: { activeOnly?: boolean }) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("brands")
    .select("id, name, slug, logo_path, active")
    .order("name");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getAdminBrandsList:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAdminBrandById(id: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug, logo_path, active")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdminBrandsForProduct(
  currentBrandId?: string | null,
) {
  const brands = await getAdminBrandsList({ activeOnly: true });

  if (currentBrandId && !brands.some((brand) => brand.id === currentBrandId)) {
    const current = await getAdminBrandById(currentBrandId);
    if (current) {
      return [...brands, current].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
    }
  }

  return brands;
}
