import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SCRIPT_ANTI_FLASH } from "@/lib/tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finlow — Seu dinheiro, enfim claro",
  description: "Clareza financeira com inteligência artificial: o Finlow lê seus gastos, revela padrões que você não vê e te devolve o controle. Entre na lista de acesso antecipado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Roda antes da primeira pintura: sem isso, quem escolheu escuro leva
            um flash branco em todo carregamento, porque o React só hidrata
            depois de o HTML já estar na tela. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_FLASH }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
