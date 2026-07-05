import { notFound } from "next/navigation";
import { getAdminCategoryById } from "@/services/admin/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) notFound();

  return (
    <div>
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Editar categoria
      </h1>
      <CategoryForm category={category} />
    </div>
  );
}
