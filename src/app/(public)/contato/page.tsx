import { Container } from "@/components/ui/Container";
import { WhatsappButtons } from "@/components/shared/WhatsappButtons";
import { getStoreSettings } from "@/services/catalog";
import { getWhatsappContacts } from "@/lib/whatsapp";

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappContacts = getWhatsappContacts(settings);

  return (
    <Container className="py-10">
      <h1 className="text-foreground text-3xl font-bold">Contato</h1>
      <p className="text-muted mt-2">
        Fale com a equipe da Star Express e receba atendimento rapido.
      </p>

      <div className="border-border bg-surface mt-6 max-w-xl space-y-4 rounded-[var(--radius-card)] border p-6">
        {whatsappContacts.map((contact) => (
          <p key={contact.phone}>
            <strong>{contact.label}:</strong> {contact.phone}
          </p>
        ))}
        <p>
          <strong>E-mail:</strong> {settings.contactEmail}
        </p>
        <p>
          <strong>Horario:</strong> {settings.businessHours}
        </p>
        <WhatsappButtons
          contacts={whatsappContacts}
          message="Ola! Quero atendimento da Star Express."
          size="lg"
          layout="column"
          fullWidth
        />
      </div>
    </Container>
  );
}
