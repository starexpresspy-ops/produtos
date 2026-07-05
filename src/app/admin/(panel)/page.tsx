import { getAdminDashboardStats } from "@/services/admin/dashboard";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const cards = [
    { label: "Produtos", value: stats.products },
    { label: "Categorias", value: stats.categories },
    { label: "Marcas", value: stats.brands },
    { label: "Em destaque", value: stats.highlights },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1 text-sm">
          Visao geral da operacao da Star Express.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border-border bg-surface rounded-[var(--radius-card)] border p-4"
          >
            <p className="text-muted text-sm">{card.label}</p>
            <p className="text-foreground mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
