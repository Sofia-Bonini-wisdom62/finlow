/**
 * O histórico da ofensiva como mapa de calor, no estilo do GitHub.
 *
 * Server-safe (sem estado, sem eventos): a tela de ofensiva o renderiza no
 * servidor. Recebe as datas já resolvidas em "YYYY-MM-DD" — a matemática de
 * fuso mora no domínio (lib/ofensiva.ts), aqui só se desenha.
 *
 * TUDO EM UTC PARA CONTAR OS DIAS
 * As chaves de data vêm do `@db.Date`, que é UTC. Andar para trás a partir de
 * hoje somando/subtraindo 24h em UTC é seguro (o Brasil não tem mais horário
 * de verão), e formatar de volta com `toISOString().slice(0,10)` devolve a
 * mesma chave que o banco guardou. Usar o fuso local aqui reintroduziria o
 * descasamento que o domínio já resolveu.
 */

const DIA_MS = 86_400_000
const SEMANAS = 18 // ~4 meses cabem na largura do celular sem apertar
const ROTULO_LINHA = ["", "Seg", "", "Qua", "", "Sex", ""] // domingo é a linha 0

function chaveDe(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function OfensivaCalendario({
  chaves,
  hoje,
}: {
  /** Dias ativos como "YYYY-MM-DD". */
  chaves: string[]
  /** O dia de hoje (SP) como "YYYY-MM-DD". */
  hoje: string
}) {
  const ativos = new Set(chaves)

  const hojeMs = Date.parse(`${hoje}T00:00:00Z`)
  const diaSemana = new Date(hojeMs).getUTCDay() // 0 = domingo
  // A grade termina no fim da semana atual (sábado) para que a última coluna
  // fique cheia, e começa SEMANAS semanas antes, sempre num domingo.
  const fim = hojeMs + (6 - diaSemana) * DIA_MS
  const inicio = fim - (SEMANAS * 7 - 1) * DIA_MS

  const colunas = Array.from({ length: SEMANAS }, (_, col) =>
    Array.from({ length: 7 }, (_, linha) => {
      const ms = inicio + (col * 7 + linha) * DIA_MS
      const chave = chaveDe(ms)
      return {
        chave,
        ativo: ativos.has(chave),
        futuro: ms > hojeMs,
        ehHoje: chave === hoje,
      }
    })
  )

  return (
    <div className="flex gap-1.5">
      {/* rótulos dos dias da semana */}
      <div className="grid grid-rows-7 gap-1 pt-0.5">
        {ROTULO_LINHA.map((r, i) => (
          <span
            key={i}
            className="flex h-[13px] items-center text-[9px] font-bold leading-none"
            style={{ color: "var(--fin-dim)" }}
          >
            {r}
          </span>
        ))}
      </div>

      {/* semanas em colunas, dias em linhas */}
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {colunas.flatMap((coluna) =>
          coluna.map((celula) => (
            <span
              key={celula.chave}
              title={celula.chave}
              aria-hidden="true"
              className="size-[13px] rounded-[3px]"
              style={{
                background: celula.futuro
                  ? "transparent"
                  : celula.ativo
                    ? "var(--fin-combo)"
                    : "var(--fin-border)",
                boxShadow: celula.ehHoje ? "0 0 0 1.5px var(--fin-accent)" : undefined,
                opacity: celula.futuro ? 0.35 : 1,
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
