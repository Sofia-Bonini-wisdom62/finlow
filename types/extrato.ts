import { z } from "zod"

export const CATEGORIAS_EXTRATO = [
  "alimentacao", "delivery", "transporte", "moradia", "assinaturas",
  "compras", "saude", "lazer", "educacao", "transferencia",
  "renda", "taxas_juros", "outros",
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
})
export type TransacaoExtraida = z.infer<typeof TransacaoExtraida>

export const ExtratoParseado = z.object({
  banco: z.string().nullable(),
  periodoInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodoFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  saldoInicial: z.number().finite().nullable(),
  saldoFinal: z.number().finite().nullable(),
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
