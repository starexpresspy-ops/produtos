"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartAddedNotice } from "@/components/public/CartAddedNotice";
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
  const { addItem, recentlyAddedProductId } = useCart();
  const canAdd = product.stockStatus !== "unavailable";
  const isAdded = recentlyAddedProductId === product.id;

  function handleClick() {
    if (!canAdd) return;
    addItem(productToCartItem(product), 1);
  }

  return (
    <div className={cn(fullWidth && "w-full", "space-y-2")}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canAdd}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm",
          fullWidth && "w-full",
          isAdded
            ? "bg-primary !text-white"
            : "bg-accent hover:bg-accent-hover !text-white shadow-sm",
        )}
      >
        <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          {isAdded
            ? "Adicionado!"
            : canAdd
              ? "Adicionar ao carrinho"
              : "Indisponivel"}
        </span>
      </button>

      {isAdded ? <CartAddedNotice /> : null}
    </div>
  );
}
