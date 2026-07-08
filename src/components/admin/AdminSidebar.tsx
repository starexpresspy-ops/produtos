import Link from "next/link";
import Image from "next/image";
import {
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { adminNavActive, adminNavItem } from "@/lib/ui/admin-buttons";
import { STORE } from "@/constants/store";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/marcas", label: "Marcas", icon: Tag },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
];

interface AdminSidebarProps {
  pathname: string;
}

export function AdminSidebar({ pathname }: AdminSidebarProps) {
  return (
    <aside className="border-border bg-surface hidden w-64 shrink-0 border-r md:block">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Image
          src="/logo-star-express.png"
          alt={STORE.name}
          width={120}
          height={36}
          className="h-9 w-auto object-contain"
        />
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(adminNavItem, active && adminNavActive)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
