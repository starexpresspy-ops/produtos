/**
 * @deprecated Nao usar — nomes devem seguir o catalogo/print original.
 * Use: node scripts/restore-catalog-names.mjs
 *
 * Atualiza nomes e marcas conforme embalagens oficiais (pesquisa Google/Landerlan/ZPHC).
 * Uso: node scripts/sync-packaging-names.mjs
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

/** Nomes conforme rotulo / embalagem oficial */
const PACKAGING = {
  "nandrona-nandrolona-200mg-10ml": {
    name: "Decaland Depot 200 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: DECALAND DEPOT 200 MG — Decanoato de Nandrolona",
  },
  "testo-cipionato-200mg-10ml": {
    name: "Testoland Depot Cipionato 200 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: Testoland Depot — Cipionato de Testosterona",
  },
  "testo-enantato-250mg-10ml": {
    name: "Testenat Depot 250 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: Testenat Depot — Enantato de Testosterona",
  },
  "testo-propionato-100mg-10ml": {
    name: "Testosterona Propionato 100 mg (10ml)",
    brand: "Landergold",
    note: "Linha Landergold / Landerlan",
  },
  "trembo-acetato-100mg-10ml": {
    name: "Trembolona Acetato 100 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: Trembolona Acetato Landerlan Gold",
  },
  "trembo-enantato-200mg-10ml": {
    name: "Trembolona Enantato 200 mg (10ml)",
    brand: "Landergold",
    note: "Linha Landergold",
  },
  "nandro-phenyl-prop-100mg-10ml": {
    name: "Nandrolona Fenilpropionato 100 mg (10ml)",
    brand: "Landerlan Gold",
    note: "NPP — Nandrolona Fenil Landerlan Gold",
  },
  "mast-masteron-100mg-10ml": {
    name: "Drostanolona Propionato Masteron 100 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: Drostanolona Propionato (Masteron)",
  },
  "boldenona-250mg-10ml": {
    name: "Boldenona Undecilato 250 mg (10ml)",
    brand: "Landerlan Gold",
    note: "Rotulo: Boldenona Undecilato Landerlan Gold",
  },
  "nandrolona-simp-fenilprop-100-comp": {
    name: "Nandrolona Fenilpropionato (100 comp.)",
    brand: "Landerlan",
    note: "Comprimidos Landerlan",
  },
  "nandrolona-decanoato-50mg-50-comp": {
    name: "Nandrolona Decanoato 50 mg (50 comp.)",
    brand: "Landerlan",
    note: "Comprimidos Landerlan",
  },
  "hcg-5000ui-1-frasco": {
    name: "HCG 5000 UI (1 frasco)",
    brand: "Gonadotrofina Gold",
    note: "Gonadotrofina / linha Gold",
  },
  "anastrozol-10mg-100-comp": {
    name: "Anastrozol 10 mg (100 comp.)",
    brand: "Landerlan",
  },
  "anastrozol-50mg-15ml": {
    name: "Anastrozol 50 mg (15ml)",
    brand: "Landerlan",
  },
  "anastrozol-50mg-30ml": {
    name: "Anastrozol 50 mg (30ml)",
    brand: "Landerlan",
  },
  "clomifeno-clomogem-50mg-20-comp": {
    name: "Clomogem Clomifeno 50 mg (20 comp.)",
    brand: "Oxitoland / Landerlan",
    note: "Marca Clomogem no catalogo",
  },
  "retatrutida-zphc-pen-60-mg": {
    name: "Retatrutide 60 mg ZPHC Pen",
    brand: "ZPHC",
    note: "Rotulo: RETATRUTIDE — ZPHC",
  },
  "retatrutida-60-mg": {
    name: "Retatrutida Biogenises 60 mg",
    brand: "Biogenises",
  },
  "retatrutida-120-mg": {
    name: "Retatrutida Veltrane 120 mg",
    brand: "Veltrane",
  },
  "retatrutida-tnl-pen-48-mg": {
    name: "Retatrutide 48 mg TNL Pen",
    brand: "TNL",
    note: "Rotulo: Retatrutide 48mg — TNL (4 doses de 12mg)",
  },
  "retatrutida-synedica-pen-40-mg": {
    name: "Retatrutide 40 mg Synedica Pen",
    brand: "Synedica",
    note: "Rotulo: Retatrutide 40mg — Synedica (4 x 10 mg doses)",
  },
  "retatrutida-thera-genetics-pen-40-mg": {
    name: "Retatrutide 40 mg Thera Genetics",
    brand: "Thera Genetics",
    note: "Rotulo: RETATRUTIDE 40mg — Thera Genetics",
  },
};

const brandMap = new Map();

async function ensureBrand(name) {
  const clean = name.trim();
  if (!clean) return null;
  const slug = slugify(clean);
  if (brandMap.has(slug)) return brandMap.get(slug);

  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing?.id) {
    brandMap.set(slug, existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("brands")
    .insert({ name: clean, slug, active: true })
    .select("id")
    .single();
  if (error) throw new Error(`Marca ${clean}: ${error.message}`);
  brandMap.set(slug, data.id);
  return data.id;
}

const { data: existingBrands } = await supabase.from("brands").select("id, slug");
for (const b of existingBrands ?? []) brandMap.set(b.slug, b.id);

let updated = 0;

for (const [slug, spec] of Object.entries(PACKAGING)) {
  const brandId = spec.brand ? await ensureBrand(spec.brand) : null;
  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    console.warn(`Nao encontrado: ${slug}`);
    continue;
  }

  const payload = { name: spec.name };
  if (brandId) payload.brand_id = brandId;
  if (spec.note) {
    payload.short_description = spec.note;
  }

  const { error } = await supabase.from("products").update(payload).eq("id", product.id);
  if (error) {
    console.error(slug, error.message);
    continue;
  }

  updated++;
  console.log(`OK: ${spec.name}`);
  if (product.name !== spec.name) console.log(`   antes: ${product.name}`);
}

console.log(`\n${updated} produto(s) atualizado(s) com nomes de embalagem.`);
