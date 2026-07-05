import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(3, "Informe o nome do produto."),
  slug: z.string().min(3, "Informe um slug valido."),
  sku: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("Preco deve ser maior que zero."),
  promotionalPrice: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  brandId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().optional().nullable(),
  ),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  stockStatus: z.enum(["available", "unavailable", "on_request"]),
  condition: z.enum(["new", "used", "open_box"]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
