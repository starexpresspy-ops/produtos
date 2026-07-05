"use client";

import { useActionState } from "react";
import { saveStoreSettings } from "@/actions/admin/settings";
import type { ActionResult } from "@/types/actions";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import { adminButtonPrimaryLg } from "@/lib/ui/admin-buttons";

interface StoreSettingsFormProps {
  settings: {
    storeName: string;
    whatsappNumber: string;
    whatsappNumberSecondary: string;
    whatsappSecondaryLabel: string;
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
          label="WhatsApp principal (DDI + DDD + numero)"
          name="whatsappNumber"
          required
          placeholder="5545999999999"
          defaultValue={settings.whatsappNumber}
        />
        <FormField
          label="Segundo WhatsApp (opcional)"
          name="whatsappNumberSecondary"
          placeholder="5545999999998"
          defaultValue={settings.whatsappNumberSecondary}
        />
        <FormField
          label="Nome do segundo WhatsApp (ex.: Vendas, Suporte)"
          name="whatsappSecondaryLabel"
          placeholder="WhatsApp 2"
          defaultValue={settings.whatsappSecondaryLabel}
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
        className={adminButtonPrimaryLg}
      >
        {pending ? "Salvando..." : "Salvar configuracoes"}
      </button>
    </form>
  );
}
