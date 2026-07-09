import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function CartAddedNotice({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "bg-primary/10 text-foreground rounded-lg px-4 py-3 text-xs leading-relaxed sm:text-sm",
        className,
      )}
    >
      <p>
        <strong className="text-primary">Produto adicionado no carrinho.</strong> Ao finalizar a
        escolha, clique no{" "}
        <Link href="/carrinho" className="text-primary font-semibold hover:underline">
          carrinho
        </Link>{" "}
        para escolher a quantidade e finalizar o pedido.
      </p>
    </div>
  );
}
