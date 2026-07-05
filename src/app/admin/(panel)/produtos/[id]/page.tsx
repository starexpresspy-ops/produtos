import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCategoriesList } from "@/services/admin/categories";
import { getAdminBrandsForProduct } from "@/services/admin/brands";
import { getAdminProductById } from "@/services/admin/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const [categories, brands] = await Promise.all([
    getAdminCategoriesList({ activeOnly: true }),
    getAdminBrandsForProduct(product.brand_id),
  ]);

  return (
    <div>
      <h1 className="text-foreground mb-6 text-2xl font-bold">Editar produto</h1>
      <ProductForm categories={categories} brands={brands} product={product} />
    </div>
  );
}
