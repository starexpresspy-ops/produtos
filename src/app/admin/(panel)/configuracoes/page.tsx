import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { StoreMaintenancePanel } from "@/components/admin/StoreMaintenancePanel";
import { VisitIpMapPanel } from "@/components/admin/VisitIpMapPanel";
import { getDefaultStoreSettingsForForm } from "@/actions/admin/settings";
import { getAdminMaintenanceState, getAdminStoreSettings } from "@/services/admin/settings";
import { getStorefrontVisitLogs } from "@/services/admin/visit-logs";
import { SupabaseSetupBanner } from "@/components/admin/SupabaseSetupBanner";

export default async function AdminSettingsPage() {
  const row = await getAdminStoreSettings();
  const maintenance = await getAdminMaintenanceState();
  const visitLogs = await getStorefrontVisitLogs();
  const defaults = await getDefaultStoreSettingsForForm();

  const settings = row
    ? {
        storeName: row.store_name,
        whatsappNumber: row.whatsapp_number,
        whatsappNumberSecondary: row.whatsapp_number_secondary ?? "",
        whatsappSecondaryLabel: row.whatsapp_secondary_label ?? "",
        whatsappMessageTemplate: row.whatsapp_message_template ?? "",
        instagramUrl: row.instagram_url ?? "",
        contactEmail: row.contact_email ?? "",
        addressText: row.address_text ?? "",
        deliveryText: row.delivery_text ?? "",
        warrantyText: row.warranty_text ?? "",
        exchangePolicy: row.exchange_policy ?? "",
        businessHours: row.business_hours ?? "",
      }
    : defaults;

  return (
    <div className="space-y-6">
      <SupabaseSetupBanner />
      <div>
        <h1 className="text-foreground text-2xl font-bold">Configuracoes</h1>
        <p className="text-muted mt-1 text-sm">
          Dados exibidos na vitrine e nos canais de atendimento da loja.
        </p>
      </div>

      <StoreMaintenancePanel
        maintenanceMode={maintenance.maintenanceMode}
        maintenanceMessage={maintenance.maintenanceMessage}
      />

      <StoreSettingsForm settings={settings} />

      <VisitIpMapPanel logs={visitLogs.logs} tableMissing={visitLogs.tableMissing} />
    </div>
  );
}
