import Image from "next/image";
import { ProductVialPlaceholder } from "@/components/shared/ProductVialPlaceholder";
import { cn } from "@/lib/utils/cn";

interface ProductCoverImageProps {
  name: string;
  imageUrl?: string | null;
  sizes: string;
  imageClassName?: string;
  placeholderClassName?: string;
}

export function ProductCoverImage({
  name,
  imageUrl,
  sizes,
  imageClassName = "object-contain p-4",
  placeholderClassName,
}: ProductCoverImageProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        className={imageClassName}
        sizes={sizes}
      />
    );
  }

  return (
    <ProductVialPlaceholder
      name={name}
      className={cn("object-contain", placeholderClassName)}
    />
  );
}
