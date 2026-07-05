import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SupabaseSetupBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="bg-danger/10 text-danger border-danger/20 mb-6 rounded-lg border px-4 py-3 text-sm">
      <p className="font-semibold">Supabase nao configurado</p>
      <p className="mt-1">
        Crie o arquivo <code className="text-xs">.env.local</code> na raiz do
        projeto com <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Copie as
        chaves em Supabase Dashboard → Settings → API → Legacy keys. Reinicie o
        servidor depois de salvar.
      </p>
    </div>
  );
}
