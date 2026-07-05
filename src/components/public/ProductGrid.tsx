import type { ProductWithRelations } from "@/types";
import { ProductCard } from "@/components/public/ProductCard";

export function ProductGrid({
  products,
  whatsappNumber,
}: {
  products: ProductWithRelations[];
  whatsappNumber: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          whatsappNumber={whatsappNumber}
        />
      ))}
    </div>
  );
}
