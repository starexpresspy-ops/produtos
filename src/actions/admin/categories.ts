"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { categoryFormSchema } from "@/lib/validations/category";
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

export async function saveCategory(
  formData: FormData,
  categoryId?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    sort_order: parsed.data.sortOrder,
    active: parsed.data.active,
  };

  if (categoryId) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", categoryId);

    if (error) return { error: error.message };
    revalidatePaths();
    return { success: true, categoryId };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePaths();
  redirect(`/admin/categorias/${data.id}`);
}

export async function importCategoriesFromCsv(
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
    const description = row.description || row.descricao || null;
    const sortOrderRaw = row.sort_order || row.ordem || "0";
    const sortOrder = Number(sortOrderRaw) || 0;

    const { error } = await supabase.from("categories").upsert(
      { name, slug, description, sort_order: sortOrder, active },
      { onConflict: "slug" },
    );

    if (error) {
      skipped++;
      details.push(`Linha ${i + 2} (${name}): ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePaths();

  return {
    success: true,
    imported,
    skipped,
    details: details.slice(0, 10),
  };
}

function revalidatePaths() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidateStorefront();
}

export async function uploadCategoryImage(
  categoryId: string,
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
  const { data: category } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Categoria nao encontrada." };

  const upload = await uploadStoreAsset(
    supabase,
    "categories",
    categoryId,
    file,
  );
  if (upload.error || !upload.path) {
    return { error: upload.error ?? "Falha no upload." };
  }

  if (category.image_path) {
    await removeStoreAsset(supabase, category.image_path);
  }

  const { error } = await supabase
    .from("categories")
    .update({ image_path: upload.path })
    .eq("id", categoryId);

  if (error) {
    await removeStoreAsset(supabase, upload.path);
    return { error: error.message };
  }

  revalidatePaths();
  return { success: true, categoryId };
}

export async function removeCategoryImage(
  categoryId: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  try {
    await requireLojista();
  } catch {
    return { error: "Acesso negado." };
  }

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Categoria nao encontrada." };

  await removeStoreAsset(supabase, category.image_path);

  const { error } = await supabase
    .from("categories")
    .update({ image_path: null })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePaths();
  return { success: true, categoryId };
}
