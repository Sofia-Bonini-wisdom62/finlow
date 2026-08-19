import { ehDeOutroPublico, type Publico } from "@/lib/publico"
import type { EstadoModulo } from "@/lib/corredor"

/**
 * A regra de estado da Biblioteca, num arquivo FOLHA.
 *
 * Ela morava dentro de `app/trilha/biblioteca/page.tsx` e estava escrita DUAS
 * vezes: uma no card, outra no contador do cabeçalho. As duas cópias
 * discordavam sobre aula de outro público, e o resultado era o bug de
 * 18/08/2026 relatado pela fundadora: o adulto terminava uma aula escolar,
 * via o check verde no card, e o "N concluídas" do topo não se mexia.
 *
 * Duas fontes para a mesma pergunta divergem. É o mesmo argumento que fez o
 * estado vir de `montarCorredor` em vez de ser recalculado na biblioteca, e o
 * mesmo que fez `filtroDeModulo` morar num módulo só em vez de virar um
 * `where` copiado em nove lugares.
 *
 * Aqui e não na página porque página não se importa de script: com a regra
 * numa folha (o `import type` do corredor é apagado na compilação, então nada
 * de `db` vem junto), `scripts/testar-biblioteca.mts` consegue afirmar as
 * quatro combinações sem subir banco.
 */

/** O que a pessoa PODE ver na biblioteca. Mesma união do corredor. */
export type EstadoDaAula = EstadoModulo

/** Só o que a regra lê de um nó do corredor. O nó real tem muito mais. */
export interface NoMinimo {
  estado: EstadoDaAula
}

/**
 * O estado de UMA aula, para o card e para a contagem.
 *
 * AULA DE OUTRO PÚBLICO NÃO VEM DO CORREDOR, e não é omissão: o corredor é a
 * ordem que a IA montou PARA a pessoa, e ela não montou nada sobre o 4º ano.
 * Ler o corredor para ela faria o `undefined` cair em "trancado", e a
 * biblioteca mostraria uma parede de cadeados que nada destrava. Por isso
 * escolar é sempre abrível, e quem diz se terminou é o `ProgressoModulo`,
 * que chega em `concluidosForaDoCorredor`.
 *
 * `podeAbrir` (lib/corredor.ts) tem a mesma regra do outro lado: são as duas
 * metades da mesma decisão, e divergir produziria um card que abre e uma rota
 * que recusa.
 */
export function estadoDaAula(
  aula: { id: string; publico: string },
  publicoDaPessoa: Publico,
  corredor: { modulos: ReadonlyMap<string, NoMinimo> },
  concluidosForaDoCorredor: ReadonlySet<string>
): EstadoDaAula {
  if (ehDeOutroPublico(aula.publico, publicoDaPessoa)) {
    return concluidosForaDoCorredor.has(aula.id) ? "concluido" : "liberado"
  }
  return corredor.modulos.get(aula.id)?.estado ?? "trancado"
}
