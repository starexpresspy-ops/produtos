import Link from "next/link";
import { signOutAdmin } from "@/actions/auth";
import { ExternalLink, LogOut } from "lucide-react";
import { adminButtonSecondary } from "@/lib/ui/admin-buttons";
import type { AuthUser } from "@/types/auth";

export function AdminHeader({ user }: { user: AuthUser }) {
  return (
    <header className="border-border bg-surface flex h-16 items-center justify-between border-b px-6">
      <div>
        <p className="text-muted text-sm">Bem-vindo,</p>
        <p className="text-foreground font-semibold">{user.profile.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={adminButtonSecondary}
        >
          <ExternalLink className="h-4 w-4" />
          Ver vitrine
        </Link>
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="text-muted hover:text-foreground inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
