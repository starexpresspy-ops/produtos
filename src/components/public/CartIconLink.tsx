"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils/cn";

export function CartIconLink({ className }: { className?: string }) {
  const { itemCount, isReady } = useCart();

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho com ${itemCount} item(ns)`}
      className={cn(
        "border-border bg-surface text-foreground hover:border-primary/30 hover:text-primary relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        className,
      )}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {isReady && itemCount > 0 ? (
        <span className="bg-accent absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
