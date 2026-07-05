import Link from "next/link";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="border-border bg-surface hover:-translate-y-0.5 block rounded-[var(--radius-card)] border p-4 transition-transform"
    >
      <p className="text-foreground font-semibold">{category.name}</p>
      {category.description ? (
        <p className="text-muted mt-1 line-clamp-2 text-sm">{category.description}</p>
      ) : null}
    </Link>
  );
}
