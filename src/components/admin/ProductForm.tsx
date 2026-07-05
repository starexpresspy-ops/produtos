"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  saveProduct,
} from "@/actions/admin/products";
import type { ActionResult } from "@/types/actions";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import {
  FormCheckbox,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormField";
import { ResponsibilityNotice } from "@/components/shared/ResponsibilityNotice";

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandOption {
  id: string;
  name: string;
}

interface ProductImageRow {
  id: string;
  storage_path: string;
  is_cover: boolean;
}

interface ProductFormProps {
  categories: CategoryOption[];
  brands: BrandOption[];
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    short_description: string | null;
    description: string | null;
    price: number;
    promotional_price: number | null;
    category_id: string | null;
    brand_id: string | null;
    stock_quantity: number;
    stock_status: string;
    condition: string;
    featured: boolean;
    active: boolean;
    product_images: ProductImageRow[];
  };
}

export function ProductForm({
  categories,
  brands,
  product,
}: ProductFormProps) {
  const [saveState, saveFormAction, savePending] = useActionState<
    ActionResult,
    FormData
  >(
    async (_prev, formData) =>
      product ? saveProduct(formData, product.id) : saveProduct(formData),
    {},
  );

  return (
    <div className="space-y-8">
      {saveState?.error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {saveState.error}
        </div>
      ) : null}

      <form action={saveFormAction} className="space-y-6">
        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Informacoes basicas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nome do produto"
              name="name"
              required
              defaultValue={product?.name}
              className="sm:col-span-2"
            />
            <FormField
              label="Slug (URL)"
              name="slug"
              defaultValue={product?.slug}
              placeholder="gerado-automaticamente"
            />
            <FormField
              label="Codigo (SKU)"
              name="sku"
              defaultValue={product?.sku ?? ""}
            />
            <FormSelect
              label="Categoria"
              name="categoryId"
              required
              defaultValue={product?.category_id ?? ""}
              options={[
                { value: "", label: "Selecione..." },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <FormSelect
              label="Marca"
              name="brandId"
              defaultValue={product?.brand_id ?? ""}
              options={[
                { value: "", label: "Nenhuma" },
                ...brands.map((b) => ({ value: b.id, label: b.name })),
              ]}
            />
            {brands.length === 0 ? (
              <p className="text-muted sm:col-span-2 text-sm">
                Nenhuma marca ativa cadastrada.{" "}
                <Link href="/admin/marcas/novo" className="text-primary font-semibold">
                  Cadastre uma marca
                </Link>{" "}
                antes de vincular ao produto.
              </p>
            ) : null}
            <FormTextarea
              label="Descricao curta"
              name="shortDescription"
              defaultValue={product?.short_description ?? ""}
              className="sm:col-span-2"
            />
            <FormTextarea
              label="Descricao completa"
              name="description"
              rows={6}
              defaultValue={product?.description ?? ""}
              className="sm:col-span-2"
            />
          </div>
        </section>

        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Preco</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Preco normal (R$)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price}
            />
            <FormField
              label="Preco promocional (R$)"
              name="promotionalPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.promotional_price ?? ""}
            />
          </div>
        </section>

        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Disponibilidade
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelect
              label="Status"
              name="stockStatus"
              defaultValue={product?.stock_status ?? "available"}
              options={[
                { value: "available", label: "Disponivel" },
                { value: "unavailable", label: "Indisponivel" },
                { value: "on_request", label: "Sob consulta" },
              ]}
            />
            <FormSelect
              label="Condicao"
              name="condition"
              defaultValue={product?.condition ?? "new"}
              options={[
                { value: "new", label: "Novo / lacrado" },
                { value: "used", label: "Usado" },
                { value: "open_box", label: "Open box" },
              ]}
            />
            <FormField
              label="Quantidade em estoque"
              name="stockQuantity"
              type="number"
              min="0"
              defaultValue={product?.stock_quantity ?? 0}
            />
          </div>
        </section>

        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Publicacao
          </h2>
          <div className="flex flex-wrap gap-6">
            <FormCheckbox
              label="Produto ativo"
              name="active"
              defaultChecked={product?.active ?? true}
            />
            <FormCheckbox
              label="Produto em destaque"
              name="featured"
              defaultChecked={product?.featured ?? false}
            />
          </div>
        </section>

        <ResponsibilityNotice>
          Ao cadastrar ou alterar este produto, o lojista declara ser o unico
          responsavel pelas informacoes inseridas, incluindo nome, descricao,
          preco, imagens, disponibilidade, procedencia, originalidade, garantia,
          entrega, troca, atendimento e cumprimento das obrigacoes legais e
          fiscais aplicaveis.
        </ResponsibilityNotice>

        <button
          type="submit"
          disabled={savePending}
          className="bg-primary hover:bg-primary-hover rounded-full px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {savePending ? "Salvando..." : product ? "Salvar alteracoes" : "Cadastrar produto"}
        </button>
      </form>

      {product ? (
        <ProductImageManager
          productId={product.id}
          images={product.product_images}
        />
      ) : (
        <p className="text-muted text-sm">
          Salve o produto primeiro para enviar as fotos.
        </p>
      )}
    </div>
  );
}
