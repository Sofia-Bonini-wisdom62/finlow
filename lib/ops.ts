import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { emailsDeOps } from "@/lib/ops-lista"

/**
 * O guard da operação (superfície da fundadora, /ops).
 *
 * É o terceiro andar de acesso deste app, e os três respondem perguntas
 * diferentes:
 *
 *   lib/painel.ts   "esta pessoa consentiu guardar dinheiro?"   (R8)
 *   lib/escola.ts   "que papel esta pessoa tem NUMA escola?"    (vínculo)
 *   lib/ops.ts      "esta pessoa opera o Finlow?"               (a casa toda)
 *
 * QUEM PODE: uma lista de e-mails em `OPS_EMAILS`, não uma coluna no banco.
 * A escolha é deliberada e tem três razões. Primeira: quem administra uma
 * escola já escreve no banco por rotas legítimas, e um papel guardado em
 * tabela é um papel que um bug de escrita pode conceder. Segunda: retirar
 * acesso vira editar uma variável na Vercel, que vale na request seguinte,
 * em vez de UPDATE em produção. Terceira: não existe migração, e portanto
 * não existe janela em que a coluna já está lá e o guard ainda não.
 *
 * É o mesmo mecanismo de `AVANCADO_BETA_EMAILS` (lib/plano.ts), com uma
 * diferença que importa: lá a lista CONCEDE um extra e a ausência dela é
 * inofensiva; aqui ela é a única porta, então a ausência RECUSA.
 */

/**
 * A leitura da lista mora em lib/ops-lista.ts, que é folha: este arquivo
 * importa `@/lib/auth`, e o next-auth arrasta React cliente atrás de si, o
 * que deixaria a regra mais importante da superfície sem teste possível.
 * Reexportada aqui para as telas e rotas importarem de um lugar só.
 */
export { emailsDeOps } from "@/lib/ops-lista"

export interface Operador {
  userId: string
  email: string
}

/** Recusa em três campos, o mesmo formato de lib/escola.ts e lib/painel.ts. */
function recusa(codigo: string, mensagem: string, status: number) {
  return NextResponse.json({ codigo, erro: mensagem, error: mensagem }, { status })
}

/**
 * A sessão desta request, quando ela é de quem opera o Finlow. `null` para
 * todo o resto do mundo, inclusive para adm de escola.
 *
 * Lida do banco a cada request, como o vínculo escolar: o papel NÃO entra no
 * JWT. Tirar um e-mail da lista tem efeito na navegação seguinte, não no
 * próximo login, e é isso que faz a variável de ambiente ser um botão de
 * verdade.
 */
export async function operadorAtual(): Promise<Operador | null> {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  const userId = session?.user?.id
  if (!email || !userId) return null
  if (!emailsDeOps().includes(email)) return null
  return { userId, email }
}

/**
 * O `exigirPapel` da operação. Uso nas rotas, espelho exato do padrão:
 *
 *   const op = await exigirOps()
 *   if (op instanceof NextResponse) return op
 *
 * A recusa por não estar na lista é 404 e não 403, de propósito: um 403 conta
 * a quem bateu na porta que a porta existe e que falta só o crachá. Para uma
 * superfície que administra todas as escolas, a resposta mais útil é a que
 * não confirma nada.
 */
export async function exigirOps(): Promise<Operador | NextResponse> {
  if (emailsDeOps().length === 0) {
    console.error("[ops] OPS_EMAILS nao definida, recusando")
    return recusa("CONFIG_INCOMPLETA", "Operação indisponível.", 503)
  }
  const op = await operadorAtual()
  if (!op) return recusa("NAO_ENCONTRADO", "Não encontrei essa página.", 404)
  return op
}
