import { db } from "@/lib/db"
import { cifrar, decifrar } from "@/lib/cripto"
import type { CardIA } from "@/lib/ia"

/**
 * Ponto único de entrada/saída do histórico de conversas.
 *
 * Texto de mensagem é o dado mais sensível do app: uma conversa junta número,
 * contexto de vida e o que a pessoa contou sobre a família dela no mesmo lugar.
 * Cifrado com AAD amarrando dono e campo, como o resto.
 */

/** Quantas conversas ficam guardadas. Ao estourar, a mais antiga sai. */
const TETO_CONVERSAS = 40
/** Mensagens carregadas ao reabrir. Conversa mais longa que isso é rara. */
const TETO_MENSAGENS = 200

export interface MensagemGuardada {
  id: string
  papel: "usuario" | "ia"
  texto: string
  cards?: CardIA[]
  criadoEm: Date
}

export interface ConversaResumo {
  id: string
  titulo: string
  atualizadoEm: Date
  mensagens: number
}

/**
 * Só cards INFORMATIVOS voltam do histórico.
 *
 * Proposta de ação (lançamento, orçamento, extrato) é de uma vez só. Reabrir a
 * conversa com um botão "Confirmar" vivo convidaria a registrar duas vezes o
 * mesmo gasto, e o segundo registro pareceria tão legítimo quanto o primeiro.
 */
const CARDS_QUE_VOLTAM = new Set(["resumo", "grafico", "recomendacao", "lembrete", "caminho"])

function filtrarCards(cards: CardIA[] | undefined): CardIA[] {
  return (cards ?? []).filter((c) => CARDS_QUE_VOLTAM.has(c.tipo))
}

/** Título a partir da primeira frase da pessoa. Sem chamada de modelo: um
 *  título custa mais em latência do que entrega em precisão. */
function tituloDe(texto: string): string {
  const limpo = texto.replace(/\s+/g, " ").trim()
  if (limpo.length <= 52) return limpo
  const corte = limpo.slice(0, 52)
  const espaco = corte.lastIndexOf(" ")
  return (espaco > 24 ? corte.slice(0, espaco) : corte) + "…"
}

export async function listarConversas(userId: string): Promise<ConversaResumo[]> {
  const linhas = await db.conversa.findMany({
    where: { userId },
    orderBy: { atualizadoEm: "desc" },
    take: TETO_CONVERSAS,
    include: { _count: { select: { mensagens: true } } },
  })
  return linhas
    // Conversa sem mensagem é lixo de uma sessão abandonada; não vale listar.
    .filter((c) => c._count.mensagens > 0)
    .map((c) => ({
      id: c.id,
      titulo: c.titulo ? decifrar(c.titulo, userId, "conversa") : "Conversa",
      atualizadoEm: c.atualizadoEm,
      mensagens: c._count.mensagens,
    }))
}

/**
 * Tudo que foi conversado, para a portabilidade LGPD (`/api/exportar`).
 *
 * Existe separada de `listarConversas` + `abrirConversa` por três diferenças que
 * não são detalhe:
 *
 * 1. **Sem os tetos de leitura.** A tela para em 40 conversas e 200 mensagens
 *    porque ninguém rola mais que isso; a exportação é o direito de levar o que
 *    está guardado, e cortar em 200 devolveria menos do que o banco tem sem
 *    dizer que cortou. O volume continua limitado na GRAVAÇÃO (`podar`), que é
 *    onde o limite tem de estar.
 * 2. **Todos os cards, não só os que voltam para a tela.** `CARDS_QUE_VOLTAM`
 *    filtra proposta de ação para não ressuscitar um botão "Confirmar" numa
 *    conversa reaberta. Num arquivo JSON não há botão nenhum — o que sobra é
 *    dado que a IA gerou sobre a pessoa, e some sem motivo se for filtrado.
 * 3. **Conversa vazia sai também.** A lista esconde sessão abandonada porque
 *    seria linha morta na tela; aqui a linha existe no banco.
 *
 * Mensagem que não decifra vira `texto: null` com `erroDeLeitura: true` em vez
 * de derrubar a exportação inteira ou sumir calada. As duas alternativas são
 * piores: uma cifra adulterada tirando a pessoa do direito de baixar o resto, ou
 * um arquivo que se diz completo com um pedaço faltando.
 */
export interface MensagemExportada {
  papel: "usuario" | "ia"
  texto: string | null
  erroDeLeitura?: true
  cards?: CardIA[]
  criadoEm: Date
}

