import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(2, "Informe o nome da marca."),
  slug: z.string().min(2, "Informe um slug valido."),
  active: z.boolean().default(true),
});
