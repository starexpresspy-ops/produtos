import { cn } from "@/lib/utils/cn";

export function ResponsibilityNotice({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "border-border bg-background text-muted rounded-lg border px-4 py-3 text-xs leading-relaxed sm:text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}
