export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-border bg-surface rounded-[var(--radius-card)] border p-10 text-center">
      <p className="text-foreground text-lg font-semibold">{title}</p>
      {description ? <p className="text-muted mt-2 text-sm">{description}</p> : null}
    </div>
  );
}
