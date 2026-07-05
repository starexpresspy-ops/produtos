"use client";

import { useActionState } from "react";
import { saveStoreSettings } from "@/actions/admin/settings";
import type { ActionResult } from "@/types/actions";
import { FormField, FormTextarea } from "@/components/ui/FormField";

interface StoreSettingsFormProps {
  settings: {
    storeName: string;
    whatsappNumber: string;
    whatsappMessageTemplate: string;
    instagramUrl: string;
    contactEmail: string;
    addressText: string;
    deliveryText: string;
    warrantyText: string;
    exchangePolicy: string;
    businessHours: string;
  };
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => saveStoreSettings(formData),
    {},
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm">
          Configuracoes salvas com sucesso.
        </div>
      ) : null}

      <section className="border-border bg-surface space-y-4 rounded-[var(--radius-card)] border p-6">
        <h2 className="text-foreground text-lg font-semibold">Dados da loja</h2>
        <FormField
          label="Nome da loja"
          name="storeName"
          required
          defaultValue={settings.storeName}
        />
        <FormField
          label="Numero do WhatsApp (somente digitos, com DDI e DDD)"
          name="whatsappNumber"
          required
          placeholder="5545999999999"
          defaultValue={settings.whatsappNumber}
        />
        <FormTextarea
          label="Mensagem padrao do WhatsApp"
          name="whatsappMessageTemplate"
          rows={3}
          defaultValue={settings.whatsappMessageTemplate}
        />
        <FormField
          label="Instagram (URL)"
          name="instagramUrl"
          type="url"
          placeholder="https://instagram.com/star-express"
          defaultValue={settings.instagramUrl}
        />
        <FormField
          label="E-mail de contato"
          name="contactEmail"
          type="email"
          defaultValue={settings.contactEmail}
        />
        <FormTextarea
          label="Endereco ou regiao atendida"
          name="addressText"
          rows={2}
          defaultValue={settings.addressText}
        />
        <FormTextarea
          label="Texto de entrega"
          name="deliveryText"
          rows={2}
          defaultValue={settings.deliveryText}
        />
        <FormTextarea
          label="Texto de garantia"
          name="warrantyText"
          rows={2}
          defaultValue={settings.warrantyText}
        />
        <FormTextarea
          label="Politica de troca"
          name="exchangePolicy"
          rows={3}
          defaultValue={settings.exchangePolicy}
        />
        <FormTextarea
          label="Horario de atendimento"
          name="businessHours"
          rows={2}
          defaultValue={settings.businessHours}
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary hover:bg-primary-hover rounded-full px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar configuracoes"}
      </button>
    </form>
  );
}
