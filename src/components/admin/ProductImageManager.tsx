"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import {
  uploadProductImages,
  deleteProductImageForm,
  setProductCoverImageForm,
} from "@/actions/admin/products";
import { MAX_PRODUCT_IMAGES } from "@/lib/supabase/product-mappers";
import { IMAGE_UPLOAD_HINT } from "@/lib/supabase/product-images";
import { adminButtonPrimary, adminButtonSecondary } from "@/lib/ui/admin-buttons";
import type { ActionResult } from "@/types/actions";
import { getPublicImageUrl } from "@/lib/supabase/mappers";

interface ProductImageRow {
  id: string;
  storage_path: string;
  is_cover: boolean;
}

interface ProductImageManagerProps {
  productId: string;
  images: ProductImageRow[];
}

export function ProductImageManager({
  productId,
  images,
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const [uploadState, uploadFormAction, uploadPending] = useActionState<
    ActionResult,
    FormData
  >(
    async (_prev, formData) => {
      const result = await uploadProductImages(productId, formData);
      if (result.success) {
        setSelectedCount(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return result;
    },
    {},
  );

  const remaining = MAX_PRODUCT_IMAGES - images.length;

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedCount(event.target.files?.length ?? 0);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
      <h2 className="text-foreground mb-1 text-lg font-semibold">Imagens</h2>
      <p className="text-muted mb-1 text-sm">
        Ate {MAX_PRODUCT_IMAGES} fotos por produto. A primeira enviada vira capa
        automaticamente; voce pode alterar depois.
      </p>
      <p className="text-muted mb-4 text-xs">{IMAGE_UPLOAD_HINT}</p>

      {uploadState?.error ? (
        <div className="bg-danger/10 text-danger mb-4 rounded-lg px-4 py-3 text-sm">
          {uploadState.error}
        </div>
      ) : null}
      {uploadState?.success ? (
        <div className="bg-primary/10 text-primary mb-4 rounded-lg px-4 py-3 text-sm">
          Imagem(ns) enviada(s) com sucesso!
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => {
            const url = getPublicImageUrl("product-images", img.storage_path);
            if (!url) return null;

            return (
              <div
                key={img.id}
                className="border-border flex gap-3 rounded-lg border p-3"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {img.is_cover ? (
                    <span className="bg-gold absolute top-1 left-1 rounded px-1 text-[10px] font-bold text-white">
                      Capa
                    </span>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  {!img.is_cover ? (
                    <form action={setProductCoverImageForm.bind(null, productId, img.id)}>
                      <button
                        type="submit"
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        Definir como capa
                      </button>
                    </form>
                  ) : (
                    <span className="text-muted text-xs">Imagem de capa</span>
                  )}
                  <form action={deleteProductImageForm.bind(null, productId, img.id)}>
                    <button
                      type="submit"
                      className="text-danger text-xs font-medium hover:underline"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted mb-4 text-sm">Nenhuma imagem cadastrada.</p>
      )}

      {remaining > 0 ? (
        <form
          action={uploadFormAction}
          encType="multipart/form-data"
          className="space-y-4"
        >
          <input
            ref={fileInputRef}
            id="product-images"
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFilesChange}
          />

          <div>
            <p className="text-foreground mb-1.5 text-sm font-medium">
              Enviar imagens (JPEG, PNG, WebP — max 1 MB cada)
            </p>
            <p className="text-muted mb-3 text-xs">
              Voce pode selecionar ate {remaining} imagem(ns).
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                className={adminButtonPrimary}
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
                Selecionar imagens
              </button>

              <button
                type="submit"
                disabled={uploadPending || selectedCount === 0}
                className={adminButtonSecondary}
              >
                {uploadPending ? "Enviando..." : "Enviar imagens"}
              </button>
            </div>

            {selectedCount > 0 ? (
              <p className="text-primary mt-3 text-sm font-medium">
                {selectedCount} imagem(ns) selecionada(s). Clique em &quot;Enviar
                imagens&quot; para fazer o upload.
              </p>
            ) : (
              <p className="text-muted mt-3 text-sm">
                Clique em &quot;Selecionar imagens&quot; para escolher as fotos do
                produto.
              </p>
            )}
          </div>
        </form>
      ) : (
        <p className="text-muted text-sm">
          Limite de {MAX_PRODUCT_IMAGES} imagens atingido. Remova uma para
          enviar outra.
        </p>
      )}
    </section>
  );
}
