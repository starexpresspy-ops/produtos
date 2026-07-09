import { revalidatePath, revalidateTag } from "next/cache";

/** Invalida cache da vitrine apos alteracoes no admin. */
export function revalidateStorefront() {
  revalidateTag("catalog", "max");
  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
}
