"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, Eye, EyeOff } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { POSE } from "@/lib/fin"

/**
 * A Liga (Redesign Fin) — o ranking com a cara do jogo, e a MECÂNICA de
 * sempre: opt-in individual no ranking geral, professor ligando o rank da
 * sala, apelido e pontos e nada mais. A decisão da fundadora (13/08/2026)
 * foi explícita: liga semanal e recorte por eventos ficam de fora; aqui só
 * o visual muda.
 *
 * A tela é construída em volta de uma escolha, não de uma lista: quem não
 * deu opt-in vê o convite e o que exatamente vai aparecer para os outros.
 */

interface Linha {
  apelido: string
  pontos: number
  posicao: number
  euMesmo: boolean
}

/**
 * O rank da sala (Finlow para Escolas). Régua própria: quem liga é o
 * professor da turma, e a lista vem independente do opt-in do ranking
 * global — o freio individual do aluno é o apelido. null = sem turma com
 * rank ligado.
 */
interface RankEscolar {
  turmaNome: string
  escopo: "sala" | "ano" | "escola"
  linhas: Linha[]
}

const NOME_ESCOPO: Record<RankEscolar["escopo"], string> = {
  sala: "sua sala",
  ano: "seu ano",
  escola: "sua escola",
}

/** Medalhas do pódio; do 4º em diante, o número em cinza. */
const MEDALHA = ["#E9A63C", "#B8C4C9", "#C98B5F"]

