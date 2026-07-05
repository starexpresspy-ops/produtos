import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getStoreSettings } from "@/services/catalog";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <>
      <Header
        storeName={settings.storeName}
        whatsappNumber={settings.whatsappNumber}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
