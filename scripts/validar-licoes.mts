/**
 * Confere o curso escolar v2 inteiro sem tocar no banco.
 *
 *   node --import tsx scripts/validar-licoes.mts
 *   node --import tsx scripts/validar-licoes.mts --verboso
 *
 * Sai 1 se qualquer lição estourar o contrato — é o que faz este script servir
 * de portão. Roda em ~2 segundos e não precisa de DATABASE_URL: as 5.268
 * conferências, incluindo o recálculo das 689 contas, são todas locais.
 *
 * A conferência de verdade mora em `lib/licao/` — aqui só imprime. O seed
 * (`scripts/semear-curso.mts`) chama exatamente o mesmo carregador antes de
 * gravar, então o que passa aqui é o que entra no banco.
 */
import { carregarCurso } from "../lib/licao/carregar.js"
import { custoLicao } from "../lib/licao/formatos.js"

const verboso = process.argv.includes("--verboso")
const { conceitos, modulos, licoes, erros, avisos } = carregarCurso()

if (verboso) {
  for (const m of modulos) {
    const l = licoes.get(m.slug)
    if (!l) continue
    const custo = custoLicao(l.telas.map((t) => t.formato))
    const itens = l.telas.length + l.reserva.length
    console.log(
      `  ${m.segmento.padEnd(5)} ${String(m.ordem).padStart(3)}. ${m.slug.padEnd(52)} ` +
        `${String(l.telas.length).padStart(2)} telas · ${String(itens).padStart(2)} itens · ${custo}s`
    )
  }
  console.log()
}

for (const a of avisos) console.log(`  ⚠ ${a}`)
for (const e of erros) console.log(`  ✗ ${e}`)

const itens = [...licoes.values()].reduce((s, l) => s + l.telas.length + l.reserva.length, 0)
const reserva = [...licoes.values()].reduce((s, l) => s + l.reserva.length, 0)
const contas = [...licoes.values()].reduce(
  (s, l) => s + [...l.telas, ...l.reserva].filter((t) => t.verificacao).length,
  0
)

const porSegmento = new Map<string, number>()
for (const m of modulos) porSegmento.set(m.segmento, (porSegmento.get(m.segmento) ?? 0) + 1)
const resumoSeg = [...porSegmento].map(([s, n]) => `${s} ${n}`).join(" · ")

console.log(
  `\n${licoes.size} lições · ${conceitos.length} conceitos · ${itens} itens ` +
    `(${reserva} de reserva) · ${contas} contas recalculadas`
)
console.log(`  ${resumoSeg}`)
console.log(
  erros.length
    ? `\n✗ ${erros.length} problema(s) — nada disto entra no banco.`
    : `\n✓ contrato íntegro${avisos.length ? ` · ${avisos.length} aviso(s)` : ""}`
)

process.exit(erros.length ? 1 : 0)
