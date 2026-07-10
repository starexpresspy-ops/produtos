/**
 * Importa produtos de planilha Excel para o Supabase.
 *
 * Uso:
 *   node scripts/import-products-xlsx.mjs [caminho-do-xlsx]
 *
 * Requer env.local ou .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

function loadEnvFile(filename) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile("env.local");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const num = Number(normalized);
  return Number.isFinite(num) && num > 0 ? num : null;
}

const xlsxPath =
  process.argv[2] ??
  "C:/Users/Usuário/Downloads/produtos_underground_colunas.xlsx";

if (!existsSync(xlsxPath)) {
  console.error("Arquivo nao encontrado:", xlsxPath);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames.includes("Produtos separados")
  ? "Produtos separados"
  : workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

console.log(`Lendo ${rows.length} produto(s) de "${sheetName}"...`);

const categoryMap = new Map();
const brandMap = new Map();

const { data: existingCategories } = await supabase.from("categories").select("id, slug");
for (const category of existingCategories ?? []) {
  categoryMap.set(category.slug, category.id);
}

const { data: existingBrands } = await supabase.from("brands").select("id, slug");
for (const brand of existingBrands ?? []) {
  brandMap.set(brand.slug, brand.id);
}

function resolveCategoryName(baseName, displayName, categoryName) {
  if (/retatrutid|tirzepatid/i.test(baseName) || /retatrutid|tirzepatid/i.test(displayName)) {
    return "Emagrecedores";
  }
  if (categoryName === "Não identificado") return "Outros";
  return categoryName;
}

async function ensureCategory(name) {
  const cleanName = (name || "Outros").trim() || "Outros";
  const slug = slugify(cleanName) || "outros";

  if (categoryMap.has(slug)) return categoryMap.get(slug);

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: cleanName,
      slug,
      sort_order: categoryMap.size,
      active: true,
    })
    .select("id")
    .single();

  if (error) {
    const { data: refetch } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (refetch?.id) {
      categoryMap.set(slug, refetch.id);
      return refetch.id;
    }
    throw new Error(`Categoria "${cleanName}": ${error.message}`);
  }

  categoryMap.set(slug, data.id);
  return data.id;
}

async function ensureBrand(name) {
  const cleanName = (name || "").trim();
  if (!cleanName) return null;

  const slug = slugify(cleanName);
  if (brandMap.has(slug)) return brandMap.get(slug);

  const { data, error } = await supabase
    .from("brands")
    .insert({
      name: cleanName,
      slug,
      active: true,
    })
    .select("id")
    .single();

  if (error) {
    const { data: refetch } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (refetch?.id) {
      brandMap.set(slug, refetch.id);
      return refetch.id;
    }
    throw new Error(`Marca "${cleanName}": ${error.message}`);
  }

  brandMap.set(slug, data.id);
  return data.id;
}

let imported = 0;
let skipped = 0;
const usedSlugs = new Set();

for (const [index, row] of rows.entries()) {
  const baseName = String(row["Nome do produto"] || "").trim();
  const presentation = String(row["Apresentação / Dose"] || "").trim();
  const brandName = String(row["Fabricante / Marca"] || "").trim();
  const unitPrice = parsePrice(row["Valor unidade"]);
  const wholesalePrice = parsePrice(row["Valor atacado / acima de 5"]);
  const currency = String(row["Moeda"] || "BRL").trim();
  const description = String(row["O que faz / Descrição acadêmica"] || "").trim();
  const categoryName = String(row["Categoria"] || "Outros").trim() || "Outros";
  const source = String(row["Fonte"] || "").trim();

  if (!baseName || !unitPrice) {
    skipped++;
    console.warn(`Linha ${index + 2}: ignorada (nome ou preco invalido).`);
    continue;
  }

  const displayName = presentation ? `${baseName} (${presentation})` : baseName;
  let slug = slugify(`${baseName}-${presentation}`);
  if (!slug) slug = slugify(baseName) || `produto-${index + 1}`;

  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${slugify(`${baseName}-${presentation}`)}-${suffix}`;
    suffix++;
  }
  usedSlugs.add(slug);

  try {
    const categoryId = await ensureCategory(
      resolveCategoryName(baseName, displayName, categoryName),
    );
    const brandFromName = /zphc/i.test(baseName) || /zphc/i.test(displayName) ? "ZPHC" : "";
    const brandId = await ensureBrand(brandFromName || brandName);

    const shortDescription = [
      presentation ? `Apresentacao: ${presentation}` : null,
      (brandFromName || brandName) ? `Fabricante: ${brandFromName || brandName}` : null,
      `Moeda catalogo: ${currency}`,
      wholesalePrice ? `Atacado (5+ un): ${currency} ${wholesalePrice}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const fullDescription = [
      description,
      source ? `Fonte: ${source}` : null,
      wholesalePrice
        ? `Valor unitario: ${currency} ${unitPrice}. Valor atacado acima de 5 unidades: ${currency} ${wholesalePrice}.`
        : `Valor unitario: ${currency} ${unitPrice}.`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const payload = {
      name: displayName,
      slug,
      short_description: shortDescription,
      description: fullDescription,
      price: unitPrice,
      promotional_price:
        wholesalePrice && wholesalePrice < unitPrice ? wholesalePrice : null,
      category_id: categoryId,
      brand_id: brandId,
      stock_quantity: 0,
      stock_status: "on_request",
      condition: "new",
      featured: false,
      active: true,
    };

    const { error } = await supabase.from("products").upsert(payload, { onConflict: "slug" });
    if (error) {
      skipped++;
      console.error(`Linha ${index + 2} (${displayName}): ${error.message}`);
      continue;
    }

    imported++;
    console.log(`OK ${imported}: ${displayName} — ${currency} ${unitPrice}`);
  } catch (error) {
    skipped++;
    console.error(`Linha ${index + 2} (${displayName}):`, error.message);
  }
}

console.log("");
console.log(`Importacao concluida: ${imported} importado(s), ${skipped} ignorado(s).`);
