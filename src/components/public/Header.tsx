import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/public/Logo";
import { WhatsappButton } from "@/components/shared/WhatsappButton";

export function Header({
  storeName,
  whatsappNumber,
}: {
  storeName: string;
  whatsappNumber: string;
}) {
  return (
    <header className="border-border bg-surface sticky top-0 z-20 border-b">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={storeName} className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href="/produtos" className="hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link href="/sobre" className="hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link href="/contato" className="hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>
          <WhatsappButton
            phone={whatsappNumber}
            message="Ola! Quero atendimento da Star Express."
            label="WhatsApp"
          />
        </div>
      </Container>
    </header>
  );
}
