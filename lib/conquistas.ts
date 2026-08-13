import { db } from "@/lib/db"
import { lerOfensiva } from "@/lib/ofensiva"
import { nivelDoTotal } from "@/lib/nivel"

/**
 * Conquistas do perfil do jogador — DERIVADAS, sem tabela: cada uma é uma
 * pergunta ao que o banco já guarda (progresso, ofensiva, combo, pontos).
 * Não existe "conceder conquista", logo não existe conquista dessincronizada
 * — o preço é recomputar na leitura, e a leitura é uma tela por visita.
 */

export interface Conquista {
  id: string
  titulo: string
  icone: "star" | "flame" | "bolt" | "gem" | "target" | "book"
  conquistada: boolean
}

export async function conquistasDe(userId: string): Promise<Conquista[]> {
  const [primeiraLicao, modulosFeitos, licaoCheia, ofensiva, u] = await Promise.all([
    db.progressoLicao.findFirst({ where: { userId, concluido: true }, select: { id: true } }),
    db.progressoModulo.count({ where: { userId, concluido: true } }),
    db.progressoLicao.findFirst({
      where: { userId, concluido: true, totalQuiz: { gt: 0 } },
      select: { acertos: true, totalQuiz: true },
      orderBy: { acertos: "desc" },
    }),
    lerOfensiva(userId),
    db.user.findUnique({ where: { id: userId }, select: { pontos: true, comboRecorde: true } }),
  ])

  const cemPorCento = !!licaoCheia && licaoCheia.acertos === licaoCheia.totalQuiz

  return [
    { id: "primeira-licao", titulo: "Primeira lição", icone: "book", conquistada: !!primeiraLicao },
    { id: "ofensiva-7", titulo: "7 dias seguidos", icone: "flame", conquistada: ofensiva.recorde >= 7 },
    { id: "ofensiva-30", titulo: "30 dias seguidos", icone: "flame", conquistada: ofensiva.recorde >= 30 },
    { id: "combo-3", titulo: "Combo ×3", icone: "bolt", conquistada: (u?.comboRecorde ?? 0) >= 3 },
    { id: "cinco-modulos", titulo: "5 aulas completas", icone: "star", conquistada: modulosFeitos >= 5 },
    { id: "licao-100", titulo: "Lição 100%", icone: "target", conquistada: cemPorCento },
    { id: "nivel-5", titulo: "Nível 5", icone: "gem", conquistada: nivelDoTotal(u?.pontos ?? 0).nivel >= 5 },
  ]
}
