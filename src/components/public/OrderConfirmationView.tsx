import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ResponsibilityNotice } from "@/components/shared/ResponsibilityNotice";
import { WhatsappButtons } from "@/components/shared/WhatsappButtons";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatOrderLabel } from "@/lib/formatters/order-number";
import { getOrderItemsSubtotal, getOrderShippingFee } from "@/lib/cart";
import type { Order } from "@/types/order";
import type { WhatsappContact } from "@/lib/whatsapp";

export function OrderConfirmationView({
  order,
  whatsappContacts,
}: {
  order: Order;
  whatsappContacts: WhatsappContact[];
}) {
  const message = order.whatsappMessage ?? "";
  const itemsSubtotal = getOrderItemsSubtotal(order.items ?? []);
  const shippingFee = getOrderShippingFee(order.items ?? [], order.total);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Pedido {formatOrderLabel(order)} registrado
          </h1>
          <p className="text-muted mt-2 text-sm">
            Revise seus dados e os itens abaixo. Em seguida, envie o pedido pelo
            WhatsApp para a loja finalizar o atendimento.
          </p>
        </div>

        <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Dados para entrega
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-muted text-sm">Nome completo</dt>
              <dd className="text-foreground mt-1 font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-muted text-sm">Telefone / WhatsApp</dt>
              <dd className="text-foreground mt-1 font-medium">{order.customerPhone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted text-sm">Endereco completo</dt>
              <dd className="text-foreground mt-1 whitespace-pre-line font-medium">
                {order.customerAddress}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
          <div className="border-border border-b px-4 py-3">
            <h2 className="text-foreground text-lg font-semibold">Itens do pedido</h2>
          </div>
          <ul className="divide-border divide-y">
            {(order.items ?? []).map((item) => (
              <li key={item.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4">
                <div>
                  {item.productSlug ? (
                    <Link
                      href={`/produto/${item.productSlug}`}
                      className="text-foreground hover:text-primary font-semibold"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="text-foreground font-semibold">{item.productName}</p>
                  )}
                  {item.shortDescription ? (
                    <p className="text-muted mt-1 text-sm">{item.shortDescription}</p>
                  ) : null}
                </div>
                <div className="text-sm">
                  <span className="text-muted sm:hidden">Qtd.: </span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted sm:hidden">Unit.: </span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                </div>
                <div className="text-primary text-sm font-bold sm:text-right">
                  <span className="text-muted sm:hidden">Total: </span>
                  {formatCurrency(item.subtotal)}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-border bg-background border-t px-4 py-4">
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
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-foreground text-lg font-semibold">Total do pedido</span>
              <span className="text-primary text-2xl font-extrabold">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <ResponsibilityNotice>
            Em breve entraremos em contato para finalizar a compra. Favor se atentar as
            informacoes inseridas — informacoes erradas voce correra o risco de perder a
            mercadoria.
          </ResponsibilityNotice>
          <ResponsibilityNotice>
            Seus dados serao usados somente para processar este pedido e contato da loja.
          </ResponsibilityNotice>
        </div>

        <div className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-3 text-lg font-semibold">
            Enviar pedido pelo WhatsApp
          </h2>
          <p className="text-muted mb-4 text-sm">
            Clique abaixo para abrir o WhatsApp da loja com a mensagem do seu pedido
            pronta para enviar.
          </p>
          <WhatsappButtons
            contacts={whatsappContacts.map((contact) => ({
              ...contact,
              label: `Enviar no ${contact.label}`,
            }))}
            message={message}
            size="lg"
            fullWidth
            layout="column"
          />
        </div>

        <div className="text-center">
          <Link href="/produtos" className="text-primary text-sm font-semibold hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    </Container>
  );
}