export interface ConversaExportada {
  titulo: string | null
  criadoEm: Date
  atualizadoEm: Date
  mensagens: MensagemExportada[]
}

export async function exportarConversas(userId: string): Promise<ConversaExportada[]> {
  const linhas = await db.conversa.findMany({
    where: { userId },
    orderBy: { criadoEm: "asc" },
    include: { mensagens: { orderBy: { criadoEm: "asc" } } },
  })

  return linhas.map((c) => ({
    titulo: c.titulo ? tentarDecifrar(c.titulo, userId, "conversa") : null,
    criadoEm: c.criadoEm,
    atualizadoEm: c.atualizadoEm,
    mensagens: c.mensagens.map((m) => {
      const texto = tentarDecifrar(m.texto, userId, "mensagem")
      return {
        papel: m.papel === "ia" ? ("ia" as const) : ("usuario" as const),
        texto,
        ...(texto === null ? { erroDeLeitura: true as const } : {}),
        ...(m.cards ? { cards: m.cards as CardIA[] } : {}),
        criadoEm: m.criadoEm,
      }
    }),
  }))
}

function tentarDecifrar(valor: string, userId: string, campo: string): string | null {
  try {
    return decifrar(valor, userId, campo)
  } catch (e) {
    console.error(`[exportar] ${campo} ilegível`, e)
    return null
  }
}

export async function abrirConversa(
  userId: string,
  conversaId: string
): Promise<MensagemGuardada[] | null> {
  const c = await db.conversa.findFirst({ where: { id: conversaId, userId } })
  if (!c) return null

  const linhas = await db.conversaMensagem.findMany({
    where: { conversaId },
    orderBy: { criadoEm: "asc" },
    take: TETO_MENSAGENS,
  })
  return linhas.map((l) => ({
    id: l.id,
    papel: l.papel === "ia" ? "ia" : "usuario",
    texto: decifrar(l.texto, userId, "mensagem"),
    cards: (l.cards as CardIA[] | null) ?? undefined,
    criadoEm: l.criadoEm,
  }))
}

/**
 * Grava o par pergunta/resposta. Cria a conversa se ainda não existir.
 *
 * Devolve o id para o cliente continuar mandando na mesma conversa. Sem isso,
 * cada turno abriria uma conversa nova e o histórico viraria uma lista de
 * frases soltas.
 */
export async function guardarTurno(
  userId: string,
  conversaId: string | null,
  pergunta: string,
  resposta: { texto: string; cards?: CardIA[] }
): Promise<string> {
  let id = conversaId

  if (id) {
    const dona = await db.conversa.findFirst({ where: { id, userId }, select: { id: true } })
    if (!dona) id = null
  }

  if (!id) {
    const nova = await db.conversa.create({
      data: { userId, titulo: cifrar(tituloDe(pergunta), userId, "conversa") },
    })
    id = nova.id
    await podar(userId)
  }

  const cards = filtrarCards(resposta.cards)
  await db.$transaction([
    db.conversaMensagem.createMany({
      data: [
        { conversaId: id, papel: "usuario", texto: cifrar(pergunta, userId, "mensagem") },
        {
          conversaId: id,
          papel: "ia",
          texto: cifrar(resposta.texto, userId, "mensagem"),
          ...(cards.length ? { cards } : {}),
        },
      ],
    }),
    // Mexe em atualizadoEm para a conversa subir na lista.
    db.conversa.update({ where: { id }, data: { atualizadoEm: new Date() } }),
  ])

  return id
}

export async function apagarConversa(userId: string, id: string): Promise<boolean> {
  const r = await db.conversa.deleteMany({ where: { id, userId } })
  return r.count > 0
}

export async function apagarTodasConversas(userId: string): Promise<number> {
  const r = await db.conversa.deleteMany({ where: { userId } })
  return r.count
}

/** Mantém no máximo TETO_CONVERSAS, descartando as mais antigas. */
async function podar(userId: string): Promise<void> {
  const total = await db.conversa.count({ where: { userId } })
  if (total <= TETO_CONVERSAS) return
  const excedente = await db.conversa.findMany({
    where: { userId },
    orderBy: { atualizadoEm: "asc" },
    take: total - TETO_CONVERSAS,
    select: { id: true },
  })
  await db.conversa.deleteMany({ where: { id: { in: excedente.map((e) => e.id) } } })
}
