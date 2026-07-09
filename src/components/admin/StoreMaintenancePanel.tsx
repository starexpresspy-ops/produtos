"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Power, PowerOff } from "lucide-react";
import { setStoreMaintenance } from "@/actions/admin/settings";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/constants/store";
import type { ActionResult } from "@/types/actions";
import { FormTextarea } from "@/components/ui/FormField";
import { adminButtonPrimary, adminButtonSecondary } from "@/lib/ui/admin-buttons";
import { cn } from "@/lib/utils/cn";

interface StoreMaintenancePanelProps {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export function StoreMaintenancePanel({
  maintenanceMode,
  maintenanceMessage,
}: StoreMaintenancePanelProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => setStoreMaintenance(formData),
    {},
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <section className="border-border bg-surface space-y-4 rounded-[var(--radius-card)] border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Status da vitrine</h2>
          <p className="text-muted mt-1 text-sm">
            Coloque a loja no ar ou exiba uma pagina de manutencao para os clientes.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            maintenanceMode
              ? "bg-danger/10 text-danger"
              : "bg-primary/10 text-primary",
          )}
        >
          {maintenanceMode ? "Loja em manutencao" : "Loja no ar"}
        </span>
      </div>

      {state?.error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm">
          {maintenanceMode
            ? "A loja voltou ao ar."
            : "A loja foi colocada em manutencao."}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="enabled" value={maintenanceMode ? "false" : "true"} />

        <FormTextarea
          label="Mensagem exibida na manutencao"
          name="message"
          rows={2}
          defaultValue={maintenanceMessage || DEFAULT_MAINTENANCE_MESSAGE}
          placeholder={DEFAULT_MAINTENANCE_MESSAGE}
        />

        <button
          type="submit"
          disabled={pending}
          className={cn(
            maintenanceMode ? adminButtonPrimary : adminButtonSecondary,
            "w-full sm:w-auto",
            !maintenanceMode &&
              "border-danger/30 text-danger hover:bg-danger/10",
          )}
        >
          {maintenanceMode ? (
            <>
              <Power className="h-4 w-4 shrink-0" aria-hidden />
              {pending ? "Ativando loja..." : "Voltar loja ao ar"}
            </>
          ) : (
            <>
              <PowerOff className="h-4 w-4 shrink-0" aria-hidden />
              {pending ? "Colocando em manutencao..." : "Tirar loja do ar"}
            </>
          )}
        </button>
      </form>
    </section>
  );
}
