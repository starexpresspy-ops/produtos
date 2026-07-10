import Link from "next/link";
import type { ProductWithRelations } from "@/types";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AddToCartButton } from "@/components/public/AddToCartButton";
import { ProductCoverImage } from "@/components/shared/ProductCoverImage";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.images.find((img) => img.isCover) ?? product.images[0];

  return (
    <article className="border-border bg-surface rounded-[var(--radius-card)] border p-4">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="bg-background relative mb-3 aspect-square overflow-hidden rounded-xl">
          <ProductCoverImage
            name={product.name}
            imageUrl={cover?.url}
            sizes="280px"
          />
        </div>
        <h3 className="text-foreground line-clamp-2 min-h-[3rem] text-base font-semibold">
          {product.name}
        </h3>
      </Link>
      <div className="mt-2">
        <PriceDisplay price={product.price} promotionalPrice={product.promotionalPrice} />
      </div>
      <div className="mt-2">
        <StatusBadge status={product.stockStatus} />
      </div>
      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
