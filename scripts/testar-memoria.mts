/**
 * Testa a guarda de conteúdo da memória do assistente.
 *
 * POR QUE ISTO EXISTE
 * O prompt PEDE ao modelo para não guardar dinheiro, CPF, conta e nome de
 * terceiro. Pedido não é garantia: modelo erra, prompt muda, versão nova do
 * modelo interpreta diferente. `memoriasValidas()` é a regra que sobra quando o
 * pedido falha, e uma guarda que não guarda é pior que guarda nenhuma — dá
 * confiança falsa sobre dado sensível.
 *
 *   node --import tsx scripts/testar-memoria.mts
 */
import { memoriasValidas } from "../lib/ia.js"

type Caso = { entrada: unknown; passa: boolean; nota: string }

const casos: Caso[] = [
  // --- deve passar ---
  { nota: "situação durável", passa: true,
    entrada: { tipo: "situacao", conteudo: "É autônoma e a renda varia mês a mês" } },
  { nota: "plano declarado", passa: true,
    entrada: { tipo: "plano", conteudo: "Quer montar uma reserva antes de trocar de carro" } },
  { nota: "preferência de atendimento", passa: true,
    entrada: { tipo: "preferencia", conteudo: "Prefere respostas curtas e diretas" } },

  // --- não pode passar: dinheiro (o app já tem, e aqui envelheceria) ---
  { nota: "valor com R$", passa: false,
    entrada: { tipo: "situacao", conteudo: "Ganha R$ 3.500 por mês" } },
  { nota: "valor sem R$", passa: false,
    entrada: { tipo: "situacao", conteudo: "Gasta 1.234,56 com delivery" } },
  { nota: "meta com valor", passa: false,
    entrada: { tipo: "plano", conteudo: "Quer juntar R$10000 até dezembro" } },

  // --- não pode passar: identificador ---
  { nota: "CPF", passa: false,
    entrada: { tipo: "situacao", conteudo: "O CPF dela é 484.077.218-59" } },
  { nota: "conta e agência", passa: false,
    entrada: { tipo: "situacao", conteudo: "Conta 113805510-7 na agência 0001" } },
  { nota: "telefone", passa: false,
    entrada: { tipo: "situacao", conteudo: "O contato dela é 11 98765 4321" } },

  // --- não pode passar: forma inválida ---
  { nota: "tipo inventado", passa: false,
    entrada: { tipo: "fofoca", conteudo: "Uma frase perfeitamente longa aqui" } },
  { nota: "curta demais", passa: false,
    entrada: { tipo: "situacao", conteudo: "oi" } },
  { nota: "sem conteúdo", passa: false, entrada: { tipo: "situacao" } },
  { nota: "não é objeto", passa: false, entrada: "sou autônoma" },
]

let falhas = 0
console.log("RESULTADO  ESPERADO   CASO")
for (const c of casos) {
  const saiu = memoriasValidas([c.entrada]).length === 1
  const ok = saiu === c.passa
  if (!ok) falhas++
  console.log(
    `${ok ? "  ok    " : "  FALHA "}  ${(c.passa ? "passa" : "bloqueia").padEnd(9)} ${c.nota}`
  )
}

// Teto de 2 por resposta: sem ele a memória vira transcrição da conversa.
const muitas = Array.from({ length: 6 }, (_, i) => ({
  tipo: "situacao",
  conteudo: `Circunstância número ${"x".repeat(i + 10)}`,
}))
const aceitas = memoriasValidas(muitas).length
if (aceitas > 2) { falhas++; console.log(`\n✗ aceitou ${aceitas} memórias numa resposta — o teto é 2`) }

// Entrada malformada não pode explodir nem virar memória.
for (const lixo of [null, undefined, 42, "texto", {}, [null], [{}]]) {
  try {
    if (memoriasValidas(lixo).length !== 0) { falhas++; console.log(`\n✗ ${JSON.stringify(lixo)} virou memória`) }
  } catch (e) {
    falhas++
    console.log(`\n✗ ${JSON.stringify(lixo)} lançou erro: ${(e as Error).message}`)
  }
}

console.log(`\n${falhas === 0 ? "✓ todos os casos passaram" : `✗ ${falhas} caso(s) falharam`}`)
process.exit(falhas === 0 ? 0 : 1)
