"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { createOrderFromCart } from "@/actions/public/orders";
import type { CartCustomerInfo, CartItem } from "@/types/cart";
import { cn } from "@/lib/utils/cn";

interface CartCheckoutButtonsProps {
  items: CartItem[];
  customer: CartCustomerInfo;
  whatsappMessage: string;
  onCompleted: () => void;
}

export function CartCheckoutButtons({
  items,
  customer,
  whatsappMessage,
  onCompleted,
}: CartCheckoutButtonsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCheckout() {
    setError(null);
    setPending(true);

    const result = await createOrderFromCart({
      items,
      customer,
      whatsappMessage,
    });

    setPending(false);

    if (result.error || !result.orderId) {
      setError(result.error ?? "Nao foi possivel registrar o pedido.");
      return;
    }

    onCompleted();
    router.push(`/pedido-realizado/${result.orderId}`);
  }

  return (
    <div className="w-full space-y-3">
      {error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={pending}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-colors",
          "bg-accent hover:bg-accent-hover !text-white shadow-sm disabled:opacity-60",
        )}
      >
        <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
        <span>{pending ? "Registrando pedido..." : "Finalizar pedido"}</span>
      </button>
    </div>
  );
}
