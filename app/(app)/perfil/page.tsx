"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, BookText, ChartColumn, Flame, Gem, Star, Target, Trophy, Wallet, Zap } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { GraficoRosca } from "@/components/analises/GraficoRosca"
import { MissoesFin } from "@/components/trilha-visual/fin/MissoesFin"
import type { MetricasPerfil, FatiaCategoria } from "@/lib/financas"
import type { EstadoMissao } from "@/lib/missoes"
import type { Conquista } from "@/lib/conquistas"
import { nivelDoTotal } from "@/lib/nivel"
import { AVATAR_POSE, POSE } from "@/lib/fin"
import { brl } from "@/lib/formato"
import { TrocarImagem } from "@/components/perfil/TrocarImagem"

/** O mesmo card do antigo perfil do jogador, agora morando na tela única. */
const ICONE_CONQUISTA = {
  star: Star,
  flame: Flame,
  bolt: Zap,
  gem: Gem,
  target: Target,
  book: BookOpen,
} as const

function CardConquista({ c }: { c: Conquista }) {
  const Icone = ICONE_CONQUISTA[c.icone]
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl bg-fl-card px-2 py-3.5 text-center"
      style={{ opacity: c.conquistada ? 1 : 0.45 }}
    >
      <span
        className="grid size-10 place-items-center rounded-full"
        style={{
          background: c.conquistada
            ? "color-mix(in srgb, var(--fin-accent, #E9A63C) 22%, transparent)"
            : "var(--fin-border, #1C333B)",
        }}
      >
        <Icone className={`size-5 ${c.conquistada ? "text-fl-500" : "text-fl-ink-3"}`} />
      </span>
      <span className={`text-[11px] font-extrabold leading-tight ${c.conquistada ? "text-fl-ink" : "text-fl-ink-3"}`}>
        {c.titulo}
      </span>
    </div>
  )
}

/**
 * Perfil: retrato de um minuto.
 *
 * A ordem é para onde foi o dinheiro, o que isso quer dizer, e para onde ir.
 * Rosca, leituras, portas. Nada de número solto no meio.
 *
 * OS KPIs SAÍRAM DAQUI
 * Taxa de economia, controle orçamentário, reserva e consistência foram para
 * Análises. São quatro percentuais que exigem interpretação, e num retrato eles
 * competiam com a rosca e com as leituras pela mesma atenção — as leituras
 * dizem em português a mesma coisa que os percentuais dizem em número, e em
 * português ganha. Quem quer o número atrás da frase toca em Análises.
 */

interface Perfil {
  nome: string
  email: string | null
  image: string | null
  nivel: string
  resumo: string
  metricas: MetricasPerfil
  categorias: FatiaCategoria[]
  mesRosca: string
  pontos: number
  noRanking: boolean
  insights: { texto: string; tipo: string }[]
  sequencia?: number
  precisaoSemana?: number | null
  temFoto?: boolean
  temBanner?: boolean
  recorde?: number
  avatarFin?: string | null
  missoes?: EstadoMissao[]
  conquistas?: Conquista[]
  objetivos?: {
    quantos: number
    totalGuardado: number
    destaque: { nome: string; guardado: number; meta: number } | null
  } | null
}

/** As quatro portas. Mesma forma para as quatro: nenhuma é mais importante,
 *  e tamanhos diferentes fariam a pessoa achar que uma é a principal. */
