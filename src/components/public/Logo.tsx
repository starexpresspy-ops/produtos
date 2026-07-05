import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { STORE } from "@/constants/store";

interface LogoProps {
  height?: number;
  className?: string;
  showNameOnFallback?: boolean;
}

/** Logo da loja — fallback instantaneo (sem requisicao a /logo.png inexistente). */
export function Logo({
  height = 40,
  className,
  showNameOnFallback = true,
}: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className="bg-primary flex items-center justify-center rounded-lg"
        style={{ height, width: height }}
      >
        <Star
          className="text-gold h-1/2 w-1/2 fill-current"
          aria-hidden="true"
        />
      </span>
      {showNameOnFallback ? (
        <span className="text-primary text-lg font-extrabold tracking-tight">
          {STORE.name}
        </span>
      ) : null}
    </span>
  );
}
