import { z } from "zod"

export const CATEGORIAS_EXTRATO = [
  "alimentacao", "delivery", "transporte", "moradia", "assinaturas",
  "compras", "saude", "lazer", "educacao", "transferencia",
  "renda", "taxas_juros", "poupanca", "outros",
] as const

export const TransacaoExtraida = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser yyyy-mm-dd"),
  descricaoOriginal: z.string(),
  /** Sem nome de pessoa física, CPF, CNPJ ou chave Pix — ver o prompt. */
  descricaoLimpa: z.string(),
  /** Negativo = saída. */
  valor: z.number().finite(),
  categoria: z.enum(CATEGORIAS_EXTRATO),
  /** Heurística do modelo: parece cobrança recorrente? */
  recorrente: z.boolean(),
  /**
   * Se esta linha mexe no SALDO DA CONTA.
   *
   * Compra no crédito aparece no extrato mas não debita a conta — ela cai na
   * fatura do cartão. Confirmado no extrato real: em 10/06 o saldo vai de
   * R$534,11 para R$524,11 (−R$10,00 de Pix) mesmo havendo uma compra de
   * R$28,58 "Com cartão" listada no mesmo dia.
   *
   * A transação continua sendo gasto de verdade e entra nas Análises. Isto
   * serve só para a conferência por saldo diário não reprovar leitura correta.
   */
  afetaSaldo: z.boolean().default(true),
})
export type TransacaoExtraida = z.infer<typeof TransacaoExtraida>

/** Saldo de fechamento de um dia, como declarado no documento. */
export const SaldoDiario = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  saldo: z.number().finite(),
})
export type SaldoDiario = z.infer<typeof SaldoDiario>

export const ExtratoParseado = z.object({
  banco: z.string().nullable(),
  periodoInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodoFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  saldoInicial: z.number().finite().nullable(),
  saldoFinal: z.number().finite().nullable(),
  /**
   * Todo "Saldo ao final do dia" que o documento declarar.
   *
   * É o que permite detectar OMISSÃO. Conferir só o saldo final não serve:
   * o PicPay não declara saldo inicial, então a validação caía na versão
   * fraca e 294 linhas sumiram sem ninguém perceber. Com saldo por dia, a
   * soma de cada intervalo tem que fechar sozinha.
   *
   * default([]) e não obrigatório: documento sem saldo diário continua
   * válido, só não ganha a conferência forte.
   */
  saldosDiarios: z.array(SaldoDiario).default([]),
  transacoes: z.array(TransacaoExtraida),
})
export type ExtratoParseado = z.infer<typeof ExtratoParseado>

/** Erros tipados — o front decide a mensagem a partir do código. */
export type CodigoErroExtrato =
  | "PDF_PROTEGIDO"
  | "PDF_ILEGIVEL"
  | "ARQUIVO_GRANDE"
  | "FORMATO_INVALIDO"
  | "VALIDACAO_FALHOU"
  | "IA_NAO_CONFIGURADA"
  | "RESPOSTA_INVALIDA"

export class ErroExtrato extends Error {
  constructor(
    readonly codigo: CodigoErroExtrato,
    readonly mensagemUsuario: string,
    readonly detalhe?: string
  ) {
    super(`${codigo}: ${detalhe ?? mensagemUsuario}`)
    this.name = "ErroExtrato"
  }
}

/**
 * Conteúdo do arquivo JÁ LIDO — o que trafega do navegador para a rota.
 *
 * A leitura acontece no cliente (lib/extrato/ler-no-navegador.ts). O servidor
 * nunca recebe o arquivo bruto: chega texto, ou páginas em imagem quando o PDF
 * é digitalizado.
 */
export type ConteudoExtrato =
  | { modo: "texto"; texto: string; paginas: number }
  | { modo: "imagem"; imagens: { base64: string; mime: string }[]; paginas: number }
