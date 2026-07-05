import Link from "next/link";
import type { StoreSettings } from "@/types";
import { Container } from "@/components/ui/Container";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-border bg-surface mt-16 border-t py-10">
      <Container className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-foreground text-lg font-bold">{settings.storeName}</p>
          <p className="text-muted mt-2 text-sm">
        Navegue pelos produtos sem cadastro. Para comprar, fale conosco pelo
        WhatsApp.
      </p>
        </div>
        <div>
          <p className="text-foreground font-semibold">Atendimento</p>
          <p className="text-muted mt-2 text-sm">{settings.businessHours}</p>
          {settings.contactEmail ? (
            <p className="text-muted text-sm">{settings.contactEmail}</p>
          ) : null}
        </div>
        <div>
          <p className="text-foreground font-semibold">Links</p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <Link href="/produtos">Catalogo</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/termos-de-uso">Termos de uso</Link>
            <Link href="/politica-de-privacidade">Politica de privacidade</Link>
            <Link href="/trocas-e-garantia">Trocas e garantia</Link>
          </div>
        </div>
      </Container>
      <Container className="mt-8">
        <p className="text-muted max-w-3xl text-xs leading-relaxed">
          Vitrine digital da {settings.storeName}. Vendas e atendimento realizados
          diretamente pela loja via canais oficiais.
        </p>
      </Container>
    </footer>
  );
}
