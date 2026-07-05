import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
