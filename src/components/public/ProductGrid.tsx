import type { ProductWithRelations } from "@/types";
import type { WhatsappContact } from "@/lib/whatsapp";
import { ProductCard } from "@/components/public/ProductCard";

export function ProductGrid({
  products,
  whatsappContacts,
}: {
  products: ProductWithRelations[];
  whatsappContacts: WhatsappContact[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          whatsappContacts={whatsappContacts}
        />
      ))}
    </div>
  );
}
