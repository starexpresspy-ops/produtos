"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: Array<{ id: string; url: string; alt?: string; isCover: boolean }>;
  productName: string;
}) {
  const fallback = "https://picsum.photos/seed/star-fallback/1000/1000";
  const ordered = useMemo(
    () =>
      [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover)) || [],
    [images],
  );
  const [active, setActive] = useState(0);
  const current = ordered[active]?.url || ordered[0]?.url || fallback;

  return (
    <div>
      <div className="bg-surface relative aspect-square overflow-hidden rounded-[var(--radius-card)]">
        <Image src={current} alt={productName} fill className="object-cover" sizes="700px" />
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
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
