import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/BrandForm";
import { getAdminBrandById } from "@/services/admin/brands";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getAdminBrandById(id);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-foreground mb-6 text-2xl font-bold">Editar marca</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
