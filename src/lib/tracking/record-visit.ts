import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { getClientIpFromHeaders, normalizeVisitPath } from "@/lib/tracking/client-ip";

const DEBOUNCE_MS = 2 * 60 * 1000;

export async function recordStorefrontVisit(input: {
  ip: string;
  path?: string | null;
  userAgent?: string | null;
}) {
  if (!isSupabaseServiceConfigured()) {
    return;
  }

  const ip = input.ip.trim() || "desconhecido";
  const path = normalizeVisitPath(input.path);
  const userAgent = input.userAgent?.trim() || null;

  try {
    const supabase = createServiceClient();
    const since = new Date(Date.now() - DEBOUNCE_MS).toISOString();

    const { count } = await supabase
      .from("storefront_visit_logs")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("path", path)
      .gte("created_at", since);

    if ((count ?? 0) > 0) {
      return;
    }

    await supabase.from("storefront_visit_logs").insert({
      ip_address: ip,
      path,
      user_agent: userAgent,
    } as never);
  } catch (error) {
    console.error("recordStorefrontVisit:", error);
  }
}

export async function recordStorefrontVisitFromHeaders(
  headerStore: Headers,
  path?: string | null,
) {
  await recordStorefrontVisit({
    ip: getClientIpFromHeaders(headerStore),
    path,
    userAgent: headerStore.get("user-agent"),
  });
}
