import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { STORE } from "@/constants/store";

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 44, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo-star-express.png"
        alt={STORE.name}
        width={Math.round(height * 3.2)}
        height={height}
        priority
        className="h-auto w-auto object-contain"
        style={{ maxHeight: height, width: "auto" }}
      />
    </span>
  );
}
