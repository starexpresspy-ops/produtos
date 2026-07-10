import type { CartCustomerInfo } from "@/types/cart";

export const EMPTY_CART_CUSTOMER: CartCustomerInfo = {
  name: "",
  cpf: "",
  email: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  zip: "",
  phone: "",
};

export function normalizeCartCustomer(
  value: Partial<CartCustomerInfo> | null | undefined,
): CartCustomerInfo {
  return {
    name: value?.name ?? "",
    cpf: value?.cpf ?? "",
    email: value?.email ?? "",
    street: value?.street ?? "",
    number: value?.number ?? "",
    neighborhood: value?.neighborhood ?? "",
    city: value?.city ?? "",
    zip: value?.zip ?? "",
    phone: value?.phone ?? "",
  };
}

export function formatCustomerAddress(customer: CartCustomerInfo) {
  const streetLine = [customer.street.trim(), customer.number.trim()]
    .filter(Boolean)
    .join(", ");

  return [
    streetLine,
    customer.neighborhood.trim() ? `Bairro: ${customer.neighborhood.trim()}` : "",
    customer.city.trim() ? `Cidade: ${customer.city.trim()}` : "",
    customer.zip.trim() ? `CEP: ${customer.zip.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatCustomerDetails(customer: CartCustomerInfo) {
  const lines = [
    `Nome: ${customer.name.trim()}`,
    `CPF: ${customer.cpf.trim()}`,
    `Email: ${customer.email.trim()}`,
    `Rua: ${customer.street.trim()}`,
    `Numero: ${customer.number.trim()}`,
    `Bairro: ${customer.neighborhood.trim()}`,
    `Cidade: ${customer.city.trim()}`,
    `CEP: ${customer.zip.trim()}`,
  ];

  if (customer.phone.trim()) {
    lines.push(`Telefone: ${customer.phone.trim()}`);
  }

  return lines.join("\n");
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isCartCustomerValid(customer: CartCustomerInfo) {
  return (
    customer.name.trim().length >= 2 &&
    digitsOnly(customer.cpf).length === 11 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) &&
    customer.street.trim().length >= 2 &&
    customer.number.trim().length >= 1 &&
    customer.neighborhood.trim().length >= 2 &&
    customer.city.trim().length >= 2 &&
    digitsOnly(customer.zip).length === 8 &&
    digitsOnly(customer.phone).length >= 10
  );
}
