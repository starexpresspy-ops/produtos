"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { createOrderFromCart } from "@/actions/public/orders";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import type { CartCustomerInfo, CartItem } from "@/types/cart";
import type { WhatsappContact } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

interface CartCheckoutButtonsProps {
  contacts: WhatsappContact[];
  message: string;
  items: CartItem[];
  customer: CartCustomerInfo;
  onCompleted: () => void;
}

export function CartCheckoutButtons({
  contacts,
  message,
  items,
  customer,
  onCompleted,
}: CartCheckoutButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  async function handleCheckout(contact: WhatsappContact) {
    setError(null);
    setPendingPhone(contact.phone);

    const result = await createOrderFromCart({
      items,
      customer,
      whatsappMessage: message,
    });

    setPendingPhone(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCompleted();
    window.open(buildWhatsappUrl(contact.phone, message), "_blank", "noopener,noreferrer");
  }

  if (contacts.length === 0) {
    return (
      <p className="text-danger text-sm">
        WhatsApp da loja nao configurado. Entre em contato pelo site.
      </p>
    );
  }

  return (
    <div className="w-full space-y-3">
      {error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <button
            key={contact.phone}
            type="button"
            onClick={() => handleCheckout(contact)}
            disabled={pendingPhone !== null}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-colors",
              "bg-primary hover:bg-primary-hover !text-white shadow-sm disabled:opacity-60",
            )}
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
            <span>
              {pendingPhone === contact.phone
                ? "Registrando pedido..."
                : `Finalizar no ${contact.label}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
