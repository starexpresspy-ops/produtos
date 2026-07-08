import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, ShieldCheck, Truck } from "lucide-react";
import type { ProductCondition } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGallery } from "@/components/public/ProductGallery";
import { ProductGrid } from "@/components/public/ProductGrid";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { StatusBadge, FeaturedBadge } from "@/components/shared/StatusBadge";
import { ProductAddToCart } from "@/components/public/ProductAddToCart";
import { ShareButton } from "@/components/shared/ShareButton";
import {
  getProductBySlug,
  getRelatedProducts,
  getStoreSettings,
} from "@/services/catalog";
import { SITE_URL } from "@/constants/store";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Novo / lacrado",
  used: "Usado",
  open_box: "Open box",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  return {
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
  };
}

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);
  const productUrl = `${SITE_URL}/produto/${product.slug}`;

  return (
    <Container className="py-8">
      <nav
        className="text-muted mb-6 flex flex-wrap items-center gap-1 text-sm"
        aria-label="Navegação estrutural"
      >
        <Link href="/" className="hover:text-primary">
          Início
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/produtos" className="hover:text-primary">
          Produtos
        </Link>
        {product.category ? (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/categoria/${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {product.featured ? <FeaturedBadge /> : null}
            <StatusBadge status={product.stockStatus} />
          </div>

          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="text-muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {product.brand ? <span>Marca: {product.brand.name}</span> : null}
            {product.sku ? <span>Código: {product.sku}</span> : null}
            <span>Condição: {CONDITION_LABELS[product.condition]}</span>
          </div>

          {product.shortDescription ? (
            <p className="text-foreground mt-4">{product.shortDescription}</p>
          ) : null}

          <div className="border-border my-6 border-t" />

          <PriceDisplay
            price={product.price}
            promotionalPrice={product.promotionalPrice}
            size="lg"
          />

          <div className="mt-6 space-y-3">
            <ProductAddToCart product={product} />
            <ShareButton
              title={product.name}
              url={productUrl}
              text={product.shortDescription}
            />
          </div>

          <ul className="text-muted mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
              {product.warrantyText ?? settings.warrantyText}
            </li>
            <li className="flex items-center gap-2">
              <Truck className="text-primary h-4 w-4 shrink-0" />
              {settings.deliveryText}
            </li>
            {product.originText ? (
              <li className="flex items-center gap-2">
                <Package className="text-primary h-4 w-4 shrink-0" />
                {product.originText}
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {product.description ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-foreground mb-3 text-xl font-bold">
            Descrição do produto
          </h2>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16">
          <SectionHeading title="Produtos relacionados" />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </Container>
  );
}
