import Link from "next/link";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function SectionHeading({
  title,
  subtitle,
  linkHref,
  linkLabel,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-foreground text-2xl font-bold">{title}</h2>
        {subtitle ? <p className="text-muted mt-1 text-sm">{subtitle}</p> : null}
      </div>
      {linkHref && linkLabel ? (
        <Link href={linkHref} className="text-primary text-sm font-semibold">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
