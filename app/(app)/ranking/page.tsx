"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, Eye, EyeOff } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

/**
 * Ranking.
 *
 * A tela é construída em volta de uma escolha, não de uma lista: quem não deu
 * opt-in vê o convite e o que exatamente vai aparecer para os outros, e nada
 * mais. Mostrar a lista antes de entrar transformaria em vitrine o que devia
 * ser troca, e ainda daria a impressão errada de que ela já está lá.
 *
 * A promessa é literal e está escrita na tela: sai apelido e pontos, nada de
 * valor, dívida, renda ou categoria de gasto. É a única superfície do app em
 * que alguém vê dado de outra pessoa.
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
 * global — o freio individual do aluno é o apelido (sem apelido, fora da
 * lista). null = sem turma com rank ligado.
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
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        <Link href="/perfil" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fl-ink-2">
          <ArrowLeft className="size-4" /> Perfil
        </Link>

        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-fl-ink">Ranking</h1>
        <p className="mt-1 text-sm leading-relaxed text-fl-ink-2">
          Você tem <strong className="font-bold tabular-nums text-fl-ink">{meusPontos}</strong>{" "}
          {meusPontos === 1 ? "ponto" : "pontos"}. Eles vêm de concluir aulas, registrar gastos e
          terminar a primeira conversa.
        </p>

        {erro && (
          <p className="mt-4 rounded-xl bg-fl-error/10 px-3 py-2 text-[13px] text-fl-error">{erro}</p>
        )}

        {/* ---------- minha sala (Finlow para Escolas) ---------- */}
        {!carregando && escolar && (
          <>
            <h2 className="mt-7 text-[17px] font-bold text-fl-ink">{escolar.turmaNome}</h2>
            <p className="mt-0.5 text-[12.5px] text-fl-ink-2">
              O rank de {NOME_ESCOPO[escolar.escopo]}, ligado pela escola. Aparece o apelido e
              os pontos, nada além disso.
            </p>
            <section className="mt-3 overflow-hidden rounded-[20px] border border-fl-border bg-fl-card">
              <ul className="divide-y divide-fl-divider">
                {escolar.linhas.map((l) => (
                  <li
                    key={`sala-${l.posicao}-${l.apelido}`}
                    className={`flex items-center gap-3 px-4 py-3 ${l.euMesmo ? "bg-fl-50" : ""}`}
                  >
                    <span className="w-7 shrink-0 text-[13px] font-bold tabular-nums text-fl-ink-3">
                      {l.posicao}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[14.5px] ${l.euMesmo ? "font-bold text-fl-ink" : "text-fl-ink"}`}>
                      {l.apelido}{l.euMesmo && <span className="ml-1.5 text-[12px] font-medium text-fl-500">você</span>}
                    </span>
                    <span className="shrink-0 text-[14px] font-bold tabular-nums text-fl-ink">{l.pontos}</span>
                  </li>
                ))}
              </ul>
              {escolar.linhas.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-fl-ink-2">
                  Ninguém apareceu ainda — quem escolher um apelido entra na lista.
                </p>
              )}
            </section>
            <h2 className="mt-8 text-[17px] font-bold text-fl-ink">Ranking geral</h2>
          </>
        )}

        {carregando ? (
          <div className="mt-10 flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
          </div>
        ) : !participando ? (
          /* ---------- fora do ranking ---------- */
          <section className="mt-6 rounded-[20px] border border-fl-border bg-fl-card p-5">
            <div className="grid size-11 place-items-center rounded-xl bg-fl-50">
              <Trophy className="size-5 text-fl-500" />
            </div>
            <p className="mt-4 text-[16px] font-bold text-fl-ink">Quer entrar no ranking?</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fl-ink-2">
              Só entra quem escolhe entrar, e dá pra sair a qualquer hora.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-fl-50/60 p-3.5">
              <EyeOff className="mt-0.5 size-4 shrink-0 text-fl-500" />
              <p className="text-[12.5px] leading-snug text-fl-ink-2">
                Os outros veem <strong className="font-semibold text-fl-ink">só o seu apelido e
                seus pontos</strong>. Nenhum valor, dívida, renda, categoria de gasto ou o seu nome
                real. Nem o seu e-mail.
              </p>
            </div>

            <label htmlFor="apelido" className="mt-5 block text-[12.5px] font-semibold text-fl-ink-2">
              Como você quer aparecer
            </label>
            <input
              id="apelido"
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              maxLength={20}
              placeholder="Um apelido"
              className="mt-1.5 w-full rounded-xl border border-fl-border bg-fl-page px-4 py-3 text-sm text-fl-ink placeholder-fl-ink-3 outline-none focus:border-fl-500"
            />

            <button
              onClick={() => alternar(true)}
              disabled={salvando || rascunho.trim().length < 2}
              className="mt-3 w-full rounded-2xl bg-fl-500 py-3.5 text-[15px] font-semibold text-primary-foreground disabled:opacity-40"
            >
              {salvando ? "Entrando…" : "Entrar no ranking"}
            </button>
          </section>
        ) : (
          /* ---------- dentro ---------- */
          <>
            <section className="mt-6 overflow-hidden rounded-[20px] border border-fl-border bg-fl-card">
              <ul className="divide-y divide-fl-divider">
                {linhas.map((l) => (
                  <li
                    key={`${l.posicao}-${l.apelido}`}
                    className={`flex items-center gap-3 px-4 py-3 ${l.euMesmo ? "bg-fl-50" : ""}`}
                  >
                    <span className="w-7 shrink-0 text-[13px] font-bold tabular-nums text-fl-ink-3">
                      {l.posicao}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[14.5px] ${l.euMesmo ? "font-bold text-fl-ink" : "text-fl-ink"}`}>
                      {l.apelido}{l.euMesmo && <span className="ml-1.5 text-[12px] font-medium text-fl-500">você</span>}
                    </span>
                    <span className="shrink-0 text-[14px] font-bold tabular-nums text-fl-ink">{l.pontos}</span>
                  </li>
                ))}
              </ul>
              {linhas.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-fl-ink-2">
                  Ninguém no ranking ainda. Você é a primeira.
                </p>
              )}
            </section>

            <div className="mt-4 flex items-start gap-2.5 px-1">
              <Eye className="mt-0.5 size-4 shrink-0 text-fl-ink-3" />
              <p className="text-[12px] leading-snug text-fl-ink-3">
                Você aparece como <strong className="font-semibold text-fl-ink-2">{apelido}</strong>.
                Os outros veem esse apelido e os seus pontos, nada além disso.
              </p>
            </div>

            <button
              onClick={() => alternar(false)}
              disabled={salvando}
              className="mt-4 w-full rounded-2xl border border-fl-border py-3.5 text-[14px] font-semibold text-fl-ink-2 disabled:opacity-40"
            >
              {salvando ? "Saindo…" : "Sair do ranking"}
            </button>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
