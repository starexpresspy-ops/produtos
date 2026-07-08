"use client";

import { CartProvider } from "@/context/CartContext";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
