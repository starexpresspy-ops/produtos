import { Container } from "@/components/ui/Container";

const ITEMS = [
  "Atendimento rapido pelo WhatsApp",
  "Produtos importados com procedencia",
  "Envio para todo o Brasil",
];

export function Benefits() {
  return (
    <section className="py-12">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item}
              className="border-border bg-surface rounded-[var(--radius-card)] border p-5 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
