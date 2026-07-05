import Image from "next/image";
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Link
                href="/produtos"
                className="bg-primary hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold !text-white shadow-sm transition-colors sm:min-w-[180px]"
              >
                Ver produtos
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
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

          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-black shadow-[var(--shadow-card-hover)]">
            <Image
              src="/logo-star-express.png"
              alt="Star Express PY"
              fill
              className="object-contain p-6 sm:p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
