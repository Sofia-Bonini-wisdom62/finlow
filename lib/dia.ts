/**
 * A data de um LANÇAMENTO, lida como dia de calendário.
 *
 * ── O defeito que este arquivo existe para fechar ───────────────────────────
 * A mesma data era lida de dois jeitos no mesmo app. `lib/financas.ts` agrupava
 * por mês com `getMonth()` (hora local) enquanto `dataCurta()` em
 * `lib/formato.ts` lia o dia com `getUTCDate()` de propósito — e `situacoes.ts`,
 * `contexto-financeiro.ts` e a rota das Análises tinham escolhido UTC, cada uma
 * por conta própria. As duas leituras só concordam porque a Vercel roda em UTC:
 * é uma variável de ambiente do servidor sustentando a aritmética do dinheiro
 * da pessoa.
 *
 * Num fuso a oeste, um lançamento gravado no dia 1º cai no mês ANTERIOR na soma
 * e continua aparecendo como dia 1º no rótulo, porque quem soma e quem escreve
 * leem a data de jeitos diferentes. Nada quebra: compila, renderiza, ninguém
 * loga. A tela diz "suas saídas em agosto" sobre números de julho.
 *
 * ── A regra ─────────────────────────────────────────────────────────────────
 * A data de um lançamento é um DIA DE CALENDÁRIO, não um instante. Quem gastou
 * no dia 21 gastou no dia 21 em qualquer fuso — não existe "o mesmo gasto três
 * horas antes". O ciclo fecha em três passos, e este arquivo é dono dos três:
 *
 *   1. ESCOLHIDO no calendário de quem lança (`hojeNoCalendario`, no navegador
 *      da pessoa: o "hoje" dela é o do relógio de parede dela).
 *   2. GRAVADO ancorado ao MEIO-DIA UTC (`ancorarDia`). Meia-noite UTC vira o
 *      dia anterior em qualquer fuso negativo; o meio-dia aguenta ±11h de
 *      escorregão em qualquer direção.
 *   3. LIDO em UTC (todo o resto deste arquivo), que devolve exatamente o dia
 *      do passo 1.
 *
 * ── O que NÃO passa por aqui ────────────────────────────────────────────────
 * "Agora" é instante, não dia de calendário: `criadoEm`, "há 2 minutos" e o
 * relógio que decide se o mês selecionado é o mês corrente continuam em hora
 * local, que é a pergunta certa para eles.
 *
 * A ofensiva e as missões também ficam de fora, e de propósito: elas contam o
 * dia em SÃO PAULO (`inicioDoDiaSP`, `lib/missoes.ts`), porque a virada de um
 * streak é um evento na vida da pessoa — em UTC a cota viraria às 21h do dia 31.
 * Dia de lançamento e dia de ofensiva são duas perguntas diferentes com a mesma
 * palavra.
 */

/** Mês e ano de competência. `mes` é 1–12, como se fala, não 0–11. */
export interface Competencia {
  mes: number
  ano: number
}

function paraData(v: string | Date): Date {
  return v instanceof Date ? v : new Date(v)
}

/** A data é ilegível? Chegou string torta do banco ou do modelo. */
export function dataInvalida(v: string | Date): boolean {
  return isNaN(paraData(v).getTime())
}

/** A competência de um lançamento. */
export function competenciaDe(v: string | Date): Competencia {
  const d = paraData(v)
  return { mes: d.getUTCMonth() + 1, ano: d.getUTCFullYear() }
}

/**
 * Mês ordenável, como número: ano×12 + mês.
 *
 * Comparar `{mes, ano}` campo a campo é onde nasce o bug da virada de ano
 * (dezembro de 2025 "maior" que janeiro de 2026 porque 12 > 1). Um inteiro só
 * não tem esse jeito de errar.
 */
export function ordinalMes(v: string | Date): number {
  const d = paraData(v)
  return d.getUTCFullYear() * 12 + d.getUTCMonth() + 1
}

