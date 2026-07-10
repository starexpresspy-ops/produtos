/**
 * Sincroniza imagens reais de data/product-images/{slug}.{png|jpg|webp}
 * Remove fotos genericas antigas e so mantem arquivos locais correspondentes.
 *
 * Uso: node scripts/sync-local-product-images.mjs
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filename) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

loadEnvFile(".env.local");
loadEnvFile("env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Configure Supabase em env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMAGE_DIR = resolve(process.cwd(), "data/product-images");
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function localImagesBySlug() {
  if (!existsSync(IMAGE_DIR)) return new Map();
  const map = new Map();
  for (const file of readdirSync(IMAGE_DIR)) {
    const ext = extname(file).toLowerCase();
    if (!ALLOWED.has(ext)) continue;
    const slug = file.slice(0, -ext.length);
    map.set(slug, { path: join(IMAGE_DIR, file), ext, mime: MIME[ext] });
  }
  return map;
}

async function removeProductImages(productId, images) {
  if (!images?.length) return;
  const paths = images.map((img) => img.storage_path);
  await supabase.storage.from("product-images").remove(paths);
  await supabase.from("product_images").delete().eq("product_id", productId);
}

async function uploadLocalImage(productId, fileInfo) {
  const buffer = readFileSync(fileInfo.path);
  if (buffer.byteLength > 1024 * 1024) {
    throw new Error("Imagem maior que 1 MB");
  }

  const storagePath = `${productId}/${randomUUID()}${fileInfo.ext === ".jpeg" ? ".jpg" : fileInfo.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, buffer, { upsert: false, contentType: fileInfo.mime });

  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    sort_order: 0,
    is_cover: true,
  });

  if (insertError) throw new Error(insertError.message);
}

const localImages = localImagesBySlug();
console.log(`${localImages.size} imagem(ns) local(is) em data/product-images/`);

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, slug, product_images(id, storage_path)")
  .order("name");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let uploaded = 0;
let cleared = 0;

for (const product of products ?? []) {
  const local = localImages.get(product.slug);
  if (!local) continue;

  if (product.product_images?.length) {
    await removeProductImages(product.id, product.product_images);
    cleared += product.product_images.length;
  }

  try {
    await uploadLocalImage(product.id, local);
    await supabase
      .from("products")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", product.id);
    uploaded++;
    console.log(`OK: ${product.name} <- ${local.path}`);
  } catch (err) {
    console.error(`ERRO (${product.name}):`, err.message);
  }
}

console.log(`\n${uploaded} imagem(ns) real(is) enviada(s). ${cleared} imagem(ns) antiga(s) removida(s).`);
