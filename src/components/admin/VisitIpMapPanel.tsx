function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatVisitTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "short",
  }).format(new Date(value));
}

export function VisitIpMapPanel({
  logs,
  tableMissing,
}: {
  logs: Array<{
    id: string;
    ipAddress: string;
    path: string | null;
    createdAt: string;
  }>;
  tableMissing: boolean;
}) {
  return (
    <section className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
      <div className="border-border border-b px-6 py-4">
        <h2 className="text-foreground text-lg font-semibold">Mapeamento de IPs</h2>
        <p className="text-muted mt-1 text-sm">
          Visitantes da vitrine publica (clientes). Atualiza conforme a navegacao no site.
        </p>
      </div>

      {tableMissing ? (
        <div className="text-muted px-6 py-8 text-sm">
          Execute a migration{" "}
          <code className="text-foreground">20260714_storefront_visit_logs.sql</code> no
          Supabase para ativar o mapeamento.
        </div>
      ) : logs.length === 0 ? (
        <div className="text-muted px-6 py-8 text-sm">
          Nenhum acesso registrado ainda. Os IPs aparecerao aqui quando clientes navegarem na
          loja.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-border bg-background border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">IP</th>
                <th className="px-4 py-3 font-semibold">Dia</th>
                <th className="px-4 py-3 font-semibold">Hora</th>
                <th className="px-4 py-3 font-semibold">Pagina</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-background/50">
                  <td className="text-foreground px-4 py-3 font-medium">{log.ipAddress}</td>
                  <td className="text-muted px-4 py-3">{formatVisitDate(log.createdAt)}</td>
                  <td className="text-muted px-4 py-3">{formatVisitTime(log.createdAt)}</td>
                  <td className="text-muted px-4 py-3">{log.path ?? "/"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
