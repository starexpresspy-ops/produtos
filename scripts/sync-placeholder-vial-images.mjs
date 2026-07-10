/**
 * Gera e envia frasco padrao com nome no rotulo para produtos sem foto real.
 * Produtos com arquivo em data/product-images/{slug}.* sao ignorados.
 *
 * Uso: node scripts/sync-placeholder-vial-images.mjs
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { renderVialPlaceholderPng } from "./lib/vial-placeholder-render.mjs";

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
const PLACEHOLDER_SUFFIX = "/placeholder-vial-v2.png";
const LEGACY_PLACEHOLDER_SUFFIX = "/placeholder-vial.png";

function localRealImageSlugs() {
  const slugs = new Set();
  if (!existsSync(IMAGE_DIR)) return slugs;
  for (const file of readdirSync(IMAGE_DIR)) {
    const ext = extname(file).toLowerCase();
    if (!ALLOWED.has(ext)) continue;
    slugs.add(file.slice(0, -ext.length));
  }
  return slugs;
}

async function removeProductImages(productId, images) {
  if (!images?.length) return;
  const paths = images.map((img) => img.storage_path);
  await supabase.storage.from("product-images").remove(paths);
  await supabase.from("product_images").delete().eq("product_id", productId);
}

async function renderPlaceholderPng(productName) {
  return renderVialPlaceholderPng(productName);
}

const realImageSlugs = localRealImageSlugs();
console.log(`${realImageSlugs.size} foto(s) real(is) local(is) — demais recebem frasco padrao.`);

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, slug, product_images(id, storage_path)")
  .order("name");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let uploaded = 0;
let skipped = 0;

for (const product of products ?? []) {
  if (realImageSlugs.has(product.slug)) {
    skipped++;
    continue;
  }

  const onlyPlaceholder =
    product.product_images?.length === 1 &&
    (product.product_images[0].storage_path.endsWith(PLACEHOLDER_SUFFIX) ||
      product.product_images[0].storage_path.endsWith(LEGACY_PLACEHOLDER_SUFFIX));

  if (product.product_images?.length && !onlyPlaceholder) {
    await removeProductImages(product.id, product.product_images);
  } else if (onlyPlaceholder) {
    const legacyPaths = product.product_images
      .map((img) => img.storage_path)
      .filter(
        (path) =>
          path.endsWith(LEGACY_PLACEHOLDER_SUFFIX) ||
          path.endsWith(PLACEHOLDER_SUFFIX),
      );
    if (legacyPaths.length) {
      await supabase.storage.from("product-images").remove(legacyPaths);
    }
    await supabase.from("product_images").delete().eq("product_id", product.id);
  }

  try {
    const buffer = await renderPlaceholderPng(product.name);
    const storagePath = `${product.id}${PLACEHOLDER_SUFFIX}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, buffer, { upsert: true, contentType: "image/png" });

    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: product.id,
      storage_path: storagePath,
      sort_order: 0,
      is_cover: true,
    });

    if (insertError) throw new Error(insertError.message);

    await supabase
      .from("products")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", product.id);

    uploaded++;
    console.log(`OK: ${product.name}`);
  } catch (err) {
    console.error(`ERRO (${product.name}):`, err.message);
  }
}

console.log(`\n${uploaded} frasco(s) padrao enviado(s). ${skipped} produto(s) com foto real mantidos.`);
