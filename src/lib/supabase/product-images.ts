import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_PRODUCT_IMAGES } from "@/lib/supabase/product-mappers";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 1 * 1024 * 1024;

export const IMAGE_UPLOAD_HINT =
  "Recomendado: imagens em WebP, ate 1200px de largura e ate 1MB para manter o site rapido e evitar custos de armazenamento.";

export async function uploadProductImageFile(
  supabase: SupabaseClient,
  productId: string,
  file: File,
): Promise<{ error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato invalido. Use JPEG, PNG ou WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Imagem muito grande. Maximo 1 MB." };
  }

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if ((count ?? 0) >= MAX_PRODUCT_IMAGES) {
    return { error: `Limite de ${MAX_PRODUCT_IMAGES} imagens atingido.` };
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const storagePath = `${productId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { upsert: false, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { data: first } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .limit(1)
    .maybeSingle();

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    sort_order: Date.now(),
    is_cover: !first,
  });

  if (insertError) return { error: insertError.message };
  return {};
}

export async function uploadProductImageFromUrl(
  _supabase: SupabaseClient,
  _productId: string,
  _url: string,
): Promise<{ error?: string }> {
  return {};
}
