import { z } from "zod";

const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Informe o nome completo."),
  customerCpf: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11, "Informe um CPF valido."),
  customerEmail: z.string().email("Informe um e-mail valido."),
  customerStreet: z.string().min(2, "Informe a rua."),
  customerNumber: z.string().min(1, "Informe o numero."),
  customerNeighborhood: z.string().min(2, "Informe o bairro."),
  customerCity: z.string().min(2, "Informe a cidade."),
  customerZip: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 8, "Informe um CEP valido."),
  customerPhone: z
    .string()
    .min(10, "Informe um telefone valido.")
    .transform((value) => value.replace(/\D/g, "")),
  customerAddress: z.string().min(10, "Informe o endereco completo."),
  whatsappMessage: z.string().min(1),
  items: z.array(orderItemInputSchema).min(1, "O pedido precisa ter ao menos um item."),
});

export function mapOrderCreationError(message: string) {
  if (message.includes("ORDER_EMPTY")) {
    return "O pedido precisa ter ao menos um item.";
  }
  if (message.includes("ORDER_INVALID_QTY")) {
    return "Quantidade invalida em um dos produtos.";
  }
  if (message.includes("ORDER_UNAVAILABLE:")) {
    const product = message.split("ORDER_UNAVAILABLE:")[1]?.trim();
    return product
      ? `O produto "${product}" nao esta mais disponivel.`
      : "Um dos produtos nao esta mais disponivel.";
  }
  if (message.includes("ORDER_OUT_OF_STOCK:")) {
    const product = message.split("ORDER_OUT_OF_STOCK:")[1]?.trim();
    return product
      ? `Estoque insuficiente para "${product}". Outro cliente pode ter reservado as ultimas unidades.`
      : "Estoque insuficiente para um dos produtos. Tente novamente.";
  }
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "Nao foi possivel registrar o pedido. Verifique as migrations de pedidos no Supabase.";
  }
  if (message.includes("create_public_order") || message.includes("schema cache")) {
    return "Nao foi possivel registrar o pedido. Execute as migrations de pedidos no Supabase.";
  }
  return message || "Nao foi possivel registrar o pedido.";
}
