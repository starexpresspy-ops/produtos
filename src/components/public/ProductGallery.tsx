"use client";

import { useMemo, useState } from "react";
import { ProductCoverImage } from "@/components/shared/ProductCoverImage";

export function ProductGallery({
  images,
  productName,
}: {
  images: Array<{ id: string; url: string; alt?: string; isCover: boolean }>;
  productName: string;
}) {
  const ordered = useMemo(
    () =>
      [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover)) || [],
    [images],
  );
  const [active, setActive] = useState(0);
  const current = ordered[active]?.url || ordered[0]?.url;

  return (
    <div>
      <div className="bg-surface relative aspect-square overflow-hidden rounded-[var(--radius-card)]">
        <ProductCoverImage
          name={productName}
          imageUrl={current}
          sizes="700px"
          imageClassName="object-contain p-6"
        />
      </div>
      {ordered.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {ordered.map((img, index) => (
            <button
              type="button"
              key={img.id}
              className="border-border bg-surface relative aspect-square overflow-hidden rounded-lg border"
              onClick={() => setActive(index)}
            >
              <ProductCoverImage
                name={productName}
                imageUrl={img.url}
                sizes="120px"
                imageClassName="object-contain p-1"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
