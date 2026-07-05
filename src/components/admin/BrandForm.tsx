"use client";

import { useActionState } from "react";
import {
  saveBrand,
  uploadBrandLogo,
  removeBrandLogo,
} from "@/actions/admin/brands";
import type { ActionResult } from "@/types/actions";
import { StoreAssetImageUpload } from "@/components/admin/StoreAssetImageUpload";
import { getPublicImageUrl } from "@/lib/supabase/mappers";
import {
  FormCheckbox,
  FormField,
} from "@/components/ui/FormField";

interface BrandFormProps {
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo_path: string | null;
    active: boolean;
  };
}

export function BrandForm({ brand }: BrandFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) =>
      brand ? saveBrand(formData, brand.id) : saveBrand(formData),
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
          Marca salva com sucesso!
        </div>
      ) : null}

      <form
        action={formAction}
        className="border-border bg-surface max-w-lg space-y-4 rounded-[var(--radius-card)] border p-6"
      >
        <FormField
          label="Nome da marca"
          name="name"
          required
          defaultValue={brand?.name}
        />
        <FormField
          label="Slug (URL)"
          name="slug"
          placeholder="gerado-automaticamente"
          defaultValue={brand?.slug}
        />
        <FormCheckbox
          label="Marca ativa"
          name="active"
          defaultChecked={brand?.active ?? true}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-primary-hover rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending
            ? "Salvando..."
            : brand
              ? "Salvar alteracoes"
              : "Cadastrar marca"}
        </button>
      </form>

      {brand ? (
        <div className="max-w-lg">
          <StoreAssetImageUpload
            title="Logo da marca"
            description="Exibido na vitrine quando a marca estiver vinculada ao produto."
            imageUrl={getPublicImageUrl("store-assets", brand.logo_path)}
            uploadAction={uploadBrandLogo.bind(null, brand.id)}
            removeAction={removeBrandLogo.bind(null, brand.id)}
          />
        </div>
      ) : (
        <p className="text-muted max-w-lg text-sm">
          Salve a marca primeiro para enviar o logo.
        </p>
      )}
    </div>
  );
}