function Porta({
  href, Icon, titulo, nota,
}: {
  href: string
  Icon: typeof BookText
  titulo: string
  nota: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1.5 rounded-[20px] border border-fl-border bg-fl-card p-4 transition-colors hover:border-fl-500/40 hover:bg-fl-50/50"
    >
      <Icon className="size-5 text-fl-500" />
      <span className="text-[14.5px] font-bold text-fl-ink">{titulo}</span>
      <span className="text-[12px] leading-snug text-fl-ink-2">{nota}</span>
    </Link>
  )
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [logado, setLogado] = useState(true)
  const [erro, setErro] = useState(false)
  // Personalização: flags locais (nascem da API) + versão pra furar o cache
  // do navegador logo depois de uma troca.
  const [temFoto, setTemFoto] = useState(false)
  const [temBanner, setTemBanner] = useState(false)
  const [versaoImg, setVersaoImg] = useState(0)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(false)
    Promise.resolve(
      fetch("/api/perfil-financeiro").then(async (r) => {
        if (r.status === 401) return { deslogado: true as const }
        // Um 500 devolve {error: "..."} — objeto truthy. Aceitar isso como
        // perfil válido fazia `perfil.metricas` virar undefined e o render
        // estourar em `m.mesesComDados`, derrubando a árvore React: a tela
        // ficava congelada em vez de mostrar que algo falhou.
        if (!r.ok) return { falhou: true as const }
        const j = await r.json()
        return j && j.metricas ? { perfil: j as Perfil } : { falhou: true as const }
      })
    )
      .then((p) => {
        if ("deslogado" in p) { setLogado(false); return }
        if ("falhou" in p) { setErro(true); return }
        setPerfil(p.perfil)
        setTemFoto(!!p.perfil.temFoto)
        setTemBanner(!!p.perfil.temBanner)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-fl-page">
        <div className="size-6 animate-spin rounded-full border-2 border-fl-500 border-t-transparent" />
      </main>
    )
  }

  if (erro) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <div>
          <p className="text-[15px] font-bold text-fl-ink">Não deu pra carregar seu perfil</p>
          <p className="mt-1.5 text-sm text-fl-ink-2">
            Alguma coisa falhou ao buscar seus números. Nada foi perdido.
          </p>
        </div>
        <button onClick={carregar} className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Tentar de novo
        </button>
        <BottomNav />
      </main>
    )
  }

  if (!logado || !perfil) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fl-page px-6 text-center">
        <p className="text-fl-ink-2">Entra na sua conta pra ver seu perfil.</p>
        <Link href="/login" className="rounded-full bg-fl-500 px-6 py-3 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </main>
    )
  }

  const inicial = perfil.nome.trim().charAt(0).toUpperCase() || "?"
  const temGastos = perfil.categorias?.length > 0
  const jogo = nivelDoTotal(perfil.pontos)

  // A foto do usuário vence a do Google, que vence o avatar do Fin equipado
  // na loja, que vence a inicial dourada (pedido da fundadora, 15/08: foto em
  // todo lugar que mostrava inicial). A troca fura o cache com ?v= assim que
  // o servidor confirma.
  const poseEquipada = perfil.avatarFin ? AVATAR_POSE[perfil.avatarFin] : null
  const urlFoto = temFoto ? `/api/imagem/foto?v=${versaoImg}` : perfil.image ?? poseEquipada

  return (
    <main className="min-h-dvh bg-fl-page pb-24 lg:pb-10 lg:pl-56">
      {/* Banner de capa (personalização, 14/08): faixa de imagem no topo, e o
          resto da tela segue navy+dourado — a identidade não sai do lugar.
          Visível só pro dono: a rota da imagem exige a sessão dele. */}
      {temBanner && (
        <div className="relative h-36 w-full overflow-hidden sm:h-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/imagem/banner?v=${versaoImg}`}
            alt=""
            className="size-full object-cover"
          />
          {/* Esmaece pro navy embaixo: a capa encontra a página, não briga. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 55%, var(--fl-page))" }}
          />
          <TrocarImagem
            tipo="banner"
            temImagem
            onMudou={(tem) => { setTemBanner(tem); setVersaoImg(Date.now()) }}
            className="absolute right-4 top-3"
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-md px-5 py-6 md:max-w-2xl md:px-8 lg:max-w-3xl lg:px-10">
        {/* Cabeçalho do protótipo v2: quem é, em que nível do jogo está e o
            rótulo financeiro — "Nível 4 · Guardadora". A barra é o XP. */}
        <header className={`flex items-center gap-3.5 ${temBanner ? "-mt-14 sm:-mt-16" : ""}`}>
          <div className="relative shrink-0">
            {urlFoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlFoto}
                alt=""
                className={`size-16 rounded-full object-cover ${temBanner ? "ring-4 ring-[var(--fl-page)]" : ""}`}
              />
            ) : (
              <div className={`fin-btn-3d flex size-16 items-center justify-center rounded-full bg-fl-500 text-[26px] font-black text-primary-foreground ${temBanner ? "ring-4 ring-[var(--fl-page)]" : ""}`}>
                {inicial}
              </div>
            )}
            <TrocarImagem
              tipo="foto"
              temImagem={temFoto}
              onMudou={(tem) => { setTemFoto(tem); setVersaoImg(Date.now()) }}
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div className={`min-w-0 flex-1 ${temBanner ? "pt-10 sm:pt-12" : ""}`}>
            <h1 className="truncate text-xl font-black tracking-tight text-fl-ink">{perfil.nome}</h1>
            <p className="text-[13px] text-fl-ink-2">
              Nível {jogo.nivel} · <span className="text-fl-500">{perfil.nivel}</span>
            </p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fl-divider">
              <div className="h-full rounded-full bg-fl-500 transition-all" style={{ width: `${Math.round(jogo.fracao * 100)}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-bold text-fl-ink-3">
              {perfil.pontos} XP · faltam {jogo.paraProximo} pro nível {jogo.nivel + 1}
            </p>
          </div>
        </header>

        {/* Sem capa ainda: o convite fica pequeno e fora do caminho. */}
        {!temBanner && (
          <div className="mt-3 flex items-center gap-2">
            <TrocarImagem
              tipo="banner"
              temImagem={false}
              onMudou={(tem) => { setTemBanner(tem); setVersaoImg(Date.now()) }}
            />
            <span className="text-[11.5px] font-bold text-fl-ink-3">Adicionar uma capa</span>
          </div>
        )}

        {/* Os três tiles do desenho. Precisão só com quiz na semana — zero
            inventado diria "você errou tudo" para quem só não estudou. */}
        <section className="mt-5 grid grid-cols-3 gap-2.5" aria-label="Seu jogo">
          <div className="rounded-2xl bg-fl-card px-2 py-3 text-center">
            <Flame className="mx-auto size-[18px]" style={{ color: "var(--fin-combo, #F5772E)" }} />
            <div className="mt-1 text-lg font-black text-fl-ink">{perfil.sequencia ?? 0}</div>
            <div className="text-[10.5px] font-bold text-fl-ink-3">DIAS SEGUIDOS</div>
          </div>
          <div className="rounded-2xl bg-fl-card px-2 py-3 text-center">
            <Trophy className="mx-auto size-[18px] text-fl-500" />
            <div className="mt-1 text-lg font-black text-fl-ink">{perfil.pontos}</div>
            <div className="text-[10.5px] font-bold text-fl-ink-3">XP TOTAL</div>
          </div>
          <div className="rounded-2xl bg-fl-card px-2 py-3 text-center">
            <Target className="mx-auto size-[18px] text-fl-success" />
            <div className="mt-1 text-lg font-black text-fl-ink">
              {perfil.precisaoSemana != null ? `${perfil.precisaoSemana}%` : "-"}
            </div>
            <div className="text-[10.5px] font-bold text-fl-ink-3">PRECISÃO</div>
          </div>
        </section>

        {/* A rosca abre a página: "para onde foi o meu dinheiro" é a pergunta
            que traz alguém ao Perfil, e ela se responde de relance.

            A legenda não é clicável aqui de propósito. Em Análises tocar abre
            os lançamentos da categoria; repetir isso no Perfil daria dois
            lugares para a mesma tela e dois lugares para manter. O Perfil é
            retrato, e a porta para cavar está logo abaixo. */}
        <section className="mt-6" aria-label="Saídas por categoria">
          <div className="rounded-[20px] border border-fl-border bg-fl-card p-5">
            <h2 className="text-[15px] font-bold text-fl-ink">Para onde foi</h2>
            <p className="mt-0.5 text-xs text-fl-ink-2">
              {temGastos
                ? `Suas saídas em ${perfil.mesRosca}`
                : "Aparece assim que você registrar as primeiras saídas"}
            </p>
            {/* Sem gasto, só a legenda acima. O gráfico tem mensagem própria
                de vazio, e as duas juntas diriam a mesma coisa duas vezes. */}
            {temGastos && (
              <div className="mt-4">
                <GraficoRosca fatias={perfil.categorias} />
              </div>
            )}
            {!temGastos && (
              <Link href="/extrato" className="mt-3 inline-block text-[13px] font-semibold text-fl-500">
                Subir o extrato do banco
              </Link>
            )}
          </div>
        </section>

        {/* As leituras vêm logo depois porque dizem em português o que a rosca
            mostra em fatia. Uma explica a outra. */}
        {perfil.insights?.length > 0 && (
          <section className="mt-4 space-y-2" aria-label="Leituras do seu mês">
            {perfil.insights.map((i) => (
              <div
                key={i.texto}
                className="flex gap-2.5 rounded-2xl border border-fl-border bg-fl-card px-4 py-3.5"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ background: i.tipo === "alerta" || i.tipo === "divida" ? "var(--fl-accent)" : "var(--fl-500)" }}
                />
                <p className="text-[13.5px] leading-relaxed text-fl-ink">{i.texto}</p>
              </div>
            ))}
          </section>
        )}

        {/* Sem leitura ainda, o resumo faz o papel: uma frase é melhor que um
            buraco entre a rosca e os botões. */}
        {!perfil.insights?.length && (
          <p className="mt-4 rounded-2xl bg-fl-sand px-4 py-3.5 text-[14.5px] leading-relaxed text-fl-sand-text">
            {perfil.resumo}
          </p>
        )}

        {/* Card de Objetivos (protótipo v2): o Fin procurando + o objetivo em
            andamento. Sem objetivo ainda, o card convida em vez de sumir. */}
        <Link
          href="/objetivos"
          className="mt-4 flex items-center gap-3 rounded-2xl border-[1.5px] border-fl-500/40 bg-fl-card px-3.5 py-3 transition-colors hover:border-fl-500"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSE.search} alt="" className="size-10 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13.5px] font-black text-fl-ink">Objetivos</span>
              <span className="text-[11.5px] font-black text-fl-500">
                {perfil.objetivos ? `${brl(perfil.objetivos.totalGuardado)} guardados` : "começar"}
              </span>
            </div>
            {perfil.objetivos?.destaque ? (
              <>
                <div className="mt-0.5 truncate text-[11px] text-fl-ink-2">
                  {perfil.objetivos.destaque.nome} · {brl(perfil.objetivos.destaque.guardado)} de{" "}
                  {brl(perfil.objetivos.destaque.meta)}
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fl-divider">
                  <div
                    className="h-full rounded-full bg-fl-500"
                    style={{
                      width: `${Math.min(100, Math.round((perfil.objetivos.destaque.guardado / Math.max(1, perfil.objetivos.destaque.meta)) * 100))}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="mt-0.5 text-[11px] text-fl-ink-2">
                Dá nome ao que você quer juntar: cofrinho é bolso seu, não gasto.
              </div>
            )}
          </div>
          <span className="font-black text-fl-ink-3">›</span>
        </Link>

        {/* As quatro portas. */}
        <section className="mt-4 grid grid-cols-2 gap-2.5" aria-label="Onde ir">
          <Porta href="/trilha" Icon={BookText} titulo="Trilha" nota="Aulas escolhidas pelos seus números" />
          <Porta
            href="/ranking"
            Icon={Trophy}
            titulo="Liga"
            nota={`${perfil.pontos} XP · ${perfil.noRanking ? "você está dentro" : "entrar é opcional"}`}
          />
          <Porta href="/analises" Icon={ChartColumn} titulo="Análises" nota="Saúde financeira, gráficos e tetos" />
          <Porta href="/painel" Icon={Wallet} titulo="Painel" nota="Lançamentos e contas fixas" />
        </section>

        {/* O placar do jogo mora AQUI desde a unificação dos perfis (decisão
            da fundadora, 15/08/2026): uma pessoa só, uma tela só. */}
        {perfil.missoes && perfil.missoes.length > 0 && (
          <section className="mt-6" aria-label="Missões do dia">
            <div className="flex items-baseline justify-between px-0.5">
              <h2 className="text-[15px] font-black text-fl-ink">Missões</h2>
              <span className="text-[11px] font-bold text-fl-ink-3">renovam à meia-noite</span>
            </div>
            <div className="mt-2.5">
              <MissoesFin missoes={perfil.missoes} />
            </div>
          </section>
        )}

        {perfil.conquistas && perfil.conquistas.length > 0 && (
          <section className="mt-6" aria-label="Conquistas">
            <h2 className="px-0.5 text-[15px] font-black text-fl-ink">Conquistas</h2>
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {perfil.conquistas.map((c) => (
                <CardConquista key={c.id} c={c} />
              ))}
            </div>
          </section>
        )}

        {typeof perfil.recorde === "number" && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-fl-card px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSE.stars} alt="" className="size-11 shrink-0 object-contain" />
            <p className="text-[12.5px] leading-snug text-fl-ink-2">
              {perfil.recorde > 0 ? (
                <>
                  Seu recorde de ofensiva é{" "}
                  <strong className="text-fl-ink">
                    {perfil.recorde} {perfil.recorde === 1 ? "dia" : "dias"}
                  </strong>
                  {(perfil.sequencia ?? 0) >= perfil.recorde && perfil.recorde > 1
                    ? ", e você está nele agora. Segura!"
                    : ". Que tal quebrar essa marca?"}
                </>
              ) : (
                <>Sua primeira chama acende na primeira lição. Bora?</>
              )}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
