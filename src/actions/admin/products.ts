"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { productFormSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils/slug";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  uploadProductImageFile,
} from "@/lib/supabase/product-images";
import type { ActionResult } from "@/types/actions";

export async function saveProduct(
  formData: FormData,
  productId?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    sku: formData.get("sku") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    promotionalPrice: formData.get("promotionalPrice") || null,
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || null,
    stockQuantity: formData.get("stockQuantity"),
    stockStatus: formData.get("stockStatus"),
    condition: formData.get("condition"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }

  const supabase = await createClient();
  const basePayload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    sku: parsed.data.sku || null,
    short_description: parsed.data.shortDescription || null,
    description: parsed.data.description || null,
    price: parsed.data.price,
    promotional_price: parsed.data.promotionalPrice,
    category_id: parsed.data.categoryId,
    brand_id: parsed.data.brandId || null,
    stock_quantity: parsed.data.stockQuantity,
    stock_status: parsed.data.stockStatus,
    condition: parsed.data.condition,
    featured: parsed.data.featured,
    active: parsed.data.active,
  };

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update({
        ...basePayload,
        updated_by: user.id,
      })
      .eq("id", productId);

    if (error) return { error: error.message };
    revalidatePath("/admin/produtos");
    revalidateStorefront();
    return { success: true, productId };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...basePayload,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${data.id}`);
}

export async function uploadProductImages(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "Selecione ao menos uma imagem." };
  }

  const supabase = await createClient();
  let uploaded = 0;

  for (const file of files) {
    const result = await uploadProductImageFile(supabase, productId, file);
    if (result.error) {
      return {
        error: uploaded > 0
          ? `${uploaded} imagem(ns) enviada(s). Erro: ${result.error}`
          : result.error,
      };
    }
    uploaded++;
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidateStorefront();
  return { success: true };
}

/** @deprecated Use uploadProductImages */
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file");
  if (file instanceof File) {
    formData.delete("file");
    formData.append("files", file);
  }
  return uploadProductImages(productId, formData);
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path, is_cover")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (!image) return { error: "Imagem nao encontrada." };

  await supabase.storage.from("product-images").remove([image.storage_path]);
  await supabase.from("product_images").delete().eq("id", imageId);

  if (image.is_cover) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from("product_images")
        .update({ is_cover: true })
        .eq("id", next.id);
    }
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidateStorefront();
  return { success: true };
}

export async function setProductCoverImage(
  productId: string,
  imageId: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const supabase = await createClient();
  await supabase
    .from("product_images")
    .update({ is_cover: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/produtos/${productId}`);
  revalidateStorefront();
  return { success: true };
}

export async function archiveProduct(productId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  revalidateStorefront();
  return { success: true };
}

export async function setProductCoverImageForm(
  productId: string,
  imageId: string,
): Promise<void> {
  await setProductCoverImage(productId, imageId);
}

export async function deleteProductImageForm(
  productId: string,
  imageId: string,
): Promise<void> {
  await deleteProductImage(productId, imageId);
}
