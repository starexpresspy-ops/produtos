import { Container } from "@/components/ui/Container";

export default function AboutPage() {
  return (
    <Container className="py-10">
      <h1 className="text-foreground text-3xl font-bold">Sobre a Star Express</h1>
      <p className="text-muted mt-4 max-w-3xl leading-relaxed">
        A Star Express trabalha com importados selecionados, foco em atendimento
        humano e suporte rapido no WhatsApp. Nossa proposta e oferecer produtos
        originais, com informacao clara e experiencia simples de compra.
      </p>
    </Container>
  );
}
