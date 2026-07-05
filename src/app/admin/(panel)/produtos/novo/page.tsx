import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCategoriesList } from "@/services/admin/categories";
import { getAdminBrandsForProduct } from "@/services/admin/brands";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAdminCategoriesList({ activeOnly: true }),
    getAdminBrandsForProduct(),
  ]);

  return (
    <div>
      <h1 className="text-foreground mb-6 text-2xl font-bold">Cadastrar produto</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
