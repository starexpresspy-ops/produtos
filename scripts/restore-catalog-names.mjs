/**
 * Restaura nomes, marcas e descricoes curtas conforme o catalogo original (Excel/prints).
 * Nao altera precos nem imagens.
 *
 * Uso: node scripts/restore-catalog-names.mjs [caminho-do-xlsx]
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

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

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

/** Ajustes de nome/dose confirmados nos prints de preco (nao sao rotulo de embalagem). */
const PRINT_OVERRIDES = {
  "klow-80mg": {
    slug: "klow-60mg",
    name: "Klow (60mg)",
    short_description:
      "Apresentacao: 60mg | Moeda catalogo: BRL | Valor unitario: BRL 671.06",
  },
  "klow-60mg": {
    name: "Klow (60mg)",
    short_description:
      "Apresentacao: 60mg | Moeda catalogo: BRL | Valor unitario: BRL 671.06",
  },
  "tirzepatide-120mg": {
    slug: "tirzepatide-100mg",
    name: "Tirzepatide (100mg)",
    short_description:
      "Apresentacao: 100mg | Moeda catalogo: BRL | Valor unitario: BRL 876.58",
  },
  "tirzepatide-100mg": {
    name: "Tirzepatide (100mg)",
    short_description:
      "Apresentacao: 100mg | Moeda catalogo: BRL | Valor unitario: BRL 876.58",
  },
  "tirzepatide-60mg-1-vial": {
    slug: "tirzepatide-50mg-1-vial",
    name: "Tirzepatide (50mg - 1 vial)",
    short_description:
      "Apresentacao: 50mg - 1 vial | Moeda catalogo: BRL | Valor unitario: BRL 636.81",
  },
  "tirzepatide-50mg-1-vial": {
    name: "Tirzepatide (50mg - 1 vial)",
    short_description:
      "Apresentacao: 50mg - 1 vial | Moeda catalogo: BRL | Valor unitario: BRL 636.81",
  },
  "nandrona-nandrolona-200mg-10ml": {
    name: "Nandrolona (200mg/10ml)",
  },
};

const xlsxPath =
  process.argv[2] ?? "C:/Users/Usuário/Downloads/produtos_underground_colunas.xlsx";

if (!existsSync(xlsxPath)) {
  console.error("Arquivo nao encontrado:", xlsxPath);
  process.exit(1);
}

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames.includes("Produtos separados")
  ? "Produtos separados"
  : workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

const brandMap = new Map();
const { data: existingBrands } = await supabase.from("brands").select("id, slug, name");
for (const brand of existingBrands ?? []) brandMap.set(brand.slug, brand.id);

async function ensureBrand(name) {
  const clean = (name || "").trim();
  if (!clean) return null;
  const slug = slugify(clean);
  if (brandMap.has(slug)) return brandMap.get(slug);

  const { data, error } = await supabase
    .from("brands")
    .insert({ name: clean, slug, active: true })
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
    throw new Error(`Marca ${clean}: ${error.message}`);
  }
  brandMap.set(slug, data.id);
  return data.id;
}

const catalog = new Map();
const usedSlugs = new Set();

for (const [index, row] of rows.entries()) {
  const baseName = String(row["Nome do produto"] || "").trim();
  const presentation = String(row["Apresentação / Dose"] || "").trim();
  const brandName = String(row["Fabricante / Marca"] || "").trim();
  const wholesalePrice = String(row["Valor atacado / acima de 5"] || "").trim();
  const currency = String(row["Moeda"] || "BRL").trim();
  if (!baseName) continue;

  const displayName = presentation ? `${baseName} (${presentation})` : baseName;
  let slug = slugify(`${baseName}-${presentation}`);
  if (!slug) slug = slugify(baseName) || `produto-${index + 1}`;

  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${slugify(`${baseName}-${presentation}`)}-${suffix}`;
    suffix++;
  }
  usedSlugs.add(slug);

  const brandFromName = /zphc/i.test(baseName) || /zphc/i.test(displayName) ? "ZPHC" : "";
  const brand = brandFromName || brandName;

  const shortDescription = [
    presentation ? `Apresentacao: ${presentation}` : null,
    brand ? `Fabricante: ${brand}` : null,
    `Moeda catalogo: ${currency}`,
    wholesalePrice ? `Atacado (5+ un): ${currency} ${wholesalePrice}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const override = PRINT_OVERRIDES[slug];
  catalog.set(slug, {
    slug: override?.slug ?? slug,
    name: override?.name ?? displayName,
    short_description: override?.short_description ?? shortDescription,
    brand,
  });
}

let updated = 0;
let missing = 0;

for (const [excelSlug, spec] of catalog.entries()) {
  const brandId = spec.brand ? await ensureBrand(spec.brand) : null;

  let product = null;
  for (const candidate of [spec.slug, excelSlug]) {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("slug", candidate)
      .maybeSingle();
    if (data) {
      product = data;
      break;
    }
  }

  if (!product) {
    missing++;
    console.warn(`Nao encontrado: ${excelSlug}`);
    continue;
  }

  const payload = {
    name: spec.name,
    short_description: spec.short_description,
    brand_id: brandId,
  };

  if (spec.slug && spec.slug !== product.slug) {
    payload.slug = spec.slug;
  }

  const { error } = await supabase.from("products").update(payload).eq("id", product.id);
  if (error) {
    console.error(`${excelSlug}:`, error.message);
    continue;
  }

  updated++;
  if (product.name !== spec.name) {
    console.log(`OK: ${spec.name}`);
    console.log(`   antes: ${product.name}`);
  } else {
    console.log(`OK: ${spec.name}`);
  }
}

console.log(`\n${updated} produto(s) com nome do catalogo original.`);
if (missing) console.log(`${missing} slug(s) nao encontrado(s) no banco.`);