/** O caminho de volta: do ordinal para mês e ano. */
export function competenciaDoOrdinal(ordinal: number): Competencia {
  const mes = ((ordinal - 1) % 12) + 1
  return { mes, ano: Math.floor((ordinal - mes) / 12) }
}

/** Chave "2026-08", que ordena por `sort()` sem precisar de comparador. */
export function chaveMes(v: string | Date): string {
  const { mes, ano } = competenciaDe(v)
  return `${ano}-${String(mes).padStart(2, "0")}`
}

/** Chave "2026-08-21". Mesma propriedade de ordenação. */
export function chaveDia(v: string | Date): string {
  const d = paraData(v)
  return `${chaveMes(d)}-${String(d.getUTCDate()).padStart(2, "0")}`
}

/** O lançamento cai no mês pedido? */
export function noMes(v: string | Date, mes: number, ano: number): boolean {
  const c = competenciaDe(v)
  return c.mes === mes && c.ano === ano
}

/** O dia do mês, 1–31. */
export function diaDoMes(v: string | Date): number {
  return paraData(v).getUTCDate()
}

/**
 * Quantos dias tem o mês.
 *
 * `Date.UTC(ano, mes, 0)` é o dia 0 do mês SEGUINTE, que é o último do mês
 * pedido — inclusive em fevereiro bissexto, sem tabela nenhuma. Em UTC como o
 * resto: a versão local (`new Date(ano, mes, 0)`) devolve o mesmo número hoje e
 * é uma segunda leitura de calendário esperando para divergir.
 */
export function diasNoMes(mes: number, ano: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

/**
 * O instante que GRAVA um dia de calendário: meio-dia UTC.
 *
 * Aceita "2026-08-21" e também "2026-08-21T09:32:00Z" — de qualquer entrada
 * fica o dia, ancorado ao meio-dia. É o que o caminho do extrato já fazia
 * (`app/api/extrato/route.ts`), com o motivo escrito lá: gravado às 00:00Z, o
 * dia 21 vira dia 20 em qualquer fuso negativo. O caminho do chat fazia quase
 * isso — `T12:00:00` sem o `Z`, que é meio-dia LOCAL, e num servidor a leste de
 * UTC+12 escorrega para o dia anterior de novo.
 *
 * Data ilegível devolve `Invalid Date` em vez de inventar hoje: gravar o dia
 * errado em silêncio é pior que a rota recusar.
 */
export function ancorarDia(v: string | Date): Date {
  const d = paraData(v)
  if (isNaN(d.getTime())) return d
  return new Date(`${chaveDia(d)}T12:00:00.000Z`)
}

/**
 * O primeiro instante do mês, para filtrar no BANCO.
 *
 * O par `[inicioDoMes(m), inicioDoMes(m+1))` é o mês inteiro, aberto no fim.
 * Em UTC porque é assim que o mês é lido depois: uma consulta com borda local
 * traria dezembro para dentro de janeiro (ou o contrário) e o total da tela
 * discordaria do total da soma, sem que nenhuma das duas estivesse "quebrada".
 */
export function inicioDoMes(mes: number, ano: number): Date {
  return new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0, 0))
}

/**
 * O dia de HOJE no calendário de quem está olhando, como "2026-08-21".
 *
 * Roda no navegador, e é o único lugar onde a hora LOCAL é a resposta certa
 * para um dia de lançamento: às 22h de 30 de setembro em São Paulo, o dia da
 * pessoa é 30 de setembro. `new Date().toISOString().slice(0,10)` — que era o
 * que as duas telas de lançamento faziam — responde "1º de outubro", e o gasto
 * ia para o mês seguinte enquanto ela ainda jantava.
 *
 * Do outro lado, `ancorarDia` grava esse mesmo dia às 12:00Z e a leitura em UTC
 * devolve ele de volta. O ciclo fecha.
 */
export function hojeNoCalendario(agora: Date = new Date()): string {
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  const dia = String(agora.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}
