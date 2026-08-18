import { db } from "@/lib/db"

/**
 * Os números da operação, fora do componente de propósito.
 *
 * A primeira versão contava dentro de `app/ops/page.tsx`, e o lint do React
 * recusou: `Date.now()` no corpo de um componente é chamada impura durante o
 * render, e render que lê o relógio pode devolver resultado diferente a cada
 * re-render sem nada ter mudado. A saída não é silenciar a regra, é tirar a
 * leitura do render, que é o que `lib/escola-desempenho.ts` já fazia para os
 * dashboards da escola.
 *
 * Só AGREGADOS: nenhum nome, nenhum e-mail. Quem precisa ver pessoa vê dentro
 * de uma escola, onde há motivo.
 */

export interface NumerosDaOperacao {
  usuarios: number
  usuarios30d: number
  assinaturasAtivas: number
  inadimplentes: number
  escolasAtivas: number
  escolasSuspensas: number
  turmas: number
  alunos: number
  professores: number
  indicacoes: number
  indicacoesAtivadas: number
  leads: number
  pctIndicacao: number
}

export async function numerosDaOperacao(agora: Date = new Date()): Promise<NumerosDaOperacao> {
  const corte30d = new Date(agora.getTime() - 30 * 24 * 3600 * 1000)

  const [
    usuarios,
    usuarios30d,
    assinaturasAtivas,
    inadimplentes,
    escolasAtivas,
    escolasSuspensas,
    turmas,
    alunos,
    professores,
    indicacoes,
    indicacoesAtivadas,
    leads,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { criadoEm: { gte: corte30d } } }),
    db.assinatura.count({ where: { status: "ativa" } }),
    db.assinatura.count({ where: { status: "inadimplente" } }),
    db.escola.count({ where: { status: "ativa" } }),
    db.escola.count({ where: { status: "suspensa" } }),
    db.turma.count(),
    db.membroEscola.count({ where: { papel: "aluno" } }),
    db.membroEscola.count({ where: { papel: "professor" } }),
    db.indicacao.count(),
    db.indicacao.count({ where: { status: "ativado" } }),
    db.leadEmpresa.count(),
  ])

  return {
    usuarios,
    usuarios30d,
    assinaturasAtivas,
    inadimplentes,
    escolasAtivas,
    escolasSuspensas,
    turmas,
    alunos,
    professores,
    indicacoes,
    indicacoesAtivadas,
    leads,
    // Divisão por zero em base vazia devolveria NaN na tela, que é o tipo de
    // número que faz alguém achar que o app quebrou no dia da primeira conta.
    pctIndicacao: usuarios > 0 ? Math.round((indicacoes / usuarios) * 100) : 0,
  }
}
