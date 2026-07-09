import Link from "next/link";
import { getAdminOrdersList } from "@/services/admin/orders";
import { OrderListActions } from "@/components/admin/OrderActions";
import { formatCurrency } from "@/lib/formatters/currency";
import type { OrderStatus } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Aguardando confirmacao",
  confirmed: "Pagamento confirmado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrdersList();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Pedidos</h1>
        <p className="text-muted mt-1 text-sm">
          {orders.length} pedido(s) recebido(s) pela vitrine.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border-border bg-surface rounded-[var(--radius-card)] border p-12 text-center">
          <p className="text-muted">Nenhum pedido recebido ainda.</p>
        </div>
      ) : (
        <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
          <table className="w-full text-left text-sm">
            <thead className="border-border bg-background border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-background/50">
                  <td className="text-muted px-4 py-3">{formatDate(order.createdAt)}</td>
                  <td className="text-foreground px-4 py-3 font-medium">
                    {order.customerName}
                  </td>
                  <td className="text-muted px-4 py-3">{order.customerPhone}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        order.status === "pending"
                          ? "text-gold text-xs font-semibold"
                          : "text-primary text-xs font-semibold"
                      }
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Ver detalhes
                      </Link>
                      <OrderListActions orderId={order.id} status={order.status} />
                    </div>
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
