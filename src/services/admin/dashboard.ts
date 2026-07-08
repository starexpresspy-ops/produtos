import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getPendingOrdersCount } from "@/services/admin/orders";

export async function getAdminDashboardStats() {
  if (!isSupabaseConfigured()) {
    return {
      products: 0,
      categories: 0,
      brands: 0,
      highlights: 0,
      pendingOrders: 0,
    };
  }

  const supabase = await createClient();
  const [{ count: products }, { count: categories }, { count: brands }, pendingOrders] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("brands").select("id", { count: "exact", head: true }),
      getPendingOrdersCount(),
    ]);

  return {
    products: products ?? 0,
    categories: categories ?? 0,
    brands: brands ?? 0,
    highlights: 0,
    pendingOrders,
  };
}
