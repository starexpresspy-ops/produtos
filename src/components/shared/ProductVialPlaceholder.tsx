import Image from "next/image";
import { wrapProductLabelLines } from "@/lib/products/label-lines";
import { VIAL_LABEL_LAYOUT } from "@/lib/products/vial-label-layout";
import { cn } from "@/lib/utils/cn";

interface ProductVialPlaceholderProps {
  name: string;
  className?: string;
}

export function ProductVialPlaceholder({
  name,
  className,
}: ProductVialPlaceholderProps) {
  const lines = wrapProductLabelLines(name, 14, 3);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-[#060e1c]", className)}
      role="img"
      aria-label={name}
    >
      <Image
        src="/vial-template.png"
        alt=""
        fill
        className="object-contain"
        sizes="280px"
        priority={false}
      />
      <div
        className="absolute flex items-center justify-center px-1 text-center"
        style={{
          left: `${VIAL_LABEL_LAYOUT.left * 100}%`,
          top: `${VIAL_LABEL_LAYOUT.top * 100}%`,
          width: `${VIAL_LABEL_LAYOUT.width * 100}%`,
          height: `${VIAL_LABEL_LAYOUT.height * 100}%`,
        }}
      >
        <div className="text-[#142a4a] leading-tight font-bold">
          {lines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={cn(
                "text-[8px] sm:text-[9px] md:text-[10px]",
                index > 0 && "mt-0.5",
              )}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
