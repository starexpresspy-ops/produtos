"use client";

import { useActionState } from "react";
import Image from "next/image";
import {
  uploadProductImages,
  deleteProductImageForm,
  setProductCoverImageForm,
} from "@/actions/admin/products";
import { MAX_PRODUCT_IMAGES } from "@/lib/supabase/product-mappers";
import { IMAGE_UPLOAD_HINT } from "@/lib/supabase/product-images";
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
  const [uploadState, uploadFormAction, uploadPending] = useActionState<
    ActionResult,
    FormData
  >(
    async (_prev, formData) => uploadProductImages(productId, formData),
    {},
  );

  const remaining = MAX_PRODUCT_IMAGES - images.length;

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
          className="flex flex-wrap items-end gap-4"
        >
          <div>
            <label
              htmlFor="product-images"
              className="text-foreground mb-1.5 block text-sm font-medium"
            >
              Enviar imagens (JPEG, PNG, WebP — max 5 MB cada)
            </label>
            <input
              id="product-images"
              name="files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              className="text-sm"
            />
            <p className="text-muted mt-1 text-xs">
              Voce pode selecionar ate {remaining} imagem(ns).
            </p>
          </div>
          <button
            type="submit"
            disabled={uploadPending}
            className="border-border hover:bg-background rounded-full border px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {uploadPending ? "Enviando..." : "Enviar imagens"}
          </button>
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
