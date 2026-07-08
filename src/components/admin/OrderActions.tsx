"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmOrder, deleteOrder } from "@/actions/admin/orders";
import { adminButtonPrimary, adminButtonSecondary } from "@/lib/ui/admin-buttons";
import type { ActionResult } from "@/types/actions";
import type { OrderStatus } from "@/types/order";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [confirmState, confirmAction, confirmPending] = useActionState<
    ActionResult,
    FormData
  >(async () => confirmOrder(orderId), {});

  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionResult,
    FormData
  >(async () => {
    const result = await deleteOrder(orderId);
    if (result.success) {
      router.push("/admin/pedidos");
    }
    return result;
  }, {});

  useEffect(() => {
    if (confirmState?.success) {
      router.refresh();
    }
  }, [confirmState?.success, router]);

  const error = confirmState?.error || deleteState?.error;

  return (
    <div className="space-y-4">
      {error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {confirmState?.success ? (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm">
          Pedido confirmado com sucesso.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {status === "pending" ? (
          <form action={confirmAction}>
            <button type="submit" disabled={confirmPending} className={adminButtonPrimary}>
              {confirmPending ? "Confirmando..." : "Confirmar pedido"}
            </button>
          </form>
        ) : null}

        {status === "confirmed" ? (
          <form action={deleteAction}>
            <button
              type="submit"
              disabled={deletePending}
              className={adminButtonSecondary}
            >
              {deletePending ? "Apagando..." : "Apagar pedido"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
