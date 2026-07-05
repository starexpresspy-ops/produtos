"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/catalog/revalidate";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { parseCsv, parseBoolean } from "@/lib/utils/csv";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { uploadProductImageFromUrl } from "@/lib/supabase/product-images";
import type { ImportResult } from "@/types/actions";
import type { ProductCondition, StockStatus } from "@/types";

const VALID_STOCK: StockStatus[] = ["available", "unavailable", "on_request"];
const VALID_CONDITION: ProductCondition[] = ["new", "used", "open_box"];

export async function importProductsFromCsv(
  formData: FormData,
): Promise<ImportResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase nao configurado." };
  }

  const user = await getCurrentUser();
  if (!user || user.profile.role !== "lojista") {
    return { error: "Acesso negado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV." };
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  if (!headers.includes("name") && !headers.includes("nome")) {
    return { error: "CSV invalido. Coluna obrigatoria: name (ou nome)." };
  }
  if (!headers.includes("price") && !headers.includes("preco")) {
    return { error: "CSV invalido. Coluna obrigatoria: price (ou preco)." };
  }

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug");
  const { data: brands } = await supabase.from("brands").select("id, slug");

  const categoryMap = new Map(
    (categories ?? []).map((c) => [c.slug, c.id]),
  );
  const brandMap = new Map((brands ?? []).map((b) => [b.slug, b.id]));

  let imported = 0;
  let skipped = 0;
  const details: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name || row.nome;
    const priceRaw = row.price || row.preco;

    if (!name || !priceRaw) {
      skipped++;
      details.push(`Linha ${i + 2}: nome ou preco vazio.`);
      continue;
    }

    const price = Number(priceRaw.replace(",", "."));
    if (Number.isNaN(price) || price <= 0) {
      skipped++;
      details.push(`Linha ${i + 2}: preco invalido (${priceRaw}).`);
      continue;
    }

    const categorySlug = row.category_slug || row.categoria_slug || "";
    const brandSlug = row.brand_slug || row.marca_slug || "";

    const categoryId = categorySlug
      ? categoryMap.get(categorySlug)
      : undefined;
    if (categorySlug && !categoryId) {
      skipped++;
      details.push(
        `Linha ${i + 2}: categoria "${categorySlug}" nao encontrada.`,
      );
      continue;
    }

    const brandId = brandSlug ? brandMap.get(brandSlug) : null;
    if (brandSlug && !brandId) {
      skipped++;
      details.push(`Linha ${i + 2}: marca "${brandSlug}" nao encontrada.`);
      continue;
    }

    const stockStatus = (row.stock_status ||
      row.status_estoque ||
      "available") as StockStatus;
    if (!VALID_STOCK.includes(stockStatus)) {
      skipped++;
      details.push(`Linha ${i + 2}: stock_status invalido.`);
      continue;
    }

    const condition = (row.condition || row.condicao || "new") as ProductCondition;
    if (!VALID_CONDITION.includes(condition)) {
      skipped++;
      details.push(`Linha ${i + 2}: condition invalido.`);
      continue;
    }

    const promotionalRaw = row.promotional_price || row.preco_promocional;
    const promotionalPrice = promotionalRaw
      ? Number(promotionalRaw.replace(",", "."))
      : null;

    const payload = {
      name,
      slug: row.slug || slugify(name),
      sku: row.sku || null,
      short_description: row.short_description || row.descricao_curta || null,
      description: row.description || row.descricao || null,
      price,
      promotional_price: promotionalPrice,
      category_id: categoryId ?? null,
      brand_id: brandId,
      stock_quantity: Number(row.stock_quantity || row.estoque || 0) || 0,
      stock_status: stockStatus,
      condition,
      featured: parseBoolean(row.featured || row.destaque, false),
      active: parseBoolean(row.active || row.ativo, true),
      created_by: user.id,
    };

    const { data: saved, error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) {
      skipped++;
      details.push(`Linha ${i + 2} (${name}): ${error.message}`);
      continue;
    }

    const imageUrlsRaw =
      row.image_urls || row.imagens || row.urls_imagem || "";
    if (imageUrlsRaw && saved?.id) {
      const urls = imageUrlsRaw
        .split(/[|;]/)
        .map((u) => u.trim())
        .filter(Boolean)
        .slice(0, 5);

      for (const url of urls) {
        const imgResult = await uploadProductImageFromUrl(
          supabase,
          saved.id,
          url,
        );
        if (imgResult.error) {
          details.push(
            `Linha ${i + 2} (${name}): imagem ${url} — ${imgResult.error}`,
          );
        }
      }
    }

    imported++;
  }

  revalidatePath("/admin/produtos");
  revalidateStorefront();

  return {
    success: true,
    imported,
    skipped,
    details: details.slice(0, 15),
  };
}
