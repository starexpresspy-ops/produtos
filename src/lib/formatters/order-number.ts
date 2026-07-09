export function formatOrderNumber(orderNumber?: number | null) {
  if (orderNumber == null || orderNumber <= 0) {
    return "";
  }

  return `#${orderNumber}`;
}
