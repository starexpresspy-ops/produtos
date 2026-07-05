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
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label={storeName}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/contato">Contato</Link>
        </nav>
        <WhatsappButton
          phone={whatsappNumber}
          message="Ola! Quero atendimento da Star Express."
          label="WhatsApp"
        />
      </Container>
    </header>
  );
}
