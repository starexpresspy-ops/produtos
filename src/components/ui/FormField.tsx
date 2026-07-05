import { cn } from "@/lib/utils/cn";

interface BaseProps {
  label: string;
  name: string;
  className?: string;
}

export function FormField({
  label,
  name,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      <span className="text-foreground mb-1.5 block text-sm font-medium">{label}</span>
      <input
        name={name}
        {...props}
        className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function FormTextarea({
  label,
  name,
  className,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("block", className)}>
      <span className="text-foreground mb-1.5 block text-sm font-medium">{label}</span>
      <textarea
        name={name}
        {...props}
        className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function FormSelect({
  label,
  name,
  options,
  className,
  ...props
}: BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
  }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-foreground mb-1.5 block text-sm font-medium">{label}</span>
      <select
        name={name}
        {...props}
        className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormCheckbox({
  label,
  name,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <input type="checkbox" name={name} {...props} className="h-4 w-4 accent-[var(--primary)]" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
