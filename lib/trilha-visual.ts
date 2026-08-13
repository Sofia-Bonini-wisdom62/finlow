import { db } from "@/lib/db"
import { filtroDeModulo, publicoDoUsuario, PUBLICO_ATUAL } from "@/lib/publico"
import { montarCorredor, type ModuloNoCorredor } from "@/lib/corredor"
import { lerOfensiva } from "@/lib/ofensiva"
import { estadoDaEnergia } from "@/lib/energia"
import { inicioDoDiaSP } from "@/lib/pontos"

/**
 * A trilha como o CAMINHO desenha: blocos temáticos, nós e travas.
 *
 * Substitui o `lib/mock-trilha.ts` que veio com os componentes — os tipos são
 * os mesmos, os dados é que passam a ser do banco.
 *
 * ESTA CAMADA NÃO SABE O QUE ACONTECE DENTRO DO MÓDULO, e é de propósito.
 * O nó traz `licoesFeitas`/`licoesTotal`, que é progresso; quem decide quais
 * lições existem e em que ordem é lib/licoes.ts, e quem decide o que abriu é
 * lib/corredor.ts. Ao receber o componente eu achei que adotá-lo obrigasse a
 * desmontar as 4 lições — não obriga: a visão da trilha e o miolo do módulo
 * são ortogonais, e o único ponto de contato é o anel de progresso do nó.
 */

export type EstadoNo = "concluido" | "atual" | "disponivel" | "travado" | "revisao"

export interface NoTrilha {
  moduloId: string
  slug: string
  titulo: string
  subtitulo: string
  estado: EstadoNo
  nivel: "iniciante" | "intermediario" | "avancado"
  duracaoMin: number
  pontos: number
  tags: string[]
  thumbnail: string
  /** Quantas das etapas do módulo já foram vistas — alimenta o anel do nó. */
  telasVistas: number
  /** Quantas etapas o módulo tem. O componente original supunha 5 fixas; aqui
   *  são as lições que o módulo REALMENTE tem (3 ou 4). */
  telasTotal: number
  promovidoPelaIa?: boolean
  motivoIa?: string
  /** Título do módulo que precisa ser concluído. */
  destravadoPor?: string
  ramo?: { id: string; nome: string; corToken: string }
  /** A lição a abrir ao tocar (do corredor) — alimenta o tooltip "COMEÇAR ·
   *  LIÇÃO N" do nó atual. null quando concluído ou trancado. */
  proximaLicao?: number | null
}

export interface Bloco {
  id: string
  rotulo: string
  nos: NoTrilha[]
  /** Posição do bloco na trilha — decide a cor da unidade (lib/fin.ts). */
  indice: number
  /**
   * O baú da unidade (Redesign Fin), só em bloco ESCOLAR de verdade: a trilha
   * adulta não desenha fronteira de leva no mapa — o baú dela chega pela tela
   * de fim de lição (bauDaConclusao). Estado vem do ledger de coins.
   */
  bau?: { refId: string; estado: "travado" | "disponivel" | "aberto" }
}

export interface Trilha {
  id: string
  nome: string
  percentual: number
  blocos: Bloco[]
  /** true = trilha de segmento escolar (currículo em ordem fixa, sem leva de
   *  IA). O fim-de-trilha muda de copy: não há "próximos 4 módulos" a liberar. */
  escolar?: boolean
  reordenadaEm?: string
  resumoReordenacao?: {
    texto: string
    movimentos: { titulo: string; de: number; para: number }[]
  }
}

export interface TrilhaResumo {
  id: string
  nome: string
  percentual: number
  novo?: boolean
}

export interface Usuario {
  nome: string
  inicial: string
  sequencia: number
  pontos: number
  // --- Redesign Fin ---
  coins: number
  /** null = isento (premium ou escola) — o header mostra ∞. */
  energia: { atual: number; max: number } | null
  /** A pessoa já usou o app hoje? Alimenta o pop-up de lição diária. */
  hoje: boolean
  /** % de acerto dos últimos 7 dias; null = sem quiz na semana. */
  precisaoSemana: number | null
  /** Avatar equipado (itemId da loja); null = inicial do nome. */
  avatarFin: string | null
}

/** Sem bloco gravado, tudo cai num bloco só — é o caso da trilha adulta. */
const BLOCO_PADRAO = { id: "trilha", rotulo: "Sua trilha" }

function estadoDoNo(m: ModuloNoCorredor, ehAtual: boolean): EstadoNo {
  if (m.estado === "concluido") return "concluido"
  if (m.estado === "trancado") return "travado"
  return ehAtual ? "atual" : "disponivel"
}

/**
 * Monta a trilha visual de uma pessoa.
 *
 * A ORDEM é a do corredor (a sequência que a IA montou), não `Modulo.ordem`:
 * é o mesmo eixo que decide o que abre, então a lista desenhada e a lista que
 * libera não têm como divergir. Módulo fora da sequência entra depois, no fim,
 * como acervo — aparece trancado com o motivo, em vez de sumir e fazer a
 * pessoa concluir que a aula não existe.
 */
