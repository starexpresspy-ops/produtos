import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CatalogView } from "@/components/public/CatalogView";
import {
  getBrands,
  getCategories,
  getCategoryBySlug,
  getProducts,
  getStoreSettings,
} from "@/services/catalog";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({ categorySlug: slug }),
  ]);

  const settings = await getStoreSettings();

  return (
    <Container className="py-10">
      <div className="mb-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          {category.name}
        </h1>
        {category.description ? (
          <p className="text-muted mt-1">{category.description}</p>
        ) : null}
      </div>

      <CatalogView
        products={products}
        categories={categories}
        brands={brands}
        whatsappNumber={settings.whatsappNumber}
        initialCategorySlug={category.slug}
      />
    </Container>
  );
}
