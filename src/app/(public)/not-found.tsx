import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function PublicNotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="text-foreground text-3xl font-bold">Pagina nao encontrada</h1>
      <p className="text-muted mt-2">O conteudo solicitado nao esta disponivel.</p>
      <Link href="/" className="bg-primary mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white">
        Voltar para inicio
      </Link>
    </Container>
  );
}
