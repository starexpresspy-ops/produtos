import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { MaintenanceView } from "@/components/public/MaintenanceView";
import { PublicProviders } from "@/components/public/PublicProviders";
import { getStoreSettings } from "@/services/catalog";
import { getWhatsappContacts } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();
  const whatsappContacts = getWhatsappContacts(settings);

  if (settings.maintenanceMode) {
    return (
      <PublicProviders>
        <main className="flex min-h-screen flex-1 flex-col">
          <MaintenanceView
            storeName={settings.storeName}
            message={settings.maintenanceMessage}
          />
        </main>
      </PublicProviders>
    );
  }

  return (
    <PublicProviders>
      <Header
        storeName={settings.storeName}
        whatsappContacts={whatsappContacts}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </PublicProviders>
  );
}
