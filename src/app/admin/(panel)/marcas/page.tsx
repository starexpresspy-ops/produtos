import Link from "next/link";
import { Plus } from "lucide-react";
import { adminButtonPrimary } from "@/lib/ui/admin-buttons";
import { CsvImporter } from "@/components/admin/CsvImporter";
import { importBrandsFromCsv } from "@/actions/admin/brands";
import { getAdminBrandsList } from "@/services/admin/brands";

export default async function AdminBrandsPage() {
  const brands = await getAdminBrandsList();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Marcas</h1>
          <p className="text-muted text-sm">{brands.length} marca(s) cadastrada(s)</p>
        </div>
        <Link
          href="/admin/marcas/novo"
          className={adminButtonPrimary}
        >
          <Plus className="h-4 w-4" />
          Nova marca
        </Link>
      </div>

      <CsvImporter
        title="Importar marcas via CSV"
        description="Cadastre varias marcas de uma vez."
        templateHeaders="name,slug,active"
        templateExample="Apple,apple,true"
        action={importBrandsFromCsv}
      />

      <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
        <table className="w-full text-left text-sm">
          <thead className="border-border bg-background border-b">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted px-4 py-8 text-center text-sm">
                  Nenhuma marca cadastrada.{" "}
                  <Link href="/admin/marcas/novo" className="text-primary font-semibold">
                    Cadastre a primeira marca
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-4 py-3">{brand.name}</td>
                  <td className="text-muted px-4 py-3">{brand.slug}</td>
                  <td className="px-4 py-3">{brand.active ? "Ativa" : "Inativa"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/marcas/${brand.id}`} className="text-primary font-semibold">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
