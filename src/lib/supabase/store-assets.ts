import type { SupabaseClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 1 * 1024 * 1024;
const BUCKET = "store-assets";

export const STORE_ASSET_UPLOAD_HINT =
  "Recomendado: imagens em WebP, ate 1200px de largura e ate 1MB para manter o site rapido e evitar custos de armazenamento.";

export async function uploadStoreAsset(
  supabase: SupabaseClient,
  folder: string,
  entityId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato invalido. Use JPEG, PNG ou WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Imagem muito grande. Maximo 1 MB." };
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const storagePath = `${folder}/${entityId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: uploadError.message };
  return { path: storagePath };
}

export async function removeStoreAsset(
  supabase: SupabaseClient,
  path: string | null,
): Promise<void> {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