export async function montarTrilhaVisual(userId: string): Promise<{
  trilha: Trilha
  trilhas: TrilhaResumo[]
  usuario: Usuario
}> {
  const publico = await publicoDoUsuario(userId)
  const seteDias = new Date(inicioDoDiaSP().getTime() - 6 * 24 * 60 * 60 * 1000)
  const [corredor, modulos, user, ofensiva, energia, bausAbertos, licoesDaSemana] =
    await Promise.all([
      montarCorredor(userId),
      db.modulo.findMany({
        where: filtroDeModulo(publico),
        select: {
          id: true, slug: true, titulo: true, subtitulo: true, nivel: true,
          duracaoMin: true, pontos: true, tags: true, thumbnail: true,
          blocoId: true, blocoRotulo: true, ordem: true,
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { nome: true, pontos: true, coins: true, avatarFin: true },
      }),
      lerOfensiva(userId),
      estadoDaEnergia(userId),
      db.eventoCoins.findMany({
        where: { userId, motivo: "bau" },
        select: { refId: true },
      }),
      db.progressoLicao.findMany({
        where: { userId, concluido: true, totalQuiz: { gt: 0 }, concluidoEm: { gte: seteDias } },
        select: { acertos: true, totalQuiz: true },
      }),
    ])

  const somaAcertos = licoesDaSemana.reduce((s, l) => s + l.acertos, 0)
  const somaQuiz = licoesDaSemana.reduce((s, l) => s + l.totalQuiz, 0)
  const precisaoSemana = somaQuiz > 0 ? Math.round((somaAcertos / somaQuiz) * 100) : null
  const bauAberto = new Set(bausAbertos.map((b) => b.refId))

  const porId = new Map(modulos.map((m) => [m.id, m]))
  const noCorredor = [...corredor.modulos.values()]

  // Primeiro os da sequência, na ordem dela; depois o acervo, por Modulo.ordem.
  const ordenados = [
    ...noCorredor.filter((m) => m.posicao > 0).sort((a, b) => a.posicao - b.posicao),
    ...noCorredor
      .filter((m) => m.posicao === 0)
      .sort((a, b) => (porId.get(a.moduloId)?.ordem ?? 0) - (porId.get(b.moduloId)?.ordem ?? 0)),
  ]

  const blocos = new Map<string, Bloco>()

  for (const c of ordenados) {
    const m = porId.get(c.moduloId)
    if (!m) continue

    const chave = m.blocoId ?? BLOCO_PADRAO.id
    if (!blocos.has(chave)) {
      blocos.set(chave, {
        id: chave,
        rotulo: m.blocoRotulo ?? BLOCO_PADRAO.rotulo,
        nos: [],
        indice: blocos.size,
      })
    }

    blocos.get(chave)!.nos.push({
      moduloId: c.moduloId,
      slug: m.slug,
      titulo: m.titulo,
      // O prefixo "2 minutos." do seed sai: a duração já tem lugar próprio.
      subtitulo: m.subtitulo.replace(/^\s*\d+\s*minutos?\.\s*/i, ""),
      estado: estadoDoNo(c, corredor.atual?.moduloId === c.moduloId),
      nivel: (m.nivel as NoTrilha["nivel"]) ?? "iniciante",
      duracaoMin: m.duracaoMin,
      pontos: m.pontos,
      tags: m.tags,
      thumbnail: m.thumbnail ?? "",
      telasVistas: c.licoesConcluidas,
      telasTotal: c.licoesTotal,
      proximaLicao: c.proximaLicao,
      // O TÍTULO, não a frase: o componente monta "conclua X para abrir".
      ...(c.bloqueadoPor ? { destravadoPor: c.bloqueadoPor } : {}),
    })
  }

  const escolar = publico !== PUBLICO_ATUAL

  // O baú de cada unidade escolar. A trilha adulta não desenha fronteira de
  // leva no mapa — o baú dela chega pela tela de fim de lição.
  if (escolar) {
    for (const b of blocos.values()) {
      if (b.id === BLOCO_PADRAO.id || b.nos.length === 0) continue
      const refId = `bloco:${b.id}`
      const completo = b.nos.every((n) => n.estado === "concluido")
      b.bau = {
        refId,
        estado: bauAberto.has(refId) ? "aberto" : completo ? "disponivel" : "travado",
      }
    }
  }

  const todos = [...blocos.values()].flatMap((b) => b.nos)
  const concluidos = todos.filter((n) => n.estado === "concluido").length
  const percentual = todos.length ? Math.round((concluidos / todos.length) * 100) : 0
  return {
    trilha: {
      id: publico,
      nome: escolar ? "Trilha da turma" : "Sua trilha",
      percentual,
      blocos: [...blocos.values()],
      escolar,
    },
    trilhas: [{ id: publico, nome: escolar ? "Trilha da turma" : "Sua trilha", percentual }],
    usuario: {
      nome: user?.nome ?? "",
      inicial: (user?.nome ?? "?").trim().charAt(0).toUpperCase() || "?",
      sequencia: ofensiva.atual,
      pontos: user?.pontos ?? 0,
      coins: user?.coins ?? 0,
      energia,
      hoje: ofensiva.hoje,
      precisaoSemana,
      avatarFin: user?.avatarFin ?? null,
    },
  }
}
