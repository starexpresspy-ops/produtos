import Link from "next/link";
import { Plus } from "lucide-react";
import { CsvImporter } from "@/components/admin/CsvImporter";
import { importProductsFromCsv } from "@/actions/admin/products-import";
import { getAdminProductsList } from "@/services/admin/products";

export default async function AdminProductsPage() {
  const products = await getAdminProductsList();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Produtos</h1>
          <p className="text-muted text-sm">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Link>
      </div>

      <CsvImporter
        title="Importar produtos via CSV"
        description="Importe rapidamente o catalogo."
        templateHeaders="name,slug,price,category_slug,brand_slug,stock_status,condition"
        templateExample="iPhone 15,iphone-15,4999,eletronicos,apple,available,new"
        action={importProductsFromCsv}
      />

      <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
        <table className="w-full text-left text-sm">
          <thead className="border-border bg-background border-b">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preco</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">
                  R$ {Number(product.promotional_price ?? product.price).toFixed(2)}
                </td>
                <td className="px-4 py-3">{product.stock_status}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/produtos/${product.id}`} className="text-primary font-semibold">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