function LinhaLiga({ l }: { l: Linha }) {
  const medalha = l.posicao <= 3 ? MEDALHA[l.posicao - 1] : null
  return (
    <li
      className="flex items-center gap-3 px-4 py-3"
      style={
        l.euMesmo
          ? {
              background: "color-mix(in srgb, var(--fin-accent) 12%, transparent)",
              borderLeft: "3px solid var(--fin-accent)",
            }
          : undefined
      }
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-black tabular-nums"
        style={
          medalha
            ? { background: medalha, color: "var(--fin-bg)" }
            : { background: "var(--fin-border)", color: "var(--fin-muted)" }
        }
      >
        {l.posicao}
      </span>
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-black"
        style={{ background: "var(--fin-border-2)", color: "var(--fin-text)" }}
        aria-hidden="true"
      >
        {l.apelido.charAt(0).toUpperCase()}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[14.5px] ${l.euMesmo ? "font-black" : "font-bold"}`}
        style={{ color: "var(--fin-text)" }}
      >
        {l.apelido}
        {l.euMesmo && (
          <span className="ml-1.5 text-[12px] font-extrabold" style={{ color: "var(--fin-accent)" }}>
            você
          </span>
        )}
      </span>
      <span className="shrink-0 text-[14px] font-black tabular-nums" style={{ color: "var(--fin-accent)" }}>
        {l.pontos.toLocaleString("pt-BR")}
      </span>
    </li>
  )
}

/** O empurrão do Fin: quanto falta pro topo, quando a pessoa está na lista. */
function CardDiferenca({ linhas }: { linhas: Linha[] }) {
  const eu = linhas.find((l) => l.euMesmo)
  if (!eu || linhas.length === 0) return null
  const lider = linhas[0]
  const diff = lider.pontos - eu.pontos
  if (diff <= 0) return null
  return (
    <div
      className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "var(--fin-surface)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSE.fire} alt="" className="size-10 shrink-0 object-contain" />
      <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
        Faltam <strong style={{ color: "var(--fin-text)" }}>{diff.toLocaleString("pt-BR")} pontos</strong>{" "}
        pro 1º lugar. Uma lição bem feita já encurta o caminho!
      </p>
    </div>
  )
}

export default function RankingPage() {
  const [carregando, setCarregando] = useState(true)
  const [participando, setParticipando] = useState(false)
  const [apelido, setApelido] = useState<string | null>(null)
  const [meusPontos, setMeusPontos] = useState(0)
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [escolar, setEscolar] = useState<RankEscolar | null>(null)

  const [rascunho, setRascunho] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const r = await fetch("/api/ranking")
      const d = await r.json()
      setParticipando(!!d.participando)
      setApelido(d.apelido ?? null)
      setMeusPontos(d.meusPontos ?? 0)
      setLinhas(d.linhas ?? [])
      setEscolar(d.escolar ?? null)
      if (d.apelido) setRascunho(d.apelido)
    } catch {
      setErro("Não consegui carregar agora.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function alternar(participar: boolean) {
    setSalvando(true)
    setErro(null)
    try {
      const r = await fetch("/api/ranking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participar, apelido: rascunho }),
      })
      const d = await r.json()
      if (!r.ok) { setErro(d.erro ?? "Não consegui salvar."); return }
      await carregar()
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className="tema-fin min-h-dvh pb-24 lg:pb-10 lg:pl-56" style={{ background: "var(--fin-bg)" }}>
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold"
          style={{ color: "var(--fin-muted)" }}
        >
          <ArrowLeft className="size-4" /> Perfil
        </Link>

        <h1 className="mt-4 text-[26px] font-black tracking-tight" style={{ color: "var(--fin-text)" }}>
          Liga
        </h1>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fin-muted)" }}>
          Você tem{" "}
          <strong className="font-black tabular-nums" style={{ color: "var(--fin-accent)" }}>
            {meusPontos.toLocaleString("pt-BR")}
          </strong>{" "}
          {meusPontos === 1 ? "ponto" : "pontos"}. Eles vêm de concluir aulas, registrar gastos e
          terminar a primeira conversa.
        </p>

        {erro && (
          <p
            className="mt-4 rounded-xl px-3 py-2 text-[13px]"
            style={{
              background: "color-mix(in srgb, var(--fin-erro) 12%, transparent)",
              color: "var(--fin-erro)",
            }}
          >
            {erro}
          </p>
        )}

        {/* ---------- minha sala (Finlow para Escolas) ---------- */}
        {!carregando && escolar && (
          <>
            <h2 className="mt-7 text-[17px] font-black" style={{ color: "var(--fin-text)" }}>
              {escolar.turmaNome}
            </h2>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--fin-muted)" }}>
              O rank de {NOME_ESCOPO[escolar.escopo]}, ligado pela escola. Aparece o apelido e os
              pontos, nada além disso.
            </p>
            <section
              className="mt-3 overflow-hidden rounded-[20px] border"
              style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}
            >
              <ul className="divide-y" style={{ borderColor: "var(--fin-border)" }}>
                {escolar.linhas.map((l) => (
                  <LinhaLiga key={`sala-${l.posicao}-${l.apelido}`} l={l} />
                ))}
              </ul>
              {escolar.linhas.length === 0 && (
                <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
                  Ninguém apareceu ainda — quem escolher um apelido entra na lista.
                </p>
              )}
            </section>
            <CardDiferenca linhas={escolar.linhas} />
            <h2 className="mt-8 text-[17px] font-black" style={{ color: "var(--fin-text)" }}>
              Ranking geral
            </h2>
          </>
        )}

        {carregando ? (
          <div className="mt-10 flex justify-center">
            <div
              className="size-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--fin-accent) transparent var(--fin-accent) var(--fin-accent)" }}
            />
          </div>
        ) : !participando ? (
          /* ---------- fora do ranking ---------- */
          <section
            className="mt-6 rounded-[20px] border p-5"
            style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}
          >
            <div
              className="grid size-11 place-items-center rounded-xl"
              style={{ background: "color-mix(in srgb, var(--fin-accent) 18%, transparent)" }}
            >
              <Trophy className="size-5" style={{ color: "var(--fin-accent)" }} />
            </div>
            <p className="mt-4 text-[16px] font-black" style={{ color: "var(--fin-text)" }}>
              Quer entrar na liga?
            </p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
              Só entra quem escolhe entrar, e dá pra sair a qualquer hora.
            </p>

            <div
              className="mt-4 flex items-start gap-2.5 rounded-xl p-3.5"
              style={{ background: "var(--fin-bg)" }}
            >
              <EyeOff className="mt-0.5 size-4 shrink-0" style={{ color: "var(--fin-accent)" }} />
              <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
                Os outros veem{" "}
                <strong className="font-extrabold" style={{ color: "var(--fin-text)" }}>
                  só o seu apelido e seus pontos
                </strong>
                . Nenhum valor, dívida, renda, categoria de gasto ou o seu nome real. Nem o seu
                e-mail.
              </p>
            </div>

            <label
              htmlFor="apelido"
              className="mt-5 block text-[12.5px] font-extrabold"
              style={{ color: "var(--fin-muted)" }}
            >
              Como você quer aparecer
            </label>
            <input
              id="apelido"
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              maxLength={20}
              placeholder="Um apelido"
              className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "var(--fin-border-2)",
                background: "var(--fin-bg)",
                color: "var(--fin-text)",
              }}
            />

            <button
              onClick={() => alternar(true)}
              disabled={salvando || rascunho.trim().length < 2}
              className="fin-btn-3d mt-3 w-full rounded-2xl py-3.5 text-[15px] font-extrabold disabled:opacity-40"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              {salvando ? "Entrando…" : "Entrar na liga"}
            </button>
          </section>
        ) : (
          /* ---------- dentro ---------- */
          <>
            <section
              className="mt-6 overflow-hidden rounded-[20px] border"
              style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}
            >
              <ul className="divide-y" style={{ borderColor: "var(--fin-border)" }}>
                {linhas.map((l) => (
                  <LinhaLiga key={`${l.posicao}-${l.apelido}`} l={l} />
                ))}
              </ul>
              {linhas.length === 0 && (
                <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
                  Ninguém na liga ainda. Você é a primeira.
                </p>
              )}
            </section>

            {!escolar && <CardDiferenca linhas={linhas} />}

            <div className="mt-4 flex items-start gap-2.5 px-1">
              <Eye className="mt-0.5 size-4 shrink-0" style={{ color: "var(--fin-dim)" }} />
              <p className="text-[12px] leading-snug" style={{ color: "var(--fin-dim)" }}>
                Você aparece como{" "}
                <strong className="font-extrabold" style={{ color: "var(--fin-muted)" }}>
                  {apelido}
                </strong>
                . Os outros veem esse apelido e os seus pontos, nada além disso.
              </p>
            </div>

            <button
              onClick={() => alternar(false)}
              disabled={salvando}
              className="mt-4 w-full rounded-2xl border py-3.5 text-[14px] font-extrabold disabled:opacity-40"
              style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-muted)" }}
            >
              {salvando ? "Saindo…" : "Sair da liga"}
            </button>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
