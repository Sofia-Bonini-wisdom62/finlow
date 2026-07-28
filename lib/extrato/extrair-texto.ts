import { PDFParse } from "pdf-parse"
import { ErroExtrato } from "@/types/extrato"

/**
 * Texto do PDF, sempre a partir do Buffer que veio no request.
 * Nada é escrito em disco em nenhum momento — o arquivo bruto do extrato não
 * é persistido, por regra de produto.
 */

export const LIMITE_BYTES = 10 * 1024 * 1024 // 10 MB
/** Abaixo disso o PDF é imagem escaneada: não há texto para extrair. */
const MINIMO_CARACTERES = 200
/** Páginas renderizadas na rota de visão. Extrato de 3 meses raramente passa disso. */
const MAX_PAGINAS_IMAGEM = 12

export type TextoExtraido =
  | { modo: "texto"; texto: string; paginas: number }
  | { modo: "imagem"; imagens: { base64: string; mime: string }[]; paginas: number }

function ehErroDeSenha(e: unknown): boolean {
  const nome = (e as { name?: string })?.name ?? ""
  const msg = (e as { message?: string })?.message ?? ""
  return nome === "PasswordException" || /password|senha|encrypt/i.test(msg)
}

export async function extrairTexto(buffer: Buffer): Promise<TextoExtraido> {
  if (buffer.byteLength > LIMITE_BYTES) {
    throw new ErroExtrato(
      "ARQUIVO_GRANDE",
      "Esse arquivo passa de 10 MB. Tenta exportar de novo pelo app do banco — o PDF do extrato costuma ser bem menor."
    )
  }

  let parser: PDFParse | null = null
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) })

    let resultado
    try {
      resultado = await parser.getText()
    } catch (e) {
      if (ehErroDeSenha(e)) {
        throw new ErroExtrato(
          "PDF_PROTEGIDO",
          "Esse PDF tem senha (geralmente seu CPF ou data de nascimento). Abre ele no seu computador, salva uma cópia sem senha e sobe de novo — ou exporta o extrato em CSV pelo app do banco."
        )
      }
      throw new ErroExtrato(
        "FORMATO_INVALIDO",
        "Não consegui abrir esse arquivo. Confere se é mesmo o PDF do extrato.",
        (e as Error)?.message
      )
    }

    const texto = (resultado.text ?? "").trim()
    if (texto.length >= MINIMO_CARACTERES) {
      return { modo: "texto", texto, paginas: resultado.total }
    }

    // Texto curto demais = PDF escaneado. Renderiza as páginas e segue pela
    // rota de visão, em vez de mandar meia dúzia de caracteres para o modelo.
    const shot = await parser.getScreenshot()
    const paginas = shot.pages.slice(0, MAX_PAGINAS_IMAGEM)
    if (paginas.length === 0) {
      throw new ErroExtrato(
        "PDF_ILEGIVEL",
        "Não consegui ler nada desse PDF. Se ele for uma foto ou digitalização, tenta exportar o extrato direto pelo app do banco."
      )
    }

    return {
      modo: "imagem",
      paginas: shot.total,
      imagens: paginas.map((p) => {
        // dataUrl vem como "data:image/png;base64,XXXX"
        const [cabecalho, dados] = p.dataUrl.split(",")
        const mime = cabecalho.match(/data:([^;]+)/)?.[1] ?? "image/png"
        return { base64: dados ?? "", mime }
      }),
    }
  } finally {
    await parser?.destroy().catch(() => {})
  }
}
