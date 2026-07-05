import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value?.trim() || null);

const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value?.trim() || null)
  .refine(
    (value) => !value || value.startsWith("http://") || value.startsWith("https://"),
    "Informe uma URL valida (http ou https).",
  );

const optionalEmail = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value?.trim() || null)
  .refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Informe um e-mail valido.",
  );

export const storeSettingsFormSchema = z.object({
  storeName: z.string().min(2, "Informe o nome da loja."),
  whatsappNumber: z
    .string()
    .min(10, "Informe o numero do WhatsApp com DDD e DDI.")
    .max(20, "Numero do WhatsApp muito longo."),
  whatsappNumberSecondary: z
    .string()
    .optional()
    .nullable()
    .transform((value) => value?.replace(/\D/g, "").trim() || null)
    .refine(
      (value) => !value || value.length >= 10,
      "Informe o segundo WhatsApp com DDD e DDI.",
    ),
  whatsappSecondaryLabel: optionalText,
  whatsappMessageTemplate: optionalText,
  instagramUrl: optionalUrl,
  contactEmail: optionalEmail,
  addressText: optionalText,
  deliveryText: optionalText,
  warrantyText: optionalText,
  exchangePolicy: optionalText,
  businessHours: optionalText,
});
