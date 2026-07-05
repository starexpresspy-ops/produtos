import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { SupabaseSetupBanner } from "@/components/admin/SupabaseSetupBanner";
import { ResponsibilityNotice } from "@/components/shared/ResponsibilityNotice";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <section className="border-border bg-surface w-full rounded-[var(--radius-card)] border p-6">
        <SupabaseSetupBanner />
        <h1 className="text-foreground text-2xl font-bold">Acesso ao painel</h1>
        <p className="text-muted mt-1 text-sm">
          Entre para gerenciar catalogo, marcas e categorias.
        </p>

        <ResponsibilityNotice className="mt-4">
          Acesso restrito ao responsavel pela loja. Todas as informacoes
          cadastradas no catalogo sao de responsabilidade exclusiva do usuario
          autenticado.
        </ResponsibilityNotice>

        <AdminLoginForm />
      </section>
    </main>
  );
}
