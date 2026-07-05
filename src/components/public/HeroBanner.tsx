import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { DEFAULT_WHATSAPP_MESSAGE, STORE } from "@/constants/store";

interface HeroBannerProps {
  whatsappNumber: string;
}

export function HeroBanner({ whatsappNumber }: HeroBannerProps) {
  return (
    <section className="from-primary/5 to-background bg-gradient-to-b">
      <Container className="py-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="bg-gold/15 text-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Produtos importados originais
            </span>
            <h1 className="text-foreground mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Os melhores importados com atendimento no WhatsApp
            </h1>
            <p className="text-gold mt-3 text-lg font-medium italic">
              {STORE.tagline}
            </p>
            <p className="text-muted mt-4 max-w-md text-base sm:text-lg">
              Eletrônicos, perfumes e acessórios com preço justo. Escolha o
              produto e finalize a compra direto com a gente, sem complicação.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/produtos"
                className="bg-primary hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white transition-colors"
              >
                Ver produtos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <WhatsappButton
                phone={whatsappNumber}
                message={DEFAULT_WHATSAPP_MESSAGE}
                label="Falar no WhatsApp"
                size="lg"
                variant="outline"
              />
            </div>
          </div>

          <div className="from-primary via-primary/80 to-gold/40 relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br shadow-[var(--shadow-card-hover)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <p className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                Star Express
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
