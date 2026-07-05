import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">Pagina nao encontrada</h1>
      <p className="text-muted mt-2">
        Verifique o endereco ou volte para a pagina inicial.
      </p>
      <Link href="/" className="bg-primary mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white">
        Ir para inicio
      </Link>
    </main>
  );
}
