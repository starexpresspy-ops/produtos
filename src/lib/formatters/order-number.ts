export function formatOrderNumber(orderNumber?: number | null) {
  if (orderNumber == null || orderNumber <= 0) {
    return "";
  }

  return `#${orderNumber}`;
}

type OrderLabelInput = {
  id: string;
  orderNumber?: number | null;
  whatsappMessage?: string | null;
};

export function parseOrderNumberFromMessage(message?: string | null): number | null {
  if (!message) return null;

  const sequential = message.match(/^Pedido #(\d+)/);
  if (sequential?.[1]) {
    return Number(sequential[1]);
  }

  return null;
}

export function formatOrderLabel(order: OrderLabelInput) {
  const formatted = formatOrderNumber(order.orderNumber);
  if (formatted) return formatted;

  const fromMessage = parseOrderNumberFromMessage(order.whatsappMessage);
  if (fromMessage != null && fromMessage > 0) {
    return `#${fromMessage}`;
  }

  const reference = order.whatsappMessage?.match(/^Pedido ([A-F0-9]{8})/i)?.[1];
  if (reference) {
    return `#${reference}`;
  }

  return `#${order.id.slice(0, 8).toUpperCase()}`;
}

export function isMissingOrderNumberColumnError(message?: string) {
  return Boolean(message?.includes("order_number"));
}

export const ORDER_LIST_SELECT_WITH_NUMBER =
  "id, order_number, customer_name, customer_phone, customer_address, status, total, whatsapp_message, created_at, confirmed_at";

export const ORDER_LIST_SELECT_BASE =
  "id, customer_name, customer_phone, customer_address, status, total, whatsapp_message, created_at, confirmed_at";
