"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { productToCartItem } from "@/lib/cart";
import type { ProductWithRelations } from "@/types";
import { cn } from "@/lib/utils/cn";

export function AddToCartButton({
  product,
  fullWidth = true,
  size = "md",
}: {
  product: ProductWithRelations;
  fullWidth?: boolean;
  size?: "md" | "lg";
}) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const canAdd = product.stockStatus !== "unavailable";

  function handleClick() {
    if (!canAdd) return;

    addItem(productToCartItem(product), 1);
    setFeedback("added");
    window.setTimeout(() => setFeedback("idle"), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canAdd}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm",
        fullWidth && "w-full",
        feedback === "added"
          ? "bg-primary !text-white"
          : "bg-accent hover:bg-accent-hover !text-white shadow-sm",
      )}
    >
      <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        {feedback === "added"
          ? "Adicionado!"
          : canAdd
            ? "Adicionar ao carrinho"
            : "Indisponivel"}
      </span>
    </button>
  );
}
