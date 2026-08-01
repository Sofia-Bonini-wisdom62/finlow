"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BookText, CircleUser, Menu } from "lucide-react"
import { ABAS } from "@/lib/abas"

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

/**
 * Quatro abas, como o quadro desenha. Análises e Painel saíram daqui: os dois
 * são profundidade do Perfil, e viraram destino do botão DASH lá dentro.
 *
 * A lista vem de `lib/abas.ts` porque o assistente também precisa dela para
 * dizer "toca em Perfil, depois Análises". Aqui só entra o ícone.
 */
const ICONE: Record<string, typeof MessageCircle> = {
  "/chat": MessageCircle,
  "/trilha": BookText,
  "/perfil": CircleUser,
  "/ajustes": Menu,
}

const itens = ABAS.map((a) => ({ ...a, Icon: ICONE[a.href] ?? Menu }))

export function BottomNav() {
  const pathname = usePathname()
  const ehAtivo = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* celular: barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-fl-divider bg-fl-page/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {itens.map(({ href, label, Icon }) => {
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
