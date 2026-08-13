import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { SCRIPT_ANTI_FLASH } from "@/lib/tema";

/**
 * A fonte nunca tinha sido escolhida: Geist é a que vem no scaffold do Next.
 *
 * Plus Jakarta Sans entra por três motivos concretos, não por gosto:
 *  - `latin-ext` traz ã, õ, ç, ê desenhados, não emprestados de fallback — num
 *    app em português isso aparece em quase toda frase;
 *  - segura bem os títulos em extrabold com tracking apertado, que é como as
 *    telas daqui são compostas;
 *  - continua legível nos 12–13px que a interface usa bastante.
 *
 * Números: as telas de dinheiro usam `tabular-nums` em 15 arquivos. Se a fonte
 * não trouxer figuras tabulares, a coluna de valores dança a cada dígito.
 * Conferido no navegador medindo a largura de "1" contra "8".
 */
const fonteUI = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * A fonte do universo Fin (trilha, player, perfil do jogador, loja, liga).
 *
 * Entra como VARIÁVEL adicional, não como troca: o `.tema-fin` de globals.css
 * é quem a aplica, e só dentro do escopo do jogo — o resto do app continua na
 * Plus Jakarta. Nunito é variable font (600–900 disponíveis sem lista de
 * pesos) e tem `latin-ext` pelos mesmos ã/õ/ç/ê de sempre.
 */
const fonteFin = Nunito({
  variable: "--font-fin",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finlow: Seu dinheiro, enfim claro",
  description: "Clareza financeira com inteligência artificial: o Finlow lê seus gastos, revela padrões que você não vê e te devolve o controle. Crie sua conta grátis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteUI.variable} ${geistMono.variable} ${fonteFin.variable} h-full antialiased`}
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
