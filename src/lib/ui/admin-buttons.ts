import { cn } from "@/lib/utils/cn";

export const adminButtonPrimary = cn(
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors",
  "bg-accent hover:bg-accent-hover !text-white disabled:opacity-60",
);

export const adminButtonPrimaryLg = cn(adminButtonPrimary, "px-8 py-3");

export const adminButtonSecondary = cn(
  "inline-flex items-center justify-center gap-2 rounded-full border-2 px-6 py-2.5 text-sm font-semibold transition-colors",
  "border-primary/25 text-primary hover:bg-primary/5 bg-surface disabled:opacity-60",
);

export const adminButtonCompactPrimary = cn(
  adminButtonPrimary,
  "px-3 py-1.5 text-xs shadow-none",
);

export const adminButtonCompactDanger = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
  "border-danger/30 text-danger hover:bg-danger/10 bg-surface",
);

export const adminNavActive = "bg-primary !text-white";
export const adminNavItem =
  "text-foreground hover:bg-background flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
