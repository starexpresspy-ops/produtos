"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { brandFormSchema } from "@/lib/validations/brand";
import { slugify } from "@/lib/utils/slug";
import { parseCsv, parseBoolean } from "@/lib/utils/csv";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { removeStoreAsset, uploadStoreAsset } from "@/lib/supabase/store-assets";
import type { ActionResult, ImportResult } from "@/types/actions";

async function requireLojista() {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    throw new Error("Acesso negado.");
  }
  return user;
}

export async function saveBrand(
  formData: FormData,
  brandId?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const parsed = brandFormSchema.safeParse({
    name: formData.get("name"),
    slug: slugify(
      String(formData.get("slug") || formData.get("name") || ""),
    ),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    active: parsed.data.active,
  };

  if (brandId) {
    const { error } = await supabase
      .from("brands")
      .update(payload)
      .eq("id", brandId);

    if (error) return { error: error.message };
    revalidatePath("/admin/marcas");
    revalidatePath("/admin/produtos");
    return { success: true, brandId };
  }

  const { data, error } = await supabase
    .from("brands")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/produtos");
  return { success: true, brandId: data.id };
}

export async function importBrandsFromCsv(
  formData: FormData,
): Promise<ImportResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV." };
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  if (!headers.includes("name") && !headers.includes("nome")) {
    return {
      error: "CSV invalido. Coluna obrigatoria: name (ou nome).",
    };
  }

  const supabase = await createClient();
  let imported = 0;
  let skipped = 0;
  const details: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name || row.nome;
    if (!name) {
      skipped++;
      details.push(`Linha ${i + 2}: nome vazio, ignorada.`);
      continue;
    }

    const slug = row.slug || slugify(name);
    const active = parseBoolean(row.active ?? row.ativo, true);

    const { error } = await supabase.from("brands").upsert(
      { name, slug, active },
      { onConflict: "slug" },
    );

    if (error) {
      skipped++;
      details.push(`Linha ${i + 2} (${name}): ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/produtos");
  revalidateStorefront();

  return {
    success: true,
    imported,
    skipped,
    details: details.slice(0, 10),
  };
}

export async function uploadBrandLogo(
  brandId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }

  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("logo_path")
    .eq("id", brandId)
    .single();

  if (!brand) return { error: "Marca nao encontrada." };

  const upload = await uploadStoreAsset(supabase, "brands", brandId, file);
  if (upload.error || !upload.path) {
    return { error: upload.error ?? "Falha no upload." };
  }

  if (brand.logo_path) {
    await removeStoreAsset(supabase, brand.logo_path);
  }

  const { error } = await supabase
    .from("brands")
    .update({ logo_path: upload.path })
    .eq("id", brandId);

  if (error) {
    await removeStoreAsset(supabase, upload.path);
    return { error: error.message };
  }

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/produtos");
  revalidateStorefront();
  return { success: true, brandId };
}

export async function removeBrandLogo(brandId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("logo_path")
    .eq("id", brandId)
    .single();

  if (!brand) return { error: "Marca nao encontrada." };

  await removeStoreAsset(supabase, brand.logo_path);

  const { error } = await supabase
    .from("brands")
    .update({ logo_path: null })
    .eq("id", brandId);

  if (error) return { error: error.message };

  revalidatePath("/admin/marcas");
  return { success: true, brandId };
}
