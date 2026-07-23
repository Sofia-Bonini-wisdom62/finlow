"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Wallet, CircleUser, Settings } from "lucide-react"

const itens = [
  { href: "/trilha", label: "Trilha", Icon: Map },
  { href: "/painel", label: "Painel", Icon: Wallet },
  { href: "/perfil", label: "Perfil", Icon: CircleUser },
  { href: "/ajustes", label: "Ajustes", Icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-finlow-card bg-finlow-bg/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {itens.map(({ href, label, Icon }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                ativo ? "text-finlow-green" : "text-finlow-muted hover:text-finlow-text"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
