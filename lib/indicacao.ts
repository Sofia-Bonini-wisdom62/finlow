import { randomBytes } from "node:crypto"
import { db } from "@/lib/db"
import { creditar } from "@/lib/pontos"
import { Prisma } from "@prisma/client"

/**
 * Programa de indicação.
 *
 * O fluxo inteiro, para não precisar juntar de cinco arquivos:
 *
 *   1. A pessoa pega o link em Ajustes → /r/{codigo} (código nasce aqui,
 *      sob demanda — conta antiga ganha o dela no primeiro pedido).
 *   2. O amigo abre o link, /r/[codigo] planta um cookie de 30 dias e manda
 *      para o cadastro. O cookie sobrevive a fechar a aba e voltar depois.
 *   3. No cadastro (rota própria OU createUser do Google), o cookie vira uma
 *      linha de Indicacao com status "cadastrado". Ainda não vale ponto.
 *   4. Quando o indicado TERMINA a primeira conversa (onboardingEm), a
 *      indicação "ativa" e os dois lados ganham pontos, uma vez só.
 *
 * A régua do que é fraude fica no banco, não nas rotas: autoindicação é
 * comparação de id aqui dentro, indicação dupla esbarra no @unique de
 * indicadoId, e pagar duas vezes esbarra na chave única dos pontos
 * (refId = Indicacao.id). Rota nenhuma precisa "lembrar" dessas regras.
 */

/** Nome do cookie plantado por /r/[codigo] e lido nos dois cadastros. */
export const COOKIE_INDICACAO = "finlow_ref"

/** Validade do cookie. 30 dias: o amigo não precisa decidir na hora. */
export const DIAS_COOKIE_INDICACAO = 30

/** Formato do código — também é a validação de entrada de /r/[codigo]. */
export const FORMATO_CODIGO = /^[0-9a-z]{8}$/

/**
 * 8 caracteres base36 (~41 bits): curto o bastante para caber numa conversa
 * de WhatsApp, espaço grande o bastante para chute ser inútil. O viés do
 * módulo sobre 36 é irrelevante aqui — código não é segredo, é endereço.
 *
 * Exportado porque o convite de escola (lib/convite-escola.ts) usa o MESMO
 * formato — dois geradores de código de 8 base36 seria a duplicação clássica
 * que diverge em silêncio.
 */
export function gerarCodigo(): string {
  const alfabeto = "0123456789abcdefghijklmnopqrstuvwxyz"
  const bytes = randomBytes(8)
  let codigo = ""
  for (let i = 0; i < 8; i++) codigo += alfabeto[bytes[i]! % 36]
  return codigo
}

/** Devolve o código da pessoa, criando na primeira vez. */
export async function garantirCodigo(userId: string): Promise<string> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { codigoIndicacao: true } })
  if (u?.codigoIndicacao) return u.codigoIndicacao

  // Colisão é rara (41 bits) mas não impossível; o @unique recusa e a gente
  // sorteia de novo em vez de devolver o código de outra pessoa.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo()
    try {
      await db.user.update({ where: { id: userId }, data: { codigoIndicacao: codigo } })
      return codigo
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue
      throw e
    }
  }
  throw new Error("não consegui gerar um código único")
}

/**
 * Liga um usuário recém-criado a quem o convidou. Chamado nos DOIS cadastros
 * (rota de e-mail/senha e evento createUser do Google) com o valor do cookie.
 *
 * Devolve false em silêncio para tudo que não deve virar vínculo: código
 * inexistente, autoindicação, segunda indicação. Cadastro nunca falha por
 * causa de indicação — o convite é acessório, a conta é o produto.
 */
export async function vincularIndicacao(indicadoId: string, codigoBruto: string): Promise<boolean> {
  const codigo = codigoBruto.trim().toLowerCase()
  if (!FORMATO_CODIGO.test(codigo)) return false

  const indicador = await db.user.findUnique({
    where: { codigoIndicacao: codigo },
    select: { id: true },
  })
  if (!indicador || indicador.id === indicadoId) return false

  try {
    await db.indicacao.create({ data: { indicadorId: indicador.id, indicadoId } })
    return true
  } catch (e) {
    // P2002 no @unique de indicadoId: a pessoa já entrou por outra indicação.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false
    throw e
  }
}

/**
 * Ativa a indicação de quem acabou de terminar a primeira conversa, se houver.
 *
 * O updateMany condicionado ao status faz a transição uma vez só mesmo com
 * duas abas terminando o onboarding juntas. Os créditos rodam SEMPRE, fora da
 * condição: se o processo caiu entre transição e crédito, a repetição paga o
 * que faltou — e a chave única dos pontos impede pagar de novo o que já foi.
 */
export async function ativarIndicacaoSeHouver(indicadoId: string): Promise<void> {
  const indicacao = await db.indicacao.findUnique({ where: { indicadoId } })
  if (!indicacao) return

  await db.indicacao.updateMany({
    where: { id: indicacao.id, status: "cadastrado" },
    data: { status: "ativado", ativadoEm: new Date() },
  })

  await creditar(indicacao.indicadorId, "indicacao_ativada", indicacao.id)
  await creditar(indicadoId, "indicado_ativado", indicacao.id)
}

export interface ResumoIndicacoes {
  codigo: string
  /** Entraram pelo link e criaram conta. */
  cadastradas: number
  /** Dessas, quantas já terminaram a primeira conversa (= pagaram pontos). */
  ativadas: number
}

/**
 * O MEU lado do programa: código e contadores. Nunca sai daqui quem são os
 * indicados — nem e-mail, nem nome, nem data individual. O indicador vê
 * quantidades; a identidade de quem aceitou o convite é dado do outro.
 */
export async function resumoIndicacoes(userId: string): Promise<ResumoIndicacoes> {
  const [codigo, cadastradas, ativadas] = await Promise.all([
    garantirCodigo(userId),
    db.indicacao.count({ where: { indicadorId: userId } }),
    db.indicacao.count({ where: { indicadorId: userId, status: "ativado" } }),
  ])
  return { codigo, cadastradas, ativadas }
}
