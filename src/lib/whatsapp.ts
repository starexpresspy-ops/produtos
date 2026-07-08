import { formatCurrency } from "@/lib/formatters/currency";
import type { CartItem } from "@/types/cart";
import type { ProductWithRelations, StoreSettings } from "@/types";
import { getLineTotal, getCartTotal } from "@/lib/cart";
import { SITE_URL } from "@/constants/store";

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

export function buildCartMessage(items: CartItem[]) {
  const lines = [
    "Ola! Quero finalizar meu pedido pela vitrine Star Express:",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    if (item.shortDescription) {
      lines.push(`   Descricao: ${item.shortDescription}`);
    }
    if (item.sku) {
      lines.push(`   Codigo: ${item.sku}`);
    }
    lines.push(`   Quantidade: ${item.quantity}`);
    lines.push(`   Valor unitario: ${formatCurrency(item.unitPrice)}`);
    lines.push(`   Subtotal: ${formatCurrency(getLineTotal(item))}`);
    lines.push(`   Link: ${SITE_URL}/produto/${item.slug}`);
    lines.push("");
  });

  lines.push(`Total do pedido: ${formatCurrency(getCartTotal(items))}`);
  lines.push("", "Pode confirmar disponibilidade e forma de pagamento?");
  return lines.join("\n");
}
