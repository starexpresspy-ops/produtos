"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { ActionResult } from "@/types/actions";
import { STORE_ASSET_UPLOAD_HINT } from "@/lib/supabase/store-assets";

interface StoreAssetImageUploadProps {
  title: string;
  description: string;
  imageUrl?: string;
  uploadAction: (formData: FormData) => Promise<ActionResult>;
  removeAction: () => Promise<ActionResult>;
}

export function StoreAssetImageUpload({
  title,
  description,
  imageUrl,
  uploadAction,
  removeAction,
}: StoreAssetImageUploadProps) {
  const [uploadState, uploadFormAction, uploadPending] = useActionState<
    ActionResult,
    FormData
  >(async (_prev, formData) => uploadAction(formData), {});

  const [removeState, removeFormAction, removePending] = useActionState<
    ActionResult,
    FormData
  >(async () => removeAction(), {});

  const error = uploadState?.error || removeState?.error;
  const success = uploadState?.success || removeState?.success;

  return (
    <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
      <h2 className="text-foreground mb-1 text-lg font-semibold">{title}</h2>
      <p className="text-muted mb-1 text-sm">{description}</p>
      <p className="text-muted mb-4 text-xs">{STORE_ASSET_UPLOAD_HINT}</p>

      {error ? (
        <div className="bg-danger/10 text-danger mb-4 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="bg-primary/10 text-primary mb-4 rounded-lg px-4 py-3 text-sm">
          Imagem atualizada com sucesso!
        </div>
      ) : null}

      {imageUrl ? (
        <div className="mb-4 flex items-start gap-4">
          <div className="border-border relative h-28 w-28 overflow-hidden rounded-lg border">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <form action={removeFormAction}>
            <button
              type="submit"
              disabled={removePending}
              className="text-danger text-sm font-medium hover:underline disabled:opacity-60"
            >
              {removePending ? "Removendo..." : "Remover imagem"}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-muted mb-4 text-sm">Nenhuma imagem cadastrada.</p>
      )}

      <form
        action={uploadFormAction}
        encType="multipart/form-data"
        className="flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor={`asset-${title}`}
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            {imageUrl ? "Substituir imagem" : "Enviar imagem"} (JPEG, PNG, WebP
            — max 5 MB)
          </label>
          <input
            id={`asset-${title}`}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!imageUrl}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploadPending}
          className="border-border hover:bg-background rounded-full border px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {uploadPending ? "Enviando..." : "Enviar imagem"}
        </button>
      </form>
    </section>
  );
}
