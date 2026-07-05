import Link from "next/link";
import { Plus } from "lucide-react";
import { adminButtonPrimary } from "@/lib/ui/admin-buttons";
import { getAdminCategoriesList } from "@/services/admin/categories";
import { importCategoriesFromCsv } from "@/actions/admin/categories";
import { CsvImporter } from "@/components/admin/CsvImporter";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesList();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Categorias</h1>
          <p className="text-muted mt-1 text-sm">
            {categories.length} categoria(s) cadastrada(s)
          </p>
        </div>
        <Link
          href="/admin/categorias/novo"
          className={adminButtonPrimary}
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Link>
      </div>

      <CsvImporter
        title="Importar categorias via CSV"
        description="Cadastre varias categorias de uma vez. Use virgula ou ponto-e-virgula como separador."
        templateHeaders="name,slug,description,sort_order,active"
        templateExample='Eletronicos,eletronicos,"Smartphones, tablets e acessorios",1,true'
        action={importCategoriesFromCsv}
      />

      {categories.length === 0 ? (
        <div className="border-border bg-surface rounded-[var(--radius-card)] border p-12 text-center">
          <p className="text-muted">Nenhuma categoria cadastrada.</p>
        </div>
      ) : (
        <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
          <table className="w-full text-left text-sm">
            <thead className="border-border bg-background border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Ordem</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-background/50">
                  <td className="text-muted px-4 py-3">{category.sort_order}</td>
                  <td className="text-foreground px-4 py-3 font-medium">
                    {category.name}
                  </td>
                  <td className="text-muted px-4 py-3">{category.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        category.active
                          ? "text-primary text-xs font-semibold"
                          : "text-muted text-xs font-semibold"
                      }
                    >
                      {category.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/categorias/${category.id}`}
                      className="text-primary font-semibold"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
