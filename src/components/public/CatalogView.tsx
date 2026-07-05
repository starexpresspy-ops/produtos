"use client";

import { useMemo, useState } from "react";
import type { Brand, Category, ProductWithRelations, StockStatus } from "@/types";
import type { WhatsappContact } from "@/lib/whatsapp";
import { ProductGrid } from "@/components/public/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";

interface CatalogViewProps {
  products: ProductWithRelations[];
  categories: Category[];
  brands: Brand[];
  whatsappContacts: WhatsappContact[];
  initialSearch?: string;
  initialCategorySlug?: string;
}

export function CatalogView({
  products,
  categories,
  brands,
  whatsappContacts,
  initialSearch = "",
  initialCategorySlug = "",
}: CatalogViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategorySlug);
  const [brand, setBrand] = useState("");
  const [availability, setAvailability] = useState<StockStatus | "all">("all");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (category && product.category?.slug !== category) return false;
      if (brand && product.brand?.slug !== brand) return false;
      if (availability !== "all" && product.stockStatus !== availability) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const haystack = `${product.name} ${product.sku ?? ""} ${product.brand?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [products, search, category, brand, availability]);

  return (
    <div className="space-y-5">
      <div className="border-border bg-surface grid gap-3 rounded-[var(--radius-card)] border p-4 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="border-border rounded-xl border px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-border rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border-border rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Todas as marcas</option>
          {brands.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as StockStatus | "all")}
          className="border-border rounded-xl border px-3 py-2 text-sm"
        >
          <option value="all">Disponibilidade</option>
          <option value="available">Disponivel</option>
          <option value="on_request">Sob consulta</option>
          <option value="unavailable">Indisponivel</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} whatsappContacts={whatsappContacts} />
      ) : (
        <EmptyState title="Nenhum produto encontrado" description="Tente ajustar os filtros e a busca." />
      )}
    </div>
  );
}
