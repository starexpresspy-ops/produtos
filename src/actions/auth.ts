"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function signInAdmin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado. Preencha o arquivo .env.local." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha invalidos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao foi possivel validar o login." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (!profile?.active || profile.role !== "lojista") {
    await supabase.auth.signOut();
    return { error: "Conta desativada ou sem permissao de lojista." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
