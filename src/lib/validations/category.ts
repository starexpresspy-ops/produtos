import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria."),
  slug: z.string().min(2, "Informe um slug valido."),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
