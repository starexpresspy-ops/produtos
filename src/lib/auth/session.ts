import { createClient } from "@/lib/supabase/server";
import { mapProfile } from "@/lib/supabase/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, name, role, active, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (!profileRow?.active) {
    return null;
  }

  const profile = mapProfile(profileRow);

  return {
    id: user.id,
    email: user.email,
    profile: {
      ...profile,
      email: user.email,
    },
  };
}
