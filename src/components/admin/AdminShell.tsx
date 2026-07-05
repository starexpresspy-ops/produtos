"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SupabaseSetupBanner } from "@/components/admin/SupabaseSetupBanner";
import type { AuthUser } from "@/types/auth";

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar pathname={pathname} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="p-6">
          <SupabaseSetupBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
