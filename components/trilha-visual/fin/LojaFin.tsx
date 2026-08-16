"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ItemLoja } from "@/lib/loja"
import { PACOTES_DE_MOEDAS } from "@/lib/pacotes-moedas"

/**
 * A grade da Loja do Fin. Estados por item: comprar / sem saldo / poção ativa
 * / adquirido / equipar / equipado. Quem cobra e valida posse é o servidor.
 *
 * No topo, a banca de câmbio (economia por XP, 15/08/2026): moeda nasce SÓ
 * daqui, trocando XP. O aviso de que ranking e nível descem junto fica no
 * card porque é o preço de verdade da compra, e preço se mostra antes.
 */
export function LojaFin({
  itens,
  coins,
  pontos,
  pocaoAtiva,
  avatarFin,
  possuidos,
}: {
  itens: ItemLoja[]
  coins: number
  pontos: number
  pocaoAtiva: boolean
  avatarFin: string | null
  possuidos: string[]
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function chamar(url: string, corpo: object, marcador: string) {
    setOcupado(marcador)
    setErro(null)
    try {
      const r = await fetch(url, {
        method: url.includes("avatar") ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setErro(d.erro ?? "Não deu certo. Tenta de novo?")
      } else {
        router.refresh()
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    }
    setOcupado(null)
  }

  const tem = new Set(possuidos)

  return (
    <div>
      <div
        className="mb-4 rounded-2xl border p-3.5"
        style={{ background: "var(--fin-surface)", borderColor: "color-mix(in srgb, var(--fin-accent) 40%, transparent)" }}
      >
        <div className="text-[13.5px] font-black" style={{ color: "var(--fin-text)" }}>
          Trocar XP por moedas
        </div>
        <p className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
          É a única origem de moeda. A troca desconta do seu XP: posição na liga e nível descem
          junto. Você tem <strong style={{ color: "var(--fin-text)" }}>{pontos} XP</strong>.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {(Object.entries(PACOTES_DE_MOEDAS) as [string, { xp: number; moedas: number }][]).map(
            ([id, p]) => {
              const semXp = pontos < p.xp
              return (
                <button
                  key={id}
                  onClick={semXp ? undefined : () => chamar("/api/jogo/converter", { pacote: id }, id)}
                  disabled={semXp || ocupado === id}
                  className={`rounded-xl px-2 py-2.5 text-[12.5px] font-black disabled:cursor-default ${semXp ? "" : "fin-btn-3d"}`}
                  style={
                    semXp
                      ? { background: "var(--fin-border)", color: "var(--fin-muted)" }
                      : { background: "var(--fin-accent)", color: "var(--fin-bg)" }
                  }
                >
                  {ocupado === id ? "…" : `${p.xp} XP por ${p.moedas} moedas`}
                </button>
              )
            }
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {itens.map((item) => {
          const possui = item.tipo === "avatar" && tem.has(item.id)
          const equipado = avatarFin === item.id
          const semSaldo = coins < item.preco

          let botao: { rotulo: string; acao: (() => void) | null; destaque: boolean }
          if (item.tipo === "consumivel") {
            botao = pocaoAtiva
              ? { rotulo: "Ativa pra próxima lição", acao: null, destaque: false }
              : semSaldo
                ? { rotulo: `${item.preco} coins`, acao: null, destaque: false }
                : {
                    rotulo: `Comprar · ${item.preco}`,
                    acao: () => chamar("/api/jogo/loja", { itemId: item.id }, item.id),
                    destaque: true,
                  }
          } else if (equipado) {
            botao = {
              rotulo: "Equipado ✓",
              acao: () => chamar("/api/jogo/avatar", { itemId: null }, item.id),
              destaque: false,
            }
          } else if (possui) {
            botao = {
              rotulo: "Equipar",
              acao: () => chamar("/api/jogo/avatar", { itemId: item.id }, item.id),
              destaque: true,
            }
          } else if (semSaldo) {
            botao = { rotulo: `${item.preco} coins`, acao: null, destaque: false }
          } else {
            botao = {
              rotulo: `Comprar · ${item.preco}`,
              acao: () => chamar("/api/jogo/loja", { itemId: item.id }, item.id),
              destaque: true,
            }
          }

          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center"
              style={{ background: "var(--fin-surface)", borderColor: "var(--fin-border-2)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt="" className="h-16 object-contain" />
              <div className="text-[13.5px] font-black leading-tight" style={{ color: "var(--fin-text)" }}>
                {item.nome}
              </div>
              <div className="flex-1 text-[11.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
                {item.descricao}
              </div>
              <button
                onClick={botao.acao ?? undefined}
                disabled={!botao.acao || ocupado === item.id}
                className={`w-full rounded-xl px-2 py-2.5 text-[12.5px] font-black disabled:cursor-default ${
                  botao.destaque ? "fin-btn-3d" : ""
                }`}
                style={
                  botao.destaque
                    ? { background: "var(--fin-accent)", color: "var(--fin-bg)" }
                    : { background: "var(--fin-border)", color: "var(--fin-muted)" }
                }
              >
                {ocupado === item.id ? "…" : botao.rotulo}
              </button>
            </div>
          )
        })}
      </div>
      {erro && <p className="mt-3 text-sm" style={{ color: "var(--fin-erro)" }}>{erro}</p>}
    </div>
  )
}
