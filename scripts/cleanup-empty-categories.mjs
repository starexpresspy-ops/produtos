/**
 * Remove categorias sem produtos vinculados.
 * Uso: node scripts/cleanup-empty-categories.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
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

const { data: categories, error: catError } = await supabase
  .from("categories")
  .select("id, name, slug, image_path")
  .order("name");

if (catError) {
  console.error(catError.message);
  process.exit(1);
}

let removed = 0;
let kept = 0;

for (const category of categories ?? []) {
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", category.id)
    .is("deleted_at", null);

  if (countError) {
    console.error(`${category.name}:`, countError.message);
    continue;
  }

  if ((count ?? 0) > 0) {
    kept++;
    continue;
  }

  if (category.image_path) {
    await supabase.storage.from("store-assets").remove([category.image_path]);
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", category.id);

  if (deleteError) {
    console.error(`ERRO ao remover ${category.name}:`, deleteError.message);
    continue;
  }

  removed++;
  console.log(`Removida: ${category.name} (${category.slug})`);
}

console.log(`\n${removed} categoria(s) vazia(s) removida(s). ${kept} mantida(s) com produtos.`);
