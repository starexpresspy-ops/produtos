import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils/cn";

export function PriceDisplay({
  price,
  promotionalPrice,
  size = "md",
}: {
  price: number;
  promotionalPrice?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const hasPromo = promotionalPrice != null && promotionalPrice < price;
  const current = hasPromo ? promotionalPrice : price;
  const classes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <div>
      {hasPromo ? (
        <p className="text-muted text-sm line-through">{formatCurrency(price)}</p>
      ) : null}
      <p className={cn("text-primary font-extrabold", classes)}>
        {formatCurrency(current)}
      </p>
    </div>
  );
}
