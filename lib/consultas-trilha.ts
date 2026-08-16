import { db } from "@/lib/db"
import { filtroDeModulo, filtroExploravel, publicoDoUsuario } from "@/lib/publico"

/**
 * Ferramentas de CONSULTA da trilha para a IA (pedido da fundadora,
 * 15/08/2026): o assistente precisa saber o que a pessoa fez e conseguir
 * resumir o que ela aprendeu. Estas funções leem o banco e devolvem blocos
 * de TEXTO prontos para o prompt; quem decide QUANDO usá-las é o roteador
 * (lib/roteador-ia.ts).
 *
 * Texto, e não JSON, de propósito: o bloco vai direto pro prompt de sistema,
 * e o modelo lê prosa compacta melhor do que estrutura que ele teria de
 * decodificar. Os títulos vêm do banco, nunca de lista escrita à mão, pela
 * mesma razão dos cards de recomendação: título inventado vira resumo de
 * aula que não existe.
 */

export interface ProgressoDaTrilha {
  totalDaTrilha: number
  concluidos: {
    titulo: string
    subtitulo: string
    acertoPct: number | null
    concluidoEm: Date | null
    foraDaTrilha: boolean
  }[]
  emAndamento: { titulo: string; licoesConcluidas: number }[]
}

/** O que a pessoa fez, módulo a módulo, com acerto agregado da 1ª passada. */
export async function progressoDaTrilha(userId: string): Promise<ProgressoDaTrilha> {
  const publico = await publicoDoUsuario(userId)
  const [daTrilha, fechados, licoes] = await Promise.all([
    db.modulo.findMany({
      where: filtroDeModulo(publico),
      select: { id: true },
    }),
    db.progressoModulo.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true, concluidoEm: true },
      orderBy: { concluidoEm: "desc" },
    }),
    db.progressoLicao.findMany({
      where: { userId, concluido: true },
      select: { moduloId: true, acertos: true, totalQuiz: true },
    }),
  ])

  const idsDaTrilha = new Set(daTrilha.map((m) => m.id))
  const idsComProgresso = [
    ...new Set([...fechados.map((f) => f.moduloId), ...licoes.map((l) => l.moduloId)]),
  ]
  // Os títulos de TUDO que a pessoa tocou, inclusive aula explorada fora da
  // trilha dela: ela fez, então faz parte do que aprendeu. filtroExploravel
  // porque o escopo real são os ids do progresso DELA, a mesma lógica de
  // lib/bau.ts — e módulo concluído é, por definição, explorável.
  const modulos = await db.modulo.findMany({
    where: { ...filtroExploravel(), id: { in: idsComProgresso } },
    select: { id: true, titulo: true, subtitulo: true },
  })
  const porId = new Map(modulos.map((m) => [m.id, m]))
  const fechadoIds = new Set(fechados.map((f) => f.moduloId))

  const acertoPor = new Map<string, { a: number; t: number }>()
  const licoesPor = new Map<string, number>()
  for (const l of licoes) {
    licoesPor.set(l.moduloId, (licoesPor.get(l.moduloId) ?? 0) + 1)
    const q = acertoPor.get(l.moduloId) ?? { a: 0, t: 0 }
    q.a += l.acertos
    q.t += l.totalQuiz
    acertoPor.set(l.moduloId, q)
  }

  const concluidos = fechados
    .filter((f) => porId.has(f.moduloId))
    .map((f) => {
      const m = porId.get(f.moduloId)!
      const q = acertoPor.get(f.moduloId)
      return {
        titulo: m.titulo,
        subtitulo: m.subtitulo ?? "",
        acertoPct: q && q.t > 0 ? Math.round((q.a / q.t) * 100) : null,
        concluidoEm: f.concluidoEm,
        foraDaTrilha: !idsDaTrilha.has(f.moduloId),
      }
    })

  const emAndamento = [...licoesPor.entries()]
    .filter(([id]) => !fechadoIds.has(id) && porId.has(id))
    .map(([id, n]) => ({ titulo: porId.get(id)!.titulo, licoesConcluidas: n }))

  return { totalDaTrilha: daTrilha.length, concluidos, emAndamento }
}

const dataCurta = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "?"

/**
 * O bloco DETALHADO, para quando a pessoa pede resumo do que aprendeu.
 * Subtítulo entra porque é ele que diz o CONTEÚDO da aula: é a matéria-prima
 * do resumo, não enfeite.
 */
export function blocoDoProgresso(p: ProgressoDaTrilha): string {
  if (p.concluidos.length === 0 && p.emAndamento.length === 0) {
    return "A pessoa ainda não concluiu nenhuma aula da trilha."
  }
  const linhas: string[] = []
  if (p.concluidos.length > 0) {
    linhas.push(`AULAS CONCLUÍDAS (${p.concluidos.length}, de ${p.totalDaTrilha} da trilha dela):`)
    for (const c of p.concluidos) {
      const acerto = c.acertoPct === null ? "" : `, acerto ${c.acertoPct}%`
      const fora = c.foraDaTrilha ? ", explorada fora da trilha" : ""
      linhas.push(`- ${c.titulo} (${c.subtitulo}${acerto}, em ${dataCurta(c.concluidoEm)}${fora})`)
    }
  }
  if (p.emAndamento.length > 0) {
    linhas.push("EM ANDAMENTO:")
    for (const a of p.emAndamento) {
      linhas.push(`- ${a.titulo} (${a.licoesConcluidas} ${a.licoesConcluidas === 1 ? "lição feita" : "lições feitas"})`)
    }
  }
  return linhas.join("\n")
}

/**
 * A linha CURTA que entra em TODA conversa: o assistente sempre sabe onde a
 * pessoa está na trilha, mesmo sem ninguém pedir resumo. Barata de montar e
 * de ler; o detalhe fica com o roteador.
 */
export function linhaDoProgresso(p: ProgressoDaTrilha): string {
  if (p.concluidos.length === 0) {
    return "Trilha: nenhuma aula concluída ainda."
  }
  const recentes = p.concluidos.slice(0, 3).map((c) => c.titulo).join("; ")
  return `Trilha: ${p.concluidos.length} de ${p.totalDaTrilha} aulas concluídas. Últimas: ${recentes}.`
}
