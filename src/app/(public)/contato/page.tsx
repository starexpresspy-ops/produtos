import { Container } from "@/components/ui/Container";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { getStoreSettings } from "@/services/catalog";

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <Container className="py-10">
      <h1 className="text-foreground text-3xl font-bold">Contato</h1>
      <p className="text-muted mt-2">
        Fale com a equipe da Star Express e receba atendimento rapido.
      </p>

      <div className="border-border bg-surface mt-6 max-w-xl space-y-3 rounded-[var(--radius-card)] border p-6">
        <p>
          <strong>WhatsApp:</strong> {settings.whatsappNumber}
        </p>
        <p>
          <strong>E-mail:</strong> {settings.contactEmail}
        </p>
        <p>
          <strong>Horario:</strong> {settings.businessHours}
        </p>
        <WhatsappButton
          phone={settings.whatsappNumber}
          message="Ola! Quero atendimento da Star Express."
          label="Abrir conversa"
          size="lg"
        />
      </div>
    </Container>
  );
}
