import { db } from "@/lib/db"
import { filtroExploravel } from "@/lib/publico"

/**
 * Concessão de acesso: o que o professor liberou para a turma.
 *
 * A regra do default importa mais que a mecânica: turma SEM nenhuma linha de
 * AcessoTrilhaTurma = trilha COMPLETA do segmento em corredor. O produto
 * funciona sem professor ativo, e a primeira concessão é o que liga o modo
 * restrito — a partir dela, só o concedido abre. Quem consome é o corredor
 * (lib/corredor.ts): módulo do segmento fora da concessão aparece trancado
 * com "Sua turma ainda não liberou esta parte", e a rota recusa pelo mesmo
 * estado — as duas metades da mesma decisão.
 *
 * Aluno em DUAS turmas soma as concessões (união): estar no clube de
 * finanças não pode trancar o que a sala já liberou.
 */

/**
 * Os módulos liberados para esta pessoa pelas turmas dela.
 * `null` = sem restrição (sem turma, ou nenhuma turma com concessão).
 */
export async function modulosConcedidos(userId: string): Promise<Set<string> | null> {
  const turmas = await db.membroTurma.findMany({
    where: { userId },
    select: { turmaId: true },
  })
  if (turmas.length === 0) return null

  const acessos = await db.acessoTrilhaTurma.findMany({
    where: { turmaId: { in: turmas.map((t) => t.turmaId) } },
    select: { tipo: true, refId: true },
  })
  if (acessos.length === 0) return null

  const ids = new Set<string>()
  const segmentos: string[] = []
  const blocos: string[] = []
  for (const a of acessos) {
    if (a.tipo === "modulo") ids.add(a.refId)
    else if (a.tipo === "bloco") blocos.push(a.refId)
    else if (a.tipo === "segmento") segmentos.push(a.refId)
    // tipo desconhecido é ignorado: linha de um vocabulário futuro não pode
    // nem abrir tudo nem trancar tudo por acidente.
  }

  if (segmentos.length || blocos.length) {
    const ou: object[] = []
    if (segmentos.length) ou.push({ publico: { in: segmentos } })
    if (blocos.length) ou.push({ blocoId: { in: blocos } })
    // filtroExploravel de propósito: a expansão parte de refIds que o
    // professor gravou, e o escopo real é o deles.
    const mods = await db.modulo.findMany({
      where: { ...filtroExploravel(), OR: ou },
      select: { id: true },
    })
    for (const m of mods) ids.add(m.id)
  }

  return ids
}
