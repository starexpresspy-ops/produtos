import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroBanner } from "@/components/public/HeroBanner";
import { Benefits } from "@/components/public/Benefits";
import { CategoryCard } from "@/components/public/CategoryCard";
import { ProductGrid } from "@/components/public/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getCategories,
  getHomeProducts,
  getStoreSettings,
} from "@/services/catalog";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, { featured, recent }] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getHomeProducts(),
  ]);

  return (
    <>
      <HeroBanner whatsappNumber={settings.whatsappNumber} />

      <section className="py-12">
        <Container>
          <SectionHeading
            title="Categorias"
            subtitle="Navegue pelas principais categorias da loja"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {featured.length > 0 ? (
        <section className="py-4">
          <Container>
            <SectionHeading
              title="Produtos em destaque"
              subtitle="Seleção especial da nossa vitrine"
              linkHref="/produtos"
              linkLabel="Ver todos"
            />
            <ProductGrid
              products={featured}
              whatsappNumber={settings.whatsappNumber}
            />
          </Container>
        </section>
      ) : null}

      <section className="py-12">
        <Container>
          <SectionHeading
            title="Adicionados recentemente"
            subtitle="Os produtos mais novos da loja"
            linkHref="/produtos"
            linkLabel="Ver catálogo"
          />
          {recent.length > 0 ? (
            <ProductGrid
              products={recent}
              whatsappNumber={settings.whatsappNumber}
            />
          ) : (
            <EmptyState
              title="Em breve novos produtos"
              description="Volte mais tarde para conferir as novidades."
            />
          )}
        </Container>
      </section>

      <Benefits />
    </>
  );
}
