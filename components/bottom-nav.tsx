"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, ChartColumn, CircleUser, Menu, Wallet } from "lucide-react"

/**
 * Navegação do app. Barra embaixo no celular, coluna à esquerda no desktop.
 *
 * POR QUE DUAS FORMAS E NÃO UMA ESTICADA
 * Barra inferior existe porque o polegar alcança o rodapé e não alcança o topo
 * de um celular. Num monitor de 27" ela vira uma tira solitária a um palmo do
 * conteúdo, e o cursor — que alcança qualquer ponto da tela — não ganha nada
 * com isso. A lateral, além de caber, tem espaço para o rótulo ficar AO LADO do
 * ícone em vez de embaixo, que é mais rápido de varrer com o olho.
 *
 * O componente continua sendo um só e continua sendo chamado no fim de cada
 * página: quem usa não precisa saber que existem duas formas.
 */

const itens = [
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/analises", label: "Análises", Icon: ChartColumn },
  // O Painel só entra na lateral: na barra de baixo, um 5º item deixaria cada
  // alvo com menos de 75px de largura num iPhone SE.
  { href: "/painel", label: "Painel", Icon: Wallet, soDesktop: true },
  { href: "/perfil", label: "Perfil", Icon: CircleUser },
  { href: "/ajustes", label: "Menu", Icon: Menu },
]

export function BottomNav() {
  const pathname = usePathname()
  const ehAtivo = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* celular: barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-fl-divider bg-fl-page/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {itens
            .filter((i) => !i.soDesktop)
            .map(({ href, label, Icon }) => {
              const ativo = ehAtivo(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    ativo ? "text-fl-500" : "text-fl-ink-2 hover:text-fl-ink"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={ativo ? 2.4 : 1.8} />
                  {label}
                </Link>
              )
            })}
        </div>
      </nav>

      {/* desktop: coluna fixa à esquerda */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-fl-divider bg-fl-page px-3 py-6 lg:flex">
        <span className="px-3 pb-6 text-[17px] font-extrabold tracking-tight text-fl-ink">Finlow</span>
        <div className="flex flex-col gap-0.5">
          {itens.map(({ href, label, Icon }) => {
            const ativo = ehAtivo(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                  ativo ? "bg-fl-50 text-fl-500" : "text-fl-ink-2 hover:bg-fl-50/60 hover:text-fl-ink"
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={ativo ? 2.4 : 1.8} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
