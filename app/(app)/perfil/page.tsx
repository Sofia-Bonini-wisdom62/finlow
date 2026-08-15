"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDownLeft, ArrowUpRight, BookText, ChartColumn, Flame, PiggyBank, Target, Trophy, Wallet } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { GraficoRosca } from "@/components/analises/GraficoRosca"
import type { MetricasPerfil, FatiaCategoria } from "@/lib/financas"
import { nivelDoTotal } from "@/lib/nivel"
import { POSE } from "@/lib/fin"
import { brl } from "@/lib/formato"
import { TrocarImagem } from "@/components/perfil/TrocarImagem"

/**
 * Perfil: retrato de um minuto.
 *
 * A ordem é quem é a pessoa, quanto ela tem, para onde o dinheiro foi, o que
 * isso quer dizer, e para onde ir. Nada de número solto no meio.
 *
 * A ORDEM É DECISÃO DA FUNDADORA (backlog "Tela de perfil a reconfigurar")
 * Nome e foto no topo; saldo e o que entrou/saiu do mês logo abaixo; aí sim a
 * rosca e as quatro portas. Os três tiles do jogo (dias seguidos, XP, precisão)
 * desceram para junto da porta da Liga no mesmo movimento: entre a identidade e
 * o dinheiro eles quebravam a frase que a tela conta, e ao lado da Liga são a
 * mesma conversa. Nenhum número saiu da tela — só mudou de lugar.
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
  mesCurto?: string
  dinheiro?: {
    saldo: number
    entradas: number
    saidas: number
    guardado: number
    lancamentos: number
  } | null
  pontos: number
  noRanking: boolean
  insights: { texto: string; tipo: string }[]
  sequencia?: number
  precisaoSemana?: number | null
  temFoto?: boolean
  temBanner?: boolean
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

/** Uma metade do "entrou × saiu". Mesmo peso visual para as duas: saída em
 *  vermelho seria julgamento, e a casa não julga gasto. */
