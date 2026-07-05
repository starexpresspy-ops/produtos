import Link from "next/link";
import {
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
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
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-white">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-foreground text-sm font-bold">Painel Lojista</p>
          <p className="text-muted text-xs">Star Express</p>
        </div>
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
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-background",
                  )}
                >
                  <item.icon className="h-4 w-4" />
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
