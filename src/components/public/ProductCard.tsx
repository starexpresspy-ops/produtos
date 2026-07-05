import Link from "next/link";
import Image from "next/image";
import type { ProductWithRelations } from "@/types";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { buildProductMessage } from "@/lib/whatsapp";
import { SITE_URL } from "@/constants/store";

export function ProductCard({
  product,
  whatsappNumber,
}: {
  product: ProductWithRelations;
  whatsappNumber: string;
}) {
  const cover = product.images.find((img) => img.isCover) ?? product.images[0];
  const productUrl = `${SITE_URL}/produto/${product.slug}`;
  return (
    <article className="border-border bg-surface rounded-[var(--radius-card)] border p-4">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="bg-background relative mb-3 aspect-square overflow-hidden rounded-xl">
          {cover?.url ? (
            <Image src={cover.url} alt={product.name} fill className="object-cover" sizes="280px" />
          ) : null}
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
        <WhatsappButton
          phone={whatsappNumber}
          message={buildProductMessage({ product, productUrl })}
          label="Pedir no WhatsApp"
          fullWidth
        />
      </div>
    </article>
  );
}
