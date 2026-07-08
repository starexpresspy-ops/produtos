import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  productSlug: z.string().optional(),
  sku: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().positive(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Informe o nome completo."),
  customerPhone: z
    .string()
    .min(10, "Informe um telefone valido.")
    .transform((value) => value.replace(/\D/g, "")),
  customerAddress: z.string().min(10, "Informe o endereco completo."),
  total: z.number().positive(),
  whatsappMessage: z.string().min(1),
  items: z.array(orderItemSchema).min(1, "O pedido precisa ter ao menos um item."),
});
