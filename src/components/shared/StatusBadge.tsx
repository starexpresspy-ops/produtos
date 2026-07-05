import type { StockStatus } from "@/types";

export function StatusBadge({ status }: { status: StockStatus }) {
  const styles: Record<StockStatus, string> = {
    available: "bg-emerald-100 text-emerald-700",
    unavailable: "bg-red-100 text-red-700",
    on_request: "bg-amber-100 text-amber-700",
  };
  const labels: Record<StockStatus, string> = {
    available: "Disponivel",
    unavailable: "Indisponivel",
    on_request: "Sob consulta",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="bg-gold/15 text-gold inline-flex rounded-full px-2.5 py-1 text-xs font-semibold">
      Destaque
    </span>
  );
}
