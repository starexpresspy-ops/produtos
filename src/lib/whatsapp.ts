import { formatCurrency } from "@/lib/formatters/currency";
import type { ProductWithRelations } from "@/types";

export function sanitizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsappUrl(phone: string, message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${sanitizePhone(phone)}?text=${encoded}`;
}

export function getWhatsappPhone(settingsPhone?: string) {
  const fromSettings = settingsPhone?.trim();
  if (fromSettings) return sanitizePhone(fromSettings);

  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (fromEnv) return sanitizePhone(fromEnv);

  return "";
}

export function buildProductMessage({
  product,
  productUrl,
}: {
  product: ProductWithRelations;
  productUrl?: string;
}) {
  const price = product.promotionalPrice ?? product.price;
  const formattedPrice = formatCurrency(price);

  const lines = [
    "Ola! Tenho interesse neste produto:",
    "",
    `Produto: ${product.name}`,
  ];

  if (product.sku) {
    lines.push(`Codigo: ${product.sku}`);
  }

  lines.push(`Preco anunciado: ${formattedPrice}`);

  if (productUrl) {
    lines.push(`Link: ${productUrl}`);
  }

  lines.push("", "Pode confirmar a disponibilidade?");
  return lines.join("\n");
}
