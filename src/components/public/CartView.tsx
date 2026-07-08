"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CART_CUSTOMER_STORAGE_KEY } from "@/constants/cart";
import { getLineTotal, getMaxQuantity } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters/currency";
import { buildCartMessage } from "@/lib/whatsapp";
import { WhatsappButtons } from "@/components/shared/WhatsappButtons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResponsibilityNotice } from "@/components/shared/ResponsibilityNotice";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import type { CartCustomerInfo } from "@/types/cart";
import type { WhatsappContact } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

const EMPTY_CUSTOMER: CartCustomerInfo = {
  name: "",
  address: "",
  phone: "",
};

function readStoredCustomer(): CartCustomerInfo {
  if (typeof window === "undefined") return EMPTY_CUSTOMER;

  try {
    const raw = window.localStorage.getItem(CART_CUSTOMER_STORAGE_KEY);
    if (!raw) return EMPTY_CUSTOMER;
    const parsed = JSON.parse(raw) as Partial<CartCustomerInfo>;
    return {
      name: parsed.name ?? "",
      address: parsed.address ?? "",
      phone: parsed.phone ?? "",
    };
  } catch {
    return EMPTY_CUSTOMER;
  }
}

function isCustomerValid(customer: CartCustomerInfo) {
  return (
    customer.name.trim().length >= 2 &&
    customer.address.trim().length >= 10 &&
    customer.phone.replace(/\D/g, "").length >= 10
  );
}

export function CartView({ whatsappContacts }: { whatsappContacts: WhatsappContact[] }) {
  const { items, total, updateQuantity, removeItem, clearCart, isReady } = useCart();
  const [customer, setCustomer] = useState<CartCustomerInfo>(() =>
    typeof window !== "undefined" ? readStoredCustomer() : EMPTY_CUSTOMER,
  );

  useEffect(() => {
    window.localStorage.setItem(CART_CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
  }, [customer]);

  function updateCustomer<K extends keyof CartCustomerInfo>(
    field: K,
    value: CartCustomerInfo[K],
  ) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  if (!isReady) {
    return (
      <div className="border-border bg-surface rounded-[var(--radius-card)] border p-10 text-center">
        <p className="text-muted text-sm">Carregando carrinho...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Seu carrinho esta vazio"
          description="Adicione produtos pelo catalogo e volte aqui para revisar o pedido."
        />
        <div className="text-center">
          <Link
            href="/produtos"
            className="bg-primary hover:bg-primary-hover inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold !text-white"
          >
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  const customerValid = isCustomerValid(customer);
  const message = buildCartMessage(items, customer);

  return (
    <div className="space-y-6">
      <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
        <div className="border-border hidden border-b px-4 py-3 text-sm font-semibold md:grid md:grid-cols-[minmax(0,2fr)_100px_120px_120px_48px] md:gap-4">
          <span>Descricao</span>
          <span className="text-center">Qtd.</span>
          <span className="text-right">Valor unit.</span>
          <span className="text-right">Total</span>
          <span className="sr-only">Remover</span>
        </div>

        <ul className="divide-border divide-y">
          {items.map((item) => {
            const maxQuantity = getMaxQuantity(item);
            const lineTotal = getLineTotal(item);

            return (
              <li
                key={item.productId}
                className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,2fr)_100px_120px_120px_48px] md:items-center"
              >
                <div className="flex gap-3">
                  <div className="bg-background relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/produto/${item.slug}`}
                      className="text-foreground hover:text-primary line-clamp-2 font-semibold"
                    >
                      {item.name}
                    </Link>
                    {item.shortDescription ? (
                      <p className="text-muted mt-1 line-clamp-2 text-sm">
                        {item.shortDescription}
                      </p>
                    ) : null}
                    {item.stockStatus !== "available" ? (
                      <p className="text-gold mt-1 text-xs font-medium">
                        {item.stockStatus === "on_request"
                          ? "Sob consulta"
                          : "Indisponivel"}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-center">
                  <span className="text-muted text-sm font-medium md:hidden">Quantidade</span>
                  <div className="border-border inline-flex items-center rounded-full border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-foreground hover:bg-background flex h-9 w-9 items-center justify-center rounded-l-full disabled:opacity-40"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= maxQuantity}
                      className="text-foreground hover:bg-background flex h-9 w-9 items-center justify-center rounded-r-full disabled:opacity-40"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between md:block md:text-right">
                  <span className="text-muted text-sm font-medium md:hidden">Valor unitario</span>
                  <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                </div>

                <div className="flex items-center justify-between md:block md:text-right">
                  <span className="text-muted text-sm font-medium md:hidden">Total</span>
                  <span className="text-primary font-bold">{formatCurrency(lineTotal)}</span>
                </div>

                <div className="flex justify-end md:justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-danger hover:bg-danger/10 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">Dados para entrega</h2>
        <div className="grid gap-4">
          <FormField
            label="Nome completo"
            name="customerName"
            value={customer.name}
            onChange={(event) => updateCustomer("name", event.target.value)}
            placeholder="Seu nome completo"
            required
            autoComplete="name"
          />
          <FormTextarea
            label="Endereco completo"
            name="customerAddress"
            value={customer.address}
            onChange={(event) => updateCustomer("address", event.target.value)}
            placeholder="Rua, numero, bairro, cidade, estado, CEP"
            rows={3}
            required
            autoComplete="street-address"
          />
          <FormField
            label="Telefone / WhatsApp"
            name="customerPhone"
            type="tel"
            value={customer.phone}
            onChange={(event) => updateCustomer("phone", event.target.value)}
            placeholder="DDD + numero"
            required
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-foreground text-lg font-semibold">Total do pedido</span>
          <span className="text-primary text-2xl font-extrabold">{formatCurrency(total)}</span>
        </div>

        <div className="mb-6 space-y-3">
          <ResponsibilityNotice>
            Em breve entraremos em contato para finalizar a compra. Favor se atentar as
            informacoes inseridas — informacoes erradas voce correra o risco de perder a
            mercadoria.
          </ResponsibilityNotice>
          <ResponsibilityNotice>
            Informamos que seus dados nao serao gravados em nosso sistema.
          </ResponsibilityNotice>
        </div>

        {!customerValid ? (
          <p className="text-muted mb-4 text-sm">
            Preencha nome, endereco completo e telefone para finalizar o pedido.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {customerValid ? (
            <WhatsappButtons
              contacts={whatsappContacts.map((contact) => ({
                ...contact,
                label: `Finalizar no ${contact.label}`,
              }))}
              message={message}
              size="lg"
              fullWidth
              layout="column"
            />
          ) : (
            <button
              type="button"
              disabled
              className={cn(
                "inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold",
                "bg-primary/40 !text-white cursor-not-allowed",
              )}
            >
              Preencha seus dados para finalizar
            </button>
          )}
          <button
            type="button"
            onClick={clearCart}
            className="border-border text-muted hover:text-danger inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
