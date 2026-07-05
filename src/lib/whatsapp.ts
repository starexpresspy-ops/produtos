import { formatCurrency } from "@/lib/formatters/currency";
import type { ProductWithRelations, StoreSettings } from "@/types";

export interface WhatsappContact {
  phone: string;
  label: string;
}

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

export function getWhatsappContacts(
  settings: Pick<
    StoreSettings,
    "whatsappNumber" | "whatsappNumberSecondary" | "whatsappSecondaryLabel"
  >,
): WhatsappContact[] {
  const contacts: WhatsappContact[] = [];

  const primary = getWhatsappPhone(settings.whatsappNumber);
  if (primary) {
    contacts.push({ phone: primary, label: "WhatsApp" });
  }

  const secondary = settings.whatsappNumberSecondary?.trim();
  if (secondary) {
    contacts.push({
      phone: sanitizePhone(secondary),
      label: settings.whatsappSecondaryLabel?.trim() || "WhatsApp 2",
    });
  }

  return contacts;
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
