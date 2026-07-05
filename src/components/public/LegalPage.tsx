import { Container } from "@/components/ui/Container";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-10">
      <h1 className="text-foreground text-3xl font-bold">{title}</h1>
      <div className="text-foreground/90 mt-6 max-w-3xl space-y-4 text-sm leading-relaxed sm:text-base">
        {children}
      </div>
    </Container>
  );
}
