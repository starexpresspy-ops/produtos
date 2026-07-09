import { Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/constants/store";

export function MaintenanceView({
  storeName,
  message,
}: {
  storeName: string;
  message?: string;
}) {
  const displayMessage = message?.trim() || DEFAULT_MAINTENANCE_MESSAGE;

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="border-border bg-surface mx-auto w-full max-w-lg rounded-[var(--radius-card)] border p-10 text-center shadow-sm">
        <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Construction className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-muted text-sm font-medium tracking-wide uppercase">
          {storeName}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight">
          {displayMessage}
        </h1>
        <p className="text-muted mt-4 text-sm leading-relaxed">
          Nossa loja esta temporariamente indisponivel. Por favor, tente novamente em breve.
        </p>
      </div>
    </Container>
  );
}
