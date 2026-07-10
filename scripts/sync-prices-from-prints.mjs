/**
 * Sincroniza precos dos produtos com os valores dos catalogos (prints).
 * Uso: node scripts/sync-prices-from-prints.mjs
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

/** Precos oficiais dos prints — slug => { price, name?, promotional_price? } */
const PRINT_PRICES = {
  // Imagem emagrecedores (USD)
  "tg-15-4-ampolas": { price: 730 },
  "lipoless-15-4-ampolas": { price: 650 },
  "lipoland-ampola-unica": { price: 680 },
  "lipoless-ampola-unica": { price: 600 },
  "tirzec-4-ampolas": { price: 700 },
  "tirzec-ampola-unica-15-mg": { price: 650 },

  // Imagem peptideos (BRL)
  "aod-9604-10mg": { price: 602.55 },
  "bpc-157-10mg": { price: 499.79 },
  "cagrilintide-5mg-1-vial": { price: 534.04 },
  "cjc-1295-ipamorelin": { price: 602.55 },
  "epithalon-50mg": { price: 602.55 },
  "ghk-cu-100mg": { price: 499.79 },
  "ghk-cu-100mg-agua": { price: 534.04 },
  "glow-70mg": { price: 602.55 },
  "hgh-frag-176-10mg": { price: 568.3 },
  "ipamorelin-10mg": { price: 534.04 },
  "kisspeptin-10mg": { price: 534.04 },
  "klow-80mg": {
    price: 671.06,
    name: "Klow (60mg)",
    slug: "klow-60mg",
    short_description:
      "Apresentacao: 60mg | Moeda catalogo: BRL | Valor unitario: BRL 671.06",
  },
  "klow-60mg": { price: 671.06, name: "Klow (60mg)" },
  "mots-c-10mg": { price: 534.04 },
  "mots-c-40mg": { price: 836.81 },
  "nad-1000mg": { price: 671.06 },
  "oxytocin-10mg": { price: 534.04 },
  "pt-141-10mg": { price: 499.79 },
  "retatrutide-10mg": { price: 465.53 },
  "retatrutide-20mg": { price: 534.04 },
  "retatrutide-30mg": { price: 602.55 },
  "retatrutide-40mg": { price: 671.06 },
  "selank-10mg": { price: 602.55 },
  "semax-10mg-1-vial": { price: 602.55 },
  "sermorelin-10mg": { price: 534.04 },
  "ss-31-50mg": { price: 836.81 },
  "tb500-10mg": { price: 499.79 },
  "tesamorelin-10mg": { price: 602.55 },
  "tirzepatide-120mg": {
    price: 876.58,
    name: "Tirzepatide (100mg)",
    slug: "tirzepatide-100mg",
    short_description:
      "Apresentacao: 100mg | Moeda catalogo: BRL | Valor unitario: BRL 876.58",
  },
  "tirzepatide-100mg": { price: 876.58, name: "Tirzepatide (100mg)" },
  "tirzepatide-60mg-1-vial": {
    price: 636.81,
    name: "Tirzepatide (50mg - 1 vial)",
    slug: "tirzepatide-50mg-1-vial",
    short_description:
      "Apresentacao: 50mg - 1 vial | Moeda catalogo: BRL | Valor unitario: BRL 636.81",
  },
  "tirzepatide-50mg-1-vial": { price: 636.81, name: "Tirzepatide (50mg - 1 vial)" },
  "wolverine-blend-20mg": { price: 602.55 },

  // Imagem retatrutida atacado (BRL)
  "retatrutida-60-mg": { price: 700 },
  "retatrutida-120-mg": { price: 799 },
  "retatrutida-zphc-pen-60-mg": { price: 1550 },
  "retatrutida-tnl-pen-48-mg": { price: 999 },
  "retatrutida-synedica-pen-40-mg": { price: 950 },
  "retatrutida-thera-genetics-pen-40-mg": { price: 780 },

  // Imagem hormonios (USD) — somente valor unitario do print
  "testo-cipionato-200mg-10ml": { price: 160, promotional_price: null },
  "testo-enantato-250mg-10ml": { price: 160, promotional_price: null },
  "testo-propionato-100mg-10ml": { price: 160, promotional_price: null },
  "trembo-acetato-100mg-10ml": { price: 160, promotional_price: null },
  "trembo-enantato-200mg-10ml": { price: 160, promotional_price: null },
  "nandro-phenyl-prop-100mg-10ml": { price: 160, promotional_price: null },
  "nandrona-nandrolona-200mg-10ml": { price: 160, promotional_price: null },
  "boldenona-250mg-10ml": { price: 160, promotional_price: null },
  "mast-masteron-100mg-10ml": { price: 160, promotional_price: null },
  "nandrolona-simp-fenilprop-100-comp": { price: 195, promotional_price: null },
  "nandrolona-decanoato-50mg-50-comp": { price: 195, promotional_price: null },
  "hcg-5000ui-1-frasco": { price: 195, promotional_price: null },
  "anastrozol-10mg-100-comp": { price: 110, promotional_price: null },
  "anastrozol-50mg-15ml": { price: 110, promotional_price: null },
  "anastrozol-50mg-30ml": { price: 110, promotional_price: null },
  "clomifeno-clomogem-50mg-20-comp": { price: 110, promotional_price: null },
};

const { data: products, error } = await supabase
  .from("products")
  .select("id, slug, name, price, promotional_price");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
const missing = [];

for (const product of products ?? []) {
  if (product.slug === "zphc") {
    const { error: delErr } = await supabase.from("products").delete().eq("id", product.id);
    if (delErr) console.error("Erro ao remover duplicata ZPHC:", delErr.message);
    else console.log("Removido produto duplicado:", product.name, "(preco incorreto 1650)");
    continue;
  }

  const spec = PRINT_PRICES[product.slug];
  if (!spec) {
    missing.push(product.slug);
    continue;
  }

  const payload = {
    price: spec.price,
    promotional_price:
      spec.promotional_price === undefined ? product.promotional_price : spec.promotional_price,
  };

  if (spec.name) payload.name = spec.name;
  if (spec.slug) payload.slug = spec.slug;
  if (spec.short_description) payload.short_description = spec.short_description;

  const { error: updErr } = await supabase
    .from("products")
    .update(payload)
    .eq("id", product.id);

  if (updErr) {
    console.error(`${product.slug}:`, updErr.message);
    continue;
  }

  updated++;
  const changes = [];
  if (Number(product.price) !== spec.price) changes.push(`${product.price} -> ${spec.price}`);
  if (spec.name && spec.name !== product.name) changes.push(`nome: ${spec.name}`);
  if (spec.slug && spec.slug !== product.slug) changes.push(`slug: ${spec.slug}`);
  if (spec.promotional_price === null && product.promotional_price)
    changes.push("removeu preco atacado");

  console.log(`OK ${product.slug}${changes.length ? ": " + changes.join("; ") : ""}`);
}

console.log(`\n${updated} produto(s) sincronizado(s) com os prints.`);
if (missing.length) {
  console.log("Sem mapeamento nos prints:", missing.join(", "));
}
