import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/public/CartView";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os produtos selecionados antes de finalizar o pedido.",
};

export const revalidate = 60;

export default function CartPage() {
  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Carrinho</h1>
        <p className="text-muted mt-2 text-sm">
          Revise descricao, quantidade, valor unitario e total de cada produto antes de
          finalizar.
        </p>
      </div>

      <CartView />
    </Container>
  );
}
