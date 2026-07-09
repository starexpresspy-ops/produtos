import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAdminOrderById } from "@/services/admin/orders";
import { OrderActions } from "@/components/admin/OrderActions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatOrderNumber } from "@/lib/formatters/order-number";
import { getOrderItemsSubtotal, getOrderShippingFee } from "@/lib/cart";
import type { OrderStatus } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Aguardando confirmacao",
  confirmed: "Pagamento confirmado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const itemsSubtotal = getOrderItemsSubtotal(order.items ?? []);
  const shippingFee = getOrderShippingFee(order.items ?? [], order.total);

  return (
    <div className="space-y-8">
      <nav className="text-muted flex flex-wrap items-center gap-1 text-sm">
        <Link href="/admin/pedidos" className="hover:text-primary">
          Pedidos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{formatOrderNumber(order.orderNumber)}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            Pedido {formatOrderNumber(order.orderNumber)}
          </h1>
          <p className="text-muted mt-1 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={
            order.status === "pending"
              ? "bg-gold/15 text-gold rounded-full px-4 py-1.5 text-sm font-semibold"
              : "bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold"
          }
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Dados do cliente</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Nome</dt>
              <dd className="text-foreground font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-muted">Telefone</dt>
              <dd className="text-foreground font-medium">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-muted">Endereco</dt>
              <dd className="text-foreground whitespace-pre-line">{order.customerAddress}</dd>
            </div>
          </dl>
        </section>

        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="text-muted flex items-center justify-between gap-4">
              <span>Subtotal dos produtos</span>
              <span className="text-foreground font-medium">
                {formatCurrency(itemsSubtotal)}
              </span>
            </div>
            <div className="text-muted flex items-center justify-between gap-4">
              <span>Frete</span>
              <span className="text-foreground font-medium">
                {formatCurrency(shippingFee)}
              </span>
            </div>
          </div>
          <p className="text-primary mt-4 text-3xl font-extrabold">
            {formatCurrency(order.total)}
          </p>
          {order.confirmedAt ? (
            <p className="text-muted mt-3 text-sm">
              Confirmado em {formatDate(order.confirmedAt)}
            </p>
          ) : null}
          <div className="mt-6">
            <OrderActions orderId={order.id} status={order.status} />
          </div>
        </section>
      </div>

      <section className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
        <div className="border-border border-b px-4 py-3">
          <h2 className="text-foreground text-lg font-semibold">Itens do pedido</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-border bg-background border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Qtd.</th>
              <th className="px-4 py-3 font-semibold">Valor unit.</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">{item.productName}</p>
                  {item.shortDescription ? (
                    <p className="text-muted mt-1 text-xs">{item.shortDescription}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(item.unitPrice)}</td>
                <td className="text-primary px-4 py-3 font-semibold">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