function Fluxo({
  Icon, rotulo, valor, sinal, cor,
}: {
  Icon: typeof ArrowDownLeft
  rotulo: string
  valor: number
  sinal: string
  cor: string
}) {
  return (
    <div className="rounded-2xl bg-fl-page/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5" style={{ color: cor }} />
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-fl-ink-3">{rotulo}</span>
      </div>
      <div className="mt-1 text-[16.5px] font-black" style={{ color: cor }}>
        {sinal} {brl(valor)}
      </div>
    </div>
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

  // O bloco de dinheiro. Ausente vira zerado + estado vazio, nunca quebra: a
  // rota pode falhar num pedaço acessório e o retrato continua de pé.
  const dinheiro = perfil.dinheiro ?? { saldo: 0, entradas: 0, saidas: 0, guardado: 0, lancamentos: 0 }
  // "Tem número" é ter lançamento no mês de que a tela fala — e esse mês é, por
  // construção, o último com movimento. Zero aqui só acontece com histórico
  // vazio de verdade.
  const temNumeros = dinheiro.lancamentos > 0

  // A foto do usuário vence a do Google, que vence a inicial dourada — e a
  // troca fura o cache do navegador com ?v= assim que o servidor confirma.
  const urlFoto = temFoto ? `/api/imagem/foto?v=${versaoImg}` : perfil.image

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

        {/* O DINHEIRO, LOGO ABAIXO DE QUEM É A PESSOA.
            Saldo primeiro, entrou e saiu do mês em seguida — é a ordem pedida
            no backlog, e é a ordem em que a pergunta se faz: "quanto eu tenho"
            antes de "o que fiz com isso".

            O saldo é o ACUMULADO (tudo que entrou menos tudo que saiu desde o
            primeiro registro), não o saldo da conta no banco: não existe
            integração bancária, e chamar de "saldo atual" um número que o app
            não tem como saber seria inventar precisão. A legenda embaixo diz de
            onde ele vem, com o mês, para ninguém confundir com o app do banco.

            Entradas e saídas são do MESMO mês da rosca (o último com
            movimento). Dois meses diferentes na mesma tela seriam duas
            verdades: "saiu R$ 300" ao lado de uma rosca somando R$ 1.200. */}
        <section className="mt-5" aria-label="Seu dinheiro">
          <div className="rounded-[20px] border border-fl-border bg-fl-card p-5">
            {temNumeros ? (
              <>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-fl-ink-3">
                  Saldo acumulado
                </span>
                {/* Negativo em âmbar, nunca no vermelho de erro: quem está no
                    negativo já sabe, e a tela não precisa gritar. */}
                <p
                  className={`mt-0.5 text-[30px] font-black leading-none tracking-tight ${
                    dinheiro.saldo >= 0 ? "text-fl-500" : "text-fl-accent-dark"
                  }`}
                >
                  {brl(dinheiro.saldo)}
                </p>
                <p className="mt-1.5 text-[11.5px] leading-snug text-fl-ink-2">
                  Tudo que entrou menos tudo que saiu, até {perfil.mesRosca}. Não é o saldo da
                  sua conta no banco — é a conta do que você registrou aqui.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Fluxo
                    Icon={ArrowDownLeft}
                    rotulo={`Entrou${perfil.mesCurto ? ` em ${perfil.mesCurto}` : ""}`}
                    valor={dinheiro.entradas}
                    sinal="+"
                    cor="var(--fl-success)"
                  />
                  <Fluxo
                    Icon={ArrowUpRight}
                    rotulo={`Saiu${perfil.mesCurto ? ` em ${perfil.mesCurto}` : ""}`}
                    valor={dinheiro.saidas}
                    sinal="−"
                    cor="var(--fl-ink)"
                  />
                </div>

                {/* Guardar não é gastar: o que foi para a poupança fica fora de
                    "saiu" (regra de `ehPoupanca`), e some da tela se for zero —
                    "R$ 0,00 guardado" é cobrança, não informação. */}
                {dinheiro.guardado > 0 && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-bold text-fl-ink-2">
                    <PiggyBank className="size-3.5 text-fl-500" />
                    {brl(dinheiro.guardado)} guardados no mês — isso não conta como saída.
                  </p>
                )}
              </>
            ) : (
              /* Sem lançamento nenhum, "R$ 0,00" seria uma afirmação falsa: o
                 app não sabe que a pessoa tem zero, sabe que não sabe. */
              <>
                <h2 className="text-[15px] font-bold text-fl-ink">Seu saldo aparece aqui</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-fl-ink-2">
                  Assim que entrar o primeiro lançamento, esta tela mostra quanto você tem e o
                  que entrou e saiu no mês.
                </p>
                <Link href="/extrato" className="mt-3 inline-block text-[13px] font-semibold text-fl-500">
                  Subir o extrato do banco
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Depois do dinheiro vem para onde ele foi — a pergunta que traz
            alguém ao Perfil, respondida de relance.

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
                Dá nome ao que você quer juntar — cofrinho é bolso seu, não gasto.
              </div>
            )}
          </div>
          <span className="font-black text-fl-ink-3">›</span>
        </Link>

        {/* Os três tiles do jogo, agora aqui embaixo: eles falam de estudo, não
            de dinheiro, e ao lado da porta da Liga são a mesma conversa. Entre
            a foto e o saldo, competiam com o número que a pessoa veio ver.
            Precisão só com quiz na semana — zero inventado diria "você errou
            tudo" para quem só não estudou. */}
        <section className="mt-4 grid grid-cols-3 gap-2.5" aria-label="Seu jogo">
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
              {perfil.precisaoSemana != null ? `${perfil.precisaoSemana}%` : "—"}
            </div>
            <div className="text-[10.5px] font-bold text-fl-ink-3">PRECISÃO</div>
          </div>
        </section>

        {/* As quatro portas. */}
        <section className="mt-2.5 grid grid-cols-2 gap-2.5" aria-label="Onde ir">
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
      </div>

      <BottomNav />
    </main>
  )
}
