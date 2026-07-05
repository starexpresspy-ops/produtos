import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CatalogView } from "@/components/public/CatalogView";
import {
  getBrands,
  getCategories,
  getProducts,
  getStoreSettings,
} from "@/services/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Confira todos os produtos importados disponíveis: eletrônicos, perfumes e acessórios.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const { busca } = await searchParams;

  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(),
  ]);

  const settings = await getStoreSettings();

  return (
    <Container className="py-10">
      <div className="mb-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Todos os produtos
        </h1>
        <p className="text-muted mt-1">
          Use a busca e os filtros para encontrar o que procura.
        </p>
      </div>

      <CatalogView
        products={products}
        categories={categories}
        brands={brands}
        whatsappNumber={settings.whatsappNumber}
        initialSearch={busca ?? ""}
      />
    </Container>
  );
}
