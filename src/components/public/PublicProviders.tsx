"use client";

import { CartProvider } from "@/context/CartContext";
import { VisitTracker } from "@/components/public/VisitTracker";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <VisitTracker />
      {children}
    </CartProvider>
  );
}
