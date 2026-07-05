"use client";

import { useActionState } from "react";
import {
  saveCategory,
  uploadCategoryImage,
  removeCategoryImage,
} from "@/actions/admin/categories";
import type { ActionResult } from "@/types/actions";
import { StoreAssetImageUpload } from "@/components/admin/StoreAssetImageUpload";
import { getPublicImageUrl } from "@/lib/supabase/mappers";
import {
  FormCheckbox,
  FormField,
  FormTextarea,
} from "@/components/ui/FormField";
import { adminButtonPrimary } from "@/lib/ui/admin-buttons";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    sort_order: number;
    active: boolean;
  };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) =>
      category
        ? saveCategory(formData, category.id)
        : saveCategory(formData),
    {},
  );

  return (
    <div className="space-y-8">
      {state?.error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm">
          Categoria salva com sucesso!
        </div>
      ) : null}

      <form
        action={formAction}
        className="border-border bg-surface max-w-lg space-y-4 rounded-[var(--radius-card)] border p-6"
      >
        <FormField
          label="Nome da categoria"
          name="name"
          required
          defaultValue={category?.name}
        />
        <FormField
          label="Slug (URL)"
          name="slug"
          placeholder="gerado-automaticamente"
          defaultValue={category?.slug}
        />
        <FormTextarea
          label="Descricao"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
        />
        <FormField
          label="Ordem de exibicao"
          name="sortOrder"
          type="number"
          min="0"
          defaultValue={category?.sort_order ?? 0}
        />
        <FormCheckbox
          label="Categoria ativa"
          name="active"
          defaultChecked={category?.active ?? true}
        />
        <button
          type="submit"
          disabled={pending}
          className={adminButtonPrimary}
        >
          {pending
            ? "Salvando..."
            : category
              ? "Salvar alteracoes"
              : "Cadastrar categoria"}
        </button>
      </form>

      {category ? (
        <div className="max-w-lg">
          <StoreAssetImageUpload
            title="Imagem da categoria"
            description="Exibida na home e na pagina da categoria."
            imageUrl={getPublicImageUrl("store-assets", category.image_path)}
            uploadAction={uploadCategoryImage.bind(null, category.id)}
            removeAction={removeCategoryImage.bind(null, category.id)}
          />
        </div>
      ) : (
        <p className="text-muted max-w-lg text-sm">
          Salve a categoria primeiro para enviar a imagem.
        </p>
      )}
    </div>
  );
}
