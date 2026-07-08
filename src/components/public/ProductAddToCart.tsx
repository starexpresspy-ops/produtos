"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { clampQuantity, getMaxQuantity, productToCartItem } from "@/lib/cart";
import type { ProductWithRelations } from "@/types";
import { cn } from "@/lib/utils/cn";

export function ProductAddToCart({ product }: { product: ProductWithRelations }) {
  const { addItem } = useCart();
  const cartItem = productToCartItem(product);
  const maxQuantity = getMaxQuantity(cartItem);
  const canAdd = maxQuantity > 0;
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");

  function changeQuantity(delta: number) {
    setQuantity((current) => clampQuantity(cartItem, current + delta));
  }

  function handleAdd() {
    if (!canAdd) return;

    addItem(cartItem, quantity);
    setFeedback("added");
    window.setTimeout(() => setFeedback("idle"), 1800);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-foreground text-sm font-medium">Quantidade</span>
        <div className="border-border inline-flex items-center rounded-full border">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={!canAdd || quantity <= 1}
            className="text-foreground hover:bg-background flex h-10 w-10 items-center justify-center rounded-l-full disabled:opacity-40"
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={!canAdd || quantity >= maxQuantity}
            className="text-foreground hover:bg-background flex h-10 w-10 items-center justify-center rounded-r-full disabled:opacity-40"
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          feedback === "added"
            ? "bg-primary !text-white"
            : "bg-accent hover:bg-accent-hover !text-white shadow-sm",
        )}
      >
        <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden />
        <span>
          {feedback === "added"
            ? "Adicionado ao carrinho!"
            : canAdd
              ? "Adicionar ao carrinho"
              : "Produto indisponivel"}
        </span>
      </button>

      <Link
        href="/carrinho"
        className="text-primary block text-center text-sm font-semibold hover:underline"
      >
        Ver carrinho
      </Link>
    </div>
  );
}
