import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type StorefrontVisitLog = {
  id: string;
  ipAddress: string;
  path: string | null;
  createdAt: string;
};

function isMissingVisitLogsTableError(message?: string) {
  return Boolean(message?.includes("storefront_visit_logs"));
}

function mapVisitLog(row: {
  id: string;
  ip_address: string;
  path: string | null;
  created_at: string;
}): StorefrontVisitLog {
  return {
    id: row.id,
    ipAddress: row.ip_address,
    path: row.path,
    createdAt: row.created_at,
  };
}

export async function getStorefrontVisitLogs(
  limit = 100,
): Promise<{ logs: StorefrontVisitLog[]; tableMissing: boolean }> {
  if (!isSupabaseConfigured()) {
    return { logs: [], tableMissing: false };
  }

  const supabase = (await createClient()) as SupabaseClient;
  const { data, error } = await supabase
    .from("storefront_visit_logs")
    .select("id, ip_address, path, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingVisitLogsTableError(error.message)) {
      return { logs: [], tableMissing: true };
    }
    console.error("getStorefrontVisitLogs:", error.message);
    return { logs: [], tableMissing: false };
  }

  return {
    logs: (data ?? []).map(mapVisitLog),
    tableMissing: false,
  };
}
