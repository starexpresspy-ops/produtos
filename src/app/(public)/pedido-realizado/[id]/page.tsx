import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderConfirmationView } from "@/components/public/OrderConfirmationView";
import { getStoreSettings } from "@/services/catalog";
import { getPublicOrderById } from "@/services/public/orders";
import { getWhatsappContacts } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pedido registrado",
  description: "Revise seu pedido e envie pelo WhatsApp para finalizar.",
};

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getPublicOrderById(id),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  const whatsappContacts = getWhatsappContacts(settings);

  return (
    <OrderConfirmationView order={order} whatsappContacts={whatsappContacts} />
  );
}
