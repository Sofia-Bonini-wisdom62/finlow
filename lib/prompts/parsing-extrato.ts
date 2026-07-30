/**
 * Prompt do parsing de extrato. Versionado aqui, nunca inline na chamada:
 * mudança de prompt muda o resultado tanto quanto mudança de código, e
 * precisa aparecer no diff.
 */

export const VERSAO_PROMPT_PARSING = "2026-07-30.3"

const CATEGORIAS = [
  "alimentacao", "delivery", "transporte", "moradia", "assinaturas",
  "compras", "saude", "lazer", "educacao", "transferencia",
  "renda", "taxas_juros", "poupanca", "outros",
].join(", ")

export function promptParsingExtrato(opcoes?: { divergencia?: number }): string {
  const retry = opcoes?.divergencia
    ? `
ATENÇÃO — esta é uma segunda tentativa. Na primeira, a soma das transações
divergiu do saldo declarado em R$ ${opcoes.divergencia.toFixed(2)}. Revise com
cuidado: procure linhas que você possa ter pulado, valores com sinal trocado
(saída deve ser negativa), ou linhas de saldo que foram lidas como transação.
Não invente linha para fechar a conta — se a diferença for real, devolva o que
você realmente consegue ler.
`
    : ""

  return `Você extrai transações de extratos bancários e faturas de cartão brasileiros.

Devolva SOMENTE um objeto JSON, sem texto antes ou depois, sem blocos de markdown.

Formato:
{
  "banco": string | null,
  "periodoInicio": "yyyy-mm-dd",
  "periodoFim": "yyyy-mm-dd",
  "saldoInicial": number | null,
  "saldoFinal": number | null,
  "transacoes": [
    {
      "data": "yyyy-mm-dd",
      "descricaoOriginal": string,
      "descricaoLimpa": string,
      "valor": number,
      "categoria": string,
      "recorrente": boolean,
      "afetaSaldo": boolean
    }
  ]
}

COMPLETUDE — REGRA MAIS IMPORTANTE DESTE PROMPT
Extraia TODAS as linhas de movimentação do documento, sem exceção. Isso inclui
movimentações entre contas ou reservas da PRÓPRIA pessoa, que é o erro comum:
"Troco guardado", "Dinheiro guardado", "Dinheiro resgatado", "No cofrinho X",
"Do cofrinho X", "caixinha", "reserva", "aplicação", "resgate", "poupança".

Essas linhas mexem no saldo e por isso são obrigatórias. Não as trate como
detalhe interno, não as agrupe, não as resuma. Se a mesma operação aparece três
vezes seguidas com valores diferentes (uma por reserva), devolva as três.

Omitir uma classe inteira de linha é o pior erro possível aqui: a conferência
aritmética não consegue detectar isso, e a pessoa vê um número errado achando
que conferiu.

REGRAS DE VALOR
- "valor" negativo = dinheiro saindo. Positivo = dinheiro entrando.
- Use ponto decimal. Não use separador de milhar. Ex.: -1234.56
- "saldoInicial" e "saldoFinal" são os saldos declarados no documento. Se o
  documento não trouxer, use null — não calcule nem estime.

REGRAS DE DATA
- Sempre yyyy-mm-dd.
- Data sem ano herda o ano do período do extrato. Numa virada de ano (extrato
  de dezembro a janeiro), atribua o ano correto a cada lado da virada.

DESCRIÇÃO LIMPA — REGRA DE PRIVACIDADE, NÃO NEGOCIÁVEL
"descricaoLimpa" NUNCA pode conter:
- nome de pessoa física
- CPF ou CNPJ
- chave Pix (telefone, e-mail, aleatória)
- número de conta ou agência

Exemplos:
- "PIX ENVIADO JOAO DA SILVA 123.456.789-00" → "Pix enviado"
- "PIX RECEBIDO MARIA S 11987654321"        → "Pix recebido"
- "TED PARA ANA P LTDA ME"                  → "Transferência enviada"
- "IFD*IFOOD SAO PAULO"                     → "iFood"
- "UBER *TRIP"                              → "Uber"

Nome de empresa/estabelecimento conhecido PODE ficar (iFood, Uber, Netflix,
Amazon, o supermercado do bairro). O que sai é a identificação de pessoa.
"descricaoOriginal" mantém o texto como está no extrato — o app usa a limpa,
mas a original serve para a pessoa reconhecer a linha na hora de conferir.

CATEGORIA
Use exatamente uma de: ${CATEGORIAS}
- "transferencia" para Pix/TED entre contas sem destino de consumo claro
- "renda" para salário, pagamento de cliente, rendimento
- "poupanca" para dinheiro guardado ou resgatado de cofrinho, caixinha,
  reserva, aplicação ou poupança — nos DOIS sentidos. Guardar leva valor
  negativo (sai da conta), resgatar leva positivo (volta para a conta).
- "taxas_juros" para tarifa, anuidade, IOF, juros de rotativo
- "outros" só quando nenhuma servir. Prefira errar para "outros" a chutar.

RECORRENTE
true quando a linha tem cara de cobrança que se repete todo mês (assinatura,
mensalidade, aluguel, plano). Na dúvida, false.

AFETA SALDO
true quando o dinheiro sai ou entra na CONTA na hora. false quando a compra foi
no crédito e vai cair na fatura do cartão depois.

Muitos extratos trazem uma coluna de forma de pagamento: "Com saldo" → true,
"Com cartão" / "no crédito" / "cartão de crédito" → false. Sem essa informação,
use true.

Isso importa porque o saldo do dia não muda com compra no crédito. Num extrato
real, o saldo foi de R$534,11 para R$524,11 (um Pix de R$10,00) num dia que
também tinha uma compra de R$28,58 no cartão. Marcar essa compra como true faria
a conferência reprovar uma leitura correta.

Numa FATURA de cartão (não extrato de conta), tudo é crédito: use false em todas.

O QUE NÃO FAZER
- Não invente transação. Linha ilegível: omita. A validação aritmética depois
  detecta a diferença — inventar linha para fechar a conta é pior que omitir.
- Não repita a mesma transação duas vezes.
- Não trate linha de "saldo", "total" ou "subtotal" como transação.
- Não devolva markdown, comentário ou explicação. Só o JSON.${retry}`
}
