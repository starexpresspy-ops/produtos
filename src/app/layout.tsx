import type { Metadata } from "next";
import "./globals.css";
import { STORE } from "@/constants/store";

export const metadata: Metadata = {
  title: {
    default: STORE.name,
    template: `%s | ${STORE.name}`,
  },
  description: STORE.tagline,
  metadataBase: new URL("https://star-express.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
