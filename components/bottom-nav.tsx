"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, ChartColumn, CircleUser, Menu } from "lucide-react"

const itens = [
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/analises", label: "Análises", Icon: ChartColumn },
  { href: "/perfil", label: "Perfil", Icon: CircleUser },
  { href: "/ajustes", label: "Menu", Icon: Menu },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-fl-divider bg-fl-page/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {itens.map(({ href, label, Icon }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`)
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
  )
}
